"use client";

/**
 * MobileManifesto.tsx
 *
 * Mobile landing page — short, vision-first, no AI clichés.
 * Structure:
 *   1. Hero — What this is, in one breath
 *   2. Origin — The creator's note (personal, direct)
 *   3. How it works — 3 honest paragraphs
 *   4. Live flows — Real on-chain BTC transfers
 *   5. Plans — Pricing, clean and unforced
 *   6. Single CTA
 */

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

// ─── Pricing plans ────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "STARTER",
    price: "130",
    cadence: "/ month",
    tagline: "For individual traders building their edge.",
    color: "#050505",
    features: [
      "Real-time whale alerts (ETH + BTC)",
      "On-chain wallet scanner",
      "Polymarket position tracking",
      "Community forum access",
    ],
  },
  {
    id: "PRO",
    price: "350",
    cadence: "/ month",
    tagline: "For analysts who need depth, not noise.",
    color: "#00C076",
    highlight: true,
    features: [
      "Everything in Starter",
      "Multi-chain forensics (12 networks)",
      "Mempool pre-confirmation alerts",
      "Entity graph & address clustering",
      "API access (5,000 req/day)",
    ],
  },
  {
    id: "INSTITUTIONAL",
    price: "950",
    cadence: "/ month",
    tagline: "For desks that move before the market does.",
    color: "#050505",
    features: [
      "Everything in Pro",
      "Dark pool radar",
      "Dedicated WebSocket stream",
      "Unlimited API requests",
      "Priority support + SLA",
    ],
  },
];

// ─── Live whale flow fetcher ───────────────────────────────────────────────────
interface Flow {
  txid:          string;
  fromCity:      string;
  toCity:        string;
  btc:           string;
  type:          string;
  latencyMs:     number;
  confirmations: string;
  confirmed:     boolean;
}

function useLiveFlows() {
  const [flows, setFlows]   = useState<Flow[] | null>(null);
  const [loading, setLoad]  = useState(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/network/whale-flows");
      const data = await res.json();
      setFlows(data.flows ?? []);
    } catch {
      setFlows([]);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const t = setInterval(fetch_, 65_000);
    return () => clearInterval(t);
  }, [fetch_]);

  return { flows, loading };
}

// ─── Main component ────────────────────────────────────────────────────────────
export function MobileManifesto() {
  const { flows, loading } = useLiveFlows();
  const [tick, setTick]    = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative bg-[#FDFCF8] text-[#050505] font-sans antialiased overflow-x-hidden min-h-screen">

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="px-6 pt-20 pb-14 border-b border-black/8">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/35">
            On-chain · 12 networks · Live
          </span>
        </div>

        <h1 className="text-[42px] font-black tracking-tighter leading-[0.9] uppercase mb-5">
          Whale<br />Alert<br /><span className="text-[#00C076]">Network</span>
        </h1>

        <p className="font-serif text-[15px] text-black/55 leading-relaxed mb-8 max-w-sm">
          Institutional capital moves before price does.
          This platform reads it from the chain — before block confirmation,
          before your terminal shows it.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] active:scale-95 transition-transform"
          >
            Open Terminal <ArrowRight size={13} />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 px-6 py-4 border border-black/20 font-mono text-[11px] uppercase tracking-[0.15em] text-black active:scale-95 transition-transform"
          >
            View Plans
          </Link>
        </div>
      </section>

      {/* ── 2. CREATOR'S NOTE ────────────────────────────────────────────────── */}
      <section className="px-6 py-14 border-b border-black/8">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 block mb-5">
          Why this exists
        </span>

        <div className="space-y-4 font-serif text-[14px] text-[#333] leading-[1.8]">
          <p>
            I built this alone. Not at a fund, not at a startup — from my desk,
            watching whale wallets move nine figures while retail read the news
            twenty minutes later. That gap is not an accident. It is structural.
          </p>
          <p>
            The chain is transparent by design. Every transfer is public, every
            address is traceable, every volume spike is legible — if you know
            where to read. Most people don't have the infrastructure to read it
            in real time. I spent two years building that infrastructure.
          </p>
          <p>
            This platform watches known exchange wallets, OTC desks, and
            institutional custodians across twelve networks. It catches transfers
            from the mempool — before confirmation, before price impact.
            It clusters addresses into entities so you see <em>who</em> is moving,
            not just <em>what</em>.
          </p>
          <p>
            Identity on this platform is cryptographic. Your wallet is your
            login. Forum posts carry your ECDSA signature. Nothing is
            anonymous, nothing is unaccountable.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-black/8">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-black/30">
            — atfortyseven-creations · 2026
          </span>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="px-6 py-14 border-b border-black/8">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 block mb-8">
          Under the hood
        </span>

        <div className="space-y-0 divide-y divide-black/8">
          {[
            {
              n: "01",
              title: "Mempool capture",
              body: "GetBlock nodes stream pending transaction logs before any block confirmation. Whale-sized transfers (configurable threshold) get flagged the moment they enter the network.",
            },
            {
              n: "02",
              title: "Entity resolution",
              body: "Known exchange wallets — Binance, Coinbase, OKX, Bitfinex and forty others — are matched against a curated address registry. Unknown wallets are clustered by behavioral fingerprint.",
            },
            {
              n: "03",
              title: "Cross-chain forensics",
              body: "The same intelligence runs on Ethereum, Solana, Polygon, BNB Chain, Arbitrum, Base and six more. One interface, no chain-switching.",
            },
          ].map(item => (
            <div key={item.n} className="py-6">
              <div className="flex items-start gap-4">
                <span className="font-mono text-[28px] font-black text-black/8 leading-none shrink-0 mt-0.5">
                  {item.n}
                </span>
                <div>
                  <h3 className="font-mono text-[11px] font-black uppercase tracking-widest mb-2">
                    {item.title}
                  </h3>
                  <p className="font-serif text-[13px] text-[#444] leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. LIVE FLOWS ────────────────────────────────────────────────────── */}
      <section className="px-6 py-14 border-b border-black/8">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30">
            Live BTC transfers
          </span>
          {!loading && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
              <span className="font-mono text-[8px] text-black/30 uppercase">mempool.space</span>
            </span>
          )}
        </div>

        <div className="space-y-2">
          {loading
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-14 bg-black/[0.03] rounded-xl animate-pulse" />
              ))
            : flows && flows.length > 0
            ? flows.slice(0, 5).map((f, i) => (
                <div
                  key={f.txid}
                  className="flex items-center justify-between px-4 py-3 bg-white border border-black/[0.07] rounded-xl"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg width="18" height="10" viewBox="0 0 20 12" className="shrink-0">
                      <path d="M1 10 Q10 0 19 10" stroke="#999" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      <circle cx={1 + (i * 4 + tick * 2) % 18} cy={10 - Math.sin(((i * 4 + tick * 2) % 18) / 18 * Math.PI) * 8} r="1.5" fill="#050505" />
                    </svg>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] font-black uppercase tracking-widest text-black/70 truncate">
                        {f.fromCity} <span className="opacity-40">→</span> {f.toCity}
                      </div>
                      <div className="font-mono text-[8px] text-black/30 uppercase mt-0.5">
                        {f.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-mono text-[11px] font-black text-black">
                      {f.btc} BTC
                    </div>
                    <div className="font-mono text-[8px] text-black/30 uppercase mt-0.5">
                      {f.confirmations}
                    </div>
                  </div>
                </div>
              ))
            : (
              <div className="py-8 text-center">
                <span className="font-mono text-[10px] text-black/25 uppercase tracking-widest">
                  Waiting for on-chain data
                </span>
              </div>
            )
          }
        </div>
      </section>

      {/* ── 5. PLANS ─────────────────────────────────────────────────────────── */}
      <section className="py-14 border-b border-black/8">
        <div className="px-6 mb-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 block mb-3">
            Access
          </span>
          <h2 className="font-black text-[26px] tracking-tighter uppercase leading-tight">
            Three tiers.<br />
            <span className="text-black/20">Choose yours.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-px bg-black/8">
          {PLANS.map(plan => (
            <Link
              key={plan.id}
              href="/pricing"
              className={`group flex flex-col px-6 py-8 transition-colors active:scale-[0.99] ${
                plan.highlight ? "bg-black text-white" : "bg-[#FDFCF8] hover:bg-[#F5F4EF]"
              }`}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className={`font-mono text-[9px] uppercase tracking-widest font-black ${
                    plan.highlight ? "text-[#00C076]" : "text-black/30"
                  }`}>
                    {plan.id}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`font-black text-[40px] tracking-tighter leading-none ${
                      plan.highlight ? "text-white" : "text-black"
                    }`}>
                      €{plan.price}
                    </span>
                    <span className={`font-mono text-[9px] uppercase ${
                      plan.highlight ? "text-white/40" : "text-black/25"
                    }`}>
                      {plan.cadence}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className={`mt-2 opacity-20 group-hover:opacity-60 group-hover:translate-x-1 transition-all ${
                    plan.highlight ? "text-white" : "text-black"
                  }`}
                />
              </div>

              <p className={`font-serif text-[13px] leading-snug mb-5 ${
                plan.highlight ? "text-white/60" : "text-black/45"
              }`}>
                {plan.tagline}
              </p>

              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle
                      size={12}
                      className={`mt-0.5 shrink-0 ${plan.highlight ? "text-[#00C076]" : "text-black/25"}`}
                    />
                    <span className={`font-mono text-[10px] uppercase tracking-wide ${
                      plan.highlight ? "text-white/70" : "text-black/55"
                    }`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>

        <div className="px-6 pt-6">
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 w-full py-3 border border-black/15 font-mono text-[10px] uppercase tracking-widest text-black/50 hover:text-black hover:border-black transition-colors"
          >
            Full pricing details <ArrowRight size={11} />
          </Link>
        </div>
      </section>

      {/* ── 6. CLOSING ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <p className="font-serif text-[13px] text-black/35 leading-relaxed mb-8 max-w-sm">
          The chain doesn't lie. The question is whether you can read it
          before it's already priced in.
        </p>
        <Link
          href="/connect"
          className="inline-flex items-center gap-2 px-7 py-4 bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] active:scale-95 transition-transform"
        >
          Connect Wallet <ArrowRight size={13} />
        </Link>

        <div className="mt-14 pt-6 border-t border-black/8">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-black/20">
            © 2026 atfortyseven-creations · All rights reserved
          </span>
        </div>
      </section>

    </div>
  );
}
