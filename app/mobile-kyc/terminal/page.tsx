"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import {
  QrCode, MessageSquare, Globe, LogOut, Shield,
  CheckCircle2, Scan, ChevronRight, Wifi, Lock, Zap,
} from "lucide-react";

// ── QR Scanner (uses jsQR via Canvas) ────────────────────────────────────────
function QRScannerPanel({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setScanning(true);
    } catch {
      setResult("CAMERA_ERROR");
    }
  };

  useEffect(() => {
    if (!scanning) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    const tick = async () => {
      if (!running || video.readyState < 2) {
        if (running) requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Dynamic import jsQR only when needed
      try {
        const { default: jsQR } = await import("jsqr");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if (code?.data) {
          setResult(code.data);
          running = false;
          streamRef.current?.getTracks().forEach(t => t.stop());
        }
      } catch {}

      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { running = false; streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [scanning]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center"
    >
      <div className="absolute top-6 right-6">
        <button onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white">
          ✕
        </button>
      </div>
      <div className="flex flex-col items-center gap-6 px-8 w-full max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Scan size={22} className="text-emerald-400" />
        </div>
        <h2 className="text-[13px] font-black uppercase tracking-[0.3em] text-white">QR Scanner</h2>

        {!scanning && !result && (
          <button onClick={startScan}
            className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-emerald-400 transition-all">
            Activate Camera
          </button>
        )}

        {scanning && !result && (
          <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-emerald-500/30">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {/* Scan overlay */}
            <div className="absolute inset-4 border-2 border-emerald-500/50 rounded-xl" />
            <motion.div
              className="absolute left-4 right-4 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10B981]"
              animate={{ top: ["16px", "calc(100% - 16px)", "16px"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        {result && result !== "CAMERA_ERROR" && (
          <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[9px] text-emerald-400 uppercase tracking-widest mb-2">QR Detected</p>
            <p className="text-[11px] text-white/80 break-all font-mono">{result}</p>
          </div>
        )}

        {result === "CAMERA_ERROR" && (
          <p className="text-[10px] text-red-400 uppercase tracking-widest">Camera access denied</p>
        )}
      </div>
    </motion.div>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
function NavItem({
  icon: Icon, label, sublabel, onClick, href, color = "#10b981",
}: {
  icon: any; label: string; sublabel?: string;
  onClick?: () => void; href?: string; color?: string;
}) {
  const inner = (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all active:scale-[0.98]"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-black text-white uppercase tracking-wider">{label}</p>
        {sublabel && <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{sublabel}</p>}
      </div>
      <ChevronRight size={14} className="text-white/20" />
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return <button onClick={onClick} className="w-full text-left">{inner}</button>;
}

// ── Main Terminal ─────────────────────────────────────────────────────────────
export default function MobileTerminalPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const [showScanner, setShowScanner] = useState(false);
  const [kycVerified] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.cookie.includes("whale_session=") || document.cookie.includes("kyc_verified=true");
  });

  const handleDisconnect = () => {
    disconnect();
    // Clear all session data
    document.cookie.split(";").forEach(c => {
      const key = c.split("=")[0].trim();
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };

  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-6 gap-8">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Shield size={32} className="text-emerald-400" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-white uppercase tracking-wider mb-2">Sovereign Terminal</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Connect wallet to access</p>
        </div>
        <button onClick={() => openConnectModal?.()}
          className="w-full max-w-xs py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-emerald-400 transition-all">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-12 pb-6">
        <div>
          <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-white/25 mb-1">Sovereign Terminal</p>
          <h1 className="text-[16px] font-black text-white uppercase tracking-tight">Mobile Command</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-mono text-emerald-400/80 uppercase tracking-widest">Live</span>
        </div>
      </header>

      {/* Identity card */}
      <div className="relative z-10 mx-5 mb-6">
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
            {kycVerified
              ? <CheckCircle2 size={22} className="text-emerald-400" />
              : <Shield size={22} className="text-white/40" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
              {kycVerified ? "KYC Verified" : "Connected"}
            </p>
            <p className="text-[13px] font-black text-white font-mono truncate">
              {address?.slice(0, 10)}…{address?.slice(-6)}
            </p>
          </div>
          {kycVerified && (
            <div className="shrink-0 px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-widest"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
              ZK ✓
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex-1 px-5 flex flex-col gap-3">

        {/* QR Scanner */}
        <NavItem
          icon={QrCode}
          label="QR Scanner"
          sublabel="Scan desktop session code"
          onClick={() => setShowScanner(true)}
          color="#6366f1"
        />

        {/* Forum */}
        <NavItem
          icon={Globe}
          label="Forum"
          sublabel="Sovereign community"
          href="/forum"
          color="#f59e0b"
        />

        {/* Whale Chat */}
        <NavItem
          icon={MessageSquare}
          label="Whale Chat"
          sublabel="E2EE encrypted messaging"
          href="/chat"
          color="#10b981"
        />

        {/* Status row */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {[
            { icon: Wifi, label: "Network", value: "Online", color: "#10b981" },
            { icon: Lock, label: "E2EE", value: "Active", color: "#6366f1" },
            { icon: Zap, label: "Latency", value: "12ms", color: "#f59e0b" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl p-3 flex flex-col gap-1"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <Icon size={12} style={{ color }} />
              <p className="text-[7px] uppercase tracking-widest text-white/25">{label}</p>
              <p className="text-[10px] font-black text-white/60">{value}</p>
            </div>
          ))}
        </div>

        {/* Disconnect */}
        <div className="mt-auto pt-4 pb-8">
          <button onClick={handleDisconnect}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all active:scale-[0.98]"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "#ef4444" }}>
            <LogOut size={15} />
            Disconnect Session
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && <QRScannerPanel onClose={() => setShowScanner(false)} />}
      </AnimatePresence>
    </div>
  );
}
