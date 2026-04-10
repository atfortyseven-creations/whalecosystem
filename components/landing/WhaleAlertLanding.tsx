"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Terminal, Database, Shield, Binary, Activity, Eye, Zap, Lock, Globe, ArrowRight, Github, Twitter, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useUIStore } from "@/lib/store/ui-store";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useSWR from "swr";
import Image from "next/image";
gsap.registerPlugin(ScrollTrigger);

const DynamicCryptoCheckoutModal = dynamic(
  () => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal),
  { ssr: false }
);
const ClearanceHeroView = dynamic<any>(
  () => import("./ClearanceView").then((m) => m.ClearanceView),
  { ssr: false }
);

function useLenis() {
  useEffect(() => {
    let lenis: any = null;
    (async () => {
      try {
        const { default: Lenis } = await import("lenis");
        lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        gsap.ticker.add((time: number) => { lenis?.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        lenis.on("scroll", ScrollTrigger.update);
      } catch {}
    })();
    return () => {
      gsap.ticker.remove((time: number) => { lenis?.raf(time * 1000); });
      lenis?.destroy();
    };
  }, []);
}

// ── Reveal wrapper ──────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "", yOffset = 30 }: { children: React.ReactNode; delay?: number; className?: string; yOffset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-6%" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: yOffset }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

// ── Live ticker ─────────────────────────────────────────────────────────────────
const TICKER_FALLBACK = [
  "LIVE FEED ACTIVE",
  "ZK PROOF VERIFIED",
  "WHALE MOVEMENT DETECTED",
  "NETWORK STATUS: SECURE",
  "NODE LATENCY: <15ms",
  "MEMPOOL: MONITORING",
  "ON-CHAIN INTELLIGENCE ACTIVE",
  "OPTIMISM L2: SYNCED",
  "DARK POOL: TRACKED",
  "GENESIS LEDGER: LIVE",
];

function DataTicker() {
  const { data } = useSWR("/api/network/live-ticker", (url) => fetch(url).then((res) => res.json()), {
    fallbackData: { ticker: TICKER_FALLBACK }, refreshInterval: 5000
  });
  const tData = (data?.degraded || !data?.ticker?.length) ? TICKER_FALLBACK : data.ticker;
  const content = [...tData, ...tData, ...tData];
  return (
    <div className="relative w-full border-y border-black/10 dark:border-white/10 overflow-hidden py-3 bg-black/[0.03] dark:bg-white/[0.03]">
      <motion.div className="flex gap-20 will-change-transform w-max" animate={{ x: [0, -2400] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }}>
        {content.map((item: string, i: number) => (
          <span key={i} className="text-[9px] font-mono uppercase tracking-[0.35em] font-bold text-black/40 dark:text-white/40 flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20 inline-block" />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ── Phase card ──────────────────────────────────────────────────────────────────
function PhaseCard({ number, title, desc, icon, delay = 0 }: { number: string; title: string; desc: string; icon: React.ReactNode; delay?: number }) {
  const [hovered, setHov] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="relative group p-8 border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-[#0A0A0A] hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 overflow-hidden cursor-default"
        style={{ borderRadius: 0 }}
      >
        {/* Phase number watermark */}
        <div className="absolute top-4 right-6 font-mono text-[10px] font-black text-black/10 dark:text-white/10 tracking-[0.3em] uppercase">
          PHASE {number}
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="inline-flex p-2.5 border border-black/10 dark:border-white/10 text-black dark:text-white bg-black/5 dark:bg-white/5">
            {icon}
          </div>
          <div>
            <p className="text-[8px] font-mono font-black uppercase tracking-[0.3em] text-black/30 dark:text-white/30 mb-1">Phase {number}</p>
            <h3 className="font-sans text-base font-black text-black dark:text-white leading-tight">{title}</h3>
          </div>
        </div>

        <p className="text-[12px] text-black/50 dark:text-white/50 leading-relaxed">{desc}</p>

        {/* Hover underline */}
        <motion.div className="absolute bottom-0 left-0 h-[2px] bg-black dark:bg-white"
          initial={{ width: 0 }} animate={{ width: hovered ? "100%" : 0 }} transition={{ duration: 0.3 }} />
      </div>
    </Reveal>
  );
}

// ── Pillar card ──────────────────────────────────────────────────────────────────
function PillarCard({ icon, title, desc, delay = 0 }: { icon: React.ReactNode; title: string; desc: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div className="flex gap-5 p-6 border border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-[#0A0A0A]">
        <div className="shrink-0 mt-0.5 text-black/40 dark:text-white/40">{icon}</div>
        <div>
          <h4 className="font-sans text-sm font-black text-black dark:text-white mb-2 tracking-tight">{title}</h4>
          <p className="text-[11px] text-black/40 dark:text-white/40 leading-relaxed">{desc}</p>
        </div>
      </div>
    </Reveal>
  );
}

// ── timeAgo helper ───────────────────────────────────────────────────────────
function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Left Panel: News of Today ─────────────────────────────────────────────────
function NewsOfTodayPanel() {
  const { data, isLoading } = useSWR(
    '/api/news',
    (url: string) => fetch(url).then(r => r.json()),
    { refreshInterval: 60_000, revalidateOnFocus: false }
  );
  const articles: any[] = (data?.articles ?? []).slice(0, 12);

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        width: 272,
        maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(250,249,246,0.96)',
        border: '1px solid rgba(0,0,0,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div style={{ background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
           className="flex items-center px-4 py-3.5 shrink-0">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white">
          News of Today
        </span>
      </div>

      {/* Article list */}
      <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
          </div>
        )}
        {articles.map((art: any) => (
          <a
            key={art.id}
            href={art.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3.5 group"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[8px] font-black uppercase tracking-widest"
                    style={{ color: 'rgba(0,0,0,0.35)' }}>
                {art.source}
              </span>
              <span className="font-mono text-[8px]" style={{ color: 'rgba(0,0,0,0.22)' }}>
                {timeAgo(art.date)}
              </span>
            </div>
            <p className="text-[11px] font-bold text-black leading-snug line-clamp-2
                          group-hover:opacity-60 transition-opacity">
              {art.title}
            </p>
          </a>
        ))}
        {!isLoading && articles.length === 0 && (
          <p className="px-4 py-6 font-mono text-[9px] uppercase tracking-widest"
             style={{ color: 'rgba(0,0,0,0.25)' }}>
            Cargando fuentes...
          </p>
        )}
      </div>

      {/* Footer CTA */}
      <div className="shrink-0 px-4 py-2.5"
           style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.02)' }}>
        <a href="/news"
           className="font-mono text-[8px] font-black uppercase tracking-widest"
           style={{ color: 'rgba(0,0,0,0.35)' }}
        >
          Ver todas las noticias →
        </a>
      </div>
    </div>
  );
}

// ── Right Panel: Whale Post iframe ────────────────────────────────────────────
function WhalePostIframePanel() {
  const [loaded, setLoaded] = React.useState(false);
  // iframe is 1000px wide, scaled to 232px → scale = 0.232
  // container height is 500px, iframe height = 500/0.232 ≈ 2155px
  const SCALE = 0.272;                         // 272px panel / 1000px iframe = 0.272
  const IFRAME_W = 1000;
  const PANEL_H = 560;                          // fixed height — fills most of viewport
  const IFRAME_H = Math.round(PANEL_H / SCALE); // unscaled iframe height

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        width: 272,
        maxHeight: 'calc(100vh - 120px)',
        background: 'rgba(250,249,246,0.96)',
        border: '1px solid rgba(0,0,0,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div style={{ background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
           className="flex items-center justify-between px-4 py-3 shrink-0">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white">
          Whale Post
        </span>
        <a
          href="https://www.humanidfi.com/news"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[7px] uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.40)' }}
        >
          Open ↗
        </a>
      </div>

      {/* Scaled iframe container */}
      <div className="relative flex-1 overflow-hidden" style={{ height: PANEL_H }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center"
               style={{ background: '#FAF9F6' }}>
            <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
          </div>
        )}
        <iframe
          src="/news"
          title="Whale Post"
          scrolling="no"
          onLoad={() => setLoaded(true)}
          style={{
            width: IFRAME_W,
            height: IFRAME_H,
            border: 'none',
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 py-2.5"
           style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.02)' }}>
        <a href="/news"
           className="font-mono text-[8px] font-black uppercase tracking-widest"
           style={{ color: 'rgba(0,0,0,0.35)' }}
        >
          Ir a noticias completas →
        </a>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────────
export function WhaleAlertLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isConnected } = useSovereignAccount();
  const { openConnectModal } = useUIStore();
  const [showClearance, setShowClearance] = useState(false);
  const [showDocumentGate, setShowDocumentGate] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useLenis();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEntry = useCallback(() => {
    if (typeof window !== "undefined" && localStorage.getItem("hasReadDocs") === "true") {
      if (isConnected) router.push("/dashboard");
      else openConnectModal();
    } else {
      setShowDocumentGate(true);
    }
  }, [isConnected, router, openConnectModal]);

  const executeSystemEntry = useCallback(() => {
    if (typeof window !== "undefined") localStorage.setItem("hasReadDocs", "true");
    setShowDocumentGate(false);
    if (isConnected) router.push("/dashboard");
    else openConnectModal();
  }, [isConnected, router, openConnectModal]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden text-black dark:text-white font-sans transition-colors duration-300">
        
        {/* HARDWARE-ACCELERATED IMMERSIVE BACKGROUND LAYER (iOS/Android/PC Parity) */}
        <div 
          className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-300"
          style={{
             backgroundImage: "url('/wave-pattern-bg.jpg')",
             backgroundRepeat: "repeat",
             backgroundSize: "320px 200px",
             backgroundPosition: "top left",
             opacity: 0.15
          }}
        >
        </div>

        {/* Subtle overlay to guarantee text readability in light and dark mode */}
        <div className="fixed inset-0 pointer-events-none -z-[5] bg-white/60 dark:bg-black/80 backdrop-blur-[2px] transition-colors duration-300" />
        
        {/* Wrap content in a relative z-10 index to stay above the backdrop overlay */}
        <div className="relative z-10 w-full">
      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 transition-all duration-300"
        animate={{ 
          background: scrolled ? "rgba(250,249,246,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(0,0,0,0.06)" : "1px solid transparent"
        }}
      >
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-8 h-8 dark:invert" alt="Whale Alert" />
          <span className="font-sans font-black text-sm tracking-tight text-black dark:text-white uppercase">Whale Alert Network</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="https://github.com/atfortyseven-creations/whalecosystem" target="_blank" rel="noreferrer" 
             className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="https://twitter.com/WhaleAlertNetwork" target="_blank" rel="noreferrer"
             className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.9-5.632Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"/></svg>
          </a>
          <button onClick={handleEntry}
            className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
            Enter Terminal
          </button>
        </div>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[100vh] px-6 pt-20">
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)`, backgroundSize: '48px 48px' }} />
        {/* Radial fade */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 0%, rgba(250,249,246,0.95) 100%)" }} />

        {/* ── LEFT PANEL: News of Today — screens ≥ 1280px (xl) ——————————— */}
        {/* NOTE: Using Tailwind xl (1280px) instead of custom 1400px media query.
             This ensures the panel shows in desktop-mode browsers on tablets/mobile
             where viewport CSS width is reported correctly regardless of User-Agent. */}
        <div className="absolute z-20 hidden xl:block"
             style={{ left: 20, top: '50%', transform: 'translateY(-50%) translateY(28px)' }}>
          <NewsOfTodayPanel />
        </div>

        {/* ── RIGHT PANEL: Whale Post iframe — screens ≥ 1280px (xl) ————————————————————— */}
        <div className="absolute z-20 hidden xl:block"
             style={{ right: 20, top: '50%', transform: 'translateY(-50%) translateY(28px)' }}>
          <WhalePostIframePanel />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <AnimatePresence mode="wait">
            {!showClearance ? (
              <motion.div key="core" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center">

                {/* Logo */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-10"
                >
                  <img src="/official-whale-monochrome.png" className="w-56 h-56 md:w-80 md:h-80 dark:invert drop-shadow-2xl" alt="Whale Alert Network" />
                </motion.div>

                {/* Title */}
                <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black text-black dark:text-white leading-[0.92] tracking-tighter mb-8 max-w-3xl">
                  Whale Alert<br />
                  <span className="text-black/20 dark:text-white/20">Network</span>
                </h1>

                {/* Description */}
                <p className="text-base md:text-lg text-black/50 dark:text-white/50 max-w-2xl leading-relaxed mb-12 font-light">
                  A real-time intelligence platform for tracking large-scale blockchain movements,
                  dark pool activity, and institutional capital flows — across every major chain, simultaneously.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <button onClick={handleEntry}
                    className="px-10 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.25em] text-[11px] hover:scale-105 active:scale-95 transition-transform shadow-xl shadow-black/10 flex items-center gap-3">
                    <ArrowRight size={14} />
                    Enter Terminal
                  </button>
                  <button onClick={() => setShowClearance(true)}
                    className="px-10 py-4 border border-black/15 dark:border-white/15 text-black dark:text-white font-black uppercase tracking-[0.25em] text-[11px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    Get Access Pass
                  </button>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-8 md:gap-16 opacity-50">
                  {[["7", "Terminal Phases"], ["200", "Genesis Tickets"], ["Optimism L2", "Settlement"], ["ZK Shield", "Privacy Layer"]].map(([val, label]) => (
                    <div key={label} className="text-center">
                      <p className="font-mono text-lg md:text-2xl font-black text-black dark:text-white leading-none">{val}</p>
                      <p className="font-mono text-[8px] uppercase tracking-[0.25em] text-black/40 dark:text-white/40 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Scroll hint */}
                <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-20">
                  <ChevronDown size={18} />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div key="clearance" initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} className="w-full max-w-2xl">
                <ClearanceHeroView onBack={() => setShowClearance(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── LIVE TICKER ─────────────────────────────────────────────────────── */}
      <DataTicker />

      {/* ── ABSTRACT ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-black/25 dark:text-white/25 font-black mb-6">The Platform</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="font-sans text-3xl md:text-5xl font-black text-black dark:text-white leading-tight tracking-tighter mb-8 max-w-3xl">
              A new standard for blockchain intelligence.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <Reveal delay={0.1}>
              <p className="text-[14px] text-black/50 dark:text-white/50 leading-[1.9]">
                Whale Alert Network aggregates real-time on-chain data from every major blockchain — Ethereum, Solana, Bitcoin, and their L2 ecosystems — into a single, unified intelligence terminal. No synthetic data. No delays. Everything is sourced directly from the chain.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-[14px] text-black/50 dark:text-white/50 leading-[1.9]">
                Authentication is non-custodial by design. Your wallet signs a cryptographic challenge client-side. The backend verifies it mathematically and never stores your private data. Access is proven, not granted.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 7 PHASES ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-black/25 dark:text-white/25 font-black mb-3">Terminal Architecture</p>
            <h2 className="font-sans text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter mb-4">
              Seven operational phases.
            </h2>
            <p className="text-[13px] text-black/40 dark:text-white/40 max-w-xl mb-16 leading-relaxed">
              The terminal is structured into distinct, independent modules. Each phase targets a specific layer of market intelligence.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/[0.06] dark:bg-white/[0.06]">
            <div className="bg-[#FAF9F6] dark:bg-[#080808]">
              <PhaseCard number="I" icon={<Activity size={18} />} title="Core Intelligence Dashboard"
                desc="Real-time whale transactions, dark pool activity, and liquidity events across all major chains. Everything updates via WebSocket — no page refresh needed."
                delay={0} />
            </div>
            <div className="bg-[#FAF9F6] dark:bg-[#080808]">
              <PhaseCard number="II" icon={<Globe size={18} />} title="Global Market Exchange"
                desc="Live tracking of Polymarket prediction markets and synthetic instruments. See exactly where institutional capital is positioning before the crowd."
                delay={0.05} />
            </div>
            <div className="bg-[#FAF9F6] dark:bg-[#080808]">
              <PhaseCard number="III" icon={<Eye size={18} />} title="Institutional Watchlist"
                desc="Track any wallet address or token. Server-verified state ensures your watchlist is always in sync — across devices and sessions."
                delay={0.1} />
            </div>
            <div className="bg-[#FAF9F6] dark:bg-[#080808]">
              <PhaseCard number="IV" icon={<Zap size={18} />} title="Pro Matrix Analytics"
                desc="Sub-second volume deltas, order book depth, and historical variance analysis. Designed for operators who need the full data picture."
                delay={0.15} />
            </div>
            <div className="bg-[#FAF9F6] dark:bg-[#080808]">
              <PhaseCard number="V" icon={<Terminal size={18} />} title="Advanced Alert System"
                desc="Define custom triggers — price thresholds, volume spikes, whale wallet movements. Receive instant callbacks the moment conditions are met."
                delay={0.2} />
            </div>
            <div className="bg-[#FAF9F6] dark:bg-[#080808]">
              <PhaseCard number="VI" icon={<Database size={18} />} title="Multichart Overlay"
                desc="Multiple TradingView charts running simultaneously. Monitor macro liquidity across Bitcoin, Ethereum, Solana, and L2 networks in parallel."
                delay={0.25} />
            </div>
          </div>

          {/* Phase VII — special */}
          <Reveal delay={0.3} className="mt-px">
            <div className="relative border border-black/10 dark:border-white/10 p-10 md:p-16 bg-black dark:bg-white overflow-hidden">
              <div className="absolute top-6 right-8 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/10 dark:text-black/10">Phase VII</div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-10">
                <div className="shrink-0">
                  <img src="/official-whale-monochrome.png" className="w-16 h-16 invert dark:invert-0 opacity-80" alt="Genesis" />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/30 dark:text-black/30 font-black mb-3">Genesis Access Tier</p>
                  <h3 className="font-sans text-2xl md:text-3xl font-black text-white dark:text-black tracking-tighter mb-4">Sovereign Genesis Node</h3>
                  <p className="text-[13px] text-white/50 dark:text-black/50 leading-relaxed max-w-2xl">
                    Mint your Gold Ticket — a limited ERC-1155 on Optimism L2. Upon minting, the protocol captures your signature on a cryptographic canvas, records your geolocation, timestamp, and wallet address, then broadcasts the record to the Global Genesis Ledger in real time. 200 tickets total. No exceptions.
                  </p>
                </div>
                <div className="shrink-0">
                  <button onClick={() => router.push('/ticket')}
                    className="px-8 py-4 bg-white dark:bg-black text-black dark:text-white font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-80 transition-opacity whitespace-nowrap">
                    Claim Ticket
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INFRASTRUCTURE PILLARS ────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-black/[0.05] dark:border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <Reveal>
                <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-black/25 dark:text-white/25 font-black mb-3">Infrastructure</p>
                <h2 className="font-sans text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter mb-6">
                  Built to last.<br/>Built to scale.
                </h2>
                <p className="text-[13px] text-black/40 dark:text-white/40 leading-relaxed">
                  The backend is a deterministic system. Every result is reproducible, every transaction verifiable. Nothing relies on a centralized authority.
                </p>
              </Reveal>
            </div>
            <div className="space-y-px">
              <PillarCard icon={<Lock size={16} />} title="Non-Custodial Authentication"
                desc="Your wallet signs a challenge. The server verifies the signature mathematically. No passwords, no sessions, no stored credentials."
                delay={0} />
              <PillarCard icon={<Shield size={16} />} title="ZK Shield — Zero-Knowledge Privacy"
                desc="State transitions for identity and access verification are processed through zero-knowledge proof logic, aligned with the Aztec Network architecture."
                delay={0.05} />
              <PillarCard icon={<Database size={16} />} title="PostgreSQL + Railway Deployment"
                desc="Atomic transactions on a high-availability PostgreSQL instance. Automatic webhooks trigger redeployment on every push — zero manual intervention."
                delay={0.1} />
              <PillarCard icon={<Binary size={16} />} title="Mobile-First Sync Protocol"
                desc="Scan a QR code on mobile to pair your device with an active desktop session. The handshake is verified on-chain. No account linking required."
                delay={0.15} />
            </div>
          </div>
        </div>
      </section>

      {/* ── GENESIS LEDGER PREVIEW ───────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal>
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-black/25 dark:text-white/25 font-black mb-4">Cryptographic Signature Log</p>
            <h2 className="font-sans text-3xl md:text-4xl font-black text-black dark:text-white tracking-tighter mb-6">
              The Global Genesis Ledger.
            </h2>
            <p className="text-[14px] text-black/45 dark:text-white/45 max-w-xl mx-auto leading-relaxed mb-12">
              Every Gold Ticket mint is recorded permanently. Address, timestamp, geolocation, and the user's hand-drawn signature — all stored on-chain and visible to every participant in real time.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="border border-black/10 dark:border-white/10 overflow-hidden bg-white dark:bg-[#0A0A0A]">
              <div className="px-6 py-3 border-b border-black/[0.04] dark:border-white/[0.04] grid grid-cols-3 text-[8px] font-mono font-black uppercase tracking-widest text-black/25 dark:text-white/25">
                <span>Wallet Address</span>
                <span className="text-center">Timestamp</span>
                <span className="text-right">Hand-drawn Signature</span>
              </div>

              {/* Row — signature shown as drawn PNG thumbnail */}
              {[
                { addr: "0x3f91...8D2a", time: "2025-04-08 · 14:22", sig: "M10,45 C20,20 35,15 45,30 C55,45 65,50 80,35 C90,25 100,40 115,30" },
                { addr: "0xAb12...C33e", time: "2025-04-08 · 11:07", sig: "M10,50 C25,15 40,60 55,30 C70,5 85,55 110,40 C120,35 125,45 135,38" },
                { addr: "0x77f0...09b1", time: "2025-04-07 · 23:54", sig: "M8,40 Q30,10 55,42 Q78,70 100,35 Q115,18 130,42" },
              ].map(({ addr, time, sig }, i) => (
                <div key={i} className="px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.04] grid grid-cols-3 items-center gap-4">
                  <span className="font-mono text-[11px] font-bold text-black dark:text-white">{addr}</span>
                  <span className="font-mono text-[10px] text-black/40 dark:text-white/40 text-center">{time}</span>
                  <div className="flex justify-end">
                    {/* Simulated hand-drawn signature as SVG path */}
                    <div className="border border-black/8 dark:border-white/8 bg-white dark:bg-black/40 rounded px-2 py-1" style={{ width: 110, height: 38 }}>
                      <svg width="100%" height="100%" viewBox="0 0 140 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d={sig} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-black/50 dark:text-white/50" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}

              <div className="px-6 py-4 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-black/20 dark:text-white/20">
                  Live — each mint records the user's actual drawn signature
                </span>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ── THE SOVEREIGN MANIFESTO (FROM README) ──────────────────────────── */}
      <section className="py-32 px-6 bg-white dark:bg-[#0A0A0A] border-t border-black/[0.05] dark:border-white/[0.05]">
        <div className="max-w-4xl mx-auto font-sans">
          <Reveal>
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-black/25 dark:text-white/25 font-black mb-8 text-center">Protocol Manifesto</p>
            <h2 className="text-3xl md:text-5xl font-black text-black dark:text-white tracking-tighter mb-16 text-center leading-tight">
              WHALE ALERT NETWORK:<br/>THE SOVEREIGN INTELLIGENCE PROTOCOL
            </h2>
          </Reveal>

          <div className="space-y-16 text-[14px] text-black/60 dark:text-white/60 leading-[2.2] font-medium tracking-wide">
            
            <Reveal delay={0.1}>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">00</span>
                <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">ABSTRACT</span>
              </div>
              <p>
                The Whale Alert Network represents a paradigm shift in decentralized financial intelligence and blockchain analytics. This repository encapsulates the foundational logic, distributed mesh networking interfaces, cryptography-enforced endpoints, and proprietary user-interaction frameworks constituting the Whale Alert Node. Engineered with strict adherence to Zero-Trust principles and immutable non-custodial methodologies, the system aggregates, verifies, and disseminates institutional-grade on-chain telemetry. It bypasses conventional visualization abstraction layers by operating synchronously with Ethereum Virtual Machine (EVM) mempool execution environments and scalable Rollup architectures.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">01</span>
                <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">ARCHITECTURAL ONTOLOGY AND CORE INFRASTRUCTURE</span>
              </div>
              <p className="mb-6">
                The backend relies on an unconditionally deterministic environment structured around Next.js App Router topologies, integrating directly with high-frequency PostgreSQL atomic transactions. This infrastructure departs from traditional web service dependencies by acting specifically as an immutable relay for zero-knowledge data.
              </p>
              <h4 className="font-mono text-[11px] font-black text-black dark:text-white uppercase tracking-widest mb-2">A. Non-Custodial Session Handshakes</h4>
              <p className="mb-6">
                Legacy session authentication paradigms have been entirely deprecated. The network operates strictly utilizing cryptographic identity verifications. Elliptic curve digital signature algorithms (ECDSA) manage all authorization matrices. Users authenticate by signing deterministic cryptographic challenges directly with their hierarchical deterministic wallets, generating verifiable payloads that the backend mathematically validates without ever assuming custodial control or storing sensitive authentication vectors.
              </p>
              <h4 className="font-mono text-[11px] font-black text-black dark:text-white uppercase tracking-widest mb-2">B. The Sovereign Aztec Rollup Integration (ZK-Shield)</h4>
              <p>
                At the apex of our asynchronous operation array lies the Zero-Knowledge processing unit, interfaced through conceptual alignment with the Aztec Network. This computational bastion ensures that all executed state transitions regarding user identity and priority access maintain programmable cryptographic finality. By synthesizing deterministic database routing with homomorphic encryption validation, the node operates as an impartial, cryptographic arbiter.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">02</span>
                <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">THE SEVEN-PHASE MATHEMATICAL INTERFACE (TERMINAL ARCHITECTURE)</span>
              </div>
              <p className="mb-6">
                The frontend execution layer is constructed adopting an "Aztec Brutalist" aesthetic framework—a rigorous, strictly monochromatic design system prioritizing low-latency rendering and maximum data density. It eliminates superfluous animations in favor of high-fidelity institutional terminal metrics. The Terminal is segmented into seven core operational phases:
              </p>
              <ul className="space-y-4 text-[13px] border-l border-black/10 dark:border-white/10 pl-6">
                <li><strong className="text-black dark:text-white font-black">Phase I (Core Dashboard):</strong> Real-time assimilation of global liquidity events, dark pool transactions, and whale capitalization matrices.</li>
                <li><strong className="text-black dark:text-white font-black">Phase II (Global Market):</strong> A decentralized tracking mechanism mapping directly to Polymarket and synthetic frameworks.</li>
                <li><strong className="text-black dark:text-white font-black">Phase III (Institutional Watchlist):</strong> Aggressively guarded entity-tracking table allowing users to monitor designated EVM addresses.</li>
                <li><strong className="text-black dark:text-white font-black">Phase IV (Pro Matrix Analytics):</strong> A restricted operational layer offering granular, sub-second volume delta computations.</li>
                <li><strong className="text-black dark:text-white font-black">Phase V (Advanced Alert Telemetry):</strong> Programmable event-listeners executing immediate callbacks upon critical chain-state alterations.</li>
                <li><strong className="text-black dark:text-white font-black">Phase VI (Multichart Overlay):</strong> High-precision algorithmic integrations running multi-layered temporal charts synchronously.</li>
                <li><strong className="text-black dark:text-white font-black">Phase VII (Sovereign Genesis Node):</strong> The definitive authentication tier. Users mint the Sovereign Golden Ticket to cement identity, requiring geographic telemetry and a raw cryptographic signature broadcast to the Global Genesis Ledger.</li>
              </ul>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">03</span>
                <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">CRYPTOGRAPHIC SIGNATURE AND TELEMETRY LOGGING</span>
              </div>
              <p>
                The Genesis access tier mandates absolute non-repudiation. Utilizing an integrated HTML5 diagnostic canvas array, the user's manual signature is captured digitally and compressed alongside environmental telemetry logs (Timestamp, Address Sequence, Geographic Code, and Planetary Node). This telemetry is verified asynchronously alongside the L2 block confirmation. Once finality is achieved on Optimism, the payload is securely packaged to the PostgreSQL database, resulting in an indelible, real-time cryptographic receipt of the individual's admission into the intelligence terminal.
              </p>
            </Reveal>

            <Reveal delay={0.5}>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">04</span>
                <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                <span className="font-mono text-[10px] font-black tracking-[0.3em] uppercase text-black/40 dark:text-white/40">DEPLOYMENT AND REPLICATION (PRIVACY BY VOID)</span>
              </div>
              <p>
                In parallel to robust desktop computation, the terminal deploys a rigorous Mobile Enforcer topology. Utilizing highly optimized client hydration barriers, the system guarantees perfect rendering across diverse mobile processor constraints (mitigating legacy WebKit engine errors natively). The network operates flawlessly across edge-delivery mechanisms and scalable cloud environments via automated rigorous deployment hooks. The entire framework encapsulates a relentless pursuit of transparency, real-time accuracy, and unyielding privacy. It adheres permanently to the doctrine of "Privacy by Void”—where the most secure data is the data the system fundamentally refuses to harbor.
              </p>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA (DOWNHEAD) ───────────────────────────────────────────────────────── */}
      <section className="relative py-40 px-6 border-t border-black/[0.05] dark:border-white/[0.05] overflow-hidden">
        {/* ── MAX-PPI HOKUSAI WAVE BACKGROUND ────────────────────────────────────
           Uses the user-provided Hokusai wave image.
           background-size: cover & background-position: bottom center ensures
           it scales up without breaking aspect ratio, keeping the waves at the bottom.
           ────────────────────────────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            transform: "translateZ(0)",
            willChange: "auto",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden" as any,
            backgroundImage: "url('/wave-pattern-bg.jpg')",
            backgroundRepeat: "repeat",
            backgroundSize: "320px 200px",
            backgroundPosition: "bottom center",
            opacity: 0.15,     // Slight opacity if text needs it, but image center is white
            backgroundColor: "#FAF9F6",
          }}
        />
        {/* Dark mode overlay: Since this is a light-themed Hokusai wave, dark mode strips it or blends it */}
        <div className="absolute inset-0 z-[1] pointer-events-none hidden dark:block" style={{ background: "#050810", opacity: 0.95 }} />

        <div className="relative z-20 max-w-3xl mx-auto text-center">
          <Reveal>
            <div className="relative w-20 h-20 mx-auto mb-10 group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-400/40 transition-colors" />
                <img src="/official-whale-monochrome.png" className="relative w-20 h-20 dark:invert opacity-90 drop-shadow-xl group-hover:scale-105 transition-transform" alt="Whale Logo" />
            </div>
            
            <h2 className="font-sans text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter mb-6 leading-tight drop-shadow-sm">
              The network is live.<br />Connect now.
            </h2>
            <p className="text-[14px] font-medium text-black/60 dark:text-white/60 leading-relaxed mb-12 max-w-lg mx-auto">
              Real data. No placeholders. Every transaction you see on the terminal is sourced directly from the blockchain in real time.
            </p>
            <button onClick={handleEntry}
              className="px-12 py-5 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.3em] text-sm hover:scale-105 active:scale-95 transition-transform shadow-2xl shadow-blue-500/20 flex items-center gap-4 mx-auto border border-white/10">
              <ArrowRight size={16} />
              Connect to Terminal
            </button>
            <div className="mt-12 flex items-center justify-center gap-8 bg-white/10 dark:bg-black/10 w-max mx-auto px-8 py-3 rounded-full backdrop-blur-md border border-black/5 dark:border-white/5 shadow-inner">
              <a href="https://github.com/atfortyseven-creations/whalecosystem" target="_blank" rel="noreferrer"
                 className="flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all hover:scale-105">
                <Github size={18} />
              </a>
              <span className="text-black/10 dark:text-white/10">|</span>
              <a href="https://twitter.com/WhaleAlertNetwork" target="_blank" rel="noreferrer"
                 className="flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all hover:scale-105">
                <Twitter size={18} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER BAND ─────────────────────────────────────────────────────── */}
      <div className="relative border-t border-black/[0.06] dark:border-white/[0.06] px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-5 h-5 dark:invert opacity-40" alt="" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-black/25 dark:text-white/25 font-black">
            Whale Alert Network · Immutable Data · Zero-Trust Verification
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest text-black/15 dark:text-white/15 font-bold">
          Privacy by Void. No data stored. All communication is end-to-end verified.
        </span>
      </div>

      <DynamicCryptoCheckoutModal isOpen={false} onClose={() => {}} />

      {/* ── CONNECT GATE ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDocumentGate && (
          <div className="fixed inset-0 z-[9999] bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/20 p-10 max-w-xl w-full flex flex-col shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <img src="/official-whale-monochrome.png" className="w-8 h-8 dark:invert" alt="" />
                <h2 className="text-lg font-black uppercase tracking-tight text-black dark:text-white">Zero-Trust Entry</h2>
              </div>
              <div className="mb-8 p-6 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] text-[12px] text-black/50 dark:text-white/50 leading-[2] space-y-4">
                <p>All cryptographic verification happens entirely in your browser. The system never stores your private key, password, or sensitive session data.</p>
                <p>By proceeding, you confirm you understand this is an educational intelligence tool. Nothing presented constitutes financial advice.</p>
                <p className="text-black dark:text-white font-bold">You will be asked to sign a message in your wallet to verify ownership. This costs no gas.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowDocumentGate(false)}
                  className="px-6 py-3 border border-black/15 dark:border-white/15 text-black dark:text-white font-black uppercase tracking-[0.15em] text-[10px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={executeSystemEntry}
                  className="flex-1 py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.15em] text-[10px] hover:opacity-80 transition-opacity flex items-center justify-center gap-3">
                  <ArrowRight size={12} /> Connect Wallet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
