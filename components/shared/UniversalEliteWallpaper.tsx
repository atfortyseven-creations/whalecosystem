"use client";

import React from 'react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

/**
 * UniversalEliteWallpaper — Global fixed background layer
 * 
 * - Renders behind ALL pages at z-index -1 (always visible)
 * - The global wallpaper (WALLPAPER GLOBAL.png) covers the entire screen
 * - Responds to the theme setting from useSettingsStore:
 *   • light → cream/white overlay, wallpaper subtly visible
 *   • dark  → dark overlay, wallpaper visible at reduced opacity
 * - Never re-renders on route change (no pathname dependency)
 */
export function UniversalEliteWallpaper() {
    const theme = useSettingsStore((s) => s.theme);

    // Determine effective theme (handle 'system')
    const isDark = theme === 'dark' || (
        theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    return (
        <div
            className="fixed inset-0 pointer-events-none select-none overflow-hidden"
            style={{ zIndex: -1 }}
            aria-hidden="true"
        >
            {/* ── Base background colour — responds to theme ────────────────── */}
            <div
                className="absolute inset-0 transition-colors duration-700"
                style={{ background: isDark ? '#0A0A0A' : '#FAF9F6' }}
            />

            {/* ── Global Wallpaper image — always cover, perfectly centred ──── */}
            <div
                className="absolute inset-0 transition-opacity duration-700"
                style={{
                    backgroundImage: "url('/system-shots/WALLPAPER%20GLOBAL.png')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundSize: 'contain',
                    imageRendering: 'crisp-edges',
                    // Light mode: wallpaper at full visibility
                    // Dark mode: slight dim so text stays readable
                    opacity: isDark ? 0.08 : 1,
                }}
            />

            {/* ── Dark mode overlay — deepens the dark background ───────────── */}
            {isDark && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'rgba(0,0,0,0.72)',
                    }}
                />
            )}
        </div>
    );
}
