"use client";

import dynamic from 'next/dynamic';

export const ClientMobileLanding = dynamic(
  () => import('./MobileLanding').then(m => ({ default: m.MobileLanding })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20">
        INITIALIZING...
      </div>
    ),
  }
);
