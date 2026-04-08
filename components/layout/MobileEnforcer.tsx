"use client";

import React, { useEffect, useState, useRef } from 'react';
import { MobileWhaleLanding as MobileSovereignLanding } from '@/components/mobile/MobileWhaleLanding';
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

    // Track previous connection state to detect NEW wallet connections
    const prevConnected = useRef<boolean>(false);

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

        // Only restore news bypass if wallet is already connected AND
        // the session was explicitly set by the user (not auto on fresh load).
        const bypassActive = typeof sessionStorage !== 'undefined'
            && sessionStorage.getItem('mobile_news_bypass') === 'true';
        const hasSovereignCookie = typeof document !== 'undefined'
            && (document.cookie.includes('sovereign_handshake=') || document.cookie.includes('wallet-auth='));

        if (bypassActive && hasSovereignCookie) {
            setShowNews(true);
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // When wallet NEWLY connects → reset to landing so user sees the manifesto + options
    useEffect(() => {
        if (!mounted) return;

        if (isConnected && !prevConnected.current) {
            // New connection — always show landing, never auto-enter news
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('mobile_news_bypass');
            }
            setShowNews(false);
        }

        if (!isConnected && prevConnected.current) {
            // Disconnected — also reset to landing
            setShowNews(false);
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('mobile_news_bypass');
            }
        }

        prevConnected.current = isConnected;
    }, [isConnected, mounted]);

    if (!mounted) {
        return <div className="min-h-screen bg-[#FAF9F6]" />;
    }

    // ── MOBILE ZONE ──────────────────────────────────────────────────────────
    if (isMobile) {
        // User EXPLICITLY chose to go to news via the landing page button
        if (showNews && isConnected) {
            return <MobileNewsShell />;
        }

        // Always show the Sovereign Landing:
        // Pre-connection → wallet connect buttons
        // Post-connection → manifesto + "VER NOTICIAS" + "ENLAZAR PC"
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
