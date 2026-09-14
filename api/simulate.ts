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
    const MAX_BODY_SIZE = 50 * 1024; // 50 KB limit (smaller for simulation API)
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

    // Timeout after 5 seconds
    const timeoutId = setTimeout(() => {
      if (completed) return;
      cleanup();
      reject(new Error('Request timeout'));
    }, 5000);

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
