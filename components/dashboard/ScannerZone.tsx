"use client";

import React, { useState } from 'react';
import { Camera, MessageCircle } from 'lucide-react';
import { QrScanner } from '@/components/dashboard/QrScanner';
import { WhaleChat } from '@/components/dashboard/WhaleChat';

export function ScannerZone() {
    const [mode, setMode] = useState<'scanner' | 'chat'>('chat'); // Default to chat as requested

    return (
        <div className="flex flex-col w-full h-full max-w-6xl mx-auto px-2 md:px-0 relative">
            {/* Toggle Header */}
            <div className="flex bg-black/5 p-1 rounded-xl w-full max-w-[280px] mx-auto mb-5 shrink-0 z-10 border border-black/5">
                <button
                    onClick={() => setMode('chat')}
                    className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all ${
                        mode === 'chat' 
                            ? 'bg-white text-[#9945FF] shadow-sm shadow-black/5' 
                            : 'text-black/50 hover:text-black'
                    }`}
                >
                    <MessageCircle size={14} /> Whale Chat
                </button>
                <button
                    onClick={() => setMode('scanner')}
                    className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all ${
                        mode === 'scanner' 
                            ? 'bg-white text-[#050505] shadow-sm shadow-black/5' 
                            : 'text-black/50 hover:text-black'
                    }`}
                >
                    <Camera size={14} /> Scan QR
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 w-full flex justify-center pb-safe">
                {mode === 'chat' ? (
                    <div className="w-full h-full flex flex-col">
                        <WhaleChat />
                    </div>
                ) : (
                    <div className="w-full max-w-sm pt-8">
                        <QrScanner mode="project" />
                    </div>
                )}
            </div>
        </div>
    );
}
