'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Cpu, BookOpen, Sparkles, Layers, Zap, ShieldCheck } from 'lucide-react';
import { PresetProfile } from '@/lib/types';

interface NavbarProps {
  presets: PresetProfile[];
  activePresetId: string;
  onSelectPreset: (preset: PresetProfile) => void;
  onOpenDocs: () => void;
  onTriggerObfuscate: () => void;
  isObfuscating: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  presets,
  activePresetId,
  onSelectPreset,
  onOpenDocs,
  onTriggerObfuscate,
  isObfuscating,
}) => {
  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl shadow-2xl shadow-black/40 ring-1 ring-white/5"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 p-0.5 shadow-lg shadow-orange-500/20"
          >
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-zinc-950">
              <Cpu className="h-5 w-5 text-orange-400" />
            </div>
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold tracking-tight text-white">
                PyVM<span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">.Rust</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold font-mono text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Native Rust VM</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans hidden sm:block">
              Cross-Platform Virtualizer & Bytecode Hardener (Py 3.7–3.14)
            </p>
          </div>
        </div>

        {/* Center Capabilities Badges with Vibrant Colors */}
        <div className="hidden lg:flex items-center gap-2">
          <motion.div
            whileHover={{ y: -1 }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-200 shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="font-medium">Embive 128B RAM Bus</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -1 }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 px-3 py-1 text-xs text-purple-200 shadow-sm"
          >
            <span className="text-purple-400 font-mono font-bold">Aegis CFF</span>
            <span className="text-zinc-400">•</span>
            <span className="font-medium text-purple-300">128 Regs</span>
          </motion.div>

          <motion.div
            whileHover={{ y: -1 }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 px-3 py-1 text-xs text-orange-200 shadow-sm"
          >
            <Layers className="h-3.5 w-3.5 text-orange-400" />
            <span className="font-medium">RustPython Scope</span>
          </motion.div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Preset Selector */}
          <div className="relative">
            <select
              value={activePresetId}
              onChange={(e) => {
                const found = presets.find((p) => p.id === e.target.value);
                if (found) onSelectPreset(found);
              }}
              className="h-10 rounded-xl bg-zinc-900/90 border border-white/10 px-3.5 pr-8 text-xs font-medium text-zinc-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all cursor-pointer appearance-none shadow-sm hover:border-white/20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23fb923c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                backgroundSize: '14px',
              }}
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id} className="bg-zinc-950 text-zinc-200">
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Architecture Documentation Modal Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenDocs}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-xs font-semibold text-zinc-200 hover:bg-white/[0.1] hover:text-white transition-all shadow-sm cursor-pointer"
            title="View Technical Architecture Blueprint"
          >
            <BookOpen className="h-4 w-4 text-orange-400" />
            <span className="hidden sm:inline">Blueprint</span>
          </motion.button>

          {/* Obfuscate Action Button with glowing vibrant gradient */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onTriggerObfuscate}
            disabled={isObfuscating}
            className="relative group flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 px-4 text-xs font-bold text-zinc-950 transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className={`h-4 w-4 ${isObfuscating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'}`} />
            <span>{isObfuscating ? 'Virtualizing...' : 'Build Obfuscated .py'}</span>
          </motion.button>
        </div>
      </motion.div>
    </header>
  );
};
