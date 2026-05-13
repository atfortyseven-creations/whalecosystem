"use client";

import React, { useEffect, useState } from 'react';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import { ClientMobileLanding } from '@/components/landing/ClientMobileLanding';

export function SmartLandingRouter({ isMobileUserAgent }: { isMobileUserAgent: boolean }) {
    const [mounted, setMounted] = useState(false);
    const [isPhysicallyMobile, setIsPhysicallyMobile] = useState(isMobileUserAgent);
    const [hasSession, setHasSession] = useState(false);

    useEffect(() => {
        const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
        const isTouchScreen = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
        const isSmallScreen  = window.screen.width < 768;

        setIsPhysicallyMobile(isUaMobile || (isTouchScreen && isSmallScreen));
        
        // Session check
        const cookieSession = typeof document !== "undefined" && (document.cookie.includes("sovereign_handshake=") || document.cookie.includes("siwe_session="));
        setHasSession(cookieSession);
        
        setMounted(true);
    }, []);

    // Render nothing at all while hydrating — avoids any flash/loader
    if (!mounted) return null;

    // Unauthenticated users only see PC landing page as requested
    if (!hasSession) {
        return <ClientRootRouter />;
    }

    if (isPhysicallyMobile) {
        return <ClientMobileLanding />;
    }

    return <ClientRootRouter />;
}
