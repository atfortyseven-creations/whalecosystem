"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Shield, Zap, Globe, Cpu, ArrowRight, Landmark, Activity, 
  TrendingUp, TrendingDown, Clock, Building2, Code2, Layers,
  CheckCircle2, Star, ChevronDown, ExternalLink, Info, Lock, Key, AlertTriangle, Users, Mail, Send, LayoutDashboard,
  BarChart2, Webhook, Filter, Anchor, LifeBuoy, Menu, X
} from 'lucide-react';
import { InmersiveConstellations } from '@/components/shared/InmersiveConstellations';

const LANDING_ASSETS = {
  hero: '/models/update/17863656.jpg', // Massive 7MB High-Fidelity Asset
  detection: '/models/update/3d-render-abstract-techno-background-with-flowing-cyber-particles.jpg',
  processing: '/models/update/light-prisms-colorful-effect.jpg',
  metaverse: '/models/update/metaverse.png',
  nfts: '/models/update/nft_art.jpg',
  prisms: '/models/update/light-prisms-colorful-effect.jpg',
  global: '/models/update/921.jpg',
  diamond: '/models/update/gradient-pink-diamond-balls-assortment (2).png',
  spheres: '/models/update/3d-shape-glowing-with-bright-holographic-colors.jpg',
  intelligence: '/models/update/11469812.png'
};

// ─── Whale event card ─────────────────────────────────────────────────────────
function WhaleEventCard({ token, amount, direction, wallet, time, delay }: {
  token: string; amount: string; direction: string;
  wallet: string; time: string; delay?: number;
}) {
  const isBuy = direction.toUpperCase().includes("BUY") || direction.toUpperCase().includes("OUTFLOW");
  const isSell = direction.toUpperCase().includes("SELL") || direction.toUpperCase().includes("INFLOW");
  const color = isBuy ? "#06b6d4" : isSell ? "#8b5cf6" : "#cbd5e1";
  const Icon = isBuy ? TrendingUp : isSell ? TrendingDown : ArrowRight;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: (delay || 0) * 0.1 }}
      viewport={{ once: true }}
      className="flex items-center gap-6 py-5 px-8 border-b border-slate-50 hover:bg-slate-50/50 transition-all group"
    >
      <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}30` }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="font-black text-slate-950 text-sm tracking-tight">{token}</span>
          <span
            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
            style={{ color, borderColor: `${color}30`, background: `${color}05` }}
          >
            {direction}
          </span>
        </div>
        <div className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter truncate">{wallet}</div>
      </div>
      <div className="text-right">
        <div className="font-black text-slate-950 font-mono text-sm">{amount}</div>
        <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">{time}</div>
      </div>
    </motion.div>
  );
}

// ─── Pricing Card ────────────────────────────────────────────────────────────
function PricingCard({ tier, price, period, desc, features, cta, ctaLink, highlighted, badge }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative flex flex-col rounded-[3rem] border p-10 h-full transition-all duration-500 ${
        highlighted
          ? "bg-white border-cyan-500 shadow-[0_40px_80px_-15px_rgba(6,182,212,0.1)] ring-1 ring-cyan-500/20"
          : "bg-white/60 border-slate-100 hover:border-slate-300 shadow-xl shadow-slate-200/50"
      }`}
    >
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-lg">
          {badge}
        </div>
      )}
      <div className="mb-8">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">{tier}</div>
        <div className="flex items-end gap-2">
          <span className="text-5xl font-black text-slate-950 tracking-tighter italic">{price}</span>
          <span className="text-slate-400 pb-2 font-black text-[10px] uppercase tracking-widest">/{period}</span>
        </div>
        <p className="text-slate-500 text-sm mt-4 font-medium leading-relaxed">{desc}</p>
      </div>
      <ul className="space-y-4 flex-1 mb-10">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-3 text-xs font-black text-slate-600 uppercase tracking-tight">
            <CheckCircle2 size={14} className="text-cyan-600 mt-0.5 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link href={ctaLink} className="block group">
        <button className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 ${
          highlighted ? "bg-slate-950 text-white hover:bg-black" : "bg-slate-100 text-slate-900 group-hover:bg-slate-200"
        }`}>
          {cta} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </Link>
    </motion.div>
  );
}

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-8 text-left group">
        <span className="text-base font-black text-slate-950 uppercase italic tracking-tight group-hover:text-cyan-600 transition-colors pr-6">{q}</span>
        <div className={`w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center transition-all ${open ? 'bg-slate-950 border-slate-950 text-white rotate-180' : 'text-slate-400'}`}>
          <ChevronDown size={14} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-sm text-slate-500 font-medium leading-relaxed uppercase tracking-wider max-w-2xl">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Live stat counter ────────────────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Token price ticker ───────────────────────────────────────────────────────
const TICKER_TOKENS = ["BTC", "ETH", "BNB", "SOL", "XRP", "LINK", "UNI", "AAVE", "ARB", "OP", "PEPE", "MATIC"];

function LiveTicker() {
  const [prices, setPrices] = React.useState<Record<string, { price: number; change: number }>>({});

  React.useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/market/ticker');
        const data = await res.json();
        const formatted: Record<string, { price: number; change: number }> = {};
        TICKER_TOKENS.forEach(t => {
          if (data[t]) formatted[t] = data[t];
          else formatted[t] = { price: 0, change: 0 };
        });
        setPrices(formatted);
      } catch (e) {
        console.error("Ticker fetch error:", e);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden border-y border-slate-100 bg-white/80 backdrop-blur-md py-4 relative z-50">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex items-center gap-16 w-max [will-change:transform]"
      >
        {[...TICKER_TOKENS, ...TICKER_TOKENS].map((token, i) => {
          const p = prices[token];
          return (
            <div key={i} className="flex items-center gap-4 font-mono text-[11px] whitespace-nowrap group">
              <span className="font-black text-slate-950 px-2 py-0.5 bg-slate-100 rounded group-hover:bg-cyan-500 group-hover:text-white transition-colors">{token}</span>
              <span className="text-slate-500 font-bold">
                ${p ? (p.price < 0.01 ? p.price.toFixed(8) : p.price.toLocaleString(undefined, { maximumFractionDigits: 2 })) : "..."}
              </span>
              {p && (
                <span className={`font-black ${p.change >= 0 ? "text-cyan-600" : "text-rose-600"}`}>
                  {p.change >= 0 ? "▲" : "▼"} {Math.abs(p.change).toFixed(1)}%
                </span>
              )}
              <span className="text-slate-200">/</span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

const STATS_DATA = [
  { value: 48, suffix: "M+", label: "Whale events detected" },
  { value: 24, suffix: "", label: "ERC-20 tokens scanned" },
  { value: 12, suffix: "s", label: "Average latency from chain" },
];

const API_CAPABILITIES = [
  { icon: Activity, title: "Whale Events Stream", desc: "Every transfer ≥ $100K across 24 tokens. Buy/Sell/Transfer classified. Full metadata: hash, block, gas, addresses." },
  { icon: BarChart2, title: "Heikin-Ashi Signals", desc: "On-chain data combined with HA candles to generate algorithmic LONG/SHORT signals per token." },
  { icon: Globe, title: "Multi-Chain Coverage", desc: "Ethereum, Base, Arbitrum, Optimism, Polygon. Unified API — one key, all chains." },
  { icon: Building2, title: "Elite Profile", desc: "Identify Binance, Coinbase, Kraken, OKX, Bitfinex wallet movements classified in real time." },
  { icon: AlertTriangle, title: "Anomaly Detection", desc: "Algorithmic anomaly scoring. Detect coordinated wash trading, flash loan attacks, and liquidation cascades." },
  { icon: Webhook, title: "Webhook Delivery", desc: "Push events to your endpoint as they happen. Retry logic, signature verification, delivery receipts." },
  { icon: Filter, title: "Dark Pool Radar", desc: "Detect OTC block trades and off-exchange movements that don't appear in standard order books." },
  { icon: Shield, title: "Risk Scoring", desc: "Every address gets a risk score 0–100 based on on-chain behavior, defi exposure, and historical patterns." },
];

const PRICING_TIERS = [
  {
    tier: "Standard",
    price: "$14.99",
    period: "month",
    desc: "Ideal for novice traders. Essential data for the top 3 cryptos (BTC, ETH, BNB).",
    features: [
      "5,000 API requests / day",
      "3 major tokens (BTC, ETH, BNB)",
      "1 API key",
      "REST API access",
      "12h Event Window",
      "≥ $1.00M threshold",
      "Dedicated Slack channel",
      "Sovereign Architecture Access",
    ],
    cta: "Get Started Now",
    ctaLink: "/api-marketplace?tier=standard",
  },
  {
    tier: "Starter",
    price: "$49",
    period: "month",
    desc: "For independent traders. Access to real-time whale data on major tokens.",
    features: [
      "10,000 API requests / day",
      "5 tokens (BTC, ETH, BNB, SOL, XRP)",
      "1 API key",
      "REST API access",
      "24h sliding window",
      "≥ $500K threshold",
    ],
    cta: "Start Monitoring",
    ctaLink: "/api-marketplace?tier=starter",
  },
  {
    tier: "Pro",
    price: "$299",
    period: "month",
    desc: "For professional trading desks. Every token. Webhooks. Priority delivery.",
    features: [
      "500,000 API requests / day",
      "All 24 tracked tokens",
      "3 API keys",
      "REST + WebSocket + Webhooks",
      "30-day historical access",
      "≥ $100K threshold",
      "Heikin-Ashi signal feed",
      "Priority Telegram support",
    ],
    cta: "Go Pro",
    ctaLink: "/api-marketplace?tier=pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    tier: "Elite",
    price: "$1,999",
    period: "month",
    desc: "For hedge funds and market makers. Unlimited access, dedicated infrastructure.",
    features: [
      "Unlimited API requests",
      "All tokens + custom requests",
      "10 API keys + sub-accounts",
      "REST + WebSocket + FIX protocol",
      "12-month full history",
      "≥ $50K threshold",
      "99.99% SLA + dedicated infra",
    ],
    cta: "Contact Sales",
    ctaLink: "/api-marketplace?tier=elite",
  },
];

const FAQS_DATA = [
  {
    q: "How does the data work? Is it real or simulated?",
    a: "100% real. Our system directly scans Ethereum's ERC-20 contracts using Alchemy RPC, extracts transfer logs block-by-block, and serves them via API. Zero simulated data."
  },
  {
    q: "How fast do I receive the data?",
    a: "Events appear in the API within one Ethereum block. With webhooks, latency is less than 500ms from detection. WebSocket users receive live event streaming."
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes, you can cancel from the customer portal at any time. Cancellation is effective at the end of the current billing period."
  },
  {
    q: "What blockchain chains do you cover?",
    a: "We currently scan Ethereum Mainnet with 24 ERC-20 contracts. We are adding Base, Arbitrum, Optimism, and Polygon for and Elite users shortly."
  },
];

export function WhaleAlertProWhite() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState("");
  const [previewEvents, setPreviewEvents] = React.useState<any[]>([]);

  React.useEffect(() => {
    const update = () => setCurrentTime(new Date().toISOString().slice(11, 19) + " UTC");
    update();
    const t = setInterval(update, 1000);
    
    // Simulated/Preview events for the landing page
    setPreviewEvents([
      { token: "ETH", amount: "$14,285,120", direction: "OUTFLOW", wallet: "Coinbase Prime", time: "2m ago", delay: 0 },
      { token: "BTC", amount: "$82,100,000", direction: "INFLOW", wallet: "Binance Hot Wallet", time: "5m ago", delay: 1 },
      { token: "LINK", amount: "$2,400,000", direction: "BUY", wallet: "Institutional Whale 0x71", time: "12m ago", delay: 2 },
      { token: "SOL", amount: "$5,120,500", direction: "TRANSFER", wallet: "Unknown Elite Wallet", time: "18m ago", delay: 3 },
      { token: "PEPE", amount: "$1,850,000", direction: "SELL", wallet: "Early Accumulator", time: "24m ago", delay: 4 }
    ]);

    return () => clearInterval(t);
  }, []);

  return (
    <div ref={containerRef} className="relative bg-white text-slate-900 selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden wave-surface wave-surface-strong">
      <InmersiveConstellations />
      {/* ─────────────────────────────────────────────────────────────
          HEADER
          ───────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-6 flex flex-col items-center gap-4 transition-all">
        <div className="w-full max-w-[1400px] flex justify-between items-center bg-white/40 backdrop-blur-3xl border border-white/20 px-8 py-4 rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Landmark size={20} className="text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase italic text-slate-950 underline decoration-cyan-400 decoration-4 underline-offset-4">Whale Alert Network Pro</span>
          </Link>

          {/* Desktop Center Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/network" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all group">
              <Anchor size={16} className="text-slate-400 group-hover:text-cyan-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-950">Whale Tracker</span>
            </Link>
            <Link href="/portfolio" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all group">
              <TrendingUp size={16} className="text-slate-400 group-hover:text-indigo-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-950">Whale Profile</span>
            </Link>
            <Link href="/support" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all group">
              <LifeBuoy size={16} className="text-slate-400 group-hover:text-rose-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-950">Support</span>
            </Link>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <div className="hidden md:flex items-center gap-8">
              {['Pricing', 'Security'].map(item => (
                <Link key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-950 transition-colors">{item}</Link>
              ))}
            </div>
            <Link href="/vip" className="px-6 sm:px-8 py-3 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200">Enter Terminal</Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-3 text-slate-950 hover:bg-slate-100 rounded-xl transition-all"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-[1400px] mt-4 bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-[2.5rem] p-8 flex flex-col gap-4 lg:hidden shadow-2xl z-[110]"
            >
              {[
                { href: '/network', icon: Anchor, label: 'Whale Tracker', color: 'text-cyan-600' },
                { href: '/portfolio', icon: TrendingUp, label: 'Whale Profile', color: 'text-indigo-600' },
                { href: '/support', icon: LifeBuoy, label: 'Support', color: 'text-rose-600' },
                { href: '/vip', icon: LayoutDashboard, label: 'Terminal', color: 'text-slate-950' },
              ].map((link) => (
                <Link 
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-slate-300 transition-all group"
                >
                  <link.icon size={20} className={`${link.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-950">{link.label}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Intelligence Pill - SUB-NAV POSITIONING TO PREVENT STACKING */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-slate-100 rounded-full shadow-lg shadow-slate-200/30"
        >
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-600">Global Institutional Intelligence v6.12.0</span>
        </motion.div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION (PHASE 0)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden pt-40 pb-20">
        <div className="absolute inset-0 z-0">
          <Image src={LANDING_ASSETS.hero} alt="Cosmic White" fill className="object-cover opacity-70 mix-blend-multiply transition-all duration-1000 scale-105" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/60 to-white" />
          {/* Stratospheric Glows */}
          <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-cyan-200/20 blur-[150px] rounded-full mix-blend-screen animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] bg-indigo-200/20 blur-[150px] rounded-full mix-blend-screen animate-pulse animation-delay-3000" />
        </div>
        
        <div className="relative z-10 text-center space-y-12 max-w-[1600px] px-6">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, ease: [0, 0, 0.2, 1] }} 
            className="text-[13vw] font-black leading-[0.75] tracking-tighter uppercase italic text-slate-950 px-4 drop-shadow-2xl"
          >
            Superior <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 saturate-[1.5]">Forensics</span>
          </motion.h1>
          
          <div className="space-y-12">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xl md:text-3xl font-medium text-slate-500 max-w-5xl mx-auto leading-relaxed underline decoration-slate-100 decoration-8 underline-offset-12">
              Observing institutional flows across the top 24 Binance tokens with zero friction, sub-millisecond precision, and absolute 3D immersion.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col md:flex-row items-center justify-center gap-12 pt-8">
               <div className="grid grid-cols-3 gap-20 text-center md:px-12">
                  {STATS_DATA.map((s, i) => (
                    <div key={i} className="group relative">
                      <div className="text-6xl font-black text-slate-950 italic tracking-tighter group-hover:scale-110 transition-transform">
                        <Counter target={s.value} suffix={s.suffix} />
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4 px-6 py-2 bg-white/50 backdrop-blur-md rounded-full border border-slate-100 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all shadow-sm">{s.label}</div>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      <LiveTicker />

      {/* ─────────────────────────────────────────────────────────────
          SCROLLYTELLING: DETECTION (PHASE 01)
          ───────────────────────────────────────────────────────────── */}
      <section id="infrastructure" className="relative h-[250vh]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <motion.div 
            style={{ 
              scale: useTransform(smoothProgress, [0.1, 0.4], [1.3, 1]),
              opacity: useTransform(smoothProgress, [0.1, 0.2, 0.4], [0, 1, 0.8]),
              filter: useTransform(smoothProgress, [0.1, 0.2], ["blur(20px) saturate(0.5)", "blur(0px) saturate(1.5)"])
            }}
            className="absolute inset-0 z-0"
          >
            <Image src={LANDING_ASSETS.detection} alt="Detection" fill className="object-cover mix-blend-multiply opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
            <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay" />
          </motion.div>

          <div className="relative z-10 px-24 max-w-6xl">
            <motion.div style={{ opacity: useTransform(smoothProgress, [0.15, 0.25], [0, 1]), x: useTransform(smoothProgress, [0.15, 0.25], [-100, 0]) }} className="space-y-12">
              <div className="inline-flex items-center gap-4 px-6 py-2 bg-cyan-50 border border-cyan-100 rounded-full shadow-lg shadow-cyan-100/50">
                <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">Phase 01 — Latency Floor Extraction</span>
              </div>
              <h2 className="text-9xl font-black text-slate-950 uppercase italic tracking-tighter leading-[0.8] drop-shadow-sm">Scanning the <br /> <span className="text-slate-300">Deep Mempool</span></h2>
              <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl">
                Our proprietary inspection engine extracts sub-millisecond latent data directly from global validator nodes. Every institutional order is captured before block confirmation.
              </p>
              <div className="flex gap-20 pt-10">
                <div className="relative">
                  <div className="text-7xl font-black italic text-cyan-600 tracking-tighter drop-shadow-xl">0.08ms</div>
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 border-l-2 border-cyan-200 pl-4">Node Latency Floor</div>
                </div>
                <div className="relative">
                  <div className="text-7xl font-black italic text-indigo-600 tracking-tighter drop-shadow-xl">14.2B</div>
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 border-l-2 border-indigo-200 pl-4">Daily Signals Synthetic</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SCROLLYTELLING: PROCESSING (PHASE 02)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative h-[250vh]">
        <div className="sticky top-0 h-screen flex items-center justify-end overflow-hidden">
          <motion.div 
            style={{ 
              scale: useTransform(smoothProgress, [0.4, 0.7], [1.4, 1]),
              opacity: useTransform(smoothProgress, [0.4, 0.5, 0.7], [0, 1, 0.9]),
              filter: useTransform(smoothProgress, [0.4, 0.5], ["blur(30px) saturate(0)", "blur(0px) saturate(1.8)"])
            }}
            className="absolute inset-0 z-0"
          >
            <Image src={LANDING_ASSETS.processing} alt="Processing" fill className="object-cover mix-blend-multiply opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-l from-white via-white/80 to-transparent" />
            <div className="absolute inset-0 bg-indigo-500/5 mix-blend-overlay" />
          </motion.div>

          <div className="relative z-10 px-24 max-w-6xl text-right">
            <motion.div style={{ opacity: useTransform(smoothProgress, [0.45, 0.55], [0, 1]), x: useTransform(smoothProgress, [0.45, 0.55], [100, 0]) }} className="space-y-12">
              <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full shadow-lg shadow-indigo-100/50 ml-auto">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Phase 02 — Neural Forensic Synthesis</span>
              </div>
              <h2 className="text-9xl font-black text-slate-950 uppercase italic tracking-tighter leading-[0.8] drop-shadow-sm">Forensic <br /> <span className="text-slate-300">Tactical Gravity</span></h2>
              <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl ml-auto">
                Raw data is processed through our sovereign neural network. We differentiate institutional accumulation from retail noise with 99.4% forensic accuracy.
              </p>
              <div className="flex gap-20 pt-10 justify-end">
                <div className="relative">
                  <div className="text-7xl font-black italic text-indigo-600 tracking-tighter drop-shadow-xl">99.4%</div>
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 border-r-2 border-indigo-200 pr-4">Deduction Accuracy</div>
                </div>
                <div className="relative">
                  <div className="text-7xl font-black italic text-cyan-600 tracking-tighter drop-shadow-xl">GPU+</div>
                  <div className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 border-r-2 border-cyan-200 pr-4">Neural compute clusters</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          WHALE EVENTS PREVIEW (MARKET)
          ───────────────────────────────────────────────────────────── */}
      <section id="market" className="py-56 px-12 bg-slate-50 relative overflow-hidden wave-surface">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="text-center space-y-10">
            <div className="inline-flex items-center gap-4 px-6 py-2 bg-white border border-slate-100 rounded-full shadow-md">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sub-Millisecond Pulse Stream</span>
            </div>
            <h2 className="text-[8vw] font-black text-slate-950 uppercase italic leading-[0.8] tracking-tighter">Live Institutional <br /> <span className="text-slate-300">Tactical Matrix</span></h2>
            <p className="text-2xl font-medium text-slate-500 max-w-4xl mx-auto leading-relaxed uppercase tracking-widest">
              Every event below captures a multi-million dollar institutional rotation, processed and delivered in real-time.
            </p>
          </div>

          <div className="bg-white rounded-[4rem] border border-slate-200 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.08)] overflow-hidden wave-surface wave-surface-light">
            <div className="flex items-center justify-between px-16 py-10 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 tabular-nums">Network Matrix Synchronized — {currentTime}</span>
              </div>
              <div className="flex gap-4">
                {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-slate-200" />)}
              </div>
            </div>
            <div className="divide-y divide-slate-100 overflow-hidden">
              {previewEvents.map((ev, i) => (
                <WhaleEventCard key={i} {...ev} />
              ))}
            </div>
            <div className="p-12 text-center bg-slate-50/30">
               <Link href="/vip" className="inline-flex items-center gap-4 px-12 py-5 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] hover:bg-black hover:scale-105 transition-all shadow-xl shadow-slate-200">
                  Connect to Forensic Hub <ArrowRight size={16} />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TECHNICAL CAPABILITIES GRID
          ───────────────────────────────────────────────────────────── */}
      <section className="py-40 px-12 relative">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-32 gap-12">
            <div className="space-y-6 max-w-3xl">
              <span className="text-indigo-600 font-mono font-bold text-sm tracking-widest uppercase italic underline decoration-indigo-400/30 underline-offset-8 decoration-4">Architectural Core</span>
              <h2 className="text-9xl lg:text-[10vw] font-black text-slate-950 uppercase italic leading-[0.8] tracking-tighter">Ultimate <br /> <span className="text-slate-300">Infrastructure</span></h2>
            </div>
            <p className="text-xl font-medium text-slate-500 max-w-md leading-relaxed">
              We leverage GPU-accelerated neural networks and ZK-privacy to deliver the fastest, most secure intelligence on the market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {API_CAPABILITIES.map((cap, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-10 bg-white rounded-[3rem] border border-slate-100 hover:border-cyan-500 transition-all duration-500 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-cyan-500 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                  <cap.icon size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter mb-4">{cap.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm uppercase tracking-wide">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          VISION GRID: WEB3 ECOSYSTEM
          ───────────────────────────────────────────────────────────── */}
      <section className="py-32 px-12 border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-4 px-6 py-2 bg-cyan-50 border border-cyan-100 rounded-full">
                <div className="w-2 h-2 rounded-full bg-cyan-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-600">Expansion Horizon</span>
              </div>
              <h2 className="text-[7vw] font-black text-slate-950 uppercase italic leading-[0.85] tracking-tighter">The Visionary <br /> <span className="text-slate-300">Architecture</span></h2>
            </div>
            <p className="text-lg font-medium text-slate-500 max-w-md leading-relaxed">
              Beyond monitoring. We are building a unified ecosystem for the next generation of sovereign financial participation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Metaverse Nexus', img: LANDING_ASSETS.metaverse, desc: 'Spatial monitoring of virtual economies and cross-metaverse liquidity flows.' },
              { title: 'NFT Forensic Lab', img: LANDING_ASSETS.nfts, desc: 'Deep-dive wash trading detection and high-rarity accumulation alerts.' },
              { title: 'Prism Network', img: LANDING_ASSETS.prisms, desc: 'Cross-chain bridging protocols with institutional liquidation protection.' },
              { title: 'Global Settlement', img: LANDING_ASSETS.global, desc: 'Real-time validation of cross-border institutional settlements.' },
              { title: 'Diamond Hand Protocol', img: LANDING_ASSETS.diamond, desc: 'Advanced analytics for long-term vaulting and supply shock prediction.' },
              { title: 'Market Spheres', img: LANDING_ASSETS.spheres, desc: 'GPU-rendered clusters of market dominance and liquidity depth.' }
            ].map((card, i) => (
              <motion.div 
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-1 bg-white rounded-[3rem] border border-slate-200 overflow-hidden hover:border-cyan-500 transition-all duration-500 shadow-xl shadow-slate-200/50"
              >
                <div className="relative h-96 rounded-[2.8rem] overflow-hidden mb-8">
                  <Image src={card.img} alt={card.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent" />
                </div>
                <div className="p-8 space-y-4">
                  <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">{card.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FINAL ACTION
          ───────────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center relative bg-white overflow-hidden py-32 wave-surface wave-surface-strong">
        <div className="absolute inset-0 opacity-20 transition-all duration-1000">
          <Image src={LANDING_ASSETS.intelligence} alt="Intelligence" fill className="object-cover saturate-0 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/40 to-white" />
        </div>
        
        <div className="relative z-10 text-center space-y-20 max-w-6xl px-6">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-[10vw] font-black leading-[0.8] tracking-tighter uppercase italic text-slate-950 px-4"
          >
            Execute Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Dominance</span>
          </motion.h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 pt-10">
            <Link href="/vip" className="px-16 py-8 bg-slate-950 text-white rounded-[2rem] text-xl font-black uppercase tracking-[0.4em] hover:bg-black hover:scale-105 transition-all shadow-2xl shadow-slate-300 flex items-center gap-8 group">
              Start Master Execution
              <ArrowRight className="group-hover:translate-x-4 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer className="relative py-32 px-12 border-t border-slate-100 bg-white overflow-hidden wave-surface">
        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-20">
            <div className="space-y-8 max-w-sm">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center">
                   <Landmark size={16} className="text-white" />
                 </div>
                 <span className="text-xl font-black tracking-tighter uppercase italic text-slate-950">Whale Alert Network Pro</span>
               </div>
               <p className="text-sm font-medium text-slate-400 leading-relaxed uppercase tracking-wider">
                 Empowering institutional traders with sub-millisecond on-chain intelligence and sovereign forensic depth.
               </p>
               <div className="flex gap-4">
                  {['Twitter', 'Discord', 'Telegram'].map(social => (
                    <div key={social} className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-950 hover:text-white transition-all cursor-pointer">
                      <Globe size={16} />
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-20">
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 italic">Infrastructure</h4>
                 <div className="flex flex-col gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Link href="/developers" className="hover:text-cyan-600">API Documentation</Link>
                    <Link href="/status" className="hover:text-cyan-600">Network Status</Link>
                    <Link href="/security" className="hover:text-cyan-600">Forensic Audits</Link>
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 italic">Participation</h4>
                 <div className="flex flex-col gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Link href="/vip" className="hover:text-cyan-600">Execution Terminal</Link>
                    <Link href="/portfolio" className="hover:text-cyan-600">Fusion Portfolio</Link>
                    <Link href="/governance" className="hover:text-cyan-600">DAO Governance</Link>
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 italic">Legal Identity</h4>
                 <div className="flex flex-col gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                    <Link href="/terms" className="hover:text-cyan-600">Service Terms</Link>
                    <Link href="/privacy" className="hover:text-cyan-600">Privacy Protocol</Link>
                    <Link href="/support" className="hover:text-cyan-600">Forensic Support</Link>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-20 border-t border-slate-50 text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
            <div>© 2026 Whale Alert Network Pro — Sovereign Institutional Vanguard</div>
            <div className="flex gap-10 mt-10 md:mt-0">
               <span>Optimal Performance (240Hz)</span>
               <span className="text-cyan-600">Lanzadera Submission Final</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
