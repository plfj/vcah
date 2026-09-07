import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SimulateExecutionUseCase } from '../../application/use-cases/simulate-execution.use-case';
import { SimulateRequestDto } from '../dto/simulate-request.dto';
import { SimulateResponseDto } from '../dto/simulate-response.dto';

@Controller()
export class SimulatorController {
  constructor(private readonly simulateUseCase: SimulateExecutionUseCase) {}

  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  async simulate(@Body() dto: SimulateRequestDto): Promise<SimulateResponseDto> {
    const trace = await this.simulateUseCase.execute({
      bytecode: dto.bytecode,
      seed: dto.seed,
      maxCycles: dto.maxCycles,
    });

    return {
      traceId: trace.traceId,
      totalCycles: trace.totalCycles,
      initialRegisters: trace.initialRegisters as unknown as Record<string, number>,
      finalRegisters: trace.finalRegisters as unknown as Record<string, number>,
      cycles: trace.cycles,
      exitCode: trace.exitCode,
      verifiedIntegrity: trace.verifiedIntegrity,
    };
  }

  @Post('api/simulate')
  @HttpCode(HttpStatus.OK)
  async simulateApi(@Body() dto: SimulateRequestDto): Promise<SimulateResponseDto> {
    return this.simulate(dto);
  }

  @Post('simulator/run')
  @HttpCode(HttpStatus.OK)
  async simulateRun(@Body() dto: SimulateRequestDto): Promise<SimulateResponseDto> {
    return this.simulate(dto);
  }
}
