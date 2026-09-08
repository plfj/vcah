import test from 'node:test';
import assert from 'node:assert/strict';
import { MagicHeaderService } from '../src/server/services/magic-header.service';
import { EntropyService } from '../src/server/services/entropy.service';
import { OpcodeScramblerService } from '../src/server/services/opcode-scrambler.service';
import { RustVmGeneratorService } from '../src/server/services/rust-vm-generator.service';

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
