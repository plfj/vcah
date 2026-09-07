export interface AnalysisRequestDto {
  sourceCode: string;
  bytecodePayload?: string;
  seed?: number;
}
