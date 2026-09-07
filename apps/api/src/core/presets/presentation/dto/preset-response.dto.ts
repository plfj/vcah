export interface PresetResponseDto {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: string;
  config: Record<string, any>;
}
