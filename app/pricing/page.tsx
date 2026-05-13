"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Shield, Zap, Activity, Lock, LineChart, Cpu, Globe, Crosshair } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { PRICING_TIERS, TIER_RANK } from '@/lib/config/pricing-tiers';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { motion } from 'framer-motion';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

// Helper Components for Apple Device Mockups
function AppleMacBook({ src }: { src: string }) {
  return (
    <div className="relative w-full max-w-[1000px] mx-auto z-20 group perspective-[2000px]">
      <motion.div 
        initial={{ rotateX: 10, y: 40, opacity: 0 }}
        whileInView={{ rotateX: 0, y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="relative shadow-2xl"
      >
        {/* Screen Frame */}
        <div className="relative aspect-[16/10] bg-[#0A0A0A] rounded-t-[2rem] rounded-b-xl p-[10px] md:p-[14px] shadow-[0_0_50px_rgba(0,68,204,0.15)] border-t border-x border-[#333] z-10 transition-transform duration-700 group-hover:scale-[1.01]">
          {/* Notch */}
          <div className="absolute top-[10px] md:top-[14px] left-1/2 -translate-x-1/2 w-[100px] md:w-[150px] h-[24px] md:h-[32px] bg-[#0A0A0A] rounded-b-[18px] z-20 flex justify-center items-center">
            <div className="w-[6px] h-[6px] rounded-full bg-[#111] flex items-center justify-center border border-white/5">
              <div className="w-[3px] h-[3px] rounded-full bg-emerald-900/50" />
            </div>
          </div>
          {/* Display */}
          <div className="w-full h-full bg-[#050505] rounded-[1.2rem] md:rounded-[1.4rem] overflow-hidden relative">
            <img src={src} className="w-full h-full object-cover object-top" alt="System Interface" />
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] pointer-events-none" />
          </div>
        </div>
        {/* Base */}
        <div className="relative w-[114%] -left-[7%] h-[18px] md:h-[28px] bg-gradient-to-b from-[#555] via-[#222] to-[#0A0A0A] rounded-b-[2rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-0 flex justify-center">
          <div className="w-[18%] h-[5px] bg-[#111] rounded-b-md mt-1 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.1)]"></div>
        </div>
      </motion.div>
    </div>
  );
}

function AppleIPhone({ src, className = "" }: { src: string, className?: string }) {
  return (
    <div className={`relative w-[280px] md:w-[340px] aspect-[9/19.5] bg-black rounded-[55px] shadow-[0_0_0_2px_#444,0_0_0_8px_#111,0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden border-[10px] border-black z-20 group ${className}`}>
      {/* Dynamic Island */}
      <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-[20px] z-20 flex items-center justify-between px-3">
        <div className="w-[10px] h-[10px] rounded-full bg-[#111] border border-white/10" />
        <div className="w-[10px] h-[10px] rounded-full bg-[#111] border border-white/10 flex items-center justify-center">
           <div className="w-[4px] h-[4px] rounded-full bg-emerald-900/50" />
        </div>
      </div>
      {/* Screen */}
      <div className="w-full h-full bg-[#050505] overflow-hidden rounded-[45px] relative">
         <img src={src} className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105" alt="App Screen" />
         <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
      </div>
      {/* Volume Buttons & Power Button (Visual Only) */}
      <div className="absolute -left-[14px] top-[120px] w-[4px] h-[30px] bg-[#333] rounded-l-md" />
      <div className="absolute -left-[14px] top-[170px] w-[4px] h-[60px] bg-[#333] rounded-l-md" />
      <div className="absolute -left-[14px] top-[240px] w-[4px] h-[60px] bg-[#333] rounded-l-md" />
      <div className="absolute -right-[14px] top-[180px] w-[4px] h-[80px] bg-[#333] rounded-r-md" />
    </div>
  );
}

export default function PricingPage() {
  const { isConnected, isSovereignHandshake, address } = useSovereignAccount();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [isTierLoaded, setIsTierLoaded] = useState<boolean>(false);
  
  const { open } = useAppKit();

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user?.tier) {
          setCurrentTier(data.user.tier.split('_')[0].toUpperCase());
        }
      })
      .catch(() => {})
      .finally(() => setIsTierLoaded(true));
  }, [isConnected, isSovereignHandshake]);

  const currentTierLevel = TIER_RANK[currentTier as keyof typeof TIER_RANK] ?? 0;

  const handleSubscribeClick = async (planId: string) => {
    if (currentTierLevel >= (TIER_RANK[planId as keyof typeof TIER_RANK] ?? 0)) {
      toast.info('Access Level Already Granted'); 
      router.push('/dashboard');
      return;
    }
    
    if (!isConnected || !address) {
      toast.info('Please connect your wallet first');
      open({ view: 'Connect' });
      return;
    }
    
    setLoadingTier(planId);
    
    try {
      const r = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: planId,
          isAnnual: false,
        }),
      });

      const data = await r.json();

      if (r.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to initialize checkout');
      }
    } catch (err: any) {
      toast.error('Checkout error', { description: err.message });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans overflow-x-hidden selection:bg-[#0044CC]/20">
      
      {/* ── BACKGROUND LOTTIE & EFFECTS ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0044CC]/10 blur-[150px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[150px]" />
         <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
         
         <div className="absolute top-1/4 right-[10%] w-96 h-96 opacity-20 mix-blend-screen">
           <RemoteLottie path="https://lottie.host/93273e91-7f99-4a34-8c76-291ef7ed27eb/Q7Tj3HwKzX.json" />
         </div>
      </div>

      <main className="relative z-10 w-full pt-32 pb-24">
        
        {/* ── HEADER ── */}
        <div className="text-center mb-16 relative px-6 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <Zap size={14} className="text-[#0044CC]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Sovereign Intelligence Layer</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="text-[40px] md:text-[64px] lg:text-[80px] font-black uppercase tracking-tighter leading-[0.9] mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
            Absolute Control. <br className="hidden md:block" />
            <span className="text-[#0044CC]">Zero Compromise.</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[16px] md:text-[20px] text-white/50 font-serif max-w-3xl mx-auto leading-relaxed">
            Experience the most powerful cryptographic terminal ever built. Gain asymmetric market advantages with zero-latency mempool interception and military-grade P2P communications.
          </motion.p>
        </div>

        {/* ── MARKETING SHOWCASE: APPLE DEVICES ── */}
        <div className="w-full relative overflow-hidden py-16 mb-24">
          
          {/* Main Desktop Dashboard Showcase */}
          <div className="relative z-20 px-6 mb-32">
             <div className="text-center mb-12">
                <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-[#0044CC] mb-2">Tactical Dashboard</h3>
                <p className="text-white/40 font-mono text-[12px] uppercase tracking-widest">Real-Time Polymarket & DeFi Analytics</p>
             </div>
             <AppleMacBook src="/system-shots/Captura de pantalla 2026-05-13 192204.png" />
          </div>

          {/* Side-by-side Mobile & Desktop features */}
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
             <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex justify-center order-2 lg:order-1">
                <AppleIPhone src="/system-shots/Captura de pantalla 2026-05-10 002953.png" />
             </motion.div>
             <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-1 lg:order-2">
                <h3 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter text-white mb-6">Mobile Sovereign <span className="text-[#0044CC]">Operations.</span></h3>
                <p className="text-[18px] text-white/50 font-serif leading-relaxed mb-8">Execute trades, monitor the mempool, and manage cryptographic identities directly from your iPhone. Perfect synchronization with the desktop terminal via ZK-Rollups.</p>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3"><CheckCircle2 className="text-[#0044CC]" size={20} /><span className="text-white/80 font-medium">FaceID Biometric Authentication</span></div>
                   <div className="flex items-center gap-3"><CheckCircle2 className="text-[#0044CC]" size={20} /><span className="text-white/80 font-medium">One-Tap Liquidity Management</span></div>
                   <div className="flex items-center gap-3"><CheckCircle2 className="text-[#0044CC]" size={20} /><span className="text-white/80 font-medium">Encrypted Push Notifications</span></div>
                </div>
             </motion.div>
          </div>

          {/* Another Desktop Showcase */}
          <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
             <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
                <h3 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter text-white mb-6">Mempool <span className="text-[#0044CC]">Interception.</span></h3>
                <p className="text-[18px] text-white/50 font-serif leading-relaxed mb-8">The Whale Network scans raw Ethereum transactions before they are confirmed. Detect multi-million dollar liquidity movements and act before AMM spot prices shift.</p>
                <div className="flex flex-col gap-4">
                   <div className="flex items-center gap-3"><CheckCircle2 className="text-[#0044CC]" size={20} /><span className="text-white/80 font-medium">0ms Latency Bare-Metal Nodes</span></div>
                   <div className="flex items-center gap-3"><CheckCircle2 className="text-[#0044CC]" size={20} /><span className="text-white/80 font-medium">Smart Money Address Tracking</span></div>
                </div>
             </motion.div>
             <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex justify-center">
                <AppleMacBook src="/system-shots/Captura de pantalla 2026-05-13 191540.png" />
             </motion.div>
          </div>

          {/* Three iPhones Grid (Showcasing Chat, Academy, Settings) */}
          <div className="px-6 max-w-[1400px] mx-auto mb-16">
            <div className="text-center mb-16">
               <h3 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter text-white">Full Platform <span className="text-[#0044CC]">Immersion.</span></h3>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-8 lg:gap-16">
               <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="flex flex-col items-center">
                 <AppleIPhone src="/system-shots/Captura de pantalla 2026-05-10 002900.png" />
                 <p className="mt-8 text-[12px] font-black uppercase tracking-widest text-white/60">Whale Chat (P2P)</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col items-center md:-translate-y-12">
                 <AppleIPhone src="/system-shots/Captura de pantalla 2026-05-10 002811.png" />
                 <p className="mt-8 text-[12px] font-black uppercase tracking-widest text-white/60">Cryptographic Identity</p>
               </motion.div>
               <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col items-center">
                 <AppleIPhone src="/system-shots/Captura de pantalla 2026-05-13 191728.png" />
                 <p className="mt-8 text-[12px] font-black uppercase tracking-widest text-white/60">Live Order Books</p>
               </motion.div>
            </div>
          </div>

        </div>

        {/* ── PRICING BENTO GRID ── */}
        <div className="px-6 max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[40px] md:text-[64px] font-black uppercase tracking-tighter text-white">License <span className="text-[#0044CC]">Acquisition.</span></h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-32 relative z-20">
            {PRICING_TIERS.map((tier, index) => {
              const isStandard = tier.id === 'STANDARD';
              return (
                <motion.div 
                  key={tier.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`relative flex flex-col rounded-[2.5rem] border backdrop-blur-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${isStandard ? 'bg-[#0044CC]/[0.02] border-[#0044CC]/30 shadow-[0_0_80px_rgba(0,68,204,0.1)]' : 'bg-white/[0.02] border-white/10 hover:border-white/20'}`}
                >
                  {/* Glow */}
                  {isStandard && (
                    <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-br from-[#0044CC]/20 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />
                  )}

                  <div className="p-8 md:p-12 flex-1 flex flex-col relative z-10">
                    {tier.badge && (
                      <div className="mb-6 inline-flex self-start px-4 py-1.5 bg-[#0044CC]/10 border border-[#0044CC]/30 text-[#0044CC] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        {tier.badge}
                      </div>
                    )}

                    <div className="mb-8">
                      <h2 className={`text-[32px] md:text-[48px] font-black uppercase tracking-tighter leading-none mb-4 ${isStandard ? 'text-white' : 'text-white/80'}`}>
                        {tier.name}
                      </h2>
                      <p className="font-mono text-[13px] text-white/40 uppercase tracking-widest leading-relaxed">
                        {tier.tagline}
                      </p>
                    </div>

                    <div className="mb-12 pb-12 border-b border-white/10">
                      <div className="flex items-start gap-2">
                        <span className="text-[64px] md:text-[80px] font-black tracking-tighter leading-[0.8] text-white">
                          {tier.priceMonthly}€
                        </span>
                        <span className="text-[14px] font-bold uppercase tracking-widest text-white/30 pt-2">
                          / month
                        </span>
                      </div>
                    </div>

                    {/* Feature List */}
                    <div className="flex-1 space-y-5 mb-12">
                      {tier.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-4">
                          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${feature.highlight ? 'bg-[#0044CC]/20 text-[#0044CC]' : 'bg-white/5 text-white/40'}`}>
                            <CheckCircle2 size={14} strokeWidth={3} />
                          </div>
                          <span className={`text-[15px] leading-relaxed ${feature.highlight ? 'text-white font-medium' : 'text-white/60'}`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleSubscribeClick(tier.id)}
                      disabled={loadingTier === tier.id || (!isTierLoaded && isConnected)}
                      className={`w-full py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                        isStandard 
                          ? 'bg-[#0044CC] text-white hover:bg-[#0055FF] shadow-[0_0_30px_rgba(0,68,204,0.3)] hover:shadow-[0_0_50px_rgba(0,68,204,0.5)]' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loadingTier === tier.id ? (
                        <><Loader2 size={18} className="animate-spin" /> Authorizing...</>
                      ) : tier.id === 'FREE' ? (
                        isConnected ? (
                          <><CheckCircle2 size={18} /> Current Plan</>
                        ) : (
                          <><Lock size={18} /> Connect Wallet</>
                        )
                      ) : (
                        <><Shield size={18} /> Acquire License</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── DOWNHEAD: WHY UPGRADE TO PRO SECTION ── */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-6xl mx-auto pt-16 border-t border-white/10"
          >
            <div className="text-center mb-20">
              <h2 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter text-white mb-6">
                Why Upgrade to <span className="text-[#0044CC]">Whale Pro?</span>
              </h2>
              <p className="text-[18px] text-white/50 font-serif max-w-2xl mx-auto">
                In the institutional DeFi landscape, latency and asymmetric information are the only true edges. Here is what you unlock with the Pro tier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProFeatureCard 
                icon={<Activity size={24} />}
                title="Mass Transfer Interception"
                desc="Detect multi-million dollar liquidity movements before they impact AMM spot prices. Our node architecture listens directly to the mempool."
              />
              <ProFeatureCard 
                icon={<LineChart size={24} />}
                title="Yield & Flow Analytics"
                desc="Track smart money depositing into deep DeFi primitives. Uncover where the largest institutional wallets are parking their stablecoins."
              />
              <ProFeatureCard 
                icon={<Cpu size={24} />}
                title="Zero-Latency Nodes"
                desc="Bypass congested public RPC endpoints. Pro users are routed through our dedicated bare-metal infrastructure for instantaneous execution."
              />
              <ProFeatureCard 
                icon={<Globe size={24} />}
                title="Aztec & Morpho Visibility"
                desc="Gain deep visibility into complex layered protocols. We untangle obfuscated lending pools to give you clear counterparty risk metrics."
              />
              <ProFeatureCard 
                icon={<Lock size={24} />}
                title="ZK-Encrypted Priority"
                desc="Your communications and requests are processed with priority cryptographic signing, ensuring zero dropped messages in the Whale Chat network."
              />
              <ProFeatureCard 
                icon={<Crosshair size={24} />}
                title="Tactical Dashboard"
                desc="A completely unlocked dashboard allowing you to customize indicators, set custom algorithmic alerts, and export raw analytical data."
              />
            </div>
          </motion.div>

        </div>
      </main>

      <SovereignFooter />
    </div>
  );
}

function ProFeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.04] transition-colors group">
      <div className="w-14 h-14 rounded-2xl bg-[#0044CC]/10 text-[#0044CC] flex items-center justify-center mb-6 border border-[#0044CC]/20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-[18px] font-black uppercase tracking-wide text-white mb-3">{title}</h3>
      <p className="text-[14px] text-white/50 leading-relaxed font-serif">{desc}</p>
    </div>
  );
}
