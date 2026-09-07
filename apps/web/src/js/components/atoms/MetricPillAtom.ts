export interface MetricPillProps {
  label: string;
  value: string | number;
  unit?: string;
  id?: string;
}

export class MetricPillAtom {
  public readonly element: HTMLDivElement;

  constructor(private props: MetricPillProps) {
    this.element = document.createElement('div');
    this.element.className = 'a-metric-pill';
    if (this.props.id) {
      this.element.id = this.props.id;
    }
    this.render();
  }

  public render(): void {
    const formattedVal = this.props.unit ? `${this.props.value} ${this.props.unit}` : `${this.props.value}`;
    this.element.innerHTML = `
      <span class="a-metric-pill__label">${this.props.label}</span>
      <span class="a-metric-pill__value">${formattedVal}</span>
    `;
  }

  public update(props: Partial<MetricPillProps>): void {
    this.props = { ...this.props, ...props };
    if (this.props.id) {
      this.element.id = this.props.id;
    }
    this.render();
  }
}
