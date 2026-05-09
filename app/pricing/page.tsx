"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Settings, CheckCircle2 } from 'lucide-react';
import { useAppKit } from '@reown/appkit/react';

const TIER_HIERARCHY: Record<string, number> = {
  'FREE': 0,
  'STARTER': 1,
  'PRO': 2,
  'ELITE': 3
};

const TIER_PRICES: Record<string, { monthly: string; annual: string }> = {
  'STARTER': { monthly: '130', annual: '1300' },
  'PRO':     { monthly: '350', annual: '3500' },
  'ELITE':   { monthly: '950', annual: '9500' },
};

const PRICING_TIERS = [
  {
    id: 'STARTER',
    name: 'Starter',
    tagline: 'Track the market',
    features: [
      'Full trading terminal',
      '1-minute data refresh',
      '3 custom whale alerts',
      'Forum & community access',
      'On-chain identity profile',
      '1,000 API calls / day',
    ],
    buttonText: 'Get started',
  },
  {
    id: 'PRO',
    name: 'Pro',
    tagline: 'Trade with precision',
    highlight: true,
    features: [
      'Zero-delay data streaming',
      'Advanced on-chain analytics',
      'Full read & write API access',
      'Priority support — 24/7',
      'Security analytics & alerts',
      '15 custom alerts',
      'Predictive market models',
      '10,000 API calls / day',
    ],
    buttonText: 'Go Pro',
  },
  {
    id: 'ELITE',
    name: 'Elite',
    tagline: 'Institutional grade',
    features: [
      'Unlimited data firehose',
      'No query limits or rate caps',
      'Dedicated account manager',
      'Full API & Webhook integration',
      'Unlimited custom alerts',
      '99.99% SLA uptime guarantee',
      'Custom smart contract indexing',
      'Private node infrastructure',
    ],
    buttonText: 'Contact sales',
  },
];

const FAQS = [
  {
    question: 'How does billing work?',
    answer: 'Payments are processed securely via Stripe. You can pay using major credit cards or SEPA Direct Debit. Your account tier is upgraded automatically upon successful payment.',
  },
  {
    question: 'Do I need a crypto wallet?',
    answer: 'Yes. Your wallet acts as your secure, passwordless login to the platform, but payments are processed in traditional Fiat (Euros) to ensure institutional compliance.',
  },
  {
    question: 'How are invoices sent?',
    answer: 'A professional invoice is automatically emailed to you the moment your payment is confirmed. You can also manage your billing history in your dashboard.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Because premium plans grant immediate, unlimited access to proprietary on-chain intelligence feeds, we do not offer refunds on active billing cycles.',
  },
];

function PricingContent() {
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

  const currentTierLevel = TIER_HIERARCHY[currentTier] || 0;

  const handleSubscribeClick = async (planId: string) => {
    if (currentTierLevel >= (TIER_HIERARCHY[planId] || 0)) {
      toast.info('Already on this plan or higher'); return;
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
    <div className="min-h-screen bg-[#FAFAF8] text-[#111] font-sans">
      <div className="h-24 w-full" />

      <main className="w-full max-w-5xl mx-auto px-6 py-16 md:py-28">



        {/* Hero */}
        <header className="text-center mb-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/30 mb-5">Pricing</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-[1.1]">
            Institutional access,<br/>transparent billing
          </h1>
          <p className="text-lg text-black/50 max-w-lg mx-auto leading-relaxed">
            Start free. Upgrade when you're ready. All payments are processed securely via Stripe in Euros.
          </p>

          {currentTierLevel > 0 && (
            <button
              onClick={() => router.push('/dashboard?tab=billing')}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-[#050505] text-white rounded-full text-xs font-bold uppercase tracking-[0.12em] hover:bg-black/80 transition shadow-lg"
            >
              <Settings size={13} /> Manage subscription
            </button>
          )}

          {/* Billing Toggle */}
          <div className="mt-10 inline-flex items-center bg-black/[0.03] p-1.5 rounded-full border border-black/5">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-white shadow-sm text-black border border-black/5' : 'text-black/40 hover:text-black'
              }`}
            >Monthly</button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                billingCycle === 'annual' ? 'bg-white shadow-sm text-black border border-black/5' : 'text-black/40 hover:text-black'
              }`}
            >
              Annual <span className="text-[10px] font-black text-[#00C076] px-2 py-0.5 bg-[#00C076]/10 rounded-full">–16%</span>
            </button>
          </div>
        </header>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-32">
          {PRICING_TIERS.map(tier => {
            const isDowngrade = currentTierLevel >= (TIER_HIERARCHY[tier.id] || 0);
            const price = TIER_PRICES[tier.id][billingCycle];
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-3xl transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-[#050505] text-white shadow-[0_20px_40px_rgba(0,0,0,0.15)] ring-1 ring-white/10'
                    : 'bg-white border border-black/10 hover:border-black/20 hover:shadow-lg'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00C076] text-black text-[10px] font-black uppercase tracking-[0.2em] px-5 py-1.5 rounded-full shadow-sm">
                    Recommended
                  </div>
                )}

                <div className={`p-8 border-b ${tier.highlight ? 'border-white/10' : 'border-black/5'}`}>
                  <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-4 ${
                    tier.highlight ? 'text-white/40' : 'text-black/30'
                  }`}>{tier.name}</p>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className={`text-[28px] font-bold ${tier.highlight ? 'text-[#00C076]' : 'text-black/40'}`}>€</span>
                    <span className={`text-6xl font-black tracking-tighter ${tier.highlight ? 'text-white' : 'text-[#050505]'}`}>
                      {price}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold tracking-wide ${tier.highlight ? 'text-white/40' : 'text-black/40'} mb-5`}>
                    EUR / {billingCycle === 'monthly' ? 'month' : 'year'}
                  </p>
                  <p className={`text-sm font-medium ${tier.highlight ? 'text-white/70' : 'text-black/60'}`}>
                    {tier.tagline}
                  </p>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <ul className="flex flex-col gap-4 flex-1 mb-10">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-0.5 shrink-0 ${tier.highlight ? 'text-[#00C076]' : 'text-black/20'}`}>
                          <CheckCircle2 size={16} />
                        </span>
                        <span className={`text-[14px] font-medium leading-snug ${tier.highlight ? 'text-white/80' : 'text-black/70'}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isDowngrade ? (
                    <div className={`w-full py-4 rounded-xl text-center text-xs font-black uppercase tracking-[0.2em] opacity-40 ${
                      tier.highlight ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                    }`}>
                      {currentTier === tier.id ? 'Current plan' : 'Included'}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribeClick(tier.id)}
                      disabled={!isTierLoaded || loadingTier === tier.id}
                      className={`w-full py-4 rounded-xl text-sm font-black transition-all ${
                        tier.highlight
                          ? 'bg-[#00C076] text-black hover:bg-emerald-400 disabled:opacity-60 shadow-lg shadow-emerald-500/20'
                          : 'bg-[#050505] text-white hover:bg-black/80 disabled:opacity-60 shadow-md'
                      }`}
                    >
                      {loadingTier === tier.id || !isTierLoaded
                        ? <Loader2 size={16} className="animate-spin mx-auto" />
                        : tier.buttonText
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <section className="border-t border-black/10 pt-20 pb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-12">Common questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 max-w-4xl">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <h4 className="text-base font-bold mb-3">{faq.question}</h4>
                <p className="text-[15px] font-medium text-black/60 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Loader2 className="animate-spin text-black/30" size={28} />
      </div>
    }>
      <PricingContent />
    </React.Suspense>
  );
}
