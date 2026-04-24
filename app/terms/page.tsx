"use client";

import React from 'react';
import { Gavel, Globe, Zap, AlertTriangle, Scale, ShieldCheck, Database, Network } from 'lucide-react';

export default function TermsPage() {
    return (
        <div 
            style={{ backgroundColor: "#FDFCF8", color: "#1a1a1a", minHeight: "100vh" }} 
            className="w-full overflow-x-hidden font-sans selection:bg-[#1a1a1a] selection:text-[#FDFCF8]"
        >
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#777" }} className="font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-8">
                    Institutional Agreement • Section L-1
                </div>
                
                <h1 
                    style={{ color: "#050505", fontFamily: "'Georgia', serif" }} 
                    className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.05] mb-6"
                >
                    Terms of Sovereign Operation.
                </h1>
                
                <p style={{ color: "#555" }} className="font-mono text-sm mb-24 uppercase tracking-widest font-bold">
                    Effective Epoch: Academic Cycle 2026
                </p>

                {/* ── CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-24">
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Zap style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Extreme Fidelity</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Direct connection to institutional-grade infrastructure mathematically optimized for sub-15ms latency.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Scale style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Ontological Sovereignty</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Absolute operational independence. You assume total responsibility for cryptographic interactions.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <ShieldCheck style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Zero-Mock Mandate</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            No simulated environments. The Terminal renders strictly deterministic, mathematically verified on-chain data.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Database style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Graph Liability</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Neo4j AuraDB heuristics provide intelligence, not financial prescription. Risk is exclusively yours.
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
                                The Nature of the Sovereign Contract
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed mb-4 text-justify">
                                This document constitutes the definitive Legal Agreement establishing the parameters of interaction between the operator (hereinafter "You") and the Sovereign Master Node architecture (hereinafter "The Terminal"). By initiating a cryptographic handshake or executing queries against our Neo4j Graph Database, you irrevocably submit to these strictures.
                            </p>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                The Terminal is not a consumer application. It is a highly lethal, institutional-grade analytical engine constructed upon principles of Absolute Sovereignty, Zero-Mock data integrity, and deterministic heuristics. Access is a privilege governed by cryptographic mathematical constraints, not consumer rights.
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
                                Limitation of Liability & Execution Risk
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed mb-6 text-justify">
                                The Terminal acts strictly as an observational apparatus and an intelligence extraction engine. While our Mass Transfer Intelligence module correlates decentralized exchange liquidity flows with centralized cold storage addresses via 3-Hop Neo4j Cypher routing, this topological mapping does not constitute financial advice, prescriptive strategy, or fiduciary responsibility.
                            </p>
                            
                            <div style={{ backgroundColor: "#F5F3EC", borderLeft: "4px solid #1a1a1a" }} className="p-6 flex items-start gap-4 mb-6">
                                <AlertTriangle style={{ color: "#1a1a1a" }} size={24} className="shrink-0 mt-1" />
                                <p style={{ color: "#1a1a1a" }} className="text-sm font-mono leading-relaxed uppercase tracking-wide font-bold">
                                    "Interaction with crypto-financial structures implies an acknowledgment of absolute risk. The Terminal isolates noise and detects on-chain movements with profound accuracy, yet the broader financial market remains an inherently chaotic entity. Consequently, we disclaim all liability for capital deployment, loss of funds, or MEV (Maximal Extractable Value) exploitation."
                                </p>
                            </div>

                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Furthermore, while the Terminal employs Flashbots/Eden Private Mempool integrations (MEV Shield) for administrative execution, the protocol provides no guarantees regarding front-running or sandwich-attack prevention for user-initiated external queries.
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
                                Method of Extraction & Anti-Sybil Directives
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed mb-4 text-justify">
                                Access to the Terminal's intelligence matrices—including the Akashic Ledger and the Golden Ticket Minting APIs—is subject exclusively to valid interaction patterns. The system is heavily fortified with Heuristic Anomaly Detection. 
                            </p>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Unwarranted exploitation, such as asynchronous scraping, velocity-spike API queries, or multi-wallet "Sybil Farming" from contiguous subnetworks, will instantaneously trigger the Circuit Breaker. Such actions will result in the immediate and permanent cryptographic banishment of the offending IP matrix and associated EOA (Externally Owned Account) hashes. We reserve the absolute right to terminate WebSocket access without prior notification.
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
                                Intellectual Architecture & Reverse Engineering
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                The structural engineering, the specific mathematical models (including our deterministic Merkle Tree generation and Cypher 3-Hop Graph queries), and the visual topology presented within the Institutional Light Mode Interface remain the exclusive, proprietary architecture of the Sovereign Master Node protocol. Reverse-engineering, decompilation, or unauthorized replication of our classification engine, visual shaders, or telemetry pipelines constitutes a material violation of these Terms and will be prosecuted under applicable cryptographic and terrestrial legal frameworks.
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
                                Archival Node Dependencies & Pruning
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                The Terminal relies on deep-historical state validation through Alchemy and Ankr Archive Nodes. In the event of catastrophic upstream failure or "missing trie node" synchronization errors on the Ethereum mainnet, the Terminal degrades gracefully. We accept no liability for intelligence delays caused by upstream L1 consensus failures, network forks, or infrastructure degradation at the protocol layer.
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
                                Force Majeure & L1 Consensus Failure
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                The Sovereign Master Node operates asynchronously atop decentralized networks (Ethereum, Solana, BNB Chain, Base). We accept zero liability for cascading failures originating at Layer 1 or Layer 2. In the event of a 51% attack, a Byzantine fault, catastrophic finality delays, or hard forks resulting in blockchain reorganization, the Terminal will automatically halt ingestion to preserve the integrity of the Akashic Ledger. Data retrieved during periods of network instability must be considered strictly provisional until cryptographic finality is formally confirmed by the network consensus algorithm.
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
                                Institutional Auditing Protocols
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Institutional actors requesting verification of specific Akashic records must utilize our `/api/akashic/verify` endpoint to retrieve the Merkle Root Hash associated with the target epoch. We do not provide manual database dumps or arbitrary CSV exports. Proof-of-Inclusion must be mathematically derived by the auditing party using standard SHA-256 validation libraries against the public endpoints provided.
                            </p>
                        </div>
                    </section>

                    {/* SECTION 8 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            08.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Dispute Resolution & Cryptographic Jurisdiction
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Given the decentralized, open-source, and global nature of the Sovereign Master Node infrastructure, traditional jurisdictional boundaries are secondary to cryptographic immutability. However, any legal disputes arising from the misuse of this interface, specifically pertaining to intellectual property theft or distributed denial of service (DDoS) attacks against our infrastructure, will be prosecuted. The operator waives any right to participate in a class action lawsuit or class-wide arbitration.
                            </p>
                        </div>
                    </section>

                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-32 pt-16 border-t border-black/10">
                    <Globe style={{ color: "#1a1a1a", opacity: 0.2 }} size={48} className="mb-6" />
                    <p style={{ color: "#777" }} className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-center">
                        Sovereign Master Node · Legal Compendium L-1
                    </p>
                </div>
            </div>
        </div>
    );
}
