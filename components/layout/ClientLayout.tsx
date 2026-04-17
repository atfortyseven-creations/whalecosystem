'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { Downhead } from '@/components/shared/Downhead';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { MobileNavBar } from '@/components/layout/MobileNavBar';
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
const PUBLIC_PREFIXES = ['/docs', '/privacy', '/terms', '/connect'];

// ─────────────────────────────────────────────────────────────────────────────
// Routes that must NOT get the legacy black Downhead footer
// ─────────────────────────────────────────────────────────────────────────────
const NO_DOWNHEAD_PREFIXES = [
  '/dashboard', '/portfolio', '/academy', '/support', '/network',
  '/docs', '/privacy', '/terms', '/ticket', '/news', '/connect',
  '/voss-supremacy', '/sovereign-intel', '/predictions', '/ledger',
  '/gold-registry', '/infrastructure', '/directory', '/company',
  '/vip', '/faq', '/api-marketplace', '/clearance', '/settings',
  '/login', '/sign-up', '/legal', '/admin', '/developer',
];

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isPublicPath = PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
  const content = !isPublicPath ? <LinkedGate>{children}</LinkedGate> : children;

  // ── Layout mode ───────────────────────────────────────────────────────────
  // DASHBOARD  → fixed inset-0 overflow-hidden  (WhaleProShell owns scroll)
  // ALL OTHERS → min-h-screen + native scroll   (no invisible void zones)
  const isDashboard = pathname.startsWith('/dashboard');

  const rootClass = isDashboard
    ? 'fixed inset-0 h-[100dvh] w-[100vw] overflow-hidden flex flex-col bg-[#FAF9F6] z-0'
    : 'min-h-screen w-full relative z-0 flex flex-col bg-[#FAF9F6]';

  const innerClass = isDashboard
    ? 'flex-1 flex flex-col relative w-full overflow-hidden'
    : 'flex-1 flex flex-col relative w-full';

  const mainClass = isDashboard
    ? 'relative z-10 w-full flex-1 flex flex-col min-h-0 overflow-hidden'
    : 'relative z-10 w-full flex-1 flex flex-col overscroll-none';

  const showDownhead = pathname !== '/' &&
    !NO_DOWNHEAD_PREFIXES.some(p => pathname.startsWith(p));

  const showInstitutionalHeader =
    pathname === '/network' ||
    pathname === '/portfolio' ||
    pathname === '/support' ||
    pathname === '/academy' ||
    pathname === '/vip' ||
    pathname === '/' ||
    pathname.startsWith('/news');

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
              <main className={mainClass}>
                {content}
              </main>
            </ZoomWrapper>
          </div>

          {/* Legacy dark footer — only on routes that still need it */}
          {showDownhead && <Downhead />}

          <MobileNavBar />
        </div>
      </TitaniumGate>
    </>
  );
}
