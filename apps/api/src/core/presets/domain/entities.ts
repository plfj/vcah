export class PresetProfileEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly badge: string,
    public readonly icon: string,
    public readonly config: Record<string, any>
  ) {}
}
