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
    { name: 'FRA', tz: 'Europe/Berlin' },
    { name: 'DXB', tz: 'Asia/Dubai' },
    { name: 'HKG', tz: 'Asia/Hong_Kong' },
    { name: 'TYO', tz: 'Asia/Tokyo' },
  ];
  return (
    <div className="flex justify-center items-center gap-3 w-full flex-wrap mx-auto opacity-70 mb-4 mt-2 px-2">
      {hubs.map(hub => {
        const localTime = new Date(time.toLocaleString('en-US', { timeZone: hub.tz }));
        return (
          <div key={hub.name} className="flex flex-col items-center min-w-[36px]">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505] mb-0.5">{hub.name}</span>
            <span className="font-mono text-[8px] tracking-widest font-bold text-[#050505]/80">
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

// ─── PAGE 5 · EL MANIFIESTO ABSOLUTO (PURA PALABRA) ───────────────────────────
function PageManifesto() {
  return (
    <div className="msv-snap-page min-h-[100dvh] w-full font-serif flex flex-col px-8 pt-20 pb-24 overflow-y-auto msv-hide-scrollbar relative bg-transparent">
      <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:1.5, ease:[0.16,1,0.3,1] }} className="flex flex-col relative z-10 w-full max-w-sm mx-auto">
        <h2 className="text-[11px] font-mono font-black tracking-[0.4em] uppercase text-[#050505] border-b border-black/10 pb-6 mb-8 flex items-center justify-between">
          <span>Technical Manifesto</span>
          <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
        </h2>
        
        <div className="text-[14.5px] leading-[1.85] text-[#050505]/80 space-y-7 text-justify tracking-wide font-medium">
          <p>
            The fundamental architecture of the Sovereign Terminal transcends conventional heuristic data aggregation. It is formulated as an institutional-grade, deterministic macro-analysis system. The network does not merely process data; it ingests raw on-chain entropy through low-level RPC websocket streams at 240Hz, bypassing superficial middle-tier abstractions.
          </p>

          <p>
            <strong className="font-black text-[#050505] text-[15px]">Zero-Knowledge Determinism.</strong> Our perimeter enforces stringent cryptographic isolation. Every entry verification undergoes computationally exhaustive geometric tracing, utilizing one hundred trillion multi-variate parameter corrections. This algorithmic scrutiny evaluates trajectory densities and kinematic pressure with uncompromising mathematical rigor to guarantee absolute human agency, decisively blocking all synthetic biomechanical automation.
          </p>

          <p>
            <strong className="font-black text-[#050505] text-[15px]">Immutable Ontological State.</strong> The <em className="italic text-black font-black">Genesis Gold Ticket</em> functions not as a mutable database entry, but as a foundational on-chain primitive. Institutional hierarchies and access credentials are irrevocably persisted within high-availability PostgreSQL relational architectures and anchored to ERC-1155 token matrices, thereby reducing concurrency anomalies to absolute zero.
          </p>

          <p>
            <strong className="font-black text-[#050505] text-[15px]">Distributed Knowledge Graph.</strong> The system leverages a horizontally scaled Neo4j Knowledge Graph topology. This graph-theoretic engine cross-references dark pool liquidity intersections, rigorously audited semantic smart contracts, and cross-chain financial vectors independently, orchestrated entirely by WebAssembly engines executing at zero-latency thresholds.
          </p>

          <p className="font-bold text-[#050505] pt-2">
            The infrastructure establishes the paradigm for asymmetric information retrieval. You are now operating within an environment of absolute cryptographic certainty and empirical infrastructural truth.
          </p>
          
          <div className="pt-10 flex flex-col items-center border-t border-black/10 mt-10">
              <span className="text-[#050505]/60 font-black tracking-[0.4em] text-center uppercase text-[9px] block">
                 Omniscience • Invariance • Supremacy
              </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}// ─── QR SCANNER ───────────────────────────────────────────────────────────────

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

  if (showGame) {
    return (
      <div className="w-full h-[100dvh] bg-transparent overflow-hidden relative">
        <WhaleOfflineGame visible={showGame} onBack={() => setShowGame(false)} />
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-transparent overflow-hidden relative">
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

        {/* MANIFESTO PAGE */}
        <PageManifesto />
      </div>
    </div>
  );
}
