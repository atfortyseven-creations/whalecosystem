"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useUIStore } from '@/lib/store/ui-store';
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { MegaReadmeParser } from "./MegaReadmeParser";

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default function WhaleAlertLanding({ readmeContent }: { readmeContent?: string }) {
  const [mounted, setMounted] = useState(false);
  const openConnectModal = useUIStore(s => s.openConnectModal);
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => { setMounted(true); }, []);

  // Extract H2 sections for the inline index at the top
  const sections = useMemo(() => {
    if (!readmeContent) return [];
    return readmeContent
      .split('\n')
      .filter(l => l.startsWith('## '))
      .map(l => l.replace('## ', '').trim());
  }, [readmeContent]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full bg-[#FAF9F6] text-[#050505] selection:bg-[#050505] selection:text-[#FAF9F6] overscroll-none">

      {/* ── MAIN CONTENT ── */}
      <main className="w-full max-w-3xl mx-auto px-6 md:px-0 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* ── HEADER: manifesto ── */}
          <header className="mb-16">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#050505]/30 mb-6">
              whale alert network · v6.12.0
            </p>
            <h1 className="font-mono text-[13px] md:text-[15px] font-normal lowercase text-[#050505] leading-relaxed tracking-tight mb-8">
              in search of transparency.
            </h1>
            <div className="font-mono text-[11px] leading-loose text-[#050505]/60 lowercase space-y-1 max-w-lg">
              <p>tracking and filtering institutional blockchain movements in real time.</p>
              <p>all data sourced directly from on-chain state. 100% verifiable. 100% live.</p>
              <p>protocol v6.12.0 · multi-chain · non-custodial · zero simulation.</p>
            </div>

            {/* ── STATUS ROW ── */}
            <div className="flex items-center gap-6 mt-8 font-mono text-[10px] uppercase tracking-widest text-[#050505]/40">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                system nominal
              </span>
              <span>l1/l2 ingress active</span>
              <span>non-custodial</span>
            </div>
          </header>

          {/* ── INDEX: inline at the top ── */}
          {sections.length > 0 && (
            <nav className="mb-16 border border-[#050505]/08 bg-white/60 rounded-xl p-6">
              <p className="font-mono text-[9px] uppercase tracking-[0.45em] text-[#050505]/30 mb-4">
                index
              </p>
              <ol className="space-y-1.5">
                {sections.map((title, i) => (
                  <li key={i}>
                    <button
                      onClick={() => scrollTo(slugify(title))}
                      className="font-mono text-[11px] lowercase text-[#050505]/60 hover:text-[#050505] transition-colors flex items-baseline gap-3 group text-left w-full"
                    >
                      <span className="text-[#050505]/20 group-hover:text-[#050505]/40 transition-colors tabular-nums w-5 shrink-0">
                        {String(i + 1).padStart(2, '0')}.
                      </span>
                      <span className="border-b border-transparent group-hover:border-[#050505]/20 transition-colors">
                        {title.toLowerCase()}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* ── BODY: full README ── */}
          {readmeContent ? (
            <MegaReadmeParser content={readmeContent} />
          ) : (
            <p className="font-mono text-[11px] text-[#050505]/30 lowercase my-20">
              no manifesto data found.
            </p>
          )}

          {/* ── SEPARATOR ── */}
          <div className="w-full border-t border-[#050505]/08 my-20" />

          {/* ── CONNECT CTA ── */}
          <div className="flex flex-col gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#050505]/30">
              access
            </p>
            <p className="font-mono text-[11px] text-[#050505]/50 lowercase leading-relaxed max-w-md">
              to proceed, connect your authorized web3 wallet. a single signature grants full access to all sovereign-grade modules.
            </p>
            <div className="mt-4">
              {isConnected ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#FAF9F6] bg-[#050505] px-8 py-4 hover:bg-[#050505]/80 transition-colors"
                >
                  enter dashboard →
                </button>
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); openConnectModal(); }}
                  className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#FAF9F6] bg-[#050505] px-8 py-4 hover:bg-[#050505]/80 transition-colors"
                >
                  initialize terminal →
                </button>
              )}
            </div>
          </div>

          {/* ── FOOTER: HARD STOP — nothing rendered beyond this point ── */}
          <footer className="mt-16 pb-10 pt-8 border-t border-[#050505]/06 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#050505]/20">
              © whale alert network 2026
            </span>
            <div className="flex gap-8">
              <a href="https://twitter.com/WhaleAlert" className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/20 hover:text-[#050505]/60 transition-colors">twitter</a>
              <a href="https://github.com" className="font-mono text-[9px] uppercase tracking-widest text-[#050505]/20 hover:text-[#050505]/60 transition-colors">github</a>
            </div>
          </footer>
          {/* ╔═══════════════════════════════════════════════════════╗
               ║   BOUNDARY SEAL — NO CONTENT OR SPACE BEYOND HERE   ║
               ╚═══════════════════════════════════════════════════════╝ */}

        </motion.div>
      </main>
    </div>
  );
}


