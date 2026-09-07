import { Injectable, Inject } from '@nestjs/common';
import { AnalysisEnginePort } from '../ports/analysis-engine.port';
import { BytecodeAnalysisReport } from '../../domain/entities';

export interface AnalyzeBytecodeCommand {
  sourceCode: string;
  bytecodePayload?: string;
  seed?: number;
}

@Injectable()
export class AnalyzeBytecodeUseCase {
  constructor(
    @Inject('AnalysisEnginePort') private readonly analysisEnginePort: AnalysisEnginePort
  ) {}

  async execute(command: AnalyzeBytecodeCommand): Promise<BytecodeAnalysisReport> {
    const seed = command.seed ?? 884721;
    const payload = command.bytecodePayload || command.sourceCode;

    const [entropyProfile, frequencyProfile] = await Promise.all([
      this.analysisEnginePort.calculateEntropy(payload),
      this.analysisEnginePort.analyzeFrequencies(command.sourceCode, seed),
    ]);

    return new BytecodeAnalysisReport(
      `analysis_${Date.now()}`,
      entropyProfile,
      frequencyProfile
    );
  }
}
