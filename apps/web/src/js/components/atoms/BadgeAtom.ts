export interface BadgeAtomProps {
  label: string;
  variant?: 'cyan' | 'emerald' | 'amber' | 'purple';
}

export class BadgeAtom {
  public readonly element: HTMLSpanElement;

  constructor(private props: BadgeAtomProps) {
    this.element = document.createElement('span');
    this.render();
  }

  public render(): void {
    this.element.className = `a-badge a-badge--${this.props.variant || 'cyan'}`;
    this.element.innerText = this.props.label;
  }
}
