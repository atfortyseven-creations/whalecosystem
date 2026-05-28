import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'Vision & Press - Humanity Ledger',
  description: 'Our vision for a secure, decentralized identity layer.',
};

export default function VisionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-white/20">
      <SystemHeader />
      
      <main className="flex-1 w-full pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#fcd34d]">Corporate Vision</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-8">
            The Future of <br className="hidden md:block" />
            <span className="text-white/40">Digital Identity.</span>
          </h1>
          
          <div className="space-y-8 text-white/70 font-sans text-base md:text-lg leading-relaxed max-w-3xl">
            <p>
              At Humanity Ledger, we believe that digital identity is a fundamental human right. The current paradigm of fragmented, centralized silos not only exposes users to catastrophic data breaches but also fundamentally misaligns incentives between platforms and individuals.
            </p>
            <p>
              Our vision is to architect a foundational identity layer for the internet. By leveraging zero-knowledge proofs and decentralized infrastructure, we ensure that you remain in complete control of your data. You decide who has access, what they have access to, and for how long.
            </p>
            <p>
              We are building a future where your digital presence is portable, secure by design, and entirely sovereign.
            </p>
          </div>

          <hr className="border-white/10 my-16" />

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-8">
            Press Inquiries
          </h2>
          <p className="text-white/70 font-sans text-base leading-relaxed mb-6">
            For media inquiries, interviews, and brand assets, please direct your correspondence to our communications team.
          </p>
          <a href="mailto:press@humanidfi.com" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all">
            Contact Press Office
          </a>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
