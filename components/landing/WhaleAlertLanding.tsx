"use client";

import React, {
  useRef, useEffect, useState, useCallback, useMemo
} from "react";
import {
  motion, useScroll, useTransform, useSpring,
  useInView, AnimatePresence, useMotionValue, useVelocity
} from "framer-motion";
import {
  BookOpen, Network, Shield, Database,
  Cpu, ArrowRight, Lock, Zap, Eye, Globe, Activity
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useUIStore } from "@/lib/store/ui-store";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


const DynamicCryptoCheckoutModal = dynamic(
  () => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal),
  { ssr: false }
);
const DynamicLegendaryCursor = dynamic(
  () => import("@/components/landing/LegendaryCursor").then((m) => m.LegendaryCursor),
  { ssr: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// LENIS SMOOTH SCROLL — 240hz capability with spring physics
// ─────────────────────────────────────────────────────────────────────────────
function useLenis() {
  useEffect(() => {
    let lenis: any = null;
    let raf: number;

    (async () => {
      try {
        const { default: Lenis } = await import("lenis");
        lenis = new Lenis({
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          touchMultiplier: 2.2,
          infinite: false,
        });

        const animate = (time: number) => {
          lenis?.raf(time);
          raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);

        // Connect Lenis ↔ GSAP ScrollTrigger
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time: number) => { lenis?.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } catch {
        // Lenis unavailable — degrade gracefully
      }
    })();

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION REVEAL — GSAP-powered cinematic entrance
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  className = "",
  yOffset = 70,
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-6%" });

  const initial =
    direction === "left"  ? { opacity: 0, x: -yOffset, y: 0, filter: "blur(12px)" }
    : direction === "right" ? { opacity: 0, x: yOffset,  y: 0, filter: "blur(12px)" }
    : { opacity: 0, x: 0, y: yOffset, filter: "blur(10px)" };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView
        ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" }
        : initial
      }
      transition={{
        type: "spring", stiffness: 50, damping: 20, mass: 1.2,
        delay, opacity: { duration: 0.8 },
        filter: { duration: 0.9 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE TICKER
// ─────────────────────────────────────────────────────────────────────────────
const TICKER = [
  "BTC: $83,241 ▲1.2%", "ETH: $3,812 ▼0.8%",
  "⚠ WHALE: 14,200 ETH DETECTED", "SOL: $182 ▲3.1%",
  "DARK POOL: $280M BTC", "99.99% Uptime",
  "Whales Tracked: 1,247", "24h Volume: $4.2B",
  "⚠ WHALE: 8,900 BTC DETECTED", "Fear/Greed: 74 GREED",
];

function DataTicker() {
  const content = [...TICKER, ...TICKER, ...TICKER];
  return (
    <div className="relative w-full overflow-hidden border-y" style={{ borderColor: "rgba(5,5,5,0.04)" }}>
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg,#FBC9C2,transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg,#FBC9C2,transparent)" }} />
      <motion.div
        className="flex gap-14 py-3 will-change-transform"
        style={{ width: "max-content" }}
        animate={{ x: [0, -3200] }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        {content.map((item, i) => (
          <span key={i}
            className="text-[8.5px] font-mono uppercase tracking-[0.28em] whitespace-nowrap"
            style={{ color: item.startsWith("⚠") ? "#D4AF37" : "rgba(5,5,5,0.28)" }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOW CARD
// ─────────────────────────────────────────────────────────────────────────────
function GlowCard({
  icon, title, desc, delay = 0, direction = "up", color = "#1a6de0",
}: {
  icon: React.ReactNode; title: string; desc: string;
  delay?: number; direction?: "up" | "left" | "right"; color?: string;
}) {
  const [hovered, setHov] = useState(false);
  return (
    <Reveal delay={delay} direction={direction}>
      <motion.div
        onHoverStart={() => setHov(true)}
        onHoverEnd={() => setHov(false)}
        animate={{ y: hovered ? -6 : 0, scale: hovered ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="relative rounded-2xl p-9 md:p-11 overflow-hidden cursor-default"
        style={{
          background: hovered
            ? `radial-gradient(ellipse 80% 60% at 20% 20%, ${color}0a, rgba(5,5,5,0.015))`
            : "rgba(5,5,5,0.018)",
          border: `1px solid ${hovered ? color + "35" : "rgba(5,5,5,0.06)"}`,
          boxShadow: hovered
            ? `0 0 80px ${color}18, 0 24px 72px rgba(0,0,0,0.5)`
            : "0 8px 40px rgba(0,0,0,0.3)",
          transition: "border-color 0.5s, box-shadow 0.5s, background 0.5s",
        }}
      >
        {/* Animated sweep light */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          style={{
            background: `linear-gradient(135deg, ${color}08, transparent 60%)`,
          }}
        />

        <div className="inline-flex p-3.5 rounded-xl mb-6"
          style={{ background: `${color}10`, border: `1px solid ${color}1a` }}>
          <span style={{ color }}>{icon}</span>
        </div>

        <h3 className="text-xl md:text-2xl font-light mb-4 leading-snug" style={{ color: "#050505" }}>
          {title}
        </h3>
        <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(5,5,5,0.35)" }}>
          {desc}
        </p>

        {/* Bottom glimmer */}
        <motion.div
          className="absolute bottom-0 left-0 h-[1px] w-full"
          style={{ background: `linear-gradient(90deg,transparent,${color},transparent)` }}
          animate={{ opacity: hovered ? 1 : 0, scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.45 }}
        />
      </motion.div>
    </Reveal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURE & MODULES DATA
// ─────────────────────────────────────────────────────────────────────────────
const PILLARS = [
  { icon: <Cpu size={20} strokeWidth={1.5} />, color: "#1a6de0",
    title: "In-Memory Kinetic Ingestion",
    desc: "The system bypasses intermediate abstractions, processing base-layer events directly in RAM matrices. This structure allows evaluating stochastic deviations with mathematical rigor." },
  { icon: <Lock size={20} strokeWidth={1.5} />, color: "#D4AF37",
    title: "Conditional Cryptographic Boundary",
    desc: "We rest the architecture on the uncompromising principle of Zero-Trust. The protocol fully delegates cryptographic computation to the client under strictly E2EE norms." },
  { icon: <Network size={20} strokeWidth={1.5} />, color: "#00d4ff",
    title: "Multi-layer Graph Indexing",
    desc: "Unification of directed computational graphs originating from independent instances. We formulate state trees that reduce algorithmic complexity in real-time." },
  { icon: <Shield size={20} strokeWidth={1.5} />, color: "#9333ea",
    title: "Integrity & Compliance",
    desc: "We incorporate Zero-Knowledge validation layers to maintain adherence to international regulatory frameworks without compromising ontological data sovereignty." },
];

const MODULES = [
  {
    category: "Ingestion Layer", color: "#1a6de0",
    title: "Institutional Flow Detector",
    description: "A deterministic algorithm structurally designed to monitor Ethereum Virtual Machine subroutines and Hyperliquid L1. It analyzes absolute volume and deciphers financial organization paradigms via objective heuristics.",
    points: ["Raw block parsing", "Z-Score processing for anomalies", "Non-blocking asynchronous filters"],
  },
  {
    category: "Representation Layer", color: "#00d4ff",
    title: "Integrated Protocol Matrix",
    description: "A rigidly structured terminal engineered to visualize the synthesis of extracted data. It presents an austere interface, intentionally devoid of ornamental metrics, focusing on technical veracity.",
    points: ["Dark liquidity intersection (CLOB)", "EIP-712 signature aggregation", "Relational database persistence"],
  },
];

const FEATURES = [
  { icon: <Eye size={18} />,      label: "Real-time Whale Detection", color: "#1a6de0" },
  { icon: <Zap size={18} />,      label: "Dark Pool Signals",         color: "#D4AF37" },
  { icon: <Globe size={18} />,    label: "24 Chain Coverage",         color: "#00d4ff" },
  { icon: <Shield size={18} />,   label: "ZK-Proof Privacy",          color: "#9333ea" },
  { icon: <Activity size={18} />, label: "AI Flow Analysis",          color: "#00C076" },
  { icon: <Network size={18} />,  label: "Mempool Intelligence",      color: "#f97316" },
  { icon: <Database size={18} />, label: "Sovereign Data Layer",      color: "#ec4899" },
  { icon: <Cpu size={18} />,      label: "EVM Thermodynamics",        color: "#1a6de0" },
];

// ─────────────────────────────────────────────────────────────────────────────
// STAT COUNTER
// ─────────────────────────────────────────────────────────────────────────────
function StatBlock({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className="flex flex-col items-center md:items-start"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 60, damping: 18 }}>
      <span className="text-[9px] font-mono uppercase tracking-[0.4em] mb-1.5"
        style={{ color: "rgba(5,5,5,0.28)" }}>{label}</span>
      <span className="text-3xl md:text-4xl font-light tracking-tight"
        style={{ color: "rgba(5,5,5,0.9)" }}>{value}</span>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export function WhaleAlertLanding() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const heroRef       = useRef<HTMLDivElement>(null);
  const globeWrapRef  = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { isConnected } = useSovereignAccount();
  const { openConnectModal } = useUIStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const [mouse, setMouse] = useState<[number, number]>([0, 0]);

  // Lenis smooth scroll
  useLenis();

  // Scroll progress for globe explosion
  const { scrollYProgress: heroScrollProg } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const explodeSpring = useSpring(heroScrollProg, { stiffness: 80, damping: 30 });
  const [explodeVal, setExplodeVal] = useState(0);

  useEffect(() => {
    const unsub = explodeSpring.on("change", (v) => setExplodeVal(Math.min(1, Math.max(0, v * 2.2))));
    return unsub;
  }, [explodeSpring]);

  // Cinematic hero parallax
  const heroOpacity = useTransform(heroScrollProg, [0, 0.7], [1, 0]);
  const heroY       = useTransform(heroScrollProg, [0, 0.7], [0, 100]);
  const heroBlur    = useTransform(heroScrollProg, [0, 0.5], [0, 16]);
  const heroScale   = useTransform(heroScrollProg, [0, 0.7], [1, 0.9]);

  // Mouse parallax
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouse([
      (e.clientX / window.innerWidth - 0.5) * 2,
      -(e.clientY / window.innerHeight - 0.5) * 2,
    ]);
  }, []);

  const handleEntry = useCallback(() => {
    if (isConnected) router.push("/vip");
    else openConnectModal();
  }, [isConnected, router, openConnectModal]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ backgroundColor: "transparent", color: "#050505", minHeight: "100vh" }}
      className="relative w-full overflow-x-hidden font-sans selection:bg-[#FBC9C2]/25"
    >


      <DynamicLegendaryCursor />

      {/* ─────────────────────────────────────────────────────────────── */}
      {/*  HERO                                                           */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ minHeight: "100vh", zIndex: 10 }}
      >
        {/* Subtle radial nebula */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(10,40,100,0.18) 0%, transparent 70%)",
        }} />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY, scale: heroScale,
            filter: useTransform(heroBlur, (v) => `blur(${v}px)`) }}
          className="relative w-full flex flex-col items-center px-6"
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="flex items-center gap-2.5 mb-9 px-4 py-1.5 rounded-full"
            style={{ background: "rgba(5,5,5,0.04)", border: "1px solid rgba(5,5,5,0.08)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#00C076", boxShadow: "0 0 8px #00C076" }} />
            <span className="text-[8.5px] font-mono tracking-[0.5em] uppercase text-black/50">
              Institutional Intelligence — Live
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 45, damping: 18 }}
            className="text-center mb-5 leading-[1.03]"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(2.8rem, 8vw, 7.5rem)",
              fontWeight: 300, letterSpacing: "-0.025em", color: "#050505",
              maxWidth: "900px",
            }}
          >
            Track the world&rsquo;s{" "}
            <span style={{
              background: "linear-gradient(135deg, #1a6de0 20%, #00d4ff 55%, #D4AF37 90%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              largest whales.
            </span>
            <br />In real time.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95, duration: 1.1 }}
            className="text-center text-base md:text-lg font-light mb-11"
            style={{ color: "rgba(5,5,5,0.7)", maxWidth: "540px", lineHeight: 1.7 }}
          >
            Financial observation architecture built on cryptography, asynchronous
            macro-analysis, and institutional-grade signal engineering.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.8 }}
            className="flex flex-wrap gap-4 items-center justify-center mb-16"
          >
            <motion.button
              onClick={handleEntry}
              whileHover={{ scale: 1.06, boxShadow: "0 0 60px rgba(26,109,224,0.45), 0 12px 40px rgba(0,0,0,0.5)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="flex items-center gap-2.5 px-9 py-4 rounded-full text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg,#1a6de0,#0047cc)",
                color: "#ffffff",
                boxShadow: "0 0 35px rgba(26,109,224,0.3), 0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <BookOpen size={15} strokeWidth={2} />
              Access the Terminal
            </motion.button>

            <motion.button
              onClick={() => setShowCheckout(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-9 py-4 rounded-full text-sm font-medium transition-all"
              style={{ border: "1px solid rgba(212,175,55,0.28)", color: "#D4AF37", background: "rgba(212,175,55,0.04)" }}
            >
              Acquire License
            </motion.button>
          </motion.div>

          {/* Live stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.9 }}
            className="flex flex-wrap justify-center items-center gap-x-14 gap-y-6 mt-14 px-4"
          >
            {[
              { value: "$4.2B",  label: "24h Volume" },
              { value: "1,247",  label: "Whales Tracked" },
              { value: "24",     label: "Chains" },
              { value: "99.99%", label: "Uptime" },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="hidden md:block w-px h-8 bg-black/10" />}
                <StatBlock value={s.value} label={s.label} />
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll arrow */}
        <motion.div
          className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}
        >
          <span className="text-[7.5px] font-mono tracking-[0.5em] uppercase text-black/40">
            Scroll to Explore
          </span>
          <motion.div
            className="w-[1px] h-12"
            style={{ background: "linear-gradient(180deg, rgba(26,109,224,0.8), transparent)" }}
            animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* TICKER */}
      <div className="relative z-10"><DataTicker /></div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/*  CAPABILITIES GRID                                              */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-28"
        style={{ borderTop: "1px solid rgba(5,5,5,0.03)" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <Reveal>
            <p className="text-center text-[8.5px] font-mono uppercase tracking-[0.55em] mb-12"
              style={{ color: "rgba(5,5,5,0.2)" }}>
              — Capabilities
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.06} yOffset={24}>
                <motion.div
                  whileHover={{ y: -5, scale: 1.04,
                    boxShadow: `0 12px 40px ${f.color}18, 0 0 0 1px ${f.color}28` }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-start gap-3 p-5 rounded-xl cursor-default"
                  style={{ background: "rgba(5,5,5,0.018)", border: "1px solid rgba(5,5,5,0.05)" }}
                >
                  <span style={{ color: f.color }}>{f.icon}</span>
                  <span className="text-[11px] font-medium leading-snug" style={{ color: "rgba(5,5,5,0.55)" }}>
                    {f.label}
                  </span>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/*  ARCHITECTURE                                                    */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-40 px-6 md:px-12"
        style={{ borderTop: "1px solid rgba(5,5,5,0.04)" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="mb-24">
              <p className="text-[8.5px] font-mono tracking-[0.55em] uppercase mb-5"
                style={{ color: "#1a6de0" }}>— Architecture</p>
              <h2 className="text-3xl md:text-[3.5rem] font-light mb-6 leading-[1.1]"
                style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#050505" }}>
                Principles of Structural{" "}
                <span style={{
                  background: "linear-gradient(135deg,#1a6de0,#00d4ff)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>Engineering.</span>
              </h2>
              <p className="text-base font-light max-w-[580px]" style={{ color: "rgba(5,5,5,0.7)", lineHeight: 1.75 }}>
                The solidity of the system does not reside in superficial innovation, but in
                the precise amalgamation of established computational paradigms.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PILLARS.map((p, i) => (
              <GlowCard key={i} icon={p.icon} title={p.title} desc={p.desc}
                delay={i * 0.09} direction={i % 2 === 0 ? "left" : "right"} color={p.color} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/*  MODULES                                                         */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-40 px-6 md:px-12"
        style={{ borderTop: "1px solid rgba(5,5,5,0.04)" }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="mb-24 text-center">
              <p className="text-[8.5px] font-mono tracking-[0.55em] uppercase mb-5"
                style={{ color: "#00d4ff" }}>— Implementation</p>
              <h2 className="text-3xl md:text-[3.5rem] font-light mb-6"
                style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#050505" }}>
                Functional Modules
              </h2>
              <p className="text-base font-light mx-auto" style={{ color: "rgba(5,5,5,0.7)", maxWidth: 520, lineHeight: 1.75 }}>
                The materialization concludes strictly in silent observation modules.
                No simulations. Empirical data with profound rigor.
              </p>
            </div>
          </Reveal>
          <div className="space-y-5">
            {MODULES.map((mod, i) => (
              <Reveal key={i} delay={i * 0.14} yOffset={50}>
                <motion.div
                  whileHover={{ scale: 1.01,
                    boxShadow: `0 24px 80px ${mod.color}10, 0 0 0 1px ${mod.color}22` }}
                  transition={{ type: "spring", stiffness: 240, damping: 24 }}
                  className="rounded-2xl p-10 md:p-14 flex flex-col md:flex-row gap-10 md:gap-20 items-start"
                  style={{
                    background: "rgba(5,5,5,0.016)",
                    border: "1px solid rgba(5,5,5,0.05)",
                    boxShadow: "0 16px 56px rgba(0,0,0,0.35)",
                  }}
                >
                  <div className="md:w-1/3 shrink-0">
                    <div className="text-[8px] font-mono tracking-[0.45em] uppercase mb-4 opacity-65"
                      style={{ color: mod.color }}>{mod.category}</div>
                    <h3 className="text-2xl md:text-3xl font-light leading-snug"
                      style={{ color: "rgba(5,5,5,0.92)" }}>{mod.title}</h3>
                    <div className="mt-5 h-[2px] w-10 rounded"
                      style={{ background: `linear-gradient(90deg,${mod.color},transparent)` }} />
                  </div>
                  <div className="md:w-2/3">
                    <p className="text-base font-light leading-relaxed mb-8"
                      style={{ color: "rgba(5,5,5,0.38)" }}>{mod.description}</p>
                    <ul className="space-y-3">
                      {mod.points.map((pt, j) => (
                        <li key={j} className="flex items-center gap-4">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: mod.color, boxShadow: `0 0 7px ${mod.color}` }} />
                          <span className="text-sm font-light" style={{ color: "rgba(5,5,5,0.45)" }}>
                            {pt}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/*  CONCLUSION CTA                                                  */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 py-52 px-6 text-center overflow-hidden"
        style={{ borderTop: "1px solid rgba(5,5,5,0.04)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(26,109,224,0.065) 0%, transparent 70%)" }} />

        <Reveal>
          <div className="relative max-w-3xl mx-auto">
            {/* Orbital rings */}
            {[300, 200].map((size, i) => (
              <motion.div key={i}
                animate={{ rotate: i % 2 === 0 ? [0, 360] : [360, 0] }}
                transition={{ duration: i === 0 ? 140 : 90, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 top-[-60px] -translate-x-1/2 rounded-full border pointer-events-none"
                style={{ width: size, height: size,
                  borderColor: i === 0 ? "rgba(26,109,224,0.07)" : "rgba(212,175,55,0.07)",
                  borderStyle: i === 1 ? "dashed" : "solid",
                  marginTop: -(size / 2) + 60,
                  marginLeft: -(size / 2),
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                }} />
            ))}

            <p className="text-[8.5px] font-mono tracking-[0.55em] uppercase mb-9"
              style={{ color: "#D4AF37" }}>— Terminal Access</p>

            <h2 className="text-4xl md:text-6xl font-light mb-8 leading-tight"
              style={{ fontFamily: "'Space Grotesk',sans-serif", color: "#050505" }}>
              Whale Alert Network Matrix
            </h2>

            <p className="text-base font-light mb-16 leading-relaxed"
              style={{ color: "rgba(5,5,5,0.7)", maxWidth: "520px", margin: "0 auto 4rem" }}>
              The terminal is available strictly for those who require this structural clarity.
              Access demands the verification of cryptographic signatures.
            </p>

            <motion.button
              onClick={handleEntry}
              whileHover={{ scale: 1.07,
                boxShadow: "0 0 80px rgba(26,109,224,0.45), 0 24px 60px rgba(0,0,0,0.6)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="inline-flex items-center gap-3 px-12 py-5 rounded-full text-base font-semibold"
              style={{
                background: "linear-gradient(135deg,#1a6de0,#0047cc)",
                color: "#ffffff",
                boxShadow: "0 0 40px rgba(26,109,224,0.28), 0 12px 48px rgba(0,0,0,0.5)",
              }}
            >
              Access the Terminal
              <ArrowRight size={18} strokeWidth={2} />
            </motion.button>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <div className="relative z-10"><Footer /></div>

      <DynamicCryptoCheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  );
}
