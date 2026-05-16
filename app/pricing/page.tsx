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
    title: 'Quantum-Resistant Hash Integrity',
    desc: 'Every document, medical record, or data point is secured utilizing post-quantum cryptography. We process trillions of security parameters to ensure your data remains completely sovereign and immutable for eternity.',
  },
  {
    title: 'Zero-Knowledge Global Attestation',
    desc: 'Verify identity and documentation instantly anywhere in the world without exposing underlying personal data. The architecture mathematically proves truth without centralized vulnerability.',
  },
  {
    title: 'Unmediated On-Chain Resolution',
    desc: 'Direct access to the deepest layers of blockchain state. Our proprietary heuristic engines execute millions of verifications per second, forging a future where truth is absolute and mathematically guaranteed.',
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
    <div className="w-full flex-1 flex flex-col bg-transparent text-white font-sans selection:bg-emerald-500/30">
      <div className="relative z-10 w-full">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="w-full pt-36 pb-24 px-6 border-b border-white/10 relative z-10 flex flex-col justify-center items-center">
          <div className="w-full max-w-[1400px] mx-auto text-center space-y-8">
            <motion.div
              initial="hidden" animate="visible" variants={FADE_UP}
              className="flex flex-col items-center gap-8"
            >
              <div className="flex items-center gap-4 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Trillions of Parameters. One Truth.</span>
              </div>

              <h1 className="text-[64px] md:text-[100px] font-black uppercase tracking-tighter leading-[0.85] text-white">
                The Future of<br />
                <span className="text-white/20">Absolute Truth.</span>
              </h1>

              <p className="text-[18px] md:text-[22px] font-serif text-white/50 max-w-3xl leading-relaxed mt-4 mx-auto">
                Secure your sovereign identity and access the most advanced cryptographic infrastructure ever deployed. We process trillions of security parameters to guarantee a future built on undeniable reality.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
        <section className="w-full py-24 relative z-10">
          <div className="max-w-[1400px] mx-auto px-6">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i} variants={FADE_UP}
                  className="bg-white/[0.03] backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] p-12 flex flex-col justify-between hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-500 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-10 group-hover:bg-emerald-500/20 transition-colors duration-500 border border-white/10">
                    <span className="font-mono text-[14px] font-black text-white/50 group-hover:text-emerald-400 transition-colors duration-500">0{i+1}</span>
                  </div>
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[24px] font-black uppercase tracking-tight text-white">{f.title}</h3>
                    <p className="text-[16px] text-white/40 leading-relaxed font-serif">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING CARDS ────────────────────────────────────────────────── */}
        <section className="w-full py-24 bg-transparent relative z-10">
          <div className="px-6 max-w-[1400px] mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={FADE_UP}
              className="mb-16 text-center"
            >
              <h2 className="text-[40px] md:text-[64px] font-black uppercase tracking-tighter text-white leading-none">
                Sovereign <br /><span className="text-white/20">Access.</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
              {PRICING_TIERS.map((tier, index) => {
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative flex flex-col bg-white/[0.02] backdrop-blur-[40px] rounded-[3rem] border border-white/10 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)] p-12 md:p-16 hover:border-white/30 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-500"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="mb-12 border-b border-white/10 pb-10">
                        <h2 className="text-[40px] font-black uppercase tracking-tighter leading-none mb-4 text-white">
                          {tier.name}
                        </h2>
                        <p className="font-mono text-[11px] text-emerald-400 uppercase tracking-[0.2em] leading-relaxed max-w-sm font-bold">
                          {tier.tagline}
                        </p>
                      </div>

                      <div className="mb-12">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[56px] md:text-[72px] font-black tracking-tighter leading-none text-white">
                            {tier.priceMonthly}€
                          </span>
                          <span className="text-[12px] font-black uppercase tracking-widest text-white/30">
                            / month
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-5 mb-16">
                        {tier.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-4">
                            <div className="mt-1.5 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                            <span className="text-[15px] leading-relaxed text-white/60 font-serif font-medium">
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSubscribeClick(tier.id)}
                        disabled={loadingTier === tier.id || (!isTierLoaded && isConnected)}
                        className={`w-full py-5 text-[11px] sm:text-[12px] text-center whitespace-nowrap font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 rounded-[1.5rem] shadow-sm ${
                          tier.id === 'STANDARD'
                            ? 'bg-emerald-500 text-black hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                            : 'bg-white/5 border border-white/20 text-white hover:bg-white/10'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loadingTier === tier.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : tier.id === 'FREE' ? (
                          isConnected ? 'Current Plan' : 'Connect Wallet'
                        ) : (
                          'Initialize Access'
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
        <section className="w-full py-24 md:py-36 border-t border-white/10 relative z-10 bg-transparent">
          <div className="max-w-[1400px] mx-auto px-6">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={FADE_UP}
              className="mb-16 flex flex-col items-center text-center"
            >
              <h2 className="text-[40px] md:text-[56px] font-black uppercase tracking-tighter text-white mb-6 leading-none">
                Inhuman <span className="text-white/30">Precision.</span>
              </h2>
              <p className="text-[18px] font-serif text-white/50 max-w-2xl leading-relaxed">
                We engineered a future where billions of security calculations happen invisibly, securing your identity and health against any adversary.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ProFeatureCard title="Quantum Resistance" desc="Mathematical certainty that outpaces even the theoretical limits of next-generation quantum decryption computers." />
              <TrillionsFeatureCard title="Trillion-Parameter Engine" desc="Our verification core analyzes an unprecedented matrix of data points to confirm authenticity with zero human error." />
              <ProFeatureCard title="Post-State Sovereignty" desc="No central authority owns your data. You hold the ultimate cryptographic key to your health and financial reality." />
            </div>
          </div>
        </section>

      </div>

      <SovereignFooter />
    </div>
  );
}

function ProFeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 p-8 bg-white/[0.03] backdrop-blur-[40px] rounded-[2.5rem] border border-white/10 shadow-sm hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-500 group">
      <div className="w-12 h-[2px] bg-white/20 transition-all group-hover:bg-emerald-500 group-hover:w-full duration-700 rounded-full shadow-[0_0_10px_rgba(16,185,129,0)] group-hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
      <h3 className="text-[20px] font-black uppercase tracking-tight text-white">{title}</h3>
      <p className="text-[15px] text-white/50 leading-relaxed font-serif">{desc}</p>
    </div>
  );
}

function TrillionsFeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 p-8 bg-emerald-500/5 backdrop-blur-[40px] rounded-[2.5rem] border border-emerald-500/20 shadow-sm hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:-translate-y-1 transition-all duration-500 group">
      <div className="w-12 h-[2px] bg-emerald-500 transition-all group-hover:w-full duration-700 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
      <h3 className="text-[20px] font-black uppercase tracking-tight text-emerald-400">{title}</h3>
      <p className="text-[15px] text-white/50 leading-relaxed font-serif">{desc}</p>
    </div>
  );
}
