"use client";

import React, { useEffect, useState } from 'react';
import { ClientRootRouter } from '@/components/landing/ClientRootRouter';
import { ClientMobileLanding } from '@/components/landing/ClientMobileLanding';

export function SmartLandingRouter({ isMobileUserAgent }: { isMobileUserAgent: boolean }) {
    const [mounted, setMounted] = useState(false);
    const [isPhysicallyMobile, setIsPhysicallyMobile] = useState(isMobileUserAgent);

    useEffect(() => {
        const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
        const isTouchScreen = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
        const isSmallScreen = window.screen.width < 768;

        setIsPhysicallyMobile(isUaMobile || (isTouchScreen && isSmallScreen));
        setMounted(true);
    }, []);

    // Fast-path: server already told us it's mobile — render immediately
    // without waiting for JS hydration (eliminates ~3s blank white screen).
    if (!mounted && isMobileUserAgent) return <ClientMobileLanding />;

    // Always show the landing page — never auto-redirect to /dashboard.
    // The dashboard redirect is handled exclusively by ConnectPage after
    // a successful wallet signature. This ensures that on page reload
    // the user always lands on the public landing page.
    if (isPhysicallyMobile) {
        return <ClientMobileLanding />;
    }

    return <ClientRootRouter />;
}
