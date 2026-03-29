"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AcademyViewer } from '@/components/academy/AcademyViewer';
import { Shield, Cpu, TrendingUp, Lock, BookOpen } from 'lucide-react';
import { InstitutionalShell } from "@/components/shared/InstitutionalShell";
import { CorporateWhaleLogo } from '@/components/bsv/CorporateWhaleLogo';
import "@/app/dashboard/dashboard.css";

const TRACKS = [
  { icon: Shield,     label: "ZK Privacy Fundamentals",    level: "Beginner" },
  { icon: TrendingUp, label: "On-Chain Whale Analysis",    level: "Intermediate" },
  { icon: Cpu,        label: "Aztec Protocol Engineering", level: "Advanced" },
  { icon: Lock,       label: "Sovereign Vault Setup",      level: "Intermediate" },
];

// ─── WHALE HERO ───
function WhaleAcademyHero() {
  return (
    <div className="relative flex-shrink-0 flex flex-col items-center justify-center pt-12 pb-8 px-6 text-center bg-[#FAF9F6] border-b border-[#E5E5E5]">
      
      {/* Subtle grid backdrop for institutional feel */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#111111 0,#111111 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#111111 0,#111111 1px,transparent 1px,transparent 40px)' }} />

      {/* Corporate Whale Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mb-6"
      >
        <div className="w-[80px] h-[80px] bg-[#111111] rounded-2xl flex items-center justify-center shadow-lg p-2 mx-auto">
          <CorporateWhaleLogo className="w-full h-full text-[#FAF9F6]" />
        </div>
      </motion.div>

      {/* Title block */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="relative z-10"
      >
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.45em] text-[#111111]/40 mb-3">
          Sovereign Knowledge Hub
        </p>
        <h1 className="font-sans font-black text-5xl md:text-6xl text-[#111111] tracking-tighter leading-none mb-4">
          Whale Academy
        </h1>
        <p className="font-sans text-sm text-[#888888] font-bold max-w-md mx-auto leading-relaxed">
          Institutional-grade education for the sovereign on-chain operator. From ZK fundamentals to deep protocol analysis.
        </p>
      </motion.div>

      {/* Track pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-3 mt-8"
      >
        {TRACKS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E5E5] bg-white whitespace-nowrap hover:border-[#111111]/20 transition-all cursor-default shadow-sm group"
          >
            <t.icon size={13} className="text-[#888888] group-hover:text-[#111111]" />
            <span className="font-mono text-[9px] font-black text-[#111111] uppercase tracking-wider">{t.label}</span>
            <span className="font-mono text-[9px] font-bold text-[#00FFAA] ml-1">{t.level}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function AcademyPage() {
  return (
    <InstitutionalShell title="Whale Academy" subtitle="Sovereign Knowledge Hub" fullWidth>
      <WhaleAcademyHero />
      <AcademyViewer />
    </InstitutionalShell>
  );
}
