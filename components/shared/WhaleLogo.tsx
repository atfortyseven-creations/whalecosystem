"use client";

import React from 'react';
import Image from 'next/image';

interface WhaleLogoProps {
    className?: string;
    variant?: 'monochrome' | 'classic';
    priority?: boolean;
}

/**
 * 🐋 SOVEREIGN BRAND IDENTITY ENGINE
 * Centrally manages the official whale logo visualization.
 */
export function WhaleLogo({ 
    className = "w-10 h-10", 
    variant = 'monochrome',
    priority = true 
}: WhaleLogoProps) {
    // Reference the institutional logo via our hardened checkpoint-image API
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <Image
                src="/official-whale-monochrome.png"
                alt="Sovereign Whale Alert"
                fill
                className="object-contain transition-all duration-300 transform-gpu"
                priority={priority}
                unoptimized
            />
        </div>
    );
}
