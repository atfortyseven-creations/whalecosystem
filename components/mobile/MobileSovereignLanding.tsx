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
  // Always use metamask:// scheme to prevent Android from suggesting web browsers
  return `metamask://wc?uri=${encoded}`;
}

function buildTrustDeepLink(wcUri: string): string {
  const encoded = encodeURIComponent(wcUri);
  return `trust://wc?uri=${encoded}`;
}

function buildCoinbaseDeepLink(wcUri: string): string {
  const encoded = encodeURIComponent(wcUri);
  return `cbwallet://wc?uri=${encoded}`;
}

// Rainbow uses rnbwapp.com universal links mostly but handles rainbow:// 
function buildRainbowDeepLink(wcUri: string): string {
  const encoded = encodeURIComponent(wcUri);
  return `rainbow://wc?uri=${encoded}`;
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

const SUPPORTED_WALLETS = [
  { id: 'all',      name: 'WalletConnect', icon: '⚡', color: '#3B99FC', desc: 'Auto-detectar apps instaladas' },
  { id: 'metamask', name: 'MetaMask', icon: '/official-whale-monochrome.png', color: '#F6851B', desc: 'Billetera Popular' },
  { id: 'trust',    name: 'Trust Wallet', icon: '🛡️', color: '#3375BB', desc: 'Billetera Segura' },
  { id: 'coinbase', name: 'Coinbase', icon: '🔵', color: '#0052FF', desc: 'Billetera Exchange' },
  { id: 'rainbow',  name: 'Rainbow',  icon: '🌈', color: '#001E59', desc: 'Billetera Moderna' }
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
      case 'all':      return wcUri; // This invokes the OS-level intent chooser flawlessly
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
                        {isThisConnecting ? (
                          <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-0.5 block animate-pulse">
                            Abriendo app...
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-[#050505]/40 uppercase tracking-[0.1em] mt-0.5 block">
                            {wallet.desc || ''}
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
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [walletBrowser, setWalletBrowser] = useState<string | null>(null);

    useEffect(() => {
        setWalletBrowser(detectWalletBrowser());
    }, []);

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
                        ) : (
                            <button
                                onClick={() => setView('scanner')}
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
    // Use refs so the scanner callback (captured once in useEffect) always
    // reads the LATEST values — fixes the stale-closure bug that caused
    // "Sincronizando Identidad" to hang forever when address was undefined.
    const isProcessingRef = useRef(false);
    const addressRef = useRef<string>(address);
    const signRef = useRef<any>(signMessageAsync);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // Keep refs in sync on every render
    useEffect(() => { addressRef.current = address; }, [address]);
    useEffect(() => { signRef.current = signMessageAsync; }, [signMessageAsync]);

    // Stable callback — safe to pass to Html5Qrcode once
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
            // Sign the FULL QR string as the message
            const signature = await signRef.current({ message: text });
            // Extract the session UUID — everything after the prefix
            const token = text.slice('SOVEREIGN_HANDSHAKE:'.length);
            
            const res = await fetch('/api/auth/qr-sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, address: currentAddress, signature }),
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
            // User rejected the signing prompt — let them try again
            const isRejection = e?.code === 4001 || e?.message?.toLowerCase().includes('reject') || e?.message?.toLowerCase().includes('denied');
            toast.error(
                isRejection ? 'FIRMA RECHAZADA' : 'FALLO DE PROTOCOLO',
                { description: isRejection ? 'Debes aprobar la firma en tu wallet para sincronizar.' : (e instanceof Error ? e.message : 'Error desconocido') }
            );
            isProcessingRef.current = false;
            setIsProcessing(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const scanner = new Html5Qrcode('qr-reader');
        scannerRef.current = scanner;
        
        scanner.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: (viewWidth, viewHeight) => {
                const s = Math.min(viewWidth, viewHeight) * 0.7;
                return { width: s, height: s };
            }},
            (text) => handleScan(text),
            () => {}
        ).catch(() => setError("Cámara no autorizada"));

        return () => {
            if (scannerRef.current) scannerRef.current.stop().catch(() => {});
        };
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
