"use client";

import React, { useEffect, useState } from 'react';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import { ClientMobileLanding } from '@/components/landing/ClientMobileLanding';

export function SmartLandingRouter({ isMobileUserAgent }: { isMobileUserAgent: boolean }) {
    const [mounted, setMounted] = useState(false);
    // Initialise with server-provided UA hint so there is no layout shift on real mobile
    const [isPhysicallyMobile, setIsPhysicallyMobile] = useState(isMobileUserAgent);

    useEffect(() => {
        // ── Physical device detection ────────────────────────────────────────
        // This is the ONLY reliable way to detect a real mobile device.
        // navigator.userAgent CAN be spoofed when the user enables "Desktop site"
        // in Chrome mobile — the UA strips the "Android" marker.
        // maxTouchPoints and screen.width CANNOT be spoofed — they reflect
        // actual hardware, not the UA string.
        //
        // Rules:
        //   touch screen (maxTouchPoints > 0) → physical mobile / tablet
        //   screen.width < 768px              → physically small screen
        //   Either condition → show mobile UI
        const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
        const isTouchScreen = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
        const isSmallScreen  = window.screen.width < 768;

        setIsPhysicallyMobile(isUaMobile || (isTouchScreen && isSmallScreen));
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-black/20">
                INITIALIZING...
            </div>
        );
    }

    // Any physical mobile/tablet → always MobileLanding, covering ALL cases:
    //   • Standard Chrome Android  (UA contains "android")
    //   • Chrome "Desktop site" enabled (UA spoofed — but touch screen detected)
    //   • MetaMask / Coinbase in-app browser (window.ethereum + touch screen)
    if (isPhysicallyMobile) {
        return <ClientMobileLanding />;
    }

    // Only real desktops/laptops reach here (no touch, wide screen).
    return <ClientRootRouter />;
}
