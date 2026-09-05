'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Cpu, Layers, ShieldCheck, Zap, Terminal, Activity, ArrowRight, Play, RefreshCw } from 'lucide-react';

interface RustVmPipelineVisualizerProps {
  isCompiling: boolean;
  magicHex?: string;
}

export const RustVmPipelineVisualizer: React.FC<RustVmPipelineVisualizerProps> = ({
  isCompiling,
  magicHex = '7F50564D',
}) => {
  const [pulseIndex, setPulseIndex] = useState(0);
  const [simulatedCycle, setSimulatedCycle] = useState(14820);
  const [activeRegisters, setActiveRegisters] = useState<{ id: string; name: string; val: string; color: string }[]>([
    { id: 'R0', name: 'zero', val: '0x0003', color: 'from-amber-400 to-orange-500' },
    { id: 'R1', name: 'ra', val: '0x3F10', color: 'from-orange-400 to-rose-500' },
    { id: 'R2', name: 'sp', val: '0x14C0', color: 'from-rose-400 to-pink-500' },
    { id: 'R3', name: 'gp', val: '0x6E55', color: 'from-purple-400 to-indigo-500' },
    { id: 'R4', name: 'tp', val: '0x51A8', color: 'from-blue-400 to-cyan-500' },
    { id: 'R5', name: 't0', val: '0x7701', color: 'from-emerald-400 to-teal-500' },
    { id: 'R6', name: 't1', val: '0x82A1', color: 'from-teal-400 to-emerald-500' },
    { id: 'R7', name: 's0', val: '0xCAFE', color: 'from-amber-400 to-yellow-500' },
  ]);

  // Rotate pulse through the pipeline stages periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 4);
      setSimulatedCycle((prev) => prev + Math.floor(Math.random() * 8 + 1));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    {
      id: 0,
      title: 'Layer 1: Outer Loader',
      sub: 'Embive 128B RAM Streaming',
      badge: 'Outer Magic & Key',
      icon: Zap,
      color: 'from-amber-500 to-orange-600',
      glow: 'rgba(249, 115, 22, 0.4)',
      border: 'border-amber-500/40',
      desc: 'Outer magic verification, memory bus page streaming & Layer-2 unwrap',
    },
    {
      id: 1,
      title: 'Layer 2: Aegis Armor',
      sub: '8-State Flattened CFF',
      badge: 'Kernel Traps Active',
      icon: ShieldCheck,
      color: 'from-purple-500 to-violet-600',
      glow: 'rgba(168, 85, 247, 0.4)',
      border: 'border-purple-500/40',
      desc: 'DR0-DR7 hardware breakpoint scanner, opaque invariants & Layer-3 unwrap',
    },
    {
      id: 2,
      title: 'Layer 3: Core Micro-VM',
      sub: '128 RV32 Virtual Registers',
      badge: 'RustPython Frame',
      icon: Cpu,
      color: 'from-emerald-500 to-teal-600',
      glow: 'rgba(16, 185, 129, 0.4)',
      border: 'border-emerald-500/40',
      desc: 'In-memory execution in host globals() scope & instant register zeroing',
    },
    {
      id: 3,
      title: 'Comment-Free Single Line',
      sub: 'Strict 7 MB Size Ceiling',
      badge: 'Zero Comments',
      icon: Terminal,
      color: 'from-sky-500 to-blue-600',
      glow: 'rgba(56, 189, 248, 0.4)',
      border: 'border-sky-500/40',
      desc: 'Interpretor(globals(), b\'...\') on same line with zero revealing comments',
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-[#080a10] p-5 shadow-2xl backdrop-blur-xl">
      {/* Decorative ambient glowing lights */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-bl from-emerald-500/15 via-teal-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-gradient-to-t from-purple-500/15 to-transparent blur-3xl" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950/80 backdrop-blur-sm">
              <Cpu className="h-5 w-5 text-orange-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Native Rust Virtual Machine Execution Engine</span>
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold font-mono text-amber-300 border border-amber-500/30 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-ping" />
                <span>ACTIVE PIPELINE</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Deterministic Embive RISC-V Sandbox • Aegis CFF Dispatcher • RustPython Isolated Scope
            </p>
          </div>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-xs">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] text-zinc-400">Cycles:</span>
            <span className="font-mono text-[11px] font-bold text-emerald-300">{simulatedCycle.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-zinc-400">Magic:</span>
            <span className="font-mono text-[11px] font-bold text-amber-300">0x{magicHex}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-xs">
            <span className="h-2 w-2 rounded-full bg-purple-400" />
            <span className="text-[11px] text-zinc-400">Registers:</span>
            <span className="font-mono text-[11px] font-bold text-purple-300">128 RV32</span>
          </div>
        </div>
      </div>

      {/* 4 Interactive Animated Pipeline Nodes */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isPulse = pulseIndex === stage.id || isCompiling;
          return (
            <motion.div
              key={stage.id}
              initial={false}
              animate={{
                scale: isPulse ? 1.02 : 1.0,
                borderColor: isPulse ? 'rgba(249, 115, 22, 0.6)' : 'rgba(255, 255, 255, 0.08)',
              }}
              transition={{ duration: 0.3 }}
              className={`group relative flex flex-col justify-between rounded-2xl border bg-gradient-to-b from-white/[0.05] to-transparent p-4 transition-all duration-300 ${
                isPulse
                  ? 'shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/40 bg-zinc-900/90'
                  : 'hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              {/* Glowing node header */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stage.color} text-white shadow-md`}
                  style={{ boxShadow: isPulse ? `0 0 16px ${stage.glow}` : undefined }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-white/[0.06] border border-white/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">
                  {stage.badge}
                </span>
              </div>

              {/* Title & info */}
              <div className="mt-3 space-y-1">
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{stage.title}</span>
                  <span className="text-[10px] font-mono text-zinc-500">STAGE 0{idx + 1}</span>
                </div>
                <div className="text-[11px] font-medium text-amber-400/90 font-mono">{stage.sub}</div>
                <p className="text-[11px] text-zinc-400 leading-snug pt-0.5">{stage.desc}</p>
              </div>

              {/* Animated connector arrow */}
              {idx < 3 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 h-6 w-6 items-center justify-center rounded-full bg-zinc-950 border border-white/15 text-orange-400 shadow-md">
                  <ArrowRight className="h-3 w-3 animate-pulse" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Live RV32 Register Bank Monitor (Animated Micro-Bus) */}
      <div className="relative z-10 mt-4 rounded-2xl border border-white/[0.06] bg-black/40 p-3 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
              Live Rust Register Bank (RV32IMAC 128-Reg Emulation)
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Zero Register (R0) to Frame Pointer (R7)</span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {activeRegisters.map((reg) => (
            <div
              key={reg.id}
              className="group relative flex flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] p-1.5 hover:border-orange-500/40 hover:bg-white/[0.06] transition-all"
            >
              <div className="flex items-center gap-1">
                <span className="font-mono text-[10px] font-bold text-zinc-300">{reg.id}</span>
                <span className="text-[9px] text-zinc-500">({reg.name})</span>
              </div>
              <span className={`mt-0.5 font-mono text-[11px] font-bold bg-gradient-to-r ${reg.color} bg-clip-text text-transparent`}>
                {reg.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
