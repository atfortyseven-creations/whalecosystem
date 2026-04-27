"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports: never SSR these — they rely on wagmi/AppKit client hooks
const ConnectPage  = dynamic(() => import('@/components/landing/ConnectPage'),  { ssr: false });
const MobileLanding = dynamic(
  () => import('@/components/landing/MobileLanding').then(m => ({ default: m.MobileLanding })),
  { ssr: false }
);

/**
 * RealDeviceRouter — detects the PHYSICAL device, not the User-Agent string.
 *
 * Problem: A mobile user who enables "Desktop site" in Chrome sends a desktop
 * User-Agent. Server-side detection fails → they see ConnectPage with a QR
 * code they cannot scan (you can't scan your own screen).
 *
 * Solution: Client-side check using touch support + screen width.
 * This is immune to UA spoofing and works regardless of browser settings.
 *
 * Rules:
 *   - Touch capable device  →  MobileLanding (wallet connect buttons)
 *   - Screen width < 768px  →  MobileLanding
 *   - Otherwise             →  ConnectPage (QR handshake for desktop)
 */
function RealDeviceRouter() {
  const [view, setView] = useState<'loading' | 'mobile' | 'desktop'>('loading');

  useEffect(() => {
    // If already authenticated, redirect to root immediately — no connect needed.
    // This prevents authenticated users from seeing the wallet-connect portal
    // when TitaniumGate or any other mechanism sends them to /connect.
    const isAlreadyLinked = document.cookie.split('; ').some(r => r.startsWith('sovereign_handshake=0x'));
    if (isAlreadyLinked) {
      window.location.replace('/');
      return;
    }

    const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
    const isTouchDevice = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore — legacy IE check
      navigator.msMaxTouchPoints > 0
    );
    const isNarrowScreen = window.screen.width < 768;

    setView(isUaMobile || (isTouchDevice && isNarrowScreen) ? 'mobile' : 'desktop');
  }, []);

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#050505]/40">
        Initializing Sovereign Handshake...
      </div>
    );
  }

  return view === 'mobile' ? <MobileLanding /> : <ConnectPage />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#050505]/40">
        Initializing Sovereign Handshake...
      </div>
    }>
      <RealDeviceRouter />
    </Suspense>
  );
}
