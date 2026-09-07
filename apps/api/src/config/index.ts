/**
 * Application & Rust Engine Configuration.
 */

export interface RustEngineConfig {
  defaultSeed: number;
  supportedPythonVersions: string[];
  maxPayloadSizeKb: number;
  zeroCopyHotPath: boolean;
  activeModulesCount: number;
}

export interface AppConfig {
  port: number;
  environment: string;
  rustEngine: RustEngineConfig;
}

export const APP_CONFIG: AppConfig = {
  port: 3000,
  environment: process.env.NODE_ENV || 'development',
  rustEngine: {
    defaultSeed: 884721,
    supportedPythonVersions: ['3.7', '3.8', '3.9', '3.10', '3.11', '3.12', '3.13', '3.14'],
    maxPayloadSizeKb: 512,
    zeroCopyHotPath: true,
    activeModulesCount: 15,
  },
};
