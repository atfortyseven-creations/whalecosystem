'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SmoothScroll from '@/components/layout/SmoothScroll';

export function ZoomWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    useEffect(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
        }
    }, [pathname]);

    // NOTE: CSS zoom and transform:scale are intentionally REMOVED.
    // Both break the HTML5 Canvas coordinate system used by the signature pad:
    // mouse events are reported in real-screen coords but the canvas context
    // operates in transformed coords → drawing becomes impossible / offset.
    // The layout is correct at 100% scale. Adjust font/spacing via CSS if needed.
    return (
        <SmoothScroll>
            {children}
        </SmoothScroll>
    );
}
