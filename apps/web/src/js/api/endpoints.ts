import { apiClient } from './api-client';

export class ObfuscatorApi {
  static async transform(sourceCode: string, config: Record<string, any>) {
    return apiClient.post<any>('/obfuscate', { sourceCode, config });
  }
}

export class PresetsApi {
  static async getAll() {
    return apiClient.get<any[]>('/presets');
  }
}

export class SimulatorApi {
  static async simulate(bytecode: string, seed: number) {
    return apiClient.post<any>('/simulate', { bytecode, seed });
  }
}
