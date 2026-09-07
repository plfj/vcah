export interface EntropyGaugeProps {
  score: number;
  maxScore?: number;
  label?: string;
  grade?: string;
}

export class EntropyGaugeMolecule {
  public readonly element: HTMLDivElement;

  constructor(private props: EntropyGaugeProps) {
    this.element = document.createElement('div');
    this.element.className = 'm-entropy-gauge';
    this.render();
  }

  public render(): void {
    const max = this.props.maxScore || 8.0;
    const score = Number(this.props.score || 0);
    const pct = Math.min(100, Math.max(0, (score / max) * 100));
    const label = this.props.label || 'Shannon Bytecode Entropy';
    const grade = this.props.grade || (score > 7.5 ? 'Cryptographic High' : score > 5.0 ? 'Obfuscated' : 'Plaintext');

    this.element.innerHTML = `
      <div class="m-entropy-gauge__header">
        <span class="m-entropy-gauge__label">${label}</span>
        <span class="m-entropy-gauge__score">${score.toFixed(3)} / ${max.toFixed(1)}</span>
      </div>
      <div class="m-entropy-gauge__bar-track">
        <div class="m-entropy-gauge__bar-fill" style="width: ${pct}%"></div>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94A3B8; margin-top: 4px;">
        <span>Grade: ${grade}</span>
        <span>${pct.toFixed(1)}% Saturation</span>
      </div>
    `;
  }

  public update(props: Partial<EntropyGaugeProps>): void {
    this.props = { ...this.props, ...props };
    this.render();
  }
}
