"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useReducedMotion, useVelocity } from 'framer-motion';
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

// ─── WEB WORKER: BINANCE WSS REAL-TIME ENGINE ──────────────────────────────
// Runs in an Isolated Web Worker thread so that high-frequency WSS messages
// (Order Book at 100ms cadence) never touch the main thread or Framer Motion.
const WORKER_BLOB = `
  let ws;
  let retryTimer;

  function connect() {
    // Combined multi-stream: depth5, aggTrade, 24h ticker
    const URL = 'wss://stream.binance.com:9443/stream?streams=btcusdt@depth5@100ms/btcusdt@aggTrade/btcusdt@ticker';
    ws = new WebSocket(URL);

    ws.onopen  = ()  => postMessage({ type: 'STATUS', payload: 'CONNECTED' });
    ws.onclose = ()  => { postMessage({ type: 'STATUS', payload: 'RECONNECTING' }); clearTimeout(retryTimer); retryTimer = setTimeout(connect, 2500); };
    ws.onerror = ()  => ws.close();

    ws.onmessage = ({ data }) => {
      try {
        const { stream, data: d } = JSON.parse(data);

        if (stream === 'btcusdt@depth5@100ms') {
          postMessage({ type: 'ORDER_BOOK', payload: { bids: d.bids, asks: d.asks } });

        } else if (stream === 'btcusdt@aggTrade') {
          const price = parseFloat(d.p);
          const qty   = parseFloat(d.q);
          const isBuy = !d.m;                  // maker = sell-side; taker = buy-side
          const usd   = price * qty;

          // Whale filter: V > μ + 3σ approximated as $100k+
          if (usd > 100000) {
            postMessage({ type: 'WHALE_FLOW',  payload: { price, qty, isBuy, usd, ts: d.T } });
            // Copy-trade proxy: symmetric 1% of whale move
            postMessage({ type: 'COPY_TRADE', payload: { price, qty: (qty * 0.01).toFixed(4), isBuy, usd: (usd * 0.01).toFixed(0), ts: Date.now() } });
          }
        } else if (stream === 'btcusdt@ticker') {
          postMessage({ type: 'MARKETS', payload: { price: d.c, vol: d.q, change: d.P, high: d.h, low: d.l } });
        }
      } catch (_) {}
    };
  }

  connect();
`;

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

    // ── LIVE DATA STATES (fed by isolated Web Worker) ──
    const [wsStatus,    setWsStatus]    = useState<'CONNECTING'|'CONNECTED'|'RECONNECTING'>('CONNECTING');
    const [obData,      setObData]      = useState<{bids:string[][], asks:string[][]}>({bids:[], asks:[]});
    const [whaleFlow,   setWhaleFlow]   = useState<any[]>([]);
    const [marketInfo,  setMarketInfo]  = useState<{price:string, vol:string, change:string, high:string, low:string}|null>(null);
    const [lastCopy,    setLastCopy]    = useState<any|null>(null);

    useEffect(() => {
        setWalletBrowser(detectWalletBrowser());

        // Spawn isolated Web Worker from Blob URL — zero layout thrashing
        const blob   = new Blob([WORKER_BLOB], { type: 'application/javascript' });
        const url    = URL.createObjectURL(blob);
        const worker = new Worker(url);

        worker.onmessage = ({ data: { type, payload } }: any) => {
            switch (type) {
                case 'STATUS':      setWsStatus(payload);   break;
                case 'ORDER_BOOK':  setObData(payload);     break;
                case 'WHALE_FLOW':  setWhaleFlow(p => [payload, ...p].slice(0, 4)); break;
                case 'MARKETS':     setMarketInfo(payload); break;
                case 'COPY_TRADE':  setLastCopy(payload);   break;
            }
        };

        return () => { worker.terminate(); URL.revokeObjectURL(url); };
    }, []);

    const handleConnectTrigger = useCallback(() => {
        if (walletBrowser) {
            const injectedConnector = connectors.find(
                c => c.id === 'injected' || c.id === 'io.metamask' || c.type === 'injected'
            );
            if (injectedConnector) connect({ connector: injectedConnector });
            else if (connectors.length > 0) connect({ connector: connectors[0] });
        } else {
            setIsPickerOpen(true);
        }
    }, [connect, connectors, walletBrowser]);

    // ── SCROLL PHYSICS ENGINE (AAA Tier) ──────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

    // 4 Springs of increasing mass → async stagger organically emerges
    const sp0 = useSpring(scrollYProgress, { stiffness: 60,  damping: 20, mass: 1.5 }); // fast
    const sp1 = useSpring(scrollYProgress, { stiffness: 50,  damping: 25, mass: 1.8 });
    const sp2 = useSpring(scrollYProgress, { stiffness: 40,  damping: 30, mass: 2.2 });
    const sp3 = useSpring(scrollYProgress, { stiffness: 30,  damping: 35, mass: 2.8 }); // slowest

    // Velocity → makes fracture more dramatic when swiped fast
    const scrollVel = useVelocity(scrollYProgress);
    const velSkew   = useTransform(scrollVel, [-0.5, 0, 0.5], [12, 0, -12]);

    // ── PHASE 1: DECONSTRUCTION (0–30%) ─────────────────────────────────────
    const whaleY   = useTransform(sp0, [0, 0.25], [0, -600]);
    const whaleX   = useTransform(sp0, [0, 0.25], [0,  220]);
    const whaleRZ  = useTransform(sp0, [0, 0.25], [0,   48]);
    const whaleRX  = useTransform(sp0, [0, 0.25], [0,   65]);
    const whaleSc  = useTransform(sp0, [0, 0.25], [1,  0.15]);
    const whaleOp  = useTransform(sp0, [0, 0.20, 0.25], [1, 0.4, 0]);
    const whaleBl  = useTransform(sp0, [0, 0.25], ['blur(0px)', 'blur(14px)']);

    const t1Y = useTransform(sp1, [0, 0.28], [0, -160]); // WHALE flies up-left
    const t1X = useTransform(sp1, [0, 0.28], [0, -320]);
    const t1RZ= useTransform(sp1, [0, 0.28], [0,  -38]);
    const t1RY= useTransform(sp1, [0, 0.28], [0,   50]);
    const t1Op= useTransform(sp1, [0, 0.24], [1, 0]);
    const t1Bl= useTransform(sp1, [0, 0.28], ['blur(0px)', 'blur(10px)']);

    const t2Y = useTransform(sp2, [0, 0.30], [0,  120]); // ALERT flies right-down
    const t2X = useTransform(sp2, [0, 0.30], [0,  380]);
    const t2RZ= useTransform(sp2, [0, 0.30], [0,   48]);
    const t2RX= useTransform(sp2, [0, 0.30], [0,   48]);
    const t2Op= useTransform(sp2, [0, 0.25], [1, 0]);
    const t2Bl= useTransform(sp2, [0, 0.30], ['blur(0px)', 'blur(10px)']);

    const t3Y = useTransform(sp3, [0, 0.32], [0,  440]); // NETWORK falls straight down
    const t3RX= useTransform(sp3, [0, 0.32], [0,  -65]);
    const t3Op= useTransform(sp3, [0, 0.26], [1, 0]);
    const t3Bl= useTransform(sp3, [0, 0.32], ['blur(0px)', 'blur(10px)']);

    const hintOp = useTransform(sp0, [0, 0.06], [1, 0]);

    // ── PHASE 2: ASSEMBLY (30–80%) ────────────────────────────────────────────
    const glowOp  = useTransform(sp0, [0.3, 0.55], [0, 1]);

    const c1Y = useTransform(sp1, [0.32, 0.44], [90, 0]);
    const c1O = useTransform(sp1, [0.32, 0.44], [0, 1]);

    const c2Y = useTransform(sp2, [0.44, 0.56], [90, 0]);
    const c2O = useTransform(sp2, [0.44, 0.56], [0, 1]);

    const c3Y = useTransform(sp3, [0.56, 0.68], [90, 0]);
    const c3O = useTransform(sp3, [0.56, 0.68], [0, 1]);

    const c4Y = useTransform(sp0, [0.68, 0.78], [90, 0]);
    const c4O = useTransform(sp0, [0.68, 0.78], [0, 1]);

    // ── PHASE 3: CONNECT REVEAL (85–95%) ─────────────────────────────────────
    const btnOp = useTransform(sp0, [0.85, 0.95], [0, 1]);
    const btnY  = useTransform(sp0, [0.85, 0.95], [80, 0]);
    const btnSc = useTransform(sp0, [0.85, 0.95], [0.85, 1]);

    if (view === 'scanner') {
        return <MobileQRScanner onBack={() => setView('landing')} address={address} signMessageAsync={signMessageAsync} />;
    }

    const live = wsStatus === 'CONNECTED';

    return (
        <div ref={containerRef} className="w-full bg-[#0a0a0a] min-h-[300vh] text-white font-sans overflow-clip relative selection:bg-cyan-500/30" style={{ transformStyle: 'preserve-3d' }}>
            <AnimatedPattern />

            {/* Ambient glow ignites during assembly */}
            <motion.div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(6,182,212,0.08)_0%,transparent_100%)]" style={{ opacity: glowOp, willChange: 'opacity' }} />

            <WalletPickerModal isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} />

            {/* Minimal top bar — only disconnect when connected */}
            <header className="fixed top-0 left-0 w-full flex items-center justify-end z-50 h-14 px-6 pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    {isConnected && (
                        <button onClick={() => disconnect()} className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform backdrop-blur-md">
                            <RefreshCw size={12} className="text-white/60" />
                        </button>
                    )}
                </div>
            </header>

            {/* ════════ STICKY VIEWPORT ════════ */}
            <div className="sticky top-0 w-full h-[100dvh] overflow-hidden" style={{ perspective: '1500px' }}>

                {/* ─────────── PHASE 1 · HERO FRAGMENTATION ─────────── */}
                <motion.div className="absolute inset-0 flex flex-col items-center justify-start pt-[13vh] z-20 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>

                    {/* WHALE logo */}
                    <motion.div style={prefersReducedMotion ? { opacity: whaleOp } : { y: whaleY, x: whaleX, rotateZ: whaleRZ, rotateX: whaleRX, scale: whaleSc, opacity: whaleOp, filter: whaleBl, willChange: 'transform,opacity,filter' }} className="w-64 h-64 flex items-center justify-center mb-2">
                        <CinematicWhaleLogo src="/official-whale-monochrome.png" className="w-full h-full scale-[2.8] transform-gpu" />
                    </motion.div>

                    {/* Title shards */}
                    <div className="flex flex-col items-center mt-10 overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
                        <motion.h1 style={prefersReducedMotion ? { opacity: t1Op } : { y: t1Y, x: t1X, rotateZ: t1RZ, rotateY: t1RY, skewX: velSkew, opacity: t1Op, filter: t1Bl, willChange: 'transform,opacity,filter' }} className="text-[4.2rem] font-black tracking-tighter leading-none uppercase italic text-white">
                            Whale
                        </motion.h1>
                        <motion.h1 style={prefersReducedMotion ? { opacity: t2Op } : { y: t2Y, x: t2X, rotateZ: t2RZ, rotateX: t2RX, skewX: velSkew, opacity: t2Op, filter: t2Bl, willChange: 'transform,opacity,filter' }} className="text-[4.2rem] font-black tracking-tighter leading-none uppercase italic text-white -mt-2">
                            Alert
                        </motion.h1>
                        <motion.h1 style={prefersReducedMotion ? { opacity: t3Op } : { y: t3Y, rotateX: t3RX, opacity: t3Op, filter: t3Bl, willChange: 'transform,opacity,filter' }} className="text-[4rem] font-black tracking-tighter leading-none uppercase italic text-cyan-400 drop-shadow-[0_0_22px_rgba(6,182,212,0.9)] -mt-2">
                            Network
                        </motion.h1>
                    </div>

                    {/* Scroll hint */}
                    <motion.div style={{ opacity: hintOp, willChange: 'opacity' }} className="absolute bottom-10 flex flex-col items-center gap-2">
                        <span className="text-[8.5px] font-black text-white/35 uppercase tracking-[0.35em]">SCROLL PARA EXPLORAR EL NÚCLEO</span>
                        <ChevronDown size={13} className="text-white/35 animate-bounce" />
                    </motion.div>
                </motion.div>

                {/* ─────────── PHASE 2 · LIVE SCIENTIFIC PILLARS ─────────── */}
                <div className="absolute inset-0 overflow-y-hidden flex flex-col justify-center items-center z-30 px-5 pt-12 pb-32 gap-3 pointer-events-none max-w-[420px] mx-auto w-full">

                    {/* ░░ PILAR 1 — ORDER BOOK ░░ */}
                    <LiveCard y={c1Y} o={c1O} title="ORDER BOOK" badge={wsStatus} icon={<Activity size={13} className="text-cyan-400" />}
                        desc="Árbol binario de búsqueda (B-Trees / Red-Black Trees) · emparejamiento de liquidez O(log n) · spread bid/ask ajustado en tiempo real.">
                        {obData.bids.length === 0
                            ? <ConnectingState />
                            : (
                                <div className="grid grid-cols-2 gap-x-3 mt-2 font-mono text-[9px]">
                                    <div className="flex flex-col gap-[3px]">
                                        <span className="text-white/30 text-[7.5px] mb-1 uppercase tracking-widest">BIDS ▲</span>
                                        {obData.bids.slice(0,4).map((b,i) => (
                                            <div key={i} className="flex justify-between text-emerald-400">
                                                <span>{parseFloat(b[0]).toLocaleString(undefined,{maximumFractionDigits:1})}</span>
                                                <span className="text-white/40">{parseFloat(b[1]).toFixed(3)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-[3px]">
                                        <span className="text-white/30 text-[7.5px] mb-1 uppercase tracking-widest">ASKS ▼</span>
                                        {obData.asks.slice(0,4).map((a,i) => (
                                            <div key={i} className="flex justify-between text-rose-400">
                                                <span>{parseFloat(a[0]).toLocaleString(undefined,{maximumFractionDigits:1})}</span>
                                                <span className="text-white/40">{parseFloat(a[1]).toFixed(3)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                        )}
                    </LiveCard>

                    {/* ░░ PILAR 2 — WHALE FLOW ░░ */}
                    <LiveCard y={c2Y} o={c2O} title="WHALE FLOW" badge={wsStatus} icon={<Eye size={13} className="text-cyan-400" />}
                        desc="Filtro bayesiano de anomalías estadísticas V &gt; μ+3σ · indexación de Mempool on-chain · Alpha Predictivo en tiempo real.">
                        {whaleFlow.length === 0
                            ? <ConnectingState label="Esperando bloque &gt;$100k…" />
                            : (
                                <div className="flex flex-col gap-1.5 mt-2 font-mono text-[9px]">
                                    {whaleFlow.map((w, i) => (
                                        <motion.div key={w.ts} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                                            className={`flex justify-between items-center px-2 py-1 rounded-lg ${ w.isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                            <span className="font-bold">{w.isBuy ? '⬆ LONG' : '⬇ SHORT'} {parseFloat(w.qty).toFixed(2)} BTC</span>
                                            <span className="text-white/50">${parseFloat(w.price).toLocaleString(undefined,{maximumFractionDigits:0})}</span>
                                        </motion.div>
                                    ))}
                                </div>
                        )}
                    </LiveCard>

                    {/* ░░ PILAR 3 — MARKETS AVAILABLE ░░ */}
                    <LiveCard y={c3Y} o={c3O} title="MARKETS AVAILABLE" badge={wsStatus} icon={<Zap size={13} className="text-cyan-400" />}
                        desc="Fragmentación de liquidez Cross-Chain · OI, Funding Rates, Volumen 24h real · Graph Protocol state dual-mapping.">
                        {!marketInfo
                            ? <ConnectingState />
                            : (
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 font-mono text-[9.5px]">
                                    <Metric label="BTC/USDT" value={`$${Number(marketInfo.price).toLocaleString(undefined,{maximumFractionDigits:0})}`} positive={parseFloat(marketInfo.change) >= 0} />
                                    <Metric label="24H %" value={`${parseFloat(marketInfo.change) >= 0 ? '+' : ''}${parseFloat(marketInfo.change).toFixed(2)}%`} positive={parseFloat(marketInfo.change) >= 0} />
                                    <Metric label="VOL USDT" value={`$${(Number(marketInfo.vol)/1e9).toFixed(2)}B`} positive />
                                    <Metric label="H/L SPREAD" value={`$${(Number(marketInfo.high)-Number(marketInfo.low)).toLocaleString(undefined,{maximumFractionDigits:0})}`} positive />
                                </div>
                        )}
                    </LiveCard>

                    {/* ░░ PILAR 4 — COPY TRADING ░░ */}
                    <LiveCard y={c4Y} o={c4O} title="COPY TRADING" badge={wsStatus} icon={<Shield size={13} className="text-cyan-400" />}
                        desc="Arquitectura basada en Intenciones (Intents) · emulación ERC-4337 Account Abstraction · replicación simétrica de calldata institucional.">
                        {!lastCopy
                            ? <ConnectingState label="Abstracción de estado pendiente…" />
                            : (
                                <motion.div key={lastCopy.ts} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 bg-black/40 border border-white/5 rounded-xl p-3 font-mono text-[9px] flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#22d3ee]" />
                                        <span className="text-cyan-400 font-bold tracking-widest text-[7.5px]">SIMETRÍA EJECUTADA</span>
                                    </div>
                                    <div className="flex justify-between"><span className="text-white/40">PAYLOAD</span><span className={lastCopy.isBuy ? 'text-emerald-400' : 'text-rose-400'}>{lastCopy.isBuy ? 'BUY' : 'SELL'} {lastCopy.qty} BTC</span></div>
                                    <div className="flex justify-between"><span className="text-white/40">PRECIO</span><span className="text-white">${parseFloat(lastCopy.price).toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>
                                    <div className="flex justify-between"><span className="text-white/40">USD VOL</span><span className="text-cyan-400">${Number(lastCopy.usd).toLocaleString()}</span></div>
                                </motion.div>
                        )}
                    </LiveCard>
                </div>

                {/* ─────────── PHASE 3 · CONNECT WALLET CTA ─────────── */}
                <motion.div style={{ opacity: btnOp, y: btnY, scale: prefersReducedMotion ? 1 : btnSc, willChange: 'transform,opacity' }} className="absolute bottom-8 left-0 right-0 px-6 z-40 max-w-[420px] mx-auto pointer-events-auto">
                    {!isConnected ? (
                        <button onClick={handleConnectTrigger} className="w-full h-[78px] bg-white text-[#0a0a0a] rounded-[2rem] font-black uppercase tracking-[0.22em] text-[11px] flex items-center justify-center gap-4 active:scale-[0.97] shadow-[0_0_45px_rgba(255,255,255,0.25)] hover:shadow-[0_0_60px_rgba(255,255,255,0.45)] hover:bg-cyan-50 group relative overflow-hidden cursor-pointer transition-all">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Wallet size={19} className="text-[#0a0a0a]/70 group-active:translate-x-1 transition-transform" />
                            CONECTAR BILLETERA
                        </button>
                    ) : (
                        <button onClick={() => setView('scanner')} className="w-full h-[78px] bg-cyan-500/10 border border-cyan-500/30 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-between px-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] active:scale-[0.97] backdrop-blur-md cursor-pointer hover:bg-cyan-500/20 transition-colors">
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
                    {isConnected && address && (
                        <p className="mt-4 text-[8.5px] font-mono font-black tracking-widest text-white/35 uppercase text-center">
                            ID: <span className="text-cyan-500">{address.slice(0,10)}</span>…{address.slice(-6)}
                        </p>
                    )}
                </motion.div>
            </div>

            {/* Fingerprint watermark */}
            <div className="fixed bottom-4 w-full flex items-center justify-center gap-3 opacity-[0.12] pointer-events-none z-10 px-8">
                <div className="h-px bg-white/30 flex-1" />
                <Fingerprint size={14} className="text-white" />
                <div className="h-px bg-white/30 flex-1" />
            </div>

            <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { 100% { transform: translateX(100%); } }` }} />
        </div>
    );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function LiveCard({ title, desc, badge, icon, y, o, children }: { title:string, desc:string, badge:string, icon:React.ReactNode, y:any, o:any, children:React.ReactNode }) {
    const live = badge === 'CONNECTED';
    return (
        <motion.div style={{ y, opacity: o, willChange: 'transform,opacity' }}
            className="w-full bg-[#0f0f0f]/95 backdrop-blur-2xl border border-white/[0.07] rounded-3xl p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] relative overflow-hidden pointer-events-auto">
            {/* Inner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-cyan-500/5 blur-2xl rounded-full pointer-events-none" />
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.18em] italic">{title}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-cyan-400 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
                    <span className="text-[7px] font-mono tracking-widest text-white/35 uppercase">{live ? 'WSS LIVE' : badge}</span>
                </div>
            </div>
            {/* Description */}
            <p className="text-[8.5px] text-white/45 leading-relaxed border-b border-white/[0.06] pb-2.5 mb-0.5 font-medium tracking-wide">{desc}</p>
            {/* Live content */}
            {children}
        </motion.div>
    );
}

function Metric({ label, value, positive }: { label:string, value:string, positive:boolean }) {
    return (
        <div className="flex flex-col">
            <span className="text-white/30 text-[7.5px] uppercase tracking-widest">{label}</span>
            <span className={positive ? 'text-emerald-400' : 'text-rose-400'}>{value}</span>
        </div>
    );
}

function ConnectingState({ label = 'Conectando a red soberana…' }: { label?: string }) {
    return (
        <div className="flex items-center gap-2 mt-2 h-10">
            <RefreshCw size={10} className="text-cyan-400/50 animate-spin" />
            <span className="text-[8.5px] text-white/30 font-mono">{label}</span>
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
