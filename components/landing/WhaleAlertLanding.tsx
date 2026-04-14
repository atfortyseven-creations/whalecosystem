"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import dynamic from "next/dynamic";
import { Github, Twitter } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { WhaleLogo } from "@/components/shared/WhaleLogo";

const DynamicCryptoCheckoutModal = dynamic(
  () => import("@/components/news/CryptoCheckoutModal").then((m) => m.CryptoCheckoutModal),
  { ssr: false }
);

import { VISUAL_ASSETS, SYSTEM_THEME } from "@/lib/constants";

const { BG, INK, MUTED, ACCENT } = SYSTEM_THEME;

export default function WhaleAlertLanding() {
  const router = useRouter();
  const { address } = useSovereignAccount();
  const { open } = useAppKit();
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (!address && !sessionStorage.getItem('visited_connect')) {
      sessionStorage.setItem('visited_connect', '1');
    }
  }, [address]);

  const handleEntry = () => {
    if (address) router.push("/dashboard");
    else open();
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden font-sans pb-32" style={{ background: BG, color: INK }}>
      
      {/* Background layer: solid ivory */}
      <div className="fixed inset-0 z-0 bg-[#FAF9F6] pointer-events-none" />

      {/* Cosmic pattern layer - Enriched and properly blended */}
      <motion.div 
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          width: "120%",
          height: "120%",
          top: "-10%",
          left: "-10%",
          backgroundImage: `url('${VISUAL_ASSETS.WALLPAPER}')`,
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          opacity: 0.25,
          mixBlendMode: "multiply",
          willChange: "transform"
        }}
        animate={{
          x: [-20, 20, -20],
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      />



      {/* Text Content Layer */}
      <div className="relative z-10 max-w-[840px] mx-auto px-8 pt-24 pb-64 text-[11px] md:text-[12px] leading-[2.2] tracking-wide" style={{ color: MUTED }}>
        
        <div className="flex flex-col items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 mb-10 relative"
          >
            <div className="absolute inset-0 bg-black/5 blur-2xl rounded-full" />
            <WhaleLogo className="w-full h-full relative z-10" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[3.5rem] md:text-[5.5rem] font-black tracking-tighter leading-[0.9] text-center uppercase italic" 
            style={{ color: INK }}
          >
            The Sovereignty <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-black/40 to-black/20">Protocol</span>
          </motion.h1>
          <div className="w-20 h-1 bg-black/10 mt-12 mb-8 rounded-full" />
          <p className="text-[14px] font-black uppercase tracking-[0.6em] text-black/30">Whale Alert Network · v6.12.0</p>
        </div>

        <div className="space-y-16">
          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>The Origin and Vision</h2>
            <p className="mb-4">
              The blockchain ecosystem suffers from a fundamental asymmetry of information. The raw data produced by public distributed ledgers is theoretically visible to anyone. In practice, however, the velocity, volume, and structural complexity of that data mean that only those with access to advanced indexing infrastructure can extract meaning from it in time to act upon that meaning. A private institution with a team of engineers can deploy purpose-built systems to detect a significant capital movement on the Ethereum mainnet nearly four minutes before that movement propagates through the public mempool. An individual operating without institutional infrastructure cannot.
            </p>
            <p className="mb-4">
              This asymmetry is not a natural law. It is a consequence of the complexity barrier that separates raw on-chain data from actionable intelligence. The Whale Alert Network was conceived specifically to dismantle that barrier, to build from first principles an intelligence system capable of detecting, verifying, and disseminating high value capital movements with accuracy and latency sufficient to place the individual user on the same informational footing as an institutional actor.
            </p>
            <p>
              The vision that guided the construction of this system was intentionally uncompromising. There would be no mock data, no placeholders, no simulated signals, and no fallback to approximate values in cases where real data was temporarily unavailable. Every signal surfaced by the system would be sourced directly from live blockchain state verified on chain, processed cryptographically, and delivered with an editorial context that a trained analyst could act upon immediately. The system is operational infrastructure, built with absolute precision.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>Architectural Philosophy</h2>
            <p className="mb-4">
              The zero mock mandate ensures no component of the system displays fabricated data in place of real on-chain state. This decision has immediate and far-reaching implications for every subsequent design choice. It rules out the possibility of static demonstration modes. It requires that every data pipeline from blockchain node connection through downstream networks to the rendering layer be fully operational at all times.
            </p>
            <p className="mb-4">
              The sovereignty principle dictates that every interaction a user conducts with the system must occur without creating any dependency on the system servers for the security of their assets. The server layer provides intelligence. It does not under any circumstances touch private keys, hold funds in custody, or make decisions on the user's behalf.
            </p>
            <p>
              The institutional grade standard mandates that the production quality must be indistinguishable from that of an institutional engineering organization. This standard applies to code quality, interface design, database schema structure, error handling, security posture, and visual presentation.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>The Ingestion Engine</h2>
            <p>
              The ingestion engine is the operational core of the Whale Alert Network. It is the component responsible for acquiring raw blockchain data across sixteen parallel networks, applying the first layer of significance filtering based on dynamic statistical thresholds, and routing the resulting verified events to the downstream intelligence mesh.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>Sovereign Mesh Protocol</h2>
            <p>
              The Sovereign Mesh is the primary distribution layer that propagates verified intelligence from the ingestion engine to all connected clients seamlessly. It operates as a high-frequency, low-latency network with strict access control, ensuring that authenticated intelligence reaches users with minimal delay and maximum reliability across all defined significance tiers.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>The Akashic Ledger</h2>
            <p>
              The Akashic Ledger constitutes the permanent institutional memory of the Whale Alert Network. It serves as the definitive, verified, immutable record of every capital movement that crosses the threshold of systemic significance, providing historical context and permanent documentation for crucial macroeconomic shifts on-chain.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>Mass Transfer Intelligence</h2>
            <p>
              The Mass Transfer Intelligence module is explicitly designed to detect and surface a specific category of capital movement that isolated transaction monitoring cannot identify. It maps coordinated multi-address, multi-chain capital flows that collectively reveal an institutional position adjustment of substantial magnitude before it resolves on the market.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>The Sovereign Vault</h2>
            <p>
              The Sovereign Vault is the non-custodial wallet management system that empowers users to interact with the full suite of on-chain operations available through the sovereign terminal interface. All key generation and transaction signing execute purely within isolated local environments, ensuring absolute personal sovereignty over capital.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>Zero Knowledge Infrastructure</h2>
            <p>
              The zero knowledge proof infrastructure provides two distinct and essential capabilities: private signal authentication for the underlying data mesh, and definitive identity verification for Sybil-resistant access control without ever compromising user privacy or biometric data.
            </p>
          </section>

          <section>
            <h2 className="text-[14px] uppercase tracking-widest font-black mb-4" style={{ color: INK }}>The Data Persistence Layer</h2>
          </section>

          {/* Supported Wallets Section - Institutional Fidelity */}
          <section className="pt-20 border-t border-black/5">
             <div className="text-center mb-12">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40 mb-2">Institutional Support</h2>
                <div className="text-xl font-black uppercase tracking-tight text-black">Connected Ecosystem</div>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                {[
                  { name: 'MetaMask', icon: VISUAL_ASSETS.WALLETS.METAMASK },
                  { name: 'Coinbase', icon: VISUAL_ASSETS.WALLETS.COINBASE },
                  { name: 'Rainbow', icon: VISUAL_ASSETS.WALLETS.RAINBOW },
                  { name: 'WalletConnect', icon: VISUAL_ASSETS.WALLETS.GENERIC }
                ].map((wallet) => (
                  <motion.div 
                    key={wallet.name}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.8)' }}
                    className="flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-sm border border-black/5 rounded-3xl transition-all"
                  >
                    <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 mb-4 object-contain filter grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/40">{wallet.name}</span>
                  </motion.div>
                ))}
             </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showGate && (
          <DynamicCryptoCheckoutModal isOpen={showGate} onClose={() => setShowGate(false)} />
        )}
      </AnimatePresence>

      {/* ── UNIFIED WAVE & DOWNHEAD FOOTER ── */}
      <div className="relative w-full min-h-[600px] flex flex-col justify-end overflow-hidden pt-32">
        {/* Massive Wave Background - Restored Visibility and Fluidity */}
        <motion.img 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          src={VISUAL_ASSETS.WAVES}
          alt="The Great Wave" 
          className="absolute bottom-0 left-0 w-full h-[130%] object-cover object-bottom opacity-100 z-0 select-none"
          style={{ transform: "translateZ(0)", willChange: "transform" }}
        />
        
        {/* Deep Gradient Shade for text contrast */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#FAF9F6]/80 to-transparent z-[1]" />
        
        {/* Protective Top Fades */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF9F6] via-transparent to-transparent z-[1]" />
        
        {/* Footer Real Estate */}
        <footer className="relative z-10 w-full pb-12 pt-32 mt-auto">
          <div className="max-w-[840px] mx-auto px-8 flex flex-col items-center gap-8 bg-white/40 backdrop-blur-md rounded-3xl py-8 border border-white/40 shadow-2xl">
            {/* Social and Central Whale */}
            <div className="flex items-center justify-center gap-8">
              <a href="https://twitter.com/WhaleAlertNetwork" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/50 border border-black/10 rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-sm">
                <Twitter size={20} style={{ color: INK, opacity: 0.8 }} />
              </a>
              <div className="w-16 h-16 flex items-center justify-center bg-white/60 rounded-3xl shadow-lg border border-white/50">
                <img src="/official-whale-monochrome.png" className="w-10 h-10 opacity-100" alt="Whale" />
              </div>
              <a href="https://github.com/atfortyseven-creations/whalecosystem" target="_blank" rel="noreferrer" className="w-12 h-12 bg-white/50 border border-black/10 rounded-2xl flex items-center justify-center hover:bg-white transition-all shadow-sm">
                <Github size={20} style={{ color: INK, opacity: 0.8 }} />
              </a>
            </div>

            {/* Legal links */}
            <div className="flex flex-wrap justify-center gap-8 items-center mt-4">
              <a href="/docs/privacy-policy" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Privacy Policy</a>
              <a href="/docs/terms-of-service" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Terms of Service</a>
              <a href="/docs/risk-disclosure" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Risk Disclosure</a>
              <a href="/docs/cookie-policy" className="text-[11px] font-black uppercase tracking-[0.2em] text-[#050505] hover:text-[#00F2EA] transition-colors">Cookie Policy</a>
            </div>

            {/* Copyright */}
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-50 text-black">
              © {new Date().getFullYear()} Whale Alert Network · All rights reserved
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
