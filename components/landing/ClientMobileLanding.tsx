"use client";

import dynamic from 'next/dynamic';

/**
 * ClientMobileLanding — dynamic import to avoid SSR issues with
 * MobileManifesto (uses browser APIs for live whale flow fetching).
 */
export const ClientMobileLanding = dynamic(
  () => import('./MobileManifesto').then(m => ({ default: m.MobileManifesto })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20">
        —
      </div>
    ),
  }
);
