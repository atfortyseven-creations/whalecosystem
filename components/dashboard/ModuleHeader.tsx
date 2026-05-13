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
        <div className="flex flex-col gap-1.5 shrink-0 z-10 px-4 md:px-0 mb-6 mt-1">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-[0.1em] text-[#050505]">
                {explanation.title}
            </h1>
            <p className="text-[11px] text-[#A0A0A0] max-w-3xl font-black tracking-[0.05em] leading-relaxed uppercase">
                {explanation.overview}
            </p>
            <div className="w-12 h-[2px] bg-[#050505]/10 mt-2" />
        </div>
    );
}
