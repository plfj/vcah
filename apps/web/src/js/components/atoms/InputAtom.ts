export interface InputAtomProps {
  id?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  isMono?: boolean;
  onInput?: (val: string) => void;
}

export class InputAtom {
  public readonly element: HTMLInputElement;

  constructor(private props: InputAtomProps) {
    this.element = document.createElement('input');
    if (props.id) this.element.id = props.id;
    this.element.type = props.type || 'text';
    this.element.value = props.value || '';
    if (props.placeholder) this.element.placeholder = props.placeholder;
    this.element.className = `a-input ${props.isMono ? 'a-input--mono' : ''}`;

    if (props.onInput) {
      this.element.addEventListener('input', (e) => {
        props.onInput!((e.target as HTMLInputElement).value);
      });
    }
  }

  public getValue(): string {
    return this.element.value;
  }

  public setValue(val: string): void {
    this.element.value = val;
  }
}
