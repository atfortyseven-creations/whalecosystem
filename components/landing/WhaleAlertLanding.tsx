"use client";

import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";

import { ARCHITECTURAL_MANIFESTO } from "../../lib/constants/architecturalManifesto";

export default function WhaleAlertLanding() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9F6] text-[#050505] overflow-x-hidden selection:bg-black selection:text-white font-sans">
      
      {/* ============================================================== */}
      {/* FONDO WATERMARK INSTITUCIONAL (IVORY STANDARD)                 */}
      {/* ============================================================== */}
      
      {/* BLOQUES ISOMÉTRICOS (WATERMARK INVERTIDO) */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "url('/api/assets?name=peakpx.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          filter: "invert(1) grayscale(1)"
        }}
      />
      
      {/* OLAS HOKUSAI (MODO MULTIPLY TRANSPARENTE) */}
      <div 
        className="fixed inset-[0_0_-5%_0] z-0 pointer-events-none opacity-[0.15] mix-blend-multiply scale-105 origin-bottom"
        style={{
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* Gradientes Claros para Integración Absoluta */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-[#FAF9F6]/90 via-transparent to-[#FAF9F6]/30 z-[1]" />

      {/* HEADER ELIMINADO POR ORDEN DE COTA CERO */}

      {/* ============================================================== */}
      {/* BOTON BLANCO GIGANTE (200 PAGINAS MEGA MANIFIESTO AZTEC)     */}
      {/* ============================================================== */}
      <main className="relative z-[50] w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
         
         {mounted && (
         <motion.div 
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="w-full bg-[#FFFFFF] text-[#050505] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[40px] overflow-hidden border border-black/[0.04] backdrop-blur-2xl"
         >
            {/* Cabecera del Boton Blanco - ELEGANCIA ABSOLUTA */}
            <div className="bg-[#FAF9F6] border-b border-black/5 px-8 pt-16 pb-8 md:px-24 md:pt-20 md:pb-12 text-center relative overflow-hidden">
                <h1 className="relative z-10 text-xl md:text-3xl font-mono tracking-[0.25em] text-black/80 font-light lowercase">
                  in search of transparent information
                </h1>
            </div>

            {/* CUERPO MAESTRO - AZTEC NETWORK TYPOGRAPHY MINÚSCULA REDUCIDA AL 30% */}
            <div className="px-8 md:px-24 py-8 md:py-12 flex flex-col gap-6 font-mono text-[10px] md:text-[11px] leading-relaxed text-justify text-black/80 whitespace-pre-wrap break-words">
                {ARCHITECTURAL_MANIFESTO}
            </div>

            {/* ZONA DE ABAJO VACIA ELIMINADA POR COMPLETO */}
         </motion.div>
         )}
      </main>

      {/* ============================================================== */}
      {/* EL DOWNPAGE IDÉNTICO A /connect (Como ordenado explícitamente)*/}
      {/* ============================================================== */}
      <footer className="relative z-[100] px-12 py-12 border-t border-white/[0.04] bg-[#FAF9F6] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 text-[#050505] w-full">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <img src="/official-whale-monochrome.png" className="w-5 h-5 opacity-40 grayscale" alt="" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">© Whale Alert Network</span>
            </div>
         </div>

         <div className="flex items-center gap-8">
            <a href="https://twitter.com/WhaleAlert" className="text-black/30 hover:text-black transition-colors">TWITTER</a>
            <a href="https://github.com" className="text-black/30 hover:text-black transition-colors">GITHUB</a>
            <div className="w-px h-8 bg-black/10 mx-2" />
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Status: Operational</span>
               <span className="text-[8px] font-mono text-emerald-500 uppercase tracking-widest font-bold">L1/L2 Ingress Active</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
