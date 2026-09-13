import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, Length, Min, Max, Matches, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO Validation for obfuscation requests with strict input validation.
 */
export class ObfuscateRequestDto {
  @IsString()
  @Length(1, 100000, { message: 'Source code must be between 1 and 100,000 characters' })
  sourceCode!: string;

  @ValidateNested()
  @Type(() => ObfuscationConfigDto)
  config!: ObfuscationConfigDto;
}

export class ObfuscationConfigDto {
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Fa-f]{8}$/, { message: 'Magic number must be 8 hex characters' })
  magicNumber?: string;

  @IsOptional()
  @IsBoolean()
  opcodeScrambling?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(0xFFFFFFFF)
  opcodeSeed?: number;

  @IsOptional()
  @IsIn(['dynamic_permutation', 'crypto_hash_table', 'polymorphic_cascade'])
  opcodeRemappingMode?: string;

  @IsOptional()
  @IsIn(['stack_vm', 'register_vm', 'polymorphic_hybrid'])
  vmInstructionSet?: string;

  @IsOptional()
  @IsBoolean()
  customIsaEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  tamperVerification?: boolean;

  @IsOptional()
  @IsBoolean()
  antiDebugging?: boolean;

  @IsOptional()
  @IsBoolean()
  heavyControlFlow?: boolean;

  @IsOptional()
  @IsBoolean()
  opaquePredicates?: boolean;

  @IsOptional()
  @IsIn(['standard', 'aggressive', 'extreme_opaque'])
  cffDegree?: string;

  @IsOptional()
  @IsBoolean()
  directBytecodeLiteral?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedPythonVersions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetArchitectures?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetOperatingSystems?: string[];

  @IsOptional()
  @IsIn(['native_embedded_stub', 'universal_polyglot_vm', 'hybrid_dynamic_dispatch'])
  rustVmStrategy?: string;

  @IsOptional()
  @IsIn(['high', 'ultra', 'extreme_bloat'])
  entropyLevel?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  junkByteRatio?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  payloadMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(7)
  targetOutputSizeMb?: number;

  @IsOptional()
  @IsString()
  @Length(8, 128)
  stringEncryptionKey?: string;

  @IsOptional()
  @IsBoolean()
  variableNameObfuscation?: boolean;

  @IsOptional()
  @IsBoolean()
  deadCodeInjection?: boolean;

  @IsOptional()
  @IsIn(['standard', 'high', 'maximum', 'jumbo_extreme'])
  intensityLevel?: string;

  @IsOptional()
  @IsBoolean()
  hideImports?: boolean;

  @IsOptional()
  @IsBoolean()
  largeBytesPayload?: boolean;

  @IsOptional()
  @IsBoolean()
  nativeRustVirtualization?: boolean;

  @IsOptional()
  @IsBoolean()
  chunkedRamDecryption128B?: boolean;

  @IsOptional()
  @IsBoolean()
  masterKeystreamEncryption?: boolean;

  @IsOptional()
  @IsBoolean()
  polymorphicInstructionSub?: boolean;

  @IsOptional()
  @IsBoolean()
  machineLevelCFF?: boolean;

  @IsOptional()
  @IsBoolean()
  opaquePredicatesJunk?: boolean;

  @IsOptional()
  @IsBoolean()
  peStrippingSymbolErasure?: boolean;

  @IsOptional()
  @IsBoolean()
  activeKernelAntiDebug?: boolean;

  @IsOptional()
  @IsBoolean()
  silentMemoryCorruption?: boolean;

  @IsOptional()
  @IsBoolean()
  callSiteRamScrubber?: boolean;

  @IsOptional()
  @IsBoolean()
  hardwareExpireLock?: boolean;

  @IsOptional()
  @IsBoolean()
  multiOsInMemoryContainer?: boolean;

  @IsOptional()
  @IsBoolean()
  preVmLambdaAst?: boolean;

  @IsOptional()
  @IsBoolean()
  fastBitwiseMangling?: boolean;

  @IsOptional()
  @IsBoolean()
  antiAiPromptBombs?: boolean;
}

/**
 * Validates and sanitizes input DTO.
 */
export class ValidationService {
  /**
   * Sanitizes string input to prevent injection attacks.
   */
  public static sanitizeString(input: string): string {
    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Limit length
    if (sanitized.length > 100000) {
      sanitized = sanitized.slice(0, 100000);
    }

    return sanitized;
  }

  /**
   * Validates magic number format.
   */
  public static validateMagicNumber(magicNumber: string): boolean {
    return /^[0-9A-Fa-f]{8}$/.test(magicNumber);
  }

  /**
   * Validates opcode seed range.
   */
  public static validateOpcodeSeed(seed: number): boolean {
    return Number.isInteger(seed) && seed >= 1 && seed <= 0xFFFFFFFF;
  }

  /**
   * Sanitizes configuration object with safe defaults.
   */
  public static sanitizeConfig(config: any): any {
    return {
      magicNumber: this.validateMagicNumber(config.magicNumber || '7F50564D')
        ? config.magicNumber
        : '7F50564D',
      opcodeSeed: this.validateOpcodeSeed(config.opcodeSeed)
        ? config.opcodeSeed
        : Math.floor(Math.random() * 0xFFFFFFFF),
      targetOutputSizeMb: Math.min(Math.max(0, config.targetOutputSizeMb || 0), 7),
      // ... rest of config with validation
      ...config,
    };
  }
}
