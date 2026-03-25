"use client";

import React, { useState, useEffect } from 'react';
import { SirDeggenBrowser } from '@/components/bsv/SirDeggenBrowser';
import { LegendaryLoader } from '@/components/ui/LegendaryLoader';

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LegendaryLoader title="CWI Substrate" subtitle="Initializing SirDeggen Edition..." />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] w-full p-6 md:p-12 overflow-hidden bg-transparent">
      {/* ── SIRDEGGEN EDITION: FULL BROWSER STACK ── */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto">
        <SirDeggenBrowser initialUrl="aztek://hub" />
      </div>

      <div className="mt-8 text-center">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">
          Whale Alert Terminal • Powered by SirDeggen Technology
        </p>
      </div>
    </div>
  );
}
