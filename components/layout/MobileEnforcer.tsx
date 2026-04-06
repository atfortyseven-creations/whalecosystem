"use client";

import React, { useEffect, useState } from 'react';
import { MobileSovereignLanding } from '@/components/mobile/MobileSovereignLanding';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

// Lazy-load the authenticated mobile news shell
const MobileNewsShell = dynamic(
    () => import('@/components/mobile/MobileNewsShell').then(m => m.MobileNewsShell),
    { ssr: false }
);

export function MobileEnforcer({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const { isConnected } = useAccount();

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobileDevice = /android|mobi|iphone|ipod|ipad/i.test(userAgent.toLowerCase());
            const mobile = isMobileDevice && window.innerWidth < 1024;
            setIsMobile(mobile);
        };

        checkMobile();
        setMounted(true);
        window.addEventListener('resize', checkMobile);
        
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('mobile_news_bypass') === 'true') {
            setShowNews(true);
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent hydration mismatch flash
    if (!mounted) {
        return <div className="min-h-screen bg-[#FAF9F6]" />;
    }

    // ── MOBILE ZONE ──────────────────────────────────────────────────────────
    if (isMobile) {
        // User clicked "Go to News" or from session storage, AND wallet is connected
        if (showNews && isConnected) {
            return <MobileNewsShell />;
        }

        // Show landing page: connects wallet AND shows post-login confirmation
        // with "Go to News" and "Scan QR" buttons
        return (
            <MobileSovereignLanding
                onEnterNews={() => {
                    if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.setItem('mobile_news_bypass', 'true');
                    }
                    setShowNews(true);
                }}
            />
        );
    }

    // ── PC ZONE ──────────────────────────────────────────────────────────────
    return <>{children}</>;
}
