import { ButtonAtom } from '../atoms/ButtonAtom';
import { BadgeAtom } from '../atoms/BadgeAtom';

export interface NavbarOrganismProps {
  title?: string;
  onObfuscate?: () => void;
  onSimulate?: () => void;
  isLoading?: boolean;
}

export class NavbarOrganism {
  public readonly element: HTMLElement;
  private obfuscateBtn: ButtonAtom;
  private simulateBtn: ButtonAtom;

  constructor(private props: NavbarOrganismProps) {
    this.element = document.createElement('header');
    this.element.className = 'o-navbar';

    const brand = document.createElement('div');
    brand.className = 'o-navbar__brand';
    brand.innerHTML = `
      <div class="o-navbar__logo" title="PyVM Engine">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      </div>
      <div class="o-navbar__title">${this.props.title || 'PyVM Virtualizer'}</div>
    `;

    const badge = new BadgeAtom({ label: 'Apple Pro • Native Rust', variant: 'cyan' });
    brand.appendChild(badge.element);

    const actions = document.createElement('div');
    actions.className = 'o-navbar__actions';

    this.simulateBtn = new ButtonAtom({
      label: 'Simulate Trace',
      variant: 'secondary',
      onClick: () => this.props.onSimulate?.(),
    });

    this.obfuscateBtn = new ButtonAtom({
      label: this.props.isLoading ? 'Virtualizing...' : 'Virtualize Code',
      variant: 'primary',
      onClick: () => this.props.onObfuscate?.(),
    });

    actions.appendChild(this.simulateBtn.element);
    actions.appendChild(this.obfuscateBtn.element);

    this.element.appendChild(brand);
    this.element.appendChild(actions);
  }

  public setLoading(loading: boolean): void {
    this.props.isLoading = loading;
    this.obfuscateBtn.setLabel(loading ? 'Virtualizing...' : 'Virtualize Code');
    this.obfuscateBtn.setDisabled(loading);
  }
}
