import React from 'react';
import { SystemHeader } from '@/components/landing/SystemHeader';
import { SystemFooter } from '@/components/landing/SystemFooter';

export const metadata = {
  title: 'Contact Sales - Humanity Ledger',
  description: 'Connect with our enterprise team.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-white/20">
      <SystemHeader />
      
      <main className="flex-1 w-full pt-32 pb-24 px-6 md:px-12 flex flex-col items-center">
        <div className="max-w-3xl w-full">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#fcd34d]">Enterprise</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6">
            Talk to Sales.
          </h1>
          
          <p className="text-white/60 font-sans text-base leading-relaxed mb-12 max-w-xl">
            Integrate the Humanity Ledger identity layer into your institutional infrastructure. Fill out the form below and an enterprise architect will be in touch within 24 hours.
          </p>

          <form className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">First Name</label>
                <input type="text" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Last Name</label>
                <input type="text" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Corporate Email</label>
              <input type="email" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Company / Organization</label>
              <input type="text" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">How can we help?</label>
              <textarea rows={5} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors resize-none"></textarea>
            </div>

            <button type="button" className="mt-4 px-8 py-4 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-white/90 transition-all text-center">
              Submit Request
            </button>
          </form>

        </div>
      </main>

      <SystemFooter />
    </div>
  );
}
