import { ButtonAtom } from '../atoms/ButtonAtom';
import { BadgeAtom } from '../atoms/BadgeAtom';

export interface CodeEditorWorkspaceProps {
  sourceCode: string;
  obfuscatedCode: string;
  onSourceChange: (code: string) => void;
  onCopyObfuscated?: () => void;
  onDownloadObfuscated?: () => void;
}

export class CodeEditorWorkspaceOrganism {
  public readonly element: HTMLElement;
  private sourceTextarea: HTMLTextAreaElement;
  private outputTextarea: HTMLTextAreaElement;
  private copyBtn: ButtonAtom;
  private rightInfoLabel: HTMLElement;

  constructor(private props: CodeEditorWorkspaceProps) {
    this.element = document.createElement('section');
    this.element.className = 'o-editor-workspace';

    // Toolbar styled as macOS window chrome
    const toolbar = document.createElement('div');
    toolbar.className = 'o-editor-workspace__toolbar';

    const leftToolbar = document.createElement('div');
    leftToolbar.style.display = 'flex';
    leftToolbar.style.alignItems = 'center';

    // macOS window traffic light dots
    const macDots = document.createElement('div');
    macDots.className = 'o-editor-workspace__mac-dots';
    macDots.innerHTML = `
      <div class="o-editor-workspace__mac-dot o-editor-workspace__mac-dot--close" title="Close"></div>
      <div class="o-editor-workspace__mac-dot o-editor-workspace__mac-dot--min" title="Minimize"></div>
      <div class="o-editor-workspace__mac-dot o-editor-workspace__mac-dot--max" title="Full Screen"></div>
    `;
    leftToolbar.appendChild(macDots);

    const sourceBadge = new BadgeAtom({ label: 'CPython 3.7 - 3.14 Bytecode Engine', variant: 'cyan' });
    leftToolbar.appendChild(sourceBadge.element);

    const rightToolbar = document.createElement('div');
    rightToolbar.style.display = 'flex';
    rightToolbar.style.alignItems = 'center';
    rightToolbar.style.gap = '8px';

    const sampleBtn = new ButtonAtom({
      label: 'Load License Sample',
      variant: 'secondary',
      onClick: () => {
        const sample = `# PyVM Enterprise Source: Critical License Verification & Crypto Core
import hashlib
import hmac
import time

def verify_hardware_license(license_key: str, hardware_fingerprint: str) -> bool:
    """Cryptographically validates hardware lock with dynamic timestamp witness."""
    salt_seed = b"X-SEC-7749-PYVM-NATIVE-OBFUSCATION"
    expected = hmac.new(salt_seed, hardware_fingerprint.encode('utf-8'), hashlib.sha256).hexdigest()
    
    if license_key != expected[:32]:
        return False
        
    print(f"[AUTH] Machine {hardware_fingerprint} authorized at cycle {int(time.time())}")
    return True

if __name__ == "__main__":
    hw_id = "A8-93-4B-11-2F-9C"
    auth_token = "c3f81e90b7642a87d291e0a43876cdfa"
    is_valid = verify_hardware_license(auth_token, hw_id)
    print(f"License Verified: {is_valid}")
`;
        this.sourceTextarea.value = sample;
        this.props.onSourceChange(sample);
      },
    });

    this.copyBtn = new ButtonAtom({
      label: 'Copy Protected Code',
      variant: 'secondary',
      onClick: () => {
        if (this.props.obfuscatedCode) {
          navigator.clipboard?.writeText(this.props.obfuscatedCode);
          this.copyBtn.setLabel('✓ Copied to Clipboard');
          setTimeout(() => this.copyBtn.setLabel('Copy Protected Code'), 2200);
        }
      },
    });

    const downloadBtn = new ButtonAtom({
      label: 'Export .py',
      variant: 'accent',
      onClick: () => {
        const blob = new Blob([this.props.obfuscatedCode || ''], { type: 'text/x-python' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'protected_pyvm.py';
        a.click();
        URL.revokeObjectURL(url);
      },
    });

    rightToolbar.appendChild(sampleBtn.element);
    rightToolbar.appendChild(this.copyBtn.element);
    rightToolbar.appendChild(downloadBtn.element);

    toolbar.appendChild(leftToolbar);
    toolbar.appendChild(rightToolbar);

    // Grid with 2 panes
    const grid = document.createElement('div');
    grid.className = 'o-editor-workspace__grid';

    // Left Pane (Source)
    const leftPane = document.createElement('div');
    leftPane.className = 'o-editor-workspace__pane';
    
    const leftHeader = document.createElement('div');
    leftHeader.className = 'o-editor-workspace__pane-header';
    leftHeader.innerHTML = `
      <span>source_module.py • Unprotected Python</span>
      <span style="font-family: monospace; opacity: 0.7;">UTF-8</span>
    `;
    leftPane.appendChild(leftHeader);

    this.sourceTextarea = document.createElement('textarea');
    this.sourceTextarea.className = 'o-editor-workspace__textarea';
    this.sourceTextarea.spellcheck = false;
    this.sourceTextarea.placeholder = '# Paste raw Python source code here or click "Load License Sample" above...';
    this.sourceTextarea.value = this.props.sourceCode;
    this.sourceTextarea.addEventListener('input', (e) => {
      const val = (e.target as HTMLTextAreaElement).value;
      this.props.onSourceChange(val);
    });
    leftPane.appendChild(this.sourceTextarea);

    // Right Pane (Protected)
    const rightPane = document.createElement('div');
    rightPane.className = 'o-editor-workspace__pane';
    
    const rightHeader = document.createElement('div');
    rightHeader.className = 'o-editor-workspace__pane-header';
    
    const rightTitle = document.createElement('span');
    rightTitle.textContent = 'virtualized_nucleus.bin • Native Rust VM Bytecode';
    this.rightInfoLabel = document.createElement('span');
    this.rightInfoLabel.style.fontFamily = 'monospace';
    this.rightInfoLabel.style.opacity = '0.7';
    this.rightInfoLabel.textContent = 'Ready';
    
    rightHeader.appendChild(rightTitle);
    rightHeader.appendChild(this.rightInfoLabel);
    rightPane.appendChild(rightHeader);

    this.outputTextarea = document.createElement('textarea');
    this.outputTextarea.className = 'o-editor-workspace__textarea';
    this.outputTextarea.readOnly = true;
    this.outputTextarea.spellcheck = false;
    this.outputTextarea.placeholder = '# Protected Rust-virtualized bytecode will appear here after clicking "Virtualize Code"...';
    this.outputTextarea.value = this.props.obfuscatedCode;
    rightPane.appendChild(this.outputTextarea);

    grid.appendChild(leftPane);
    grid.appendChild(rightPane);

    this.element.appendChild(toolbar);
    this.element.appendChild(grid);
  }

  public update(props: Partial<CodeEditorWorkspaceProps>): void {
    this.props = { ...this.props, ...props };
    if (props.obfuscatedCode !== undefined) {
      this.outputTextarea.value = props.obfuscatedCode;
      const bytes = new Blob([props.obfuscatedCode]).size;
      this.rightInfoLabel.textContent = bytes > 0 ? `${bytes.toLocaleString()} bytes • Hardened` : 'Ready';
    }
    if (props.sourceCode !== undefined && this.sourceTextarea.value !== props.sourceCode) {
      this.sourceTextarea.value = props.sourceCode;
    }
  }
}
