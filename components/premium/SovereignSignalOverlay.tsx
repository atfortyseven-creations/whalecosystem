"use client";

import { motion } from 'framer-motion';
import { Target, Copy, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SovereignSignalOverlayProps {
    symbol: string;
    direction: string;
    reversalProb: number;
    expectedMove: number;
    vigorPercent: number;
    gravityScore: number;
    icebergDefense?: string;
    onClose: () => void;
}

export function SovereignSignalOverlay({ 
    symbol, direction, reversalProb, expectedMove, 
    vigorPercent, gravityScore, icebergDefense, onClose 
}: SovereignSignalOverlayProps) {
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

    const copyToClipboard = () => {
        const text = `🚨 *SOVEREIGN ALPHA DETECTED* 🚨
Asset: $${symbol}
Direction: ${direction === 'BULLISH' ? 'LONG SQUEEZE 📈' : 'SHORT SQUEEZE 📉'}
Reversal Prob: ${reversalProb.toFixed(1)}%
Expected Move (15m): ${expectedMove > 0 ? '+' : ''}${expectedMove.toFixed(2)}%
Vigor Accum: ${vigorPercent.toFixed(0)}% | Tensor: ${gravityScore.toFixed(1)}G
Defense: ${icebergDefense || 'None'}
--
*Intel via HumanIDFi PreCognitive Matrix*`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(24px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/10"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FAF9F6]/90 border border-[#050505] p-8 max-w-sm w-full rounded-2xl shadow-2xl relative overflow-hidden"
            >
                {/* Tactical Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-[#00FFAA] to-orange-400 animate-pulse" />

                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#050505] flex items-center justify-center">
                        <Target className="text-[#00FFAA]" size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#050505] tracking-tighter leading-none">SOVEREIGN SIGNAL</h2>
                        <span className="text-[10px] font-bold text-[#050505]/50 tracking-[0.2em] uppercase">Absolute Confluence</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between border-b border-[#050505]/10 pb-2">
                        <span className="text-xs font-bold text-[#050505]/60">Target Asset</span>
                        <span className="text-sm font-black text-[#050505]">${symbol}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#050505]/10 pb-2">
                        <span className="text-xs font-bold text-[#050505]/60">Reversal Prob</span>
                        <span className="text-sm font-black text-[#00FFAA] drop-shadow-[0_0_8px_rgba(0,255,170,0.8)] px-2 py-0.5 bg-[#050505] rounded">
                            {reversalProb.toFixed(1)}%
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-[#050505]/10 pb-2">
                        <span className="text-xs font-bold text-[#050505]/60">Expected Move</span>
                        <span className={`text-sm font-black ${expectedMove > 0 ? 'text-cyan-600' : 'text-orange-600'}`}>
                            {expectedMove > 0 ? '+' : ''}{expectedMove.toFixed(2)}%
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6 text-[#050505]/60">
                    <Clock size={12} className={timeLeft < 60 ? "text-rose-500 animate-pulse" : ""} />
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${timeLeft < 60 ? "text-rose-500" : ""}`}>
                        Signal expires in {timeString}
                    </span>
                </div>

                <button 
                    onClick={copyToClipboard}
                    className="w-full bg-[#050505] text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#111] transition-colors"
                >
                    {copied ? <CheckCircle size={14} className="text-[#00FFAA]" /> : <Copy size={14} />}
                    {copied ? 'Copied to Clipboard' : 'Copy Alpha Signal'}
                </button>
            </motion.div>
        </motion.div>
    );
}
