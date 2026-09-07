export interface PresetItem {
  id: string;
  name: string;
  description: string;
  badge: string;
}

export interface PresetSelectorMoleculeProps {
  presets: PresetItem[];
  activeId: string;
  onSelect: (presetId: string) => void;
}

export class PresetSelectorMolecule {
  public readonly element: HTMLDivElement;

  constructor(private props: PresetSelectorMoleculeProps) {
    this.element = document.createElement('div');
    this.element.className = 'm-preset-selector';
    this.render();
  }

  public render(): void {
    this.element.innerHTML = `
      <div class="m-preset-selector__label">Hardening Profile Presets</div>
      <div class="m-preset-selector__grid" id="preset-grid"></div>
    `;

    const grid = this.element.querySelector('#preset-grid') as HTMLElement;
    for (const preset of this.props.presets) {
      const card = document.createElement('div');
      const isActive = preset.id === this.props.activeId;
      card.className = `m-preset-selector__card ${isActive ? 'm-preset-selector__card--active' : ''}`;
      card.innerHTML = `
        <div>
          <div class="m-preset-selector__title">${preset.name}</div>
          <div class="m-preset-selector__desc">${preset.description}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        this.props.activeId = preset.id;
        this.render();
        this.props.onSelect(preset.id);
      });
      grid.appendChild(card);
    }
  }

  public setActiveId(id: string): void {
    this.props.activeId = id;
    this.render();
  }

  public update(props: Partial<PresetSelectorMoleculeProps>): void {
    this.props = { ...this.props, ...props };
    this.render();
  }
}
