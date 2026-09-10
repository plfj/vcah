import { ButtonAtom } from '../atoms/ButtonAtom';
import { BadgeAtom } from '../atoms/BadgeAtom';
import { AppleToast } from '../molecules/ToastMolecule';
import JSZip from 'jszip';

export interface CodeEditorWorkspaceProps {
  sourceCode: string;
  obfuscatedCode: string;
  uploadedFileName?: string;
  fileSize?: number;
  lineCount?: number;
  onSourceChange: (code: string, fileName?: string) => void;
  onObfuscateTrigger?: () => void;
}

export class CodeEditorWorkspaceOrganism {
  public readonly element: HTMLElement;
  private sourceTextarea: HTMLTextAreaElement;
  private outputTextarea: HTMLTextAreaElement;
  private copyBtn: ButtonAtom;
  private downloadPyBtn: ButtonAtom;
  private downloadZipBtn: ButtonAtom;
  private fileInput: HTMLInputElement;
  private fileBadgeLabel: HTMLElement;
  private rightInfoLabel: HTMLElement;
  private statStrip: HTMLElement;
  private currentFileName: string = 'hardware_license.py';

  constructor(private props: CodeEditorWorkspaceProps) {
    if (props.uploadedFileName) {
      this.currentFileName = props.uploadedFileName;
    }

    this.element = document.createElement('section');
    this.element.className = 'o-editor-workspace';
    this.element.id = 'pyvm-editor-workspace-section';

    // Toolbar styled with macOS window chrome
    const toolbar = document.createElement('div');
    toolbar.className = 'o-editor-workspace__toolbar';
    toolbar.id = 'pyvm-workspace-toolbar';

    const leftToolbar = document.createElement('div');
    leftToolbar.style.display = 'flex';
    leftToolbar.style.alignItems = 'center';
    leftToolbar.style.gap = '8px';

    const macDots = document.createElement('div');
    macDots.className = 'o-editor-workspace__mac-dots';
    macDots.id = 'pyvm-mac-window-controls';
    macDots.innerHTML = `
      <div class="o-editor-workspace__mac-dot o-editor-workspace__mac-dot--close" title="Close" id="mac-btn-close"></div>
      <div class="o-editor-workspace__mac-dot o-editor-workspace__mac-dot--min" title="Minimize" id="mac-btn-min"></div>
      <div class="o-editor-workspace__mac-dot o-editor-workspace__mac-dot--max" title="Full Screen" id="mac-btn-max"></div>
    `;
    leftToolbar.appendChild(macDots);

    const sourceBadge = new BadgeAtom({ label: 'Python 3.8 - 3.14 • PEP 384 Native VM', variant: 'cyan' });
    leftToolbar.appendChild(sourceBadge.element);

    const rightToolbar = document.createElement('div');
    rightToolbar.className = 'o-editor-workspace__actions-group';
    rightToolbar.id = 'pyvm-workspace-actions';

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
        this.currentFileName = 'hardware_license.py';
        this.sourceTextarea.value = sample;
        this.updateFileMeta(this.currentFileName, sample.length, sample.split('\n').length);
        this.props.onSourceChange(sample, this.currentFileName);
        AppleToast.show({
          title: 'Sample Code Loaded',
          message: 'Loaded enterprise cryptographic license verification source.',
          variant: 'info',
          duration: 2000,
        });
      },
    });
    sampleBtn.element.id = 'btn-load-sample-code';

    const clearBtn = new ButtonAtom({
      label: 'Clear',
      variant: 'secondary',
      onClick: () => {
        this.sourceTextarea.value = '';
        this.currentFileName = 'untitled.py';
        this.updateFileMeta(this.currentFileName, 0, 0);
        this.props.onSourceChange('', this.currentFileName);
      },
    });
    clearBtn.element.id = 'btn-clear-source-code';

    this.copyBtn = new ButtonAtom({
      label: 'Copy Protected Code',
      variant: 'secondary',
      onClick: () => {
        if (this.props.obfuscatedCode) {
          navigator.clipboard?.writeText(this.props.obfuscatedCode);
          this.copyBtn.setLabel('✓ Copied to Clipboard');
          AppleToast.show({
            title: 'Protected Code Copied',
            message: 'In-memory virtualized payload copied to your clipboard.',
            variant: 'success',
            duration: 2500,
          });
          setTimeout(() => this.copyBtn.setLabel('Copy Protected Code'), 2200);
        } else {
          AppleToast.show({
            title: 'No Output Available',
            message: 'Please click "Virtualize Code" to generate protected bytecode first.',
            variant: 'warning',
            duration: 2500,
          });
        }
      },
    });
    this.copyBtn.element.id = 'btn-copy-protected-code';

    this.downloadPyBtn = new ButtonAtom({
      label: 'Download .protected.py',
      variant: 'primary',
      onClick: () => {
        this.downloadProtectedScript();
      },
    });
    this.downloadPyBtn.element.id = 'btn-download-protected-py';

    this.downloadZipBtn = new ButtonAtom({
      label: 'Download Bundle (.zip)',
      variant: 'secondary',
      onClick: () => {
        this.downloadStandaloneBundle();
      },
    });
    this.downloadZipBtn.element.id = 'btn-download-bundle-zip';

    rightToolbar.appendChild(sampleBtn.element);
    rightToolbar.appendChild(clearBtn.element);
    rightToolbar.appendChild(this.copyBtn.element);
    rightToolbar.appendChild(this.downloadPyBtn.element);
    rightToolbar.appendChild(this.downloadZipBtn.element);

    toolbar.appendChild(leftToolbar);
    toolbar.appendChild(rightToolbar);

    // ==========================================
    // Dedicated File Upload & Dragzone Banner Bar
    // ==========================================
    const uploadBar = document.createElement('div');
    uploadBar.className = 'o-editor-workspace__upload-bar';
    uploadBar.id = 'pyvm-upload-banner-bar';

    // Drag-and-drop & manual click dropzone trigger
    const dropzone = document.createElement('div');
    dropzone.className = 'o-editor-workspace__dropzone';
    dropzone.id = 'pyvm-file-dropzone';
    dropzone.title = 'Click to browse or drag & drop Python script (.py, .pyw)';
    dropzone.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <span><strong>Upload Python File</strong> or drag & drop .py / .pyw here</span>
    `;

    // Hidden input file element for manual selection
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.id = 'pyvm-hidden-file-input';
    this.fileInput.accept = '.py,.pyw,.txt';
    this.fileInput.style.display = 'none';

    dropzone.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.handleFileUpload(target.files[0]);
      }
    });

    // Drag and drop event listeners on dropzone
    dropzone.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('o-editor-workspace__dropzone--dragover');
    });

    dropzone.addEventListener('dragleave', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('o-editor-workspace__dropzone--dragover');
    });

    dropzone.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('o-editor-workspace__dropzone--dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    // File metadata indicator
    const fileMetaWrap = document.createElement('div');
    fileMetaWrap.className = 'o-editor-workspace__file-meta';
    fileMetaWrap.id = 'pyvm-file-metadata-wrap';

    this.fileBadgeLabel = document.createElement('span');
    this.fileBadgeLabel.className = 'o-editor-workspace__file-badge';
    this.fileBadgeLabel.id = 'pyvm-file-badge-pill';
    this.fileBadgeLabel.textContent = `📄 ${this.currentFileName} • 840 B • 35 lines`;
    fileMetaWrap.appendChild(this.fileBadgeLabel);

    // Live Stat Strip
    this.statStrip = document.createElement('div');
    this.statStrip.className = 'o-editor-workspace__stat-strip';
    this.statStrip.id = 'pyvm-live-stat-strip';
    this.statStrip.innerHTML = `
      <span>Status: <strong style="color:#22c55e;">Ready</strong></span>
      <span>Target ISA: <strong>Nested Onion VM</strong></span>
    `;

    uploadBar.appendChild(dropzone);
    uploadBar.appendChild(this.fileInput);
    uploadBar.appendChild(fileMetaWrap);
    uploadBar.appendChild(this.statStrip);

    // ==========================================
    // Grid with 2 Editors: Source vs Protected
    // ==========================================
    const grid = document.createElement('div');
    grid.className = 'o-editor-workspace__grid';
    grid.id = 'pyvm-editor-grid';

    // Left Pane (Source)
    const leftPane = document.createElement('div');
    leftPane.className = 'o-editor-workspace__pane';
    leftPane.id = 'pyvm-source-pane';

    // Also support drag & drop directly on the source pane
    leftPane.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      leftPane.classList.add('o-editor-workspace__pane--dragover');
    });

    leftPane.addEventListener('dragleave', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      leftPane.classList.remove('o-editor-workspace__pane--dragover');
    });

    leftPane.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      leftPane.classList.remove('o-editor-workspace__pane--dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    const leftHeader = document.createElement('div');
    leftHeader.className = 'o-editor-workspace__pane-header';
    leftHeader.id = 'pyvm-source-pane-header';
    leftHeader.innerHTML = `
      <span>Input Source Code • Original Python</span>
      <span style="font-family: monospace; opacity: 0.7;">UTF-8 / PEP 8</span>
    `;
    leftPane.appendChild(leftHeader);

    this.sourceTextarea = document.createElement('textarea');
    this.sourceTextarea.className = 'o-editor-workspace__textarea';
    this.sourceTextarea.id = 'pyvm-source-code-textarea';
    this.sourceTextarea.spellcheck = false;
    this.sourceTextarea.placeholder = '# Paste Python code or drag & drop a .py / .pyw file here...';
    this.sourceTextarea.value = this.props.sourceCode;
    this.sourceTextarea.addEventListener('input', (e) => {
      const val = (e.target as HTMLTextAreaElement).value;
      const lines = val ? val.split('\n').length : 0;
      this.updateFileMeta(this.currentFileName, val.length, lines);
      this.props.onSourceChange(val, this.currentFileName);
    });
    leftPane.appendChild(this.sourceTextarea);

    // Right Pane (Protected)
    const rightPane = document.createElement('div');
    rightPane.className = 'o-editor-workspace__pane';
    rightPane.id = 'pyvm-protected-pane';

    const rightHeader = document.createElement('div');
    rightHeader.className = 'o-editor-workspace__pane-header';
    rightHeader.id = 'pyvm-protected-pane-header';

    const rightTitle = document.createElement('span');
    rightTitle.textContent = 'Protected Payload • Native Rust VM Nucleus';
    this.rightInfoLabel = document.createElement('span');
    this.rightInfoLabel.style.fontFamily = 'monospace';
    this.rightInfoLabel.style.opacity = '0.7';
    this.rightInfoLabel.id = 'pyvm-protected-info-badge';
    this.rightInfoLabel.textContent = 'Ready';

    rightHeader.appendChild(rightTitle);
    rightHeader.appendChild(this.rightInfoLabel);
    rightPane.appendChild(rightHeader);

    this.outputTextarea = document.createElement('textarea');
    this.outputTextarea.className = 'o-editor-workspace__textarea';
    this.outputTextarea.id = 'pyvm-protected-code-textarea';
    this.outputTextarea.readOnly = true;
    this.outputTextarea.spellcheck = false;
    this.outputTextarea.placeholder = '# Protected Rust-virtualized bytecode will appear here after clicking "Virtualize Code"...';
    this.outputTextarea.value = this.props.obfuscatedCode;
    rightPane.appendChild(this.outputTextarea);

    grid.appendChild(leftPane);
    grid.appendChild(rightPane);

    this.element.appendChild(toolbar);
    this.element.appendChild(uploadBar);
    this.element.appendChild(grid);
  }

  private handleFileUpload(file: File) {
    if (!file) return;
    const isPythonOrText = file.name.endsWith('.py') || file.name.endsWith('.pyw') || file.name.endsWith('.txt');
    if (!isPythonOrText) {
      AppleToast.show({
        title: 'Unsupported File Extension',
        message: 'Please select a Python script (.py, .pyw) or plain text file.',
        variant: 'warning',
        duration: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === 'string') {
        this.currentFileName = file.name;
        this.sourceTextarea.value = content;
        const lineCount = content.split('\n').length;
        this.updateFileMeta(file.name, file.size, lineCount);
        this.props.onSourceChange(content, file.name);

        AppleToast.show({
          title: 'File Uploaded Successfully',
          message: `Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB, ${lineCount} lines).`,
          variant: 'success',
          duration: 3000,
        });
      }
    };
    reader.onerror = () => {
      AppleToast.show({
        title: 'Upload Error',
        message: 'Could not read the uploaded file contents.',
        variant: 'error',
        duration: 3000,
      });
    };
    reader.readAsText(file, 'utf-8');
  }

  private updateFileMeta(name: string, sizeBytes: number, lines: number) {
    const sizeStr = sizeBytes < 1024 ? `${sizeBytes} B` : `${(sizeBytes / 1024).toFixed(1)} KB`;
    this.fileBadgeLabel.textContent = `📄 ${name} • ${sizeStr} • ${lines} lines`;
  }

  public getProtectedFileName(): string {
    const stem = this.currentFileName.replace(/\.(py|pyw|txt)$/i, '');
    return `${stem}.protected.py`;
  }

  public downloadProtectedScript() {
    if (!this.props.obfuscatedCode) {
      AppleToast.show({
        title: 'Virtualization Required',
        message: 'Run "Virtualize Code" first before downloading.',
        variant: 'warning',
        duration: 2500,
      });
      return;
    }

    const filename = this.getProtectedFileName();
    const blob = new Blob([this.props.obfuscatedCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    AppleToast.show({
      title: 'Download Started',
      message: `Downloaded ${filename} (${(blob.size / 1024).toFixed(1)} KB).`,
      variant: 'success',
      duration: 3500,
    });
  }

  public async downloadStandaloneBundle() {
    if (!this.props.obfuscatedCode) {
      AppleToast.show({
        title: 'Virtualization Required',
        message: 'Run "Virtualize Code" first before generating standalone bundle.',
        variant: 'warning',
        duration: 2500,
      });
      return;
    }

    try {
      const zip = new JSZip();
      const scriptName = this.getProtectedFileName();
      const stem = this.currentFileName.replace(/\.(py|pyw|txt)$/i, '');

      // 1. Protected script
      zip.file(scriptName, this.props.obfuscatedCode);

      // 2. Linux/macOS bash launcher
      const runSh = `#!/usr/bin/env bash
# PyVM Protected Execution Launcher
set -euo pipefail

echo "[PyVM Native] Initializing Virtual Machine Nucleus..."
if command -v python3 &>/dev/null; then
    exec python3 "${scriptName}" "$@"
elif command -v python &>/dev/null; then
    exec python "${scriptName}" "$@"
else
    echo "Error: Python 3.8+ runtime is required." >&2
    exit 1
fi
`;
      zip.file('run.sh', runSh);

      // 3. Windows batch launcher
      const runBat = `@echo off
rem PyVM Protected Execution Launcher (Windows)
echo [PyVM Native] Initializing Virtual Machine Nucleus...
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python "%~dp0${scriptName}" %*
) else (
    where py >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        py -3 "%~dp0${scriptName}" %*
    ) else (
        echo Error: Python 3.8+ runtime not found in PATH.
        pause
    )
)
`;
      zip.file('run.bat', runBat);

      // 4. Security Audit Report
      const readme = `===============================================================
PyVM Virtual Machine Obfuscation Specification & Security Audit
===============================================================
Target Artifact: ${scriptName}
Source Script:   ${this.currentFileName}
Protection Date: ${new Date().toISOString()}

ARCHITECTURE LAYERS:
- Layer 1 (Outer Loader): Dynamic memory bus dispatcher, 128B chunked RAM decryption.
- Layer 2 (Middle Aegis): 8-State flattened control flow switch with algebraic invariants.
- Layer 3 (Inner Core):   Nested Onion VM execution engine with cryptographic witness verification.
- Anti-Debugging Armor:   Hardware breakpoint detection (DR0-DR7), TracerPid inspection,
                          sys.monitoring disarming (Python 3.12+), and call-site RAM scrubber.

HOW TO RUN:
- Linux / macOS:
    chmod +x run.sh
    ./run.sh
- Windows:
    double-click run.bat
- Directly:
    python3 ${scriptName}

Cross-platform compatible with CPython 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, and 3.14.
Zero dependencies required (batteries-included standard runtime).
===============================================================
`;
      zip.file('README_SECURITY.txt', readme);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${stem}_protected_bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      AppleToast.show({
        title: 'Bundle Downloaded',
        message: `Saved ${stem}_protected_bundle.zip with cross-platform launchers.`,
        variant: 'success',
        duration: 3500,
      });
    } catch (err: any) {
      AppleToast.show({
        title: 'Bundle Generation Error',
        message: err.message || 'Failed to assemble zip package.',
        variant: 'error',
        duration: 3500,
      });
    }
  }

  public update(props: Partial<CodeEditorWorkspaceProps>): void {
    this.props = { ...this.props, ...props };
    if (props.uploadedFileName && props.uploadedFileName !== this.currentFileName) {
      this.currentFileName = props.uploadedFileName;
    }
    if (props.obfuscatedCode !== undefined) {
      this.outputTextarea.value = props.obfuscatedCode;
      const bytes = new Blob([props.obfuscatedCode]).size;
      const originalBytes = this.sourceTextarea.value.length || 1;
      const ratio = (bytes / originalBytes).toFixed(1);

      if (bytes > 0) {
        this.rightInfoLabel.textContent = `${(bytes / 1024).toFixed(1)} KB • Hardened`;
        this.statStrip.innerHTML = `
          <span>Output: <strong style="color:#60a5fa;">${(bytes / 1024).toFixed(1)} KB</strong></span>
          <span>Expansion: <strong style="color:#a855f7;">${ratio}x</strong></span>
          <span>Security: <strong style="color:#22c55e;">Hardened VM</strong></span>
        `;
      } else {
        this.rightInfoLabel.textContent = 'Ready';
        this.statStrip.innerHTML = `
          <span>Status: <strong style="color:#22c55e;">Ready</strong></span>
          <span>Target ISA: <strong>Nested Onion VM</strong></span>
        `;
      }
    }
    if (props.sourceCode !== undefined && this.sourceTextarea.value !== props.sourceCode) {
      this.sourceTextarea.value = props.sourceCode;
      const lines = props.sourceCode ? props.sourceCode.split('\n').length : 0;
      this.updateFileMeta(this.currentFileName, props.sourceCode.length, lines);
    }
  }
}
