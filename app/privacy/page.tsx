"use client";

import React from 'react';
import { Shield, EyeOff, Server, Lock, Database, Globe, Network, Cpu, Fingerprint, Activity } from 'lucide-react';
import { SovereignFooter } from '@/components/landing/SovereignFooter';

export default function PrivacyPage() {
    return (
        <div className="w-full overflow-x-hidden font-sans selection:bg-[#1a1a1a] selection:text-[#FAF9F6]" style={{ backgroundColor: "#FAF9F6", color: "#0A0A0A", minHeight: "100vh" }}>
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#0044CC" }} className="font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
                    <EyeOff size={14} /> Cryptographic Secrecy • Section P-0
                </div>
                
                <h1 style={{ fontFamily: "'Georgia', serif" }} className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.05] mb-6 text-[#0A0A0A]">
                    Zero-Knowledge Privacy Doctrine
                </h1>
                
                <p className="font-mono text-sm mb-24 uppercase tracking-widest font-bold text-black/40">
                    Effective Epoch: Cryptographic Cycle 2026-2030
                </p>

                {/* ── CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-32">
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Lock className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Stateless Execution</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            We do not store, persist, or correlate your cryptographic keys. The server remains fundamentally blind to your local state.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Shield className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Hardware Isolation</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Telemetry is restricted to non-identifying metadata, stripping out IP addresses before hitting the persistence layer.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Database className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">No Consumer PII</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            The Terminal extracts data from decentralized networks, not from your personal identity. You remain a cryptographic hash.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Fingerprint className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Deterministic Deletion</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Session tokens self-destruct. Cached intelligence is pruned algorithmically upon cycle expiration.
                        </p>
                    </div>
                </div>

                {/* ── SECTIONS ── */}
                <div className="flex flex-col gap-24 w-full max-w-[900px] mx-auto font-serif">
                    
                    {/* SECTION 1 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">01</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">The Doctrine of Cryptographic Anonymity</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
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
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">02</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Local-First Execution & Key Isolation</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    All cryptographic primitives, including private keys, mnemonic phrases, and hardware wallet derivation paths, are generated, stored, and executed entirely within your local computing environment. The Sovereign Master Node frontend architecture (Next.js Edge runtime) is mathematically incapable of exfiltrating your private key material.
                                </p>
                                <p>
                                    When you execute a transaction, the signature is generated by your non-custodial wallet (e.g., MetaMask, Rabby, Ledger) locally. The Terminal merely transmits the signed payload to the decentralized RPC mempool. At no point in the space-time continuum does your private key traverse our servers, our load balancers, or our internal memory states.
                                </p>
                                <div className="p-8 my-10 bg-[#0044CC]/5 border-l-4 border-[#0044CC] rounded-r-sm">
                                    <p className="font-mono text-[11px] leading-relaxed uppercase tracking-widest font-bold text-[#0A0A0A]">
                                        "If the Sovereign Master Node infrastructure were to be completely compromised by a nation-state adversary, the attackers would seize zero private keys. The architecture is designed under the assumption of hostile network infiltration, rendering central database breaches financially useless."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">03</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Metadata, IP Sanitization & Analytics</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    To protect the Terminal from Distributed Denial of Service (DDoS) attacks and unwarranted API exploitation, our Edge Firewall (WAF) must temporarily inspect incoming TCP/IP packets. However, IP addresses are treated as highly volatile, toxic assets.
                                </p>
                                <p>
                                    IP addresses are hashed using a one-way cryptographic salt before being written to our rate-limiting Redis clusters. We do not maintain historical logs correlating your public Ethereum address to your terrestrial IP location. We utilize strictly anonymous, aggregate telemetry to monitor node health, RPC latency, and component rendering times. We deploy zero third-party surveillance scripts (e.g., Facebook Pixel, invasive tracking cookies) within the core terminal interface. 
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">04</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">On-Chain Data Permanence Warning</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    It is imperative to distinguish between our internal privacy doctrine and the immutable nature of public blockchains. When you execute a transaction, swap a token, or vote in a DAO through the Terminal, that action is inscribed onto a public ledger. 
                                </p>
                                <p>
                                    The Sovereign Master Node cannot delete, mask, or obscure your on-chain history. Blockchain forensics firms, governmental entities, and adversarial actors can and will map your public address interactions. We hold no liability for the exposure of your behavioral patterns on the public ledger. If absolute on-chain privacy is required, you must utilize cryptographic tumblers, zero-knowledge proofs (zk-SNARKs), or dedicated privacy networks independently of the Terminal.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">05</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Session Tokens & Local Storage</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The Terminal utilizes HttpOnly, Secure, and SameSite=Strict cookies specifically for managing "Zero-Friction" SiWE (Sign-In with Ethereum) authentication. These tokens are cryptographically signed using HS256/RS256 algorithms and contain zero PII—only your wallet address and authorization tier. 
                                </p>
                                <p>
                                    Additionally, local interface configurations (e.g., Theme preferences, layout toggles, RPC endpoint preferences) are stored in your browser's LocalStorage. This data never leaves your device and is not transmitted back to our servers. You may purge this data at any time via your browser's development tools.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">06</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Legal Compliance & Coercion Resistance</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    If compelled by a legally binding subpoena or court order from a recognized jurisdiction, the maintaining entity of the Sovereign Master Node will comply with terrestrial law. However, due to the Stateless Execution doctrine (Section 1), the absolute maximum extent of our compliance is the provision of aggregated, anonymized telemetry and firewall logs.
                                </p>
                                <p>
                                    We cannot provide what we do not possess. We cannot provide names, email addresses, KYC documentation, or private keys, because the architectural integrity of the system actively rejects the ingestion of such data. The Terminal is fundamentally coercion-resistant by design.
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
