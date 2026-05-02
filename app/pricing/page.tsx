import React from 'react';
import Link from 'next/link';

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Sovereign Free',
    price: '$0',
    target: 'Viral X / Retail',
    credits: '2,500',
    multiplier: '1.5x (Max)',
    features: [
      'Refresh data: 5 min',
      'Neo4j Hops: Max 2',
      'Humanity Multiplier: Up to 1.5x',
      'Sovereign Forum: Read Only',
      'Alerts: None'
    ]
  },
  {
    id: 'pro',
    name: 'Sovereign Pro',
    price: '$59',
    billing: '$49/mo billed annually (17% off)',
    target: 'Traders / Builders',
    credits: '8,000',
    multiplier: '3.0x (Max)',
    extra: '$0.012 per extra credit',
    highlight: true,
    features: [
      'Refresh data: Real-time SSE',
      'Neo4j Hops: Up to 5',
      'Humanity Multiplier: Up to 3.0x',
      'Sovereign Forum: Read + Signed Write',
      'Alerts: Up to 15 (Telegram/Discord)'
    ]
  },
  {
    id: 'elite',
    name: 'Sovereign Elite',
    price: '$199',
    billing: '$159/mo billed annually (20% off)',
    target: 'KOLs / Small Institutions',
    credits: '30,000',
    multiplier: '4.0x (Max)',
    extra: '$0.009 per extra credit',
    features: [
      'Refresh data: Real-time + WS',
      'Neo4j Hops: Unlimited (7+)',
      'Humanity Multiplier: Up to 4.0x',
      'Sovereign Forum: Featured + Bounties',
      'Alerts: Unlimited + Webhooks'
    ]
  }
];

const CONSUMPTION_MATRIX = [
  { action: 'Login / sovereign_handshake', cost: '0', reason: 'Zero friction access' },
  { action: 'Basic Query (Postgres)', cost: '1', reason: 'Standard ledger reads' },
  { action: 'Live WebSocket (1 min)', cost: '2', reason: 'Singleton reference counting' },
  { action: 'Z-Score Anomaly & EVM Thermo', cost: '6', reason: 'Heavy computation' },
  { action: 'Multi-Hop Neo4j (3-7 hops)', cost: '8-12', reason: 'Graph traversal (Memory Matrix)' },
  { action: 'Post in Sovereign Forum', cost: '-15', reason: 'Network effects reward' }
];

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-[#FDFCF8] text-[#050505] selection:bg-black selection:text-[#FDFCF8] font-sans antialiased overflow-x-hidden pt-32 pb-24">
      <div className="w-full max-w-[1100px] mx-auto px-5 sm:px-8 flex flex-col gap-16">
        
        {/* ─── Header ─── */}
        <header className="flex flex-col gap-6 text-center mb-4">
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/5 border border-black/10 backdrop-blur-sm cursor-default">
              <span className="text-[11px] font-medium uppercase tracking-widest text-black/80 font-mono">Sovereign Credits V4.0</span>
            </div>
          </div>
          <h1 className="text-[40px] md:text-[56px] font-sans font-medium text-black leading-[1.1] tracking-tight">
            Absolute Sovereignty.
            <br className="hidden md:block"/>
            <span className="font-serif italic font-light text-black/60"> Cryptographically Signed.</span>
          </h1>
          <p className="font-serif text-[16px] text-[#444] max-w-2xl mx-auto leading-[1.8] mt-4">
            Nansen charges you to read. Dune charges you to query. We reward you to exist. 
            Your cryptographic signature is your membership. Read the matrix before the market does.
          </p>
        </header>

        {/* ─── Pricing Tiers ─── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_TIERS.map((tier) => (
            <div 
              key={tier.id} 
              className={`flex flex-col rounded-2xl border transition-all duration-300 relative ${
                tier.highlight 
                  ? 'bg-black border-black text-[#FDFCF8] shadow-2xl scale-[1.02] z-10' 
                  : 'bg-[#fdfbf6] border-black/10 hover:border-black/30'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00C076] text-black px-4 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest">
                  Terminal Standard
                </div>
              )}
              
              <div className="p-8 border-b border-white/10">
                <h3 className={`font-mono text-[12px] font-bold uppercase tracking-widest mb-6 ${tier.highlight ? 'text-[#00C076]' : 'text-black/60'}`}>
                  {tier.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-[48px] font-sans font-medium leading-none ${tier.highlight ? 'text-white' : 'text-black'}`}>
                    {tier.price}
                  </span>
                  <span className={`font-mono text-[12px] uppercase tracking-widest ${tier.highlight ? 'text-white/40' : 'text-black/40'}`}>
                    / mo
                  </span>
                </div>
                {tier.billing && (
                  <p className={`font-mono text-[10px] uppercase tracking-widest mt-2 ${tier.highlight ? 'text-white/60' : 'text-black/50'}`}>
                    {tier.billing}
                  </p>
                )}
                
                <div className="mt-8 flex flex-col gap-3">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${tier.highlight ? 'bg-white/5' : 'bg-black/5'}`}>
                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">Base Credits</span>
                    <span className="font-mono text-[12px] font-bold">{tier.credits}</span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded-lg ${tier.highlight ? 'bg-[#00C076]/10 text-[#00C076]' : 'bg-black/5 text-black'}`}>
                    <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">Humanity Multiplier</span>
                    <span className="font-mono text-[12px] font-bold">{tier.multiplier}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <ul className="flex flex-col gap-4 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${tier.highlight ? 'bg-[#00C076]' : 'bg-black/40'}`} />
                      <span className={`font-serif text-[14px] leading-relaxed ${tier.highlight ? 'text-white/80' : 'text-[#444]'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={`w-full py-4 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest transition-all ${
                    tier.highlight 
                      ? 'bg-[#00C076] text-black hover:bg-[#00d683]' 
                      : 'bg-black/5 text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {tier.id === 'free' ? 'Initialize Handshake' : 'Upgrade Protocol'}
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* ─── Humanity Ledger Engine ─── */}
        <section className="flex flex-col md:flex-row items-stretch overflow-hidden rounded-2xl border border-black/10 bg-[#fdfbf6] shadow-sm mt-8">
          <div className="w-full md:w-[380px] bg-black text-[#FDFCF8] flex flex-col justify-center p-10 shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00C076]/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <h3 className="font-sans text-[28px] font-medium mb-4 text-white relative z-10">
              The Humanity Ledger
            </h3>
            <p className="font-serif text-[15px] leading-[1.8] text-white/70 relative z-10">
              Our ultimate anti-sybil engine. Your cryptographic reputation dictates your power. 
              The more you verify, post, and analyze natively, the higher your multiplier scales. 
              Lock-in is no longer a credit card; it is your identity.
            </p>
          </div>
          <div className="flex-1 p-10 flex flex-col justify-center bg-white">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-black/40 mb-6">Multiplier Matrix</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="font-serif text-[15px] text-[#222]">Score 0 - 30 (Verified Sybil)</span>
                <span className="font-mono text-[13px] font-bold text-black/60">1.0x Base</span>
              </div>
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="font-serif text-[15px] text-[#222]">Score 31 - 65 (Active Operator)</span>
                <span className="font-mono text-[13px] font-bold text-black/80">2.0x Boost</span>
              </div>
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <span className="font-serif text-[15px] text-[#222]">Score 66 - 85 (Sovereign Node)</span>
                <span className="font-mono text-[13px] font-bold text-[#00C076]">3.0x Boost</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="font-serif text-[15px] font-bold text-black">Score 86 - 100 (Elite Architect)</span>
                <span className="font-mono text-[14px] font-black text-[#00C076]">4.0x Max Yield</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Credit Consumption ─── */}
        <section className="flex flex-col relative w-full pt-8 mb-8">
          <div className="w-full pb-4 mb-6 flex items-end justify-between border-b border-black/10">
            <h2 className="text-[20px] font-medium font-sans text-black">
              Zero-Simulation Metering
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">BullMQ Atomic Validation</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-[1.5px] border-black">
                  <th className="py-4 px-2 font-mono text-[11px] font-bold uppercase tracking-widest text-black/50">Execution Payload</th>
                  <th className="py-4 px-2 font-mono text-[11px] font-bold uppercase tracking-widest text-black/50">Cost (Credits)</th>
                  <th className="py-4 px-2 font-mono text-[11px] font-bold uppercase tracking-widest text-black/50">Architectural Justification</th>
                </tr>
              </thead>
              <tbody>
                {CONSUMPTION_MATRIX.map((item, idx) => (
                  <tr key={idx} className="border-b border-black/10 hover:bg-black/5 transition-colors">
                    <td className="py-5 px-2 font-sans text-[15px] font-medium text-black">{item.action}</td>
                    <td className={`py-5 px-2 font-mono text-[13px] font-bold ${item.cost.startsWith('-') ? 'text-[#00C076]' : 'text-black'}`}>
                      {item.cost}
                    </td>
                    <td className="py-5 px-2 font-serif text-[14px] text-[#555]">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
