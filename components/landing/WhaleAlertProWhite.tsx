"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Activity, Globe, Zap, 
  Menu, X, ChevronRight, Lock, Eye, 
  Database, Cpu, MessageSquare, BarChart3,
  TrendingUp, Layers, LifeBuoy, LogIn, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

// ── Types ───────────────────────────────────────────────────────────────────
interface PricingTier {
  id: string;
  name: string;
  priceMonthly: number;
  tagline: string;
  accentColor: string;
  badge?: string;
  highlight?: boolean;
  features: { text: string; included: boolean }[];
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'STARTER',
    name: 'Whale Starter',
    priceMonthly: 0,
    tagline: 'Basic on-chain visibility.',
    accentColor: '#888888',
    features: [
      { text: 'Real-time Whale Alerts', included: true },
      { text: 'Basic Market Analytics', included: true },
      { text: 'Community Chat Access', included: true },
      { text: 'Priority Node Access', included: false }
    ]
  },
  {
    id: 'PRO',
    name: 'Whale Pro',
    priceMonthly: 49,
    tagline: 'Professional tracking suite.',
    accentColor: '#00C076',
    badge: 'Popular',
    highlight: true,
    features: [
      { text: 'All Starter Features', included: true },
      { text: 'MEV Detection & Alerts', included: true },
      { text: 'Advanced Portfolio Tracking', included: true },
      { text: '0.1s Telemetry Latency', included: true }
    ]
  },
  {
    id: 'INSTITUTIONAL',
    name: 'Institutional',
    priceMonthly: 299,
    tagline: 'The ultimate firm-wide edge.',
    accentColor: '#9945FF',
    features: [
      { text: 'All Pro Features', included: true },
      { text: 'API Access & Webhooks', included: true },
      { text: 'Custom Forensic Reporting', included: true },
      { text: 'Dedicated Account Manager', included: true }
    ]
  },
  {
    id: 'LEGENDARY',
    name: 'Legendary',
    priceMonthly: 999,
    tagline: 'Zero-latency execution.',
    accentColor: '#FF9500',
    features: [
      { text: 'All Institutional Features', included: true },
      { text: 'Co-located Node Hosting', included: true },
      { text: 'Direct Market Execution', included: true },
      { text: '24/7 Forensic Concierge', included: true }
    ]
  }
];

const API_CAPABILITIES = [
  { icon: Zap, title: '0.1s Latency', desc: 'Real-time mempool streaming with millisecond precision.' },
  { icon: Shield, title: 'ZK Privacy', desc: 'Sovereign authentication with zero-knowledge verification.' },
  { icon: Cpu, title: 'GPU Mesh', desc: 'Distributed node network for high-concurrency analysis.' },
  { icon: Database, title: '10PB History', desc: 'Complete archival state of all major EVM networks.' }
];

const LANDING_ASSETS = {
  spheres: '/system-shots/istockphoto-1406830588-612x612.jpg',
  metaverse: '/system-shots/istockphoto-1413811800-612x612.jpg',
  nfts: '/system-shots/istockphoto-1365440263-612x612.jpg',
  prisms: '/system-shots/istockphoto-1400262450-612x612.jpg',
  global: '/system-shots/istockphoto-1153216843-612x612.jpg',
  diamond: '/system-shots/istockphoto-1412534575-612x612.jpg'
};

// ── Components ──────────────────────────────────────────────────────────────

function PricingCard(tier: PricingTier) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className={`group relative flex flex-col p-10 rounded-[3.5rem] border transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] ${
        tier.highlight ? 'bg-slate-950 text-white border-slate-800 shadow-2xl' : 'bg-white border-slate-100 hover:border-slate-300'
      }`}
    >
      {tier.badge && (
        <div className="absolute top-8 right-8 px-4 py-1.5 bg-cyan-500 text-white rounded-full font-mono text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse">
          {tier.badge}
        </div>
      )}
      
      <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] mb-8 opacity-40 italic">{tier.id}</span>
      <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">{tier.name}</h3>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-6xl font-black tracking-tighter">€{tier.priceMonthly}</span>
        <span className="text-xs font-mono font-bold uppercase tracking-widest opacity-40">/month</span>
      </div>
      <p className="font-medium text-slate-500 mb-10 leading-relaxed text-sm">{tier.tagline}</p>
      
      <div className="space-y-4 mb-12 flex-1">
        {tier.features.map((f, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
              f.included ? (tier.highlight ? 'bg-cyan-500 border-cyan-400' : 'bg-slate-950 border-slate-800') : 'opacity-20'
            }`}>
              {f.included && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${f.included ? 'opacity-100' : 'opacity-20'}`}>
              {f.text}
            </span>
          </div>
        ))}
      </div>
      
      <Link 
        href="/connect" 
        className={`w-full py-5 rounded-[2rem] font-mono text-[11px] font-black uppercase tracking-[0.4em] text-center transition-all ${
          tier.highlight ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-xl' : 'bg-slate-950 text-white hover:bg-black'
        }`}
      >
        Select Tier
      </Link>
    </motion.div>
  );
}

function WhaleEventCard({ type, amount, chain, time }: { type: string, amount: string, chain: string, time: string }) {
  return (
    <div className="flex items-center justify-between py-6 px-12 group hover:bg-slate-50 transition-colors duration-300">
      <div className="flex items-center gap-8">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic mb-1">Alert Matrix</span>
          <span className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">{type}</span>
        </div>
      </div>
      <div className="flex items-center gap-16">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic mb-1">{chain}</span>
          <span className="text-xl font-mono font-black text-slate-950">€{amount}</span>
        </div>
        <span className="text-[10px] font-black font-mono text-slate-300 uppercase tracking-widest">{time}</span>
      </div>
    </div>
  );
}

export default function WhaleAlertProWhite() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const router = useRouter();
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleEnterTerminal = () => {
    if (isConnected) router.push('/dashboard');
    else router.push('/connect');
  };

  const previewEvents = [
    { type: 'Institutional Buy', amount: '12,450,000', chain: 'Ethereum Mainnet', time: '02:44:12' },
    { type: 'Liquidity Injection', amount: '4,800,000', chain: 'Base Network', time: '02:45:01' },
    { type: 'Cross-Chain Bridge', amount: '2,900,000', chain: 'Arbitrum One', time: '02:46:55' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-950 selection:bg-cyan-500/20 font-sans overflow-x-hidden">
      
      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 w-full z-[100] px-6 md:px-12 py-8 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          <Link href="/" className="group flex items-center gap-4 bg-white/70 backdrop-blur-xl border border-slate-100 px-6 py-2 rounded-full hover:border-slate-300 transition-all shadow-xl shadow-slate-200/50">
            <div className="relative w-8 h-8">
              <Image src="/official-whale-monochrome.png" alt="Sovereign Whale" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-tighter leading-none">Whale Alert</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Network</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-2 bg-white/70 backdrop-blur-xl border border-slate-100 px-4 py-2 rounded-full shadow-xl shadow-slate-200/50">
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all group">
              <Activity size={16} className="text-slate-400 group-hover:text-cyan-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-950">Terminal</span>
            </Link>
            <Link href="/portfolio" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all group">
              <Layers size={16} className="text-slate-400 group-hover:text-indigo-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-950">Whale Profile</span>
            </Link>
            <Link href="/support" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all group">
              <LifeBuoy size={16} className="text-slate-400 group-hover:text-rose-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-950">Support</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-8 pointer-events-auto">
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Phase 01', href: '#infrastructure' },
              { label: 'Market', href: '#market' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'FAQ', href: '#faq' },
            ].map(item => (
              <a key={item.label} href={item.href} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-950 transition-colors">{item.label}</a>
            ))}
          </div>
          <button
            onClick={handleEnterTerminal}
            className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200"
          >
            {mounted && isConnected ? (
              <><span>Enter Dashboard</span><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /></>
            ) : (
              <><LogIn size={12} /><span>Enter Terminal</span></>
            )}
          </button>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-40 px-6">
        {/* Lottie Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.1] pointer-events-none flex items-center justify-center">
            <div className="w-full max-w-[1200px] aspect-square">
                <RemoteLottie path="Connected world.json" />
            </div>
        </div>

        <div className="max-w-[1400px] w-full mx-auto relative z-10 text-center space-y-16">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-4 px-8 py-3 bg-white border border-slate-100 rounded-full shadow-2xl shadow-slate-200/50"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Sovereign Intelligence v3.0</span>
            </motion.div>
            
            <h1 className="text-[15vw] lg:text-[13vw] font-black text-slate-950 uppercase italic leading-[0.75] tracking-tighter text-balance">
              Whale <br /> <span className="text-slate-300">Architecture</span>
            </h1>
          </div>

          <p className="text-2xl md:text-3xl font-medium text-slate-500 max-w-4xl mx-auto leading-relaxed text-balance">
            The world&apos;s most advanced cryptographic forensic engine. Real-time institutional telemetry, dark pool monitoring, and cross-chain liquidation radar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <button
              onClick={handleEnterTerminal}
              className="group relative flex items-center gap-6 px-16 py-8 bg-slate-950 text-white rounded-[2.5rem] shadow-2xl shadow-slate-400/30 hover:bg-black hover:scale-105 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-[13px] font-black uppercase tracking-[0.6em]">Initialize Session</span>
              <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <div className="flex items-center gap-4 bg-white border border-slate-100 px-8 py-4 rounded-full shadow-lg">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden relative shadow-sm">
                    <Image src={`/system-shots/istockphoto-1153216843-612x612.jpg`} alt="User" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Used by 400+ Firms</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] rotate-90 mb-4">Scroll to explore</span>
          <div className="w-px h-24 bg-gradient-to-b from-slate-950 to-transparent" />
        </div>
      </section>

      {/* ─── LIVE DATA STRIP ─── */}
      <section className="py-20 px-6 md:px-12 relative overflow-hidden" id="market">
        <div className="max-w-[1400px] mx-auto">
          <div className="bg-white rounded-[4rem] border border-slate-200 shadow-[0_80px_150px_-30px_rgba(0,0,0,0.08)] overflow-hidden">
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
               <Link href="/connect" className="inline-flex items-center gap-4 px-12 py-5 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.5em] hover:bg-black hover:scale-105 transition-all shadow-xl shadow-slate-200">
                  Connect to Forensic Hub <ArrowRight size={16} />
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECHNICAL CAPABILITIES GRID ─── */}
      <section id="capabilities" className="py-40 px-12 relative" aria-label="Ultimate Infrastructure">
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

          <div className="mt-40 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-[4rem] border border-slate-100 p-16 shadow-2xl shadow-slate-200/30 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 translate-x-20 z-0" />
            
            <div className="relative z-10 space-y-12">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Forensic Analysis</span>
                    </div>
                    <h3 className="text-7xl font-black text-slate-950 uppercase italic leading-[0.85] tracking-tighter">Big Data <br/> <span className="text-slate-300">Analytics</span></h3>
                    <p className="text-xl font-medium text-slate-500 leading-relaxed max-w-lg">
                        Our intelligence engine processes over 12TB of raw on-chain data daily, identifying hidden whale clusters and front-running attempts before they hit the public mempool.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {[
                        { label: 'Latency', val: '0.1s' },
                        { label: 'Integrity', val: '100%' },
                        { label: 'Uptime', val: '99.9%' },
                        { label: 'Security', val: 'AES-256' }
                    ].map(s => (
                        <div key={s.label} className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
                            <div className="text-3xl font-black text-slate-950 font-mono tracking-tighter">{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 aspect-square max-w-[600px] w-full mx-auto">
                <RemoteLottie path="Big Data Analytics.json" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── DARK POOL & METAVERSE ─── */}
      <section className="py-40 px-12 bg-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto space-y-40">
          
          {/* Dark Pool Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="relative aspect-[4/3] rounded-[4rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl group">
                <Image src={LANDING_ASSETS.spheres} alt="Dark Pool" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                <div className="absolute bottom-10 left-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                        <Activity size={24} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 italic">Module: DPR-01</span>
                        <span className="text-2xl font-black text-white uppercase italic tracking-tighter">Dark Pool Radar</span>
                    </div>
                </div>
             </div>
             <div className="space-y-8">
                <h2 className="text-8xl font-black text-slate-950 uppercase italic leading-[0.8] tracking-tighter">
                    Illuminate <br /><span className="text-slate-300">The Unseen</span>
                </h2>
                <p className="text-xl font-medium text-slate-500 leading-relaxed">
                    Standard order books only show what they want you to see. Our Dark Pool Radar aggregates OTC block trades and hidden liquidity movements across 14 major venues.
                </p>
                <ul className="space-y-4">
                    {["OTC Block Detection", "Cross-Chain Liquidity", "Hidden Accumulation"].map(t => (
                        <li key={t} className="flex items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-widest">
                            <CheckCircle2 size={18} className="text-cyan-500" /> {t}
                        </li>
                    ))}
                </ul>
             </div>
          </div>

          {/* Ecosystem Metaverse */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div className="order-2 lg:order-1 space-y-8">
                <h2 className="text-8xl font-black text-slate-950 uppercase italic leading-[0.8] tracking-tighter text-right">
                    Ecosystem <br /><span className="text-slate-300">Metaverse</span>
                </h2>
                <p className="text-xl font-medium text-slate-500 leading-relaxed text-right">
                    Navigate the blockchain in 3D. Our topological graph engine visualizes wallet interactions and entity clusters with unparalleled depth.
                </p>
                <div className="flex justify-end gap-4 pt-4">
                    {["3D Wallet Graphs", "Sybil Identification"].map(t => (
                        <span key={t} className="px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">{t}</span>
                    ))}
                </div>
             </div>
             <div className="order-1 lg:order-2 relative aspect-square rounded-[4rem] overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center p-12">
                <div className="absolute inset-0 opacity-40">
                   <Image src={LANDING_ASSETS.metaverse} alt="Metaverse" fill className="object-cover mix-blend-luminosity" />
                </div>
                <div className="relative w-full h-full">
                    <RemoteLottie path="Metaverse animations.json" className="scale-110" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ─── NODE NETWORK ─── */}
      <section id="infrastructure" className="py-40 px-12 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-[1400px] mx-auto">
            <div className="mt-20 flex flex-col md:flex-row items-center gap-20 bg-white rounded-[4rem] border border-slate-200 p-20 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="relative w-full max-w-[500px] aspect-square shrink-0">
                    <div className="absolute inset-0 bg-cyan-100/30 blur-[100px] rounded-full" />
                    <RemoteLottie path="DeeWork About Blockchain.json" className="relative z-10" />
                </div>
                <div className="space-y-8 flex-1">
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Sovereign Protocol</span>
                    </div>
                    <h3 className="text-8xl font-black uppercase italic tracking-tighter text-slate-950 leading-[0.8]">Global Node <br/> <span className="text-slate-300">Network</span></h3>
                    <p className="text-xl font-medium text-slate-500 leading-relaxed text-justify">
                        Our intelligence infrastructure runs across a globally distributed node mesh with no single point of failure. Each node independently validates on-chain events before they reach the API layer.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        {['99.99% Uptime SLA', 'Multi-region deployment', 'Zero mock data policy'].map(tag => (
                        <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-500">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing" className="py-40 px-12 bg-white relative overflow-hidden" aria-label="Pricing Tiers">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8 mb-24">
            <div className="inline-flex items-center gap-4 px-6 py-2 bg-slate-50 border border-slate-100 rounded-full shadow-md">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sovereign Access Tiers</span>
            </div>
            <h2 className="text-[10vw] font-black text-slate-950 uppercase italic leading-[0.8] tracking-tighter text-center">Select Your <br /><span className="text-slate-300">Protocol</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PRICING_TIERS.map((tier, i) => (
              <PricingCard key={i} {...tier} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section id="faq" className="py-40 px-12 bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-24 space-y-6">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 italic">Operational Protocol</span>
                <h2 className="text-7xl font-black text-slate-950 uppercase italic tracking-tighter">System FAQ</h2>
            </div>
            
            <div className="space-y-4">
                {[
                    { q: "Is the data really live?", a: "Our proprietary node network streams mempool data with a latency of under 100ms, ensuring you see institutional moves before they are confirmed on-chain." },
                    { q: "How is my privacy protected?", a: "We use E2EE and ZK-privacy layers. We never store your wallet's private keys, and all session data is cryptographically ephemeral." },
                    { q: "Can I cancel my tier at any time?", a: "Yes. All subscriptions are handled via smart contracts (or SEPA), and can be modified or terminated instantly through your dashboard." }
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-[2.5rem] p-10 hover:border-slate-300 transition-all">
                        <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">{item.q}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">{item.a}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* ─── FOOTER BAR ─── */}
      <footer className="py-20 px-12 border-t border-slate-100 bg-white">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-6">
                <div className="relative w-10 h-10">
                    <Image src="/official-whale-monochrome.png" alt="Sovereign Whale" fill className="object-contain" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black uppercase tracking-tighter">Whale Alert Network</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Sovereign Submission Final</span>
                </div>
            </div>
            
            <div className="flex items-center gap-12">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">© 2026 atfortyseven-creations</span>
                <div className="flex items-center gap-6">
                    <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-colors">Telegram</a>
                    <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-950 transition-colors">Twitter</a>
                </div>
            </div>
        </div>
      </footer>

    </div>
  );
}
