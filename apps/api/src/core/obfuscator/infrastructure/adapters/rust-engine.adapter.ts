import { Injectable } from '@nestjs/common';
import { RustEnginePort, RustEngineExecutionResult } from '../../application/ports/rust-engine.port';
import { MagicHeaderVO, OpcodeMappingVO } from '../../domain/value-objects';
import { RustVmGeneratorService } from '../../../../../../../src/server/services/rust-vm-generator.service';

@Injectable()
export class RustEngineAdapter implements RustEnginePort {
  async executeDeterministicPipeline(
    sourceCode: string,
    pythonVersion: string,
    seed: number,
    config: Record<string, any>
  ): Promise<RustEngineExecutionResult> {
    const fullConfig = {
      ...config,
      opcodeSeed: seed,
      supportedPythonVersions: [pythonVersion],
    } as any;

    const raw = RustVmGeneratorService.generateSingleObfuscatedFile(sourceCode, fullConfig);

    const magicVO = new MagicHeaderVO(
      raw.stats?.magicBytesHex || '7F50564D',
      [0x7F, 0x50, 0x56, 0x4D],
      pythonVersion
    );

    const opcodeMappingsVO: OpcodeMappingVO[] = (raw.opcodeMappings || []).map(
      (m: any) =>
        new OpcodeMappingVO(
          m.originalOp || m.cpythonName || 'OP',
          m.originalByte ?? 0x01,
          m.scrambledByte ?? 0x01,
          m.category || 'MemoryAndAddressing',
          m.customMnemonic || 'Polymorphic Remapping'
        )
    );

    return {
      obfuscatedCode: raw.obfuscatedCode,
      magicHeader: magicVO,
      opcodeMappings: opcodeMappingsVO,
      entropy: raw.stats?.shannonEntropy || 7.9,
      byteDistribution: raw.byteDistribution,
      securityAudit: raw.securityAudit,
      nativeCStub: '',
      stats: {
        originalSize: raw.stats?.originalSizeBytes || 0,
        obfuscatedSize: raw.stats?.obfuscatedSizeBytes || 0,
        entropy: raw.stats?.shannonEntropy || 7.9,
        junkByteRatio: raw.stats?.junkBytesInjected || 0,
        payloadMultiplier: raw.stats?.sizeExpansionRatio || 1,
        obfuscationTimeMs: raw.stats?.generationTimeMs || 10,
        memoryOverheadKb: Math.round((raw.stats?.chunkCount || 1) * 0.125),
      },
    };
  }
}
