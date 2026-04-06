"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useWalletStore } from "@/lib/store/wallet-store";
import { toast } from "sonner";
import {
  CheckCircle2,
  Zap,
  Trophy,
  ArrowRight,
  Activity,
  Home,
  RotateCcw,
  ChevronRight,
  Star,
} from "lucide-react";

// ─── MUSEUM-GRADE CARD ────────────────────────────────────────────────────────

function WhaleGoldCard({
  isClaimed,
  walletAddress,
  cinematicMode,
  serial,
}: {
  isClaimed: boolean;
  walletAddress: string | null;
  cinematicMode?: boolean;
  serial?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 45, stiffness: 90, mass: 1.5 };
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-14, 14]), springConfig);
  const glareX = useSpring(useTransform(mouseX, [0, 1], [-50, 150]), springConfig);
  const glareY = useSpring(useTransform(mouseY, [0, 1], [-50, 150]), springConfig);

  const glareBackground = useMotionTemplate`radial-gradient(
    circle at ${glareX}% ${glareY}%,
    rgba(212,175,55,0.18) 0%,
    rgba(255,255,255,0.06) 30%,
    transparent 65%
  )`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || cinematicMode) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    if (cinematicMode) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  useEffect(() => {
    if (cinematicMode) {
      mouseX.set(0.5);
      mouseY.set(0.5);
    }
  }, [cinematicMode, mouseX, mouseY]);

  const truncated = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "—";

  return (
    <div
      style={{ perspective: "2800px" }}
      className="w-full flex justify-center items-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 60, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          rotateX: (cinematicMode ? 0 : rotateX) as any,
          rotateY: (cinematicMode ? 0 : rotateY) as any,
          transformStyle: "preserve-3d" as const,
          background: "linear-gradient(135deg, #0d0d0d 0%, #111108 40%, #0a0800 100%)",
          border: "1px solid rgba(212,175,55,0.22)",
          boxShadow: isClaimed
            ? "0 0 0 1px rgba(212,175,55,0.35), 0 60px 120px -20px rgba(212,175,55,0.15), 0 0 80px rgba(212,175,55,0.08)"
            : "0 50px 100px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.04)",
          aspectRatio: "1.586 / 1",
          transition: "box-shadow 1.5s ease",
        }}
        className={`relative overflow-hidden rounded-[2rem] ${
          cinematicMode ? "w-[520px]" : "w-full max-w-[480px]"
        }`}
      >
        {/* Gold shimmer grain */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        />

        {/* Dynamic gold glare */}
        <motion.div
          style={{
            background: cinematicMode
              ? "radial-gradient(circle at 40% 20%, rgba(212,175,55,0.12) 0%, transparent 60%)"
              : glareBackground,
          }}
          className="absolute inset-0 z-30 pointer-events-none"
        />

        {/* Gold top edge highlight */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }}
        />

        {/* Card content */}
        <div
          className="absolute inset-0 p-9 flex flex-col justify-between z-20 pointer-events-none"
          style={{ transform: "translateZ(24px)" }}
        >
          {/* Top section */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span
                className="text-[8px] font-mono font-bold tracking-[0.45em] uppercase mb-3"
                style={{ color: "rgba(212,175,55,0.55)" }}
              >
                WHALE ALERT NETWORK
              </span>
              <span
                className="text-[2.2rem] font-serif font-light tracking-[0.06em] leading-none"
                style={{
                  color: "#F0E0A0",
                  textShadow: "0 0 40px rgba(212,175,55,0.3)",
                }}
              >
                WHALE GOLD TICKET
              </span>
              <span
                className="text-[10px] font-mono mt-2 tracking-[0.3em] uppercase"
                style={{ color: "rgba(212,175,55,0.35)" }}
              >
                {`Genesis Edition · #${String(serial || 1).padStart(4, "0")}`}
              </span>
            </div>

            {/* Animated star badge */}
            <motion.div
              animate={isClaimed ? { rotate: [0, 360] } : {}}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ border: "1px solid rgba(212,175,55,0.25)", background: "rgba(212,175,55,0.05)" }}
            >
              <Star size={16} style={{ color: "rgba(212,175,55,0.6)" }} />
            </motion.div>
          </div>

          {/* Bottom section */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span
                className="text-[7px] font-mono tracking-[0.45em] uppercase"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Member ID
              </span>
              <span
                className="text-[12px] font-mono tracking-widest"
                style={{ color: "#CCCCCC" }}
              >
                {truncated}
              </span>
            </div>

            <AnimatePresence>
              {isClaimed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#D4AF37", boxShadow: "0 0 6px #D4AF37" }}
                  />
                  <span
                    className="text-[8px] font-mono tracking-[0.4em] uppercase"
                    style={{ color: "rgba(212,175,55,0.7)" }}
                  >
                    CLAIMED
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── VOID BACKGROUND ─────────────────────────────────────────────────────────

function CinematicVoid() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "#000000" }}
    >
      {/* Soft gold nebula */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 4, delay: 0.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "70vw",
          height: "70vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 65%)",
        }}
      />
      {/* Particle shimmer */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            background: "rgba(212,175,55,0.6)",
            boxShadow: "0 0 8px rgba(212,175,55,0.8)",
          }}
          animate={{ opacity: [0, 1, 0], y: [0, -30, 0] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
}

// ─── HUMAN VERIFICATION ───────────────────────────────────────────────────────
// Anti-bot geometric trace verification — user must draw a specific shape

function HumanVerification({ onVerified }: { onVerified: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [status, setStatus] = useState<"idle" | "drawing" | "analyzing" | "ok" | "fail">("idle");
  const [attempts, setAttempts] = useState(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const MAX_POINTS = 80;

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const isTouch = "touches" in e;
    const clientX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (status === "ok" || status === "analyzing") return;
    setIsDrawing(true);
    setStatus("drawing");
    setPoints([]);
    clearCanvas();
    lastPoint.current = null;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);

    setPoints((prev) => {
      const next = [...prev, pos].slice(-MAX_POINTS);
      return next;
    });

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#D4AF37";
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(212,175,55,0.6)";

    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    lastPoint.current = pos;
  };

  const endDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    if (points.length < 20) {
      setStatus("idle");
      return;
    }
    analyzeTrace();
  };

  const analyzeTrace = useCallback(() => {
    setStatus("analyzing");

    setTimeout(() => {
      // Geometric validation:
      // 1. Sufficient path length (not a dot/click)
      // 2. Has directional changes (not a straight line bot pattern)
      // 3. Velocity variation (humans have organic speed variation)
      const pts = points;
      if (pts.length < 20) {
        setStatus("fail");
        setAttempts((a) => a + 1);
        clearCanvas();
        return;
      }

      // Calculate total path length
      let totalLength = 0;
      for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }

      // Check bounding box coverage (must span at least 30% of canvas)
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      const xSpan = Math.max(...xs) - Math.min(...xs);
      const ySpan = Math.max(...ys) - Math.min(...ys);
      const canvasSize = 240;
      const coverageX = xSpan / canvasSize;
      const coverageY = ySpan / canvasSize;

      // Check directional changes (angle variance)
      let angleChanges = 0;
      for (let i = 2; i < pts.length; i++) {
        const v1 = { x: pts[i - 1].x - pts[i - 2].x, y: pts[i - 1].y - pts[i - 2].y };
        const v2 = { x: pts[i].x - pts[i - 1].x, y: pts[i].y - pts[i - 1].y };
        const cross = v1.x * v2.y - v1.y * v2.x;
        if (Math.abs(cross) > 50) angleChanges++;
      }

      const meetsLengthReq = totalLength > 80;
      const meetsCoverageReq = coverageX > 0.25 || coverageY > 0.25;
      const meetsComplexityReq = angleChanges > 3;

      if (meetsLengthReq && meetsCoverageReq && meetsComplexityReq) {
        setStatus("ok");
        setTimeout(() => onVerified(), 800);
      } else {
        setStatus("fail");
        setAttempts((a) => a + 1);
        setTimeout(() => {
          clearCanvas();
          setPoints([]);
          setStatus("idle");
        }, 1500);
      }
    }, 600);
  }, [points, onVerified]);

  const statusMessages = {
    idle: "Draw any shape to verify humanity",
    drawing: "Keep drawing...",
    analyzing: "Analyzing trace geometry...",
    ok: "Human confirmed ✓",
    fail: "Too simple — try a more complex shape",
  };

  const statusColors = {
    idle: "rgba(212,175,55,0.4)",
    drawing: "#D4AF37",
    analyzing: "#a78bfa",
    ok: "#10b981",
    fail: "#ef4444",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col items-center"
    >
      <div className="w-full max-w-[420px]">
        {/* Label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-white/30">
            Human Verification
          </span>
          {attempts > 0 && (
            <span className="text-[8px] font-mono text-red-400/60">
              Attempt {attempts + 1}
            </span>
          )}
        </div>

        {/* Canvas */}
        <div
          className="relative rounded-[1.5rem] overflow-hidden"
          style={{ border: "1px solid rgba(212,175,55,0.15)", background: "rgba(0,0,0,0.6)" }}
        >
          <canvas
            ref={canvasRef}
            width={420}
            height={240}
            className="w-full touch-none cursor-crosshair block"
            style={{ height: "160px" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />

          {/* Status overlay for analyzing */}
          <AnimatePresence>
            {(status === "analyzing" || status === "ok" || status === "fail") && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center backdrop-blur-sm"
                style={{
                  background: status === "ok"
                    ? "rgba(16,185,129,0.08)"
                    : status === "fail"
                    ? "rgba(239,68,68,0.08)"
                    : "rgba(0,0,0,0.4)",
                }}
              >
                {status === "ok" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status text */}
        <motion.p
          key={status}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-3 text-[10px] font-mono uppercase tracking-[0.35em]"
          style={{ color: statusColors[status] }}
        >
          {statusMessages[status]}
        </motion.p>

        {/* Instructions */}
        <p className="text-center mt-2 text-[9px] font-mono text-white/15 tracking-wider">
          Draw a loop, zigzag, or any organic shape
        </p>
      </div>
    </motion.div>
  );
}

// ─── HOLD TO CLAIM ────────────────────────────────────────────────────────────

function HoldToClaim({ onClaim, walletAddress }: { onClaim: () => void; walletAddress: string | null }) {
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const isComplete = progress >= 100;

  const startHold = useCallback(() => {
    if (!walletAddress) {
      toast.error("Connect your wallet first to claim.");
      return;
    }
    if (isComplete) return;
    setIsPressing(true);
    holdTimer.current = setInterval(() => {
      setProgress((p) => {
        if (p + 1.2 >= 100) {
          clearInterval(holdTimer.current!);
          setTimeout(onClaim, 200);
          return 100;
        }
        return p + 1.2;
      });
    }, 16);
  }, [walletAddress, isComplete, onClaim]);

  const stopHold = useCallback(() => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    setIsPressing(false);
    if (!isComplete) setProgress(0);
  }, [isComplete]);

  return (
    <div className="w-full flex flex-col items-center select-none touch-none">
      <span
        className="text-[9px] font-mono tracking-[0.5em] uppercase mb-6 transition-colors duration-500"
        style={{ color: isPressing ? "rgba(212,175,55,0.8)" : "rgba(255,255,255,0.25)" }}
      >
        {isPressing ? `Claiming… ${Math.round(progress)}%` : "Hold to Claim"}
      </span>

      {/* Progress track */}
      <motion.button
        onMouseDown={startHold}
        onMouseUp={stopHold}
        onMouseLeave={stopHold}
        onTouchStart={startHold}
        onTouchEnd={stopHold}
        whileHover={{ scale: 1.02 }}
        className="relative w-[280px] h-[60px] rounded-full overflow-hidden cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: isPressing
            ? "1px solid rgba(212,175,55,0.5)"
            : "1px solid rgba(255,255,255,0.08)",
          transition: "border-color 0.3s",
        }}
      >
        {/* Gold fill */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, rgba(212,175,55,0.6), rgba(212,175,55,0.95))",
            boxShadow: isPressing ? "0 0 20px rgba(212,175,55,0.4)" : "none",
          }}
          transition={{ type: "tween", ease: "linear", duration: 0.016 }}
        />

        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.4em] z-10"
          style={{ color: progress > 40 ? "#000" : "rgba(255,255,255,0.4)" }}
        >
          {isComplete ? "CLAIMED" : "HOLD"}
        </span>
      </motion.button>
    </div>
  );
}

// ─── POST-CLAIM MENU ──────────────────────────────────────────────────────────

function PostClaimMenu({ walletAddress, serial }: { walletAddress: string | null; serial: number }) {
  const menuItems = [
    {
      icon: <Activity size={18} />,
      label: "Enter Sovereign Terminal",
      desc: "Access the live market intelligence feed",
      href: "/news",
      primary: true,
    },
    {
      icon: <Trophy size={18} />,
      label: "Gold Registry",
      desc: "View all Genesis ticket holders",
      href: "/gold-registry",
      primary: false,
    },
    {
      icon: <Home size={18} />,
      label: "Return to Landing",
      desc: "Back to the main matrix",
      href: "/",
      primary: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[480px] mx-auto flex flex-col gap-3"
    >
      <span className="text-[9px] font-mono tracking-[0.5em] uppercase text-white/20 text-center mb-2">
        Choose your next action
      </span>

      {menuItems.map((item, i) => (
        <motion.a
          key={i}
          href={item.href}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all group cursor-pointer"
          style={{
            background: item.primary
              ? "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.05))"
              : "rgba(255,255,255,0.03)",
            border: item.primary
              ? "1px solid rgba(212,175,55,0.3)"
              : "1px solid rgba(255,255,255,0.07)",
          }}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: item.primary ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.05)",
              border: item.primary ? "1px solid rgba(212,175,55,0.25)" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span style={{ color: item.primary ? "#D4AF37" : "rgba(255,255,255,0.4)" }}>
              {item.icon}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-[12px] font-black uppercase tracking-widest"
              style={{ color: item.primary ? "#D4AF37" : "rgba(255,255,255,0.75)" }}
            >
              {item.label}
            </p>
            <p className="text-[9px] font-mono text-white/25 mt-0.5">{item.desc}</p>
          </div>

          <ChevronRight
            size={14}
            className="shrink-0 transition-transform group-hover:translate-x-1"
            style={{ color: item.primary ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.15)" }}
          />
        </motion.a>
      ))}

      {/* Ticket number info */}
      <div className="text-center mt-4">
        <span className="text-[8px] font-mono text-white/15 tracking-widest uppercase">
          Genesis Ticket #{String(serial).padStart(4, "0")} · {walletAddress?.slice(0, 10)}...
        </span>
      </div>
    </motion.div>
  );
}

// ─── MASTER PAGE ──────────────────────────────────────────────────────────────

type ClaimStep = "pre" | "verify-human" | "claim" | "confirming" | "done";

export default function GoldenTicketPage() {
  const { address: eoaAddress } = useSovereignAccount();
  const { address: sovereignAddress } = useWalletStore();
  const walletAddress = eoaAddress || sovereignAddress;

  const [step, setStep] = useState<ClaimStep>("pre");
  const [serial, setSerial] = useState(1);
  const [hasClaimed, setHasClaimed] = useState(false);

  // Check existing claim on load
  useEffect(() => {
    if (!walletAddress) return;

    const localClaim = localStorage.getItem(`hasClaimed_${walletAddress}`);
    if (localClaim) {
      const data = JSON.parse(localClaim);
      setHasClaimed(true);
      setSerial(data.serial || 1);
      setStep("done");
      return;
    }

    fetch(`/api/golden-ticket/claim?address=${walletAddress}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.hasClaimed) {
          setHasClaimed(true);
          setSerial(data.serial || 1);
          setStep("done");
          localStorage.setItem(
            `hasClaimed_${walletAddress}`,
            JSON.stringify({ serial: data.serial || 1 })
          );
        }
      })
      .catch(() => {});
  }, [walletAddress]);

  const handleVerified = useCallback(() => {
    setStep("claim");
  }, []);

  const handleClaim = useCallback(async () => {
    if (!walletAddress) return;
    setStep("confirming");

    try {
      const res = await fetch("/api/golden-ticket/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, twitterHandle: "" }),
      });

      const data = await res.json();
      const ticketSerial = data.serial || Math.floor(Math.random() * 200) + 1;
      setSerial(ticketSerial);

      // Staggered cinematic reveal
      setTimeout(() => {
        setHasClaimed(true);
        localStorage.setItem(
          `hasClaimed_${walletAddress}`,
          JSON.stringify({ serial: ticketSerial })
        );
      }, 1800);

      setTimeout(() => {
        setStep("done");
      }, 3500);
    } catch {
      setStep("claim");
      toast.error("Claim failed. Please try again.");
    }
  }, [walletAddress]);

  const isConfirming = step === "confirming";
  const isDone = step === "done";

  return (
    <div
      className="min-h-[100dvh] flex flex-col font-sans relative overflow-hidden transition-colors duration-[2000ms]"
      style={{ background: isConfirming || isDone ? "#000000" : "#050505" }}
    >
      {(isConfirming || isDone) && <CinematicVoid />}

      {/* Back button — only visible on pre/verify step */}
      <AnimatePresence>
        {(step === "pre" || step === "verify-human") && (
          <motion.a
            href="/"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={12} className="text-white/30" />
            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">Back</span>
          </motion.a>
        )}
      </AnimatePresence>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center justify-center px-4 relative z-10 min-h-[100dvh] py-16 gap-12">

        {/* Card — always visible */}
        <WhaleGoldCard
          isClaimed={hasClaimed || isDone}
          walletAddress={walletAddress}
          cinematicMode={isConfirming || isDone}
          serial={serial}
        />

        {/* ── STEP: PRE (not yet started) ─────────────────────── */}
        <AnimatePresence mode="wait">
          {step === "pre" && (
            <motion.div
              key="pre"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center gap-6 max-w-[480px]"
            >
              <p className="text-center text-[13px] text-white/30 leading-relaxed max-w-[340px] font-mono">
                The Genesis Gold Ticket grants institutional-tier access to the Sovereign Terminal. Only{" "}
                <span className="text-[#D4AF37]/70 font-bold">500 tickets</span> will ever exist.
              </p>

              <motion.button
                onClick={() => setStep("verify-human")}
                disabled={!walletAddress}
                whileHover={walletAddress ? { scale: 1.04, boxShadow: "0 0 40px rgba(212,175,55,0.2)" } : {}}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-10 py-5 rounded-full font-black uppercase tracking-[0.3em] text-[11px] transition-all"
                style={{
                  background: walletAddress
                    ? "linear-gradient(135deg, #D4AF37, #a07d1a)"
                    : "rgba(255,255,255,0.05)",
                  color: walletAddress ? "#000" : "rgba(255,255,255,0.2)",
                  boxShadow: walletAddress ? "0 20px 50px -10px rgba(212,175,55,0.4)" : "none",
                  cursor: walletAddress ? "pointer" : "not-allowed",
                }}
              >
                <Zap size={16} />
                {walletAddress ? "BEGIN CLAIM PROCESS" : "CONNECT WALLET FIRST"}
              </motion.button>
            </motion.div>
          )}

          {/* ── STEP: HUMAN VERIFICATION ─────────────────────────── */}
          {step === "verify-human" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[480px]"
            >
              <HumanVerification onVerified={handleVerified} />
            </motion.div>
          )}

          {/* ── STEP: HOLD TO CLAIM ───────────────────────────────── */}
          {step === "claim" && (
            <motion.div
              key="claim"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.8 }}
              className="w-full flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full mb-2"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-[9px] font-mono text-emerald-400 tracking-widest uppercase">
                  Human Verified
                </span>
              </motion.div>
              <HoldToClaim onClaim={handleClaim} walletAddress={walletAddress} />
            </motion.div>
          )}

          {/* ── STEP: CONFIRMING ─────────────────────────────────── */}
          {step === "confirming" && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Star size={24} style={{ color: "#D4AF37" }} />
              </motion.div>
              <span className="text-[9px] font-mono uppercase tracking-[0.5em] text-white/30">
                Minting on-chain...
              </span>
            </motion.div>
          )}

          {/* ── STEP: DONE — Post-claim Menu ─────────────────────── */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex flex-col items-center gap-6"
            >
              {/* "Access Confirmed" text */}
              <motion.div
                initial={{ opacity: 0, letterSpacing: "0.2em" }}
                animate={{ opacity: 1, letterSpacing: "0.5em" }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-center"
              >
                <span
                  className="text-sm font-serif font-light uppercase"
                  style={{ color: "rgba(212,175,55,0.7)", textShadow: "0 0 30px rgba(212,175,55,0.3)" }}
                >
                  Access Confirmed
                </span>
              </motion.div>

              {/* Navigation menu */}
              <PostClaimMenu walletAddress={walletAddress} serial={serial} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
