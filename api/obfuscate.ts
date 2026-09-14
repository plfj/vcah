import { RustVmGeneratorService } from '../src/server/services/rust-vm-generator.service';

type ApiRequest = {
  method?: string;
  on: (event: string, callback: (...args: any[]) => void) => void;
  [key: string]: any;
};

type ApiResponse = {
  statusCode?: number;
  setHeader: (name: string, value: string | number | readonly string[]) => void;
  end: (data?: any) => void;
  [key: string]: any;
};

/**
 * Parses request body with size limits and timeout protection.
 * Fixed CWE-400: Uncontrolled Resource Consumption
 * Fixed CWE-772: Missing Release of Resource after Effective Lifetime
 */
function parseBody(req: ApiRequest): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    let totalSize = 0;
    const MAX_BODY_SIZE = 200 * 1024; // 200 KB limit
    let completed = false;

    const cleanup = () => {
      if (!completed) {
        completed = true;
        req.removeAllListeners('data');
        req.removeAllListeners('end');
        req.removeAllListeners('error');
      }
    };

    const dataHandler = (chunk: any) => {
      if (completed) return;
      totalSize += chunk.length;
      if (totalSize > MAX_BODY_SIZE) {
        cleanup();
        reject(new Error('Request body too large'));
        return;
      }
      body += chunk;
    };

    const endHandler = () => {
      if (completed) return;
      cleanup();
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    };

    const errorHandler = (err: Error) => {
      if (completed) return;
      cleanup();
      reject(err);
    };

    req.on('data', dataHandler);
    req.on('end', endHandler);
    req.on('error', errorHandler);

    // Timeout after 10 seconds - properly abort request
    const timeoutId = setTimeout(() => {
      if (completed) return;
      cleanup();
      reject(new Error('Request timeout'));
    }, 10000);

    // Clear timeout if request completes normally
    const originalResolve = resolve;
    resolve = (value: any) => {
      clearTimeout(timeoutId);
      originalResolve(value);
    };
    const originalReject = reject;
    reject = (reason: any) => {
      clearTimeout(timeoutId);
      originalReject(reason);
    };
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const { sourceCode, config = {} } = await parseBody(req);
    const pythonVersion = config.supportedPythonVersions?.[0] || '3.12';
    const seed = config.opcodeSeed || Math.floor(100000 + Math.random() * 900000);

    const fullConfig = {
      ...config,
      opcodeSeed: seed,
      supportedPythonVersions: [pythonVersion],
    };

    const raw = RustVmGeneratorService.generateSingleObfuscatedFile(sourceCode || '', fullConfig);

    const response = {
      jobId: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
      },
      securityAudit: raw.securityAudit,
      vmSpec: {
        id: `vm_${seed}`,
        architecture: 'Aegis Non-Linear Polyglot ISA',
        magicHeader: {
          standardHex: raw.stats?.magicBytesHex || '7F50564D',
          virtualHex: raw.stats?.magicBytesHex || '7F50564D',
          pythonVersion,
        },
        opcodeCount: (raw.opcodeMappings || []).length,
        hardeningModules: fullConfig,
        rustNativeStubCode: '',
      },
      timestamp: new Date().toISOString(),
    };

    res.statusCode = 200;
    res.end(JSON.stringify(response));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Obfuscation failure' }));
  }
}
