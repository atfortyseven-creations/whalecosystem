"use client";

/**
 * MobileLanding.tsx — Whale Alert Network
 * ─────────────────────────────────────────────────────────────────────────────
 * Academic mobile landing. 240Hz touch-first. Zero buttons. Zero lag.
 *
 * Architecture:
 *  • Native document scroll only — no snap containers, no overflow traps.
 *  • All animations: `transform` + `opacity` on GPU compositor layers only.
 *  • No WebGL, no canvas, no heavy blur stacks.
 *  • Cosmic pattern at 140% scale, opacity 0.04, slow drift loop.
 *  • whileInView triggers on scroll — no JS polling.
 *  • Touch targets: 100% passive, no preventDefault calls.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { motion } from "framer-motion";
import { WhaleLogo } from "@/components/shared/WhaleLogo";

// ─── Design tokens ────────────────────────────────────────────────────────────
const IVORY = "#FAF9F6";
const INK   = "#050505";
const MUTED = "rgba(5,5,5,0.42)";
const FAINT = "rgba(5,5,5,0.10)";

// ─── Inline micro SVG — blockchain node icon ─────────────────────────────────
function ChainIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect x="28" y="28" width="24" height="24" rx="3"
        stroke={INK} strokeWidth="2.2" />
      <line x1="40" y1="52" x2="40" y2="68" stroke={INK} strokeWidth="1.8" />
      <line x1="40" y1="28" x2="40" y2="12" stroke={INK} strokeWidth="1.8" />
      <line x1="52" y1="40" x2="68" y2="40" stroke={INK} strokeWidth="1.8" />
      <line x1="28" y1="40" x2="12" y2="40" stroke={INK} strokeWidth="1.8" />
      <rect x="31" y="4"  width="18" height="12" rx="2" stroke={INK} strokeWidth="1.8" />
      <rect x="31" y="64" width="18" height="12" rx="2" stroke={INK} strokeWidth="1.8" />
      <rect x="64" y="34" width="12" height="12" rx="2" stroke={INK} strokeWidth="1.8" />
      <rect x="4"  y="34" width="12" height="12" rx="2" stroke={INK} strokeWidth="1.8" />
    </svg>
  );
}

// ─── GPU-safe scroll reveal wrapper ──────────────────────────────────────────
// Uses only `opacity` + `translateY` — zero layout triggers.
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Glassmorphism card ───────────────────────────────────────────────────────
function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div
        className="rounded-2xl p-6"
        style={{
          background: "rgba(255,255,255,0.85)",
          border: `1px solid ${FAINT}`,
          boxShadow: "0 4px 20px rgba(5,5,5,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {children}
      </div>
    </Reveal>
  );
}

// ─── Section separator with number ───────────────────────────────────────────
function Sep({ n }: { n: string }) {
  return (
    <Reveal className="flex items-center gap-4 mb-8">
      <span
        className="text-[8px] font-mono font-black"
        style={{ color: MUTED, letterSpacing: "0.35em" }}
      >
        § {n}
      </span>
      <div className="flex-1 h-px" style={{ background: FAINT }} />
    </Reveal>
  );
}

// ─── Module card data ─────────────────────────────────────────────────────────
const MODULES = [
  {
    code: "01",
    title: "Ingestion Engine",
    desc: "Priority fee interception on Solana + EVM mempool across 16 networks. Z-score at 3.5σ. Sub-15ms from on-chain event to Redis delivery.",
    stat: "<15ms",
    unit: "latency",
  },
  {
    code: "02",
    title: "Sovereign Mesh",
    desc: "Redis Pub/Sub over 6 significance tiers. ECDSA secp256k1 authentication per signal. Groth16 ZK proof for sentinel membership.",
    stat: "6",
    unit: "tiers",
  },
  {
    code: "03",
    title: "Mass Transfer Intel",
    desc: "Neo4j graph clustering reconstitutes distributed institutional moves. 15-minute sliding window. Megalodon-tier events auto-flagged.",
    stat: "$100M+",
    unit: "threshold",
  },
  {
    code: "04",
    title: "Akashic Ledger",
    desc: "SHA-256 tamper-evident registry of events above $50M. 7 fields. Hash recomputed on every GET for live integrity verification.",
    stat: "SHA-256",
    unit: "integrity",
  },
  {
    code: "05",
    title: "Sovereign Vault",
    desc: "EIP-1193 non-custodial. Private keys never reach the server. Reown AppKit for WalletConnect v2. Dead man's switch via Solidity.",
    stat: "EIP-1193",
    unit: "standard",
  },
  {
    code: "06",
    title: "ZK Infrastructure",
    desc: "World ID proof-of-personhood. Groth16 BN254 for sentinel auth. Nullifier Sybil resistance. On-chain relay to Optimism verifier.",
    stat: "Groth16",
    unit: "proof",
  },
];

const STACK = [
  { cat: "Application", items: ["Next.js 15 App Router", "TypeScript 5.7 Strict"] },
  { cat: "Blockchain",  items: ["Ethers.js 6 + Viem", "Solana Web3.js"] },
  { cat: "Data",        items: ["PostgreSQL + Prisma", "Redis Streams + Neo4j"] },
  { cat: "Security",    items: ["SIWE EIP-4361", "ZK Groth16 + World ID"] },
];

// ═════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export function MobileLanding() {
  return (
    <div
      style={{ backgroundColor: IVORY, color: INK, fontFamily: "Inter, system-ui, sans-serif" }}
      className="relative min-h-screen overflow-x-hidden"
    >

      {/* ── Cosmic wallpaper (fixed, GPU layer, zero JS per frame) ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{ background: IVORY }}
      >
        <motion.div
          className="absolute"
          style={{
            inset: "-20%", // Give extra padding so translation doesn't expose edges
            backgroundImage: "url('/patron-cosmico-4k.png')",
            backgroundSize: "140%",
            backgroundRepeat: "repeat",
            opacity: 0.04,
            mixBlendMode: "multiply",
            willChange: "transform",
          }}
          animate={{ x: ["0%", "-3%", "0%"], y: ["0%", "-2%", "0%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Fixed header pill ─────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-full"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${FAINT}`,
          boxShadow: "0 4px 20px rgba(5,5,5,0.07)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <WhaleLogo className="w-6 h-6 shrink-0" />
          <div>
            <div className="text-[10px] font-black uppercase tracking-tight" style={{ color: INK }}>
              Whale Alert Network
            </div>
            <div
              className="text-[7px] font-mono font-bold uppercase"
              style={{ color: MUTED, letterSpacing: "0.22em" }}
            >
              Blockchain Intelligence
            </div>
          </div>
        </div>
        {/* Live indicator — static dot, no pulse animation (GPU safe) */}
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: "#00C896" }}
        />
      </motion.header>

      {/* ── Content — native body scroll ─────────────────────────── */}
      <div className="relative z-10 px-4 pt-24 pb-16 max-w-lg mx-auto">

        {/* ─── HERO ─────────────────────────────────────────────── */}
        <section className="min-h-[88dvh] flex flex-col justify-center">

          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-2 mb-10">
              {["Sovereign Infrastructure", "v2.0 Production", "Open Source"].map((t) => (
                <span
                  key={t}
                  className="text-[7.5px] font-mono font-black uppercase px-3 py-1.5 rounded-full"
                  style={{
                    background: "rgba(5,5,5,0.05)",
                    border: `1px solid ${FAINT}`,
                    color: MUTED,
                    letterSpacing: "0.2em",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-8"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: `1px solid ${FAINT}`,
              }}
            >
              <ChainIcon size={36} />
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <h1
              className="font-black tracking-[-0.04em] leading-[0.84] mb-6"
              style={{ fontSize: "clamp(3rem,14vw,5rem)", color: INK }}
            >
              Whale Alert
              <br />
              <span style={{ color: "rgba(5,5,5,0.2)" }}>Network</span>
            </h1>
          </Reveal>

          <Reveal delay={0.3}>
            <p
              className="text-[14px] leading-[1.75] mb-4"
              style={{ color: MUTED }}
            >
              Sovereign-grade, real-time blockchain intelligence for detecting,
              verifying, and disseminating high-value capital movements on-chain.
            </p>
          </Reveal>

          <Reveal delay={0.38}>
            <p
              className="text-[9.5px] font-mono font-bold uppercase"
              style={{ color: "rgba(5,5,5,0.25)", letterSpacing: "0.26em" }}
            >
              Designed & engineered by a single independent developer
            </p>
          </Reveal>

          {/* Metrics strip */}
          <Reveal delay={0.48} className="mt-10">
            <div
              className="grid grid-cols-3 gap-4 px-5 py-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.85)",
                border: `1px solid ${FAINT}`,
              }}
            >
              {[
                { v: "<15ms", u: "Latency" },
                { v: "16",    u: "Networks" },
                { v: "500+",  u: "Deploys" },
              ].map(({ v, u }) => (
                <div key={u} className="text-center">
                  <div className="text-[15px] font-black font-mono" style={{ color: INK }}>{v}</div>
                  <div
                    className="text-[7px] font-mono font-bold uppercase mt-0.5"
                    style={{ color: MUTED, letterSpacing: "0.18em" }}
                  >
                    {u}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ─── ORIGIN & PHILOSOPHY ──────────────────────────────── */}
        <section className="pt-24">
          <Sep n="1" />
          <Reveal>
            <h2
              className="font-black tracking-[-0.03em] leading-[0.88] mb-8"
              style={{ fontSize: "clamp(1.9rem,8vw,2.6rem)", color: INK }}
            >
              Origin &<br />Vision
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[13.5px] leading-[1.82] mb-5" style={{ color: MUTED }}>
              The blockchain ecosystem suffers from a fundamental asymmetry of information.
              Raw ledger data is theoretically public — yet only those with institutional
              indexing infrastructure can extract actionable meaning before it becomes irrelevant.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-[13.5px] leading-[1.82] mb-10" style={{ color: MUTED }}>
              The Whale Alert Network was built to dismantle that barrier — placing the individual
              on the same informational footing as an institutional actor, with sub-15ms verified
              signal delivery and zero mock data at any layer.
            </p>
          </Reveal>

          <div className="space-y-3">
            {[
              { n: "01", title: "Zero-Mock Mandate",        body: "Every signal sourced from live blockchain state. Empty states over misleading ones at any layer." },
              { n: "02", title: "Sovereignty Principle",    body: "The server provides intelligence only. Private keys, funds, and decisions remain entirely with the user." },
              { n: "03", title: "Institutional Standard",   body: "Code quality, security posture, and UX indistinguishable from an institutional engineering organization." },
            ].map(({ n, title, body }, i) => (
              <Card key={n} delay={i * 0.08}>
                <div className="flex items-start gap-4">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: INK }}
                  >
                    <span className="text-[8px] font-mono font-black" style={{ color: IVORY, letterSpacing: "0.05em" }}>{n}</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-black mb-1.5" style={{ color: INK }}>{title}</div>
                    <div className="text-[11.5px] leading-relaxed" style={{ color: MUTED }}>{body}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── SYSTEM MODULES ───────────────────────────────────── */}
        <section className="pt-24">
          <Sep n="2" />
          <Reveal>
            <h2
              className="font-black tracking-[-0.03em] leading-[0.88] mb-4"
              style={{ fontSize: "clamp(1.9rem,8vw,2.6rem)", color: INK }}
            >
              System<br />Modules
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[13px] leading-relaxed mb-10" style={{ color: MUTED }}>
              Six intelligence modules operating in parallel across all monitored networks.
            </p>
          </Reveal>

          <div className="space-y-3">
            {MODULES.map(({ code, title, desc, stat, unit }, i) => (
              <Reveal key={code} delay={i * 0.06}>
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: `1px solid ${FAINT}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[7.5px] font-mono font-black uppercase"
                      style={{ color: MUTED, letterSpacing: "0.3em" }}
                    >
                      MOD {code}
                    </span>
                    <div className="text-right">
                      <div className="text-[13px] font-black font-mono" style={{ color: INK }}>{stat}</div>
                      <div
                        className="text-[7px] font-mono font-bold uppercase"
                        style={{ color: MUTED, letterSpacing: "0.18em" }}
                      >
                        {unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-[13px] font-black mb-2" style={{ color: INK }}>{title}</div>
                  <div className="text-[11px] leading-[1.72]" style={{ color: MUTED }}>{desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── TECHNOLOGY STACK ─────────────────────────────────── */}
        <section className="pt-24">
          <Sep n="3" />
          <Reveal>
            <h2
              className="font-black tracking-[-0.03em] leading-[0.88] mb-4"
              style={{ fontSize: "clamp(1.9rem,8vw,2.6rem)", color: INK }}
            >
              Technology<br />Stack
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[13px] leading-relaxed mb-10" style={{ color: MUTED }}>
              Every dependency selected for a specific, documented reason.
            </p>
          </Reveal>

          <div className="space-y-3">
            {STACK.map(({ cat, items }, i) => (
              <Card key={cat} delay={i * 0.07}>
                <div
                  className="text-[7.5px] font-mono font-black uppercase mb-4 pb-3"
                  style={{
                    color: MUTED,
                    letterSpacing: "0.3em",
                    borderBottom: `1px solid ${FAINT}`,
                  }}
                >
                  {cat}
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: INK }} />
                      <span className="text-[12px] font-medium" style={{ color: INK }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {/* 240Hz block */}
          <Reveal delay={0.2} className="mt-4">
            <div
              className="rounded-2xl p-7"
              style={{ background: INK }}
            >
              <div
                className="text-[7.5px] font-mono font-black uppercase mb-4"
                style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.3em" }}
              >
                Performance Contract
              </div>
              <div
                className="text-[2rem] font-black tracking-tight leading-none mb-4"
                style={{ color: IVORY }}
              >
                240Hz
              </div>
              <p
                className="text-[11.5px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                All animated elements render at native display refresh rate.
                GPU compositor layers. Only <code className="font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>transform</code> and <code className="font-mono" style={{ color: "rgba(255,255,255,0.65)" }}>opacity</code> animate — zero layout reflows, zero CPU per frame.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ─── ROADMAP ──────────────────────────────────────────── */}
        <section className="pt-24">
          <Sep n="4" />
          <Reveal>
            <h2
              className="font-black tracking-[-0.03em] leading-[0.88] mb-4"
              style={{ fontSize: "clamp(1.9rem,8vw,2.6rem)", color: INK }}
            >
              Strategic<br />Roadmap
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[13px] leading-relaxed mb-10" style={{ color: MUTED }}>
              Three phases of progressive decentralization.
            </p>
          </Reveal>

          <div className="space-y-3">
            {[
              {
                phase: "Q2 2026", title: "Phase One",
                items: ["Mass Transfer graph clustering", "World ID verification", "Sonic chain integration"],
              },
              {
                phase: "Q3 2026", title: "Phase Two",
                items: ["EigenLayer AVS signal validation", "Threshold signature consensus", "Decentralized sentinel registry"],
              },
              {
                phase: "2027+", title: "Phase Three",
                items: ["Purpose-built telemetry L1", "100ms block time target", "On-chain governance"],
              },
            ].map(({ phase, title, items }, i) => (
              <Reveal key={phase} delay={i * 0.07}>
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: `1px solid ${FAINT}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <span
                      className="text-[7px] font-mono font-black uppercase px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(5,5,5,0.05)", color: MUTED, letterSpacing: "0.2em" }}
                    >
                      {phase}
                    </span>
                    <span className="text-[13px] font-black" style={{ color: INK }}>{title}</span>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full mt-[6px] shrink-0" style={{ background: INK }} />
                        <span className="text-[11.5px] leading-relaxed" style={{ color: MUTED }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── FOOTER ───────────────────────────────────────────── */}
        <section className="pt-24 pb-8">
          <Reveal className="text-center">
            <ChainIcon size={40} />
          </Reveal>
          <Reveal delay={0.1} className="text-center mt-6 mb-4">
            <h2
              className="font-black tracking-[-0.03em] leading-[0.88]"
              style={{ fontSize: "clamp(1.6rem,7vw,2.2rem)", color: INK }}
            >
              Every signal verified.<br />
              Every movement recorded.
            </h2>
          </Reveal>
          <Reveal delay={0.18} className="text-center mb-10">
            <p className="text-[12px] leading-relaxed" style={{ color: MUTED }}>
              Open-source sovereign intelligence layer. One developer.
            </p>
          </Reveal>

          {/* Links — tap targets, no button elements */}
          <Reveal delay={0.24}>
            <div className="flex justify-center gap-5 flex-wrap">
              {[
                { label: "humanidfi.com",  href: "https://humanidfi.com" },
                { label: "GitHub",         href: "https://github.com/atfortyseven-creations/whalecosystem" },
                { label: "Support",        href: "https://humanidfi.com/sovereign-support" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] font-mono font-bold uppercase"
                  style={{ color: MUTED, letterSpacing: "0.22em", WebkitTapHighlightColor: "transparent" }}
                >
                  {label}
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3} className="mt-8 text-center">
            <p
              className="text-[8px] font-mono font-bold uppercase"
              style={{ color: "rgba(5,5,5,0.18)", letterSpacing: "0.22em" }}
            >
              © 2026 atfortyseven-creations · All rights reserved
            </p>
          </Reveal>
        </section>

      </div>{/* /content */}
    </div>
  );
}
