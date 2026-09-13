# Environment Configuration for PyVM

## Required Environment Variables

### PYVM_SEC_KEY
**Description:** Secret key for hash-based authentication and block validation.  
**Type:** String  
**Default:** `ATOMIC_PYVM` (if not set)  
**Recommended:** Set a strong, unique secret in production

**Example:**
```bash
export PYVM_SEC_KEY="MyUltraSecureRandomSecret2026!@#$%"
```

**Security Notes:**
- Keep this secret secure and never commit to version control
- Change it periodically (every 90 days recommended)
- Use a strong random string (64+ characters recommended)
- All API keys generated with one secret become invalid if secret changes

### Other Configuration

```bash
# Server Configuration
export PORT=3000
export NODE_ENV=production
export LOG_LEVEL=info

# Rate Limiting
export RATE_LIMIT_WINDOW_MS=60000
export RATE_LIMIT_MAX_REQUESTS=10

# Python Sandbox
export SANDBOX_MAX_EXECUTION_TIME_MS=5000
export SANDBOX_MAX_MEMORY_MB=512

# Obfuscation
export DEFAULT_EXPANSION_RATIO=950
export MAX_SOURCE_SIZE_KB=100
```

## Setup Instructions

### 1. Create .env file

```bash
# .env
PYVM_SEC_KEY=MyUltraSecureRandomSecret2026
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
SANDBOX_MAX_EXECUTION_TIME_MS=5000
SANDBOX_MAX_MEMORY_MB=512
DEFAULT_EXPANSION_RATIO=950
MAX_SOURCE_SIZE_KB=100
```

### 2. Load environment variables

```bash
# Using direnv (recommended)
echo 'export PYVM_SEC_KEY="MySecret"' >> .envrc
direnv allow

# Using systemd service
# Edit /etc/systemd/system/pyvm.service
Environment="PYVM_SEC_KEY=MySecret"

# Using Docker
docker run -e PYVM_SEC_KEY="MySecret" pyvm

# Using docker-compose
# docker-compose.yml
environment:
  - PYVM_SEC_KEY=MySecret
```

### 3. Generate secret hash

```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').createHash('sha512').update(process.env.PYVM_SEC_KEY || 'ATOMIC_PYVM').digest('hex'))"

# Method 2: Using Rust validator
cd crates/rust_vm_core
cargo build --release
./target/release/atomic_validator compute-hash "$PYVM_SEC_KEY"
```

### 4. Verify configuration

```bash
# Start server
npm start

# Check secret info
curl http://localhost:3000/api/config/secret-info \
  -H "X-Admin-Key: <admin-key>"
```

Expected response:
```json
{
  "source": "ENV_VAR",
  "secretHash": "a1b2c3d4...",
  "secretKeySet": true
}
```

## Secret Rotation

### When to rotate:
- Every 90 days (recommended)
- After security incident
- After team member departure
- After suspected compromise

### How to rotate:

```bash
# 1. Generate new secret
NEW_SECRET=$(openssl rand -hex 32)

# 2. Update environment variable
export PYVM_SEC_KEY="$NEW_SECRET"

# 3. Restart server
systemctl restart pyvm

# 4. Regenerate all API keys
# (Old keys will become invalid automatically)
```

## Security Best Practices

### DO:
✅ Use PYVM_SEC_KEY environment variable  
✅ Keep secret 64+ characters  
✅ Use random, high-entropy strings  
✅ Rotate regularly (every 90 days)  
✅ Store in secure secret management (Vault, AWS Secrets Manager)  
✅ Audit access to environment variables  
✅ Log secret rotation events  

### DON'T:
❌ Use default "ATOMIC_PYVM" in production  
❌ Commit secrets to version control  
❌ Share secrets via email/Slack  
❌ Reuse secrets across environments  
❌ Use predictable patterns  
❌ Store secrets in code  

## Example Secure Secrets

```bash
# Good secrets (64+ characters, high entropy)
PYVM_SEC_KEY="7f9a3b2c8d1e5f6a4b7c9d0e2f8a1c3e5b7d9f0a2c4e6b8d1f3a5c7e9b2d4f6a8c0e2b4d6f8a1c3e5b7d9"
PYVM_SEC_KEY="!@#MyCompanyPyVM2026SecretKey$%^&*()_+{RandomChars}789XYZ"
PYVM_SEC_KEY="$(openssl rand -base64 64)"

# Bad secrets (predictable, short)
PYVM_SEC_KEY="password"
PYVM_SEC_KEY="12345"
PYVM_SEC_KEY="ATOMIC_PYVM" (default)
```

## Troubleshooting

### Issue: "Invalid secret hash in API key"

**Cause:** PYVM_SEC_KEY was changed after API keys were generated

**Solution:**
```bash
# Option 1: Restore old secret
export PYVM_SEC_KEY="<old-secret>"

# Option 2: Regenerate all API keys with new secret
npm run generate-api-keys
```

### Issue: "Secret hash mismatch"

**Cause:** API key was generated with different PYVM_SEC_KEY

**Solution:** Regenerate API key with current secret

### Issue: Using default secret in production

**Warning:** You'll see this log message:
```
[WARN] Using default PYVM_SEC_KEY - set environment variable in production
```

**Solution:**
```bash
export PYVM_SEC_KEY="$(openssl rand -hex 32)"
systemctl restart pyvm
```

## Integration with Rust

The secret is passed to Rust validator for block validation:

```rust
// Rust receives the secret from environment
let secret = env::var("PYVM_SEC_KEY").unwrap_or("ATOMIC_PYVM".to_string());
let secret_hash = compute_sha512(secret.as_bytes());
validate_hash_blocks(&bytecode, &secret_hash)
```

## Monitoring

### Log secret source on startup

```typescript
// main.ts
const { secretKey, source } = HashBasedAuthService.getCurrentSecretInfo();
console.log(`Secret source: ${source}`);
if (source === 'DEFAULT') {
  console.warn('⚠️  Using default PYVM_SEC_KEY - set environment variable in production');
}
```

### Alert on default secret in production

```typescript
if (process.env.NODE_ENV === 'production' && source === 'DEFAULT') {
  // Send alert to monitoring system
  sendAlert('PyVM using default secret in production');
}
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-09-13  
**Security Level:** CRITICAL
