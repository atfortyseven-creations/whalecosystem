import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'FAQ - Humanity Ledger',
  description: 'Frequently asked questions about the Humanity Ledger protocol.',
};

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-white/20">
      <SystemHeader />
      
      <main className="flex-1 w-full pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-3xl w-full">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#fcd34d]">Knowledge Base</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-16">
            Frequently Asked <br className="hidden md:block" />
            <span className="text-white/40">Questions.</span>
          </h1>
          
          <div className="space-y-8 divide-y divide-white/10">
            <div className="pt-8 first:pt-0">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-3">Is my data stored on the blockchain?</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                No. Humanity Ledger never stores your personally identifiable information (PII) on a public ledger. Only cryptographic proofs (Zero-Knowledge Proofs) and decentralized identifiers (DIDs) are anchored on-chain.
              </p>
            </div>

            <div className="pt-8">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-3">What happens if I lose my device?</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                Your identity is secured by your Secret Recovery Phrase (Seed Phrase). If you lose your device, you can restore your entire identity vault and cryptographic keys on a new device using this phrase.
              </p>
            </div>

            <div className="pt-8">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-3">Can Humanity Ledger access my messages?</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                Absolutely not. All communications via the Whale Chat protocol are secured using end-to-end encryption. The keys are held exclusively on your device, meaning we mathematically cannot read your messages.
              </p>
            </div>

            <div className="pt-8">
              <h3 className="text-lg font-black uppercase tracking-wider text-white mb-3">Is it compliant with GDPR and CCPA?</h3>
              <p className="text-white/60 font-sans text-sm leading-relaxed">
                Yes. Because data is held client-side and only cryptographic proofs are shared, the system is fundamentally aligned with strict data privacy regulations globally.
              </p>
            </div>
          </div>

        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
