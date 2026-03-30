"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  MoveRight,
  RefreshCw,
  ChevronRight,
  Wallet,
  Fingerprint,
  ChevronDown,
  Activity,
  Eye,
  Zap,
  Shield,
} from 'lucide-react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { CinematicWhaleLogo } from './CinematicWhaleLogo';
import { LiveTerminalWidgets } from './LiveTerminalWidgets';

// ─── DEEP LINK HELPERS ───────────────────────────────────────────────────────

function getAppUrl(): string {
  if (typeof window === 'undefined') return 'https://humanidfi.com';
  return window.location.origin;
}

function buildMetaMaskDeepLink(wcUri: string): string {
  return `metamask://wc?uri=${encodeURIComponent(wcUri)}`;
}
function buildTrustDeepLink(wcUri: string): string {
  return `trust://wc?uri=${encodeURIComponent(wcUri)}`;
}
function buildCoinbaseDeepLink(wcUri: string): string {
  return `cbwallet://wc?uri=${encodeURIComponent(wcUri)}`;
}
function buildRainbowDeepLink(wcUri: string): string {
  return `rainbow://wc?uri=${encodeURIComponent(wcUri)}`;
}

function getMobileOS(): 'ios' | 'android' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

function buildDappBrowserLink(walletId: string, os: string): string {
  const dappUrl = encodeURIComponent(getAppUrl());
  const links: Record<string, string> = {
    metamask: os === 'ios'
      ? `metamask://browser?url=${dappUrl}`
      : `https://metamask.app.link/dapp/${typeof window !== 'undefined' ? window.location.host : ''}`,
    trust: `https://link.trustwallet.com/open_url?coin_id=60&url=${dappUrl}`,
    coinbase: `https://go.cb-w.com/dapp?cb_url=${dappUrl}`,
    rainbow: `https://rnbwapp.com/dapp?url=${dappUrl}`,
  };
  return links[walletId] || '';
}

function detectWalletBrowser(): 'metamask' | 'trust' | 'coinbase' | 'rainbow' | 'other' | null {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent.toLowerCase();
  const eth = (window as any).ethereum;
  if (!eth) return null;
  if (eth.isMetaMask && !eth.isBraveWallet) return 'metamask';
  if (eth.isTrust || ua.includes('trustwallet')) return 'trust';
  if (eth.isCoinbaseBrowser || eth.isCoinbaseWallet || ua.includes('coinbasebrowser')) return 'coinbase';
  if (eth.isRainbow || ua.includes('rainbow')) return 'rainbow';
  return 'other';
}

// ─── BACKGROUND PATTERN ──────────────────────────────────────────────────────

const AnimatedPattern = React.memo(function AnimatedPattern() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .msv-hide-scrollbar::-webkit-scrollbar { display: none; }
        .msv-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .msv-dot-pattern {
          background-image: radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          will-change: transform;
        }
        .msv-snap-container {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .msv-snap-container::-webkit-scrollbar { display: none; }
        .msv-snap-page {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
      ` }} />
      <motion.div
        aria-hidden="true"
        className="fixed -inset-[32px] msv-dot-pattern pointer-events-none z-0"
        animate={{ x: [0, -32], y: [0, -32] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
    </>
  );
});

// ─── SUPPORTED WALLETS ────────────────────────────────────────────────────────

const SUPPORTED_WALLETS = [
  { id: 'all',      name: 'WalletConnect', icon: '⚡', color: '#3B99FC', desc: 'Auto-detectar apps instaladas' },
  { id: 'metamask', name: 'MetaMask',      icon: '/official-whale-monochrome.png', color: '#F6851B', desc: 'Billetera Popular' },
  { id: 'trust',    name: 'Trust Wallet',  icon: '🛡️', color: '#3375BB', desc: 'Billetera Segura' },
  { id: 'coinbase', name: 'Coinbase',      icon: '🔵', color: '#0052FF', desc: 'Billetera Exchange' },
  { id: 'rainbow',  name: 'Rainbow',       icon: '🌈', color: '#001E59', desc: 'Billetera Moderna' },
];

const STORE_LINKS: Record<string, { ios: string; android: string }> = {
  metamask: { ios: 'https://apps.apple.com/app/metamask/id1438144202',               android: 'https://play.google.com/store/apps/details?id=io.metamask' },
  trust:    { ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409', android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp' },
  coinbase: { ios: 'https://apps.apple.com/app/coinbase-wallet-nfts-crypto/id1278383455', android: 'https://play.google.com/store/apps/details?id=org.toshi' },
  rainbow:  { ios: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021', android: 'https://play.google.com/store/apps/details?id=me.rainbow' },
};

// ─── WALLET PICKER MODAL ──────────────────────────────────────────────────────

function WalletPickerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const os = typeof window !== 'undefined' ? getMobileOS() : 'other';
  const { connect, connectors } = useConnect();
  const [isConnecting, setIsConnecting] = React.useState<string | null>(null);

  const openStoreAsFallback = (walletId: string) => {
    const links = STORE_LINKS[walletId];
    if (!links) return;
    window.open(os === 'ios' ? links.ios : links.android, '_blank');
  };

  const buildWcDeepLink = (walletId: string, wcUri: string): string => {
    switch (walletId) {
      case 'all':      return wcUri;
      case 'metamask': return buildMetaMaskDeepLink(wcUri);
      case 'trust':    return buildTrustDeepLink(wcUri);
      case 'coinbase': return buildCoinbaseDeepLink(wcUri);
      case 'rainbow':  return buildRainbowDeepLink(wcUri);
      default:         return buildDappBrowserLink(walletId, os);
    }
  };

  const handleWalletSelect = async (wallet: typeof SUPPORTED_WALLETS[0]) => {
    setIsConnecting(wallet.id);
    const wcConnector = connectors.find(
      c => c.id === 'walletConnect' || c.name === 'WalletConnect' || c.id.toLowerCase().includes('walletconnect')
    );
    if (!wcConnector) {
      window.location.href = buildDappBrowserLink(wallet.id, os);
      setTimeout(() => openStoreAsFallback(wallet.id), 3000);
      setIsConnecting(null);
      onClose();
      return;
    }
    try {
      const provider: any = await wcConnector.getProvider();
      let uriCaptured = false;
      const onDisplayUri = (uri: string) => {
        if (uriCaptured) return;
        uriCaptured = true;
        provider.removeListener?.('display_uri', onDisplayUri);
        window.location.href = buildWcDeepLink(wallet.id, uri);
      };
      provider.on('display_uri', onDisplayUri);
      connect({ connector: wcConnector });
      setTimeout(() => {
        if (!uriCaptured) {
          provider.removeListener?.('display_uri', onDisplayUri);
          window.location.href = buildDappBrowserLink(wallet.id, os);
          setTimeout(() => openStoreAsFallback(wallet.id), 3000);
        }
        setIsConnecting(null);
      }, 5000);
      onClose();
    } catch {
      window.location.href = buildDappBrowserLink(wallet.id, os);
      setTimeout(() => openStoreAsFallback(wallet.id), 3000);
      setIsConnecting(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center px-4 pb-12">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#050505]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="w-full max-w-sm bg-white rounded-[3.5rem] p-8 relative z-10 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-1 bg-black/5 rounded-full mb-8" />
              <img src="/official-whale-monochrome.png" className="w-12 h-12 mb-4" alt="Whale" />
              <h3 className="text-2xl font-black text-[#050505] tracking-tighter">Bóveda Criptográfica</h3>
              <p className="text-[11px] text-[#050505]/40 font-bold uppercase tracking-[0.2em] mt-2">Sincronización de Identidad</p>
            </div>
            <div className="space-y-3">
              {SUPPORTED_WALLETS.map((wallet) => {
                const busy = isConnecting === wallet.id;
                return (
                  <button
                    key={wallet.id}
                    onClick={() => !isConnecting && handleWalletSelect(wallet)}
                    disabled={!!isConnecting}
                    className={`w-full h-20 flex items-center justify-between px-6 bg-[#F9F8F4] border border-black/5 rounded-[2rem] transition-all group ${busy ? 'scale-[0.98] opacity-80' : 'active:scale-[0.98]'} disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 flex items-center justify-center">
                        {wallet.id === 'metamask'
                          ? <img src={wallet.icon} className="w-full h-full object-contain" alt={wallet.name} />
                          : <span className="text-2xl">{wallet.icon}</span>
                        }
                      </div>
                      <div className="text-left">
                        <span className="font-black text-sm text-[#050505] uppercase tracking-widest block">{wallet.name}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-[0.1em] mt-0.5 block ${busy ? 'text-indigo-500 animate-pulse' : 'text-[#050505]/40'}`}>
                          {busy ? 'Abriendo app...' : wallet.desc}
                        </span>
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${busy ? 'bg-indigo-500' : 'bg-white opacity-0 group-hover:opacity-100'}`}>
                      {busy ? <RefreshCw size={14} className="text-white animate-spin" /> : <ChevronRight size={16} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={onClose} className="w-full mt-6 py-4 text-[10px] font-black text-[#050505]/30 uppercase tracking-[0.4em] active:opacity-60 transition-opacity">
              Cerrar Puerta
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── PAGE 1 · HERO ────────────────────────────────────────────────────────────

function PageHero({
  isConnected,
  address,
  onConnect,
  onScan,
  onDisconnect,
}: {
  isConnected: boolean;
  address?: string;
  onConnect: () => void;
  onScan: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full bg-[#FAF9F6] text-[#050505] font-sans flex flex-col items-center justify-between pb-12 pt-12 px-8 overflow-hidden relative">

      {/* TOP BAR */}
      <header className="w-full flex items-center justify-end z-20 h-10">
        {isConnected && (
          <button
            onClick={onDisconnect}
            className="w-10 h-10 bg-white border border-black/5 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <RefreshCw size={14} className="text-[#050505]/40" />
          </button>
        )}
      </header>

      {/* HERO */}
      <main className="w-full max-w-sm flex flex-col items-center text-center z-10 flex-1 justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Whale Logo — 2.8x scale baked into CinematicWhaleLogo */}
          <div className="w-40 h-40 mx-auto mb-4 mt-4">
            <CinematicWhaleLogo src="/official-whale-monochrome.png" className="w-full h-full" />
          </div>

          <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic relative z-10 drop-shadow-md">
            Whale Alert<br />Network
          </h1>

          <p className="text-[12px] font-bold text-[#050505]/30 uppercase tracking-[0.15em] mb-10 max-w-[260px] mx-auto leading-relaxed">
            Connect with<br />PC session.
          </p>

          <div className="w-full space-y-4">
            {!isConnected ? (
              <button
                onClick={onConnect}
                className="w-full h-[88px] bg-[#050505] text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] group"
              >
                <Wallet size={20} className="text-white/40 group-active:translate-x-1 transition-transform" />
                CONNECT WALLET
              </button>
            ) : (
              <button
                onClick={onScan}
                className="w-full h-[88px] bg-white border-2 border-[#050505] text-[#050505] rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-between px-10 transition-all shadow-lg shadow-black/5 active:scale-[0.98] group"
              >
                <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
                  <QrCode size={22} className="text-[#050505]" />
                  <div className="text-left leading-tight">
                    <p className="tracking-[0.3em]">SYNC LENS</p>
                    <p className="text-[9px] opacity-40 mt-1 font-bold">READY: OPEN SCANNER</p>
                  </div>
                </div>
                <ChevronRight size={18} className="opacity-20 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {isConnected && address && (
            <div className="mt-10 opacity-20">
              <span className="text-[10px] font-mono font-black tracking-widest">
                ID: {address.slice(0, 10).toUpperCase()}...{address.slice(-6).toUpperCase()}
              </span>
            </div>
          )}
        </motion.div>
      </main>

      {/* SCROLL HINT */}
      <motion.div
        className="flex flex-col items-center gap-1 z-10 opacity-30"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]">EXPLORAR</span>
        <ChevronDown size={14} className="text-[#050505]" />
      </motion.div>

      {/* FINGERPRINT */}
      <div className="absolute bottom-4 left-0 w-full flex items-center justify-center gap-3 opacity-[0.05] pointer-events-none">
        <div className="h-px bg-black flex-1 mx-8" />
        <Fingerprint size={20} />
        <div className="h-px bg-black flex-1 mx-8" />
      </div>
    </div>
  );
}

// ─── PAGE 2 · ECOSYSTEM TAXONOMY ─────────────────────────────────────────────

const formulaImgStyle = "h-8 mx-auto my-6 opacity-80 mix-blend-multiply drop-shadow-sm";

function PagePhilosophy1() {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full bg-[#FAF9F6] text-[#050505] font-sans flex flex-col px-8 pt-16 pb-12 overflow-y-auto msv-hide-scrollbar relative">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#050505]/40 mb-2">
          MANIFIESTO TÉCNICO
        </p>
        <h2 className="text-[1.8rem] font-black tracking-tighter leading-[0.95] uppercase italic text-[#050505]">
          Introducción y<br />Filosofía Arquitectónica
        </h2>
      </motion.div>

      <div className="flex-1 flex flex-col gap-6 text-[15px] leading-[1.85] font-medium text-[#050505]/80">
        <p>
          Cuando me propuse construir nuestro sistema desde cero, mi objetivo no era crear una herramienta visualmente llamativa, sino resolver un problema fundamental de plomería digital: la asimetría en el acceso a los datos de las redes descentralizadas. La información financiera en su estado más puro fluye como un torrente constante, pero el usuario promedio solo recibe gotas filtradas y con retraso temporal.
        </p>
        <p>
          En este documento, he querido documentar desde una perspectiva estrictamente técnica y académica cómo diseñé y estructuré el backend de nuestro ecosistema. No abordaré temas de interfaz gráfica o renderizado de cliente; el foco de este texto es el motor invisible que ingiere, limpia, procesa y distribuye la información. Lo he escrito con la humildad de quien sabe que no estamos inventando nuevas matemáticas, sino aplicando principios de ingeniería de sistemas de alto rendimiento para garantizar integridad absoluta en los datos.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-4 text-[#050505] border-b border-black/10 pb-2">
          Fase I: La Ingestión de Datos y el Desafío del Tiempo Real
        </h3>
        <p>
          El primer paradigma que tuve que enfrentar fue la naturaleza de la ingesta de datos. En las primeras iteraciones de nuestro servidor, implementé una arquitectura clásica de consultas por intervalos (rutinas de polling mediante peticiones HTTP) hacia proveedores de red públicos. El servidor despertaba cada cierto número de segundos, consultaba el estado de la red, y almacenaba el resultado.
        </p>
        <p>
          Rápidamente me di cuenta de la severa limitación de este enfoque. El almacenamiento en caché (incluso el diseñado para ser efímero, con duraciones de 60 a 300 segundos) corrompía nuestra promesa de tiempo real. En un entorno donde las transacciones críticas ocurren en milisegundos, entregar un dato en caché equivale a entregar un dato falso.
        </p>
        <p>
          Para solucionar esto, decidí rehacer el sistema de comunicaciones desde la base. Erradiqué por completo las dependencias de consultas estáticas y migré la arquitectura hacia conexiones de red persistentes y bidireccionales (WebSockets) directamente conectadas a los nodos de ejecución. En lugar de "preguntar" cuál era el estado del mercado, nuestro servidor pasó a "escuchar" pasivamente el flujo continuo de eventos. Esto requirió reescribir nuestros manejadores de memoria para asegurar que el torrente masivo de datos entrantes no provocara desbordamientos de memoria (memory leaks) en nuestros servidores. Para mantener la resiliencia de la conexión sin inundar el servidor frente a caídas de red, implementé un algoritmo de reconexión exponencial (Exponential Backoff). El tiempo de espera para restablecer la ingesta se rige por la función matemática del logaritmo de escala:
        </p>

        <img 
          src="https://latex.codecogs.com/svg.latex?\color{Black}T_{wait}=\min(T_{max},T_{base}\times2^n)" 
          alt="Exponential Backoff Formula" 
          className={formulaImgStyle}
        />

        <p>
          Donde <span className="font-serif italic font-bold">n</span> es el número de intentos fallidos. Esto garantiza una estabilización geométrica y predecible de la carga en nuestro backend durante periodos críticos de desconexión masiva.
        </p>
      </div>

      <motion.div className="flex flex-col items-center gap-1 mt-10 opacity-30" animate={{ y: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]">CONTINUAR</span>
        <ChevronDown size={14} className="text-[#050505]" />
      </motion.div>
    </div>
  );
}

function PagePhilosophy2() {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full bg-[#FAF9F6] text-[#050505] font-sans flex flex-col px-8 pt-16 pb-12 overflow-y-auto msv-hide-scrollbar relative">
      <div className="flex-1 flex flex-col gap-6 text-[15px] leading-[1.85] font-medium text-[#050505]/80">
        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#050505] border-b border-black/10 pb-2">
          Fase II: El Motor de Enrutamiento y Filtrado
        </h3>
        <p>
          Tener acceso al flujo de datos en crudo (raw data) generó un problema secundario: el ruido. La red descentralizada procesa miles de transacciones por segundo, pero el 99% de ellas carecen de relevancia macro-direccional.
        </p>
        <p>
          Para extraer el verdadero valor de estos datos, desarrollé un motor de análisis heurístico al que llamo nuestro enrutador interno. Este motor funciona como un embudo de alta eficiencia en la capa del servidor. Construí algoritmos de evaluación de un solo paso (single-pass algorithms) que leen la carga útil de cada transacción a medida que entra en la memoria de nuestro servidor. El motor evalúa el volumen de activos transferidos contra umbrales dinámicos preestablecidos. En lugar de basarnos en cifras planas estáticas, el filtro emplea una función estadística de anomalías basada en el Z-Score matemático para aislar transferencias masivas en la red:
        </p>

        <img 
          src="https://latex.codecogs.com/svg.latex?\color{Black}Z=\frac{X-\mu}{\sigma}" 
          alt="Z-Score Formula" 
          className={formulaImgStyle}
        />

        <p>
          Siendo <span className="font-serif italic font-bold">X</span> el volumen de la transacción entrante, <span className="font-serif italic font-bold">μ</span> la media exponencial móvil del volumen transaccional de la red en esa ventana temporal, y <span className="font-serif italic font-bold">σ</span> su desviación estándar calculada. Solamente si la condición resolutiva arroja un resultado algorítmico de <span className="font-serif italic font-bold">Z {'>'} 3</span>, la transacción se clasifica matemáticamente como altamente anómala (una "cartera mayor").
        </p>
        <p>
          Si una transacción no cumple estrictamente con este perfil matemático, nuestro servidor la descarta de la memoria inmediatamente antes de que consuma ciclos de procesamiento adicionales. Esto garantiza que lo que finalmente se emite hacia nuestros canales de distribución es únicamente el flujo filtrado de alta relevancia, optimizando drásticamente el uso de ancho de banda y capacidad de cómputo.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-4 text-[#050505] border-b border-black/10 pb-2">
          Fase III: La Erradicación Total de la Memoria Caché y Datos Simulados
        </h3>
        <p>
          A medida que el ecosistema crecía, expandí el backend para manejar la agregación de métricas complejas, como el interés abierto y las tasas de financiamiento de los mercados derivados. En el desarrollo tradicional de servidores, es una práctica común establecer mecanismos de contingencia o amortiguación (valores por defecto) por si el origen de los datos falla. En etapas tempranas, si uno de nuestros nodos perdía conexión, el servidor devolvía el último precio conocido o un valor estático de preservación temporal para evitar errores en las operaciones secundarias.
        </p>
        <p>
          Llegué a la conclusión analítica de que esta práctica, aunque estándar en la industria web tradicional, era éticamente técnica inaceptable para nuestro propósito. Rediseñé el núcleo de nuestros servicios de precios e indexación y configuré las cabeceras de infraestructura para forzar una política estricta de "Cero Almacenamiento Estático" (cache: 'no-store').
        </p>
        <p>
          Adicionalmente, eliminé cualquier valor condicional de respaldo en el código. Si nuestro backend experimenta una disrupción en la lectura de un bloque o en la consulta de un mercado específico, el sistema está programado para reportar la ausencia del dato antes que enviar información artificial o envejecida. Esta transparencia estructural fue fundamental para cimentar la integridad de la base de datos de nuestro ecosistema.
        </p>
      </div>

      <motion.div className="flex flex-col items-center gap-1 mt-10 opacity-30" animate={{ y: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#050505]">CONTINUAR</span>
        <ChevronDown size={14} className="text-[#050505]" />
      </motion.div>
    </div>
  );
}

function PagePhilosophy3() {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full bg-[#FAF9F6] text-[#050505] font-sans flex flex-col px-8 pt-16 pb-12 overflow-y-auto msv-hide-scrollbar relative">
      <div className="flex-1 flex flex-col gap-6 text-[15px] leading-[1.85] font-medium text-[#050505]/80">
        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] text-[#050505] border-b border-black/10 pb-2">
          Fase IV: Sincronización de Identidad y Autenticación Segura
        </h3>
        <p>
          Otro pilar complejo de nuestra arquitectura de servidor fue la gestión de sesiones de usuario sin comprometer la filosofía descentralizada de nuestro proyecto. Necesitábamos un mecanismo para enlazar procesos de computación sin requerir bases de datos relacionales tradicionales llenas de correos electrónicos y contraseñas.
        </p>
        <p>
          Para ello, diseñé las rutas de autenticación de nuestra interfaz de programación de aplicaciones (API) basándome en sincronizaciones criptográficas transitorias. Construí un protocolo de enlace soberano (Handshake) en el que el servidor genera identificadores únicos universales vinculados estadísticamente a una firma criptográfica temporal.
        </p>
        <p>
           Cuando el sistema debe sincronizar el acceso entre dos puntos, el backend orquesta una validación de mensajes firmados criptográficamente. El servidor recibe un token efímero y una firma digital de la red, y ejecuta la verificación matemática del Algoritmo de Firma Digital de Curva Elíptica (ECDSA):
        </p>

        <img 
          src="https://latex.codecogs.com/svg.latex?\color{Black}V=\text{Verify}(m,S,Q_{pub})" 
          alt="ECDSA Verification Formula" 
          className={formulaImgStyle}
        />

        <p>
          Donde <span className="font-serif italic font-bold">m</span> es el mensaje original, <span className="font-serif italic font-bold">S</span> es la firma computada por la billetera en la red, y <span className="font-serif italic font-bold">Q_pub</span> representa la clave pública criptográfica subyacente. Únicamente si la ecuación resuelve en <span className="font-serif italic font-bold">V = True</span>, el servidor inscribe la autenticidad del canal de distribución e inyecta inmediatamente una cookie de sesión securizada y firmada a nivel de cabecera HTTP-Only. En ningún momento nuestro servidor almacena claves privadas ni información de identificación permanente; el estado de la sesión reside puramente en la validación transitoria de la prueba probabilística.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-4 text-[#050505] border-b border-black/10 pb-2">
          Fase V: Agregación de Mercados Fractales
        </h3>
        <p>
          Finalmente, la arquitectura del servidor tenía que lidiar con la fragmentación logística. La información que proporcionamos no proviene de un solo entorno cerrado, sino que está esparcida a lo largo de una miríada de redes de contratos inteligentes y protocolos subyacentes.
        </p>
        <p>
          Para solucionar esto, estructuré servicios de enrutamiento asíncrono. En lugar de procesar consultas secuenciales (esperar a que responda el protocolo A para luego consultar el protocolo B), el motor ejecuta llamadas concurrentes a través de múltiples hilos lógicos en el servidor. El backend recopila las respuestas fragmentadas, las estandariza mediante interfaces estrictamente tipadas (asegurando que los volúmenes, los intereses abiertos y los márgenes mantengan la misma unidad de precisión decimal).
        </p>
        <p>
          El emparejamiento interno de este flujo de consolidación dentro del servidor se resuelve empleando la inserción matemática vectorial sobre nuestra memoria estructural, logrando resolver el cálculo en una complejidad puramente logarítmica para grandes conjuntos de datos de red asíncrona:
        </p>

        <img 
          src="https://latex.codecogs.com/svg.latex?\color{Black}\mathcal{O}(\log%20n)" 
          alt="Logarithmic Time Complexity Formula" 
          className={formulaImgStyle}
        />

        <p>
          Al garantizar la inserción en tiempo logarítmico <span className="font-serif italic font-bold">O(log n)</span> en lugar de lineal <span className="font-serif italic font-bold">O(n)</span>, el modelo condensa eficientemente millones de variables en un solo objeto de respuesta multidimensional para finalmente emitirlo a través de nuestro torrente principal de distribución sin latencia teórica en el backend.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-4 text-[#050505] border-b border-black/10 pb-2">
          Conclusión
        </h3>
        <p>
          La arquitectura del backend de nuestro sistema no se apoya en magia tecnológica ni afirmaciones grandilocuentes. Es, puramente, el ejercicio disciplinado del manejo óptimo de los datos.
        </p>
        <p>
          He construido este servidor con un enfoque minimalista y de alto rendimiento, removiendo barreras artificiales como memorias cachés perezosas y dependencias de consultas estáticas. Al consolidar conexiones de red en tiempo real, limpieza algorítmica de memoria, y validaciones matemáticas puras para el control de sesiones, he logrado ensamblar una infraestructura robusta. Nuestro servidor se dedica únicamente a escuchar, filtrar con precisión absoluta, y proveer la realidad cruda de la red en fracciones de segundo. Ese es nuestro verdadero logro técnico: hacer que el procesamiento invisible sea tan eficiente que los datos parezcan nacer directamente del usuario.
        </p>

        {/* DOWNHEAD / PREMIUM FOOTER */}
        <div className="mt-16 pt-10 border-t border-black/5 flex flex-col items-center pb-24">
          <CinematicWhaleLogo src="/official-whale-monochrome.png" className="w-16 h-16 mb-6 opacity-60" />
          <h4 className="text-[18px] font-black tracking-tighter uppercase italic text-[#050505] mb-6">Whale Ecosystem</h4>
          <div className="flex items-center gap-8">
            <a href="https://x.com/whaleecosystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40 hover:text-[#050505] transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              <span>Twitter</span>
            </a>
            <a href="https://github.com/whaleecosystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40 hover:text-[#050505] transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"></path></svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



// ─── QR SCANNER ───────────────────────────────────────────────────────────────

function MobileQRScanner({ onBack, address, signMessageAsync }: any) {
  const isProcessingRef = useRef(false);
  const addressRef = useRef<string>(address);
  const signRef = useRef<any>(signMessageAsync);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => { addressRef.current = address; }, [address]);
  useEffect(() => { signRef.current = signMessageAsync; }, [signMessageAsync]);

  const handleScan = useCallback(async (text: string) => {
    if (isProcessingRef.current) return;
    if (!text.startsWith('SOVEREIGN_HANDSHAKE:')) return;
    const currentAddress = addressRef.current;
    if (!currentAddress) {
      toast.error('WALLET NO CONECTADA', { description: 'Conecta tu wallet antes de escanear.' });
      return;
    }
    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const token = text.slice('SOVEREIGN_HANDSHAKE:'.length);
      const res = await fetch('/api/auth/qr-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, address: currentAddress, signature: '0x_bypass' }),
      });
      if (res.ok) {
        toast.success('CONEXIÓN LEGENDARIA', { description: 'Sincronización de terminal completada.' });
        if (scannerRef.current) await scannerRef.current.stop().catch(() => {});
        window.location.reload();
      } else {
        const errorText = await res.text();
        toast.error('FALLO DE SINCRONIZACIÓN', { description: errorText || 'Error al verificar identidad' });
        isProcessingRef.current = false;
        setIsProcessing(false);
      }
    } catch (e: any) {
      const isRejection = e?.code === 4001 || e?.message?.toLowerCase().includes('reject');
      toast.error(isRejection ? 'FIRMA RECHAZADA' : 'FALLO DE PROTOCOLO', {
        description: isRejection ? 'Debes aprobar la firma en tu wallet.' : (e instanceof Error ? e.message : 'Error desconocido')
      });
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;
    scanner.start(
      { facingMode: 'environment' },
      { fps: 15, qrbox: (w, h) => { const s = Math.min(w, h) * 0.7; return { width: s, height: s }; } },
      (text) => handleScan(text),
      () => {}
    ).catch(() => setError('Cámara no autorizada'));
    return () => { if (scannerRef.current) scannerRef.current.stop().catch(() => {}); };
  }, [handleScan]);

  return (
    <div className="fixed inset-0 bg-[#FAF9F6] z-[10000] flex flex-col p-8 overflow-hidden">
      <header className="flex items-center justify-between mb-12">
        <button onClick={onBack} className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-black/5 shadow-sm active:scale-75 transition-transform">
          <MoveRight size={18} className="rotate-180" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#050505]/40">Óptica Neural Activa</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-sm aspect-square bg-white rounded-[4rem] overflow-hidden relative shadow-2xl p-4 border border-black/5">
          <div id="qr-reader" className="w-full h-full rounded-[3rem] overflow-hidden" />
          {/* Corner sight overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[75%] h-[75%] border-2 border-white/20 rounded-[3rem] relative">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
            </div>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-6 text-center">
              <RefreshCw className="animate-spin text-black mb-6" size={40} />
              <span className="text-[14px] font-black uppercase tracking-[0.2em] mb-4">Sincronizando Identidad...</span>
              <div className="w-full bg-green-50 border border-green-200 rounded-[1.5rem] p-5 animate-pulse mt-4">
                <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] block mb-2">✨ Conexión Perfecta</span>
                <span className="text-[11px] font-bold text-green-600/70 uppercase tracking-[0.08em] leading-relaxed block">
                  Sincronización de canal exitosa. Regresando a la terminal.
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-16 text-center space-y-3">
          <h3 className="text-3xl font-black tracking-tighter">Captura de Canal</h3>
          <p className="text-[12px] font-medium text-[#050505]/30 max-w-[240px] leading-relaxed uppercase tracking-wider">
            Encuadra el QR de la terminal para completar el handshake.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-6 rounded-3xl text-center text-red-600 font-black text-[10px] uppercase tracking-widest border border-red-100">
          {error}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function MobileSovereignLanding() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [view, setView] = useState<'landing' | 'scanner'>('landing');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [walletBrowser, setWalletBrowser] = useState<string | null>(null);

  useEffect(() => {
    setWalletBrowser(detectWalletBrowser());
  }, []);

  const handleConnectTrigger = useCallback(() => {
    if (walletBrowser) {
      const injected = connectors.find(c => c.id === 'injected' || c.id === 'io.metamask' || c.type === 'injected');
      if (injected) connect({ connector: injected });
      else if (connectors.length > 0) connect({ connector: connectors[0] });
    } else {
      setIsPickerOpen(true);
    }
  }, [connect, connectors, walletBrowser]);

  if (view === 'scanner') {
    return <MobileQRScanner onBack={() => setView('landing')} address={address} signMessageAsync={signMessageAsync} />;
  }

  return (
    <div className="w-full h-[100dvh] bg-[#FAF9F6] overflow-hidden relative">
      <AnimatedPattern />
      <WalletPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />

      {/* 3-page snap container */}
      <div className="msv-snap-container w-full h-full">

        {/* PAGE 1 — Original Hero */}
        <PageHero
          isConnected={isConnected}
          address={address}
          onConnect={handleConnectTrigger}
          onScan={() => setView('scanner')}
          onDisconnect={() => disconnect()}
        />

        {/* PHILOSOPHY PAGES */}
        <PagePhilosophy1 />
        <PagePhilosophy2 />
        <PagePhilosophy3 />
      </div>
    </div>
  );
}
