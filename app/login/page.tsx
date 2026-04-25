"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import {
  Chrome,
  Smartphone,
  Shield,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Wifi,
  Puzzle,
  Wallet,
  Lock,
  Zap,
} from "lucide-react";

// ── Wave Background using olas-hokusai-4k.png ──────────────────────────────────
function WaveBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* The legendary wave image — hardware accelerated, zero quality loss */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      />
      {/* Overlay to keep text readable — dark at bottom, transparent at top */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(2,6,23,0.55) 0%, rgba(2,6,23,0.72) 40%, rgba(2,6,23,0.88) 100%)",
        }}
      />
    </div>
  );
}

// ── Instruction Step Card ──────────────────────────────────────────────────────
function StepCard({
  step,
  icon,
  title,
  description,
  delay = 0,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex gap-5 items-start p-6 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* Step number */}
      <div className="shrink-0 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        <span className="font-black text-xs text-white/70 font-mono">{String(step).padStart(2, "0")}</span>
      </div>

      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/80">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-black text-white text-sm uppercase tracking-wider mb-1">{title}</p>
        <p className="text-white/55 text-[12px] leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ── Scroll Indicator ───────────────────────────────────────────────────────────
function ScrollHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.8 }}
      className="flex flex-col items-center gap-2 mt-10"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/35">
        Scroll para conectar
      </p>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="w-6 h-10 rounded-full border border-white/25 flex items-start justify-center pt-2"
      >
        <motion.div
          animate={{ height: ["30%", "60%", "30%"], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="w-[2px] bg-white/60 rounded-full"
        />
      </motion.div>
      <ChevronDown size={14} className="text-white/35 animate-bounce" />
    </motion.div>
  );
}

// ── Connect Panel (Panel 2) ────────────────────────────────────────────────────
function ConnectPanel() {
  const { openConnectModal } = useConnectModal();
  const { isConnected, address } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      setTimeout(() => router.replace("/"), 1200);
    }
  }, [isConnected, router]);

  return (
    <section
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div
          className="rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-8"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo */}
          <div
            className="w-20 h-20 rounded-[1.8rem] flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <img
              src="/official-whale-legendary.png"
              alt="Whale Alert"
              className="w-12 h-12 object-contain drop-shadow-lg"
            />
          </div>

          {/* Text */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-white/35 mb-3">
              Sovereign Terminal
            </p>
            <h2 className="text-3xl font-black text-white tracking-tighter leading-tight mb-3">
              Conecta tu Wallet
            </h2>
            <p className="text-white/50 text-[13px] leading-relaxed">
              Autenticación no custodial. Tu firma criptográfica es tu identidad — sin contraseñas, sin cuentas.
            </p>
          </div>

          {/* Connect button */}
          {isConnected ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <p className="font-black text-white uppercase tracking-widest text-sm">
                ¡Conectado!
              </p>
              <p className="font-mono text-white/40 text-[11px]">
                {address?.slice(0, 10)}…{address?.slice(-8)}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-white/25">
                Redirigiendo al terminal…
              </p>
            </motion.div>
          ) : (
            <button
              onClick={() => openConnectModal?.()}
              className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-3 group shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(230,230,230,0.9) 100%)",
                color: "#050505",
              }}
            >
              <Wallet size={18} />
              Conectar Wallet
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* Security note */}
          <div className="flex items-start gap-3 pt-2 border-t border-white/10 w-full text-left">
            <Lock size={13} className="text-white/30 mt-0.5 shrink-0" />
            <p className="text-white/30 text-[10px] leading-relaxed">
              Autenticación ECDSA. Tus claves privadas nunca salen de tu dispositivo. Compatible con MetaMask, Rainbow, Coinbase Wallet y cualquier wallet injected o WalletConnect.
            </p>
          </div>

          {/* Supported networks */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["ETH", "BASE", "ARB", "OP", "POL"].map((n) => (
              <span
                key={n}
                className="font-mono text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#020617]">
      <WaveBackground />

      {/* ── PANEL 1: EDUCATIONAL GUIDE ────────────────────────────────── */}
      <section className="relative z-10 min-h-screen flex flex-col px-6 py-16 max-w-2xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3 mb-16"
        >
          <img
            src="/official-whale-monochrome.png"
            className="w-7 h-7 brightness-0 invert opacity-70"
            alt="Whale Alert"
          />
          <span className="font-black text-sm uppercase tracking-tight text-white/60">
            Whale Alert Network
          </span>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[8px] uppercase tracking-widest text-white/40">Live</span>
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.5em] text-white/35 mb-5">
            Guía de Acceso · Sovereign Terminal
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-[1.05] mb-5">
            Cómo conectar
            <br />
            <span className="text-white/50">tu wallet</span>
          </h1>
          <p className="text-white/50 text-[14px] leading-relaxed max-w-lg">
            El Sovereign Terminal usa autenticación <span className="text-white/80 font-bold">Web3 pura</span> — sin email, sin contraseñas, sin cuentas. Solo tu wallet y tu firma criptográfica.
          </p>
        </motion.div>

        {/* ── OPCIÓN A: Chrome Extension ── */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
              <Chrome size={12} className="text-indigo-400" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-indigo-300 font-black">Desde Chrome / Brave</span>
            </div>
            <div className="h-px flex-1 bg-white/10" />
          </motion.div>

          <div className="flex flex-col gap-3">
            <StepCard
              step={1}
              icon={<Puzzle size={18} />}
              title="Instala MetaMask o la extensión"
              description='Ve a la Chrome Web Store y busca "MetaMask" (el zorro naranja). Instala la extensión oficial. También funciona con Coinbase Wallet Extension, Rainbow, Rabby, y cualquier extensión EIP-6963 compatible.'
              delay={0.35}
            />
            <StepCard
              step={2}
              icon={<Wallet size={18} />}
              title="Crea o importa tu wallet"
              description='Al abrir MetaMask por primera vez, crea una nueva wallet (guarda tu seed phrase en un lugar seguro) o importa una existente. Una vez configurada, la extensión aparecerá en la barra de Chrome.'
              delay={0.45}
            />
            <StepCard
              step={3}
              icon={<Zap size={18} />}
              title="Haz scroll y pulsa «Conectar Wallet»"
              description='Desplázate hacia abajo en esta página. Pulsa el botón "Conectar Wallet". Tu extensión mostrará una ventana de confirmación. Aprueba la conexión — eso es todo.'
              delay={0.55}
            />
          </div>
        </div>

        {/* ── OPCIÓN B: Wallet Móvil ── */}
        <div className="mb-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Smartphone size={12} className="text-emerald-400" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-300 font-black">Desde Móvil (WalletConnect)</span>
            </div>
            <div className="h-px flex-1 bg-white/10" />
          </motion.div>

          <div className="flex flex-col gap-3">
            <StepCard
              step={1}
              icon={<Smartphone size={18} />}
              title="Descarga una wallet móvil"
              description='Instala MetaMask, Rainbow, Trust Wallet o Coinbase Wallet desde el App Store o Google Play. Son gratuitas y de código abierto.'
              delay={0.65}
            />
            <StepCard
              step={2}
              icon={<Wifi size={18} />}
              title="Haz scroll y usa WalletConnect"
              description='En el panel de conexión (debajo), selecciona "WalletConnect". Se mostrará un código QR. Escanéalo con tu wallet móvil — la sesión se sincronizará automáticamente.'
              delay={0.75}
            />
          </div>
        </div>

        {/* ── Security Badge ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex items-start gap-3 px-5 py-4 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Shield size={16} className="text-white/30 mt-0.5 shrink-0" />
          <p className="text-white/35 text-[11px] leading-relaxed">
            <span className="text-white/60 font-bold">100% Non-Custodial.</span>{" "}
            Nunca pedimos ni almacenamos tu seed phrase, clave privada ni email. La autenticación es puramente criptográfica mediante ECDSA.
          </p>
        </motion.div>

        {/* Scroll hint */}
        <ScrollHint />
      </section>

      {/* ── PANEL 2: CONNECT BUTTON ───────────────────────────────────── */}
      <ConnectPanel />

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/official-whale-monochrome.png" className="w-4 h-4 brightness-0 invert opacity-25" alt="" />
          <span className="font-mono text-[8px] uppercase tracking-widest text-white/20">
            Whale Alert Network · Sovereign Terminal
          </span>
        </div>
        <div className="flex items-center gap-4">
          {["MetaMask", "Rainbow", "Coinbase", "WalletConnect"].map((w) => (
            <span key={w} className="font-mono text-[7px] uppercase tracking-widest text-white/15 hidden md:block">
              {w}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
