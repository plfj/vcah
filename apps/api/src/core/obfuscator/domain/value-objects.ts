/**
 * Pure Domain Value Objects. Immutable, deterministic representations.
 */

export class MagicHeaderVO {
  constructor(
    public readonly standardHex: string,
    public readonly virtualBytes: readonly number[],
    public readonly pythonVersion: string
  ) {
    if (!standardHex || standardHex.length !== 8) {
      throw new Error('Standard magic header must be an 8-character hex string');
    }
  }

  public get virtualHex(): string {
    return Array.from(this.virtualBytes)
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join('');
  }
}

export class OpcodeMappingVO {
  constructor(
    public readonly cpythonMnemonic: string,
    public readonly canonicalByte: number,
    public readonly scrambledByte: number,
    public readonly category: string,
    public readonly defenseMechanism: string
  ) {
    if (canonicalByte < 0 || canonicalByte > 255 || scrambledByte < 0 || scrambledByte > 255) {
      throw new Error('Opcode bytes must fall within 0x00..0xFF range');
    }
  }

  public get scrambledHex(): string {
    return `0x${this.scrambledByte.toString(16).padStart(2, '0').toUpperCase()}`;
  }
}

export interface HardeningModulesVO {
  nativeRustVirtualization: boolean;
  nativeCVirtualization: boolean;
  chunkedRamDecryption128B: boolean;
  masterKeystreamEncryption: boolean;
  polymorphicInstructionSub: boolean;
  machineLevelCFF: boolean;
  opaquePredicatesJunk: boolean;
  peStrippingSymbolErasure: boolean;
  activeKernelAntiDebug: boolean;
  silentMemoryCorruption: boolean;
  callSiteRamScrubber: boolean;
  hardwareExpireLock: boolean;
  multiOsInMemoryContainer: boolean;
  preVmLambdaAst: boolean;
  fastBitwiseMangling: boolean;
  antiAiPromptBombs: boolean;
}
