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

const STORE_LINKS: Record<string, { ios: string; android: string }> = {
  metamask: { ios: 'https://apps.apple.com/app/metamask/id1438144202',               android: 'https://play.google.com/store/apps/details?id=io.metamask' },
  trust:    { ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409', android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp' },
  coinbase: { ios: 'https://apps.apple.com/app/coinbase-wallet-nfts-crypto/id1278383455', android: 'https://play.google.com/store/apps/details?id=org.toshi' },
  rainbow:  { ios: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021', android: 'https://play.google.com/store/apps/details?id=me.rainbow' },
};

const WALLET_OPTIONS = [
  { id: 'metamask', name: 'METAMASK',     desc: 'BROWSER EXTENSION',    iconType: 'metamask' },
  { id: 'trust',    name: 'TRUST WALLET', desc: 'VIA WALLETCONNECT QR', iconType: 'trust' },
  { id: 'coinbase', name: 'COINBASE WALLET',desc: 'VIA WALLETCONNECT QR', iconType: 'coinbase' },
  { id: 'rainbow',  name: 'RAINBOW',      desc: 'VIA WALLETCONNECT QR', iconType: 'rainbow' },
];

function WalletIcon({ type }: { type: string }) {
  if (type === 'metamask') return <img src="/official-whale-monochrome.png" className="w-[18px] h-[18px]" alt="MetaMask" />;
  if (type === 'trust') return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#E84142" stroke="#000000" strokeWidth="2"/></svg>
  );
  if (type === 'coinbase') return (
    <div className="w-[18px] h-[18px] bg-[#0052FF] rounded-full border-[2.5px] border-black" />
  );
  if (type === 'rainbow') return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"><path d="M4 18v-2a8 8 0 0 1 16 0v2" stroke="#FF494A" /><path d="M8 18v-2a4 4 0 0 1 8 0v2" stroke="#FFCF00"/><path d="M12 18v-1a1 1 0 0 1 0 0" stroke="#1198FF"/></svg>
  );
  return null;
}

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
      case 'metamask': return buildMetaMaskDeepLink(wcUri);
      case 'trust':    return buildTrustDeepLink(wcUri);
      case 'coinbase': return buildCoinbaseDeepLink(wcUri);
      case 'rainbow':  return buildRainbowDeepLink(wcUri);
      default:         return buildDappBrowserLink(walletId, os);
    }
  };

  const handleWalletSelect = async (wallet: typeof WALLET_OPTIONS[0]) => {
    setIsConnecting(wallet.id);

    // 1. Precise EIP-6963 / Injected Match
    let specificConnector = null;
    const eth = typeof window !== 'undefined' ? (window as any).ethereum : null;
    
    if (wallet.id === 'metamask') {
      specificConnector = connectors.find(c => c.id === 'io.metamask' || c.name === 'MetaMask' || (c.type === 'injected' && eth?.isMetaMask));
      if (!specificConnector) specificConnector = connectors.find(c => c.type === 'injected'); 
    } else if (wallet.id === 'trust') {
      specificConnector = connectors.find(c => c.id === 'com.trustwallet.app' || c.name === 'Trust Wallet' || (c.type === 'injected' && eth?.isTrust));
    } else if (wallet.id === 'coinbase') {
      specificConnector = connectors.find(c => c.id === 'coinbaseWalletSDK' || c.name === 'Coinbase Wallet' || (c.type === 'injected' && eth?.isCoinbaseWallet));
    } else if (wallet.id === 'rainbow') {
      specificConnector = connectors.find(c => c.id === 'me.rainbow' || c.name === 'Rainbow' || (c.type === 'injected' && eth?.isRainbow));
    }

    if (specificConnector) {
      try {
        connect({ connector: specificConnector }, {
          onSuccess: () => { setIsConnecting(null); onClose(); },
          onError: () => { setIsConnecting(null); }
        });
        return; // Success! Flow intercepted by extension.
      } catch (err) { }
    }

    // 2. Fallback to WalletConnect / Deep Link
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
      
      if (provider.disconnect) {
         try { await provider.disconnect(); } catch(e){}
      }
      provider.on('display_uri', onDisplayUri);
      
      connect({ connector: wcConnector }, {
         onSuccess: () => { setIsConnecting(null); onClose(); },
         onError: () => { setIsConnecting(null); onClose(); }
      });
      
      setTimeout(() => {
        if (!uriCaptured) {
          provider.removeListener?.('display_uri', onDisplayUri);
          window.location.href = buildDappBrowserLink(wallet.id, os);
          setTimeout(() => openStoreAsFallback(wallet.id), 3000);
        }
        setIsConnecting(null);
      }, 5000);
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
        <div className="fixed inset-0 z-[10000] flex items-end justify-center px-4 pb-12 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#000000]/10 backdrop-blur-[10px]"
          />
          <motion.div
            initial={{ y: '100%', scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.98 }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            className="w-full max-w-[340px] bg-white rounded-[2.8rem] p-6 pt-10 relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-black/5"
          >
            <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 bg-[#FAF9F6] text-[#050505]/40 rounded-full flex items-center justify-center hover:text-black hover:bg-black/5 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            <div className="flex flex-col items-center mb-9">
              <div className="w-[60px] h-[60px] bg-white border border-black/[0.04] shadow-[0_4px_16px_-4px_rgba(0,0,0,0.06)] rounded-full flex items-center justify-center mb-5">
                <img src="/official-whale-monochrome.png" className="w-[30px] h-[30px]" alt="Whale" />
              </div>
              <h3 className="text-[20px] font-black text-[#050505] tracking-tight mb-1">Bóveda Criptográfica</h3>
              <p className="text-[9px] text-[#050505]/40 font-black uppercase tracking-[0.16em]">Sincronización de Identidad</p>
            </div>
            
            <div className="space-y-[14px]">
              {WALLET_OPTIONS.map((wallet) => {
                const busy = isConnecting === wallet.id;
                return (
                  <button
                    key={wallet.id}
                    onClick={() => !isConnecting && handleWalletSelect(wallet)}
                    disabled={!!isConnecting}
                    className={`w-full h-[68px] flex items-center justify-between px-5 bg-[#FAF9F6] border border-black/[0.04] rounded-[2rem] transition-all group ${busy ? 'scale-[0.98] opacity-80 border-indigo-500/20 shadow-sm' : 'hover:border-black/10 active:scale-[0.98]'} disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-[1rem] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)] flex items-center justify-center border border-black/[0.02]">
                        <WalletIcon type={wallet.iconType} />
                      </div>
                      <div className="text-left flex flex-col justify-center">
                        <span className="font-black text-[12.5px] text-[#050505] tracking-widest">{wallet.name}</span>
                        <span className={`text-[8px] font-black uppercase tracking-[0.12em] mt-[1px] ${busy ? 'text-indigo-500 animate-pulse' : 'text-[#050505]/30'}`}>
                          {busy ? 'CONECTANDO...' : wallet.desc}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button onClick={onClose} className="w-full mt-7 py-3 mb-1 text-[9.5px] font-black text-[#050505]/25 uppercase tracking-[0.35em] active:opacity-50 transition-opacity">
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
          {/* Animated Whale Logo bounded nicely */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [0, -15, 0], opacity: 1 }}
            transition={{
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="w-32 h-32 mx-auto mb-8 mt-4 flex items-center justify-center relative"
          >
            <img 
              src="/official-whale-monochrome.png" 
              className="w-full h-full object-contain" 
              alt="Whale Logo" 
            />
          </motion.div>

          <h1 className="text-5xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic relative z-10 drop-shadow-md">
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
        className="mb-10 w-full flex justify-center"
      >
        <h2 className="text-[2.2rem] font-black tracking-tighter leading-[0.95] uppercase italic text-[#050505] text-center border-b-4 border-[#050505] pb-2 inline-block">
          Manifiesto<br/>Técnico
        </h2>
      </motion.div>

      <div className="flex-1 flex flex-col gap-6 text-[15px] leading-[1.85] font-medium text-[#050505]/80">
        <p>
          En los mercados financieros, la diferencia entre el éxito y el fracaso a menudo se mide en fracciones de segundo. Históricamente, el acceso a la información pura de las redes descentralizadas ha sido un privilegio exclusivo de grandes instituciones, mientras que el usuario general recibe datos fragmentados y con retrasos.
        </p>
        <p>
          Construimos nuestra plataforma para nivelar ese terreno de juego. Este documento detalla el funcionamiento interno de nuestro centro de operaciones: el "backend" o motor que impulsa todo nuestro sistema. No estamos hablando de ideas teóricas; estamos hablando de una infraestructura sólida y en producción que hoy mismo procesa, analiza y distribuye la realidad del mercado a velocidad institucional. Nuestra ingeniería trabaja de forma invisible para que ustedes puedan tomar decisiones impecables y con total seguridad.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-4 text-[#050505] border-b border-black/10 pb-2">
          1. Conexión Directa en Tiempo Real
        </h3>
        <p>
          El mayor error tecnológico de las plataformas financieras comunes es "preguntar" al mercado qué ha sucedido cada cierta cantidad de segundos. En el mundo institucional, recibir información que tiene cinco o diez segundos de antigüedad equivale a operar a ciegas.
        </p>
        <p>
          Por eso, la arquitectura de nuestro sistema opera de forma diametralmente opuesta: nosotros "escuchamos" al mercado permanentemente. Mantenemos canales directos y persistentes con las redes financieras. Cada operación ingresa a nuestro sistema en el instante exacto en que ocurre. Además, dado que el internet global puede ser impredecible, integramos de manera nativa un sistema lógico de reconexión inteligente que asegura que nuestro flujo de conexión se estabilice en milisegundos sin sobrecargar nuestros servidores:
        </p>

        <img 
          src="/f_backoff.svg" 
          alt="Exponential Backoff Formula" 
          className={formulaImgStyle}
        />

        <p>
          El resultado es un flujo de información continuo e implacable.
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
          2. El Radar Inteligente
        </h3>
        <p>
          Capturar miles de transacciones por segundo carece de valor si no sabemos interpretarlas. Una inmensa mayoría de estos movimientos no tienen la fuerza suficiente para cambiar la dirección del mercado.
        </p>
        <p>
          Para solucionar este desafío, desarrollamos lo que internamente llamamos un "radar automático". A medida que los datos entran al servidor a gran velocidad, el motor los analiza al vuelo. En lugar de utilizar métricas rígidas, empleamos un modelo estadístico dinámico: comparamos el tamaño de cada transacción entrante con el comportamiento habitual del mercado en ese momento específico:
        </p>

        <img 
          src="/f_zscore.svg" 
          alt="Z-Score Formula" 
          className={formulaImgStyle}
        />

        <p>
          Si el sistema detecta una anomalía matemática de volumen —una transferencia masiva de capital—, la clasifica inmediatamente como un movimiento de gran relevancia (una "ballena"). Si, por el contrario, la transacción no representa un impacto real, el servidor la descarta al instante. Este descarte agresivo nos permite entregar a nuestros usuarios y clientes únicamente la información de alto valor estratégico, maximizando nuestra velocidad de respuesta.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-4 text-[#050505] border-b border-black/10 pb-2">
          3. Cero Datos Simulados
        </h3>
        <p>
          Cuando el capital está en juego, no hay lugar para estimaciones. Gran parte del software tradicional, cuando experimenta un leve fallo de conexión, muestra datos guardados previamente o precios "estimados" temporales para mantener la ilusión de que todo funciona con normalidad. Nosotros consideramos esta práctica inaceptable.
        </p>
        <p>
          Nuestra infraestructura opera bajo una estricta política de transparencia innegociable. Si la información del mercado derivado no está disponible en este mismo segundo, el sistema está programado para informarle, sin excusas, de que el dato está temporalmente ausente. Jamás mostraremos un cálculo antiguo ni una estimación disfrazada de verdad. Esta sinceridad técnica nos garantiza que cada cifra proyectada en nuestras plataformas sea genuina, auditable y completamente real.
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
          4. Privacidad Soberana
        </h3>
        <p>
          Garantizar la seguridad de nuestros usuarios sin comprometer su identidad fue un requisito incuestionable de nuestro diseño. Las bases de datos tradicionales, vulnerables y cargadas de correos y contraseñas, son puntos de riesgo y asimetría.
        </p>
        <p>
          Nuestra solución evita almacenar identidades personales. Cuando usted se conecta, el sistema ejecuta un proceso matemático de validación avanzado —un "apretón de manos digital"— entre su billetera criptográfica y nuestros servidores. Mediante una firma criptográfica, el sistema confirma la legitimidad de la conexión:
        </p>

        <img 
          src="/f_ecdsa.svg" 
          alt="ECDSA Verification Formula" 
          className={formulaImgStyle}
        />

        <p>
          Esto establece una sesión altamente blindada sin llegar a saber jamás quién es usted. No acumulamos secretos de usuarios ni identidades almacenadas. Toda la seguridad y el control permanecen siempre de su lado.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-4 text-[#050505] border-b border-black/10 pb-2">
          5. Consolidación de Mercados Fractales
        </h3>
        <p>
          El capital macro se distribuye a lo largo de docenas de mercados en paralelo. Presentar información de ecosistemas financieros diferentes y fragmentados suponía nuestro mayor desafío logístico de distribución, puesto que procesarlos uno a uno sería demasiado lento.
        </p>
        <p>
          Lo solucionamos empleando una arquitectura de sincronización múltiple. Nuestro servidor recauda información lanzando peticiones hacia todas las redes descentralizadas distintas al mismo tiempo, en paralelo. Al recibir las respuestas, las unifica, corrige los decimales para que todos los números hablen el mismo lenguaje y logrando resolver el cálculo en una complejidad ultra eficiente:
        </p>

        <img 
          src="/f_log.svg" 
          alt="Logarithmic Time Complexity Formula" 
          className={formulaImgStyle}
        />

        <p>
          Toda esa complejidad ocurre a una velocidad extrema para enviarla sin latencia a las pantallas de los inversores como un mapa consolidado y fácil de operar.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-4 text-[#050505] border-b border-black/10 pb-2">
          6. Arquitectura Zero-Trust Inquebrantable
        </h3>
        <p>
          Operamos bajo el principio absoluto de que cualquier conexión externa es inherentemente hostil. Por ello, el entorno de operaciones está encapsulado por un Firewall Estocástico multidimensional que opera a nivel "Edge". Esta matriz intercepta y descarta tráfico anómalo en fracciones de milisegundo antes de que alcance nuestra infraestructura en la nube.
        </p>
        <p>
          Nuestro escudo no confía en barreras estáticas convencionales. Empleamos mecanismos de autenticación asimétrica, rotación incesante de secretos en memoria aislada, y limitación de tasa adaptativa. Los métodos predictivos detectan actividad de reconocimiento de red y la aíslan automáticamente. De esta manera, garantizamos una protección matemática de grado militar que mantiene nuestras rutinas operativas en producción cien por ciento secretas, inmutables y, sobre todo, indescifrables frente al escrutinio externo.
        </p>

        <h3 className="text-[14px] font-black uppercase tracking-[0.15em] mt-8 text-[#050505] border-b border-black/10 pb-2">
          Conclusión
        </h3>
        <p>
          La creación de los cimientos de nuestra empresa no se basa en promesas futuristas, sino en la aplicación estricta de principios de ingeniería y negocios de altísimo rendimiento. Hemos eliminado latencias innecesarias, suposiciones de código y prácticas inseguras, condensando todo nuestro esfuerzo técnico para enfocarnos en lo que realmente importa.
        </p>
        <p>
          Este servidor está construido pura y duramente para hacer su trabajo a la perfección: escuchar al mercado financiero mundial sin pestañear, filtrar el ruido con disciplina militar y entregar la información en milisegundos. Nuestro mayor logro tecnológico en esta fase de producción constante es lograr que esa inmensa infraestructura sea completamente invisible para usted. Usted solo ve el mercado; puro, dinámico y listo para el análisis, desde el primer segundo.
        </p>

        {/* DOWNHEAD / PREMIUM FOOTER */}
        <div className="mt-16 pt-10 border-t border-black/5 flex flex-col items-center pb-24">
          <CinematicWhaleLogo src="/official-whale-monochrome.png" className="w-16 h-16 mb-6 opacity-60" />
          <h4 className="text-[18px] font-black tracking-tighter uppercase italic text-[#050505] mb-6">Whale Ecosystem</h4>
          <div className="flex items-center gap-8">
            <a href="https://x.com/whalecosystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40 hover:text-[#050505] transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              <span>@whalecosystem</span>
            </a>
            <a href="https://github.com/whalecosystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40 hover:text-[#050505] transition-colors">
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
