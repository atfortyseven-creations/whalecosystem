"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { WhaleLogo } from "@/components/shared/WhaleLogo";

import { useUIStore } from "@/lib/store/ui-store";

const DynamicQRScannerModal = dynamic(
  () => import("@/components/wallet/QRScannerModal"),
  { ssr: false }
);

const IVORY = "#FAF9F6";
const INK   = "#050505";
const MUTED = "rgba(5,5,5,0.65)";
const FAINT = "rgba(5,5,5,0.10)";

export function MobileLanding() {
  const router = useRouter();
  const { address } = useSovereignAccount();
  const { openConnectModal } = useUIStore();
  const [showScanner, setShowScanner] = useState(false);

  const handleEntry = () => {
    if (address) router.push("/dashboard");
    else openConnectModal?.();
  };

  return (
    <div
      style={{ backgroundColor: IVORY, color: INK, fontFamily: "Inter, system-ui, sans-serif" }}
      className="relative min-h-screen overflow-x-hidden font-sans pb-32"
    >
      {/* ── Background: Solid Ivory ── */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6] pointer-events-none" />

      {/* ── Cosmic wallpaper ── */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <motion.div
          className="absolute"
          style={{
            inset: "-20%", // Give extra padding so translation doesn't expose edges
            backgroundImage: "url('/patron-cosmico-4k.png')",
            backgroundSize: "140%",
            backgroundRepeat: "repeat",
            opacity: 0.04, // Kept explicitly exactly as it was requested -> "EL FONDO DEL LANDING PAGE DEL MOVIL ESTA PERFECTO"
            mixBlendMode: "multiply",
            willChange: "transform",
          }}
          animate={{ x: ["0%", "-3%", "0%"], y: ["0%", "-2%", "0%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ── Downpage Wave with 20% zoom and expert fade ── */}
      <div className="absolute inset-x-0 bottom-0 z-[2] pointer-events-none" style={{ height: "1000px" }}>
        {/* The Wave Image */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden"
        }}>
          <img 
            src="/great-wave.png" 
            alt="The Great Wave" 
            loading="lazy"
            decoding="async"
            style={{ 
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%", 
              height: "auto", 
              transform: "scale(1.2) translateZ(0)", // 20% zoom
              willChange: "transform",
              transformOrigin: "bottom center",
              opacity: 0.95
            }} 
          />
        </div>
        
        {/* The Fusion Gradient to transition perfectly into waves */}
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, #FAF9F6 0%, rgba(250, 249, 246, 0.98) 15%, rgba(250, 249, 246, 0) 100%)",
            zIndex: 3
          }}
        />
        <div 
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to top, rgba(250, 249, 246, 0.9) 0%, rgba(250, 249, 246, 0) 60%)",
            zIndex: 3
          }}
        />
      </div>

      {/* ── Fixed Header Pill with Connect Wallet Button ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between px-5 py-3 rounded-full"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: `1px solid ${FAINT}`,
          boxShadow: "0 4px 20px rgba(5,5,5,0.07)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <WhaleLogo className="w-6 h-6 shrink-0" />
          <div className="hidden sm:block">
            <div className="text-[10px] font-black uppercase tracking-tight" style={{ color: INK }}>
              Whale Alert Network
            </div>
          </div>
        </div>

        {/* Connect Wallet Button (Black button, white text, fully integrated with backend hooks) */}
        <button
          onClick={handleEntry}
          className="px-4 py-2 rounded-full font-sans font-black uppercase tracking-wide transition-transform active:scale-[0.96]"
          style={{
            backgroundColor: INK,
            color: "#FFFFFF",
            fontSize: "9.5px",
            letterSpacing: "0.15em"
          }}
        >
          {address ? "OPEN TERMINAL" : "CONNECT WALLET"}
        </button>
      </motion.header>

      {/* ── Fully Text-Based Content Layer (README Content) ── */}
      <div className="relative z-10 max-w-[840px] mx-auto px-6 pt-36 pb-64 text-[15.5px] leading-[1.8]" style={{ color: MUTED }}>
        
        <h1 className="text-[2.6rem] font-black tracking-[-0.03em] leading-[1.1] mb-16" style={{ color: INK }}>
          Whale Alert Network
        </h1>

        {address && (
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 mb-16">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-[#050505]">Synchronized: {address.slice(0,6)}...{address.slice(-4)}</span>
              </div>
              <button 
                onClick={() => setShowScanner(true)} 
                className="w-full text-center py-4 rounded-full font-black uppercase tracking-widest text-[#FAF9F6] active:scale-[0.98] transition-transform"
                style={{ background: INK, fontSize: "11px" }}
              >
                OPEN SCANNER (SYNC TO PC)
              </button>
              <button 
                onClick={() => {
                    sessionStorage.setItem('mobile_news_bypass', 'true');
                    window.location.reload(); 
                }} 
                className="w-full text-center py-4 rounded-full font-black uppercase tracking-widest text-[#050505] border border-black/10 active:bg-black/5 active:scale-[0.98] transition-all"
                style={{ fontSize: "11px" }}
              >
                VER NOTICIAS
              </button>
           </motion.div>
        )}

        <div className="space-y-20">
          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>The Origin and Vision</h2>
            <p className="mb-6">
              The blockchain ecosystem suffers from a fundamental asymmetry of information. The raw data produced by public distributed ledgers is theoretically visible to anyone. In practice, however, the velocity, volume, and structural complexity of that data mean that only those with access to advanced indexing infrastructure can extract meaning from it in time to act upon that meaning. A private institution with a team of engineers can deploy purpose-built systems to detect a significant capital movement on the Ethereum mainnet nearly four minutes before that movement propagates through the public mempool. An individual operating without institutional infrastructure cannot.
            </p>
            <p className="mb-6">
              This asymmetry is not a natural law. It is a consequence of the complexity barrier that separates raw on-chain data from actionable intelligence. The Whale Alert Network was conceived specifically to dismantle that barrier, to build from first principles an intelligence system capable of detecting, verifying, and disseminating high value capital movements with accuracy and latency sufficient to place the individual user on the same informational footing as an institutional actor.
            </p>
            <p>
              The vision that guided the construction of this system was intentionally uncompromising. There would be no mock data, no placeholders, no simulated signals, and no fallback to approximate values in cases where real data was temporarily unavailable. Every signal surfaced by the system would be sourced directly from live blockchain state verified on chain, processed cryptographically, and delivered with an editorial context that a trained analyst could act upon immediately. The system is operational infrastructure, built with absolute precision.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>Architectural Philosophy</h2>
            <p className="mb-6">
              The zero mock mandate ensures no component of the system displays fabricated data in place of real on-chain state. This decision has immediate and far-reaching implications for every subsequent design choice. It rules out the possibility of static demonstration modes. It requires that every data pipeline from blockchain node connection through downstream networks to the rendering layer be fully operational at all times.
            </p>
            <p className="mb-6">
              The sovereignty principle dictates that every interaction a user conducts with the system must occur without creating any dependency on the system servers for the security of their assets. The server layer provides intelligence. It does not under any circumstances touch private keys, hold funds in custody, or make decisions on the user's behalf.
            </p>
            <p>
              The institutional grade standard mandates that the production quality must be indistinguishable from that of an institutional engineering organization. This standard applies to code quality, interface design, database schema structure, error handling, security posture, and visual presentation.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>The Ingestion Engine</h2>
            <p>
              The ingestion engine is the operational core of the Whale Alert Network. It is the component responsible for acquiring raw blockchain data across sixteen parallel networks, applying the first layer of significance filtering based on dynamic statistical thresholds, and routing the resulting verified events to the downstream intelligence mesh.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>Sovereign Mesh Protocol</h2>
            <p>
              The Sovereign Mesh is the primary distribution layer that propagates verified intelligence from the ingestion engine to all connected clients seamlessly. It operates as a high-frequency, low-latency network with strict access control, ensuring that authenticated intelligence reaches users with minimal delay and maximum reliability across all defined significance tiers.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>The Akashic Ledger</h2>
            <p>
              The Akashic Ledger constitutes the permanent institutional memory of the Whale Alert Network. It serves as the definitive, verified, immutable record of every capital movement that crosses the threshold of systemic significance, providing historical context and permanent documentation for crucial macroeconomic shifts on-chain.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>Mass Transfer Intelligence</h2>
            <p>
              The Mass Transfer Intelligence module is explicitly designed to detect and surface a specific category of capital movement that isolated transaction monitoring cannot identify. It maps coordinated multi-address, multi-chain capital flows that collectively reveal an institutional position adjustment of substantial magnitude before it resolves on the market.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>The Sovereign Vault</h2>
            <p>
              The Sovereign Vault is the non-custodial wallet management system that empowers users to interact with the full suite of on-chain operations available through the sovereign terminal interface. All key generation and transaction signing execute purely within isolated local environments, ensuring absolute personal sovereignty over capital.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>Zero Knowledge Infrastructure</h2>
            <p>
              The zero knowledge proof infrastructure provides two distinct and essential capabilities: private signal authentication for the underlying data mesh, and definitive identity verification for Sybil-resistant access control without ever compromising user privacy or biometric data.
            </p>
          </section>

          <section>
            <h2 className="text-[22px] font-black tracking-[-0.02em] mb-6" style={{ color: INK }}>The Data Persistence Layer</h2>
            <p>
              The data persistence architecture is thoughtfully designed around the principle of separation of concerns. Different categories of data have unique access patterns, consistency requirements, and performance characteristics. Every data object is securely stored in the environment most perfectly suited to those dimensions, creating an exceptionally resilient query foundation.
            </p>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showScanner && (
          <DynamicQRScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onScan={(data: string) => alert(data)} />
        )}
      </AnimatePresence>
    </div>
  );
}
