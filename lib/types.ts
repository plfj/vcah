export type SupportedPythonVersion = 
  | '3.7' 
  | '3.8' 
  | '3.9' 
  | '3.10' 
  | '3.11' 
  | '3.12' 
  | '3.13' 
  | '3.14';

export type TargetArchitecture = 
  | 'x86_64' 
  | 'aarch64' 
  | 'armv7' 
  | 'riscv64' 
  | 'i686' 
  | 's390x' 
  | 'ppc64le';

export type TargetOS = 
  | 'linux' 
  | 'windows' 
  | 'darwin' 
  | 'freebsd' 
  | 'android';

export type VmInstructionSetMode = 'stack_vm' | 'register_vm' | 'polymorphic_hybrid';

export type EntropyLevel = 'high' | 'ultra' | 'extreme_bloat';

export type CffDegree = 'standard' | 'aggressive' | 'extreme_opaque';

export interface ObfuscationConfig {
  // 4-byte custom magic number (e.g. "7F50564D")
  magicNumber: string;
  // Opcode scrambling
  opcodeScrambling: boolean;
  opcodeSeed: number;
  opcodeRemappingMode: 'dynamic_permutation' | 'crypto_hash_table' | 'polymorphic_cascade';
  // Custom Instruction Set Architecture
  vmInstructionSet: VmInstructionSetMode;
  customIsaEnabled: boolean;
  tamperVerification: boolean;
  antiDebugging: boolean;
  // Control Flow Flattening & Invariants
  heavyControlFlow: boolean;
  opaquePredicates: boolean;
  cffDegree: CffDegree;
  // Direct Bytecode Format (No Base64, No Junk Bytecode)
  directBytecodeLiteral: boolean;
  // Cross-platform & Python versions
  supportedPythonVersions: SupportedPythonVersion[];
  targetArchitectures: TargetArchitecture[];
  targetOperatingSystems: TargetOS[];
  // Rust / Native C VM Strategy
  rustVmStrategy: 'native_embedded_stub' | 'universal_polyglot_vm' | 'hybrid_dynamic_dispatch';
  // Byte Randomization & Size Scaling (up to 7 MB)
  entropyLevel: EntropyLevel;
  junkByteRatio: number;
  payloadMultiplier: number;
  targetOutputSizeMb: number; // 0 (standard compact) up to 7 (Megabytes)
  stringEncryptionKey: string;
  variableNameObfuscation: boolean;
  deadCodeInjection: boolean;

  // Obfuscation Intensity & Ultra-Stealth Parameters
  intensityLevel?: 'standard' | 'high' | 'maximum' | 'jumbo_extreme';
  hideImports?: boolean;                   // Zero 'import' statements (ultra-stealth dynamic reflection loader)
  largeBytesPayload?: boolean;             // High-volume jumbo byte stream with cryptographic padding
  opcodeRemapping?: boolean;               // Dynamic remapping of VM opcodes
  controlFlowFlattening?: boolean;         // Aegis 8-state algebraic switch dispatcher
  entropyRandomization?: boolean;          // High-entropy bitwise scattering & PRNG junk injection

  // 15 Hardened Enterprise Modules:
  // Group 1: Machine-Level Native Engine (Rust Virtual Machine Engine)
  nativeRustVirtualization: boolean;       // 01. Native Rust Virtualization (Embive / Aegis / RustPython)
  nativeCVirtualization?: boolean;         // Backward-compatible alias
  chunkedRamDecryption128B: boolean;       // 02. Dynamic 128B Chunked RAM Decryption
  masterKeystreamEncryption: boolean;      // 03. Master Keystream Encryption (32-byte polymorphic)
  polymorphicInstructionSub: boolean;      // 04. Polymorphic Instruction Substitution

  // Group 2: Control-Flow & Anti-Decompile
  machineLevelCFF: boolean;                // 05. Machine-Level CFF (Rust Aegis state machine dispatcher)
  opaquePredicatesJunk: boolean;           // 06. Opaque Predicates & Junk Code
  peStrippingSymbolErasure: boolean;       // 10. PE Stripping & Symbol Erasure

  // Group 3: Active Kernel Defense & RAM Protection
  activeKernelAntiDebug: boolean;          // 07. Active Kernel Anti-Debug (DR0-DR7, PEB BeingDebugged)
  silentMemoryCorruption: boolean;         // 08. Silent Memory Corruption on tamper
  callSiteRamScrubber: boolean;            // 11. Call-Site RAM Scrubber (locks context, anti-settrace)
  hardwareExpireLock: boolean;             // 15. Hardware Expire Lock (real hardware timestamps)

  // Group 4: AST Morphing & AI Prompt Weapons
  multiOsInMemoryContainer: boolean;       // 09. 9-Platform Multi-OS In-Memory Container
  preVmLambdaAst: boolean;                 // 12. Pre-VM Lambda AST
  fastBitwiseMangling: boolean;            // 13. Fast Bitwise Mangling
  antiAiPromptBombs: boolean;              // 14. Anti-AI Prompt Bombs (120+ AI/LLM traps)
}

export interface OpcodeMapping {
  originalOp: string;
  scrambledByte: number;
  scrambledHex: string;
  customMnemonic: string;
  description: string;
  category: 'stack' | 'arithmetic' | 'control_flow' | 'memory' | 'vm_syscall';
  standardCount?: number;
  customCount?: number;
  standardPercentage?: number;
  customPercentage?: number;
  expansionRatio?: number;
}

export interface OpcodeCategoryStats {
  category: 'stack' | 'arithmetic' | 'control_flow' | 'memory' | 'vm_syscall';
  label: string;
  standardCount: number;
  customCount: number;
  standardPercentage: number;
  customPercentage: number;
  expansionRatio: number;
}

export interface OpcodeComparisonItem {
  originalOp: string;
  scrambledByte: number;
  scrambledHex: string;
  customMnemonic: string;
  description: string;
  category: 'stack' | 'arithmetic' | 'control_flow' | 'memory' | 'vm_syscall';
  standardCount: number;
  customCount: number;
  standardPercentage: number;
  customPercentage: number;
  expansionRatio: number;
  deltaPercentage: number;
}

export interface OpcodeFrequencyStats {
  standardTotalCount: number;
  customTotalCount: number;
  virtualizationExpansionRatio: number;
  substitutionRate: number; // 100%
  divergenceIndex: number;  // Statistical divergence percentage (0-100%)
  categoryBreakdown: OpcodeCategoryStats[];
  comparisons: OpcodeComparisonItem[];
}

export interface ObfuscationResult {
  obfuscatedCode: string;
  fileName: string;
  stats: {
    originalSizeBytes: number;
    obfuscatedSizeBytes: number;
    sizeExpansionRatio: number;
    shannonEntropy: number; // Max 8.0
    magicBytesHex: string;
    magicBytesAscii: string;
    totalOpcodeCount: number;
    remappedOpcodeCount: number;
    junkBytesInjected: number;
    isDirectBytecode: boolean;
    controlFlowBlocks: number;
    opaquePredicatesCount: number;
    generationTimeMs: number;
    chunkCount?: number;
    supportedPyVersions: SupportedPythonVersion[];
    supportedArchitectures: TargetArchitecture[];
    supportedOperatingSystems: TargetOS[];
  };
  opcodeMappings: OpcodeMapping[];
  opcodeFrequencyStats?: OpcodeFrequencyStats;
  byteDistribution: { bucket: string; count: number; entropyContribution: number }[];
  securityAudit: {
    decompilerResistanceScore: number; // 0 - 100
    antiTamperScore: number;
    staticAnalysisResistance: number;
    vmOverheadRating: 'Ultra Low' | 'Moderate' | 'Heavy Duty';
    supportedMatrixCoverage: string;
    diagnostics: string[];
  };
}

export interface ExecutionLog {
  timestamp: string;
  type: 'stdout' | 'stderr' | 'vm_debug' | 'system';
  message: string;
}

export interface PresetProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  config: Partial<ObfuscationConfig>;
}
