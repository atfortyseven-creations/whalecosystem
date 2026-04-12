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
 * Robust against theme transitions and hydration mismatches.
 */
export function WhaleLogo({ 
    className = "w-10 h-10", 
    variant = 'monochrome',
    priority = false 
}: WhaleLogoProps) {
    // Official logo asset selection
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <Image
                src="/official-whale.png"
                alt="Whale Alert Network"
                fill
                className="object-contain transition-all duration-300 transform-gpu"
                priority={priority}
                unoptimized
            />
        </div>
    );
}
