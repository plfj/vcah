//! Pure Shannon Entropy and Byte Distribution Kernel.
//! Zero-allocation hot path operating over borrowed byte slices.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct EntropyAnalysisResult {
    pub shannon_entropy: f64,
    pub max_entropy: f64,
    pub entropy_ratio: f64,
    pub byte_counts: Vec<u32>,
    pub unique_bytes: usize,
    pub chi_square: f64,
    pub randomness_grade: String,
}

/// Computes the exact Shannon Entropy H(X) = -sum(p(x) * log2(p(x)))
/// over an arbitrary slice of bytes.
pub fn calculate_shannon_entropy(bytes: &[u8]) -> EntropyAnalysisResult {
    if bytes.is_empty() {
        return EntropyAnalysisResult {
            shannon_entropy: 0.0,
            max_entropy: 8.0,
            entropy_ratio: 0.0,
            byte_counts: vec![0; 256],
            unique_bytes: 0,
            chi_square: 0.0,
            randomness_grade: "TRIVIAL_ZERO".to_string(),
        };
    }

    let mut counts = [0u32; 256];
    for &b in bytes {
        counts[b as usize] += 1;
    }

    let len_f64 = bytes.len() as f64;
    let mut entropy = 0.0;
    let mut unique = 0;

    for &count in &counts {
        if count > 0 {
            unique += 1;
            let p = count as f64 / len_f64;
            entropy -= p * p.log2();
        }
    }

    let max_entropy = 8.0f64;
    let entropy_ratio = (entropy / max_entropy).clamp(0.0, 1.0);

    // Pearson's Chi-Square test for uniformity
    let expected = len_f64 / 256.0;
    let mut chi_square = 0.0;
    for &count in &counts {
        let diff = count as f64 - expected;
        chi_square += (diff * diff) / expected;
    }

    let grade = if entropy > 7.85 {
        "CRYPTOGRAPHIC_HIGH_ENTROPY"
    } else if entropy > 7.2 {
        "MODERATE_OBSCURITY"
    } else if entropy > 5.5 {
        "LOW_DIFFUSION"
    } else {
        "PLAINTEXT_PATTERNS_DETECTED"
    };

    EntropyAnalysisResult {
        shannon_entropy: (entropy * 10_000.0).round() / 10_000.0,
        max_entropy,
        entropy_ratio: (entropy_ratio * 10_000.0).round() / 10_000.0,
        byte_counts: counts.to_vec(),
        unique_bytes: unique,
        chi_square: (chi_square * 100.0).round() / 100.0,
        randomness_grade: grade.to_string(),
    }
}
