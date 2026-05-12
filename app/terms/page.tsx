"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Database, Scale, Fingerprint } from 'lucide-react';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

export default function TermsPage() {
    return (
        <div className="w-full overflow-x-hidden font-sans selection:bg-[#0044CC]/20" style={{ backgroundColor: "#FAFAF8", color: "#0A0A0A", minHeight: "100vh" }}>
            
            {/* ── HERO & BENTO BOX ── */}
            <div className="w-full max-w-[1400px] mx-auto pt-32 pb-24 px-6 lg:px-12 flex flex-col items-center">
                
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="w-full text-center flex flex-col items-center mb-24">
                    <motion.div variants={FADE_UP} className="inline-flex items-center gap-3 px-5 py-2 bg-white border border-black/5 rounded-full shadow-sm mb-8">
                        <ShieldCheck size={16} className="text-[#0044CC]" />
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500">Institutional Agreement • Section L-1</span>
                    </motion.div>
                    
                    <motion.h1 variants={FADE_UP} className="text-[48px] sm:text-[64px] md:text-[80px] font-black tracking-tighter leading-[0.95] text-[#0A0A0A] uppercase mb-8">
                        Master Terms of <br /><span className="text-[#0044CC]">Operation.</span>
                    </motion.h1>
                    
                    <motion.p variants={FADE_UP} className="font-serif text-[18px] text-slate-500 leading-relaxed max-w-2xl mb-8">
                        The definitive, absolute, and non-negotiable Legal Agreement establishing the exact parameters of interaction between the operator and the Sovereign Master Node architecture.
                    </motion.p>
                    
                    <motion.p variants={FADE_UP} className="font-mono text-[11px] uppercase tracking-widest font-black text-black/30">
                        Effective Epoch: Cryptographic Cycle 2026-2030
                    </motion.p>
                </motion.div>

                {/* Nestr-Style Bento Box for Principles */}
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={FADE_UP} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-[1200px] mx-auto mb-32">
                    
                    {/* Bento 1 */}
                    <div className="bg-white border border-black/5 p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                        <div className="w-full h-[180px] bg-[#FAFAF8] rounded-3xl border border-black/5 mb-8 flex items-center justify-center overflow-hidden">
                            <RemoteLottie path="File Loading.json" className="scale-125 transition-transform duration-700 group-hover:scale-150" />
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center">
                                    <Scale size={18} className="text-[#0044CC]" />
                                </div>
                                <h3 className="text-[22px] font-black uppercase tracking-tight text-[#0A0A0A]">Ontological Sovereignty</h3>
                            </div>
                            <p className="text-[15px] font-serif leading-relaxed text-slate-500">
                                Absolute operational independence. You assume total responsibility for cryptographic interactions and signatures within the decentralized ecosystem.
                            </p>
                        </div>
                    </div>

                    {/* Bento 2 */}
                    <div className="bg-white border border-black/5 p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                        <div className="w-full h-[180px] bg-[#FAFAF8] rounded-3xl border border-black/5 mb-8 flex items-center justify-center overflow-hidden">
                            <RemoteLottie path="Business Analysis.json" className="scale-[1.6] transition-transform duration-700 group-hover:scale-[1.8]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center">
                                    <Database size={18} className="text-[#0044CC]" />
                                </div>
                                <h3 className="text-[22px] font-black uppercase tracking-tight text-[#0A0A0A]">Zero-Mock Mandate</h3>
                            </div>
                            <p className="text-[15px] font-serif leading-relaxed text-slate-500">
                                No simulated environments. The Terminal renders strictly deterministic, mathematically verified on-chain data directly from the global mempool.
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
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">The Nature of the Sovereign Contract</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    This document constitutes the definitive, absolute, and non-negotiable Legal Agreement establishing the exact parameters of interaction between the operator (hereinafter referred to as "You", "The Operator", or "The User") and the Sovereign Master Node architecture (hereinafter referred to as "The Terminal", "The System", or "The Protocol"). By initiating a cryptographic handshake, generating a session token, bypassing the landing matrix, or executing queries against our Distributed Graph Database infrastructures, you irrevocably, perpetually, and unconditionally submit to these stringent strictures.
                                </p>
                                <p>
                                    The Terminal is fundamentally distinct from consumer-grade financial applications. It is a highly lethal, institutional-grade analytical engine constructed strictly upon principles of Absolute Sovereignty, Zero-Mock data integrity, and deterministic network heuristics. Access to the Terminal is an advanced privilege governed by cryptographic, mathematical, and algorithmic constraints, not by conventional consumer rights. 
                                </p>
                                <p>
                                    There are no intermediaries. When you interact with the Terminal, you are directly instructing your local client environment to construct, encode, and broadcast state-mutating requests directly to decentralized blockchain networks (Layer 1, Layer 2, and side-chains). We do not custody, wrap, escrow, or otherwise manage your cryptographic assets. Consequently, we are mathematically incapable of reversing, pausing, or altering transactions once they have been signed by your Externally Owned Account (EOA) and broadcasted to the decentralized mempool.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-black tracking-tighter shrink-0 text-black/10 leading-none">02</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">Absolute Limitation of Liability & Risk</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    The Terminal acts strictly as an observational apparatus, an intelligence extraction engine, and an execution interface. While our Mass Transfer Intelligence module correlates decentralized exchange liquidity flows, institutional mempool clustering, and centralized cold storage movements via 3-Hop Neo4j Cypher routing, this advanced topological mapping does not under any jurisdiction constitute financial advice, prescriptive strategy, legal consultation, or fiduciary responsibility.
                                </p>
                                
                                <div className="p-8 my-10 bg-white border border-red-100 rounded-3xl shadow-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <AlertTriangle className="mb-6 text-red-500 relative z-10" size={32} />
                                    <p className="font-mono text-[12px] leading-[1.8] uppercase tracking-widest font-bold text-red-900 relative z-10">
                                        "Interaction with crypto-financial structures implies an acknowledgment of absolute, asymmetrical risk. The Terminal isolates topological noise and detects on-chain movements with profound mathematical accuracy, yet the broader financial market remains an inherently chaotic, non-deterministic entity. Consequently, we unequivocally disclaim all liability for capital deployment, loss of funds, smart contract exploits, slippage penalties, or MEV exploitation."
                                    </p>
                                </div>

                                <p>
                                    Furthermore, while the Terminal may conditionally employ Private Mempool RPC integrations (MEV Shields) for administrative or VIP execution routing, the protocol provides zero absolute guarantees regarding the prevention of front-running, sandwich-attacks, or generic mempool griefing for user-initiated external queries. The responsibility to configure slippage tolerance, verify route optimality, and authorize network gas parameters rests entirely and exclusively with the Operator.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-black tracking-tighter shrink-0 text-black/10 leading-none">03</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">Method of Extraction & Anti-Sybil Directives</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    Access to the Terminal's deeply restricted intelligence matrices is subject exclusively to valid, organic interaction patterns. The system is heavily fortified with Layer-7 Heuristic Anomaly Detection, predictive rate-limiting schemas, and algorithmic bot-mitigation firewalls.
                                </p>
                                <p>
                                    Unwarranted computational exploitation is strictly forbidden. Activities such as asynchronous DOM scraping, headless browser automation, velocity-spike API querying, reverse-engineered WebSocket hijacking, or multi-wallet "Sybil Farming" from contiguous IP subnetworks will instantaneously trigger the Sentinel Circuit Breaker. 
                                </p>
                                <p>
                                    Such adversarial actions will result in the immediate, irreversible, and permanent cryptographic banishment of the offending IP matrix, associated hardware fingerprints, and all related EOA hashes. We reserve the absolute, uncontestable right to terminate WebSocket access, revoke session tokens, and nullify intelligence subscription tiers without prior notification, without right to appeal, and without obligation of refund.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-black tracking-tighter shrink-0 text-black/10 leading-none">04</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">Archival Node Dependencies</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    The Terminal's retrospective intelligence modules rely extensively on deep-historical state validation queried through decentralized RPC providers, Alchemy, Ankr Archive Nodes, and our proprietary indexing clusters. In the event of catastrophic upstream infrastructure failure, persistent RPC latency, or "missing trie node" synchronization errors on the Ethereum mainnet or subsequent Layer 2 rollups, the Terminal is programmed to degrade gracefully rather than output hallucinatory data.
                                </p>
                                <p>
                                    We accept zero liability for intelligence delays, missing block states, or corrupted data frames caused by upstream Layer 1 consensus failures, network forks, node operator malfeasance, or global infrastructure degradation at the foundational protocol layer. The Terminal merely reads the chain; it cannot resurrect pruned states that the broader decentralized network has abandoned.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-[48px] md:text-[64px] font-black tracking-tighter shrink-0 text-black/10 leading-none">05</div>
                        <div>
                            <h2 className="text-[28px] md:text-[36px] font-black tracking-tight mb-8 text-[#0A0A0A] uppercase">Institutional Auditing Protocols</h2>
                            <div className="space-y-6 text-slate-600 text-[18px] leading-[1.8] font-medium">
                                <p>
                                    Institutional actors, sovereign wealth funds, or regulatory bodies requesting verification of specific Akashic records must exclusively utilize our public cryptographic endpoints (e.g., `/api/akashic/verify`) to retrieve the Merkle Root Hash associated with the target epoch. 
                                </p>
                                <p>
                                    We do not provide manual database dumps, arbitrary CSV exports, or bespoke data curation services for legal compliance. Proof-of-Inclusion must be mathematically derived by the auditing party using standard SHA-256 validation libraries against the public endpoints provided. By requiring cryptographic proof rather than trusting our database outputs, we maintain the trustless integrity of the system. If you cannot calculate the Merkle proof, you do not possess the clearance to audit the system.
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
