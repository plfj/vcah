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
    
    el.innerHTML = `
      <div style="width: 22px; height: 22px; border-radius: 50%; background: ${iconColor}; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; flex-shrink: 0; box-shadow: 0 0 10px ${iconColor}66;">
        ${opts.variant === 'success' ? '✓' : opts.variant === 'error' ? '!' : ''}
      </div>
      <div style="display: flex; flex-direction: column; gap: 1px;">
        <span style="font-size: 0.8125rem; font-weight: 600; color: #F5F5F7; letter-spacing: -0.01em;">${opts.title}</span>
        <span style="font-size: 0.75rem; color: #86868B; letter-spacing: -0.01em;">${opts.message}</span>
      </div>
    `;

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
