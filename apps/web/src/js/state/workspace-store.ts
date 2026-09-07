import { MicroStore } from './store';

export interface WorkspaceState {
  sourceCode: string;
  uploadedFileName: string;
  fileSize: number;
  lineCount: number;
  config: Record<string, any>;
  result: any | null;
  activePresetId: string;
  isObfuscating: boolean;
  activeTab: 'editor' | 'pipeline' | 'inspection';
  error: string | null;
}

export const workspaceStore = new MicroStore<WorkspaceState>({
  sourceCode: `# PyVM Enterprise Source: Critical License Verification & Crypto Core
import hashlib
import hmac
import time

def verify_hardware_license(license_key: str, hardware_fingerprint: str) -> bool:
    """Cryptographically validates hardware lock with dynamic timestamp witness."""
    salt_seed = b"X-SEC-7749-PYVM-NATIVE-OBFUSCATION"
    expected = hmac.new(salt_seed, hardware_fingerprint.encode('utf-8'), hashlib.sha256).hexdigest()
    
    if license_key != expected[:32]:
        return False
        
    print(f"[AUTH] Machine {hardware_fingerprint} authorized at cycle {int(time.time())}")
    return True

if __name__ == "__main__":
    hw_id = "A8-93-4B-11-2F-9C"
    auth_token = "c3f81e90b7642a87d291e0a43876cdfa"
    is_valid = verify_hardware_license(auth_token, hw_id)
    print(f"License Verified: {is_valid}")`,
  uploadedFileName: 'hardware_license.py',
  fileSize: 840,
  lineCount: 22,
  config: {
    opcodeSeed: 884721,
    supportedPythonVersions: ['3.10', '3.11', '3.12', '3.13'],
    cffDegree: 'extreme_opaque',
    heavyControlFlow: true,
    nativeRustVirtualization: true,
    chunkedRamDecryption128B: true,
    machineLevelCFF: true,
    activeKernelAntiDebug: true,
    antiDebuggingLevel: 'military',
    disableMonitoring312: true,
    tamperProofing: true,
    timingAntiStepping: true,
    stringEncryptionMode: 'polymorphic_rolling_xor',
    intensityLevel: 'maximum',
    opcodeRemapping: true,
    controlFlowFlattening: true,
    entropyRandomization: true,
    hideImports: true,
    largeBytesPayload: true,
  },
  result: null,
  activePresetId: 'heavy_cff_direct',
  isObfuscating: false,
  activeTab: 'editor',
  error: null,
});
