import React, { useEffect, useState } from 'react';
import { useSovereignAccount as useAccount } from '@/hooks/useSovereignAccount';
import { Activity, Skull, Zap, Crosshair, Database } from 'lucide-react';
import { useSniperStore } from '@/store/useSniperStore';
import { motion, AnimatePresence } from 'framer-motion';

// Sovereign Modules (High-Fidelity Genesis Implementation)
import RadarFeed from './RadarFeed';
import InstitutionalLedger from './InstitutionalLedger';
import SniperBrain from './SniperBrain';
import ExecutionDock from './ExecutionDock';

// High-Fidelity Genesis Categories
const GENESIS_CATEGORIES = [
  { id: 'consensus', label: 'Global Consensus', academic: 'Análisis del sentimiento macro estructural derivado de la agregación de datos on-chain globales.' },
  { id: 'terminal', label: 'Genesis Terminal', academic: 'Centro de orquestación de señales vitales y convergencia de métricas de red.' },
  { id: 'utxos', label: 'Observed UTXOs', academic: 'Mapeo determinista de la distribución BTC y reactivación de capital inactivo.' },
  { id: 'triggers', label: 'Network Triggers', academic: 'Umbrales críticos de gas y parámetros de red que activan respuestas tácticas.' },
  { id: 'mempool', label: 'Raw Mempool', academic: 'Inspección de baja latencia del área de espera transaccional para predicción de bloques.' },
  { id: 'visuals', label: 'Heuristic Visuals', academic: 'Representación geométrica de alta fidelidad para la comprensión de volúmenes.' },
  { id: 'contracts', label: 'Genesis Contracts', academic: 'Auditoría heurística de contratos inteligentes y flujos de ejecución.' },
  { id: 'entropy', label: 'Entropy Deltas', academic: 'Medición de la varianza térmica del mercado para detección de anomalías.' },
  { id: 'espionage', label: 'Crypto Espionage', academic: 'Agregación de inteligencia colectiva y filtrado de señales institucionales.' },
  { id: 'entity', label: 'Entity Heuristics', academic: 'Clasificación de entidades mediante comportamiento histórico y heurística on-chain.' },
  { id: 'cipher', label: 'Chronological Cipher', academic: 'Registro encriptado de hitos históricos de la cadena de bloques.' },
  { id: 'rpc', label: 'Direct RPC Terminal', academic: 'Consola de comunicación cruda con la topología de nodos de red.' },
  { id: 'zk_aztec', label: 'ZK Aztec Protocol', academic: 'Unificación de privacidad ZK-SNARKs y escalabilidad de segunda capa Aztec.' },
  { id: 'graph', label: 'Association Graph', academic: 'Visualización de interconexiones y flujo de valor entre protocolos.' },
  { id: 'id', label: 'Cryptographic ID', academic: 'Gestión inmutable de la identidad digital soberana.' },
  { id: 'capital', label: 'Sovereign Capital', academic: 'Gestión de activos, rendimientos y visor de flujo de capital institucional.' },
  { id: 'state', label: 'State Protocol', academic: 'Definición del estado operacional de protocolos críticos.' },
  { id: 'doctrine', label: 'Doctrine', academic: 'Principios fundamentales y protocolos de actuación del Terminal Génesis.' },
  { id: 'academy', label: 'Academy', academic: 'Motor educativo para el progreso en el dominio técnico on-chain.' },
  { id: 'primitives', label: 'Bitcoin Primitives', academic: 'Estudio de capas base, BRC-20, Runes y fundamentos de Bitcoin.' },
  { id: 'assist', label: 'Operator Assist', academic: 'Asistencia táctica impulsada por IA para soporte operacional.' },
  { id: 'vault', label: 'Vault Protocol', academic: 'Panel de custodia en almacenamiento frío y firmas institucionales.' },
  { id: 'clearance', label: 'Genesis Clearance', academic: 'Gestión de niveles de acceso y seguridad perimetral.' }
];

// Component Mapping for Perfection 3.1
import { TelemetryTerminal } from './TelemetryTerminal';
import { AlertsPanel } from './AlertsPanel';
import { SovereignVault } from './SovereignVault';
import { WhalePortfolio } from './WhalePortfolio';
import { ZKShieldStation } from './ZKShieldStation';
import SovereignIntelTab from './SovereignIntelTab';
import { ApiTerminal } from './ApiTerminal';
import { EntityGraphVis } from './EntityGraphVis';
import { WhaleAcademy } from './WhaleAcademy';
import { WhaleSupport } from './WhaleSupport';
import { CanvasEngine } from './CanvasEngine';
import GlobalConsensus from './GlobalConsensus';
import GenesisContracts from './GenesisContracts';
import CryptographicID from './CryptographicID';
import BitcoinPrimitives from './BitcoinPrimitives';

import { HeuristicEntropySim, EntityHeuristicSim, ChronoCipherSim, StateProtocolSim, DoctrineSim, ClearanceSim } from './CyberSimulators';

export default function WhaleSniperTerminal() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [isMobile, setIsMobile] = useState(false);
  const [tabLoading, setTabLoading] = useState(false); // New: Unified Transition Guard
  const { address, isConnected } = useAccount();
  const metrics = useSniperStore((state) => state.metrics);
  const setConnectionStatus = useSniperStore((state) => state.setConnectionStatus);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    setConnectionStatus(true);
    return () => {
      window.removeEventListener('resize', checkMobile);
      setConnectionStatus(false);
    };
  }, []);

  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    setTabLoading(true);
    // Academic/Computational buffer delay
    setTimeout(() => {
      setActiveTab(newTab);
      setTabLoading(false);
    }, 300);
  };

  const activeCategory = GENESIS_CATEGORIES.find(c => c.id === activeTab) || GENESIS_CATEGORIES[1];

  return (
    <div className="h-full w-full min-h-0 bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl text-[#050505] font-sans flex flex-col relative overflow-hidden shadow-sm selection:bg-[#050505] selection:text-[#FFFFFF] transform-gpu will-change-transform">
      
      {/* ── GENESIS STATUS BAR ── */}
      <header className="h-12 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between px-6 text-[10px] uppercase tracking-widest font-black shrink-0 relative z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#050505]/50">
            <Skull size={12} className={metrics.activeConnection ? "text-emerald-500" : "text-rose-500"} />
            <span>SOVEREIGN_GENESIS_V1</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#050505]/30">NETWORK:</span>
              <span className="text-emerald-600">ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#050505]/30">RPC_POOL:</span>
              <span className="text-[#050505]">ACTIVE_8</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#050505]/30">IDENTITY:</span>
            <span className={isConnected ? "text-emerald-600" : "text-rose-600"}>
              {isConnected ? "AUTHENTICATED" : "ANONYMOUS"}
            </span>
          </div>
          <span className="text-[#050505]/50">{address ? `${address.slice(0,8)}...` : '0x0000...'}</span>
        </div>
      </header>

      <main className={`flex-1 flex min-h-0 overflow-hidden ${isMobile ? 'flex-col' : 'flex-row'}`}>
        
        {/* ── TACTICAL CATEGORY SIDEBAR (Desktop Only) ── */}
        {!isMobile && (
          <nav className="w-64 border-r border-[#E5E5E5] bg-[#FAF9F6] flex flex-col min-h-0 shrink-0">
            <div className="p-4 border-b border-[#E5E5E5] bg-[#E5E5E5]/20 text-[9px] font-black tracking-[0.3em] text-[#050505]/40 uppercase">
              Directory_Index
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
              {GENESIS_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleTabChange(cat.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[10px] transition-all border ${
                    activeTab === cat.id 
                      ? "bg-[#050505]/5 border-[#050505]/10 text-[#050505] font-black shadow-sm" 
                      : "border-transparent text-[#050505]/40 hover:text-[#050505]/80 hover:bg-[#050505]/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{cat.label}</span>
                    {activeTab === cat.id && <div className="w-1.5 h-1.5 rounded-full bg-[#050505]" />}
                  </div>
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* ── CONTENT ENGINE ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Academic Definition Header */}
          <div className="px-6 md:px-8 py-5 border-b border-[#E5E5E5] bg-[#FFFFFF] shrink-0">
            <div className="text-[9px] md:text-[10px] text-[#050505]/30 uppercase tracking-[0.4em] mb-1 md:mb-2 text-center lg:text-left">Academic_Unit // {activeCategory.id}</div>
            <h1 className="text-lg md:text-xl font-black tracking-tight mb-1 md:mb-2 text-[#050505] text-center lg:text-left">{activeCategory.label}</h1>
            <p className="text-[10px] md:text-[11px] leading-relaxed font-medium text-[#050505]/50 max-w-3xl text-center lg:text-left mx-auto lg:mx-0">
              {activeCategory.academic}
            </p>
          </div>

          {/* Dynamic Module Rendering - Bounded to Zero-Scroll */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 md:p-6 flex flex-col relative bg-[#FAF9F6]">
            <AnimatePresence mode="wait">
              {tabLoading ? (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="h-full flex flex-col space-y-4"
                 >
                   <div className="h-8 w-1/4 bg-[#050505]/5 rounded-lg" />
                   <div className="flex-1 bg-[#050505]/5 border border-[#E5E5E5] rounded-2xl" />
                   <div className="h-12 w-full bg-[#050505]/5 rounded-lg" />
                 </motion.div>
              ) : (
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
                   className="h-full"
                 >
                {activeTab === 'consensus' && <GlobalConsensus />}
                 {activeTab === 'terminal' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                     <div className="border border-[#E5E5E5] bg-white p-6 rounded-xl shadow-sm">
                       <div className="text-[10px] text-[#888888] mb-4 tracking-[0.2em] uppercase font-bold">Telemetric Flow</div>
                       <RadarFeed />
                     </div>
                     <div className="flex flex-col gap-8">
                        <div className="flex-1 border border-[#E5E5E5] bg-white p-6 rounded-xl shadow-sm">
                           <div className="text-[10px] text-[#888888] mb-4 tracking-[0.2em] uppercase font-bold">Tactical Intelligence</div>
                           <SniperBrain />
                        </div>
                        <div className="h-[250px] border border-[#E5E5E5] bg-white p-6 rounded-xl shadow-sm">
                           <div className="text-[10px] text-[#888888] mb-4 tracking-[0.2em] uppercase font-bold">Execution Status</div>
                           <ExecutionDock />
                        </div>
                     </div>
                   </div>
                 )}
                {activeTab === 'utxos' && <InstitutionalLedger />}
                 {activeTab === 'triggers' && (
                   <div className="h-full border border-[#E5E5E5] bg-white p-6 overflow-hidden rounded-xl shadow-sm">
                     <AlertsPanel />
                   </div>
                 )}
                {activeTab === 'mempool' && <TelemetryTerminal nodes={[]} />}
                {activeTab === 'visuals' && <CanvasEngine />}
                {activeTab === 'contracts' && <GenesisContracts />}
                {activeTab === 'entropy' && <HeuristicEntropySim />}
                {activeTab === 'espionage' && <SovereignIntelTab />}
                {activeTab === 'entity' && <EntityHeuristicSim />}
                {activeTab === 'cipher' && <ChronoCipherSim />}
                {activeTab === 'rpc' && <ApiTerminal />}
                {activeTab === 'zk_aztec' && <ZKShieldStation />}
                {activeTab === 'graph' && <EntityGraphVis />}
                {activeTab === 'id' && <CryptographicID />}
                {activeTab === 'capital' && <WhalePortfolio />}
                {activeTab === 'state' && <StateProtocolSim />}
                {activeTab === 'doctrine' && <DoctrineSim />}
                {activeTab === 'academy' && <WhaleAcademy />}
                {activeTab === 'primitives' && <BitcoinPrimitives />}
                {activeTab === 'assist' && <WhaleSupport />}
                {activeTab === 'vault' && <SovereignVault />}
                {activeTab === 'clearance' && <ClearanceSim />}
                
                 {/* Fallback for components in heavy development */}
                 {!['terminal', 'utxos', 'triggers', 'mempool', 'visuals', 'espionage', 'rpc', 'zk_aztec', 'graph', 'capital', 'academy', 'assist', 'vault', 'consensus', 'contracts', 'id', 'primitives', 'entropy', 'entity', 'cipher', 'state', 'doctrine', 'clearance'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30">
                       <Database size={48} className="mb-4 text-[#050505]" />
                       <div className="text-[10px] font-bold tracking-widest uppercase text-[#888888]">Module Under Development</div>
                       <div className="text-[8px] mt-1 text-[#A0A0A0]">ACTIVE_TAB: {activeTab.toUpperCase()}</div>
                    </div>
                 )}
              </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── TACTICAL BOTTOM DOCK (Mobile Only) ── */}
        {isMobile && (
          <nav className="h-16 border-t border-[#E5E5E5] bg-white flex overflow-x-auto custom-scrollbar-hide items-center px-4 gap-2 z-50 shrink-0">
            {GENESIS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={`flex-none px-4 py-2 text-[9px] uppercase tracking-widest transition-all rounded-full border ${
                  activeTab === cat.id 
                    ? "bg-[#050505]/5 border-[#050505]/20 text-[#050505] font-bold" 
                    : "border-[#E5E5E5] text-[#888888]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        )}

      </main>
    </div>
  );
}

