"use client";

import React from 'react';
import { NewsTerminal } from '@/components/news/NewsTerminal';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { WhaleChatLink } from '@/components/shared/WhaleChatLink';

export default function WhaleNewsPage() {
  return (
    <div className="flex-1 flex flex-col bg-white text-slate-900 w-full min-h-screen">
      
      <div className="w-full flex flex-col items-center justify-start p-4 md:p-8 relative min-h-screen">
        <div className="w-full max-w-[1200px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] flex flex-col transition-all duration-500 z-10 mt-16 md:mt-24 overflow-hidden" style={{ height: '80vh' }}>
          <NewsTerminal />
        </div>
      </div>
      
      <WhaleChatLink />
      <SovereignFooter />
    </div>
  );
}
