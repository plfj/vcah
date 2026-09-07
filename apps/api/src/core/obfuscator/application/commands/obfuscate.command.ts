export interface ObfuscateCommand {
  sourceCode: string;
  config: {
    magicNumber?: string;
    opcodeScrambling?: boolean;
    opcodeSeed?: number;
    supportedPythonVersions?: string[];
    cffDegree?: string;
    heavyControlFlow?: boolean;
    tamperVerification?: boolean;
    antiDebugging?: boolean;
    nativeRustVirtualization?: boolean;
    [key: string]: any;
  };
}
