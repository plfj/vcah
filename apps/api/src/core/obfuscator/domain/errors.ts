/**
 * Pure Domain Errors. Zero framework dependencies.
 */

export class InvalidPythonCodeDomainError extends Error {
  constructor(reason: string) {
    super(`Python source code rejected by domain validation: ${reason}`);
    this.name = 'InvalidPythonCodeDomainError';
  }
}

export class UnsupportedPythonVersionDomainError extends Error {
  constructor(version: string) {
    super(`Python version "${version}" is not supported by the Native Rust VM engine.`);
    this.name = 'UnsupportedPythonVersionDomainError';
  }
}
