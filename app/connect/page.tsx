"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports: never SSR these — they rely on wagmi/AppKit client hooks
const ConnectPage  = dynamic(() => import('@/components/landing/ConnectPage'),  { ssr: false });
const MobileLanding = dynamic(
  () => import('@/components/landing/MobileLanding').then(m => ({ default: m.MobileLanding })),
  { ssr: false }
);

import { useSovereignAccount } from '@/hooks/useSovereignAccount';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

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
  const { isConnected } = useSovereignAccount();

  // Dynamic Redirection Watcher (Triggers instantly when wallet connects)
  useEffect(() => {
    if (isConnected) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasUuid = urlParams.has('uuid');
      if (!hasUuid) {
        const next = urlParams.get('next') || '/';
        window.location.replace(next);
      }
    }
  }, [isConnected]);

  useEffect(() => {
    // If already authenticated, redirect to root immediately — no connect needed.
    // However, if there is a 'uuid' parameter, they are trying to link a desktop
    // session, so we MUST stay on this page to let MobileLanding handle the sync.
    const urlParams = new URLSearchParams(window.location.search);
    const hasUuid = urlParams.has('uuid');

    // ── Session detection: check both cookie AND localStorage ──────────────
    // The cookie (sovereign_handshake) expires in 7 days.
    // The localStorage session (sovereign_session_v2) lasts 30 days.
    // If either is valid → user is already authenticated → go to landing page.
    const hasCookie = document.cookie.split('; ').some(r => r.startsWith('sovereign_handshake=0x'));

    let hasLocalSession = false;
    try {
      const stored = localStorage.getItem('sovereign_session_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        hasLocalSession = !!(parsed?.exp && parsed.exp > Date.now());
      }
    } catch {}

    const isAlreadyLinked = hasCookie || hasLocalSession;
    if (isAlreadyLinked && !hasUuid) {
      // Redirect to the 'next' param if present, otherwise the connect/scanner page.
      // NOTE: Goes to '/connect' so the user lands on the ConnectedScreen (scanner + info),
      // NOT the landing page and NOT the dashboard directly.
      const next = urlParams.get('next') || '/connect';
      window.location.replace(next);
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
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <div className="w-48 h-48 sm:w-64 sm:h-64 opacity-90 mix-blend-multiply dark:mix-blend-screen">
          <RemoteLottie path="block abstract.json" className="w-full h-full object-contain" />
        </div>
        <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#050505]/50 animate-pulse font-bold">
          Loading...
        </div>
      </div>
    );
  }

  return view === 'mobile' ? <MobileLanding /> : <ConnectPage />;
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <div className="w-48 h-48 sm:w-64 sm:h-64 opacity-90 mix-blend-multiply dark:mix-blend-screen">
          <RemoteLottie path="block abstract.json" className="w-full h-full object-contain" />
        </div>
        <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#050505]/50 animate-pulse font-bold">
          Loading...
        </div>
      </div>
    }>
      <RealDeviceRouter />
    </Suspense>
  );
}
