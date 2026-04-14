"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  ExternalLink, 
  Shield, 
  ArrowRight, 
  Loader2, 
  Twitter, 
  QrCode, 
  Wallet, 
  Zap, 
  Activity, 
  Lock, 
  Smartphone, 
  Cpu, 
  Fingerprint, 
  Search,
  ChevronRight,
  Globe
} from "lucide-react";
import dynamic from "next/dynamic";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { useAppKit } from "@reown/appkit/react";
import { WavePatternOverlay } from "@/components/layout/WavePatternOverlay";
import { Html5QrcodeScanner } from "html5-qrcode";

// QR code renderer using qrcode.react
const QRCode = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false });

// ── Shared Sub-Components ────────────────────────────────────────────────────────
function InstitutionalBadge({ children, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/[0.03] border border-black/5">
      {Icon && <Icon size={8} className="text-black/40" />}
      <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em] text-black/40">{children}</span>
    </div>
  );
}

function WalletButton({ logo, name, badge, onClick, loading, delay = 0, premium = false }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={loading ? undefined : onClick}
      className={`group relative w-full flex items-center justify-between p-4 rounded-[24px] border transition-all duration-400 ${
        premium 
          ? 'bg-[#050505] border-[#050505] text-white shadow-xl shadow-black/10' 
          : 'bg-white/40 hover:bg-white border-black/[0.06] hover:border-black/20 text-[#050505] shadow-sm hover:shadow-lg'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center p-2 shadow-sm transition-transform duration-500 group-hover:scale-110 ${
          premium ? 'bg-white/10 border border-white/10' : 'bg-white border border-black/5'
        }`}>
          {typeof logo === 'string' ? (
            <img src={logo} alt={name} className="w-full h-full object-contain" />
          ) : (
            logo
          )}
        </div>
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[12px] font-black uppercase tracking-tight">{name}</span>
          <span className={`text-[9px] font-mono uppercase tracking-widest mt-0.5 ${premium ? 'text-white/40' : 'text-black/30'}`}>
            {badge}
          </span>
        </div>
      </div>
      <ArrowRight size={14} className={`transition-all duration-500 group-hover:translate-x-1 ${premium ? 'text-white/20' : 'text-black/10'}`} />
    </motion.button>
  );
}

// ── Main Controller ─────────────────────────────────────────────────────────────
export default function ConnectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { open: openAppKit } = useAppKit();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'QR' | 'DIRECT'>('QR');
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED">("IDLE");
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Handshake session generation
  const fetchSession = useCallback(async () => {
    try {
      setSyncStatus("AWAITING");
      const res = await fetch("/api/auth/qr-session", { method: "POST" });
      const data = await res.json();
      if (data.sessionId) setQrSession(data.sessionId);
    } catch (e) { console.error("[AUTH] Handshake Error:", e); }
  }, []);

  useEffect(() => { if (!qrSession) fetchSession(); }, [qrSession, fetchSession]);

  // Auth Bridge Cycle
  useEffect(() => {
    if (!qrSession || syncStatus === "SYNCED") return;
    const bridge = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-session?id=${qrSession}`);
        const data = await res.json();
        if (data.status === 'complete' && data.address) {
          setSyncStatus("SYNCED");
          setIsRedirecting(true);
          clearInterval(bridge);
          setTimeout(() => {
            document.cookie = `sovereign_handshake=${data.address}; path=/; max-age=604800; SameSite=Lax`;
            router.replace("/dashboard");
          }, 1200);
        }
      } catch (e) {}
    }, 2000);
    return () => clearInterval(bridge);
  }, [qrSession, syncStatus, router]);

  // Redirection guard
  useEffect(() => {
    if (isConnected && mounted) {
      const hasHandshake = document.cookie.includes("sovereign_handshake=");
      if (hasHandshake) router.replace("/dashboard");
    }
  }, [isConnected, mounted, router]);

  const handleConnector = (id: string) => {
    const connector = connectors.find(c => c.id === id || c.name.toLowerCase().includes(id));
    if (connector) connect({ connector });
    else openAppKit({ view: 'Connect' });
  };

  const handleAppKit = () => openAppKit({ view: 'Connect' });

  const qrUrl = typeof window !== "undefined"
    ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
    : "";

  if (!mounted) return null;

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#FAF9F6] text-[#050505] relative font-sans select-none">
      <WavePatternOverlay />
      
      {/* ── [PROTOCOL] INSTITUTIONAL HEADER ──────────────────────────────────── */}
      <header className="relative z-[100] h-[68px] flex items-center justify-between px-8 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-black flex items-center justify-center rounded-xl shadow-xl shadow-black/10">
              <img src="/official-whale-monochrome.png" className="w-7 h-7 invert" alt="Whale" />
           </div>
           <div className="flex flex-col leading-none">
              <span className="text-[15px] font-black uppercase tracking-tighter">Whale Alert Network</span>
              <span className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] opacity-30 mt-1">Sovereign Protocol v6.12.0</span>
           </div>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
           <InstitutionalBadge icon={Shield}>Zero Custody</InstitutionalBadge>
           <InstitutionalBadge icon={Lock}>ECDSA Verified</InstitutionalBadge>
           <InstitutionalBadge icon={Cpu}>Metal Ingress</InstitutionalBadge>
        </div>
      </header>

      {/* ── [TERMINAL] MAIN COMMAND CENTER ───────────────────────────────────── */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-6 md:p-12 overflow-hidden">
        
        {/* THE IMMERSIVE 1.09x ZOOM WRAPPER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1.09, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[1040px] h-full max-h-[640px] flex flex-col origin-center"
        >
          
          {/* MOBILE NAVIGATION TABS (MANDATORY FOR FIRST SCREEN) */}
          <div className="lg:hidden w-full max-w-sm mx-auto mb-6 p-1 bg-black/[0.04] backdrop-blur-md rounded-2xl border border-black/5 flex shadow-sm">
            <button 
              onClick={() => setActiveTab('QR')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${activeTab === 'QR' ? 'bg-white text-black shadow-md' : 'text-black/40'}`}
            >
              <QrCode size={14} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">QR Sync</span>
            </button>
            <button 
              onClick={() => setActiveTab('DIRECT')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${activeTab === 'DIRECT' ? 'bg-white text-black shadow-md' : 'text-black/40'}`}
            >
              <Wallet size={14} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest">Connect</span>
            </button>
          </div>

          {/* THE HANDSHAKE CONSOLE */}
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] border border-black/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
            
            {/* ── PANEL L: QR HANDSHAKE & ANALYTICS ── */}
            <div className={`relative p-10 lg:p-14 flex flex-col bg-[#FAF9F6] border-b lg:border-b-0 lg:border-r border-black/[0.06] overflow-hidden ${activeTab === 'QR' ? 'flex' : 'hidden lg:flex'}`}>
              
               {/* Background Layer: Whale Phantom */}
               <div className="absolute -bottom-20 -left-20 opacity-[0.03] pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                 <img src="/official-whale-monochrome.png" className="w-[480px] h-[480px] grayscale" alt="" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <header className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                       <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/30">Syncing Intelligence</p>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight leading-none text-black">
                       Mobile<br /><span className="italic text-black/40">Handshake</span>
                    </h2>
                    <p className="text-[11px] text-black/50 mt-5 font-semibold leading-relaxed max-w-xs">
                      Scan this sovereign coordinate to bridge your mobile identity with this terminal instance via ECDSA.
                    </p>
                  </header>

                  <div className="flex-1 flex flex-col items-center justify-center gap-8">
                     <div className="relative p-7 bg-white rounded-[42px] shadow-2xl shadow-black/5 border border-black/[0.02]">
                        {qrSession ? (
                          <div className="relative">
                             <QRCode value={qrUrl} size={220} level="H" bgColor="#FFFFFF" fgColor="#050505" />
                             {syncStatus === 'SYNCED' && (
                               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                                  <CheckCircle2 size={48} className="text-emerald-500" />
                               </motion.div>
                             )}
                          </div>
                        ) : (
                          <div className="w-[220px] h-[220px] flex items-center justify-center bg-black/[0.01] rounded-2xl">
                             <Loader2 size={32} className="animate-spin text-black/10" />
                          </div>
                        )}
                        {/* QR Grid Deco */}
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-black/5 rounded-tl-[42px]" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-black/5 rounded-br-[42px]" />
                     </div>

                     <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-black/5 shadow-sm">
                           <div className={`w-2 h-2 rounded-full ${syncStatus === 'SYNCED' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-black/20 animate-pulse'}`} />
                           <span className="text-[9px] font-mono font-black uppercase tracking-widest text-black/60">
                             {isRedirecting ? 'IDENTITY VERIFIED' : qrSession ? (syncStatus === 'SYNCED' ? 'SESSION LINKED' : 'AWAITING RESPONSE') : 'NEGOTIATING…'}
                           </span>
                        </div>
                        {qrSession && !isRedirecting && (
                          <button onClick={fetchSession} className="text-[8px] font-mono font-bold uppercase tracking-[0.4em] text-black/20 hover:text-black/60 transition-colors">
                            REGENERATE HANDSHAKE →
                          </button>
                        )}
                     </div>
                  </div>

                  <footer className="mt-8 pt-8 border-t border-black/[0.04]">
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                           <p className="text-[8px] font-mono font-black uppercase tracking-widest text-black/30 mb-2">Protocols Supported</p>
                           <p className="text-[9px] font-bold text-black/60 uppercase tracking-tight">WalletConnect V2 · SSE · ECDSA</p>
                        </div>
                        <div className="flex justify-end items-center gap-4 opacity-30">
                           <Twitter size={14} />
                           <Smartphone size={14} />
                           <Activity size={14} />
                        </div>
                     </div>
                  </footer>
               </div>
            </div>

            {/* ── PANEL R: DIRECT CONNECT & PROVIDERS ── */}
            <div className={`p-10 lg:p-14 flex flex-col bg-white overflow-hidden ${activeTab === 'DIRECT' ? 'flex' : 'hidden lg:flex'}`}>
               <header className="mb-10">
                  <div className="flex items-center gap-2 mb-3">
                     <span className="w-1.5 h-1.5 rounded-full bg-black/10" />
                     <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/30">Direct Ingress</p>
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter leading-none text-[#050505]">
                     Protocol access<br /><span className="italic text-black/40">Connect Wallet</span>
                  </h2>
               </header>

               <div className="flex flex-col gap-3.5 flex-1">
                  <WalletButton 
                    logo="/wallets/metamask.svg" 
                    name="MetaMask" 
                    badge="Browser Injected · SDK" 
                    onClick={() => handleConnector('injected')} 
                    loading={isPending} 
                    delay={0.15} 
                  />
                  <WalletButton 
                    logo="/wallets/coinbase.png" 
                    name="Coinbase Wallet" 
                    badge="MPC Smart Wallet" 
                    onClick={() => handleConnector('coinbase')} 
                    delay={0.2} 
                  />
                  <div className="grid grid-cols-2 gap-3.5">
                    <WalletButton 
                      logo="/wallets/rainbow.png" 
                      name="Rainbow" 
                      badge="Mobile" 
                      onClick={handleAppKit} 
                      delay={0.25} 
                    />
                    <WalletButton 
                      logo="/wallets/rabby.png" 
                      name="Rabby" 
                      badge="Advanced" 
                      onClick={() => handleConnector('rabby')} 
                      delay={0.3} 
                    />
                  </div>
                  
                  {/* EXPANDED MOBILE SUITE FOR HIGH PRO 3.1 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                    <WalletButton 
                      logo={<QrCode size={18} className="text-white" />} 
                      name="WalletConnect" 
                      badge="Search +550 Wallets" 
                      onClick={handleAppKit} 
                      delay={0.35} 
                      premium={true}
                    />
                  </div>
               </div>

               <div className="mt-10 p-5 bg-[#FAF9F6] border border-black/5 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-sm shrink-0">
                     <Fingerprint size={18} className="text-black/40" />
                  </div>
                  <p className="text-[10px] text-black/50 font-semibold leading-relaxed">
                     By connecting, you verify ownership over your sovereign keys. Private data is encrypted via ECDSA proofs. No cookies or databases touch your assets.
                  </p>
               </div>
            </div>

          </div>
        </motion.div>
      </main>

      {/* ── [FOOTER] INSTITUTIONAL MARK ───────────────────────────────────────── */}
      <footer className="relative z-[100] h-[72px] px-10 border-t border-black/[0.04] bg-white/70 backdrop-blur-xl flex items-center justify-between">
         <div className="flex items-center gap-10">
            <span className="text-[9px] font-mono font-black uppercase tracking-[0.5em] text-black/20">© Whale Alert Network</span>
            <div className="hidden lg:flex items-center gap-6">
               <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors cursor-pointer">Security Protocol</span>
               <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors cursor-pointer">Identity Mesh</span>
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            {['ETHEREUM', 'ARBITRUM', 'BASE', 'POLYGON'].map(n => (
              <span key={n} className="hidden sm:inline-block text-[8px] font-mono font-black tracking-[0.25em] text-black/40 border border-black/[0.03] rounded-full px-3 py-1 bg-black/[0.02]">{n}</span>
            ))}
            <div className="w-px h-6 bg-black/[0.06] mx-2" />
            <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#050505]/60 hover:text-black transition-colors">
               Legal Framework
               <ChevronRight size={10} />
            </button>
         </div>
      </footer>
    </div>
  );
}
