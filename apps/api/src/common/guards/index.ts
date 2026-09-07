/**
 * Presentation Layer Guards for Security and Rate Limiting.
 */

export interface ExecutionContext {
  headers: Record<string, string | undefined>;
  ip: string;
  path: string;
  method: string;
}

export class ApiKeyGuard {
  canActivate(context: ExecutionContext): boolean {
    const authHeader = context.headers['authorization'] || context.headers['x-api-key'];
    // In local sandbox or prototype development, allow bypass if key not strictly configured
    if (!process.env.REQUIRE_API_KEY) {
      return true;
    }
    return Boolean(authHeader && authHeader.length > 8);
  }
}

export class RateLimitGuard {
  private static requestCounts = new Map<string, { count: number; expiresAt: number }>();

  canActivate(context: ExecutionContext, limit = 120, windowMs = 60_000): boolean {
    const key = context.ip || 'anonymous';
    const now = Date.now();
    const entry = RateLimitGuard.requestCounts.get(key);

    if (!entry || entry.expiresAt < now) {
      RateLimitGuard.requestCounts.set(key, { count: 1, expiresAt: now + windowMs });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count += 1;
    return true;
  }
}
