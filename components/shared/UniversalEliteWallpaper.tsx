"use client";

import React, { useEffect, useState } from 'react';

export function UniversalEliteWallpaper() {
    const [pathname, setPathname] = useState('');
    
    useEffect(() => {
        setPathname(window.location.pathname);
    }, []);

    // We suppress the watermark on the landing page to keep it clean
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
            
            {/* Subtle Vignette for Institutional Focus */}
            <div className="absolute inset-0 pointer-events-none" 
                 style={{ background: "radial-gradient(circle at center, transparent 30%, rgba(251, 201, 194, 0.2) 100%)" }} />

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
