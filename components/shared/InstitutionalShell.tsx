"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Shield, Activity, BookOpen, TrendingUp, 
  Headphones, Home, ChevronRight 
} from "lucide-react";

const NAV = [
  { href: "/vip",        label: "Whale VIP",        icon: Shield,     badge: "LIVE" },
  { href: "/activities",  label: "Whale Activity",   icon: Activity,   badge: null   },
  { href: "/portfolio",  label: "Whale Portfolio",   icon: TrendingUp, badge: null   },
  { href: "/support",    label: "Whale Support",     icon: Headphones, badge: null   },
  { href: "/academy",    label: "Whale Academy",     icon: BookOpen,   badge: "NEW"  },
];

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
  const pathname = usePathname();

  return (
    <div className="dash-root" style={{ fontFamily: "'Space Grotesk', sans-serif", background: "var(--az-parchment)", color: "var(--az-ink)", WebkitFontSmoothing: "antialiased", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }} />

      {/* ─── Top Header Strip ─── */}
      <div className="flex-shrink-0 border-b glass-aztek z-40 relative" style={{ borderColor: "rgba(26,20,0,0.07)" }}>
        <div className="flex items-center gap-0 h-11 overflow-x-auto">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2 px-4 border-r h-full hover:bg-black/5 transition-colors flex-shrink-0" style={{ borderColor: "rgba(26,20,0,0.07)" }}>
            <div className="w-6 h-6 relative">
              <Image src="/official-whale-vector.png" alt="Whale Alert" fill className="object-contain" />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,20,0,0.80)" }}>
              WHALE ALERT
            </span>
          </Link>

          {/* Page Tabs */}
          {NAV.map(item => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="az-tab" style={{
                color: isActive ? "var(--az-lime)" : "rgba(26,20,0,0.40)",
                borderBottom: isActive ? "2px solid var(--az-lime)" : "2px solid transparent",
                background: isActive ? "rgba(224,255,0,0.04)" : "transparent",
                display: "flex", alignItems: "center", gap: 6, padding: "0 16px",
                height: "100%", fontFamily: "'JetBrains Mono',monospace", fontSize: 9, 
                fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase",
                whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s",
                textDecoration: "none"
              }}>
                <item.icon size={11} />
                {item.label}
                {item.badge && (
                  <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.1em", padding: "1px 5px", background: item.badge === "LIVE" ? "rgba(0,232,122,0.12)" : "rgba(224,255,0,0.12)", border: item.badge === "LIVE" ? "1px solid rgba(0,232,122,0.30)" : "1px solid rgba(224,255,0,0.30)", color: item.badge === "LIVE" ? "var(--az-emerald)" : "var(--az-lime)" }}>
                    {item.badge === "LIVE" && <span className="az-dot-live" style={{ width: 4, height: 4, marginRight: 3, display: "inline-block", borderRadius: "50%", background: "var(--az-emerald)", animation: "az-pulse 2s infinite" }} />}
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Right side status */}
          <div className="ml-auto flex items-center gap-4 px-4 border-l flex-shrink-0" style={{ borderColor: "rgba(26,20,0,0.07)" }}>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 8, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(26,20,0,0.30)", textTransform: "uppercase" }}>
              ADE v5.0
            </span>
            <span className="az-dot-live" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--az-emerald)", display: "inline-block" }} />
          </div>
        </div>
      </div>

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
