"use client";

import React from 'react';
import { ShieldAlert, Network, EyeOff, Globe, Lock, Code, Database } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div 
            style={{ backgroundColor: "#FDFCF8", color: "#1a1a1a", minHeight: "100vh" }} 
            className="w-full overflow-x-hidden font-sans selection:bg-[#1a1a1a] selection:text-[#FDFCF8]"
        >
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#777" }} className="font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-8">
                    Confidentiality Protocol • Section P-1
                </div>
                
                <h1 
                    style={{ color: "#050505", fontFamily: "'Georgia', serif" }} 
                    className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.05] mb-6"
                >
                    Privacy Policy.
                </h1>
                
                <p style={{ color: "#555" }} className="font-mono text-sm mb-24 uppercase tracking-widest font-bold">
                    Effective Epoch: Academic Cycle 2026
                </p>

                {/* ── CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-24">
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <EyeOff style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Absolute Obfuscation</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Observational trajectories remain unmapped. We do not track longitudinal behavioral patterns.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Lock style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Zero-Knowledge</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Identities are cryptographically deferred. We hold zero decryption capabilities for your local Web3 secure enclave.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <ShieldAlert style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Ephemeral States</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Redis telemetry is highly volatile. Subnet flags for Anti-Sybil protection expire within strict 3600-second windows.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Code style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Merkle Proofs</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Data ingested into the Akashic Ledger tracks deterministic mathematical hashes, completely devoid of PII (Personally Identifiable Information).
                        </p>
                    </div>
                </div>

                {/* ── SECTIONS ── */}
                <div className="flex flex-col gap-20 w-full max-w-4xl mx-auto">
                    
                    {/* SECTION 1 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            01.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Data Retention Models & Ephemerality
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed mb-4 text-justify">
                                The Terminal operates under a strict data minimization protocol. Wallet addresses, heuristic queries, and node placements are utilized strictly to render the environment and validate interactions against the Ethereum mainnet. 
                            </p>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                The mathematical architecture inherently rejects the longitudinal profiling of its operators. Caching mechanisms, including our Next.js Edge implementations, are strictly local and ephemeral. Your interaction vectors are scrubbed from the rendering buffers upon session termination.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 2 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            02.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Network Telemetry & Anti-Sybil Framework
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed mb-4 text-justify">
                                To protect the sovereign infrastructure against coordinated DoS (Denial of Service) attacks and automated bot networks, we gather aggregate, non-identifiable telemetry. This includes velocity-tracking heuristics at the Redis cache layer.
                            </p>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                If our Anomaly Detection module identifies a "Sybil Farm" pattern (e.g., a single IP routing multiple distinct wallet connections rapidly), the origin IP is temporarily flagged in volatile memory for exactly 3600 seconds (1 hour). This subnet data is never written to persistent disk (PostgreSQL) and is utilized exclusively for circuit-breaker logic to preserve the 240Hz visual threshold of the network.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            03.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Cryptographic Identity Delegation
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Identity is established via ECDSA (Elliptic Curve Digital Signature Algorithm) signatures. We do not require, collect, or store email addresses, names, or physical telemetry. By utilizing robust Web3 wallet providers (e.g., MetaMask, Coinbase Wallet, Rabby) and SIWE (Sign-In With Ethereum) standards, identity handling is deferred to mathematically secure frameworks external to our core infrastructure. We do not, and logically cannot, decrypt your private keys.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            04.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                The Akashic Ledger & Provenance
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Data ingested into the Akashic Ledger—our core historical dataset—consists entirely of public, raw hexadecimal strings extracted from decentralized blockchains. While this data is publicly immutable, we employ local Merkle Trees (`lib/blockchain/merkle.ts`) to guarantee that our indexing of this public data has not been tampered with. The Proof-of-Inclusion hashes generated by our nodes contain zero PII and serve only to guarantee structural fidelity.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 5 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            05.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Subpoenas & Government Information Requests
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Our Zero-Mock and Zero-Knowledge architectural mandate is not merely a philosophical stance; it is a technical reality. Because the Sovereign Master Node does not retain IP access logs beyond the 3600-second Redis volatility window, and because cryptographic identities are managed via decentralized WalletConnect/SIWE handshakes, we physically possess no Personally Identifiable Information (PII) to surrender. Any subpoena or government request for operator identity will be met with the mathematical truth that such data does not exist within our infrastructure.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 6 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            06.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Cookie Policy & Local Storage Sterile Environments
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Traditional Web2 cookie tracking is fundamentally incompatible with the Sovereign Master Node. We do not utilize tracking pixels, Google Analytics, or third-party retargeting cookies. The only state stored locally in your browser (via `localStorage` or `sessionStorage`) is the cryptographic nonce required to maintain your active Web3 session and the UI presentation state (e.g., your preferred sorting metrics for the Akashic Ledger). Clearing your browser cache instantly and irrevocably severs all ties to the Terminal.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 7 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            07.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                External API Providers & Data Silos
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                While the Terminal utilizes external node providers (e.g., Alchemy, Infura, QuickNode) and localized databases (Railway PostgreSQL, Neo4j AuraDB) to ingest and process blockchain states, the data passed to these providers is strictly limited to public hexadecimal transaction hashes. We actively employ RPC multiplexing and Circuit Breaker logic (`lib/blockchain/CircuitBreaker.ts`) to ensure that no single external provider can build a comprehensive graph of your specific queries. Your intelligence gathering remains siloed and obfuscated.
                            </p>
                        </div>
                    </section>

                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-32 pt-16 border-t border-black/10">
                    <Globe style={{ color: "#1a1a1a", opacity: 0.2 }} size={48} className="mb-6" />
                    <p style={{ color: "#777" }} className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-center">
                        Sovereign Master Node · Enclave Operations
                    </p>
                </div>
            </div>
        </div>
    );
}
