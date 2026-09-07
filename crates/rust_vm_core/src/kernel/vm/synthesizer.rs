//! Pure Virtual Machine Bytecode Assembly & 3-Layer Onion Synthesizer Kernel.
//! Assembles flattened control-flow graph (CFF) into custom virtual instruction streams.

use crate::kernel::opcode::scrambler::ScrambleTable;
use crate::primitives::instruction::{VirtualInstruction, VirtualOpcode};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BasicBlock {
    pub id: u32,
    pub instructions: Vec<VirtualInstruction>,
    pub successor_state: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct VirtualProgram {
    pub magic_header: Vec<u8>,
    pub constants_table: Vec<String>,
    pub basic_blocks: Vec<BasicBlock>,
    pub raw_bytecode: Vec<u8>,
    pub cff_dispatcher_state: u32,
    pub total_instructions: usize,
}

pub fn synthesize_virtual_program(
    source_lines: &[String],
    scramble_table: &ScrambleTable,
    magic_header_bytes: &[u8],
) -> VirtualProgram {
    let mut constants_table = Vec::new();
    let mut basic_blocks = Vec::new();
    let mut raw_bytecode = Vec::new();

    // Append magic header
    raw_bytecode.extend_from_slice(magic_header_bytes);

    let find_scrambled = |v_op: VirtualOpcode| -> u8 {
        scramble_table
            .entries
            .iter()
            .find(|e| e.virtual_opcode == v_op)
            .map(|e| e.scrambled_byte)
            .unwrap_or(0xAA)
    };

    // Synthesize CFF state machine with 4 basic blocks:
    // Block 0: Initialization & Integrity Check
    // Block 1: Main logic & Opcode execution
    // Block 2: Decryption / ABI Bridge
    // Block 3: Epilogue & Return

    let mut block0_insts = Vec::new();
    block0_insts.push(VirtualInstruction::new(
        VirtualOpcode::TamperSentinel,
        Some(0xCAFEBABE),
        find_scrambled(VirtualOpcode::TamperSentinel),
    ));
    block0_insts.push(VirtualInstruction::new(
        VirtualOpcode::AntiDebugCheck,
        Some(0x0001),
        find_scrambled(VirtualOpcode::AntiDebugCheck),
    ));
    block0_insts.push(VirtualInstruction::new(
        VirtualOpcode::RamDecryptChunk,
        Some(128),
        find_scrambled(VirtualOpcode::RamDecryptChunk),
    ));

    basic_blocks.push(BasicBlock {
        id: 0,
        instructions: block0_insts,
        successor_state: 0x1A4F,
    });

    // Block 1: User-level synthetic virtual instructions derived from source lines
    let mut block1_insts = Vec::new();
    constants_table.push("__pyvm_exec__".to_string());
    constants_table.push("enterprise_license_valid".to_string());

    for (i, line) in source_lines.iter().enumerate().take(12) {
        let trimmed = line.trim();
        if !trimmed.is_empty() {
            constants_table.push(trimmed.to_string());
            let const_idx = (constants_table.len() - 1) as u64;

            block1_insts.push(VirtualInstruction::new(
                VirtualOpcode::PushConst,
                Some(const_idx),
                find_scrambled(VirtualOpcode::PushConst),
            ).with_cpython_hint("LOAD_CONST"));

            if i % 2 == 0 {
                block1_insts.push(VirtualInstruction::new(
                    VirtualOpcode::StoreFast,
                    Some((i as u64) & 0xFF),
                    find_scrambled(VirtualOpcode::StoreFast),
                ).with_cpython_hint("STORE_FAST"));
            } else {
                block1_insts.push(VirtualInstruction::new(
                    VirtualOpcode::BinaryAdd,
                    None,
                    find_scrambled(VirtualOpcode::BinaryAdd),
                ).with_cpython_hint("BINARY_ADD"));
            }
        }
    }

    basic_blocks.push(BasicBlock {
        id: 1,
        instructions: block1_insts,
        successor_state: 0x2B9C,
    });

    // Block 2: CFF State Transition & Opaque Predicate
    let mut block2_insts = Vec::new();
    block2_insts.push(VirtualInstruction::new(
        VirtualOpcode::CffDispatch,
        Some(0x2B9C),
        find_scrambled(VirtualOpcode::CffDispatch),
    ));
    block2_insts.push(VirtualInstruction::new(
        VirtualOpcode::OpaqueJump,
        Some(0x00FF),
        find_scrambled(VirtualOpcode::OpaqueJump),
    ));
    block2_insts.push(VirtualInstruction::new(
        VirtualOpcode::AbiBridgeInvoke,
        Some(0x7000),
        find_scrambled(VirtualOpcode::AbiBridgeInvoke),
    ));

    basic_blocks.push(BasicBlock {
        id: 2,
        instructions: block2_insts,
        successor_state: 0x3D88,
    });

    // Block 3: Epilogue & Return Value
    let mut block3_insts = Vec::new();
    block3_insts.push(VirtualInstruction::new(
        VirtualOpcode::PushConst,
        Some(0),
        find_scrambled(VirtualOpcode::PushConst),
    ).with_cpython_hint("LOAD_CONST"));
    block3_insts.push(VirtualInstruction::new(
        VirtualOpcode::ReturnValue,
        None,
        find_scrambled(VirtualOpcode::ReturnValue),
    ).with_cpython_hint("RETURN_VALUE"));

    basic_blocks.push(BasicBlock {
        id: 3,
        instructions: block3_insts,
        successor_state: 0x0000,
    });

    // Assemble raw bytecode stream
    let mut total_insts = 0;
    for block in &basic_blocks {
        // State tag
        raw_bytecode.extend_from_slice(&block.successor_state.to_le_bytes());
        for inst in &block.instructions {
            total_insts += 1;
            raw_bytecode.push(inst.scrambled_byte);
            if let Some(op) = inst.operand {
                raw_bytecode.extend_from_slice(&(op as u32).to_le_bytes());
            } else {
                raw_bytecode.push(0x00);
            }
        }
    }

    VirtualProgram {
        magic_header: magic_header_bytes.to_vec(),
        constants_table,
        basic_blocks,
        raw_bytecode,
        cff_dispatcher_state: 0x1A4F,
        total_instructions: total_insts,
    }
}
