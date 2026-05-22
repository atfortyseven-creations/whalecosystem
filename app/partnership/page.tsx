"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Download, ShieldCheck } from 'lucide-react';

export default function PartnershipPage() {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/aztec_x_whale_partnership.svg';
    link.download = 'aztec_x_whale_partnership.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans flex flex-col justify-between selection:bg-[#000000]/10">
      
      {/*  HEADER  */}
      <header className="px-6 md:px-12 py-8 flex items-center justify-between border-b border-slate-100">
        <Link href="/" className="group flex items-center gap-3 px-4 py-2 hover:bg-slate-50 rounded-xl transition-all">
          <ArrowLeft size={16} className="text-[#0A0A0A] group-hover:-translate-x-1 transition-transform" />
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.15em]">Back to Main</span>
        </Link>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 border border-slate-200/60 rounded-full">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="font-mono text-[9px] font-black uppercase tracking-widest text-slate-500">Official Partnership Verified</span>
        </div>
      </header>

      {/*  MAIN CONTENT  */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-[1200px] mx-auto w-full">
        <div className="w-full flex flex-col items-center text-center space-y-6 mb-12">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">ANNOUNCEMENT PREVIEW</span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
            Aztec Network <span className="text-slate-400">×</span> Whale Alert Network
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl text-sm md:text-base">
            Composición visual de alta precisión y resolución infinita. Fondo blanco puro con nitidez pixel-perfect y visibilidad absoluta de todos los elementos de la marca.
          </p>
        </div>

        {/*  IMAGE CANVAS DISPLAY  */}
        <div className="w-full max-w-[960px] aspect-[16/9] bg-white border border-slate-200/80 rounded-[2.5rem] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.06)] overflow-hidden flex items-center justify-center p-2 relative group hover:border-slate-300 transition-all duration-500">
          <Image 
            src="/aztec_x_whale_partnership.svg" 
            alt="Aztec Network x Whale Alert Network Partnership Logo" 
            fill
            className="object-contain select-none p-8"
            priority
          />
        </div>

        {/*  ACTION BUTTONS  */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-[#0A0A0A] text-white hover:bg-black font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-[0_10px_30px_rgba(0,0,0,0.1)] active:scale-95"
          >
            <Download size={14} />
            <span>Download Vector (SVG)</span>
          </button>
          
          <a
            href="/aztec_x_whale_partnership.svg"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-[#0A0A0A] font-mono text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95"
          >
            <span>Open in New Tab</span>
          </a>
        </div>
      </main>

      {/*  FOOTER  */}
      <footer className="px-6 md:px-12 py-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-4">
        <span className="font-mono text-[9px] font-black uppercase tracking-wider">
          © {new Date().getFullYear()} Humanity Ledger Core. All Rights Reserved.
        </span>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[9px] font-black uppercase tracking-wider">Pure SVG</span>
          <span className="text-slate-200">|</span>
          <span className="font-mono text-[9px] font-black uppercase tracking-wider">Base64 Encoded PNGs</span>
          <span className="text-slate-200">|</span>
          <span className="font-mono text-[9px] font-black uppercase tracking-wider">Pixel-Perfect Symmetrical Grid</span>
        </div>
      </footer>

    </div>
  );
}
