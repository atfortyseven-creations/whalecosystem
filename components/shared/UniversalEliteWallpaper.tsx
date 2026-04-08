"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

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
            <style dangerouslySetInnerHTML={{ __html: `
                .noise-overlay {
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    opacity: 0.04;
                    mix-blend-mode: overlay;
                    pointer-events: none;
                }
            ` }} />
            
            {/* The Majestic Fluid Layer — Multiplied for Depth */}
            <div className="absolute inset-[-15%] bg-aztec-pattern text-black dark:text-white animate-pixel-deform opacity-50 mix-blend-multiply dark:mix-blend-screen" />
            
            {/* High-Fidelity Noise Layer for "Professor Emeritus" Aesthetic */}
            <div className="absolute inset-0 noise-overlay" />
            
            {/* Subtle Vignette for Institutional Focus (Elite Gold) */}
            <div className="absolute inset-0 pointer-events-none" 
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
