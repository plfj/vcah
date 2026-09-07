import { MetricPillAtom } from '../atoms/MetricPillAtom';
import { SearchBarMolecule } from '../molecules/SearchBarMolecule';

export interface OpcodeEntry {
  originalOp: string;
  scrambledHex: string;
  category: string;
  defenseMechanism: string;
}

export interface InspectionDashboardProps {
  originalSize?: number;
  obfuscatedSize?: number;
  entropy?: number;
  expansionRatio?: number;
  decompilerResistance?: number;
  antiTamperScore?: number;
  opcodeMappings?: OpcodeEntry[];
}

export class InspectionDashboardOrganism {
  public readonly element: HTMLElement;
  private tableBody: HTMLTableSectionElement;
  private searchBar: SearchBarMolecule;
  private filterQuery = '';

  constructor(private props: InspectionDashboardProps = {}) {
    this.element = document.createElement('section');
    this.element.className = 'o-inspection-dashboard';

    // Search bar
    this.searchBar = new SearchBarMolecule({
      onSearch: (q) => {
        this.filterQuery = q.toLowerCase();
        this.renderTableRows();
      },
    });

    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'o-inspection-dashboard__table-wrapper';

    const table = document.createElement('table');
    table.className = 'o-inspection-dashboard__table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Original CPython Opcode</th>
          <th>Scrambled Byte (ISA)</th>
          <th>Instruction Category</th>
          <th>Active Defense Shield</th>
        </tr>
      </thead>
    `;

    this.tableBody = document.createElement('tbody');
    table.appendChild(this.tableBody);
    tableWrapper.appendChild(table);

    this.render();
    this.element.appendChild(this.searchBar.element);
    this.element.appendChild(tableWrapper);
    this.renderTableRows();
  }

  public render(): void {
    const orig = this.props.originalSize || 382;
    const obf = this.props.obfuscatedSize || 14820;
    const ent = this.props.entropy || 7.942;
    const ratio = this.props.expansionRatio || Number((obf / (orig || 1)).toFixed(1));
    const decomp = this.props.decompilerResistance || 99.9;
    const tamper = this.props.antiTamperScore || 100.0;

    let kpiContainer = this.element.querySelector('.o-inspection-dashboard__kpi-grid');
    if (!kpiContainer) {
      kpiContainer = document.createElement('div');
      kpiContainer.className = 'o-inspection-dashboard__kpi-grid';
      this.element.prepend(kpiContainer);
    }
    kpiContainer.innerHTML = '';

    const p1 = new MetricPillAtom({ label: 'Original Source', value: `${orig.toLocaleString()} B` });
    const p2 = new MetricPillAtom({ label: 'Protected Nucleus', value: `${obf.toLocaleString()} B` });
    const p3 = new MetricPillAtom({ label: 'Shannon Bytecode Entropy', value: `${ent.toFixed(3)} / 8.0` });
    const p4 = new MetricPillAtom({ label: 'Expansion Ratio', value: `${ratio}x` });
    const p5 = new MetricPillAtom({ label: 'Decompiler Resistance', value: `${decomp}%` });
    const p6 = new MetricPillAtom({ label: 'Hardware Anti-Tamper', value: `${tamper}%` });

    kpiContainer.appendChild(p1.element);
    kpiContainer.appendChild(p2.element);
    kpiContainer.appendChild(p3.element);
    kpiContainer.appendChild(p4.element);
    kpiContainer.appendChild(p5.element);
    kpiContainer.appendChild(p6.element);
  }

  private renderTableRows(): void {
    const defaultMappings: OpcodeEntry[] = [
      { originalOp: 'LOAD_CONST', scrambledHex: '0x3F', category: 'Memory & Addressing', defenseMechanism: 'Polymorphic Variable Offset' },
      { originalOp: 'STORE_NAME', scrambledHex: '0xA7', category: 'Memory & Addressing', defenseMechanism: 'CJK Shadow Symbol Table' },
      { originalOp: 'LOAD_NAME', scrambledHex: '0x1C', category: 'Memory & Addressing', defenseMechanism: 'Dynamic Local Scope Scrambler' },
      { originalOp: 'CALL_FUNCTION', scrambledHex: '0x88', category: 'Call Dispatcher', defenseMechanism: 'Indirect Dispatch Table' },
      { originalOp: 'POP_TOP', scrambledHex: '0x02', category: 'Stack Operation', defenseMechanism: 'Junk Push/Pop Insertion' },
      { originalOp: 'COMPARE_OP', scrambledHex: '0xE1', category: 'Condition & Branch', defenseMechanism: 'Opaque Boolean Predicates' },
      { originalOp: 'JUMP_FORWARD', scrambledHex: '0x5C', category: 'Control Flow', defenseMechanism: 'Aegis CFF 8-State Switch' },
      { originalOp: 'RETURN_VALUE', scrambledHex: '0xFA', category: 'Return & Exit', defenseMechanism: 'Volatile Frame Scrubber' },
      { originalOp: 'BINARY_ADD', scrambledHex: '0x4D', category: 'Arithmetic ALU', defenseMechanism: 'Bitwise MBA Invariant Transform' },
      { originalOp: 'BUILD_LIST', scrambledHex: '0x99', category: 'Object Allocation', defenseMechanism: 'RAM Heap Decryption Guard' },
    ];

    const data = this.props.opcodeMappings && this.props.opcodeMappings.length > 0
      ? this.props.opcodeMappings
      : defaultMappings;

    const filtered = data.filter(
      (item) =>
        item.originalOp.toLowerCase().includes(this.filterQuery) ||
        item.scrambledHex.toLowerCase().includes(this.filterQuery) ||
        item.category.toLowerCase().includes(this.filterQuery) ||
        item.defenseMechanism.toLowerCase().includes(this.filterQuery)
    );

    this.tableBody.innerHTML = '';
    if (filtered.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #86868B; padding: 24px;">No matching opcodes found.</td></tr>`;
      return;
    }

    filtered.forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: monospace; font-weight: 600; color: #2997FF;">${item.originalOp}</td>
        <td style="font-family: monospace; color: #30D158;">${item.scrambledHex}</td>
        <td style="color: #86868B;">${item.category}</td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 6px; padding: 2px 8px; background: rgba(0, 113, 227, 0.12); border: 1px solid rgba(0, 113, 227, 0.25); border-radius: 980px; font-size: 0.72rem; color: #F5F5F7;">
            <span style="width: 5px; height: 5px; border-radius: 50%; background: #30D158;"></span>
            ${item.defenseMechanism}
          </span>
        </td>
      `;
      this.tableBody.appendChild(tr);
    });
  }

  public update(props: Partial<InspectionDashboardProps>): void {
    this.props = { ...this.props, ...props };
    this.render();
    this.renderTableRows();
  }
}
