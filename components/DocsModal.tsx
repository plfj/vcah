'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, BookOpen, HardDrive, Lock, Bomb, Terminal, GitBranch, CheckCircle2 } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950 via-[#0a0d14] to-black p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 via-amber-500/20 to-rose-500/20 border border-orange-500/30 text-orange-400 shadow-md">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Native Rust Virtual Machine Obfuscation Specification
                </h2>
                <p className="text-xs text-zinc-400">
                  Embive Sandbox • Aegis CFF Engine • RustPython Frame Runtime • 15 Protection Modules
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          {/* 3 Core Architectural Pillars (Embive + Aegis + RustPython) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-b from-orange-950/20 to-zinc-950/80 p-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-orange-400 text-xs">
                <Cpu className="h-4 w-4" />
                <span>Embive Sandbox VM</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Adapted from <code className="text-orange-300 font-mono">embive/embive</code>: RV32IMAC 128 virtual registers, sandboxed memory bus, deterministic cycle counts, 128B RAM pages, and zero-allocation buffer recycling.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-zinc-950/80 p-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-purple-400 text-xs">
                <GitBranch className="h-4 w-4" />
                <span>Aegis CFF Engine</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Adapted from <code className="text-purple-300 font-mono">AegisProgrammingLanguage</code>: Dual stack &amp; register bytecode machine, non-linear opcode permutation hash matrix, and 8-state machine-level control flow flattening.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-zinc-950/80 p-4 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs">
                <Terminal className="h-4 w-4" />
                <span>RustPython Frame Runtime</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Adapted from <code className="text-emerald-300 font-mono">RustPython/RustPython</code>: PyCodeObject / PyFrameObject runtime emulation, global scope resolution, symbol erasure, and polyglot Python 3.7 – 3.14 execution.
              </p>
            </div>
          </div>

          {/* 15 Hardened Protection Modules */}
          <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 pt-1">
              15 Hardened Enterprise Protection Modules
            </h3>

            {/* Group 1 */}
            <div className="rounded-2xl border border-orange-500/25 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-orange-400">
                <Cpu className="h-4 w-4" />
                <span>1. Machine-Level Native Engine (Native Rust Virtual Machine Engine)</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-zinc-300">
                <li><strong>01. Native Rust Virtualization:</strong> Translates Python instructions into an in-memory execution engine with 128 dynamic virtual registers (Embive / Aegis / RustPython).</li>
                <li><strong>02. Dynamic 128B Chunked RAM Decryption:</strong> Streams and decrypts fragmented 128-byte aligned memory pages dynamically through the Embive memory bus.</li>
                <li><strong>03. Master Keystream Encryption:</strong> Encrypts strings and bytecode using a 32-byte polymorphic position-variant keystream.</li>
                <li><strong>04. Polymorphic Instruction Substitution:</strong> Multi-layered virtual micro-kernel ISA mapping via non-linear polynomial hash matrices.</li>
              </ul>
            </div>

            {/* Group 2 */}
            <div className="rounded-2xl border border-purple-500/25 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-purple-400">
                <GitBranch className="h-4 w-4" />
                <span>2. Control-Flow &amp; Anti-Decompile</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-zinc-300">
                <li><strong>05. Machine-Level CFF:</strong> 8-state switch-case flattened state machine dispatcher executing jump targets via dynamic polynomial transformations.</li>
                <li><strong>06. Opaque Predicates &amp; Junk Code:</strong> Injects 4 mathematical algebraic invariants (α, β, γ, δ) to crash decompilers (uncompyle6, pycdc, Ghidra).</li>
                <li><strong>10. PE Stripping &amp; Symbol Erasure:</strong> Eliminates import/export tables, function names, and file paths completely in RAM.</li>
              </ul>
            </div>

            {/* Group 3 */}
            <div className="rounded-2xl border border-rose-500/25 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-400">
                <Lock className="h-4 w-4" />
                <span>3. Active Kernel Defense &amp; RAM Protection</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-zinc-300">
                <li><strong>07. Active Kernel Anti-Debug:</strong> Scans hardware debug registers (DR0–DR7), PEB BeingDebugged flags, and trap interrupts to block IDA, Frida, and x64dbg.</li>
                <li><strong>08. Silent Memory Corruption:</strong> Instead of exiting abruptly, silently poisons calculations and memory states upon detecting debuggers.</li>
                <li><strong>11. Call-Site RAM Scrubber:</strong> Prevents <code>sys.settrace</code> inspection and clears call-site frame caches upon function completion.</li>
                <li><strong>15. Hardware Expire Lock:</strong> Enforces time-locked expiration checking against real hardware timer counters.</li>
              </ul>
            </div>

            {/* Group 4 */}
            <div className="rounded-2xl border border-cyan-500/25 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-cyan-400">
                <Bomb className="h-4 w-4" />
                <span>4. AST Morphing &amp; AI Prompt Weapons</span>
              </div>
              <ul className="space-y-1.5 pl-4 list-disc text-zinc-300">
                <li><strong>09. 9-Platform Multi-OS In-Memory Container:</strong> Universal support for Linux, Windows, macOS, Android (Termux), FreeBSD, OpenBSD, iOS, and WebAssembly.</li>
                <li><strong>12. Pre-VM Lambda AST:</strong> Compiles statements into single-line Lambda AST representations to eliminate structural syntax signatures.</li>
                <li><strong>13. Fast Bitwise Mangling:</strong> Replaces standard arithmetic and boolean logic with bitwise binary matrix transformations.</li>
                <li><strong>14. Anti-AI Prompt Bombs:</strong> Injects 120+ adversarial LLM prompt traps and recursive token bombs to neutralize AI-powered automated analysis tools.</li>
              </ul>
            </div>

            {/* Single Line Entry Point Specification */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Single-Line Execution Entry Point</span>
              </div>
              <p className="text-zinc-300">
                The output is a single unified <code className="text-orange-300 font-mono">.py</code> script with the raw bytecode embedded as a continuous single-quoted byte literal in the <strong>exact same line</strong> (not 2 lines):
              </p>
              <pre className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-orange-300 overflow-x-auto selection:bg-orange-500/30">
                Interpretor(globals(), b&apos;\x7f\x50\x56\x4d...&apos;)
              </pre>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t border-white/[0.08]">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className="rounded-xl bg-white/[0.08] px-5 py-2 text-xs font-semibold text-white hover:bg-white/[0.12] transition-all cursor-pointer"
            >
              Close Specification
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
