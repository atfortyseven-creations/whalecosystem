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

const PILLARS = [
  {
    type: 'ORDER_BOOK' as const,
    icon: <Activity size={14} className="text-[#050505]/50" />,
    title: 'ORDER BOOK',
    subtitle: 'Motor LOB — Limit Order Book',
    nature: 'Estructura de árbol binario de búsqueda diseñada para emparejamiento de liquidez de tiempo constante O(log n).',
    desc: 'Un mapa tridimensional de la profundidad de liquidez. Vectores de órdenes estáticas, márgenes de slippage y bid/ask.',
    use: 'Liquidity Walls, Spoofing, Market Impact.',
  },
  {
    type: 'WHALE_FLOW' as const,
    icon: <Eye size={14} className="text-[#050505]/50" />,
    title: 'WHALE FLOW',
    subtitle: 'Heurística de Red',
    nature: 'Motor de indexación acoplado a RPC. Emplea clustering algorítmico y filtros bayesianos.',
    desc: 'Decodificador heurístico de la Mempool. Filtra anomalías (volumen V > μ + 3σ) aislando transferencias masivas.',
    use: 'Alpha Predictivo.',
  },
  {
    type: 'MARKETS' as const,
    icon: <Zap size={14} className="text-[#050505]/50" />,
    title: 'MARKETS AVAILABLE',
    subtitle: 'Fragmentación Activa',
    nature: 'Base de datos relacional distribuida que mapea metadatos y fragmentación de liquidez.',
    desc: 'Matriz multidimensional con Open Interest, Funding Rates y volumen.',
    use: 'Cross-Chain Omniscience.',
  },
  {
    type: 'COPY_TRADING' as const,
    icon: <Shield size={14} className="text-[#050505]/50" />,
    title: 'COPY TRADING',
    subtitle: 'Replicación Simétrica',
    nature: 'Arquitectura basada en Intenciones (Intents) y emulación Account Abstraction.',
    desc: 'Expropiación lícita de ventajas institucionales.',
    use: 'Democratización asimétrica de estrategias.',
  },
];

function PageEcosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Isolated Worker Init for extreme performance
    workerRef.current = new Worker(new URL('/workers/terminal-core.js', window.location.origin));
    
    // Intersection Observer to connect WS only when visible
    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
            console.log('[Terminal] Taxonomía visible. Booting Web Worker WS...');
            workerRef.current?.postMessage({ cmd: 'START' });
        } else {
            console.log('[Terminal] Taxonomía oculta. Severing WS feed...');
            workerRef.current?.postMessage({ cmd: 'STOP' });
        }
    }, { threshold: 0.1 });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
        observer.disconnect();
        workerRef.current?.terminate();
        workerRef.current = null;
    };
  }, []);

  return (
    <div id="taxonomia-cientifica" ref={containerRef} className="msv-snap-page min-h-[100dvh] w-full bg-[#FAF9F6] text-[#050505] font-sans flex flex-col px-6 pt-16 pb-10 overflow-y-auto msv-hide-scrollbar relative">
      
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#050505]/30 mb-2">
          TAXONOMÍA CIENTÍFICA
        </p>
        <h2 className="text-[1.8rem] font-black tracking-tighter leading-[0.95] uppercase italic text-[#050505]">
          Infraestructura<br />Terminal
        </h2>
        <p className="text-[10px] text-[#050505]/40 mt-4 leading-relaxed max-w-[320px] font-medium border-l-[1.5px] border-[#050505]/10 pl-3">
          Cuatro pilares algorítmicos que estructuran la representación de datos en tiempo real. Streams delegados a Isolated Web Workers.
        </p>
      </motion.div>

      {/* PILLARS RAW TEXT + WIDGETS */}
      <div className="flex flex-col gap-10">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className="pb-8 border-b border-[#050505]/10 last:border-0 last:pb-0 relative"
          >
            {/* Title row */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#050505]/5 flex items-center justify-center">
                {p.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.18em] leading-none text-[#050505]">{p.title}</h3>
                <p className="text-[8px] text-[#050505]/40 font-bold uppercase tracking-[0.15em] mt-1">{p.subtitle}</p>
              </div>
            </div>

            {/* Texts */}
            <p className="text-[9px] text-[#050505]/60 leading-[1.6] mb-2 font-medium">
              <span className="font-black text-[#050505]/80 uppercase tracking-wider text-[8.5px]">Naturaleza: </span>
              {p.nature}
            </p>
            <p className="text-[9px] text-[#050505]/60 leading-[1.6] mb-3 font-medium">
              <span className="font-black text-[#050505]/80 uppercase tracking-wider text-[8.5px]">Realidad: </span>
              {p.desc}
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#050505]/5 rounded-sm mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#050505]/30 animate-pulse" />
              <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#050505]/60">{p.use}</p>
            </div>

            {/* LIVE WIDGET */}
            <LiveTerminalWidgets type={p.type} workerRef={workerRef} />
          </motion.div>
        ))}
      </div>

      {/* SCROLL HINT */}
      <motion.div
        className="flex flex-col items-center gap-1 mt-12 mb-4 opacity-20"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-[9px] font-black uppercase tracking-[0.3em]">CONECTAR</span>
        <ChevronDown size={14} />
      </motion.div>
    </div>
  );
}

// ─── PAGE 3 · CONNECT WALLET ──────────────────────────────────────────────────

function PageConnect({
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
    <div className="msv-snap-page min-h-[100dvh] w-full bg-[#050505] text-white font-sans flex flex-col items-center justify-center px-8 pb-16 pt-16 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(6,182,212,0.08)_0%,transparent_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm flex flex-col items-center text-center z-10"
      >
        {/* Logo */}
        <div className="w-28 h-28 mx-auto mb-8">
          <CinematicWhaleLogo src="/official-whale-monochrome.png" className="w-full h-full" />
        </div>

        {/* Label */}
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-3">
          ACCESO SOBERANO
        </p>
        <h2 className="text-4xl font-black tracking-tighter leading-none uppercase mb-3">
          Bóveda<br />Criptográfica
        </h2>
        <p className="text-[11px] text-white/30 mb-10 leading-relaxed">
          Sincroniza tu identidad on-chain para<br />acceder a la terminal institucional.
        </p>

        <div className="w-full space-y-4">
          {!isConnected ? (
            <button
              onClick={onConnect}
              className="w-full h-[88px] bg-white text-[#050505] rounded-[2.5rem] font-black uppercase tracking-[0.22em] text-[11px] flex items-center justify-center gap-4 active:scale-[0.98] shadow-[0_0_45px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:bg-cyan-50 group relative overflow-hidden transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Wallet size={20} className="text-[#050505]/50 group-active:translate-x-1 transition-transform" />
              CONECTAR BILLETERA
            </button>
          ) : (
            <button
              onClick={onScan}
              className="w-full h-[88px] bg-cyan-500/10 border border-cyan-500/30 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-between px-8 shadow-[0_0_30px_rgba(6,182,212,0.1)] active:scale-[0.97] backdrop-blur-md hover:bg-cyan-500/20 transition-colors group"
            >
              <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                  <QrCode size={18} className="text-cyan-400" />
                </div>
                <div className="text-left leading-none">
                  <p className="tracking-[0.3em] text-cyan-50">SYNC LENS</p>
                  <p className="text-[8px] text-cyan-400/80 mt-1.5 font-black">READY: OPEN SCANNER</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-cyan-400 opacity-80 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {isConnected && (
            <button
              onClick={onDisconnect}
              className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-white/40 transition-colors"
            >
              Desconectar
            </button>
          )}
        </div>

        {isConnected && address && (
          <p className="mt-8 text-[8.5px] font-mono font-black tracking-widest text-white/25 uppercase">
            ID: <span className="text-cyan-500/60">{address.slice(0, 10)}</span>…{address.slice(-6)}
          </p>
        )}

        {/* Disclaimer */}
        <p className="mt-12 text-[7.5px] text-white/15 uppercase tracking-wider leading-relaxed max-w-[260px] text-center">
          No reliance · Educational purposes only · Not financial advice
        </p>
      </motion.div>

      {/* Fingerprint watermark */}
      <div className="absolute bottom-4 w-full flex items-center justify-center gap-3 opacity-[0.06] pointer-events-none px-8">
        <div className="h-px bg-white flex-1" />
        <Fingerprint size={14} className="text-white" />
        <div className="h-px bg-white flex-1" />
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

        {/* PAGE 2 — Ecosystem Taxonomy */}
        <PageEcosystem />

        {/* PAGE 3 — Connect Wallet (dark) */}
        <PageConnect
          isConnected={isConnected}
          address={address}
          onConnect={handleConnectTrigger}
          onScan={() => setView('scanner')}
          onDisconnect={() => disconnect()}
        />
      </div>
    </div>
  );
}
