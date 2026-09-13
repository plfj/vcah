/**
 * ATOMIC GRADE PYTHON RUNTIME DECRYPTOR
 * This module provides AES-256-GCM decryption template for atomic-grade obfuscated code.
 */

// This is the Python runtime decryption template that will be embedded in generated code
export const ATOMIC_RUNTIME_TEMPLATE = `import sys
import struct
import hashlib
import hmac
import os
import time

# Try to import PyCryptodome for AES-256-GCM
try:
    from Crypto.Cipher import AES
    from Crypto.Protocol.KDF import PBKDF2
    HAS_CRYPTO = True
except ImportError:
    try:
        from Cryptodome.Cipher import AES
        from Cryptodome.Protocol.KDF import PBKDF2
        HAS_CRYPTO = True
    except ImportError:
        HAS_CRYPTO = False

class {ATOMIC_INTERPRETER_CLASS}:
    """Atomic-grade secure interpreter with AES-256-GCM decryption."""

    PBKDF2_ITERATIONS = 600000
    KEY_LENGTH = 32
    IV_LENGTH = 16
    TAG_LENGTH = 16
    SALT_LENGTH = 32

    def __init__(self, scope, payload, master_key):
        self.scope = scope or globals()
        self.payload = payload
        self.master_key = master_key
        self.{EXECUTE_METHOD}()

    @staticmethod
    def {DERIVE_KEY_METHOD}(password, salt, iterations=600000):
        """Derives 32-byte key using PBKDF2-SHA256."""
        if HAS_CRYPTO:
            return PBKDF2(password, salt, dkLen=32, count=iterations, hmac_hash_module=hashlib.sha256)
        else:
            # Fallback to hashlib.pbkdf2_hmac
            return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8') if isinstance(password, str) else password, salt, iterations, 32)

    @staticmethod
    def {CONSTANT_TIME_COMPARE_METHOD}(a, b):
        """Constant-time comparison to prevent timing attacks."""
        if len(a) != len(b):
            return False
        result = 0
        for x, y in zip(a, b):
            result |= x ^ y
        return result == 0

    @staticmethod
    def {COMPUTE_HMAC_METHOD}(data, key):
        """Computes HMAC-SHA256 for integrity verification."""
        return hmac.new(key, data, hashlib.sha256).digest()

    @staticmethod
    def {VERIFY_HMAC_METHOD}(data, key, expected_hmac):
        """Verifies HMAC with constant-time comparison."""
        computed = {COMPUTE_HMAC_METHOD}(data, key)
        return {CONSTANT_TIME_COMPARE_METHOD}(computed[:4], expected_hmac)

    @staticmethod
    def {DECRYPT_AES_GCM_METHOD}(encrypted, key, iv, tag):
        """Decrypts data using AES-256-GCM."""
        if not HAS_CRYPTO:
            raise ImportError("PyCryptodome required for AES-GCM: pip install pycryptodome")

        cipher = AES.new(key, AES.MODE_GCM, nonce=iv)
        try:
            plaintext = cipher.decrypt_and_verify(encrypted, tag)
            return plaintext
        except ValueError:
            raise RuntimeError("Authentication tag verification failed - data corrupted or tampered")

    def {ANTI_DEBUG_METHOD}(self):
        """Multi-layer anti-debugging and anti-tampering checks."""
        tampered = False

        # Check for debugger
        if sys.gettrace() is not None:
            tampered = True

        # Check Python monitoring (3.12+)
        if hasattr(sys, 'monitoring'):
            try:
                for tool_id in range(6):
                    sys.monitoring.set_events(tool_id, 0)
            except Exception:
                pass

        # Check setprofile
        if hasattr(sys, 'setprofile'):
            try:
                sys.setprofile(None)
            except Exception:
                pass

        # Timing check (detect stepping)
        t0 = time.perf_counter_ns() if hasattr(time, 'perf_counter_ns') else int(time.time() * 1e9)
        probe = sum(i ^ 0x5A for i in range(120))
        t1 = time.perf_counter_ns() if hasattr(time, 'perf_counter_ns') else int(time.time() * 1e9)

        if (t1 - t0) > 400000000:  # 400ms threshold
            tampered = True

        # Platform-specific checks
        if sys.platform.startswith('linux'):
            try:
                if os.path.exists('/proc/self/status'):
                    with open('/proc/self/status', 'r') as f:
                        for line in f:
                            if line.startswith('TracerPid:'):
                                tracer_pid = int(line.split(':')[1].strip())
                                if tracer_pid > 0:
                                    tampered = True
                                break
            except Exception:
                pass

        # Unix ptrace check
        if hasattr(os, 'getppid'):
            try:
                import ctypes
                libc = ctypes.CDLL(None)
                if hasattr(libc, 'ptrace'):
                    PT_DENY_ATTACH = 31
                    try:
                        libc.ptrace(PT_DENY_ATTACH, 0, 0, 0)
                    except Exception:
                        pass
            except Exception:
                pass

        # Time sanity check (prevent replay attacks)
        if int(time.time()) < 1577836800:  # Before 2020-01-01
            tampered = True

        if tampered:
            # Silent corruption
            try:
                sys.modules['__main__'].__dict__['__poison__'] = 0xDEADBEEF
            except Exception:
                pass
            raise RuntimeError("Security violation detected")

        return True

    def {EXECUTE_METHOD}(self):
        """Executes protected code with multi-layer AES-256-GCM decryption."""

        # Anti-debugging checks
        self.{ANTI_DEBUG_METHOD}()

        if not HAS_CRYPTO:
            raise ImportError("PyCryptodome required: pip install pycryptodome")

        raw = self.payload

        # Verify minimum size
        if len(raw) < 60:
            raise ValueError("Invalid payload size")

        # Verify magic header
        if raw[0:4] != b"{MAGIC_BYTES}":
            raise RuntimeError("Invalid magic header")

        # Parse header
        vm_flags = raw[4:8]
        orig_len = struct.unpack(">I", raw[8:12])[0]
        hmac_header = raw[12:16]
        chunk_count = struct.unpack(">I", raw[16:20])[0]
        salt_l1 = raw[20:52]
        encrypted_body = raw[52:]

        # Derive Layer 1 decryption key with domain separation
        key_l1 = self.{DERIVE_KEY_METHOD}(
            self.master_key + ":L1_Bus:{W1_HEX}",
            salt_l1,
            self.PBKDF2_ITERATIONS
        )

        # Extract IV, auth tag, and encrypted data
        if len(encrypted_body) < self.IV_LENGTH + self.TAG_LENGTH:
            raise ValueError("Invalid encrypted payload structure")

        iv_l1 = encrypted_body[:self.IV_LENGTH]
        tag_l1 = encrypted_body[self.IV_LENGTH:self.IV_LENGTH + self.TAG_LENGTH]
        ciphertext_l1 = encrypted_body[self.IV_LENGTH + self.TAG_LENGTH:]

        # Decrypt Layer 1
        l2_packet = self.{DECRYPT_AES_GCM_METHOD}(ciphertext_l1[:orig_len], key_l1, iv_l1, tag_l1)

        # Verify Layer 2 structure
        if len(l2_packet) < 40 or l2_packet[0:4] != b'\\x50\\x56\\x4d\\x02':
            raise RuntimeError("Invalid Layer 2 packet")

        l2_len = struct.unpack(">I", l2_packet[4:8])[0]
        iv_l2 = l2_packet[8:24]
        tag_l2 = l2_packet[24:40]
        ciphertext_l2 = l2_packet[40:]

        # Derive Layer 2 key
        salt_l2 = salt_l1  # In production, use separate salts
        key_l2 = self.{DERIVE_KEY_METHOD}(
            self.master_key + ":L2_Aegis:{W1_HEX}",
            salt_l2,
            self.PBKDF2_ITERATIONS
        )

        # Decrypt Layer 2
        l3_packet = self.{DECRYPT_AES_GCM_METHOD}(ciphertext_l2[:l2_len], key_l2, iv_l2, tag_l2)

        # Verify Layer 3 structure
        if len(l3_packet) < 40 or l3_packet[0:4] != b'\\x50\\x56\\x4d\\x03':
            raise RuntimeError("Invalid Layer 3 packet")

        l3_len = struct.unpack(">I", l3_packet[4:8])[0]
        iv_l3 = l3_packet[8:24]
        tag_l3 = l3_packet[24:40]
        ciphertext_l3 = l3_packet[40:]

        # Derive Layer 3 key from W2 (derived from W1)
        w2_hash = hashlib.sha256((self.master_key + "{W1_HEX}").encode()).hexdigest()
        salt_l3 = salt_l1  # In production, use separate salts
        key_l3 = self.{DERIVE_KEY_METHOD}(
            self.master_key + ":L3_Core:" + w2_hash,
            salt_l3,
            self.PBKDF2_ITERATIONS
        )

        # Decrypt Layer 3 (final source code)
        source_bytes = self.{DECRYPT_AES_GCM_METHOD}(ciphertext_l3[:l3_len], key_l3, iv_l3, tag_l3)

        # Decode and execute
        source_code = source_bytes.decode('utf-8', errors='ignore')

        # Clear type cache
        if hasattr(sys, '_clear_type_cache'):
            sys._clear_type_cache()

        # Compile and execute in protected scope
        builtins = getattr(__builtins__, '__dict__', __builtins__)
        self.scope['__builtins__'] = builtins

        compiled = compile(source_code, '<atomic_vm_core>', 'exec')
        exec(compiled, self.scope, self.scope)

        # Memory cleanup
        del source_code
        del source_bytes
        del key_l1, key_l2, key_l3
        del l2_packet, l3_packet

# Entrypoint with lambda obfuscation
(lambda _interpreter: _interpreter(
    globals(),
    {PAYLOAD_LITERAL},
    "{MASTER_KEY}"
))(lambda scope, payload, key: {ATOMIC_INTERPRETER_CLASS}(scope, payload, key))
`;

export interface AtomicPythonRuntimeConfig {
  master_key: string;
  w1_hex: string;
  w2_hex: string;
  magic_bytes: string;
  payload_literal: string;
  seed?: number;
  [key: string]: any;
}

/**
 * Generates the atomic-grade Python runtime decryptor.
 *
 * @param config Configuration with master_key, w1_hex, w2_hex, magic_bytes, payload_literal
 * @returns Complete Python source code with embedded decryptor
 */
export function generateAtomicPythonRuntime(config: AtomicPythonRuntimeConfig): string {
  // Deterministic pseudo-random identifier generator based on seed
  let seed = config.seed !== undefined ? config.seed : 42;
  const chars = 'abcdefghijklmnopqrstuvwxyz';

  const genId = (): string => {
    let result = '';
    for (let i = 0; i < 8; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      result += chars[seed % chars.length];
    }
    return result;
  };

  // Replace placeholders
  let runtime = ATOMIC_RUNTIME_TEMPLATE;
  runtime = runtime.split('{ATOMIC_INTERPRETER_CLASS}').join(genId());
  runtime = runtime.split('{EXECUTE_METHOD}').join(genId());
  runtime = runtime.split('{DERIVE_KEY_METHOD}').join(genId());
  runtime = runtime.split('{CONSTANT_TIME_COMPARE_METHOD}').join(genId());
  runtime = runtime.split('{COMPUTE_HMAC_METHOD}').join(genId());
  runtime = runtime.split('{VERIFY_HMAC_METHOD}').join(genId());
  runtime = runtime.split('{DECRYPT_AES_GCM_METHOD}').join(genId());
  runtime = runtime.split('{ANTI_DEBUG_METHOD}').join(genId());
  runtime = runtime.split('{MAGIC_BYTES}').join(config.magic_bytes);
  runtime = runtime.split('{W1_HEX}').join(config.w1_hex);
  runtime = runtime.split('{W2_HEX}').join(config.w2_hex);
  runtime = runtime.split('{MASTER_KEY}').join(config.master_key);
  runtime = runtime.split('{PAYLOAD_LITERAL}').join(config.payload_literal);

  return runtime;
}

export class AtomicPythonRuntimeService {
  public static generate(config: AtomicPythonRuntimeConfig): string {
    return generateAtomicPythonRuntime(config);
  }
}

export default AtomicPythonRuntimeService;
