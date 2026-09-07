export class EntropyProfile {
  constructor(
    public readonly shannonEntropy: number,
    public readonly maxEntropy: number,
    public readonly uniformityRatio: number,
    public readonly randomnessGrade: string,
    public readonly byteDistribution: Array<{ byteRange: string; count: number; percentage: number }>
  ) {}
}

export class OpcodeFrequencyProfile {
  constructor(
    public readonly standardCpythonCount: number,
    public readonly virtualVmCount: number,
    public readonly expansionMultiplier: number,
    public readonly substitutionRate: number,
    public readonly divergenceIndex: number,
    public readonly categoryBreakdown: Array<{
      category: string;
      standardShare: number;
      virtualShare: number;
      expansionRatio: number;
    }>
  ) {}
}

export class BytecodeAnalysisReport {
  constructor(
    public readonly reportId: string,
    public readonly entropyProfile: EntropyProfile,
    public readonly frequencyProfile: OpcodeFrequencyProfile,
    public readonly generatedAt: Date = new Date()
  ) {}
}
