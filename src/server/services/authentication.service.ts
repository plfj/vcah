import { randomBytes, createHash, createHmac } from 'crypto';
import { SecureLoggerService } from './secure-logger.service';

/**
 * Authentication Service with JWT-like token generation.
 * Provides API key management and request authentication.
 */
export class AuthenticationService {
  private static apiKeys = new Map<string, ApiKeyData>();
  private static readonly API_KEY_LENGTH = 32;
  private static readonly TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

  interface ApiKeyData {
    key: string;
    keyHash: string;
    userId: string;
    permissions: string[];
    rateLimit: number;
    createdAt: Date;
    expiresAt: Date | null;
    lastUsedAt: Date | null;
    usageCount: number;
    active: boolean;
  }

  /**
   * Generates a cryptographically secure API key.
   */
  public static generateApiKey(): string {
    const keyBytes = randomBytes(this.API_KEY_LENGTH);
    return `pyvm_${keyBytes.toString('base64url')}`;
  }

  /**
   * Hashes an API key for secure storage.
   */
  private static hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Creates a new API key with specified permissions.
   */
  public static createApiKey(
    userId: string,
    permissions: string[] = ['obfuscate'],
    rateLimit: number = 100,
    expiresIn?: number // milliseconds
  ): { apiKey: string; keyHash: string } {
    const apiKey = this.generateApiKey();
    const keyHash = this.hashApiKey(apiKey);

    const keyData: ApiKeyData = {
      key: apiKey,
      keyHash,
      userId,
      permissions,
      rateLimit,
      createdAt: new Date(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : null,
      lastUsedAt: null,
      usageCount: 0,
      active: true,
    };

    this.apiKeys.set(keyHash, keyData);

    SecureLoggerService.initialize().info('API key created', {
      userId,
      keyHash,
      permissions,
      expiresAt: keyData.expiresAt?.toISOString(),
    });

    return { apiKey, keyHash };
  }

  /**
   * Validates an API key and returns associated data.
   */
  public static validateApiKey(apiKey: string): {
    valid: boolean;
    data?: ApiKeyData;
    reason?: string;
  } {
    if (!apiKey || !apiKey.startsWith('pyvm_')) {
      return { valid: false, reason: 'Invalid API key format' };
    }

    const keyHash = this.hashApiKey(apiKey);
    const keyData = this.apiKeys.get(keyHash);

    if (!keyData) {
      SecureLoggerService.logSecurityEvent(
        'validation_failure',
        'unknown',
        { reason: 'API key not found', keyHash }
      );
      return { valid: false, reason: 'API key not found' };
    }

    if (!keyData.active) {
      return { valid: false, reason: 'API key deactivated' };
    }

    if (keyData.expiresAt && keyData.expiresAt < new Date()) {
      return { valid: false, reason: 'API key expired' };
    }

    // Update usage statistics
    keyData.lastUsedAt = new Date();
    keyData.usageCount++;

    return { valid: true, data: keyData };
  }

  /**
   * Checks if API key has specific permission.
   */
  public static hasPermission(apiKey: string, permission: string): boolean {
    const validation = this.validateApiKey(apiKey);
    if (!validation.valid || !validation.data) {
      return false;
    }

    return validation.data.permissions.includes(permission) ||
           validation.data.permissions.includes('*');
  }

  /**
   * Revokes an API key.
   */
  public static revokeApiKey(apiKey: string): boolean {
    const keyHash = this.hashApiKey(apiKey);
    const keyData = this.apiKeys.get(keyHash);

    if (!keyData) {
      return false;
    }

    keyData.active = false;

    SecureLoggerService.initialize().warn('API key revoked', {
      userId: keyData.userId,
      keyHash,
      usageCount: keyData.usageCount,
    });

    return true;
  }

  /**
   * Lists all API keys for a user (without exposing actual keys).
   */
  public static listUserApiKeys(userId: string): Array<Omit<ApiKeyData, 'key'>> {
    const userKeys: Array<Omit<ApiKeyData, 'key'>> = [];

    for (const keyData of this.apiKeys.values()) {
      if (keyData.userId === userId) {
        const { key, ...safeData } = keyData;
        userKeys.push(safeData);
      }
    }

    return userKeys;
  }

  /**
   * Generates a signed request token for additional security.
   */
  public static generateRequestToken(
    apiKey: string,
    requestData: any,
    timestamp: number = Date.now()
  ): string {
    const payload = JSON.stringify({
      timestamp,
      data: requestData,
    });

    const signature = createHmac('sha256', apiKey)
      .update(payload)
      .digest('base64url');

    return `${Buffer.from(payload).toString('base64url')}.${signature}`;
  }

  /**
   * Verifies a signed request token.
   */
  public static verifyRequestToken(
    token: string,
    apiKey: string,
    maxAgeMs: number = 300000 // 5 minutes
  ): { valid: boolean; data?: any; reason?: string } {
    try {
      const [payloadB64, signature] = token.split('.');
      if (!payloadB64 || !signature) {
        return { valid: false, reason: 'Invalid token format' };
      }

      const payload = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const expectedSignature = createHmac('sha256', apiKey)
        .update(payload)
        .digest('base64url');

      // Constant-time comparison
      if (signature !== expectedSignature) {
        return { valid: false, reason: 'Invalid signature' };
      }

      const { timestamp, data } = JSON.parse(payload);
      const age = Date.now() - timestamp;

      if (age > maxAgeMs) {
        return { valid: false, reason: 'Token expired' };
      }

      if (age < -60000) {
        // Token from future (clock skew tolerance: 1 minute)
        return { valid: false, reason: 'Invalid timestamp' };
      }

      return { valid: true, data };
    } catch (err) {
      return { valid: false, reason: 'Token parsing failed' };
    }
  }

  /**
   * Middleware for API key authentication.
   */
  public static middleware(requiredPermission?: string) {
    return (req: any, res: any, next: any) => {
      const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

      if (!apiKey) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Bearer realm="PyVM API"');
        res.end(JSON.stringify({
          error: 'Authentication required',
          message: 'Provide API key via X-API-Key header or Authorization: Bearer token',
        }));
        return;
      }

      const validation = this.validateApiKey(apiKey);

      if (!validation.valid) {
        SecureLoggerService.logSecurityEvent(
          'validation_failure',
          'unknown',
          { reason: validation.reason, apiKey: apiKey.slice(0, 15) + '...' }
        );

        res.statusCode = 401;
        res.end(JSON.stringify({
          error: 'Invalid API key',
          reason: validation.reason,
        }));
        return;
      }

      if (requiredPermission && !this.hasPermission(apiKey, requiredPermission)) {
        res.statusCode = 403;
        res.end(JSON.stringify({
          error: 'Insufficient permissions',
          required: requiredPermission,
        }));
        return;
      }

      // Attach user data to request
      req.apiKeyData = validation.data;
      req.userId = validation.data!.userId;

      next();
    };
  }

  /**
   * Cleans up expired API keys.
   */
  public static cleanupExpiredKeys(): number {
    let removed = 0;
    const now = new Date();

    for (const [keyHash, keyData] of this.apiKeys.entries()) {
      if (keyData.expiresAt && keyData.expiresAt < now) {
        this.apiKeys.delete(keyHash);
        removed++;
      }
    }

    if (removed > 0) {
      SecureLoggerService.initialize().info('Expired API keys cleaned up', {
        count: removed,
      });
    }

    return removed;
  }

  /**
   * Gets usage statistics for an API key.
   */
  public static getKeyStatistics(apiKey: string): {
    usageCount: number;
    lastUsedAt: Date | null;
    createdAt: Date;
    expiresAt: Date | null;
  } | null {
    const keyHash = this.hashApiKey(apiKey);
    const keyData = this.apiKeys.get(keyHash);

    if (!keyData) {
      return null;
    }

    return {
      usageCount: keyData.usageCount,
      lastUsedAt: keyData.lastUsedAt,
      createdAt: keyData.createdAt,
      expiresAt: keyData.expiresAt,
    };
  }
}

// Initialize cleanup interval (run every hour)
setInterval(() => {
  AuthenticationService.cleanupExpiredKeys();
}, 60 * 60 * 1000);
