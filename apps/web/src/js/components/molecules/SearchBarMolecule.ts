export interface SearchBarMoleculeProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
}

export class SearchBarMolecule {
  public readonly element: HTMLDivElement;
  private inputElement: HTMLInputElement;

  constructor(private props: SearchBarMoleculeProps) {
    this.element = document.createElement('div');
    this.element.className = 'm-search-bar';

    this.element.innerHTML = `
      <span class="m-search-bar__icon">🔍</span>
    `;

    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.className = 'm-search-bar__input';
    this.inputElement.placeholder = this.props.placeholder || 'Filter opcodes, registers, symbols...';
    this.inputElement.value = this.props.value || '';

    this.inputElement.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      this.props.onSearch(val);
    });

    this.element.appendChild(this.inputElement);
  }

  public setValue(val: string): void {
    this.inputElement.value = val;
  }

  public getValue(): string {
    return this.inputElement.value;
  }
}
