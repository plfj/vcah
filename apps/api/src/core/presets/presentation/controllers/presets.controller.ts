import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { GetPresetsUseCase } from '../../application/use-cases/get-presets.use-case';
import { PresetResponseDto } from '../dto/preset-response.dto';

@Controller()
export class PresetsController {
  constructor(private readonly getPresetsUseCase: GetPresetsUseCase) {}

  @Get('presets')
  async getAll(): Promise<PresetResponseDto[]> {
    const profiles = await this.getPresetsUseCase.execute();
    return profiles.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      badge: p.badge,
      icon: p.icon,
      config: p.config,
    }));
  }

  @Get('api/presets')
  async getAllApi(): Promise<PresetResponseDto[]> {
    return this.getAll();
  }

  @Get('presets/:id')
  async getById(@Param('id') id: string): Promise<PresetResponseDto> {
    const profile = await this.getPresetsUseCase.executeById(id);
    if (!profile) {
      throw new NotFoundException(`Preset with ID "${id}" was not found.`);
    }
    return {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      badge: profile.badge,
      icon: profile.icon,
      config: profile.config,
    };
  }

  @Get('api/presets/:id')
  async getByIdApi(@Param('id') id: string): Promise<PresetResponseDto> {
    return this.getById(id);
  }
}
