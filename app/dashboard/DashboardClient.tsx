"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Terminal, Database, Sparkles, LayoutGrid, Flame, Shield, LockKeyhole, Plus, Settings2, ScanLine, Activity, CheckCircle2, X, ChevronRight, Server, Hexagon, ArrowLeft, Trash2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import ContextMenu from '@/components/premium/ContextMenu';

import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import { useMarketStore } from '@/store/useMarketStore';
import { useGodView } from '@/hooks/useGodView';
import { PremiumToasts } from '@/components/premium/ToastManager';
import { useAccount } from 'wagmi';
import { useWhaleFeed } from '@/hooks/useWhaleFeed';
import { toast } from 'sonner';

import LiquidationHeatmap from '@/components/premium/LiquidationHeatmap';
import AztecPrivacyHub from '@/components/premium/AztecPrivacyHub';

type NodeType = 'INTELLIGENCE_ROUTER' | 'SOVEREIGN_VAULT';
type InnerTab = 'telemetry' | 'environment' | 'metrics' | 'security' | 'zk_sync' | 'kernel';

interface ProjectNode {
    id: string;
    name: string;
    type: NodeType;
    status: 'deploying' | 'live';
    cpuUsage?: number;
    ramUsage?: number;
    uptime?: number;
    logs?: any[];
    trackedAsset?: string;
    dexFilter?: string;
}

export default function DashboardClient() {
  const [nodes, setNodes] = useState<ProjectNode[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [innerTab, setInnerTab] = useState<InnerTab>('telemetry');
  
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeType, setNewNodeType] = useState<NodeType>('INTELLIGENCE_ROUTER');
  const [newNodeAsset, setNewNodeAsset] = useState('ALL');

  const { isConnected, address } = useAccount();

  // Real features
  useGodView();
  useBinanceWebSocket('btcusdt');
  const currentPrice = useMarketStore(state => state.currentPrice);
  const { unifiedWhaleFeed } = useWhaleFeed();

  const [variables, setVariables] = useState<any[]>([]);

  // ZK Scanner State
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [isScannerPolling, setIsScannerPolling] = useState(false);
  const [scannerSuccess, setScannerSuccess] = useState(false);

  const fetchProjects = async () => {
    if (!address) return;
    try { 
        const res = await fetch(`/api/projects?wallet=${address}`); 
        const data = await res.json(); 
        const mappedNodes = data.map((p:any, i:number) => ({
            id: p.id,
            name: p.name,
            type: i % 2 === 0 ? 'INTELLIGENCE_ROUTER' : 'SOVEREIGN_VAULT',
            status: 'live',
            cpuUsage: p.cpuUsage,
            ramUsage: p.ramUsage,
            uptime: p.uptime,
            logs: p.logs || [],
            trackedAsset: p.trackedAsset || 'ALL',
            dexFilter: p.dexFilter || 'ALL'
        }));
        setNodes(mappedNodes);
    } catch(e){}
  };

  const fetchVariables = async () => {
    if (!address) return;
    try { const res = await fetch(`/api/variables?wallet=${address}`); setVariables(await res.json()); } catch(e){}
  };

  useEffect(() => {
    fetchProjects();
    fetchVariables();
  }, [address]);

  // PHASE 6: Heartbeat — poll /api/pulse every 5s to hydrate CPU/RAM/Uptime
  useEffect(() => {
    if (!address) return;
    const tick = setInterval(async () => {
      try {
        const res = await fetch(`/api/pulse?wallet=${address}`);
        if (!res.ok) return;
        const metrics: {id:string; cpuUsage:number; ramUsage:number; uptime:number}[] = await res.json();
        setNodes(prev => prev.map(n => {
          const m = metrics.find(x => x.id === n.id);
          if (!m) return n;
          return { ...n, cpuUsage: m.cpuUsage, ramUsage: m.ramUsage, uptime: m.uptime };
        }));
      } catch(_) {}
    }, 5000);
    return () => clearInterval(tick);
  }, [address]);

  // ZK Scanner Polling Logic
  useEffect(() => {
    if (innerTab === 'zk_sync' && activeNodeId && !qrSession && !scannerSuccess) {
        const initQr = async () => {
            try {
                const res = await fetch('/api/auth/qr-session', { method: 'POST' });
                const data = await res.json();
                if (data.sessionId) { setQrSession(data.sessionId); setIsScannerPolling(true); }
            } catch(e) {}
        };
        initQr();
    }
  }, [innerTab, activeNodeId, qrSession, scannerSuccess]);

  useEffect(() => {
      if (!isScannerPolling || !qrSession) return;
      const interval = setInterval(async () => {
          try {
              const res = await fetch(`/api/auth/qr-session?id=${qrSession}`);
              const data = await res.json();
              if (data.status === 'complete') {
                  clearInterval(interval);
                  setScannerSuccess(true);
                  setIsScannerPolling(false);
              } else if (data.status === 'expired' || data.status === 'error') {
                  clearInterval(interval);
                  setQrSession(null);
                  setIsScannerPolling(false);
              }
          } catch (e) {}
      }, 2000);
      return () => clearInterval(interval);
  }, [isScannerPolling, qrSession]);

  const handleDeployNode = async () => {
    if(!newNodeName || !address) return;
    setIsDeployModalOpen(false);
    const tempId = 'temp-' + Date.now();
    setNodes(prev => [...prev, { id: tempId, name: newNodeName, type: newNodeType, status: 'deploying' }]);
    
    try {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newNodeName, wallet: address, trackedAsset: newNodeAsset })
        });
        
        if (!res.ok) {
            setNodes(prev => prev.filter(n => n.id !== tempId));
            toast.error("Deployment Failed: Database synchronization required.");
            return;
        }

        setNewNodeName("");
        
        // Simulate deployment time for immersion
        setTimeout(() => {
            fetchProjects();
        }, 1500);
    } catch (e) {
        setNodes(prev => prev.filter(n => n.id !== tempId));
        toast.error("Network Error during deployment.");
    }
  };

  const handleDeleteNode = async (id: string) => {
    if(id.startsWith('temp') || !address) return;
    setActiveNodeId(null);
    setNodes(prev => prev.filter(n => n.id !== id));
    await fetch(`/api/projects/${id}?wallet=${address}`, { method: 'DELETE' });
    fetchProjects();
  };

  const activeNode = nodes.find(n => n.id === activeNodeId);

  return (
    <ContextMenu>
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#e0ff00] selection:text-black flex flex-col relative overflow-hidden">
        
        {/* Railway Canvas Background */}
        <div className="absolute inset-0 bg-[#080808]">
            <div className="absolute inset-0 bg-[url('https://railway.app/illustrations/grid.svg')] bg-center opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[#e0ff00]/5 via-[#0a051a]/50 to-transparent blur-3xl -z-10" />
        </div>
        
        {/* Canvas Toolbar */}
        <div className="relative z-10 w-full h-16 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8">
             <div className="flex items-center gap-4">
                 <div className="w-8 h-8 rounded-lg bg-[#e0ff00]/10 border border-[#e0ff00]/30 flex items-center justify-center">
                     <Hexagon size={16} className="text-[#e0ff00]" />
                 </div>
                 <span className="font-bold text-sm tracking-widest uppercase">Ecosystem Canvas</span>
             </div>
             
             <button 
                onClick={() => setIsDeployModalOpen(true)}
                className="bg-white hover:bg-gray-200 text-black px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl"
             >
                <Plus size={16} /> Deploy Architecture
             </button>
        </div>

        {/* Dynamic Canvas Area */}
        <main className="flex-1 relative z-10 p-12 overflow-y-auto no-scrollbar">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 transition-all duration-700 ${activeNodeId ? 'w-[calc(100%-600px)] opacity-50 blur-sm pointer-events-none scale-95 origin-left' : 'w-full'}`}>
                {nodes.map(node => (
                    <motion.div 
                        layoutId={`node-${node.id}`}
                        key={node.id} 
                        onClick={() => {
                            if (node.status === 'deploying') return;
                            setActiveNodeId(node.id);
                            setInnerTab(node.type === 'INTELLIGENCE_ROUTER' ? 'telemetry' : 'security');
                        }}
                        className={`group p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-2xl ${node.status === 'deploying' ? 'bg-white/5 border-dashed border-white/20' : 'bg-[#111] border-white/10 hover:border-[#e0ff00]/50 hover:-translate-y-1'}`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-xl ${node.type === 'INTELLIGENCE_ROUTER' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                {node.type === 'INTELLIGENCE_ROUTER' ? <Server size={20} /> : <Shield size={20} />}
                            </div>
                            {node.status === 'live' ? (
                                <div className="flex items-center gap-2 text-[10px] font-mono text-[#e0ff00] bg-[#e0ff00]/10 px-2 py-1 rounded-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#e0ff00] animate-pulse" /> LIVE
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-[10px] font-mono text-white/50 bg-white/5 px-2 py-1 rounded-md">
                                    <Activity size={12} className="animate-spin" /> DEPLOYING
                                </div>
                            )}
                        </div>
                        
                        <h3 className="font-bold text-lg mb-1 tracking-tight truncate">{node.name}</h3>
                        <p className="text-xs text-white/40 font-mono mb-6">{node.id.split('-')[0].toUpperCase()}</p>

                        <div className="flex items-center gap-3 border-t border-white/5 pt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                            {node.type === 'INTELLIGENCE_ROUTER' ? (
                                <>
                                   <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/60"><Terminal size={12} /> Telecom</div>
                                   <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/60"><Flame size={12} /> Metrics</div>
                                </>
                            ) : (
                                <>
                                   <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/60"><LockKeyhole size={12} /> ZK Vault</div>
                                   <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-white/60"><ScanLine size={12} /> Auth API</div>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
                
                {nodes.length === 0 && (
                    <div className="col-span-full h-64 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/30 hover:text-white/60 hover:border-white/30 transition-all cursor-pointer" onClick={() => setIsDeployModalOpen(true)}>
                        <Plus size={40} className="mb-4" />
                        <p className="font-bold uppercase tracking-widest text-sm">Deploy First Architecture</p>
                    </div>
                )}
            </div>
        </main>

        {/* Sliding Context Drawer (The "Inside" of a Node) */}
        <AnimatePresence>
            {activeNode && (
                <motion.div 
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute top-16 right-0 bottom-0 w-full md:w-[600px] lg:w-[800px] bg-[#0c0c0c] border-l border-white/10 shadow-2xl z-40 flex flex-col"
                >
                    <header className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
                        <div className="flex items-center gap-6">
                            <button onClick={() => setActiveNodeId(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-xl font-black mb-1 flex flex-wrap items-center gap-3">
                                    {activeNode.name}
                                    <span className="text-[9px] font-mono bg-[#e0ff00]/10 text-[#e0ff00] px-2 py-0.5 rounded-sm border border-[#e0ff00]/30 tracking-widest uppercase">Live Metrics</span>
                                </h2>
                                <p className="text-xs text-white/60 font-mono flex flex-wrap items-center gap-2">
                                    <span>{activeNode.id.split('-')[0]}</span>
                                    <span className="text-white/20">|</span>
                                    <span className="text-cyan-400">CPU: {(activeNode.cpuUsage || 0.0).toFixed(1)}%</span>
                                    <span className="text-white/20">|</span>
                                    <span className="text-purple-400">RAM: {(activeNode.ramUsage || 0.0).toFixed(1)}GB</span>
                                    <span className="text-white/20">|</span>
                                    <span className="text-emerald-400">UP: {activeNode.uptime || 0}s</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => handleDeleteNode(activeNode.id)} className="p-2 text-red-500/50 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </header>

                    {/* Node Inner Navigation */}
                    <div className="px-8 border-b border-white/5 flex gap-6 overflow-x-auto no-scrollbar bg-black/20">
                        {activeNode.type === 'INTELLIGENCE_ROUTER' ? (
                            <>
                                <InnerTabBtn active={innerTab==='telemetry'} onClick={()=>setInnerTab('telemetry')} icon={Terminal} label="Live Telemetry" />
                                <InnerTabBtn active={innerTab==='kernel'} onClick={()=>setInnerTab('kernel')} icon={Database} label="System Logs" />
                                <InnerTabBtn active={innerTab==='metrics'} onClick={()=>setInnerTab('metrics')} icon={Flame} label="Liquidation Heatmap" />
                                <InnerTabBtn active={innerTab==='environment'} onClick={()=>setInnerTab('environment')} icon={Settings2} label="Env Vault" />
                            </>
                        ) : (
                            <>
                                <InnerTabBtn active={innerTab==='security'} onClick={()=>setInnerTab('security')} icon={Shield} label="Aztec Privacy Hub" />
                                <InnerTabBtn active={innerTab==='zk_sync'} onClick={()=>setInnerTab('zk_sync')} icon={ScanLine} label="ZK Sync Gateway" />
                            </>
                        )}
                    </div>

                    {/* Node Inner Content */}
                    <div className="flex-1 overflow-y-auto bg-[#050505] p-6 custom-scrollbar relative">
                        {innerTab === 'kernel' && (
                            <div className="h-full flex flex-col bg-[#080808] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="p-4 border-b border-white/10 bg-black flex items-center justify-between text-[11px] font-mono text-emerald-400">
                                    <span className="flex items-center gap-2">KERNEL_LINK // {activeNode.id}</span>
                                    <span className="flex items-center gap-2 animate-pulse"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> SYNCED</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-[11px] text-white/60">
                                    {(activeNode.logs || []).map((log:any) => (
                                        <div key={log.id} className="flex flex-col border-b border-white/5 pb-3">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-emerald-500 font-bold">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                                                <span className="text-white/20 bg-white/5 px-2 py-0.5 rounded text-[9px] uppercase tracking-widest">{log.source}</span>
                                            </div>
                                            <span className="text-white/90 leading-relaxed">{log.message}</span>
                                        </div>
                                    ))}
                                    {(!activeNode.logs || activeNode.logs.length === 0) && (
                                        <div className="text-white/30 italic flex h-full items-center justify-center">No operational logs found in DB.</div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {innerTab === 'telemetry' && (
                            <div className="h-full flex flex-col bg-black border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                                <div className="p-3 border-b border-white/10 bg-white/5 flex items-center justify-between text-[11px] font-mono text-[#e0ff00]">
                                    <span className="flex items-center gap-2"><Terminal size={12}/> WSS://WHALE.NETWORK/STREAM</span>
                                    <span className="flex items-center gap-2 animate-pulse"><div className="w-1.5 h-1.5 bg-[#e0ff00] rounded-full"/> RECEIVING</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                                     {unifiedWhaleFeed.slice(0, 100).map(log => (
                                         <motion.div initial={{opacity:0, x:-5}} animate={{opacity:1, x:0}} key={log.id} className="flex flex-col gap-1 border-b border-white/5 pb-3">
                                             <div className="flex items-center justify-between">
                                                <span className="text-cyan-400">[{new Date(log.timestamp).toISOString().split('T')[1].slice(0,-1)}]</span>
                                                <span className={log.action === 'SELL' ? 'text-red-400' : log.action === 'BUY' ? 'text-emerald-400' : 'text-[#e0ff00]'}>[{log.chain}] {log.action}</span>
                                             </div>
                                             <div className="text-white">Detected transfer: <span className="font-bold">{log.amount.toLocaleString(undefined, {maximumFractionDigits: 1})} {log.asset}</span> <span className="text-white/40">(${log.usdNum.toLocaleString()})</span></div>
                                             <div className="text-white/20 truncate text-[9px]">HASH: {log.hash}</div>
                                         </motion.div>
                                     ))}
                                     {unifiedWhaleFeed.length === 0 && <div className="h-full flex items-center justify-center text-white/30 animate-pulse">Awaiting cross-chain telemetry blocks...</div>}
                                </div>
                            </div>
                        )}

                        {innerTab === 'metrics' && (
                            <div className="h-full">
                                <LiquidationHeatmap />
                            </div>
                        )}

                        {innerTab === 'environment' && (
                            <div className="space-y-4">
                                <div className="p-5 border border-[#e0ff00]/20 bg-[#e0ff00]/5 rounded-2xl flex gap-4 text-sm font-medium text-[#e0ff00]">
                                    <LockKeyhole size={20} className="shrink-0" />
                                    These variables are injected natively into the router execution context. Modifying them requires root signature.
                                </div>
                                {variables.map(v => (
                                    <div key={v.id} className="flex gap-4 items-center bg-black/40 p-4 rounded-xl border border-white/5">
                                        <span className="text-white/40 font-mono text-xs w-1/3 truncate">{v.key}</span>
                                        <input type="password" disabled value={v.value} className="bg-transparent text-white font-mono text-xs outline-none flex-1 opacity-50 select-none" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {innerTab === 'security' && (
                             <AztecPrivacyHub />
                        )}

                        {innerTab === 'zk_sync' && (
                            <div className="h-full flex flex-col items-center justify-center py-12">
                               {scannerSuccess ? (
                                   <div className="text-center space-y-6 flex flex-col items-center">
                                       <div className="w-20 h-20 rounded-full bg-[#e0ff00]/20 flex items-center justify-center border border-[#e0ff00] shadow-[0_0_30px_rgba(224,255,0,0.3)]">
                                           <CheckCircle2 size={32} className="text-[#e0ff00]" />
                                       </div>
                                       <div>
                                           <h3 className="text-2xl font-black uppercase italic tracking-tighter text-[#e0ff00]">Sync Established</h3>
                                           <p className="text-xs text-white/50 font-sans mt-2">Mobile node linked to active Sovereign Vault.</p>
                                       </div>
                                   </div>
                               ) : (
                                  <>
                                      <div className="text-center space-y-3 max-w-sm mb-10">
                                         <h3 className="text-xl font-black uppercase italic tracking-tighter">Live Mobile Auth</h3>
                                         <p className="text-xs text-white/40 font-sans leading-relaxed">Open Sovereign Companion on your mobile device and scan this live API endpoint to link your session natively.</p>
                                      </div>
          
                                      <div className="w-64 h-64 border-2 border-dashed border-white/20 rounded-[2rem] flex items-center justify-center relative bg-black/50 p-6 shadow-2xl">
                                          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-[1.5rem] m-4" />
                                          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-[1.5rem] m-4" />
                                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-[1.5rem] m-4" />
                                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-[1.5rem] m-4" />
                                          
                                          <div className="bg-white p-3 rounded-2xl shadow-xl w-full h-full flex items-center justify-center">
                                             {qrSession ? (
                                                 <QRCodeSVG value={qrSession} size={180} level="H" fgColor="#000000" bgColor="#ffffff" />
                                             ) : (
                                                 <div className="text-[9px] font-mono text-black/40 uppercase text-center animate-pulse">Negotiating Handshake...</div>
                                             )}
                                          </div>
                                      </div>
                                  </>
                               )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Deploy New Architecture Modal */}
        <AnimatePresence>
            {isDeployModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-black tracking-tight text-white">Deploy Architecture</h3>
                            <button onClick={() => setIsDeployModalOpen(false)} className="text-white/40 hover:text-white transition-colors"><X size={24} /></button>
                        </div>
                        <div className="p-8 space-y-8">
                            
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/50">Select Node Protocol</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setNewNodeType('INTELLIGENCE_ROUTER')} className={`p-6 rounded-2xl border text-left transition-all ${newNodeType === 'INTELLIGENCE_ROUTER' ? 'bg-[#e0ff00]/5 border-[#e0ff00]/50 shadow-[0_0_30px_rgba(224,255,0,0.1)]' : 'bg-black/50 border-white/5 hover:border-white/20 hover:bg-black'}`}>
                                        <Server size={24} className={`mb-4 ${newNodeType === 'INTELLIGENCE_ROUTER' ? 'text-[#e0ff00]' : 'text-white/40'}`} />
                                        <div className="font-bold text-sm mb-1 text-white">Intelligence Router</div>
                                        <div className="text-xs text-white/40 leading-relaxed">Deploys an active WebSocket telemetry listener and real-time biometric Heatmap node.</div>
                                    </button>
                                    
                                    <button onClick={() => setNewNodeType('SOVEREIGN_VAULT')} className={`p-6 rounded-2xl border text-left transition-all ${newNodeType === 'SOVEREIGN_VAULT' ? 'bg-[#C056DD]/5 border-[#C056DD]/50 shadow-[0_0_30px_rgba(192,86,221,0.1)]' : 'bg-black/50 border-white/5 hover:border-white/20 hover:bg-black'}`}>
                                        <Shield size={24} className={`mb-4 ${newNodeType === 'SOVEREIGN_VAULT' ? 'text-[#C056DD]' : 'text-white/40'}`} />
                                        <div className="font-bold text-sm mb-1 text-white">Sovereign Vault</div>
                                        <div className="text-xs text-white/40 leading-relaxed">Deploys an Aztec Privacy Hub instance connected to the ZK Identity Sync Gateway.</div>
                                    </button>
                                </div>
                            </div>

                            {newNodeType === 'INTELLIGENCE_ROUTER' && (
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/50">Intelligence Target <span className="text-[#e0ff00]">/</span> Asset Filter</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['ALL','ETH','BTC','USDT','BNB','SOL'].map(asset => (
                                        <button key={asset} onClick={() => setNewNodeAsset(asset)}
                                            className={`py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${newNodeAsset === asset ? 'bg-[#e0ff00]/10 border-[#e0ff00]/50 text-[#e0ff00] shadow-[0_0_20px_rgba(224,255,0,0.1)]' : 'bg-black/50 border-white/5 text-white/40 hover:border-white/20 hover:text-white/70'}`}
                                        >{asset}</button>
                                    ))}
                                </div>
                            </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/50">Instance Name</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    className="w-full bg-black/50 border border-white/10 focus:border-white/30 rounded-xl px-5 py-4 text-white text-lg font-mono outline-none transition-all placeholder:text-white/20"
                                    placeholder="e.g. WHALE-ORACLE-ALPHA"
                                    value={newNodeName}
                                    onChange={e => setNewNodeName(e.target.value)}
                                />
                            </div>

                        </div>
                        <div className="px-8 py-5 border-t border-white/5 bg-black/40 flex justify-end gap-3">
                            <button onClick={() => setIsDeployModalOpen(false)} className="px-6 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white transition-colors">Cancel</button>
                            <button 
                                onClick={handleDeployNode} 
                                disabled={!newNodeName.trim()}
                                className="bg-white text-black px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Execute Protocol
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </div>
      <PremiumToasts />
    </ContextMenu>
  );
}

function InnerTabBtn({ active, onClick, icon: Icon, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`py-4 px-2 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap text-[11px] font-black uppercase tracking-widest ${active ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/80'}`}
        >
            <Icon size={14} className={active ? '' : 'opacity-50'}/> {label}
        </button>
    );
}

function Camera(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2-2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> }
