export interface RegisterState {
  rip: number;
  rsp: number;
  rflags: number;
  r0: number;
  r1: number;
  r2: number;
  r3: number;
}

export interface InstructionCycle {
  cycleIndex: number;
  opcodeName: string;
  scrambledHex: string;
  operand: number | null;
  stackDepth: number;
  stateTag: string;
}

export class VmExecutionTrace {
  constructor(
    public readonly traceId: string,
    public readonly totalCycles: number,
    public readonly initialRegisters: RegisterState,
    public readonly finalRegisters: RegisterState,
    public readonly cycles: InstructionCycle[],
    public readonly exitCode: number,
    public readonly verifiedIntegrity: boolean
  ) {}
}
