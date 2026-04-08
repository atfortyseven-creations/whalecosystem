import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, ShieldAlert, Target, TrendingUp, Flame } from 'lucide-react';

export function WhaleSonar() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [stats, setStats] = useState({ alertCount: 0, totalUsd: 0 });

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const fetchAlerts = async () => {
            if (!isMounted) return;
            try {
                const res = await fetch('/api/whales/stream');
                if (res.ok) {
                    const payload = await res.json();
                    if (payload.type === 'HISTORY') {
                        setAlerts(payload.alerts || []);
                    } else if (payload.type === 'WHALE') {
                        setAlerts(prev => {
                            const next = [payload, ...prev];
                            if (next.length > 50) return next.slice(0, 50);
                            return next;
                        });
                        setStats(s => ({
                            alertCount: s.alertCount + 1,
                            totalUsd: s.totalUsd + (payload.usdValue || 0)
                        }));
                    }
                }
            } catch (err) {
                // Silently retry
            } finally {
                if (isMounted) {
                    timeoutId = setTimeout(fetchAlerts, 3000);
                }
            }
        };

        fetchAlerts();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-4 right-4 bottom-4 w-80 bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-40 p-4"
        >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <Target size={18} className="text-[var(--aztec-orchid)] animate-pulse" />
                <h2 className="text-sm font-aztec-mono font-black uppercase tracking-[0.2em] text-white">Whale Sonar</h2>
            </div>

            {/* Financial Health Metrics */}
            <div className="space-y-4 mb-6">
                <MetricBox 
                    title="Alerts Detected" 
                    value={`${stats.alertCount}`} 
                    icon={<TrendingUp size={14} className="text-[var(--aztec-chartreuse)]" />}
                    color="text-[var(--aztec-chartreuse)]"
                />
                <MetricBox 
                    title="Total USD Volume" 
                    value={stats.totalUsd > 0 ? `$${(stats.totalUsd / 1e6).toFixed(2)}M` : `---`} 
                    icon={<Flame size={14} className="text-orange-500" />}
                    color="text-orange-500"
                />
                
                {/* Exposure Radar (Simple CSS Representation) */}
                <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-3 flex items-center justify-between">
                        <span>Exposure Radar</span>
                        <Zap size={10} className="text-[var(--aztec-orchid)]" />
                    </div>
                    {/* Concentric rings to simulate radar */}
                    <div className="relative w-full aspect-square bg-[#0c0c0c] rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
                        <div className="absolute w-2/3 h-2/3 rounded-full border border-[var(--aztec-orchid)]/20" />
                        <div className="absolute w-1/3 h-1/3 rounded-full border border-[var(--aztec-orchid)]/40" />
                        <div className="w-1 h-1 bg-[var(--aztec-chartreuse)] rounded-full shadow-[0_0_10px_var(--aztec-chartreuse)]" />
                        
                        {/* Radar Sweep */}
                        <div className="absolute inset-0 origin-center animate-[spin_4s_linear_infinite] opacity-50">
                            <div className="w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-[var(--aztec-orchid)]/5 to-[var(--aztec-orchid)]/40 blur-sm rounded-tl-full" />
                        </div>
                        
                        {/* Dynamic blips */}
                        {alerts.slice(0, 10).map((alert, i) => {
                            // Deterministic position derived from the tx hash
                            const hashCode = (alert.txHash || 'default').split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
                            const leftPct = 20 + (hashCode % 60);
                            const topPct  = 20 + ((hashCode * 31) % 60);
                            return (
                            <motion.div 
                                key={alert.id || i}
                                initial={{ scale: 0, opacity: 1 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                className={`absolute w-2 h-2 rounded-full ${(alert.usdValue || 0) > 2000000 ? 'bg-red-500' : 'bg-[var(--aztec-chartreuse)]'}`}
                                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                            />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Threat Feed */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="text-[10px] uppercase font-mono tracking-widest text-white/40 mb-3">Enviroment Scans</div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    <AnimatePresence>
                        {alerts.map((alert, idx) => (
                            <motion.div 
                                key={alert.id || idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                                    alert.usdValue > 2000000 
                                    ? 'bg-red-500/10 border-red-500/20 text-red-200' 
                                    : 'bg-[var(--aztec-orchid)]/10 border-[var(--aztec-orchid)]/20 text-[var(--aztec-orchid)]'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                     {alert.usdValue > 2000000 ? <ShieldAlert size={14} className="shrink-0" /> : <Activity size={14} className="shrink-0" />}
                                     <span className="font-bold flex-1">{alert.asset} Transfer</span>
                                     <span className="text-[10px] opacity-70">${(alert.usdValue / 1000).toFixed(0)}k</span>
                                </div>
                                <span className="text-[9px] font-mono opacity-80 break-all">{alert.txHash}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 2px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
            `}</style>
        </motion.div>
    );
}

function MetricBox({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
                <div className="text-[9px] uppercase font-mono tracking-widest text-white/40 mb-1">{title}</div>
                <div className={`text-xl font-aztec-serif font-black ${color}`}>{value}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0c0c0c] flex items-center justify-center border border-white/5">
                {icon}
            </div>
        </div>
    );
}
