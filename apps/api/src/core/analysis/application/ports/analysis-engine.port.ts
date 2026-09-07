import { EntropyProfile, OpcodeFrequencyProfile } from '../../domain/entities';

export interface AnalysisEnginePort {
  calculateEntropy(bytecode: Uint8Array | string): Promise<EntropyProfile>;
  analyzeFrequencies(sourceCode: string, opcodeSeed: number): Promise<OpcodeFrequencyProfile>;
}
