"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Shield, Zap, AlertTriangle, Activity } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';

const ALERT_COLOR = {
    CRITICAL: 'border-red-500/40 bg-red-500/5 text-red-100',
    HIGH: 'border-orange-500/40 bg-orange-500/5 text-orange-100',
    WATCH: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-100',
    NORMAL: 'border-white/5 bg-white/[0.02] text-white/30',
};

export default function SatoshiPage() {
    const { satoshiWallets: wallets, lastSatoshiUpdate } = useVIPStore();

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="w-full">
            
            <div className="mb-10 border-b border-stone-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-stone-900 rounded-lg shadow-xl shrink-0">
                            <Crown className="w-5 h-5 text-yellow-500" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Ancient Capital Tracking</span>
                    </div>
                    <h1 className="text-5xl font-normal tracking-tighter text-stone-900 mb-2">Satoshi Detector</h1>
                    <p className="text-stone-500 font-light max-w-xl text-lg">Monitoring of historical and dormant wallets from the Bitcoin genesis era. Maximum alert for movements from legendary whales.</p>
                </div>
                
                <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-2 px-3 py-1 rounded-full border border-stone-200 bg-white/50 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Genesis Scan</span>
                    </div>
                    <div className="text-[9px] text-stone-400 font-mono uppercase">Sync: {new Date(lastSatoshiUpdate).toLocaleTimeString()}</div>
                </div>
            </div>

            {wallets.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-32 border-2 border-dashed border-stone-100 rounded-[48px] bg-stone-50/50">
                    <Activity className="w-12 h-12 text-stone-200 animate-pulse mb-6" />
                    <p className="text-stone-400 font-mono text-sm uppercase tracking-widest animate-pulse">Scanning Satoshi era transactions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {wallets.map((wallet, i) => (
                            <motion.div key={wallet.address} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                className={`p-8 rounded-[40px] border shadow-sm hover:shadow-2xl transition-all group bg-white hover:border-stone-400 ${
                                    wallet.alertLevel === 'CRITICAL' ? 'border-l-8 border-l-red-500' : 
                                    wallet.alertLevel === 'HIGH' ? 'border-l-8 border-l-orange-500' : 
                                    'border-l-8 border-stone-200'
                                }`}>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`p-3 rounded-2xl ${
                                                wallet.alertLevel === 'CRITICAL' ? 'bg-red-50 text-red-600' : 
                                                wallet.alertLevel === 'HIGH' ? 'bg-orange-50 text-orange-600' : 
                                                'bg-stone-50 text-stone-400'
                                            }`}>
                                                {wallet.alertLevel === 'CRITICAL' ? <AlertTriangle className="w-6 h-6" /> : wallet.alertLevel === 'HIGH' ? <Zap className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-xl font-black text-stone-900 uppercase tracking-tight">{wallet.alertLevel} Status</span>
                                                    {wallet.isSatoshiEra && <span className="px-3 py-1 bg-yellow-400 text-stone-900 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">Genesis Era</span>}
                                                </div>
                                                <div className="font-mono text-stone-400 text-xs truncate max-w-sm group-hover:text-stone-900 transition-colors">{wallet.address}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                            <div>
                                                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Balance BTC</div>
                                                <div className="text-2xl font-black text-stone-900">{wallet.btcBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })} BTC</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Inactivity</div>
                                                <div className="text-2xl font-black text-stone-900">{wallet.yearsInactive} Years</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Primer Bloque</div>
                                                <div className="text-2xl font-black text-stone-900">{new Date(wallet.firstSeenDate).getFullYear()}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Transactions</div>
                                                <div className="text-2xl font-black text-stone-900">{wallet.txCount}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="shrink-0 flex md:flex-col items-center gap-3">
                                        <button className="px-6 py-3 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                            Deep Intelligence
                                        </button>
                                        <a href={`https://www.blockchain.com/explorer/addresses/btc/${wallet.address}`} target="_blank" rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest border-b border-transparent hover:border-stone-900">
                                            Explorer ↗
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}

