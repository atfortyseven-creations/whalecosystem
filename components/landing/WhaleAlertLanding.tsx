"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { BookOpen, Network, Shield, Database, Activity, Cpu, ArrowRight, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useUIStore } from "@/lib/store/ui-store";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";

const DynamicCryptoCheckoutModal = dynamic(() => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal), { ssr: false });
const DynamicLegendaryCursor = dynamic(() => import("@/components/landing/LegendaryCursor").then((m) => m.LegendaryCursor), { ssr: false });

// ─── ANIMATION CONFIGURATION (240Hz) ──────────────────────────────────────
const SPRING = { type: "spring" as const, stiffness: 60, damping: 20, mass: 1 };
const SPRING_SMOOTH = { type: "spring" as const, stiffness: 40, damping: 25, mass: 1.5 };

// ─── MATHEMATICAL CANVAS (Academic Elegance in Three.js) ─────────────────────
// Represents a serene, structured environment for graph analysis.
const AcademicCanvas = React.memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Serene grid and node system
    interface Node { x: number; y: number; vx: number; vy: number; connections: number[] }
    const GRID_SIZE = 120;
    const cols = Math.ceil(W / GRID_SIZE) + 1;
    const rows = Math.ceil(H / GRID_SIZE) + 1;
    const nodes: Node[] = [];

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        nodes.push({
          x: i * GRID_SIZE + (Math.random() - 0.5) * 40,
          y: j * GRID_SIZE + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          connections: []
        });
      }
    }

    let lastTime = 0;

    const draw = (now: number) => {
      const delta = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      // Base: Deep Absolute Black
      ctx.fillStyle = "#020202";
      ctx.fillRect(0, 0, W, H);

      // Draw subtle grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      
      // Sustain nodes
      for (const node of nodes) {
        node.x += node.vx * delta;
        node.y += node.vy * delta;
        
        if (node.x < 0 || node.x > W) node.vx *= -1;
        if (node.y < 0 || node.y > H) node.vy *= -1;
      }

      // Draw proximity connections (Euclidean Architecture)
      const DISTANCE_THRESHOLD = 180;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;
          
          if (distSq < DISTANCE_THRESHOLD * DISTANCE_THRESHOLD) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / DISTANCE_THRESHOLD) * 0.08;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha})`; // Academic Gold
            ctx.stroke();
          }
        }
      }

      // Draw nodes (Mathematical points)
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ willChange: "transform", background: "#020202" }}
    />
  );
});
AcademicCanvas.displayName = "AcademicCanvas";

// ─── REVEAL COMPONENT (Smooth Transitions) ────────────────────────
interface RevealProps { children: React.ReactNode; delay?: number; className?: string; yOffset?: number }
function Reveal({ children, delay = 0, className = "", yOffset = 40 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{ ...SPRING, delay, duration: 1.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── ACADEMIC AND STRUCTURAL DATA ─────────────────────────────────────────

const ARCHITECTURE_PILLARS = [
  {
    icon: <Cpu size={24} strokeWidth={1.5} />,
    title: "In-Memory Ingestion Kinetics",
    desc: "The system bypasses intermediate abstractions, processing base-layer events within RAM-resident matrices. This structuring allows for rigorous evaluation of stochastic deviations without altering the natural data flow."
  },
  {
    icon: <Lock size={24} strokeWidth={1.5} />,
    title: "Conditional Cryptographic Frontier",
    desc: "We ground the architecture on the non-negotiable principle of Zero-Trust. The protocol delegates cryptographic computation entirely to the client, encapsulating state vectors under E2EE (End-to-End Encryption) standards."
  },
  {
    icon: <Network size={24} strokeWidth={1.5} />,
    title: "Multi-Layer Indexing",
    desc: "Unification of directed graphs from independent instances. We formulate state trees that reduce algorithmic complexity when identifying and classifying capital convergences in real-time."
  },
  {
    icon: <Shield size={24} strokeWidth={1.5} />,
    title: "Integrity and Regulatory Compliance",
    desc: "We incorporate underlying Zero-Knowledge validations to sustain adherence to international regulatory frameworks, ensuring auditing solvency without compromising the ontological sovereignty of the data."
  }
];

const MODULE_DEFINITIONS = [
  {
    category: "Capture Layer",
    title: "Institutional Flow Detector",
    description: "A deterministic algorithm designed to monitor Ethereum Virtual Machine and Hyperliquid L1 subroutines. It analyzes absolute volumes and deciphers financial organization patterns through objective heuristics.",
    points: ["Raw block analysis", "Z-Score applied to anomalies", "Non-blocking asynchronous filtering"]
  },
  {
    category: "Representation Layer",
    title: "Integrated Protocol Matrix",
    description: "A structured terminal for visualizing the synthesis of extracted data. It presents the researcher with a sober interface, devoid of ornamental metrics, focused exclusively on the technical veracity of information.",
    points: ["Dark pool liquidity (CLOB) junction", "EIP-712 signature aggregation", "Relational database persistence"]
  }
];

// ─── MAIN COMPONENT ────────────────────────────────────────
export function WhaleAlertLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isConnected } = useSovereignAccount();
  const { openConnectModal } = useUIStore();
  const [showCheckout, setShowCheckout] = useState(false);

  // Parallax Controllers
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);
  
  const springOpacity = useSpring(heroOpacity, SPRING_SMOOTH);
  const springY = useSpring(heroY, SPRING_SMOOTH);

  const handleEntry = useCallback(() => {
    if (isConnected) router.push("/vip");
    else openConnectModal();
  }, [isConnected, router, openConnectModal]);

  return (
    <div 
      ref={containerRef}
      style={{ backgroundColor: "#020202", color: "#E0E0E0", minHeight: "100vh" }}
      className="relative w-full overflow-x-hidden font-sans selection:bg-[#D4AF37]/30 selection:text-white"
    >
      <DynamicLegendaryCursor />
      
      <AcademicCanvas />

      {/* ─── ACADEMIC PROLOGUE (HERO) ─── */}
      <motion.section 
        style={{ opacity: springOpacity, y: springY }}
        className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-12 max-w-5xl mx-auto"
      >
        <Reveal yOffset={60}>
          <div className="flex items-center gap-4 mb-8">
            <span style={{ color: "#D4AF37" }} className="font-mono text-xs tracking-widest uppercase opacity-80">
              Foundational Document
            </span>
            <div style={{ backgroundColor: "rgba(212, 175, 55, 0.3)" }} className="h-[1px] w-12" />
          </div>
          
          <h1 
            style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} 
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight leading-[1.1] mb-8"
          >
            Whale Alert Network.
            <br />
            <span style={{ color: "#8A94A6" }}>Financial Observation Architecture.</span>
          </h1>
          
          <p 
            style={{ color: "#A0AABF", maxWidth: "680px" }} 
            className="text-base md:text-lg font-light leading-relaxed mb-16"
          >
            Our research into distributed network topology is formalized within this environment. 
            We do not seek unfounded disruptions, but rather the objective, deterministic, and 
            mathematically rigorous observation of institutional liquidity flows. A system built 
            upon the immutable principles of cryptography and asynchronous analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <button
              onClick={handleEntry}
              style={{ backgroundColor: "#EAEAEA", color: "#0A0A0A" }}
              className="px-8 py-3.5 rounded text-sm font-medium transition-transform hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(255,255,255,0.05)] flex items-center gap-3"
            >
              <BookOpen size={16} strokeWidth={1.5} />
              Establish Connectivity
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              style={{ border: "1px solid rgba(212, 175, 55, 0.4)", color: "#D4AF37" }}
              className="px-8 py-3.5 rounded text-sm font-medium transition-all hover:bg-[rgba(212,175,55,0.05)] hover:-translate-y-1"
            >
              Acquire Academic license
            </button>
          </div>
        </Reveal>
      </motion.section>

      {/* ─── STRUCTURAL ENGINEERING PRINCIPLES (PILLARS) ─── */}
      <section className="relative z-10 py-32 px-6 md:px-12 max-w-6xl mx-auto border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div className="mb-20">
            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl md:text-4xl font-light mb-6">
              Structural Engineering Principles
            </h2>
            <p style={{ color: "#8A94A6", maxWidth: "700px" }} className="text-base leading-relaxed font-light">
              The robustness of the system does not lie in superficial innovation, but in the correct 
              amalgamation of established computational paradigms. Below, we detail the logical 
              anatomy that sustains our infrastructure.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {ARCHITECTURE_PILLARS.map((pillar, index) => (
            <Reveal key={index} delay={index * 0.1} yOffset={30}>
              <div className="group flex flex-col items-start">
                <div 
                  style={{ color: "#D4AF37", backgroundColor: "rgba(212, 175, 55, 0.05)", border: "1px solid rgba(212, 175, 55, 0.15)" }}
                  className="p-4 rounded-lg mb-6 transition-colors group-hover:bg-[rgba(212,175,55,0.08)]"
                >
                  {pillar.icon}
                </div>
                <h3 style={{ color: "#E0E0E0" }} className="text-xl font-medium mb-4">
                  {pillar.title}
                </h3>
                <p style={{ color: "#7B8699" }} className="text-sm font-light leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── FUNCTIONAL IMPLEMENTATION MODULES ─── */}
      <section className="relative z-10 py-32 px-6 md:px-12 max-w-6xl mx-auto border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div className="mb-20 text-center">
            <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl md:text-4xl font-light mb-6">
              Functional Implementation
            </h2>
            <p style={{ color: "#8A94A6", maxWidth: "600px" }} className="text-base leading-relaxed font-light mx-auto">
              The materialization of the described architecture concludes in silent observation modules. 
              No simulation, no artificial latency. Empirical data presented with rigor.
            </p>
          </div>
        </Reveal>

        <div className="space-y-8">
          {MODULE_DEFINITIONS.map((mod, index) => (
            <Reveal key={index} delay={index * 0.1}>
              <div 
                style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }}
                className="rounded-xl p-8 md:p-12 backdrop-blur-sm flex flex-col md:flex-row gap-8 md:gap-16 items-start"
              >
                <div className="md:w-1/3 shrink-0">
                  <div style={{ color: "#D4AF37" }} className="text-xs font-mono tracking-widest uppercase mb-4 opacity-70">
                    {mod.category}
                  </div>
                  <h3 style={{ color: "#EAEAEA" }} className="text-2xl font-light">
                    {mod.title}
                  </h3>
                </div>
                
                <div className="md:w-2/3">
                  <p style={{ color: "#8A94A6" }} className="text-base leading-relaxed font-light mb-6">
                    {mod.description}
                  </p>
                  <ul className="space-y-3">
                    {mod.points.map((point, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div style={{ backgroundColor: "rgba(212, 175, 55, 0.4)" }} className="w-1 h-1 rounded-full shrink-0" />
                        <span style={{ color: "#B8C0D0" }} className="text-sm font-light">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── DATA MATRIX ACCESS ─── */}
      <section className="relative z-10 py-40 px-6 max-w-4xl mx-auto text-center border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <Reveal>
          <div style={{ color: "#D4AF37", fill: "rgba(212, 175, 55, 0.1)" }} className="flex justify-center mb-8">
            <Database size={32} strokeWidth={1} />
          </div>
          <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-3xl font-light mb-6">
            Access to the Whale Alert Network Matrix
          </h2>
          <p style={{ color: "#8A94A6" }} className="text-base leading-relaxed font-light mb-12 max-w-2xl mx-auto">
            The Whale Alert Network terminal is available for those who require this structural clarity. 
            Access requires the verification of cryptographic signatures under strict session protocols.
          </p>
          
          <button
            onClick={handleEntry}
            style={{ border: "1px solid rgba(255, 255, 255, 0.2)", color: "#EAEAEA" }}
            className="px-8 py-3.5 rounded text-sm font-medium transition-colors hover:bg-white hover:text-black flex items-center justify-center gap-3 mx-auto"
          >
            <span>Initialize Network Session</span>
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </Reveal>
      </section>

      {/* ─── FOOTER ─── */}
      <div className="relative z-10">
        <Footer />
      </div>

      <DynamicCryptoCheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </div>
  );
}
