declare module 'node:child_process' {
  export interface SpawnSyncReturns<T> {
    pid: number;
    output: Array<T | null>;
    stdout: T;
    stderr: T;
    status: number | null;
    signal: string | null;
    error?: Error;
  }
  export interface SpawnSyncOptions {
    input?: string | any;
    encoding?: string;
    maxBuffer?: number;
    timeout?: number;
    killSignal?: string | number;
    cwd?: string;
    env?: any;
    shell?: boolean | string;
    windowsHide?: boolean;
  }
  export function spawnSync(
    command: string,
    args?: readonly string[],
    options?: SpawnSyncOptions
  ): SpawnSyncReturns<string>;
}

declare module 'child_process' {
  export * from 'node:child_process';
}
