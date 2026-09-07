//! Virtual Bytecode Instructions and Opcode representations.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[repr(u8)]
pub enum OpcodeCategory {
    MemoryAndAddressing = 0x01,
    ArithmeticAndBitwise = 0x02,
    ControlFlowFlattening = 0x03,
    VmSyscallAndAbi = 0x04,
    StackAndSandboxing = 0x05,
    OpaquePredicate = 0x06,
    CryptoAndIntegrity = 0x07,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum VirtualOpcode {
    // Stack & Memory
    PushConst = 0x10,
    PopTop = 0x11,
    DupTop = 0x12,
    RotTwo = 0x13,
    LoadFast = 0x14,
    StoreFast = 0x15,
    LoadGlobal = 0x16,
    StoreGlobal = 0x17,
    LoadAttr = 0x18,
    StoreAttr = 0x19,

    // Arithmetic / Bitwise
    BinaryAdd = 0x20,
    BinarySub = 0x21,
    BinaryMul = 0x22,
    BinaryTrueDiv = 0x23,
    BinaryFloorDiv = 0x24,
    BinaryMod = 0x25,
    BinaryXor = 0x26,
    BinaryAnd = 0x27,
    BinaryOr = 0x28,
    BinaryLShift = 0x29,
    BinaryRShift = 0x2A,

    // Control Flow & CFF
    JumpAbsolute = 0x30,
    PopJumpIfTrue = 0x31,
    PopJumpIfFalse = 0x32,
    CffDispatch = 0x33,
    CffStateTransition = 0x34,
    OpaqueJump = 0x35,

    // Functions & Syscalls
    CallFunction = 0x40,
    MakeFunction = 0x41,
    ReturnValue = 0x42,
    VmSyscall = 0x43,
    AbiBridgeInvoke = 0x44,

    // Security & Integrity
    RamDecryptChunk = 0x50,
    TamperSentinel = 0x51,
    AntiDebugCheck = 0x52,
    CorruptMemoryTrap = 0x53,
    NoOpJunk = 0x54,
}

impl VirtualOpcode {
    pub fn category(&self) -> OpcodeCategory {
        match self {
            Self::PushConst
            | Self::PopTop
            | Self::DupTop
            | Self::RotTwo
            | Self::LoadFast
            | Self::StoreFast
            | Self::LoadGlobal
            | Self::StoreGlobal
            | Self::LoadAttr
            | Self::StoreAttr => OpcodeCategory::MemoryAndAddressing,

            Self::BinaryAdd
            | Self::BinarySub
            | Self::BinaryMul
            | Self::BinaryTrueDiv
            | Self::BinaryFloorDiv
            | Self::BinaryMod
            | Self::BinaryXor
            | Self::BinaryAnd
            | Self::BinaryOr
            | Self::BinaryLShift
            | Self::BinaryRShift => OpcodeCategory::ArithmeticAndBitwise,

            Self::JumpAbsolute
            | Self::PopJumpIfTrue
            | Self::PopJumpIfFalse
            | Self::CffDispatch
            | Self::CffStateTransition
            | Self::OpaqueJump => OpcodeCategory::ControlFlowFlattening,

            Self::CallFunction
            | Self::MakeFunction
            | Self::ReturnValue
            | Self::VmSyscall
            | Self::AbiBridgeInvoke => OpcodeCategory::VmSyscallAndAbi,

            Self::RamDecryptChunk
            | Self::TamperSentinel
            | Self::AntiDebugCheck
            | Self::CorruptMemoryTrap
            | Self::NoOpJunk => OpcodeCategory::CryptoAndIntegrity,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct VirtualInstruction {
    pub opcode: VirtualOpcode,
    pub operand: Option<u64>,
    pub scrambled_byte: u8,
    pub original_cpython_mnemonic: Option<String>,
}

impl VirtualInstruction {
    pub fn new(opcode: VirtualOpcode, operand: Option<u64>, scrambled_byte: u8) -> Self {
        Self {
            opcode,
            operand,
            scrambled_byte,
            original_cpython_mnemonic: None,
        }
    }

    pub fn with_cpython_hint(mut self, mnemonic: impl Into<String>) -> Self {
        self.original_cpython_mnemonic = Some(mnemonic.into());
        self
    }
}
