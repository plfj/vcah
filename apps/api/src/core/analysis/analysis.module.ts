import { Module } from '@nestjs/common';
import { AnalysisController } from './presentation/controllers/analysis.controller';
import { AnalyzeBytecodeUseCase } from './application/use-cases/analyze-bytecode.use-case';
import { RustAnalysisEngineAdapter } from './infrastructure/adapters/rust-analysis-engine.adapter';

@Module({
  controllers: [AnalysisController],
  providers: [
    RustAnalysisEngineAdapter,
    {
      provide: 'AnalysisEnginePort',
      useClass: RustAnalysisEngineAdapter,
    },
    AnalyzeBytecodeUseCase,
  ],
  exports: [AnalyzeBytecodeUseCase, 'AnalysisEnginePort'],
})
export class AnalysisModule {}
