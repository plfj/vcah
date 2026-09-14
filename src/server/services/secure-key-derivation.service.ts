import { randomBytes, createHmac, pbkdf2Sync, createCipheriv, createDecipheriv, randomFillSync } from 'crypto';
import { Buffer } from 'buffer';

/**
 * Secure Key Derivation Service using industry-standard cryptographic functions.
 * Replaces insecure homebrew crypto with PBKDF2 and AES-256-GCM.
 */
export class SecureKeyDerivationService {
  private static readonly PBKDF2_ITERATIONS = 600000; // OWASP 2023 recommendation
  private static readonly SALT_LENGTH = 32;
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;

  /**
   * Derives a cryptographically secure 32-byte key using PBKDF2-SHA256.
   */
  public static deriveKey(password: string, salt: Buffer): Buffer {
    return pbkdf2Sync(
      password,
      salt,
      SecureKeyDerivationService.PBKDF2_ITERATIONS,
      SecureKeyDerivationService.KEY_LENGTH,
      'sha256'
    );
  }

  /**
   * Generates a cryptographically secure random salt.
   */
  public static generateSalt(): Buffer {
    return randomBytes(SecureKeyDerivationService.SALT_LENGTH);
  }

  /**
   * Generates a cryptographically secure random IV.
   */
  public static generateIV(): Buffer {
    return randomBytes(SecureKeyDerivationService.IV_LENGTH);
  }

  /**
   * Generates a cryptographically secure random seed.
   */
  public static generateSecureSeed(): number {
    return randomBytes(4).readUInt32BE(0);
  }

  /**
   * Encrypts data using AES-256-GCM (authenticated encryption).
   * Returns: { encrypted: Buffer, iv: Buffer, authTag: Buffer, salt: Buffer }
   */
  public static encryptAES256GCM(
    plaintext: Buffer,
    password: string
  ): { encrypted: Buffer; iv: Buffer; authTag: Buffer; salt: Buffer } {
    const salt = this.generateSalt();
    const key = this.deriveKey(password, salt);
    const iv = this.generateIV();

    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return { encrypted, iv, authTag, salt };
  }

  /**
   * Decrypts data using AES-256-GCM with authentication verification.
   */
  public static decryptAES256GCM(
    encrypted: Buffer,
    password: string,
    iv: Buffer,
    authTag: Buffer,
    salt: Buffer
  ): Buffer {
    const key = this.deriveKey(password, salt);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  /**
   * Computes HMAC-SHA256 for integrity verification (constant-time comparison safe).
   */
  public static computeHMAC(data: Buffer, key: Buffer): Buffer {
    return createHmac('sha256', key).update(data).digest();
  }

  /**
   * Constant-time comparison to prevent timing attacks.
   */
  public static constantTimeCompare(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }

  /**
   * Generates a cryptographically secure witness token using high-security PBKDF2.
   * Provides substantial computational effort against password cracking (CWE-916).
   */
  public static generateWitness(data: Buffer, seed: Buffer): string {
    return pbkdf2Sync(
      data,
      seed,
      SecureKeyDerivationService.PBKDF2_ITERATIONS,
      SecureKeyDerivationService.KEY_LENGTH,
      'sha256'
    ).toString('hex');
  }

  /**
   * Derives layer-specific encryption key with proper domain separation.
   */
  public static deriveLayerKey(
    masterPassword: string,
    layerName: string,
    witness: string,
    salt: Buffer
  ): Buffer {
    // Domain separation: layer name + witness token
    const domainSeparator = `${layerName}:${witness}`;
    const combinedPassword = `${masterPassword}:${domainSeparator}`;
    return this.deriveKey(combinedPassword, salt);
  }
}
