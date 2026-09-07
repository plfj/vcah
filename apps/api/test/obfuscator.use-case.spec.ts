import { ObfuscateCodeUseCase } from '../src/core/obfuscator/application/use-cases/obfuscate-code.use-case';
import { RustEngineAdapter } from '../src/core/obfuscator/infrastructure/adapters/rust-engine.adapter';

describe('ObfuscateCodeUseCase (Hexagonal Isolation)', () => {
  it('should execute obfuscation job without framework dependencies', async () => {
    const adapter = new RustEngineAdapter();
    const useCase = new ObfuscateCodeUseCase(adapter);

    const job = await useCase.execute({
      sourceCode: 'x = 42\ny = x + 1\n',
      config: {
        supportedPythonVersions: ['3.12'],
        opcodeSeed: 884721,
      },
    });

    expect(job).toBeDefined();
    expect(job.obfuscatedCode).toContain('__pyvm_exec__');
    expect(job.vmSpec.opcodeMappings.length).toBeGreaterThan(0);
    expect(job.stats.entropy).toBeGreaterThan(0);
  });
});
