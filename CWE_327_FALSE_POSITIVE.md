# CWE-327 False Positive Analysis

## Summary
Security scanners flagged two uses of seeded Linear Congruential Generators (LCG) as CWE-327 (Use of a Broken or Risky Cryptographic Algorithm). These are **false positives** - the flagged code uses deterministic PRNGs intentionally for reproducibility, not for cryptographic security.

## Flagged Locations

### 1. opcode-scrambler.service.ts:65
**Context:** Fisher-Yates shuffle with seeded LCG for deterministic opcode remapping

**Purpose:** Given the same seed, generate identical opcode mappings. This allows users to:
- Reproduce exact obfuscation results with the same configuration
- Debug obfuscated code by regenerating with known seed
- Verify obfuscation consistency across builds

**Why NOT a Security Issue:**
- This is for **obfuscation**, not cryptographic security
- Determinism is **required** - same seed must produce same opcodes
- Cryptographic randomness would break reproducibility
- Security-critical operations (encryption, witness tokens) use `crypto.randomBytes()`

**OWASP Compliance:**
Per OWASP guidelines, cryptographic algorithms are required for:
- Encryption/decryption
- Digital signatures
- Authentication tokens
- Session IDs
- Password hashing

Opcode shuffling for code obfuscation is **not** a cryptographic operation.

### 2. atomic-grade-vm-generator.service.ts:50
**Context:** Seeded LCG for deterministic CJK identifier generation

**Purpose:** Generate unique CJK Unicode identifiers deterministically

**Why NOT a Security Issue:**
- Used for variable/function name mangling (obfuscation)
- Must be deterministic for reproducible builds
- The **seed** is cryptographically secure (from `SecureKeyDerivationService`)
- The PRNG itself is intentionally deterministic
- Identifier names don't require cryptographic unpredictability

**Security Model:**
```
Cryptographically secure seed → Deterministic PRNG → Reproducible identifiers
       (crypto.randomBytes)         (LCG)              (same seed = same names)
```

## Actual Security-Critical Randomness

The codebase correctly uses cryptographic randomness where it matters:

**crypto.randomBytes() used for:**
- `SecureKeyDerivationService.generateSalt()` - PBKDF2 salt generation
- `SecureKeyDerivationService.generateIV()` - AES-GCM IV generation
- `SecureKeyDerivationService.generateSecureSeed()` - Cryptographic seed generation
- Layer encryption padding (atomic-grade-vm-generator.service.ts:205, 232)
- Witness token generation via HMAC-SHA256

**PBKDF2/HMAC used for:**
- Witness token computation (CWE-328 fix)
- Key derivation for layer encryption
- Password-based key derivation (600,000 iterations)

## Conclusion

The flagged LCG usages are **by design** for deterministic obfuscation. They are not security vulnerabilities.

**Recommendation:** Configure security scanner to exclude these specific uses or mark as accepted risk with this documentation as justification.

**Reference Standards:**
- NIST SP 800-90A: Distinguishes between DRBGs (cryptographic) and PRNGs (non-cryptographic)
- OWASP states cryptographic algorithms are required for "security-relevant purposes"
- Code obfuscation is explicitly non-cryptographic per NIST guidelines
