'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useSettingsStore } from '@/lib/store/useSettingsStore';
import { useSovereignSessionLock } from '@/hooks/useSovereignSessionLock';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { Downhead } from '@/components/shared/Downhead';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';

import { ZoomWrapper } from './ZoomWrapper';
import dynamic from 'next/dynamic';

const UniversalEliteWallpaper = dynamic(
  () => import('@/components/shared/UniversalEliteWallpaper').then(m => ({ default: m.UniversalEliteWallpaper })),
  { ssr: false }
);
const UtilityPanels = dynamic(
  () => import('@/components/shared/UtilityPanels').then(m => ({ default: m.UtilityPanels })),
  { ssr: false }
);
const BillionWhaleNotification = dynamic(
  () => import('@/components/shared/UtilityPanels').then(m => ({ default: m.BillionWhaleNotification })),
  { ssr: false }
);
const ConnectWalletModal = dynamic(
  () => import('@/components/shared/ConnectWalletModal').then(m => ({ default: m.ConnectWalletModal })),
  { ssr: false }
);
const LinkedGate = dynamic(
  () => import('@/components/shared/LinkedGate').then(m => ({ default: m.LinkedGate })),
  { ssr: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Routes that don't need the gate (public / landing)
// ─────────────────────────────────────────────────────────────────────────────
const PUBLIC_PREFIXES = ['/docs', '/privacy', '/terms', '/connect', '/news', '/careers'];

// ─────────────────────────────────────────────────────────────────────────────
// Routes that must NOT get the legacy black Downhead footer
// ─────────────────────────────────────────────────────────────────────────────
const NO_DOWNHEAD_PREFIXES = [
  '/dashboard', '/portfolio', '/academy', '/support', '/network',
  '/docs', '/privacy', '/terms', '/ticket', '/news', '/connect',
  '/voss-supremacy', '/sovereign-intel', '/predictions', '/ledger',
  '/gold-registry', '/infrastructure', '/directory', '/company',
  '/vip', '/faq', '/api-marketplace', '/clearance', '/settings',
  '/login', '/sign-up', '/legal', '/admin', '/developer', '/forum',
  '/careers',
];

// ─────────────────────────────────────────────────────────────────────────────
// Routes that use a bounded-viewport layout (no dead space below content)
// Everything except the landing page ("/") and the dashboard (managed by
// WhaleProShell with its own fixed-inset shell) should be fully contained.
// ─────────────────────────────────────────────────────────────────────────────
const BOUNDED_PREFIXES = [
  '/portfolio', '/academy', '/support', '/news', '/network',
  '/predictions', '/ledger', '/sovereign-intel', '/voss-supremacy',
  '/gold-registry', '/vip', '/developer', '/developers', '/faq',
  '/ticket', '/settings', '/docs', '/privacy', '/terms', '/legal',
  '/connect', '/sign-up', '/login', '/admin', '/clearance',
  '/api-marketplace', '/directory', '/company', '/infrastructure',
  '/forum',
];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { fetchSettings, settings } = useSettingsStore();

  useSovereignSessionLock();

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Log page navigation
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch('/api/session-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: `NAVIGATED_TO: ${pathname || '/'}` })
      }).catch(() => {});
    }
  }, [pathname]);

  const isPublicPath = PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
  const content = !isPublicPath ? <LinkedGate>{children}</LinkedGate> : children;

  // ── Layout mode ───────────────────────────────────────────────────────────
  // DASHBOARD  → fixed inset-0 overflow-hidden   (WhaleProShell owns scroll)
  // BOUNDED    → h-[100dvh] overflow-hidden       (header + inner scroll box)
  // LANDING    → min-h-screen natural document scroll (immersive manifesto)
  const isDashboard = pathname.startsWith('/dashboard');
  const isBounded = !isDashboard && (pathname === '/' || BOUNDED_PREFIXES.some(p => pathname.startsWith(p)));
  const isLanding = pathname === '/';

  // Strict body trap for PC/Desktop — completely block document-level scrolling on bounded modules
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPosition = document.body.style.position;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    if (isDashboard || isBounded) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // To strictly prevent drag-scroll bleeds on MacOS trackpad:
      if (document.body.style.position !== 'fixed') {
        document.body.classList.add('ios-scroll-lock-strict');
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('ios-scroll-lock-strict');
    }

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.classList.remove('ios-scroll-lock-strict');
    };
  }, [isDashboard, isBounded]);

  // Handle Global Audio Feedback if enabled
  React.useEffect(() => {
    if (typeof document === 'undefined' || !settings?.soundEffects) return;
    
    // Low-latency AudioContext for UI clicks
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTick = () => {
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    };

    const handleAudioClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest('button, a, input[type="submit"], [role="button"], .cursor-pointer');
        if (clickable) playTick();
    };

    document.addEventListener('mousedown', handleAudioClick, { passive: true });
    return () => document.removeEventListener('mousedown', handleAudioClick);
  }, [settings?.soundEffects]);

  // ── Sovereign Interaction Telemetry (independent of sound settings) ─────────
  // CRITICAL FIX: Previously gated behind soundEffects=true, so if users had
  // sound disabled, ZERO interactions were ever logged to Session Logs.
  // Now fires unconditionally for all authenticated sessions.
  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleInteractionLog = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest('button, a, input[type="submit"], [role="button"], .cursor-pointer');
        if (clickable) {
            const actionText = (clickable.textContent || clickable.tagName || 'ELEMENT')
                .substring(0, 40).trim().replace(/\n/g, ' ');
            fetch('/api/session-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: `INTERACTION: CLICKED ${actionText}` }),
            }).catch(() => {});
        }
    };

    document.addEventListener('mousedown', handleInteractionLog, { passive: true });
    return () => document.removeEventListener('mousedown', handleInteractionLog);
  }, []);

  // ── Battery-aware CSS class for noise animation ──────────────────────────
  // Sets body.perf-high when device is plugged in → enables noise-shift CSS
  // animation via the selector in globals.css.
  // When on battery, the class is absent → noise-shift is paused (0 CPU).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let battery: any = null;

    const applyPerfClass = (charging: boolean, level: number) => {
      const isHigh = charging || level > 0.30;
      document.body.classList.toggle('perf-high', isHigh);
    };

    const initBattery = async () => {
      try {
        if ('getBattery' in navigator) {
          battery = await (navigator as any).getBattery();
          applyPerfClass(battery.charging, battery.level);
          const onChange = () => applyPerfClass(battery.charging, battery.level);
          battery.addEventListener('chargingchange', onChange);
          battery.addEventListener('levelchange', onChange);
        } else {
          // No Battery API — assume plugged in (desktop)
          document.body.classList.add('perf-high');
        }
      } catch {
        document.body.classList.add('perf-high');
      }
    };

    initBattery();
    return () => {
      if (battery) {
        battery.removeEventListener('chargingchange', () => {});
        battery.removeEventListener('levelchange', () => {});
      }
      document.body.classList.remove('perf-high');
    };
  }, []);

  // Root container
  const rootClass = isDashboard
    ? 'fixed inset-0 h-[100vh] w-[100vw] overflow-hidden flex flex-col bg-transparent z-0'
    : isBounded
      ? 'fixed inset-0 h-[100vh] w-[100vw] overflow-hidden flex flex-col bg-transparent z-0'
      : 'min-h-[100vh] w-full relative z-0 flex flex-col bg-transparent overflow-x-hidden';

  // Inner wrapper (below header)
  const innerClass = isDashboard
    ? 'flex-1 flex flex-col relative w-full overflow-hidden min-h-0'
    : isBounded
      ? 'flex-1 flex flex-col relative w-full overflow-hidden min-h-0'
      : 'flex-1 flex flex-col relative w-full';

  // <main> element
  const mainClass = isDashboard
    ? 'relative z-10 w-full flex-1 flex flex-col min-h-0 overflow-hidden'
    : isBounded
      // Scroll is fully contained here — no empty page-level void zones
      ? 'relative z-10 w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain'
      : 'relative z-10 w-full flex-1 flex flex-col overscroll-none';

  const showDownhead = pathname !== '/' &&
    !NO_DOWNHEAD_PREFIXES.some(p => pathname.startsWith(p));

  const showInstitutionalHeader =
    pathname === '/network' ||
    pathname === '/portfolio' ||
    pathname === '/support' ||
    pathname === '/academy' ||
    pathname === '/vip' ||
    pathname === '/';

  return (
    <>
      <ConnectWalletModal />

      <TitaniumGate>
        {!pathname.startsWith('/news') && <UniversalEliteWallpaper />}

        <div className={rootClass}>
          {/* Optional top header for select standalone routes */}
          <div className="flex-none w-full z-50">
            {showInstitutionalHeader && <InstitutionalHeader />}
          </div>

          <div className={innerClass}>
            <div className="relative z-40">
              <UtilityPanels />
              <BillionWhaleNotification />
            </div>

            <ZoomWrapper>
              <main
                className={mainClass}
                style={isBounded ? {
                  // Belt-and-suspenders scroll containment:
                  // scrollbarWidth and overscroll are set inline as well so
                  // no CSS cascade issue on any browser engine can break them.
                  scrollbarWidth: 'thin',
                  overscrollBehavior: 'contain',
                  touchAction: 'pan-y',
                } : undefined}
              >
                {content}
              </main>
            </ZoomWrapper>
          </div>

          {/* Legacy dark footer — only on routes that still need it */}
          {showDownhead && <Downhead />}
        </div>
      </TitaniumGate>
    </>
  );
}
