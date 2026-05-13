"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Settings, CheckCircle2, Shield, Zap } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';
import { PRICING_TIERS, TIER_RANK } from '@/lib/config/pricing-tiers';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { motion } from 'framer-motion';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

export default function PricingPage() {
  const { isConnected, isSovereignHandshake, address } = useSovereignAccount();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [isTierLoaded, setIsTierLoaded] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
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
          isAnnual: billingCycle === 'annual',
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
    <div className="min-h-screen bg-[#FAFAF8] text-[#0A0A0A] font-sans overflow-x-hidden selection:bg-[#0044CC]/20">
      
      <main className="w-full max-w-[1400px] mx-auto pt-32 pb-24 px-6 lg:px-12">
        
        {/* ── HEADER ── */}
        <div className="text-center mb-20">
          
          
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[36px] md:text-[56px] font-black uppercase tracking-tighter leading-[0.95] mb-6">
            The Whale Alert <br className="hidden md:block" />
            <span className="text-[#0044CC]">Network Prices.</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[16px] md:text-[18px] text-slate-500 font-serif max-w-2xl mx-auto leading-relaxed">
            Unrestricted forensic capacity or core network access. Choose the analytical layer that matches your operational requirements.
          </motion.p>
        </div>

        {/* ── PRICING BENTO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
          {PRICING_TIERS.map((tier, index) => {
            const isStandard = tier.id === 'STANDARD';
            return (
              <motion.div 
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`relative flex flex-col bg-white rounded-[3rem] border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 ${isStandard ? 'border-[#0044CC]/20' : 'border-black/5'}`}
              >
                {/* Accent Glow */}
                <div 
                  className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] opacity-[0.15] pointer-events-none" 
                  style={{ background: tier.accentColor }} 
                />

                {/* Blockchain Network Illustration Header */}
                <div className="w-full aspect-[16/9] relative overflow-hidden border-b border-black/5" style={{ background: isStandard ? '#F5F8FF' : '#FAFAF8' }}>
                   {/* Full-bleed illustration */}
                   <img
                     src="/lotties/pngtree-blockchain-network-illustration-with-cubes-vector-png-image_18614224.png"
                     alt="Blockchain Network"
                     className={`absolute inset-0 w-full h-full object-contain p-6 transition-all duration-500 ${isStandard ? 'opacity-100 scale-105' : 'opacity-60 grayscale scale-100'}`}
                   />
                   {/* Subtle gradient overlay for depth */}
                   <div className={`absolute inset-0 ${isStandard ? 'bg-gradient-to-br from-[#0044CC]/5 via-transparent to-[#0044CC]/5' : 'bg-gradient-to-br from-black/5 via-transparent to-black/5'}`} />
                   {tier.badge && (
                     <div className="absolute top-6 left-6 px-4 py-2 bg-[#0044CC] text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg z-10">
                       {tier.badge}
                     </div>
                   )}
                </div>

                <div className="p-8 md:p-12 flex-1 flex flex-col relative z-10">
                  <div className="mb-8">
                    <h2 className="text-[32px] md:text-[40px] font-black uppercase tracking-tighter text-[#0A0A0A] leading-none mb-2">
                      {tier.name}
                    </h2>
                    <p className="font-mono text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {tier.tagline}
                    </p>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-end gap-2">
                      <span className="text-[56px] font-black tracking-tighter leading-[0.85] text-[#0A0A0A]">
                        {tier.priceMonthly}€
                      </span>
                      <span className="text-[12px] font-bold uppercase tracking-widest text-slate-400 pb-1">
                        / month
                      </span>
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="flex-1 space-y-4 mb-10">
                    {tier.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-4">
                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feature.highlight ? 'bg-[#0044CC]/10 text-[#0044CC]' : 'bg-black/5 text-[#0A0A0A]'}`}>
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </div>
                        <span className={`text-[13px] md:text-[14px] leading-relaxed font-medium ${feature.highlight ? 'text-[#0044CC] font-bold' : 'text-slate-600'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribeClick(tier.id)}
                    disabled={loadingTier === tier.id || (!isTierLoaded && isConnected)}
                    className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                      isStandard 
                        ? 'bg-[#0044CC] text-white hover:bg-[#003399]' 
                        : 'bg-[#0A0A0A] text-white hover:bg-black/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loadingTier === tier.id ? (
                      <><Loader2 size={16} className="animate-spin" /> Authorizing...</>
                    ) : tier.id === 'FREE' ? (
                      isConnected ? (
                        <><CheckCircle2 size={16} /> Actual Plan</>
                      ) : (
                        <><Zap size={16} /> Try</>
                      )
                    ) : (
                      <><Zap size={16} /> Purchase Whale</>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <SovereignFooter />
    </div>
  );
}
