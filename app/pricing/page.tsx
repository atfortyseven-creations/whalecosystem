"use client";

import React, { useState } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Shield, Loader2, ArrowRight, Zap, Database, Lock } from 'lucide-react';
import { useUIStore } from '@/lib/store/ui-store';

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Sovereign Starter',
    price: '$0',
    billing: 'Free Forever',
    target: 'Individuals & Researchers',
    description: 'Perfect for getting started with the Sovereign platform and exploring the core network intelligence.',
    features: [
      'Basic Network Access',
      'Standard Refresh Rate (5 min)',
      'Read-Only Access to Core Data',
      'Standard Community Support',
      'Basic Identity Verification'
    ],
    buttonText: 'Initialize Free Access'
  },
  {
    id: 'pro',
    name: 'Sovereign Professional',
    price: '$59',
    billing: 'per user / month',
    target: 'Traders & Analysts',
    description: 'Advanced telemetry and real-time intelligence for professionals who need actionable insights.',
    highlight: true,
    features: [
      'Real-Time Data Streaming',
      'Advanced Network Queries',
      'Full Read & Write Access',
      'Priority Customer Support',
      'Advanced Security Analytics',
      'Up to 15 Custom Alerts'
    ],
    buttonText: 'Upgrade to Professional'
  },
  {
    id: 'Elite',
    name: 'Sovereign Enterprise',
    price: '$199',
    billing: 'per user / month',
    target: 'Institutions & Funds',
    description: 'Maximum performance, unlimited scaling, and elite support for institutional market operators.',
    features: [
      'Unrestricted Data Firehose',
      'Unlimited Complex Queries',
      'Dedicated Account Manager',
      'API & Webhook Integration',
      'Unlimited Custom Alerts',
      'Custom SLA & Compliance'
    ],
    buttonText: 'Contact Enterprise Sales'
  }
];

const PLATFORM_BENEFITS = [
  {
    title: 'Institutional Grade Security',
    description: 'Cryptographically secured architecture ensuring your data and identity remain uncompromised.',
    icon: <Lock size={20} className="text-[#050505]" />
  },
  {
    title: 'Real-Time Telemetry',
    description: 'Zero-latency data processing powered by our advanced distributed network infrastructure.',
    icon: <Zap size={20} className="text-[#050505]" />
  },
  {
    title: 'Immutable Ledger',
    description: 'All transactions and verifications are permanently recorded on our high-speed sovereign ledger.',
    icon: <Database size={20} className="text-[#050505]" />
  }
];

export default function PricingPage() {
  const { isConnected, address } = useSovereignAccount();
  const router = useRouter();
  const { openConnectModal } = useUIStore();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!isConnected) {
      toast.error('Authentication Required', {
        description: 'Please connect your identity to access the billing portal.',
      });
      router.push('/connect');
      return;
    }

    if (planId === 'starter') {
      toast.success('Starter Access Verified', {
        description: 'You are already authenticated with basic access.',
      });
      router.push('/dashboard');
      return;
    }

    setLoadingTier(planId);
    const toastId = toast.loading('Initializing secure payment gateway...');

    try {
      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userEmail: '', // Handled by Stripe
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      toast.success('Gateway secured. Redirecting...', { id: toastId });
      
      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Transaction Failed', {
        id: toastId,
        description: error.message || 'There was an issue processing your request. Please try again.',
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#050505] font-sans selection:bg-[#050505] selection:text-[#FDFCF8] pt-28 pb-24">
      <div className="w-full max-w-6xl mx-auto px-6">
        
        {/* ── Header ── */}
        <header className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 border border-black/10 mb-6">
            <Shield size={14} className="text-[#050505]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#050505]">Sovereign Network Pricing</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-[#050505] mb-6 max-w-4xl">
            Institutional Intelligence.<br className="hidden md:block" />
            <span className="text-black/40">Accessible for everyone.</span>
          </h1>
          
          <p className="text-base md:text-lg text-[#050505]/60 max-w-2xl leading-relaxed">
            Choose the access level that aligns with your operational requirements. From individual research to full-scale enterprise deployments.
          </p>
        </header>

        {/* ── Pricing Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-24">
          {PRICING_TIERS.map((tier) => (
            <div 
              key={tier.id}
              className={`relative flex flex-col rounded-3xl transition-all duration-300 ${
                tier.highlight 
                  ? 'bg-[#050505] text-[#FDFCF8] shadow-2xl scale-105 z-10' 
                  : 'bg-white border border-[#E5E5E5] text-[#050505] hover:border-black/30'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00C076] text-[#050505] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                  Recommended
                </div>
              )}

              <div className="p-8 border-b border-black/5">
                <h3 className={`text-[12px] font-bold uppercase tracking-widest mb-2 ${tier.highlight ? 'text-white/60' : 'text-black/50'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className={`text-5xl font-medium tracking-tighter ${tier.highlight ? 'text-white' : 'text-black'}`}>
                    {tier.price}
                  </span>
                  <span className={`text-[12px] font-medium pb-1 ${tier.highlight ? 'text-white/50' : 'text-black/40'}`}>
                    {tier.billing}
                  </span>
                </div>
                <p className={`text-[13px] leading-relaxed ${tier.highlight ? 'text-white/70' : 'text-black/60'}`}>
                  {tier.description}
                </p>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <ul className="flex flex-col gap-4 flex-1 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className={`shrink-0 ${tier.highlight ? 'text-[#00C076]' : 'text-[#050505]'}`} />
                      <span className={`text-[14px] leading-snug ${tier.highlight ? 'text-white/90' : 'text-[#050505]'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loadingTier === tier.id}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                    tier.highlight
                      ? 'bg-white text-[#050505] hover:bg-[#FDFCF8] hover:scale-[1.02]'
                      : 'bg-[#050505] text-white hover:bg-[#1A1A1A] hover:scale-[1.02]'
                  }`}
                >
                  {loadingTier === tier.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {tier.buttonText}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Platform Benefits ── */}
        <section className="bg-white rounded-3xl border border-[#E5E5E5] p-10 md:p-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-[#050505] mb-4">
              Enterprise-Grade Architecture
            </h2>
            <p className="text-[#050505]/60 max-w-2xl mx-auto">
              Our platform is built from the ground up to support high-frequency operations, providing unparalleled reliability and security for our institutional clients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PLATFORM_BENEFITS.map((benefit, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#FAF9F6] border border-[#E5E5E5]">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center mb-4 shadow-sm">
                  {benefit.icon}
                </div>
                <h3 className="text-base font-medium text-[#050505] mb-2">{benefit.title}</h3>
                <p className="text-[13px] text-[#050505]/60 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
