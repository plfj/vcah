//! rust_vm_core - Deterministic zero-allocation Rust Native Virtual Machine
//! and Python Bytecode Obfuscation Compute Nucleus.

pub mod ffi;
pub mod kernel;
pub mod pipeline;
pub mod primitives;

pub use ffi::*;
pub use kernel::*;
pub use pipeline::*;
pub use primitives::*;
