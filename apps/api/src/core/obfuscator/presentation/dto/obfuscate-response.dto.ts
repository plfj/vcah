import { ObfuscationJob } from '../../domain';

export interface ObfuscateResponseDto {
  jobId: string;
  obfuscatedCode: string;
  pythonVersion: string;
  seed: number;
  stats: {
    originalSize: number;
    obfuscatedSize: number;
    entropy: number;
    junkByteRatio: number;
    payloadMultiplier: number;
    obfuscationTimeMs: number;
    memoryOverheadKb: number;
  };
  securityAudit: {
    decompilerResistanceScore: number;
    antiDebugScore: number;
    tamperResistanceScore: number;
    cffComplexityScore: number;
    overallScore: number;
    findings: string[];
  };
  vmSpec: {
    id: string;
    architecture: string;
    magicHeader: {
      standardHex: string;
      virtualHex: string;
      pythonVersion: string;
    };
    opcodeCount: number;
    hardeningModules: Record<string, boolean>;
    rustNativeStubCode: string;
  };
  timestamp: string;
}

export function toObfuscateResponseDto(job: ObfuscationJob): ObfuscateResponseDto {
  return {
    jobId: job.jobId,
    obfuscatedCode: job.obfuscatedCode,
    pythonVersion: job.pythonVersion,
    seed: job.seed,
    stats: job.stats,
    securityAudit: job.securityAudit,
    vmSpec: {
      id: job.vmSpec.id,
      architecture: job.vmSpec.architecture,
      magicHeader: {
        standardHex: job.vmSpec.magicHeader.standardHex,
        virtualHex: job.vmSpec.magicHeader.virtualHex,
        pythonVersion: job.vmSpec.magicHeader.pythonVersion,
      },
      opcodeCount: job.vmSpec.opcodeMappings.length,
      hardeningModules: job.vmSpec.hardeningModules as unknown as Record<string, boolean>,
      rustNativeStubCode: job.vmSpec.rustNativeStubCode,
    },
    timestamp: job.completedAt?.toISOString() || new Date().toISOString(),
  };
}
