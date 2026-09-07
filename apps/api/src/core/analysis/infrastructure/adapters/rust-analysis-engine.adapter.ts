import { Injectable } from '@nestjs/common';
import { AnalysisEnginePort } from '../../application/ports/analysis-engine.port';
import { EntropyProfile, OpcodeFrequencyProfile } from '../../domain/entities';
import { EntropyService } from '../../../../../../../src/server/services/entropy.service';
import { OpcodeScramblerService } from '../../../../../../../src/server/services/opcode-scrambler.service';

@Injectable()
export class RustAnalysisEngineAdapter implements AnalysisEnginePort {
  async calculateEntropy(bytecode: Uint8Array | string): Promise<EntropyProfile> {
    const raw = typeof bytecode === 'string' ? Buffer.from(bytecode) : Buffer.from(bytecode);
    const score = EntropyService.calculateShannonEntropy(raw);
    const rawDistribution = EntropyService.getByteDistribution(raw);

    const byteDistribution = rawDistribution.map((d) => ({
      byteRange: d.bucket,
      count: d.count,
      percentage: d.entropyContribution,
    }));

    const grade =
      score > 7.85
        ? 'CRYPTOGRAPHIC_HIGH_ENTROPY'
        : score > 7.2
        ? 'MODERATE_OBSCURITY'
        : score > 5.5
        ? 'LOW_DIFFUSION'
        : 'PLAINTEXT_PATTERNS_DETECTED';

    return new EntropyProfile(
      score,
      8.0,
      Math.min(1.0, score / 8.0),
      grade,
      byteDistribution
    );
  }

  async analyzeFrequencies(sourceCode: string, opcodeSeed: number): Promise<OpcodeFrequencyProfile> {
    const { mappings } = OpcodeScramblerService.generateScrambledOpcodeTable(
      opcodeSeed,
      'polymorphic_hybrid',
      true
    );

    const dummyConfig: any = {
      cffDegree: 'extreme_opaque',
      heavyControlFlow: true,
      opaquePredicates: true,
      activeKernelAntiDebug: true,
    };

    const stats = OpcodeScramblerService.calculateOpcodeFrequencyStats(
      sourceCode,
      dummyConfig,
      mappings
    );

    return new OpcodeFrequencyProfile(
      stats.standardTotalCount,
      stats.customTotalCount,
      stats.virtualizationExpansionRatio,
      stats.substitutionRate,
      stats.divergenceIndex,
      stats.categoryBreakdown.map((c) => ({
        category: c.label,
        standardShare: c.standardPercentage,
        virtualShare: c.customPercentage,
        expansionRatio: c.expansionRatio,
      }))
    );
  }
}
