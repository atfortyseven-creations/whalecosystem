"use client";

import React, { useState, useEffect } from 'react';
import { useSystemAccount } from '@/hooks/useSystemAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Check, Lock, Zap, BarChart2, MessageSquare, Briefcase, Users, Shield, Eye, Globe } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { PRICING_TIERS, TIER_RANK, SECTION_FEATURES } from '@/lib/config/pricing-tiers';
import type { SectionFeatureGroup } from '@/lib/config/pricing-tiers';
import dynamic from 'next/dynamic';

const SystemFooter = dynamic(
  () => import('@/components/landing/SystemFooter').then(m => ({ default: m.SystemFooter })),
  { ssr: false, loading: () => <div className="h-24" /> }
);
const MotionDiv = dynamic(
  () => import('framer-motion').then(m => ({ default: m.motion.div })),
  { ssr: false, loading: () => <div /> }
);

const FADE_UP: any = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const SECTION_ICONS: Record<string, React.ReactNode> = {
  dashboard: <BarChart2 size={16} />,
  chat:      <MessageSquare size={16} />,
  portfolio: <Briefcase size={16} />,
  community: <Users size={16} />,
};

// Aztec integration trust badges
const AZTEC_PILLARS = [
  {
    icon: <Shield size={20} />,
    title: 'Private by Default',
    desc: 'Built on Aztec Network — your data never leaves your device unencrypted.',
  },
  {
    icon: <Eye size={20} />,
    title: 'No Tracking, Ever',
    desc: 'We cannot see who you are. Your wallet is your identity — nothing else.',
  },
  {
    icon: <Globe size={20} />,
    title: 'Decentralized Infrastructure',
    desc: 'No single server controls your data. The network is global and censorship-resistant.',
  },
];

export default function PricingPage() {
  const { isConnected, isSystemHandshake, address } = useSystemAccount();
  const router = useRouter();
  const [loadingTier, setLoadingTier]   = useState<string | null>(null);
  const [currentTier, setCurrentTier]   = useState<string>('FREE');
  const [isTierLoaded, setIsTierLoaded] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<SectionFeatureGroup['section']>('dashboard');

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
  }, [isConnected, isSystemHandshake]);

  const currentTierLevel = TIER_RANK[currentTier as keyof typeof TIER_RANK] ?? 0;

  const handleSubscribeClick = async (planId: string) => {
    if (currentTierLevel >= (TIER_RANK[planId as keyof typeof TIER_RANK] ?? 0)) {
      toast.info('You already have this access level');
      router.push('/dashboard');
      return;
    }
    if (!isConnected || !address) {
      toast.info('Please connect your wallet to continue');
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
        throw new Error(data.error || 'Failed to start checkout');
      }
    } catch (err: any) {
      toast.error('Checkout error', { description: err.message });
    } finally {
      setLoadingTier(null);
    }
  };

  const activeSectionData = SECTION_FEATURES.find(s => s.section === activeSection)!;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#FAFAF8] text-black font-sans selection:bg-black/10">
      <div className="relative z-10 w-full flex flex-col items-center">

        {/*  HERO  */}
        <section className="w-full pt-36 pb-24 px-6 border-b border-black/5 relative z-10 flex flex-col justify-center items-center text-center overflow-hidden">
          {/* Subtle grid bg */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }} />

          <div className="w-full max-w-[1200px] mx-auto space-y-10 relative z-10">
            <MotionDiv initial="hidden" animate="visible" variants={FADE_UP} className="flex flex-col items-center gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 bg-white/80 backdrop-blur-sm shadow-sm">
                <Zap size={12} className="text-black/50" />
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.25em] text-black/50">
                  Whale Alert Network — Pricing
                </span>
              </div>

              <h1 className="text-[52px] md:text-[88px] font-black uppercase tracking-tighter leading-[0.88] text-[#050505]">
                Simple,<br />
                <span className="text-black/15">Honest Pricing.</span>
              </h1>

              <p className="text-[17px] md:text-[19px] font-serif text-black/55 max-w-2xl leading-relaxed mx-auto">
                Start for free and track whale movements with no commitment. 
                Upgrade to <strong className="text-black/80 font-semibold">Pro for $15/month</strong> to unlock every tool 
                across the entire platform — Dashboard, Chat, Portfolio, and Community.
              </p>
            </MotionDiv>

            {/* Key stats */}
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-10 pt-2"
            >
              {[
                { value: 'Free', label: 'To get started' },
                { value: '$15', label: 'Per month for Pro' },
                { value: '4', label: 'Fully unlocked sections' },
                { value: '∞', label: 'Whale movements tracked' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <span className="font-mono text-[28px] md:text-[36px] font-black tracking-tighter text-[#050505] leading-none">
                    {value}
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black/30">
                    {label}
                  </span>
                </div>
              ))}
            </MotionDiv>

            {/* Aztec trust strip */}
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
            >
              {AZTEC_PILLARS.map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 max-w-[260px] text-left">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center text-black/50 mt-0.5">
                    {icon}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-wider text-black/70 mb-0.5">{title}</p>
                    <p className="font-serif text-[12px] text-black/40 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </MotionDiv>
          </div>
        </section>

        {/*  PRICING CARDS  */}
        <section className="w-full py-24 px-6 relative z-10 flex flex-col items-center">
          <div className="max-w-[1100px] mx-auto w-full">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {PRICING_TIERS.map((tier, index) => {
                const isPro      = tier.id === 'STANDARD';
                const isGranted  = isTierLoaded && currentTierLevel >= (TIER_RANK[tier.id as keyof typeof TIER_RANK] ?? 0);
                const isLoading  = loadingTier === tier.id;

                return (
                  <MotionDiv
                    key={tier.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative flex flex-col rounded-[2.5rem] border p-10 md:p-14 transition-all duration-500 hover:-translate-y-1 ${
                      isPro
                        ? 'bg-[#050505] border-transparent text-white shadow-2xl'
                        : 'bg-white border-black/8 text-black shadow-sm hover:border-black/20'
                    }`}
                  >
                    {isPro && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black shadow-lg">
                          <span className="text-[10px]">⭐</span>
                          <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em]">Most Popular</span>
                        </div>
                      </div>
                    )}

                    {/* Header */}
                    <div className="mb-10 pb-10 border-b border-white/10">
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div>
                          <h2 className={`text-[26px] md:text-[32px] font-black uppercase tracking-tighter leading-none mb-2 ${isPro ? 'text-white' : 'text-[#050505]'}`}>
                            {tier.name}
                          </h2>
                          <p className={`font-serif text-[14px] leading-relaxed max-w-xs ${isPro ? 'text-white/50' : 'text-black/45'}`}>
                            {tier.tagline}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className={`text-[72px] font-black tracking-tighter leading-none ${isPro ? 'text-white' : 'text-[#050505]'}`}>
                          {tier.priceMonthly === '0' ? 'Free' : `$${tier.priceMonthly}`}
                        </span>
                        {tier.priceMonthly !== '0' && (
                          <span className={`text-[11px] font-black uppercase tracking-widest ${isPro ? 'text-white/30' : 'text-black/25'}`}>
                            / month
                          </span>
                        )}
                      </div>

                      {isPro && (
                        <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">
                          Or $150/year — save 2 months
                        </p>
                      )}
                    </div>

                    {/* Features list */}
                    <div className="flex-1 space-y-4 mb-10">
                      {tier.features.map((f, fi) => (
                        <div key={fi} className="flex items-start gap-3.5">
                          <div className={`mt-[3px] shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                            isPro
                              ? f.highlight ? 'bg-white text-black' : 'bg-white/10 text-white/60'
                              : 'bg-black/5 text-black/40'
                          }`}>
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className={`text-[14px] leading-snug font-medium ${
                            isPro
                              ? f.highlight ? 'text-white font-semibold' : 'text-white/60'
                              : 'text-black/55 font-serif'
                          }`}>
                            {f.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <button
                      id={`pricing-btn-${tier.id.toLowerCase()}`}
                      onClick={() => handleSubscribeClick(tier.id)}
                      disabled={isLoading || (!isTierLoaded && isConnected) || isGranted}
                      className={`w-full py-5 text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300 flex items-center justify-center gap-3 rounded-[1.5rem] ${
                        isPro
                          ? 'bg-white text-black hover:bg-white/90 shadow-xl shadow-black/20'
                          : 'bg-black text-white hover:bg-black/80'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : !isTierLoaded ? (
                        <div className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Loading...</div>
                      ) : isGranted ? (
                        '✓ Access Active'
                      ) : tier.id === 'FREE' ? (
                        isConnected ? 'Go to Dashboard' : 'Get Started Free'
                      ) : (
                        'Unlock Full Access — $15/mo'
                      )}
                    </button>
                  </MotionDiv>
                );
              })}
            </div>

            {/* What's included note */}
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 text-center"
            >
              <p className="font-serif text-[14px] text-black/40 max-w-xl mx-auto leading-relaxed">
                Both plans include our Aztec-powered privacy login — no email, no password, no tracking. 
                Your wallet is your identity. Cancel anytime, no questions asked.
              </p>
            </MotionDiv>
          </div>
        </section>

        {/*  WHAT'S DIFFERENT: SECTION TABS  */}
        <section className="w-full py-24 px-6 border-t border-black/5 relative z-10 flex flex-col items-center bg-white">
          <div className="max-w-[1100px] mx-auto w-full">

            <MotionDiv
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              variants={FADE_UP}
              className="text-center mb-14"
            >
              <h2 className="text-[36px] md:text-[64px] font-black uppercase tracking-tighter text-[#050505] leading-none mb-5">
                What Changes<br />
                <span className="text-black/15">With Pro.</span>
              </h2>
              <p className="font-serif text-[17px] text-black/45 max-w-xl mx-auto leading-relaxed">
                Every section of Whale Alert Network gets a full upgrade with the $15 plan.
                Click a section below to see exactly what you unlock.
              </p>
            </MotionDiv>

            {/* Tab Switcher */}
            <div className="flex items-center gap-2 p-1.5 bg-black/5 rounded-[1.5rem] mb-10 flex-wrap justify-center">
              {SECTION_FEATURES.map(s => (
                <button
                  key={s.section}
                  id={`tab-${s.section}`}
                  onClick={() => setActiveSection(s.section)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-[1.2rem] font-mono text-[10px] font-black uppercase tracking-[0.18em] transition-all duration-300 ${
                    activeSection === s.section
                      ? 'bg-white text-black shadow-sm'
                      : 'text-black/40 hover:text-black/60'
                  }`}
                >
                  <span>{SECTION_ICONS[s.section]}</span>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* FREE column */}
              <div className="rounded-[2rem] border border-black/8 bg-[#FAFAF8] p-8 md:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-black/6 flex items-center justify-center">
                    {SECTION_ICONS[activeSection]}
                  </div>
                  <div>
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30 mb-0.5">Free Plan</p>
                    <p className="font-black text-[15px] uppercase tracking-tight text-black">Whale Alert Network</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeSectionData.freeFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-[3px] shrink-0 w-5 h-5 rounded-full bg-black/6 flex items-center justify-center">
                        <Check size={10} strokeWidth={3} className="text-black/40" />
                      </div>
                      <span className="text-[14px] text-black/55 font-serif leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRO column */}
              <div className="rounded-[2rem] bg-[#050505] p-8 md:p-10 relative overflow-hidden">
                <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    {SECTION_ICONS[activeSection]}
                  </div>
                  <div>
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">Pro Plan</p>
                    <p className="font-black text-[15px] uppercase tracking-tight text-white">Whale Alert Network Pro</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeSectionData.proFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-[3px] shrink-0 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                        <Check size={10} strokeWidth={3} className="text-white" />
                      </div>
                      <span className="text-[14px] text-white/75 leading-snug font-medium">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <button
                    id={`section-cta-${activeSection}`}
                    onClick={() => handleSubscribeClick('STANDARD')}
                    disabled={isTierLoaded && currentTierLevel >= 1}
                    className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.25em] rounded-[1.2rem] hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isTierLoaded && currentTierLevel >= 1 ? '✓ Already Unlocked' : 'Unlock This Section — $15/mo'}
                  </button>
                </div>
              </div>
            </div>

            {/* Section navigator dots */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {SECTION_FEATURES.map(s => (
                <button
                  key={s.section}
                  onClick={() => setActiveSection(s.section)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeSection === s.section ? 'bg-black w-6' : 'bg-black/20 hover:bg-black/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/*  FULL FEATURE MATRIX  */}
        <section className="w-full py-24 px-6 border-t border-black/5 relative z-10 flex flex-col items-center">
          <div className="max-w-[1100px] mx-auto w-full">

            <MotionDiv
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              variants={FADE_UP}
              className="text-center mb-14"
            >
              <h2 className="text-[36px] md:text-[64px] font-black uppercase tracking-tighter text-[#050505] leading-none mb-5">
                Full Feature<br />
                <span className="text-black/15">Comparison.</span>
              </h2>
              <p className="font-serif text-[17px] text-black/45 max-w-xl mx-auto leading-relaxed">
                Every feature, side by side. No hidden costs, no surprise paywalls.
              </p>
            </MotionDiv>

            <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-[1fr_140px_140px] border-b border-black/8">
                <div className="p-6 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30">Feature</div>
                <div className="p-6 text-center font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/30 border-l border-black/5">Free</div>
                <div className="p-6 text-center font-mono text-[9px] font-black uppercase tracking-[0.2em] text-white bg-[#050505] border-l border-black/5 rounded-tr-[2rem]">Pro</div>
              </div>

              {/* Rows */}
              {SECTION_FEATURES.map((section, si) => (
                <React.Fragment key={section.section}>
                  {/* Section header row */}
                  <div className="grid grid-cols-[1fr_140px_140px] bg-black/[0.025] border-b border-black/5">
                    <div className="px-6 py-3 flex items-center gap-2">
                      <span className="text-black/40">{SECTION_ICONS[section.section]}</span>
                      <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/40">{section.label}</span>
                    </div>
                    <div className="border-l border-black/5" />
                    <div className="border-l border-black/5 bg-[#050505]/[0.02]" />
                  </div>

                  {Array.from({ length: Math.max(section.freeFeatures.length, section.proFeatures.length) }).map((_, ri) => {
                    const freeFeat = section.freeFeatures[ri];
                    const proFeat  = section.proFeatures[ri];
                    return (
                      <div key={ri} className={`grid grid-cols-[1fr_140px_140px] border-b border-black/[0.04] ${ri % 2 === 0 ? '' : 'bg-black/[0.01]'}`}>
                        <div className="px-6 py-4 text-[13px] text-black/60 font-serif leading-snug">
                          {freeFeat || proFeat}
                        </div>
                        <div className="px-4 py-4 flex items-center justify-center border-l border-black/5">
                          {freeFeat ? (
                            <Check size={14} strokeWidth={2.5} className="text-black/40" />
                          ) : (
                            <Lock size={12} strokeWidth={2} className="text-black/15" />
                          )}
                        </div>
                        <div className="px-4 py-4 flex items-center justify-center border-l border-black/5 bg-black/[0.015]">
                          <Check size={14} strokeWidth={2.5} className="text-[#050505]" />
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

              {/* Footer CTA row */}
              <div className="grid grid-cols-[1fr_140px_140px]">
                <div className="p-6" />
                <div className="p-4 border-l border-black/5 flex items-center justify-center">
                  <span className="font-mono text-[10px] font-black text-black/30">$0</span>
                </div>
                <div className="p-4 border-l border-black/5 bg-[#050505] flex items-center justify-center rounded-br-[2rem]">
                  <button
                    id="grid-cta-btn"
                    onClick={() => handleSubscribeClick('STANDARD')}
                    disabled={isTierLoaded && currentTierLevel >= 1}
                    className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-white hover:text-white/70 transition-colors disabled:opacity-40"
                  >
                    {isTierLoaded && currentTierLevel >= 1 ? '✓ Active' : '$15 / mo →'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  AZTEC PRIVACY CALLOUT  */}
        <section className="w-full py-24 px-6 border-t border-black/5 relative z-10 flex flex-col items-center bg-white">
          <div className="max-w-[900px] mx-auto w-full">
            <MotionDiv
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              variants={FADE_UP}
              className="flex flex-col items-center text-center gap-10"
            >
              <div>
                <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-black/30 mb-4 block">
                  How Your Privacy Works
                </span>
                <h2 className="text-[36px] md:text-[56px] font-black uppercase tracking-tighter text-[#050505] leading-none mb-6">
                  No Email.<br />
                  <span className="text-black/15">No Password. No Tracking.</span>
                </h2>
                <p className="font-serif text-[16px] md:text-[18px] text-black/50 max-w-2xl mx-auto leading-relaxed">
                  We've built our entire login and data system on top of the <strong className="text-black/70">Aztec Network</strong> — 
                  a privacy-first blockchain layer. When you sign in with your wallet, a 
                  mathematical proof verifies who you are without revealing any personal information. 
                  We literally cannot see your name, email, or browsing habits. Your wallet is your account.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {[
                  {
                    title: 'Zero-Knowledge Login',
                    desc: 'Your wallet signs a cryptographic challenge. We verify the math — not your identity.',
                    badge: 'Aztec Network',
                  },
                  {
                    title: 'Encrypted by Default',
                    desc: 'All sensitive operations happen on your device first. Only the proof is ever transmitted.',
                    badge: 'Client-Side',
                  },
                  {
                    title: 'Censorship Resistant',
                    desc: 'Your access cannot be revoked by a single server or authority. The network is global.',
                    badge: 'Decentralized',
                  },
                ].map(({ title, desc, badge }) => (
                  <div key={title} className="flex flex-col gap-3 p-6 rounded-[1.5rem] border border-black/8 bg-[#FAFAF8] text-left">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-black/5 font-mono text-[8px] font-black uppercase tracking-widest text-black/40 w-fit">{badge}</span>
                    <p className="font-mono text-[11px] font-black uppercase tracking-tight text-black">{title}</p>
                    <p className="font-serif text-[13px] text-black/50 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </MotionDiv>
          </div>
        </section>

        {/*  FINAL CTA  */}
        <section className="w-full py-24 px-6 border-t border-black/5 relative z-10 flex flex-col items-center bg-[#050505]">
          <div className="max-w-[900px] mx-auto w-full text-center">
            <MotionDiv
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
              variants={FADE_UP}
            >
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">
                Ready to Start?
              </p>
              <h2 className="text-[40px] md:text-[72px] font-black uppercase tracking-tighter leading-[0.88] text-white mb-8">
                Track Every Move.<br />
                <span className="text-white/20">Stay Private.</span>
              </h2>
              <p className="font-serif text-[18px] text-white/45 max-w-2xl mx-auto leading-relaxed mb-12">
                For $15 a month — less than a coffee per week — you get unlimited whale tracking, 
                AI predictions, VIP chat channels, multi-wallet portfolio management, and a verified 
                community badge. No contracts. Cancel anytime.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {[
                  { icon: '📊', label: 'Dashboard', desc: 'Unlimited movements + AI predictions' },
                  { icon: '💬', label: 'Whale Chat', desc: 'VIP channels + analyst signals' },
                  { icon: '📈', label: 'Portfolio', desc: 'Multi-wallet + copy-trading alerts' },
                  { icon: '🏅', label: 'Community', desc: 'Verified badge + DAO voting' },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex flex-col gap-2 p-5 rounded-[1.5rem] border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <span className="text-[20px]">{icon}</span>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-white/60">{label}</p>
                    <p className="text-[12px] text-white/30 font-serif leading-snug">{desc}</p>
                  </div>
                ))}
              </div>

              <button
                id="hero-cta-pro"
                onClick={() => handleSubscribeClick('STANDARD')}
                disabled={loadingTier === 'STANDARD' || (isTierLoaded && currentTierLevel >= 1)}
                className="inline-flex items-center gap-3 px-12 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.25em] rounded-[1.5rem] hover:bg-white/90 transition-all shadow-2xl shadow-black/40 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingTier === 'STANDARD' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isTierLoaded && currentTierLevel >= 1 ? (
                  '✓ Pro Access Active'
                ) : (
                  'Unlock Full Access — $15/mo'
                )}
              </button>

              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 mt-6">
                Powered by Aztec Network · No personal data stored · Cancel anytime
              </p>
            </MotionDiv>
          </div>
        </section>

      </div>

      <SystemFooter />
      <div className="h-24 sm:h-0" />
    </div>
  );
}
