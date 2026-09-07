import { VmExecutionTrace } from '../../domain/entities';

export interface VmSimulatorPort {
  simulate(bytecode: string, seed: number, maxCycles: number): Promise<VmExecutionTrace>;
}
