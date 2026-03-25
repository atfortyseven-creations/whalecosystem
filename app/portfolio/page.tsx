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
    <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden bg-[#050505]">
      {/* ── SIRDEGGEN EDITION: FULL BROWSER STACK (IMMERSIVE) ── */}
      <div className="flex-1 w-full max-w-full">
        <SirDeggenBrowser initialUrl="aztek://hub" />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-20">
        <p className="text-[8px] font-black text-white uppercase tracking-[0.8em]">
          SirDeggen Technology Substrate v3.0
        </p>
      </div>
    </div>
  );
}
