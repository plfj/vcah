//! FFI Data Transfer Objects for the JS/Rust boundary.
//! Strict serialization layer; internal kernel types do not leak to NAPI directly.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FfiPipelineRequest {
    pub source_code: String,
    pub python_version: String,
    pub seed: u64,
    pub cff_enabled: bool,
    pub tamper_sentinel: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FfiEntropyRequest {
    pub raw_bytes_hex: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FfiScrambleRequest {
    pub seed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FfiPipelineResponse {
    pub success: bool,
    pub json_payload: String,
    pub error_message: Option<String>,
}
