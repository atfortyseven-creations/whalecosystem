"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Zap, Activity, Lock, LineChart, Cpu, Globe, Crosshair, ArrowRight } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { PRICING_TIERS, TIER_RANK } from '@/lib/config/pricing-tiers';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { motion } from 'framer-motion';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

// ── Lottie Feature Cards ──────────────────────────────────────────────────────
const FEATURES = [
  {
    lottie: 'Big Data Analytics.json',
    title: 'Mempool Intelligence',
    desc: 'Intercept institutional-scale transactions milliseconds after they are signed. Our bare-metal node mesh feeds directly from the raw Ethereum mempool, providing pre-execution alpha unavailable to any public RPC consumer.',
  },
  {
    lottie: 'Trade.json',
    title: 'Pre-Execution Tracking',
    desc: 'Relying on block confirmations means you are already late. We detect and classify multi-million dollar liquidity movements before AMM spot prices shift — giving you the asymmetric edge that defines institutional performance.',
  },
  {
    lottie: 'Connected world.json',
    title: 'Entity Resolution',
    desc: 'Map complex multi-hop interactions across chains. We de-obfuscate mixer outputs in real-time and group fragmented wallets into unified institutional entities, delivering counterparty clarity at the deepest protocol layer.',
  },
];

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
        body: JSON.stringify({ tier: planId, isAnnual: false }),
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
    <div className="min-h-screen bg-[#FAFAF8] text-[#0a0a0a] font-sans overflow-x-hidden selection:bg-[#0044CC]/10">

      <main className="relative z-10 w-full">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="w-full pt-28 pb-20 px-6 border-b border-black/5">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
            <motion.div
              initial="hidden" animate="visible" variants={FADE_UP}
              className="flex flex-col items-center gap-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/8 shadow-sm">
                <Zap size={12} className="text-[#0044CC]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a0a0a]/60">Institutional Intelligence Layer</span>
              </div>

              <h1 className="text-[44px] md:text-[72px] font-black uppercase tracking-tighter leading-[0.92] text-[#0a0a0a]">
                Absolute Control.<br />
                <span className="text-[#0044CC]">Zero Compromise.</span>
              </h1>

              <p className="text-[17px] md:text-[20px] font-serif text-[#0a0a0a]/50 max-w-2xl leading-relaxed">
                The most powerful cryptographic terminal for decentralized markets. Gain asymmetric advantages with zero-latency mempool intelligence and military-grade P2P communications.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── LOTTIE FEATURE STRIP ──────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-white border-b border-black/5">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i} variants={FADE_UP}
                  className="flex flex-col rounded-[2.5rem] border border-black/6 bg-[#FAFAF8] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
                >
                  <div className="w-full h-[260px] flex items-center justify-center p-8 bg-white border-b border-black/5 group-hover:bg-slate-50 transition-colors">
                    <RemoteLottie path={f.lottie} className="w-full h-full" />
                  </div>
                  <div className="p-8 flex flex-col gap-4">
                    <h3 className="text-[18px] font-black uppercase tracking-tight text-[#0a0a0a]">{f.title}</h3>
                    <p className="text-[14px] text-[#0a0a0a]/50 leading-relaxed font-serif">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING CARDS ────────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-[#FAFAF8]">
          <div className="px-6 max-w-[1400px] mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={FADE_UP}
              className="text-center mb-16"
            >
              <h2 className="text-[36px] md:text-[56px] font-black uppercase tracking-tighter text-[#0a0a0a]">
                License <span className="text-[#0044CC]">Acquisition.</span>
              </h2>
              <p className="text-[16px] font-serif text-[#0a0a0a]/50 mt-4 max-w-xl mx-auto">
                Select the access tier that matches your operational requirements.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {PRICING_TIERS.map((tier, index) => {
                const isStandard = tier.id === 'STANDARD';
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`relative flex flex-col rounded-[2.5rem] border overflow-hidden transition-all duration-500 hover:-translate-y-1 ${
                      isStandard
                        ? 'bg-white border-[#0044CC]/20 shadow-[0_0_60px_rgba(0,68,204,0.08)]'
                        : 'bg-white border-black/8 hover:shadow-xl'
                    }`}
                  >
                    {isStandard && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#0044CC]" />
                    )}

                    <div className="p-8 md:p-12 flex-1 flex flex-col">
                      {tier.badge && (
                        <div className="mb-6 inline-flex self-start px-4 py-1.5 bg-[#0044CC]/8 border border-[#0044CC]/15 text-[#0044CC] rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                          {tier.badge}
                        </div>
                      )}

                      <div className="mb-8">
                        <h2 className="text-[32px] md:text-[42px] font-black uppercase tracking-tighter leading-none mb-3 text-[#0a0a0a]">
                          {tier.name}
                        </h2>
                        <p className="font-mono text-[12px] text-[#0a0a0a]/40 uppercase tracking-widest leading-relaxed">
                          {tier.tagline}
                        </p>
                      </div>

                      <div className="mb-10 pb-10 border-b border-black/6">
                        <div className="flex items-start gap-2">
                          <span className="text-[56px] md:text-[72px] font-black tracking-tighter leading-[0.85] text-[#0a0a0a]">
                            {tier.priceMonthly}€
                          </span>
                          <span className="text-[13px] font-bold uppercase tracking-widest text-[#0a0a0a]/30 pt-3">
                            / month
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 mb-10">
                        {tier.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-3">
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              feature.highlight ? 'bg-[#0044CC] text-white' : 'bg-black/5 text-[#0a0a0a]/40'
                            }`}>
                              <CheckCircle2 size={12} strokeWidth={3} />
                            </div>
                            <span className={`text-[14px] leading-relaxed ${
                              feature.highlight ? 'text-[#0a0a0a] font-medium' : 'text-[#0a0a0a]/50'
                            }`}>
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSubscribeClick(tier.id)}
                        disabled={loadingTier === tier.id || (!isTierLoaded && isConnected)}
                        className={`w-full py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                          isStandard
                            ? 'bg-[#0044CC] text-white hover:bg-[#0033AA] shadow-[0_4px_24px_rgba(0,68,204,0.25)] hover:shadow-[0_8px_32px_rgba(0,68,204,0.35)]'
                            : 'bg-[#0a0a0a] text-white hover:bg-black/80'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {loadingTier === tier.id ? (
                          <><Loader2 size={16} className="animate-spin" /> Authorizing...</>
                        ) : tier.id === 'FREE' ? (
                          isConnected ? (
                            <><CheckCircle2 size={16} /> Current Plan</>
                          ) : (
                            <><Lock size={16} /> Connect Wallet</>
                          )
                        ) : (
                          <><ArrowRight size={16} /> Acquire License</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── WHY UPGRADE ──────────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-white border-t border-black/5">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-20">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={FADE_UP}
              className="text-center mb-16"
            >
              <h2 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter text-[#0a0a0a] mb-4">
                Why Upgrade to <span className="text-[#0044CC]">Whale Pro?</span>
              </h2>
              <p className="text-[16px] font-serif text-[#0a0a0a]/50 max-w-2xl mx-auto">
                In the institutional DeFi landscape, latency and asymmetric information are the only true edges. Here is what you unlock.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProFeatureCard icon={<Activity size={22} />} title="Mass Transfer Interception" desc="Detect multi-million dollar liquidity movements before they impact AMM spot prices. Our node architecture listens directly to the mempool." />
              <ProFeatureCard icon={<LineChart size={22} />} title="Yield & Flow Analytics" desc="Track smart money depositing into deep DeFi primitives. Uncover where the largest institutional wallets are parking their stablecoins." />
              <ProFeatureCard icon={<Cpu size={22} />} title="Zero-Latency Nodes" desc="Bypass congested public RPC endpoints. Pro users are routed through our dedicated bare-metal infrastructure for instantaneous execution." />
              <ProFeatureCard icon={<Globe size={22} />} title="Aztec & Morpho Visibility" desc="Gain deep visibility into complex layered protocols. We untangle obfuscated lending pools to give you clear counterparty risk metrics." />
              <ProFeatureCard icon={<Lock size={22} />} title="ZK-Encrypted Priority" desc="Your communications and requests are processed with priority cryptographic signing, ensuring zero dropped messages in the Whale Chat network." />
              <ProFeatureCard icon={<Crosshair size={22} />} title="Tactical Dashboard" desc="A completely unlocked dashboard allowing you to customize indicators, set custom algorithmic alerts, and export raw analytical data." />
            </div>
          </div>
        </section>

      </main>

      <SovereignFooter />
    </div>
  );
}

function ProFeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-[#FAFAF8] border border-black/6 p-8 rounded-[2rem] hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-2xl bg-white border border-black/8 text-[#0044CC] flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <h3 className="text-[15px] font-black uppercase tracking-wide text-[#0a0a0a] mb-3">{title}</h3>
      <p className="text-[13px] text-[#0a0a0a]/50 leading-relaxed font-serif">{desc}</p>
    </div>
  );
}

