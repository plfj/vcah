export interface StatusBarMoleculeProps {
  pythonVersion: string;
  architecture: string;
  status: string;
}

export class StatusBarMolecule {
  public readonly element: HTMLDivElement;

  constructor(private props: StatusBarMoleculeProps) {
    this.element = document.createElement('div');
    this.element.className = 'm-status-bar';
    this.render();
  }

  public render(): void {
    this.element.innerHTML = `
      <div class="m-status-bar__group">
        <div class="m-status-bar__item">
          <span>Python:</span>
          <strong>${this.props.pythonVersion}</strong>
        </div>
        <div class="m-status-bar__item">
          <span>Arch:</span>
          <strong>${this.props.architecture}</strong>
        </div>
      </div>
      <div class="m-status-bar__group">
        <div class="m-status-bar__item">
          <span>Status:</span>
          <strong>${this.props.status}</strong>
        </div>
      </div>
    `;
  }

  public update(props: Partial<StatusBarMoleculeProps>): void {
    this.props = { ...this.props, ...props };
    this.render();
  }
}
