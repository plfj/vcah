import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ObfuscatorModule } from './core/obfuscator/obfuscator.module';
import { PresetsModule } from './core/presets/presets.module';
import { SimulatorModule } from './core/simulator/simulator.module';
import { AnalysisModule } from './core/analysis/analysis.module';

@Module({
  imports: [
    ObfuscatorModule,
    PresetsModule,
    SimulatorModule,
    AnalysisModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
