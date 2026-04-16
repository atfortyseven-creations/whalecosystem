"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { MegaReadmeParser } from "./MegaReadmeParser";
import { MEGA_MANIFESTO_TEXT } from "../../lib/constants/megaReadme";

export default function WhaleAlertLanding() {
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
        className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-10"
        style={{
          backgroundImage: "url('/olas-hokusai-4k.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom",
          backgroundRepeat: "no-repeat"
        }}
      />
      {/* Gradientes Oscuros 3D */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/80 z-[1]" />

      {/* HEADER ESPACIAL */}
      <header className="relative z-[100] h-[80px] flex items-center justify-between px-10 border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
           <img src="/official-whale-monochrome.png" className="w-8 h-8 invert opacity-80" alt="Whale" />
           <span className="text-[13px] font-black uppercase tracking-[0.2em] text-[#FAF9F6]">Sovereign Mesh</span>
        </div>
        <Link href="/connect" className="bg-[#FAF9F6] text-[#050505] px-6 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
          ENTER VAULT
        </Link>
      </header>

      {/* ============================================================== */}
      {/* BOTON BLANCO GIGANTE (200 PAGINAS MEGA MANIFIESTO AZTEC)     */}
      {/* ============================================================== */}
      <main className="relative z-[50] w-full max-w-6xl mx-auto px-6 py-24 flex flex-col items-center">
         
         {mounted && (
         <motion.div 
           initial={{ opacity: 0, y: 50 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
           className="w-full bg-[#FFFFFF] text-[#050505] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] rounded-[40px] overflow-hidden border border-white/20"
         >
            {/* Cabecera del Boton Blanco */}
            <div className="bg-[#FAF9F6] border-b border-black/10 p-12 md:p-24 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-[0.02] pointer-events-none">
                   <img src="/official-whale-monochrome.png" className="w-[800px] h-[800px] grayscale rotate-12 -mt-40 -mr-40" alt="" />
                </div>
                <h1 className="relative z-10 text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-black">
                  LA TESIS <br/>SOVEREIGN.
                </h1>
                <p className="relative z-10 mt-8 text-xs md:text-sm font-mono tracking-widest uppercase font-bold max-w-2xl mx-auto opacity-50">
                  Desclasificación Técnica / Manifiesto Institucional de Cota Cero
                </p>
            </div>

            {/* CUERPO MAESTRO - AZTEC NETWORK TYPOGRAPHY */}
            <div className="p-8 md:p-24 flex flex-col gap-16 font-mono text-sm md:text-base leading-relaxed text-left text-black/90">
                <MegaReadmeParser content={MEGA_MANIFESTO_TEXT} />
            </div>

            {/* LLAMADO A LA ACCION ADHERIDO AL BOTON BLANCO */}
            <div className="bg-[#FAF9F6] p-12 border-t border-black/10 flex justify-center">
                <Link href="/connect" className="bg-[#050505] text-[#FFFFFF] px-12 py-5 text-sm md:text-base font-black uppercase tracking-[0.2em] hover:bg-black/80 transition-colors shadow-2xl">
                   » DESPLEGAR DASHBOARD INSTITUCIONAL
                </Link>
            </div>
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
