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
import { UtilityPanels, $1BWhaleNotification } from '@/components/shared/UtilityPanels';
import { Downhead } from '@/components/shared/Downhead';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { useSettings } from '@/src/context/SettingsContext';
import { ZoomWrapper } from './ZoomWrapper';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isConnected } = useAccount();
    const { walletStealthMode } = useSettings();    
/*
    // Global Wallet Connection Tracking
    useAccountEffect({
        onConnect(data) {
            // If they are just returning to the site and land on the homepage
            if (data.isReconnected) {
                if (pathname === '/') {
                    // router.push('/network');
                }
                return;
            }
            // Fresh connection from any page
            if (pathname !== '/network') {
                // router.push('/network');
            }
        }
    });
*/

    // Handled purely by useAccountEffect above to permit manual return navigation.


    return (
        <>
            {/* Global Connect Wallet Modal - Root Level for Viewport Fidelity */}
            <ConnectWalletModal />
            
            <TitaniumGate>
                <div className="flex flex-col min-h-screen">
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
                        ) && <InstitutionalHeader />}

                        {/* Global Utility Hub */}
                        <UtilityPanels />
                        <$1BWhaleNotification />
                        
                        <ZoomWrapper>
                            <main className="relative z-10 w-full flex-1 flex flex-col">
                                {children}
                            </main>
                        </ZoomWrapper>
                    </div>

                    {/* Unified Footer AFTER the main content */}
                    {!(
                        pathname === '/' || 
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

