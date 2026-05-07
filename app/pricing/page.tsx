"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Shield, Loader2, ArrowRight, Zap, Database, Lock, Globe, Building2, BarChart3, HelpCircle, Settings, Mail, Wallet } from 'lucide-react';
import { useSendTransaction } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther } from 'viem';

const TIER_HIERARCHY: Record<string, number> = {
  'FREE': 0,
  'STARTER': 1,
  'PRO': 2,
  'ELITE': 3
};

const TIER_PRICES: Record<string, { monthly: string, annual: string }> = {
  'STARTER': { monthly: '130', annual: '1300' }, 
  'PRO': { monthly: '350', annual: '3500' },
  'ELITE': { monthly: '950', annual: '9500' }
};

const PRICING_TIERS = [
  {
    id: 'STARTER',
    name: 'Explorer',
    target: 'For individual traders and researchers',
    description: 'Everything you need to start tracking the crypto market. Real-time data, alerts, and community access in one place.',
    features: [
      'Access to the full trading terminal',
      'Market updates (1 min refresh)',
      '3 custom price & whale alerts',
      'Community forum access',
      'On-chain identity profile',
      'API access (1,000 requests/day)'
    ],
    buttonText: 'Get Started'
  },
  {
    id: 'PRO',
    name: 'Professional',
    target: 'For active traders and analysts',
    description: 'Real-time streaming, advanced on-chain analytics, and priority support — everything a serious trader needs.',
    highlight: true,
    features: [
      'Real-time data streaming (zero delay)',
      'Advanced on-chain analytics',
      'Full read & write API access',
      'Priority support — 24/7',
      'Extended security analytics & alerts',
      'Up to 15 custom alerts',
      'Predictive market models',
      'API access (10,000 requests/day)'
    ],
    buttonText: 'Go Professional'
  },
  {
    id: 'ELITE',
    name: 'Enterprise',
    target: 'For institutions and trading firms',
    description: 'Unlimited data access, a dedicated account manager, and SLA-backed uptime. Built for teams that cannot afford downtime.',
    features: [
      'Unlimited data firehose access',
      'No query limits or rate caps',
      'Dedicated account manager',
      'Full API & Webhook integration',
      'Unlimited custom alerts',
      '99.99% uptime SLA guarantee',
      'Custom smart contract indexing',
      'Private node infrastructure'
    ],
    buttonText: 'Contact Sales'
  }
];

const PLATFORM_BENEFITS = [
  {
    title: 'High-Frequency Infrastructure',
    description: 'Zero-latency data processing powered by a state-of-the-art distributed architecture, ensuring you never miss a market movement.',
    icon: <Zap size={22} className="text-[#00C076]" />
  },
  {
    title: 'Cryptographic Security',
    description: 'On-chain validation through ECDSA signatures. The network never custodies your assets, ensuring absolute sovereignty and trustless operation.',
    icon: <Lock size={22} className="text-[#00C076]" />
  },
  {
    title: 'Immutable Ledger',
    description: 'All transactions, market anomalies, and intelligence updates are recorded on a permanent, auditable, and decentralized ledger.',
    icon: <Database size={22} className="text-[#00C076]" />
  },
  {
    title: 'Global Consensus Network',
    description: 'High-precision tridimensional data visualization through a Fibonacci sphere, aggregating global intelligence in real-time.',
    icon: <Globe size={22} className="text-[#00C076]" />
  },
  {
    title: 'Institutional Grade',
    description: 'Purpose-built to meet the strict regulatory frameworks and compliance standards of hedge funds, family offices, and corporate entities.',
    icon: <Building2 size={22} className="text-[#00C076]" />
  },
  {
    title: 'Multidimensional Analytics',
    description: 'Pattern recognition driven by advanced mathematical models, machine learning algorithms, and real-time algorithmic telemetry.',
    icon: <BarChart3 size={22} className="text-[#00C076]" />
  }
];

const FAQS = [
  {
    question: "How does billing work?",
    answer: "Payments are processed entirely on-chain via your connected Web3 wallet. Once the transaction is confirmed, your account tier is updated instantly and an invoice is emailed to you."
  },
  {
    question: "Do I need to connect a wallet?",
    answer: "Yes. The platform uses your wallet as your primary login and billing identity. It only takes a few seconds to connect — no password needed."
  },
  {
    question: "How are invoices sent?",
    answer: "During the checkout process, you will be prompted to provide your Gmail or email address. A cryptographic invoice will be sent there automatically after the block is mined."
  },
  {
    question: "Is there a refund policy?",
    answer: "Because plans provide immediate access to live proprietary data and analytics on-chain, we don't offer refunds on past billing cycles. Your subscription is immutable."
  }
];

function PricingContent() {
  const { isConnected, isSovereignHandshake, address } = useSovereignAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>('FREE');
  const [isTierLoaded, setIsTierLoaded] = useState<boolean>(false);
  
  // Billing cycle state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [txIdInput, setTxIdInput] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Wagmi hooks for on-chain transaction
  const { sendTransaction, isPending: isTxPending } = useSendTransaction();
  const [isConfirmingBackend, setIsConfirmingBackend] = useState(false);
  const { open } = useAppKit();

  useEffect(() => {
    async function fetchTier() {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.tier) {
            setCurrentTier(data.user.tier.split('_')[0].toUpperCase()); // normalize tier name
            if (data?.user?.email) setEmailInput(data.user.email);
          }
        }
      } catch (e) {
        console.error("Failed to fetch session tier");
      } finally {
        setIsTierLoaded(true);
      }
    }
    fetchTier();
  }, [isConnected, isSovereignHandshake]);

  const currentTierLevel = TIER_HIERARCHY[currentTier] || 0;

  const handlePortalAccess = () => {
    router.push('/dashboard?tab=billing');
  };

  const handleDirectPay = async () => {
    if (!selectedPlanId) return;
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Email Required', { description: 'Please enter your email to receive the invoice before paying.' });
      return;
    }
    const priceUsdt = TIER_PRICES[selectedPlanId][billingCycle];
    const treasury = process.env.NEXT_PUBLIC_TRON_TREASURY || 'TXnnwqdwaAgU4uHQfZuJ8jQr9C6TFhBn28';
    
    // @ts-ignore
    const tronWeb = window.tronWeb;
    if (!tronWeb || !tronWeb.ready) {
      toast.error('TronLink Not Found', { description: 'Please install or unlock TronLink to pay automatically.' });
      return;
    }

    try {
      setIsConfirmingBackend(true);
      toast.loading('Initializing USDT Transfer...', { id: 'tron-pay' });
      
      // USDT Contract on Tron Mainnet
      const contract = await tronWeb.contract().at("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
      
      // USDT has 6 decimals on Tron
      const amount = (parseFloat(priceUsdt) * 1000000).toString();
      
      const result = await contract.transfer(treasury, amount).send();
      
      if (result) {
        setTxIdInput(result); // Set the TXID automatically
        toast.success('Transfer Sent!', { id: 'tron-pay', description: 'Transaction broadcasted. Verifying now...' });
        
        // Auto-submit to backend
        const confirmRes = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            txHash: result,
            planId: selectedPlanId,
            billingCycle,
            priceEth: priceUsdt,
            email: emailInput,
            walletAddress: address || tronWeb.defaultAddress.base58 || 'tron_user',
            network: 'TRON_TRC20',
            token: 'USDT'
          })
        });

        if (confirmRes.ok) {
          toast.success('Access Granted!', { id: 'tron-pay' });
          setTimeout(() => router.push('/dashboard?tab=billing'), 2000);
        } else {
          throw new Error('Backend confirmation failed. Please save your TXID.');
        }
      }
    } catch (error: any) {
      console.error('Tron Payment Error:', error);
      toast.error('Payment Error', { 
        id: 'tron-pay', 
        description: error.message || 'The transaction failed or was rejected.' 
      });
    } finally {
      setIsConfirmingBackend(false);
    }
  };

  const handleSubscribeClick = (planId: string) => {
    if (!isConnected && !address) {
      toast.error('Connect your wallet to subscribe', {
        description: 'Please connect your wallet first — it only takes a few seconds.',
      });
      open();
      return;
    }

    // If they are on a mocked QR session, Wagmi has no real connector to sign a tx.
    if (isSovereignHandshake) {
      toast.info('Secure Payment Tunnel Required', {
        description: 'You are logged in via Mobile Sync. Please connect your wallet to this browser to process the on-chain transaction.',
      });
      open();
      return;
    }

    const targetTierLevel = TIER_HIERARCHY[planId] || 0;
    if (currentTierLevel >= targetTierLevel) {
      toast.info('You\'re already on this plan or higher', {
        description: `Your current plan already includes everything in ${planId}.`,
      });
      return;
    }

    setSelectedPlanId(planId);
    setIsEmailModalOpen(true);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      toast.error('Invalid Email', { description: 'Please enter a valid email address.' });
      return;
    }
    if (!txIdInput || txIdInput.length < 32) {
      toast.error('Invalid Transaction ID', { description: 'Please enter the Tron TXID after sending the USDT.' });
      return;
    }
    if (!selectedPlanId) return;

    const priceUsdt = TIER_PRICES[selectedPlanId][billingCycle];
    setLoadingTier(selectedPlanId);
    setIsConfirmingBackend(true);
    toast.loading('Verifying your Tron transaction...', { id: 'tx-toast' });
    
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: txIdInput,
          planId: selectedPlanId,
          billingCycle,
          priceEth: priceUsdt, // Keeping param name for backward compat or updating it later
          email: emailInput,
          walletAddress: address || 'manual_tron_user',
          network: 'TRON_TRC20',
          token: 'USDT'
        })
      });
      
      if (res.ok) {
        toast.success('Access Granted!', {
          id: 'tx-toast',
          description: 'Payment confirmed. Redirecting to your terminal...',
        });
        setTimeout(() => {
          router.push('/dashboard?tab=billing');
        }, 2000);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Verification failed');
      }
    } catch (error: any) {
      toast.error('Verification Error', {
        id: 'tx-toast',
        description: error.message || 'Verification failed. Please contact support.'
      });
    } finally {
      setLoadingTier(null);
      setIsEmailModalOpen(false);
      setIsConfirmingBackend(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#050505] font-sans selection:bg-[#050505] selection:text-[#FDFCF8]">
      
      {/* ── Navbar Spacer ── */}
      <div className="h-24 w-full bg-[#FDFCF8] border-b border-black/5" />

      <main className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24 relative">
        
        {/* Email Invoice Modal */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-black/10 relative overflow-y-auto max-h-[90vh]">
              <button 
                onClick={() => { setIsEmailModalOpen(false); setLoadingTier(null); }}
                className="absolute top-4 right-4 text-black/40 hover:text-black"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#00C076]/10 text-[#00C076] rounded-2xl flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Institutional Checkout</h3>
                  <p className="text-sm text-black/50">Tether USDT (Tron TRC-20 Network)</p>
                </div>
              </div>

              <div className="mb-6 p-5 bg-black/[0.02] border border-black/5 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-black/40">Send Payment To</span>
                  <span className="text-[10px] bg-[#00C076]/10 text-[#00C076] px-2 py-0.5 rounded font-black">TRC-20 ONLY</span>
                </div>
                <div className="flex items-center gap-3 bg-white border border-black/10 p-3 rounded-xl mb-4">
                  <code className="text-xs font-mono font-bold truncate flex-1">
                    {process.env.NEXT_PUBLIC_TRON_TREASURY || 'TXnnwqdwaAgU4uHQfZuJ8jQr9C6TFhBn28'}
                  </code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(process.env.NEXT_PUBLIC_TRON_TREASURY || 'TXnnwqdwaAgU4uHQfZuJ8jQr9C6TFhBn28');
                      toast.success('Address copied');
                    }}
                    className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                  >
                    <Database size={14} className="text-black/40" />
                  </button>
                </div>
                <p className="text-[10px] text-center font-bold text-black/30 uppercase tracking-widest leading-relaxed">
                  Verify the address carefully. Any assets sent via other networks (ETH, BSC) will be permanently lost.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-black/40 mb-2">Receipt Email</label>
                    <input 
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Where should we send your invoice?"
                      className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C076] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-black/40 mb-2">Transaction ID (TXID)</label>
                    <input 
                      type="text"
                      required
                      value={txIdInput}
                      onChange={(e) => setTxIdInput(e.target.value)}
                      placeholder="Paste your Tron TXID here..."
                      className="w-full px-4 py-3 bg-black/5 border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C076] font-medium"
                    />
                  </div>
                </div>
                
                <div className="mb-6 bg-[#050505] p-5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Selected Tier</span>
                    <span className="text-sm font-black uppercase tracking-widest text-white">{selectedPlanId} ({billingCycle})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-[#00C076]">{selectedPlanId ? TIER_PRICES[selectedPlanId][billingCycle] : ''} <span className="text-sm">USDT</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <button 
                    type="button"
                    onClick={handleDirectPay}
                    disabled={isConfirmingBackend}
                    className="py-4 bg-[#00C076] text-black rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all disabled:opacity-70"
                  >
                    <Wallet size={18} /> Pay via Wallet
                  </button>
                  <button 
                    type="submit"
                    disabled={isConfirmingBackend}
                    className="py-4 bg-[#050505] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black/80 transition-all disabled:opacity-70"
                  >
                    {isConfirmingBackend ? (
                      <><Loader2 className="animate-spin" size={18} /> Verifying...</>
                    ) : (
                      <>Manual Confirmation <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
                <p className="text-center text-[10px] text-black/30 mt-4 font-black uppercase tracking-[0.2em]">Institutional Grade Security • Zero Counterparty Risk</p>
              </form>
            </div>
          </div>
        )}

        {/* ── Hero ── */}
        <header className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-[#050505] mb-8 max-w-5xl leading-[1.1]">
            The right plan for<br className="hidden md:block" />
            <span className="text-[#050505]/30">every trader.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#050505]/60 max-w-3xl leading-relaxed font-medium mb-10">
            Join over 2,000 traders and analysts already using Whale Alert Network to track the largest on-chain movements in real time. Start free, scale as you grow.
          </p>

          {currentTierLevel > 0 && (
            <button
              onClick={handlePortalAccess}
              className="px-6 py-3 bg-[#050505] text-[#FDFCF8] rounded-full text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-black/80 transition-colors mb-6"
            >
              <Settings size={16} />
              Manage My Plan Panel
            </button>
          )}

          {/* Billing Toggle */}
          <div className="flex items-center gap-4 bg-white border border-black/10 p-1.5 rounded-full shadow-sm">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-black text-white' : 'text-black/50 hover:text-black'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-[#00C076] text-black' : 'text-black/50 hover:text-black'}`}
            >
              Annually <span className={`text-[10px] px-2 py-0.5 rounded-full ${billingCycle === 'annual' ? 'bg-black/10' : 'bg-[#00C076]/20 text-[#00C076]'}`}>Save 16%</span>
            </button>
          </div>
        </header>

        {/* ── Pricing Cards ── */}
        <div className="mb-6">
          <div className="rounded-[2rem] border border-[#050505]/10 bg-white p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.2em] text-black/40 mb-1">Free</div>
              <div className="text-3xl font-bold tracking-tight text-[#050505] mb-1">0 USDT <span className="text-base font-medium text-black/30">/ forever</span></div>
              <p className="text-sm text-black/50 font-medium">Browse market data, read the forum, and explore the platform at no cost.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Live news feed', 'Market overview', 'Forum access', 'On-chain explorer'].map(f => (
                <span key={f} className="flex items-center gap-1.5 text-xs text-black/50 font-semibold">
                  <CheckCircle2 size={13} className="text-black/20" /> {f}
                </span>
              ))}
            </div>
            <div className="shrink-0">
              {currentTierLevel === 0 ? (
                <span className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-black/5 text-black/40">Current Plan</span>
              ) : (
                <span className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-black/5 text-black/40">Included</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-32 relative z-10">
          {PRICING_TIERS.map((tier) => {
            const isDowngrade = currentTierLevel >= (TIER_HIERARCHY[tier.id] || 0);
            const price = TIER_PRICES[tier.id][billingCycle];
            
            return (
              <div 
                key={tier.id}
                className={`relative flex flex-col rounded-[2rem] transition-all duration-500 ${
                  tier.highlight 
                    ? 'bg-[#050505] text-[#FDFCF8] shadow-2xl md:-translate-y-4' 
                    : 'bg-white border border-[#050505]/10 text-[#050505] hover:shadow-lg'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00C076] text-[#050505] px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8 md:p-10 border-b border-black/5">
                  <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 ${tier.highlight ? 'text-white/50' : 'text-black/40'}`}>
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className={`text-5xl lg:text-6xl font-medium tracking-tighter ${tier.highlight ? 'text-white' : 'text-black'}`}>
                      {price}
                    </span>
                    <span className={`text-sm font-bold uppercase tracking-widest ${tier.highlight ? 'text-[#00C076]' : 'text-black/40'}`}>
                      USDT <br/><span className="text-[10px]">/ {billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </span>
                  </div>
                  <p className={`text-sm font-semibold mb-2 ${tier.highlight ? 'text-[#00C076]' : 'text-[#050505]'}`}>
                    {tier.target}
                  </p>
                  <p className={`text-sm leading-relaxed ${tier.highlight ? 'text-white/60' : 'text-black/60'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="p-8 md:p-10 flex-1 flex flex-col bg-white/[0.02]">
                  <ul className="flex flex-col gap-5 flex-1 mb-10">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3.5">
                        <CheckCircle2 size={20} className={`shrink-0 ${tier.highlight ? 'text-[#00C076]' : 'text-[#050505]/30'}`} />
                        <span className={`text-[15px] font-medium leading-snug ${tier.highlight ? 'text-white/90' : 'text-[#050505]/80'}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isDowngrade ? (
                    <button
                      disabled
                      className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 opacity-50 cursor-not-allowed ${
                        tier.highlight ? 'bg-[#00C076] text-[#050505]' : 'bg-black/10 text-black/50'
                      }`}
                    >
                      {currentTier === tier.id ? 'Your Current Plan' : 'Already Included'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribeClick(tier.id)}
                      disabled={!isTierLoaded || loadingTier === tier.id}
                      className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                        tier.highlight
                          ? 'bg-[#00C076] text-[#050505] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(0,192,118,0.3)] disabled:opacity-70'
                          : 'bg-[#050505] text-white hover:bg-black/80 hover:shadow-lg disabled:opacity-70'
                      }`}
                    >
                      {loadingTier === tier.id || !isTierLoaded ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          {tier.buttonText}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Platform Benefits ── */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#050505] mb-6">
              Built for serious traders
            </h2>
            <p className="text-lg text-[#050505]/60 max-w-3xl mx-auto">
              Every feature on the platform is built around one goal: giving you a clear, fast, and reliable view of what's happening on-chain before anyone else.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_BENEFITS.map((benefit, idx) => (
              <div key={idx} className="flex flex-col p-8 rounded-3xl bg-white border border-[#050505]/10 hover:border-[#050505]/20 transition-colors shadow-sm hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-[#FDFCF8] border border-[#050505]/5 flex items-center justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-[#050505] mb-3">{benefit.title}</h3>
                <p className="text-[15px] text-[#050505]/60 leading-relaxed font-medium">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Preguntas Frecuentes (FAQ) ── */}
        <section className="bg-[#050505] rounded-[3rem] p-10 md:p-20 text-[#FDFCF8] relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#00C076]/10 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                <HelpCircle size={14} className="text-[#00C076]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C076]">Common Questions</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                Frequently Asked<br />Questions
              </h2>
              <p className="text-white/50 text-lg">
                Can't find your answer here? Reach us directly through the Support section inside the platform.
              </p>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="flex flex-col">
                  <h4 className="text-lg font-bold text-white mb-3 leading-snug">{faq.question}</h4>
                  <p className="text-[15px] text-white/50 leading-relaxed font-medium">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00C076]" size={32} />
      </div>
    }>
      <PricingContent />
    </React.Suspense>
  );
}
