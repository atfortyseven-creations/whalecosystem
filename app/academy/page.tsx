"use client";

import React from 'react';
import { AcademyViewer } from '@/components/academy/AcademyViewer';
import { Shield, Cpu, TrendingUp, Lock } from 'lucide-react';
import "@/app/dashboard/dashboard.css";

const TRACKS = [
  { icon: Shield,     label: "ZK Privacy Fundamentals",    level: "Beginner",     color: "var(--az-emerald)" },
  { icon: TrendingUp, label: "On-Chain Whale Analysis",    level: "Intermediate", color: "var(--az-lime)"    },
  { icon: Cpu,        label: "Aztec Protocol Engineering", level: "Advanced",     color: "var(--az-orchid)"  },
  { icon: Lock,       label: "Sovereign Vault Setup",      level: "Intermediate", color: "var(--az-amber)"   },
];

export default function AcademyPage() {
  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden">

      {/* Track strip — single breathable row, no cramping */}
      <div className="flex-shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-xl px-6 py-3">
        <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TRACKS.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border whitespace-nowrap flex-shrink-0 transition-all hover:bg-white/5"
              style={{ borderColor: `${t.color}30`, background: `${t.color}08` }}
            >
              <t.icon size={12} style={{ color: t.color }} />
              <span className="text-xs font-medium text-white/70">{t.label}</span>
              <span className="text-[10px] font-mono text-white/25 ml-0.5">{t.level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full-height viewer — sidebar + content scroll natively */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AcademyViewer />
      </div>

    </div>
  );
}
