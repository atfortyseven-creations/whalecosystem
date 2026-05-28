import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'Use Cases - Humanity Ledger',
  description: 'Real-world applications of the Humanity Ledger identity protocol.',
};

export default function UseCasesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-white/20">
      <SystemHeader />
      
      <main className="flex-1 w-full pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#fcd34d]">Applications</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-16">
            Real-World <br className="hidden md:block" />
            <span className="text-white/40">Use Cases.</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 flex flex-col gap-4">
              <h3 className="text-xl font-black uppercase tracking-wider text-white">Financial Services & DeFi</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                Streamline KYC and AML compliance without storing PII. Users prove their identity and accreditation status on-chain instantly, enabling frictionless onboarding for exchanges, lending protocols, and institutional trading platforms.
              </p>
            </div>

            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 flex flex-col gap-4">
              <h3 className="text-xl font-black uppercase tracking-wider text-white">E-Commerce & Retail</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                Prevent fraud and sybil attacks with verifiable human credentials. Ensure one account per user for ticketing, limited-edition drops, and high-value purchases.
              </p>
            </div>

            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 flex flex-col gap-4">
              <h3 className="text-xl font-black uppercase tracking-wider text-white">Healthcare & Telecom</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                Allow patients and customers to authenticate securely across networks without repeatedly exposing their sensitive credentials. Perfect for seamless telemedicine and cross-border roaming.
              </p>
            </div>

            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 flex flex-col gap-4">
              <h3 className="text-xl font-black uppercase tracking-wider text-white">DAOs & Governance</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                Implement true "One Person, One Vote" systems. By verifying unique personhood, DAOs can move beyond token-weighted voting to truly democratic and sybil-resistant governance structures.
              </p>
            </div>
          </div>

        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
