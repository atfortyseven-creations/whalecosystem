"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AcademyViewer } from '@/components/academy/AcademyViewer';
import { Shield, Cpu, TrendingUp, Lock, BookOpen } from 'lucide-react';
import Image from 'next/image';
import "@/app/dashboard/dashboard.css";

const TRACKS = [
  { icon: Shield,     label: "ZK Privacy Fundamentals",    level: "Beginner" },
  { icon: TrendingUp, label: "On-Chain Whale Analysis",    level: "Intermediate" },
  { icon: Cpu,        label: "Aztec Protocol Engineering", level: "Advanced" },
  { icon: Lock,       label: "Sovereign Vault Setup",      level: "Intermediate" },
];

// ─── WHALE HERO (identical animation to VIP/Network) ───
function WhaleAcademyHero() {
  return (
    <div className="relative flex-shrink-0 flex flex-col items-center justify-center pt-12 pb-8 px-6 text-center bg-[#050505] overflow-hidden border-b border-white/5">

      {/* Grid backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)' }} />

      {/* Deep radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,255,255,0.05), transparent)' }} />

      {/* Whale Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Glow pulse ring */}
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.18, 0.06] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-white/20 blur-2xl"
          />
          <Image
            src="/official-whale-monochrome.png"
            alt="Whale Academy"
            width={110}
            height={110}
            className="relative z-10 drop-shadow-[0_8px_32px_rgba(255,255,255,0.12)] invert select-none"
            priority
          />
        </motion.div>
      </motion.div>

      {/* Title block */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.45em] text-white/30 mb-2">
          Sovereign Knowledge Hub
        </p>
        <h1 className="font-aztec-h1 text-4xl md:text-5xl lg:text-6xl text-white tracking-tighter leading-none mb-3">
          Whale Academy
        </h1>
        <p className="font-sans text-sm text-white/40 max-w-md mx-auto leading-relaxed">
          Institutional-grade education for the sovereign on-chain operator. From ZK fundamentals to deep protocol analysis.
        </p>
      </motion.div>

      {/* Track pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-7"
      >
        {TRACKS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 whitespace-nowrap hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
          >
            <t.icon size={11} className="text-white/50" />
            <span className="font-mono text-[9px] font-bold text-white/60 uppercase tracking-wider">{t.label}</span>
            <span className="font-mono text-[8px] text-white/20 ml-0.5">{t.level}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] whitespace-nowrap">
          <BookOpen size={11} className="text-white/20" />
          <span className="font-mono text-[9px] font-bold text-white/25 uppercase tracking-wider">More coming</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function AcademyPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-105px)] bg-[#050505] text-white overflow-hidden">

      {/* Hero with whale */}
      <WhaleAcademyHero />

      {/* Full-height viewer — sidebar + content scroll natively */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AcademyViewer />
      </div>
    </div>
  );
}
