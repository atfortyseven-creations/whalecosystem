"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { AcademyViewer } from '@/components/academy/AcademyViewer';

export default function AcademyPage() {
    const [utcTime, setUtcTime] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const timeString = now.getUTCHours().toString().padStart(2, '0') + ":" + 
                              now.getUTCMinutes().toString().padStart(2, '0') + ":" + 
                              now.getUTCSeconds().toString().padStart(2, '0') + " UTC";
            setUtcTime(timeString);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900 overflow-x-hidden">
            <div className="absolute inset-0 bg-white z-0" />

            <div className="relative z-10 w-full max-w-[2560px] mx-auto min-h-screen flex flex-col">

                <main className="flex-1 overflow-y-auto no-scrollbar pb-24 relative z-10">
                    <AcademyViewer />
                </main>
            </div>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
