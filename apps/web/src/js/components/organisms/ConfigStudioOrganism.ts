import { ToggleAtom } from '../atoms/ToggleAtom';
import { InputAtom } from '../atoms/InputAtom';
import { ButtonAtom } from '../atoms/ButtonAtom';
import { PresetSelectorMolecule, PresetItem } from '../molecules/PresetSelectorMolecule';
import { AppleToast } from '../molecules/ToastMolecule';

export interface ConfigStudioOrganismProps {
  config: Record<string, any>;
  presets: PresetItem[];
  selectedPresetId: string;
  onPresetSelect: (presetId: string) => void;
  onConfigChange: (config: Record<string, any>) => void;
}

export class ConfigStudioOrganism {
  public readonly element: HTMLElement;
  private presetSelector: PresetSelectorMolecule;

  constructor(private props: ConfigStudioOrganismProps) {
    this.element = document.createElement('aside');
    this.element.className = 'o-config-studio';

    this.presetSelector = new PresetSelectorMolecule({
      presets: this.props.presets,
      activeId: this.props.selectedPresetId,
      onSelect: (id) => this.props.onPresetSelect(id),
    });

    this.render();
  }

  public render(): void {
    this.element.innerHTML = '';

    // ==========================================
    // 1. Obfuscation Intensity & Core Options Panel
    // ==========================================
    const intensitySection = document.createElement('div');
    intensitySection.className = 'o-config-studio__section';
    intensitySection.innerHTML = `
      <div class="o-config-studio__section-title">
        <span>Obfuscation Intensity & Modules</span>
        <span class="o-config-studio__section-badge" style="background: rgba(41, 151, 255, 0.15); color: #2997ff;">
          Active Shield
        </span>
      </div>
    `;

    const intensityCard = document.createElement('div');
    intensityCard.className = 'o-config-studio__group-card o-config-studio__group-card--highlight';

    // Intensity Tiers Selector Grid
    const intensityGrid = document.createElement('div');
    intensityGrid.className = 'o-config-studio__intensity-grid';

    const currentIntensity = this.props.config.intensityLevel || 'maximum';

    const intensityTiers = [
      { id: 'standard', name: 'Standard', size: '~98 KB', desc: 'Compact payload with 16KB raw bytes' },
      { id: 'high', name: 'High', size: '~262 KB', desc: 'Dense onion stream with 64KB raw bytes' },
      { id: 'maximum', name: 'Maximum', size: '~524 KB', desc: 'Heavy-duty protection with 128KB raw bytes' },
      { id: 'jumbo_extreme', name: 'Jumbo Extreme', size: '~1.05 MB+', desc: 'Very large bytes (256KB+ raw stream)' },
    ];

    intensityTiers.forEach((tier) => {
      const card = document.createElement('div');
      card.className = `o-config-studio__intensity-card ${tier.id === currentIntensity ? 'o-config-studio__intensity-card--active' : ''}`;
      card.innerHTML = `
        <div class="o-config-studio__intensity-header">
          <span class="o-config-studio__intensity-name">${tier.name}</span>
          <span class="o-config-studio__intensity-size">${tier.size}</span>
        </div>
        <div class="o-config-studio__intensity-desc">${tier.desc}</div>
      `;

      card.addEventListener('click', () => {
        this.props.onConfigChange({
          ...this.props.config,
          intensityLevel: tier.id,
          largeBytesPayload: true,
        });
        AppleToast.show({
          title: `Intensity: ${tier.name}`,
          message: `Payload calibrated to ${tier.size} with encrypted in-RAM stream.`,
          variant: 'info',
          duration: 2500,
        });
        this.render();
      });

      intensityGrid.appendChild(card);
    });

    intensityCard.appendChild(intensityGrid);

    // Toggleable Options explicitly named by the user
    const coreToggles = [
      {
        key: 'opcodeRemapping',
        syncKey: 'opcodeScrambling',
        name: 'Opcode Remapping',
        tag: 'Polymorphic ISA',
        tagClass: 'o-config-studio__tag-pill--cyan',
        desc: 'Remaps CPython instruction opcodes into custom virtual machine bytecodes.',
        defaultVal: true,
      },
      {
        key: 'controlFlowFlattening',
        syncKey: 'machineLevelCFF',
        name: 'Control Flow Flattening',
        tag: 'Aegis CFF',
        tagClass: 'o-config-studio__tag-pill--purple',
        desc: '8-state algebraic switch dispatcher flattening blocks with opaque boolean invariants.',
        defaultVal: true,
      },
      {
        key: 'entropyRandomization',
        syncKey: 'masterKeystreamEncryption',
        name: 'Entropy Randomization',
        tag: 'Shannon 7.99',
        tagClass: 'o-config-studio__tag-pill--emerald',
        desc: 'Scatters bitwise entropy across memory pages with pseudo-random junk injection.',
        defaultVal: true,
      },
      {
        key: 'hideImports',
        name: 'Ultra-Hidden Imports',
        tag: 'Zero "import"',
        tagClass: 'o-config-studio__tag-pill--amber',
        desc: '100% elimination of plain "import" keywords via XOR dynamic reflection loader.',
        defaultVal: true,
      },
      {
        key: 'largeBytesPayload',
        name: 'Very Large Bytes (Jumbo Stream)',
        tag: 'Jumbo Bytes',
        tagClass: 'o-config-studio__tag-pill--jumbo',
        desc: 'Expands raw encrypted bytecode stream into massive multi-chunk payloads.',
        defaultVal: true,
      },
    ];

    coreToggles.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'o-config-studio__setting-row';

      const info = document.createElement('div');
      info.className = 'o-config-studio__setting-info';
      info.innerHTML = `
        <div class="o-config-studio__setting-title-wrap">
          <span class="o-config-studio__setting-name">${item.name}</span>
          <span class="o-config-studio__tag-pill ${item.tagClass}">${item.tag}</span>
        </div>
        <span class="o-config-studio__setting-desc">${item.desc}</span>
      `;

      const isChecked = this.props.config[item.key] ?? item.defaultVal;

      const toggle = new ToggleAtom({
        checked: isChecked,
        onChange: (val) => {
          const updated: Record<string, any> = {
            ...this.props.config,
            [item.key]: val,
          };
          if (item.syncKey) {
            updated[item.syncKey] = val;
          }
          this.props.onConfigChange(updated);
          AppleToast.show({
            title: item.name,
            message: val ? 'Enabled for upcoming compilation cycle' : 'Disabled',
            variant: val ? 'success' : 'warning',
            duration: 1800,
          });
        },
      });

      row.appendChild(info);
      row.appendChild(toggle.element);
      intensityCard.appendChild(row);
    });

    intensitySection.appendChild(intensityCard);
    this.element.appendChild(intensitySection);

    // ==========================================
    // 2. Hardware Virtualization Presets Section
    // ==========================================
    const presetsSection = document.createElement('div');
    presetsSection.className = 'o-config-studio__section';
    presetsSection.innerHTML = `<div class="o-config-studio__section-title">Hardware Virtualization Presets</div>`;
    presetsSection.appendChild(this.presetSelector.element);
    this.element.appendChild(presetsSection);

    // ==========================================
    // 3. Cryptographic Parameters Section
    // ==========================================
    const cryptoSection = document.createElement('div');
    cryptoSection.className = 'o-config-studio__section';
    cryptoSection.innerHTML = `<div class="o-config-studio__section-title">Cryptographic Parameters</div>`;

    const cryptoCard = document.createElement('div');
    cryptoCard.className = 'o-config-studio__group-card';

    const seedRow = document.createElement('div');
    seedRow.className = 'o-config-studio__setting-row';

    const seedInfo = document.createElement('div');
    seedInfo.className = 'o-config-studio__setting-info';
    seedInfo.innerHTML = `
      <span class="o-config-studio__setting-name">Opcode Scrambler Seed</span>
      <span class="o-config-studio__setting-desc">32-bit hardware PRNG entropy seed</span>
    `;

    const inputWrap = document.createElement('div');
    inputWrap.style.display = 'flex';
    inputWrap.style.alignItems = 'center';
    inputWrap.style.gap = '8px';

    const seedInput = new InputAtom({
      value: String(this.props.config.opcodeSeed || 884721),
      placeholder: 'e.g. 884721',
      isMono: true,
      onInput: (val) => {
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          this.props.onConfigChange({ ...this.props.config, opcodeSeed: num });
        }
      },
    });

    const diceBtn = new ButtonAtom({
      label: '🎲',
      variant: 'secondary',
      onClick: () => {
        const newSeed = Math.floor(100000 + Math.random() * 900000);
        seedInput.setValue(String(newSeed));
        this.props.onConfigChange({ ...this.props.config, opcodeSeed: newSeed });
        AppleToast.show({
          title: 'Seed Randomized',
          message: `New PRNG entropy seed: ${newSeed}`,
          variant: 'info',
          duration: 1800,
        });
      },
    });

    inputWrap.appendChild(seedInput.element);
    inputWrap.appendChild(diceBtn.element);

    seedRow.appendChild(seedInfo);
    seedRow.appendChild(inputWrap);
    cryptoCard.appendChild(seedRow);
    cryptoSection.appendChild(cryptoCard);
    this.element.appendChild(cryptoSection);

    // ==========================================
    // 4. Native Hardening Modules (Apple Preferences Card)
    // ==========================================
    const modulesSection = document.createElement('div');
    modulesSection.className = 'o-config-studio__section';
    modulesSection.innerHTML = `<div class="o-config-studio__section-title">Hardware Hardening Modules</div>`;

    const modulesCard = document.createElement('div');
    modulesCard.className = 'o-config-studio__group-card';

    const modules = [
      { key: 'nativeRustVirtualization', name: 'Native Rust VM Core', desc: 'Isolated execution interpreter with PEP 384 Limited API' },
      { key: 'chunkedRamDecryption128B', name: '128-Byte Chunked RAM Decryption', desc: 'On-demand page decrypt and zeroing memory scrubber' },
      { key: 'activeKernelAntiDebug', name: 'Hardware Anti-Debug (DR0-DR7)', desc: 'Hardware breakpoint detection and debugger evasion' },
      { key: 'peStrippingSymbolErasure', name: 'Symbol Stripping & Erasure', desc: 'Complete frame name and variable symbol erasure' },
      { key: 'polymorphicInstructionSub', name: 'Polymorphic Instruction Sub', desc: 'Mutates opcode encodings on each compile cycle' },
      { key: 'silentMemoryCorruption', name: 'Silent Memory Corruption', desc: 'Destabilizes tampering debugger contexts silently' },
      { key: 'callSiteRamScrubber', name: 'Call-Site RAM Scrubber', desc: 'Zeroes out memory frames immediately after invocation' },
    ];

    modules.forEach((mod) => {
      const row = document.createElement('div');
      row.className = 'o-config-studio__setting-row';

      const info = document.createElement('div');
      info.className = 'o-config-studio__setting-info';
      info.innerHTML = `
        <span class="o-config-studio__setting-name">${mod.name}</span>
        <span class="o-config-studio__setting-desc">${mod.desc}</span>
      `;

      const toggle = new ToggleAtom({
        checked: this.props.config[mod.key] ?? true,
        onChange: (checked) => {
          this.props.onConfigChange({
            ...this.props.config,
            [mod.key]: checked,
          });
        },
      });

      row.appendChild(info);
      row.appendChild(toggle.element);
      modulesCard.appendChild(row);
    });

    modulesSection.appendChild(modulesCard);
    this.element.appendChild(modulesSection);
  }

  public update(props: Partial<ConfigStudioOrganismProps>): void {
    this.props = { ...this.props, ...props };
    if (props.presets) {
      this.presetSelector.update({ presets: props.presets });
    }
    if (props.selectedPresetId) {
      this.presetSelector.setActiveId(props.selectedPresetId);
    }
    this.render();
  }
}
