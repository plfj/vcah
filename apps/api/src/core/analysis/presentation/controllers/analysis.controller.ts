import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AnalyzeBytecodeUseCase } from '../../application/use-cases/analyze-bytecode.use-case';
import { AnalysisRequestDto } from '../dto/analysis-request.dto';
import { AnalysisResponseDto } from '../dto/analysis-response.dto';

@Controller()
export class AnalysisController {
  constructor(private readonly analyzeBytecodeUseCase: AnalyzeBytecodeUseCase) {}

  @Post('analysis/entropy')
  @HttpCode(HttpStatus.OK)
  async analyze(@Body() dto: AnalysisRequestDto): Promise<AnalysisResponseDto> {
    const report = await this.analyzeBytecodeUseCase.execute({
      sourceCode: dto.sourceCode,
      bytecodePayload: dto.bytecodePayload,
      seed: dto.seed,
    });

    return {
      reportId: report.reportId,
      entropy: {
        score: report.entropyProfile.shannonEntropy,
        max: report.entropyProfile.maxEntropy,
        uniformityRatio: report.entropyProfile.uniformityRatio,
        grade: report.entropyProfile.randomnessGrade,
        distribution: report.entropyProfile.byteDistribution,
      },
      frequencies: {
        standardCpythonTotal: report.frequencyProfile.standardCpythonCount,
        customVirtualIsaTotal: report.frequencyProfile.virtualVmCount,
        expansionMultiplier: report.frequencyProfile.expansionMultiplier,
        substitutionRate: report.frequencyProfile.substitutionRate,
        divergenceIndex: report.frequencyProfile.divergenceIndex,
        categories: report.frequencyProfile.categoryBreakdown,
      },
      generatedAt: report.generatedAt.toISOString(),
    };
  }

  @Post('api/analysis/entropy')
  @HttpCode(HttpStatus.OK)
  async analyzeApi(@Body() dto: AnalysisRequestDto): Promise<AnalysisResponseDto> {
    return this.analyze(dto);
  }
}
