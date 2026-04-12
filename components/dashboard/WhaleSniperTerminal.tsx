import { Activity, Skull, Zap, Crosshair, Database } from 'lucide-react';
import { useSniperStore } from '@/store/useSniperStore';
import ContextMenu from '@/components/premium/ContextMenu';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// Modules
import RadarFeed from './RadarFeed';
import InstitutionalLedger from './InstitutionalLedger';
import SniperBrain from './SniperBrain';
import ExecutionDock from './ExecutionDock';

export default function WhaleSniperTerminal() {
  const [activeTab, setActiveTab] = React.useState<'radar' | 'ledger'>('radar');
  const { address, isConnected } = useAccount();
  const metrics = useSniperStore((state) => state.metrics);
  const setConnectionStatus = useSniperStore((state) => state.setConnectionStatus);
  const setArmed = useSniperStore((state) => state.setArmed);

  useEffect(() => {
    setConnectionStatus(true);
    return () => setConnectionStatus(false);
  }, []);

  const handleContextMenuAction = (actionId: string) => {
    switch (actionId) {
      case 'copy':
        if (address) {
          navigator.clipboard.writeText(address);
          toast.success('Address copied to clipboard.');
        } else {
          toast.error('No ID linked. Cannot copy.');
        }
        break;
      case 'trade':
        setArmed(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
    }
  };

  return (
    <ContextMenu onAction={handleContextMenuAction}>
     <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-mono selection:bg-[#fff] selection:text-[#000] flex flex-col relative overflow-hidden">
      
      {/* ── TOP NAV BAR (MILITARY THEME) ── */}
      <header className="h-10 border-b border-white/10 bg-black flex items-center justify-between px-6 text-[10px] uppercase tracking-widest font-black z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/50">
            <Skull size={12} className={metrics.activeConnection ? "text-emerald-500" : "text-rose-500"} />
            <span>WA-SNIPER-V1</span>
          </div>
          <span className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-white/30">RPC:</span>
            <span className={metrics.rpcStatus === 'HEALTHY' ? 'text-emerald-400' : 'text-rose-400'}>
              {metrics.rpcStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/30">LATENCY:</span>
            <span className="text-white">{metrics.wsLatencyMs}ms</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/30">STATUS:</span>
            {isConnected ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                ARMED
              </span>
            ) : (
              <span className="text-rose-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                DISCONNECTED
              </span>
            )}
          </div>
          <span className="w-px h-3 bg-white/10" />
          <span className="text-white/50">{address ? `${address.slice(0,6)}...${address.slice(-4)}` : 'UNKNOWN_SEC'}</span>
        </div>
      </header>

      {/* ── MAIN TERMINAL GRID (CSS GRID EXACT SPECS) ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_350px] lg:grid-rows-[1fr_auto] h-[calc(100vh-40px)] gap-px bg-white/10 p-px">
        
        {/* Module 1: RADAR / LEDGER SWITCHER */}
        <div className="bg-[#050505] lg:row-span-2 flex flex-col overflow-hidden relative group h-full">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 shrink-0 z-20">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab('radar')}
                className={`relative flex items-center gap-2 transition-colors py-1 ${activeTab === 'radar' ? "text-[#e0ff00]" : "text-white/20 hover:text-white/40"}`}
              >
                <Activity size={12} /> RADAR_STREAM
                {activeTab === 'radar' && (
                  <motion.div layoutId="tab-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#e0ff00]" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('ledger')}
                className={`relative flex items-center gap-2 transition-colors py-1 ${activeTab === 'ledger' ? "text-emerald-400" : "text-white/20 hover:text-white/40"}`}
              >
                <Database size={12} /> INSTITUTIONAL_LEDGER
                {activeTab === 'ledger' && (
                  <motion.div layoutId="tab-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-400" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-3">
               <span className="text-[8px] opacity-30">{activeTab === 'radar' ? 'HIGH_FREQ_MAPPING' : 'PERMANENT_RECORDS'}</span>
               <div className="w-1 h-1 bg-white/20 rounded-full" />
               <span className="text-white/20 tracking-[0.4em]">SOV-ALFA</span>
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden bg-black">
            <AnimatePresence mode="wait">
              {activeTab === 'radar' ? (
                <motion.div
                  key="radar"
                  initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                  className="absolute inset-0 overflow-y-auto custom-scrollbar"
                >
                  <RadarFeed />
                </motion.div>
              ) : (
                <motion.div
                  key="ledger"
                  initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                  className="absolute inset-0 overflow-y-auto custom-scrollbar"
                >
                  <InstitutionalLedger />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Module 2: SNIPER BRAIN */}
        <div className="bg-[#050505] flex flex-col border-b border-white/5 relative min-h-[350px] lg:min-h-0">
          <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#e0ff00]/60 shrink-0">
            <Crosshair size={12} /> TACTICAL_PARAMETERS
          </div>
          <div className="flex-1 relative">
             <div className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar">
                <SniperBrain />
             </div>
          </div>
        </div>

        {/* Module 3: EXECUTION DOCK */}
        <div className="bg-[#050505] flex flex-col relative overflow-hidden h-[300px] shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="px-4 py-2 border-b border-white/5 bg-black/40 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#e0ff00]/60 shrink-0">
            <Zap size={12} /> LETHAL_EXECUTION
          </div>
          <div className="flex-1 p-4 flex flex-col justify-end">
              <ExecutionDock />
          </div>
        </div>

      </main>
     </div>
    </ContextMenu>
  );
}
