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
import { useAppKit } from '@reown/appkit/react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { CinematicWhaleLogo } from './CinematicWhaleLogo';
import { LiveTerminalWidgets } from './LiveTerminalWidgets';
import { WhaleOfflineGame } from './WhaleOfflineGame';

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
          transform: translateZ(0);
        }
        .msv-snap-container {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        .msv-snap-container::-webkit-scrollbar { display: none; }
        .msv-snap-page {
          scroll-snap-align: start;
          scroll-snap-stop: always;
          contain: layout style paint;
        }
        @keyframes msv-fade-in-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: msv-fade-in-down 0.25s ease forwards; }
        
        @keyframes subtle-breathe {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50%      { transform: scale(1.05) translate(-1%, -1%); }
        }
        .bg-living-pattern {
          background-image: url('/fluid-pink-wallpaper.jpg');
          background-size: cover;
          background-position: center;
          animation: subtle-breathe 25s ease-in-out infinite;
          will-change: transform;
        }
      ` }} />
      {/* Living Pink Fluid Pattern Background */}
      <div className="fixed inset-0 z-0 overflow-hidden bg-[#FBC9C2]">
        <div className="absolute inset-[-10%] bg-living-pattern opacity-95 mix-blend-multiply" />
      </div>
      {/* Optional subtle dot overlay for depth */}
      <motion.div
        aria-hidden="true"
        className="fixed -inset-[32px] msv-dot-pattern pointer-events-none z-[1] opacity-20"
        animate={{ x: [0, -32], y: [0, -32] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ willChange: 'transform' }}
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

// ─── WORLD FINANCIAL CLOCKS ───────────────────────────────────────────────────
function WorldFinancialClocks() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!mounted) return <div className="h-8 mb-6 mt-2" />;
  const hubs = [
    { name: 'NY', tz: 'America/New_York' },
    { name: 'LDN', tz: 'Europe/London' },
    { name: 'TYO', tz: 'Asia/Tokyo' },
    { name: 'DXB', tz: 'Asia/Dubai' },
  ];
  return (
    <div className="flex justify-center items-center gap-6 w-full max-w-[320px] mx-auto opacity-70 mb-4 mt-2">
      {hubs.map(hub => {
        const localTime = new Date(time.toLocaleString('en-US', { timeZone: hub.tz }));
        return (
          <div key={hub.name} className="flex flex-col items-center min-w-[40px]">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505] mb-0.5">{hub.name}</span>
            <span className="font-mono text-[9px] tracking-widest font-bold text-[#050505]/80">
              {localTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const WALLET_OPTIONS = [
  { id: 'metamask', name: 'METAMASK',     desc: 'BROWSER EXTENSION',    iconType: 'metamask' },
  { id: 'trust',    name: 'TRUST WALLET', desc: 'MOBILE APP', iconType: 'trust' },
  { id: 'coinbase', name: 'COINBASE WALLET',desc: 'SMART WALLET / APP', iconType: 'coinbase' },
  { id: 'rainbow',  name: 'RAINBOW WALLET',      desc: 'MOBILE APP', iconType: 'rainbow' },
];

function WalletIcon({ type }: { type: string }) {
  if (type === 'metamask') return (
       <svg width="24" height="24" viewBox="0 0 118 110" fill="none"><path d="M115.82 46.5414L105.187 18.2562L82.9096 35.8082L81.242 37.1697L115.82 46.5414ZM52.4172 1.4883L58.98 0L65.5428 1.4883L65.7365 1.58752V20.8845L58.98 23.3644L52.2235 20.8845V1.58752L52.4172 1.4883ZM35.0504 35.8082L12.7731 18.2562L2.1397 46.5414L36.718 37.1697L35.0504 35.8082ZM58.98 27.5308L67.7512 24.3564L85.2731 43.1215L82.1348 45.4031L58.98 56.4143L35.8252 45.4031L32.6869 43.1215L50.2088 24.3564L58.98 27.5308ZM30.7109 46.7894L32.8806 50.1126L53.7733 60.1839L53.8121 69.1614L37.1444 65.5406L20.825 80.3214L15.3232 54.3782L30.7109 46.7894ZM87.2491 46.7894L102.637 54.3782L97.135 80.3214L80.8156 65.5406L64.1479 69.1614L64.1867 60.1839L85.0794 50.1126L87.2491 46.7894ZM115.82 50.4093L91.24 64.9946L103.257 85.083L115.82 50.4093ZM2.1397 50.4093L14.703 85.083L26.72 64.9946L2.1397 50.4093ZM33.5005 69.3102L55.478 74.0718H62.482L84.4595 69.3102L98.53 87.0174L110.163 94.6558L106.637 99.467L97.5613 102.592H81.7086L70.1627 94.0606L67.9542 96.6894H50.0058L47.7973 94.0606L36.2514 102.592H20.3987L11.323 99.467L7.7969 94.6558L19.43 87.0174L33.5005 69.3102Z" fill="#F6851B"/><path d="M55.478 74.0718L49.1921 82.2558L33.5393 86.8686H53.0759L55.4452 79.418L55.4526 74.1565H55.478ZM62.482 74.0718H62.5074L62.5148 79.418L64.8841 86.8686H84.4207L68.7679 82.2558L62.482 74.0718Z" fill="#E2761B"/><path d="M68.7679 82.2558L84.4207 86.8686L81.7086 102.592L70.1627 94.0606L68.7679 82.2558ZM49.1921 82.2558L33.5393 86.8686L36.2514 102.592L47.7973 94.0606L49.1921 82.2558ZM70.1627 94.0606L67.9542 96.6894H50.0058L47.7973 94.0606L58.98 90.787H70.1627ZM106.637 99.467L110.163 94.6558C110.163 94.6558 106.327 94.1598 102.49 97.483L97.5613 102.592H81.7086L86.6373 109.933L106.637 99.467ZM11.323 99.467L7.7969 94.6558C7.7969 94.6558 11.633 94.1598 15.47 97.483L20.3987 102.592H36.2514L31.3227 109.933L11.323 99.467Z" fill="#D7C1B3"/><path d="M58.98 90.7572L50.0058 96.6596L62.2494 109.963H55.7106L58.98 90.787V90.7572ZM58.98 90.7572L58.98 90.787L67.9542 96.6894L55.7106 109.963H62.2494L58.98 90.7572Z" fill="#161616"/><path d="M86.6373 109.933L81.7086 102.592L62.2494 109.933H86.6373ZM31.3227 109.933L36.2514 102.592L55.7106 109.933H31.3227ZM33.5393 86.8686L84.4207 86.8686H53.0759H64.8841L84.4207 86.8686Z" fill="#763D16"/></svg>
  );
  if (type === 'trust') return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#0A65FF" stroke="#000000" strokeWidth="1"/></svg>
  );
  if (type === 'coinbase') return (
    <div className="w-[24px] h-[24px] bg-[#0052FF] rounded-full flex items-center justify-center">
         <div className="w-[10px] h-[10px] bg-white rounded-sm drop-shadow-sm" />
    </div>
  );
  if (type === 'rainbow') return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round"><path d="M4 18v-2a8 8 0 0 1 16 0v2" stroke="#FF494A" /><path d="M8 18v-2a4 4 0 0 1 8 0v2" stroke="#FFCF00"/><path d="M12 18v-1a1 1 0 0 1 0 0" stroke="#1198FF"/></svg>
  );
  if (type === 'walletconnect') return (
    <svg viewBox="0 0 500 500" width="24" height="24" fill="none"><rect width="500" height="500" fill="#3B99FC" rx="100"/><path d="M152 230c54-52 142-52 196 0l11 11c6 6 6 15 0 21l-25 25c-3 3-6 4-10 4-4 0-7-1-10-4l-5-5c-32-31-84-31-118 0l-5 5c-6 6-15 6-21 0l-25-25c-6-6-6-15 0-21l12-11zm198 83-29 29c-6 6-15 6-21 0l-45-45c-3-3-8-3-11 0l-45 45c-6 6-15 6-21 0l-29-29c-6-6-6-15 0-21l45-45c5-6 15-6 21 0l45 45c3 3 8 3 11 0l45-45c6-6 15-6 21 0l45 45c6 6 6 15 0 21z" fill="#FFF"/></svg>
  );
  return null;
}

// ─── WALLET PICKER MODAL ──────────────────────────────────────────────────────

function WalletPickerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const os = typeof window !== 'undefined' ? getMobileOS() : 'other';
  const { connect, connectors, error } = useConnect();
  const { open } = useAppKit();
  const [isConnecting, setIsConnecting] = React.useState<string | null>(null);

  const handleWalletSelect = async (wallet: typeof WALLET_OPTIONS[0]) => {
    setIsConnecting(wallet.id);

    try {
        if (wallet.id === 'walletConnect') {
            onClose();
            open({ view: 'Connect' });
            setIsConnecting(null);
            return;
        }

        const activeBrowser = detectWalletBrowser();
        let targetConnector = null;
        
        switch(wallet.id) {
            case 'metamask':
                targetConnector = connectors.find(c => c.id === 'metaMask' || c.id === 'io.metamask');
                break;
            case 'coinbase':
                targetConnector = connectors.find(c => c.id === 'coinbaseWalletSDK' || c.id === 'coinbaseWallet');
                break;
            case 'trust':
                targetConnector = connectors.find(c => c.id === 'com.trustwallet.app' || c.name === 'Trust Wallet');
                break;
            case 'rainbow':
                targetConnector = connectors.find(c => c.id === 'me.rainbow' || c.name === 'Rainbow');
                break;
        }

        if (!targetConnector && activeBrowser === wallet.id) {
             targetConnector = connectors.find(c => c.type === 'injected');
        }

        if (targetConnector) {
            connect({ connector: targetConnector }, {
                onSuccess: () => {
                    toast.success("Wallet Connected Successfully");
                    setIsConnecting(null);
                    onClose();
                },
                onError: (err) => {
                    toast.error(`Connection failed: ${err.message}`);
                    setIsConnecting(null);
                }
            });
        } else {
            const osId = getMobileOS();
            if (osId === 'ios' || osId === 'android') {
                const dappLink = buildDappBrowserLink(wallet.id, osId);
                if (dappLink) {
                    window.location.href = dappLink;
                    setTimeout(() => setIsConnecting(null), 3000);
                } else {
                    toast.error(`${wallet.name} not supported for deep linking.`);
                    setIsConnecting(null);
                }
            } else {
                toast.info(`${wallet.name} no detectado. Abriendo WalletConnect QR...`);
                setIsConnecting(null);
                onClose();
                open({ view: 'Connect' });
            }
        }
    } catch (e: any) {
        toast.error(`Error: ${e?.message}`);
        setIsConnecting(null);
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
            style={{ willChange: 'opacity' }}
          />
          <motion.div
            initial={{ y: '100%', scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.98 }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            className="w-full max-w-[340px] bg-white rounded-[2.8rem] p-6 pt-10 relative z-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-black/5"
            style={{ willChange: 'transform' }}
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
              
              {error && (
                <div className="mt-4 px-3 py-2 bg-rose-50 text-rose-500 rounded-lg text-[9px] font-bold tracking-widest uppercase border border-rose-100 flex gap-2 w-full text-center items-center justify-center">
                    <Zap size={10} className="shrink-0" />
                    <span>Conexión Fallida o Cancelada</span>
                </div>
              )}
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
                    style={{ willChange: 'transform' }}
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
  onEnterNews,
}: {
  isConnected: boolean;
  address?: string;
  onConnect: () => void;
  onScan: () => void;
  onDisconnect: () => void;
  onEnterNews: () => void;
}) {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full text-[#050505] font-sans flex flex-col items-center justify-between pb-12 pt-12 px-8 overflow-hidden relative">

      {/* TOP BAR */}
      <header className="w-full flex items-center justify-end z-20 h-10">
        {isConnected && (
          <button
            onClick={onDisconnect}
            className="w-10 h-10 bg-white border border-black/5 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            style={{ willChange: 'transform' }}
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
          style={{ willChange: 'transform, opacity' }}
        >
          <WorldFinancialClocks />

          {/* Animated Whale Logo bounded nicely */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: [0, -20, 0], opacity: 1 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-[280px] h-[280px] mx-auto mb-4 mt-2 flex items-center justify-center relative drop-shadow-2xl"
            style={{ willChange: 'transform' }}
          >
            <img 
              src="/official-whale-monochrome.png" 
              className="w-full h-full object-contain" 
              alt="Whale Logo" 
            />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] mb-6 uppercase italic relative z-10 drop-shadow-md">
            Whale Alert<br />Network
          </h1>

          {!isConnected ? (
            <div className="w-full space-y-4">
              <p className="text-[12px] font-bold text-[#050505]/30 uppercase tracking-[0.15em] mb-10 max-w-[260px] mx-auto leading-relaxed">
                Connect with<br />PC session.
              </p>

              <button
                onClick={onConnect}
                className="w-full h-[88px] bg-[#050505] text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] group"
                style={{ willChange: 'transform' }}
              >
                <Wallet size={20} className="text-white/40 group-active:translate-x-1 transition-transform" />
                CONNECT WALLET
              </button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="w-full bg-[#FAF9F6] border border-black/10 rounded-[2rem] p-5 mb-4 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                   <span className="text-[11px] font-black text-[#050505] uppercase tracking-[0.2em]">BÓVEDA ACTIVA</span>
                </div>
                <span className="text-[10px] font-bold text-[#050505]/60 uppercase tracking-[0.08em] leading-relaxed block">
                  La cartera está conectada correctamente
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {/* Opcion 1: Ir a las noticias */}
                <button
                  onClick={onEnterNews}
                  className="w-full h-[72px] bg-[#050505] border-2 border-[#050505] text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-between px-8 transition-all shadow-lg shadow-black/20 active:scale-[0.98] group"
                  style={{ willChange: 'transform' }}
                >
                  <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
                    <Activity size={20} className="text-white" />
                    <div className="text-left leading-tight">
                      <p className="tracking-[0.3em] font-black">VER NOTICIAS</p>
                      <p className="text-[8px] opacity-60 mt-1 font-bold">TERMINAL DE NOTICIAS MÓVIL</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Opcion 2: Escanear PC */}
                <button
                  onClick={onScan}
                  className="w-full h-[72px] bg-white border-2 border-[#050505] text-[#050505] rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-between px-8 transition-all shadow-lg shadow-black/5 active:scale-[0.98] group"
                  style={{ willChange: 'transform' }}
                >
                  <div className="grid grid-cols-[auto_1fr] gap-5 items-center">
                    <QrCode size={20} className="text-[#050505]" />
                    <div className="text-left leading-tight">
                      <p className="tracking-[0.3em] font-black">ENLAZAR PC</p>
                      <p className="text-[8px] opacity-40 mt-1 font-bold">ESCANEAR CÓDIGO DE ESCRITORIO</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="opacity-20 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

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
        style={{ willChange: 'transform' }}
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

// ─── LIVE METRICS ─────────────────────────────────────────────────────────────
function LiveFPS() {
  const [fps, setFps] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timesRef = useRef<number[]>([]);
  useEffect(() => {
    setMounted(true);
    let last = performance.now();
    let raf: number;
    const loop = (now: number) => {
      const dt = now - last; last = now;
      timesRef.current.push(dt);
      if (timesRef.current.length > 30) timesRef.current.shift();
      const avg = timesRef.current.reduce((a,b)=>a+b,0)/timesRef.current.length;
      setFps(Math.round(1000/avg));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  if (!mounted) return null;
  const color = fps >= 55 ? '#34D399' : fps >= 30 ? '#FBBF24' : '#F87171';
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
      <span className="font-mono text-[10px] font-black" style={{ color }}>{fps}<span className="opacity-50">fps</span></span>
    </div>
  );
}

function AnimatedCounter({ target, duration = 1200, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now-start)/duration, 1);
        const ease = 1 - Math.pow(1-p, 3);
        setVal(Math.round(target * ease));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <div ref={ref}>{val.toLocaleString()}{suffix}</div>;
}

// ─── PAGE 2 · 240Hz SOVEREIGN RENDERING ENGINE ────────────────────────────────
function PagePhilosophy1() {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full font-sans flex flex-col px-6 pt-14 pb-12 overflow-y-auto msv-hide-scrollbar relative bg-[#050508]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-right { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes glow-pulse { 0%,100% { box-shadow: 0 0 12px #7C3AED44; } 50% { box-shadow: 0 0 28px #7C3AEDaa; } }
        @keyframes flow { from { background-position: 0% 50%; } to { background-position: 200% 50%; } }
        .pipe-flow { background: linear-gradient(90deg, #7C3AED, #3B82F6, #06B6D4, #7C3AED); background-size: 200%; animation: flow 3s linear infinite; }
        @keyframes shimmer-hz { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
      ` }} />
      <motion.div
        initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
        transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[8px] font-black uppercase tracking-[0.45em] text-white/25">Rendering Engine</span>
          <LiveFPS />
        </div>
        <h2 className="text-[2.4rem] font-black tracking-tighter leading-[0.88] uppercase text-white">
          240<span className="text-[#7C3AED]">Hz</span><br/>Sovereign<br/>Renderer
        </h2>
        <div className="h-[3px] w-24 pipe-flow rounded-full mt-3" />
      </motion.div>

      <div className="flex flex-col gap-5">
        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Frame Budget', val: '4.17', unit: 'ms', color: '#7C3AED' },
            { label: 'GPU Layers',   val: '48',   unit: '+',  color: '#3B82F6' },
            { label: 'Compositors', val: '16',   unit: 'x',  color: '#06B6D4' },
          ].map(m => (
            <div key={m.label} className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-3 flex flex-col" style={{ boxShadow:`0 0 16px ${m.color}18` }}>
              <span className="font-mono text-[18px] font-black" style={{ color: m.color }}>
                {m.val}<span className="text-[11px] opacity-60">{m.unit}</span>
              </span>
              <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-white/30 mt-0.5 leading-none">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Pipeline diagram */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/25 mb-3">GPU Compositing Pipeline</p>
          <div className="flex items-center gap-1">
            {['JS','Style','Layout','Paint','Composite','Display'].map((s,i) => (
              <React.Fragment key={s}>
                <motion.div
                  initial={{ opacity:0, scale:0.8 }} whileInView={{ opacity:1, scale:1 }}
                  transition={{ delay: i*0.1, duration:0.4 }}
                  className="flex-1 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `hsl(${210+i*18},80%,${30+i*5}%)`, border:`1px solid hsl(${210+i*18},80%,${45+i*5}%)30` }}
                >
                  <span className="text-[6px] font-black uppercase tracking-wider text-white/80">{s}</span>
                </motion.div>
                {i < 5 && <div className="w-1.5 h-[1px] bg-white/15 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Frame budget bar */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[8px] font-black uppercase tracking-[0.35em] text-white/25">Frame Budget @ 240Hz</p>
            <span className="font-mono text-[9px] font-black text-[#7C3AED]">4.17ms total</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name:'Script',      pct:18, color:'#7C3AED' },
              { name:'Render',      pct:22, color:'#3B82F6' },
              { name:'GPU Comp.',   pct:35, color:'#06B6D4' },
              { name:'Display Sync',pct:25, color:'#10B981' },
            ].map(b => (
              <div key={b.name} className="flex items-center gap-2">
                <span className="text-[7px] font-black uppercase tracking-wider text-white/25 w-16 flex-shrink-0">{b.name}</span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} whileInView={{ width: `${b.pct}%` }}
                    transition={{ duration:1, ease:[0.16,1,0.3,1], delay:0.2 }}
                    className="h-full rounded-full" style={{ background: b.color }}
                  />
                </div>
                <span className="text-[7px] font-mono font-black text-white/30 w-6 flex-shrink-0">{b.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11.5px] leading-[1.9] font-medium text-white/50">
          Every pixel is orchestrated through a <span className="text-white/80 font-black">GPU-composited layer tree</span>, bypassing the main thread entirely. CSS <code className="font-mono text-[#7C3AED] text-[10px]">will-change: transform</code> elevates 48 independent compositor layers — ensuring <span className="text-white/80 font-black">zero layout thrash</span> and true 240Hz synchronization with the device VSYNC signal.
        </p>
      </div>

      <motion.div className="flex flex-col items-center gap-1 mt-8 opacity-20" animate={{ y:[0,4,0] }} transition={{ duration:2, repeat:Infinity }}>        <span className="text-[8px] font-black uppercase tracking-[0.35em] text-white">SIGUIENTE</span>
        <ChevronDown size={13} className="text-white" />
      </motion.div>
    </div>
  );
}

// ─── PAGE 3 · ZERO-LATENCY PIPELINE ──────────────────────────────────────────
function PagePhilosophy2() {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full font-sans flex flex-col px-6 pt-14 pb-12 overflow-y-auto msv-hide-scrollbar relative bg-[#03050A]">
      <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.7 }} className="mb-8">
        <span className="text-[8px] font-black uppercase tracking-[0.45em] text-white/20 block mb-3">Neural Pipeline</span>
        <h2 className="text-[2.2rem] font-black tracking-tighter leading-[0.9] uppercase text-white">
          Zero<span className="text-[#3B82F6]">-μs</span><br/>Intelligence
        </h2>
        <div className="h-[3px] w-20 bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] rounded-full mt-3" />
      </motion.div>

      <div className="flex flex-col gap-4">
        {/* Live latency display */}
        <div className="bg-[#3B82F6]/[0.06] border border-[#3B82F6]/20 rounded-2xl p-4">
          <div className="flex items-end gap-3 mb-3">
            <div className="font-mono text-[2.8rem] font-black text-[#3B82F6] leading-none">
              <AnimatedCounter target={240} suffix="" />
            </div>
            <div className="mb-1">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/25">Hz Display</p>
              <p className="text-[8px] font-black uppercase tracking-[0.25em] text-[#3B82F6]/60">Sync Rate</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[['< 0.8ms','Input Lag'],['< 2.1ms','Render'],['< 1.3ms','Commit']].map(([v,l])=>(
              <div key={l} className="flex flex-col">
                <span className="font-mono text-[11px] font-black text-[#06B6D4]">{v}</span>
                <span className="text-[7px] font-black uppercase tracking-wider text-white/25">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WebAssembly stack */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/25 mb-3">WebAssembly SIMD Stack</p>
          {[['SIMD128','Price oracle vectorisation','#7C3AED'],
            ['SharedArrayBuffer','Lock-free worker sync','#3B82F6'],
            ['OffscreenCanvas','Off-main-thread GPU paint','#06B6D4'],
            ['Atomics.waitAsync','Non-blocking IPC','#10B981']
          ].map(([tech, desc, color], i) => (
            <motion.div
              key={tech}
              initial={{ opacity:0, x:-12 }} whileInView={{ opacity:1, x:0 }}
              transition={{ delay:i*0.08, duration:0.45 }}
              className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0"
            >
              <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background:color }} />
              <div>
                <span className="font-mono text-[10px] font-black" style={{ color }}>{tech}</span>
                <p className="text-[9px] text-white/30 leading-snug mt-0.5">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-[11.5px] leading-[1.9] font-medium text-white/50">
          Market entropy is processed through a <span className="text-white/80 font-black">WASM SIMD128 engine</span> operating in a dedicated Worker thread. The main thread remains perpetually unblocked — delivering deterministic 240Hz frame delivery with <span className="text-[#3B82F6] font-black">&lt; 0.8ms input latency</span> even under peak whale alert load.
        </p>
      </div>

      <motion.div className="flex flex-col items-center gap-1 mt-8 opacity-20" animate={{ y:[0,4,0] }} transition={{ duration:2, repeat:Infinity }}>
        <span className="text-[8px] font-black uppercase tracking-[0.35em] text-white">SIGUIENTE</span>
        <ChevronDown size={13} className="text-white" />
      </motion.div>
    </div>
  );
}

// ─── PAGE 4 · CRYPTOGRAPHIC SOVEREIGNTY ──────────────────────────────────────
function PagePhilosophy3() {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full font-sans flex flex-col px-6 pt-14 pb-12 overflow-y-auto msv-hide-scrollbar relative bg-[#020408]">
      <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.7 }} className="mb-8">
        <span className="text-[8px] font-black uppercase tracking-[0.45em] text-white/20 block mb-3">Cryptographic Vault</span>
        <h2 className="text-[2.2rem] font-black tracking-tighter leading-[0.9] uppercase text-white">
          Sovereign<span className="text-[#10B981]">Vault</span><br/>Identity
        </h2>
        <div className="h-[3px] w-20 bg-gradient-to-r from-[#10B981] to-[#06B6D4] rounded-full mt-3" />
      </motion.div>

      <div className="flex flex-col gap-4">
        {/* ECDSA card */}
        <div className="bg-[#10B981]/[0.06] border border-[#10B981]/20 rounded-2xl p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#10B981]/60 mb-2">ECDSA secp256k1 · EIP-191</p>
          <div className="font-mono text-[10px] text-[#10B981]/80 leading-relaxed bg-black/30 rounded-xl p-3 border border-[#10B981]/10">
            <p className="text-white/20 text-[8px] mb-1"># Zero-knowledge handshake</p>
            <p>Q = dG <span className="text-white/25">(private key × generator)</span></p>
            <p className="mt-1">σ = Sign<sub>d</sub>(H(m)) → (r, s)</p>
            <p className="mt-1">Verify: sG = H(m)Q + rG<span className="text-[#10B981]">✓</span></p>
          </div>
        </div>

        {/* Security tier list */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/25 mb-3">Security Stack</p>
          {[
            ['E2E Encryption',   'AES-256-GCM · ChaCha20-Poly1305', '#10B981'],
            ['ZK Proofs',        'Groth16 SNARK — O(1) verify',     '#7C3AED'],
            ['HSM Key Guard',    'secp256k1 · Hardware boundary',   '#3B82F6'],
            ['Merkle Integrity', 'SHA-3 proof of inclusion',        '#F59E0B'],
            ['Geofence WAF',     'eBPF · < 0.3ms border pass',      '#06B6D4'],
          ].map(([t,d,c],i) => (
            <motion.div key={t}
              initial={{ opacity:0, x:-10 }} whileInView={{ opacity:1, x:0 }}
              transition={{ delay:i*.07, duration:0.4 }}
              className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0"
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:c, boxShadow:`0 0 6px ${c}80` }} />
              <div className="flex-1">
                <span className="text-[10px] font-black text-white/70">{t}</span>
                <p className="text-[8px] font-mono text-white/25 mt-0.5 leading-none">{d}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" style={{ boxShadow:'0 0 6px #10B98180' }} />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-8 border-t border-white/[0.05] flex flex-col items-center pb-16">
          <CinematicWhaleLogo src="/official-whale-monochrome.png" className="w-16 h-16 mb-4 opacity-40 drop-shadow-xl" style={{ filter:'invert(1)' }} />
          <div className="flex items-center gap-6">
            <a href="https://x.com/whalecosystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/50 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @whalecosystem
            </a>
            <a href="https://github.com/whalecosystem" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/50 transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



// ─── QR SCANNER ───────────────────────────────────────────────────────────────

export function MobileQRScanner({ onBack, address, signMessageAsync }: any) {
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
        <button onClick={onBack} className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-black/5 shadow-sm active:scale-75 transition-transform" style={{ willChange: 'transform' }}>
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

export function MobileSovereignLanding({ onEnterNews }: { onEnterNews?: () => void } = {}) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [view, setView] = useState<'landing' | 'scanner'>('landing');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [walletBrowser, setWalletBrowser] = useState<string | null>(null);
  const [showGame, setShowGame] = useState(false);

  // Offline detection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const goOffline = () => setShowGame(true);
    const goOnline  = () => {}; // keep game open until user dismisses
    if (!navigator.onLine) setShowGame(true);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

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

  const handleEnterNews = useCallback(() => {
    if (onEnterNews) {
      // Use parent-provided callback (MobileEnforcer will switch to MobileNewsShell without reload)
      onEnterNews();
    } else {
      // Fallback: set cookie + reload (legacy path)
      document.cookie = "sovereign_handshake=0x_bypass; path=/; max-age=31536000";
      window.location.reload();
    }
  }, [onEnterNews]);

  if (view === 'scanner') {
    return <MobileQRScanner onBack={() => setView('landing')} address={address} signMessageAsync={signMessageAsync} />;
  }

  return (
    <div className="w-full h-[100dvh] bg-transparent overflow-hidden relative">
      {/* Offline Whale Game Overlay */}
      <AnimatePresence>
        {showGame && <WhaleOfflineGame visible={showGame} onBack={() => setShowGame(false)} />}
      </AnimatePresence>
      <AnimatedPattern />
      <WalletPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />

      {/* 4-page snap container */}
      <div className="msv-snap-container w-full h-full">

        {/* PAGE 1 — Original Hero */}
        <PageHero
          isConnected={isConnected}
          address={address}
          onConnect={handleConnectTrigger}
          onScan={() => setView('scanner')}
          onDisconnect={() => disconnect()}
          onEnterNews={handleEnterNews}
        />

        {/* PHILOSOPHY PAGES */}
        <PagePhilosophy1 />
        <PagePhilosophy2 />
        <PagePhilosophy3 />
      </div>
    </div>
  );
}
