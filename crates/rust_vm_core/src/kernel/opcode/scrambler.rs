//! Pure Opcode Permutation and Scrambler Kernel.
//! Builds a bijective 1:1 mapping from CPython canonical opcodes to randomized custom ISA opcodes.

use crate::primitives::instruction::{OpcodeCategory, VirtualOpcode};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ScrambledOpcodeEntry {
    pub cpython_name: String,
    pub original_byte: u8,
    pub scrambled_byte: u8,
    pub category: OpcodeCategory,
    pub virtual_opcode: VirtualOpcode,
    pub defense_mechanism: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ScrambleTable {
    pub seed: u64,
    pub entries: Vec<ScrambledOpcodeEntry>,
    pub reverse_lookup: Vec<u8>, // index by scrambled_byte -> original_byte
}

pub fn generate_scramble_table(seed: u64) -> ScrambleTable {
    let canonical_definitions: &[(VirtualOpcode, &str, u8, &str)] = &[
        (VirtualOpcode::PushConst, "LOAD_CONST", 100, "Constant Table Virtual Pointer Indirection"),
        (VirtualOpcode::PopTop, "POP_TOP", 1, "Stack Top Disposal with Memory Scrubber"),
        (VirtualOpcode::DupTop, "DUP_TOP", 4, "Register Mirroring & Clone Verification"),
        (VirtualOpcode::RotTwo, "ROT_TWO", 2, "XOR-based Swap Permutation"),
        (VirtualOpcode::LoadFast, "LOAD_FAST", 124, "Encrypted Local Frame Register Offset"),
        (VirtualOpcode::StoreFast, "STORE_FAST", 125, "Encrypted Frame Write with Trap Canary"),
        (VirtualOpcode::LoadGlobal, "LOAD_GLOBAL", 116, "Global Name Lookup via Hash Inversion"),
        (VirtualOpcode::StoreGlobal, "STORE_GLOBAL", 97, "Global Namespace Encrypted Mutex"),
        (VirtualOpcode::LoadAttr, "LOAD_ATTR", 106, "Polymorphic V-Table Dynamic Dispatch"),
        (VirtualOpcode::StoreAttr, "STORE_ATTR", 95, "Attribute Write Invariant Assertion"),
        (VirtualOpcode::BinaryAdd, "BINARY_ADD", 23, "Bitwise Add via Carry-Save Multiplexer"),
        (VirtualOpcode::BinarySub, "BINARY_SUB", 24, "Two's Complement Subtract with Trap Invariant"),
        (VirtualOpcode::BinaryMul, "BINARY_MULTIPLY", 20, "Booth Multiplication Algorithm Emulation"),
        (VirtualOpcode::BinaryTrueDiv, "BINARY_TRUE_DIVIDE", 27, "Safe Division by Zero Hardware Trap"),
        (VirtualOpcode::BinaryFloorDiv, "BINARY_FLOOR_DIVIDE", 26, "Integer Floor Trap with Rounding Guard"),
        (VirtualOpcode::BinaryMod, "BINARY_MODULO", 22, "Barrett Reduction Modulo Core"),
        (VirtualOpcode::BinaryXor, "BINARY_XOR", 65, "Zero-Knowledge Obfuscated XOR"),
        (VirtualOpcode::BinaryAnd, "BINARY_AND", 64, "Bitwise AND with Mask Verification"),
        (VirtualOpcode::BinaryOr, "BINARY_OR", 66, "De Morgan's Equivalent Gate Synthesis"),
        (VirtualOpcode::BinaryLShift, "BINARY_LSHIFT", 62, "Barrel Shifter with Overflow Sanitization"),
        (VirtualOpcode::BinaryRShift, "BINARY_RSHIFT", 63, "Arithmetic Right Shift Invariant Check"),
        (VirtualOpcode::JumpAbsolute, "JUMP_ABSOLUTE", 113, "Control Flow Flattening Central Switch"),
        (VirtualOpcode::PopJumpIfTrue, "POP_JUMP_IF_TRUE", 115, "Opaque Predicate Conditional Bifurcation"),
        (VirtualOpcode::PopJumpIfFalse, "POP_JUMP_IF_FALSE", 114, "Opaque Predicate Dead-Path Branching"),
        (VirtualOpcode::CffDispatch, "CFF_DISPATCH", 240, "Flattened State-Machine Trampoline"),
        (VirtualOpcode::CffStateTransition, "CFF_TRANSITION", 241, "Affine Next-State Transformation"),
        (VirtualOpcode::OpaqueJump, "OPAQUE_JUMP", 242, "Always-True / Always-False Dead Code Trap"),
        (VirtualOpcode::CallFunction, "CALL_FUNCTION", 131, "Native ABI Sandbox Bridge Trampoline"),
        (VirtualOpcode::MakeFunction, "MAKE_FUNCTION", 132, "Code Object Decryption On-The-Fly"),
        (VirtualOpcode::ReturnValue, "RETURN_VALUE", 83, "Stack Cleanup & Zero-Fill Epilogue"),
        (VirtualOpcode::VmSyscall, "VM_SYSCALL", 250, "Rust Core Native Direct Interop"),
        (VirtualOpcode::AbiBridgeInvoke, "ABI_BRIDGE", 251, "C-Python Dynamic Module Linker Hook"),
        (VirtualOpcode::RamDecryptChunk, "RAM_DECRYPT_128B", 252, "Page Fault AES-128-CTR JIT Decryption"),
        (VirtualOpcode::TamperSentinel, "TAMPER_SENTINEL", 253, "SHA-256 Code Hash Verification Invariant"),
        (VirtualOpcode::AntiDebugCheck, "ANTI_DEBUG_PROBE", 254, "Kernel / PTRACE / PEB Breakpoint Probe"),
        (VirtualOpcode::CorruptMemoryTrap, "CORRUPT_MEM_TRAP", 255, "Hard Crash Segment Trigger"),
    ];

    // Build deterministic permutation vector for bytes 1..=255
    let mut perm: Vec<u8> = (1..=255).collect();
    let mut current_seed = seed;
    // Fisher-Yates with LCG
    for i in (1..perm.len()).rev() {
        current_seed = current_seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        let j = (current_seed as usize) % (i + 1);
        perm.swap(i, j);
    }

    let mut entries = Vec::with_capacity(canonical_definitions.len());
    let mut reverse_lookup = vec![0u8; 256];

    for (idx, &(v_op, name, orig_byte, defense)) in canonical_definitions.iter().enumerate() {
        let scrambled_byte = perm[idx];
        reverse_lookup[scrambled_byte as usize] = orig_byte;

        entries.push(ScrambledOpcodeEntry {
            cpython_name: name.to_string(),
            original_byte: orig_byte,
            scrambled_byte,
            category: v_op.category(),
            virtual_opcode: v_op,
            defense_mechanism: defense.to_string(),
        });
    }

    ScrambleTable {
        seed,
        entries,
        reverse_lookup,
    }
}
