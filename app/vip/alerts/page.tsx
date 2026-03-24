"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Activity, AlertTriangle, CheckCircle, X, History, Filter } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';

interface AlertItem {
    id: string;
    type: 'whale_large_tx' | 'price_spike' | 'mempool_surge';
    title: string;
    body: string;
    severity: 'high' | 'medium' | 'low';
    ts: number;
    read: boolean;
}

export default function AlertsPage() {
    const { whaleEvents, ethPrice, mempool } = useVIPStore();
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [tab, setTab] = useState<'all' | 'unread' | 'critical'>('all');

    const addAlert = (alert: AlertItem) => {
        setAlerts(prev => {
            if (prev.find(a => a.id === alert.id)) return prev;
            return [alert, ...prev].slice(0, 50);
        });
    };

    const prevEthPriceRef = React.useRef<number>(0);

    // Derived Intelligent Alerts from Store Data
    useEffect(() => {
        if (!ethPrice || ethPrice === 0) return;

        // 1. REAL Price Spike detection: ≥0.5% movement since last tick
        const prev = prevEthPriceRef.current;
        if (prev > 0) {
            const deltaPct = Math.abs((ethPrice - prev) / prev);
            if (deltaPct >= 0.005) {
                const direction = ethPrice > prev ? '▲' : '▼';
                addAlert({
                    id: `price-${Date.now()}`,
                    type: 'price_spike',
                    title: 'High Volatility Detected',
                    body: `ETH moved ${direction} ${(deltaPct * 100).toFixed(2)}% in one interval. Current: $${ethPrice.toLocaleString()}`,
                    severity: deltaPct >= 0.02 ? 'high' : 'medium',
                    ts: Date.now(),
                    read: false,
                });
            }
        }
        prevEthPriceRef.current = ethPrice;

        // 2. Whale alerts from the central event stream
        const largeEvent = whaleEvents.find(e => e.usdNum > 2_000_000);
        if (largeEvent) {
            addAlert({
                id: `whale-${largeEvent.id}`,
                type: 'whale_large_tx',
                title: `Mega Transaction: ${largeEvent.usdValue}`,
                body: `${largeEvent.label} triggered a massive ${largeEvent.action} of ${largeEvent.token}`,
                severity: largeEvent.usdNum > 10_000_000 ? 'high' : 'medium',
                ts: Date.now(),
                read: false,
            });
        }

        // 3. Mempool Surge
        if (mempool && mempool.count > 150_000) {
            addAlert({
                id: `mempool-${Date.now()}`,
                type: 'mempool_surge',
                title: 'Mempool Congestion Alert',
                body: `Bitcoin network mempool has exceeded 150k pending transactions. Recommended fee: ${mempool.fastestFee} sat/vB`,
                severity: 'high',
                ts: Date.now(),
                read: false,
            });
        }
    }, [whaleEvents, ethPrice, mempool]);

    const markRead = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? {...a, read: true} : a));
    const dismiss = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));

    const filtered = alerts.filter(a => {
        if (tab === 'unread') return !a.read;
        if (tab === 'critical') return a.severity === 'high';
        return true;
    });

    const sevColor = { high: 'border-l-red-500 bg-red-50', medium: 'border-l-orange-400 bg-orange-50', low: 'border-l-blue-400 bg-blue-50' };
    const sevIcon = { high: AlertTriangle, medium: Bell, low: CheckCircle };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full">
            {/* Header section with notification bubble */}
            <div className="mb-10 border-b border-stone-200 pb-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="p-4 bg-stone-900 rounded-[28px] shadow-2xl">
                                <Bell className="w-8 h-8 text-white" />
                            </div>
                            {alerts.filter(a => !a.read).length > 0 && (
                                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-[10px] font-black border-4 border-[#f5f5f4] flex items-center justify-center">
                                    {alerts.filter(a => !a.read).length}
                                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-5xl font-normal tracking-tight text-stone-900">System Alerts</h1>
                            <p className="text-stone-500 mt-2 font-light">Notificaciones neurales auto-climatizadas basadas en flujos on-chain y mercado spot.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    {(['all', 'unread', 'critical'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`text-xs px-6 py-2.5 rounded-full border-2 font-black uppercase tracking-widest transition-all ${
                                tab === t ? 'bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-200' : 'text-stone-400 border-stone-100 bg-white hover:border-stone-300'
                            }`}>
                            {t === 'all' ? 'All Signals' : t === 'unread' ? 'Unread' : 'Critical Only'}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-32 border-2 border-dashed border-stone-200 rounded-[40px] bg-white/20">
                    <History size={64} className="mx-auto mb-6 opacity-10 text-stone-900" />
                    <p className="text-xl font-bold text-stone-400 mb-2">Neural History Empty</p>
                    <p className="text-sm text-stone-300 max-w-sm mx-auto">No se han generado alertas inteligentes en este ciclo. El sistema sigue escaneando la red.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {filtered.map((alert, i) => {
                            const Icon = sevIcon[alert.severity];
                            return (
                                <motion.div key={alert.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: 10 }} transition={{ delay: i * 0.05 }}
                                    className={`p-6 border border-l-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all ${sevColor[alert.severity]} ${!alert.read ? 'ring-2 ring-stone-900/5' : 'opacity-60'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-2xl ${alert.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-stone-100 text-stone-600'}`}>
                                            <Icon className="w-6 h-6 shrink-0" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-black text-stone-900 text-lg tracking-tight uppercase">{alert.title}</div>
                                                <button onClick={() => dismiss(alert.id)} className="text-stone-300 hover:text-stone-900 transition-colors">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="text-sm text-stone-500 mb-4 font-light leading-relaxed">{alert.body}</div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-[10px] font-mono text-stone-400 uppercase font-bold tracking-widest">{new Date(alert.ts).toLocaleTimeString()}</div>
                                                {!alert.read && (
                                                    <button onClick={() => markRead(alert.id)}
                                                        className="text-[10px] font-black uppercase tracking-widest text-stone-900 bg-white border border-stone-200 px-4 py-1.5 rounded-full hover:bg-stone-50 transition-colors">
                                                        Mark as Intel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}

