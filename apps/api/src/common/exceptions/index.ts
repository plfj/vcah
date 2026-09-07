/**
 * Hexagonal Clean Architecture Domain & Infrastructure Exceptions.
 */

export abstract class BaseException extends Error {
  public abstract readonly statusCode: number;
  public readonly timestamp: string;

  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class DomainException extends BaseException {
  public readonly statusCode = 422;
}

export class ValidationException extends BaseException {
  public readonly statusCode = 400;
}

export class VirtualizationException extends BaseException {
  public readonly statusCode = 500;
}

export class InfrastructureException extends BaseException {
  public readonly statusCode = 502;
}

export class ResourceNotFoundException extends BaseException {
  public readonly statusCode = 404;
}
