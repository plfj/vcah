use rust_vm_core::pipeline::orchestrator::{DeterministicVmPipeline, PipelineInput};

#[test]
fn test_pipeline_execution_end_to_end() {
    let input = PipelineInput {
        source_code: "def verify_key(k):\n    return k == 42\n".to_string(),
        python_version: "3.12".to_string(),
        seed: 998877,
        cff_enabled: true,
        tamper_sentinel: true,
    };

    let result = DeterministicVmPipeline::run(input).expect("Pipeline execution failed");

    assert_eq!(result.magic_header.python_version, "3.12");
    assert!(!result.virtual_program.raw_bytecode.is_empty());
    assert!(result.entropy_analysis.shannon_entropy > 0.0);
    assert_eq!(result.execution_metadata.zero_copy_verified, true);
}
