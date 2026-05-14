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
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none bg-[#FAF9F6]">
            <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
                style={{ 
                    backgroundImage: "url('/system-shots/WALLPAPER%20GLOBAL.jpg')"
                }}
            />
        </div>
    );
}
