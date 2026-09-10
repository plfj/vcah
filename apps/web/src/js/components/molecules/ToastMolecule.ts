export interface ToastOptions {
  title: string;
  message: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export class AppleToast {
  private static container: HTMLElement | null = null;

  private static ensureContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'apple-dynamic-island';
      this.container.style.position = 'fixed';
      this.container.style.top = '16px';
      this.container.style.left = '50%';
      this.container.style.transform = 'translateX(-50%)';
      this.container.style.zIndex = '9999';
      this.container.style.display = 'flex';
      this.container.style.flexDirection = 'column';
      this.container.style.alignItems = 'center';
      this.container.style.gap = '8px';
      this.container.style.pointerEvents = 'none';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  public static show(opts: ToastOptions): void {
    const parent = this.ensureContainer();
    const el = document.createElement('div');
    el.style.pointerEvents = 'auto';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.gap = '12px';
    el.style.padding = '10px 18px';
    el.style.borderRadius = '980px';
    el.style.background = 'rgba(28, 28, 30, 0.88)';
    el.style.backdropFilter = 'blur(24px) saturate(180%)';
    el.style.setProperty('-webkit-backdrop-filter', 'blur(24px) saturate(180%)');
    el.style.border = '1px solid rgba(255, 255, 255, 0.16)';
    el.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3)';
    el.style.transform = 'translateY(-20px) scale(0.9)';
    el.style.opacity = '0';
    el.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    el.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';

    const iconColor = opts.variant === 'success' ? '#30D158' : opts.variant === 'error' ? '#FF453A' : '#0071E3';
    const iconSymbol = opts.variant === 'success' ? '✓' : opts.variant === 'error' ? '!' : '';

    const iconBadge = document.createElement('div');
    iconBadge.style.width = '22px';
    iconBadge.style.height = '22px';
    iconBadge.style.borderRadius = '50%';
    iconBadge.style.background = iconColor;
    iconBadge.style.display = 'flex';
    iconBadge.style.alignItems = 'center';
    iconBadge.style.justifyContent = 'center';
    iconBadge.style.color = 'white';
    iconBadge.style.fontSize = '12px';
    iconBadge.style.fontWeight = 'bold';
    iconBadge.style.flexShrink = '0';
    iconBadge.style.boxShadow = `0 0 10px ${iconColor}66`;
    iconBadge.textContent = iconSymbol;

    const textGroup = document.createElement('div');
    textGroup.style.display = 'flex';
    textGroup.style.flexDirection = 'column';
    textGroup.style.gap = '1px';

    const titleSpan = document.createElement('span');
    titleSpan.style.fontSize = '0.8125rem';
    titleSpan.style.fontWeight = '600';
    titleSpan.style.color = '#F5F5F7';
    titleSpan.style.letterSpacing = '-0.01em';
    titleSpan.textContent = opts.title;

    const msgSpan = document.createElement('span');
    msgSpan.style.fontSize = '0.75rem';
    msgSpan.style.color = '#86868B';
    msgSpan.style.letterSpacing = '-0.01em';
    msgSpan.textContent = opts.message;

    textGroup.appendChild(titleSpan);
    textGroup.appendChild(msgSpan);

    el.appendChild(iconBadge);
    el.appendChild(textGroup);

    parent.appendChild(el);

    // Spring entrance
    requestAnimationFrame(() => {
      el.style.transform = 'translateY(0) scale(1)';
      el.style.opacity = '1';
    });

    // Auto dismiss
    const duration = opts.duration || 3200;
    setTimeout(() => {
      el.style.transform = 'translateY(-15px) scale(0.92)';
      el.style.opacity = '0';
      setTimeout(() => {
        el.remove();
      }, 400);
    }, duration);
  }
}
