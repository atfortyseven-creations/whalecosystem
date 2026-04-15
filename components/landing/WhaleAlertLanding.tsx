"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import dynamic from "next/dynamic";
import { Github, Twitter } from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { WhaleLogo } from "@/components/shared/WhaleLogo";
import { QRCodeSVG } from "qrcode.react";
import { Wallet } from "lucide-react";

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

  const [syncToken, setSyncToken] = useState("");

  useEffect(() => {
    if (!address && !sessionStorage.getItem('visited_connect')) {
      sessionStorage.setItem('visited_connect', '1');
    }
    setSyncToken(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }, [address]);

  const handleEntry = () => {
    if (address) router.push("/dashboard");
    else open({ view: 'Connect' });
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
          opacity: 0.6,
          mixBlendMode: "normal",
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
            className="text-[3.5rem] md:text-[6.5rem] font-black tracking-tighter leading-[0.9] text-center uppercase" 
            style={{ color: INK }}
          >
            WHALE ALERT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-black/40 to-black/20">NETWORK</span>
          </motion.h1>
          <div className="w-20 h-1 bg-black/10 mt-12 mb-8 rounded-full" />
          <p className="text-[14px] font-black uppercase tracking-[0.6em] text-black/30 mb-16">Global Ecosystem · v6.12.0</p>
          
          {/* iOS & Android PC connection & QR zone */}
          <div className="w-full max-w-2xl bg-white/60 backdrop-blur-md border border-black/5 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
             
             {/* Text and Button Section */}
             <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
                <div>
                   <h2 className="text-xl font-black uppercase tracking-tight text-black mb-1">Synchronize Session</h2>
                   <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 font-black">iOS & Android Compatible</p>
                </div>
                <p className="text-[11px] leading-relaxed text-black/50 font-bold max-w-sm">
                   Connect your mobile wallet securely to the PC terminal using an encrypted cryptographic handshake. Scan the QR code with your mobile camera.
                </p>
                <div className="pt-4">
                  <button 
                    onClick={handleEntry}
                    className="w-full md:w-auto bg-[#050505] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-black/80 transition-all border border-black shadow-md flex items-center justify-center gap-3"
                  >
                    <Wallet size={14} />
                    {address ? "Access Terminal" : "Direct Web3 Connect"}
                  </button>
                </div>
             </div>
             
             {/* QR Code Section */}
             <div className="shrink-0 flex flex-col items-center gap-5 border-t md:border-t-0 md:border-l border-black/10 pt-8 md:pt-0 md:pl-12 w-full md:w-auto relative z-10">
                <div className="p-5 bg-white rounded-2xl border border-black/5 shadow-sm">
                   {syncToken ? (
                      <QRCodeSVG 
                         value={`https://humanidfi.com/sync?session=${syncToken}`} 
                         size={140} 
                         fgColor="#050505" 
                         bgColor="#ffffff" 
                         level="H"
                         imageSettings={{ src: "/official-whale-monochrome.png", width: 32, height: 32, excavate: true }}
                      />
                   ) : (
                      <div className="w-[140px] h-[140px] bg-black/5 animate-pulse rounded-xl" />
                   )}
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-black/40 bg-white/80 px-3 py-1.5 rounded-full border border-black/5">
                   <div className="w-1.5 h-1.5 bg-[#00C076] rounded-full animate-pulse shadow-[0_0_8px_#00C076]" />
                   Awaiting Scan
                </div>
             </div>
          </div>
        </div>



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

          {/* Academic Architectural Thesis Section */}
          <section className="pt-32 pb-16 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-24">
              
              <div className="text-center">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/40 mb-3">Tesis Arquitectónica</h2>
                 <div className="text-3xl font-black uppercase tracking-tight text-black leading-tight">Fundamentación Ontológica <br />e Infraestructura Institucional</div>
              </div>

              {/* Core Mechanics & Philosophy */}
              <div className="flex flex-col md:flex-row items-center gap-16">
                <div className="flex-1 space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-widest border-b border-black/10 pb-4">Desmantelamiento de la Asimetría Informacional</h3>
                  <p className="text-[12px] leading-relaxed text-black/70 font-medium text-justify">
                    El <span className="font-black">Whale Alert Network</span> constituye una infraestructura de inteligencia blockchain de grado institucional, concebida desde los primeros principios de la criptografía aplicada y la teoría de redes descentralizadas. Su propósito categórico reside en erradicar la profunda asimetría de información intrínseca a los mercados de registros distribuidos. Mediante una arquitectura subyacente regida por el <em>"Mandato Zero-Mock"</em> y el <em>"Principio de Soberanía"</em>, el sistema proscribe la dependencia de proxys simulados o servidores de custodia, garantizando un determinismo absoluto en el estado de cada vector de señal originado.
                  </p>
                  <p className="text-[12px] leading-relaxed text-black/70 font-medium text-justify">
                    El motor asíncrono de ingestión intercepta la propagación en la mempool a través de dieciséis topologías EVM y Solana, ejecutando umbrales estadísticos gaussianos (Z-Score) en tiempo real para extraer anomalías de capital sistémico. A través del protocolo matricial <em>Sovereign Mesh</em>, la inteligencia validada criptográficamente converge en el Registro Akáshico —un componente heurístico de inmutabilidad perenne— dotando al analista de un marco predictivo capaz de anticipar desplomes como los eventos de LUNA o FTX horas antes de su materialización en los canales de liquidez pública.
                  </p>
                </div>
                <div className="flex-1 w-full bg-black/5 rounded-[2rem] p-4 border border-black/10 shadow-inner overflow-hidden relative group">
                  <img src="/api/assets?name=illustration_web3-scaled.jpg" alt="Ecosistema Abstracto Web3" className="w-full h-auto object-cover rounded-xl filter contrast-125 saturate-50 transition-transform duration-1000 group-hover:scale-105" onError={(e) => { e.currentTarget.src = "/api/assets?name=illustration_web3-scaled.png" }} />
                </div>
              </div>

              {/* Graph Analysis & Vault Execution */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-16">
                <div className="flex-1 space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-widest border-b border-black/10 pb-4">Análisis de Grafos y Ejecución Criptográfica</h3>
                  <p className="text-[12px] leading-relaxed text-black/70 font-medium text-justify">
                    El paradigma de las <em>Transferencias en Masa</em> (Mass Transfer Intelligence) emplea análisis de clústeres topológicos sobre bases de datos de grafos Neo4j. Al mapear relaciones espacio-temporales y proximidad transaccional (co-spend network patterns), la arquitectura devela coreografías de liquidez que los filtros transaccionales asilados ignoran sistemáticamente. Esta síntesis algorítmica transforma datos polimórficos fragmentados en narrativas macroeconómicas de precisión forense.
                  </p>
                  <p className="text-[12px] leading-relaxed text-black/70 font-medium text-justify">
                    Concomitantemente, la bóveda criptográfica de ejecución <em>Sovereign Vault</em> implementa rigurosamente el estándar EIP-1193 de custodia hermética. Salvaguardada por una superestructura Zero-Knowledge (Pruebas de Conocimiento Cero mediante Groth16 en BN254) e identidades anti-Sybil, provee interfaces de agregadores DEX (Li.Fi/1inch) y abstracción de cuentas, otorgando jurisdicción end-to-end e inexpugnable al actor institucional que requiere operar con latencia mínima respondiendo a los estímulos emergentes del tejido global.
                  </p>
                </div>
                <div className="flex-1 w-full bg-black/5 rounded-[2rem] p-4 border border-black/10 shadow-inner overflow-hidden relative group">
                  <img src="/api/assets?name=peakpx.jpg" alt="Topología Isométrica y Nodos" className="w-full h-auto object-cover rounded-xl filter contrast-125 saturate-50 transition-transform duration-1000 group-hover:scale-105" />
                </div>
              </div>

            </div>
          </section>
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
