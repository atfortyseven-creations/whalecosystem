"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useConnect } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  Shield, 
  ArrowRight, 
  Loader2, 
  Twitter, 
  QrCode, 
  Wallet, 
  Lock, 
  Smartphone, 
  Cpu, 
  Fingerprint, 
  ChevronRight,
  Github
} from "lucide-react";
import dynamic from "next/dynamic";
import { coinbaseWallet, injected } from "wagmi/connectors";
import { useAppKit } from "@reown/appkit/react";
import { WavePatternOverlay } from "@/components/layout/WavePatternOverlay";

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

// ── Main Controller ─────────────────────────────────────────────────────────────
export default function ConnectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { open: openAppKit } = useAppKit();

  const [mounted, setMounted] = useState(false);
  const [qrSession, setQrSession] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<"IDLE" | "AWAITING" | "SYNCED">("IDLE");

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

  const qrUrl = typeof window !== "undefined"
    ? `${window.location.origin}/connect?session=${qrSession ?? ""}`
    : "";

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FAF9F6] text-[#050505] relative font-sans">
      {/* ── [EXPERT] FIXED BACKDROP ── */}
      <WavePatternOverlay />
      
      {/* ── HEADER ── */}
      <header className="relative z-[100] h-[68px] flex items-center justify-between px-8 border-b border-black/[0.06] bg-white/70 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
           <img src="/official-whale-monochrome.png" className="w-8 h-8" alt="Whale" />
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

      {/* ── COMMAND CENTER ── */}
      <main className="relative z-10 flex flex-col items-center pt-20 pb-32">
        
        {/* THE IMMERSIVE 1.09x ZOOM TERMINAL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1.09, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] border border-black/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] overflow-hidden"
        >
            {/* LEFT: QR PANEL */}
            <div className="relative p-12 lg:p-16 flex flex-col bg-[#FAF9F6] border-b lg:border-b-0 lg:border-r border-black/[0.06]">
              <div className="absolute -bottom-20 -left-20 opacity-[0.03] pointer-events-none">
                 <img src="/official-whale-monochrome.png" className="w-[480px] h-[480px] grayscale" alt="" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/30 mb-4">Institutional Handshake</p>
                <h2 className="text-4xl font-black tracking-tight leading-none mb-6">Mobile Sync</h2>
                <p className="text-[12px] text-black/50 font-semibold leading-relaxed max-w-xs mb-10">
                  Scan this sovereign handshake code to bridge your device to the intelligence mesh.
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
                  <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-black/5">
                    <div className={`w-2 h-2 rounded-full ${syncStatus === 'SYNCED' ? 'bg-emerald-500' : 'bg-black/20 animate-pulse'}`} />
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-black/60">
                      {syncStatus === 'SYNCED' ? 'SESSION LINKED' : 'AWAITING RESPONSE…'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: CONNECT PANEL */}
            <div className="p-12 lg:p-16 flex flex-col bg-white">
               <p className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-black/30 mb-4">Direct Access</p>
               <h2 className="text-3xl font-black tracking-tighter leading-none mb-8">Connect Wallet</h2>

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

               <div className="mt-10 p-5 bg-[#FAF9F6] border border-black/5 rounded-3xl flex items-start gap-3">
                  <Fingerprint size={16} className="text-black/30 mt-0.5" />
                  <p className="text-[10px] text-black/40 font-semibold leading-relaxed">
                    ECDSA Verification. This portal does not hold custody of assets. All interactions are verified on-chain.
                  </p>
               </div>
            </div>
        </motion.div>

        {/* ── [RECOVERY] INSTITUTIONAL MANIFESTO ── */}
        <section className="relative z-10 w-full max-w-[840px] px-8 pt-48 pb-64 text-[12px] leading-[2.2] tracking-wide text-black/60">
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-8 text-black">The Origin and Vision</h2>
            <p className="mb-6">
              The blockchain ecosystem suffers from a fundamental asymmetry of information. The raw data produced by public distributed ledgers is theoretically visible to anyone. In practice, however, the velocity, volume, and structural complexity of that data mean that only those with access to advanced indexing infrastructure can extract meaning from it in time to act upon that meaning.
            </p>
            <p className="mb-6">
              A private institution with a team of engineers can deploy purpose-built systems to detect a significant capital movement nearly four minutes before that movement propagates through the public mempool. An individual operating without institutional infrastructure cannot.
            </p>
            <p className="mb-16">
               The Whale Alert Network was conceived specifically to dismantle that barrier, to build from first principles an intelligence system capable of detecting, verifying, and disseminating high value capital movements with accuracy and latency sufficient to place the individual user on the same informational footing as an institutional actor.
            </p>

            <h2 className="text-[14px] uppercase tracking-widest font-black mb-8 text-black">Architectural Philosophy</h2>
            <p className="mb-6">
              The zero mock mandate ensures no component of the system displays fabricated data in place of real on-chain state. Every signal surfaced by the system is sourced directly from live blockchain state verified on chain, processed cryptographically, and delivered with an editorial context that a trained analyst could act upon immediately.
            </p>
            <p className="mb-16">
              The institutional grade standard mandates that the production quality must be indistinguishable from that of an institutional engineering organization. This applies to code quality, interface design, database schema structure, and visual presentation.
            </p>

            <div className="grid grid-cols-2 gap-12 pt-16 border-t border-black/5">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-black mb-4">Protocol Sovereignty</h3>
                <p className="text-[11px] leading-relaxed">Non-custodial infrastructure. Your keys never leave your device. The network provides intelligence; you retain control.</p>
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-black mb-4">Zero Knowledge Access</h3>
                <p className="text-[11px] leading-relaxed">Sybil-resistant verification without compromising privacy. Verified identity mesh via cryptographically secure signatures.</p>
              </div>
            </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="relative z-[100] px-12 py-12 border-t border-black/[0.04] bg-white/50 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img src="/official-whale-monochrome.png" className="w-5 h-5 opacity-40" alt="" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">© Whale Alert Network</span>
            </div>
            <p className="text-[9px] font-mono text-black/30 tracking-widest uppercase">Privacy by Design · Sovereignty Verified</p>
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
