import React from 'react';
import { Activity, Zap, Database, ArrowUpRight, ArrowDownLeft, Shield, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export const CSSiPhoneFrame = () => {
    return (
        <div className="relative mx-auto w-[320px] h-[650px] bg-slate-50 rounded-[3rem] border-[14px] border-slate-950 shadow-2xl overflow-hidden flex flex-col font-sans">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 inset-x-0 h-7 w-32 bg-slate-950 mx-auto rounded-b-3xl z-30 flex justify-between items-center px-4">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
            
            {/* Status Bar */}
            <div className="h-12 w-full flex justify-between items-end px-6 pb-2 text-[10px] font-bold text-slate-950 z-20 relative">
                <span>9:41</span>
                <div className="flex gap-1.5 items-center">
                    <div className="w-4 h-3 rounded-sm bg-slate-950" />
                    <div className="w-4 h-3 rounded-sm bg-slate-950" />
                    <div className="w-6 h-3 rounded-sm bg-slate-950" />
                </div>
            </div>

            {/* Content Area - Realistic Whale Activity Feed */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative px-5 flex flex-col gap-6 pt-4 pb-20 bg-slate-50">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-white shadow-lg">
                            <Shield size={18} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Epoch 4</div>
                            <h3 className="text-xl font-black tracking-tighter text-slate-950 leading-none">Whale Feed</h3>
                        </div>
                    </div>
                </div>

                {/* Heatmap Simulation */}
                <div className="bg-slate-950 rounded-3xl p-5 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Heatmap</span>
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-2 row-span-2 bg-emerald-500/20 border border-emerald-500/50 rounded-xl p-3 flex flex-col justify-end min-h-[100px]">
                            <span className="text-white font-black text-lg">BTC</span>
                            <span className="text-emerald-400 text-[10px] font-bold">+2.45%</span>
                        </div>
                        <div className="col-span-1 row-span-2 bg-rose-500/20 border border-rose-500/50 rounded-xl p-3 flex flex-col justify-end">
                            <span className="text-white font-black text-xs">ETH</span>
                            <span className="text-rose-400 text-[10px] font-bold">-1.20%</span>
                        </div>
                        <div className="col-span-1 row-span-1 bg-cyan-500/20 border border-cyan-500/50 rounded-xl p-2 flex flex-col justify-end">
                            <span className="text-white font-black text-[10px]">SOL</span>
                        </div>
                        <div className="col-span-1 row-span-1 bg-purple-500/20 border border-purple-500/50 rounded-xl p-2 flex flex-col justify-end">
                            <span className="text-white font-black text-[10px]">BNB</span>
                        </div>
                    </div>
                </div>

                {/* Live Transactions */}
                <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Live Transactions</span>
                    {[
                        { type: 'BUY', amount: '1,500', asset: 'ETH', value: '$4.2M', from: '0x8f...2a', icon: <ArrowUpRight size={14} className="text-emerald-500" />, bg: 'bg-emerald-50' },
                        { type: 'SELL', amount: '840', asset: 'BTC', value: '$56.1M', from: 'Binance', icon: <ArrowDownLeft size={14} className="text-rose-500" />, bg: 'bg-rose-50' },
                        { type: 'BUY', amount: '2.5M', asset: 'SOL', value: '$350K', from: '0x1a...9b', icon: <ArrowUpRight size={14} className="text-emerald-500" />, bg: 'bg-emerald-50' },
                    ].map((tx, i) => (
                        <div key={i} className="p-3 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                            <div className="flex gap-3 items-center">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.bg}`}>
                                    {tx.icon}
                                </div>
                                <div>
                                    <div className="text-sm font-black font-mono tracking-tighter">{tx.amount} <span className="text-[10px] text-slate-500 font-bold">{tx.asset}</span></div>
                                    <div className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">{tx.from}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-black text-slate-950 font-mono tracking-tighter">{tx.value}</div>
                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{tx.type}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-6 z-20 rounded-b-[2.5rem]">
                <div className="flex flex-col items-center gap-1 text-slate-950">
                    <Globe size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Network</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-300">
                    <Activity size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-300">
                    <Database size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Portfolio</span>
                </div>
            </div>
        </div>
    );
};

export const CSSMacbookFrame = () => {
    return (
        <div className="relative mx-auto w-full max-w-4xl font-sans perspective-1000 mt-10">
            {/* Screen Assembly */}
            <motion.div 
                initial={{ rotateX: 10 }}
                whileInView={{ rotateX: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ transformStyle: 'preserve-3d', transformOrigin: "bottom" }}
                className="relative z-20"
            >
                {/* Thin Bezel Screen */}
                <div className="aspect-[16/10] bg-slate-950 rounded-t-3xl border-[12px] border-slate-950 shadow-2xl overflow-hidden relative flex flex-col">
                    {/* Webcam notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-xl z-30 flex justify-center items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        <div className="w-1 h-1 rounded-full bg-indigo-500/30 ml-2" />
                    </div>
                    
                    {/* Fake Browser/App Menu Bar */}
                    <div className="h-6 w-full bg-slate-900/50 flex items-center px-4 gap-4 z-20 text-[10px] text-slate-400 font-bold border-b border-slate-800">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                        <div className="flex gap-4 ml-4">
                            <span>File</span><span>Edit</span><span>View</span><span>Analytics</span>
                        </div>
                    </div>

                    {/* Realistic Dashboard Layout */}
                    <div className="flex-1 bg-slate-50 flex overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-48 bg-white border-r border-slate-100 flex flex-col pt-6 pb-4 px-3 shadow-sm z-10">
                            <div className="flex items-center gap-2 px-2 mb-8">
                                <div className="w-6 h-6 rounded bg-slate-950 flex items-center justify-center text-white"><Database size={12}/></div>
                                <span className="font-black text-xs tracking-tight">WHALE ALERT</span>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="px-3 py-2 bg-slate-950 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Activity size={12} /> Live Feed
                                </div>
                                <div className="px-3 py-2 text-slate-500 hover:bg-slate-50 flex items-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    <Globe size={12} /> Network
                                </div>
                                <div className="px-3 py-2 text-slate-500 hover:bg-slate-50 flex items-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    <Shield size={12} /> Portfolio
                                </div>
                            </div>

                            <div className="mt-auto px-3 py-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[9px]">ID</div>
                                <div>
                                    <div className="text-[9px] font-black font-mono">0x4F...92</div>
                                    <div className="text-[8px] text-slate-400 uppercase font-black">Connected</div>
                                </div>
                            </div>
                        </div>

                        {/* Main Stage */}
                        <div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden relative">
                            {/* Top Stats */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-black text-slate-950 tracking-tighter leading-none mb-1">Global Liquidity</h1>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Real-time Whale Protocol Tracking</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">Filter: 24H</div>
                                    <div className="px-4 py-2 bg-slate-950 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">New Scan</div>
                                </div>
                            </div>

                            {/* Info Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Total Volume", value: "$4.2B", color: "text-indigo-600" },
                                    { label: "Active Whales", value: "1,240", color: "text-emerald-600" },
                                    { label: "Network Pulse", value: "99.9%", color: "text-cyan-600" }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                        <span className={`text-2xl font-black tracking-tighter font-mono ${stat.color}`}>{stat.value}</span>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{stat.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Chart Area */}
                            <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-sm p-4 flex flex-col">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Volume Momentum</span>
                                <div className="flex-1 flex items-end gap-2 px-4 pb-2">
                                    {/* CSS Fake Bar Chart */}
                                    {[40, 60, 45, 80, 50, 90, 75, 40, 60, 45, 80, 50].map((h, i) => (
                                        <div key={i} className="flex-1 bg-slate-100 rounded-t-sm relative group hover:bg-slate-200 transition-colors" style={{ height: `${h}%` }}>
                                            <div className={`absolute bottom-0 inset-x-0 bg-indigo-500 rounded-t-sm transition-all duration-1000 ${i === 5 ? 'bg-emerald-500' : ''}`} style={{ height: `${h * 0.7}%` }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Keyboard Deck & Trackpad */}
            <div className="relative z-10 w-[110%] -ml-[5%] perspective-deck">
                <div className="h-6 bg-gradient-to-b from-slate-200 to-slate-400 rounded-b-2xl shadow-2xl relative flex flex-col items-center">
                    <div className="w-[80%] h-2 bg-slate-300 rounded-b-md mx-auto" />
                    {/* Trackpad Hint */}
                     <div className="w-24 h-1 absolute bottom-1 bg-slate-400/30 rounded-full" />
                </div>
                {/* Lip Shadow */}
                <div className="absolute -bottom-10 inset-x-10 h-10 bg-black/20 blur-2xl rounded-full" />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .perspective-deck {
                    transform: perspective(600px) rotateX(15deg) translateY(-5px);
                    transform-origin: top;
                }
            `}} />
        </div>
    );
};
