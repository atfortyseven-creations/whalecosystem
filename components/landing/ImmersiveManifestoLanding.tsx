"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SovereignGlobe3D } from "./SovereignGlobe3D";
import Link from "next/link";
import { ArrowRight, Scan, MessageSquare, ChevronRight, Shield, Zap, Globe2, Layers, Cpu, Code2, Network } from "lucide-react";
import { useEthMetrics } from "@/hooks/useEthMetrics";
import { PRICING_TIERS } from "@/lib/config/pricing-tiers";
import { StackableCarousel } from "@/components/ui/StackableCarousel";
import { motion, AnimatePresence } from "framer-motion";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

function LottieFromUrl({ url, className, style }: { url: string; className?: string; style?: React.CSSProperties; }) {
  const [animData, setAnimData] = useState<object | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then(setAnimData)
      .catch((err) => {
        if (err?.name !== "AbortError") console.warn("[Lottie] Failed to load animation:", url);
      });
    return () => controller.abort();
  }, [url]);

  if (!animData) return <div className={className} style={{ ...style, backgroundColor: "transparent" }} />;
  return <Lottie animationData={animData} loop autoplay className={className} style={style ?? { width: "100%", height: "auto" }} aria-hidden="true" />;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Zap, title: "Mempool Intelligence", desc: "Intercept institutional capital before block confirmation. Sub-second detection across 12 chains." },
  { icon: Shield, title: "Cryptographic Identity", desc: "Zero passwords. Your wallet is your key. Every session is mathematically verifiable via ECDSA." },
  { icon: Globe2, title: "On-Chain Forensics", desc: "De-obfuscate mixer outputs, trace multi-hop routes, and map entity clusters in real time." },
];

const HERO_TAGS = ["Free to start", "12 Blockchains", "Mempool alerts", "Cryptographic identity", "Community forum"];

const FALLBACK_FORUM_POSTS = [
  { walletSlug: "0x7a2f...c3e1", title: "Tracing the $400M BTC consolidation — Binance cold wallet cluster analysis", date: "May 9, 16:42" },
  { walletSlug: "0x3d9b...a0f2", title: "Aztec Network privacy model vs. zkSync: which ZK-rollup wins for institutional use?", date: "May 9, 13:11" },
  { walletSlug: "0x1c8e...7f4a", title: "Post-ETF era: mapping the new institutional wallet fingerprints", date: "May 8, 21:00" },
];

const KEY_EVENTS = [
  { date: "Jan 2009", code: "BTC-000", text: "Bitcoin Block 0 — Satoshi's direct answer to the TARP bailout: immutable, trustless, sovereign." },
  { date: "Feb 2014", code: "MTGOX",  text: "850,000 BTC stolen — centralised custody proven irreconcilable with cryptographic sovereignty." },
  { date: "May 2022", code: "LUNA",   text: "$60B Terra death spiral — algorithmic stablecoins without overcollateralisation cannot survive." },
  { date: "Nov 2022", code: "FTX",    text: "Sam Bankman-Fried's $8B fraud — opacity destroys ecosystems. On-chain transparency is the only answer." },
  { date: "Jan 2024", code: "ETF",    text: "First US Spot Bitcoin ETF — $12B institutional inflow in 30 days. The institutional era begins." },
  { date: "Apr 2025", code: "BYBIT",  text: "$1.4B stolen by Lazarus Group — even tier-1 custody is vulnerable to social engineering." },
];

const ARCHITECTURE = [
  { id: "SYS-1", label: "Performance", desc: "Optimized response times and seamless data synchronization.", color: "#00C076", icon: Zap },
  { id: "SYS-2", label: "Authentication", desc: "Secure, frictionless access with advanced identity verification.", color: "#00C076", icon: Shield },
  { id: "SYS-3", label: "Data Engine", desc: "Real-time processing and intelligent information structuring.", color: "#1a1a1a", icon: Layers },
  { id: "SYS-4", label: "Community", desc: "Interactive tools designed for engagement and clear communication.", color: "#1a1a1a", icon: MessageSquare },
  { id: "SYS-5", label: "Operations", desc: "Automated billing and seamless regulatory compliance features.", color: "#555", icon: Cpu },
  { id: "SYS-6", label: "Infrastructure", desc: "High availability and robust server management protocols.", color: "#555", icon: Network },
  { id: "SYS-7", label: "Analytics", desc: "Clear metrics and predictive modeling for business growth.", color: "#888", icon: Code2 },
  { id: "SYS-8", label: "Security", desc: "Comprehensive protection layers safeguarding all user data.", color: "#888", icon: Shield },
];

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// ─── Component ──────────────────────────────────────────────────────────────

export function ImmersiveManifestoLanding({ onOpenScanner, hideMap = false }: { onOpenScanner?: () => void; hideMap?: boolean; }) {
  const { blockNumber, baseFeeGwei, syncing } = useEthMetrics();
  const [globalStats, setGlobalStats] = useState<{ tokens: string; cap: string } | null>(null);
  const [liveTopics, setLiveTopics] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/market/global").then((r) => r.json()).then((data) => {
      if (data?.data) setGlobalStats({ tokens: data.data.active_cryptocurrencies.toLocaleString(), cap: "$" + (data.data.total_market_cap.usd / 1e12).toFixed(2) + "T" });
    }).catch(() => {});
    
    fetch("/api/forum/topics?limit=3&filter=latest").then((r) => r.json()).then((data) => setLiveTopics(Array.isArray(data) ? data : [])).catch(() => setLiveTopics([]));
  }, []);

  const previewTiers = PRICING_TIERS.filter((t) => ["STARTER", "PRO", "ELITE"].includes(t.id));

  return (
    <div className="relative bg-[#FAFAF8] text-[#0a0a0a] font-sans antialiased overflow-x-hidden selection:bg-black/10">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[100dvh] flex flex-col lg:flex-row items-center justify-between border-b border-black/5 overflow-hidden">
        
        {/* Left Content */}
        <motion.div 
          initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="relative z-10 flex flex-col justify-center flex-1 px-6 sm:px-12 md:px-20 pt-32 pb-24 lg:py-0 w-full lg:w-1/2 min-h-[100dvh] lg:min-h-0 xl:pl-32"
        >


          <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[64px] md:text-[80px] xl:text-[96px] font-black tracking-tighter leading-[0.9] uppercase text-[#0a0a0a] mb-8 drop-shadow-sm">
            Whale<br />Alert<br /><span className="text-black/30">Network</span>
          </motion.h1>

          <motion.p variants={FADE_UP} className="font-serif text-[16px] sm:text-[18px] text-slate-600 leading-relaxed max-w-lg mb-12">
            Track institutional capital before markets react. Real-time on-chain intelligence — from mempool to execution.
          </motion.p>

          {/* Live Stats Glassmorphism Bar */}
          <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-x-8 gap-y-6 p-6 md:p-8 bg-white/60 backdrop-blur-2xl border border-black/5 rounded-3xl mb-10 shadow-xl shadow-black/5 max-w-2xl">
            {[
              { label: "ETH Block", val: syncing ? "Syncing..." : blockNumber ?? "---" },
              { label: "Base Fee", val: baseFeeGwei ? `${baseFeeGwei} Gwei` : "---" },
              { label: "Active Tokens", val: globalStats?.tokens ?? "---" },
              { label: "Total Cap", val: globalStats?.cap ?? "---" }
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-8">
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{stat.label}</span>
                  <span className="font-mono text-[14px] sm:text-[16px] font-black text-[#0a0a0a]">{stat.val}</span>
                </div>
                {i !== 3 && <div className="w-px h-10 bg-black/10 hidden sm:block" />}
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row gap-4 mb-10">
            <Link href="/dashboard" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0a0a0a] text-white rounded-xl font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black/80 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10">
              Enter the Network <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border border-black/10 text-[#0a0a0a] rounded-xl font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-[0.2em] hover:border-black/30 hover:bg-slate-50 active:scale-[0.98] transition-all">
              View Plans
            </Link>
          </motion.div>

          {/* Trust Signals */}
          <motion.div variants={FADE_UP} className="flex flex-wrap items-center gap-4 pt-8 border-t border-black/5">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mr-2">Secured by</span>
            {["Stripe", "Ethereum", "Aztec ZK"].map((label) => (
              <span key={label} className="font-mono text-[9px] sm:text-[10px] font-black text-slate-600 bg-white border border-black/5 px-4 py-1.5 rounded-full shadow-sm">
                {label}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Globe */}
        <div className="absolute inset-0 w-full h-[100dvh] opacity-30 pointer-events-none lg:relative lg:w-1/2 lg:h-screen lg:opacity-100 lg:pointer-events-auto z-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAF8] via-transparent to-transparent z-10 hidden lg:block" />
          {!hideMap && <SovereignGlobe3D />}
        </div>
        
        {/* Mobile Scanner Button */}
        {onOpenScanner && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-white/80 backdrop-blur-xl border-t border-black/10 flex justify-center py-4 px-6" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
            <button onClick={onOpenScanner} className="w-full max-w-sm px-8 py-4 bg-[#0a0a0a] text-white rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-transform flex items-center justify-center gap-3 shadow-2xl">
              <Scan size={16} /> Connect Wallet
            </button>
          </div>
        )}
      </section>

      {/* ── SHOWCASE ────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-white overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 mb-16 md:mb-24">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={FADE_UP} className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div>
              <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-4">Platform Interface</span>
              <h2 className="text-[40px] sm:text-[56px] md:text-[72px] font-black tracking-tighter uppercase leading-[0.95]">
                Clean design.<br /><span className="text-black/20">Expert execution.</span>
              </h2>
            </div>
            <p className="font-serif text-[16px] sm:text-[18px] text-slate-500 max-w-lg leading-relaxed">
              A comprehensive and intuitive dashboard designed to provide a clear overview of the platform, combining powerful forensic tools with an elegant, institutional aesthetic.
            </p>
          </motion.div>
        </div>
        
        <div className="w-full relative py-12 md:py-20 flex justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FAFAF8] to-white opacity-50" />
          <StackableCarousel className="w-full relative z-10" itemClassName="w-[85vw] md:w-[900px] lg:w-[1100px] hover:scale-[1.01] transition-transform duration-700 cursor-grab active:cursor-grabbing">
            {[
              "/system-shots/Captura de pantalla 2026-05-07 012904.png",
              "/system-shots/Captura de pantalla 2026-05-07 032204.png",
              "/system-shots/Captura de pantalla 2026-05-10 002811.png",
              "/system-shots/Captura de pantalla 2026-05-10 002900.png"
            ].map((src, idx) => (
              <img key={idx} src={src} className="w-full h-auto rounded-2xl md:rounded-[2rem] shadow-2xl border border-black/5 object-cover bg-white" alt={`Terminal view ${idx + 1}`} />
            ))}
          </StackableCarousel>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 md:py-32 bg-[#FAFAF8] border-y border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8, ease: "easeOut" as any } } }} className="group bg-white p-10 md:p-12 rounded-3xl border border-black/5 hover:border-black/15 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 flex flex-col gap-8">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-black/5 flex items-center justify-center group-hover:bg-[#0a0a0a] transition-colors duration-500">
                  <f.icon size={24} strokeWidth={1.5} className="text-[#0a0a0a] group-hover:text-white transition-colors duration-500" />
                </div>
                <div>
                  <h3 className="font-mono text-[13px] md:text-[14px] font-black uppercase tracking-[0.15em] mb-4 text-[#0a0a0a]">{f.title}</h3>
                  <p className="font-serif text-[15px] md:text-[16px] text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS PREVIEW ─────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
            <div>
              <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-4">Subscription Tiers</span>
              <h2 className="text-[40px] sm:text-[56px] md:text-[72px] font-black tracking-tighter uppercase leading-[0.95]">
                The right access.<br /><span className="text-black/20">For every firm.</span>
              </h2>
            </div>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-50 border border-black/5 text-[#0a0a0a] rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:border-black/20 hover:bg-white transition-all group">
              View Full Pricing <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {previewTiers.map((tier, i) => (
              <motion.div key={tier.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.8 } } }}>
                <Link href="/pricing" className={`group flex flex-col p-10 md:p-12 rounded-[2rem] transition-all duration-500 relative border ${ tier.highlight ? "bg-[#0a0a0a] text-white border-black shadow-2xl hover:bg-black" : "bg-white border-black/5 hover:border-black/15 hover:shadow-xl hover:shadow-black/5" }`}>
                  {tier.badge && (
                    <span className="absolute -top-4 left-10 font-mono text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg" style={{ backgroundColor: tier.highlight ? "white" : "#0a0a0a", color: tier.highlight ? "#0a0a0a" : "white" }}>
                      {tier.badge}
                    </span>
                  )}
                  <div className="flex justify-between items-center mb-8">
                    <span className="font-mono text-[12px] font-black uppercase tracking-[0.2em] opacity-50">{tier.id}</span>
                    <ChevronRight size={18} className={`transition-transform duration-300 opacity-30 group-hover:opacity-100 group-hover:translate-x-1`} />
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-black text-[56px] md:text-[64px] tracking-tighter leading-none">€{tier.priceMonthly}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-40 mb-10 block">EUR / month</span>
                  <span className="font-mono text-[16px] font-black uppercase tracking-[0.15em] mb-4 block">{tier.name}</span>
                  <p className="font-serif text-[15px] opacity-60 leading-relaxed min-h-[60px]">{tier.tagline}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORUM TEASER ──────────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-[#FAFAF8] border-y border-black/5 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20 grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-24 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="lg:col-span-2">
            <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-4">Sovereign Community</span>
            <h2 className="text-[40px] sm:text-[56px] font-black tracking-tighter uppercase leading-[0.95] mb-8">
              Every post.<br /><span className="text-black/30">Cryptographically signed.</span>
            </h2>

            <div className="my-10 w-full max-w-[280px]">
              <LottieFromUrl url="/lotties/DeeWork About Blockchain.json" />
            </div>

            <p className="font-serif text-[16px] md:text-[18px] text-slate-600 leading-relaxed mb-10 max-w-md">
              The only forum where every message carries an ECDSA wallet signature. No anonymous posts. No repudiation. Identity is your cryptographic key.
            </p>
            <Link href="/forum" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border border-black/10 text-[#0a0a0a] rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] hover:border-black/30 hover:bg-slate-50 active:scale-[0.98] transition-all group">
              <MessageSquare size={14} /> Open Forum
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="lg:col-span-3 flex flex-col gap-4">
            {liveTopics === null ? (
              Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-white p-8 rounded-2xl border border-black/5 animate-pulse flex flex-col gap-4">
                  <div className="flex justify-between">
                    <div className="h-3 w-32 bg-slate-100 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-2/3 bg-slate-100 rounded" />
                </div>
              ))
            ) : liveTopics.length > 0 ? (
              liveTopics.map((p, i) => {
                const sig = p.author?.walletAddress ? `${p.author.walletAddress.slice(0, 6)}...${p.author.walletAddress.slice(-4)}` : "0xUNKNOWN";
                const dateStr = new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                return (
                  <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.6 } } }} className="bg-white p-8 rounded-2xl border border-black/5 hover:border-black/15 hover:shadow-lg transition-all group cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-[10px] font-black text-[#0a0a0a] tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-black/5">✓ {sig}</span>
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{dateStr}</span>
                    </div>
                    <p className="font-serif text-[16px] text-[#0a0a0a] leading-relaxed font-medium group-hover:text-black/60 transition-colors">{p.title}</p>
                  </motion.div>
                );
              })
            ) : (
              FALLBACK_FORUM_POSTS.map((p, i) => (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { delay: i * 0.1, duration: 0.6 } } }} className="bg-white p-8 rounded-2xl border border-black/5 hover:border-black/15 hover:shadow-lg transition-all group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] font-black text-[#0a0a0a] tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-black/5">✓ {p.walletSlug}</span>
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.date}</span>
                  </div>
                  <p className="font-serif text-[16px] text-[#0a0a0a] leading-relaxed font-medium group-hover:text-black/60 transition-colors">{p.title}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── COMPACT CHRONICLE ─────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="mb-16 md:mb-24">
            <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-4">Chronicle</span>
            <h2 className="text-[40px] sm:text-[56px] font-black tracking-tighter uppercase leading-[0.95]">
              Six events that<br /><span className="text-black/20">shaped everything.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {KEY_EVENTS.map((ev, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } } }} className="bg-[#FAFAF8] p-10 rounded-[2rem] border border-black/5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ev.date}</span>
                  <span className="font-mono text-[10px] font-black text-[#0a0a0a] bg-white px-3 py-1 rounded-full border border-black/5">{ev.code}</span>
                </div>
                <p className="font-serif text-[15px] md:text-[16px] text-slate-600 leading-relaxed font-medium">{ev.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYSTEM ARCHITECTURE ──────────────────────────────────────────────────── */}
      <section className="w-full py-24 md:py-40 bg-[#0a0a0a] text-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FADE_UP} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-20 lg:mb-32">
            <div>
              <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-white/40 block mb-4">Architecture v2.0</span>
              <h2 className="text-[40px] sm:text-[56px] md:text-[72px] font-black tracking-tighter uppercase leading-[0.95]">
                Comprehensive.<br /><span className="text-white/30">Elegant scale.</span>
              </h2>
            </div>
            <p className="font-serif text-[16px] sm:text-[18px] text-white/60 max-w-lg text-left lg:text-right leading-relaxed">
              A robust foundation meticulously engineered to provide seamless navigation, cryptographic security, and a fluid institutional experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {ARCHITECTURE.map((pillar, i) => (
              <motion.div key={pillar.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { delay: i * 0.05, duration: 0.5 } } }} className="bg-[#141414] p-8 md:p-10 rounded-3xl border border-white/5 hover:bg-[#1a1a1a] hover:border-white/10 transition-colors group">
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 group-hover:text-white/60 transition-colors">{pillar.id}</span>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                    <pillar.icon size={16} className="text-white/50" />
                  </div>
                </div>
                <h3 className="font-mono text-[12px] md:text-[14px] font-black uppercase tracking-[0.15em] text-white mb-4">{pillar.label}</h3>
                <p className="font-serif text-[14px] text-white/50 leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center gap-8 justify-between">
            <div className="flex flex-wrap gap-4">
              {["Intuitive Interface", "Secure Infrastructure", "Real-time Processing", "Reliable Uptime"].map((tag) => (
                <span key={tag} className="font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 text-white/40 bg-white/5">
                  {tag}
                </span>
              ))}
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/30 shrink-0">
              Architecture Signed & Verified ✓
            </span>
          </div>
        </div>
      </section>

      {/* ── CLOSING ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-32 md:py-48 bg-white">
        <div className="max-w-[850px] mx-auto px-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#FAFAF8] border border-black/5 flex items-center justify-center mb-10">
            <Shield size={20} className="text-[#0a0a0a]" />
          </div>
          <h2 className="text-[36px] md:text-[56px] font-serif text-[#0a0a0a] leading-tight tracking-tight mb-8">
            In the pursuit of <br /><span className="italic font-light text-slate-500">absolute transparency</span>.
          </h2>
          <div className="flex justify-center mb-10">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-black/5">
              © 2026 atfortyseven-creations
            </span>
          </div>
          <p className="font-serif text-[15px] md:text-[18px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Foundational document on pure mathematical abstraction, zero-knowledge cryptographic mechanisms,
            and deterministic heuristic paradigms that cement the immutable global infrastructure.
          </p>
        </div>
      </section>

    </div>
  );
}
