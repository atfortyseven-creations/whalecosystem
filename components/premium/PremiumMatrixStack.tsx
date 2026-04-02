"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowUp, ArrowDown, Info, X } from 'lucide-react';
import { PolymarketExecutionPanel } from './PolymarketExecutionPanel';

const PERFECTION_TOKENS = [
    "BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "SHIB", "DOT", "LINK", 
    "MATIC", "AVAX", "TRX", "UNI", "PEPE", "FET", "DAI", "APE", "LDO", "ARB", 
    "OP", "STRK", "WLD", "NEAR"
];

interface GlobalIceberg {
    price: number;
    sizeUsd: number;
    exchanges: string[];
    isAsk: boolean;
}

interface PrecognitiveState {
    gravityScore: number;
    direction: 'BEARISH' | 'BULLISH' | 'NEUTRAL';
    targetPrice: number;
    currentPrice?: number;
    institutionalVigorValue: number;
    institutionalVigorPercent: number;
    institutionalIsAccumulation: boolean;
    polyConfluenceValue: number;
    polyHasData: boolean;
    icebergs: GlobalIceberg[];
    probabilityOfReversal: number;
    expectedMove: number;
}

function StackedCard({ symbol, index }: { symbol: string; index: number }) {
    const [state, setState] = useState<PrecognitiveState | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        let isMounted = true;
        const fetchStream = async () => {
            try {
                const response = await fetch(`/api/matrix/stream?asset=${symbol}`);
                if (!response.ok) throw new Error(`Stream ${response.status}`);
                if (!response.body) throw new Error('ReadableStream not supported');
                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                while (isMounted) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const parsed = JSON.parse(line.slice(6));
                                if (isMounted) setState(parsed as PrecognitiveState);
                            } catch (_) {}
                        }
                    }
                }
            } catch (err) {
                if (!isMounted) return;
                setError('reconnecting...');
                await new Promise(r => setTimeout(r, 3000));
                if (isMounted) { setError(null); fetchStream(); }
            }
        };

        fetchStream();
        return () => { isMounted = false; };
    }, [symbol]);

    if (!state) {
        return (
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-6 h-32 flex items-center justify-center w-full">
                <span className="text-[12px] font-bold uppercase text-[#888888] tracking-widest">NO SIGNAL YET</span>
            </div>
        );
    }

    const fmtCompact = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(Math.abs(n));

    const gravityPercent = state.gravityScore || 50;
    const positionPercent = state.direction === 'BULLISH' ? 50 - (gravityPercent / 2) : 50 + (gravityPercent / 2);

    let gaugeColor = '#94a3b8'; // neutral
    let glowShadow = '';
    
    if (positionPercent <= 40) {
        gaugeColor = '#06b6d4'; // institutional cyan for bullish
        if (gravityPercent > 70) glowShadow = 'shadow-[0_0_12px_rgba(6,182,212,0.4)]';
    } else if (positionPercent >= 60) {
        gaugeColor = '#f97316'; // deep orange for bearish
        if (gravityPercent > 70) glowShadow = 'shadow-[0_0_12px_rgba(249,115,22,0.4)]';
    }

    const vigorActive = state.institutionalVigorPercent > 80;
    const gravityActive = state.gravityScore > 70;
    const pmMeetsThreshold = state.polyHasData && state.polyConfluenceValue >= 75; 
    const isSovereignConfluence = vigorActive && gravityActive && pmMeetsThreshold;
    
    // Choose what to display in the main price indicator
    const displayPrice = state.currentPrice ? state.currentPrice : (state.targetPrice || 0);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className={`relative w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg cursor-default group overflow-hidden ${isSovereignConfluence ? 'border-[#00FFAA]/30 bg-gradient-to-r from-[#FAF9F6] to-[#00FFAA]/[0.02]' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Absolute Confluence Badge */}
            {isSovereignConfluence && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2 py-1 bg-[#00FFAA]/10 rounded border border-[#00FFAA]/20 shadow-[0_0_10px_rgba(0,255,170,0.2)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00FFAA] animate-pulse" />
                    <span className="text-[8px] font-black text-[#00FFAA] tracking-widest uppercase">ABSOLUTE CONFLUENCE</span>
                </div>
            )}


            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                {/* 1. Asset + Price */}
                <div className="flex-shrink-0 w-48">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-[#050505] tracking-tight">{symbol}</span>
                    </div>
                    <div className="text-xl font-bold text-[#050505] font-mono mt-1">
                        ${displayPrice > 0 ? displayPrice.toLocaleString(undefined, { minimumFractionDigits: displayPrice > 10 ? 2 : 4, maximumFractionDigits: displayPrice > 10 ? 2 : 5 }) : '---'}
                    </div>
                    {/* Secondary Target Price (so they know the matrix actually calculated a target) */}
                    <div className="text-[10px] font-bold text-[#888888] font-mono mt-0.5 uppercase tracking-widest">
                        TGT ${state.targetPrice > 0 ? state.targetPrice.toLocaleString(undefined, { minimumFractionDigits: state.targetPrice > 10 ? 2 : 4, maximumFractionDigits: state.targetPrice > 10 ? 2 : 5 }) : '---'}
                    </div>
                </div>

                {/* 2. Linear Gauge (Minimalist) */}
                <div className="flex-grow max-w-md w-full relative h-8 flex items-center justify-center">
                    <div className="absolute w-full h-[2px] bg-[#E5E5E5] rounded-full" />
                    <div className="absolute w-[2px] h-3 bg-[#E5E5E5] left-1/2 -translate-x-1/2" />
                    <motion.div 
                        initial={false}
                        animate={{ left: `${positionPercent}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="absolute h-full flex items-center justify-center -translate-x-1/2"
                    >
                        <div 
                            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${glowShadow}`}
                            style={{ backgroundColor: gaugeColor }}
                        />
                    </motion.div>
                </div>

                {/* 3. Metrics (Right-aligned, dense impact) */}
                <div className="flex-shrink-0 flex flex-col items-end text-right w-64 space-y-3 mt-4 md:mt-0">
                    

                    {/* Gravity Score */}
                    <div className="flex items-center gap-2 justify-end">
                        <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Gravity</span>
                        <div className="flex items-center gap-1">
                            <span className="text-[20px] font-black font-mono text-[#111111] drop-shadow-sm">{state.gravityScore.toFixed(1)}G</span>
                            {state.direction === 'BULLISH' ? <ArrowUp size={18} className="text-cyan-500" /> : state.direction === 'BEARISH' ? <ArrowDown size={18} className="text-orange-500" /> : <Activity size={18} className="text-slate-400" />}
                        </div>
                    </div>

                    {/* VIGOR */}
                    <div className="flex items-center gap-2 justify-end">
                        <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Vigor</span>
                        <span className={`text-[20px] font-black font-mono ${state.institutionalIsAccumulation ? 'text-cyan-500' : 'text-orange-500'}`}>
                            {state.institutionalVigorPercent.toFixed(0)}% <span className="text-[12px] inline-block ml-1">{state.institutionalIsAccumulation ? 'ACCUM' : 'DIST'} <span className="text-[#050505]/30 mx-1">•</span> {state.institutionalIsAccumulation ? '+' : '-'}{fmtCompact(state.institutionalVigorValue)}</span>
                        </span>
                    </div>

                    {/* Expected Move */}
                    <div className="flex items-center gap-2 justify-end">
                        <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Exp. Move</span>
                        <span className={`text-[22px] font-black font-mono drop-shadow-md ${state.expectedMove > 0 ? 'text-cyan-600' : 'text-orange-600'}`}>
                            {state.expectedMove > 0 ? '+' : ''}{state.expectedMove.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Execution Layer */}
            {isSovereignConfluence && (
                <div className="mt-6 border-t border-[#E5E5E5]/50 pt-4">
                    <PolymarketExecutionPanel 
                        symbol={symbol}
                        probability={state.probabilityOfReversal}
                        direction={state.direction}
                    />
                </div>
            )}

            {/* Hover Tooltip Overlay (Crystal clear glassmorphism) */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-20 bg-[#FAF9F6]/95 backdrop-blur-sm p-4 flex flex-row items-center justify-between border-t border-[#E5E5E5]/50 shadow-inner"
                    >
                        <div className="flex items-center gap-8 pl-4">
                            <div>
                                <span className="block text-[9px] font-bold text-[#050505]/40 uppercase tracking-widest mb-1">Reversal Probability</span>
                                <span className="text-lg font-black text-[#050505] font-mono">{state.probabilityOfReversal.toFixed(1)}%</span>
                            </div>
                            
                            <div className="h-8 w-[1px] bg-[#E5E5E5]" />

                            <div>
                                <span className="block text-[9px] font-bold text-[#050505]/40 uppercase tracking-widest mb-1">Polymarket Confluence</span>
                                {state.polyHasData ? (
                                    <span className="text-sm font-black text-[#050505] font-mono">{typeof state.polyConfluenceValue === 'number' ? state.polyConfluenceValue.toFixed(1) : state.polyConfluenceValue}% Agreement</span>
                                ) : (
                                    <span className="text-sm font-bold text-[#050505]/40 font-mono">No PM Data</span>
                                )}
                            </div>

                            <div className="h-8 w-[1px] bg-[#E5E5E5]" />

                            <div>
                                <span className="block text-[9px] font-bold text-[#050505]/40 uppercase tracking-widest mb-1">Global Icebergs (Active)</span>
                                {state.icebergs?.[0] ? (
                                    <span className="text-sm font-black text-[#050505] font-mono uppercase">
                                        {fmtCompact(state.icebergs[0].sizeUsd)} Limit @ ${state.icebergs[0].price.toLocaleString()}
                                    </span>
                                ) : (
                                    <span className="text-sm font-bold text-[#050505]/40 font-mono">None Detected</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function PremiumMatrixStack() {
    const [selectedTokens, setSelectedTokens] = useState<string[]>(PERFECTION_TOKENS.slice(0, 5));
    const [showInfoModal, setShowInfoModal] = useState(false);

    const handleSelectToken = (token: string) => {
        if (selectedTokens.includes(token)) {
            if (selectedTokens.length > 1) {
                setSelectedTokens(prev => prev.filter(t => t !== token));
            }
        } else {
            setSelectedTokens(prev => [token, ...prev]);
        }
    };

    return (
        <div className="w-full bg-[#FFFFFF] min-h-screen text-[#050505] font-sans selection:bg-[#050505]/10 selection:text-[#050505]">
            <div className="w-full max-w-[1600px] mx-auto flex flex-col px-6 md:px-12 py-8">
                
                {/* Top Chips Bar for Tokens */}
                <div className="mb-10 w-full flex items-center gap-4">
                    <div className="flex-grow overflow-x-auto no-scrollbar pb-2">
                        <div className="flex items-center gap-2 min-w-max">
                            {PERFECTION_TOKENS.map(token => {
                                const isSelected = selectedTokens.includes(token);
                                return (
                                    <button
                                        key={token}
                                        onClick={() => handleSelectToken(token)}
                                        className={`px-4 py-2 rounded-full text-[10px] font-mono font-black uppercase tracking-widest transition-all border ${
                                            isSelected 
                                                ? 'bg-[#050505] text-white border-[#050505] shadow-md' 
                                                : 'bg-white text-[#050505]/50 border-[#E5E5E5] hover:border-[#050505]/20 hover:text-[#050505]'
                                        }`}
                                    >
                                        {token}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-[#050505]/20 text-[#050505] hover:bg-[#050505] hover:text-white hover:border-[#050505] transition-all shadow-sm group"
                        title="Cómo funciona The Matrix"
                    >
                        <Info size={16} />
                    </button>
                </div>

                {/* Main Stacked List */}
                <div className="flex flex-col space-y-4 w-full">
                    <AnimatePresence>
                        {selectedTokens.map((token, idx) => (
                            <StackedCard key={token} symbol={token} index={idx} />
                        ))}
                    </AnimatePresence>
                </div>
                
                {selectedTokens.length === 0 && (
                    <div className="text-center py-20 text-[#050505]/30 font-mono text-sm uppercase tracking-widest">
                        NO ASSETS SELECTED
                    </div>
                )}

            {/* Modal de Información Legendaria */}
            <AnimatePresence>
                {showInfoModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm"
                            onClick={() => setShowInfoModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#ffffff] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between px-8 py-6 border-b border-[#E5E5E5]">
                                <h2 className="text-xl font-black text-[#050505] tracking-tight uppercase">LA ARQUITECTURA DE LA VERDAD ON-CHAIN: TERANODE EDITION</h2>
                                <button onClick={() => setShowInfoModal(false)} className="text-[#050505]/50 hover:text-[#050505] transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto font-sans leading-relaxed text-[#050505]/80 space-y-6 text-[15px]">
                                <p>
                                    El mercado de criptoactivos es altamente volátil y a menudo está influenciado por flujos de capital que no son evidentes a simple vista. Entender este mercado requiere analizar los datos en cadena (on-chain) directamente desde su origen, evitando depender únicamente de indicadores o rumores.
                                </p>
                                <p>
                                    A diferencia de muchos agregadores de datos que presentan cierta latencia, nuestra terminal Sovereign Matrix obtiene la información conectándose directamente a Teranode, una infraestructura de validación de alto rendimiento nativa de BSV.
                                </p>
                                <p>
                                    Esta conexión nos proporciona un entorno de procesamiento veloz y estable, permitiéndonos leer la información de las transacciones en tiempo real. Esto nos da una perspectiva técnica para analizar el comportamiento institucional con honestidad y claridad.
                                </p>

                                <div className="p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl relative overflow-hidden group hover:border-[#050505]/20 transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400 group-hover:bg-[#050505] transition-colors" />
                                    <h3 className="font-black text-sm uppercase tracking-widest text-[#050505] mb-2 flex items-center gap-2">
                                        <Activity size={14} /> GRAVITY <span className="text-[#888888] font-normal tracking-normal text-xs normal-case">— El Flujo de Fondos</span>
                                    </h3>
                                    <p className="text-sm">
                                        Gravity analiza el volumen de las transacciones procesadas (mediante nuestro clúster nativo) para medir hacia dónde se dirigen los capitales más grandes del mercado.
                                    </p>
                                    <p className="text-sm mt-2">
                                        <strong>Cyan:</strong> Indica una tendencia mayoritaria hacia la compra de activos.<br/>
                                        <strong>Naranja:</strong> Alerta que el capital está prefiriendo la liquidez, aumentando la presión de venta. Seguir estas corrientes ayuda a no operar en contra del mercado.
                                    </p>
                                </div>

                                <div className="p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl relative overflow-hidden group hover:border-[#050505]/20 transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 transition-colors" />
                                    <h3 className="font-black text-sm uppercase tracking-widest text-[#050505] mb-2">
                                        VIGOR (% ACCUM/DIST) <span className="text-[#888888] font-normal tracking-normal text-xs normal-case">— Actividad Institucional</span>
                                    </h3>
                                    <p className="text-sm border-b border-[#E5E5E5]/50 pb-3 mb-3">
                                        Vigor examina el comportamiento de las billeteras (UTXO) que manejan grandes volúmenes para inferir la fase actual de los inversores institucionales:
                                    </p>
                                    <ul className="text-sm space-y-2">
                                        <li><strong>Acumulación (ACCUM):</strong> Actores de gran capital absorbiendo activos de manera escalonada en el transcurso del tiempo.</li>
                                        <li><strong>Distribución (DIST):</strong> Instituciones reduciendo su exposición paulatinamente mientras el mercado minorista aún compra masivamente.</li>
                                    </ul>
                                </div>

                                <div className="p-5 bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl relative overflow-hidden group hover:border-[#050505]/20 transition-colors">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#050505] transition-colors" />
                                    <h3 className="font-black text-sm uppercase tracking-widest text-[#050505] mb-2 flex items-center gap-2">
                                        EXP. MOVE & TARGET (TGT) <span className="text-[#888888] font-normal tracking-normal text-xs normal-case">— Proyección de Datos</span>
                                    </h3>
                                    <p className="text-sm">
                                        Teniendo como base el registro histórico en cadena y los niveles actuales de liquidez detectados, calculamos la posible variación en precios y sugerimos un "Target" numérico aproximado.
                                    </p>
                                    <p className="text-sm mt-2 font-semibold text-[#050505]">
                                        Esta estadística te orienta hacia las zonas en donde habitualmente reside una mayor cantidad de interés real de mercado.
                                    </p>
                                </div>

                                <div className="p-5 bg-[#FAF9F6] border border-[#00FFAA]/30 rounded-2xl relative overflow-hidden group shadow-[0_0_15px_rgba(0,255,170,0.05)]">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00FFAA] transition-colors" />
                                    <h3 className="font-black text-sm uppercase tracking-widest text-[#050505] mb-2 flex items-center gap-2">
                                        ABSOLUTE CONFLUENCE <span className="text-[#888888] font-normal tracking-normal text-xs normal-case">— On-Chain + Polymarket</span>
                                    </h3>
                                    <p className="text-sm">
                                        Para encontrar un grado mayor de certidumbre, comparamos directamente nuestros datos algorítmicos en la cadena con los mercados reales de predicción como Polymarket.
                                    </p>
                                    <p className="text-sm mt-2 font-semibold text-[#050505]">
                                        Cuando las decisiones institucionales on-chain coindicen plenamente con el consenso mundial de predicción, hablamos de una Confluencia Absoluta; un patrón que aumenta la fiabilidad del pronóstico.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="p-8 bg-[#050505] text-white">
                                <p className="text-[13px] leading-relaxed opacity-90 font-medium">
                                    Tener acceso a datos puros y estructurados es clave para visualizar mejor este panorama económico. Las herramientas con las que contamos pretenden simplemente ser precisas y eficientes usando tecnología punta de manera sensata. Depende enteramente de ti cómo decides ejecutar tu estrategia y tus recursos tras consultar los datos analíticos disponibles.
                                </p>
                                <button 
                                    onClick={() => setShowInfoModal(false)}
                                    className="mt-6 w-full py-4 bg-white text-[#050505] font-black text-sm uppercase tracking-widest hover:bg-[#FAF9F6] transition-colors"
                                >
                                    Cerrar y Volver a The Matrix
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </div>
        </div>
    );
}
