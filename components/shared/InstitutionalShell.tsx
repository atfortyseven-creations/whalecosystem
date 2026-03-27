"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Activity, Cpu } from "lucide-react";

interface InstitutionalShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "lime" | "emerald" | "rose" | "orchid" | "amber";
}

// ─── THE MASTER STACK SHELL ───
export function InstitutionalShell({ 
  children, 
  title, 
  subtitle,
  badge,
  badgeVariant = "orchid"
}: InstitutionalShellProps) {

  // Exact brand colors derived from the 300B logic
  const colors = {
      lime: "var(--aztec-chartreuse)",
      emerald: "#10b981",
      rose: "#f43f5e",
      orchid: "var(--aztec-orchid)",
      amber: "#fbbf24",
  };
  const activeColor = colors[badgeVariant];

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] bg-[#FDFBF7] text-[#1A1A1A] overflow-hidden relative font-aztec-body">
      
      {/* ─── Global Depth Scanlines (Ivory Variant) ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply opacity-[0.03]" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)" }} />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-black/5 to-transparent z-10" />

      {/* ─── Stack Sub-Header (The Ivory Banner) ─── */}
      <div className="flex-shrink-0 px-6 lg:px-12 py-5 relative z-30 bg-white/60 backdrop-blur-3xl border-b border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Title Identity */}
        <div className="flex items-center gap-4">
          {badge && (
            <span className="font-mono text-[8px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-sm bg-black/5 border border-black/10" style={{ color: activeColor }}>
              {badge}
            </span>
          )}
          <div className="flex flex-col">
              <h1 className="font-aztec-h1 text-2xl md:text-3xl text-[#1A1A1A] tracking-tighter leading-none m-0">
                {title}
              </h1>
              {subtitle && (
                <span className="font-mono text-[9px] text-black/40 tracking-[0.2em] font-medium uppercase mt-1">
                  — {subtitle}
                </span>
              )}
          </div>
        </div>
      </div>

      {/* ─── Deep Inner Scrollable Viewpoint ─── */}
      <div className="flex-1 overflow-y-auto relative z-10" style={{ scrollbarWidth: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full min-h-0"
        >
          {children}
        </motion.div>
      </div>

    </div>
  );
}
