export interface AnalysisResponseDto {
  reportId: string;
  entropy: {
    score: number;
    max: number;
    uniformityRatio: number;
    grade: string;
    distribution: Array<{ byteRange: string; count: number; percentage: number }>;
  };
  frequencies: {
    standardCpythonTotal: number;
    customVirtualIsaTotal: number;
    expansionMultiplier: number;
    substitutionRate: number;
    divergenceIndex: number;
    categories: Array<{
      category: string;
      standardShare: number;
      virtualShare: number;
      expansionRatio: number;
    }>;
  };
  generatedAt: string;
}
