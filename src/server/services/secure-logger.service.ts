import { createLogger, format, transports, Logger } from 'winston';
import { createHash } from 'node:crypto';

/**
 * Secure Logging Service with PII redaction and structured logging.
 */
export class SecureLoggerService {
  private static logger: Logger | null = null;

  /**
   * Initializes Winston logger with security-focused configuration.
   */
  public static initialize(): Logger {
    if (this.logger) return this.logger;

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: { service: 'pyvm-obfuscator' },
      transports: [
        // Console output
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ timestamp, level, message, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
            })
          ),
        }),
        // File output for errors
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10 * 1024 * 1024, // 10 MB
          maxFiles: 5,
        }),
        // File output for all logs
        new transports.File({
          filename: 'logs/combined.log',
          maxsize: 10 * 1024 * 1024,
          maxFiles: 10,
        }),
      ],
    });

    return this.logger;
  }

  /**
   * Redacts PII and sensitive data from log messages.
   */
  private static redactSensitiveData(data: any): any {
    if (typeof data === 'string') {
      // Redact potential API keys, tokens, passwords
      return data
        .replace(/apikey[=:]\s*['"]?[\w-]+['"]?/gi, 'apikey=***REDACTED***')
        .replace(/token[=:]\s*['"]?[\w-]+['"]?/gi, 'token=***REDACTED***')
        .replace(/password[=:]\s*['"]?[^'"}\s]+['"]?/gi, 'password=***REDACTED***')
        .replace(/secret[=:]\s*['"]?[\w-]+['"]?/gi, 'secret=***REDACTED***');
    }

    if (typeof data === 'object' && data !== null) {
      const redacted = { ...data };
      const sensitiveKeys = ['password', 'token', 'apikey', 'secret', 'key', 'authorization'];

      for (const key of Object.keys(redacted)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          redacted[key] = '***REDACTED***';
        } else if (typeof redacted[key] === 'object') {
          redacted[key] = this.redactSensitiveData(redacted[key]);
        }
      }

      return redacted;
    }

    return data;
  }

  /**
   * Creates a hash of source code for audit logging (non-reversible).
   */
  private static hashSourceCode(sourceCode: string): string {
    return createHash('sha256').update(sourceCode).digest('hex').slice(0, 16);
  }

  /**
   * Logs obfuscation request with security audit trail.
   */
  public static logObfuscationRequest(
    clientId: string,
    sourceCodeLength: number,
    config: any,
    success: boolean,
    executionTimeMs: number
  ): void {
    const logger = this.initialize();

    logger.info('Obfuscation request', {
      clientId,
      sourceCodeLength,
      config: this.redactSensitiveData(config),
      success,
      executionTimeMs,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Logs security events (rate limit violations, validation failures, etc.).
   */
  public static logSecurityEvent(
    eventType: 'rate_limit' | 'validation_failure' | 'sandbox_violation' | 'suspicious_pattern',
    clientId: string,
    details: any
  ): void {
    const logger = this.initialize();

    logger.warn('Security event', {
      eventType,
      clientId,
      details: this.redactSensitiveData(details),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Logs errors with full context but redacted sensitive data.
   */
  public static logError(error: Error, context: any = {}): void {
    const logger = this.initialize();

    logger.error('Error occurred', {
      message: error.message,
      stack: error.stack,
      context: this.redactSensitiveData(context),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Logs performance metrics.
   */
  public static logPerformance(operation: string, durationMs: number, metadata: any = {}): void {
    const logger = this.initialize();

    logger.info('Performance metric', {
      operation,
      durationMs,
      metadata: this.redactSensitiveData(metadata),
      timestamp: new Date().toISOString(),
    });
  }
}
