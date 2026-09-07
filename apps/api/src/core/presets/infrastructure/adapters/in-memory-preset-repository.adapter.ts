import { Injectable } from '@nestjs/common';
import { PresetRepositoryPort } from '../../application/ports/preset-repository.port';
import { PresetProfileEntity } from '../../domain/entities';
import { PRESET_PROFILES } from '../../../../../../../src/server/presets';

@Injectable()
export class InMemoryPresetRepositoryAdapter implements PresetRepositoryPort {
  async findAll(): Promise<PresetProfileEntity[]> {
    return PRESET_PROFILES.map(
      (p) =>
        new PresetProfileEntity(
          p.id,
          p.name,
          p.description,
          p.tagline || 'Hardened',
          p.iconName || 'Shield',
          p.config
        )
    );
  }

  async findById(id: string): Promise<PresetProfileEntity | null> {
    const found = PRESET_PROFILES.find((p) => p.id === id);
    if (!found) return null;
    return new PresetProfileEntity(
      found.id,
      found.name,
      found.description,
      found.tagline || 'Hardened',
      found.iconName || 'Shield',
      found.config
    );
  }
}
