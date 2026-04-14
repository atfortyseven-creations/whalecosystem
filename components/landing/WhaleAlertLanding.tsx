"use client";

/**
 * WhaleAlertLanding.tsx — PC Landing Page
 * ─────────────────────────────────────────────────────────────────────────────
 * Rainbow-grade bento grid design. Immersive product tiles overflow their
 * containers. GPU-composited at 240Hz. All animations: transform + opacity.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { WhaleLogo } from "@/components/shared/WhaleLogo";

const DynamicCryptoCheckoutModal = dynamic(
  () => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal),
  { ssr: false }
);

// ─── Tokens ───────────────────────────────────────────────────────────────────
const BG   = "#F0EEFF";          // Soft lavender background (Rainbow-style)
const INK  = "#050505";
const WHITE= "#FFFFFF";
const MUTED= "rgba(5,5,5,0.40)";
const FAINT= "rgba(5,5,5,0.07)";
const CARD = "rgba(255,255,255,0.95)";

// ─── Blockchain node SVG icon ─────────────────────────────────────────────────
function ChainIcon({ size = 28, color = INK }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect x="28" y="28" width="24" height="24" rx="3" stroke={color} strokeWidth="2.2"/>
      <line x1="40" y1="52" x2="40" y2="68" stroke={color} strokeWidth="1.8"/>
      <line x1="40" y1="28" x2="40" y2="12" stroke={color} strokeWidth="1.8"/>
      <line x1="52" y1="40" x2="68" y2="40" stroke={color} strokeWidth="1.8"/>
      <line x1="28" y1="40" x2="12" y2="40" stroke={color} strokeWidth="1.8"/>
      <rect x="31" y="4" width="18" height="12" rx="2" stroke={color} strokeWidth="1.8"/>
      <rect x="31" y="64" width="18" height="12" rx="2" stroke={color} strokeWidth="1.8"/>
      <rect x="64" y="34" width="12" height="12" rx="2" stroke={color} strokeWidth="1.8"/>
      <rect x="4"  y="34" width="12" height="12" rx="2" stroke={color} strokeWidth="1.8"/>
    </svg>
  );
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function R({ children, delay = 0, y = 32, className = "" }: {
  children: React.ReactNode; delay?: number; y?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: "transform, opacity" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK UI COMPONENTS (Immersive product tiles — all pure CSS/SVG/HTML)
// ─────────────────────────────────────────────────────────────────────────────

// Simulated live whale event feed
const FAKE_EVENTS = [
  { tier: "MEGALODON", chain: "ETH", amount: "$247.3M", from: "0x71C...a3F", to: "0xB44...7d2", age: "12s" },
  { tier: "GREAT WHITE", chain: "SOL", amount: "$89.1M", from: "GExT...mP9", to: "3YvU...nK4", age: "34s" },
  { tier: "HUMPBACK", chain: "ARB", amount: "$31.7M", from: "0xC92...f1B", to: "0x3A1...2e0", age: "1m" },
  { tier: "ORCA", chain: "BASE", amount: "$14.2M", from: "0xD44...91c", to: "0x7F2...b10", age: "2m" },
  { tier: "NARWHAL", chain: "OP", amount: "$6.8M", from: "0xA11...44d", to: "0x2B9...cc7", age: "3m" },
];

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  MEGALODON:   { bg: "#FF3B30", text: "#fff" },
  "GREAT WHITE": { bg: "#FF6B00", text: "#fff" },
  HUMPBACK:    { bg: "#FF9500", text: "#fff" },
  ORCA:        { bg: "#5856D6", text: "#fff" },
  NARWHAL:     { bg: "#34C759", text: "#fff" },
};

function WhaleFeedMock() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {FAKE_EVENTS.map((ev, i) => (
        <motion.div
          key={ev.amount}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16,1,0.3,1] }}
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
          style={{ background: "rgba(5,5,5,0.035)", border: "1px solid rgba(5,5,5,0.06)" }}
        >
          <span className="text-[8.5px] font-mono font-black px-2 py-0.5 rounded-full shrink-0"
            style={{ background: TIER_COLORS[ev.tier]?.bg || "#000", color: TIER_COLORS[ev.tier]?.text }}>
            {ev.tier}
          </span>
          <span className="text-[9px] font-mono font-black px-1.5 py-0.5 rounded"
            style={{ background: "rgba(5,5,5,0.08)", color: INK }}>
            {ev.chain}
          </span>
          <span className="text-[13px] font-black flex-1" style={{ color: INK }}>{ev.amount}</span>
          <span className="text-[9px] font-mono" style={{ color: MUTED }}>{ev.age}</span>
        </motion.div>
      ))}
    </div>
  );
}

// Simulated Z-score radar
function RadarMock() {
  return (
    <div className="relative w-56 h-56 mx-auto">
      {/* Rings */}
      {[1, 0.75, 0.5, 0.25].map((scale, i) => (
        <motion.div
          key={scale}
          className="absolute inset-0 rounded-full border"
          style={{
            transform: `scale(${scale})`,
            borderColor: `rgba(88,86,214,${0.08 + i * 0.04})`,
            top: `${(1 - scale) * 50}%`,
            left: `${(1 - scale) * 50}%`,
            width: `${scale * 100}%`,
            height: `${scale * 100}%`,
          }}
        />
      ))}
      {/* Sweep */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "conic-gradient(from 0deg, rgba(88,86,214,0.15) 0deg, transparent 60deg)",
          transformOrigin: "center",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full" style={{ background: "#5856D6" }} />
      </div>
      {/* Blips */}
      {[
        { top: "22%", left: "62%", delay: 0.4 },
        { top: "58%", left: "28%", delay: 1.1 },
        { top: "40%", left: "75%", delay: 2.2 },
      ].map(({ top, left, delay }, i) => (
        <motion.div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-full"
          style={{ top, left, background: "#FF3B30", boxShadow: "0 0 8px #FF3B3080" }}
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.4, 1] }}
          transition={{ duration: 1.8, delay, repeat: Infinity }}
        />
      ))}
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <span className="text-[8px] font-mono font-black uppercase" style={{ color: MUTED, letterSpacing: "0.3em" }}>
          Mempool Radar · 16 Chains
        </span>
      </div>
    </div>
  );
}

// Portfolio vault mock
function VaultMock() {
  const assets = [
    { name: "Bitcoin", ticker: "BTC", value: "$142,840", change: "+2.4%", up: true },
    { name: "Ethereum", ticker: "ETH", value: "$38,120", change: "+1.8%", up: true },
    { name: "Solana", ticker: "SOL", value: "$14,390", change: "-0.7%", up: false },
    { name: "Arbitrum", ticker: "ARB", value: "$2,840", change: "+3.1%", up: true },
  ];
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[11px] font-mono font-black uppercase" style={{ color: MUTED, letterSpacing: "0.2em" }}>
            Total Portfolio
          </div>
          <div className="text-[26px] font-black tracking-tight" style={{ color: INK }}>$198,190</div>
        </div>
        <div className="px-3 py-1.5 rounded-full text-[9px] font-mono font-black"
          style={{ background: "#34C759", color: "#fff" }}>
          +$4,280 today
        </div>
      </div>
      {/* Bar */}
      <div className="h-2 rounded-full overflow-hidden flex gap-0.5 mb-5">
        {[61, 20, 12, 7].map((w, i) => (
          <motion.div key={i} className="h-full rounded-full"
            style={{ width: `${w}%`, background: ["#FF9500","#5856D6","#34C759","#FF3B30"][i] }}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: [0.16,1,0.3,1] }}
          />
        ))}
      </div>
      {assets.map((a, i) => (
        <motion.div key={a.ticker}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.08 }}
          className="flex items-center py-2.5"
          style={{ borderBottom: i < assets.length - 1 ? `1px solid ${FAINT}` : "none" }}
        >
          <div className="w-7 h-7 rounded-xl flex items-center justify-center mr-3 text-[11px] font-black"
            style={{ background: ["#FF9500","#5856D6","#34C759","#FF3B30"][i], color: "#fff" }}>
            {a.ticker[0]}
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-black" style={{ color: INK }}>{a.name}</div>
            <div className="text-[9px] font-mono" style={{ color: MUTED }}>{a.ticker}</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] font-black" style={{ color: INK }}>{a.value}</div>
            <div className="text-[9px] font-mono font-bold" style={{ color: a.up ? "#34C759" : "#FF3B30" }}>{a.change}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ZK Shield visualization
function ZKShieldMock() {
  return (
    <div className="relative w-full flex flex-col items-center gap-4">
      {/* Hexagon shield */}
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 120 140" className="w-full h-full">
          <motion.polygon
            points="60,8 108,34 108,86 60,112 12,86 12,34"
            fill="none" stroke="#5856D6" strokeWidth="2.5"
            animate={{ strokeDashoffset: [240, 0] }}
            strokeDasharray="240"
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <motion.polygon
            points="60,22 94,42 94,80 60,100 26,80 26,42"
            fill="rgba(88,86,214,0.08)" stroke="#5856D6" strokeWidth="1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <text x="60" y="68" textAnchor="middle" fontSize="22" fontWeight="900" fill="#5856D6">ZK</text>
        </svg>
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(88,86,214,0.15) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      {/* Proof steps */}
      {[
        { label: "Identity Commitment", status: "VERIFIED" },
        { label: "Groth16 BN254 Proof", status: "GENERATED" },
        { label: "On-chain Relay",       status: "CONFIRMED" },
      ].map(({ label, status }, i) => (
        <motion.div key={label}
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + i * 0.18 }}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl"
          style={{ background: "rgba(88,86,214,0.06)", border: "1px solid rgba(88,86,214,0.12)" }}
        >
          <span className="text-[11px] font-medium" style={{ color: INK }}>{label}</span>
          <span className="text-[8px] font-mono font-black px-2 py-0.5 rounded-full"
            style={{ background: "#34C759", color: "#fff", letterSpacing: "0.1em" }}>
            {status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// Latency bars
function LatencyMock() {
  const bars = [4,8,3,12,15,6,9,14,7,11,5,13,8,10,4];
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-end gap-1 h-16">
        {bars.map((h, i) => (
          <motion.div key={i} className="flex-1 rounded-full"
            style={{ height: `${h / 15 * 100}%`, background: h <= 10 ? "#5856D6" : "#FF3B30" }}
            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16,1,0.3,1] }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[9px] font-mono" style={{ color: MUTED }}>
        <span>0ms</span>
        <span className="font-black" style={{ color: "#5856D6" }}>AVG 7.3ms</span>
        <span>15ms LIMIT</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BENTO TILE wrapper
// ─────────────────────────────────────────────────────────────────────────────
function Tile({
  children, className = "", dark = false, delay = 0, accent
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  delay?: number;
  accent?: string;
}) {
  return (
    <R delay={delay}>
      <div
        className={`relative rounded-[28px] overflow-hidden ${className}`}
        style={{
          background: dark ? INK : CARD,
          border: dark ? "none" : `1px solid ${FAINT}`,
          boxShadow: dark
            ? "0 24px 60px rgba(5,5,5,0.18)"
            : "0 4px 24px rgba(5,5,5,0.05), 0 1px 3px rgba(5,5,5,0.04)",
          ...(accent ? { borderTop: `3px solid ${accent}` } : {}),
        }}
      >
        {children}
      </div>
    </R>
  );
}

// Feature icon badge (Rainbow-style colored square)
function FeatureBadge({ emoji, label, body, color }: {
  emoji: string; label: string; body: string; color: string;
}) {
  return (
    <R className="flex flex-col items-start gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[22px]"
        style={{ background: color }}>
        {emoji}
      </div>
      <div>
        <div className="text-[13px] font-black mb-1" style={{ color: INK }}>{label}</div>
        <div className="text-[11.5px] leading-relaxed" style={{ color: MUTED }}>{body}</div>
      </div>
    </R>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING NAV
// ─────────────────────────────────────────────────────────────────────────────
function Nav({ onEntry, address }: { onEntry: () => void; address?: string }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 left-1/2 z-[200] flex items-center justify-between px-6 py-3 rounded-full"
      style={{
        width: "min(90vw, 1080px)",
        transform: "translateX(-50%) translateZ(0)",
        WebkitTransform: "translateX(-50%) translateZ(0)",
        background: scrolled ? "rgba(240,238,255,0.88)" : "rgba(255,255,255,0.70)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(88,86,214,0.10)",
        boxShadow: scrolled
          ? "0 8px 32px rgba(5,5,5,0.10)"
          : "0 4px 20px rgba(5,5,5,0.06)",
        transition: "background 0.35s ease, box-shadow 0.35s ease",
        willChange: "background, box-shadow, transform"
      }}
    >
      <div className="flex items-center gap-3">
        <WhaleLogo className="w-7 h-7 shrink-0" />
        <div>
          <div className="text-[12px] font-black uppercase tracking-[-0.01em]" style={{ color: INK }}>
            Whale Alert Network
          </div>
          <div className="text-[7px] font-mono font-bold uppercase"
            style={{ color: MUTED, letterSpacing: "0.26em" }}>
            Blockchain Intelligence
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {["Intelligence", "Architecture", "Security", "Roadmap"].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`}
            className="text-[10.5px] font-bold"
            style={{ color: MUTED, letterSpacing: "0.05em", WebkitTapHighlightColor: "transparent" }}>
            {item}
          </a>
        ))}
      </div>

      <button onClick={onEntry}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full transition-all hover:scale-[1.04] active:scale-[0.96]"
        style={{
          background: INK, color: WHITE, fontSize: "9.5px",
          fontFamily: "monospace", fontWeight: 900,
          letterSpacing: "0.18em", textTransform: "uppercase",
          boxShadow: "0 4px 16px rgba(5,5,5,0.20)",
        }}
      >
        {address ? "Open Terminal" : "Access Terminal"}
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8M6 2l4 4-4 4" stroke={WHITE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </motion.nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function WhaleAlertLanding() {
  const router = useRouter();
  const { address } = useSovereignAccount();
  const [showGate, setShowGate] = useState(false);

  const handleEntry = () => {
    if (address) router.push("/dashboard");
    else setShowGate(true);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden"
      style={{ background: `linear-gradient(180deg, ${BG} 0%, #F8F6FF 30%, #FFFFFF 70%, ${BG} 100%)`, color: INK }}>

      {/* Soft radial glow accents (static, zero cost) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(88,86,214,0.12) 0%, transparent 70%)" }} />
        <div className="absolute top-[40%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(255,149,0,0.10) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(52,199,89,0.10) 0%, transparent 70%)" }} />
      </div>

      {/* Cosmic pattern (very subtle) */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/patron-cosmico-4k.png')",
          backgroundSize: "110%",
          backgroundRepeat: "repeat",
          opacity: 0.025,
          mixBlendMode: "multiply",
        }}
      />

      <Nav onEntry={handleEntry} address={address} />

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 pt-40 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <R delay={0.1}>
              <div className="flex gap-2 flex-wrap mb-8">
                {["Sovereign Infrastructure", "v2.0 Production", "MIT Open Source"].map(t => (
                  <span key={t} className="text-[8px] font-mono font-black uppercase px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(88,86,214,0.08)", color: "#5856D6", letterSpacing: "0.2em",
                      border: "1px solid rgba(88,86,214,0.15)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </R>
            <R delay={0.15}>
              <h1 className="font-black tracking-[-0.04em] leading-[0.84] mb-8"
                style={{ fontSize: "clamp(3.2rem,6vw,5.5rem)", color: INK }}>
                Whale Alert<br />
                <span style={{ color: "rgba(5,5,5,0.18)" }}>Network</span>
              </h1>
            </R>
            <R delay={0.25}>
              <p className="text-[16px] leading-[1.75] mb-6 max-w-md" style={{ color: MUTED }}>
                Sovereign-grade, real-time blockchain intelligence. Detect, verify, and 
                act on institutional capital movements across 16 networks at sub-15ms latency.
              </p>
            </R>
            <R delay={0.32}>
              <p className="text-[10px] font-mono font-bold uppercase mb-10"
                style={{ color: "rgba(5,5,5,0.28)", letterSpacing: "0.26em" }}>
                Designed & engineered by a single independent developer
              </p>
            </R>
            <R delay={0.4}>
              <div className="flex gap-3">
                <button onClick={handleEntry}
                  className="flex items-center gap-2.5 px-7 py-4 rounded-full font-black uppercase transition-all hover:scale-[1.04] active:scale-[0.96]"
                  style={{ background: INK, color: WHITE, fontSize: "10px", letterSpacing: "0.18em",
                    boxShadow: "0 12px 32px rgba(5,5,5,0.22)" }}>
                  <ChainIcon size={16} color={WHITE} />
                  Access Terminal
                </button>
                <a href="https://github.com/atfortyseven-creations/whalecosystem"
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-7 py-4 rounded-full font-black uppercase transition-all hover:scale-[1.02] active:scale-[0.96]"
                  style={{ background: CARD, border: `1px solid ${FAINT}`, color: MUTED,
                    fontSize: "10px", letterSpacing: "0.18em" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={MUTED}>
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  Source Code
                </a>
              </div>
            </R>
          </div>

          {/* Right — Hero tile with live feed overflow */}
          <R delay={0.3} y={48}>
            <div className="relative">
              <Tile dark className="p-7">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[9px] font-mono font-black uppercase mb-1"
                      style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.3em" }}>
                      Live Sovereign Feed
                    </div>
                    <div className="text-[18px] font-black" style={{ color: WHITE }}>
                      Whale Events
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(52,199,89,0.18)", border: "1px solid rgba(52,199,89,0.3)" }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34C759" }} />
                    <span className="text-[8.5px] font-mono font-black" style={{ color: "#34C759", letterSpacing: "0.15em" }}>LIVE</span>
                  </div>
                </div>
                <WhaleFeedMock />
                <div className="mt-5 pt-4 flex gap-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {[
                    { v: "<15ms", u: "Latency" },
                    { v: "16", u: "Chains" },
                    { v: "3.5σ", u: "Z-Score" },
                  ].map(({ v, u }) => (
                    <div key={u} className="flex-1 text-center">
                      <div className="text-[14px] font-black font-mono" style={{ color: WHITE }}>{v}</div>
                      <div className="text-[7.5px] font-mono font-black uppercase" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em" }}>{u}</div>
                    </div>
                  ))}
                </div>
              </Tile>
              {/* Floating overflow badge */}
              <motion.div
                className="absolute -top-4 -right-4 px-4 py-2 rounded-2xl text-[11px] font-black"
                style={{ background: "#FF3B30", color: WHITE, boxShadow: "0 8px 20px rgba(255,59,48,0.35)" }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                🐋 $247M · ETH
              </motion.div>
            </div>
          </R>
        </div>
      </section>

      {/* ── BENTO GRID 1 — Intelligence ─────────────────────────────── */}
      <section id="intelligence" className="relative z-10 max-w-[1200px] mx-auto px-6 py-20">
        <R>
          <div className="text-center mb-14">
            <div className="text-[9px] font-mono font-black uppercase mb-4"
              style={{ color: MUTED, letterSpacing: "0.35em" }}>§ Intelligence Layer</div>
            <h2 className="font-black tracking-[-0.03em] leading-[0.88]"
              style={{ fontSize: "clamp(2rem,4vw,3.2rem)", color: INK }}>
              Real-time capital intelligence.<br />
              <span style={{ color: "rgba(5,5,5,0.22)" }}>Every movement. Every chain.</span>
            </h2>
          </div>
        </R>

        <div className="grid grid-cols-3 gap-4">

          {/* A — Full-height mempool radar */}
          <Tile delay={0.1} className="row-span-2 p-8 flex flex-col">
            <div className="text-[9px] font-mono font-black uppercase mb-2"
              style={{ color: MUTED, letterSpacing: "0.28em" }}>MOD 01</div>
            <h3 className="text-[18px] font-black mb-2" style={{ color: INK }}>
              Ingestion Engine
            </h3>
            <p className="text-[12px] leading-relaxed mb-6" style={{ color: MUTED }}>
              Priority fee interception on Solana + EVM mempool monitoring across 16 networks.
              Z-score statistical filter at 3.5σ with Welford online algorithm update.
            </p>
            <div className="flex-1 flex items-center justify-center">
              <RadarMock />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[{ v: "<15ms", u: "Latency" }, { v: "16", u: "Networks" }, { v: "3.5σ", u: "Z-Score" }, { v: "AT-1", u: "Protocol" }].map(({ v, u }) => (
                <div key={u} className="p-3 rounded-2xl" style={{ background: "rgba(5,5,5,0.03)", border: `1px solid ${FAINT}` }}>
                  <div className="text-[13px] font-black font-mono" style={{ color: INK }}>{v}</div>
                  <div className="text-[8px] font-mono uppercase" style={{ color: MUTED, letterSpacing: "0.15em" }}>{u}</div>
                </div>
              ))}
            </div>
          </Tile>

          {/* B — Latency tile */}
          <Tile delay={0.15} accent="#5856D6" className="p-7">
            <div className="text-[9px] font-mono font-black uppercase mb-2"
              style={{ color: MUTED, letterSpacing: "0.28em" }}>Latency Monitor</div>
            <h3 className="text-[17px] font-black mb-4" style={{ color: INK }}>
              Sub-15ms<br />signal delivery
            </h3>
            <LatencyMock />
          </Tile>

          {/* C — Sovereign Mesh */}
          <Tile delay={0.18} className="p-7" dark>
            <div className="text-[9px] font-mono font-black uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.28em" }}>MOD 02</div>
            <h3 className="text-[17px] font-black mb-3" style={{ color: WHITE }}>
              Sovereign Mesh Protocol
            </h3>
            <p className="text-[11.5px] leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
              Redis Pub/Sub over 6 significance tiers. ECDSA secp256k1 authentication per signal.
            </p>
            <div className="space-y-2">
              {["Narwhal · $500K+", "Orca · $1M+", "Humpback · $5M+", "Great White · $50M+", "Megalodon · $100M+"].map((t, i) => {
                const colors = ["#34C759","#5856D6","#FF9500","#FF6B00","#FF3B30"];
                return (
                  <div key={t} className="flex items-center gap-2.5 text-[10.5px] font-medium"
                    style={{ color: "rgba(255,255,255,0.7)" }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i] }} />
                    {t}
                  </div>
                );
              })}
            </div>
          </Tile>

          {/* D — Mass Transfer */}
          <Tile delay={0.2} accent="#FF9500" className="p-7">
            <div className="text-[9px] font-mono font-black uppercase mb-2"
              style={{ color: MUTED, letterSpacing: "0.28em" }}>MOD 03</div>
            <h3 className="text-[17px] font-black mb-3" style={{ color: INK }}>
              Mass Transfer Intelligence
            </h3>
            <p className="text-[11.5px] leading-relaxed" style={{ color: MUTED }}>
              Neo4j graph clustering reconstitutes distributed institutional moves from 
              individual sub-transactions. 15-minute sliding temporal window.
            </p>
            <div className="mt-4 flex gap-3 flex-wrap">
              {[["$100M+", "Threshold"], ["15min", "Window"], ["≤3 hops", "Graph"]].map(([v, u]) => (
                <div key={u} className="px-3 py-2 rounded-xl" style={{ background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.15)" }}>
                  <div className="text-[11px] font-black font-mono" style={{ color: "#FF9500" }}>{v}</div>
                  <div className="text-[7.5px] font-mono uppercase" style={{ color: MUTED, letterSpacing: "0.15em" }}>{u}</div>
                </div>
              ))}
            </div>
          </Tile>
        </div>
      </section>

      {/* ── BENTO GRID 2 — Security + Vault ─────────────────────────── */}
      <section id="security" className="relative z-10 max-w-[1200px] mx-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-4">

          {/* ZK Shield */}
          <Tile delay={0.1} className="p-8">
            <div className="text-[9px] font-mono font-black uppercase mb-2"
              style={{ color: MUTED, letterSpacing: "0.28em" }}>MOD 06 · Zero-Knowledge</div>
            <h3 className="text-[22px] font-black mb-2" style={{ color: INK }}>
              ZK Shield Station
            </h3>
            <p className="text-[12px] leading-relaxed mb-8" style={{ color: MUTED }}>
              World ID proof-of-personhood. Groth16 BN254 proving for sentinel authentication.
              Nullifier-based Sybil resistance. On-chain relay to Optimism verifier.
            </p>
            <ZKShieldMock />
          </Tile>

          {/* Sovereign Vault */}
          <Tile delay={0.15} dark className="p-8">
            <div className="text-[9px] font-mono font-black uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.28em" }}>MOD 05 · Non-Custodial</div>
            <h3 className="text-[22px] font-black mb-2" style={{ color: WHITE }}>
              Sovereign Vault
            </h3>
            <p className="text-[12px] leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              EIP-1193 compliant. Private keys never reach the server layer at any point.
              Reown AppKit · WalletConnect v2 · Dead man's switch via Solidity timelock.
            </p>
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <VaultMock />
            </div>
          </Tile>
        </div>
      </section>

      {/* ── AKASHIC LEDGER — Full-width tile ─────────────────────────── */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-4">
        <Tile delay={0.1} className="p-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-[9px] font-mono font-black uppercase mb-3"
                style={{ color: MUTED, letterSpacing: "0.28em" }}>MOD 04 · Permanent Registry</div>
              <h3 className="font-black tracking-[-0.03em] leading-[0.88] mb-5"
                style={{ fontSize: "clamp(1.8rem,3vw,2.6rem)", color: INK }}>
                The Akashic Ledger
              </h3>
              <p className="text-[13px] leading-relaxed mb-6" style={{ color: MUTED }}>
                Permanent SHA-256 tamper-evident registry of every capital movement above $50M. 
                Seven fields. Hash recomputed on every GET request for live cryptographic integrity verification.
                Editorial annotation contextualizes each event within macro-economic conditions.
              </p>
              <div className="flex gap-3 flex-wrap">
                {[["$50M+", "Entry Threshold"], ["SHA-256", "Hash Function"], ["7 Fields", "Per Entry"], ["Per-GET", "Verification"]].map(([v, u]) => (
                  <div key={u} className="px-4 py-2.5 rounded-2xl" style={{ background: "rgba(5,5,5,0.04)", border: `1px solid ${FAINT}` }}>
                    <div className="text-[12px] font-black font-mono" style={{ color: INK }}>{v}</div>
                    <div className="text-[7.5px] font-mono uppercase" style={{ color: MUTED, letterSpacing: "0.15em" }}>{u}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Ledger entry mock */}
            <div className="space-y-3">
              {[
                { id: "AK-7741", chain: "ETH", value: "$1.74B", hash: "a8f2c9...4e17", time: "2026-04-03T14:22Z", editorial: "Probable macro-hedge repositioning — 43min post-Treasury auction." },
                { id: "AK-7740", chain: "BTC", value: "$890M", hash: "3b9e14...c221", time: "2026-04-01T09:11Z", editorial: "Deep-cold wallet dormant 30 months. Destination: DEX." },
              ].map(({ id, chain, value, hash, time, editorial }) => (
                <div key={id} className="p-5 rounded-2xl" style={{ border: `1px solid ${FAINT}`, background: "rgba(5,5,5,0.02)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded"
                        style={{ background: INK, color: WHITE, letterSpacing: "0.1em" }}>{id}</span>
                      <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded"
                        style={{ background: "rgba(88,86,214,0.1)", color: "#5856D6" }}>{chain}</span>
                    </div>
                    <span className="text-[15px] font-black" style={{ color: INK }}>{value}</span>
                  </div>
                  <div className="text-[9px] font-mono mb-2" style={{ color: MUTED }}>
                    SHA: <code>{hash}</code> · {time}
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: MUTED, fontStyle: "italic" }}>"{editorial}"</p>
                </div>
              ))}
            </div>
          </div>
        </Tile>
      </section>

      {/* ── FEATURE BADGES GRID (Rainbow-style) ──────────────────────── */}
      <section id="architecture" className="relative z-10 max-w-[1200px] mx-auto px-6 py-20">
        <R className="text-center mb-16">
          <h2 className="font-black tracking-[-0.03em]"
            style={{ fontSize: "clamp(2rem,4vw,3rem)", color: INK }}>
            One sovereign interface.<br />
            <span style={{ color: "rgba(5,5,5,0.22)" }}>Every chain that matters.</span>
          </h2>
        </R>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[
            { emoji: "⚡", label: "Sub-15ms", body: "Real-time mempool interception via WebSocket", color: "#FF9500" },
            { emoji: "🔐", label: "Non-Custodial", body: "EIP-1193 compliant. Keys never touch the server", color: "#5856D6" },
            { emoji: "🌐", label: "16 Networks", body: "EVM chains + Solana monitored in parallel", color: "#34C759" },
            { emoji: "🧠", label: "Z-Score AI", body: "Welford online algorithm. 3.5σ threshold", color: "#FF3B30" },
            { emoji: "🔮", label: "ZK Proofs", body: "Groth16 BN254. World ID proof-of-personhood", color: "#007AFF" },
            { emoji: "📡", label: "P2P Mesh", body: "ECDSA-signed Redis Pub/Sub distribution", color: "#FF2D55" },
          ].map((f) => (
            <FeatureBadge key={f.label} {...f} />
          ))}
        </div>
      </section>

      {/* ── TECH STACK TILES ─────────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-4">
        <R className="mb-10">
          <div className="text-[9px] font-mono font-black uppercase mb-3"
            style={{ color: MUTED, letterSpacing: "0.35em" }}>§ Technology</div>
          <h2 className="font-black tracking-[-0.03em]"
            style={{ fontSize: "clamp(2rem,4vw,3rem)", color: INK }}>
            Every dependency chosen<br />
            <span style={{ color: "rgba(5,5,5,0.22)" }}>for a specific reason.</span>
          </h2>
        </R>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { cat: "Application", icon: "▲", items: ["Next.js 15 App Router", "TypeScript 5.7 Strict", "React 19"], color: "#050505" },
            { cat: "Blockchain", icon: "⬡", items: ["Ethers.js 6 + Viem", "Solana Web3.js", "WalletConnect v2"], color: "#5856D6" },
            { cat: "Data Layer", icon: "◈", items: ["PostgreSQL + Prisma", "Redis Streams", "Neo4j Graph"], color: "#FF9500" },
            { cat: "Security",   icon: "◉", items: ["SIWE EIP-4361", "ZK Groth16", "World ID + CSP"], color: "#34C759" },
          ].map(({ cat, icon, items, color }, i) => (
            <Tile key={cat} delay={i * 0.08} className="p-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[14px] font-black mb-4"
                style={{ background: color, color: color === "#050505" ? WHITE : WHITE }}>
                {icon}
              </div>
              <div className="text-[10px] font-mono font-black uppercase mb-3"
                style={{ color: MUTED, letterSpacing: "0.22em" }}>{cat}</div>
              {items.map(it => (
                <div key={it} className="flex items-center gap-2 text-[12px] font-medium py-1.5"
                  style={{ borderBottom: `1px solid ${FAINT}`, color: INK }}>
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                  {it}
                </div>
              ))}
            </Tile>
          ))}
        </div>

        {/* 240Hz dark highlight tile */}
        <Tile delay={0.3} dark className="p-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-[9px] font-mono font-black uppercase mb-3"
                style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.3em" }}>
                Performance Contract
              </div>
              <h3 className="font-black tracking-tight leading-none mb-5"
                style={{ fontSize: "clamp(2.4rem,4vw,3.5rem)", color: WHITE }}>
                240Hz<br />Rendering
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                All animated elements maintain frame-perfect rendering at native display refresh rate.
                GPU compositor layers. Only <code className="font-mono text-[11px]"
                  style={{ color: "rgba(255,255,255,0.7)" }}>transform</code> and <code
                  className="font-mono text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>opacity</code> animate — zero layout reflows, zero CPU per frame post-initialization.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ v: "240Hz", u: "Target Refresh" }, { v: "<15ms", u: "Signal Latency" }, { v: "0", u: "Layout Reflows" }, { v: "GPU", u: "Compositor" }].map(({ v, u }) => (
                <div key={u} className="p-5 rounded-2xl text-center"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-[20px] font-black font-mono" style={{ color: WHITE }}>{v}</div>
                  <div className="text-[8px] font-mono font-bold uppercase" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.18em" }}>{u}</div>
                </div>
              ))}
            </div>
          </div>
        </Tile>
      </section>

      {/* ── ROADMAP TILES ────────────────────────────────────────────── */}
      <section id="roadmap" className="relative z-10 max-w-[1200px] mx-auto px-6 py-20">
        <R className="mb-14 text-center">
          <div className="text-[9px] font-mono font-black uppercase mb-3"
            style={{ color: MUTED, letterSpacing: "0.35em" }}>§ Strategic Roadmap</div>
          <h2 className="font-black tracking-[-0.03em]"
            style={{ fontSize: "clamp(2rem,4vw,3rem)", color: INK }}>
            Progressive decentralization.<br />
            <span style={{ color: "rgba(5,5,5,0.22)" }}>Three phases to sovereignty.</span>
          </h2>
        </R>
        <div className="grid lg:grid-cols-3 gap-4">
          {[
            { phase: "Q2 2026", title: "Phase One", color: "#5856D6",
              items: ["Mass Transfer graph clustering algorithm", "World ID verification integration", "BullMQ leaderboard pre-computation", "Sonic (Fantom) chain expansion"] },
            { phase: "Q3 2026", title: "Phase Two", color: "#FF9500",
              items: ["EigenLayer AVS signal validation", "Threshold signature (2/3 consensus)", "Decentralized sentinel node registry", "Trustless signal provenance proof"] },
            { phase: "2027+", title: "Phase Three", color: "#FF3B30",
              items: ["Purpose-built telemetry L1 chain", "100ms block time target", "Zero-fee signal publication", "On-chain governance via Gold Whale"] },
          ].map(({ phase, title, color, items }, i) => (
            <Tile key={phase} delay={i * 0.1} className="p-7">
              <div className="inline-block px-3 py-1 rounded-full text-[8px] font-mono font-black uppercase mb-4"
                style={{ background: `${color}15`, color, letterSpacing: "0.2em" }}>
                {phase}
              </div>
              <h3 className="text-[18px] font-black mb-5" style={{ color: INK }}>{title}</h3>
              <ul className="space-y-3">
                {items.map(it => (
                  <li key={it} className="flex items-start gap-2.5 text-[12px]" style={{ color: MUTED }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0" style={{ background: color }} />
                    {it}
                  </li>
                ))}
              </ul>
            </Tile>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 py-20">
        <R>
          <Tile dark className="p-16 text-center">
            <div className="flex justify-center mb-8">
              <ChainIcon size={52} color="rgba(255,255,255,0.2)" />
            </div>
            <h2 className="font-black tracking-[-0.04em] leading-[0.88] mb-6"
              style={{ fontSize: "clamp(2.5rem,5vw,4rem)", color: WHITE }}>
              Every signal verified.<br />Every movement recorded.<br />
              <span style={{ color: "rgba(255,255,255,0.25)" }}>Every institution monitored.</span>
            </h2>
            <p className="text-[15px] leading-relaxed max-w-lg mx-auto mb-12"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              Open-source sovereign intelligence layer for the institutional-grade individual.
              Designed and engineered entirely by one developer.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={handleEntry}
                className="px-10 py-5 rounded-full font-black uppercase transition-all hover:scale-[1.04] active:scale-[0.96]"
                style={{ background: WHITE, color: INK, fontSize: "10px", letterSpacing: "0.2em",
                  boxShadow: "0 16px 48px rgba(255,255,255,0.15)" }}>
                Open The Terminal →
              </button>
              <a href="https://github.com/atfortyseven-creations/whalecosystem" target="_blank"
                rel="noreferrer"
                className="px-10 py-5 rounded-full font-black uppercase transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)",
                  fontSize: "10px", letterSpacing: "0.2em", border: "1px solid rgba(255,255,255,0.1)" }}>
                View Source Code
              </a>
            </div>
            {/* Footer */}
            <div className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-mono font-bold uppercase"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.2)", letterSpacing: "0.2em" }}>
              <div>© 2026 atfortyseven-creations · All rights reserved</div>
              <div className="flex gap-6">
                {[["humanidfi.com", "https://humanidfi.com"], ["GitHub", "https://github.com/atfortyseven-creations/whalecosystem"], ["Support", "https://humanidfi.com/sovereign-support"]].map(([l, h]) => (
                  <a key={l} href={h} target="_blank" rel="noreferrer"
                    className="hover:opacity-70 transition-opacity" style={{ opacity: 0.5 }}>{l}</a>
                ))}
              </div>
            </div>
          </Tile>
        </R>
      </section>

      <AnimatePresence>
        {showGate && (
          <DynamicCryptoCheckoutModal isOpen={showGate} onClose={() => setShowGate(false)} />
        )}
      </AnimatePresence>
    </main>
  );
}
