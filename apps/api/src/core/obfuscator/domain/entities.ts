import { MagicHeaderVO, OpcodeMappingVO, HardeningModulesVO } from './value-objects';

export interface BytecodeAnalysisStats {
  originalSize: number;
  obfuscatedSize: number;
  entropy: number;
  junkByteRatio: number;
  payloadMultiplier: number;
  obfuscationTimeMs: number;
  memoryOverheadKb: number;
}

export interface SecurityAuditResult {
  decompilerResistanceScore: number;
  antiDebugScore: number;
  tamperResistanceScore: number;
  cffComplexityScore: number;
  overallScore: number;
  findings: string[];
}

export class VirtualMachineSpec {
  constructor(
    public readonly id: string,
    public readonly architecture: string,
    public readonly magicHeader: MagicHeaderVO,
    public readonly opcodeMappings: readonly OpcodeMappingVO[],
    public readonly hardeningModules: HardeningModulesVO,
    public readonly rustNativeStubCode: string
  ) {}
}

export class ObfuscationJob {
  public completedAt?: Date;

  constructor(
    public readonly jobId: string,
    public readonly sourceCode: string,
    public readonly pythonVersion: string,
    public readonly seed: number,
    public readonly vmSpec: VirtualMachineSpec,
    public readonly obfuscatedCode: string,
    public readonly stats: BytecodeAnalysisStats,
    public readonly securityAudit: SecurityAuditResult
  ) {
    this.completedAt = new Date();
  }
}
