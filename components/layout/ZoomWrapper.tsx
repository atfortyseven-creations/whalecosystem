'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function ZoomWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [zoomClass, setZoomClass] = useState('');

    useEffect(() => {
        // Force initial-scale=1.0 for perfect default zoom on all mobile devices
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover');
        }
    }, [pathname]);

    return (
        <div className={zoomClass}>
            {children}
        </div>
    );
}
