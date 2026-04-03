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
// QR scan + wallet signature on mobile. This determines whether the user
// should see the landing/onboarding flow or the authenticated Whale News view.
function hasSovereignHandshake(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie
        .split('; ')
        .some(row => row.startsWith('sovereign_handshake=0x'));
}

export function MobileEnforcer({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileAuthenticated, setIsMobileAuthenticated] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobileDevice = /android|mobi|iphone|ipod|ipad/i.test(userAgent.toLowerCase());

            // ONLY enforce mobile view on actual mobile devices (phones/tablets).
            // PC users with touch screens or resized windows should NEVER see the mobile flow.
            const mobile = isMobileDevice && window.innerWidth < 1024;
            setIsMobile(mobile);

            // If this is a mobile device, check QR handshake authentication state
            if (mobile) {
                setIsMobileAuthenticated(hasSovereignHandshake());
            }
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
        // Authenticated mobile users → ONLY Whale News
        if (isMobileAuthenticated) {
            return <MobileNewsShell />;
        }
        // Unauthenticated mobile users → Landing + QR onboarding flow
        return <MobileSovereignLanding />;
    }

    // ── PC ZONE ──────────────────────────────────────────────────────────────
    // Full app with ALL tabs (System, Whale Portfolio, News of Today,
    // Whale Support, Whale Academy, Gold Ticket) — no restrictions.
    return <>{children}</>;
}
