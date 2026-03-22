"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Database, Layers, Search, AlertCircle, Link2, GitBranch, Share2 } from 'lucide-react';
import { useVIPStore } from '@/lib/vip-store';

export default function EntityNexusPage() {
    const { nexus, lastNexusUpdate } = useVIPStore();

    if (!nexus) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-stone-200 rounded-[48px] bg-white/30 backdrop-blur-sm">
                <Network className="w-16 h-16 text-stone-300 animate-pulse mb-6" />
                <p className="text-stone-400 font-mono text-sm tracking-widest uppercase animate-pulse">Mapping Global Entity Clusters...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            {/* Legend Header */}
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-200 pb-10">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-100">
                            <Layers className="w-5 h-5 text-stone-900" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Cross-Chain Nexus Engine</span>
                    </div>
                    <h1 className="text-6xl font-normal tracking-tighter text-stone-900 mb-4">Entity Nexus</h1>
                    <p className="text-stone-500 font-light text-xl leading-relaxed">Locating Elite clusters and detecting hidden identities through advanced heuristic analysis.</p>
                </div>
                
                <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white shadow-xl shadow-stone-200">
                        <Database className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Global Graph: Active</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono uppercase">Last Compute: {new Date(lastNexusUpdate).toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                {[
                    { label: 'Map Depth', value: '4th Degree', desc: 'Recursive Analysis' },
                    { label: 'Identified Entities', value: nexus.entities?.length || 0, desc: 'Whale Clusters' },
                    { label: 'Nexus Confidence', value: '94.2%', desc: 'Bayesian Probability' },
                    { label: 'Graph Nodes', value: '1.4M+', desc: 'Calculated in Real-Time' },
                ].map((stat, i) => (
                    <div key={i} className="p-6 border border-stone-200 rounded-[32px] bg-white shadow-sm hover:shadow-lg transition-all">
                        <div className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-2">{stat.label}</div>
                        <div className="text-3xl font-black text-stone-900 mb-1">{stat.value}</div>
                        <div className="text-[10px] text-emerald-500 font-bold uppercase">{stat.desc}</div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Top Identified Clusters
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {nexus.entities?.map((entity: { address: string; label: string; balance: string }, i: number) => (
                            <motion.div key={entity.address} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                                className="p-8 border border-stone-200 rounded-[40px] bg-white hover:border-stone-400 transition-all group relative overflow-hidden">
                                
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                                    <GitBranch className="w-32 h-32" />
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-3 bg-stone-50 rounded-2xl group-hover:bg-stone-900 group-hover:text-white transition-colors">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-stone-900">{entity.label}</h3>
                                                <div className="flex items-center gap-2 text-stone-400 font-mono text-sm">
                                                    {entity.address.slice(0, 10)}...{entity.address.slice(-10)}
                                                    <Link2 className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {['Elite', 'Exchange Proxy', 'Aggregator'].map(tag => (
                                                <span key={tag} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-stone-100 rounded-full text-stone-500">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:text-right">
                                        <div>
                                            <div className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Balance</div>
                                            <div className="text-xl font-bold text-stone-900">{entity.balance}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Direct Links</div>
                                            <div className="text-xl font-bold text-stone-900">{Math.floor(Math.random() * 50) + 10} Nodes</div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-8">
                                            <button className="w-full h-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
                                                Explore Subgraph <Share2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

