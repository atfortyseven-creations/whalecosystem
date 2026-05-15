"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export function UniversalEliteWallpaper() {
    const pathname = usePathname();
    const isDashboard = pathname.startsWith('/dashboard');
    const isLanding = pathname === '/';

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none">
            {/* Pure white base — content side will fuse with this */}
            <div className="absolute inset-0 bg-[#FAF9F6]" />

            {/* Bitcoin logo — fixed at natural size, perfectly anchored to center of screen */}
            {/* No background-size scaling — it sits at its natural pixel dimensions */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "url('/system-shots/WALLPAPER%20GLOBAL.jpg')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    // bg-size: auto = renders at natural image size (no zoom, no distortion)
                    backgroundSize: 'auto',
                }}
            />

            {/*
             * CONTENT FUSION GRADIENT
             * On non-landing pages: white covers the left portion where content lives.
             * This is NOT a hard division — it fades smoothly from solid white →
             * transparent, so the content background fuses perfectly with the page
             * white, and the Bitcoin logo appears naturally on the right.
             *
             * On landing page: no overlay — full immersive wallpaper shows through.
             * On dashboard: no overlay — dashboard has its own shell.
             */}
            {!isLanding && !isDashboard && (
                <div
                    className="absolute inset-0"
                    style={{
                        // Gradient: solid white on left → transparent around center → completely clear on right
                        background: 'linear-gradient(to right, #FAF9F6 0%, #FAF9F6 42%, rgba(250,249,246,0.85) 55%, rgba(250,249,246,0.3) 68%, transparent 82%)',
                    }}
                />
            )}

            {/* Landing page: subtle bottom-white fade so content doesn't float on logo */}
            {isLanding && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(250,249,246,0.15) 100%)',
                    }}
                />
            )}
        </div>
    );
}
