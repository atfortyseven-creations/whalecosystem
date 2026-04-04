"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Lock } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUIStore } from "@/lib/store/ui-store";
import { useSovereignAccount } from "@/hooks/useSovereignAccount";
import { CorporateWhaleLogo } from "@/components/bsv/CorporateWhaleLogo";
import { Footer } from "@/components/layout/Footer";
import dynamic from 'next/dynamic';

const DynamicLegendaryCursor    = dynamic(() => import("@/components/landing/LegendaryCursor").then(m => m.LegendaryCursor),    { ssr: false });
const DynamicAntiPhishing       = dynamic(() => import("@/components/security/AntiPhishing"),                                    { ssr: false });
const DynamicCryptoCheckoutModal= dynamic(() => import("@/components/news/CryptoCheckoutModal").then(m => m.CryptoCheckoutModal),{ ssr: false });
const DynamicDownheadSection    = dynamic(() => import("@/components/landing/DownheadSection").then(m => m.DownheadSection),    { ssr: false });

// ─── Letta-inspired Marquee ───────────────────────────────────────────────────
const MarqueeBanner = () => (
  <div className="w-full overflow-hidden bg-[#0a0a0a] py-6 border-y border-white/5 flex relative z-20 shadow-2xl">
    <motion.div
      className="flex whitespace-nowrap"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
      style={{ willChange: 'transform' }}
    >
      <span className="font-mono text-xl md:text-3xl text-white/30 tracking-[0.3em] font-bold uppercase">
        Sovereign Network <span className="mx-8">◎</span> SOVEREIGN DATA <span className="mx-8">◎</span> ZK-COMPLIANCE <span className="mx-8">◎</span> INSTITUTIONAL <span className="mx-8">◎</span> Sovereign Network <span className="mx-8">◎</span> SOVEREIGN DATA <span className="mx-8">◎</span> ZK-COMPLIANCE <span className="mx-8">◎</span> INSTITUTIONAL <span className="mx-8">◎</span>
      </span>
    </motion.div>
  </div>
);

// ─── Terminal Window ──────────────────────────────────────────────────────────
const TerminalWindow = ({ title, children, rightIcon = ">>>", className = "" }: any) => (
  <div className={`bg-[#0a0a0a] border border-white/10 overflow-hidden ${className}`}>
     <div className="bg-[#111111] border-b border-white/5 px-4 py-2 flex justify-between items-center font-aztec-mono text-[9px] text-white/50 uppercase tracking-[0.3em]">
         <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-white/40" />
             {title}
         </div>
         <div className="opacity-50 tracking-widest">{rightIcon}</div>
     </div>
     <div className="w-full h-full">
        {children}
     </div>
  </div>
);

// ─── Web3 Features ────────────────────────────────────────────────────────────
const Web3Features = () => (
    <div className="w-full bg-[#0d0d0d] pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-center font-aztec-body text-2xl md:text-4xl text-white/80 font-light tracking-tight mb-20">
                The Ultimate Sovereign Financial Intelligence
            </h2>
            <div className="grid grid-cols-1 gap-8">
                <TerminalWindow title="WHALE FLOW DETECTOR" className="min-h-[400px]">
                    <div className="flex flex-col md:flex-row h-full">
                        <div className="p-12 md:p-16 flex-1 flex flex-col justify-center">
                            <h3 className="font-aztec-body text-3xl md:text-4xl text-white mb-6">
                                Real-Time Whale Flow (On-Chain)
                            </h3>
                            <p className="font-aztec-body text-lg text-white/50 leading-relaxed max-w-md">
                                Our system natively ingests Multi-Layer Capital Flows directly from EVM networks (Polygon, Ethereum, BSC, Base) and Hyperliquid L1. No simulations. Every block hash is verified.
                            </p>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-[var(--aztec-orchid)]/30 to-[var(--aztec-ink)] relative overflow-hidden hidden md:block border-l border-white/10">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] bg-[#050505] border border-white/10 shadow-2xl rounded-lg p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[var(--aztec-chartreuse)] flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="text-white text-sm mb-1">Live L1 Transactions</div>
                                        <div className="text-white/40 text-xs mb-4">Capturing large algorithmic movements...</div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center bg-white/5 p-2 rounded text-xs text-white/70">
                                                <span>Tracing Hyperliquid Settlement...</span>
                                                <span>Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TerminalWindow>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <TerminalWindow title="CLOB ORDERBOOK & DYNAMIC MARKETS" className="min-h-[300px]">
                        <div className="flex flex-col h-full bg-[#0a0a0a]">
                            <div className="p-8 pb-0">
                                <h3 className="font-aztec-body text-xl text-white mb-3">Live Order Book & Events</h3>
                                <p className="text-white/50 text-sm leading-relaxed mb-6">
                                    Aggregating Polymarket Gamma API events seamlessly. Users interact with the active markets instantly via EIP-712 signatures.
                                </p>
                            </div>
                            <div className="p-8 mt-auto flex gap-4">
                                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-[#00dda8]">CLOB L1 Tracker</div>
                                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/40">100% Real Time</div>
                            </div>
                        </div>
                     </TerminalWindow>
                     
                     <TerminalWindow title="HYPERLIQUID COPY TRADING & PORTFOLIO" className="min-h-[300px]">
                        <div className="flex flex-col h-full bg-[#0a0a0a] p-8">
                            <div className="flex-1 font-aztec-mono text-xs text-indigo-400 bg-black border border-white/5 p-4 rounded mb-6 overflow-hidden">
                                 {`{ "intent": "COPY", "agent": "0xWhale",\n  "status": "AWAITING_ECDSA",\n  "capital": "$10,000 USDC" }`}
                            </div>
                            <div>
                                <h3 className="font-aztec-body text-xl text-white mb-3">Real Portfolio Management</h3>
                                <p className="text-white/50 text-sm leading-relaxed">
                                    Experience genuine automated copy-trading flows routed through Hyperliquid's Layer 1 nodes instantly.
                                </p>
                            </div>
                        </div>
                     </TerminalWindow>
                </div>
            </div>
        </div>
    </div>
);

// ─── Cross Platform Section ───────────────────────────────────────────────────
const CrossPlatformAccess = () => (
    <div className="w-full bg-[#E8E8E8] py-32 px-6">
        <div className="max-w-4xl mx-auto">
            <h3 className="text-center font-aztec-body text-2xl text-[#111] mb-12">
                Your personalized agent, accessible from anywhere
            </h3>
            <div className="flex flex-col bg-transparent rounded-xl border border-black/10 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between p-6 bg-[#E8E8E8] border-b border-black/10 hover:bg-[#F2F2F2] transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-2">
                            <div className="w-12 h-12 rounded bg-green-500 shadow-md flex items-center justify-center text-white"><Activity size={20} /></div>
                            <div className="w-12 h-12 rounded bg-[#111] shadow-md flex items-center justify-center text-white"><ShieldCheck size={20} /></div>
                            <div className="w-12 h-12 rounded bg-blue-500 shadow-md flex items-center justify-center text-white"><Lock size={20} /></div>
                        </div>
                        <span className="font-aztec-body text-lg text-black/80 font-medium">Install the desktop app</span>
                    </div>
                    <button className="px-4 py-2 font-aztec-body text-xs text-black border border-black/20 rounded hover:bg-black hover:text-white transition-colors">
                        Enter the Terminal
                    </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-[#E8E8E8] border-b border-black/10 hover:bg-[#F2F2F2] transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-16 rounded overflow-hidden shadow-md bg-black relative p-2 flex items-center">
                            <span className="font-mono text-[8px] text-[var(--aztec-chartreuse)]">npm run start</span>
                        </div>
                        <span className="font-aztec-body text-lg text-black/80 font-medium">Use in the terminal</span>
                    </div>
                    <button className="px-4 py-2 font-aztec-body text-xs text-black border border-black/20 rounded hover:bg-black hover:text-white transition-colors">
                        Install with npm
                    </button>
                </div>
                <div className="flex items-center justify-between p-6 bg-[#E8E8E8] hover:bg-[#F2F2F2] transition-colors">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-16 rounded overflow-hidden shadow-md bg-gradient-to-r from-orange-600 to-red-600 relative p-2 flex items-center justify-center">
                            <span className="font-mono text-[10px] text-white">SDK_CORE</span>
                        </div>
                        <span className="font-aztec-body text-lg text-black/80 font-medium">Build with the SDK</span>
                    </div>
                    <button className="px-4 py-2 font-aztec-body text-xs text-black border border-black/20 rounded hover:bg-black hover:text-white transition-colors">
                        Read the docs
                    </button>
                </div>
            </div>
        </div>
    </div>
);

// ─── Main Landing ─────────────────────────────────────────────────────────────
export function WhaleAlertLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useSovereignAccount();
  const { openConnectModal } = useUIStore();
  const router = useRouter();

  const [showCheckout, setShowCheckout] = useState(false);

  const handleEnterArchive = () => {
    if (isConnected) router.push('/vip');
    else openConnectModal();
  };

  // GPU-composited cursor glow — useRef avoids state re-renders on every move
  const glowRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!glowRef.current) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      glowRef.current.style.background = `radial-gradient(800px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(147, 51, 234, 0.15), transparent 40%)`;
    }
  };

  return (
    <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full overflow-x-hidden bg-[#050505] selection:bg-[var(--aztec-orchid)]/30 cursor-auto"
    >
      <DynamicLegendaryCursor />
      <DynamicAntiPhishing />
      
      {/* ── PHASE 1: AZTEC HERO ── */}
      <section className="relative min-h-screen pt-32 px-6 overflow-hidden flex flex-col items-center justify-center">
        {/* Background image — only desktop */}
        <div className="absolute inset-0 z-0 hidden md:block">
           <Image 
             src="/models/update/logan-voss-VTWMWadBMvM-unsplash.jpg" 
             alt="Background Logans Voss Immersion" 
             fill 
             priority 
             className="object-cover opacity-45 mix-blend-screen grayscale" 
           />
        </div>

        {/* Mouse glow — GPU layer, written imperatively to avoid re-renders */}
        <div 
             ref={glowRef}
             className="absolute inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen will-change-[background]"
        />

        {/* Letta-style floating UI window — desktop only */}
        <div className="absolute bottom-[-20%] md:bottom-[-40%] left-1/2 -translate-x-1/2 w-full max-w-5xl z-20 pointer-events-none opacity-50 blur-[2px] scale-105 hidden lg:block transition-transform duration-700 hover:scale-100 hover:blur-none">
             <div className="w-full aspect-[16/9] rounded-t-3xl border-t border-x border-white/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-[#050505] overflow-hidden flex transform-gpu transition-all duration-300">
                 <div className="w-1/4 h-full border-r border-white/10 p-6 flex flex-col gap-4">
                     <div className="h-4 w-24 bg-white/20 rounded" />
                     <div className="h-4 w-32 bg-white/10 rounded" />
                     <div className="h-4 w-20 bg-white/10 rounded" />
                 </div>
                 <div className="flex-1 h-full p-12 relative overflow-hidden">
                     <div className="w-3/4 h-32 bg-white/5 rounded-xl ml-auto mb-8 border border-white/5" />
                     <div className="w-1/2 h-20 bg-[var(--aztec-chartreuse)]/10 rounded-xl" />
                 </div>
             </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
          className="text-center relative z-10 max-w-7xl mx-auto"
          style={{ willChange: 'transform, opacity, filter' }}
        >
          <div className="w-[min(90vw,700px)] h-[min(50vw,400px)] mx-auto mb-12 relative flex items-center justify-center group">
               <CorporateWhaleLogo className="w-64 h-64 md:w-80 md:h-80 group-hover:scale-110 transition-transform duration-[2s]" />
          </div>

          <h1 className="font-aztec-body font-light tracking-tight text-[clamp(2.5rem,8vw,6rem)] leading-none text-white mb-6 drop-shadow-2xl">
            Sovereign Network
          </h1>
          
          <div className="font-aztec-body text-left text-sm md:text-base font-light text-white/50 max-w-4xl mx-auto leading-relaxed mb-12 px-6 md:px-10 space-y-8 max-h-[45vh] overflow-y-auto msv-hide-scrollbar border-y border-white/10 py-10 shadow-inner bg-black/20 backdrop-blur-sm rounded-xl">
            <p>
              En la dimensión macroeconómica contemporánea, la supremacía no se define únicamente por la acumulación transaccional, sino por la integridad matemática absoluta y un nivel de exposición regulatoria meticulosamente calibrado. Sovereign Network nace como un ecosistema institucional de altísimo rendimiento, forjado desde sus cimientos bajo parámetros de seguridad de grado paramilitar y normativas de compliance globales innegociables. Lo que presentamos aquí no es una simple interfaz, sino una infraestructura algorítmica diseñada para quienes comprenden que en la red no existen segundas oportunidades frente a la vulnerabilidad o la latencia.
            </p>

            <h3 className="text-white/90 text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-2 mt-8">1. Cinética de Tiempo Real</h3>
            <p>
              Rechazamos categóricamente la latencia intermitente, la dependencia de cachés obsoletos y cualquier forma de simulación de datos. Nuestro motor de ingesta procesa flujos de capitales masivos en tiempo real a través de canales asíncronos directos orientados hacia la memoria de la blockchain. Entendemos que en un entorno distribuido el fallo de un nodo distante es una certeza, no una posibilidad; por ello, para mitigar interrupciones sin degradar el rendimiento del clúster principal, hemos integrado robuztamente conectividad inquebrantable empleando algoritmos de Exponential Backoff.
            </p>
            <p>
              Bajo esta rigurosa arquitectura, cada transferencia detectada atraviesa un filtro algorítmico microscópico. Evaluamos la desviación de mercado (Z-Score) en la escala de los microsegundos, aislando con precisión quirúrgica las anomalías macroestructurales —la auténtica huella de la "ballena"— y purgando despiadadamente el ruido transaccional. La precisión estadística dicta el acceso.
            </p>

            <h3 className="text-white/90 text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-2 mt-8">2. Seguridad Soberana & E2EE</h3>
            <p>
              Arquitectamos toda nuestra infraestructura de conexión bajo la premisa inflexible de un Zero-Trust (Confianza Cero) absoluto. El puente enlazado entre la interfaz que usted opera y nuestro núcleo perimetral de datos prescinde por completo del almacenamiento obsoleto de contraseñas, bases de datos expuestas o validaciones orgánicas vulnerables a inyecciones.
            </p>
            <p>
              La bóveda criptográfica encripta todo el espectro volumétrico de la información empleando End-to-End Encryption (E2EE) de grado bancario. La sincronización paralela de la identidad exige la demostración probatoria constante de la propiedad de su llave privada sin que el servidor central llegue a conocerla jamás en ningún punto del transporte.
            </p>
            <p>
              Usted detenta una soberanía patrimonial invulnerable sobre su sesión; la totalidad de nuestra red operativa ha sido diseñada para matemáticamente impedir que exista alguna "llave maestra" capaz de vulnerar el enclave de su bóveda.
            </p>

            <h3 className="text-white/90 text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-2 mt-8">3. Ingeniería Algorítmica Global</h3>
            <p>
              En el ecosistema institucional, intentar rastrear redes segmentadas de forma fragmentaria pulveriza la ventaja comercial. Hemos condensado un cruce multichain capaz de indexar flujos constantes de blockchains independientes al procesar enormes matrices probabilísticas en memoria RAM pura. Unificamos decibeles tarifarios y metadatos caóticos bajo un estándar de complejidad temporal logarítmica inmensamente eficiente.
            </p>
            <p>
              Esta extrema eficiencia fractal de cálculos paralelos, escrita exhaustivamente y probada desde el origen en lenguaje Golang estructurado, constituye el cimiento inquebrantable que da fortaleza al sistema para digerir y devolver decenas de miles de request instantáneas, sin evidenciar ninguna fisura geométrica u operativa a simple vista.
            </p>

            <h3 className="text-white/90 text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-2 mt-8">4. Normativas & Compliance</h3>
            <p>
              Para que el apalancamiento de los poderes institucionales transcurra limpiamente, es indispensable e inalterable conservar la total alienación del cumplimiento jurisdiccional. Hemos implantado barreras heurísticas auto-defensivas proyectadas sin reparos para sostener cualquier blindaje jurídico aun en el grado más riguroso y denso de escrutinio investigativo por autoridades financieras internacionales.
            </p>
            <ul className="list-disc pl-6 space-y-4">
               <li><strong className="text-white uppercase">OFAC Sanctions & AML:</strong> Desplegamos motores audífugos que examinan la procedencia computacional de cada wallet entrante en tiempo real. Bloqueamos instantánea y atemporalmente a entidades conectadas a las prohibiciones globales, habilitando flujos de reconocimiento (KYC) integrados sin riesgo y blindados por la matemática de Zero Knowledge (ZK-Proofs).</li>
               <li><strong className="text-white uppercase">CFTC & Geofencing WAF:</strong> Rutas de red constreñidas por barreras fronterizas automáticas con resoluciones de latencia inferiores a los 5 milisegundos. Ejecutamos un peritaje microscópico cortando y descartando simulaciones de mallas de VPNs impenetrables o alteración de enrutadores.</li>
               <li><strong className="text-white uppercase">GDPR Universal:</strong> Conferimos una absoluta independencia soberana facilitando comandos directos de demolición integral del rastro de metadatos acoplados en cualquier fragmento de caché de memoria RAM con cumplimiento regido a ISO 27001 por libre solicitud del espectador.</li>
            </ul>

            <h3 className="text-white/90 text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-2 mt-8">Resolución Universal</h3>
            <p>
              Sovereign Network no comparece al mercado con la vocación superflua de adornar interfaces visuales interactivas en aplicaciones. Comparecemos únicamente para fragmentar y redefinir cada límite tecnológico para la vigilancia financiera implacable institucional. Absolutamente todo bit forjado en cada capa y modelo paramétrico transmutado por nuestros servidores centrales es verdaderamente un muro balístico erguido exclusivamente para soportar su completo y absoluto dominio soberano ante el entorno financiero más hostil en toda la red global en internet de capa intermedia de blockchains.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={handleEnterArchive}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white text-black font-aztec-body font-medium text-sm rounded shadow-xl hover:bg-[#e0e0e0] transition-all"
              style={{ willChange: 'transform' }}
            >
              Enter the Terminal
            </motion.button>
          </div>
        </motion.div>
      </section>
      
      <DynamicDownheadSection />

      <section className="relative z-10">
        <MarqueeBanner />
        <Web3Features />
        <CrossPlatformAccess />
        
        <DynamicCryptoCheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
        
        <div className="bg-[#050505] py-32 text-center text-white relative border-b border-white/5 shadow-inner">
            <h2 className="font-aztec-body text-4xl font-light mb-4">Sovereign Protocol Matrix</h2>
            <p className="font-aztec-body text-white/50 text-sm mb-12 max-w-md mx-auto">
               Institutional-grade Web3 subscription algorithm (5 USD) backed by smart contracts and absolute cryptographic neutrality. Connect your wallet to access the elite terminal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleEnterArchive} className="px-8 py-3 bg-white text-black text-xs font-medium rounded shadow-lg hover:bg-white/90 transition-all hover:scale-105">Connect Terminal</button>
              <button onClick={() => setShowCheckout(true)} className="px-8 py-3 bg-transparent border border-yellow-500/30 text-yellow-400 text-xs font-medium rounded hover:bg-yellow-500/10 transition-all hover:scale-105 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                  Subscribe (5 USD)
              </button>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
