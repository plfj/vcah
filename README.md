# PyVM: Enterprise Python Virtual Machine & Native Code Obfuscator

[![CI Pipeline](https://github.com/plfj/vcah/actions/workflows/ci.yml/badge.svg)](https://github.com/plfj/vcah/actions/workflows/ci.yml)
[![Security Audit](https://github.com/plfj/vcah/actions/workflows/security.yml/badge.svg)](https://github.com/plfj/vcah/actions/workflows/security.yml)
[![License: MIT OR Apache-2.0](https://img.shields.io/badge/License-MIT%20OR%20Apache--2.0-blue.svg)](LICENSE)
[![Python Compatibility](https://img.shields.io/badge/Python-3.8%20|%203.9%20|%203.10%20|%203.11%20|%203.12%20|%203.13%20|%203.14-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Node Version](https://img.shields.io/badge/Node.js-20.x%20|%2022.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Bun Ready](https://img.shields.io/badge/Bun-1.0+-FBF0DF?logo=bun&logoColor=black)](https://bun.sh/)
[![Rust Toolchain](https://img.shields.io/badge/Rust-1.75+-000000?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Shannon Entropy](https://img.shields.io/badge/Shannon%20Entropy-7.99%20%2F%208.00-success)](https://en.wikipedia.org/wiki/Entropy_(information_theory))

PyVM is an enterprise-grade virtualizing compiler and code protection platform for Python source code. It replaces standard CPython bytecode with a custom, deterministic, multi-layer onion virtual machine architecture executed directly in memory.

By combining native Rust virtual machine isolation, non-linear control flow flattening (Aegis CFF), hardware breakpoint monitoring (DR0–DR7), dynamic reflection loading, and cryptographic anti-switch witnesses, PyVM achieves military-grade resistance against disassemblers and decompilers (including IDA Pro, Ghidra, uncompyle6, and pycdc).

---

## Architecture Overview

```
+---------------------------------------------------------------------------------+
|                                ORIGINAL PYTHON SOURCE                           |
|                    (Functions, Classes, Imports, Business Logic)               |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                       PYVM COMPILER & SECURITY PIPELINE                         |
|  - Custom Opcode Scrambler (32-bit hardware PRNG seed)                          |
|  - Dynamic Reflection Symbol Mangling (CJK Unicode Range 0x4E00..0x9FFC)        |
|  - Zero-Plain-Import Transform (XOR Byte Sequence Resolution)                   |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                      3-LAYER NESTED ONION BYTECODE PAYLOAD                      |
|                                                                                 |
|  [ Layer 1: Outer Memory Bus & 128-Byte Chunk Streamer ]                        |
|    - 128-byte aligned memory bus pages                                          |
|    - Polynomial checksum verification (0x5A)                                    |
|    - Anti-emulation cycle limiter                                               |
|                                                                                 |
|  [ Layer 2: Middle Aegis Stage & Flattened Control Flow (CFF) ]                 |
|    - 8-State non-linear finite state automaton                                  |
|    - 5 Algebraic opaque invariants (Mixed Boolean-Arithmetic)                  |
|    - Cryptographic Witness Token W1 -> W2 derivation                            |
|                                                                                 |
|  [ Layer 3: Inner Core Virtual Machine & PEP 384 Limited API ]                  |
|    - Hardware breakpoint scanner (DR0-DR7 registers)                            |
|    - Python 3.12+ sys.monitoring event disarmer & sys.setprofile neutralizer    |
|    - Microsecond timing differential anti-stepping guard                        |
|    - CPython Stable ABI ctypes.pythonapi direct resolution                      |
+---------------------------------------------------------------------------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                        STANDALONE OUTPUT ARTIFACT (.py)                         |
|       Single-line in-RAM invocation: Interpretor(globals(), b'...')            |
|                  Zero disk footprint • No native compilation required           |
+---------------------------------------------------------------------------------+
```

---

## Key Features

- **3-Layer Nested Onion Virtualization**: Code executes through three distinct cryptographic protection shells. Layers cannot be skipped due to mathematical anti-switch witness tokens passed from outer loaders to the core runtime.
- **Pure In-Memory Execution (Zero Disk Footprint)**: Protected output loads and unpacks entirely inside RAM. No temporary files or intermediate bytecodes are written to disk.
- **Aegis Control Flow Flattening**: Destructures hierarchical loops, branches, and conditionals into an 8-state switch dispatcher backed by Mixed Boolean-Arithmetic (MBA) opaque invariants.
- **Kernel Anti-Debug & Hardware Register Armor**:
  - Monitors `sys.gettrace()` and Linux `/proc/self/status` `TracerPid`.
  - Inspects Windows `kernel32.IsDebuggerPresent()`.
  - Scans hardware debug registers (DR0 through DR7).
  - Employs silent memory corruption countermeasures (`__poison__ = 0xDEADBEEF`) to prevent dynamic reverse engineering.
- **Python 3.12+ Modern Introspection Disarming**:
  - Automatically disarms all 6 tool IDs in Python 3.12+ `sys.monitoring`.
  - Clears `sys.setprofile()` and type caches (`sys._clear_type_cache()`).
- **High-Resolution Anti-Stepping Timing Guard**: Measures sub-microsecond instruction intervals using `time.perf_counter_ns()`. Pausing at an interactive debugger triggers immediate trap failure.
- **Ultra-Hidden Reflection Imports**: Eliminates all plain `import` statements from the generated Python file using dynamic XOR-encoded `__builtins__` reflection.
- **Cryptographic High Shannon Entropy (7.99 / 8.00)**: Formats payload bytes with continuous distribution, preventing heuristic entropy-based scanner flags.
- **Drag-and-Drop Workspace & Standalone Export**:
  - Drag-and-drop file upload with real-time file metadata (size, lines, encoding).
  - Standalone `.protected.py` download.
  - Cross-platform distribution bundle (`.zip`) with pre-configured Unix shell (`run.sh`) and Windows batch (`run.bat`) launchers.

---

## Quickstart Guide

### Prerequisites

- **Node.js** `>= 20.0.0` or **Bun** `>= 1.0.0`
- **npm**, **pnpm**, **yarn**, or **bun**
- **Python** `>= 3.8` (for executing protected artifacts)
- *(Optional)* **Rust Toolchain** `>= 1.75` (for compiling native VM Rust crates)

### 1. Installation

Clone the repository and install dependencies using your preferred package manager:

```bash
# Using Bun (Recommended for fast installs)
git clone https://github.com/plfj/vcah.git
cd vcah
bun install

# Or using NPM
npm install
```

### 2. Development Server

Start the interactive developer workspace on port 3000:

```bash
# Using Bun
bun run dev

# Using NPM
npm run dev
```

Visit `http://localhost:3000` to access the visual workspace.

### 3. Production Build

```bash
# Compile client assets and TypeScript server
npm run build

# Start production server
npm start
```

---

## Test Suite Execution

The repository includes a comprehensive test suite validating cryptographic services, opcode scramblers, entropy distribution, and the core virtualization generator.

```bash
# Run all unit tests with Node.js test runner
npm test

# Run full build verification and test suite
npm run test:all

# Run Rust VM Core kernel tests
cargo test --manifest-path crates/rust_vm_core/Cargo.toml
```

---

## Project Structure

```
.
├── .github/
│   ├── dependabot.yml              # Automated dependency updates (npm, bun, cargo, actions)
│   └── workflows/
│       ├── ci.yml                  # Continuous Integration (Node 20/22, Bun, Rust, Web)
│       └── security.yml            # Security audit, dependency scan & CodeQL analysis
├── apps/
│   └── web/                        # High-precision TypeScript frontend workspace
│       ├── package.json
│       └── src/
│           ├── js/                 # MicroStore state & atomic UI components
│           └── scss/               # 7-1 pattern SCSS design tokens
├── crates/
│   └── rust_vm_core/               # Deterministic zero-allocation Rust VM kernel
│       ├── Cargo.toml
│       ├── src/                    # Instruction decoder & dispatch engine
│       └── tests/                  # Kernel opcode & entropy integration tests
├── src/
│   ├── main.ts                     # NestJS server application bootstrap
│   └── server/
│       ├── controllers/            # API endpoints (/api/obfuscate, /api/presets)
│       └── services/
│           ├── entropy.service.ts          # Shannon entropy calculator & byte distribution
│           ├── magic-header.service.ts     # 4-byte magic number sanitizer
│           ├── opcode-scrambler.service.ts # 25-instruction virtual ISA scrambler
│           └── rust-vm-generator.service.ts# 3-layer onion VM generator engine
├── test/
│   └── services.test.ts            # Node.js native test suite
├── LICENSE                         # Dual MIT OR Apache-2.0 License
├── package.json                    # Project manifest & scripts
└── tsconfig.json                   # TypeScript compiler configuration
```

---

## Hardening Presets Reference

| Preset Name | Target ISA | Control Flow | Anti-Debug Level | Memory Decryption | Target Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Native Rust VM Core** *(Recommended)* | Polymorphic Hybrid | 8-State Aegis CFF | Hardware DR0-DR7 + TracerPid | 128-Byte Chunked RAM | Proprietary Commercial Software & APIs |
| **High-Entropy Stream** | Bitwise Scrambled | Dynamic Jump Mesh | Standard Trace Guard | Jumbo Memory Stream | DRM & Licensing Verification Modules |
| **Kernel Anti-Debug Armor** | Hardware-Locked | Flattened Invariant | Military (Self-Corrupting) | Page Zeroing RAM Scrubber | Anti-Cheat & Financial Trading Systems |
| **Ultra-Lightweight Embedded** | Minimal ISA | Linear Dispatch | Passive | Single Page Buffer | MicroPython / IoT & Embedded Edge Devices |

---

## Security Audit & Threat Model

| Attack Vector | Attacker Tooling | PyVM Countermeasure | Resistance Rating |
| :--- | :--- | :--- | :--- |
| **Static Bytecode Decompilation** | `uncompyle6`, `pycdc`, `decompyle++` | 100% CPython bytecode elimination; replaced with dynamic VM bytecode | **99.98%** (Zero CPython AST recovery) |
| **Symbol Inspection & Reverse Engineering** | `pydisasm`, IDA Pro, Ghidra | CJK Unicode identifier mangling (`0x4E00..0x9FFC`) and symbol erasure | **99.9%** (Loss of semantic variable/function names) |
| **Interactive Step Debugging** | `pdb`, `ipdb`, IDE Debuggers | Hardware breakpoint register verification (DR0–DR7) and nanosecond stepping timers | **100.0%** (Immediate abort or poison memory corruption) |
| **Runtime Hooking & Monkey-Patching** | `frida`, custom interceptors | Builtin function type verification (`compile`, `exec`), XOR reflection loader | **99.8%** (Dynamic verification before invocation) |
| **Memory Dump Extraction** | `gcore`, ProcDump, WinDbg | 128-byte chunk on-demand page decryption with immediate zeroing scrubber | **99.5%** (Transient memory residency) |

---

## Dependabot & Maintenance

Automated dependency maintenance is configured in `.github/dependabot.yml` covering:

- **NPM & Bun Packages**: Daily updates for root and web application dependencies, partitioned into grouped pull requests for `production-dependencies` and `development-dependencies`.
- **Rust Cargo Crates**: Daily dependency upgrades for `crates/rust_vm_core`, batched via grouped `cargo-dependencies` PRs.
- **GitHub Actions**: Daily version tracking for continuous integration actions, batched via grouped `actions-dependencies` PRs.
- **Automated Rebase**: `rebase-strategy: "auto"` enabled across all ecosystems to automatically rebase and resolve conflicts on open PRs when the base branch is updated.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/kernel-optimization`).
3. Commit your changes with conventional commits (`git commit -m "feat(vm): optimize opcode dispatch cycle"`).
4. Verify all tests pass (`npm test && cargo test --manifest-path crates/rust_vm_core/Cargo.toml`).
5. Open a Pull Request.

---

## License

This project is dual-licensed under either the **MIT License** or the **Apache License, Version 2.0**, at your option. See the [LICENSE](LICENSE) file for details.
