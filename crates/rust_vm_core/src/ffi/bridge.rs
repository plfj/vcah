//! Safe C / NAPI FFI Bridge.
//! Isolates Rust domain kernels completely from foreign function wrappers.

use crate::ffi::dto::{
    FfiEntropyRequest, FfiPipelineRequest, FfiPipelineResponse, FfiScrambleRequest,
};
use crate::kernel::entropy::shannon::calculate_shannon_entropy;
use crate::kernel::opcode::scrambler::generate_scramble_table;
use crate::pipeline::orchestrator::{DeterministicVmPipeline, PipelineInput};

/// Safe C-compatible export for running the entire transformation pipeline.
pub fn execute_pipeline_ffi_safe(req: FfiPipelineRequest) -> FfiPipelineResponse {
    let input = PipelineInput {
        source_code: req.source_code,
        python_version: req.python_version,
        seed: req.seed,
        cff_enabled: req.cff_enabled,
        tamper_sentinel: req.tamper_sentinel,
    };

    match DeterministicVmPipeline::run(input) {
        Ok(output) => match serde_json::to_string(&output) {
            Ok(json_payload) => FfiPipelineResponse {
                success: true,
                json_payload,
                error_message: None,
            },
            Err(e) => FfiPipelineResponse {
                success: false,
                json_payload: String::new(),
                error_message: Some(format!("Serialization failure: {}", e)),
            },
        },
        Err(err) => FfiPipelineResponse {
            success: false,
            json_payload: String::new(),
            error_message: Some(err),
        },
    }
}

/// Safe FFI export for calculating Shannon Entropy on hex-encoded bytes.
pub fn execute_entropy_ffi_safe(req: FfiEntropyRequest) -> FfiPipelineResponse {
    let bytes: Vec<u8> = (0..req.raw_bytes_hex.len())
        .step_by(2)
        .filter_map(|i| {
            if i + 2 <= req.raw_bytes_hex.len() {
                u8::from_str_radix(&req.raw_bytes_hex[i..i + 2], 16).ok()
            } else {
                None
            }
        })
        .collect();

    let analysis = calculate_shannon_entropy(&bytes);
    match serde_json::to_string(&analysis) {
        Ok(json_payload) => FfiPipelineResponse {
            success: true,
            json_payload,
            error_message: None,
        },
        Err(e) => FfiPipelineResponse {
            success: false,
            json_payload: String::new(),
            error_message: Some(e.to_string()),
        },
    }
}

/// Safe FFI export for generating opcode scramble table.
pub fn execute_scramble_ffi_safe(req: FfiScrambleRequest) -> FfiPipelineResponse {
    let table = generate_scramble_table(req.seed);
    match serde_json::to_string(&table) {
        Ok(json_payload) => FfiPipelineResponse {
            success: true,
            json_payload,
            error_message: None,
        },
        Err(e) => FfiPipelineResponse {
            success: false,
            json_payload: String::new(),
            error_message: Some(e.to_string()),
        },
    }
}
