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
  fullWidth?: boolean;
}

// ─── THE MASTER STACK SHELL (PURE MONOCHROME) ───
export function InstitutionalShell({ 
  children, 
  title, 
  subtitle,
  badge,
  fullWidth = false
}: InstitutionalShellProps) {

  return (
    <div className="flex flex-col min-h-[calc(100vh-105px)] bg-white text-black relative font-aztec-body">
      
      {/* ─── Global Depth Scanlines (Monochrome Variant) ─── */}
      <div className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply opacity-[0.02]" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)" }} />
      <div className="absolute top-0 inset-x-0 h-px bg-black/[0.03] z-10" />

      {/* ─── Content flows naturally, scroll is on the page root ─── */}
      <div className="flex-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className={`min-h-full pb-10 ${fullWidth ? 'w-full' : 'container mx-auto'}`}
        >
          {children}
        </motion.div>
      </div>

    </div>
  );
}
