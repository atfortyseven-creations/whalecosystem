'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount, useAccountEffect } from 'wagmi';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { DropdownNav } from '@/components/site/DropdownNav';
import { SiteNavigationPill } from '@/components/shared/SiteNavigationPill';
import { SystemsUtilityHeader } from '@/components/shared/SystemsUtilityHeader';
import { GlobalTokenTicker } from '@/components/shared/GlobalTokenTicker';
import { Downhead } from '@/components/shared/Downhead';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { MobileNavBar } from '@/components/layout/MobileNavBar';
import { useSettings } from '@/src/context/SettingsContext';
import { ZoomWrapper } from './ZoomWrapper';
import dynamic from 'next/dynamic';

// ─── Lazy GPU-heavy components ──────────────────────────────────────────
// Canvas-based backgrounds run off the main thread on supporting browsers.
// Dynamic-importing them prevents them from blocking initial hydration.
// FIX Bug 17: HighHzWallpaper removed — rendering both UniversalEliteWallpaper
// AND HighHzWallpaper simultaneously caused a GPU compositing storm:
// two fixed inset-0 layers doubled VRAM usage and created blend-mode
// artifacts on integrated GPUs (Intel HD, Apple M1 base). One wallpaper
// system is sufficient for the entire Aztec Brutalist aesthetic.
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

// ─── AppKit-dependent components (ssr: false to prevent "createAppKit" SSR error) ──
// These components call useAppKit/useAppKitAccount hooks unconditionally in their render
// body. Next.js SSR-renders 'use client' components on the server for hydration, which
// triggers the hooks before the AppKit context exists — causing the digest:3117477805 crash.
const ConnectWalletModal = dynamic(
  () => import('@/components/shared/ConnectWalletModal').then(m => ({ default: m.ConnectWalletModal })),
  { ssr: false }
);
const LinkedGate = dynamic(
  () => import('@/components/shared/LinkedGate').then(m => ({ default: m.LinkedGate })),
  { ssr: false }
);


export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isConnected } = useAccount();
    const { walletStealthMode } = useSettings();    
    
    // Wrap site in the mobile linkage gate for PC users
    const isPublicPath = pathname.startsWith('/docs') || pathname.startsWith('/privacy') || pathname.startsWith('/terms');
    const content = !isPublicPath ? (
        <LinkedGate>
            {children}
        </LinkedGate>
    ) : children;

    return (
        <>
            {/* Global Connect Wallet Modal - Root Level for Viewport Fidelity */}
            <ConnectWalletModal />
            
            <TitaniumGate>
                {/* Single unified wallpaper layer — the HighHzWallpaper was removed
                    (Bug 17) to prevent the dual-layer GPU compositing storm */}
                {!pathname.startsWith('/news') && <UniversalEliteWallpaper />}
                <div className="flex flex-col min-h-screen relative z-0">
                    <div className="flex-1 flex flex-col relative w-full">

                        {/* Reignited Institutional Header */}
                        {(
                            pathname === '/network' || 
                            pathname === '/portfolio' || 
                            pathname === '/support' || 
                            pathname === '/academy' || 
                            pathname === '/dashboard' ||
                            pathname === '/vip' ||
                            pathname === '/' ||
                            pathname.startsWith('/news')
                        ) && (
                            <InstitutionalHeader />
                        )}

                        {/* Global Utility Hub */}
                        <div className="relative z-40">
                          <UtilityPanels />
                          <BillionWhaleNotification />
                        </div>
                        
                        <ZoomWrapper>
                            <main className="relative z-10 w-full flex-1 flex flex-col">
                                {content}
                            </main>
                        </ZoomWrapper>
                    </div>

                    {/* Unified Footer AFTER the main content */}
                    {!(
                        pathname === '/' || 
                        pathname.startsWith('/dashboard') ||
                        pathname.startsWith('/portfolio') ||
                        pathname.startsWith('/academy') || 
                        pathname.startsWith('/support') || 
                        pathname.startsWith('/network') ||
                        pathname.startsWith('/docs') ||
                        pathname.startsWith('/privacy') ||
                        pathname.startsWith('/terms') ||
                        pathname.startsWith('/ticket') ||
                        pathname.startsWith('/news') ||
                        pathname.startsWith('/connect')
                    ) && <Downhead />}
                    
                    <MobileNavBar />
                </div>
            </TitaniumGate>
        </>
    );
}
