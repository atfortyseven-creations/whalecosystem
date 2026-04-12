import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
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
import { SovereignIntelTab } from './SovereignIntelTab';
import { ApiTerminal } from './ApiTerminal';
import { EntityGraphVis } from './EntityGraphVis';
import { WhaleAcademy } from './WhaleAcademy';
import { WhaleSupport } from './WhaleSupport';
import { CanvasEngine } from './CanvasEngine';
import GlobalConsensus from './GlobalConsensus';
import GenesisContracts from './GenesisContracts';
import CryptographicID from './CryptographicID';
import BitcoinPrimitives from './BitcoinPrimitives';
import InstitutionalLedger from './InstitutionalLedger';

export default function WhaleSniperTerminal() {
  const [activeTab, setActiveTab] = useState('terminal');
  const { address, isConnected } = useAccount();
  const metrics = useSniperStore((state) => state.metrics);
  const setConnectionStatus = useSniperStore((state) => state.setConnectionStatus);

  useEffect(() => {
    setConnectionStatus(true);
    return () => setConnectionStatus(false);
  }, []);

  const activeCategory = GENESIS_CATEGORIES.find(c => c.id === activeTab) || GENESIS_CATEGORIES[1];

  return (
    <div className="min-h-screen bg-[#000000] text-[#FFFFFF] font-mono flex flex-col relative overflow-hidden selection:bg-[#fff] selection:text-[#000]">
      
      {/* ── GENESIS STATUS BAR ── */}
      <header className="h-10 border-b border-white/5 bg-[#000000] flex items-center justify-between px-6 text-[10px] uppercase tracking-widest font-bold z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white/40">
            <Skull size={12} className={metrics.activeConnection ? "text-emerald-500" : "text-rose-500"} />
            <span>SOVEREIGN_GENESIS_V1</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-white/20">NETWORK:</span>
              <span className="text-emerald-400">ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/20">RPC_POOL:</span>
              <span className="text-white">ACTIVE_8</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/20">IDENTITY:</span>
            <span className={isConnected ? "text-emerald-500" : "text-rose-500"}>
              {isConnected ? "AUTHENTICATED" : "ANONYMOUS"}
            </span>
          </div>
          <span className="text-white/20">{address ? `${address.slice(0,8)}...` : '0x0000...'}</span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* ── TACTICAL CATEGORY SIDEBAR ── */}
        <nav className="w-64 border-r border-white/5 bg-[#050505] flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-white/5 bg-black/40 text-[9px] font-black tracking-[0.3em] text-white/40 uppercase">
            Directory_Index
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {GENESIS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`w-full text-left px-3 py-2 text-[10px] transition-all border border-transparent ${
                  activeTab === cat.id 
                    ? "bg-white/5 border-white/10 text-emerald-400 font-bold" 
                    : "text-white/20 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{cat.label}</span>
                  {activeTab === cat.id && <div className="w-1 h-1 bg-emerald-400" />}
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* ── CONTENT ENGINE ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Academic Definition Header */}
          <div className="px-8 py-6 border-b border-white/5 bg-black/20 shrink-0">
            <div className="text-[10px] text-white/20 uppercase tracking-[0.4em] mb-2">Academic_Unit // {activeCategory.id}</div>
            <h1 className="text-xl font-bold tracking-tight mb-2 text-white/90">{activeCategory.label}</h1>
            <p className="text-[11px] leading-relaxed text-white/40 max-w-3xl">
              {activeCategory.academic}
            </p>
          </div>

          {/* Dynamic Module Rendering */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <AnimatePresence mode="wait">
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
                    <div className="border border-white/5 bg-white/[0.02] p-6">
                      <div className="text-[10px] text-white/20 mb-4 tracking-widest uppercase font-black">Telemetric_Flow</div>
                      <RadarFeed />
                    </div>
                    <div className="flex flex-col gap-8">
                       <div className="flex-1 border border-white/5 bg-white/[0.02] p-6">
                          <div className="text-[10px] text-white/20 mb-4 tracking-widest uppercase font-black">Tactical_Intelligence</div>
                          <SniperBrain />
                       </div>
                       <div className="h-[250px] border border-white/5 bg-white/[0.02] p-6">
                          <div className="text-[10px] text-white/20 mb-4 tracking-widest uppercase font-black">Execution_Status</div>
                          <ExecutionDock />
                       </div>
                    </div>
                  </div>
                )}
                {activeTab === 'utxos' && <InstitutionalLedger />}
                {activeTab === 'triggers' && (
                  <div className="h-full border border-white/5 bg-white/[0.02] p-6 overflow-hidden">
                    <AlertsPanel />
                  </div>
                )}
                {activeTab === 'mempool' && <TelemetryTerminal nodes={[]} />}
                {activeTab === 'visuals' && <CanvasEngine />}
                {activeTab === 'contracts' && <GenesisContracts />}
                {activeTab === 'espionage' && <SovereignIntelTab />}
                {activeTab === 'rpc' && <ApiTerminal />}
                {activeTab === 'zk_aztec' && <ZKShieldStation />}
                {activeTab === 'graph' && <EntityGraphVis />}
                {activeTab === 'id' && <CryptographicID />}
                {activeTab === 'capital' && <WhalePortfolio />}
                {activeTab === 'academy' && <WhaleAcademy />}
                {activeTab === 'primitives' && <BitcoinPrimitives />}
                {activeTab === 'assist' && <WhaleSupport />}
                {activeTab === 'vault' && <SovereignVault />}
                
                {/* Fallback for components in heavy development */}
                {!['terminal', 'utxos', 'triggers', 'mempool', 'visuals', 'espionage', 'rpc', 'zk_aztec', 'graph', 'capital', 'academy', 'assist', 'vault', 'consensus', 'contracts', 'id', 'primitives'].includes(activeTab) && (
                   <div className="flex flex-col items-center justify-center h-full opacity-20 filter grayscale">
                      <Skull size={48} className="mb-4" />
                      <div className="text-[10px] font-black tracking-widest uppercase text-white/40">Protocol_Layer_Handshake</div>
                      <div className="text-[8px] mt-1 text-white/20">AWAITING_INDEX_RESPONSE // {activeTab.toUpperCase()}</div>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
}

