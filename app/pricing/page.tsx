"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowRight, Settings, Wallet } from 'lucide-react';
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
    answer: 'Payments are processed on-chain via USDT on Tron (TRC-20). Once the transaction is confirmed, your account tier is updated instantly and an invoice is emailed to you.',
  },
  {
    question: 'Do I need a wallet?',
    answer: 'Yes. Your wallet is your login and billing identity. Connect in seconds — no password needed.',
  },
  {
    question: 'How are invoices sent?',
    answer: 'Enter your email at checkout. A receipt is emailed automatically after your payment is confirmed.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Plans give immediate access to live on-chain data. We do not offer refunds on past billing cycles.',
  },
];

function PricingContent() {
  const { isConnected, isSovereignHandshake, address } = useSovereignAccount();
  const router = useRouter();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [isTierLoaded, setIsTierLoaded] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [txIdInput, setTxIdInput] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
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

  const handleDirectPay = async () => {
    if (!selectedPlanId) return;
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Email required', { description: 'Enter your email before paying.' });
      return;
    }
    const priceUsdt = TIER_PRICES[selectedPlanId][billingCycle];
    const treasury = process.env.NEXT_PUBLIC_TRON_TREASURY || 'TEW1PSVyNuneyzyTk3cKaxCsizgGnkM3LQ';
    // @ts-ignore
    const tronWeb = window.tronWeb;
    if (!tronWeb || !tronWeb.ready) {
      toast.error('TronLink not found', { description: 'Install or unlock TronLink to pay automatically.' });
      return;
    }
    try {
      setIsConfirming(true);
      toast.loading('Sending USDT...', { id: 'tron-pay' });
      const contract = await tronWeb.contract().at('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
      const amount = (parseFloat(priceUsdt) * 1_000_000).toString();
      const txHash = await contract.transfer(treasury, amount).send();
      if (txHash) {
        setTxIdInput(txHash);
        toast.success('Sent!', { id: 'tron-pay', description: 'Confirming on-chain...' });
        const r = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash,
            planId: selectedPlanId,
            billingCycle,
            priceEth: priceUsdt,
            email: emailInput,
            walletAddress: address || tronWeb.defaultAddress.base58 || 'tron_user',
          }),
        });
        if (r.ok) {
          toast.success('Access granted!', { id: 'tron-pay' });
          setTimeout(() => router.push('/dashboard?tab=billing'), 1800);
        } else {
          throw new Error('Confirmation failed. Save your TXID.');
        }
      }
    } catch (e: any) {
      toast.error('Payment error', { id: 'tron-pay', description: e.message });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleManualConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes('@')) { toast.error('Invalid email'); return; }
    if (!txIdInput || txIdInput.length < 32) { toast.error('Invalid TXID'); return; }
    if (!selectedPlanId) return;
    setIsConfirming(true);
    setLoadingTier(selectedPlanId);
    toast.loading('Verifying...', { id: 'tx' });
    try {
      const r = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: txIdInput,
          planId: selectedPlanId,
          billingCycle,
          priceEth: TIER_PRICES[selectedPlanId][billingCycle],
          email: emailInput,
          walletAddress: address || 'manual_tron_user',
        }),
      });
      if (r.ok) {
        toast.success('Access granted!', { id: 'tx', description: 'Redirecting...' });
        setTimeout(() => router.push('/dashboard?tab=billing'), 1800);
      } else {
        const d = await r.json();
        throw new Error(d.error || 'Verification failed');
      }
    } catch (e: any) {
      toast.error('Error', { id: 'tx', description: e.message });
    } finally {
      setIsConfirming(false);
      setLoadingTier(null);
      setIsModalOpen(false);
    }
  };

  const handleSubscribeClick = (planId: string) => {
    if (!isConnected && !address) {
      toast.error('Wallet required', { description: 'Connect your wallet to subscribe.' });
      open();
      return;
    }
    if (isSovereignHandshake) {
      toast.info('Connect wallet to this browser', {
        description: 'You are synced via mobile. Please connect your wallet directly in this browser to pay.',
      });
      open();
      return;
    }
    if (currentTierLevel >= (TIER_HIERARCHY[planId] || 0)) {
      toast.info('Already on this plan or higher'); return;
    }
    setSelectedPlanId(planId);
    setIsModalOpen(true);
  };

  const TREASURY = process.env.NEXT_PUBLIC_TRON_TREASURY || 'TEW1PSVyNuneyzyTk3cKaxCsizgGnkM3LQ';

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111] font-sans">
      <div className="h-24 w-full" />

      <main className="w-full max-w-5xl mx-auto px-6 py-16 md:py-28">

        {/* Payment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-black/8 relative">
              <button
                onClick={() => { setIsModalOpen(false); setLoadingTier(null); }}
                className="absolute top-5 right-5 text-black/30 hover:text-black text-xl leading-none"
              >✕</button>

              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-black/30 mb-1">Payment</p>
              <h3 className="text-2xl font-bold tracking-tight mb-1">
                {selectedPlanId ? PRICING_TIERS.find(t => t.id === selectedPlanId)?.name : ''}
              </h3>
              <p className="text-sm text-black/40 mb-6">
                {selectedPlanId ? TIER_PRICES[selectedPlanId][billingCycle] : ''} USDT · Tron TRC-20
              </p>

              <div className="mb-5 p-4 bg-black/[0.03] rounded-xl border border-black/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/30 mb-2">Send to</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-semibold flex-1 truncate">{TREASURY}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(TREASURY); toast.success('Copied'); }}
                    className="text-[11px] font-bold text-black/40 hover:text-black px-2 py-1 rounded-lg hover:bg-black/5 transition"
                  >Copy</button>
                </div>
                <p className="text-[10px] text-black/30 mt-2">TRC-20 network only. Other networks will result in permanent loss.</p>
              </div>

              <form onSubmit={handleManualConfirm} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-black/30 mb-1.5">Email for receipt</label>
                  <input
                    type="email" required value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 text-sm bg-black/[0.03] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-black/30 mb-1.5">Transaction ID (TXID)</label>
                  <input
                    type="text" required value={txIdInput}
                    onChange={e => setTxIdInput(e.target.value)}
                    placeholder="Paste Tron TXID after sending..."
                    className="w-full px-4 py-3 text-sm bg-black/[0.03] border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 transition font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button" onClick={handleDirectPay} disabled={isConfirming}
                    className="py-3 bg-[#00C076] text-black rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition disabled:opacity-60"
                  >
                    <Wallet size={14} /> Pay via wallet
                  </button>
                  <button
                    type="submit" disabled={isConfirming}
                    className="py-3 bg-black text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition disabled:opacity-60"
                  >
                    {isConfirming ? <Loader2 className="animate-spin" size={14} /> : <>Confirm <ArrowRight size={14} /></>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hero */}
        <header className="text-center mb-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-black/30 mb-5">Pricing</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black mb-5 leading-[1.1]">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-black/50 max-w-lg mx-auto leading-relaxed">
            Start free. Upgrade when you're ready. Every plan activates instantly with no setup fees.
          </p>

          {currentTierLevel > 0 && (
            <button
              onClick={() => router.push('/dashboard?tab=billing')}
              className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.12em] hover:bg-black/80 transition"
            >
              <Settings size={13} /> Manage subscription
            </button>
          )}

          {/* Billing Toggle */}
          <div className="mt-10 inline-flex items-center bg-black/5 p-1 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black'
              }`}
            >Monthly</button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                billingCycle === 'annual' ? 'bg-white shadow-sm text-black' : 'text-black/40 hover:text-black'
              }`}
            >
              Annual <span className="text-[10px] font-bold text-[#00C076]">–16%</span>
            </button>
          </div>
        </header>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-32">
          {PRICING_TIERS.map(tier => {
            const isDowngrade = currentTierLevel >= (TIER_HIERARCHY[tier.id] || 0);
            const price = TIER_PRICES[tier.id][billingCycle];
            return (
              <div
                key={tier.id}
                className={`relative flex flex-col rounded-2xl transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-black text-white shadow-2xl'
                    : 'bg-white border border-black/8 hover:border-black/20'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C076] text-black text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-1 rounded-full">
                    Recommended
                  </div>
                )}

                <div className={`p-8 border-b ${tier.highlight ? 'border-white/8' : 'border-black/5'}`}>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-4 ${
                    tier.highlight ? 'text-white/40' : 'text-black/30'
                  }`}>{tier.name}</p>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className={`text-5xl font-bold tracking-tight ${tier.highlight ? 'text-white' : 'text-black'}`}>
                      {price}
                    </span>
                    <span className={`text-sm font-semibold ${tier.highlight ? 'text-[#00C076]' : 'text-black/30'}`}>
                      USDT
                    </span>
                  </div>
                  <p className={`text-[13px] ${tier.highlight ? 'text-white/30' : 'text-black/30'}`}>
                    per {billingCycle === 'monthly' ? 'month' : 'year'}
                  </p>
                  <p className={`text-sm mt-4 font-medium ${tier.highlight ? 'text-white/60' : 'text-black/50'}`}>
                    {tier.tagline}
                  </p>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <ul className="flex flex-col gap-3.5 flex-1 mb-8">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`mt-0.5 shrink-0 ${tier.highlight ? 'text-[#00C076]' : 'text-black/20'}`}>
                          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span className={`text-[14px] leading-snug ${tier.highlight ? 'text-white/70' : 'text-black/55'}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isDowngrade ? (
                    <div className={`w-full py-3 rounded-xl text-center text-xs font-bold uppercase tracking-[0.12em] opacity-40 ${
                      tier.highlight ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                    }`}>
                      {currentTier === tier.id ? 'Current plan' : 'Included'}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribeClick(tier.id)}
                      disabled={!isTierLoaded || loadingTier === tier.id}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                        tier.highlight
                          ? 'bg-[#00C076] text-black hover:bg-emerald-400 disabled:opacity-60'
                          : 'bg-black text-white hover:bg-black/80 disabled:opacity-60'
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
        <section className="border-t border-black/8 pt-20 pb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-10">Common questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 max-w-4xl">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <h4 className="text-[15px] font-semibold mb-2">{faq.question}</h4>
                <p className="text-sm text-black/50 leading-relaxed">{faq.answer}</p>
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
