use rust_vm_core::kernel::entropy::shannon::calculate_shannon_entropy;

#[test]
fn test_shannon_entropy_all_zeroes() {
    let bytes = vec![0u8; 1024];
    let result = calculate_shannon_entropy(&bytes);
    assert_eq!(result.shannon_entropy, 0.0);
    assert_eq!(result.unique_bytes, 1);
}

#[test]
fn test_shannon_entropy_uniform_distribution() {
    let mut bytes = Vec::with_capacity(256 * 10);
    for _ in 0..10 {
        for b in 0..=255 {
            bytes.push(b);
        }
    }
    let result = calculate_shannon_entropy(&bytes);
    assert!((result.shannon_entropy - 8.0).abs() < 0.001);
    assert_eq!(result.unique_bytes, 256);
}
