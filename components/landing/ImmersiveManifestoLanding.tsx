"use client";

import React from "react";
import { SovereignGlobe3D } from "./SovereignGlobe3D";
import Link from "next/link";
import { ArrowRight, Scan, Zap, Shield, BarChart3, MessageSquare, ChevronRight } from "lucide-react";

const STATS = [
  { label: "Tracked today", value: "$2.4B", unit: "USD on-chain" },
  { label: "Whale movements", value: "847", unit: "last 24h" },
  { label: "Chains indexed", value: "12", unit: "L1 + L2" },
  { label: "Active analysts", value: "2,400+", unit: "verified wallets" },
];

const FEATURES = [
  {
    title: "Real-time whale detection",
    desc: "Intercept institutional capital from the mempool — before block confirmation, before price impact.",
  },
  {
    title: "Cryptographic identity",
    desc: "Zero passwords. Your wallet is your key. Every forum post carries an ECDSA signature. Every session is mathematically verifiable.",
  },
  {
    title: "On-chain forensics",
    desc: "12 chains. Unlimited history. De-obfuscate mixer outputs, trace multi-hop routes, and map entity clusters in real time.",
  },
];

const PLANS = [
  { id: "STARTER", name: "Starter", price: "130", note: "For individual traders" },
  { id: "PRO",     name: "Pro",     price: "350", note: "Most popular", highlight: true },
  { id: "ELITE",   name: "Elite",   price: "950", note: "Institutional grade" },
];

const FORUM_POSTS = [
  { sig: "0x4a3f...d219", time: "2m ago",  msg: "Whale alert: 12,500 ETH moved to Binance cold wallet." },
  { sig: "0x8c71...a44f", time: "7m ago",  msg: "BTC mining difficulty +3.2%. Next halving in 248 days." },
  { sig: "0x2e19...b3c0", time: "14m ago", msg: "USDT TRC-20 anomaly: $42M bridge transfer detected on TRON." },
];

const KEY_EVENTS = [
  { date: "Jan 2009", code: "BTC-000", text: "Bitcoin Block 0 — Satoshi's direct answer to the TARP bailout: immutable, trustless, sovereign." },
  { date: "Feb 2014", code: "MTGOX",   text: "850,000 BTC stolen — centralized custody proven irreconcilable with cryptographic sovereignty." },
  { date: "May 2022", code: "LUNA",    text: "$60B Terra death spiral — algorithmic stablecoins without overcollateralization cannot survive." },
  { date: "Nov 2022", code: "FTX",     text: "Sam Bankman-Fried's $8B fraud — opacity destroys ecosystems. On-chain transparency is the only answer." },
  { date: "Jan 2024", code: "ETF",     text: "First US Spot Bitcoin ETF — $12B institutional inflow in 30 days. The institutional era begins." },
  { date: "Apr 2025", code: "BYBIT",   text: "$1.4B stolen by Lazarus Group — even tier-1 custody is vulnerable to social engineering on human signers." },
];

export function ImmersiveManifestoLanding({
  onOpenScanner,
  hideMap = false,
}: {
  onOpenScanner?: () => void;
  hideMap?: boolean;
}) {
  return (
    <div className="relative bg-[#FDFCF8] text-[#050505] font-sans antialiased overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative w-full min-h-[100dvh] flex flex-col lg:flex-row items-center border-b border-black/8 overflow-hidden">

        {/* Left */}
        <div className="relative z-10 flex flex-col justify-center px-8 sm:px-14 lg:px-20 pt-32 pb-16 lg:py-0 w-full lg:w-1/2">


          <h1 className="text-[44px] sm:text-[62px] lg:text-[72px] font-black tracking-tighter leading-[0.93] uppercase text-black mb-6">
            WHALE<br />ALERT<br /><span className="text-[#00C076]">NETWORK</span>
          </h1>

          <p className="font-serif text-[15px] sm:text-[17px] text-black/55 leading-relaxed max-w-md mb-10">
            Track institutional capital before markets react. Real-time on-chain intelligence — from mempool to execution.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-7 py-3.5 bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-black/80 transition-colors">
              Open Terminal <ArrowRight size={14} />
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-7 py-3.5 border border-black/20 text-black font-mono text-[11px] uppercase tracking-[0.15em] hover:border-black transition-colors">
              View Plans
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {["ZK Authentication", "12 Chains", "Whale Alerts", "Forum", "On-chain Identity"].map(tag => (
              <span key={tag} className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 bg-black/5 text-black/40 border border-black/8">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Globe */}
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-screen lg:absolute lg:right-0 lg:top-0 lg:bottom-0">
          {!hideMap && <SovereignGlobe3D />}
        </div>

        {/* Mobile wallet button */}
        {onOpenScanner && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[200] bg-[#FDFCF8] border-t border-black/10 flex justify-center py-3"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            <button onClick={onOpenScanner}
              className="px-10 py-3.5 bg-black text-white font-mono text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-transform flex items-center gap-3">
              <Scan size={13} /> Connect Wallet
            </button>
          </div>
        )}
      </section>

      {/* ── STATS ── */}
      <section className="w-full border-b border-black/8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-black/8">
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-8 hover:bg-black/[0.02] transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30">{s.label}</span>
              <span className="font-black text-[36px] tracking-tighter text-black leading-none">{s.value}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#00C076]">{s.unit}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="w-full border-b border-black/8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-black/8">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-[#FDFCF8] p-10 flex flex-col gap-6 group hover:bg-[#F5F4EF] transition-colors">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] font-black">{f.title}</h3>
              <p className="font-serif text-[13px] text-[#444] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANS PREVIEW ── */}
      <section className="w-full border-b border-black/8 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30 mb-3">Subscription</p>
              <h2 className="text-[32px] sm:text-[44px] font-black tracking-tighter uppercase leading-none">
                Three tiers.<br /><span className="text-black/25">One mission.</span>
              </h2>
            </div>
            <Link href="/pricing" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] hover:text-[#00C076] transition-colors group shrink-0">
              Full pricing <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/8">
            {PLANS.map(plan => (
              <Link key={plan.id} href="/pricing"
                className={`flex flex-col p-10 transition-colors group ${
                  plan.highlight ? "bg-black text-white hover:bg-[#111]" : "bg-[#FDFCF8] hover:bg-[#F5F4EF]"
                }`}>
                <div className="flex items-center justify-between mb-8">
                  <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${plan.highlight ? "text-[#00C076]" : "text-black/35"}`}>
                    {plan.highlight ? "★ " : ""}{plan.note}
                  </span>
                  <ChevronRight size={13} className={`opacity-25 group-hover:opacity-100 transition-opacity ${plan.highlight ? "text-white" : "text-black"}`} />
                </div>
                <span className={`font-black text-[46px] tracking-tighter leading-none mb-1 ${plan.highlight ? "text-white" : "text-black"}`}>
                  ${plan.price}
                </span>
                <span className={`font-mono text-[10px] uppercase tracking-widest mb-6 ${plan.highlight ? "text-[#00C076]" : "text-black/30"}`}>
                  USDT / month
                </span>
                <span className={`font-mono text-[13px] font-black uppercase tracking-[0.15em] ${plan.highlight ? "text-white" : "text-black"}`}>
                  {plan.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORUM TEASER ── */}
      <section className="w-full border-b border-black/8 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30 mb-3">Community</p>
            <h2 className="text-[30px] sm:text-[42px] font-black tracking-tighter uppercase leading-tight mb-5">
              Every post.<br /><span className="text-[#00C076]">Cryptographically</span><br />signed.
            </h2>
            <p className="font-serif text-[13px] text-[#444] leading-relaxed mb-8 max-w-md">
              The only forum where every message carries an ECDSA wallet signature. No anonymous posts. No repudiation. Identity is your key.
            </p>
            <Link href="/forum"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] px-6 py-3 border border-black/20 hover:bg-black hover:text-white hover:border-black transition-all group">
              <MessageSquare size={13} /> Open Forum
              <ArrowRight size={13} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="flex flex-col gap-px bg-black/8">
            {FORUM_POSTS.map((p, i) => (
              <div key={i} className="bg-[#FDFCF8] p-5 flex flex-col gap-2 hover:bg-[#F5F4EF] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#00C076] tracking-widest">✓ {p.sig}</span>
                  <span className="font-mono text-[9px] text-black/30 uppercase tracking-widest">{p.time}</span>
                </div>
                <p className="font-serif text-[13px] text-[#333] leading-snug">{p.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPACT CHRONICLE ── */}
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

      {/* ── IN THE PURSUIT OF TRANSPARENCY ── */}
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
