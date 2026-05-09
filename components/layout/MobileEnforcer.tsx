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
            // Absolute hardware guard: If physical screen is >= 1024px, it is NEVER mobile.
            // This prevents false positives on large touch screens or UA spoofing.
            if (window.screen && window.screen.width >= 1024) {
                setIsMobile(false);
                return;
            }

            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            // UA-based detection — works for standard mobile browsers
            const isUaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            const isTouchScreen = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
            const isSmallScreen  = window.screen.width < 768;
            
            setIsMobile(isUaMobile || (isTouchScreen && isSmallScreen));
        };

        checkMobile();
        setMounted(true);
        window.addEventListener('resize', checkMobile);

        // ─── [SOVEREIGN QR HANDSHAKE] Detect desktop QR URL params ────────
        // When the user scans the PC QR code with their native iOS/Android camera,
        // the browser opens /connect?uuid=UUID&pub=BASE64_PUB&ecdh=0|1&exp=TIMESTAMP.
        // We detect these params here and store them for auto-completion after
        // wallet authentication — no need to scan again inside the in-app scanner.
        const urlParams = new URLSearchParams(window.location.search);
        const qrUuid   = urlParams.get('uuid');
        const qrPub    = urlParams.get('pub');   // URL-encoded base64 JWK
        const qrEcdh   = urlParams.get('ecdh');  // '1' or '0'
        const qrExp    = urlParams.get('exp');    // expiry timestamp (ms)

        // Legacy session/handshake param support
        const urlSession = urlParams.get('session') || urlParams.get('handshake');

        if (qrUuid && qrPub) {
            const expiry = qrExp ? parseInt(qrExp, 10) : Infinity;
            if (Date.now() < expiry) {
                console.log(`[QRHandshake] Desktop QR detected in URL — uuid: ${qrUuid}`);
                try {
                    sessionStorage.setItem('pending_qr_uuid', qrUuid);
                    sessionStorage.setItem('pending_qr_pub',  qrPub);
                    sessionStorage.setItem('pending_qr_ecdh', qrEcdh ?? '0');
                    sessionStorage.setItem('pending_qr_exp',  String(expiry));
                    // Clean the URL so the params don't persist on refresh
                    window.history.replaceState({}, '', window.location.pathname);
                } catch (e) {}
            } else {
                console.warn('[QRHandshake] Desktop QR link expired — ignoring params');
            }
        } else if (urlSession) {
            console.log(`[Handshake] Detected legacy session token in URL: ${urlSession}`);
            try {
                sessionStorage.setItem('pending_handshake_session', urlSession);
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

        // CRITICAL: check for '0x' prefix so an expired cookie ('sovereign_handshake=; max-age=0')
        // does not falsely register as authenticated.
        const hasSovereignCookie = typeof document !== 'undefined'
            && (document.cookie.split('; ').some(r => r.startsWith('sovereign_handshake=0x')) || document.cookie.includes('wallet-auth='));

        if (bypassActive && hasSovereignCookie) {
            setShowNews(true);
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ─── [AUTO-FULFILL NATIVE QR SCANS] ──────────────────────────────────────
    // After wallet authentication, check if there are pending QR params from
    // the native camera scan flow. If yes, auto-complete the desktop handshake.
    useEffect(() => {
        if (!isConnected || !address || !mounted) return;
        try {
            const qrUuid = sessionStorage.getItem('pending_qr_uuid');
            const qrPub  = sessionStorage.getItem('pending_qr_pub');
            const qrEcdh = sessionStorage.getItem('pending_qr_ecdh');
            const qrExp  = sessionStorage.getItem('pending_qr_exp');

            if (qrUuid && qrPub) {
                // Check expiry
                if (qrExp && Date.now() > parseInt(qrExp, 10)) {
                    console.warn('[QRHandshake] QR session expired — clearing params');
                    ['pending_qr_uuid','pending_qr_pub','pending_qr_ecdh','pending_qr_exp']
                        .forEach(k => sessionStorage.removeItem(k));
                    return;
                }

                console.log('[QRHandshake] Auto-completing desktop QR handshake for:', address);

                // Use qr-mobile-link to mint JWT + store in Redis in one shot
                // (the endpoint reads sovereign_handshake cookie — always present post-sign)
                fetch('/api/auth/qr-mobile-link', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        uuid: qrUuid,
                        // Simplified payload — server mints and stores JWT directly
                        encryptedPayload: 'native-camera-scan',
                        iv: 'native-camera-scan',
                        mobilePub: qrPub,
                    }),
                }).then(res => {
                    if (res.ok) {
                        console.log('[QRHandshake] Desktop session linked successfully!');
                        ['pending_qr_uuid','pending_qr_pub','pending_qr_ecdh','pending_qr_exp']
                            .forEach(k => sessionStorage.removeItem(k));
                    } else {
                        console.warn('[QRHandshake] Link failed:', res.status);
                    }
                }).catch(e => console.error('[QRHandshake] Network error:', e));
            }

            // Legacy session/handshake param support
            const pendingSession = sessionStorage.getItem('pending_handshake_session');
            if (pendingSession) {
                console.log('[Handshake] Fulfilling legacy native camera scan session!');
                fetch(`/api/auth/qr-session?id=${pendingSession}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address })
                }).then(() => {
                    sessionStorage.removeItem('pending_handshake_session');
                }).catch(e => console.error(e));
            }
        } catch (e) {}
    }, [isConnected, address, mounted]);

    // When wallet disconnects → reset showNews so landing returns to initial state
    useEffect(() => {
        if (!mounted) return;
        if (!isConnected && prevConnected.current) {
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
        // ─── [DIRECT ACCESS ROUTES] ───────────────────────────────────────────
        // These are PUBLIC or informational routes that render normally on mobile.
        // ⚠️  PC-ONLY routes (/dashboard, /portfolio, /settings, /sovereign-intel,
        //     /predictions, /vip, /whalepost) are intentionally EXCLUDED here.
        //     A mobile user — even with a connected wallet — must NOT reach those
        //     pages because they are designed exclusively for the PC terminal.
        //     They will stay on MobileSovereignLanding as intended.
        const DIRECT_ACCESS_ROUTES = [
            '/news',
            '/connect',
            '/docs',
            '/faq',
            '/ticket',
            '/privacy',
            '/terms',
            '/legal',
            '/forum',
            '/careers',
            '/pricing',
            '/company',
            '/about',
            '/product',
            '/academy',
            '/support',
            '/status',
        ];
        const isDirectAccessRoute = DIRECT_ACCESS_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));

        if (isDirectAccessRoute) {
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
            <React.Suspense fallback={
                <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-mono text-[10px] uppercase tracking-widest text-[#050505]/40">
                    INITIALIZING SOVEREIGN...
                </div>
            }>
                {/* @ts-ignore */}
                <MobileSovereignLanding />
            </React.Suspense>
        );
    }

    // ── PC ZONE ──────────────────────────────────────────────────────────────
    return <>{children}</>;
}
