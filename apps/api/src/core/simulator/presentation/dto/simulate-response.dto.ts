export interface SimulateResponseDto {
  traceId: string;
  totalCycles: number;
  initialRegisters: Record<string, number>;
  finalRegisters: Record<string, number>;
  cycles: Array<{
    cycleIndex: number;
    opcodeName: string;
    scrambledHex: string;
    operand: number | null;
    stackDepth: number;
    stateTag: string;
  }>;
  exitCode: number;
  verifiedIntegrity: boolean;
}
