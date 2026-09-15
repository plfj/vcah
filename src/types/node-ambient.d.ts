// Ambient declarations for Node.js built-in modules to ensure compatibility
// across all deployment environments (e.g. Vercel serverless builds without @types/node).

declare module 'node:crypto' {
  export const randomBytes: (size: number) => any;
  export const createHmac: (algorithm: string, key: any) => any;
  export const pbkdf2Sync: (password: any, salt: any, iterations: number, keylen: number, digest: string) => any;
  export const createCipheriv: (algorithm: string, key: any, iv: any) => any;
  export const createDecipheriv: (algorithm: string, key: any, iv: any) => any;
  export const randomFillSync: (buffer: any) => any;
  export const createHash: (algorithm: string) => any;
  const _default: any;
  export default _default;
}

declare module 'crypto' {
  export const randomBytes: (size: number) => any;
  export const createHmac: (algorithm: string, key: any) => any;
  export const pbkdf2Sync: (password: any, salt: any, iterations: number, keylen: number, digest: string) => any;
  export const createCipheriv: (algorithm: string, key: any, iv: any) => any;
  export const createDecipheriv: (algorithm: string, key: any, iv: any) => any;
  export const randomFillSync: (buffer: any) => any;
  export const createHash: (algorithm: string) => any;
  const _default: any;
  export default _default;
}

declare module 'node:buffer' {
  export const Buffer: any;
}

declare module 'buffer' {
  export const Buffer: any;
}
