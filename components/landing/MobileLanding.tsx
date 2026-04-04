"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Lock, Monitor, Cpu, Database, Shield, Zap, Network,
    ArrowRight, QrCode, Wallet, CheckCircle, ChevronDown,
    LayoutDashboard, Bot, Activity, Globe, GitBranch,
    Server, BarChart3, Target, Layers, Sparkles, Core, BookOpen
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useAppKit } from '@reown/appkit/react';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(
    () => import('../dashboard/QrScanner').then(m => ({ default: m.QrScanner })),
    { ssr: false, loading: () => <div className="w-64 h-64 rounded-3xl bg-white/5 animate-pulse mx-auto" /> }
);

// ─── CONFIGURACIÓN DE ANIMACIÓN ───────────────────────────────────────────────
const SPRING = { type: "spring" as const, stiffness: 60, damping: 20, mass: 1 };

// ─── ETIQUETA ACADÉMICA ────────────────────────────────────────────────────────
function Tag({ children }: { children: React.ReactNode }) {
    return (
        <span style={{ color: "#D4AF37", border: "1px solid rgba(212, 175, 55, 0.15)", backgroundColor: "rgba(212, 175, 55, 0.05)" }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono uppercase tracking-[0.25em]">
            {children}
        </span>
    );
}

// ─── Sección ──────────────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
    return (
        <section id={id} className={`min-h-screen w-full relative flex flex-col px-6 py-20 ${className}`}>
            {children}
        </section>
    );
}

// ─── Tarjeta Arquitectónica ──────────────────────────────────────────────────
function ArchCard({ icon, title, subtitle, body }: {
    icon: React.ReactNode; title: string; subtitle: string; body: string;
}) {
    return (
        <div style={{ backgroundColor: "rgba(10, 12, 15, 0.6)", border: "1px solid rgba(255, 255, 255, 0.04)" }} className="relative rounded-xl p-5 space-y-3 overflow-hidden backdrop-blur-sm">
            <div className="flex items-start gap-4">
                <div style={{ color: "#D4AF37" }} className="shrink-0 mt-0.5">
                    {icon}
                </div>
                <div>
                    <h4 style={{ color: "#EAEAEA" }} className="text-[16px] font-medium leading-tight">{title}</h4>
                    <p style={{ color: "#8A94A6" }} className="font-mono text-[9px] uppercase tracking-[0.15em] mt-1">{subtitle}</p>
                </div>
            </div>
            <p style={{ color: "#7B8699" }} className="text-[13px] leading-[1.75] font-light mt-2">
                {body}
            </p>
        </div>
    );
}

// ─── Paso Metodológico ────────────────────────────────────────────────────────
function Step({ n, title, body }: { n: number; title: string; body: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div style={{ color: "#D4AF37", border: "1px solid rgba(212, 175, 55, 0.3)", backgroundColor: "rgba(212, 175, 55, 0.05)" }} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-medium shrink-0">
                    {n}
                </div>
                <div style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.2) 0%, transparent 100%)" }} className="w-px flex-1 mt-2 mb-1" />
            </div>
            <div className="pb-6 space-y-1.5">
                <h4 style={{ color: "#F5F5F5" }} className="text-[15px] font-medium">{title}</h4>
                <p style={{ color: "#8A94A6" }} className="text-[13px] leading-[1.8] font-light">{body}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// MAIN COMPONENT REWRITE (Academic / PC Zone Sync)
// ─────────────────────────────────────────
export function MobileLanding() {
    const { user, isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const { open: openWallet } = useAppKit();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: containerRef });
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroY = useTransform(scrollY, [0, 300], [0, -40]);

    return (
        <div
            ref={containerRef}
            style={{ backgroundColor: "#020202", color: "#E0E0E0" }}
            className="min-h-screen overflow-y-auto w-full selection:bg-[#D4AF37]/30 selection:text-white font-sans"
        >
            {/* Atmósfera superior (Sutil) */}
            <div className="fixed top-0 left-0 right-0 h-[40vh] bg-[radial-gradient(ellipse_at_50%_-20%,_rgba(212,175,55,0.05),_transparent_70%)] pointer-events-none z-0" />

            {/* ── SECCIÓN 1: PRÓLOGO ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <motion.div
                    style={{ opacity: heroOpacity, y: heroY }}
                    className="relative z-10 flex flex-col items-center gap-7 pt-12"
                >
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.2 }}>
                        <Tag><Lock size={9} strokeWidth={1.5} /> Enlace Estructural</Tag>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.3 }} className="space-y-4">
                        <h1 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-[40px] leading-[1.1] font-light tracking-tight">
                            Sovereign
                            <br />
                            <span style={{ color: "#8A94A6" }}>Bridge Protocol</span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
                        style={{ color: "#A0AABF" }}
                        className="text-[15px] leading-[1.8] max-w-[280px] font-light"
                    >
                        Interfaz móvil configurada exclusivamente para el establecimiento de sesiones criptográficas.
                    </motion.p>

                    <motion.button
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.6 }}
                        onClick={() => { document.getElementById('s-connect')?.scrollIntoView({ behavior: 'smooth' }); }}
                        style={{ backgroundColor: "#EAEAEA", color: "#0A0A0A" }}
                        className="flex items-center gap-2 px-6 py-3.5 rounded text-[13px] font-medium hover:bg-white transition-colors mt-2"
                    >
                        Establecer Enlace Seguro <ArrowRight size={14} />
                    </motion.button>
                </motion.div>

                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 opacity-30">
                    <ChevronDown size={18} style={{ color: "#D4AF37" }} />
                </motion.div>
            </section>

            {/* ── SECCIÓN 2: EPISTEMOLOGÍA Y LÍMITES ── */}
            <Section className="justify-start pt-24 pb-16 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="space-y-10 max-w-sm mx-auto w-full">
                    <div className="space-y-5">
                        <Tag><Monitor size={9} /> Restricción Computacional</Tag>
                        <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-[28px] leading-[1.2] font-light">
                            Topología de <br />
                            <span style={{ color: "#8A94A6" }}>Alta Frecuencia.</span>
                        </h2>
                        <p style={{ color: "#8A94A6" }} className="text-[14px] leading-[1.9] font-light">
                            El análisis estocástico y la síntesis de flujos institucionales demandan capacidades de renderizado 
                            constantes. Este dispositivo móvil carece de la optimización requerida para ejecutar el motor 
                            visual sin comprometer la velocidad ni la veracidad de los eventos financieros.
                        </p>
                    </div>

                    <div style={{ backgroundColor: "rgba(212, 175, 55, 0.03)", border: "1px solid rgba(212, 175, 55, 0.15)" }} className="rounded-xl p-5 space-y-3">
                        <div style={{ color: "#D4AF37" }} className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em]">
                            <BookOpen size={12} /> Naturaleza del Enlace
                        </div>
                        <p style={{ color: "#A0AABF" }} className="text-[13px] leading-[1.8] font-light">
                            El dispositivo actual debe emplearse estrictamente como una capa de autenticación asimétrica (Zero-Knowledge). 
                            Escanee el código de vinculación para delegar su sesión al entorno de escritorio.
                        </p>
                    </div>
                </div>
            </Section>

            {/* ── SECCIÓN 3: ARQUITECTURA SINTÉTICA ── */}
            <Section className="justify-start pt-20 pb-16 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="space-y-8 max-w-sm mx-auto w-full">
                    <div className="space-y-4">
                        <Tag><Database size={9} /> Infraestructura</Tag>
                        <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-[28px] leading-[1.2] font-light">
                            Constructo <br />
                            <span style={{ color: "#8A94A6" }}>Algorítmico.</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <ArchCard
                            icon={<Cpu size={18} strokeWidth={1.5} />}
                            title="Ingesta Inmutable"
                            subtitle="Sincronización EVM · WebSocket"
                            body="Unificación de grafos dirigidos procedentes de estados de la blockchain sin intermediarios matemáticos que distorsionen la información."
                        />
                        <ArchCard
                            icon={<Shield size={18} strokeWidth={1.5} />}
                            title="Capa de Soberanía"
                            subtitle="Protocolos ZK · Mnemotécnicas"
                            body="Implementamos mecanismos criptográficos para aislar los flujos generados, garantizando la inobservabilidad regulatoria de manera descentralizada."
                        />
                        <ArchCard
                            icon={<Network size={18} strokeWidth={1.5} />}
                            title="Modelado de Nodos"
                            subtitle="Arquitectura Euclidiana"
                            body="La plataforma interactúa generando mapeos directos sobre entidades de mercado (wallets, pools) permitiendo la vinculación semántica de datos puros."
                        />
                    </div>
                </div>
            </Section>

            {/* ── SECCIÓN 4: INSTRUCCIONES DE ACCESO ── */}
            <Section className="justify-start pt-20 pb-12">
                <div className="space-y-10 max-w-sm mx-auto w-full">
                    <div className="space-y-4">
                        <Tag><Lock size={9} /> Metodología</Tag>
                        <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-[28px] leading-[1.2] font-light">
                            Protocolos de <br />
                            <span style={{ color: "#8A94A6" }}>Autenticación.</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <Step
                            n={1}
                            title="Despliegue Físico"
                            body="Ubíquese en una estación de trabajo o computadora personal con un navegador con soporte nativo de aceleración web."
                        />
                        <Step
                            n={2}
                            title="Apertura de la Red"
                            body="Acceda a Sovereign Network y diríjase al panel de vinculación bajo la capa de preferencias ("Device Bridge")."
                        />
                        <Step
                            n={3}
                            title="Interpretación Criptográfica"
                            body="Valide su acceso empleando la sección inferior de esta interfaz. El escáner decodificará el token efímero asignado a la sesión principal."
                        />
                    </div>
                </div>
            </Section>

            {/* ── SECCIÓN 5: MÓDULO DE CONEXIÓN E INGRESO (PRESERVADO INTACTO EN LÓGICA) ── */}
            <Section id="s-connect" className="justify-start pt-16 pb-24 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="space-y-10 max-w-sm mx-auto w-full">
                    <div className="space-y-4 text-center">
                        <div style={{ color: "#D4AF37", fill: "rgba(212, 175, 55, 0.1)" }} className="flex justify-center mb-6">
                            <QrCode size={28} strokeWidth={1} />
                        </div>
                        <h2 style={{ color: "#F5F5F5", fontFamily: "'Space Grotesk', sans-serif" }} className="text-[28px] leading-[1.2] font-light">
                            Enlace de Observación
                        </h2>
                        <p style={{ color: "#8A94A6" }} className="text-[13px] leading-[1.8] font-light">
                            Identifique su entidad criptográfica y posteriormente enfoque la matriz de la terminal para formalizar el traspaso.
                        </p>
                    </div>

                    {/* BLOQUE DE AUTENTICACION (Lógica preservada) */}
                    {isSignedIn ? (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ backgroundColor: "rgba(212, 175, 55, 0.05)", border: "1px solid rgba(212, 175, 55, 0.2)" }}
                                    className="flex items-center gap-4 p-5 rounded-xl">
                            <CheckCircle size={22} style={{ color: "#D4AF37" }} className="shrink-0" />
                            <div>
                                <p style={{ color: "#D4AF37" }} className="font-mono text-[9px] uppercase tracking-widest opacity-80">
                                    Conexión Establecida
                                </p>
                                <p style={{ color: "#E0E0E0" }} className="text-[14px] font-medium mt-1">
                                    {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? 'Entidad Soberana'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => openSignIn({ redirectUrl: '/' })}
                                style={{ backgroundColor: "#EAEAEA", color: "#0A0A0A" }}
                                className="w-full py-4 rounded-lg font-medium text-[13px] flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                            >
                                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                                </svg>
                                Credencial Institucional (Clerk)
                            </button>
                            <button
                                onClick={() => openWallet()}
                                style={{ backgroundColor: "transparent", border: "1px solid rgba(255, 255, 255, 0.2)", color: "#E0E0E0" }}
                                className="w-full py-4 rounded-lg font-medium text-[13px] flex items-center justify-center gap-3 transition-transform active:scale-[0.98] hover:bg-[rgba(255,255,255,0.05)]"
                            >
                                <Wallet size={16} />
                                Firma Criptográfica (Wallet)
                            </button>
                        </div>
                    )}

                    {/* Divisor Visual */}
                    <div className="flex items-center gap-4 py-4">
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }} />
                        <span style={{ color: "#D4AF37" }} className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-50">Lector Óptico</span>
                        <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }} />
                    </div>

                    {/* Escáner (Lógica conservada) */}
                    <div className="space-y-6">
                        <div className="text-center space-y-1">
                            <p style={{ color: "#7B8699" }} className="font-mono text-[10px] uppercase tracking-[0.1em]">
                                Visualice <span style={{ color: "#D4AF37" }}>Device Bridge</span> en el entorno PC
                            </p>
                        </div>
                        
                        {/* Wrapper for the QrScanner to ensure it integrates seamlessly with dark theme */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl isolate" style={{ border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                             <QrScanner />
                        </div>
                    </div>

                    <p style={{ color: "#545F73" }} className="text-center text-[11px] leading-relaxed font-light mt-8">
                        Su terminal móvil opera como un conducto de seguridad unidireccional. 
                        La inmersión completa y análisis de la red requiere una estación de trabajo principal.
                    </p>
                </div>
            </Section>
        </div>
    );
}
