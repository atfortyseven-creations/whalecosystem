"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PartnershipPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans flex flex-col justify-between selection:bg-[#000000]/10">
      
      {/*  HEADER  */}
      <header className="px-6 md:px-12 py-8 flex items-center justify-between border-b border-slate-100">
        <Link href="/" className="group flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all">
          <ArrowLeft size={16} className="text-[#0A0A0A] group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.15em]">Back to Main</span>
        </Link>
      </header>

      {/*  MAIN CONTENT  */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-[1200px] mx-auto w-full">
        <div className="w-full flex flex-col items-center text-center space-y-12">
          
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-emerald-50 rounded-full animate-pulse">
              <ShieldCheck size={64} className="text-emerald-500" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[1.1] max-w-4xl">
              Official Partnership Verified
            </h1>
          </div>

          {/*  LOGOS DISPLAY  */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_-25px_rgba(0,0,0,0.1)] border border-slate-200/80 bg-white group hover:border-slate-300 transition-all duration-500">
              <Image 
                src="/system-shots/PARTNERS/pngtree-3d-silver-atom-symbol-matter-quantum-fiction-photo-picture-image_3222092.jpg" 
                alt="Partner Logo 1" 
                fill
                className="object-cover p-2 rounded-[2.5rem]"
                priority
              />
            </div>

            <div className="text-4xl text-slate-300 font-light">×</div>

            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-[2.5rem] overflow-hidden shadow-[0_30px_70px_-25px_rgba(0,0,0,0.1)] border border-slate-200/80 bg-white group hover:border-slate-300 transition-all duration-500">
              <Image 
                src="/system-shots/PARTNERS/Captura de pantalla 2026-05-22 030758.png" 
                alt="Partner Logo 2" 
                fill
                className="object-cover p-2 rounded-[2.5rem]"
                priority
              />
            </div>
          </div>

        </div>
      </main>

      {/*  FOOTER  */}
      <footer className="px-6 md:px-12 py-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-4">
        <span className="font-mono text-[9px] font-black uppercase tracking-wider">
          © {new Date().getFullYear()} Humanity Ledger Core. All Rights Reserved.
        </span>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[9px] font-black uppercase tracking-wider">Verified Identity</span>
          <span className="text-slate-200">|</span>
          <span className="font-mono text-[9px] font-black uppercase tracking-wider">Secure Ledger</span>
          <span className="text-slate-200">|</span>
          <span className="font-mono text-[9px] font-black uppercase tracking-wider">Global Partnership</span>
        </div>
      </footer>

    </div>
  );
}
