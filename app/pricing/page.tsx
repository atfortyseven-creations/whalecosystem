"use client";

import React, { useState, useEffect } from 'react';
import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2, Shield, Loader2, ArrowRight, Zap, Database, Lock, Globe, Building2, BarChart3, HelpCircle } from 'lucide-react';

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Standard',
    price: '€0',
    billing: 'Monthly / Annual Billing Available',
    target: 'For individual researchers and academics',
    description: 'Foundational access to the Sovereign network with basic telemetry, community support, and core identity verification.',
    features: [
      'Access to Base Terminal Interface',
      'Network state updates (5 min latency)',
      'Read-only historical data access',
      'Standard community forum support',
      'Basic sovereign identity profile',
      'Public endpoint API limits (100 req/day)'
    ],
    buttonText: 'Start for Free'
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '€59',
    billing: 'Per User / Month',
    target: 'For market analysts and active operators',
    description: 'Real-time advanced telemetry with institutional-grade analytics tools, premium data feeds, and algorithmic pattern recognition.',
    highlight: true,
    features: [
      'Zero-latency data streaming',
      'Advanced on-chain network queries',
      'Read and write database access',
      'Priority technical support (24/7)',
      'Extended security analytics & alerts',
      'Up to 15 custom anomaly alerts',
      'Proprietary predictive models access',
      'API access (10,000 req/day)'
    ],
    buttonText: 'Acquire Pro License'
  },
  {
    id: 'Elite',
    name: 'Enterprise',
    price: '€199',
    billing: 'Per User / Month',
    target: 'For institutions and hedge funds',
    description: 'Unrestricted performance, expanded rate limits, dedicated account management, and Elite support for high-frequency operations.',
    features: [
      'Unlimited data firehose access',
      'Unrestricted complex queries',
      'Dedicated account manager',
      'Full API / Webhook integration',
      'Unlimited custom market alerts',
      'Guaranteed 99.99% SLA uptime',
      'Custom smart contract indexing',
      'Private node infrastructure'
    ],
    buttonText: 'Acquire Enterprise License'
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
    question: "How is the subscription billing managed?",
    answer: "Payments are securely processed through Stripe, our institutional payment gateway. You can seamlessly manage, cancel, or modify your tier at any time directly from your sovereign dashboard."
  },
  {
    question: "Do I need to connect my wallet to view the plans?",
    answer: "Yes. Sovereign operates under a strict Sovereign Identity model. Your wallet (ECDSA signature) acts as your singular access point and billing identity; we do not require legacy email/password combinations."
  },
  {
    question: "Can I upgrade my tier mid-month?",
    answer: "Absolutely. The system will automatically prorate the remaining cost of the month and instantly provision your new frequency limits and API access without any downtime."
  },
  {
    question: "Is there a refund policy available?",
    answer: "Because our licenses provide immediate access to proprietary data sets and high-frequency telemetry, we do not offer refunds. We recommend starting with the Standard tier to evaluate the network's capabilities."
  }
];

function PricingContent() {
  const { isConnected, isSovereignHandshake } = useSovereignAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  // Check for cancelation redirect
  useEffect(() => {
    if (searchParams.get('canceled')) {
      toast.error('Process canceled', {
        description: 'The license setup has not been completed.'
      });
      router.replace('/pricing');
    }
  }, [searchParams, router]);

  const handleSubscribe = async (planId: string) => {
    if (!isConnected || !isSovereignHandshake) {
      toast.error('Authentication Required', {
        description: 'You must connect and sign with your sovereign identity to access the gateway.',
      });
      router.push('/connect');
      return;
    }

    if (planId === 'starter') {
      toast.success('Access Verified', {
        description: 'You already have the permissions of the Standard license.',
      });
      router.push('/dashboard');
      return;
    }

    setLoadingTier(planId);
    const toastId = toast.loading('Initializing encrypted corporate gateway...');

    try {
      const response = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          userEmail: '', // Stripe collect
          returnUrl: '/pricing'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment gateway');
      }

      toast.success('Secure connection established. Redirecting...', { id: toastId });
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error('Transaction Interrupted', {
        id: toastId,
        description: error.message || 'There was a problem processing your request. Please try again.',
      });
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#050505] font-sans selection:bg-[#050505] selection:text-[#FDFCF8]">
      
      {/* ── Navbar Spacer ── */}
      <div className="h-24 w-full bg-[#FDFCF8] border-b border-black/5" />

      <main className="w-full max-w-7xl mx-auto px-6 py-16 md:py-24">
        
        {/* ── Encabezado Institucional ── */}
        <header className="flex flex-col items-center text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C076]/10 border border-[#00C076]/20 mb-6 shadow-sm">
            <Shield size={14} className="text-[#00C076]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C076]">Sovereign Use Licenses</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-[#050505] mb-8 max-w-5xl leading-[1.1]">
            Command the Data Singularity.<br className="hidden md:block" />
            <span className="text-[#050505]/30">Unleash Sovereign Intelligence.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#050505]/60 max-w-3xl leading-relaxed font-medium">
            Select the data framework that best adapts to your operational requirements. From individual academic research to high-frequency algorithmic deployment for corporate entities.
          </p>
        </header>

        {/* ── Estructura de Precios ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-32 relative z-10">
          {PRICING_TIERS.map((tier) => (
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
                  Corporate Standard
                </div>
              )}

              <div className="p-8 md:p-10 border-b border-black/5">
                <h3 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 ${tier.highlight ? 'text-white/50' : 'text-black/40'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className={`text-6xl font-medium tracking-tighter ${tier.highlight ? 'text-white' : 'text-black'}`}>
                    {tier.price}
                  </span>
                  <span className={`text-sm font-bold ${tier.highlight ? 'text-white/40' : 'text-black/30'}`}>
                    /mo
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

                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loadingTier === tier.id}
                  className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    tier.highlight
                      ? 'bg-[#00C076] text-[#050505] hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(0,192,118,0.3)]'
                      : 'bg-[#050505] text-white hover:bg-black/80 hover:shadow-lg'
                  }`}
                >
                  {loadingTier === tier.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      {tier.buttonText}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Beneficios de la Arquitectura ── */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#050505] mb-6">
              Institutional Grade Architecture
            </h2>
            <p className="text-lg text-[#050505]/60 max-w-3xl mx-auto">
              Our platform has been developed from the ground up to meet the strict latency and reliability requirements demanded by the high-performance enterprise sector.
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00C076]">Support & Queries</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                Frequently Asked<br />Questions
              </h2>
              <p className="text-white/50 text-lg">
                We resolve the most common operational and administrative questions. For dedicated support, please access the terminal.
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
