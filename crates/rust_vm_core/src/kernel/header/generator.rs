//! Pure Magic Header Mutation & Validation Kernel.
//! Supports Python 3.7 through 3.14 magic numbers with polymorphic byte padding.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MagicHeaderSpec {
    pub python_version: String,
    pub standard_magic_hex: String,
    pub virtual_magic_bytes: Vec<u8>,
    pub timestamp: u32,
    pub file_size_hash: u32,
    pub bit_flags: u32,
}

pub fn generate_mutated_magic_header(version: &str, seed: u64) -> MagicHeaderSpec {
    let (std_hex, base_magic): (&str, [u8; 4]) = match version {
        "3.7" => ("420D0D0A", [0x42, 0x0D, 0x0D, 0x0A]),
        "3.8" => ("550D0D0A", [0x55, 0x0D, 0x0D, 0x0A]),
        "3.9" => ("610D0D0A", [0x61, 0x0D, 0x0D, 0x0A]),
        "3.10" => ("6F0D0D0A", [0x6F, 0x0D, 0x0D, 0x0A]),
        "3.11" => ("A70D0D0A", [0xA7, 0x0D, 0x0D, 0x0A]),
        "3.12" => ("CB0D0D0A", [0xCB, 0x0D, 0x0D, 0x0A]),
        "3.13" => ("EE0D0D0A", [0xEE, 0x0D, 0x0D, 0x0A]),
        "3.14" => ("040E0D0A", [0x04, 0x0E, 0x0D, 0x0A]),
        _ => ("CB0D0D0A", [0xCB, 0x0D, 0x0D, 0x0A]), // default to 3.12 LTS
    };

    // Deterministic pseudo-random mixer based on seed
    let mix1 = ((seed ^ 0x5DEECE66Du64).wrapping_mul(0x2545F4914F6CDD1Du64) >> 16) as u8;
    let mix2 = (seed.wrapping_shr(8) ^ 0xAA55AA55) as u8;

    let virtual_magic = vec![
        base_magic[0] ^ mix1,
        0x50, // 'P'
        0x56, // 'V'
        0x4D ^ mix2, // 'M' mutated
        0x01, 0x00, 0x00, 0x00, // Format version 1.0.0
        0xDE, 0xAD, 0xBE, 0xEF, // Sentinel
        0x7F, 0x45, 0x4C, 0x46, // Fake ELF/Native payload stub marker
    ];

    let timestamp = (seed & 0xFFFFFFFF) as u32 ^ 0x65F00000;
    let file_size_hash = ((seed >> 32) as u32).wrapping_mul(31);
    let bit_flags = 0x00000001 | 0x00000004 | 0x00000010; // CFF | TamperCheck | NativeStub

    MagicHeaderSpec {
        python_version: version.to_string(),
        standard_magic_hex: std_hex.to_string(),
        virtual_magic_bytes: virtual_magic,
        timestamp,
        file_size_hash,
        bit_flags,
    }
}
