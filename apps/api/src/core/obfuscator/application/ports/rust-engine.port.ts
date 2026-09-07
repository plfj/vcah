import { MagicHeaderVO, OpcodeMappingVO } from '../../domain/value-objects';
import { SecurityAuditResult } from '../../domain/entities';

export interface RustEngineExecutionResult {
  obfuscatedCode: string;
  magicHeader: MagicHeaderVO;
  opcodeMappings: OpcodeMappingVO[];
  entropy: number;
  byteDistribution: Array<{ byteRange: string; count: number; percentage: number }>;
  securityAudit: SecurityAuditResult;
  nativeCStub: string;
  stats: {
    originalSize: number;
    obfuscatedSize: number;
    entropy: number;
    junkByteRatio: number;
    payloadMultiplier: number;
    obfuscationTimeMs: number;
    memoryOverheadKb: number;
  };
}

export interface RustEnginePort {
  executeDeterministicPipeline(
    sourceCode: string,
    pythonVersion: string,
    seed: number,
    config: Record<string, any>
  ): Promise<RustEngineExecutionResult>;
}
