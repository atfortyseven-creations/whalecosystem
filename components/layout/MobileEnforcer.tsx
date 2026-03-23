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
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isMobileDevice = /android|mobi|iphone|ipod|ipad/i.test(userAgent.toLowerCase());
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            // ONLY enforce mobile view on actual mobile devices (phones/tablets) 
            // PC users with touch screens or resized windows should NEVER see the mobile landing page.
            setIsMobile(isMobileDevice && window.innerWidth < 1024);
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
