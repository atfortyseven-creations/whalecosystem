"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from '@/lib/store/ui-store';
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { MegaReadmeParser } from "./MegaReadmeParser";
import { Menu, X, ChevronRight } from "lucide-react";

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default function WhaleAlertLanding({ readmeContent }: { readmeContent?: string }) {
  const [mounted, setMounted] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const openConnectModal = useUIStore(s => s.openConnectModal);
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => { setMounted(true); }, []);

  // Parse H2 headers from content for the floating index
  const sections = useMemo(() => {
    if (!readmeContent) return [];
    const lines = readmeContent.split('\n');
    const headers = lines.filter(line => line.startsWith('## ')).map(line => line.replace('## ', '').trim());
    return headers;
  }, [readmeContent]);

  const scrollToSection = (id: string) => {
    setIsIndexOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative w-full min-h-screen bg-[#FAF9F6] text-[#050505] font-sans selection:bg-[#050505] selection:text-[#FAF9F6]">

      {/* Floating Index Button */}
      <div className="fixed bottom-8 right-8 z-[100]">
        <AnimatePresence>
          {isIndexOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-72 max-h-[60vh] overflow-y-auto bg-white border border-[#E5E5E5] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-2xl p-4 custom-scrollbar flex flex-col gap-1"
            >
              <div className="text-[10px] font-black uppercase tracking-widest text-[#888888] mb-2 px-3">
                Índice de Documentación
              </div>
              {sections.map((title, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToSection(slugify(title))}
                  className="text-left px-3 py-2 rounded-lg hover:bg-[#FAF9F6] text-xs font-bold text-[#050505] transition-colors flex items-center justify-between group"
                >
                  <span className="truncate pr-4">{title}</span>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#888888] shrink-0" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsIndexOpen(!isIndexOpen)}
          className="flex items-center justify-center w-14 h-14 bg-[#050505] text-[#FAF9F6] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-all"
        >
          {isIndexOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="relative z-[50] flex-1 w-full max-w-4xl mx-auto flex flex-col pt-24 pb-48 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-2 mb-12">
            <div className="h-px w-8 bg-[#050505]/20" />
            <span className="text-[9px] font-black uppercase tracking-[0.35em] text-[#050505]/50">Master Architecture</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-[#050505] leading-tight mb-4 uppercase">
            Sovereign-Grade <br/> Intelligence
          </h1>
          
          {readmeContent ? (
            <MegaReadmeParser content={readmeContent} />
          ) : (
            <div className="text-sm font-mono text-[#888888] my-24">Error: Manifesto data could not be ingested.</div>
          )}

          {/* CTA SECTION AT THE BOTTOM */}
          <div className="mt-32 w-full flex flex-col items-center justify-center p-12 bg-white border border-[#E5E5E5] rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-[#050505] mb-8">
                  El protocolo te espera.
              </h3>
              {isConnected ? (
                <button
                   onClick={() => router.push('/dashboard')}
                   className="w-full max-w-sm relative px-8 py-5 bg-[#050505] text-[#FAF9F6] border border-[#050505] rounded-xl font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)] hover:bg-[#FAF9F6] hover:text-[#050505] transition-all duration-300"
                >
                   <span className="relative z-10 flex items-center justify-center gap-3">
                       ENTER DASHBOARD 
                       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                   </span>
                </button>
              ) : (
                <button
                   onClick={(e) => { e.preventDefault(); openConnectModal(); }}
                   className="w-full max-w-sm relative px-8 py-5 bg-[#050505] text-[#FAF9F6] border border-[#050505] rounded-xl font-black uppercase tracking-[0.2em] text-[12px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)] hover:bg-[#FAF9F6] hover:text-[#050505] transition-all duration-300 group"
                >
                   <span className="relative z-10 flex items-center justify-center gap-3">
                       INITIALIZE TERMINAL 
                       <div className="w-1.5 h-1.5 bg-[#FAF9F6] group-hover:bg-[#050505] rounded-full animate-pulse" />
                   </span>
                </button>
              )}
          </div>

        </motion.div>
      </main>
    </div>
  );
}
