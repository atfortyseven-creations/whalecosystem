import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'Our Vision - Humanity Ledger',
  description: 'Building a secure, decentralized digital identity layer for everyone.',
};

const BG = "url('/rectangle_large_type_2_a9c6cc1e1738c43864683c13c43314d9.jpg')";

export default function VisionPage() {
  return (
    <div
      className="min-h-screen flex flex-col text-black"
      style={{
        backgroundColor: '#ffffff',
        backgroundImage: BG,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center top',
        backgroundSize: 'contain',
      }}
    >
      <SystemHeader />

      <main className="flex-1 w-full pt-28 pb-24 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-4xl w-full">

          {/* Label badge */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-black/10 bg-black/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Our Vision</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight mb-8 text-black">
            The Future of <br className="hidden md:block" />
            <span className="text-black/40">Digital Identity.</span>
          </h1>

          <div className="space-y-8 text-black/70 font-sans text-base md:text-lg leading-relaxed max-w-3xl">
            <p>
              At Humanity Ledger, we believe that digital identity is a fundamental human right. The current model of fragmented, centralized platforms not only exposes users to data breaches but also misaligns incentives between services and individuals.
            </p>
            <p>
              Our mission is to build a foundational identity layer for the internet. By using privacy-preserving proofs and decentralized infrastructure, we ensure that you remain in complete control of your data — you decide who has access, what they can see, and for how long.
            </p>
            <p>
              We are building a future where your digital presence is portable, secure by design, and entirely in your hands.
            </p>
          </div>

          <hr className="border-black/10 my-16" />

          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-8 text-black">
            Press Inquiries
          </h2>
          <p className="text-black/60 font-sans text-base leading-relaxed mb-6">
            For media inquiries, interviews, and brand assets, please contact our communications team directly.
          </p>
          <a
            href="mailto:press@humanidfi.com"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-black/80 transition-all"
          >
            Contact Press Office
          </a>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
