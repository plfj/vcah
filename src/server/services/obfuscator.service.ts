import { ObfuscationConfig, ObfuscationResult } from '../../../lib/types';
import { RustVmGeneratorService } from './rust-vm-generator.service';

/**
 * NestJS-style Obfuscator Service
 * Handles code preprocessing, AST virtualization, and byte packing.
 */
export class ObfuscatorService {
  public async obfuscatePythonCode(
    sourceCode: string,
    config: ObfuscationConfig
  ): Promise<ObfuscationResult> {
    if (!sourceCode || sourceCode.trim().length === 0) {
      throw new Error('Source Python code cannot be empty');
    }

    // Default configuration guards
    const safeConfig: ObfuscationConfig = {
      magicNumber: config.magicNumber || '7F50564D',
      opcodeScrambling: config.opcodeScrambling ?? true,
      opcodeSeed: config.opcodeSeed || Math.floor(Math.random() * 1000000),
      opcodeRemappingMode: config.opcodeRemappingMode || 'polymorphic_cascade',
      vmInstructionSet: config.vmInstructionSet || 'polymorphic_hybrid',
      customIsaEnabled: config.customIsaEnabled ?? true,
      tamperVerification: config.tamperVerification ?? true,
      antiDebugging: config.antiDebugging ?? true,
      heavyControlFlow: config.heavyControlFlow ?? true,
      opaquePredicates: config.opaquePredicates ?? true,
      cffDegree: config.cffDegree || 'extreme_opaque',
      directBytecodeLiteral: config.directBytecodeLiteral ?? true,
      supportedPythonVersions: config.supportedPythonVersions || ['3.7', '3.8', '3.9', '3.10', '3.11', '3.12', '3.13', '3.14'],
      targetArchitectures: config.targetArchitectures || ['x86_64', 'aarch64', 'armv7', 'riscv64', 'i686', 's390x', 'ppc64le'],
      targetOperatingSystems: config.targetOperatingSystems || ['linux', 'windows', 'darwin', 'freebsd', 'android'],
      rustVmStrategy: config.rustVmStrategy || 'native_embedded_stub',
      entropyLevel: config.entropyLevel || 'high',
      junkByteRatio: config.junkByteRatio ?? 0,
      payloadMultiplier: config.payloadMultiplier ?? 1,
      targetOutputSizeMb: config.targetOutputSizeMb ?? 0,
      stringEncryptionKey: config.stringEncryptionKey || 'PyShield_Master_Key_Native_2026',
      variableNameObfuscation: config.variableNameObfuscation ?? true,
      deadCodeInjection: config.deadCodeInjection ?? false,

      // 15 Native Hardened Modules
      nativeRustVirtualization: config.nativeRustVirtualization ?? config.nativeCVirtualization ?? true,
      nativeCVirtualization: config.nativeCVirtualization ?? config.nativeRustVirtualization ?? true,
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

    const result = RustVmGeneratorService.generateSingleObfuscatedFile(sourceCode, safeConfig);

    return {
      obfuscatedCode: result.obfuscatedCode,
      fileName: `obfuscated_pyvm_${safeConfig.magicNumber.toLowerCase()}.py`,
      stats: result.stats,
      opcodeMappings: result.opcodeMappings,
      opcodeFrequencyStats: result.opcodeFrequencyStats,
      byteDistribution: result.byteDistribution,
      securityAudit: result.securityAudit,
    };
  }
}
