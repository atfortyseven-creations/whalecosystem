"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

// FIX Bug 16: Replaced window.location.pathname + useState race condition with
// usePathname() from Next.js which is available synchronously during SSR/hydration.
// Previously: component mounted with pathname='' → isLanding=false (wrong) →
// watermark flashed for one frame on the landing page before disappearing.
// Now: pathname is correct from the very first render, no flash.

export function UniversalEliteWallpaper() {
    const pathname = usePathname();

    // Suppress the watermark on the landing page to keep it clean
    const isLanding = pathname === '/';

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none bg-white dark:bg-black transition-colors duration-300">
            {/* The Majestic Fluid Layer — Multiplied for Depth using Ultra HQ Image */}
            <div className="absolute inset-0 z-0" 
                style={{ 
                    backgroundImage: "url('/wave-pattern-bg.jpg')", 
                    backgroundSize: "320px 200px", 
                    backgroundRepeat: "repeat",
                    backgroundPosition: "top left"
                }}
            >
            </div>
            
            {/* Subtle Vignette for Institutional Focus (Elite Gold) */}
            <div className="absolute inset-0 pointer-events-none z-10" 
                 style={{ background: "radial-gradient(circle at center, transparent 30%, rgba(212, 175, 55, 0.07) 100%)" }} />

            {/* Global Watermark (Suppressed on Landing) */}
            {!isLanding && (
                <div
                    className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
                    style={{
                        backgroundImage: 'url(/official-whale-legendary.png)',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '80px',
                        filter: 'grayscale(1) brightness(1.2)',
                    }}
                />
            )}
        </div>
    );
}
