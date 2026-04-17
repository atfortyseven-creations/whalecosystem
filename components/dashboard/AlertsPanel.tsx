// components/dashboard/AlertsPanel.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Plus, Trash2, ToggleLeft, ToggleRight,
    TrendingUp, TrendingDown, Zap, Volume2,
    Activity, Target, Clock, CheckCircle, XCircle, Search, Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useSovereignAccount as useAccount } from '@/hooks/useSovereignAccount';
import { useWhaleStream } from '@/context/WhaleStreamContext';

type AlertType = 'PRICE_ABOVE' | 'PRICE_BELOW' | 'VOLUME_SPIKE' | 'WHALE_MOVE' | 'PERCENT_CHANGE';
type AlertStatus = 'ACTIVE' | 'TRIGGERED' | 'PAUSED';

interface AlertRule {
    id: string;
    name: string;
    type: AlertType;
    asset: string;
    threshold: number;
    currentValue?: number;
    status: AlertStatus;
    triggeredAt?: string;
    createdAt: string;
    notifyTelegram: boolean;
    notifyEmail: boolean;
    notifyPush: boolean;
}

const TYPE_CONFIG: Record<AlertType, { label: string; icon: React.ReactNode; color: string }> = {
    PRICE_ABOVE:    { label: 'PRICE_ABOVE',     icon: <TrendingUp size={12}/>,   color: '#00C076' },
    PRICE_BELOW:    { label: 'PRICE_BELOW',     icon: <TrendingDown size={12}/>, color: '#FF3B30' },
    VOLUME_SPIKE:   { label: 'VOLUME_SPIKE',    icon: <Volume2 size={12}/>,      color: '#0052FF' },
    WHALE_MOVE:     { label: 'WHALE_MOVEMENT',  icon: <Activity size={12}/>,     color: '#D4AF37' },
    PERCENT_CHANGE: { label: 'PERCENT_DELTA',   icon: <Zap size={12}/>,          color: '#FF9500' },
};

const STATUS_CONFIG: Record<AlertStatus, { label: string; color: string; bg: string }> = {
    ACTIVE:    { label: 'ACTIVE',    color: '#00C076', bg: '#00C07615' },
    TRIGGERED: { label: 'TRIGGERED', color: '#D4AF37', bg: '#D4AF3715' },
    PAUSED:    { label: 'PAUSED',    color: '#888888', bg: '#88888815' },
};

function CreateAlertModal({ onClose, onCreate }: { onClose: () => void; onCreate: (a: any) => void }) {
    const [form, setForm] = useState({ 
        name: '', 
        asset: 'BTC', 
        type: 'PRICE_ABOVE' as AlertType, 
        threshold: '', 
        telegram: true, 
        telegramHandle: '', 
        push: true, 
        email: false, 
        emailAddress: '' 
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#050505] border border-white/10 rounded-none p-8 w-full max-w-md font-mono"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-2">
                        <Bell size={14} className="text-emerald-500" /> New_Trigger_Logic
                    </h2>
                    <button onClick={onClose} className="text-white/20 hover:text-white"><XCircle size={14}/></button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Identifier</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="SYSTEM_ALERT_01"
                            className="w-full bg-white/[0.02] border border-white/5 px-4 py-3 text-[10px] text-white outline-none focus:border-emerald-500/50 transition-all uppercase"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Asset_Pair</label>
                            <select value={form.asset} onChange={e => setForm(f => ({ ...f, asset: e.target.value }))}
                                className="w-full bg-white/[0.02] border border-white/5 px-4 py-3 text-[10px] text-white outline-none focus:border-emerald-500/50 transition-all bg-black cursor-pointer">
                                {['BTC','ETH','SOL','USDC','BASE','WLD'].map(a => <option key={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Trigger_Type</label>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as AlertType }))}
                                className="w-full bg-white/[0.02] border border-white/5 px-4 py-3 text-[10px] text-white outline-none focus:border-emerald-500/50 transition-all bg-black cursor-pointer">
                                {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">Threshold_Value</label>
                        <input value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
                            type="number" placeholder="90000.00"
                            className="w-full bg-white/[0.02] border border-white/5 px-4 py-3 text-[10px] text-white outline-none focus:border-emerald-500/50 transition-all font-mono"
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button onClick={onClose} className="flex-1 py-3 border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                        <button 
                            onClick={() => {
                                if (!form.name || !form.threshold) return toast.error('Incomplete Parameters');
                                onCreate({ ...form, id: `rule-${Date.now()}` });
                                onClose();
                            }} 
                            className="flex-1 py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                        >
                            Deploy_Trigger
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export function AlertsPanel() {
    const { address } = useAccount();
    const [alerts, setAlerts] = useState<AlertRule[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [filter, setFilter] = useState<'ALL' | AlertStatus>('ALL');
    const [loading, setLoading] = useState(true);
    const { events: sseEvents, isConnected: sseConnected } = useWhaleStream();
    const seenSSEIds = useRef<Set<string>>(new Set());

    const refresh = async () => {
        setLoading(true);
        try {
            if (!address) { setAlerts([]); return; }
            const res = await fetch(`/api/alerts?address=${address}`);
            if (res.ok) {
                const data = await res.json();
                if (data.alerts) {
                    setAlerts(data.alerts.map((a: any) => ({
                        ...a,
                        status: a.enabled ? 'ACTIVE' : 'PAUSED',
                        type: a.conditionLogic || 'PRICE_ABOVE',
                        threshold: a.priceThreshold || 0,
                    })));
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { refresh(); }, [address]);

    const handleCreate = async (formData: any) => {
        if (!address) return toast.error('Identity Authentication Required');
        const tid = toast.loading('Synchronizing Cluster Rules...');
        try {
            const res = await fetch('/api/alerts', { 
                method: 'POST', 
                body: JSON.stringify({ 
                    name: formData.name,
                    metric: formData.asset,
                    condition: formData.type === 'PRICE_ABOVE' ? 'ABOVE' : 'BELOW',
                    threshold: parseFloat(formData.threshold),
                    address 
                }) 
            });
            if (res.ok) {
                toast.success('System Trigger Primed', { id: tid });
                refresh();
            } else {
                toast.error('Local Deployment Only // Backend Unavailable', { id: tid });
                // Fallback local persistence
                setAlerts(prev => [...prev, {
                    id: formData.id,
                    name: formData.name,
                    type: formData.type,
                    asset: formData.asset,
                    threshold: parseFloat(formData.threshold),
                    status: 'ACTIVE',
                    createdAt: new Date().toISOString(),
                    notifyTelegram: formData.telegram,
                    notifyEmail: formData.email,
                    notifyPush: formData.push
                }]);
            }
        } catch { toast.error('Network Synthesis Failure', { id: tid }); }
    };

    return (
        <div className="h-full w-full min-h-0 flex flex-col bg-black font-mono text-white overflow-hidden">
            {showCreate && <CreateAlertModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}

            {/* ── HEADER ── */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Bell size={18} className="text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Network_Triggers</span>
                        <span className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Autonomous Monitoring Core</span>
                    </div>
                </div>
                <button 
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                >
                    <Plus size={14} /> New_Rule
                </button>
            </div>

            {/* ── LIST ── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="grid grid-cols-1 gap-4">
                    {alerts.length === 0 && !loading && (
                        <div className="py-20 flex flex-col items-center justify-center opacity-10">
                            <Bell size={48} className="mb-4" />
                            <span className="text-[10px] font-black tracking-[0.5em]">No_Triggers_Detected</span>
                        </div>
                    )}
                    {alerts.map((alert, idx) => (
                        <motion.div 
                            key={alert.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border border-white/5 bg-white/[0.01] p-6 flex items-center justify-between group hover:border-white/10 transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-10 h-10 flex items-center justify-center border border-white/5 ${alert.status === 'ACTIVE' ? 'text-emerald-500' : 'text-white/20'}`}>
                                    {TYPE_CONFIG[alert.type]?.icon || <Bell size={14} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-black uppercase tracking-widest">{alert.name}</span>
                                        <span className={`text-[7px] font-black px-2 py-0.5 border ${
                                            alert.status === 'ACTIVE' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-white/10 text-white/20'
                                        }`}>
                                            {alert.status}
                                        </span>
                                    </div>
                                    <div className="text-[9px] text-white/40 mt-2 tracking-widest uppercase">
                                        {alert.asset} // {alert.type} // {alert.threshold.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-[8px] text-white/10 uppercase tracking-widest block mb-1">Created_At</span>
                                    <span className="text-white/40 text-[9px] font-mono">{new Date(alert.createdAt).toLocaleDateString()}</span>
                                </div>
                                <button className="p-3 text-white/10 hover:text-rose-500 transition-colors">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="px-8 py-3 border-t border-white/5 bg-white/[0.01] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4 text-[8px] text-white/20 uppercase tracking-[0.4em]">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${sseConnected ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        <span>Telemetry:_{sseConnected ? 'ENABLED' : 'OFFLINE'}</span>
                    </div>
                    <span>Cluster_Rules:_{alerts.length}</span>
                </div>
                <div className="text-[8px] text-white/10 uppercase tracking-[0.5em]">
                    Institutional_Monitoring_v3.1
                </div>
            </div>
        </div>
    );
}
