import {
  OpcodeMapping,
  VmInstructionSetMode,
  ObfuscationConfig,
  OpcodeFrequencyStats,
  OpcodeCategoryStats,
  OpcodeComparisonItem,
} from '@/lib/types';

export interface BaseInstruction {
  id: string;
  name: string;
  category: 'stack' | 'arithmetic' | 'control_flow' | 'memory' | 'vm_syscall';
  description: string;
}

export const BASE_VIRTUAL_INSTRUCTIONS: BaseInstruction[] = [
  { id: 'LOAD_CONST', name: 'VOP_LOAD_CONST', category: 'memory', description: 'Pushes constant value onto virtual operand stack' },
  { id: 'STORE_NAME', name: 'VOP_STORE_NAME', category: 'memory', description: 'Stores top of stack into virtual frame symbol table' },
  { id: 'LOAD_NAME', name: 'VOP_LOAD_NAME', category: 'memory', description: 'Pushes named variable reference from local/global context' },
  { id: 'LOAD_GLOBAL', name: 'VOP_LOAD_GLOBAL', category: 'memory', description: 'Resolves built-in or module-level global identifier' },
  { id: 'BINARY_ADD', name: 'VOP_BINARY_ADD', category: 'arithmetic', description: 'Pops 2 operands, adds/concatenates, pushes result' },
  { id: 'BINARY_SUB', name: 'VOP_BINARY_SUB', category: 'arithmetic', description: 'Pops 2 operands, subtracts, pushes result' },
  { id: 'BINARY_MUL', name: 'VOP_BINARY_MUL', category: 'arithmetic', description: 'Pops 2 operands, multiplies, pushes result' },
  { id: 'BINARY_DIV', name: 'VOP_BINARY_DIV', category: 'arithmetic', description: 'Pops 2 operands, true floating division' },
  { id: 'BINARY_MOD', name: 'VOP_BINARY_MOD', category: 'arithmetic', description: 'Modulo remainder calculation' },
  { id: 'BINARY_XOR', name: 'VOP_BINARY_XOR', category: 'arithmetic', description: 'Bitwise polymorphic XOR operation' },
  { id: 'COMPARE_OP', name: 'VOP_COMPARE_OP', category: 'control_flow', description: 'Evaluates relational equality / inequality / ordering' },
  { id: 'JUMP_FORWARD', name: 'VOP_JUMP_FWD', category: 'control_flow', description: 'Unconditional instruction pointer displacement' },
  { id: 'POP_JUMP_IF_FALSE', name: 'VOP_BRANCH_FALSE', category: 'control_flow', description: 'Conditional branch when condition is falsy' },
  { id: 'POP_JUMP_IF_TRUE', name: 'VOP_BRANCH_TRUE', category: 'control_flow', description: 'Conditional branch when condition is truthy' },
  { id: 'CALL_FUNCTION', name: 'VOP_CALL_FUNC', category: 'vm_syscall', description: 'Virtual call frame dispatch with variadic arguments' },
  { id: 'RETURN_VALUE', name: 'VOP_RETURN_VAL', category: 'control_flow', description: 'Unwinds call frame and returns top of stack' },
  { id: 'BUILD_LIST', name: 'VOP_BUILD_LIST', category: 'memory', description: 'Allocates dynamic Python list from stack slice' },
  { id: 'BUILD_MAP', name: 'VOP_BUILD_DICT', category: 'memory', description: 'Allocates hash table key-value dictionary' },
  { id: 'IMPORT_NAME', name: 'VOP_IMPORT_MOD', category: 'vm_syscall', description: 'Dynamic module resolution via secure VM import table' },
  { id: 'IMPORT_FROM', name: 'VOP_IMPORT_ATTR', category: 'vm_syscall', description: 'Attribute extraction from imported module namespace' },
  { id: 'POLY_DECRYPT_STR', name: 'VOP_POLY_DECRYPT', category: 'vm_syscall', description: 'On-demand dynamic decryption of obfuscated string table' },
  { id: 'INTEGRITY_GUARD', name: 'VOP_TAMPER_GUARD', category: 'vm_syscall', description: 'Runtime SHA256 integrity watchdog & magic header validator' },
  { id: 'JUNK_NOP_DISPATCH', name: 'VOP_JUNK_NOP', category: 'stack', description: 'Opaque dead-code instruction designed to derail static decompilers' },
  { id: 'FRAME_ENTER', name: 'VOP_FRAME_ENTER', category: 'stack', description: 'Pushes execution context frame with register shadow mapping' },
  { id: 'FRAME_LEAVE', name: 'VOP_FRAME_LEAVE', category: 'stack', description: 'Pops execution context and clears local registers' },
];

export class OpcodeScramblerService {
  /**
   * Generates a deterministic or seeded shuffled opcode table
   */
  public static generateScrambledOpcodeTable(
    seed: number,
    mode: VmInstructionSetMode,
    isScrambled: boolean
  ): { mappings: OpcodeMapping[]; opcodeTableDict: Record<string, number>; reverseTableDict: Record<number, string> } {
    // Generate distinct randomized byte IDs (0x01 to 0xFE)
    const availableBytes: number[] = [];
    for (let b = 1; b <= 254; b++) {
      // avoid NULL byte 0x00 for string security
      availableBytes.push(b);
    }

    // Seeded Linear Congruential Generator for deterministic shuffling
    let currentSeed = seed || 428937;
    const nextRandom = () => {
      currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
      return currentSeed / 4294967296;
    };

    // Fisher-Yates shuffle with seed
    for (let i = availableBytes.length - 1; i > 0; i--) {
      const j = Math.floor(nextRandom() * (i + 1));
      [availableBytes[i], availableBytes[j]] = [availableBytes[j], availableBytes[i]];
    }

    const mappings: OpcodeMapping[] = [];
    const opcodeTableDict: Record<string, number> = {};
    const reverseTableDict: Record<number, string> = {};

    BASE_VIRTUAL_INSTRUCTIONS.forEach((inst, index) => {
      let assignedByte: number;
      if (isScrambled) {
        assignedByte = availableBytes[index];
      } else {
        assignedByte = index + 10;
      }

      // Generate custom mnemonic prefix based on ISA mode
      let customMnemonic = inst.name;
      if (mode === 'register_vm') {
        customMnemonic = inst.name.replace('VOP_', 'RVM_');
      } else if (mode === 'polymorphic_hybrid') {
        customMnemonic = inst.name.replace('VOP_', 'POLY_');
      }

      const hex = '0x' + assignedByte.toString(16).toUpperCase().padStart(2, '0');
      
      const mapping: OpcodeMapping = {
        originalOp: inst.id,
        scrambledByte: assignedByte,
        scrambledHex: hex,
        customMnemonic,
        description: inst.description,
        category: inst.category,
      };

      mappings.push(mapping);
      opcodeTableDict[inst.id] = assignedByte;
      reverseTableDict[assignedByte] = inst.id;
    });

    return { mappings, opcodeTableDict, reverseTableDict };
  }

  /**
   * Calculates comprehensive statistical breakdown of standard Python bytecode instructions
   * versus custom virtualized opcode frequency cycles in the 3-Layer Onion Virtual Machine.
   */
  public static calculateOpcodeFrequencyStats(
    sourceCode: string,
    config: ObfuscationConfig,
    baseMappings: OpcodeMapping[],
    chunkCount: number = 4
  ): OpcodeFrequencyStats & { mappings: OpcodeMapping[] } {
    const code = sourceCode || '';

    // Standard Python Bytecode pattern counters
    // 1. Strings (single, double, triple-quoted)
    const stringMatches = code.match(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g) || [];
    // 2. Numbers (decimal, float, hex)
    const numberMatches = code.match(/\b(0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/g) || [];
    // 3. Booleans and None
    const boolMatches = code.match(/\b(True|False|None)\b/g) || [];
    const totalConstants = Math.max(2, stringMatches.length + numberMatches.length + boolMatches.length + 1);

    // 4. Assignments (STORE_NAME / STORE_FAST)
    const assignmentMatches = code.match(/\b([a-zA-Z_]\w*)\s*=(?!=)/g) || [];
    const defMatches = code.match(/\bdef\s+([a-zA-Z_]\w*)\b/g) || [];
    const totalStores = Math.max(1, assignmentMatches.length + defMatches.length);

    // 5. Variable Reads (LOAD_NAME / LOAD_FAST)
    const allWordTokens = code.match(/\b[a-zA-Z_]\w*\b/g) || [];
    const pyKeywords = new Set([
      'def', 'return', 'if', 'elif', 'else', 'while', 'for', 'in', 'is', 'not', 'and', 'or',
      'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'class', 'pass', 'break',
      'continue', 'lambda', 'global', 'nonlocal', 'assert', 'raise', 'yield', 'True', 'False', 'None'
    ]);
    const varReads = allWordTokens.filter((t) => !pyKeywords.has(t)).length;
    const totalLoads = Math.max(2, varReads - totalStores);

    // 6. Built-in global identifiers (LOAD_GLOBAL)
    const builtins = new Set([
      'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set', 'tuple',
      'open', 'type', 'isinstance', 'enumerate', 'zip', 'sum', 'min', 'max', 'any', 'all',
      'abs', 'round', 'map', 'filter', 'sorted', 'reversed', 'repr', 'Exception', 'ValueError'
    ]);
    const builtinMatches = allWordTokens.filter((t) => builtins.has(t)).length;
    const totalGlobals = Math.max(1, builtinMatches + (code.includes('print') ? 2 : 1));

    // 7. Math & Bitwise Operators
    const addMatches = (code.match(/\+/g) || []).length;
    const subMatches = (code.match(/(?<![a-zA-Z0-9_])-(?![->])/g) || []).length;
    const mulMatches = (code.match(/(?<!\*)\*(?!\*)/g) || []).length;
    const divMatches = (code.match(/\//g) || []).length;
    const modMatches = (code.match(/%/g) || []).length;
    const xorMatches = (code.match(/\^/g) || []).length;

    // 8. Comparisons
    const compareMatches = (code.match(/(==|!=|<=|>=|<(?!<)|>(?!>)|(?<=\s)in(?=\s)|(?<=\s)is(?=\s))/g) || []).length;

    // 9. Branches & Jumps
    const ifMatches = (code.match(/\b(if|elif)\b/g) || []).length;
    const loopMatches = (code.match(/\b(for|while)\b/g) || []).length;

    // 10. Calls & Returns
    const callMatches = (code.match(/\b[a-zA-Z_]\w*\s*\(/g) || []).length;
    const returnMatches = (code.match(/\breturn\b/g) || []).length;

    // 11. Collections
    const listMatches = (code.match(/\[[^\]]*\]/g) || []).length;
    const dictMatches = (code.match(/\{[^}]*:[^}]*\}/g) || []).length;

    // 12. Imports
    const importNameMatches = (code.match(/\bimport\s+([a-zA-Z_]\w*)/g) || []).length;
    const importFromMatches = (code.match(/\bfrom\s+([a-zA-Z_]\w*)\s+import/g) || []).length;

    // Standard counts per CPython instruction
    const standardCounts: Record<string, number> = {
      LOAD_CONST: totalConstants,
      STORE_NAME: totalStores,
      LOAD_NAME: totalLoads,
      LOAD_GLOBAL: totalGlobals,
      BINARY_ADD: Math.max(1, addMatches),
      BINARY_SUB: Math.max(0, subMatches),
      BINARY_MUL: Math.max(0, mulMatches),
      BINARY_DIV: Math.max(0, divMatches),
      BINARY_MOD: Math.max(0, modMatches),
      BINARY_XOR: Math.max(0, xorMatches),
      COMPARE_OP: Math.max(0, compareMatches),
      JUMP_FORWARD: Math.max(1, loopMatches + 1),
      POP_JUMP_IF_FALSE: Math.max(0, ifMatches),
      POP_JUMP_IF_TRUE: Math.max(0, Math.floor(ifMatches * 0.3)),
      CALL_FUNCTION: Math.max(1, callMatches),
      RETURN_VALUE: Math.max(1, returnMatches || 1),
      BUILD_LIST: listMatches,
      BUILD_MAP: dictMatches,
      IMPORT_NAME: importNameMatches,
      IMPORT_FROM: importFromMatches,
      POLY_DECRYPT_STR: 0, // VM specific: zero in raw standard bytecode
      INTEGRITY_GUARD: 0,  // VM specific: zero in raw standard bytecode
      JUNK_NOP_DISPATCH: 0,// VM specific: zero in raw standard bytecode
      FRAME_ENTER: 0,      // VM specific: zero in raw standard bytecode
      FRAME_LEAVE: 0,      // VM specific: zero in raw standard bytecode
    };

    // Calculate custom virtual opcode counts based on CFF, RAM decryption, and ISA virtualization
    const cffFactor = config.cffDegree === 'extreme_opaque' ? 5.2 : config.cffDegree === 'aggressive' ? 3.8 : 2.5;
    const customCounts: Record<string, number> = {
      LOAD_CONST: Math.round(standardCounts.LOAD_CONST * 2.8 + chunkCount * 2 + 4),
      STORE_NAME: Math.round(standardCounts.STORE_NAME * 2.2 + 5),
      LOAD_NAME: Math.round(standardCounts.LOAD_NAME * 2.4 + 6),
      LOAD_GLOBAL: Math.round(standardCounts.LOAD_GLOBAL * 2.5 + 4),
      BINARY_ADD: Math.round(standardCounts.BINARY_ADD * 3.4 + 7),
      BINARY_SUB: Math.round(standardCounts.BINARY_SUB * 2.6 + (config.heavyControlFlow ? 5 : 2)),
      BINARY_MUL: Math.round(standardCounts.BINARY_MUL * 2.5 + (config.opaquePredicates ? 6 : 2)),
      BINARY_DIV: Math.round(standardCounts.BINARY_DIV * 2.0 + 2),
      BINARY_MOD: Math.round(standardCounts.BINARY_MOD * 2.4 + 3),
      BINARY_XOR: Math.round(standardCounts.BINARY_XOR * 4.0 + 14), // Keystream XOR operations
      COMPARE_OP: Math.round(standardCounts.COMPARE_OP * cffFactor + 16), // CFF state invariants
      JUMP_FORWARD: Math.round(standardCounts.JUMP_FORWARD * cffFactor + 22), // Flattened loop transitions
      POP_JUMP_IF_FALSE: Math.round(standardCounts.POP_JUMP_IF_FALSE * cffFactor + 12),
      POP_JUMP_IF_TRUE: Math.round(standardCounts.POP_JUMP_IF_TRUE * (cffFactor * 0.8) + 8),
      CALL_FUNCTION: Math.round(standardCounts.CALL_FUNCTION * 2.6 + 6),
      RETURN_VALUE: Math.round(standardCounts.RETURN_VALUE * 2.0 + 4),
      BUILD_LIST: Math.round(standardCounts.BUILD_LIST * 2.2 + 4),
      BUILD_MAP: Math.round(standardCounts.BUILD_MAP * 2.0 + 3),
      IMPORT_NAME: Math.round(standardCounts.IMPORT_NAME * 2.0 + 4),
      IMPORT_FROM: Math.round(standardCounts.IMPORT_FROM * 2.0 + 5),
      POLY_DECRYPT_STR: Math.max(8, Math.round(totalConstants * 2.2 + 10)),
      INTEGRITY_GUARD: config.activeKernelAntiDebug ? 20 : 12,
      JUNK_NOP_DISPATCH: config.deadCodeInjection || config.opaquePredicatesJunk ? 24 : 14,
      FRAME_ENTER: 8,
      FRAME_LEAVE: 8,
    };

    const standardTotalCount = Object.values(standardCounts).reduce((a, b) => a + b, 0);
    const customTotalCount = Object.values(customCounts).reduce((a, b) => a + b, 0);
    const virtualizationExpansionRatio = Number((customTotalCount / Math.max(1, standardTotalCount)).toFixed(2));

    const updatedMappings: OpcodeMapping[] = [];
    const comparisons: OpcodeComparisonItem[] = [];

    let totalVariationSum = 0;

    baseMappings.forEach((map) => {
      const stdCount = standardCounts[map.originalOp] ?? 0;
      const custCount = customCounts[map.originalOp] ?? 0;
      const stdPct = Number(((stdCount / standardTotalCount) * 100).toFixed(1));
      const custPct = Number(((custCount / customTotalCount) * 100).toFixed(1));
      const ratio = Number((custCount / Math.max(1, stdCount)).toFixed(1));
      const deltaPct = Number((custPct - stdPct).toFixed(1));

      totalVariationSum += Math.abs(custPct - stdPct);

      const enhancedMap: OpcodeMapping = {
        ...map,
        standardCount: stdCount,
        customCount: custCount,
        standardPercentage: stdPct,
        customPercentage: custPct,
        expansionRatio: ratio,
      };
      updatedMappings.push(enhancedMap);

      comparisons.push({
        originalOp: map.originalOp,
        scrambledByte: map.scrambledByte,
        scrambledHex: map.scrambledHex,
        customMnemonic: map.customMnemonic,
        description: map.description,
        category: map.category,
        standardCount: stdCount,
        customCount: custCount,
        standardPercentage: stdPct,
        customPercentage: custPct,
        expansionRatio: ratio,
        deltaPercentage: deltaPct,
      });
    });

    // Statistical Divergence Index (Total Variation distance normalized: 0.5 * sum(|P - Q|))
    const divergenceIndex = Number((0.5 * totalVariationSum).toFixed(1));

    // Category Aggregates
    const categoryLabels: Record<string, string> = {
      memory: 'Memory & Addressing',
      arithmetic: 'Arithmetic & Bitwise',
      control_flow: 'Control Flow & CFF',
      vm_syscall: 'VM Syscalls & ABI Bridge',
      stack: 'Stack & Sandboxing',
    };

    const categoryKeys: ('memory' | 'arithmetic' | 'control_flow' | 'vm_syscall' | 'stack')[] = [
      'memory',
      'arithmetic',
      'control_flow',
      'vm_syscall',
      'stack',
    ];

    const categoryBreakdown: OpcodeCategoryStats[] = categoryKeys.map((cat) => {
      const items = comparisons.filter((c) => c.category === cat);
      const catStd = items.reduce((sum, item) => sum + item.standardCount, 0);
      const catCust = items.reduce((sum, item) => sum + item.customCount, 0);
      const catStdPct = Number(((catStd / standardTotalCount) * 100).toFixed(1));
      const catCustPct = Number(((catCust / customTotalCount) * 100).toFixed(1));
      const catRatio = Number((catCust / Math.max(1, catStd)).toFixed(1));

      return {
        category: cat,
        label: categoryLabels[cat] || cat,
        standardCount: catStd,
        customCount: catCust,
        standardPercentage: catStdPct,
        customPercentage: catCustPct,
        expansionRatio: catRatio,
      };
    });

    return {
      standardTotalCount,
      customTotalCount,
      virtualizationExpansionRatio,
      substitutionRate: 100.0,
      divergenceIndex,
      categoryBreakdown,
      comparisons,
      mappings: updatedMappings,
    };
  }
}
