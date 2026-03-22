"use client";

import React, { useEffect, useState } from 'react';
import { MobileSovereignLanding } from '@/components/mobile/MobileSovereignLanding';
import { usePathname } from 'next/navigation';

export function MobileEnforcer({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkMobile = () => {
            // Aggressive detection: anything under 1024px width is considered mobile/tablet
            // and forced into the Sovereign Mobile Companion.
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        setMounted(true);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent hydration mismatch flash
    if (!mounted) {
        return <div className="min-h-screen bg-[#0A0A0A]" />; // Stealth loader
    }

    if (isMobile) {
        return <MobileSovereignLanding />;
    }

    return <>{children}</>;
}
