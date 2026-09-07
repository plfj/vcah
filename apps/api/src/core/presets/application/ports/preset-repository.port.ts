import { PresetProfileEntity } from '../../domain/entities';

export interface PresetRepositoryPort {
  findAll(): Promise<PresetProfileEntity[]>;
  findById(id: string): Promise<PresetProfileEntity | null>;
}
