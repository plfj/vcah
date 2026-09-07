import { Module } from '@nestjs/common';
import { ObfuscatorController } from './presentation/controllers/obfuscator.controller';
import { ObfuscateCodeUseCase } from './application/use-cases/obfuscate-code.use-case';
import { RustEngineAdapter } from './infrastructure/adapters/rust-engine.adapter';

@Module({
  controllers: [ObfuscatorController],
  providers: [
    RustEngineAdapter,
    {
      provide: 'RustEnginePort',
      useClass: RustEngineAdapter,
    },
    ObfuscateCodeUseCase,
  ],
  exports: [ObfuscateCodeUseCase, 'RustEnginePort'],
})
export class ObfuscatorModule {}
