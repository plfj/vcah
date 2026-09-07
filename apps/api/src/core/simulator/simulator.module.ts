import { Module } from '@nestjs/common';
import { SimulatorController } from './presentation/controllers/simulator.controller';
import { SimulateExecutionUseCase } from './application/use-cases/simulate-execution.use-case';
import { DeterministicVmSimulatorAdapter } from './infrastructure/adapters/deterministic-vm-simulator.adapter';

@Module({
  controllers: [SimulatorController],
  providers: [
    DeterministicVmSimulatorAdapter,
    {
      provide: 'VmSimulatorPort',
      useClass: DeterministicVmSimulatorAdapter,
    },
    SimulateExecutionUseCase,
  ],
  exports: [SimulateExecutionUseCase, 'VmSimulatorPort'],
})
export class SimulatorModule {}
