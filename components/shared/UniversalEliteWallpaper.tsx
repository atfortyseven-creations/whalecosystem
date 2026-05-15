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
                    // Set to cover to fill the screen exactly without unnatural zoom or distortion.
                    backgroundSize: 'cover',
                }}
            />

            {/*
             * CONTENT BACKGROUND
             * The pages are now full width. The background of the individual pages
             * will naturally cover the wallpaper where needed.
             */}

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
