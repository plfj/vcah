export interface TabItem {
  id: string;
  label: string;
  badge?: string;
}

export interface TabsMoleculeProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
}

export class TabsMolecule {
  public readonly element: HTMLDivElement;

  constructor(private props: TabsMoleculeProps) {
    this.element = document.createElement('div');
    this.element.className = 'm-tabs';
    this.render();
  }

  public render(): void {
    this.element.innerHTML = '';
    this.props.tabs.forEach((tab) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = tab.id === this.props.activeTabId;
      btn.className = `m-tabs__item${isActive ? ' m-tabs__item--active' : ''}`;
      btn.textContent = tab.label;
      if (tab.badge) {
        const badge = document.createElement('span');
        badge.style.marginLeft = '6px';
        badge.style.fontSize = '0.7rem';
        badge.style.opacity = '0.75';
        badge.textContent = tab.badge;
        btn.appendChild(badge);
      }
      btn.onclick = () => {
        if (this.props.activeTabId !== tab.id) {
          this.props.activeTabId = tab.id;
          this.props.onSelectTab(tab.id);
          this.render();
        }
      };
      this.element.appendChild(btn);
    });
  }

  public setActiveTab(id: string): void {
    this.props.activeTabId = id;
    this.render();
  }

  public update(props: Partial<TabsMoleculeProps>): void {
    this.props = { ...this.props, ...props };
    this.render();
  }
}
