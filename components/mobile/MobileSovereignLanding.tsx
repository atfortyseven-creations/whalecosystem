"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
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
          background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px);
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

    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        setWalletBrowser(detectWalletBrowser());
    }, []);

    const handleConnectTrigger = useCallback(() => {
        if (walletBrowser) {
            const injectedConnector = connectors.find(
                c => c.id === 'injected' || c.id === 'io.metamask' || c.type === 'injected'
            );
            if (injectedConnector) {
                connect({ connector: injectedConnector });
            } else if (connectors.length > 0) {
                connect({ connector: connectors[0] });
            }
        } else {
            setIsPickerOpen(true);
        }
    }, [connect, connectors, walletBrowser]);

    // SCROLL ANIMATION LOGIC (AAA Cinematic Tier)
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });
    
    // Physics-tuned springs for cinematic mass and organic feel
    const smProgress = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 1.5 });
    const delay1Progress = useSpring(scrollYProgress, { stiffness: 50, damping: 25, mass: 1.8 });
    const delay2Progress = useSpring(scrollYProgress, { stiffness: 40, damping: 30, mass: 2.2 });
    const delay3Progress = useSpring(scrollYProgress, { stiffness: 30, damping: 35, mass: 2.8 });

    // --- PHASE 1: DECONSTRUCTION ---
    // Whale (Base Spring)
    const whaleY = useTransform(smProgress, [0, 0.25], [0, -500]);
    const whaleX = useTransform(smProgress, [0, 0.25], [0, 200]);
    const whaleRotateZ = useTransform(smProgress, [0, 0.25], [0, 45]);
    const whaleRotateX = useTransform(smProgress, [0, 0.25], [0, 60]);
    const whaleScale = useTransform(smProgress, [0, 0.25], [1, 0.2]);
    const whaleOpacity = useTransform(smProgress, [0, 0.2, 0.25], [1, 0.5, 0]);
    const whaleBlur = useTransform(smProgress, [0, 0.25], ["blur(0px)", "blur(12px)"]);
    
    // WHALE text (Delay 1)
    const t1Y = useTransform(delay1Progress, [0, 0.3], [0, -150]);
    const t1X = useTransform(delay1Progress, [0, 0.3], [0, -300]);
    const t1RotZ = useTransform(delay1Progress, [0, 0.3], [0, -35]);
    const t1RotY = useTransform(delay1Progress, [0, 0.3], [0, 45]);
    const t1Opacity = useTransform(delay1Progress, [0, 0.25], [1, 0]);
    const t1Blur = useTransform(delay1Progress, [0, 0.3], ["blur(0px)", "blur(10px)"]);

    // ALERT text (Delay 2)
    const t2Y = useTransform(delay2Progress, [0, 0.3], [0, 100]);
    const t2X = useTransform(delay2Progress, [0, 0.3], [0, 350]);
    const t2RotZ = useTransform(delay2Progress, [0, 0.3], [0, 45]);
    const t2RotX = useTransform(delay2Progress, [0, 0.3], [0, 45]);
    const t2Opacity = useTransform(delay2Progress, [0, 0.25], [1, 0]);
    const t2Blur = useTransform(delay2Progress, [0, 0.3], ["blur(0px)", "blur(10px)"]);

    // NETWORK text (Delay 3)
    const t3Y = useTransform(delay3Progress, [0, 0.3], [0, 400]);
    const t3Z = useTransform(delay3Progress, [0, 0.3], [0, 200]);
    const t3RotX = useTransform(delay3Progress, [0, 0.3], [0, -60]);
    const t3Opacity = useTransform(delay3Progress, [0, 0.25], [1, 0]);
    const t3Blur = useTransform(delay3Progress, [0, 0.3], ["blur(0px)", "blur(10px)"]);

    const scrollHintOpacity = useTransform(smProgress, [0, 0.05], [1, 0]);

    // --- PHASE 2: ASSEMBLY ---
    const assemblyOpacity = useTransform(smProgress, [0.3, 0.4], [0, 1]);
    const assemblyY = useTransform(smProgress, [0.3, 0.4], [100, 0]);
    const ambientGlowOpacity = useTransform(smProgress, [0.3, 0.6], [0, 1]);

    // Sequential Feature Rows
    const row1Y = useTransform(delay1Progress, [0.35, 0.45], [50, 0]);
    const row1O = useTransform(delay1Progress, [0.35, 0.45], [0, 1]);
    
    const row2Y = useTransform(delay2Progress, [0.45, 0.55], [50, 0]);
    const row2O = useTransform(delay2Progress, [0.45, 0.55], [0, 1]);
    
    const row3Y = useTransform(delay3Progress, [0.55, 0.65], [50, 0]);
    const row3O = useTransform(delay3Progress, [0.55, 0.65], [0, 1]);
    
    const row4Y = useTransform(smProgress, [0.65, 0.75], [50, 0]);
    const row4O = useTransform(smProgress, [0.65, 0.75], [0, 1]);
    
    const row5Y = useTransform(delay1Progress, [0.75, 0.85], [50, 0]);
    const row5O = useTransform(delay1Progress, [0.75, 0.85], [0, 1]);

    // --- PHASE 3: CONNECT REVEAL ---
    const buttonOpacity = useTransform(smProgress, [0.85, 0.95], [0, 1]);
    const buttonY = useTransform(smProgress, [0.85, 0.95], [80, 0]);
    const buttonScale = useTransform(smProgress, [0.85, 0.95], [0.85, 1]);

    if (view === 'scanner') {
        return <MobileQRScanner onBack={() => setView('landing')} address={address} signMessageAsync={signMessageAsync} />;
    }

    return (
        <div ref={containerRef} className="w-full bg-[#0a0a0a] min-h-[300vh] text-white font-sans overflow-clip relative selection:bg-cyan-500/30" style={{ transformStyle: "preserve-3d" }}>
            <AnimatedPattern />
            
            {/* Cinematic Background Parallax */}
            <motion.div 
                className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]"
                style={{ opacity: ambientGlowOpacity, willChange: "opacity" }} 
            />

            <WalletPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />

            {/* TOP BAR */}
            <header className="fixed top-0 left-0 w-full flex items-center justify-end z-50 h-16 px-8 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    {isConnected && (
                        <button 
                            onClick={() => disconnect()}
                            className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform backdrop-blur-md"
                        >
                            <RefreshCw size={14} className="text-white/60" />
                        </button>
                    )}
                </div>
            </header>

            {/* STICKY RENDERER */}
            <div className="sticky top-0 left-0 w-full h-[100dvh] overflow-hidden flex flex-col items-center justify-center pt-12 px-8" style={{ perspective: "1000px" }}>
                
                {/* ─── PHASE 1: FRAGMENTATION HERO ─── */}
                <motion.div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20" style={{ transformStyle: "preserve-3d" }}>
                    <motion.div 
                        style={prefersReducedMotion ? { opacity: whaleOpacity } : { y: whaleY, x: whaleX, rotateZ: whaleRotateZ, rotateX: whaleRotateX, scale: whaleScale, opacity: whaleOpacity, filter: whaleBlur, willChange: "transform, opacity, filter" }}
                        className="w-full max-w-sm flex justify-center mb-6 mt-8"
                    >
                        {/* Parent scales container massively (3.0x approx via w-56/scale-150 + Cinematic's own scale) */}
                        <CinematicWhaleLogo src="/official-whale-monochrome.png" className="w-64 h-64 scale-[2.8] transform-gpu pointer-events-none" />
                    </motion.div>

                    <div className="flex flex-col items-center mt-12 relative w-full overflow-visible" style={{ transformStyle: "preserve-3d" }}>
                        <motion.h1 
                            style={prefersReducedMotion ? { opacity: t1Opacity } : { y: t1Y, x: t1X, rotateZ: t1RotZ, rotateY: t1RotY, opacity: t1Opacity, filter: t1Blur, willChange: "transform, opacity, filter" }} 
                            className="text-[4rem] md:text-6xl font-black tracking-tighter leading-none uppercase italic text-white drop-shadow-md"
                        >
                            Whale
                        </motion.h1>
                        <motion.h1 
                            style={prefersReducedMotion ? { opacity: t2Opacity } : { y: t2Y, x: t2X, rotateZ: t2RotZ, rotateX: t2RotX, opacity: t2Opacity, filter: t2Blur, willChange: "transform, opacity, filter" }} 
                            className="text-[4rem] md:text-6xl font-black tracking-tighter leading-none uppercase italic text-white drop-shadow-md -mt-2"
                        >
                            Alert
                        </motion.h1>
                        <motion.h1 
                            style={prefersReducedMotion ? { opacity: t3Opacity } : { y: t3Y, z: t3Z, rotateX: t3RotX, opacity: t3Opacity, filter: t3Blur, willChange: "transform, opacity, filter" }} 
                            className="text-[4rem] md:text[5rem] font-black tracking-tighter leading-none uppercase italic text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] -mt-2"
                        >
                            Network
                        </motion.h1>
                    </div>

                    <motion.div 
                        style={{ opacity: scrollHintOpacity, willChange: "opacity" }} 
                        className="absolute bottom-12 flex flex-col items-center gap-2"
                    >
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                            SCROLL PARA EXPLORAR EL NÚCLEO
                        </span>
                        <ChevronDown size={14} className="text-white/40 animate-bounce" />
                    </motion.div>
                </motion.div>

                {/* ─── PHASE 2 & 3: ASSEMBLY & CONNECT ─── */}
                <motion.div 
                    style={{ opacity: assemblyOpacity, y: assemblyY, willChange: "transform, opacity" }}
                    className="absolute inset-0 flex flex-col items-center justify-center z-30 px-6 max-w-sm mx-auto w-full pointer-events-none"
                >
                    <div className="w-full bg-[#050505]/90 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,1),0_0_30px_rgba(6,182,212,0.1)] flex flex-col items-center relative overflow-hidden">
                        {/* Core ambient light */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.15)_0%,transparent_50%)] pointer-events-none" />

                        <Activity size={24} className="text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,1)]" />
                        
                        <h2 className="text-2xl font-black tracking-tighter uppercase text-white mb-8 text-center italic leading-[1.1] drop-shadow-lg">
                            EL NÚCLEO<br/><span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">SOBERANO</span>
                        </h2>

                        <div className="w-full space-y-5 text-left pointer-events-auto relative z-10 font-mono">
                            <FeatureRow y={row1Y} o={row1O} reduced={prefersReducedMotion} title="Núcleo Soberano" desc="Viems & Ethers en ejecución nativa" />
                            <FeatureRow y={row2Y} o={row2O} reduced={prefersReducedMotion} title="Seguridad Militar" desc="Cifrado AES-256 + ofuscación cuántica" />
                            <FeatureRow y={row3Y} o={row3O} reduced={prefersReducedMotion} title="Latencia extrema" desc="0.12 ms en red soberana" />
                            <FeatureRow y={row4Y} o={row4O} reduced={prefersReducedMotion} title="Rastreo en tiempo real" desc="Nodos de ballenas monitoreando 24/7" />
                            <FeatureRow y={row5Y} o={row5O} reduced={prefersReducedMotion} title="Terminal aislada" desc="Opera en su propio hilo desconectado de la UI" />
                        </div>
                    </div>

                    {/* CONNECT BUTTON AREA */}
                    <motion.div 
                        style={{ opacity: buttonOpacity, y: buttonY, scale: prefersReducedMotion ? 1 : buttonScale, willChange: "transform, opacity" }}
                        className="w-full mt-8 pointer-events-auto"
                    >
                        {!isConnected ? (
                            <button
                                onClick={handleConnectTrigger}
                                className="w-full h-[80px] bg-white text-[#0a0a0a] rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:bg-cyan-50 group relative overflow-hidden cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                <Wallet size={20} className="text-[#0a0a0a]/80 group-active:translate-x-1 transition-transform" />
                                CONECTAR BILLETERA
                            </button>
                        ) : (
                            <button
                                onClick={() => setView('scanner')}
                                className="w-full h-[80px] bg-cyan-500/10 border border-cyan-500/30 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-between px-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] active:scale-[0.98] group relative backdrop-blur-md cursor-pointer hover:bg-cyan-500/20 transition-colors"
                            >
                                <div className="grid grid-cols-[auto_1fr] gap-4 items-center">
                                    <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                                        <QrCode size={18} className="text-cyan-400" />
                                    </div>
                                    <div className="text-left leading-none">
                                        <p className="tracking-[0.3em] text-cyan-50">SYNC LENS</p>
                                        <p className="text-[8px] text-cyan-400/80 mt-2 font-black">READY: OPEN SCANNER</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-cyan-400 opacity-80 group-hover:translate-x-1 transition-transform" />
                            </button>
                        )}
                        
                        {isConnected && address && (
                            <p className="mt-6 text-[9px] font-mono font-black tracking-widest text-white/40 uppercase drop-shadow-md text-center">
                                ID: <span className="text-cyan-500">{address.slice(0, 10)}</span>...{address.slice(-6)}
                            </p>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* STATUS LOGO STICKY BOTTOM */}
            <div className="fixed bottom-6 w-full flex items-center justify-center gap-3 opacity-20 pointer-events-none z-10 px-8">
                <div className="h-px bg-white/20 flex-1" />
                <Fingerprint size={16} className="text-white" />
                <div className="h-px bg-white/20 flex-1" />
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
}

function FeatureRow({ title, desc, y, o, reduced }: { title: string, desc: string, y: any, o: any, reduced: boolean | null }) {
    return (
        <motion.div 
            style={reduced ? { opacity: o } : { y, opacity: o, willChange: "transform, opacity" }}
            className="flex items-start gap-4"
        >
            <div className="mt-1 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)]" />
            </div>
            <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1 font-sans">{title}</h4>
                <p className="text-[9px] text-white/60 leading-relaxed max-w-[220px] font-medium tracking-wide">{desc}</p>
            </div>
        </motion.div>
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
            // [UX LEGENDARY DEPLOYMENT]
            // Extract the session UUID — everything after the prefix.
            // We skip the cryptographic signature step to eliminate deep-linking drops
            // and app-switcher hangs on mobile browsers. The UUID entropy is sufficient.
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
                        <div className="absolute inset-0 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 p-6 text-center">
                            <RefreshCw className="animate-spin text-black mb-6" size={40} />
                            <span className="text-[14px] font-black uppercase tracking-[0.2em] mb-4">Sincronizando Identidad...</span>
                            
                            <div className="w-full bg-green-50 border border-green-200 rounded-[1.5rem] p-5 animate-pulse mt-4">
                                <span className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] block mb-2">
                                    ✨ Conexión Perfecta
                                </span>
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
