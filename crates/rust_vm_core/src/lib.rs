pub mod atomic_hash_validator;
pub mod ffi;
pub mod kernel;
pub mod pipeline;
pub mod primitives;

pub use atomic_hash_validator::*;
pub use ffi::*;
pub use kernel::*;
pub use pipeline::*;
pub use primitives::*;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn integration_test_full_pipeline() {
        let secret_hash = compute_sha512(b"ATOMIC_PYVM");
        assert!(validate_secret_hash(&secret_hash));

        let test_data = b"print('Hello, Atomic World!')";
        let config = ObfuscationConfig::default();

        let obfuscated = atomic_obfuscate(test_data, &secret_hash, config).unwrap();
        assert!(obfuscated.len() > test_data.len());
    }
}
