"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { useRouter } from "next/navigation";
import { 
  Shield, 
  ArrowRight, 
  Loader2, 
  Twitter, 
  QrCode, 
  Wallet, 
  Lock, 
  Cpu, 
  Fingerprint, 
  Github
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAppKit } from "@reown/appkit/react";

// QR code renderer using qrcode.react
const QRCode = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false });

// ── Institutional Components ───────────────────────────────────────────────────
function InstitutionalBadge({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-black/5 shadow-sm">
      {Icon && <Icon size={10} className="text-black/60" />}
      <span className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-black/60">{children}</span>
    </div>
  );
}

function WalletButton({ logo, name, badge, onClick, loading, delay = 0 }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={loading ? undefined : onClick}
      className="group relative w-full flex items-center gap-5 p-5 bg-white/60 hover:bg-white backdrop-blur-xl border border-black/[0.04] hover:border-black/20 rounded-[32px] transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1 text-[#050505]"
    >
      <div className="w-14 h-14 rounded-2xl bg-white border border-black/[0.04] flex items-center justify-center p-3 shadow-sm group-hover:scale-110 transition-transform duration-700">
        <img src={logo} alt={name} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[14px] font-black uppercase tracking-tight leading-none">{name}</p>
        <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest mt-1.5">{badge}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
        <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
      </div>
    </motion.button>
  );
}

// ── Main Controller ─────────────────────────────────────────────────────────────
export default function ConnectPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { open: openAppKit } = useAppKit();

  const [mounted, setMounted] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED">("IDLE");

  useEffect(() => { setMounted(true); }, []);

  const fetchSession = useCallback(async () => {
    try {
      setSyncStatus("AWAITING");
      const res = await fetch("/api/auth/qr-session", { method: "POST" });
      const data = await res.json();
      if (data.sessionId) setQrSession(data.sessionId);
    } catch (e) { console.error("[AUTH] Handshake Error:", e); }
  }, []);

  useEffect(() => { if (!qrSession) fetchSession(); }, [qrSession, fetchSession]);

  useEffect(() => {
    if (!qrSession || syncStatus === "SYNCED") return;
    const bridge = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr-session?id=${qrSession}`);
        const data = await res.json();
        if (data.status === 'complete' && data.address) {
          setSyncStatus("SYNCED");
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

  const qrUrl = typeof window !== "undefined"
    ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
    : "";

  if (!mounted) return null;

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#FAF9F6] text-[#050505] relative font-sans select-none">
      
      {/* ── LAYER 1: BACKDROP WAVE WALLPAPER (IMAGE 1) ────────────────────── */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/waves-handshake.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.95,
          mixBlendMode: 'multiply'
        }}
      />

      {/* ── [PROTOCOL] INSTITUTIONAL HEADER ────────────────────────────────── */}
      <header className="relative z-[100] h-[72px] flex items-center justify-between px-10 border-b border-black/[0.04] bg-white/60 backdrop-blur-2xl">
        <div className="flex items-center gap-5">
           <div className="w-11 h-11 bg-black flex items-center justify-center rounded-2xl shadow-xl shadow-black/10">
              <img src="/official-whale-monochrome.png" className="w-8 h-8 invert" alt="Whale" />
           </div>
           <div className="flex flex-col leading-none">
              <span className="text-[17px] font-black uppercase tracking-tighter">Whale Alert Network</span>
              <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] opacity-30 mt-1.5">Sovereign Terminal v6.12.0</span>
           </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10">
           <InstitutionalBadge icon={Shield}>Zero Custody</InstitutionalBadge>
           <InstitutionalBadge icon={Lock}>ECDSA Verified</InstitutionalBadge>
           <InstitutionalBadge icon={Cpu}>Protocol Ingress</InstitutionalBadge>
        </div>
      </header>

      {/* ── [TERMINAL] MAIN COMMAND CENTER ─────────────────────────────────── */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-8">
        
        {/* THE IMMERSIVE 1.09x ZOOM HANDSHAKE WRAPPER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1.09, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[1100px] h-full max-h-[680px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] border border-black/10 shadow-[0_50px_120px_-30px_rgba(0,0,0,0.15)] overflow-hidden"
        >
            
            {/* ── PANEL L: QR HANDSHAKE (DARK IVORY) ── */}
            <div className="relative p-14 lg:p-20 flex flex-col bg-[#FAF9F6] border-r border-black/[0.04] overflow-hidden">
               {/* Background Layer: Whale Phantom */}
               <div className="absolute -bottom-24 -left-24 opacity-[0.02] pointer-events-none">
                 <img src="/official-whale-monochrome.png" className="w-[520px] h-[520px] grayscale" alt="" />
               </div>

               <div className="relative z-10 flex flex-col h-full">
                  <header className="mb-12">
                    <div className="flex items-center gap-2.5 mb-4">
                       <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                       <p className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-black/30">Intelligence Handshake</p>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter leading-none text-black">
                       Mobile<br /><span className="italic text-black/40">Sync Protocol</span>
                    </h2>
                  </header>

                  <div className="flex-1 flex flex-col items-center justify-center gap-10">
                     <div className="relative p-8 bg-white rounded-[50px] shadow-2xl shadow-black/5 border border-black/[0.01]">
                        {qrSession ? (
                          <div className="relative">
                             <QRCode value={qrUrl} size={240} level="H" bgColor="#FFFFFF" fgColor="#050505" />
                             {syncStatus === 'SYNCED' && (
                               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-white/95 backdrop-blur-md flex items-center justify-center rounded-[32px]">
                                  <div className="flex flex-col items-center gap-4">
                                     <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 size={32} className="text-white" />
                                     </div>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Protocol Linked</span>
                                  </div>
                               </motion.div>
                             )}
                          </div>
                        ) : (
                          <div className="w-[240px] h-[240px] flex items-center justify-center bg-black/[0.01] rounded-3xl">
                             <Loader2 size={32} className="animate-spin text-black/10" />
                          </div>
                        )}
                        {/* Geometric Accents */}
                        <div className="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-black/5 rounded-tl-[50px]" />
                        <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-black/5 rounded-br-[50px]" />
                     </div>

                     <div className="flex flex-col items-center gap-5">
                        <div className="flex items-center gap-3.5 bg-white px-6 py-3 rounded-full border border-black/5 shadow-sm">
                           <div className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'SYNCED' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-black/20 animate-pulse'}`} />
                           <span className="text-[10px] font-mono font-black uppercase tracking-widest text-black/60">
                             {qrSession ? (syncStatus === 'SYNCED' ? 'SECURE_LINK_LOCKED' : 'AWAITING_HANDSHAKE') : 'INITIALIZING_SSE…'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <footer className="mt-auto pt-10 border-t border-black/[0.04] flex items-center justify-between opacity-30">
                     <span className="text-[9px] font-mono font-black uppercase tracking-widest">v6.12.0_SOVEREIGN</span>
                     <div className="flex gap-6">
                        <Twitter size={14} />
                        <Github size={14} />
                     </div>
                  </footer>
               </div>
            </div>

            {/* ── PANEL R: DIRECT CONNECT (IMAGE 2 BACKDROP) ── */}
            <div 
              className="relative p-14 lg:p-20 flex flex-col overflow-hidden"
              style={{
                backgroundImage: "url('/cubes-handshake.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
               {/* Translucent Overlay for High-Pro Clarity */}
               <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] z-0" />

               <div className="relative z-10 flex flex-col h-full">
                  <header className="mb-12">
                    <div className="flex items-center gap-2.5 mb-4">
                       <span className="w-2 h-2 rounded-full bg-black/10" />
                       <p className="text-[11px] font-mono font-black uppercase tracking-[0.4em] text-black/40">Direct Access Ingress</p>
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter leading-none text-[#050505]">
                       Connect<br /><span className="italic text-black/40">Sovereign Wallet</span>
                    </h2>
                  </header>

                  <div className="flex flex-col gap-4 flex-1">
                     <WalletButton 
                        logo="/wallets/metamask.svg" 
                        name="MetaMask" 
                        badge="Extension Ingress" 
                        onClick={() => handleConnector('injected')} 
                        loading={isPending} 
                        delay={0.1}
                     />
                     <WalletButton 
                        logo="/wallets/coinbase.png" 
                        name="Coinbase" 
                        badge="MPC Smart Vault" 
                        onClick={() => handleConnector('coinbase')} 
                        delay={0.2}
                     />
                     <WalletButton 
                        logo="/wallets/rainbow.png" 
                        name="Rainbow" 
                        badge="Universal Link" 
                        onClick={() => handleConnector('rainbow')} 
                        delay={0.3}
                     />
                     <WalletButton 
                        logo="/wallets/rabby.png" 
                        name="Rabby Wallet" 
                        badge="Advanced Forensic" 
                        onClick={() => handleConnector('rabby')} 
                        delay={0.4}
                     />
                  </div>

                  <div className="mt-12 p-6 bg-white/40 backdrop-blur-xl border border-black/5 rounded-[32px] flex items-start gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-black/[0.04] flex items-center justify-center shadow-sm shrink-0">
                        <Fingerprint size={20} className="text-black/30" />
                     </div>
                     <p className="text-[11px] text-black/50 font-semibold leading-relaxed">
                        Establishing a secure handshake via ECDSA proof of ownership. Private keys are never exposed to the network infrastructure.
                     </p>
                  </div>
               </div>
            </div>

        </motion.div>
      </main>

      {/* ── [FOOTER] INSTITUTIONAL LEGACY ──────────────────────────────────── */}
      <footer className="relative z-[100] h-[72px] px-12 border-t border-black/[0.04] bg-white/60 backdrop-blur-2xl flex items-center justify-between">
         <div className="flex items-center gap-12">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.5em] text-black/20">© Whale Alert Network</span>
            <div className="hidden md:flex items-center gap-8">
               <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors cursor-pointer">Security Ledger</span>
               <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/30 hover:text-black transition-colors cursor-pointer">Protocol Mesh</span>
            </div>
         </div>
         
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
               <span className="text-[9px] font-mono font-black uppercase tracking-widest text-emerald-600/60">Systems_Synced</span>
            </div>
            <button className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-[#050505]/60 hover:text-black transition-all">
               Handshake Support
               <ArrowRight size={12} />
            </button>
         </div>
      </footer>

      {/* ── STYLE INJECTIONS ──────────────────────────────────────────────── */}
      <style jsx global>{`
        @font-face {
          font-family: 'Sovereign-Mono';
          src: local('JetBrains Mono'), local('Menlo'), monospace;
        }
        body {
          background-color: #FAF9F6;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
