import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class ObfuscateRequestDto {
  @IsString()
  @IsNotEmpty()
  sourceCode!: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
