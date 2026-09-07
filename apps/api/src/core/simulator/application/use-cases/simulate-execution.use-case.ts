import { Injectable, Inject } from '@nestjs/common';
import { VmSimulatorPort } from '../ports/vm-simulator.port';
import { VmExecutionTrace } from '../../domain/entities';

export interface SimulateExecutionCommand {
  bytecode: string;
  seed?: number;
  maxCycles?: number;
}

@Injectable()
export class SimulateExecutionUseCase {
  constructor(
    @Inject('VmSimulatorPort') private readonly vmSimulatorPort: VmSimulatorPort
  ) {}

  async execute(command: SimulateExecutionCommand): Promise<VmExecutionTrace> {
    const seed = command.seed ?? 884721;
    const maxCycles = command.maxCycles ?? 64;

    return this.vmSimulatorPort.simulate(command.bytecode, seed, maxCycles);
  }
}
