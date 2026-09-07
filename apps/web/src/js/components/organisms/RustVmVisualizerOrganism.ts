import { ButtonAtom } from '../atoms/ButtonAtom';

export interface VmStage {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  metrics?: string;
}

export interface RustVmVisualizerProps {
  stages?: VmStage[];
  currentCycle?: number;
  totalCycles?: number;
}

export class RustVmVisualizerOrganism {
  public readonly element: HTMLElement;
  private currentCycle = 1;
  private cycleCounterEl: HTMLElement | null = null;
  private registerElements: Record<string, HTMLElement> = {};
  private registers = {
    RAX: '0x00007F50564D0001',
    RBX: '0x0000000000000080',
    RCX: '0x00000000884721AF',
    RDX: '0x00007FFED2808E40',
    RSI: '0x000055A89B002100',
    RDI: '0x00007F50564D0010',
    RSP: '0x00007FFED2809000',
    RBP: '0x00007FFED2809040',
    RIP: '0x000055A89B0014C0',
    RFLAGS: '0x0000000000000246',
  };

  constructor(private props: RustVmVisualizerProps = {}) {
    this.element = document.createElement('section');
    this.element.className = 'o-vm-visualizer';
    this.render();
  }

  public render(): void {
    const defaultStages: VmStage[] = [
      {
        id: 'ast',
        title: 'Stage 1: AST Normalizer',
        description: 'Deconstructs CPython bytecode into synthetic register IR representations.',
        status: 'completed',
        metrics: '142 AST Nodes Isolated',
      },
      {
        id: 'cff',
        title: 'Stage 2: Aegis CFF Engine',
        description: 'Flattens all linear basic blocks into an 8-state algebraic switch dispatcher with opaque predicates.',
        status: 'completed',
        metrics: '8 State Invariants, 5 Predicates',
      },
      {
        id: 'crypto',
        title: 'Stage 3: 128B RAM Decryptor',
        description: 'Multi-layer onion keystream encryption with anti-switch witness verification.',
        status: 'completed',
        metrics: 'Shannon Entropy: 7.942 bits/byte',
      },
      {
        id: 'rust_stub',
        title: 'Stage 4: Rust VM Runtime',
        description: 'Isolated in-memory executor running PEP 384 ctypes.pythonapi Limited API binding.',
        status: 'completed',
        metrics: 'Zero Disk Footprint, Pure In-RAM',
      },
    ];

    const stages = this.props.stages || defaultStages;

    this.element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="font-size: 0.9375rem; font-weight: 600; color: #F5F5F7; margin: 0; letter-spacing: -0.015em;">
            Native Rust VM Execution Nucleus
          </h3>
          <p style="font-size: 0.75rem; color: #86868B; margin-top: 2px;">
            Hardware Register Emulation & In-Memory Micro-Kernel State
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.75rem; color: #30D158; font-weight: 500; display: inline-flex; align-items: center; gap: 5px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background-color: #30D158; box-shadow: 0 0 6px rgba(48,209,88,0.7);"></span>
            ACTIVE HARDENED NUCLEUS
          </span>
        </div>
      </div>

      <!-- 4-Stage Pipeline Cards -->
      <div class="o-vm-visualizer__stage-pipeline">
        ${stages
          .map(
            (stage, idx) => `
          <div class="o-vm-visualizer__stage-card o-vm-visualizer__stage-card--active">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="o-vm-visualizer__stage-title">${stage.title}</span>
              <span style="font-size: 0.6875rem; color: #30D158; font-weight: 600;">PASSED</span>
            </div>
            <p style="font-size: 0.75rem; color: #86868B; margin: 0; line-height: 1.45;">
              ${stage.description}
            </p>
            ${
              stage.metrics
                ? `<div style="margin-top: 6px; padding: 4px 8px; background: rgba(0, 113, 227, 0.08); border: 1px solid rgba(0, 113, 227, 0.2); border-radius: 6px; font-size: 0.7rem; font-family: monospace; color: #2997FF;">${stage.metrics}</div>`
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>

      <!-- Interactive VM Hardware Register Suite -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 0.8125rem; font-weight: 600; color: #F5F5F7; letter-spacing: -0.01em;">
            Simulated 64-Bit Micro-Architecture Registers
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span id="cycle-display" style="font-size: 0.75rem; font-family: monospace; color: #86868B;">
              Cycle: ${this.currentCycle} / 128
            </span>
            <button id="step-cycle-btn" class="a-button a-button--sm a-button--secondary">
              Step Instruction Cycle
            </button>
          </div>
        </div>

        <div class="o-vm-visualizer__registers-grid" id="registers-matrix"></div>
      </div>

      <!-- Volatile Memory Hexdump Preview -->
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #86868B;">
          <span>Volatile In-Memory Page Dump (0x7F50564D: 128-Byte Dynamic Chunk)</span>
          <span>Zero Disk Footprint • Hardware DR0 Guarded</span>
        </div>
        <div style="background: rgba(14, 14, 16, 0.7); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 8px; padding: 10px 14px; font-family: monospace; font-size: 0.75rem; color: #98C379; line-height: 1.6; overflow-x: auto;">
          00000000: 7F 50 56 4D 01 00 00 00  D8 21 47 88 4A F1 C3 89  |.PVM.....!G.J...|<br/>
          00000010: 1C 00 A7 01 3F 02 64 00  83 00 00 00 C3 90 90 90  |....?.d.........|<br/>
          00000020: 48 89 E5 48 83 EC 20 48  8B 05 35 12 00 00 48 89  |H..H.. H..5...H.|<br/>
          00000030: 45 F8 48 8B 45 F8 48 83  C0 10 48 89 45 F0 48 8B  |E.H.E.H...H.E.H.|
        </div>
      </div>
    `;

    // Render registers
    const matrix = this.element.querySelector('#registers-matrix');
    if (matrix) {
      matrix.innerHTML = '';
      Object.entries(this.registers).forEach(([reg, val]) => {
        const item = document.createElement('div');
        item.className = 'o-vm-visualizer__reg-item';
        item.innerHTML = `
          <span class="o-vm-visualizer__reg-name">${reg}</span>
          <span class="o-vm-visualizer__reg-val" id="reg-${reg}">${val}</span>
        `;
        matrix.appendChild(item);
        this.registerElements[reg] = item.querySelector(`#reg-${reg}`) as HTMLElement;
      });
    }

    this.cycleCounterEl = this.element.querySelector('#cycle-display');
    const stepBtn = this.element.querySelector('#step-cycle-btn');
    stepBtn?.addEventListener('click', () => this.stepCycle());
  }

  public stepCycle(): void {
    this.currentCycle = (this.currentCycle % 128) + 1;
    if (this.cycleCounterEl) {
      this.cycleCounterEl.textContent = `Cycle: ${this.currentCycle} / 128`;
    }

    // Mutate registers smoothly to simulate live execution
    const randomHex = () => Math.floor(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0').toUpperCase();
    this.registers.RAX = `0x00007F50${randomHex()}`;
    this.registers.RCX = `0x00000000${randomHex()}`;
    this.registers.RIP = `0x000055A8${randomHex()}`;

    if (this.registerElements['RAX']) this.registerElements['RAX'].textContent = this.registers.RAX;
    if (this.registerElements['RCX']) this.registerElements['RCX'].textContent = this.registers.RCX;
    if (this.registerElements['RIP']) this.registerElements['RIP'].textContent = this.registers.RIP;
  }

  public update(props: Partial<RustVmVisualizerProps>): void {
    this.props = { ...this.props, ...props };
    this.render();
  }
}
