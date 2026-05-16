"use client";

import React from 'react';
import { MODULE_EXPLANATIONS } from './ModuleExplanations';

interface ModuleHeaderProps {
    moduleId: string;
}

export function ModuleHeader({ moduleId }: ModuleHeaderProps) {
    const explanation = MODULE_EXPLANATIONS[moduleId];
    
    if (!explanation) return null;

    return (
        <div className="flex flex-col items-center text-center gap-1.5 shrink-0 z-10 px-4 md:px-0 mb-10 mt-2">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-[#050505] dark:text-white">
                {explanation.title}
            </h1>
            <p className="text-[11px] text-[#A0A0A0] max-w-2xl font-black tracking-[0.1em] leading-relaxed uppercase">
                {explanation.overview}
            </p>
            <div className="w-16 h-[2px] bg-[#00C076] mt-4" />
        </div>
    );
}
