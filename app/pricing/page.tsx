"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Settings, Building2, CheckCircle2, Copy } from 'lucide-react';
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
    answer: 'Payments are processed securely via SEPA Bank Transfer in Euros (€). Once you request an upgrade, you will receive an invoice with the transfer instructions. Your account tier is upgraded immediately while the transfer settles.',
  },
  {
    question: 'Do I need a crypto wallet?',
    answer: 'Yes. Your wallet acts as your secure, passwordless login to the platform, but payments are processed in traditional Fiat (Euros) to ensure institutional compliance.',
  },
  {
    question: 'How are invoices sent?',
    answer: 'A highly detailed HTML invoice is automatically emailed to you the moment you initiate the upgrade. It contains the required Bank Details (IBAN/BIC) and your unique Transfer Reference.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Because premium plans grant immediate, unlimited access to proprietary on-chain intelligence feeds, we do not offer refunds on active billing cycles.',
  },
];

const BANK_DETAILS = {
  beneficiary: 'STEFAN-ANTONIO CIRISANU',
  iban: 'ES52 1583 0001 1090 8640 3529',
  bic: 'REVOESM2',
  bank: 'Revolut Bank UAB, Madrid, Spain'
};

function PricingContent() {
  const { isConnected, isSovereignHandshake, address } = useSovereignAccount();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [isTierLoaded, setIsTierLoaded] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  // Checkout Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [generatedRef, setGeneratedRef] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'input' | 'success'>('input');
  
  const { open } = useAppKit();

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user?.tier) {
          setCurrentTier(data.user.tier.split('_')[0].toUpperCase());
          if (data.user.email) setEmailInput(data.user.email);
        }
      })
      .catch(() => {})
      .finally(() => setIsTierLoaded(true));
  }, [isConnected, isSovereignHandshake]);

  const currentTierLevel = TIER_HIERARCHY[currentTier] || 0;

  const handleSubscribeClick = (planId: string) => {
    if (currentTierLevel >= (TIER_HIERARCHY[planId] || 0)) {
      toast.info('Already on this plan or higher'); return;
    }
    
    // Generate a secure, professional transfer reference
    const timestamp = Date.now().toString().slice(-4);
    const randomHex = Math.random().toString(16).slice(2, 6).toUpperCase();
    setGeneratedRef(`INV-${planId}-${timestamp}-${randomHex}`);
    
    setSelectedPlanId(planId);
    setCheckoutStep('input');
    setIsModalOpen(true);
  };

  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Email inválido', { description: 'Introduce una dirección de email válida.' });
      return;
    }
    if (!selectedPlanId) return;
    if (!generatedRef) return;
    
    setIsConfirming(true);
    toast.loading('Generando factura...', { id: 'invoice-tx' });
    
    try {
      const r = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: generatedRef,
          planId: selectedPlanId,
          billingCycle,
          priceEur: TIER_PRICES[selectedPlanId][billingCycle],
          email: emailInput,
          walletAddress: address || 'manual_sepa_user',
        }),
      });

      const d = await r.json();

      if (r.ok) {
        toast.success('¡Acceso desbloqueado!', { id: 'invoice-tx', description: 'Factura enviada a tu email.' });
        setCheckoutStep('success');
        setTimeout(() => {
          setIsModalOpen(false);
          router.push('/dashboard?tab=billing');
        }, 4000);
      } else {
        throw new Error(d.error || 'Error al procesar la solicitud');
      }
    } catch (err: any) {
      toast.error('Error al generar factura', { id: 'invoice-tx', description: err.message });
    } finally {
      setIsConfirming(false);
      setLoadingTier(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111] font-sans">
      <div className="h-24 w-full" />

      <main className="w-full max-w-5xl mx-auto px-6 py-16 md:py-28">

        {/* SEPA Checkout Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-2xl max-w-[500px] w-full shadow-2xl border border-black/10 relative overflow-hidden flex flex-col">
              
              <div className="bg-[#050505] text-white px-8 py-6 relative">
                  {!isConfirming && checkoutStep !== 'success' && (
                    <button
                        onClick={() => { setIsModalOpen(false); setLoadingTier(null); }}
                        className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors text-xl leading-none"
                    >✕</button>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1 flex items-center gap-2">
                    <Building2 size={12} /> Institutional Checkout
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {selectedPlanId ? PRICING_TIERS.find(t => t.id === selectedPlanId)?.name : ''} Plan
                  </h3>
              </div>

              <div className="p-8">
                  {checkoutStep === 'input' ? (
                      <form onSubmit={handleConfirmTransfer} className="flex flex-col gap-6">
                        
                        <div className="flex items-center justify-between border-b border-black/10 pb-6">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/40">Amount Due</p>
                                <p className="text-3xl font-black mt-1">€{selectedPlanId ? TIER_PRICES[selectedPlanId][billingCycle] : ''} <span className="text-sm font-medium text-black/40">EUR</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/40">Billing Cycle</p>
                                <p className="text-sm font-bold mt-1 capitalize">{billingCycle}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                            <p className="text-sm font-semibold text-blue-900 mb-1">Guaranteed Access Policy</p>
                            <p className="text-xs text-blue-800/70 leading-relaxed">
                                Enter your email below to instantly unlock the platform. We will email you the official invoice with the bank details (IBAN). You have 48 hours to complete the SEPA transfer.
                            </p>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-black/60 mb-2">Billing Email Address</label>
                            <input
                                type="email" required value={emailInput}
                                onChange={e => setEmailInput(e.target.value)}
                                placeholder="institution@example.com"
                                className="w-full px-4 py-3.5 text-sm bg-black/[0.02] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C076]/40 focus:border-[#00C076] transition-all font-medium"
                            />
                        </div>

                        <button
                            type="submit" disabled={isConfirming || !emailInput}
                            className="w-full py-4 mt-2 bg-[#050505] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isConfirming ? <Loader2 className="animate-spin" size={16} /> : 'Generate Invoice & Unlock Access'}
                        </button>
                      </form>
                  ) : (
                      <div className="flex flex-col items-center text-center py-6">
                          <div className="w-16 h-16 bg-[#00C076]/10 text-[#00C076] rounded-full flex items-center justify-center mb-6">
                              <CheckCircle2 size={32} />
                          </div>
                          <h4 className="text-xl font-bold mb-2">Access Granted</h4>
                          <p className="text-sm text-black/50 leading-relaxed mb-8">
                              Your cryptographic profile is now unlocked. We've sent the official invoice and SEPA transfer instructions to <strong>{emailInput}</strong>.
                          </p>
                          <div className="w-full text-left bg-black/[0.03] border border-black/5 p-5 rounded-xl mb-6">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 mb-1">Transfer Concept / Reference</p>
                              <div className="flex items-center justify-between">
                                <code className="text-sm font-bold bg-yellow-100 px-2 py-1 rounded text-black">{generatedRef}</code>
                                <button onClick={() => copyToClipboard(generatedRef, 'Reference')} className="text-black/40 hover:text-black transition-colors"><Copy size={16}/></button>
                              </div>
                          </div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00C076] animate-pulse">Redirecting to Dashboard...</p>
                      </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Hero */}
        <header className="text-center mb-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/30 mb-5">Pricing</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-[1.1]">
            Institutional access,<br/>transparent billing
          </h1>
          <p className="text-lg text-black/50 max-w-lg mx-auto leading-relaxed">
            Start free. Upgrade when you're ready. All payments are processed securely via SEPA Bank Transfer in Euros.
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
