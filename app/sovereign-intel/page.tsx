"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalletStore } from '@/lib/store/wallet-store';
import { Search, Activity, ArrowUpRight, Zap, Target, Lock, LayoutGrid, Terminal } from 'lucide-react';
import { toast } from 'sonner';
import { LogMonitor } from '@/components/shared/LogMonitor';

export default function ExplorerPage() {
  const { address: sovereignAddress } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState<string | null>(sovereignAddress || null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [view, setView] = useState<'EXPLORER' | 'TELEMETRY'>('EXPLORER');

  const fetchTransactions = async (addr: string) => {
    if (!addr) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/transactions?userId=${addr}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to sync network records.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sovereignAddress && !hasSearched) {
      fetchTransactions(sovereignAddress);
      setSearchQuery(sovereignAddress);
    }
  }, [sovereignAddress, hasSearched]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setAddress(searchQuery);
    fetchTransactions(searchQuery);
  };

  const truncate = (s: string) => s ? `${s.slice(0, 8)}...${s.slice(-6)}` : '';

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-black font-sans selection:bg-black/10">
      <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Activity className="text-black" size={20} />
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold">On-Chain Intel</span>
          </div>

          <div className="h-4 w-px bg-black/10 mx-2" />

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('EXPLORER')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === 'EXPLORER' ? 'bg-black text-white' : 'hover:bg-black/5 text-black/40'}`}
            >
              <LayoutGrid size={12} />
              Explorer
            </button>
            <button 
              onClick={() => setView('TELEMETRY')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${view === 'TELEMETRY' ? 'bg-black text-white' : 'hover:bg-black/5 text-black/40'}`}
            >
              <Terminal size={12} />
              Telemetry
            </button>
          </div>
        </div>
        {sovereignAddress && (
            <div className="font-mono text-[10px] text-black/40 tracking-widest bg-black/5 px-3 py-1.5 rounded-full border border-black/5">
            Node: {truncate(sovereignAddress)}
            </div>
        )}
      </nav>

      <main className="relative pt-32 pb-24 px-6 max-w-4xl mx-auto z-10 flex flex-col gap-16">
        {view === 'EXPLORER' ? (
          <>
            <header className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black tracking-tight text-black uppercase italic"
              >
                Network <span className="text-black/20">Explorer</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="font-mono text-xs font-bold text-black/40 mt-4 max-w-lg mx-auto uppercase tracking-widest leading-relaxed"
              >
                Direct index querying. Input any cryptographic address to verify historical network activity and settlement flows.
              </motion.p>
            </header>

            <motion.form 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                onSubmit={handleSearch} 
                className="relative w-full max-w-2xl mx-auto"
            >
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-white border border-black/10 rounded-2xl py-5 pl-14 pr-32 font-mono text-sm outline-none focus:ring-2 focus:ring-black/5 transition-all shadow-sm"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                <button 
                    type="submit" 
                    disabled={loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    {loading ? 'Scanning...' : 'Search'}
                </button>
            </motion.form>

            <AnimatePresence mode="wait">
                {address && hasSearched && !loading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        key={address}
                        className="border border-black/10 bg-white shadow-sm rounded-3xl p-6 md:p-10 mb-8"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-black/5 gap-8">
                            <div className="flex-1">
                                <h3 className="font-mono text-[10px] uppercase tracking-widest text-black/40 mb-2">Target Address</h3>
                                <div className="text-lg font-mono font-bold break-all">{address}</div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-8 md:gap-12 shrink-0">
                                <div className="text-right">
                                    <h3 className="font-mono text-[10px] uppercase tracking-widest text-black/40 mb-2">Records</h3>
                                    <div className="text-2xl font-black">{transactions.length}</div>
                                </div>
                                
                                {(() => {
                                    const totalVolume = transactions.reduce((sum, tx) => sum + (parseFloat(tx.fromAmount) || 0), 0);
                                    
                                    const tokenCounts: Record<string, number> = {};
                                    let maxToken = "N/A";
                                    let maxCount = 0;
                                    
                                    transactions.forEach(tx => {
                                        if (tx.fromToken) {
                                            tokenCounts[tx.fromToken] = (tokenCounts[tx.fromToken] || 0) + 1;
                                            if (tokenCounts[tx.fromToken] > maxCount) {
                                                maxCount = tokenCounts[tx.fromToken];
                                                maxToken = tx.fromToken;
                                            }
                                        }
                                    });

                                    return (
                                        <>
                                            <div className="text-right">
                                                <h3 className="font-mono text-[10px] uppercase tracking-widest text-black/40 mb-2">Volume</h3>
                                                <div className="text-2xl font-black">{totalVolume > 0 ? totalVolume.toFixed(2) : "0.00"}</div>
                                            </div>
                                            <div className="text-right">
                                                <h3 className="font-mono text-[10px] uppercase tracking-widest text-black/40 mb-2">Dominant Asset</h3>
                                                <div className="text-2xl font-black">{maxToken}</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {transactions.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {transactions.map((tx: any, i: number) => (
                                    <div key={tx.hash || i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl bg-black/5 border border-transparent hover:border-black/10 transition-colors gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-black/10 shadow-sm">
                                                {tx.type === 'SEND' ? <ArrowUpRight className="text-black" size={18} /> : <Zap className="text-black" size={18} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm tracking-wide">{tx.type}</span>
                                                <span className="text-[10px] text-black/40 font-mono mt-1">{truncate(tx.hash || '0xUNKNOWN')}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-black text-black">
                                                {tx.type === 'SEND' ? '-' : '+'}{tx.fromAmount} <span className="text-sm opacity-50">{tx.fromToken}</span>
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${tx.status === 'SUCCESS' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {tx.status || 'FINALIZED'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 px-6 border-2 border-dashed border-black/10 rounded-2xl bg-black/5">
                                <Target size={32} className="opacity-20 mx-auto mb-4" />
                                <p className="font-mono text-xs font-bold uppercase tracking-widest text-black/40 mb-2">NO RECORDS FOUND</p>
                                <p className="text-sm text-black/30 font-medium max-w-sm mx-auto">This address has no historical execution trace on the queried indices.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-[600px]"
          >
            <LogMonitor />
          </motion.div>
        )}

      </main>
    </div>
  );
}
