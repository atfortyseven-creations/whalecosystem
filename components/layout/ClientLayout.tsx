'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAccount, useAccountEffect } from 'wagmi';
import { TitaniumGate } from '@/components/layout/TitaniumGate';
import { DropdownNav } from '@/components/site/DropdownNav';
import { SiteNavigationPill } from '@/components/shared/SiteNavigationPill';
import { HighHzWallpaper } from '@/components/landing/HighHzWallpaper';
import { SystemsUtilityHeader } from '@/components/shared/SystemsUtilityHeader';
import { ConnectWalletModal } from '@/components/shared/ConnectWalletModal';
import { GlobalTokenTicker } from '@/components/shared/GlobalTokenTicker';
import { UtilityPanels, BillionWhaleNotification } from '@/components/shared/UtilityPanels';
import { Downhead } from '@/components/shared/Downhead';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { useSettings } from '@/src/context/SettingsContext';
import { ZoomWrapper } from './ZoomWrapper';
import { LinkedGate } from '@/components/shared/LinkedGate';
import { UniversalEliteWallpaper } from '@/components/shared/UniversalEliteWallpaper';

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
                <UniversalEliteWallpaper />
                <div className="flex flex-col min-h-screen relative z-0">
                    <div className="flex-1 flex flex-col relative w-full">
                        {(!pathname.startsWith('/developers')) && <HighHzWallpaper />}

                        {/* Reignited Institutional Header */}
                        {(
                            pathname === '/network' || 
                            pathname === '/portfolio' || 
                            pathname === '/support' || 
                            pathname === '/academy' || 
                            pathname === '/dashboard' ||
                            pathname === '/vip' ||
                            pathname === '/'
                        ) && (
                            <div className="glass-aztek sticky top-0 z-50">
                                <InstitutionalHeader />
                            </div>
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
                        pathname.startsWith('/terms')
                    ) && <Downhead />}
                </div>
            </TitaniumGate>
        </>
    );
}
