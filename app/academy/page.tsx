"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AcademyViewer } from '@/components/academy/AcademyViewer';
import { Shield, Cpu, TrendingUp, Lock, BookOpen } from 'lucide-react';
import { InstitutionalShell } from "@/components/shared/InstitutionalShell";
import { CorporateWhaleLogo } from '@/components/bsv/CorporateWhaleLogo';
import "@/app/dashboard/dashboard.css";



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
        <h1 className="font-sans font-black text-5xl md:text-6xl text-[#111111] tracking-tighter leading-none mb-4 mt-3">
          Whale Academy
        </h1>
        <p className="font-sans text-sm text-[#888888] font-bold max-w-md mx-auto leading-relaxed">
          Institutional-grade education for the sovereign on-chain operator. From ZK fundamentals to deep protocol analysis.
        </p>
      </motion.div>


    </div>
  );
}

export default function AcademyPage() {
  return (
    <InstitutionalShell title="Whale Academy" fullWidth>
      <WhaleAcademyHero />
      <AcademyViewer />
    </InstitutionalShell>
  );
}
