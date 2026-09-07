export type CodeTokenType = 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator' | 'plain';

export interface CodeTokenProps {
  token: string;
  type?: CodeTokenType;
}

export class CodeTokenAtom {
  public readonly element: HTMLSpanElement;

  constructor(private props: CodeTokenProps) {
    this.element = document.createElement('span');
    this.render();
  }

  public render(): void {
    const typeClass = this.props.type && this.props.type !== 'plain' 
      ? ` a-code-token--${this.props.type}` 
      : '';
    this.element.className = `a-code-token${typeClass}`;
    this.element.textContent = this.props.token;
  }

  public update(props: Partial<CodeTokenProps>): void {
    this.props = { ...this.props, ...props };
    this.render();
  }
}
