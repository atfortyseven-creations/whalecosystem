"use client";

import React from "react";
import { motion } from "framer-motion";
import { CorporateWhaleLogo } from "@/components/bsv/CorporateWhaleLogo";

interface InstitutionalShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "lime" | "emerald" | "rose" | "orchid" | "amber";
}

// ─── THE MASTER STACK SHELL (PURE MONOCHROME) ───
export function InstitutionalShell({ 
  children, 
  title, 
  subtitle,
  badge
}: InstitutionalShellProps) {

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] bg-white text-black overflow-hidden relative font-aztec-body">
      
      {/* ─── Global Depth Scanlines (Monochrome Variant) ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply opacity-[0.02]" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)" }} />
      <div className="absolute top-0 inset-x-0 h-px bg-black/[0.03] z-10" />

      {/* ─── Centered Logo + Minimal Header ─── */}
      <div className="flex-shrink-0 relative z-30 bg-white border-b border-black/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.01)] py-8 px-6 flex flex-col items-center justify-center text-center">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <CorporateWhaleLogo className="w-12 h-12 text-black mb-5 mx-auto" />
        </motion.div>
        
        <div className="flex items-center justify-center gap-4 relative">
          <h1 className="font-aztec-h1 text-3xl md:text-5xl text-black tracking-tighter leading-none m-0 uppercase selection:bg-black/10">
            {title}
          </h1>
          {badge && (
            <span className="absolute -right-2 top-0 translate-x-full -translate-y-1/2 font-mono text-[8px] font-black tracking-[0.4em] uppercase px-3 py-1 bg-black text-white shadow-sm">
              {badge}
            </span>
          )}
        </div>
        
        {subtitle && (
          <span className="font-mono text-[10px] text-black/40 tracking-[0.3em] font-bold uppercase mt-3 block selection:bg-black/10">
            {subtitle}
          </span>
        )}
      </div>

      {/* ─── Deep Inner Scrollable Viewpoint ─── */}
      <div className="flex-1 overflow-y-auto relative z-10" style={{ scrollbarWidth: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="h-full min-h-0 container mx-auto"
        >
          {children}
        </motion.div>
      </div>

    </div>
  );
}
