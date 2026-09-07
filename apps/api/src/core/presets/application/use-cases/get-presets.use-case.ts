import { Injectable, Inject } from '@nestjs/common';
import { PresetRepositoryPort } from '../ports/preset-repository.port';
import { PresetProfileEntity } from '../../domain/entities';

@Injectable()
export class GetPresetsUseCase {
  constructor(
    @Inject('PresetRepositoryPort') private readonly presetRepositoryPort: PresetRepositoryPort
  ) {}

  async execute(): Promise<PresetProfileEntity[]> {
    return this.presetRepositoryPort.findAll();
  }

  async executeById(id: string): Promise<PresetProfileEntity | null> {
    return this.presetRepositoryPort.findById(id);
  }
}
