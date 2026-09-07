import { Module } from '@nestjs/common';
import { PresetsController } from './presentation/controllers/presets.controller';
import { GetPresetsUseCase } from './application/use-cases/get-presets.use-case';
import { InMemoryPresetRepositoryAdapter } from './infrastructure/adapters/in-memory-preset-repository.adapter';

@Module({
  controllers: [PresetsController],
  providers: [
    InMemoryPresetRepositoryAdapter,
    {
      provide: 'PresetRepositoryPort',
      useClass: InMemoryPresetRepositoryAdapter,
    },
    GetPresetsUseCase,
  ],
  exports: [GetPresetsUseCase, 'PresetRepositoryPort'],
})
export class PresetsModule {}
