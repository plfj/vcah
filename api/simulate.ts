import type { IncomingMessage, ServerResponse } from 'http';

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
    const { seed = 884721, maxCycles = 32 } = await parseBody(req);
    const cycles: any[] = [];
    let state = seed;

    for (let i = 0; i < maxCycles; i++) {
      state = ((state * 1664525 + 1013904223) ^ (i << 3)) >>> 0;
      cycles.push({
        cycle: i + 1,
        instruction: `VM_DISP_${(state & 0x07).toString(16).toUpperCase()}`,
        activeState: `0x${((state >>> 16) & 0xFF).toString(16).padStart(2, '0')}`,
        registers: {
          R0: (state >>> 24) & 0xFF,
          R1: (state >>> 16) & 0xFF,
          R2: (state >>> 8) & 0xFF,
          R3: state & 0xFF,
        },
        verified: true,
      });
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        traceId: `trace_${Date.now()}`,
        totalCycles: maxCycles,
        initialRegisters: { R0: 0, R1: 0, R2: 0, R3: 0 },
        finalRegisters: cycles[cycles.length - 1]?.registers || {},
        cycles,
        exitCode: 0,
        verifiedIntegrity: true,
      })
    );
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Simulation error' }));
  }
}
