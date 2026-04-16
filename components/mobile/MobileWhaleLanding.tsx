"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export const MobileWhaleLanding = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#FAF9F6] overflow-x-hidden selection:bg-[#00F2EA] selection:text-black">
      
      {/* 1. LAYER BASE: EL FIRMAMENTO GALÁCTICO ESTÁTICO */}
      <div 
        className="fixed inset-0 z-[0] pointer-events-none"
        style={{
          backgroundImage: "url('/api/assets?name=peakpx.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          opacity: 0.95
        }}
      />

      {/* 2. LAYER MEDIO: PARTICULAS Y NIEBLA COSMICA */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-[#050505]/95 via-[#050505]/40 to-transparent z-[1]" />

      {/* 3. LAYER DINAMICO: LAS OLAS DE HOKUSAI 4K FLOTANTES */}
      <div 
        className="fixed inset-0 z-[2] pointer-events-none mix-blend-screen opacity-25"
        style={{
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          backgroundRepeat: "no-repeat"
        }}
      />
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: [0, 15, 0], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed inset-0 z-[3] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          backgroundRepeat: "no-repeat"
        }}
      />

      {/* GRADIENTE SUPERIOR OSCURO PARA MAXIMIZAR CONTRASTE DE UI COLD WALLET */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#050505]/80 via-transparent to-transparent z-[4]" />


      {/* ========================================================================= */}
      {/* ===================== CONTENIDO SUPERIOR: MAJESTUOSO ==================== */}
      {/* ========================================================================= */}
      
      <main className="relative z-[50] w-full min-h-screen flex flex-col items-center justify-between px-6 pt-12 pb-8">
        
        <AnimatePresence>
          {mounted && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center w-full"
            >
              {/* LOGO INSTITUCIONAL FLOTANTE */}
              <motion.div 
                 animate={{ y: [0, -8, 0] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="relative w-32 h-32 mb-8 flex justify-center items-center"
              >
                  <div className="absolute inset-0 bg-[#00F2EA]/10 blur-3xl rounded-full" />
                  <img src="/official-whale-monochrome.png" className="w-full h-full object-contain invert opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10" alt="Whale Alert Logo" />
              </motion.div>

              {/* TITULO Y SUBTITULO MAESTRO */}
              <div className="text-center w-full max-w-sm mb-12">
                  <h1 className="text-4xl xs:text-5xl font-black uppercase tracking-tighter leading-[0.9] text-white">
                     Sovereign<br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2EA] to-white/70">
                       Terminal
                     </span>
                  </h1>
                  <p className="mt-4 text-[10px] font-mono tracking-[0.3em] uppercase text-white/50 border-t border-white/10 pt-4">
                     P2P Cryptographic Ledger Protocol
                  </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* ====================== BLOQUE DE ACCIÓN INFERIOR ======================== */}
        {/* ========================================================================= */}

        <AnimatePresence>
          {mounted && (
             <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm flex flex-col gap-5 mt-auto"
             >
                {/* STATUS INDICATOR */}
                <div className="flex items-center justify-center gap-3 bg-black/40 backdrop-blur-md rounded-full py-2 px-4 border border-white/5 mx-auto mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#00F2EA] animate-pulse shadow-[0_0_8px_#00F2EA]" />
                   <span className="text-[9px] font-black tracking-widest text-[#00F2EA] uppercase">Secure Connection</span>
                </div>

                {/* BOTON MAESTRO CINETICO CON NEON SUTIL */}
                <Link href="/connect" className="group relative w-full flex items-center justify-center h-16 rounded-xl overflow-hidden bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FAF9F6] to-[#E0E0E0]" />
                    <span className="relative z-10 text-[12px] font-black uppercase tracking-widest text-black">
                      Autenticar Ingreso
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </Link>

                {/* BOTON SECUNDARIO APAGADO Y ELEGANTE */}
                <button className="w-full h-14 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white hover:bg-black/50 transition-colors">
                  Descargar Nodo Local
                </button>
             </motion.div>
          )}
        </AnimatePresence>
        
      </main>

    </div>
  );
};
