"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import dynamic from "next/dynamic";
import { Github, Twitter } from "lucide-react";

const DynamicCryptoCheckoutModal = dynamic(
  () => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal),
  { ssr: false }
);

const BG   = "#FAF9F6";
const INK  = "#050505";
const MUTED= "rgba(5,5,5,0.60)";

export default function WhaleAlertLanding() {
  const router = useRouter();
  const { address } = useSovereignAccount();
  const [showGate, setShowGate] = useState(false);

  const handleEntry = () => {
    if (address) router.push("/dashboard");
    else router.push("/connect");
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden font-sans pb-32" style={{ background: BG, color: INK }}>
      
      {/* Background layer: solid ivory */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6] pointer-events-none" />

      {/* Cosmic pattern layer */}
      <motion.div 
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          width: "140%",
          height: "140%",
          top: "-20%",
          left: "-20%",
          backgroundImage: "url('/patron-cosmico-4k.png')",
          backgroundSize: "800px",
          backgroundRepeat: "repeat",
          opacity: 0.15,
          mixBlendMode: "multiply",
          willChange: "transform"
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "linear",
          repeatType: "mirror"
        }}
      />

      {/* Downpage Wave with 15% zoom and blend gradient */}
      <div className="absolute inset-x-0 bottom-0 z-[2] pointer-events-none" style={{ height: "1200px" }}>
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
            src="/olas-hokusai-4k.png" 
            alt="" 
            loading="lazy"
            decoding="async"
            style={{ 
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%", 
              height: "auto", 
              transform: "scale(1.15) translateZ(0)",
              willChange: "transform",
              transformOrigin: "bottom center",
              opacity: 0.95
            }} 
          />
        </div>
        
        {/* The Fusion Gradient to transition pattern/ivory into waves seamlessly */}
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, #FAF9F6 0%, rgba(250, 249, 246, 0.95) 20%, rgba(250, 249, 246, 0) 100%)",
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
            background: "linear-gradient(to top, #FAF9F6 0%, rgba(250, 249, 246, 0) 60%)",
            zIndex: 3
          }}
        />
      </div>

      {/* Simple Top Navigation just for Access Terminal */}
      <div className="absolute top-10 right-10 z-50">
        <button onClick={handleEntry}
          className="px-8 py-3.5 rounded-full transition-all hover:scale-[1.04] active:scale-[0.96]"
          style={{
            background: INK, color: "#fff", fontSize: "11px",
            fontFamily: "monospace", fontWeight: 900,
            letterSpacing: "0.15em", textTransform: "uppercase",
            boxShadow: "0 8px 30px rgba(5,5,5,0.25)",
          }}
        >
          {address ? "Open Terminal" : "Access Terminal"}
        </button>
      </div>

      {/* Text Content Layer */}
      <div className="relative z-10 max-w-[840px] mx-auto px-8 pt-48 pb-64 text-[17.5px] leading-[1.85]" style={{ color: MUTED }}>
        
        <h1 className="text-[3.5rem] md:text-[4.5rem] font-black tracking-[-0.03em] leading-[1.1] mb-24" style={{ color: INK }}>
          Whale Alert Network
        </h1>

        <div className="space-y-24">
          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>The Origin and Vision</h2>
            <p className="mb-8">
              The blockchain ecosystem suffers from a fundamental asymmetry of information. The raw data produced by public distributed ledgers is theoretically visible to anyone. In practice, however, the velocity, volume, and structural complexity of that data mean that only those with access to advanced indexing infrastructure can extract meaning from it in time to act upon that meaning. A private institution with a team of engineers can deploy purpose-built systems to detect a significant capital movement on the Ethereum mainnet nearly four minutes before that movement propagates through the public mempool. An individual operating without institutional infrastructure cannot.
            </p>
            <p className="mb-8">
              This asymmetry is not a natural law. It is a consequence of the complexity barrier that separates raw on-chain data from actionable intelligence. The Whale Alert Network was conceived specifically to dismantle that barrier, to build from first principles an intelligence system capable of detecting, verifying, and disseminating high value capital movements with accuracy and latency sufficient to place the individual user on the same informational footing as an institutional actor.
            </p>
            <p>
              The vision that guided the construction of this system was intentionally uncompromising. There would be no mock data, no placeholders, no simulated signals, and no fallback to approximate values in cases where real data was temporarily unavailable. Every signal surfaced by the system would be sourced directly from live blockchain state verified on chain, processed cryptographically, and delivered with an editorial context that a trained analyst could act upon immediately. The system is operational infrastructure, built with absolute precision.
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>Architectural Philosophy</h2>
            <p className="mb-8">
              The zero mock mandate ensures no component of the system displays fabricated data in place of real on-chain state. This decision has immediate and far-reaching implications for every subsequent design choice. It rules out the possibility of static demonstration modes. It requires that every data pipeline from blockchain node connection through downstream networks to the rendering layer be fully operational at all times.
            </p>
            <p className="mb-8">
              The sovereignty principle dictates that every interaction a user conducts with the system must occur without creating any dependency on the system servers for the security of their assets. The server layer provides intelligence. It does not under any circumstances touch private keys, hold funds in custody, or make decisions on the user's behalf.
            </p>
            <p>
              The institutional grade standard mandates that the production quality must be indistinguishable from that of an institutional engineering organization. This standard applies to code quality, interface design, database schema structure, error handling, security posture, and visual presentation.
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>The Ingestion Engine</h2>
            <p>
              The ingestion engine is the operational core of the Whale Alert Network. It is the component responsible for acquiring raw blockchain data across sixteen parallel networks, applying the first layer of significance filtering based on dynamic statistical thresholds, and routing the resulting verified events to the downstream intelligence mesh.
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>Sovereign Mesh Protocol</h2>
            <p>
              The Sovereign Mesh is the primary distribution layer that propagates verified intelligence from the ingestion engine to all connected clients seamlessly. It operates as a high-frequency, low-latency network with strict access control, ensuring that authenticated intelligence reaches users with minimal delay and maximum reliability across all defined significance tiers.
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>The Akashic Ledger</h2>
            <p>
              The Akashic Ledger constitutes the permanent institutional memory of the Whale Alert Network. It serves as the definitive, verified, immutable record of every capital movement that crosses the threshold of systemic significance, providing historical context and permanent documentation for crucial macroeconomic shifts on-chain.
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>Mass Transfer Intelligence</h2>
            <p>
              The Mass Transfer Intelligence module is explicitly designed to detect and surface a specific category of capital movement that isolated transaction monitoring cannot identify. It maps coordinated multi-address, multi-chain capital flows that collectively reveal an institutional position adjustment of substantial magnitude before it resolves on the market.
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>The Sovereign Vault</h2>
            <p>
              The Sovereign Vault is the non-custodial wallet management system that empowers users to interact with the full suite of on-chain operations available through the sovereign terminal interface. All key generation and transaction signing execute purely within isolated local environments, ensuring absolute personal sovereignty over capital.
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>Zero Knowledge Infrastructure</h2>
            <p>
              The zero knowledge proof infrastructure provides two distinct and essential capabilities: private signal authentication for the underlying data mesh, and definitive identity verification for Sybil-resistant access control without ever compromising user privacy or biometric data.
            </p>
          </section>

          <section>
            <h2 className="text-[26px] font-black tracking-[-0.02em] mb-8" style={{ color: INK }}>The Data Persistence Layer</h2>
            <p>
              The data persistence architecture is thoughtfully designed around the principle of separation of concerns. Different categories of data have unique access patterns, consistency requirements, and performance characteristics. Every data object is securely stored in the environment most perfectly suited to those dimensions, creating an exceptionally resilient query foundation.
            </p>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showGate && (
          <DynamicCryptoCheckoutModal isOpen={showGate} onClose={() => setShowGate(false)} />
        )}
      </AnimatePresence>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-black/5 mt-0">
        <div className="max-w-[840px] mx-auto px-8 py-12 flex flex-col gap-8">

          {/* Social row */}
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#050505] rounded-full" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em]" style={{ color: INK }}>Whale Alert Network</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com/WhaleAlertNetwork"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 border border-black/10 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={16} style={{ color: INK, opacity: 0.6 }} />
              </a>
              <a
                href="https://github.com/atfortyseven-creations/whalecosystem"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 border border-black/10 rounded-xl flex items-center justify-center hover:bg-black/5 transition-colors"
                aria-label="GitHub"
              >
                <Github size={16} style={{ color: INK, opacity: 0.6 }} />
              </a>
            </div>
          </div>

          {/* Legal links */}
          <div className="flex flex-wrap gap-6 items-center">
            <a href="/docs/privacy-policy" className="text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-100 transition-opacity" style={{ color: MUTED }}>Privacy Policy</a>
            <a href="/docs/terms-of-service" className="text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-100 transition-opacity" style={{ color: MUTED }}>Terms of Service</a>
            <a href="/docs/risk-disclosure" className="text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-100 transition-opacity" style={{ color: MUTED }}>Risk Disclosure</a>
            <a href="/docs/cookie-policy" className="text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-100 transition-opacity" style={{ color: MUTED }}>Cookie Policy</a>
          </div>

          {/* Copyright */}
          <p className="text-[9px] font-mono uppercase tracking-[0.3em]" style={{ color: MUTED }}>
            © {new Date().getFullYear()} Whale Alert Network · All rights reserved · Institutional Intelligence Infrastructure
          </p>
        </div>
      </footer>
    </main>
  );
}
