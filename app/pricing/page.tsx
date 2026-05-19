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
    title: 'High-Fidelity Document Integrity',
    desc: 'Every medical record and institutional document is secured using advanced cryptographic hashing. We provide a definitive proof of authenticity, ensuring data remains immutable and verified on-chain.',
  },
  {
    title: 'Zero-Knowledge Privacy Layer',
    desc: 'Verify identity and sensitive documentation without exposing underlying personal data. Our architecture provides mathematical proof of validity without creating centralized vulnerabilities.',
  },
  {
    title: 'On-Chain Verification Engine',
    desc: 'Direct access to decentralized ledger states. Our high-performance engines execute millions of cryptographic verifications per second, providing a secure foundation for institutional data management.',
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
    <div className="w-full min-h-screen flex flex-col bg-[#FAFAF8] text-black font-sans selection:bg-black/10">
      <div className="relative z-10 w-full flex flex-col items-center">

        {/* ── HERO ──────────────────────────────────────────── */}
        <section className="w-full pt-36 pb-24 px-6 border-b border-black/5 relative z-10 flex flex-col justify-center items-center text-center">
          <div className="w-full max-w-[1400px] mx-auto space-y-10">
            <motion.div
              initial="hidden" animate="visible" variants={FADE_UP}
              className="flex flex-col items-center gap-8"
            >


              <h1 className="text-[64px] md:text-[100px] font-black uppercase tracking-tighter leading-[0.85] text-[#050505]">
                System <br />
                <span className="text-black/20">Access Plans.</span>
              </h1>

              <p className="text-[18px] md:text-[24px] font-serif text-black/60 max-w-3xl leading-relaxed mt-4 mx-auto">
                Establish your institutional identity and access the core infrastructure of the Whale Alert Network. We provide high-integrity cryptographic verifications to guarantee data authenticity and operational security.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
        <section className="w-full py-24 relative z-10 flex flex-col items-center">
          <div className="max-w-[1400px] mx-auto px-6 w-full">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {FEATURES.map((f, i) => (
                <motion.div
                  key={i} variants={FADE_UP}
                  className="bg-white rounded-[3rem] border border-black/5 shadow-sm p-12 flex flex-col justify-between hover:border-black/20 hover:bg-[#F8F8F8] hover:-translate-y-1 transition-all duration-500 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center mb-10 group-hover:bg-black group-hover:text-white transition-colors duration-500 border border-black/5">
                    <span className="font-mono text-[14px] font-black text-black/20 group-hover:text-white transition-colors duration-500">0{i+1}</span>
                  </div>
                  <div className="flex flex-col gap-5">
                    <h3 className="text-[24px] font-black uppercase tracking-tight text-[#050505]">{f.title}</h3>
                    <p className="text-[16px] text-black/50 leading-relaxed font-serif">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING CARDS ────────────────────────────────────────────────── */}
        <section className="w-full py-24 bg-transparent relative z-10 flex flex-col items-center">
          <div className="px-6 max-w-[1400px] mx-auto w-full">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
              variants={FADE_UP}
              className="mb-20 text-center"
            >
              <h2 className="text-[40px] md:text-[80px] font-black uppercase tracking-tighter text-[#050505] leading-none">
                Access <br /><span className="text-black/20">Structure.</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-left">
              {PRICING_TIERS.map((tier, index) => {
                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="relative flex flex-col bg-white rounded-[3rem] border border-black/5 shadow-sm p-12 md:p-16 hover:border-black/20 hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="flex-1 flex flex-col">
                      <div className="mb-12 border-b border-black/5 pb-10">
                        <h2 className="text-[48px] font-black uppercase tracking-tighter leading-none mb-4 text-[#050505]">
                          {tier.name}
                        </h2>
                        <p className="font-mono text-[11px] text-black/40 uppercase tracking-[0.2em] leading-relaxed max-w-sm font-bold">
                          {tier.tagline}
                        </p>
                      </div>

                      <div className="mb-12">
                        <div className="flex items-baseline gap-3">
                          <span className="text-[64px] md:text-[80px] font-black tracking-tighter leading-none text-[#050505]">
                            {tier.priceMonthly}€
                          </span>
                          <span className="text-[12px] font-black uppercase tracking-widest text-black/30">
                            / month
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-6 mb-16">
                        {tier.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-4">
                            <div className="mt-2 w-2 h-2 bg-black rounded-full shrink-0" />
                            <span className="text-[16px] leading-relaxed text-black/60 font-serif font-medium">
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSubscribeClick(tier.id)}
                        disabled={loadingTier === tier.id || (!isTierLoaded && isConnected) || currentTierLevel >= (TIER_RANK[tier.id as keyof typeof TIER_RANK] ?? 0)}
                        className={`w-full py-6 text-[12px] text-center font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 rounded-[2rem] shadow-sm ${
                          tier.id === 'STANDARD'
                            ? 'bg-black text-white hover:bg-black/80 shadow-xl'
                            : 'bg-black/5 border border-black/5 text-black hover:bg-black/10'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {loadingTier === tier.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : !isTierLoaded ? (
                          <div className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> SYNCING...</div>
                        ) : currentTierLevel >= (TIER_RANK[tier.id as keyof typeof TIER_RANK] ?? 0) ? (
                          'ACCESS LEVEL GRANTED'
                        ) : tier.id === 'FREE' ? (
                          isConnected ? 'Current Access Level' : 'Initialize Connection'
                        ) : (
                          'Request Access'
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SYSTEM INTEGRITY ─────────────────────────────────────────────── */}
        <section className="w-full py-24 md:py-48 border-t border-black/5 relative z-10 bg-transparent flex flex-col items-center">
          <div className="max-w-[1400px] mx-auto px-6 w-full text-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
              variants={FADE_UP}
              className="mb-20 flex flex-col items-center"
            >
              <h2 className="text-[40px] md:text-[80px] font-black uppercase tracking-tighter text-[#050505] mb-8 leading-none">
                System <span className="text-black/20">Integrity.</span>
              </h2>
              <p className="text-[20px] md:text-[24px] font-serif text-black/50 max-w-3xl leading-relaxed mx-auto">
                We have engineered an environment where mathematical verifications happen seamlessly, securing institutional identity and data against unauthorized access.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <ProFeatureCard title="System Verification" desc="Cryptographic certainty that ensures the integrity of records against tampering or unauthorized modification." />
              <InstitutionalFeatureCard title="Verification Engine" desc="Our core infrastructure analyzes data matrices to confirm authenticity with zero margin for error." />
              <ProFeatureCard title="Data Autonomy" desc="No central authority owns your data. You hold the ultimate cryptographic control over your records." />
            </div>
          </div>
        </section>

      </div>

      <SovereignFooter />
      {/* Semantic spacer so SovereignFooter content is not hidden behind the fixed mobile bottom nav */}
      <div className="h-24 sm:h-0" />
    </div>
  );
}
function InstitutionalFeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 p-8 bg-black/5 rounded-[2.5rem] border border-black/5 shadow-sm hover:border-black/10 hover:bg-black/10 hover:-translate-y-1 transition-all duration-500 group">
      <div className="w-12 h-[2px] bg-black transition-all group-hover:w-full duration-700 rounded-full" />
      <h3 className="text-[20px] font-black uppercase tracking-tight text-black">{title}</h3>
      <p className="text-[15px] text-black/40 leading-relaxed font-serif">{desc}</p>
    </div>
  );
}

function ProFeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4 p-8 bg-white rounded-[2.5rem] border border-black/5 shadow-sm hover:border-black/10 hover:bg-[#F8F8F8] hover:-translate-y-1 transition-all duration-500 group">
      <div className="w-12 h-[2px] bg-black/20 transition-all group-hover:bg-black group-hover:w-full duration-700 rounded-full" />
      <h3 className="text-[20px] font-black uppercase tracking-tight text-black">{title}</h3>
      <p className="text-[15px] text-black/40 leading-relaxed font-serif">{desc}</p>
    </div>
  );
}
