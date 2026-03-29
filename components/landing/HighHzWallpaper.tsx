"use client";

import React from 'react';
import Image from 'next/image';

export function HighHzWallpaper() {
  return (
    <div className="fixed z-[-10] inset-0 overflow-hidden bg-[var(--aztec-parchment)]">
      {/* ── THE LOGAN VOSS IMMERSION LAYER (The Great Rebirth) ── */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/models/update/Aztec Image_02.jpg" 
          alt="Aztec Wavy Backdrop" 
          fill 
          className="object-cover opacity-[0.12] brightness-[1.1]"
          style={{ transform: 'translate3d(0,0,0)', willChange: 'auto' }}
          priority
        />
      </div>

      {/* High-Fidelity Paper Grain Texture - Optimized for Mobile */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none noise-bg z-10"
        style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}
      />
      
      {/* Global Depth Shield */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none z-20" />
    </div>
  );
}
