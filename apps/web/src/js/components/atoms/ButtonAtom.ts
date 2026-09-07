export interface ButtonAtomProps {
  id?: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md';
  disabled?: boolean;
  onClick?: (e: MouseEvent) => void;
}

export class ButtonAtom {
  public readonly element: HTMLButtonElement;

  constructor(private props: ButtonAtomProps) {
    this.element = document.createElement('button');
    if (props.id) this.element.id = props.id;
    this.render();
    if (props.onClick) {
      this.element.addEventListener('click', props.onClick);
    }
  }

  public render(): void {
    const variantClass = `a-button--${this.props.variant || 'secondary'}`;
    const sizeClass = this.props.size === 'sm' ? 'a-button--sm' : '';
    this.element.className = `a-button ${variantClass} ${sizeClass}`.trim();
    this.element.innerText = this.props.label;
    this.element.disabled = Boolean(this.props.disabled);
  }

  public setDisabled(disabled: boolean): void {
    this.props.disabled = disabled;
    this.element.disabled = disabled;
  }

  public setLabel(label: string): void {
    this.props.label = label;
    this.element.innerText = label;
  }
}
