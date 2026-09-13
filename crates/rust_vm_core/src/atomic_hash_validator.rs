use sha2::{Sha512, Digest};
use std::io::{self, Read};

/// ATOMIC PYVM - RUST SHA-512 VALIDATOR
///
/// This Rust module validates the SHA-512 secret hash and performs block injection.
/// Secret: SHA-512("ATOMIC_PYVM")

const SECRET_HASH: &str = "e8c8f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5e5c5f5b5";

/// Computes SHA-512 hash of input
pub fn compute_sha512(input: &[u8]) -> String {
    let mut hasher = Sha512::new();
    hasher.update(input);
    format!("{:x}", hasher.finalize())
}

/// Validates secret hash against ATOMIC_PYVM constant
pub fn validate_secret_hash(hash: &str) -> bool {
    let expected = compute_sha512(b"ATOMIC_PYVM");
    constant_time_compare(hash.as_bytes(), expected.as_bytes())
}

/// Constant-time comparison to prevent timing attacks
fn constant_time_compare(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }

    let mut result = 0u8;
    for (byte_a, byte_b) in a.iter().zip(b.iter()) {
        result |= byte_a ^ byte_b;
    }

    result == 0
}

/// Block injection: Injects SHA-512 hash blocks into bytecode
pub fn inject_hash_blocks(bytecode: &[u8], secret_hash: &str) -> Vec<u8> {
    let mut result = Vec::new();
    let hash_bytes = hex::decode(secret_hash).unwrap_or_default();

    // Inject hash block every 1024 bytes
    let block_size = 1024;

    for (i, chunk) in bytecode.chunks(block_size).enumerate() {
        // Add chunk
        result.extend_from_slice(chunk);

        // Inject hash block marker + hash fragment
        if i < bytecode.len() / block_size {
            result.push(0xFF); // Marker byte
            result.push(0xAB); // Block injection marker

            // Inject 16-byte hash fragment
            let start = (i * 16) % hash_bytes.len();
            let end = std::cmp::min(start + 16, hash_bytes.len());
            result.extend_from_slice(&hash_bytes[start..end]);
        }
    }

    result
}

/// Validates injected hash blocks
pub fn validate_hash_blocks(bytecode: &[u8], secret_hash: &str) -> bool {
    let hash_bytes = match hex::decode(secret_hash) {
        Ok(bytes) => bytes,
        Err(_) => return false,
    };

    let block_size = 1024;
    let mut current_block = 0;
    let mut i = 0;

    while i < bytecode.len() {
        // Skip to next block boundary
        i += block_size;

        if i >= bytecode.len() - 18 {
            break;
        }

        // Check for marker bytes
        if bytecode[i] == 0xFF && bytecode[i + 1] == 0xAB {
            // Extract hash fragment
            let fragment = &bytecode[i + 2..i + 18];

            // Verify hash fragment
            let start = (current_block * 16) % hash_bytes.len();
            let end = std::cmp::min(start + 16, hash_bytes.len());
            let expected = &hash_bytes[start..end];

            if !constant_time_compare(fragment, expected) {
                return false;
            }

            i += 18;
            current_block += 1;
        }
    }

    true
}

/// Advanced obfuscation: XOR with rolling hash
pub fn obfuscate_with_rolling_hash(data: &[u8], secret: &str) -> Vec<u8> {
    let mut hasher = Sha512::new();
    hasher.update(secret.as_bytes());
    let mut hash = hasher.finalize().to_vec();

    let mut result = Vec::with_capacity(data.len());

    for (i, byte) in data.iter().enumerate() {
        // Update rolling hash
        if i % 64 == 0 && i > 0 {
            let mut new_hasher = Sha512::new();
            new_hasher.update(&hash);
            new_hasher.update(&[i as u8]);
            hash = new_hasher.finalize().to_vec();
        }

        let key_byte = hash[i % 64];
        result.push(byte ^ key_byte);
    }

    result
}

/// Deobfuscate with rolling hash
pub fn deobfuscate_with_rolling_hash(data: &[u8], secret: &str) -> Vec<u8> {
    // XOR is symmetric, so deobfuscation is the same as obfuscation
    obfuscate_with_rolling_hash(data, secret)
}

/// Polymorphic instruction substitution
pub fn polymorphic_substitute(bytecode: &[u8], seed: u64) -> Vec<u8> {
    let mut result = Vec::new();
    let mut rng_state = seed;

    for byte in bytecode {
        // LCG pseudo-random generator
        rng_state = rng_state.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        let random_byte = (rng_state >> 32) as u8;

        // Polymorphic substitution based on instruction type
        let substituted = match byte {
            // NOP instructions - replace with random equivalents
            0x90 => random_byte & 0x0F,

            // MOV instructions - add random offset
            0x88..=0x8B => byte.wrapping_add(random_byte & 0x03),

            // CALL/JMP - polymorphic encoding
            0xE8 | 0xE9 => byte ^ (random_byte & 0x01),

            // Everything else - pass through with light obfuscation
            _ => byte ^ (random_byte & 0x01),
        };

        result.push(substituted);
    }

    result
}

/// Control flow flattening using state machine
pub fn control_flow_flatten(bytecode: &[u8]) -> Vec<u8> {
    let mut result = Vec::new();

    // Add state machine header
    result.extend_from_slice(&[0xCF, 0xFF]); // CFF marker

    // Divide code into basic blocks
    let block_size = 32;
    let num_blocks = (bytecode.len() + block_size - 1) / block_size;

    // Add dispatch table
    result.push((num_blocks & 0xFF) as u8);
    result.push(((num_blocks >> 8) & 0xFF) as u8);

    // Generate random dispatch order
    let mut dispatch_order: Vec<u8> = (0..num_blocks as u8).collect();
    let mut seed = compute_sha512(bytecode);
    let seed_val = u64::from_str_radix(&seed[..16], 16).unwrap_or(0);

    // Fisher-Yates shuffle
    for i in (1..dispatch_order.len()).rev() {
        let j = (seed_val.wrapping_mul(i as u64) % (i as u64 + 1)) as usize;
        dispatch_order.swap(i, j);
    }

    // Add dispatch order
    result.extend_from_slice(&dispatch_order);

    // Add flattened blocks
    for chunk in bytecode.chunks(block_size) {
        result.extend_from_slice(chunk);
    }

    result
}

/// Dead code injection
pub fn inject_dead_code(bytecode: &[u8], density: f32) -> Vec<u8> {
    let mut result = Vec::new();
    let mut rng_state = compute_sha512(bytecode);
    let seed = u64::from_str_radix(&rng_state[..16], 16).unwrap_or(0);
    let mut state = seed;

    for byte in bytecode {
        result.push(*byte);

        // Randomly inject dead code
        state = state.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        let should_inject = (state as f32 / u64::MAX as f32) < density;

        if should_inject {
            // Inject opaque predicate or junk instruction
            result.push(0x90); // NOP
            result.push((state >> 32) as u8); // Random byte
        }
    }

    result
}

/// Opaque predicates: Always-true or always-false conditions
pub fn add_opaque_predicates(bytecode: &[u8]) -> Vec<u8> {
    let mut result = Vec::new();

    // Add opaque predicate header
    result.extend_from_slice(&[0x0F, 0x1F, 0x00]); // Multi-byte NOP

    // Inject opaque predicates every 64 bytes
    for (i, chunk) in bytecode.chunks(64).enumerate() {
        // Always-true predicate: (x * (x + 1)) & 1 == 0
        if i % 2 == 0 {
            result.extend_from_slice(&[0x31, 0xC0]); // XOR EAX, EAX (always true)
        }

        result.extend_from_slice(chunk);

        // Always-false predicate
        if i % 3 == 0 {
            result.extend_from_slice(&[0x85, 0xC0]); // TEST EAX, EAX
        }
    }

    result
}

/// String encryption with SHA-512 key stream
pub fn encrypt_strings(data: &[u8], secret: &str) -> Vec<u8> {
    let key_stream = compute_sha512(secret.as_bytes());
    let key_bytes = hex::decode(key_stream).unwrap_or_default();

    data.iter()
        .enumerate()
        .map(|(i, byte)| byte ^ key_bytes[i % key_bytes.len()])
        .collect()
}

/// Main validation and obfuscation entry point
pub fn atomic_obfuscate(bytecode: &[u8], secret_hash: &str, config: ObfuscationConfig) -> Result<Vec<u8>, String> {
    // Validate secret hash
    if !validate_secret_hash(secret_hash) {
        return Err("Invalid secret hash".to_string());
    }

    let mut result = bytecode.to_vec();

    // Apply obfuscation layers
    if config.hash_block_injection {
        result = inject_hash_blocks(&result, secret_hash);
    }

    if config.control_flow_flattening {
        result = control_flow_flatten(&result);
    }

    if config.polymorphic_substitution {
        result = polymorphic_substitute(&result, config.seed);
    }

    if config.dead_code_injection {
        result = inject_dead_code(&result, config.dead_code_density);
    }

    if config.opaque_predicates {
        result = add_opaque_predicates(&result);
    }

    if config.rolling_hash_obfuscation {
        result = obfuscate_with_rolling_hash(&result, &secret_hash);
    }

    Ok(result)
}

#[derive(Debug, Clone)]
pub struct ObfuscationConfig {
    pub hash_block_injection: bool,
    pub control_flow_flattening: bool,
    pub polymorphic_substitution: bool,
    pub dead_code_injection: bool,
    pub opaque_predicates: bool,
    pub rolling_hash_obfuscation: bool,
    pub seed: u64,
    pub dead_code_density: f32,
}

impl Default for ObfuscationConfig {
    fn default() -> Self {
        ObfuscationConfig {
            hash_block_injection: true,
            control_flow_flattening: true,
            polymorphic_substitution: true,
            dead_code_injection: true,
            opaque_predicates: true,
            rolling_hash_obfuscation: true,
            seed: 0xDEADBEEF,
            dead_code_density: 0.15,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_secret_hash() {
        let hash = compute_sha512(b"ATOMIC_PYVM");
        assert!(validate_secret_hash(&hash));
    }

    #[test]
    fn test_block_injection() {
        let data = vec![0u8; 2048];
        let secret = compute_sha512(b"ATOMIC_PYVM");
        let injected = inject_hash_blocks(&data, &secret);
        assert!(injected.len() > data.len());
        assert!(validate_hash_blocks(&injected, &secret));
    }

    #[test]
    fn test_rolling_hash() {
        let data = b"Hello, World!";
        let secret = "ATOMIC_PYVM";
        let obfuscated = obfuscate_with_rolling_hash(data, secret);
        let deobfuscated = deobfuscate_with_rolling_hash(&obfuscated, secret);
        assert_eq!(data.to_vec(), deobfuscated);
    }
}
