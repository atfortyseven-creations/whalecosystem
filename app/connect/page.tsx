"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic imports: never SSR these  they rely on wagmi/AppKit client hooks
const ConnectPage  = dynamic(() => import('@/components/landing/ConnectPage'),  { ssr: false });
const MobileLanding = dynamic(
  () => import('@/components/landing/MobileLanding').then(m => ({ default: m.MobileLanding })),
  { ssr: false }
);

import { useSystemAccount } from '@/hooks/useSystemAccount';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

/**
 * RealDeviceRouter  detects the PHYSICAL device, not the User-Agent string.
 *
 * Problem: A mobile user who enables "Desktop site" in Chrome sends a desktop
 * User-Agent. Server-side detection fails  they see ConnectPage with a QR
 * code they cannot scan (you can't scan your own screen).
 *
 * Solution: Client-side check using touch support + screen width.
 * This is immune to UA spoofing and works regardless of browser settings.
 *
 * Rules:
 *   - Touch capable device    MobileLanding (wallet connect buttons)
 *   - Screen width < 768px    MobileLanding
 *   - Otherwise               ConnectPage (QR handshake for desktop)
 */
function RealDeviceRouter() {
  const [view, setView] = useState<'loading' | 'mobile' | 'desktop'>('loading');
  const { isConnected } = useSystemAccount();

  // Dynamic Redirection Watcher (Triggers instantly when wallet connects)
  useEffect(() => {
    if (isConnected) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasUuid = urlParams.has('uuid');
      if (!hasUuid) {
        const next = urlParams.get('next') || '/';
        if (next !== window.location.pathname) {
          window.location.replace(next);
        }
      }
    }
  }, [isConnected]);

  useEffect(() => {
    // If already authenticated, redirect to the target destination immediately.
    // Exception: if a 'uuid' parameter is present, the user is linking a desktop
    // session from mobile — MUST stay on this page so MobileLanding handles the sync.
    const urlParams = new URLSearchParams(window.location.search);
    const hasUuid = urlParams.has('uuid');

    // Session detection: check both cookie AND localStorage.
    // Cookie (system_handshake) expires in 7 days; localStorage session 30 days.
    const hasCookie = document.cookie.split('; ').some(r => r.startsWith('system_handshake=0x'));

    let hasLocalSession = false;
    try {
      const stored = localStorage.getItem('system_session_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        hasLocalSession = !!(parsed?.exp && parsed.exp > Date.now());
      }
    } catch {}

    const isAlreadyLinked = hasCookie || hasLocalSession;
    if (isAlreadyLinked && !hasUuid) {
      // Authenticated: go to the 'next' param destination, or the dashboard.
      // NEVER default back to /connect — that creates an infinite redirect loop.
      const next = urlParams.get('next');
      const destination = next && !next.startsWith('/connect') && !next.startsWith('/sign-up')
        ? next
        : '/dashboard';
      window.location.replace(destination);
      return;
    }

    // Not authenticated — determine device type and show appropriate connect UI.
    const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
    const isTouchDevice = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore  legacy IE check
      navigator.msMaxTouchPoints > 0
    );
    const isNarrowScreen = window.screen.width < 768;

    setView(isUaMobile || (isTouchDevice && isNarrowScreen) ? 'mobile' : 'desktop');
  }, []);

  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4">
        <div className="w-48 h-48 sm:w-64 sm:h-64 opacity-90">
          <RemoteLottie path="/system-shots/block abstract.json" className="w-full h-full object-contain" />
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
        <div className="w-48 h-48 sm:w-64 sm:h-64 opacity-90">
          <RemoteLottie path="/system-shots/block abstract.json" className="w-full h-full object-contain" />
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
