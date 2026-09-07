import { Injectable } from '@nestjs/common';
import { VmSimulatorPort } from '../../application/ports/vm-simulator.port';
import { VmExecutionTrace, InstructionCycle, RegisterState } from '../../domain/entities';

@Injectable()
export class DeterministicVmSimulatorAdapter implements VmSimulatorPort {
  async simulate(bytecode: string, seed: number, maxCycles = 64): Promise<VmExecutionTrace> {
    const initialRegs: RegisterState = {
      rip: 0x0000,
      rsp: 0x07F0,
      rflags: 0x0002, // IF bit
      r0: seed & 0xFFFF,
      r1: 0x0000,
      r2: 0x0000,
      r3: 0x0000,
    };

    const cycles: InstructionCycle[] = [];
    let rip = 0x0000;
    let rsp = 0x07F0;
    let r0 = initialRegs.r0;

    const syntheticOpcodes = [
      { name: 'TAMPER_SENTINEL', hex: '0xFD', op: 0xCAFEBABE, state: 'STATE_INIT' },
      { name: 'ANTI_DEBUG_PROBE', hex: '0xFE', op: 0x0001, state: 'STATE_PROBE' },
      { name: 'RAM_DECRYPT_128B', hex: '0xFC', op: 128, state: 'STATE_JIT_PAGE' },
      { name: 'PUSH_CONST', hex: '0x10', op: 42, state: 'STATE_EXEC_0' },
      { name: 'STORE_FAST', hex: '0x15', op: 1, state: 'STATE_EXEC_0' },
      { name: 'LOAD_FAST', hex: '0x14', op: 1, state: 'STATE_EXEC_1' },
      { name: 'BINARY_ADD', hex: '0x20', op: null, state: 'STATE_EXEC_1' },
      { name: 'CFF_DISPATCH', hex: '0xF0', op: 0x2B9C, state: 'STATE_CFF_TRAMPOLINE' },
      { name: 'OPAQUE_JUMP', hex: '0xF2', op: 0x00FF, state: 'STATE_OPAQUE_DISPATCH' },
      { name: 'RETURN_VALUE', hex: '0x53', op: null, state: 'STATE_EPILOGUE' },
    ];

    const iterations = Math.min(maxCycles, syntheticOpcodes.length);
    for (let i = 0; i < iterations; i++) {
      const op = syntheticOpcodes[i];
      rip += op.op !== null ? 5 : 2;
      if (op.name === 'PUSH_CONST') rsp -= 8;
      if (op.name === 'RETURN_VALUE') rsp += 8;
      r0 = (r0 * 31 + i) & 0xFFFF;

      cycles.push({
        cycleIndex: i + 1,
        opcodeName: op.name,
        scrambledHex: op.hex,
        operand: op.op,
        stackDepth: Math.max(0, Math.floor((0x07F0 - rsp) / 8)),
        stateTag: op.state,
      });
    }

    const finalRegs: RegisterState = {
      rip,
      rsp,
      rflags: 0x0046, // ZF + PF + IF
      r0,
      r1: 0x002A,
      r2: 0x1A4F,
      r3: 0x0000,
    };

    return new VmExecutionTrace(
      `trace_${seed}_${Date.now()}`,
      cycles.length,
      initialRegs,
      finalRegs,
      cycles,
      0,
      true
    );
  }
}
