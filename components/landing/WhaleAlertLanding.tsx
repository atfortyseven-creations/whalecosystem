"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen, List } from "lucide-react";
import { ARCHITECTURAL_MANIFESTO } from "../../lib/constants/architecturalManifesto";

// ─── Parse manifesto into structured sections ─────────────────────────────────
// Detects lines that match "N. Title" or "N.M Sub-title" patterns
function parseManifesto(raw: string) {
  const lines = raw.split("\n");
  const sections: { id: string; number: string; title: string; body: string[] }[] = [];
  let currentSection: { id: string; number: string; title: string; body: string[] } | null = null;
  let preamble: string[] = [];
  let inPreamble = true;

  // Headings: "7. The Akashic Ledger" or "7.1 Entry Criteria"
  const HEADING = /^(\d+(?:\.\d+)*)\.\s+(.+)/;
  // Table of contents lines (short enumeration before section 1)
  const TOC_LINE = /^(the |historical|architectural|technology|mass|sovereign|zero|data|api|dashboard|mobile|deployment|security|performance|visual|wallpaper|membership|strategic|partners|sponsors|appendix)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(HEADING);

    if (match) {
      if (currentSection) sections.push(currentSection);
      const number = match[1];
      const title = match[2];
      const id = `section-${number.replace(/\./g, "-")}`;
      currentSection = { id, number, title, body: [] };
      inPreamble = false;
    } else {
      if (inPreamble) {
        // Skip the raw TOC lines — we'll render our own
        if (!TOC_LINE.test(trimmed) && trimmed !== "table of contents") {
          preamble.push(trimmed);
        }
      } else if (currentSection) {
        currentSection.body.push(trimmed);
      }
    }
  }
  if (currentSection) sections.push(currentSection);

  // Build TOC from top-level sections only (single digit number)
  const toc = sections.filter((s) => !s.number.includes("."));

  return { preamble: preamble.filter(Boolean), sections, toc };
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionBlock({ s }: { s: ReturnType<typeof parseManifesto>["sections"][0] }) {
  const isSubSection = s.number.includes(".");
  return (
    <div id={s.id} className="scroll-mt-8">
      {isSubSection ? (
        <h3 className="text-[13px] md:text-[14px] font-black uppercase tracking-widest text-[#050505] mt-8 mb-3 flex items-baseline gap-2">
          <span className="font-mono text-black/30 text-[11px]">{s.number}</span>
          {s.title}
        </h3>
      ) : (
        <h2 className="text-[16px] md:text-[18px] font-black uppercase tracking-tight text-[#050505] mt-12 mb-4 pb-3 border-b border-black/10 flex items-baseline gap-3">
          <span className="font-mono text-black/25 text-[13px] font-light">{s.number}.</span>
          {s.title}
        </h2>
      )}
      <div className="space-y-3">
        {s.body.map((para, i) => {
          if (!para) return <div key={i} className="h-1" />;
          // Bullet-style lines starting with a dash or specific keywords
          if (/^(narwhal|orca|blue whale|humpback|great white|megalodon|send:|swap:|bridge:|buy:|phase one|phase two|phase three)/i.test(para)) {
            return (
              <div key={i} className="flex gap-3 pl-4">
                <span className="text-black/25 shrink-0 mt-0.5">·</span>
                <p className="text-[11px] md:text-[12px] leading-relaxed text-black/70 font-sans">{para}</p>
              </div>
            );
          }
          // Bold the first sentence of definition-like lines (contains ":" within first 60 chars)
          const colonIdx = para.indexOf(":");
          if (colonIdx > 0 && colonIdx < 60 && !para.startsWith("http")) {
            return (
              <p key={i} className="text-[11px] md:text-[12px] leading-relaxed text-black/70 font-sans">
                <strong className="font-bold text-[#050505]">{para.slice(0, colonIdx + 1)}</strong>
                {para.slice(colonIdx + 1)}
              </p>
            );
          }
          return (
            <p key={i} className="text-[11px] md:text-[12px] leading-relaxed text-black/70 font-sans text-justify">
              {para}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function TableOfContents({ toc }: { toc: ReturnType<typeof parseManifesto>["toc"] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="sticky top-4 z-20 w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white/95 backdrop-blur-md border border-black/10 rounded-2xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <List size={14} className="text-black/40" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/60">Table of Contents</span>
          <span className="text-[9px] font-mono text-black/30 hidden sm:inline">— {toc.length} sections</span>
        </div>
        {open ? <ChevronUp size={14} className="text-black/40" /> : <ChevronDown size={14} className="text-black/40" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-1 bg-white/97 backdrop-blur-md border border-black/10 rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-black/5">
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-[#FAF9F6] transition-colors group"
                  >
                    <span className="text-[9px] font-mono text-black/30 mt-0.5 shrink-0 w-5">{item.number}.</span>
                    <span className="text-[10px] font-bold text-black/60 group-hover:text-black uppercase tracking-wide leading-tight line-clamp-2 transition-colors">
                      {item.title}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function WhaleAlertLanding() {
  const [mounted, setMounted] = useState(false);
  const { preamble, sections, toc } = parseManifesto(ARCHITECTURAL_MANIFESTO);

  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-between w-full bg-[#FAF9F6] text-[#050505] overflow-x-hidden selection:bg-black selection:text-white font-sans">

      {/* ── Layer 0: Peakpx isometric watermark (fixed, very subtle) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "url('/api/assets?name=peakpx.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          filter: "invert(1) grayscale(1)",
        }}
      />

      {/* ── Layer 1: Hokusai Wave — ANCHORED AT BOTTOM, NO ZOOM, FULL DPI ── */}
      {/* 
        CRITICAL: We use a real <img> tag with object-fit: contain so the browser
        renders the image at its native aspect ratio without ANY cropping or scaling.
        The image sits pixel-perfect at the bottom of the page.
        No backgroundSize:cover, no scale(), no transform that alters DPI.
      */}
      <div className="fixed bottom-0 left-0 w-full z-0 pointer-events-none" style={{ lineHeight: 0 }}>
        <img
          src="/olas-hokusai-4k.png"
          alt=""
          aria-hidden="true"
          className="w-full"
          style={{
            display: "block",
            objectFit: "contain",
            objectPosition: "bottom center",
            opacity: 0.12,
            mixBlendMode: "multiply",
            maxHeight: "55vh",   /* never taller than 55% viewport — no zoom */
          }}
        />
      </div>

      {/* ── Layer 2: Top-to-bottom fade keeps text readable over wave ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-[65vh] z-[1] pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(250,249,246,0.85) 0%, transparent 100%)" }}
      />

      {/* ── MAIN CONTENT ── */}
      <main className="relative z-[50] flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-start">
        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-white/90 backdrop-blur-2xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] rounded-[32px] overflow-hidden border border-black/[0.04]"
          >
            {/* ── Document Header ── */}
            <div className="bg-[#FAF9F6] border-b border-black/6 px-8 pt-14 pb-10 md:px-16 md:pt-16 md:pb-12 text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-12 bg-black/15" />
                <span className="text-[9px] font-black uppercase tracking-[0.35em] text-black/35">Technical Architecture</span>
                <div className="h-px w-12 bg-black/15" />
              </div>
              <h1 className="text-[22px] md:text-[32px] font-black tracking-tight text-[#050505] leading-tight mb-3">
                Whale Alert Network
              </h1>
              <p className="text-[11px] md:text-[13px] font-mono tracking-[0.18em] text-black/40 font-light lowercase">
                in search of transparent information
              </p>
              <div className="flex items-center justify-center gap-4 mt-6">
                {["v6.12.0", "Production", "© 2026"].map((tag) => (
                  <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-black/25 border border-black/10 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Document Body ── */}
            <div className="px-8 md:px-16 py-10 md:py-14 flex flex-col gap-0">

              {/* Preamble paragraphs */}
              {preamble.length > 0 && (
                <div className="space-y-4 mb-8 pb-8 border-b border-black/8">
                  {preamble.map((para, i) => (
                    <p key={i} className="text-[11px] md:text-[12px] leading-relaxed text-black/65 font-sans text-justify">
                      {para}
                    </p>
                  ))}
                </div>
              )}

              {/* Sticky Table of Contents */}
              <div className="mb-10">
                <TableOfContents toc={toc} />
              </div>

              {/* All sections */}
              <div className="space-y-2">
                {sections.map((s) => (
                  <SectionBlock key={s.id} s={s} />
                ))}
              </div>

              {/* Footer signature */}
              <div className="mt-16 pt-8 border-t border-black/8 text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
                  Whale Alert Network
                </p>
                <p className="text-[9px] font-mono text-black/20 leading-relaxed max-w-sm mx-auto">
                  Every signal verified. Every movement recorded. Every institution monitored.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-[100] px-10 py-8 border-t border-black/[0.06] bg-[#FAF9F6]/95 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 text-[#050505] w-full">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-4 h-4 opacity-30 grayscale" alt="" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/35">© Whale Alert Network 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://twitter.com/WhaleAlert" className="text-[9px] font-black uppercase tracking-widest text-black/25 hover:text-black transition-colors">Twitter</a>
          <a href="https://github.com" className="text-[9px] font-black uppercase tracking-widest text-black/25 hover:text-black transition-colors">GitHub</a>
          <div className="w-px h-6 bg-black/10" />
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-black/30">Status: Operational</span>
            <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest font-bold">L1/L2 Ingress Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
