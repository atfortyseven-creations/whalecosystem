'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SmoothScroll from '@/components/layout/SmoothScroll';

export function ZoomWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith('/dashboard');

    useEffect(() => {
        // Keep viewport meta clean — no forced maximum-scale that could block pinch zoom
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
        }
    }, [pathname]);

    // NOTE: CSS `zoom` property is intentionally replaced with `transform: scale()`.
    // `zoom` destroys scroll position calculations in Lenis and even native scroll
    // because it changes the coordinate system without notifying the scroll engine.
    // `transform: scale()` with `transform-origin: top center` achieves the same
    // visual result while keeping layout coordinates intact.
    return (
        <SmoothScroll>
            <div
                style={
                    isDashboard
                        ? {
                              transform: 'scale(1.2)',
                              transformOrigin: 'top center',
                              width: 'calc(100% / 1.2)',  // compensate for scale-induced overflow
                          }
                        : undefined
                }
            >
                {children}
            </div>
        </SmoothScroll>
    );
}
