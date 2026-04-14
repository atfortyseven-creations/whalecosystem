'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { SiteNavigationPill } from '@/components/shared/SiteNavigationPill';
import { SystemsUtilityHeader } from '@/components/shared/SystemsUtilityHeader';
import { GlobalTokenTicker } from '@/components/shared/GlobalTokenTicker';
import { Downhead } from '@/components/shared/Downhead';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { MobileNavBar } from '@/components/layout/MobileNavBar';
import { useSettings } from '@/src/context/SettingsContext';
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


export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isConnected } = useAccount();
    
    const isPublicPath = pathname.startsWith('/docs') || pathname.startsWith('/privacy') || pathname.startsWith('/terms');
    const content = !isPublicPath ? (
        <LinkedGate>
            {children}
        </LinkedGate>
    ) : children;

    return (
        <>
            <ConnectWalletModal />
            
            <TitaniumGate>
                {!pathname.startsWith('/news') && <UniversalEliteWallpaper />}
                
                <div className="min-h-screen w-full relative z-0 flex flex-col">
                    <div className="flex-none w-full z-50">
                        {/* Institutional Header with precise 68px height enforced */}
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
                    </div>

                    <div className="flex-1 flex flex-col relative w-full overflow-hidden">
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
