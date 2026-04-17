"use client";

import React, { useEffect, useState, useRef } from 'react';
import { MobileLanding as MobileSovereignLanding } from '@/components/landing/MobileLanding';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';
import { usePathname } from 'next/navigation';

// Lazy-load the authenticated mobile news shell
const MobileNewsShell = dynamic(
    () => import('@/components/mobile/MobileNewsShell').then(m => m.MobileNewsShell),
    { ssr: false }
);

export function MobileEnforcer({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showNews, setShowNews] = useState(false);
    const { isConnected, address } = useAccount();
    const pathname = usePathname();

    // Track previous connection state to detect NEW wallet connections
    const prevConnected = useRef<boolean>(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isPhone = /android.*mobi|iphone|ipod/i.test(userAgent.toLowerCase());
            // Treat devices <= 1024 as mobile so scaling doesn't break routing
            const mobile = isPhone || window.innerWidth <= 1024;
            setIsMobile(mobile);
        };

        checkMobile();
        setMounted(true);
        window.addEventListener('resize', checkMobile);

        // ─── [SOVEREIGN PERSISTENCE] QR Session Capture ───
        // If user arrives via QR scan, we catch the session token and store it.
        // This survives the wallet connection redirect.
        const urlParams = new URLSearchParams(window.location.search);
        const urlSession = urlParams.get('session') || urlParams.get('handshake');
        
        if (urlSession) {
            console.log(`[Handshake] Detected session token in URL: ${urlSession}`);
            try {
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.setItem('pending_handshake_session', urlSession);
                }
            } catch (e) {}
        }

        // CRITICAL iOS FIX: In iOS Safari Private Mode...
        let bypassActive = false;
        try {
            if (typeof sessionStorage !== 'undefined') {
                 bypassActive = sessionStorage.getItem('mobile_news_bypass') === 'true';
            }
        } catch (e) {
            console.warn('[Safety] iOS Private Mode restricted sessionStorage read.');
        }

        const hasSovereignCookie = typeof document !== 'undefined'
            && (document.cookie.includes('sovereign_handshake=') || document.cookie.includes('wallet-auth='));

        if (bypassActive && hasSovereignCookie) {
            setShowNews(true);
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ─── [AUTO-FULFILL NATIVE SCANS] ───
    useEffect(() => {
        if (isConnected && address && mounted) {
            try {
                if (typeof sessionStorage !== 'undefined') {
                    const pendingSession = sessionStorage.getItem('pending_handshake_session');
                    if (pendingSession) {
                        console.log('[Handshake] Fulfilling native camera scan session!');
                        fetch(`/api/auth/qr-session?id=${pendingSession}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ address })
                        }).then(() => {
                            sessionStorage.removeItem('pending_handshake_session');
                        }).catch(e => console.error(e));
                    }
                }
            } catch (e) {}
        }
    }, [isConnected, address, mounted]);

    // When wallet NEWLY connects → reset to landing so user sees the manifesto + options
    useEffect(() => {
        if (!mounted) return;

        if (isConnected && !prevConnected.current) {
            // New connection — always show landing, never auto-enter news
            try {
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.removeItem('mobile_news_bypass');
                }
            } catch (e) {}
            setShowNews(false);
        }

        if (!isConnected && prevConnected.current) {
            // Disconnected — also reset to landing
            setShowNews(false);
            try {
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.removeItem('mobile_news_bypass');
                }
            } catch (e) {}
        }

        prevConnected.current = isConnected;
    }, [isConnected, mounted]);

    if (!mounted) {
        // [INSTITUTIONAL PERFECTION] We NO LONGER hide the children.
        // Hydration errors are best handled by stable skeletons in TitaniumGate.
        return <>{children}</>;
    }

    // ── MOBILE ZONE ──────────────────────────────────────────────────────────
    if (isMobile) {
        // Allow rendering the dashboard natively on mobile
        if (isConnected && pathname === '/dashboard') {
            return <>{children}</>;
        }

        // User EXPLICITLY chose to go to news via the landing page button
        if (showNews && isConnected) {
            return <MobileNewsShell />;
        }

        // Always show the Sovereign Landing:
        // Pre-connection → wallet connect buttons
        // Post-connection → connected state with navigation
        return (
            <>
                {/* @ts-ignore */}
                <MobileSovereignLanding />
            </>
        );
    }

    // ── PC ZONE ──────────────────────────────────────────────────────────────
    return <>{children}</>;
}
