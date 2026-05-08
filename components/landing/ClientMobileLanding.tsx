"use client";

import dynamic from 'next/dynamic';

// The new ImmersiveManifestoLanding is fully responsive — it handles both
// mobile and desktop layouts. We load it dynamically to avoid SSR issues
// with the SovereignGlobe3D (WebGL Canvas).
export const ClientMobileLanding = dynamic(
  () => import('./ImmersiveManifestoLanding').then(m => ({ default: m.ImmersiveManifestoLanding })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20">
        INITIALIZING...
      </div>
    ),
  }
);
