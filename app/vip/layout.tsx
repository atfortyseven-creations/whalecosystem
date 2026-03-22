import React from 'react';
import { VIPDataProvider } from '@/components/vip/VIPDataProvider';
import { InmersiveConstellations } from '@/components/shared/InmersiveConstellations';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Whale Alert Pro | WhaleAlert ID',
    description: 'Advanced Whale Tracking and Dark Pool Analytics.',
};

export default function VIPLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-transparent text-white font-sans relative overflow-x-hidden">


            <VIPDataProvider>
                {/* Content area: the Master Matrix handles its own internal layout */}
                <div className="relative z-10 w-full min-h-screen">
                    {children}
                </div>
            </VIPDataProvider>
        </div>
    );
}

