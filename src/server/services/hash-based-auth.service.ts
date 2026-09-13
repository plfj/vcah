import { createHash, randomBytes } from 'crypto';
import { SecureLoggerService } from './secure-logger.service';

export interface HashApiKeyData {
  keyHash: string;
  userId: string;
  permissions: string[];
  rateLimit: number;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  usageCount: number;
  active: boolean;
  secretHash: string;
}

// Keep ApiKeyData alias for internal compatibility
export type ApiKeyData = HashApiKeyData;

/**
 * HASH-BASED AUTHENTICATION SERVICE with Environment Variable Secret
 *
 * Uses secrets.PYVM_SEC_KEY environment variable for secret validation.
 * Falls back to SHA-512("ATOMIC_PYVM") if not set.
 */
export class HashBasedAuthService {
  private static apiKeyStore = new Map<string, ApiKeyData>();

  /**
   * Gets the secret key from environment variable or default.
   */
  private static getSecretKey(): string {
    // Check environment variable first
    const envSecret = process.env.PYVM_SEC_KEY;
    if (envSecret && envSecret.length > 0) {
      return envSecret;
    }

    // Fall back to default
    return 'ATOMIC_PYVM';
  }

  /**
   * Computes SECRET_HASH from environment variable or default.
   */
  private static computeSecretHash(): string {
    const secretKey = this.getSecretKey();
    return createHash('sha512').update(secretKey).digest('hex');
  }

  /**
   * Gets the SECRET_HASH (computed dynamically from env).
   */
  public static getSecretHash(): string {
    return this.computeSecretHash();
  }

  /**
   * Generates a cryptographically secure API key with embedded hash.
   * Format: pyvm_<random_bytes>_<hash_fragment>
   */
  public static generateApiKey(): string {
    const randomPart = randomBytes(32).toString('hex');
    const secretHash = this.getSecretHash();
    const hashFragment = secretHash.slice(0, 16);
    return `pyvm_${randomPart}_${hashFragment}`;
  }

  /**
   * Computes SHA-512 hash of input.
   */
  public static computeSHA512(data: string): string {
    return createHash('sha512').update(data).digest('hex');
  }

  /**
   * Validates API key by checking hash fragment matches SECRET_HASH.
   */
  public static validateSecretHash(apiKey: string): boolean {
    const parts = apiKey.split('_');
    if (parts.length !== 3 || parts[0] !== 'pyvm') {
      return false;
    }

    const hashFragment = parts[2];
    const secretHash = this.getSecretHash();
    const expectedFragment = secretHash.slice(0, 16);

    // Constant-time comparison
    return this.constantTimeCompare(hashFragment, expectedFragment);
  }

  /**
   * Creates a new API key with SHA-512 validation.
   */
  public static createApiKey(
    userId: string,
    permissions: string[] = ['obfuscate'],
    rateLimit: number = 100,
    expiresIn?: number
  ): { apiKey: string; keyHash: string; secretKey: string } {
    const apiKey = this.generateApiKey();
    const keyHash = this.computeSHA512(apiKey);
    const secretHash = this.getSecretHash();
    const secretKey = this.getSecretKey();

    const keyData: ApiKeyData = {
      keyHash,
      userId,
      permissions,
      rateLimit,
      createdAt: new Date(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : null,
      lastUsedAt: null,
      usageCount: 0,
      active: true,
      secretHash,
    };

    this.apiKeyStore.set(keyHash, keyData);

    SecureLoggerService.initialize().info('Hash-based API key created', {
      userId,
      keyHash: keyHash.slice(0, 16) + '...',
      permissions,
      secretKeyUsed: secretKey !== 'ATOMIC_PYVM' ? 'ENV_VAR' : 'DEFAULT',
    });

    return { apiKey, keyHash, secretKey };
  }

  /**
   * Validates API key using hash comparison.
   */
  public static validateApiKey(apiKey: string): {
    valid: boolean;
    data?: ApiKeyData;
    reason?: string;
  } {
    // First validate secret hash fragment
    if (!this.validateSecretHash(apiKey)) {
      SecureLoggerService.logSecurityEvent(
        'validation_failure',
        'unknown',
        { reason: 'Invalid secret hash in API key' }
      );
      return { valid: false, reason: 'Invalid API key format' };
    }

    // Compute hash and lookup
    const keyHash = this.computeSHA512(apiKey);
    const keyData = this.apiKeyStore.get(keyHash);

    if (!keyData) {
      SecureLoggerService.logSecurityEvent(
        'validation_failure',
        'unknown',
        { reason: 'API key not found', keyHash: keyHash.slice(0, 16) + '...' }
      );
      return { valid: false, reason: 'API key not found' };
    }

    if (!keyData.active) {
      return { valid: false, reason: 'API key deactivated' };
    }

    if (keyData.expiresAt && keyData.expiresAt < new Date()) {
      return { valid: false, reason: 'API key expired' };
    }

    // Verify secret hash matches current environment
    const currentSecretHash = this.getSecretHash();
    if (keyData.secretHash !== currentSecretHash) {
      SecureLoggerService.logSecurityEvent(
        'validation_failure',
        'unknown',
        { reason: 'Secret hash mismatch - PYVM_SEC_KEY may have changed' }
      );
      return { valid: false, reason: 'Secret hash mismatch' };
    }

    // Update usage
    keyData.lastUsedAt = new Date();
    keyData.usageCount++;

    return { valid: true, data: keyData };
  }

  /**
   * Validates a hash matches the current secret.
   */
  public static validateSecret(hash: string): boolean {
    const currentSecretHash = this.getSecretHash();
    return this.constantTimeCompare(hash, currentSecretHash);
  }

  /**
   * Constant-time string comparison.
   */
  private static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Checks permission with hash validation.
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
   * Middleware for hash-based authentication.
   */
  public static middleware(requiredPermission?: string) {
    return (req: any, res: any, next: any) => {
      const apiKey = req.headers['x-api-key'] ||
                     req.headers['authorization']?.replace('Bearer ', '');

      if (!apiKey) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Bearer realm="PyVM API"');
        res.end(JSON.stringify({
          error: 'Authentication required',
          message: 'Provide API key via X-API-Key header',
        }));
        return;
      }

      const validation = this.validateApiKey(apiKey);

      if (!validation.valid) {
        SecureLoggerService.logSecurityEvent(
          'validation_failure',
          'unknown',
          { reason: validation.reason }
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

      req.apiKeyData = validation.data;
      req.userId = validation.data!.userId;
      req.secretHash = this.getSecretHash();
      req.secretKey = this.getSecretKey();

      next();
    };
  }

  /**
   * Generates hash for Rust integration payload.
   */
  public static generateRustPayloadHash(data: Buffer): string {
    const secretHash = this.getSecretHash();
    const combined = Buffer.concat([
      Buffer.from(secretHash, 'hex'),
      data
    ]);
    return this.computeSHA512(combined.toString('hex'));
  }

  /**
   * Gets current secret key (for display in setup/config)
   */
  public static getCurrentSecretInfo(): {
    secretKey: string;
    secretHash: string;
    source: 'ENV_VAR' | 'DEFAULT';
  } {
    const secretKey = this.getSecretKey();
    const secretHash = this.getSecretHash();
    const source = secretKey !== 'ATOMIC_PYVM' ? 'ENV_VAR' : 'DEFAULT';

    return { secretKey, secretHash, source };
  }
}
