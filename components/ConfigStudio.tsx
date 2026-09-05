'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Binary,
  Shield,
  Shuffle,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Boxes,
  Zap,
  HardDrive,
  Bomb,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  ObfuscationConfig,
  SupportedPythonVersion,
  TargetArchitecture,
  TargetOS,
} from '@/lib/types';
import { MagicHeaderService } from '@/src/server/services/magic-header.service';

interface ConfigStudioProps {
  config: ObfuscationConfig;
  onChangeConfig: (newConfig: ObfuscationConfig) => void;
}

const PYTHON_VERSIONS: SupportedPythonVersion[] = [
  '3.7', '3.8', '3.9', '3.10', '3.11', '3.12', '3.13', '3.14'
];

const ARCHITECTURES: { id: TargetArchitecture; label: string }[] = [
  { id: 'x86_64', label: 'x86_64 (AMD64)' },
  { id: 'aarch64', label: 'aarch64 (ARM64)' },
  { id: 'armv7', label: 'armv7 / armhf' },
  { id: 'riscv64', label: 'RISC-V (rv64gc)' },
  { id: 'i686', label: 'i686 (x86 32-bit)' },
  { id: 's390x', label: 'IBM s390x' },
  { id: 'ppc64le', label: 'PowerPC 64 LE' },
];

const OPERATING_SYSTEMS: { id: TargetOS; label: string }[] = [
  { id: 'linux', label: 'Linux (GNU/Musl)' },
  { id: 'windows', label: 'Windows (NT 64/32)' },
  { id: 'darwin', label: 'macOS (Darwin)' },
  { id: 'freebsd', label: 'FreeBSD' },
  { id: 'android', label: 'Android (Termux/Bionic)' },
];

const MAGIC_PRESETS = [
  { hex: '7F50564D', label: '0x7F PVM', desc: 'Standard ELF-style PyVM Rust header' },
  { hex: '5059564D', label: 'PYVM', desc: 'ASCII "PYVM" signature' },
  { hex: 'DEADBEEF', label: 'DEADBEEF', desc: 'Classic anti-decompilation signature' },
  { hex: 'CAFEBABE', label: 'CAFEBABE', desc: 'Mach-O / JVM crossover signature' },
  { hex: 'CC9D4158', label: 'POLY_XOR', desc: 'Cryptographic pseudo-random byte header' },
];

export const ConfigStudio: React.FC<ConfigStudioProps> = ({ config, onChangeConfig }) => {
  const update = (partial: Partial<ObfuscationConfig>) => {
    // If updating nativeRustVirtualization, keep nativeCVirtualization synced
    if ('nativeRustVirtualization' in partial) {
      (partial as any).nativeCVirtualization = partial.nativeRustVirtualization;
    }
    onChangeConfig({ ...config, ...partial });
  };

  const currentMagicHex = MagicHeaderService.sanitizeMagicHex(config.magicNumber);
  const currentMagicAscii = MagicHeaderService.toAscii(currentMagicHex);
  const currentMagicBytes = MagicHeaderService.hexToBytes(currentMagicHex);

  const togglePyVersion = (ver: SupportedPythonVersion) => {
    const list = [...config.supportedPythonVersions];
    const idx = list.indexOf(ver);
    if (idx >= 0) {
      if (list.length > 1) list.splice(idx, 1);
    } else {
      list.push(ver);
    }
    update({ supportedPythonVersions: list });
  };

  const toggleArch = (arch: TargetArchitecture) => {
    const list = [...config.targetArchitectures];
    const idx = list.indexOf(arch);
    if (idx >= 0) {
      if (list.length > 1) list.splice(idx, 1);
    } else {
      list.push(arch);
    }
    update({ targetArchitectures: list });
  };

  const toggleOS = (os: TargetOS) => {
    const list = [...config.targetOperatingSystems];
    const idx = list.indexOf(os);
    if (idx >= 0) {
      if (list.length > 1) list.splice(idx, 1);
    } else {
      list.push(os);
    }
    update({ targetOperatingSystems: list });
  };

  return (
    <div className="space-y-6">
      {/* 15 Hardened Enterprise Modules (Unified 4-Pillar Grid) */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-900/90 to-zinc-950 p-6 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
                <Shield className="h-5 w-5 text-orange-400" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>15 Hardened Enterprise Virtualization Modules</span>
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm font-bold">
                  Native Rust Engine
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                3-Layer nested onion virtualization compiled into one self-contained, unsplit Python file ending in <code className="text-orange-300 font-mono">Interpretor(globals(), b&apos;&lt;bytes&gt;&apos;)</code> in the same line with zero layer-revealing comments
              </p>
            </div>
          </div>
          
          {/* Target Payload Size Selector */}
          <div className="flex items-center gap-2.5 bg-white/[0.04] px-3.5 py-2 rounded-2xl border border-white/10 shadow-sm">
            <HardDrive className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-semibold text-zinc-300">Payload Size:</span>
            <select
              value={config.targetOutputSizeMb ?? 0}
              onChange={(e) => update({ targetOutputSizeMb: Number(e.target.value) })}
              className="bg-zinc-950 border border-white/10 text-orange-400 text-xs rounded-xl px-2.5 py-1 font-mono focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value={0}>Standard (~4 KB compact)</option>
              <option value={0.5}>0.5 MB (Medium matrix)</option>
              <option value={1}>1.0 MB (High density)</option>
              <option value={2}>2.0 MB (Deep bloat)</option>
              <option value={3.5}>3.5 MB (Heavy CFF)</option>
              <option value={5}>5.0 MB (Ultra fortress)</option>
              <option value={7}>7.0 MB (Maximum Enterprise)</option>
            </select>
          </div>
        </div>

        {/* 4 Protection Pillars with Colorful Distinct Archetypes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Group 1: Machine-Level Native Engine (Rust Virtual Machine Engine) */}
          <div className="rounded-2xl border border-orange-500/25 bg-gradient-to-b from-orange-950/20 via-zinc-950/80 to-zinc-950 p-5 space-y-3.5 shadow-lg shadow-orange-950/20">
            <div className="flex items-center gap-2.5 font-bold text-xs text-orange-400 border-b border-orange-500/20 pb-2.5">
              <div className="p-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Cpu className="h-4 w-4" />
              </div>
              <span>1. Machine-Level Native Engine (Rust Virtual Machine Engine)</span>
            </div>
            <div className="space-y-2.5">
              {[
                { key: 'nativeRustVirtualization', num: '01', label: '3-Layer Nested Onion Virtualization', desc: 'Outer Loader -> Middle Aegis CFF -> Inner RustPython Core (Zero comments)' },
                { key: 'chunkedRamDecryption128B', num: '02', label: 'Dynamic 128B Chunked RAM Decryption', desc: 'Streams & decrypts fragmented 128-byte chunks in RAM via Embive bus' },
                { key: 'masterKeystreamEncryption', num: '03', label: 'Master Keystream Encryption', desc: '32-byte polymorphic position-variant keystream' },
                { key: 'polymorphicInstructionSub', num: '04', label: 'Polymorphic Instruction Substitution', desc: 'Multi-layered virtual micro-kernel ISA matrix' },
              ].map((item) => {
                const isChecked = (config as any)[item.key] ?? (item.key === 'nativeRustVirtualization' ? ((config as any).nativeCVirtualization ?? true) : true);
                return (
                  <label key={item.key} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/[0.06] hover:border-orange-500/40 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => update({ [item.key]: e.target.checked } as any)}
                      className="mt-0.5 h-4 w-4 rounded-md border-white/20 accent-orange-500 cursor-pointer"
                    />
                    <div className="text-left">
                      <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-orange-400 font-bold">{item.num}.</span>
                        <span>{item.label}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 pt-0.5">{item.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Group 2: Control-Flow & Anti-Decompile (Aegis Layer) */}
          <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-b from-purple-950/20 via-zinc-950/80 to-zinc-950 p-5 space-y-3.5 shadow-lg shadow-purple-950/20">
            <div className="flex items-center gap-2.5 font-bold text-xs text-purple-400 border-b border-purple-500/20 pb-2.5">
              <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Boxes className="h-4 w-4" />
              </div>
              <span>2. Control-Flow & Anti-Decompile (Aegis Layer)</span>
            </div>
            <div className="space-y-2.5">
              {[
                { key: 'machineLevelCFF', num: '05', label: 'Machine-Level CFF', desc: 'Rust Aegis switch-case flattened state machine dispatcher' },
                { key: 'opaquePredicatesJunk', num: '06', label: 'Opaque Predicates & Junk Code', desc: 'Injects algebraic invariants to crash static disassemblers' },
                { key: 'peStrippingSymbolErasure', num: '10', label: 'PE Stripping & Symbol Erasure', desc: 'Completely erases Export/Import tables, symbols & metadata' },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-purple-500/10 border border-white/[0.06] hover:border-purple-500/40 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(config as any)[item.key] ?? true}
                    onChange={(e) => update({ [item.key]: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded-md border-white/20 accent-purple-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-purple-400 font-bold">{item.num}.</span>
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 pt-0.5">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Group 3: Active Kernel Defense & RAM Protection */}
          <div className="rounded-2xl border border-rose-500/25 bg-gradient-to-b from-rose-950/20 via-zinc-950/80 to-zinc-950 p-5 space-y-3.5 shadow-lg shadow-rose-950/20">
            <div className="flex items-center gap-2.5 font-bold text-xs text-rose-400 border-b border-rose-500/20 pb-2.5">
              <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Lock className="h-4 w-4" />
              </div>
              <span>3. Active Kernel Defense & RAM Protection</span>
            </div>
            <div className="space-y-2.5">
              {[
                { key: 'activeKernelAntiDebug', num: '07', label: 'Active Kernel Anti-Debug', desc: 'Scans hardware flags DR0–DR7 & PEB BeingDebugged (IDA/Frida/x64dbg)' },
                { key: 'silentMemoryCorruption', num: '08', label: 'Silent Memory Corruption', desc: 'Silently poisons calculations & RAM upon detecting tamper' },
                { key: 'callSiteRamScrubber', num: '11', label: 'Call-Site RAM Scrubber', desc: 'Locks call-site context, blocks sys.settrace & memory dumps' },
                { key: 'hardwareExpireLock', num: '15', label: 'Hardware Expire Lock', desc: 'Locks usage expiration based on real hardware timestamps' },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/40 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(config as any)[item.key] ?? true}
                    onChange={(e) => update({ [item.key]: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded-md border-white/20 accent-rose-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-rose-400 font-bold">{item.num}.</span>
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 pt-0.5">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Group 4: AST Morphing & AI Prompt Weapons */}
          <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/20 via-zinc-950/80 to-zinc-950 p-5 space-y-3.5 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center gap-2.5 font-bold text-xs text-cyan-400 border-b border-cyan-500/20 pb-2.5">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Bomb className="h-4 w-4" />
              </div>
              <span>4. AST Morphing & AI Prompt Weapons</span>
            </div>
            <div className="space-y-2.5">
              {[
                { key: 'multiOsInMemoryContainer', num: '09', label: '9-Platform Multi-OS In-Memory Container', desc: 'Universal execution for Windows, Linux, Android, macOS' },
                { key: 'preVmLambdaAst', num: '12', label: 'Pre-VM Lambda AST', desc: 'Converts functions/classes into dense single-line lambda ASTs' },
                { key: 'fastBitwiseMangling', num: '13', label: 'Fast Bitwise Mangling', desc: 'Transforms integers and booleans into bitwise binary matrices' },
                { key: 'antiAiPromptBombs', num: '14', label: 'Anti-AI Prompt Weapons', desc: '120+ AI/LLM adversarial traps to neutralize neural analyzers' },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-cyan-500/10 border border-white/[0.06] hover:border-cyan-500/40 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(config as any)[item.key] ?? true}
                    onChange={(e) => update({ [item.key]: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded-md border-white/20 accent-cyan-500 cursor-pointer"
                  />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">{item.num}.</span>
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 pt-0.5">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Custom Magic Number (First 4 Bytes) */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Binary className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Custom Magic Signature (Leading 4 Bytes)</h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 bg-white/[0.05] px-2.5 py-1 rounded-xl border border-white/5">
            ASCII: <span className="text-amber-400 font-bold">&quot;{currentMagicAscii}&quot;</span>
          </span>
        </div>

        <div className="mt-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3.5">
            {/* 4 Byte visual boxes */}
            <div className="flex items-center gap-2">
              {currentMagicBytes.map((b, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-amber-500/30 font-mono text-center shadow-md"
                >
                  <span className="text-[10px] text-zinc-500 font-sans">B{idx}</span>
                  <span className="text-sm font-extrabold text-amber-300">
                    {b.toString(16).toUpperCase().padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>

            {/* Hex Input */}
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-zinc-300 mb-1.5 block">
                Hex Signature (8 Hex Characters)
              </label>
              <input
                type="text"
                maxLength={8}
                value={config.magicNumber}
                onChange={(e) => update({ magicNumber: e.target.value.toUpperCase() })}
                placeholder="7F50564D"
                className="w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3.5 font-mono text-xs text-amber-400 focus:border-amber-500 focus:outline-none tracking-widest uppercase shadow-inner"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {MAGIC_PRESETS.map((preset) => (
              <motion.button
                key={preset.hex}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => update({ magicNumber: preset.hex })}
                className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-all cursor-pointer shadow-sm ${
                  currentMagicHex === preset.hex
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-zinc-200 border border-white/[0.07] hover:bg-white/[0.08]'
                }`}
                title={preset.desc}
              >
                {preset.label}
              </motion.button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-400">
            Embedded as the leading 4 bytes of the virtualized stream; inspected by the native Rust VM kernel for signature matching.
          </p>
        </div>
      </div>

      {/* 3. Opcode Scrambling & Instruction Mutation Seed */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Shuffle className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Hidden Opcode Scrambler & Mutation Seed</h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => update({ opcodeSeed: Math.floor(Math.random() * 1000000) })}
            className="flex items-center gap-1.5 text-[11px] text-orange-400 hover:text-orange-300 font-mono bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reshuffle Seed</span>
          </motion.button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="flex items-center justify-between rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3.5 cursor-pointer hover:border-orange-500/30 transition-all">
              <div>
                <div className="text-xs font-bold text-zinc-100">Dynamic Opcode Scrambling</div>
                <div className="text-[11px] text-zinc-400 pt-0.5">Dispatches via non-linear polynomial hash matrix</div>
              </div>
              <input
                type="checkbox"
                checked={config.opcodeScrambling}
                onChange={(e) => update({ opcodeScrambling: e.target.checked })}
                className="h-4 w-4 rounded-md border-white/20 accent-orange-500 cursor-pointer"
              />
            </label>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-3.5 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-100">Mutation Seed</span>
                <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/15 px-2 py-0.5 rounded-lg border border-orange-500/30">
                  #{config.opcodeSeed}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={999999}
                value={config.opcodeSeed}
                onChange={(e) => update({ opcodeSeed: Number(e.target.value) })}
                className="mt-2.5 w-full accent-orange-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Master 32-Byte Keystream Key */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-1.5 block">
              Master 32-Byte Polymorphic Keystream Key
            </label>
            <div className="relative">
              <input
                type="text"
                value={config.stringEncryptionKey}
                onChange={(e) => update({ stringEncryptionKey: e.target.value })}
                className="w-full h-10 rounded-xl bg-black/40 border border-white/10 px-3.5 pr-28 font-mono text-xs text-zinc-200 focus:border-orange-500 focus:outline-none"
              />
              <button
                onClick={() => update({ stringEncryptionKey: 'PyShield_RustKey_' + Math.random().toString(36).substring(2, 10).toUpperCase() })}
                className="absolute right-2 top-2 px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/30 text-[10px] text-orange-400 hover:text-orange-300 font-mono transition-colors cursor-pointer"
              >
                Regenerate Key
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Cross-Platform Polyglot Matrix & Python 3.7–3.14 */}
      <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-5 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Cross-Platform Polyglot Matrix & Python 3.7–3.14</h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30 font-semibold">
            Single Universal .py File
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {/* Python Versions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-zinc-300">Supported Python Versions</label>
              <span className="text-[10px] text-zinc-500">Universal shim enabled</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PYTHON_VERSIONS.map((ver) => {
                const active = config.supportedPythonVersions.includes(ver);
                return (
                  <motion.button
                    key={ver}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => togglePyVersion(ver)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-all cursor-pointer shadow-sm ${
                      active
                        ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 border border-emerald-500/50 font-bold shadow-emerald-500/10'
                        : 'bg-white/[0.04] text-zinc-500 border border-white/[0.07] hover:text-zinc-300'
                    }`}
                  >
                    Py {ver}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* CPU Architectures */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-2 block">
              Target CPU Architectures (Single Binary Polyglot)
            </label>
            <div className="flex flex-wrap gap-2">
              {ARCHITECTURES.map((arch) => {
                const active = config.targetArchitectures.includes(arch.id);
                return (
                  <motion.button
                    key={arch.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleArch(arch.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-all cursor-pointer shadow-sm ${
                      active
                        ? 'bg-gradient-to-r from-purple-500/25 to-indigo-500/25 text-purple-300 border border-purple-500/50 font-bold shadow-purple-500/10'
                        : 'bg-white/[0.04] text-zinc-500 border border-white/[0.07] hover:text-zinc-300'
                    }`}
                  >
                    {arch.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Operating Systems */}
          <div>
            <label className="text-[11px] font-semibold text-zinc-300 mb-2 block">
              Major Operating Systems (9-Platform In-Memory Container)
            </label>
            <div className="flex flex-wrap gap-2">
              {OPERATING_SYSTEMS.map((os) => {
                const active = config.targetOperatingSystems.includes(os.id);
                return (
                  <motion.button
                    key={os.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleOS(os.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-mono transition-all cursor-pointer shadow-sm ${
                      active
                        ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/25 text-orange-300 border border-orange-500/50 font-bold shadow-orange-500/10'
                        : 'bg-white/[0.04] text-zinc-500 border border-white/[0.07] hover:text-zinc-300'
                    }`}
                  >
                    {os.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
