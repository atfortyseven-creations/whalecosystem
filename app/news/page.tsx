"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { NewsTerminal } from '@/components/news/NewsTerminal';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

export default function WhaleNewsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8]">
      
      {/* ── NESTR HERO ── */}
      <div className="w-full max-w-[1400px] mx-auto pt-32 pb-16 px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-[3rem] border border-black/5 shadow-sm p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
            <div className="w-full lg:w-1/2 relative z-10 space-y-8 text-center lg:text-left">
                
                
                <h1 className="text-[40px] md:text-[56px] font-black uppercase tracking-tighter text-[#0A0A0A] leading-[0.95]">
                    News <br /><span className="text-[#0044CC]">Terminal.</span>
                </h1>
                
                <p className="font-serif text-[16px] md:text-[18px] text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Real-time aggregation of geopolitical, macroeconomic, and decentralized finance events. Our NLP pipeline isolates market-moving signals before they hit mainstream dissemination.
                </p>
            </div>

            <div className="w-full lg:w-1/2 relative aspect-square md:aspect-video flex items-center justify-center bg-[#FAFAF8] rounded-[2.5rem] border border-black/5 shadow-sm p-6 overflow-hidden">
                <RemoteLottie path="Connected world.json" className="scale-125 w-full h-full object-contain" />
            </div>
        </motion.div>
      </div>

      <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 lg:px-12 mb-20">
        <NewsTerminal />
      </div>
      
      <SovereignFooter />
    </div>
  );
}
