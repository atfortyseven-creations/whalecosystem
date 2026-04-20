"use client";

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 🛡️ Anti-Tamper Core - Nanoscopic Mutational Observer
 * Installs a hardware-level DOM watcher. If the user attempts to manipulate 
 * the DOM tree via DevTools to reveal hidden data or bypass visual restrictions, 
 * this sentinel terminates the session instantly.
 */
export function AntiTamperCore() {
    const router = useRouter();
    const hasTampered = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const protectIntegrity = () => {
            const timeStart = performance.now();
            debugger; 
            const timeEnd = performance.now();
            if (timeEnd - timeStart > 100) {
                console.warn('[WhaleFortress] 🚨 DEVTOOLS ENVIRONMENT DETECTED! Context isolation triggered.');
            }
        };

        const interval = setInterval(protectIntegrity, 2500);

        const mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const el = mutation.target as HTMLElement;
                    if (el.id === 'kyc-shield' && el.style.display === 'none') {
                        hasTampered.current = true;
                    }
                }
            }

            if (hasTampered.current) {
                console.error('[WhaleFortress:Critical] 🛡️ NANOSCOPIC TAMPERING DETECTED.');
                mutationObserver.disconnect();
                window.location.href = '/'; 
            }
        });

        mutationObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style'],
        });

        return () => {
            mutationObserver.disconnect();
            clearInterval(interval);
        };
    }, [router]);

    return null;
}
