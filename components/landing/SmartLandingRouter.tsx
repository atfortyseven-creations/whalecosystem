"use client";

import React, { useEffect, useState } from 'react';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import { ClientMobileLanding } from '@/components/landing/ClientMobileLanding';

export function SmartLandingRouter({ isMobileUserAgent }: { isMobileUserAgent: boolean }) {
    const [mounted, setMounted] = useState(false);
    const [isWeb3Browser, setIsWeb3Browser] = useState(false);

    useEffect(() => {
        setIsWeb3Browser(typeof window !== 'undefined' && (!!window.ethereum || !!(window as any).web3));
        setMounted(true);
    }, []);

    if (!mounted) {
        // Render a simple fallback while we determine the browser type
        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20">
                INITIALIZING...
            </div>
        );
    }

    // If they are on a mobile device BUT they are inside a Web3 Wallet (MetaMask, Rainbow),
    // they want to use the DApp directly, NOT the QR scanner page.
    if (isMobileUserAgent && !isWeb3Browser) {
        return <ClientMobileLanding />;
    }

    return <ClientRootRouter />;
}
