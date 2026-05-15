"use client";

import React from 'react';
import { useSettingsStore } from '@/lib/store/useSettingsStore';

/**
 * UniversalEliteWallpaper — Global fixed background layer
 *
 * - backgroundSize: cover → zero white side bands, fills edge-to-edge
 * - Dark mode  → wallpaper fully visible, 55% dark overlay for contrast
 * - Light mode → wallpaper at full size, 88% white overlay for readability
 */
export function UniversalEliteWallpaper() {
    const theme = useSettingsStore((s) => s.theme);

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
            {/* ── Base: pure black matches wallpaper edges perfectly ─────────────── */}
            <div className="absolute inset-0" style={{ background: '#050505' }} />

            {/* ── Wallpaper: cover = no bands, crisp-edges = max quality ─────────── */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "url('/system-shots/WALLPAPER%20GLOBAL.png')",
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    backgroundSize: 'cover',
                    imageRendering: 'crisp-edges',
                    opacity: 1,
                }}
            />

            {/* ── Light mode: translucent cream so dark text stays readable ──────── */}
            {!isDark && (
                <div
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ background: 'rgba(253, 252, 248, 0.88)' }}
                />
            )}

            {/* ── Dark mode: deepen shadows so white text is readable ────────────── */}
            {isDark && (
                <div
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ background: 'rgba(0, 0, 0, 0.30)' }}
                />
            )}
        </div>
    );
}
