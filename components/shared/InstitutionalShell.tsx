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



      {/* ─── Deep Inner Scrollable Viewpoint ─── */}
      <div className="flex-1 overflow-y-auto relative z-10" data-scroll-container style={{ scrollbarWidth: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="min-h-full container mx-auto pb-10"
        >
          {children}
        </motion.div>
      </div>

    </div>
  );
}
