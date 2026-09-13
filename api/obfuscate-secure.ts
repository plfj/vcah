import { RustVmGeneratorService } from '../src/server/services/rust-vm-generator.service';
import { AtomicGradeRustVmGeneratorService } from '../src/server/services/atomic-grade-vm-generator.service';
import { SecureKeyDerivationService } from '../src/server/services/secure-key-derivation.service';
import { RateLimitService } from '../src/server/services/rate-limit.service';
import { ValidationService } from '../src/server/services/validation.service';
import { SecureLoggerService } from '../src/server/services/secure-logger.service';

type ApiRequest = {
  method?: string;
  on: (event: string, callback: (...args: any[]) => void) => void;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  [key: string]: any;
};

type ApiResponse = {
  statusCode?: number;
  setHeader: (name: string, value: string | number | readonly string[]) => void;
  end: (data?: any) => void;
  [key: string]: any;
};

function parseBody(req: ApiRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    let totalSize = 0;
    const MAX_BODY_SIZE = 200 * 1024; // 200 KB limit

    req.on('data', (chunk: any) => {
      totalSize += chunk.length;
      if (totalSize > MAX_BODY_SIZE) {
        reject(new Error('Request body too large'));
        return;
      }
      body += chunk;
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });

    req.on('error', reject);

    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Request timeout')), 10000);
  });
}

/**
 * Generates a client ID hash for rate limiting and logging.
 */
function getClientId(req: ApiRequest): string {
  const ip = req.headers?.['x-forwarded-for'] ||
             req.headers?.['x-real-ip'] ||
             req.socket?.remoteAddress ||
             'unknown';
  const userAgent = req.headers?.['user-agent'] || '';
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').slice(0, 16);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const startTime = Date.now();

  // Security headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Method check
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const clientId = getClientId(req);

  // Rate limiting (middleware simulation)
  const rateLimitResult = await new Promise<boolean>((resolve) => {
    const middleware = RateLimitService.middleware('obfuscate');
    middleware(req, res, () => resolve(true));
    // If rate limit exceeded, middleware calls res.end() and we won't reach resolve
    setTimeout(() => resolve(false), 100);
  });

  if (!rateLimitResult) {
    SecureLoggerService.logSecurityEvent('rate_limit', clientId, {
      endpoint: '/api/obfuscate',
      method: req.method,
    });
    return; // Response already sent by rate limiter
  }

  try {
    // Parse request body with size limit
    const body = await parseBody(req);
    let { sourceCode, config = {}, useAtomicGrade = true } = body;

    // Input validation
    if (!sourceCode || typeof sourceCode !== 'string') {
      SecureLoggerService.logSecurityEvent('validation_failure', clientId, {
        reason: 'Missing or invalid sourceCode',
      });
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid request: sourceCode is required' }));
      return;
    }

    // Sanitize inputs
    sourceCode = ValidationService.sanitizeString(sourceCode);

    if (sourceCode.length > 100000) {
      SecureLoggerService.logSecurityEvent('validation_failure', clientId, {
        reason: 'Source code too large',
        size: sourceCode.length,
      });
      res.statusCode = 400;
      res.end(JSON.stringify({
        error: 'Source code too large',
        maxSize: 100000,
        actualSize: sourceCode.length,
      }));
      return;
    }

    // Sanitize and validate config
    config = ValidationService.sanitizeConfig(config);

    // Use cryptographically secure seed
    const pythonVersion = config.supportedPythonVersions?.[0] || '3.12';
    const seed = config.opcodeSeed || SecureKeyDerivationService.generateSecureSeed();

    const fullConfig = {
      magicNumber: config.magicNumber || '7F50564D',
      opcodeSeed: seed,
      supportedPythonVersions: [pythonVersion],
      opcodeScrambling: config.opcodeScrambling ?? true,
      opcodeRemappingMode: config.opcodeRemappingMode || 'polymorphic_cascade',
      vmInstructionSet: config.vmInstructionSet || 'polymorphic_hybrid',
      customIsaEnabled: config.customIsaEnabled ?? true,
      tamperVerification: config.tamperVerification ?? true,
      antiDebugging: config.antiDebugging ?? true,
      heavyControlFlow: config.heavyControlFlow ?? true,
      opaquePredicates: config.opaquePredicates ?? true,
      cffDegree: config.cffDegree || 'extreme_opaque',
      directBytecodeLiteral: config.directBytecodeLiteral ?? true,
      targetArchitectures: config.targetArchitectures || ['x86_64', 'aarch64', 'armv7', 'riscv64'],
      targetOperatingSystems: config.targetOperatingSystems || ['linux', 'windows', 'darwin', 'freebsd'],
      rustVmStrategy: config.rustVmStrategy || 'native_embedded_stub',
      entropyLevel: config.entropyLevel || 'high',
      junkByteRatio: config.junkByteRatio ?? 0,
      payloadMultiplier: config.payloadMultiplier ?? 1,
      targetOutputSizeMb: Math.min(config.targetOutputSizeMb || 0, 7), // Enforce 7 MB limit
      stringEncryptionKey: config.stringEncryptionKey || 'PyShield_Master_Key_Atomic_2026',
      variableNameObfuscation: config.variableNameObfuscation ?? true,
      deadCodeInjection: config.deadCodeInjection ?? false,
      nativeRustVirtualization: config.nativeRustVirtualization ?? true,
      chunkedRamDecryption128B: config.chunkedRamDecryption128B ?? true,
      masterKeystreamEncryption: config.masterKeystreamEncryption ?? true,
      polymorphicInstructionSub: config.polymorphicInstructionSub ?? true,
      machineLevelCFF: config.machineLevelCFF ?? true,
      opaquePredicatesJunk: config.opaquePredicatesJunk ?? true,
      peStrippingSymbolErasure: config.peStrippingSymbolErasure ?? true,
      activeKernelAntiDebug: config.activeKernelAntiDebug ?? true,
      silentMemoryCorruption: config.silentMemoryCorruption ?? true,
      callSiteRamScrubber: config.callSiteRamScrubber ?? true,
      hardwareExpireLock: config.hardwareExpireLock ?? true,
      multiOsInMemoryContainer: config.multiOsInMemoryContainer ?? true,
      preVmLambdaAst: config.preVmLambdaAst ?? true,
      fastBitwiseMangling: config.fastBitwiseMangling ?? true,
      antiAiPromptBombs: config.antiAiPromptBombs ?? true,
    };

    // Generate obfuscated code with atomic-grade security
    let raw;
    if (useAtomicGrade) {
      raw = await AtomicGradeRustVmGeneratorService.generateAtomicGradeObfuscatedFile(
        sourceCode,
        fullConfig as any
      );
    } else {
      // Fallback to legacy generator (still with improvements)
      raw = RustVmGeneratorService.generateSingleObfuscatedFile(sourceCode, fullConfig as any);
    }

    const response = {
      jobId: `job_${Date.now()}_${seed.toString(36)}`,
      obfuscatedCode: raw.obfuscatedCode,
      pythonVersion,
      seed,
      stats: {
        originalSize: raw.stats?.originalSizeBytes || 0,
        obfuscatedSize: raw.stats?.obfuscatedSizeBytes || 0,
        entropy: raw.stats?.shannonEntropy || 7.9,
        junkByteRatio: raw.stats?.junkBytesInjected || 0,
        payloadMultiplier: raw.stats?.sizeExpansionRatio || 1,
        obfuscationTimeMs: raw.stats?.generationTimeMs || 10,
        memoryOverheadKb: Math.round((raw.stats?.chunkCount || 1) * 0.125),
        cryptographicMethod: raw.stats?.cryptographicMethod || 'AES-256-GCM',
        keyDerivationFunction: raw.stats?.keyDerivationFunction || 'PBKDF2-SHA256-600K',
      },
      securityAudit: raw.securityAudit,
      vmSpec: {
        id: `vm_${seed}`,
        architecture: 'Atomic Grade Aegis Non-Linear ISA with AES-256-GCM',
        magicHeader: {
          standardHex: raw.stats?.magicBytesHex || '7F50564D',
          virtualHex: raw.stats?.magicBytesHex || '7F50564D',
          pythonVersion,
        },
        opcodeCount: (raw.opcodeMappings || []).length,
        hardeningModules: fullConfig,
        securityLevel: useAtomicGrade ? 'ATOMIC_GRADE' : 'ENHANCED',
      },
      timestamp: new Date().toISOString(),
    };

    const executionTimeMs = Date.now() - startTime;

    // Log successful obfuscation
    SecureLoggerService.logObfuscationRequest(
      clientId,
      sourceCode.length,
      {
        pythonVersion,
        seed,
        atomicGrade: useAtomicGrade,
        targetOutputSizeMb: fullConfig.targetOutputSizeMb,
      },
      true,
      executionTimeMs
    );

    SecureLoggerService.logPerformance('obfuscation', executionTimeMs, {
      sourceCodeLength: sourceCode.length,
      obfuscatedLength: response.stats.obfuscatedSize,
      atomicGrade: useAtomicGrade,
    });

    res.statusCode = 200;
    res.end(JSON.stringify(response));
  } catch (err: any) {
    const executionTimeMs = Date.now() - startTime;

    // Log error
    SecureLoggerService.logError(err, {
      endpoint: '/api/obfuscate',
      clientId,
      executionTimeMs,
    });

    // Send safe error response (no stack trace to client)
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: 'Obfuscation failed',
      message: 'An internal error occurred. Please try again later.',
      jobId: `error_${Date.now()}`,
    }));
  }
}
