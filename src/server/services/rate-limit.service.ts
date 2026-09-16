import { Request, Response, NextFunction } from 'express';
import { createHash } from './crypto-compat';

/**
 * Rate Limiting Service with sliding window algorithm.
 * Prevents DoS attacks and resource exhaustion.
 */
export class RateLimitService {
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();
  private static readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private static cleanupTimer: NodeJS.Timeout | null = null;

  // Rate limit tiers
  private static readonly LIMITS = {
    obfuscate: { requests: 10, windowMs: 60000 }, // 10 requests per minute
    preset: { requests: 100, windowMs: 60000 }, // 100 requests per minute
    simulate: { requests: 20, windowMs: 60000 }, // 20 requests per minute
  };

  /**
   * Initializes cleanup timer to prevent memory leaks.
   * Fixed CWE-401: Handles serverless environments where setInterval may not fire
   */
  public static initialize(): void {
    if (this.cleanupTimer) return;

    // In serverless environments, intervals don't fire between requests
    // So we also do inline cleanup on every request
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.requestCounts.entries()) {
        if (now > value.resetTime) {
          this.requestCounts.delete(key);
        }
      }
    }, this.CLEANUP_INTERVAL);

    // Unref the timer so it doesn't prevent process exit in serverless
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /**
   * Performs inline cleanup of expired entries.
   * Fixed CWE-401: Called on each request to handle serverless environments
   */
  private static inlineCleanup(): void {
    // Only cleanup if map is getting large (performance optimization)
    if (this.requestCounts.size < 100) return;

    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, value] of this.requestCounts.entries()) {
      if (now > value.resetTime) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.requestCounts.delete(key);
    }
  }

  /**
   * Gets client identifier from request (IP + User-Agent hash).
   */
  private static getClientId(req: any): string {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').slice(0, 16);
  }

  /**
   * Rate limiting middleware factory.
   * Fixed CWE-362: Atomic read-modify-write to prevent race conditions.
   */
  public static middleware(limitType: 'obfuscate' | 'preset' | 'simulate') {
    return (req: any, res: any, next: any) => {
      // Fixed CWE-401: Inline cleanup for serverless environments
      this.inlineCleanup();

      const clientId = this.getClientId(req);
      const limit = this.LIMITS[limitType];
      const key = `${limitType}:${clientId}`;
      const now = Date.now();

      // Atomic read-modify-write operation
      let record = this.requestCounts.get(key);

      // Check if window expired or new client
      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + limit.windowMs,
        };
        this.requestCounts.set(key, record);
        res.setHeader('X-RateLimit-Limit', limit.requests);
        res.setHeader('X-RateLimit-Remaining', limit.requests - 1);
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
        return next();
      }

      // Check limit BEFORE incrementing (atomic check-and-increment)
      if (record.count >= limit.requests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.statusCode = 429;
        res.setHeader('Retry-After', retryAfter);
        res.setHeader('X-RateLimit-Limit', limit.requests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
        res.end(JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: retryAfter,
          limit: limit.requests,
          window: `${limit.windowMs / 1000}s`,
        }));
        return;
      }

      // Increment atomically by reference (object is already in Map)
      record.count++;
      res.setHeader('X-RateLimit-Limit', limit.requests);
      res.setHeader('X-RateLimit-Remaining', limit.requests - record.count);
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      next();
    };
  }

  /**
   * Cleans up resources on shutdown.
   */
  public static shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.requestCounts.clear();
  }
}

// Initialize rate limiting service
RateLimitService.initialize();
