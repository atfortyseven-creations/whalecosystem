import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';
import Link from 'next/link';

export const metadata = {
  title: 'Interactive Demo - Humanity Ledger',
  description: 'Experience the Humanity Ledger secure terminal.',
};

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-white/20">
      <SystemHeader />
      
      <main className="flex-1 w-full pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#fcd34d]">Live Interactive Demo</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6">
            Enter the Terminal.
          </h1>
          
          <p className="text-white/60 font-sans text-base leading-relaxed mb-12">
            The best way to understand the Humanity Ledger is to experience it. Launch the live terminal to explore the secure portfolio, identity dashboard, and end-to-end encrypted chat interface.
          </p>

          <Link href="/" className="inline-flex items-center justify-center px-12 py-5 bg-white text-black font-black text-[13px] uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95">
            Launch Application Terminal
          </Link>
        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
