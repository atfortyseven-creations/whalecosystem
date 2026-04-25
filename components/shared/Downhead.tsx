"use client";

import React from 'react';
import Image from 'next/image';

export function Downhead() {
    return (
        <footer className="w-full relative overflow-hidden min-h-[300px]">

            {/* ── WAVE IMAGE — full-bleed, behind all content ── */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/olas-hokusai-4k.png"
                    alt="Wave pattern — Hokusai"
                    fill
                    priority={false}
                    quality={85}
                    className="object-cover object-center"
                    sizes="100vw"
                />
            </div>
            
        </footer>
    );
}
