'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '@/components/Navbar';
import { ConfigStudio } from '@/components/ConfigStudio';
import { CodeEditorWorkspace } from '@/components/CodeEditorWorkspace';
import { InspectionDashboard } from '@/components/InspectionDashboard';
import { RustVmPipelineVisualizer } from '@/components/RustVmPipelineVisualizer';
import { DocsModal } from '@/components/DocsModal';
import { ObfuscationConfig, ObfuscationResult, PresetProfile } from '@/lib/types';
import { PRESET_PROFILES } from '@/src/server/presets';
import { SAMPLE_CODES } from '@/lib/sampleCodes';
import { Shield, Sparkles, AlertCircle, RefreshCw, Cpu, Activity, Zap } from 'lucide-react';

const INITIAL_CONFIG: ObfuscationConfig = {
  magicNumber: '7F50564D',
  opcodeScrambling: true,
  opcodeSeed: 884721,
  opcodeRemappingMode: 'polymorphic_cascade',
  vmInstructionSet: 'polymorphic_hybrid',
  customIsaEnabled: true,
  tamperVerification: true,
  antiDebugging: true,
  heavyControlFlow: true,
  opaquePredicates: true,
  cffDegree: 'extreme_opaque',
  directBytecodeLiteral: true,
  supportedPythonVersions: ['3.7', '3.8', '3.9', '3.10', '3.11', '3.12', '3.13', '3.14'],
  targetArchitectures: ['x86_64', 'aarch64', 'armv7', 'riscv64', 'i686', 's390x', 'ppc64le'],
  targetOperatingSystems: ['linux', 'windows', 'darwin', 'freebsd', 'android'],
  rustVmStrategy: 'native_embedded_stub',
  entropyLevel: 'high',
  junkByteRatio: 0,
  payloadMultiplier: 1,
  targetOutputSizeMb: 0,
  stringEncryptionKey: 'PyShield_Master_Key_Native_2026',
  variableNameObfuscation: true,
  deadCodeInjection: false,

  // 15 Native Hardened Modules (Rust Virtual Machine)
  nativeRustVirtualization: true,
  nativeCVirtualization: true,
  chunkedRamDecryption128B: true,
  masterKeystreamEncryption: true,
  polymorphicInstructionSub: true,
  machineLevelCFF: true,
  opaquePredicatesJunk: true,
  peStrippingSymbolErasure: true,
  activeKernelAntiDebug: true,
  silentMemoryCorruption: true,
  callSiteRamScrubber: true,
  hardwareExpireLock: true,
  multiOsInMemoryContainer: true,
  preVmLambdaAst: true,
  fastBitwiseMangling: true,
  antiAiPromptBombs: true,
};

export default function Home() {
  const [presets] = useState<PresetProfile[]>(PRESET_PROFILES);
  const [activePresetId, setActivePresetId] = useState<string>('heavy_cff_direct');
  const [sourceCode, setSourceCode] = useState<string>(SAMPLE_CODES[0].code);
  const [config, setConfig] = useState<ObfuscationConfig>(INITIAL_CONFIG);

  const [result, setResult] = useState<ObfuscationResult | null>(null);
  const [isObfuscating, setIsObfuscating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Trigger Obfuscation API
  const handleObfuscate = React.useCallback(async (codeToObfuscate = sourceCode, currentConfig = config) => {
    setIsObfuscating(true);
    setError(null);
    try {
      const response = await fetch('/api/obfuscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCode: codeToObfuscate,
          config: currentConfig,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Obfuscation compilation failed');
      }

      const data: ObfuscationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to obfuscation engine');
    } finally {
      setIsObfuscating(false);
    }
  }, [config, sourceCode]);

  // Run initial obfuscation on mount so user sees immediate results
  useEffect(() => {
    let isMounted = true;
    const loadInitialResult = async () => {
      try {
        const response = await fetch('/api/obfuscate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceCode: SAMPLE_CODES[0].code,
            config: INITIAL_CONFIG,
          }),
        });
        if (response.ok && isMounted) {
          const data: ObfuscationResult = await response.json();
          setResult(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Initial engine warmup failed');
        }
      }
    };
    loadInitialResult();
    return () => {
      isMounted = false;
    };
  }, []);

  // Preset Selection Handler
  const handleSelectPreset = (preset: PresetProfile) => {
    setActivePresetId(preset.id);
    const updatedConfig = { ...config, ...preset.config };
    setConfig(updatedConfig);
    handleObfuscate(sourceCode, updatedConfig);
  };

  return (
    <div className="relative min-h-screen bg-[#07090e] text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden">
      {/* Background Ambient Glowing Orbs */}
      <div className="pointer-events-none fixed top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 right-10 h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-purple-500/10 via-violet-500/5 to-transparent blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 left-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl" />

      {/* Top Floating Navigation Bar */}
      <Navbar
        presets={presets}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        onOpenDocs={() => setIsDocsOpen(true)}
        onTriggerObfuscate={() => handleObfuscate()}
        isObfuscating={isObfuscating}
      />

      {/* Main Workspace Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-7">
        {/* Error notification banner if any */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 p-4 text-xs text-rose-200 shadow-xl shadow-rose-950/30 backdrop-blur-md"
            >
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Animated Rust VM Pipeline Visualizer */}
        <RustVmPipelineVisualizer
          isCompiling={isObfuscating}
          magicHex={result?.stats?.magicBytesHex || config.magicNumber}
        />

        {/* Primary Code Workspace: Source on left, Obfuscated Output on right */}
        <CodeEditorWorkspace
          sourceCode={sourceCode}
          onChangeSourceCode={(newCode) => {
            setSourceCode(newCode);
          }}
          result={result}
          isObfuscating={isObfuscating}
          onTriggerObfuscate={() => handleObfuscate()}
        />

        {/* Configuration & Hardening Studio */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Shield className="h-4 w-4" />
              </div>
              <span>Hardening Studio & Virtual Machine Parameters</span>
            </h2>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleObfuscate()}
              disabled={isObfuscating}
              className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors cursor-pointer bg-orange-500/10 border border-orange-500/25 px-3 py-1.5 rounded-xl shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isObfuscating ? 'animate-spin' : ''}`} />
              <span>Recompile with Current Settings</span>
            </motion.button>
          </div>

          <ConfigStudio
            config={config}
            onChangeConfig={(newConfig) => {
              setConfig(newConfig);
            }}
          />
        </div>

        {/* Inspection & Bytecode Analytics Dashboard */}
        <div className="pt-2 space-y-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>Entropy Analysis & ISA Inspection Dashboard</span>
          </h2>
          <InspectionDashboard result={result} />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-black/60 py-6 text-center text-xs text-zinc-400 font-mono backdrop-blur-xl mt-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-300 font-bold">PyVM Obfuscator</span>
            <span className="text-zinc-600">•</span>
            <span className="text-orange-400">Native Rust VM Engine</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Python 3.7 – 3.14 Polyglot</span>
          </div>
          <span className="text-zinc-500">Pure Single-File .py Output • Universal OS & CPU Support</span>
        </div>
      </footer>

      {/* Documentation Blueprint Modal */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
