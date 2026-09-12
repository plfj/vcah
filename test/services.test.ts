import test from 'node:test';
import assert from 'node:assert/strict';
import { MagicHeaderService } from '../src/server/services/magic-header.service';
import { EntropyService } from '../src/server/services/entropy.service';
import { OpcodeScramblerService } from '../src/server/services/opcode-scrambler.service';
import { RustVmGeneratorService } from '../src/server/services/rust-vm-generator.service';
import { LambdaAstMorpherService } from '../src/server/services/lambda-ast-morpher.service';

test('MagicHeaderService: sanitizeMagicHex cleans, normalizes, and pads inputs', () => {
  assert.equal(MagicHeaderService.sanitizeMagicHex('7F50564D'), '7F50564D');
  assert.equal(MagicHeaderService.sanitizeMagicHex('0x7f, 0x50, 0x56, 0x4d'), '7F50564D');
  assert.equal(MagicHeaderService.sanitizeMagicHex('1A2B'), '1A2B0000');
  assert.equal(MagicHeaderService.sanitizeMagicHex('aabbccddeeff'), 'AABBCCDD');
});

test('MagicHeaderService: hexToBytes and toAscii produce correct byte structures', () => {
  const bytes = MagicHeaderService.hexToBytes('7F50564D');
  assert.deepEqual(bytes, [0x7F, 0x50, 0x56, 0x4D]);

  const ascii = MagicHeaderService.toAscii('7F50564D');
  assert.equal(ascii, '·PVM');

  const pyLiteral = MagicHeaderService.toPythonBytesLiteral('7F50564D');
  assert.equal(pyLiteral, 'b"\\x7f\\x50\\x56\\x4d"');
});

test('EntropyService: calculateShannonEntropy produces accurate information density', () => {
  // Empty data produces 0 entropy
  assert.equal(EntropyService.calculateShannonEntropy([]), 0);

  // Uniform byte array over all 256 bytes produces maximum theoretical entropy of 8.0 bits/byte
  const uniform = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    uniform[i] = i;
  }
  const maxEntropy = EntropyService.calculateShannonEntropy(uniform);
  assert.equal(maxEntropy, 8.0);

  // Repetitive data has 0 entropy
  const zeroEntropyData = new Uint8Array(100).fill(0xAA);
  assert.equal(EntropyService.calculateShannonEntropy(zeroEntropyData), 0);
});

test('EntropyService: getByteDistribution provides 16 histogram buckets', () => {
  const sample = new Uint8Array([0x05, 0x12, 0x2A, 0xFF]);
  const dist = EntropyService.getByteDistribution(sample);
  assert.equal(dist.length, 16);

  const totalCount = dist.reduce((acc, item) => acc + item.count, 0);
  assert.equal(totalCount, sample.length);
});

test('OpcodeScramblerService: generates deterministic collision-free opcode tables', () => {
  const seed = 884721;
  const table1 = OpcodeScramblerService.generateScrambledOpcodeTable(seed, 'polymorphic_hybrid', true);
  const table2 = OpcodeScramblerService.generateScrambledOpcodeTable(seed, 'polymorphic_hybrid', true);

  // Determinism check with fixed PRNG seed
  assert.deepEqual(table1.mappings, table2.mappings);
  assert.deepEqual(table1.opcodeTableDict, table2.opcodeTableDict);

  // Zero duplicate opcodes check
  const assignedByteValues = Object.values(table1.opcodeTableDict);
  const uniqueByteValues = new Set(assignedByteValues);
  assert.equal(assignedByteValues.length, uniqueByteValues.size);

  // Reverse mapping integrity
  for (const [name, byteCode] of Object.entries(table1.opcodeTableDict)) {
    assert.equal(table1.reverseTableDict[byteCode], name);
  }
});

test('RustVmGeneratorService: generates 3-layer onion virtualized Python output', () => {
  const sampleCode = `
def add(a, b):
    return a + b

print(add(10, 20))
`;

  const result = RustVmGeneratorService.generateSingleObfuscatedFile(sampleCode, {
    magicNumber: '7F50564D',
    opcodeSeed: 884721,
    vmInstructionSet: 'polymorphic_hybrid',
    stringEncryptionKey: 'PyShield_Test_Key_2026',
    supportedPythonVersions: ['3.12'],
    cffDegree: 'extreme_opaque',
    nativeRustVirtualization: true,
    chunkedRamDecryption128B: true,
    machineLevelCFF: true,
    activeKernelAntiDebug: true,
    intensityLevel: 'maximum',
    opcodeRemapping: true,
    controlFlowFlattening: true,
    entropyRandomization: true,
    hideImports: true,
    largeBytesPayload: false,
  } as any);

  assert.ok(result.obfuscatedCode, 'Generated code should not be empty');
  assert.ok(result.obfuscatedCode.includes('Interpretor(globals(), b\''), 'Must contain single-line entrypoint invocation');
  assert.ok(result.stats.expansionRatio > 1, 'Protected code should expand compared to original source');
  assert.ok(result.securityAudit.decompilerResistanceScore >= 99, 'Decompiler resistance score should be high');
  assert.equal(result.securityAudit.antiTamperScore, 100);
});

test('OpcodeScramblerService: calculateOpcodeFrequencyStats handles strings, collections, and ReDoS adversarial inputs in linear time', () => {
  const seed = 12345;
  const table = OpcodeScramblerService.generateScrambledOpcodeTable(seed, 'polymorphic_hybrid', true);

  const code = `
# Comment with "quotes"
msg = "hello world"
doc = """multi
line
string"""
data = [1, 2, 3]
config = {'a': 1, 'b': 2}
`;
  const stats = OpcodeScramblerService.calculateOpcodeFrequencyStats(code, { cffDegree: 'aggressive' } as any, table.mappings);
  assert.ok(stats.customTotalCount > 0);
  assert.ok(stats.virtualizationExpansionRatio > 1);

  // Adversarial ReDoS inputs that would trigger backtracking in naive regexes
  const adversarialQuotes = '"' + '\\"'.repeat(5000);
  const adversarialBraces = '{:' + ':'.repeat(5000);
  const adversarialSingleQuotes = "'''" + "\\'".repeat(5000);

  const t0 = Date.now();
  const adversarialStats = OpcodeScramblerService.calculateOpcodeFrequencyStats(
    adversarialQuotes + '\n' + adversarialBraces + '\n' + adversarialSingleQuotes,
    { cffDegree: 'standard' } as any,
    table.mappings
  );
  const elapsedMs = Date.now() - t0;
  assert.ok(elapsedMs < 100, `Adversarial input should finish in <100ms, took ${elapsedMs}ms`);
  assert.ok(adversarialStats);

  // Adversarial loop-bound injection payload (e.g. JSON object with { length: 1e100 })
  const fakeObjectPayload = { length: 1e100 } as any;
  const loopBoundSafeStats = OpcodeScramblerService.calculateOpcodeFrequencyStats(
    fakeObjectPayload,
    { cffDegree: 'standard' } as any,
    table.mappings
  );
  assert.ok(loopBoundSafeStats);
  assert.equal(loopBoundSafeStats.standardTotalCount >= 0, true);
});

test('LambdaAstMorpherService: transforms Python AST with nested lambdas, match-case, and try-catch', () => {
  const sample = 'x = 100\nmsg = "hello"\nprint(x, msg)';
  const morphed = LambdaAstMorpherService.morphSource(sample, { loop: 1 });
  assert.ok(morphed.length > sample.length);
  assert.ok(morphed.includes('lambda a:'));
  assert.ok(morphed.includes('MemoryError'));
  assert.ok(morphed.includes('match '));
  assert.ok(morphed.includes('3333333333333333333333333333333333333333333333333333333333242422222222222222222722222233'), 'Must use user constant in obfstr');
  assert.ok(morphed.includes('0xFFFFFFFFFFFFFFFFFFFFFF') || morphed.includes('309485009821345068724781056'), 'Must use 0xFFFFFFFFFFFFFFFFFFFFFF in obfint');
  // Verify user's exact unicode identifiers
  assert.ok(morphed.includes('tryᅠ'), 'Must include tryᅠ identifier for print');
  assert.ok(morphed.includes('exceptᅠ'), 'Must include exceptᅠ identifier for input');
  assert.ok(morphed.includes('0x4e00') || /[\u4e00-\u9fff]/.test(morphed), 'Must generate CJK identifiers in range 0x4e00..0x9fff');
});

test('RustVmGeneratorService: output layer uses user requested lambda builtins resolver and nested lambdas', () => {
  const sampleCode = 'print("hello protected world")';
  const result = RustVmGeneratorService.generateSingleObfuscatedFile(sampleCode, {
    magicNumber: '7F50564D',
    opcodeSeed: 42,
    hideImports: true,
    preVmLambdaAst: true,
  } as any);

  // User requested builtins resolver lambda
  const expectedLambdaBuiltinsPattern = "lambda a:(lambda b:(lambda c:(lambda d:d.get(''.join(map(chr,(95,95,98,117,105,108,116,105,110,115,95,95))),{}))(vars(c.modules['builtins'])))(b('sys')))(a['__import__'])";
  assert.ok(result.obfuscatedCode.includes(expectedLambdaBuiltinsPattern), 'Must include user requested builtins resolver lambda');

  // Heavily nested lambdas in output layer
  assert.ok(result.obfuscatedCode.includes('(lambda _f: (lambda _g: (lambda _h:'), 'Output layer functions must use nested curried lambdas');
  assert.ok(result.obfuscatedCode.includes('(lambda _run: _run())(lambda: Interpretor(globals(), b\''), 'Entrypoint must be curried with lambda');
});

