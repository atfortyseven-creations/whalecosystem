"use client";

import React, { useState } from 'react';
import { ChevronDown, ArrowRight, MessageSquare, Zap, Shield, Cpu, Globe, Lock } from 'lucide-react';
import Link from 'next/link';

const FAQ_CATEGORIES = [
  {
    id: "platform",
    label: "Platform & Access",
    icon: Shield,
    color: "#6366f1",
    items: [
      {
        q: "What is Whale Alert Network?",
        a: "Whale Alert Network is an institutional-grade, privacy-first on-chain analytics platform. We provide real-time forensic monitoring of large capital flows ( $100K) across 24 ERC-20 tokens on Ethereum and major L2 networks. Our infrastructure detects institutional accumulation, exchange inflows/outflows, and anomalous on-chain behaviour before it impacts price action.",
      },
      {
        q: "Do I need to create an account or provide an email?",
        a: "No account registration is required. Authentication is handled exclusively through your Web3 wallet (MetaMask, Coinbase Wallet, Rainbow, etc.) using a cryptographic ECDSA signature. We do not store your email, password, or any personally identifiable information. Your private key never leaves your device.",
      },
      {
        q: "What is the System Vault?",
        a: "The System Vault is an optional local daemon process that runs on your machine. It enables fully private, local analytics  all graph pruning, aggregation, and querying happens in your own RAM, with no data ever transmitted to external servers. It is ideal for institutional operators who require complete data systemty.",
      },
      {
        q: "What is a Golden Ticket (WGT-GENESIS)?",
        a: "A Golden Ticket is a permanent, zero-knowledge verifiable on-chain credential (NFT) issued on Optimism L2. Holding one grants unrestricted, lifetime access to the Whale Alert Network terminal  without tying your identity to a subscription payment. Only 200 Genesis tickets have been minted.",
      },
    ],
  },
  {
    id: "data",
    label: "Data & Analytics",
    icon: Zap,
    color: "#06b6d4",
    items: [
      {
        q: "Is the data real or simulated?",
        a: "100% real. Our system directly scans Ethereum's ERC-20 Transfer event logs using authenticated Alchemy and GetBlock RPC endpoints, processing data block-by-block as it is confirmed on-chain. There is zero simulated or synthetic data in our production feeds. Every event in the Capital Ledger is a verified, on-chain transaction with a retrievable TX hash.",
      },
      {
        q: "How fast do I receive whale event data?",
        a: "Events appear in the API within one Ethereum block confirmation (approximately 12 seconds). Webhook subscribers receive push notifications with less than 500ms post-detection latency. WebSocket users receive a continuous live stream. Our internal node latency floor is 0.08ms from validator node to our processing pipeline.",
      },
      {
        q: "What tokens and networks do you cover?",
        a: "We currently monitor 24 major ERC-20 tokens on Ethereum Mainnet, including BTC (WBTC), ETH, BNB, SOL (Wrapped), XRP, LINK, UNI, AAVE, ARB, OP, PEPE, MATIC, and more. Base, Arbitrum, and Optimism coverage is available on Pro and Elite tiers. Our Aztec Pipeline section shows real-time ZK-rollup block data.",
      },
      {
        q: "What are EVM Thermodynamics?",
        a: "EVM Thermodynamics is our proprietary methodology for measuring the density and frequency of smart contract interactions  specifically EIP-2929 memory access patterns, gas topology shifts, and contract call depth  to identify institutional accumulation behaviour before it manifests in price action. It gives us a predictive edge over standard volume-based alerts.",
      },
      {
        q: "How does the Heikin-Ashi Signal Feed work?",
        a: "Our Pro tier includes an algorithmic signal feed that combines raw on-chain whale flow data with Heikin-Ashi candlestick analysis. The system generates LONG or SHORT bias signals per token based on the confluence of large capital inflows/outflows and technical trend structure. Signals are updated every 15 minutes and delivered via REST API or WebSocket.",
      },
    ],
  },
  {
    id: "technical",
    label: "Technical & Infrastructure",
    icon: Cpu,
    color: "#8b5cf6",
    items: [
      {
        q: "What hardware is required to run the System Vault?",
        a: "We recommend a minimum of 8GB RAM for full mainnet indexing across all 24 tokens. A LITE_MODE is available for systems with 4GB RAM, which reduces the indexing scope to the top 5 tokens. A modern multi-core CPU is sufficient; no GPU is required for the local vault. Our production cloud infrastructure uses GPU clusters for neural forensic synthesis.",
      },
      {
        q: "Is Base L2 supported?",
        a: "Yes. Base is natively integrated with our mempool sonar running on 500ms polling intervals. The Capital Ledger can be filtered by network (Ethereum Mainnet, Base, Arbitrum, Optimism) to isolate cross-chain capital flows. L2 coverage is available from the Starter tier upward.",
      },
      {
        q: "Why is Aztec Network used in the infrastructure?",
        a: "Aztec's ZK-rollup architecture allows us to batch-verify analytics data proofs and create cryptographically certified audit trails without revealing underlying wallet addresses publicly. This enables our Dark Pool Radar and institutional entity classification features to operate with strong privacy guarantees for our users.",
      },
      {
        q: "Do you store my portfolio data?",
        a: "Absolutely not. All portfolio queries are executed locally in the terminal or against your authenticated wallet session. No portfolio compositions, position sizes, or wallet groupings are ever transmitted to or stored on our central servers. The on-chain data we index (public transfer logs) is the only data we process.",
      },
    ],
  },
  {
    id: "billing",
    label: "Billing & Subscription",
    icon: Lock,
    color: "#10b981",
    items: [
      {
        q: "How does billing work?",
        a: "Subscriptions are billed monthly via Stripe. We accept all major credit cards and SEPA bank transfers (EU). Prices are denominated in EUR. You can upgrade, downgrade, or cancel your plan at any time from the Billing & Plan section in your dashboard. Cancellations take effect at the end of the current billing period.",
      },
      {
        q: "Can I cancel at any time?",
        a: "Yes. You can cancel your subscription at any moment from the dashboard without speaking to anyone. Your access continues until the end of the current paid period. We do not charge cancellation fees or require notice periods.",
      },
      {
        q: "Is there a free tier?",
        a: "Yes. A Free tier is available with limited API access (up to 500 requests/day) to 3 major tokens (BTC, ETH, BNB) with a 24-hour event window. This allows you to evaluate the quality of our data before committing to a paid plan. No credit card is required to start the free tier.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept Visa, Mastercard, American Express, and SEPA bank transfers for EUR payments. For institutional clients on the Elite tier, invoice-based billing with net-30 payment terms is available. Contact our sales team for custom arrangements.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState("platform");

  const toggle = (id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeData = FAQ_CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="min-h-screen bg-transparent text-[#0a0a0a] dark:text-[#FAF9F6] font-sans antialiased">
      
      {/* Hero */}
      <div className="w-full border-b border-black/6 bg-white">
        <div className="max-w-[2560px] mx-auto px-6 pt-32 pb-20 text-left">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Knowledge Base</span>
          </div>
          <h1 className="text-[52px] md:text-[68px] font-black tracking-tighter leading-[0.9] text-[#0a0a0a] mb-6">
            Frequently<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Asked Questions</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
            Everything you need to know about the Whale Alert Network platform, our data infrastructure, and subscription plans.
          </p>
        </div>
      </div>

      <div className="max-w-[2560px] mx-auto px-6 py-16 text-left">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-12">
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-[#0a0a0a] text-white shadow-xl'
                  : 'bg-white border border-black/8 text-slate-500 hover:border-black/20 hover:text-[#0a0a0a]'
              }`}
            >
              <cat.icon size={13} style={{ color: activeCategory === cat.id ? 'white' : cat.color }} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Active Category Questions */}
        <div className="space-y-3">
          {activeData.items.map((item, i) => {
            const id = `${activeCategory}-${i}`;
            const isOpen = openItems.has(id);
            return (
              <div
                key={id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-black/15 shadow-lg shadow-black/4' : 'border-black/8 hover:border-black/15'
                }`}
              >
                <button
                  onClick={() => toggle(id)}
                  className="w-full flex items-center justify-between px-8 py-6 text-left group"
                >
                  <span className={`font-bold text-[15px] leading-snug pr-8 transition-colors ${isOpen ? 'text-[#0a0a0a]' : 'text-[#0a0a0a]/80 group-hover:text-[#0a0a0a]'}`}>
                    {item.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isOpen ? 'bg-[#0a0a0a] text-white rotate-180' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <ChevronDown size={13} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-8 pb-7">
                    <div className="h-px bg-black/5 mb-5" />
                    <p className="text-slate-600 leading-relaxed text-[14px] font-medium">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-16 bg-white border border-black/8 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight text-[#0a0a0a]">Still have questions?</h3>
            <p className="text-slate-500 text-[14px] leading-relaxed max-w-md">
              Our technical support team is available to answer questions about API integration, data quality, and custom institutional plans.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/support"
              className="flex items-center gap-3 px-6 py-3.5 bg-[#0a0a0a] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black/80 transition-all shadow-lg"
            >
              <MessageSquare size={14} />
              Open Support Ticket
            </Link>
            <Link
              href="/api-marketplace"
              className="flex items-center gap-3 px-6 py-3.5 bg-slate-50 text-[#0a0a0a] border border-black/8 rounded-xl text-[11px] font-black uppercase tracking-widest hover:border-black/20 transition-all"
            >
              View API Plans
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
