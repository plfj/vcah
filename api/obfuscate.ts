import type { IncomingMessage, ServerResponse } from 'node:http';
import { RustVmGeneratorService } from '../src/server/services/rust-vm-generator.service';

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
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
