"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Globe, Info, Zap } from 'lucide-react';

interface MarketEntry {
    country: string;
    market: string;
    product: string;
    hours: string;
}

interface RegionData {
    id: string;
    label: string;
    markets: MarketEntry[];
}

const REGIONS: RegionData[] = [
    {
        id: 'na-global',
        label: 'North America & Global',
        markets: [
            { country: 'Canadá', market: 'Toronto Stock Exchange', product: 'Acciones y ETFs', hours: '15:30-22:00' },
            { country: 'Canadá', market: 'Toronto Ventures Exchange', product: 'Acciones y ETFs', hours: '15:30-22:00' },
            { country: 'Estados Unidos', market: 'CBOE', product: 'Opciones', hours: '15:30-22:15' },
            { country: 'Estados Unidos', market: 'CME', product: 'Futuros', hours: '24:00-23:00' },
            { country: 'Estados Unidos', market: 'CME', product: 'Opciones', hours: '24:00-23:00' },
            { country: 'Estados Unidos', market: 'CBOT', product: 'Futuros', hours: '24:00-23:00' },
            { country: 'Estados Unidos', market: 'COMEX', product: 'Futuros', hours: '24:00-23:00' },
            { country: 'Estados Unidos', market: 'NASDAQ', product: 'Acciones y ETFs', hours: '15:30-22:00' },
            { country: 'Estados Unidos', market: 'NYMEX', product: 'Futuros', hours: '24:00-23:00' },
            { country: 'Estados Unidos', market: 'NYSE', product: 'Acciones y ETFs', hours: '15:30-22:00' },
            { country: 'Estados Unidos', market: 'NYSE American', product: 'Acciones y ETFs', hours: '15:30-22:00' },
            { country: 'Estados Unidos', market: 'NYSE Arca', product: 'Acciones y ETFs', hours: '15:30-22:00' },
            { country: 'Globales', market: 'Tradegate', product: 'Acciones y ETFs', hours: '07:30-22:00' },
        ]
    },
    {
        id: 'asia-oceania',
        label: 'Asia & Oceania',
        markets: [
            { country: 'Australia', market: 'ASX', product: 'Acciones y ETFs', hours: '24:00-06:00' },
            { country: 'Hong Kong', market: 'HKEX', product: 'Acciones y ETFs', hours: '03:30-09:00' },
            { country: 'Japón', market: 'TSE', product: 'Acciones y ETFs', hours: '02:00-04:30 & 05:30-08:00' },
            { country: 'Singapur', market: 'SGX', product: 'Acciones y ETFs', hours: '03:00-06:00 & 07:00-11:00' },
        ]
    },
    {
        id: 'uk-ireland',
        label: 'UK & Ireland',
        markets: [
            { country: 'Irlanda', market: 'Euronext Dublin', product: 'Acciones y ETFs', hours: '09:00-17:30' },
            { country: 'Reino Unido', market: 'LSE', product: 'Acciones y ETFs', hours: '09:00-17:30' },
        ]
    },
    {
        id: 'europe-ag',
        label: 'Europe (A-G)',
        markets: [
            { country: 'Alemania', market: 'Börse Frankfurt', product: 'Acciones y ETFs', hours: '08:00-22:00' },
            { country: 'Alemania', market: 'Eurex', product: 'Futuros', hours: '08:00-22:00' },
            { country: 'Alemania', market: 'Eurex', product: 'Opciones', hours: '08:00-17:30' },
            { country: 'Alemania', market: 'Xetra', product: 'Bonos', hours: '09:00-17:30' },
            { country: 'Alemania', market: 'Xetra', product: 'Acciones y ETFs', hours: '09:00-17:30' },
            { country: 'Austria', market: 'Wiener Boerse AG', product: 'Acciones y ETFs', hours: '08:55-17:35' },
            { country: 'Bélgica', market: 'Euronext Brussel', product: 'Bonos', hours: '09:00-17:30' },
            { country: 'Bélgica', market: 'Euronext Brussel', product: 'Acciones y ETFs', hours: '09:00-17:30' },
            { country: 'Bélgica', market: 'Derivatives Brussel', product: 'Futuros', hours: '09:00-17:30' },
            { country: 'Bélgica', market: 'Derivatives Brussel', product: 'Opciones', hours: '09:00-17:30' },
            { country: 'Dinamarca', market: 'Nasdaq Copenhagen', product: 'Futuros', hours: '09:00-16:55' },
            { country: 'Dinamarca', market: 'Nasdaq Copenhagen', product: 'Opciones', hours: '09:00-16:55' },
            { country: 'España', market: 'Bolsa de Madrid', product: 'Acciones y ETFs', hours: '09:00-17:45' },
            { country: 'España', market: 'MEFF', product: 'Opciones', hours: '09:00-17:30' },
            { country: 'España', market: 'MEFF (IBEX 35)', product: 'Futuros', hours: '08:00-22:00' },
            { country: 'España', market: 'MEFF (other)', product: 'Futuros', hours: '09:00-17:30' },
            { country: 'Finlandia', market: 'Nasdaq Helsinki', product: 'Futuros', hours: '09:00-17:25' },
            { country: 'Finlandia', market: 'Nasdaq Helsinki', product: 'Opciones', hours: '09:00-17:25' },
            { country: 'Francia', market: 'Derivatives Paris', product: 'Futuros', hours: '08:00-22:00' },
            { country: 'Francia', market: 'Derivatives Paris', product: 'Opciones', hours: '09:00-17:30' },
            { country: 'Francia', market: 'Euronext Paris', product: 'Bonos', hours: '09:00-17:30' },
            { country: 'Francia', market: 'Euronext Paris', product: 'Acciones y ETFs', hours: '09:00-17:30' },
            { country: 'Grecia', market: 'Athens Stock Exchange', product: 'Acciones y ETFs', hours: '09:15-16:20' },
        ]
    },
    {
        id: 'europe-hz',
        label: 'Europe (H-Z)',
        markets: [
            { country: 'Italia', market: 'Euronext Milan', product: 'Acciones y ETFs', hours: '09:00-17:30' },
            { country: 'Italia', market: 'Euronext Milan', product: 'Futuros', hours: '08:00-20:00' },
            { country: 'Italia', market: 'Euronext Milan', product: 'Opciones', hours: '09:00-18:00' },
            { country: 'Noruega', market: 'Euronext Oslo Børs', product: 'Acciones y ETFs', hours: '09:00-16:25' },
            { country: 'Países Bajos', market: 'Euronext Amsterdam', product: 'Bonos', hours: '09:00-17:30' },
            { country: 'Países Bajos', market: 'Euronext Amsterdam', product: 'Acciones y ETFs', hours: '09:00-17:30' },
            { country: 'Países Bajos', market: 'Derivatives Amsterdam', product: 'Futuros', hours: '08:00-22:00' },
            { country: 'Países Bajos', market: 'Derivatives Amsterdam', product: 'Opciones', hours: '09:00-17:30' },
            { country: 'Polonia', market: 'Warsaw Stock Exchange', product: 'Acciones y ETFs', hours: '09:00-16:50' },
            { country: 'Portugal', market: 'Euronext Lisbon', product: 'Bonos', hours: '09:00-17:30' },
            { country: 'Portugal', market: 'Euronext Lisbon', product: 'Acciones y ETFs', hours: '09:00-17:30' },
            { country: 'República Checa', market: 'Prague Stock Exchange', product: 'Acciones y ETFs', hours: '09:00-16:30' },
            { country: 'Suecia', market: 'Nasdaq Stockholm', product: 'Futuros', hours: '09:00-17:25' },
            { country: 'Suecia', market: 'Nasdaq Stockholm', product: 'Opciones', hours: '09:00-17:25' },
            { country: 'Suecia', market: 'Nasdaq Stockholm', product: 'Acciones y ETFs', hours: '09:00-17:30' },
            { country: 'Suiza', market: 'SIX Swiss Exchange', product: 'Acciones y ETFs', hours: '09:00-17:30' },
        ]
    }
];

export function GlobalMarketSessions() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState(REGIONS[0].id);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const activeRegion = REGIONS.find(r => r.id === activeTab) || REGIONS[0];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl mx-auto px-6 py-20"
        >
            <div className="flex flex-col items-center justify-center text-center space-y-12 mb-20">
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-600 uppercase tracking-[0.5em]">
                        Schedule
                    </h2>
                    <div className="flex items-center gap-4 px-6 py-3 bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-xl">
                        <span className="text-xl font-mono font-black text-slate-950 tracking-tight">
                            {currentTime.getUTCHours().toString().padStart(2, '0')}:
                            {currentTime.getUTCMinutes().toString().padStart(2, '0')}:
                            {currentTime.getUTCSeconds().toString().padStart(2, '0')} UTC
                        </span>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-white/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-lg">
                    {REGIONS.map(region => (
                        <button
                            key={region.id}
                            onClick={() => setActiveTab(region.id)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                activeTab === region.id 
                                ? 'bg-white text-slate-950 shadow-md border border-slate-100 scale-105' 
                                : 'text-slate-700 hover:text-slate-950'
                            }`}
                        >
                            {region.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/40 backdrop-blur-[60px] border border-white/30 rounded-[3rem] p-12 shadow-2xl shadow-black/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--aave-purple)]/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                        
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-300">
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">País</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Mercado</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Producto</th>
                                        <th className="pb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 text-right">Apertura</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeRegion.markets.map((m, i) => (
                                        <tr key={i} className="group hover:bg-white/50 transition-colors">
                                            <td className="py-5 text-sm font-black text-slate-950 uppercase tracking-tighter pr-4">{m.country}</td>
                                            <td className="py-5 text-xs font-bold text-slate-700 pr-4">{m.market}</td>
                                            <td className="py-5 text-xs font-medium text-slate-600 pr-4">{m.product}</td>
                                            <td className="py-5 text-xs font-mono font-black text-slate-950 text-right">{m.hours}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Floating Disclaimer */}
                        <div className="mt-16 space-y-6">
                            <div className="p-8 bg-black/5 rounded-[2rem] border border-black/5 flex gap-6 items-start">
                                <Info size={20} className="text-[var(--aave-purple)] mt-1 flex-shrink-0" />
                                <p className="text-xs text-slate-500 leading-loose font-medium">
                                    Ten en cuenta que solo ofrecemos el horario principal de negociación de **Xetra** en negociación continua con el modelo de negociación de subastas intradía (de 9:00 CET a 17:30 CET). No ofrecemos el horario de negociación minorista de Xetra durante la negociación temprana (de 8:00 CET a 9:00 CET) y la negociación tardía (de 17:30 CET a 22:00 CET) en el modelo de negociación de mini subastas.
                                </p>
                            </div>
                            <div className="p-8 bg-[var(--aave-purple)]/5 rounded-[2rem] border border-[var(--aave-purple)]/10 flex gap-6 items-start">
                                <Zap size={20} className="text-[var(--aave-purple)] mt-1 flex-shrink-0" />
                                <p className="text-xs text-slate-700 leading-loose font-medium">
                                    La operativa con **criptomonedas** está disponible las 24 horas del día, los 7 días de la semana. Ten en cuenta que esto excluye los reinicios obligatorios del servidor alrededor de medianoche y los periodos de mantenimiento general.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
