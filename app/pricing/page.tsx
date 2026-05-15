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

const FADE_UP: any = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

// ── Clean Institutional Feature Cards ────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Lock size={32} className="text-[#0a0a0a] dark:text-white mb-6" strokeWidth={1} />,
    title: 'KYC Identity Attestation',
    desc: 'Verify professional actors via zero-knowledge biometric proofs. Our protocol ensures that no personal data is stored, while guaranteeing the humanity of every network participant.',
  },
  {
    icon: <Activity size={32} className="text-[#0a0a0a] dark:text-white mb-6" strokeWidth={1} />,
    title: 'Protocol Transparency',
    desc: 'Gain visibility into the cryptographic layers of the network. We provide mathematical certainty for every transaction and identity claim within the HumanID ecosystem.',
  },
  {
    icon: <Globe size={32} className="text-[#0a0a0a] dark:text-white mb-6" strokeWidth={1} />,
    title: 'Global Resolution',
    desc: 'Map multi-hop interactions across global chains. We de-obfuscate mixer outputs and group fragmented wallets into unified professional entities.',
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
    <div className="min-h-screen bg-transparent text-[#0a0a0a] font-sans overflow-x-hidden selection:bg-black/10">

      <main className="relative z-10 w-full">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="w-full pt-32 pb-20 px-6 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A]">
          <div className="max-w-[2560px] mx-auto flex flex-col items-start gap-8 text-left">
            <motion.div
              initial="hidden" animate="visible" variants={FADE_UP}
              className="flex flex-col items-start gap-8"
            >
              <h1 className="text-[52px] md:text-[84px] font-black uppercase tracking-tighter leading-[0.88] text-[#0a0a0a] dark:text-white">
                Institutional<br />
                <span className="text-black/30 dark:text-white/30">Access.</span>
              </h1>

              <p className="text-[20px] md:text-[24px] font-sans text-[#0a0a0a]/60 dark:text-white/60 max-w-2xl leading-tight">
                Select your service tier to access the network's cryptographic identity and real-time intelligence layers.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-[#FAF9F6] dark:bg-[#050505] border-b border-black/10 dark:border-white/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-t border-l border-black/10 dark:border-white/10"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i} variants={FADE_UP}
                  className="flex flex-col border-r border-b border-black/10 dark:border-white/10 p-12 bg-white dark:bg-[#0A0A0A] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors duration-500 group"
                >
                  {f.icon}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-[18px] font-black uppercase tracking-tight text-[#0a0a0a] dark:text-white">{f.title}</h3>
                    <p className="text-[15px] text-[#0a0a0a]/50 dark:text-white/50 leading-relaxed font-sans">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING CARDS ────────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-white dark:bg-[#0A0A0A]">
          <div className="px-6 max-w-[1400px] mx-auto">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={FADE_UP}
              className="mb-16"
            >
              <h2 className="text-[40px] md:text-[64px] font-black uppercase tracking-tighter text-[#0a0a0a] dark:text-white leading-none">
                Pricing <br /><span className="text-black/20 dark:text-white/20">Plans.</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 max-w-[2560px] mx-auto overflow-hidden text-left">
              {PRICING_TIERS.map((tier, index) => {
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative flex flex-col bg-[#FAF9F6] dark:bg-[#111111] p-12 md:p-16"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="mb-12">
                        <h2 className="text-[32px] md:text-[40px] font-black uppercase tracking-tighter leading-none mb-3 text-[#0a0a0a] dark:text-white">
                          {tier.name}
                        </h2>
                        <p className="font-mono text-[11px] text-[#0a0a0a]/50 dark:text-white/50 uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                          {tier.tagline}
                        </p>
                      </div>

                      <div className="mb-12">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[56px] md:text-[72px] font-black tracking-tighter leading-none text-[#0a0a0a] dark:text-white">
                            {tier.priceMonthly}€
                          </span>
                          <span className="text-[12px] font-bold uppercase tracking-widest text-[#0a0a0a]/30 dark:text-white/30">
                            / month
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 mb-16">
                        {tier.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-3">
                            <div className="mt-1.5 w-1.5 h-1.5 bg-[#0a0a0a] dark:bg-white rounded-full shrink-0" />
                            <span className="text-[14px] leading-tight text-[#0a0a0a]/70 dark:text-white/70 font-sans">
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
                            ? 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 border-transparent'
                            : 'bg-transparent text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 border-black/10 dark:border-white/10'
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

        {/* ── WHY KYC ──────────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-36 bg-[#FAF9F6] dark:bg-[#050505] border-t border-black/10 dark:border-white/10">
          <div className="max-w-[1400px] mx-auto px-6">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={FADE_UP}
              className="mb-16"
            >
              <h2 className="text-[32px] md:text-[48px] font-black uppercase tracking-tighter text-[#0a0a0a] dark:text-white mb-6">
                Professional <span className="text-black/30 dark:text-white/30">Standards.</span>
              </h2>
              <p className="text-[16px] font-sans text-[#0a0a0a]/60 dark:text-white/60 max-w-2xl">
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
      <div className="w-12 h-px bg-black dark:bg-white transition-all group-hover:w-full duration-700" />
      <h3 className="text-[16px] font-black uppercase tracking-tight text-[#0a0a0a] dark:text-white">{title}</h3>
      <p className="text-[14px] text-[#0a0a0a]/60 dark:text-white/60 leading-relaxed font-sans">{desc}</p>
    </div>
  );
}

