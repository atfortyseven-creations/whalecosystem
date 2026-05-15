"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock, Activity, Globe } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { PRICING_TIERS, TIER_RANK } from '@/lib/config/pricing-tiers';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { motion } from 'framer-motion';

const FADE_UP: any = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

// ── Feature Cards ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Lock size={32} className="text-white mb-6" strokeWidth={1} />,
    title: 'Identity Attestation',
    desc: 'Verify network participants via zero-knowledge biometric proofs. No personal data is stored — only cryptographic proof of humanity is issued and anchored on-chain.',
  },
  {
    icon: <Activity size={32} className="text-white mb-6" strokeWidth={1} />,
    title: 'Protocol Transparency',
    desc: 'Gain complete visibility into the cryptographic layers of the network. Every transaction and identity claim is mathematically verifiable within the HumanID ecosystem.',
  },
  {
    icon: <Globe size={32} className="text-white mb-6" strokeWidth={1} />,
    title: 'Global Resolution',
    desc: 'Map multi-hop interactions across global chains. Our engine groups fragmented wallets into unified entities and resolves complex on-chain fingerprints.',
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
    <div className="min-h-screen bg-transparent text-white font-sans overflow-x-hidden selection:bg-white/10">

      <main className="relative z-10 w-full">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="w-full pt-36 pb-24 px-6 border-b border-white/10 bg-black/40 backdrop-blur-sm">
          <div className="max-w-[1400px] mx-auto flex flex-col items-start gap-8 text-left">
            <motion.div
              initial="hidden" animate="visible" variants={FADE_UP}
              className="flex flex-col items-start gap-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/70">Network Access Plans</span>
              </div>

              <h1 className="text-[52px] md:text-[84px] font-black uppercase tracking-tighter leading-[0.88] text-white">
                Service<br />
                <span className="text-white/30">Tiers.</span>
              </h1>

              <p className="text-[18px] md:text-[22px] font-sans text-white/60 max-w-2xl leading-tight">
                Select your access tier to unlock cryptographic identity attestation and real-time on-chain intelligence layers.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-white/10"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i} variants={FADE_UP}
                  className="flex flex-col border-r border-b border-white/10 p-12 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-500 group"
                >
                  {f.icon}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[16px] font-black uppercase tracking-tight text-white">{f.title}</h3>
                    <p className="text-[14px] text-white/50 leading-relaxed font-sans">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING CARDS ────────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-transparent">
          <div className="px-6 max-w-[1400px] mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={FADE_UP}
              className="mb-16"
            >
              <h2 className="text-[40px] md:text-[64px] font-black uppercase tracking-tighter text-white leading-none">
                Pricing <br /><span className="text-white/20">Plans.</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-white/10 border border-white/10 max-w-[2560px] mx-auto overflow-hidden text-left">
              {PRICING_TIERS.map((tier, index) => {
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative flex flex-col bg-black/40 backdrop-blur-sm p-12 md:p-16 hover:bg-black/50 transition-colors duration-300"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="mb-12">
                        <h2 className="text-[32px] md:text-[40px] font-black uppercase tracking-tighter leading-none mb-3 text-white">
                          {tier.name}
                        </h2>
                        <p className="font-mono text-[11px] text-white/40 uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                          {tier.tagline}
                        </p>
                      </div>

                      <div className="mb-12">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[56px] md:text-[72px] font-black tracking-tighter leading-none text-white">
                            {tier.priceMonthly}€
                          </span>
                          <span className="text-[12px] font-bold uppercase tracking-widest text-white/30">
                            / month
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 mb-16">
                        {tier.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                            <span className="text-[14px] leading-tight text-white/60 font-sans">
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSubscribeClick(tier.id)}
                        disabled={loadingTier === tier.id || (!isTierLoaded && isConnected)}
                        className={`w-full py-5 text-[11px] sm:text-[12px] text-center whitespace-nowrap font-bold transition-all flex items-center justify-center gap-2 sm:gap-3 border rounded-xl ${
                          tier.id === 'STANDARD'
                            ? 'bg-white text-black hover:bg-white/90 border-transparent'
                            : 'bg-transparent text-white hover:bg-white/10 border-white/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loadingTier === tier.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : tier.id === 'FREE' ? (
                          isConnected ? 'Current Plan' : 'Connect Wallet'
                        ) : (
                          'Select Plan'
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── WHY OUR NETWORK ─────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-black/30 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={FADE_UP}
              className="mb-16"
            >
              <h2 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter text-white mb-6">
                Professional <span className="text-white/30">Standards.</span>
              </h2>
              <p className="text-[16px] font-sans text-white/60 max-w-2xl">
                Identity and zero-trust communications protect your operations in a decentralized landscape.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <ProFeatureCard title="Biometric Binding" desc="Every identity is cryptographically bound to a physical biometric template via zero-knowledge proofs, eliminating synthetic identity risk." />
              <ProFeatureCard title="Network Transparency" desc="Direct, un-mediated access to the deepest layers of blockchain state, providing sub-millisecond telemetry for professional decision making." />
              <ProFeatureCard title="Encrypted Flow" desc="All communications and analytical requests are processed through our proprietary p2p encryption mesh, ensuring zero protocol-level leakage." />
            </div>
          </div>
        </section>

      </main>

      <SovereignFooter />
    </div>
  );
}

function ProFeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 p-0 group">
      <div className="w-12 h-px bg-white/40 transition-all group-hover:w-full duration-700" />
      <h3 className="text-[16px] font-black uppercase tracking-tight text-white">{title}</h3>
      <p className="text-[14px] text-white/50 leading-relaxed font-sans">{desc}</p>
    </div>
  );
}
