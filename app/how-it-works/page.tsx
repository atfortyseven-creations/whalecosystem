import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'How It Works - Humanity Ledger',
  description: 'The architecture behind secure identity verification.',
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-white/20">
      <SystemHeader />
      
      <main className="flex-1 w-full pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#fcd34d]">Architecture</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-16">
            Under the <br className="hidden md:block" />
            <span className="text-white/40">Hood.</span>
          </h1>
          
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-white text-black flex items-center justify-center font-black text-xl">1</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">Cryptographic Identity Provisioning</h3>
                <p className="text-white/60 font-sans text-base leading-relaxed">
                  Upon onboarding, the system generates a unique, locally encrypted wallet. Your private keys never leave your device. An initial decentralized identifier (DID) is provisioned on the ledger.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-white text-black flex items-center justify-center font-black text-xl">2</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">Zero-Knowledge Attestations</h3>
                <p className="text-white/60 font-sans text-base leading-relaxed">
                  When you need to prove a claim (e.g., "I am over 18" or "I am an accredited investor"), you generate a ZK-proof locally. This proof mathematically guarantees the truth of the claim without revealing the underlying data.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-white text-black flex items-center justify-center font-black text-xl">3</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">On-Chain Verification</h3>
                <p className="text-white/60 font-sans text-base leading-relaxed">
                  Smart contracts on the Humanity Ledger verify the proof. The network consensus confirms validity, allowing third-party services to instantly accept your credentials trustlessly.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-12 h-12 shrink-0 rounded-full bg-white text-black flex items-center justify-center font-black text-xl">4</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">End-to-End Secure Messaging</h3>
                <p className="text-white/60 font-sans text-base leading-relaxed">
                  Using the established DIDs, the XMTP protocol is used to facilitate secure, peer-to-peer encrypted communications. Only the intended recipient can decrypt the messages.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
