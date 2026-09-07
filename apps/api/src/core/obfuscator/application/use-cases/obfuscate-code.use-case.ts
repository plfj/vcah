import { Injectable, Inject } from '@nestjs/common';
import { RustEnginePort } from '../ports/rust-engine.port';
import { ObfuscateCommand } from '../commands/obfuscate.command';
import {
  ObfuscationJob,
  VirtualMachineSpec,
  InvalidPythonCodeDomainError,
  HardeningModulesVO,
} from '../../domain';

@Injectable()
export class ObfuscateCodeUseCase {
  constructor(
    @Inject('RustEnginePort') private readonly rustEnginePort: RustEnginePort
  ) {}

  async execute(command: ObfuscateCommand): Promise<ObfuscationJob> {
    const { sourceCode, config } = command;

    if (!sourceCode || !sourceCode.trim()) {
      throw new InvalidPythonCodeDomainError('Source code cannot be empty.');
    }

    const pythonVersion = config.supportedPythonVersions?.[0] || '3.12';
    const seed = config.opcodeSeed ?? 884721;

    const engineResult = await this.rustEnginePort.executeDeterministicPipeline(
      sourceCode,
      pythonVersion,
      seed,
      config
    );

    const hardeningVO: HardeningModulesVO = {
      nativeRustVirtualization: config.nativeRustVirtualization ?? true,
      nativeCVirtualization: config.nativeCVirtualization ?? true,
      chunkedRamDecryption128B: config.chunkedRamDecryption128B ?? true,
      masterKeystreamEncryption: config.masterKeystreamEncryption ?? true,
      polymorphicInstructionSub: config.polymorphicInstructionSub ?? true,
      machineLevelCFF: config.machineLevelCFF ?? true,
      opaquePredicatesJunk: config.opaquePredicatesJunk ?? true,
      peStrippingSymbolErasure: config.peStrippingSymbolErasure ?? true,
      activeKernelAntiDebug: config.activeKernelAntiDebug ?? true,
      silentMemoryCorruption: config.silentMemoryCorruption ?? true,
      callSiteRamScrubber: config.callSiteRamScrubber ?? true,
      hardwareExpireLock: config.hardwareExpireLock ?? true,
      multiOsInMemoryContainer: config.multiOsInMemoryContainer ?? true,
      preVmLambdaAst: config.preVmLambdaAst ?? true,
      fastBitwiseMangling: config.fastBitwiseMangling ?? true,
      antiAiPromptBombs: config.antiAiPromptBombs ?? true,
    };

    const vmSpec = new VirtualMachineSpec(
      `vm_${seed.toString(16)}`,
      config.targetArchitectures?.[0] || 'x86_64',
      engineResult.magicHeader,
      engineResult.opcodeMappings,
      hardeningVO,
      engineResult.nativeCStub
    );

    const job = new ObfuscationJob(
      `job_${Date.now()}_${seed}`,
      sourceCode,
      pythonVersion,
      seed,
      vmSpec,
      engineResult.obfuscatedCode,
      engineResult.stats,
      engineResult.securityAudit
    );

    return job;
  }
}
