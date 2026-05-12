"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAccount } from 'wagmi';

export function UniversalEliteWallpaper() {
    const pathname = usePathname();
    const { isConnected } = useAccount();

    const isLanding = pathname === '/';

    return (
        <div className={`fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none transition-all duration-1000 ${
            isConnected ? 'bg-[#FAF9F6]' : 'bg-[#00050a]'
        }`}>
            {/* The Majestic Fluid Layer — Multiplied for Depth using Ultra HQ Image */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000" 
                style={{ 
                    backgroundImage: "url('/wave-pattern-bg.jpg')", 
                    backgroundSize: "320px 200px", 
                    backgroundRepeat: "repeat",
                    backgroundPosition: "top left",
                    opacity: isConnected ? 0.6 : 0.2,
                    filter: isConnected ? 'none' : 'hue-rotate(180deg) brightness(0.5)',
                    mixBlendMode: isConnected ? 'multiply' : 'lighten'
                }}
            >
            </div>
            
            {/* Subtle Vignette for Institutional Focus (Elite Gold vs Genesis Blue) */}
            <div className="absolute inset-0 pointer-events-none z-10 transition-all duration-1000" 
                 style={{ 
                    background: isConnected 
                        ? "radial-gradient(circle at center, transparent 30%, rgba(212, 175, 55, 0.07) 100%)"
                        : "radial-gradient(circle at center, transparent 30%, rgba(0, 195, 255, 0.15) 100%)"
                 }} />

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
