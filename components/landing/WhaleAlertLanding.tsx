"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Database, Shield, Binary, Activity,
  Zap, Lock, Globe, ArrowRight, Github, Twitter, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { UltraFluidSection, UltraFluidLayer } from "./UltraFluidEngine";
import { ScrollFloat } from "@/components/ui/ScrollFloat";
import { CelestialMeshBackground } from "./CelestialMeshBackground";

const DynamicCryptoCheckoutModal = dynamic(
  () => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal),
  { ssr: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Internal constants
// ─────────────────────────────────────────────────────────────────────────────

const INSTITUTIONAL_IVORY = "#FAF9F6";
const INSTITUTIONAL_INK   = "#050505";
const SIGNAL_TEAL         = "#00F2EA";

// ─────────────────────────────────────────────────────────────────────────────
// Reveal wrapper — unified spring entrance
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
  yOffset = 28,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Live data ticker
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_FALLBACK = [
  "DATA FEED ACTIVE",
  "ZK PROOF VERIFIED",
  "WHALE MOVEMENT DETECTED",
  "NETWORK STATUS: SECURE",
  "NODE LATENCY: <15ms",
  "MEMPOOL: MONITORING",
  "ON-CHAIN CAPTURE ACTIVE",
  "L2 NETWORKS: SYNCED",
];

function DataTicker() {
  const { data } = useSWR(
    "/api/network/live-ticker",
    (url) => fetch(url).then((r) => r.json()),
    { fallbackData: { ticker: TICKER_FALLBACK }, refreshInterval: 5000 }
  );
  const tData  = data?.ticker || TICKER_FALLBACK;
  const content = [...tData, ...tData, ...tData];

  return (
    <div
      className="relative w-full border-y overflow-hidden py-3.5"
      style={{
        borderColor: "rgba(0,0,0,0.05)",
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        className="flex gap-20 will-change-transform w-max"
        animate={{ x: [0, -2000] }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        {content.map((item: string, i: number) => (
          <span
            key={i}
            className="text-[10px] font-mono font-bold uppercase flex items-center gap-3"
            style={{ color: "rgba(0,0,0,0.25)", letterSpacing: "0.35em" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: SIGNAL_TEAL, boxShadow: `0 0 8px ${SIGNAL_TEAL}60` }}
            />
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Feature cards data
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    level: "01",
    title: "Real-Time Intelligence",
    desc: "Priority fee monitoring on Solana and L1/L2 EVM mempool capture with sub-15ms latency.",
    icon: Activity,
  },
  {
    level: "02",
    title: "Sovereign Mesh Protocol",
    desc: "Encoded P2P data propagation with ZK-proven signal authenticity and ECDSA verification.",
    icon: Shield,
  },
  {
    level: "03",
    title: "Capital Movement Tracker",
    desc: "Automated forensic analysis of movement in deep-cold wallets. Zero false positives.",
    icon: Globe,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function WhaleAlertLanding() {
  const router               = useRouter();
  const { address }          = useSovereignAccount();
  const [showGate, setShowGate] = useState(false);

  const handleEntry = () => {
    if (address) router.push("/dashboard");
    else setShowGate(true);
  };

  return (
    <main
      className="relative min-h-screen overflow-x-hidden selection:bg-[#00F2EA]/30"
      style={{ backgroundColor: INSTITUTIONAL_IVORY, color: INSTITUTIONAL_INK }}
    >
      {/* ── GLOBAL BACKGROUND — fixed behind all content ─────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CelestialMeshBackground
          waveOpacity={0.85}
          patternOpacity={0.055}
          gradientOpacity={0.9}
        />
      </div>

      {/* ── NAVIGATION ───────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center"
        style={{
          background: "linear-gradient(to bottom, rgba(250,249,246,0.88) 0%, transparent 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3.5 cursor-pointer group">
          <WhaleLogo className="w-9 h-9 transition-transform duration-300 group-hover:scale-110" />
          <div className="flex flex-col leading-none">
            <span
              className="text-[13px] font-black tracking-[-0.03em] uppercase"
              style={{ color: INSTITUTIONAL_INK }}
            >
              Whale Alert Network
            </span>
            <span
              className="text-[8.5px] font-mono font-bold uppercase mt-1"
              style={{ color: "rgba(0,0,0,0.3)", letterSpacing: "0.28em" }}
            >
              Institutional Hub
            </span>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <span
              className="text-[9px] font-mono font-black flex items-center gap-1.5"
              style={{ color: SIGNAL_TEAL, letterSpacing: "0.2em" }}
            >
              <span
                className="w-1 h-1 rounded-full animate-pulse"
                style={{ background: SIGNAL_TEAL }}
              />
              NETWORK SYNCED: 99.9%
            </span>
            <span
              className="text-[9px] font-mono font-bold uppercase"
              style={{ color: "rgba(0,0,0,0.2)", letterSpacing: "0.15em" }}
            >
              TERMINAL AUTH: [SOVEREIGN]
            </span>
          </div>

          <button
            onClick={handleEntry}
            className="text-[10.5px] font-mono font-black uppercase transition-all"
            style={{
              color: "rgba(0,0,0,0.45)",
              letterSpacing: "0.18em",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = INSTITUTIONAL_INK)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "rgba(0,0,0,0.45)")}
          >
            {address ? "Open Terminal →" : "Connect Wallet →"}
          </button>

          <div className="h-3.5 w-px" style={{ background: "rgba(0,0,0,0.12)" }} />

          <div className="flex gap-4">
            <Github
              size={17}
              className="cursor-pointer transition-all"
              style={{ color: "rgba(0,0,0,0.2)" }}
              onMouseEnter={(e) => ((e.currentTarget as SVGSVGElement).style.color = INSTITUTIONAL_INK)}
              onMouseLeave={(e) => ((e.currentTarget as SVGSVGElement).style.color = "rgba(0,0,0,0.2)")}
            />
            <Twitter
              size={17}
              className="cursor-pointer transition-all"
              style={{ color: "rgba(0,0,0,0.2)" }}
              onMouseEnter={(e) => ((e.currentTarget as SVGSVGElement).style.color = INSTITUTIONAL_INK)}
              onMouseLeave={(e) => ((e.currentTarget as SVGSVGElement).style.color = "rgba(0,0,0,0.2)")}
            />
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <UltraFluidSection className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-32 px-6 overflow-visible z-10">
        {({ y, opacity, scale }) => (
          <UltraFluidLayer
            style={{ y, opacity, scale }}
            className="flex flex-col items-center text-center max-w-6xl"
          >
            {/* Status badge */}
            <Reveal delay={0.15}>
              <div
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-12"
                style={{
                  background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: SIGNAL_TEAL, boxShadow: `0 0 10px ${SIGNAL_TEAL}50` }}
                />
                <span
                  className="text-[9.5px] font-mono font-black uppercase"
                  style={{ color: "rgba(0,0,0,0.55)", letterSpacing: "0.25em" }}
                >
                  Institutional Feed Active
                </span>
              </div>
            </Reveal>

            {/* Headline */}
            <ScrollFloat
              containerClassName="mb-14"
              textClassName="text-[4.5rem] md:text-[7.5rem] lg:text-[10.5rem] tracking-[-0.04em] leading-[0.82]"
              animationDuration={1.5}
              stagger={0.055}
            >
              SOVEREIGN TERMINAL
            </ScrollFloat>

            {/* Subline */}
            <Reveal delay={0.45}>
              <p
                className="text-base md:text-lg max-w-2xl leading-relaxed mb-16 font-light"
                style={{ color: "rgba(0,0,0,0.38)", letterSpacing: "0.01em" }}
              >
                The market is not a product of observation; it is a consequence of structured
                analysis. Every signal is sourced directly from the mempool—verified on-chain,
                processed at sub-15ms latency.
              </p>
            </Reveal>

            {/* CTA pair */}
            <Reveal delay={0.65}>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleEntry}
                  className="group relative px-10 py-5 font-black uppercase rounded-full overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: INSTITUTIONAL_INK,
                    color: "#fff",
                    letterSpacing: "0.22em",
                    fontSize: "10.5px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(135deg, ${SIGNAL_TEAL}22, transparent)` }}
                  />
                  Connect Wallet
                </button>
                <button
                  className="px-10 py-5 font-black uppercase rounded-full transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(0,0,0,0.12)",
                    color: "rgba(0,0,0,0.55)",
                    letterSpacing: "0.22em",
                    fontSize: "10.5px",
                  }}
                >
                  Network Protocol
                </button>
              </div>
            </Reveal>
          </UltraFluidLayer>
        )}
      </UltraFluidSection>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <DataTicker />
      </div>

      {/* ── FEATURES SECTION ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-40 border-t" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-24 items-center">

          {/* Left: title + feature cards */}
          <div>
            <Reveal>
              <ScrollFloat
                scrollStart="top bottom"
                scrollEnd="bottom center"
                textClassName="text-4xl md:text-6xl leading-tight mb-16"
              >
                WHALE ALERT NETWORK
              </ScrollFloat>
            </Reveal>

            <div className="space-y-5">
              {FEATURES.map(({ level, title, desc, icon: Icon }, i) => (
                <Reveal key={level} delay={0.1 * i}>
                  <div
                    className="group p-7 rounded-3xl transition-all hover:scale-[1.015]"
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
                    }}
                  >
                    <h4
                      className="text-[15px] font-black mb-2 flex items-center gap-3.5"
                      style={{ color: INSTITUTIONAL_INK }}
                    >
                      <span
                        className="text-[9px] font-mono font-black px-2 py-0.5 rounded"
                        style={{
                          background: INSTITUTIONAL_INK,
                          color: SIGNAL_TEAL,
                          letterSpacing: "0.15em",
                        }}
                      >
                        LVL {level}
                      </span>
                      {title}
                    </h4>
                    <p
                      className="text-[12.5px] leading-relaxed font-medium"
                      style={{ color: "rgba(0,0,0,0.45)" }}
                    >
                      {desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: live system status card */}
          <Reveal delay={0.2}>
            <div className="relative aspect-square max-w-[480px] mx-auto">
              <div
                className="absolute inset-0 rounded-full blur-[100px] animate-pulse"
                style={{ background: `${SIGNAL_TEAL}18` }}
              />
              <div
                className="relative h-full w-full rounded-[3.5rem] overflow-hidden p-10 flex flex-col justify-between"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.06)",
                }}
              >
                {/* Pattern overlay inside card */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-multiply"
                  style={{
                    backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
                    backgroundSize: "300px auto",
                    opacity: 0.04,
                  }}
                />

                <div className="relative z-10 flex flex-col gap-8 h-full">
                  <div className="flex items-center justify-between">
                    <Activity
                      className="w-10 h-10"
                      style={{ color: SIGNAL_TEAL }}
                    />
                    <span
                      className="text-[8.5px] font-mono font-black uppercase"
                      style={{ color: "rgba(0,0,0,0.2)", letterSpacing: "0.3em" }}
                    >
                      Live Feed
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-5">
                    {[100, 75, 55].map((width, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ width: `${width}%`, background: "rgba(0,0,0,0.06)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: i === 0 ? SIGNAL_TEAL : "rgba(0,0,0,0.15)" }}
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Networks", value: "14" },
                      { label: "Latency",  value: "<15ms" },
                      { label: "Uptime",   value: "99.9%" },
                    ].map(({ label, value }) => (
                      <div key={label} className="text-center">
                        <div
                          className="text-xl font-black font-mono"
                          style={{ color: INSTITUTIONAL_INK }}
                        >
                          {value}
                        </div>
                        <div
                          className="text-[8px] font-mono font-black uppercase mt-1"
                          style={{ color: "rgba(0,0,0,0.25)", letterSpacing: "0.2em" }}
                        >
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="text-[9px] font-mono font-black uppercase text-center"
                    style={{ color: "rgba(0,0,0,0.15)", letterSpacing: "0.3em" }}
                  >
                    System Active · Zero Trust
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── LOGAN VOSS IMMERSION SECTION ─────────────────────────────────── */}
      {/*
       * Full-bleed photographic section — logan-voss-VTWMWadBMvM-unsplash.jpg
       * Technique: position relative, overflow hidden, img object-cover behind
       * a 0.72 dark overlay. All text and buttons are white for maximum legibility.
       * No mix-blend weirdness — pure layering via z-index.
       */}
      <section
        className="relative z-10 overflow-hidden hz-240"
        style={{ minHeight: "85vh" }}
      >
        {/* ── FUSION BLEND — top edge fades FROM ivory to photo ── */}
        <div className="section-blend-top" />

        {/* ── FUSION BLEND — bottom edge fades FROM photo back to ivory ── */}
        <div className="section-blend-bottom" />

        {/* Background photograph — full cover, GPU composited */}
        <img
          src="/models/update/logan-voss-VTWMWadBMvM-unsplash.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full hz-240-image"
          style={{
            objectFit: "cover",
            objectPosition: "center 30%",
          }}
        />

        {/* Dark overlay — strong enough to guarantee contrast, not total blackout */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,5,5,0.62) 0%, rgba(5,5,5,0.80) 50%, rgba(5,5,5,0.92) 100%)",
          }}
        />

        {/* Subtle patron cosmico over dark bg — ultra-low opacity */}
        <div
          className="absolute inset-0 mix-blend-screen pointer-events-none"
          style={{
            backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
            backgroundSize: "clamp(200px, 18vw, 360px) auto",
            backgroundRepeat: "repeat",
            opacity: 0.04,
          }}
        />

        {/* Content — all white */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 flex flex-col items-center text-center">

          {/* Eyebrow badge */}
          <Reveal delay={0.1}>
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-14"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: SIGNAL_TEAL, boxShadow: `0 0 10px ${SIGNAL_TEAL}60` }}
              />
              <span
                className="text-[9.5px] font-mono font-black uppercase"
                style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.25em" }}
              >
                Institutional Capital Intelligence
              </span>
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.2}>
            <h2
              className="text-[3rem] md:text-[5.5rem] lg:text-[7rem] font-black uppercase tracking-[-0.04em] leading-[0.88] text-white mb-8"
            >
              WHERE CAPITAL
              <br />
              MOVES FIRST
            </h2>
          </Reveal>

          {/* Subline */}
          <Reveal delay={0.35}>
            <p
              className="max-w-2xl mb-20 text-[14px] md:text-[16px] leading-relaxed font-light"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Before a price moves, capital moves. The Sovereign Terminal captures
              every institutional signal at the mempool layer — verified cryptographically,
              propagated in under 15 milliseconds.
            </p>
          </Reveal>

          {/* Stats grid — 4 data points over the photograph */}
          <Reveal delay={0.45} className="w-full mb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "$2.4B+", label: "Largest single\ntransaction recorded" },
                { value: "<15ms", label: "Mempool signal\nlatency" },
                { value: "16 chains", label: "Multi-chain EVM\n+ Solana coverage" },
                { value: "4.8σ", label: "Peak Z-score\ndeviation detected" },
              ].map(({ value, label }) => (
                <div
                  key={value}
                  className="p-6 rounded-2xl text-center"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div
                    className="text-2xl md:text-3xl font-black font-mono mb-2"
                    style={{ color: SIGNAL_TEAL }}
                  >
                    {value}
                  </div>
                  <div
                    className="text-[9.5px] font-bold uppercase leading-tight whitespace-pre-line"
                    style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* White CTA buttons */}
          <Reveal delay={0.55}>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleEntry}
                className="group relative px-10 py-5 font-black uppercase rounded-full overflow-hidden transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: "#fff",
                  color: INSTITUTIONAL_INK,
                  letterSpacing: "0.22em",
                  fontSize: "10.5px",
                  boxShadow: "0 20px 50px rgba(255,255,255,0.15)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                  style={{ background: "rgba(0,242,234,0.12)" }}
                />
                Open Terminal
              </button>

              <button
                className="px-10 py-5 font-black uppercase rounded-full transition-all hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.22em",
                  fontSize: "10.5px",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
              >
                View Akashic Ledger
              </button>
            </div>
          </Reveal>

          {/* Fine print */}
          <Reveal delay={0.65}>
            <p
              className="mt-14 text-[9px] font-mono uppercase"
              style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.35em" }}
            >
              Zero-knowledge verified · Non-custodial · EIP-1193 Sovereign Vault
            </p>
          </Reveal>
        </div>
      </section>

      <section
        className="relative z-10 min-h-[80vh] flex flex-col items-center justify-center p-6 border-t"
        style={{ borderColor: "rgba(0,0,0,0.04)" }}
      >
        <Reveal className="text-center">
          <WhaleLogo className="w-20 h-20 mx-auto mb-14 animate-float" />
          <ScrollFloat textClassName="text-5xl md:text-8xl mb-8">
            SECURE ACCESS
          </ScrollFloat>
          <p
            className="max-w-lg mx-auto mb-14 text-[11.5px] leading-loose uppercase"
            style={{
              color: "rgba(0,0,0,0.32)",
              letterSpacing: "0.1em",
            }}
          >
            Permissionless authentication. Hardened security. Your data is
            encrypted locally. Zero persistence of sensitive session tokens.
          </p>
          <button
            onClick={handleEntry}
            className="px-8 py-3 font-black uppercase rounded-full transition-all hover:scale-105 active:scale-95"
            style={{
              background: SIGNAL_TEAL,
              color: INSTITUTIONAL_INK,
              fontSize: "10px",
              letterSpacing: "0.2em",
              boxShadow: `0 0 30px ${SIGNAL_TEAL}40`,
            }}
          >
            Connect Wallet
          </button>
        </Reveal>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="relative z-10 px-8 py-20 border-t"
        style={{
          borderColor: "rgba(0,0,0,0.05)",
          background: "rgba(255,255,255,0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-5">
            <WhaleLogo className="w-6 h-6 opacity-30" />
            <p
              className="text-[10px] font-mono uppercase"
              style={{ color: "rgba(0,0,0,0.25)", letterSpacing: "0.2em" }}
            >
              © 2026 Sovereign Network Technology.
              <br />
              All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <span
              className="text-[10px] font-mono font-black uppercase"
              style={{ color: "rgba(0,0,0,0.4)", letterSpacing: "0.2em" }}
            >
              Operational status
            </span>
            {["All systems nominal", "Institutional Protocol Active"].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: SIGNAL_TEAL }}
                />
                <span
                  className="text-[10px] font-mono uppercase"
                  style={{ color: "rgba(0,0,0,0.25)", letterSpacing: "0.15em" }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex flex-col gap-4 md:items-end"
            style={{ color: "rgba(0,0,0,0.25)" }}
          >
            <span
              className="text-[10px] font-mono uppercase"
              style={{ letterSpacing: "0.2em" }}
            >
              Terminal Build 777-X
            </span>
            <p className="text-[10px] font-mono uppercase" style={{ letterSpacing: "0.1em" }}>
              Hash: 0x8f2d…5e9a
            </p>
          </div>
        </div>
      </footer>

      {/* ── GATE MODAL ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showGate && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGate(false)}
              className="absolute inset-0"
              style={{ background: "rgba(250,249,246,0.85)", backdropFilter: "blur(24px)" }}
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-[3.5rem] overflow-hidden"
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 60px 120px rgba(0,0,0,0.1)",
              }}
            >
              {/* Pattern on modal */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply"
                style={{
                  backgroundImage: "url('/api/checkpoint-image?name=patron-cosmico-4k.png')",
                  backgroundSize: "300px auto",
                  opacity: 0.025,
                }}
              />

              <div className="relative z-10 p-12 md:p-16 flex flex-col items-center text-center">
                {/* Close */}
                <button
                  onClick={() => setShowGate(false)}
                  className="absolute top-8 right-8 w-9 h-9 flex items-center justify-center rounded-full transition-all"
                  style={{ background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.35)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.1)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.06)")}
                >
                  <X size={15} />
                </button>

                {/* Logo icon */}
                <div
                  className="w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10"
                  style={{ background: INSTITUTIONAL_INK }}
                >
                  <WhaleLogo className="w-12 h-12" color="#fff" />
                </div>

                <h2
                  className="text-3xl font-black uppercase tracking-tight mb-5"
                  style={{ color: INSTITUTIONAL_INK }}
                >
                  Sovereign Handshake
                </h2>

                <p
                  className="text-[11px] font-mono leading-relaxed uppercase mb-4"
                  style={{ color: "rgba(0,0,0,0.35)", letterSpacing: "0.1em" }}
                >
                  Verify ownership via a gasless cryptographic signature.
                  <br />
                  Institutional-grade encryption protocol active.
                </p>

                <div
                  className="w-full p-4 rounded-2xl mb-12 text-[9px] font-mono font-black uppercase"
                  style={{
                    background: "rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    color: "rgba(0,0,0,0.3)",
                    letterSpacing: "0.3em",
                  }}
                >
                  IDENTITY MASKING STATUS: [0xVERIFIED]
                </div>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="group relative w-full py-6 font-black uppercase rounded-[2rem] transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                  style={{
                    background: INSTITUTIONAL_INK,
                    color: "#fff",
                    fontSize: "11px",
                    letterSpacing: "0.35em",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: `linear-gradient(135deg, ${SIGNAL_TEAL}30, transparent)` }}
                  />
                  Connect Wallet
                </button>

                <p
                  className="mt-8 text-[8.5px] font-mono font-black uppercase"
                  style={{ color: "rgba(0,0,0,0.18)", letterSpacing: "0.5em" }}
                >
                  HumanID Digital Signature Required
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
