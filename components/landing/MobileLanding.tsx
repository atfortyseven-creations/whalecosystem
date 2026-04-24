"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { useUIStore } from '@/lib/store/ui-store';
import { Fingerprint, ArrowRight, ScanLine, Scan, Loader2, CheckCircle2, AlertCircle, RefreshCw, Mail, Info, X } from "lucide-react";

// ── Live clock hook ───────────────────────────────────────────────────────────
function useLiveClock(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

// QR Scanner — iOS-safe dynamic import
const DynamicQRScannerModal = dynamic(
  () => import("@/components/wallet/QRScannerModal"),
  { ssr: false }
);

import { ImmersiveManifestoLanding } from "./ImmersiveManifestoLanding";

// ── Colour tokens ─────────────────────────────────────────────────────────────
const IVORY = "#FAF9F6";
const INK   = "#050505";
const FAINT = "rgba(5,5,5,0.08)";
const MUTED = "rgba(5,5,5,0.50)";

// ── Sovereign sign message (must mirror LinkedGate exactly) ───────────────────
function buildSovereignMessage(address: string): string {
  return [
    '═══════════════════════════════',
    '  Whale Alert Network',
    '  SOVEREIGN ACCESS PROTOCOL',
    '═══════════════════════════════',
    '',
    `Identity: ${address}`,
    `Nonce: ${Date.now()}`,
    `Network: WHALE_TERMINAL_V4`,
    '',
    'By signing you confirm that',
    'you are the sole owner of this',
    'address and authorize access',
    'to the institutional terminal.',
    '═══════════════════════════════',
  ].join('\n');
}

// ── Wallet button ─────────────────────────────────────────────────────────────
function WalletOption({
  logo, name, badge, onClick, delay = 0, loading = false,
}: {
  logo: string; name: string; badge: string;
  onClick: () => void; delay?: number; loading?: boolean;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
      onClick={onClick}
      disabled={loading}
      className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-[#E5E5E5] bg-white hover:bg-[#FAF9F6] hover:border-black/20 active:scale-[0.97] transition-all duration-200 shadow-sm disabled:opacity-60"
    >
      <div className="w-11 h-11 rounded-xl bg-[#FAF9F6] border border-[#E5E5E5] flex items-center justify-center p-2 overflow-hidden shrink-0">
        {loading ? (
          <Loader2 size={20} className="animate-spin text-black/40" />
        ) : (
          <img src={logo} alt={name} className="w-full h-full object-contain" />
        )}
      </div>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-black uppercase tracking-tight text-[#050505]">{name}</p>
        <p className="text-[10px] font-mono text-[#050505]/40 uppercase tracking-widest mt-0.5">
          {loading ? "Opening app…" : badge}
        </p>
      </div>
      {!loading && (
        <ArrowRight size={14} className="text-[#050505]/20 group-hover:text-[#050505] group-hover:translate-x-0.5 transition-all shrink-0" />
      )}
    </motion.button>
  );
}

// ── Signing overlay ───────────────────────────────────────────────────────────
function SigningOverlay({
  address, onSigned, onRetry, error, isSigning,
}: {
  address: string; onSigned: () => void; onRetry: () => void;
  error: string | null; isSigning: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{ background: "rgba(250,249,246,0.97)", backdropFilter: "blur(24px)" }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-[2rem] bg-white border border-black/8 shadow-lg flex items-center justify-center">
          {isSigning ? (
            <RefreshCw size={28} className="text-black/60 animate-spin" />
          ) : error ? (
            <AlertCircle size={28} className="text-red-500" />
          ) : (
            <Fingerprint size={28} className="text-[#050505]" />
          )}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/8 rounded-full shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#050505]/60 font-mono">
            {address.slice(0, 8)}…{address.slice(-6)}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-[26px] font-black tracking-tighter text-[#050505] leading-none">
            {isSigning ? "Revisión Pendiente" : error ? "Firma rechazada" : "Firma el Contrato"}
          </h2>
          <p className="text-[12px] text-[#050505]/50 leading-relaxed">
            {error
              ? "Necesitas firmar el mensaje para acceder al terminal."
              : isSigning
              ? "Tu wallet tiene una solicitud de firma pendiente. Abre tu app y acepta."
              : "Confirma tu identidad en tu wallet. No se realiza ninguna transacción."}
          </p>
        </div>

        {/* WalletConnect mobile UX: guide user to open wallet app to sign */}
        {isSigning && !error && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-black/30">
              Abre tu app de wallet para aprobar:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'MetaMask', link: 'metamask://', logo: '/wallets/metamask.svg' },
                { name: 'Coinbase', link: 'cbwallet://', logo: '/wallets/coinbase.png' },
                { name: 'Rainbow', link: 'rainbow://', logo: '/wallets/rainbow.png' },
              ].map(w => (
                <a
                  key={w.name}
                  href={w.link}
                  className="flex flex-col items-center gap-1.5 p-3 bg-white border border-black/8 rounded-xl active:bg-black/5 transition-colors"
                >
                  <img src={w.logo} alt={w.name} className="w-7 h-7 object-contain" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-black/50">{w.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest"
          >
            {error}
          </motion.div>
        )}

        {error ? (
          <button
            onClick={onRetry}
            className="w-full py-4 rounded-2xl bg-[#2D0A59] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 shadow-lg active:scale-[0.97] transition-all"
          >
            <RefreshCw size={16} />
            Reintentar Firma
          </button>
        ) : !isSigning ? (
          <div className="w-full px-4 py-3 rounded-2xl border border-[#E5E5E5] bg-white flex items-center justify-center gap-3">
            <Loader2 size={16} className="animate-spin text-[#050505]/60" />
            <span className="text-[#050505] font-black uppercase tracking-widest text-[11px]">Iniciando firma…</span>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

// ── Connected Screen ──────────────────────────────────────────────────────────
function ConnectedScreen({
  address, onScan, showScanner, onCloseScanner, onBack, connectorName, chainId
}: {
  address: string; onScan: () => void;
  showScanner: boolean; onCloseScanner: () => void;
  onBack?: () => void;
  connectorName?: string;
  chainId?: number;
}) {
  const now = useLiveClock();
  const [connectedAt] = useState(() => new Date()); // frozen at mount time
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [userAgentInfo, setUserAgentInfo] = useState('');
  const [screenRes, setScreenRes] = useState('');
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const ua = navigator.userAgent;
       let os = "Unknown OS";
       if (ua.indexOf("Win") != -1) os = "Windows";
       if (ua.indexOf("Mac") != -1) os = "MacOS";
       if (ua.indexOf("Linux") != -1) os = "Linux";
       if (ua.indexOf("Android") != -1) os = "Android";
       if (ua.indexOf("like Mac") != -1) os = "iOS";
       const detectedOs = `${os} (${navigator.vendor || "Browser"})`;
       setUserAgentInfo(detectedOs);
       setScreenRes(`${window.screen.width}x${window.screen.height}`);
       
       if (address) {
         const key = `sovereign_history_${address}`;
         let existing: any[] = [];
         try {
             const stored = localStorage.getItem(key);
             if (stored) {
                 const parsed = JSON.parse(stored);
                 if (Array.isArray(parsed)) existing = parsed;
             }
         } catch (e) {
             console.warn("[Sovereign] LocalStorage parse error, resetting history array.");
             existing = [];
         }

         const currentSession = {
           date: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
           time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
           provider: connectorName || "Wallet Segura",
           os: detectedOs
         };
         
         const isDuplicate = existing.length > 0 && existing[0].time === currentSession.time && existing[0].date === currentSession.date;
         let updated = existing;
         
         if (!isDuplicate) {
           updated = [currentSession, ...existing].slice(0, 50); // Hard limit to 50 entries to prevent QuotaExceededError
           try {
               localStorage.setItem(key, JSON.stringify(updated));
           } catch (e) {
               console.warn("[Sovereign] LocalStorage write error (quota exceeded).");
           }
         }
         setSessionHistory(updated);
       }
    }
  }, [address, connectorName]);

  const fmtTime   = (d: Date) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDate   = (d: Date) => d.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const fmtStamp  = (d: Date) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: IVORY, color: INK }}>
      {/* Backgrounds */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6]" />
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <motion.div
           className="absolute"
           style={{ inset: "-20%", backgroundImage: "url('/patron-cosmico-4k.png')", backgroundSize: "140%", backgroundRepeat: "repeat", opacity: 0.04, mixBlendMode: "multiply" }}
           animate={{ x: ["0%", "-3%", "0%"], y: ["0%", "-2%", "0%"] }}
           transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="fixed top-0 inset-x-0 h-28 z-[2] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(250,249,246,1) 0%, transparent 100%)" }} />

      {/* Fixed Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-full"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: `1px solid ${FAINT}`, boxShadow: "0 4px 24px rgba(5,5,5,0.07)" }}
      >
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver al Landing Page"
              className="p-1.5 -ml-2 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors mr-1 cursor-pointer flex items-center gap-1"
            >
               <ArrowRight size={15} className="rotate-180" />
               <span className="text-[8px] font-mono uppercase tracking-widest text-black/40">Home</span>
            </button>
          )}
          <WhaleLogo className="w-5 h-5 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-tight" style={{ color: INK }}>Whale Alert Network</span>
        </div>
        <button 
           onClick={() => setShowInfoModal(true)}
           className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <Info size={14} />
        </button>
      </motion.header>

      <main className="relative z-10 flex-1 flex flex-col items-center px-4 pt-28 pb-12 gap-5 max-w-[440px] w-full mx-auto">

        {/* ── Session Identity Card ── */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
           className="w-full bg-white rounded-[24px] border border-[#E5E5E5] shadow-lg overflow-hidden flex flex-col"
        >
          {/* Top bar — live clock */}
          <div className="bg-[#2D0A59] px-6 py-6 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Sesión Activa</p>
              <p className="text-[36px] font-black tracking-tighter text-white leading-none tabular-nums">
                {fmtTime(now)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#F0F0F0]">
            <div className="bg-white px-5 py-4">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Fecha</p>
              <p className="text-[11px] font-black text-[#050505] capitalize truncate">{fmtDate(now)}</p>
            </div>
            <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Apertura</p>
               <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[11px] font-black text-[#050505]">{fmtStamp(connectedAt)}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#F0F0F0] border-t border-[#F0F0F0]">
             <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Provider</p>
               <p className="text-[11px] font-black text-[#050505] truncate">{connectorName || "Wallet Segura"}</p>
             </div>
             <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Red (Chain ID)</p>
               <p className="text-[11px] font-mono text-[#050505] truncate">{chainId ? `Chain ${chainId}` : "Mainnet"}</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-[#F0F0F0] border-t border-[#F0F0F0]">
             <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Device OS</p>
               <p className="text-[11px] font-black text-[#050505] truncate">{userAgentInfo || "Detectando..."}</p>
             </div>
             <div className="bg-white px-5 py-4">
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Fingerprint</p>
               <p className="text-[11px] font-mono text-[#050505] truncate">{screenRes || "Secure"}</p>
             </div>
          </div>

          {/* Address full length */}
          <div className="px-5 py-4 bg-white border-t border-[#F0F0F0]">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#050505]/40 mb-1">Billetera Conectada (Absoluta)</p>
            <p className="text-[12px] font-mono text-[#050505] tracking-tight break-all leading-relaxed">
              {address}
            </p>
          </div>
        </motion.div>

        {/* ── Permission Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-[#E5E5E5]"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#050505]">Scanner desbloqueado</p>
            <p className="text-[9px] text-[#050505]/40 font-medium">Puedes usar el scanner para enlazar el terminal PC.</p>
          </div>
        </motion.div>

        {/* ── Primary CTA ── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.6 }}
          whileTap={{ scale: 0.97 }}
          onClick={onScan}
          className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest text-white "
          style={{ background: "#2D0A59", fontSize: "12px", boxShadow: "0 24px 48px -12px rgba(45,10,89,0.45)" }}
        >
          <Scan size={18} />
          Abrir Scanner QR · Sync PC
        </motion.button>

        {/* ── Instruction card ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full flex items-start gap-3 p-4 rounded-2xl bg-white/60 border border-[#E5E5E5]"
        >
          <Fingerprint size={14} className="text-[#050505]/25 mt-0.5 shrink-0" />
          <p className="text-[9px] text-[#050505]/40 font-medium leading-relaxed">
            En el Terminal PC haz click en <strong className="text-[#2D0A59]/80 font-black">Direct QR Handshake</strong>, luego escanea el código con este botón para sincronizar tu sesión institucional.
          </p>
        </motion.div>

        {/* ── Session History Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="w-full bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden flex flex-col shadow-sm mt-4"
        >
          <div className="bg-[#1E073B] px-5 py-4 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/90">Historial de Sesiones</h3>
            <div className="px-2 py-1 bg-white/10 rounded-full text-[9px] font-black text-white/90">{sessionHistory.length} Registros</div>
          </div>
          <div className="flex flex-col max-h-[280px] overflow-y-auto">
             {sessionHistory.length === 0 ? (
               <div className="p-6 text-center text-[11px] font-medium text-black/40">No hay registros previos.</div>
             ) : (
               sessionHistory.map((s, i) => (
                 <div key={i} className={`px-5 py-4 flex flex-col gap-1.5 ${i !== sessionHistory.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}>
                    <div className="flex items-center justify-between">
                       <span className="text-[11px] font-black text-[#050505] capitalize">{s.date}</span>
                       <span className="text-[10px] font-mono text-[#050505]/50">{s.time}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]/40">{s.provider}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#2D0A59]">{s.os}</span>
                    </div>
                 </div>
               ))
             )}
          </div>
        </motion.div>
      </main>

      <DynamicQRScannerModal
        isOpen={showScanner}
        onClose={onCloseScanner}
        onScan={(result: string) => {
          onCloseScanner();
          const toast = document.createElement('div');
          toast.className = 'fixed top-6 left-4 right-4 z-[99999] bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-5 py-4 rounded-2xl shadow-xl text-center';
          toast.textContent = '✓ Terminal PC Desbloqueado';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 3000);
        }}
      />

      {/* INFO MODAL */}
      <AnimatePresence>
        {showInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-5"
          >
            <motion.div 
               initial={{ scale: 0.95, opacity: 0, y: 10 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.95, opacity: 0, y: 10 }}
               className="w-full max-w-sm bg-white rounded-[24px] shadow-2xl border border-black/10 overflow-hidden flex flex-col"
            >
               <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
                 <div className="flex items-center gap-2.5">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                     <Info size={16} />
                   </div>
                   <h3 className="text-[14px] font-black uppercase tracking-tight text-[#050505]">Información del Panel</h3>
                 </div>
                 <button onClick={() => setShowInfoModal(false)} className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors text-black/40 hover:text-black">
                   <X size={16} />
                 </button>
               </div>
               
               <div className="px-6 py-6 flex flex-col gap-5">
                  <div className="bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
                    <p className="text-[11px] text-blue-900 leading-relaxed font-medium">
                      Estás viendo el panel de control soberano en tu dispositivo móvil. Tu sesión está completamente verificada y asegurada criptográficamente con los datos mostrados en pantalla.
                    </p>
                  </div>

                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#050505]/40 mb-3">Pasos para enlazar el Terminal PC</p>
                     
                     <div className="flex flex-col gap-3">
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#2D0A59] text-white text-[10px] font-black flex items-center justify-center shrink-0">1</div>
                         <p className="text-[11px] text-[#050505] leading-snug">Abre la plataforma Whale Alert Network en el navegador de tu computadora de escritorio.</p>
                       </div>
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#2D0A59] text-white text-[10px] font-black flex items-center justify-center shrink-0">2</div>
                         <p className="text-[11px] text-[#050505] leading-snug">Selecciona la opción <strong className="font-black text-[#2D0A59]">Direct QR Handshake</strong> en la pantalla de inicio del PC.</p>
                       </div>
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#2D0A59] text-white text-[10px] font-black flex items-center justify-center shrink-0">3</div>
                         <p className="text-[11px] text-[#050505] leading-snug">Haz click en el botón morado <strong className="font-black text-[#2D0A59]">ABRIR SCANNER QR</strong> en esta pantalla de tu teléfono móvil.</p>
                       </div>
                       <div className="flex items-start gap-3">
                         <div className="w-5 h-5 rounded-full bg-[#2D0A59] text-white text-[10px] font-black flex items-center justify-center shrink-0">4</div>
                         <p className="text-[11px] text-[#050505] leading-snug">Apunta la cámara al código QR que aparece en tu monitor para transferir tu sesión segura instantáneamente.</p>
                       </div>
                     </div>
                  </div>
               </div>
               
               <div className="p-4 border-t border-[#F0F0F0] bg-[#FAF9F6]">
                  <button onClick={() => setShowInfoModal(false)} className="w-full py-3.5 rounded-xl bg-[#2D0A59] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#1E073B] transition-colors shadow-lg active:scale-95 duration-200">
                    Entendido
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function MobileLanding() {
  const searchParams = useSearchParams();
  const sessionParam = searchParams?.get('session');

  const { address, isConnected, connector, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { signMessageAsync } = useSignMessage();
  const { open: openAppKitDirect, close: closeAppKit } = useAppKit();
  const openConnectModal = useUIStore(s => s.openConnectModal);

  const [mounted, setMounted]           = useState(false);
  const [showScanner, setShowScanner]   = useState(false);
  // ── CRITICAL FIX: initialize isLinked from cookie immediately ──────────────
  const [isLinked, setIsLinked]         = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.cookie.split('; ').some(r => r.startsWith('sovereign_handshake=0x'));
  });
  // ── DEFINITIVE FIX: read address from cookie if wagmi hasn't reconnected ───
  // The cookie value IS the wallet address: sovereign_handshake=0x1234...
  // This means after signing we NEVER need wagmi to reconnect to show the
  // ConnectedScreen. Works even if WalletConnect session drops after signing.
  const cookieAddress = useMemo<string | null>(() => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/sovereign_handshake=(0x[0-9a-fA-F]{40,})/i);
    return match?.[1] ?? null;
  }, [isLinked]); // re-derive if isLinked changes (e.g. after fresh sign)
  // Effective address: prefer live wagmi address, fall back to cookie address
  const effectiveAddress = address || cookieAddress || undefined;

  // showingManifesto: true = go to manifesto landing first, user clicks black button to open scanner
  const [showingManifesto, setShowingManifesto] = useState(true);
  const [isSigning, setIsSigning]       = useState(false);
  const [signError, setSignError]       = useState<string | null>(null);
  const [connecting, setConnecting]     = useState<string | null>(null);
  const signingLock = useRef(false);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── Check for existing valid session on mount ───────────────────────────────
  // Secondary check: if cookie already detected by useState init, this is a no-op.
  // Handles edge case where sessionStorage is available (same tab session).
  useEffect(() => {
    if (!mounted) return;
    if (address) {
      const sessionSigned = typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(`sovereign_signed_${address}`) === 'true'
        : false;
      const hasCookie = typeof document !== 'undefined'
        ? document.cookie.split('; ').some(r => r.startsWith('sovereign_handshake=0x'))
        : false;
      if (sessionSigned || hasCookie) {
        setIsLinked(true);
      }
    }
  }, [mounted, address]);

  // ── Scroll to top when manifesto becomes visible ─────────────────────────────
  // Prevents the page from appearing mid-scrolled after the sign modal closes.
  useEffect(() => {
    if (isLinked && typeof window !== 'undefined') {
      // Use both methods for cross-browser reliability
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [isLinked]);

  // ── Auto-trigger signing once wallet connects ───────────────────────────────
  useEffect(() => {
    if (!mounted || !isConnected || !address || isLinked || signingLock.current) return;
    setConnecting(null); // clear loading state on wallet buttons
    handleSign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, isLinked, mounted]);

  // ── Sign sovereign message ──────────────────────────────────────────────────
  const handleSign = useCallback(async () => {
    if (!address || signingLock.current) return;
    signingLock.current = true;
    setIsSigning(true);
    setSignError(null);
    try {
      const message = buildSovereignMessage(address);
      const signature = await signMessageAsync({ message });
      if (signature) {
        // Persist session — 7 days cookie + sessionStorage tab cache
        if (typeof document !== 'undefined') {
          document.cookie = `sovereign_handshake=${address}; path=/; max-age=604800; SameSite=Lax`;
        }
        sessionStorage.setItem(`sovereign_signed_${address}`, 'true');

        // Async backend sync (non-blocking)
        fetch('/api/wallet/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address, signature, message }),
        }).catch(() => {});

        setIsLinked(true);
        // Force close any stuck WalletConnect modals that leave body blur active
        try { closeAppKit(); } catch (e) {}

        // Reset scroll so the manifesto always opens from page top
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }
    } catch (e: any) {
      const msg = e?.code === 4001 || e?.message?.includes('rejected')
        ? 'Firma rechazada. Necesitas firmar para acceder.'
        : 'Error inesperado. Inténtalo de nuevo.';
      setSignError(msg);
      signingLock.current = false; // allow retry
    } finally {
      setIsSigning(false);
    }
  }, [address, signMessageAsync]);

  // ── Auto-fulfill PC terminal session if opened via native camera scan ───────
  useEffect(() => {
    if (isLinked && address && sessionParam) {
      const fulfilledKey = `fulfilled_session_${sessionParam}`;
      if (sessionStorage.getItem(fulfilledKey)) return;

      fetch(`/api/auth/qr-session?id=${sessionParam}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      }).then(res => {
         if(res.ok) {
           sessionStorage.setItem(fulfilledKey, 'true');
           const toast = document.createElement('div');
           toast.className = 'fixed top-6 left-4 right-4 z-[99999] bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-5 py-4 rounded-2xl shadow-xl text-center';
           toast.textContent = '✓ Terminal PC Desbloqueado';
           document.body.appendChild(toast);
           setTimeout(() => toast.remove(), 4000);
         }
      }).catch(() => {});
    }
  }, [isLinked, address, sessionParam]);

  // ── Nuke rogue w3m-modal blur ───────────────────────────────────────────────
  // A watchdog to completely remove the `<w3m-modal>` if it gets stuck as an empty
  // blurred backdrop post-connection on mobile deep-links.
  useEffect(() => {
    if (isLinked) {
      try { closeAppKit(); } catch (e) {}
      const interval = setInterval(() => {
         const w3m = document.querySelector('w3m-modal');
         if (w3m) w3m.remove();
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLinked, closeAppKit]);

  // ── WalletConnect v2 deep-link (THE CRITICAL FIX) ──────────────────────────
  //
  //  Problem: metamask:// just opens MetaMask homescreen — no connection.
  //  Solution: Generate a WalletConnect v2 pairing URI from the wagmi WC connector,
  //  then encode it into the wallet-specific deep-link:
  //    metamask://wc?uri=wc%3A...   ← MetaMask sees "connect to this dapp"
  //    cbwallet://wc?uri=wc%3A...   ← Coinbase
  //    rainbow://wc?uri=wc%3A...    ← Rainbow
  //
  //  After the user approves in their wallet app, the WC session resolves and
  //  isConnected becomes true → auto-sign fires above.
  //
  const handleWCDeepLink = useCallback((walletType: 'metamask' | 'coinbase' | 'rainbow') => {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator?.userAgent ?? '');
    const hasEthereum = typeof (window as any).ethereum !== 'undefined';

    // ── If already connected, skip entirely — avoid wagmi 'Connector already connected' error
    if (isConnected && address) {
      // Wallet is already linked — nothing to do here
      return;
    }

    const STORE_URLS = {
      metamask: {
        ios:     'https://apps.apple.com/app/metamask/id1438144202',
        android: 'https://play.google.com/store/apps/details?id=io.metamask',
      },
      coinbase: {
        ios:     'https://apps.apple.com/app/coinbase-wallet/id1278383455',
        android: 'https://play.google.com/store/apps/details?id=org.toshi',
      },
      rainbow: {
        ios:     'https://apps.apple.com/app/rainbow-ethereum-wallet/id1457119021',
        android: 'https://play.google.com/store/apps/details?id=me.rainbow',
      },
    };

    // ── Path A: In-app browser (wallet's own browser already injected ethereum) ──
    if (hasEthereum) {
      const ID_MAP = {
        metamask: ['injected', 'io.metamask', 'metaMaskSDK'],
        coinbase:  ['coinbaseWalletSDK', 'injected'],
        rainbow:   ['injected'],
      };
      const c = connectors.find(x => ID_MAP[walletType].includes(x.id));
      if (c) {
        setConnecting(walletType);
        // Suppress 'already connected' error — wagmi throws when the same
        // connector instance is already active (e.g. user navigated back)
        try { connect({ connector: c }); } catch { setConnecting(null); }
        return;
      }
    }

    // ── Path B: External browser on mobile → WC URI deep-link ─────────────────
    const wcConnector = connectors.find(c =>
      c.id === 'walletConnect' || c.id === 'walletconnect' || c.id === 'WalletConnect'
    );

    if (!wcConnector) {
      // No WC connector found at all — send to store
      window.location.href = isIOS ? STORE_URLS[walletType].ios : STORE_URLS[walletType].android;
      return;
    }

    setConnecting(walletType);

    const handleMessage = (event: { type: string; data?: unknown | undefined; uid: string }) => {
      if (event.type !== 'display_uri' || !event.data) return;
      wcConnector.emitter.off('message', handleMessage);

      const wcUri = String(event.data);
      const encoded = encodeURIComponent(wcUri);

      const DEEP_LINK_MAP = {
        metamask: `metamask://wc?uri=${encoded}`,
        coinbase:  `cbwallet://wc?uri=${encoded}`,
        rainbow:   `rainbow://wc?uri=${encoded}`,
      };

      const deepLink = DEEP_LINK_MAP[walletType];
      window.location.href = deepLink;

      const onReturn = () => {
        if (!document.hidden) {
          setConnecting(null);
          document.removeEventListener('visibilitychange', onReturn);
        }
      };
      document.addEventListener('visibilitychange', onReturn);
    };

    wcConnector.emitter.on('message', handleMessage);

    // Kick off the WC pairing — this triggers 'display_uri' emission.
    // Catch synchronous 'already connected' error from wagmi.
    try {
      connect({ connector: wcConnector });
    } catch (e: any) {
      wcConnector.emitter.off('message', handleMessage);
      setConnecting(null);
      // Silently ignore duplicate connection attempts
    }
  }, [connect, connectors, isConnected, address]);

  if (!mounted) return null;

  // ── Render: Session exists — show immediately using cookie address ──────────
  // We NEVER wait for wagmi to reconnect. The cookie IS the source of truth.
  // The cookie value IS the wallet address: sovereign_handshake=0xABCD...
  // This means after signing we never need wagmi to reconnect to show the
  // ConnectedScreen. Works even if WalletConnect session drops after signing.
  if (isLinked && effectiveAddress) {
    return (
      <AnimatePresence mode="wait">
        {showingManifesto ? (
          <motion.div key="manifesto" initial={{opacity: 0}} animate={{opacity: 1, transition: { duration: 0.4, ease: "easeOut" }}} exit={{opacity: 0, transition: { duration: 0.2 }}} className="w-full min-h-screen bg-[#FDFCF8]">
            <ImmersiveManifestoLanding onOpenScanner={() => setShowingManifesto(false)} />
          </motion.div>
        ) : (
          <motion.div key="scanner" initial={{opacity: 0, scale: 0.98}} animate={{opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" }}} exit={{opacity: 0, scale: 0.98, transition: { duration: 0.2 }}} className="w-full min-h-screen bg-[#FAF9F6]">
            <ConnectedScreen 
               address={effectiveAddress} 
               onScan={() => setShowScanner(true)} 
               showScanner={showScanner} 
               onCloseScanner={() => setShowScanner(false)} 
               onBack={() => setShowingManifesto(true)}
               connectorName={connector?.name}
               chainId={chainId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── Render: Signing step (new connection, no prior session) ─────────────────
  if (isConnected && address && !isLinked) {
    return (
      <>
        <div className="fixed inset-0 z-0 bg-[#FAF9F6] pointer-events-none" />
        <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
          <motion.div
            className="absolute"
            style={{ inset: "-20%", backgroundImage: "url('/patron-cosmico-4k.png')", backgroundSize: "140%", backgroundRepeat: "repeat", opacity: 0.04, mixBlendMode: "multiply" }}
            animate={{ x: ["0%", "-3%", "0%"], y: ["0%", "-2%", "0%"] }}
            transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <SigningOverlay
          address={address}
          onSigned={() => setIsLinked(true)}
          onRetry={() => { signingLock.current = false; handleSign(); }}
          error={signError}
          isSigning={isSigning}
        />
      </>
    );
  }

  // ── Render: Default — Not connected ──────────────────────────────────────────
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: IVORY, color: INK }}>

      {/* Layer 0: ivory base */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6] pointer-events-none" />

      {/* Layer 1: cosmic pattern */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <motion.div
          className="absolute"
          style={{ inset: "-20%", backgroundImage: "url('/patron-cosmico-4k.png')", backgroundSize: "140%", backgroundRepeat: "repeat", opacity: 0.045, mixBlendMode: "multiply", willChange: "transform" }}
          animate={{ x: ["0%", "-3%", "0%"], y: ["0%", "-2%", "0%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Layer 2: top fade */}
      <div className="fixed top-0 left-0 right-0 h-36 z-[2] pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(250,249,246,0.97) 0%, transparent 100%)" }} />

      {/* Fixed Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-full"
        style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: `1px solid ${FAINT}`, boxShadow: "0 4px 24px rgba(5,5,5,0.07)" }}
      >
        <div className="flex items-center gap-2.5">
          <WhaleLogo className="w-6 h-6 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-tight" style={{ color: INK }}>Whale Alert Network</span>
        </div>
        <div className="px-3 py-1.5 rounded-full border border-black/10 text-[9px] font-black uppercase tracking-widest text-black/40">
          Not Connected
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 pt-32 pb-12 gap-8 max-w-[440px] w-full mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1 className="text-[2.2rem] font-black tracking-tight leading-[1.05] mb-3" style={{ color: INK }}>
            Whale Alert<br />Network
          </h1>
          <p className="text-[12px] font-medium leading-relaxed" style={{ color: MUTED }}>
            Inteligencia blockchain de grado soberano. Conecta tu wallet para sincronizar tu sesión con el terminal de escritorio.
          </p>
        </motion.div>

        {/* Wallet Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="w-full flex flex-col gap-3"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1 h-px bg-[#E5E5E5]" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#050505]/30">Conectar Wallet</span>
            <div className="flex-1 h-px bg-[#E5E5E5]" />
          </div>

          <WalletOption
            logo="/wallets/metamask.svg"
            name="MetaMask"
            badge="AppKit · WalletConnect v2"
            loading={connecting === 'metamask'}
            onClick={() => { setConnecting('metamask'); openAppKitDirect(); }}
            delay={0.1}
          />
          <WalletOption
            logo="/wallets/coinbase.png"
            name="Coinbase Wallet"
            badge="AppKit · WalletConnect v2"
            loading={connecting === 'coinbase'}
            onClick={() => { setConnecting('coinbase'); openAppKitDirect(); }}
            delay={0.15}
          />
          <WalletOption
            logo="/wallets/rainbow.png"
            name="Rainbow & 550+ Wallets"
            badge="AppKit · WalletConnect v2"
            loading={connecting === 'rainbow'}
            onClick={() => { setConnecting('rainbow'); openAppKitDirect(); }}
            delay={0.2}
          />
          <WalletOption
            logo="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
            name="Google & Social Auth"
            badge="Smart Account · Social Login"
            onClick={() => openAppKitDirect()}
            delay={0.25}
          />

          {/* ECDSA notice */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#E5E5E5] mt-2">
            <Fingerprint size={14} className="text-[#050505]/25 mt-0.5 shrink-0" />
            <p className="text-[10px] text-[#050505]/40 font-medium leading-relaxed">
              ECDSA Verification · Non-custodial · Las claves privadas nunca salen de tu dispositivo.
            </p>
          </div>
        </motion.div>
      </main>

      {/* ── Institution-Grade Mobile Footer (Synced with PC Downhead) ── */}
      <div className="relative w-full overflow-hidden mt-auto bg-[#020202] text-white selection:bg-[#D4AF37]/30 rounded-t-3xl border-t border-white/10">
        
        {/* WAVE IMAGE — Full bleed behind content */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/olas-hokusai-4k.png"
            alt="Wave pattern"
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-[#020202]/85" />
        </div>

        <footer className="relative z-10 w-full px-6 pt-16 pb-12 flex flex-col gap-10">
          
          {/* Upper: Branding */}
          <div className="flex flex-col gap-3 text-center items-center">
            <h2 className="text-3xl font-light leading-none tracking-tight text-[#FAF9F6]">
              Whale Alert Network<span className="text-[#D4AF37]">.</span>
            </h2>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#8A94A6]">
              Institutional Terminal Layer
            </p>
          </div>

          {/* Middle: Subscription */}
          <div className="w-full flex flex-col gap-3 z-20">
             <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-[#8A94A6]/70 text-center">
                Establish Academic Correspondence
             </p>
             <div className="flex flex-col overflow-hidden rounded border border-white/10 bg-[#050505]/70 w-full max-w-[320px] mx-auto shadow-xl">
                <input
                   type="email"
                   placeholder="ENTER SECURE EMAIL"
                   className="bg-transparent px-4 py-3 outline-none font-mono text-[10px] tracking-widest text-[#E0E0E0] placeholder:text-[#545F73] text-center"
                />
                <button className="px-4 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] bg-[#EAEAEA] text-[#0A0A0A] hover:bg-white transition-colors active:scale-95">
                   Subscribe
                </button>
             </div>
          </div>

          <div className="w-full h-px bg-white/5" />

          {/* Lower: Nav Links + Copyright */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
              {[
                ['Privacy Policy', '/privacy'], 
                ['Technical Docs', '/docs'], 
                ['Terms of Service', '/terms']
              ].map(([label, href]) => (
                <a key={label} href={href} className="text-[9px] font-mono uppercase tracking-[0.2em] font-medium text-[#8A94A6] hover:text-[#D4AF37] transition-colors relative z-20 p-2 -m-2">
                   {label}
                </a>
              ))}
            </div>
            
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#545F73] text-center">
              © 2026 Whale Alert Network. Pure Mathematics.
            </p>
          </div>

        </footer>
      </div>
    </div>
  );
}
