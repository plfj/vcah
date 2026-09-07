import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ObfuscateCodeUseCase } from '../../application/use-cases/obfuscate-code.use-case';
import { ObfuscateRequestDto } from '../dto/obfuscate-request.dto';
import { ObfuscateResponseDto, toObfuscateResponseDto } from '../dto/obfuscate-response.dto';

@Controller()
export class ObfuscatorController {
  constructor(private readonly obfuscateCodeUseCase: ObfuscateCodeUseCase) {}

  @Post('obfuscate')
  @HttpCode(HttpStatus.OK)
  async obfuscate(@Body() dto: ObfuscateRequestDto): Promise<ObfuscateResponseDto> {
    const job = await this.obfuscateCodeUseCase.execute({
      sourceCode: dto.sourceCode,
      config: dto.config || {},
    });

    return toObfuscateResponseDto(job);
  }

  @Post('api/obfuscate')
  @HttpCode(HttpStatus.OK)
  async obfuscateApi(@Body() dto: ObfuscateRequestDto): Promise<ObfuscateResponseDto> {
    return this.obfuscate(dto);
  }

  @Post('obfuscator/transform')
  @HttpCode(HttpStatus.OK)
  async transform(@Body() dto: ObfuscateRequestDto): Promise<ObfuscateResponseDto> {
    return this.obfuscate(dto);
  }
}
