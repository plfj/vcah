/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Safe Node.js crypto and Buffer resolution compatible with all bundlers,
 * TypeScript configurations, and serverless deployment environments (e.g. Vercel).
 * Does not rely on ambient @types/node module declarations.
 */

declare const require: any;

const resolvedCrypto: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return typeof require === 'function' ? require('crypto') : (globalThis as any).crypto;
  } catch {
    return (globalThis as any).crypto || {};
  }
})();

export const safeCrypto = resolvedCrypto;

export const randomBytes = (size: number): any => {
  if (typeof resolvedCrypto.randomBytes === 'function') {
    return resolvedCrypto.randomBytes(size);
  }
  const buf = new Uint8Array(size);
  if ((globalThis as any).crypto?.getRandomValues) {
    (globalThis as any).crypto.getRandomValues(buf);
  }
  return buf;
};

export const createHmac = (algorithm: string, key: any): any => {
  return resolvedCrypto.createHmac(algorithm, key);
};

export const pbkdf2Sync = (
  password: any,
  salt: any,
  iterations: number,
  keylen: number,
  digest: string
): any => {
  return resolvedCrypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
};

export const createCipheriv = (algorithm: string, key: any, iv: any): any => {
  return resolvedCrypto.createCipheriv(algorithm, key, iv);
};

export const createDecipheriv = (algorithm: string, key: any, iv: any): any => {
  return resolvedCrypto.createDecipheriv(algorithm, key, iv);
};

export const randomFillSync = (buffer: any): any => {
  return resolvedCrypto.randomFillSync(buffer);
};

export const createHash = (algorithm: string): any => {
  return resolvedCrypto.createHash(algorithm);
};

export const Buffer: any = (() => {
  if (typeof (globalThis as any).Buffer !== 'undefined') {
    return (globalThis as any).Buffer;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return typeof require === 'function' ? require('buffer').Buffer : null;
  } catch {
    return null;
  }
})();

export type Buffer = any;
export const SafeBuffer: any = Buffer;
export type SafeBuffer = any;
