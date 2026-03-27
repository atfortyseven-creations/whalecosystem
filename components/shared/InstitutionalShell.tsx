"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";


interface InstitutionalShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "lime" | "emerald" | "rose" | "orchid" | "amber";
}

export function InstitutionalShell({ 
  children, 
  title, 
  subtitle,
  badge,
  badgeVariant = "lime"
}: InstitutionalShellProps) {

  return (
    <div className="dash-root" style={{ fontFamily: "'Space Grotesk', sans-serif", background: "var(--az-parchment)", color: "var(--az-ink)", WebkitFontSmoothing: "antialiased", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }} />



      {/* ─── Page Header Sub-bar ─── */}
      <div className="flex-shrink-0 border-b px-6 py-4 relative z-30" style={{ borderColor: "rgba(26,20,0,0.06)", background: "rgba(253,251,247,0.80)", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {badge && (
              <span style={{ 
                fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", 
                textTransform: "uppercase", padding: "3px 8px",
                background: badgeVariant === "lime" ? "rgba(224,255,0,0.08)" : badgeVariant === "emerald" ? "rgba(0,232,122,0.08)" : "rgba(182,111,255,0.08)", 
                border: badgeVariant === "lime" ? "1px solid rgba(224,255,0,0.30)" : badgeVariant === "emerald" ? "1px solid rgba(0,232,122,0.25)" : "1px solid rgba(182,111,255,0.25)",
                color: badgeVariant === "lime" ? "var(--az-lime)" : badgeVariant === "emerald" ? "var(--az-emerald)" : "var(--az-orchid)"
              }}>
                {badge}
              </span>
            )}
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(18px,3vw,28px)", fontWeight: 700, letterSpacing: "-0.03em", color: "var(--az-ink)", lineHeight: 1 }}>
              {title}
            </h1>
            {subtitle && (
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "rgba(26,20,0,0.40)", fontWeight: 500 }}>
                — {subtitle}
              </span>
            )}
          </div>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: "rgba(26,20,0,0.30)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
            <Link href="/landing" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>
            <ChevronRight size={10} />
            <span style={{ color: "rgba(26,20,0,0.70)" }}>{title}</span>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full az-scroll"
          style={{ overflowY: "auto" }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
