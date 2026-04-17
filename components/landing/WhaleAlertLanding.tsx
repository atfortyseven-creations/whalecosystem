"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUIStore } from '@/lib/store/ui-store';
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import type { ManifestoSection } from "@/lib/manifesto-parser";

interface WhaleAlertLandingProps {
  sections: ManifestoSection[];
}

export default function WhaleAlertLanding({ sections }: WhaleAlertLandingProps) {
  const [mounted, setMounted] = useState(false);
  const openConnectModal = useUIStore(s => s.openConnectModal);
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAF9F6] text-[#050505] selection:bg-[#050505] selection:text-[#FAF9F6]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto px-6 md:px-0 pt-24 pb-32"
      >

        {/* ── EYEBROW ─────────────────────────────────────────────────────── */}
        <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-[#050505]/25 mb-10">
          whale alert network · protocol v6.12.0
        </p>

        {/* ── TITLE ───────────────────────────────────────────────────────── */}
        <h1 className="font-mono text-[13px] md:text-[15px] font-normal text-[#050505] leading-[2] tracking-tight mb-2">
          in search of transparency.
        </h1>
        <p className="font-mono text-[11px] text-[#050505]/40 leading-relaxed mb-3">
          tracking and filtering institutional blockchain movements in real time.
        </p>
        <p className="font-mono text-[11px] text-[#050505]/40 leading-relaxed mb-3">
          all data sourced directly from on-chain state — 100% verifiable, 100% live.
        </p>
        <p className="font-mono text-[11px] text-[#050505]/40 leading-relaxed mb-10">
          multi-chain · non-custodial · zero simulation · zero intermediaries.
        </p>

        {/* ── STATUS ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-5 mb-16 font-mono text-[9px] uppercase tracking-[0.35em] text-[#050505]/30">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            system nominal
          </span>
          <span>l1 / l2 ingress active</span>
        </div>

        {/* ══ WHITE CARD: BODY ════════════════════════════════════════ */}
        <div className="w-full bg-white border border-[#050505]/06 rounded-2xl shadow-[0_4px_40px_rgba(0,0,0,0.04)] overflow-hidden">

          {/* INDEX ─────────────────────────────────────────────────────────── */}
          <div className="px-8 pt-8 pb-6 border-b border-[#050505]/06">
            <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#050505]/20 mb-5">
              index
            </p>
            <ol className="space-y-2.5">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(section.id);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="font-mono text-[11px] text-[#050505]/50 hover:text-[#050505] transition-colors flex items-baseline gap-4 group text-left w-full"
                  >
                    <span className="text-[#050505]/20 group-hover:text-[#050505]/40 tabular-nums shrink-0 transition-colors">
                      {String(index + 1).padStart(2, "0")}.
                    </span>
                    <span className="border-b border-transparent group-hover:border-[#050505]/15 transition-colors pb-px leading-[1.6]">
                      {section.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* BODY SECTIONS ──────────────────────────────────────────────────── */}
          <div className="divide-y divide-[#050505]/05">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className="px-8 py-10 scroll-mt-8"
              >
                <h2 className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[#050505] mb-6">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.body.map((para, i) => {
                    if (para.startsWith('[SUBTITLE]')) {
                      return (
                        <h3 key={i} className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#050505]/70 pt-4 mb-2">
                          {para.replace('[SUBTITLE]', '')}
                        </h3>
                      );
                    }
                    if (para.startsWith('[LIST_ITEM]')) {
                      return (
                        <div key={i} className="flex gap-4 font-mono text-[11px] leading-[1.9] text-[#050505]/55 tracking-tight border-l cursor-default border-[#050505]/10 pl-4 py-1 hover:border-[#050505]/30 transition-colors">
                          <span className="shrink-0 text-[#050505]/30 mt-1">—</span>
                          <span className="flex-1">{para.replace('[LIST_ITEM]', '')}</span>
                        </div>
                      );
                    }
                    return (
                      <p
                        key={i}
                        className="font-mono text-[11px] leading-[1.9] text-[#050505]/55 tracking-tight"
                      >
                        {para}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── CTA ─────────────────────────────────────────────────────────── */}
          <div className="px-8 py-10 bg-[#FAF9F6]/50 border-t border-[#050505]/06">
            <p className="font-mono text-[8px] uppercase tracking-[0.5em] text-[#050505]/20 mb-3">
              access
            </p>
            <p className="font-mono text-[11px] text-[#050505]/40 leading-relaxed mb-6 max-w-sm">
              connect your authorised web3 wallet. a single cryptographic signature grants full access to all sovereign-grade modules.
            </p>
            {isConnected ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FAF9F6] bg-[#050505] px-7 py-3.5 hover:bg-[#050505]/80 transition-colors"
              >
                enter dashboard →
              </button>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); openConnectModal(); }}
                className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#FAF9F6] bg-[#050505] px-7 py-3.5 hover:bg-[#050505]/80 transition-colors"
              >
                initialize terminal →
              </button>
            )}
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="mt-16 pt-8 border-t border-[#050505]/06 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#050505]/20">
            © whale alert network 2026
          </span>
          <div className="flex gap-6">
            <a href="https://twitter.com/WhaleAlert" className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/20 hover:text-[#050505]/50 transition-colors">twitter</a>
            <a href="https://github.com" className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/20 hover:text-[#050505]/50 transition-colors">github</a>
          </div>
        </footer>

      </motion.div>
    </div>
  );
}
