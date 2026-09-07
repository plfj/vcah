import { BaseException } from '../exceptions';

export interface ExceptionFilterResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export class GlobalExceptionFilter {
  catch(exception: unknown): ExceptionFilterResponse {
    if (exception instanceof BaseException) {
      return {
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.name,
        timestamp: exception.timestamp,
        details: exception.details,
      };
    }

    const err = exception as Error;
    return {
      statusCode: 500,
      message: err?.message || 'Internal Server Error',
      error: 'InternalServerError',
      timestamp: new Date().toISOString(),
    };
  }
}
