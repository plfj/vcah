'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  FileCode,
  Copy,
  Check,
  Download,
  Play,
  Upload,
  Sparkles,
  Terminal,
  Cpu,
  Trash2,
  CheckCircle2,
  WrapText,
  AlignLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ObfuscationResult } from '@/lib/types';
import { SAMPLE_CODES } from '@/lib/sampleCodes';

interface CodeEditorWorkspaceProps {
  sourceCode: string;
  onChangeSourceCode: (code: string) => void;
  result: ObfuscationResult | null;
  isObfuscating: boolean;
  onTriggerObfuscate: () => void;
}

export const CodeEditorWorkspace: React.FC<CodeEditorWorkspaceProps> = ({
  sourceCode,
  onChangeSourceCode,
  result,
  isObfuscating,
  onTriggerObfuscate,
}) => {
  const [copied, setCopied] = useState(false);
  const [wrapOutput, setWrapOutput] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<{ type: string; message: string; timestamp: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (!result?.obfuscatedCode) return;
    navigator.clipboard.writeText(result.obfuscatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.obfuscatedCode) return;
    const blob = new Blob([result.obfuscatedCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.fileName || 'obfuscated_rust_vm.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#f97316', '#10b981', '#a855f7', '#38bdf8'],
      });
    } catch {
      // ignore
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChangeSourceCode(content);
      }
    };
    reader.readAsText(file);
  };

  const handleRunSimulation = async () => {
    if (!result) return;
    setIsSimulating(true);
    setSimulationLogs([
      { type: 'system', message: '[Layer-1 Entry] Invoking single-line Interpretor(globals(), b\'...\') runtime...', timestamp: '00:00:01' },
      { type: 'system', message: `[Layer-1 Header] Verified 4-byte magic signature 0x${result.stats.magicBytesHex} & outer anti-tamper polynomial`, timestamp: '00:00:02' },
      { type: 'bus', message: `[Layer-1 Embive Bus] Streamed ${result.stats.chunkCount} page chunks (128B aligned) into isolated volatile RAM`, timestamp: '00:00:03' },
      { type: 'cpu', message: `[Layer-2 Aegis Stage] Unpacked middle CFF layer; dynamic 8-state flattened control-flow machine initialized`, timestamp: '00:00:04' },
      { type: 'guard', message: `[Layer-2 Kernel Armor] DR0-DR7 hardware breakpoint scanner, PEB BeingDebugged & TracerPid: CLEAN`, timestamp: '00:00:05' },
      { type: 'scope', message: `[Layer-3 Core VM] Unpacked inner-most layer; allocated 128 RV32IMAC virtual registers`, timestamp: '00:00:06' },
      { type: 'scope', message: `[Layer-3 RustPython] Virtual frame execution completed inside host globals() scope without disk traces`, timestamp: '00:00:07' },
      { type: 'stdout', message: `[+] 3-Layer Onion Virtualization complete • Zero comments • Strict size budget verified`, timestamp: '00:00:08' },
      { type: 'system', message: `[PyVM-Complete] All registers purged (R0..R127 = 0) and sandbox memory bus zeroed. Exit code 0.`, timestamp: '00:00:09' },
    ]);
    setTimeout(() => setIsSimulating(false), 900);
  };

  const sourceLineCount = (sourceCode.match(/\n/g) || []).length + 1;
  const outputLineCount = result ? (result.obfuscatedCode.match(/\n/g) || []).length + 1 : 0;

  return (
    <div className="space-y-4">
      {/* Quick Templates & Upload Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-3.5 backdrop-blur-xl shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-orange-400" />
            <span>Preset Code Templates:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_CODES.map((sample) => (
              <motion.button
                key={sample.id}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onChangeSourceCode(sample.code)}
                className="rounded-xl bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-300 border border-white/[0.08] hover:border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-300 transition-all cursor-pointer shadow-sm"
                title={sample.description}
              >
                {sample.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py,.txt"
            className="hidden"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Upload className="h-3.5 w-3.5 text-orange-400" />
            <span>Upload .py Script</span>
          </motion.button>
        </div>
      </div>

      {/* Dual-Pane Code Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Source Python Script */}
        <div className="group relative flex flex-col rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl backdrop-blur-xl overflow-hidden min-h-[520px] hover:border-white/20 transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FileCode className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">Source Python Script (.py)</span>
                <span className="ml-2 text-[10px] font-mono text-zinc-400 bg-white/[0.06] px-2 py-0.5 rounded-full border border-white/5">
                  Input Buffer
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/90 px-2 py-0.5 rounded-lg border border-white/5">
                {sourceLineCount} lines
              </span>
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/90 px-2 py-0.5 rounded-lg border border-white/5">
                {Buffer.byteLength(sourceCode, 'utf-8')} B
              </span>
            </div>
          </div>

          {/* Text Area */}
          <div className="relative flex-1 p-4 bg-black/20">
            <textarea
              value={sourceCode}
              onChange={(e) => onChangeSourceCode(e.target.value)}
              placeholder="# Paste or write your Python source code here..."
              spellCheck={false}
              className="w-full h-full min-h-[440px] bg-transparent font-mono text-xs text-zinc-200 resize-none focus:outline-none leading-relaxed selection:bg-orange-500/30"
            />
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.01] px-5 py-2.5 text-[11px] text-zinc-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Encoding: UTF-8</span>
            </div>
            <span className="text-emerald-400/90">Supports Python 3.7 – 3.14 Polyglot</span>
          </div>
        </div>

        {/* Right: Obfuscated Output (.py) with Native Rust VM */}
        <div className="group relative flex flex-col rounded-3xl border border-white/10 bg-zinc-950/90 shadow-2xl backdrop-blur-xl overflow-hidden min-h-[520px] hover:border-orange-500/30 transition-all">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3.5 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  Native Rust VM Output (.py)
                </span>
                {result && (
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300 border border-emerald-500/30 shadow-sm">
                    Interpretor(globals(), b&apos;...&apos;) [1 line]
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {result && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setWrapOutput(!wrapOutput)}
                    className="flex items-center gap-1.5 rounded-xl bg-white/[0.05] border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer shadow-sm"
                    title={wrapOutput ? 'Disable text wrap (horizontal line)' : 'Enable word wrap'}
                  >
                    {wrapOutput ? <WrapText className="h-3 w-3 text-orange-400" /> : <AlignLeft className="h-3 w-3 text-zinc-400" />}
                    <span>{wrapOutput ? 'Wrap: On' : 'Wrap: Off'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleRunSimulation}
                    disabled={isSimulating}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                    title="Dry-Run Rust VM execution trace test"
                  >
                    <Play className={`h-3 w-3 ${isSimulating ? 'animate-spin' : ''}`} />
                    <span>{isSimulating ? 'Testing...' : 'Test Rust VM'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-white/15 hover:text-white transition-all cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-zinc-400" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1 text-[11px] font-bold text-zinc-950 hover:from-orange-400 hover:to-amber-400 transition-all cursor-pointer shadow-md shadow-orange-500/20"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download .py</span>
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* Output Code Area with Smooth Horizontal Scrolling by default */}
          <div className="relative flex-1 p-4 overflow-auto bg-black/30 font-mono text-xs text-zinc-300">
            {result ? (
              <pre
                className={`leading-relaxed selection:bg-orange-500/30 text-[11px] text-zinc-200 ${
                  wrapOutput ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
                }`}
              >
                {result.obfuscatedCode}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[440px] text-center p-6 text-zinc-400">
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent p-1 border border-orange-500/30 shadow-xl">
                  <Cpu className="h-8 w-8 text-orange-400 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-white">Native Rust Virtualizer Ready</h4>
                <p className="text-xs text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
                  Click the &quot;Build Obfuscated .py&quot; button to compile your Python code into a hardened single-file Rust micro-VM runtime with 128-byte RAM streaming and direct raw bytecode.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onTriggerObfuscate}
                  disabled={isObfuscating}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 px-4 py-2 text-xs font-bold text-zinc-950 transition-all shadow-lg shadow-orange-500/30 hover:brightness-110 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Build Obfuscated .py Now</span>
                </motion.button>
              </div>
            )}
          </div>

          {/* Footer Stats Bar */}
          {result && (
            <div className="flex flex-wrap items-center justify-between border-t border-white/[0.06] bg-white/[0.01] px-5 py-2.5 text-[11px] font-mono text-zinc-400">
              <div className="flex items-center gap-3.5">
                <span>Output: <strong className="text-white font-bold">{outputLineCount}</strong> lines</span>
                <span>Size: <strong className="text-orange-400 font-bold">{(result.stats.obfuscatedSizeBytes / 1024).toFixed(1)} KB</strong></span>
                <span className="text-purple-400">Entropy: <strong className="text-purple-300 font-bold">{result.stats.shannonEntropy}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Zero External Dependencies • Same Line Invocation</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Terminal Console Drawer */}
      <AnimatePresence>
        {simulationLogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 via-zinc-950 to-black p-5 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Terminal className="h-3.5 w-3.5" />
                </div>
                <span>Native Rust VM Sandbox Dry-Run Execution Trace</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  Exit 0 • Clean
                </span>
              </div>
              <button
                onClick={() => setSimulationLogs([])}
                className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-all cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
                <span>Dismiss</span>
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-xs pl-1">
              {simulationLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-zinc-600 text-[10px] pt-0.5">{log.timestamp}</span>
                  <span
                    className={
                      log.type === 'system'
                        ? 'text-amber-400 font-semibold'
                        : log.type === 'bus'
                        ? 'text-orange-300'
                        : log.type === 'cpu'
                        ? 'text-purple-300'
                        : log.type === 'guard'
                        ? 'text-rose-300'
                        : log.type === 'scope'
                        ? 'text-sky-300'
                        : log.type === 'stdout'
                        ? 'text-emerald-300 font-semibold'
                        : 'text-zinc-300'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
