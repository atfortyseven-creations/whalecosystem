"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { EyeOff, Shield, Lock, Database, Fingerprint } from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function PrivacyPage() {
    return (
        <div className="w-full overflow-x-hidden font-sans selection:bg-[#0044CC]/20" style={{ color: "#0A0A0A", minHeight: "100vh" }}>
            
            {/* ── HERO & BENTO BOX ── */}
            <div className="w-full max-w-[1400px] mx-auto pt-32 pb-24 px-6 lg:px-12 flex flex-col items-center">
                
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="w-full text-center flex flex-col items-center mb-24">
                    <motion.div variants={FADE_UP} className="inline-flex items-center gap-3 px-5 py-2 bg-white border border-black/5 rounded-full shadow-sm mb-8">
                        <EyeOff size={16} className="text-[#0044CC]" />
                    </motion.div>
                    
                    <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[64px] md:text-[80px] font-black tracking-tighter leading-[0.95] text-[#0A0A0A] uppercase mb-8">
                        Zero-Knowledge <br /><span className="text-[#0044CC]">Doctrine.</span>
                    </motion.h1>
                    
                    <motion.p variants={FADE_UP} className="font-serif text-[18px] text-slate-500 leading-relaxed max-w-2xl mb-8">
                        We do not store, persist, or correlate your cryptographic keys. The server remains fundamentally blind to your local state.
                    </motion.p>
                    
                    <motion.p variants={FADE_UP} className="font-mono text-[11px] uppercase tracking-widest font-black text-black/30">
                        Effective Epoch: Cryptographic Cycle 2026-2030
                    </motion.p>
                </motion.div>

                {/* Nestr-Style Bento Box for Principles */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1200px] mx-auto mb-32">
                    
                    {/* Bento 1 */}
                    <div className="bg-white/40 backdrop-blur-3xl border border-black/5 p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                        <div className="w-full h-[180px] bg-white/40 dark:bg-[#050505]/40 backdrop-blur-3xl rounded-3xl border border-black/5 dark:border-white/5 mb-8 flex flex-col items-center justify-center overflow-hidden gap-4 text-black/20 dark:text-white/20">
                            <Lock size={48} strokeWidth={1} />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Cryptography</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center">
                                    <Lock size={18} className="text-[#0044CC]" />
                                </div>
                                <h3 className="text-[22px] font-black uppercase tracking-tight text-[#0A0A0A]">Stateless Execution</h3>
                            </div>
                            <p className="text-[15px] font-serif leading-relaxed text-slate-500">
                                All cryptographic primitives are executed locally. The Sovereign Master Node architecture is mathematically incapable of exfiltrating your private key material.
                            </p>
                        </div>
                    </div>

                    {/* Bento 2 */}
                    <div className="bg-white/40 backdrop-blur-3xl border border-black/5 p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                        <div className="w-full h-[180px] bg-white/40 dark:bg-[#050505]/40 backdrop-blur-3xl rounded-3xl border border-black/5 dark:border-white/5 mb-8 flex flex-col items-center justify-center overflow-hidden gap-4 text-black/20 dark:text-white/20">
                            <Fingerprint size={48} strokeWidth={1} />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Identity</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center">
                                    <Database size={18} className="text-[#0044CC]" />
                                </div>
                                <h3 className="text-[22px] font-black uppercase tracking-tight text-[#0A0A0A]">No Consumer PII</h3>
                            </div>
                            <p className="text-[15px] font-serif leading-relaxed text-slate-500">
                                The Terminal extracts data from decentralized networks, not from your personal identity. You remain a cryptographic hash; we never harvest biological identity.
                            </p>
                        </div>
                    </div>

                </motion.div>

                {/* ── SECTIONS ── */}
                <div className="flex flex-col gap-24 w-full max-w-[900px] mx-auto font-serif">
                    
                    {/* SECTION 1 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-black tracking-tighter shrink-0 text-black/10 leading-none">01</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">The Doctrine of Cryptographic Anonymity</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    In an era of ubiquitous surveillance and massive data commodification, the Sovereign Master Node operates on a diametrically opposed philosophy: The Doctrine of Cryptographic Anonymity. This document outlines, with absolute mathematical precision, exactly how the Terminal interacts with your local environment, what fragmented data is temporarily processed, and our strict architectural inability to compromise your identity.
                                </p>
                                <p>
                                    You are not a "user" to be monetized; you are an operator defined solely by your cryptographic signature and public keys. We do not require, request, or possess mechanisms to store your Personal Identifiable Information (PII) such as legal names, residential coordinates, or traditional financial banking records. The Terminal is an interface for reading on-chain reality, not an apparatus for harvesting biological identity.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-black tracking-tighter shrink-0 text-black/10 leading-none">02</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">Local-First Execution & Key Isolation</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    All cryptographic primitives, including private keys, mnemonic phrases, and hardware wallet derivation paths, are generated, stored, and executed entirely within your local computing environment. The Sovereign Master Node frontend architecture (Next.js Edge runtime) is mathematically incapable of exfiltrating your private key material.
                                </p>
                                <p>
                                    When you execute a transaction, the signature is generated by your non-custodial wallet locally. The Terminal merely transmits the signed payload to the decentralized RPC mempool. At no point in the space-time continuum does your private key traverse our servers, our load balancers, or our internal memory states.
                                </p>
                                <div className="p-8 my-10 bg-white border border-[#0044CC]/20 rounded-3xl shadow-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[#0044CC]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Lock className="mb-6 text-[#0044CC] relative z-10" size={32} />
                                    <p className="font-mono text-[12px] leading-[1.8] uppercase tracking-widest font-bold text-[#0A0A0A] relative z-10">
                                        "If the Sovereign Master Node infrastructure were to be completely compromised by a nation-state adversary, the attackers would seize zero private keys. The architecture is designed under the assumption of hostile network infiltration, rendering central database breaches financially useless."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-black tracking-tighter shrink-0 text-black/10 leading-none">03</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">Metadata, IP Sanitization & Analytics</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    To protect the Terminal from Distributed Denial of Service (DDoS) attacks and unwarranted API exploitation, our Edge Firewall (WAF) must temporarily inspect incoming TCP/IP packets. However, IP addresses are treated as highly volatile, toxic assets.
                                </p>
                                <p>
                                    IP addresses are hashed using a one-way cryptographic salt before being written to our rate-limiting Redis clusters. We do not maintain historical logs correlating your public Ethereum address to your terrestrial IP location. We utilize strictly anonymous, aggregate telemetry to monitor node health, RPC latency, and component rendering times. We deploy zero third-party surveillance scripts within the core terminal interface.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-black tracking-tighter shrink-0 text-black/10 leading-none">04</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">On-Chain Data Permanence Warning</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    It is imperative to distinguish between our internal privacy doctrine and the immutable nature of public blockchains. When you execute a transaction, swap a token, or vote in a DAO through the Terminal, that action is inscribed onto a public ledger. 
                                </p>
                                <p>
                                    The Sovereign Master Node cannot delete, mask, or obscure your on-chain history. Blockchain forensics firms, governmental entities, and adversarial actors can and will map your public address interactions. We hold no liability for the exposure of your behavioral patterns on the public ledger. If absolute on-chain privacy is required, you must utilize cryptographic tumblers or dedicated privacy networks.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
            
            <SovereignFooter />
        </div>
    );
}
