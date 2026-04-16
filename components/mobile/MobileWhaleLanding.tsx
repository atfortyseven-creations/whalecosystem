"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MegaReadmeParser } from "../landing/MegaReadmeParser";
import { MEGA_MANIFESTO_TEXT } from "../../lib/constants/megaReadme";

export const MobileWhaleLanding = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-[#FAF9F6] overflow-x-hidden selection:bg-[#00F2EA] selection:text-black font-sans">
      
      {/* ============================================================== */}
      {/* FONDO 3D, WAVES Y PARTICULAS (RESTAURADO A MAXIMA GLORIA)    */}
      {/* ============================================================== */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/api/assets?name=peakpx.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          opacity: 0.8
        }}
      />
      <div 
        className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-20"
        style={{
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-t from-black via-black/40 to-transparent z-[1]" />

      {/* HEADER ESPACIAL MOVILES */}
      <header className="relative z-[100] h-[60px] flex items-center justify-between px-6 border-b border-white/[0.05] bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <img src="/official-whale-monochrome.png" className="w-6 h-6 invert opacity-90" alt="Whale" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FAF9F6]">Sovereign Mesh</span>
        </div>
      </header>

      {/* ============================================================== */}
      {/* PANEL BLANCO DE TEXTO MASIVO (RESPONSIVE VIEW)               */}
      {/* ============================================================== */}
      <main className="relative z-[50] w-full px-4 py-16 flex flex-col items-center">
         
         {mounted && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           className="w-full bg-[#FFFFFF] text-[#050505] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10"
         >
            {/* Cabecera del Boton Blanco */}
            <div className="bg-[#FAF9F6] border-b border-black/10 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none">
                   <img src="/official-whale-monochrome.png" className="w-[400px] h-[400px] grayscale rotate-[24deg] -mt-20 -mr-20" alt="" />
                </div>
                <h1 className="relative z-10 text-4xl font-black uppercase tracking-tighter leading-[0.9] text-black">
                  LA TESIS <br/>SOVEREIGN.
                </h1>
                <p className="relative z-10 mt-6 text-[10px] font-mono tracking-widest uppercase font-bold text-black/50">
                  Desclasificación Técnica Institucional
                </p>
            </div>

            {/* CUERPO MAESTRO - AZTEC NETWORK TYPOGRAPHY */}
            <div className="p-4 flex flex-col gap-6 font-mono text-xs leading-relaxed text-left text-black/90">
                <MegaReadmeParser content={MEGA_MANIFESTO_TEXT} />
            </div>

            {/* BOTON DE ACCESO */}
            <div className="bg-[#050505] p-8 border-t border-black/10 flex justify-center">
                <Link href="/connect" className="bg-[#FFFFFF] text-[#050505] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] shadow-lg w-full text-center">
                   » ENTRAR AL VAULT
                </Link>
            </div>
         </motion.div>
         )}
      </main>

      {/* ============================================================== */}
      {/* DOWNPAGE EXACTO AL DE /connect PARA MOVILES                    */}
      {/* ============================================================== */}
      <footer className="relative z-[100] px-8 py-10 border-t border-white/[0.04] bg-[#FAF9F6] text-[#050505] flex flex-col items-center gap-6 mt-auto">
         <div className="flex items-center gap-3">
           <img src="/official-whale-monochrome.png" className="w-5 h-5 opacity-40 grayscale" alt="" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">© Whale Network</span>
         </div>

         <div className="flex items-center gap-6">
            <a href="https://twitter.com/WhaleAlert" className="text-[10px] font-bold text-black/40">TWITTER</a>
            <div className="w-px h-4 bg-black/10" />
            <a href="https://github.com" className="text-[10px] font-bold text-black/40">GITHUB</a>
         </div>

         <div className="flex flex-col items-center mt-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-black/30">Status: Operational</span>
            <span className="text-[9px] font-mono text-emerald-600 uppercase tracking-widest font-bold mt-1">L1 / L2 Ingress Active</span>
         </div>
      </footer>
    </div>
  );
};
