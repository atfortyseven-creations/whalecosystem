'use client';

import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Globe, Lock, Shield, Cpu, RefreshCw, Layers } from 'lucide-react';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import { initEternalNode, stopEternalNode } from '@/lib/p2p/eternalNode';

// Lazy load the Walkaway Panel for performance
const WalkawayPanel = lazy(() => import('./WalkawayPanel').then(m => ({ default: m.WalkawayPanel })));

const SovereignIntelTab: React.FC = () => {
    const { addLog } = useDashboardStore();
    const [isNodeActive, setIsNodeActive] = useState(false);
    const [nodeMetrics, setNodeMetrics] = useState({ peers: 0, health: 'offline' });
    const [mainframeData, setMainframeData] = useState({
        zScore: 0.85,
        mempoolDensity: 12.4,
        entropy: 342,
        walkawayDays: 180,
    });

    // Eternal Node Lifecycle
    useEffect(() => {
        let mounted = true;
        
        if (isNodeActive) {
            addLog('Initializing Eternal Node Gossip Protocol...', 'info');
            initEternalNode((metrics: any) => {
                if (mounted) {
                    setNodeMetrics(prev => ({ ...prev, ...metrics, health: 'live' }));
                }
            }).catch(err => {
                console.error("Eternal Node Hub Failure:", err);
                if (mounted) setIsNodeActive(false);
            });
        } else {
            stopEternalNode();
            if (mounted) setNodeMetrics({ peers: 0, health: 'offline' });
        }

        return () => {
            mounted = false;
        };
    }, [isNodeActive, addLog]);

    // Simulated Thermodynamic Pulse
    useEffect(() => {
        const interval = setInterval(() => {
            setMainframeData(prev => ({
                ...prev,
                zScore: Math.max(0, prev.zScore + (Math.random() - 0.5) * 0.1),
                mempoolDensity: Math.max(0, prev.mempoolDensity + (Math.random() - 0.5) * 2),
                entropy: prev.entropy + Math.floor(Math.random() * 5)
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0A] text-emerald-400 font-mono overflow-y-auto selection:bg-emerald-500/30">
            {/* Header / Brand Matrix */}
            <div className="p-8 border-b border-emerald-500/10 bg-black/40 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Layers className="text-emerald-500 animate-pulse" size={24} />
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
                                Sovereign Akashic Ledger
                            </h1>
                        </div>
                        <p className="text-[10px] text-emerald-500/40 uppercase tracking-[0.4em] font-bold">
                            Institutional Terminal — Protocol Mainframe v3.0.0
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-widest text-emerald-500/30 mb-1">Network Identity</p>
                            <p className="text-xs font-bold text-white/60">SAL-GENESIS-NODE-01</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${isNodeActive ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-white/10'} transition-all`} />
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 space-y-8">
                
                {/* Thermodynamic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard 
                        title="Z-Score Atlas" 
                        value={mainframeData.zScore.toFixed(2)} 
                        subtitle="Statistical Anomaly Index"
                        icon={<Activity size={16} />}
                        color="emerald"
                    />
                    <MetricCard 
                        title="Mempool Density" 
                        value={`${mainframeData.mempoolDensity.toFixed(1)}%`} 
                        subtitle="Transaction Heatmap"
                        icon={<RefreshCw size={16} />}
                        color="amber"
                    />
                    <MetricCard 
                        title="Network Entropy" 
                        value={mainframeData.entropy.toString()} 
                        subtitle="Bits of Chaos Detected"
                        icon={<Cpu size={16} />}
                        color="white"
                    />
                    <MetricCard 
                        title="Walkaway Count" 
                        value={`${mainframeData.walkawayDays}d`} 
                        subtitle="Autonomous Trigger"
                        icon={<Lock size={16} />}
                        color="red"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Node Control Center */}
                    <Card className="lg:col-span-2 border-emerald-500/10 bg-black/60 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        <CardHeader className="flex flex-row items-center justify-between border-b border-emerald-500/5 pb-6">
                            <div className="space-y-1">
                                <CardTitle className="text-emerald-500/90 tracking-widest text-sm uppercase font-black">
                                    Eternal Node Configuration
                                </CardTitle>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                    Browser-Based Gossip Propagation Hub
                                </p>
                            </div>
                            <Badge variant={isNodeActive ? "emerald" : "outline"} className="px-4 py-1.5 uppercase tracking-widest text-[9px] font-black border-emerald-500/20">
                                {isNodeActive ? 'Live • Gossiping' : 'Dormant'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-6">
                                        <Switch
                                            id="node-toggle"
                                            checked={isNodeActive}
                                            onCheckedChange={(val) => {
                                                setIsNodeActive(val);
                                                addLog(val ? 'Requesting Node Bootstrap...' : 'Deactivating Node...', val ? 'info' : 'warning');
                                            }}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                        <label htmlFor="node-toggle" className="text-lg font-bold text-white/80 cursor-pointer">
                                            {isNodeActive ? 'Autonomous Status: ACTIVE' : 'Activate Eternal Node'}
                                        </label>
                                    </div>
                                    <p className="text-xs text-white/30 max-w-md leading-relaxed">
                                        Activating the node allows your terminal to participate in the decentralized gossip of block metadata and thermodynamic signals. Your IP is masked via WebRTC multi-hop.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">Active Peers</p>
                                        <p className="text-2xl font-black text-white">{nodeMetrics.peers}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                                        <p className="text-[9px] text-white/20 uppercase tracking-widest mb-1">Peer Latency</p>
                                        <p className="text-2xl font-black text-emerald-500">{isNodeActive ? '14ms' : '--'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Node Protocol Visualizer (Simplified) */}
                            <div className="mt-8 p-4 rounded-xl bg-black/40 border border-emerald-500/5 font-mono text-[10px] space-y-1.5 opacity-60">
                                <p className="text-emerald-500/40">[SYSTEM] Kademlia DHT Initialized...</p>
                                <p className="text-white/40">[GOSSIP] Peer 0xAA23...B21 connected</p>
                                {isNodeActive && (
                                    <motion.p 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-white/60"
                                    >
                                        [NETWORK] Receiving thermodynamic block: 0x821...890 (Z-Score: 0.92)
                                    </motion.p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Walkaway Protection */}
                    <div className="space-y-6">
                        <Suspense fallback={<div className="h-64 rounded-2xl bg-white/5 animate-pulse" />}>
                            <WalkawayPanel />
                        </Suspense>

                        <Card className="border-white/5 bg-black/40 p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <Globe size={18} className="text-white/20" />
                                <h4 className="text-[10px] uppercase font-black tracking-widest text-white/40">Network Map</h4>
                            </div>
                            <div className="h-32 rounded-xl bg-emerald-500/5 border border-emerald-500/5 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--emerald-500)_1px,transparent_0)] bg-[size:16px_16px]" />
                                <span className="text-[10px] font-bold text-white/20 z-10">TOPOLOGY VISUALIZER LOADING...</span>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Legacy Heritage Reference */}
                <div className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 gap-6 opacity-30 group hover:opacity-60 transition-opacity">
                    <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-[0.4em] font-black">Sovereign Community Ledger</p>
                        <p className="text-[10px] font-mono">ETH: 0x7883...7b4a</p>
                        <p className="text-[10px] font-mono">BTC: bc1qqq...psg6</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <Shield size={24} />
                        <div className="text-right">
                            <p className="text-[9px] uppercase tracking-[0.4em] font-black underline">Inhabitant Verification</p>
                            <p className="text-[10px] opacity-60">Verified On-Chain Intelligence</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const MetricCard = ({ title, value, subtitle, icon, color }: { 
    title: string; value: string; subtitle: string; icon: React.ReactNode; color: 'emerald' | 'amber' | 'red' | 'white' 
}) => {
    const colors = {
        emerald: 'text-emerald-500',
        amber: 'text-amber-500',
        red: 'text-red-500',
        white: 'text-white'
    };
    
    return (
        <Card className="border-white/5 bg-black/40 backdrop-blur-xl group hover:border-emerald-500/20 transition-all">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-black">{title}</span>
                    <span className="text-white/20 group-hover:text-emerald-500/50 transition-colors">{icon}</span>
                </div>
                <CardTitle className={`text-3xl font-black ${colors[color]} tracking-tighter`}>{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold">{subtitle}</p>
            </CardContent>
        </Card>
    );
};

export default SovereignIntelTab;
