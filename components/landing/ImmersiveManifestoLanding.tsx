"use client";

/**
 * ImmersiveManifestoLanding.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 * PC Landing Page — Institutional grade, Tronscan-level quality.
 *
 * Fixes applied:
 *   BUG-01  Pricing tiers imported from lib/config/pricing-tiers (SSOT)
 *   BUG-02  Globe opacity raised to 60% on mobile (not 25%)
 *   BUG-03  Tags rewritten as benefit-first language
 *   BUG-04  Forum teaser has skeleton + static fallback posts
 *   PERF-05 watchBlocks replaced by useEthMetrics hook (ref-guarded)
 *   UX-06   Live stats moved INTO the hero section (above the fold)
 *   UX-07   CTA rewritten as "Enter the Network" (inclusive language)
 *   PERF-08 LottieFromUrl now has AbortController + unmount guard
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { SovereignGlobe3D } from "./SovereignGlobe3D";
import Link from "next/link";
import { ArrowRight, Scan, MessageSquare, ChevronRight, Shield, Zap, Globe2 } from "lucide-react";
import { useEthMetrics } from "@/hooks/useEthMetrics";
import { PRICING_TIERS } from "@/lib/config/pricing-tiers";

// Lottie loaded dynamically — no SSR (uses DOM APIs)
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

// ─── LottieFromUrl ─────────────────────────────────────────────────────────
// PERF-08: AbortController prevents state updates on unmounted components
function LottieFromUrl({
  url,
  className,
  style,
}: {
  url: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [animData, setAnimData] = useState<object | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then(setAnimData)
      .catch((err) => {
        // AbortError is expected on unmount — don't log it
        if (err?.name !== "AbortError") {
          console.warn("[Lottie] Failed to load animation:", url);
        }
      });
    return () => controller.abort();
  }, [url]);

  if (!animData) return null;
  return (
    <Lottie
      animationData={animData}
      loop
      autoplay
      className={className}
      style={style ?? { width: "100%", height: "auto" }}
      aria-hidden="true"
    />
  );
}

// ─── Static data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: "Mempool intelligence",
    desc: "Intercept institutional capital before block confirmation. Sub-second detection across 12 chains.",
  },
  {
    icon: Shield,
    title: "Cryptographic identity",
    desc: "Zero passwords. Your wallet is your key. Every session is mathematically verifiable via ECDSA.",
  },
  {
    icon: Globe2,
    title: "On-chain forensics",
    desc: "De-obfuscate mixer outputs, trace multi-hop routes, and map entity clusters in real time.",
  },
];

// BUG-03: Benefit-first tags (not ZK jargon)
const HERO_TAGS = [
  "Free to start",
  "12 Blockchains",
  "Mempool alerts",
  "Cryptographic identity",
  "Community forum",
];

// BUG-04: Static fallback posts shown while live data loads
const FALLBACK_FORUM_POSTS = [
  {
    walletSlug: "0x7a2f...c3e1",
    title: "Tracing the $400M BTC consolidation — Binance cold wallet cluster analysis",
    date: "May 9, 16:42",
  },
  {
    walletSlug: "0x3d9b...a0f2",
    title: "Aztec Network privacy model vs. zkSync: which ZK-rollup wins for institutional use?",
    date: "May 9, 13:11",
  },
  {
    walletSlug: "0x1c8e...7f4a",
    title: "Post-ETF era: mapping the new institutional wallet fingerprints",
    date: "May 8, 21:00",
  },
];

const KEY_EVENTS = [
  { date: "Jan 2009", code: "BTC-000", text: "Bitcoin Block 0 — Satoshi's direct answer to the TARP bailout: immutable, trustless, sovereign." },
  { date: "Feb 2014", code: "MTGOX",  text: "850,000 BTC stolen — centralised custody proven irreconcilable with cryptographic sovereignty." },
  { date: "May 2022", code: "LUNA",   text: "$60B Terra death spiral — algorithmic stablecoins without overcollateralisation cannot survive." },
  { date: "Nov 2022", code: "FTX",    text: "Sam Bankman-Fried's $8B fraud — opacity destroys ecosystems. On-chain transparency is the only answer." },
  { date: "Jan 2024", code: "ETF",    text: "First US Spot Bitcoin ETF — $12B institutional inflow in 30 days. The institutional era begins." },
  { date: "Apr 2025", code: "BYBIT",  text: "$1.4B stolen by Lazarus Group — even tier-1 custody is vulnerable to social engineering." },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function ImmersiveManifestoLanding({
  onOpenScanner,
  hideMap = false,
}: {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}) {
  // PERF-05 + UX-06: Shared hook replaces raw watchBlocks
  const { blockNumber, baseFeeGwei, syncing } = useEthMetrics();

  // Global market stats (active tokens, total cap)
  const [globalStats, setGlobalStats] = useState<{ tokens: string; cap: string } | null>(null);
  useEffect(() => {
    fetch("/api/market/global")
      .then((r) => r.json())
      .then((data) => {
        if (data?.data) {
          setGlobalStats({
            tokens: data.data.active_cryptocurrencies.toLocaleString(),
            cap: "$" + (data.data.total_market_cap.usd / 1e12).toFixed(2) + "T",
          });
        }
      })
      .catch(() => {});
  }, []);

  // Forum live topics with skeleton-aware fallback
  const [liveTopics, setLiveTopics] = useState<any[] | null>(null);
  useEffect(() => {
    fetch("/api/forum/topics?limit=3&filter=latest")
      .then((r) => r.json())
      .then((data) => setLiveTopics(Array.isArray(data) ? data : []))
      .catch(() => setLiveTopics([]));
  }, []);

  // Only show the 2 paid tiers in the landing preview (Explorer, Professional)
  const previewTiers = PRICING_TIERS.filter((t) => t.id === "STARTER" || t.id === "PRO" || t.id === "ELITE");

  return (
    <div className="relative bg-[#FDFCF8] text-[#050505] font-sans antialiased overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[100dvh] flex flex-col lg:flex-row items-center border-b border-black/8 overflow-hidden">

        {/* Left column */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-8 sm:px-14 lg:px-20 pt-24 pb-28 lg:py-0 w-full lg:w-1/2 min-h-[100dvh] lg:min-h-0">

          <h1 className="text-[44px] sm:text-[62px] lg:text-[72px] font-black tracking-tighter leading-[0.93] uppercase text-black mb-6">
            WHALE<br />ALERT<br /><span className="text-[#00C076]">NETWORK</span>
          </h1>

          <p className="font-serif text-[15px] sm:text-[17px] text-black/55 leading-relaxed max-w-md mb-8">
            Track institutional capital before markets react. Real-time on-chain intelligence — from mempool to execution.
          </p>

          {/* UX-06: Live stats bar — above the fold, inside the hero */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 pb-8 border-b border-black/8">
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-black/30">ETH Block</span>
              <span className="font-mono text-[13px] font-black text-black">
                {syncing ? <span className="animate-pulse text-black/30">Syncing...</span> : blockNumber ?? "---"}
              </span>
            </div>
            <div className="w-px h-8 bg-black/10 self-center hidden sm:block" />
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-black/30">Base Fee</span>
              <span className="font-mono text-[13px] font-black text-black">
                {baseFeeGwei ? `${baseFeeGwei} Gwei` : "---"}
              </span>
            </div>
            <div className="w-px h-8 bg-black/10 self-center hidden sm:block" />
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-black/30">Active Tokens</span>
              <span className="font-mono text-[13px] font-black text-black">
                {globalStats?.tokens ?? "---"}
              </span>
            </div>
            <div className="w-px h-8 bg-black/10 self-center hidden sm:block" />
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-black/30">Total Cap</span>
              <span className="font-mono text-[13px] font-black text-black">
                {globalStats?.cap ?? "---"}
              </span>
            </div>
          </div>

          {/* UX-07: Inclusive CTA language */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-black/80 transition-colors"
            >
              Enter the Network <ArrowRight size={14} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-black/20 text-black font-mono text-[11px] uppercase tracking-[0.15em] hover:border-black transition-colors"
            >
              View Plans
            </Link>
          </div>

          {/* BUG-03: Benefit-first tags */}
          <div className="flex flex-wrap gap-2">
            {HERO_TAGS.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 bg-black/5 text-black/40 border border-black/8"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Trust signals row */}
          <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-black/8">
            <span className="font-mono text-[8px] uppercase tracking-widest text-black/25">Secured by</span>
            <span className="font-mono text-[9px] font-black text-black/50 border border-black/10 px-2 py-0.5">STRIPE</span>
            <span className="font-mono text-[9px] font-black text-black/50 border border-black/10 px-2 py-0.5">ETHEREUM</span>
            <span className="font-mono text-[9px] font-black text-black/50 border border-black/10 px-2 py-0.5">AZTEC ZK</span>
          </div>
        </div>

        {/* BUG-02: Globe at 60% opacity on mobile (was 25%) */}
        <div className="absolute inset-0 w-full h-[100dvh] opacity-60 pointer-events-none lg:relative lg:w-1/2 lg:h-screen lg:opacity-100 lg:pointer-events-auto lg:right-0 lg:top-0 lg:bottom-0">
          {!hideMap && <SovereignGlobe3D />}
        </div>

        {/* Mobile wallet button */}
        {onOpenScanner && (
          <div
            className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-[#FDFCF8] border-t border-black/10 flex justify-center py-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <button
              onClick={onOpenScanner}
              className="px-10 py-3.5 bg-black text-white font-mono text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-transform flex items-center gap-3"
            >
              <Scan size={13} /> Connect Wallet
            </button>
          </div>
        )}
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section className="w-full border-b border-black/8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-black/8">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="bg-[#FDFCF8] p-10 flex flex-col gap-6 group hover:bg-[#F5F4EF] transition-colors"
            >
              <div className="w-9 h-9 border border-black/10 flex items-center justify-center">
                <f.icon size={15} strokeWidth={1.5} className="text-black/60" />
              </div>
              <div>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] font-black mb-3">{f.title}</h3>
                <p className="font-serif text-[13px] text-[#444] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANS PREVIEW ─────────────────────────────────────────────────────── */}
      <section className="w-full border-b border-black/8 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30 mb-3">Subscription</p>
              <h2 className="text-[32px] sm:text-[44px] font-black tracking-tighter uppercase leading-none">
                The right tier.<br /><span className="text-black/25">For every trader.</span>
              </h2>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] hover:text-[#00C076] transition-colors group shrink-0"
            >
              Full pricing <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* BUG-01: Synced from PRICING_TIERS SSOT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/8">
            {previewTiers.map((tier) => (
              <Link
                key={tier.id}
                href="/pricing"
                className={`flex flex-col p-10 transition-colors group relative ${
                  tier.highlight
                    ? "bg-black text-white hover:bg-[#111]"
                    : "bg-[#FDFCF8] hover:bg-[#F5F4EF]"
                }`}
              >
                {tier.badge && (
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest font-black mb-6 block"
                    style={{ color: tier.highlight ? tier.accentColor : "rgba(0,0,0,0.4)" }}
                  >
                    {tier.badge}
                  </span>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-black text-[46px] tracking-tighter leading-none"
                    style={{ color: tier.highlight ? "#fff" : "#050505" }}
                  >
                    €{tier.priceMonthly}
                  </span>
                  <ChevronRight
                    size={13}
                    className={`opacity-25 group-hover:opacity-100 transition-opacity ${tier.highlight ? "text-white" : "text-black"}`}
                  />
                </div>
                <span
                  className="font-mono text-[10px] uppercase tracking-widest mb-6"
                  style={{ color: tier.highlight ? tier.accentColor : "rgba(0,0,0,0.3)" }}
                >
                  EUR / month
                </span>
                <span
                  className="font-mono text-[13px] font-black uppercase tracking-[0.15em]"
                  style={{ color: tier.highlight ? "#fff" : "#050505" }}
                >
                  {tier.name}
                </span>
                <p
                  className="font-serif text-[12px] mt-2 leading-snug"
                  style={{ color: tier.highlight ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}
                >
                  {tier.tagline}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORUM TEASER ──────────────────────────────────────────────────────── */}
      <section className="w-full border-b border-black/8 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30 mb-3">Community</p>
            <h2 className="text-[30px] sm:text-[42px] font-black tracking-tighter uppercase leading-tight mb-5">
              Every post.<br /><span className="text-[#00C076]">Cryptographically</span><br />signed.
            </h2>

            <div className="my-6 w-full max-w-[240px]">
              <LottieFromUrl url="/lotties/DeeWork About Blockchain.json" />
            </div>

            <p className="font-serif text-[13px] text-[#444] leading-relaxed mb-8 max-w-md">
              The only forum where every message carries an ECDSA wallet signature. No anonymous posts. No repudiation. Identity is your key.
            </p>
            <Link
              href="/forum"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-3 border border-black/20 hover:bg-black hover:text-white hover:border-black transition-all group"
            >
              <MessageSquare size={13} /> Open Forum
              <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* BUG-04: Skeleton + fallback posts */}
          <div className="flex flex-col gap-px bg-black/8">
            {liveTopics === null ? (
              /* Skeleton loader */
              Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-[#FDFCF8] p-5 flex flex-col gap-2 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-24 bg-black/8 rounded-sm" />
                    <div className="h-2 w-16 bg-black/5 rounded-sm" />
                  </div>
                  <div className="h-3 w-full bg-black/5 rounded-sm" />
                  <div className="h-3 w-3/4 bg-black/5 rounded-sm" />
                </div>
              ))
            ) : liveTopics.length > 0 ? (
              liveTopics.map((p, i) => {
                const sig = p.author?.walletAddress
                  ? `${p.author.walletAddress.slice(0, 6)}...${p.author.walletAddress.slice(-4)}`
                  : "0xUNKNOWN";
                const dateStr = new Date(p.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                });
                return (
                  <div key={i} className="bg-[#FDFCF8] p-5 flex flex-col gap-2 hover:bg-[#F5F4EF] transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-[#00C076] tracking-widest">✓ {sig}</span>
                      <span className="font-mono text-[9px] text-black/30 uppercase tracking-widest">{dateStr}</span>
                    </div>
                    <p className="font-serif text-[13px] text-[#333] leading-snug">{p.title}</p>
                  </div>
                );
              })
            ) : (
              /* Static fallback — never shows an empty state */
              FALLBACK_FORUM_POSTS.map((p, i) => (
                <div key={i} className="bg-[#FDFCF8] p-5 flex flex-col gap-2 hover:bg-[#F5F4EF] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-[#00C076] tracking-widest">✓ {p.walletSlug}</span>
                    <span className="font-mono text-[9px] text-black/30 uppercase tracking-widest">{p.date}</span>
                  </div>
                  <p className="font-serif text-[13px] text-[#333] leading-snug">{p.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── COMPACT CHRONICLE ─────────────────────────────────────────────────── */}
      <section className="w-full border-b border-black/8 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30 mb-3">History</p>
          <h2 className="text-[28px] font-black tracking-tighter uppercase mb-12">
            Six events that<br /><span className="text-black/25">shaped everything.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black/8">
            {KEY_EVENTS.map((ev, i) => (
              <div key={i} className="bg-[#FDFCF8] p-7 flex flex-col gap-3 hover:bg-[#F5F4EF] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-black/30 uppercase tracking-widest">{ev.date}</span>
                  <span className="font-mono text-[9px] font-black text-black/50 bg-black/5 px-2 py-0.5">{ev.code}</span>
                </div>
                <p className="font-serif text-[13px] text-[#333] leading-relaxed">{ev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLOSING ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-32">
        <div className="max-w-[850px] mx-auto px-6 text-center">
          <h2 className="text-[32px] md:text-[46px] font-serif text-black leading-tight tracking-tight mb-4">
            In the pursuit of <br /><span className="italic font-light">transparency</span>
          </h2>
          <div className="flex justify-center mb-6">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-black/30">
              © 2026 atfortyseven-creations
            </span>
          </div>
          <p className="font-serif text-[13px] text-[#444] max-w-xl mx-auto leading-relaxed border-t border-b border-black/10 py-6">
            Foundational document on pure mathematical abstraction, zero-knowledge cryptographic mechanisms,
            and deterministic heuristic paradigms that cement the immutable global infrastructure.
          </p>
        </div>
      </section>

    </div>
  );
}
