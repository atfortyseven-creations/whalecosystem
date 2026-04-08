"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Terminal, Database, Shield, Binary } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { useUIStore } from "@/lib/store/ui-store";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useSWR from "swr";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

gsap.registerPlugin(ScrollTrigger);

const DynamicCryptoCheckoutModal = dynamic(
  () => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal),
  { ssr: false }
);
const ClearanceHeroView = dynamic<any>(
  () => import("./ClearanceView").then((m) => m.ClearanceView),
  { ssr: false }
);

function useLenis() {
  useEffect(() => {
    let lenis: any = null;
    let raf: number;
    (async () => {
      try {
        const { default: Lenis } = await import("lenis");
        lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        const animate = (time: number) => { lenis?.raf(time); raf = requestAnimationFrame(animate); };
        raf = requestAnimationFrame(animate);
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time: number) => { lenis?.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } catch {}
    })();
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); };
  }, []);
}

function Reveal({ children, delay = 0, className = "", yOffset = 40 }: { children: React.ReactNode; delay?: number; className?: string; yOffset?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-6%" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: yOffset }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

const TICKER = [
  "BLOCK: 19284711", "TX_HASH: 0x9fA2...3b1C",
  "⚠ WHALE: 14_200 ETH", "[ZK_PROOF_VERIFIED]",
  "TARGET: DARK_POOL_A", "NET_STATE: SECURE",
  "0x882A...F019 SWAP", "NODE_LATENCY: 12ms",
];

function DataTicker() {
  const { data } = useSWR("/api/network/live-ticker", (url) => fetch(url).then((res) => res.json()), {
    fallbackData: { ticker: TICKER }, refreshInterval: 5000
  });
  const tData = data?.ticker || TICKER;
  const content = [...tData, ...tData, ...tData];

  return (
    <div className="relative w-full border-y border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 overflow-hidden py-2" style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.02)" }}>
      <motion.div className="flex gap-16 will-change-transform w-max" animate={{ x: [0, -2000] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        {content.map((item: string, i: number) => (
          <span key={i} className={`text-[10px] font-mono uppercase tracking-[0.3em] font-black ${item.includes("⚠") ? "text-red-500" : "text-black dark:text-white"}`}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function ZKCard({ icon, title, desc, delay = 0 }: { icon: React.ReactNode; title: string; desc: string; delay?: number }) {
  const [hovered, setHov] = useState(false);
  return (
    <Reveal delay={delay}>
      <div 
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        className="relative p-8 border border-black/10 dark:border-white/10 transition-colors duration-200 bg-white dark:bg-black hover:border-black/30 dark:hover:border-white/30"
      >
        <div className="absolute top-0 right-0 p-2 opacity-30 font-mono text-[8px] text-black dark:text-white">[{title.slice(0,3).toUpperCase()}_MOD]</div>
        <div className="mb-6 inline-flex p-3 border border-black/10 dark:border-white/10 text-black dark:text-white bg-black/5 dark:bg-white/5">
            {icon}
        </div>
        <h3 className="font-mono text-xl font-bold mb-3 text-black dark:text-white uppercase tracking-tight">::{title}</h3>
        <p className="font-mono text-xs text-black/50 dark:text-white/50 leading-relaxed uppercase tracking-wider">{desc}</p>
        
        <motion.div className="absolute bottom-0 left-0 h-[2px] bg-black dark:bg-white"
          initial={{ width: 0 }} animate={{ width: hovered ? "100%" : 0 }} />
      </div>
    </Reveal>
  );
}

export function WhaleAlertLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isConnected } = useSovereignAccount();
  const { openConnectModal } = useUIStore();
  const [showClearance, setShowClearance] = useState(false);
  const [showDocumentGate, setShowDocumentGate] = useState(false);

  useLenis();

  const handleEntry = useCallback(() => {
    if (typeof window !== "undefined" && localStorage.getItem("hasReadDocs") === "true") {
        if (isConnected) router.push("/vip");
        else openConnectModal();
    } else {
        setShowDocumentGate(true);
    }
  }, [isConnected, router, openConnectModal]);

  const executeSystemEntry = useCallback(() => {
    if (typeof window !== "undefined") localStorage.setItem("hasReadDocs", "true");
    setShowDocumentGate(false);
    if (isConnected) router.push("/vip");
    else openConnectModal();
  }, [isConnected, router, openConnectModal]);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden bg-white dark:bg-black text-black dark:text-white font-sans transition-colors duration-300">
      
      {/* ── HEADER WITH TOGGLE ── */}
      <header className="absolute top-0 w-full flex items-center justify-between p-6 z-50">
          <div className="font-black text-xl font-aztec-serif uppercase tracking-tight"></div>
          <ThemeToggle />
      </header>

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh]">
        {/* CRT GRID */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-20" style={{ backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

        <div className="relative z-10 w-full flex flex-col items-center px-6 text-center mt-10">
            <AnimatePresence mode="wait">
                {!showClearance ? (
                    <motion.div key="core" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <h1 className="font-mono text-5xl md:text-8xl font-black mb-6 tracking-tighter uppercase whitespace-nowrap text-black dark:text-white">
                            WHALE<br />ALERT
                        </h1>
                        <p className="font-mono text-sm md:text-base text-black/60 dark:text-white/60 max-w-2xl leading-relaxed uppercase tracking-widest mb-12 font-medium">
                            Democratizing Intelligence. Uncovering dark liquidity to protect retail flow.
                        </p>
                        <div className="flex gap-4">
                            <button onClick={() => setShowClearance(true)} className="px-8 py-4 border border-black/20 dark:border-white/20 text-black dark:text-white font-mono text-sm font-black uppercase tracking-[0.2em] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                GET ACCESS PASS
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="clearance" initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} className="w-full">
                        <ClearanceHeroView onBack={() => setShowClearance(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </section>

      <DataTicker />

      {/* ── MODULES ── */}
      <section className="py-32 px-6 max-w-6xl mx-auto border-t border-black/5 dark:border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ZKCard icon={<Terminal size={24}/>} title="Direct Ingestion" desc="Bypassing visual abstractions. Raw RPC feeds merged into local matrix states." delay={0}/>
              <ZKCard icon={<Shield size={24}/>} title="Zero-Knowledge Base" desc="You are mathematically isolated from the host server. Cryptographic E2E logic." delay={0.1}/>
              <ZKCard icon={<Database size={24}/>} title="Graph Indexing" desc="Stochastic evaluation of mempool flows. Unprecedented memory mapping." delay={0.2}/>
              <ZKCard icon={<Binary size={24}/>} title="Institutional Triggers" desc="Real-time alerts over geometric threshold breaches." delay={0.3}/>
          </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-40 border-y border-black/5 dark:border-white/5 bg-black/5 dark:bg-[#0A0A0A] text-center">
          <h2 className="font-mono text-3xl font-black uppercase tracking-tight text-black dark:text-white mb-6">CONNECT TO PLATFORM</h2>
          <p className="font-mono text-xs text-black/50 dark:text-white/50 mb-12 uppercase tracking-[0.2em]">Live real-time intelligence data.</p>
          <button onClick={handleEntry} className="px-10 py-5 bg-black dark:bg-white text-white dark:text-black font-mono text-sm font-black uppercase tracking-[0.3em] hover:scale-105 transition-transform shadow-lg">
              CONNECT
          </button>
      </section>

      <Footer />

      <DynamicCryptoCheckoutModal isOpen={false} onClose={() => {}} />

      {/* ── ZK HANDSHAKE MODAL ── */}
      <AnimatePresence>
        {showDocumentGate && (
          <div className="fixed inset-0 z-[9999] bg-white/90 dark:bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-colors">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} 
                className="bg-white dark:bg-black border border-black/10 dark:border-white/20 p-8 max-w-2xl w-full flex flex-col font-mono shadow-2xl">
              <div className="flex items-center gap-3 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
                 <Terminal className="text-black dark:text-white" size={20} />
                 <h2 className="text-xl font-black uppercase tracking-tight text-black dark:text-white">CONNECT PROTOCOL</h2>
              </div>
              
              <div className="flex-1 mb-8 p-6 bg-black/5 dark:bg-[#050505] border border-black/10 dark:border-white/10 text-[11px] font-bold text-black/60 dark:text-white/60 leading-[2] uppercase tracking-wider">
                 <p className="mb-4 text-black dark:text-white">CONNECTING...</p>
                 <p className="mb-4">By bypassing this gateway, you enter an absolute Zero-Trust environment. The intelligence matrix offers raw telemetry without financial advice.</p>
                 <p className="mb-4">All cryptographic validations and signatures occur strictly client-side. The node acts purely as a relay.</p>
                 <p className="mt-8 text-black dark:text-white decoration-solid underline underline-offset-4">WAITING FOR SIGNATURE</p>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowDocumentGate(false)} className="px-6 py-4 border border-black/20 dark:border-white/20 text-black dark:text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    CANCEL
                </button>
                <button onClick={executeSystemEntry} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] transition-transform">
                   SIGN MESSAGE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
