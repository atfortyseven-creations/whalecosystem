"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { AcademyViewer } from '@/components/academy/AcademyViewer';

export default function AcademyPage() {
    return (
        <div className="relative min-h-screen bg-transparent text-white font-aztec-body overflow-x-hidden">
            <div className="relative z-10 w-full max-w-[2560px] mx-auto min-h-screen flex flex-col">
                <main className="flex-1 relative z-10 px-6 mt-10 pb-20">
                    <div className="max-w-[1600px] mx-auto glass-aztek rounded-[2rem] p-px overflow-hidden shadow-2xl">
                        <div className="bg-black/40 backdrop-blur-md rounded-[2rem] overflow-hidden w-full h-[85vh]">
                            <AcademyViewer />
                        </div>
                    </div>
                </main>
            </div>
            
            <style jsx global>{`
                /* Enhanced Academy Scrollbar overrides */
                .academy-scroll-container::-webkit-scrollbar { width: 10px; }
                .academy-scroll-container::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-left: 1px solid rgba(255,255,255,0.05); }
                .academy-scroll-container::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.2); border-radius: 10px; border: 2px solid transparent; background-clip: padding-box; }
                .academy-scroll-container::-webkit-scrollbar-thumb:hover { background-color: var(--aztec-orchid); border-radius: 10px; }
            `}</style>
        </div>
    );
}
