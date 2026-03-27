"use client";

import React, { useState } from 'react';
import { InstitutionalShell } from '@/components/shared/InstitutionalShell';
import { AcademyViewer } from '@/components/academy/AcademyViewer';
import { BookOpen, GraduationCap, Shield, Cpu, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import "@/app/dashboard/dashboard.css";

const TRACKS = [
  { icon: Shield,     label: "ZK Privacy Fundamentals", level: "Beginner",      badge: "FOUNDATION", color: "var(--az-emerald)" },
  { icon: TrendingUp, label: "On-Chain Whale Analysis", level: "Intermediate",  badge: "CORE",       color: "var(--az-lime)"    },
  { icon: Cpu,        label: "Aztec Protocol Engineering", level: "Advanced",   badge: "ELITE",      color: "var(--az-orchid)"  },
  { icon: Lock,       label: "Sovereign Vault Setup",    level: "Intermediate",  badge: "TOOLKIT",    color: "var(--az-amber)"   },
];

export default function AcademyPage() {
  return (
    <InstitutionalShell title="Whale Academy" subtitle="Sovereign Knowledge Architecture" badge="EDUCATION" badgeVariant="orchid">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* ─── Stats ─── */}
        <div className="border" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0a0a0a" }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { label: "Learning Tracks", value: "12", color: "rgba(255,255,255,0.9)" },
              { label: "Total Modules", value: "80+", color: "var(--az-lime)" },
              { label: "Graduates", value: "4,200", color: "var(--az-emerald)" },
              { label: "Completion Rate", value: "91%", color: "var(--az-orchid)" },
            ].map((s, i) => (
              <div key={i} className="az-stat-card" style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span className="az-label" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</span>
                <span className="az-value-xl" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Track selection ─── */}
        <div className="border" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0a0a0a" }}>
          <div className="az-col-header flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)" }}>
            <GraduationCap size={10} />
            AVAILABLE LEARNING TRACKS
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {TRACKS.map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ background: "rgba(255,255,255,0.05)" }}
                className="p-6 cursor-pointer"
                style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              >
                <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                  <t.icon size={18} style={{ color: t.color }} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 7, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: t.color, marginBottom: 6, background: "rgba(255,255,255,0.05)", padding: "2px 6px", display: "inline-block", border: `1px solid ${t.color}30` }}>{t.badge}</div>
                <div className="az-header-sm" style={{ marginBottom: 4, color: "rgba(255,255,255,0.9)" }}>{t.label}</div>
                <div className="az-label" style={{ color: "rgba(255,255,255,0.4)" }}>{t.level}</div>
                <div className="az-bar-track" style={{ marginTop: 12, background: "rgba(255,255,255,0.05)" }}>
                  <div className="az-bar-fill-lime" style={{ width: i === 0 ? "90%" : i === 1 ? "65%" : i === 2 ? "40%" : "55%" }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── Academy Viewer ─── */}
        <div className="border" style={{ borderColor: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
          <div className="az-col-header flex items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)" }}>
            <BookOpen size={10} />
            INSTITUTIONAL KNOWLEDGE VIEWER
          </div>
          <div style={{ height: "60vh", background: "#050505", overflow: "hidden" }}>
            <AcademyViewer />
          </div>
        </div>
      </div>
    </InstitutionalShell>
  );
}
