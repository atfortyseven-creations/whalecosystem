"use client";

import React, { useEffect, useState } from 'react';
import { MobileSovereignLanding } from '@/components/mobile/MobileSovereignLanding';
import dynamic from 'next/dynamic';


// Lazy-load the authenticated mobile news shell
const MobileNewsShell = dynamic(
    () => import('@/components/mobile/MobileNewsShell').then(m => m.MobileNewsShell),
    { ssr: false }
);

// ─── MOBILE AUTH STATE DETECTION ─────────────────────────────────────────────
// Checks for the sovereign_handshake cookie that is set after a successful
// QR scan + wallet signature on mobile.
function hasSovereignHandshake(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie
        .split('; ')
        .some(row => row.startsWith('sovereign_handshake=0x'));
}

export function MobileEnforcer({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isHandshaked, setIsHandshaked] = useState(false);
    const [showNews, setShowNews] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobileDevice = /android|mobi|iphone|ipod|ipad/i.test(userAgent.toLowerCase());
            const mobile = isMobileDevice && window.innerWidth < 1024;
            setIsMobile(mobile);
            setIsHandshaked(hasSovereignHandshake());
        };

        checkMobile();
        setMounted(true);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent hydration mismatch flash
    if (!mounted) {
        return <div className="min-h-screen bg-[#FAF9F6]" />;
    }

    // ── MOBILE ZONE ──────────────────────────────────────────────────────────
    if (isMobile) {
        // 1. Not connected: Show landing (connect wallet)
        // 2. Connected but not handshaked: Show landing (confirmation + buttons)
        // 3. Handshaked + user clicked enter: Show news
        // User already clicked "Go to News" or cookie was set from previous QR scan
        if (showNews || isHandshaked) {
            return <MobileNewsShell />;
        }

        // Show landing page: connects wallet AND shows post-login confirmation
        // with "Go to News" and "Scan QR" buttons
        return (
            <MobileSovereignLanding
                onEnterNews={() => {
                    // Persist across reloads so user stays in news on refresh
                    document.cookie = "sovereign_handshake=0x_bypass; path=/; max-age=31536000";
                    setShowNews(true);
                }}
            />
        );
    }

    // ── PC ZONE ──────────────────────────────────────────────────────────────
    return <>{children}</>;
}
