import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'Our Vision - Whale Alert Network',
  description: 'Building a secure, decentralized identity ecosystem.',
};

export default function VisionPage() {
  return (
    <div className="min-h-screen flex flex-col text-black bg-white">
      <SystemHeader />

      <main className="flex-1 w-full pt-16 pb-16 px-6 md:px-12 flex flex-col items-center justify-center">
        <div className="max-w-3xl w-full">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 bg-black/5 mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Our Vision</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-8 text-black">
            The Vision of <br className="hidden md:block" />
            <span className="text-black/40">Whale Alert Network.</span>
          </h1>

          <div className="space-y-6 text-black/80 font-sans text-base md:text-lg leading-relaxed">
            <p>
              At <strong>Whale Alert Network</strong>, our primary goal is to establish a secure and transparent identity layer that protects user data while ensuring full regulatory compliance. We believe that a robust digital identity is the foundation for a safer and more efficient financial ecosystem.
            </p>
            <p>
              To achieve this, we are integrating directly with <strong>Aztec Network</strong>. By leveraging Aztec's advanced zero-knowledge privacy infrastructure, we can guarantee that all user data remains completely confidential. This allows our users to prove their identity and interact with financial protocols securely, without ever exposing their sensitive personal information.
            </p>
            <p>
              Under the leadership of our CEO, <a href="https://www.linkedin.com/in/stefan-antonio-cirisanu/" target="_blank" rel="noopener noreferrer" className="text-[#050505] underline font-bold hover:text-black/60 transition-colors">Stefan Antonio Cirisanu</a>, and developed by <a href="https://www.linkedin.com/company/humanity-ledger/" target="_blank" rel="noopener noreferrer" className="text-[#050505] underline font-bold hover:text-black/60 transition-colors">Humanity Ledger</a>, we are committed to building practical, enterprise-grade solutions. Our approach focuses on seamless integration, high security standards, and delivering a straightforward user experience that bridges traditional finance with decentralized privacy.
            </p>
          </div>

          <hr className="border-black/10 my-10" />

          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4 text-black">
            Contact Us
          </h2>
          <p className="text-black/60 font-sans text-sm md:text-base leading-relaxed mb-6">
            For media inquiries or further information about our technology, please reach out to our team.
          </p>
          <a
            href="mailto:press@humanidfi.com"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-black text-[11px] uppercase tracking-widest hover:bg-black/80 transition-all"
          >
            Contact Press Office
          </a>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
