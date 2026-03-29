"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Smartphone, 
  ShoppingBag, 
  Eye, 
  Zap, 
  ChevronDown, 
  CheckCircle2, 
  MoveRight, 
  Shield, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Wallet,
  Activity,
  Fingerprint
} from 'lucide-react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { CinematicWhaleLogo } from './CinematicWhaleLogo';

// ─── DEEP LINK HELPERS ─────────────────────────────────────────────────────
// IMPORTANT: These builders receive a real WalletConnect URI (wc:// string)
// and wrap it in the wallet's universal link scheme.
// Do NOT pass the dApp origin here — that causes the wallet to open the browser
// without establishing a WalletConnect session.

function getAppUrl(): string {
  if (typeof window === 'undefined') return 'https://humanidfi.com';
  return window.location.origin;
}

// Receives wc:// URI and returns the final deep link for each wallet
function buildMetaMaskDeepLink(wcUri: string, os: string): string {
  const encoded = encodeURIComponent(wcUri);
  return os === 'ios'
    ? `metamask://wc?uri=${encoded}`
    : `https://metamask.app.link/wc?uri=${encoded}`;
}

function buildTrustDeepLink(wcUri: string): string {
  const encoded = encodeURIComponent(wcUri);
  return `https://link.trustwallet.com/wc?uri=${encoded}`;
}

function buildCoinbaseDeepLink(wcUri: string): string {
  const encoded = encodeURIComponent(wcUri);
  // Coinbase Wallet uses cb-wallet:// on iOS, universal link on Android
  return `https://go.cb-w.com/wc?uri=${encoded}`;
}

// Rainbow uses rnbwapp.com universal links — rainbow:// scheme is NOT supported
function buildRainbowDeepLink(wcUri: string): string {
  const encoded = encodeURIComponent(wcUri);
  return `https://rnbwapp.com/wc?uri=${encoded}`;
}

// Fallback dApp-browser deep links (used when WC URI is unavailable)
function buildDappBrowserLink(walletId: string, os: string): string {
  const dappUrl = encodeURIComponent(getAppUrl());
  const links: Record<string, string> = {
    metamask: os === 'ios'
      ? `metamask://browser?url=${dappUrl}`
      : `https://metamask.app.link/dapp/${window.location.host}`,
    trust: `https://link.trustwallet.com/open_url?coin_id=60&url=${dappUrl}`,
    coinbase: `https://go.cb-w.com/dapp?cb_url=${dappUrl}`,
    rainbow: `https://rnbwapp.com/dapp?url=${dappUrl}`,
  };
  return links[walletId] || '';
}

function getMobileOS(): 'ios' | 'android' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

function detectWalletBrowser(): 'metamask' | 'trust' | 'coinbase' | 'rainbow' | 'other' | null {
  if (typeof window === 'undefined') return null;
  const ua = navigator.userAgent.toLowerCase();
  const eth = (window as any).ethereum;
  // If no injected provider, we are in a regular browser
  if (!eth) return null;
  // Check wallet-specific flags first (most reliable)
  if (eth.isMetaMask && !eth.isBraveWallet) return 'metamask';
  if (eth.isTrust || ua.includes('trustwallet') || ua.includes('trust wallet')) return 'trust';
  if (eth.isCoinbaseBrowser || eth.isCoinbaseWallet || ua.includes('coinbasebrowser') || ua.includes('coinbase')) return 'coinbase';
  if (eth.isRainbow || ua.includes('rainbow')) return 'rainbow';
  // Generic injected provider inside an unidentified wallet browser
  return 'other';
}

// ─── GPU-ACCELERATED BACKGROUND ────────────────────────────────────────────
const AnimatedPattern = React.memo(function AnimatedPattern() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .mobile-hide-scrollbar::-webkit-scrollbar { display: none; }
        .mobile-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .web3-dot-pattern {
          background-image: radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          will-change: transform;
        }
        .aztec-noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
        }
        .glass-card {
           background: rgba(255, 255, 255, 0.7);
           backdrop-filter: blur(20px);
           -webkit-backdrop-filter: blur(20px);
           border: 1px solid rgba(0, 0, 0, 0.05);
        }
      ` }} />
      <motion.div
        aria-hidden="true"
        className="fixed -inset-[32px] web3-dot-pattern pointer-events-none z-0"
        animate={{ x: [0, -32], y: [0, -32] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <div className="fixed inset-0 aztec-noise pointer-events-none z-0 mix-blend-overlay" />
    </>
  );
});

// ─── CUSTOM WALLET PICKER ──────────────────────────────────────────────────
const SUPPORTED_WALLETS = [
  { id: 'metamask', name: 'MetaMask', icon: '/official-whale-monochrome.png', color: '#F6851B' },
  { id: 'trust',    name: 'Trust Wallet', icon: '🛡️', color: '#3375BB' },
  { id: 'coinbase', name: 'Coinbase', icon: '🔵', color: '#0052FF' },
  { id: 'rainbow',  name: 'Rainbow',  icon: '🌈', color: '#001E59' }
];

const STORE_LINKS: Record<string, { ios: string; android: string }> = {
  metamask: { ios: 'https://apps.apple.com/app/metamask/id1438144202', android: 'https://play.google.com/store/apps/details?id=io.metamask' },
  trust:    { ios: 'https://apps.apple.com/app/trust-crypto-bitcoin-wallet/id1288339409', android: 'https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp' },
  coinbase: { ios: 'https://apps.apple.com/app/coinbase-wallet-nfts-crypto/id1278383455', android: 'https://play.google.com/store/apps/details?id=org.toshi' },
  rainbow:  { ios: 'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021', android: 'https://play.google.com/store/apps/details?id=me.rainbow' },
};

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
      case 'metamask': return buildMetaMaskDeepLink(wcUri, os);
      case 'trust':    return buildTrustDeepLink(wcUri);
      case 'coinbase': return buildCoinbaseDeepLink(wcUri);
      case 'rainbow':  return buildRainbowDeepLink(wcUri);
      default:         return buildDappBrowserLink(walletId, os);
    }
  };

  const handleWalletSelect = async (wallet: typeof SUPPORTED_WALLETS[0]) => {
    setIsConnecting(wallet.id);

    // Find the AppKit / WalletConnect connector
    const wcConnector = connectors.find(
      c => c.id === 'walletConnect' || c.name === 'WalletConnect' || c.id.toLowerCase().includes('walletconnect')
    );

    if (!wcConnector) {
      // No WC connector — open the dApp browser link directly
      window.location.href = buildDappBrowserLink(wallet.id, os);
      setTimeout(() => openStoreAsFallback(wallet.id), 3000);
      setIsConnecting(null);
      onClose();
      return;
    }

    try {
      const provider: any = await wcConnector.getProvider();
      let uriCaptured = false;

      // STEP 1: Register the display_uri BEFORE calling connect
      // When WalletConnect generates the pairing URI, redirect the user into the wallet
      const onDisplayUri = (uri: string) => {
        if (uriCaptured) return; // guard against double-fire
        uriCaptured = true;
        provider.removeListener?.('display_uri', onDisplayUri);
        const deepLink = buildWcDeepLink(wallet.id, uri);
        console.log('[WalletPicker] Redirecting to:', deepLink);
        window.location.href = deepLink;
      };

      provider.on('display_uri', onDisplayUri);

      // STEP 2: Trigger connection — this causes WC to emit display_uri
      connect({ connector: wcConnector });

      // STEP 3: Safety timeout — if display_uri never fires (e.g. existing pairing),
      // fall back to dApp-browser link after 5 seconds and open the store.
      setTimeout(() => {
        if (!uriCaptured) {
          provider.removeListener?.('display_uri', onDisplayUri);
          window.location.href = buildDappBrowserLink(wallet.id, os);
          setTimeout(() => openStoreAsFallback(wallet.id), 3000);
        }
        setIsConnecting(null);
      }, 5000);

      onClose();
    } catch (e) {
      console.error('[WalletPicker] Connection error:', e);
      // Hard fallback: open dApp browser link
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
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
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
                const isThisConnecting = isConnecting === wallet.id;
                return (
                  <button
                    key={wallet.id}
                    onClick={() => !isConnecting && handleWalletSelect(wallet)}
                    disabled={!!isConnecting}
                    className={`w-full h-20 flex items-center justify-between px-6 bg-[#F9F8F4] border border-black/5 rounded-[2rem] transition-all group ${isThisConnecting ? 'scale-[0.98] opacity-80' : 'active:scale-[0.98]'} disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 flex items-center justify-center">
                        {wallet.id === 'metamask' ? (
                          <img src={wallet.icon} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-2xl">{wallet.icon}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <span className="font-black text-sm text-[#050505] uppercase tracking-widest block">{wallet.name}</span>
                        {isThisConnecting && (
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-0.5 block animate-pulse">
                            Abriendo wallet...
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${isThisConnecting ? 'bg-indigo-500 opacity-100' : 'bg-white opacity-0 group-hover:opacity-100'}`}>
                      {isThisConnecting
                        ? <RefreshCw size={14} className="text-white animate-spin" />
                        : <ChevronRight size={16} />
                      }
                    </div>
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={onClose}
              className="w-full mt-6 py-4 text-[10px] font-black text-[#050505]/30 uppercase tracking-[0.4em] active:opacity-60 transition-opacity"
            >
              Cerrar Puerta
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function MobileSovereignLanding() {
    const { isConnected, address } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { signMessageAsync } = useSignMessage();
    
    const [view, setView] = useState<'landing' | 'scanner'>('landing');
    const [isSigned, setIsSigned] = useState(false);
    const [isSigning, setIsSigning] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [walletBrowser, setWalletBrowser] = useState<string | null>(null);

    useEffect(() => {
        setWalletBrowser(detectWalletBrowser());
        const savedSign = sessionStorage.getItem(`sovereign_signed_${address}`);
        if (savedSign === 'true') setIsSigned(true);
    }, [address]);

    const handleConnectTrigger = useCallback(() => {
        if (walletBrowser) {
            // Inside a wallet's InApp browser, the injected provider IS the wallet.
            // Never try to match by wallet name — always use 'injected'.
            const injectedConnector = connectors.find(
                c => c.id === 'injected' || c.id === 'io.metamask' || c.type === 'injected'
            );
            if (injectedConnector) {
                connect({ connector: injectedConnector });
            } else if (connectors.length > 0) {
                // Absolute fallback: use first available connector
                connect({ connector: connectors[0] });
            }
        } else {
            // Not inside a wallet browser — show the picker modal
            setIsPickerOpen(true);
        }
    }, [connect, connectors, walletBrowser]);

    const handleSignAuthorize = useCallback(async () => {
        if (!address) return;
        setIsSigning(true);
        try {
            const signature = await signMessageAsync({ 
                message: `SOVEREIGN_ACCESS_IDENTITY:${address}\nNONCE:${Date.now()}\nNETWORK:WHALE_ALERT_TERMINAL_HANDSHAKE\nSECURITY:EIP712_EPHEMERAL` 
            });
            if (signature) {
                setIsSigned(true);
                sessionStorage.setItem(`sovereign_signed_${address}`, 'true');
                toast.success('IDENTIDAD VINCULADA', { 
                    description: 'Handshake verificado on-chain. Procede al escaneo.',
                    className: 'font-black uppercase tracking-widest'
                });
                setView('scanner');
            }
        } catch (e: any) {
            toast.error('ACCESO DENEGADO', { description: 'Debes firmar el mensaje de identidad.' });
        } finally {
            setIsSigning(false);
        }
    }, [address, signMessageAsync]);

    if (view === 'scanner') {
        return <MobileQRScanner onBack={() => setView('landing')} address={address} signMessageAsync={signMessageAsync} />;
    }

    return (
        <div className="min-h-[100dvh] w-full bg-[#FAF9F6] text-[#050505] font-sans selection:bg-black selection:text-white flex flex-col items-center justify-between pb-12 pt-12 px-8 overflow-hidden">
            <AnimatedPattern />
            <WalletPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />

            {/* TOP BAR */}
            <header className="w-full flex items-center justify-end z-20 h-10">
                <div className="flex items-center gap-3">
                    {isConnected && (
                        <button 
                            onClick={() => disconnect()}
                            className="w-10 h-10 bg-white border border-black/5 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                        >
                            <RefreshCw size={14} className="text-[#050505]/40" />
                        </button>
                    )}
                </div>
            </header>

            {/* HERO SECTION */}
            <main className="w-full max-w-sm flex flex-col items-center text-center z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    <CinematicWhaleLogo src="/official-whale-monochrome.png" className="w-48 h-48 mx-auto mb-6 mt-8 scale-[3] transform-gpu pointer-events-none opacity-90" />

                    <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-8 uppercase italic relative z-10 drop-shadow-md">
                        Whale Alert<br/>Network
                    </h1>
                    
                    <p className="text-[12px] font-bold text-[#050505]/30 uppercase tracking-[0.15em] mb-12 max-w-[280px] mx-auto leading-relaxed relative z-10 bg-white/20 backdrop-blur-[2px] rounded-xl py-1">
                        Connect with<br/>PC session.
                    </p>

                    <div className="w-full space-y-4">
                        {!isConnected ? (
                            <button
                                onClick={handleConnectTrigger}
                                className="w-full h-[88px] bg-[#050505] text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] group"
                            >
                                <Wallet size={20} className="text-white/40 group-active:translate-x-1 transition-transform" />
                                CONNECT WALLET
                            </button>
                        ) : !isSigned ? (
                            <button
                                onClick={handleSignAuthorize}
                                disabled={isSigning}
                                className="w-full h-[88px] bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-xl disabled:opacity-50"
                            >
                                {isSigning ? <RefreshCw className="animate-spin" size={20} /> : <Shield size={20} />}
                                {isSigning ? 'PROCESSING...' : 'SIGN IDENTITY'}
                            </button>
                        ) : (
                            <div className="w-full h-[88px] bg-white border-2 border-green-500 text-green-600 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4">
                                <UserCheck size={20} />
                                HANDSHAKE READY
                            </div>
                        )}

                        <button
                            onClick={() => {
                                if (!isConnected) return handleConnectTrigger();
                                if (!isSigned) return handleSignAuthorize();
                                setView('scanner');
                            }}
                            className={`w-full h-24 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-between px-10 transition-all border-2 ${isSigned ? 'bg-white border-[#050505] text-[#050505] shadow-lg shadow-black/5' : 'bg-transparent border-black/5 text-[#050505]/20'}`}
                        >
                            <div className="grid grid-cols-[auto_1fr] gap-6 items-center">
                                <QrCode size={22} />
                                <div className="text-left leading-tight">
                                    <p className="tracking-[0.3em]">SYNC LENS</p>
                                    <p className="text-[8px] opacity-40 mt-1">{isSigned ? 'FINAL STEP: SCAN QR' : 'REQUIRES SIGNATURE'}</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="opacity-20" />
                        </button>
                    </div>

                    {isConnected && address && (
                        <div className="mt-12 opacity-20">
                            <span className="text-[10px] font-mono font-black tracking-widest">
                                ID: {address.slice(0, 10).toUpperCase()}...{address.slice(-6).toUpperCase()}
                            </span>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* STATUS LOGO */}
            <div className="w-full flex items-center justify-center gap-3 opacity-[0.05] pointer-events-none mb-4">
                <div className="h-px bg-black flex-1" />
                <Fingerprint size={20} />
                <div className="h-px bg-black flex-1" />
            </div>
        </div>
    );
}

// ─── SCANNER COMPONENT ──────────────────────────────────────────────────────
function MobileQRScanner({ onBack, address, signMessageAsync }: any) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    const handleScan = async (text: string) => {
        if (isProcessing) return;
        if (!text.startsWith('SOVEREIGN_HANDSHAKE:')) return;
        
        setIsProcessing(true);
        try {
            const signature = await signMessageAsync({ message: text });
            const token = text.split(':')[1];
            
            const res = await fetch('/api/auth/qr-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, address, signature }),
            });

            if (res.ok) {
                toast.success('CONEXIÓN LEGENDARIA', { description: 'Sincronización de terminal completada.' });
                if (scannerRef.current) await scannerRef.current.stop();
                window.location.reload();
            }
        } catch (e) {
            toast.error('FALLO DE PROTOCOLO');
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;
        
        scanner.start(
            { facingMode: "environment" },
            { fps: 30, qrbox: (viewWidth, viewHeight) => {
                const s = Math.min(viewWidth, viewHeight) * 0.7;
                return { width: s, height: s };
            }},
            (text) => handleScan(text),
            () => {}
        ).catch(() => setError("Cámara no autorizada"));

        return () => {
            if (scannerRef.current) scannerRef.current.stop().catch(() => {});
        };
    }, []);

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
                    
                    {/* OVERLAY SIGHT */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[75%] h-[75%] border-2 border-white/20 rounded-[3rem] relative">
                             <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
                             <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
                             <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
                             <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
                        </div>
                    </div>

                    {isProcessing && (
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center z-50">
                            <RefreshCw className="animate-spin text-black mb-6" size={40} />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Sincronizando Identidad...</span>
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

// Support component
function UserCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}
