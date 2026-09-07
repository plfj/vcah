export interface ToggleAtomProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export class ToggleAtom {
  public readonly element: HTMLDivElement;
  private isChecked: boolean;

  constructor(private props: ToggleAtomProps) {
    this.isChecked = Boolean(props.checked);
    this.element = document.createElement('div');
    if (props.id) this.element.id = props.id;
    this.render();
    this.element.addEventListener('click', () => this.toggle());
  }

  public render(): void {
    this.element.className = `a-toggle ${this.isChecked ? 'a-toggle--active' : ''}`;
    this.element.innerHTML = `
      <div class="a-toggle__track">
        <div class="a-toggle__thumb"></div>
      </div>
    `;
  }

  public toggle(): void {
    this.isChecked = !this.isChecked;
    this.render();
    if (this.props.onChange) {
      this.props.onChange(this.isChecked);
    }
  }

  public setChecked(checked: boolean): void {
    this.isChecked = checked;
    this.render();
  }
}
