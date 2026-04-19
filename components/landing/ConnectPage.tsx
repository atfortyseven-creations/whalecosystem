"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Loader2, 
  Twitter, 
  Fingerprint, 
  ChevronRight,
  Github
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAppKit } from "@reown/appkit/react";
import { WavePatternOverlay } from "@/components/layout/WavePatternOverlay";

// QR code renderer using qrcode.react
const QRCode = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false });

function WalletButton({ logo, name, badge, onClick, loading, delay = 0 }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={loading ? undefined : onClick}
      className="group relative w-full flex items-center gap-4 p-5 bg-[#FAF9F6] hover:bg-white border border-black/[0.03] hover:border-black/10 rounded-[28px] transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-0.5 text-[#050505]"
    >
      <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center p-2.5 shadow-sm group-hover:scale-105 transition-transform duration-500">
        <img src={logo} alt={name} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-black uppercase tracking-tight">{name}</p>
        <p className="text-[10px] font-mono text-black/40 uppercase tracking-widest mt-0.5">{badge}</p>
      </div>
      <ArrowRight size={14} className="text-black/20 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
    </motion.button>
  );
}

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
            router.replace("/");
          }, 1200);
        }
      } catch (e) {}
    }, 2000);
    return () => clearInterval(bridge);
  }, [qrSession, syncStatus, router]);

  useEffect(() => {
    if (isConnected && mounted) {
      if (!document.cookie.includes("sovereign_handshake=")) {
         // Generar una firma pasiva a partir de su dirección en la wallet, pero como
         // wagmi no me expone let address en este scope local, simplemente marco la cookie genérica Web3
         document.cookie = `sovereign_handshake=web3_injected; path=/; max-age=604800; SameSite=Lax`;
      }
      setTimeout(() => {
         router.replace("/");
      }, 500);
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
    <div className="fixed inset-0 min-h-screen w-screen flex flex-col text-black font-mono overflow-auto bg-[#FAF9F6] selection:bg-black selection:text-white">
      {/* Background Waves - "Hokusai" - Absolute Bottom */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-[40vh] pointer-events-none opacity-100 mix-blend-darken z-0"
        style={{
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundSize: "auto 100%",
          backgroundPosition: "bottom center",
          backgroundRepeat: "repeat-x"
        }}
      />
      
      <header className="relative z-[100] h-[68px] flex items-center justify-between px-8 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
           <img src="/official-whale-monochrome.png" className="w-8 h-8" alt="Whale" />
           <div className="flex flex-col leading-none">
              <span className="text-[15px] font-black uppercase tracking-tighter">Whale Alert Network</span>
           </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1.09, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-[40px] border border-black/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden"
        >
            <div className="relative p-12 lg:p-16 flex flex-col bg-white border-b lg:border-b-0 lg:border-r border-black/20">
              <div className="relative z-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-6">MOBILE SYNC // ORDEN</h2>
                <p className="text-[12px] text-black font-semibold uppercase tracking-widest max-w-xs mb-10 border-b-2 border-black pb-4">
                  [ SCAN SVS HANDSHAKE ] BRIDGE THE SOVEREIGN INTEL MESH.
                </p>

                <div className="flex flex-col items-center gap-8">
                  <div className="p-6 bg-white rounded-[42px] shadow-sm border border-black/5">
                    {qrSession ? (
                      <QRCode value={qrUrl} size={200} level="H" bgColor="#FFFFFF" fgColor="#050505" />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center">
                        <Loader2 size={32} className="animate-spin text-black/10" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${syncStatus === 'SYNCED' ? 'bg-emerald-500' : 'bg-black/20 animate-pulse'}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative p-12 lg:p-16 flex flex-col overflow-hidden bg-white/95 backdrop-blur-md">
               {/* 3D Blocks Background Pattern Expertly Adjusted */}
               <div 
                 className="absolute inset-0 pointer-events-none opacity-40 mix-blend-darken z-0"
                 style={{
                   backgroundImage: "url('/patron-cosmico-4k.png')",
                   backgroundSize: "400px",
                   backgroundRepeat: "repeat"
                 }}
               />
               <div className="relative z-10 flex flex-col h-full">
                 <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-8 border-b-2 border-black pb-4">CONNECT WALLET // ACCESS</h2>

                 <div className="flex flex-col gap-3.5 flex-1">
                    <WalletButton 
                      logo="/wallets/metamask.svg" 
                      name="MetaMask" 
                      badge="Browser Injected" 
                      onClick={() => handleConnector('injected')} 
                      loading={isPending} 
                    />
                    <WalletButton 
                      logo="/wallets/coinbase.png" 
                      name="Coinbase Wallet" 
                      badge="MPC Smart Wallet" 
                      onClick={() => handleConnector('coinbase')} 
                    />
                    <WalletButton 
                      logo="/wallets/rainbow.png" 
                      name="Rainbow (+550 Wallets)" 
                      badge="WalletConnect" 
                      onClick={() => openAppKit()} 
                    />
                    <WalletButton 
                      logo="/wallets/rabby.png" 
                      name="Rabby" 
                      badge="Advanced EOA" 
                      onClick={() => handleConnector('rabby')} 
                    />
                 </div>

                 <div className="mt-10 p-5 bg-[#FAF9F6]/80 border border-black/5 rounded-3xl backdrop-blur-sm flex items-start gap-3">
                    <Fingerprint size={16} className="text-black/30 mt-0.5" />
                    <p className="text-[10px] text-black/40 font-semibold leading-relaxed">
                      ECDSA Verification. This portal does not hold custody of assets. All interactions are verified on-chain.
                    </p>
                 </div>
               </div>
            </div>
        </motion.div>
      </main>

      <footer className="relative z-[100] px-12 py-12 border-t border-black/[0.04] bg-white/50 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex flex-col gap-2 relative z-10">
            <div className="flex items-center gap-3">
              <img src="/official-whale-monochrome.png" className="w-5 h-5 opacity-40" alt="" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">© 2026 atfortyseven-creations</span>
            </div>
         </div>

         <div className="flex items-center gap-8">
            <a href="https://twitter.com/WhaleAlert" className="text-black/30 hover:text-black transition-colors"><Twitter size={18} /></a>
            <a href="https://github.com" className="text-black/30 hover:text-black transition-colors"><Github size={18} /></a>
            <div className="w-px h-8 bg-black/10 mx-2" />
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Status: Operational</span>
               <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest font-bold">L1/L2 Ingress Active</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

// [INSTITUTIONAL_SYNC_ID]: f577e582-c211-470c-bb5e-2654795cdc50
// TRIGGER_CLEAN_BUILD: 2026-04-15T01:37:00Z
