"use client";

/**
 * MobileManifesto.tsx
 * ═══════════════════════════════════════════════════════════════════════════
 * Mobile Landing Page — iOS/Android. Institutional quality at max performance.
 *
 * Fixes applied:
 *   BUG-09  Pricing synced from lib/config/pricing-tiers (SSOT)
 *   BUG-10  CTA reads session cookie: authenticated → /dashboard, else /connect
 *   BUG-11  hero uses env(safe-area-inset-top) for iPhone notch/Dynamic Island
 *   PERF-12 setInterval paused on visibilitychange=hidden (battery save)
 *   UX-13   "Updated X seconds ago" indicator on Live Flows
 *   UX-14   Creator's Note collapsed to 2 paragraphs with "Read more" expand
 *   UX-15   Highlighted plan has absolute "★ Most Popular" badge
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, ChevronDown } from "lucide-react";
import { PRICING_TIERS } from "@/lib/config/pricing-tiers";

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

// PERF-12: visibilitychange-aware hook — pauses interval when tab is hidden
function useLiveFlows() {
  const [flows,       setFlows      ] = useState<Flow[] | null>(null);
  const [loading,     setLoad       ] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchFlows = useCallback(async () => {
    try {
      const res  = await fetch("/api/network/whale-flows");
      const data = await res.json();
      setFlows(data.flows ?? []);
      setLastUpdated(new Date());
    } catch {
      setFlows([]);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchFlows();

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(fetchFlows, 65_000);
    };
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    start();

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        fetchFlows(); // immediate refresh on tab-restore
        start();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchFlows]);

  return { flows, loading, lastUpdated };
}

// UX-13: human-readable "Updated X seconds ago" ticker
function useSecondsAgo(date: Date | null): string {
  const [label, setLabel] = useState("just now");

  useEffect(() => {
    if (!date) return;
    const update = () => {
      const secs = Math.floor((Date.now() - date.getTime()) / 1000);
      if (secs < 5)   setLabel("just now");
      else if (secs < 60) setLabel(`${secs}s ago`);
      else setLabel(`${Math.floor(secs / 60)}m ago`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date]);

  return label;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function MobileManifesto() {
  const { flows, loading, lastUpdated } = useLiveFlows();
  const [tick, setTick] = useState(0);
  const updatedLabel = useSecondsAgo(lastUpdated);

  // UX-14: collapsible creator's note
  const [noteExpanded, setNoteExpanded] = useState(false);

  // BUG-10: Session-aware CTA — read the sovereign_handshake cookie
  const [hasSession, setHasSession] = useState(false);
  useEffect(() => {
    const hasCookie =
      document.cookie.includes("sovereign_handshake=") ||
      document.cookie.includes("siwe_session=");
    setHasSession(hasCookie);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 2500);
    return () => clearInterval(t);
  }, []);

  // BUG-09: SSOT from pricing-tiers config
  const allTiers = PRICING_TIERS;

  return (
    <div
      className="relative bg-[#FDFCF8] text-[#050505] font-sans antialiased overflow-x-hidden min-h-screen"
    >

      {/* ── 1. HERO ───────────────────────────────────────────────────────────── */}
      {/* BUG-11: Safe-area-inset-top for iPhone notch / Dynamic Island */}
      <section
        className="px-6 pb-14 border-b border-black/8"
        style={{ paddingTop: "max(5rem, env(safe-area-inset-top, 5rem))" }}
      >
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
            Enter the Network <ArrowRight size={13} />
          </Link>
          <Link
            href="/pricing"
            className="flex items-center justify-center gap-2 px-6 py-4 border border-black/20 font-mono text-[11px] uppercase tracking-[0.15em] text-black active:scale-95 transition-transform"
          >
            View Plans
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center gap-3 mt-7 pt-6 border-t border-black/8">
          <span className="font-mono text-[8px] uppercase tracking-widest text-black/25">Secured by</span>
          {["STRIPE", "ETHEREUM", "AZTEC ZK"].map((label) => (
            <span key={label} className="font-mono text-[8px] font-black text-black/40 border border-black/10 px-2 py-0.5">
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── 2. CREATOR'S NOTE ─────────────────────────────────────────────────── */}
      {/* UX-14: Collapsed to 2 paragraphs with expand affordance */}
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
            address is traceable — if you know where to read. Most people don't
            have the infrastructure to read it in real time. I spent two years
            building that infrastructure.
          </p>

          {/* Collapsible extra paragraphs */}
          <div
            className="overflow-hidden transition-all duration-500 ease-in-out"
            style={{ maxHeight: noteExpanded ? "400px" : "0px", opacity: noteExpanded ? 1 : 0 }}
          >
            <p className="pt-4">
              This platform watches known exchange wallets, OTC desks, and
              institutional custodians across twelve networks. It catches transfers
              from the mempool — before confirmation, before price impact.
              It clusters addresses into entities so you see <em>who</em> is moving,
              not just <em>what</em>.
            </p>
            <p className="pt-4">
              Identity on this platform is cryptographic. Your wallet is your
              login. Forum posts carry your ECDSA signature. Nothing is
              anonymous, nothing is unaccountable.
            </p>
          </div>
        </div>

        <button
          onClick={() => setNoteExpanded((v) => !v)}
          className="flex items-center gap-1.5 mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-black/40 hover:text-black transition-colors"
        >
          {noteExpanded ? "Read less" : "Read more"}
          <ChevronDown
            size={12}
            className={`transition-transform duration-300 ${noteExpanded ? "rotate-180" : ""}`}
          />
        </button>

        <div className="mt-8 pt-6 border-t border-black/8">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-black/30">
            — atfortyseven-creations · 2026
          </span>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section className="px-6 py-14 border-b border-black/8">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 block mb-8">
          Under the hood
        </span>

        <div className="space-y-0 divide-y divide-black/8">
          {[
            {
              n: "01",
              title: "Mempool capture",
              body: "GetBlock nodes stream pending transaction logs before any block confirmation. Whale-sized transfers get flagged the moment they enter the network.",
            },
            {
              n: "02",
              title: "Entity resolution",
              body: "Known exchange wallets — Binance, Coinbase, OKX, Bitfinex and forty others — are matched against a curated address registry. Unknown wallets are clustered by behavioural fingerprint.",
            },
            {
              n: "03",
              title: "Cross-chain forensics",
              body: "The same intelligence runs on Ethereum, Solana, Polygon, BNB Chain, Arbitrum, Base and six more. One interface, no chain-switching.",
            },
          ].map((item) => (
            <div key={item.n} className="py-6">
              <div className="flex items-start gap-4">
                <span className="font-mono text-[28px] font-black text-black/8 leading-none shrink-0 mt-0.5">
                  {item.n}
                </span>
                <div>
                  <h3 className="font-mono text-[11px] font-black uppercase tracking-widest mb-2">{item.title}</h3>
                  <p className="font-serif text-[13px] text-[#444] leading-relaxed">{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. LIVE FLOWS ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-14 border-b border-black/8">
        <div className="flex items-center justify-between mb-6">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30">
            Live BTC transfers
          </span>
          {/* UX-13: Updated timestamp */}
          {!loading && lastUpdated && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
              <span className="font-mono text-[8px] text-black/30 uppercase">{updatedLabel}</span>
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
                      <circle
                        cx={1 + ((i * 4 + tick * 2) % 18)}
                        cy={10 - Math.sin((((i * 4 + tick * 2) % 18) / 18) * Math.PI) * 8}
                        r="1.5"
                        fill="#050505"
                      />
                    </svg>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] font-black uppercase tracking-widest text-black/70 truncate">
                        {f.fromCity} <span className="opacity-40">→</span> {f.toCity}
                      </div>
                      <div className="font-mono text-[8px] text-black/30 uppercase mt-0.5">{f.type}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <div className="font-mono text-[11px] font-black text-black">{f.btc} BTC</div>
                    <div className="font-mono text-[8px] text-black/30 uppercase mt-0.5">{f.confirmations}</div>
                  </div>
                </div>
              ))
            : (
              <div className="py-8 text-center">
                <span className="font-mono text-[10px] text-black/25 uppercase tracking-widest">
                  Waiting for on-chain data
                </span>
              </div>
            )}
        </div>
      </section>

      {/* ── 5. PLANS ──────────────────────────────────────────────────────────── */}
      {/* BUG-09: Synced from PRICING_TIERS SSOT */}
      <section className="py-14 border-b border-black/8">
        <div className="px-6 mb-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-black/30 block mb-3">Access</span>
          <h2 className="font-black text-[26px] tracking-tighter uppercase leading-tight">
            The right tier.<br />
            <span className="text-black/20">For every trader.</span>
          </h2>
        </div>

        <div className="flex flex-col gap-px bg-black/8">
          {allTiers.map((tier) => (
            <Link
              key={tier.id}
              href="/pricing"
              className={`group flex flex-col px-6 py-8 transition-colors active:scale-[0.99] relative ${
                tier.highlight ? "bg-black text-white" : "bg-[#FDFCF8] hover:bg-[#F5F4EF]"
              }`}
            >
              {/* UX-15: Floating "Most Popular" badge */}
              {tier.highlight && (
                <div
                  className="absolute top-[-12px] left-6 px-3 py-1 font-mono text-[8px] font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(0,192,118,0.3)]"
                  style={{ backgroundColor: tier.accentColor }}
                >
                  {tier.badge}
                </div>
              )}

              <div className="flex items-start justify-between mb-5">
                <div>
                  <span
                    className="font-mono text-[9px] uppercase tracking-widest font-black"
                    style={{ color: tier.highlight ? tier.accentColor : "rgba(0,0,0,0.3)" }}
                  >
                    {tier.id}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span
                      className="font-black text-[40px] tracking-tighter leading-none"
                      style={{ color: tier.highlight ? "#fff" : "#050505" }}
                    >
                      €{tier.priceMonthly}
                    </span>
                    <span
                      className="font-mono text-[9px] uppercase"
                      style={{ color: tier.highlight ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)" }}
                    >
                      / month
                    </span>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="mt-2 opacity-20 group-hover:opacity-60 group-hover:translate-x-1 transition-all"
                  style={{ color: tier.highlight ? "#fff" : "#050505" }}
                />
              </div>

              <p
                className="font-serif text-[13px] leading-snug mb-5"
                style={{ color: tier.highlight ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.45)" }}
              >
                {tier.tagline}
              </p>

              <ul className="space-y-2">
                {tier.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2">
                    <CheckCircle
                      size={12}
                      className="mt-0.5 shrink-0"
                      style={{ color: tier.highlight ? tier.accentColor : "rgba(0,0,0,0.25)" }}
                    />
                    <span
                      className="font-mono text-[10px] uppercase tracking-wide"
                      style={{ color: tier.highlight ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)" }}
                    >
                      {f.text}
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

      {/* ── 6. CLOSING CTA ────────────────────────────────────────────────────── */}
      {/* BUG-10: Authenticated users go to /dashboard, others to /connect */}
      <section
        className="px-6 py-16"
        style={{ paddingBottom: "max(4rem, env(safe-area-inset-bottom, 4rem))" }}
      >
        <p className="font-serif text-[13px] text-black/35 leading-relaxed mb-8 max-w-sm">
          The chain doesn't lie. The question is whether you can read it
          before it's already priced in.
        </p>
        <Link
          href={hasSession ? "/dashboard" : "/connect"}
          className="inline-flex items-center gap-2 px-7 py-4 bg-black text-white font-mono text-[11px] uppercase tracking-[0.15em] active:scale-95 transition-transform"
        >
          {hasSession ? "Enter Terminal" : "Connect Wallet"} <ArrowRight size={13} />
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
