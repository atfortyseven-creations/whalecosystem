"use client";

import React from 'react';
import { Gavel, Globe, Zap, AlertTriangle, Scale, ShieldCheck, Database, Network, Key, Terminal, FileText, Cpu, Server, Fingerprint, Lock } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="w-full overflow-x-hidden font-sans selection:bg-[#1a1a1a] selection:text-[#FAF9F6]" style={{ backgroundColor: "#FAF9F6", color: "#0A0A0A", minHeight: "100vh" }}>
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#0044CC" }} className="font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
                    <ShieldCheck size={14} /> Institutional Agreement • Section L-1
                </div>
                
                <h1 style={{ fontFamily: "'Georgia', serif" }} className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.05] mb-6 text-[#0A0A0A]">
                    Master Terms of Sovereign Operation
                </h1>
                
                <p className="font-mono text-sm mb-24 uppercase tracking-widest font-bold text-black/40">
                    Effective Epoch: Cryptographic Cycle 2026-2030
                </p>

                {/* ── CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-32">
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Zap className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Extreme Fidelity</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Direct connection to institutional-grade infrastructure mathematically optimized for maximum execution integrity.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Scale className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Ontological Sovereignty</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Absolute operational independence. You assume total responsibility for cryptographic interactions and signatures.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Database className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Zero-Mock Mandate</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            No simulated environments. The Terminal renders strictly deterministic, mathematically verified on-chain data.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Fingerprint className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Graph Liability</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Our proprietary heuristics provide topological intelligence, not financial prescription. Capital risk is exclusively yours.
                        </p>
                    </div>
                </div>

                {/* ── SECTIONS ── */}
                <div className="flex flex-col gap-24 w-full max-w-[900px] mx-auto font-serif">
                    
                    {/* SECTION 1 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">01</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">The Nature of the Sovereign Contract</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
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
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">02</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Absolute Limitation of Liability & Execution Risk</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The Terminal acts strictly as an observational apparatus, an intelligence extraction engine, and an execution interface. While our Mass Transfer Intelligence module correlates decentralized exchange liquidity flows, institutional mempool clustering, and centralized cold storage movements via 3-Hop Neo4j Cypher routing, this advanced topological mapping does not under any jurisdiction constitute financial advice, prescriptive strategy, legal consultation, or fiduciary responsibility.
                                </p>
                                
                                <div className="p-8 my-10 bg-black text-white rounded-sm">
                                    <AlertTriangle className="mb-4 text-[#0044CC]" size={28} />
                                    <p className="font-mono text-[11px] leading-relaxed uppercase tracking-widest font-bold">
                                        "Interaction with crypto-financial structures implies an acknowledgment of absolute, asymmetrical risk. The Terminal isolates topological noise and detects on-chain movements with profound mathematical accuracy, yet the broader financial market remains an inherently chaotic, non-deterministic entity. Consequently, we unequivocally disclaim all liability for capital deployment, loss of funds, smart contract exploits, slippage penalties, or MEV (Maximal Extractable Value) exploitation."
                                    </p>
                                </div>

                                <p>
                                    Furthermore, while the Terminal may conditionally employ Flashbots, Eden Network, or other Private Mempool RPC integrations (often referred to as MEV Shields) for administrative or VIP execution routing, the protocol provides zero absolute guarantees regarding the prevention of front-running, sandwich-attacks, time-bandit attacks, or generic mempool griefing for user-initiated external queries. The responsibility to configure slippage tolerance, verify route optimality, and authorize network gas parameters rests entirely and exclusively with the Operator.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">03</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Method of Extraction & Anti-Sybil Directives</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    Access to the Terminal's deeply restricted intelligence matrices—including but not limited to the Akashic Ledger, the Dark Forest Mempool Scanner, and the Automated Order Dispatch systems—is subject exclusively to valid, organic interaction patterns. The system is heavily fortified with Layer-7 Heuristic Anomaly Detection, predictive rate-limiting schemas, and algorithmic bot-mitigation firewalls.
                                </p>
                                <p>
                                    Unwarranted computational exploitation is strictly forbidden. Activities such as asynchronous DOM scraping, headless browser automation, velocity-spike API querying, reverse-engineered WebSocket hijacking, or multi-wallet "Sybil Farming" from contiguous IP subnetworks will instantaneously trigger the Sentinel Circuit Breaker. 
                                </p>
                                <p>
                                    Such adversarial actions will result in the immediate, irreversible, and permanent cryptographic banishment of the offending IP matrix, associated hardware fingerprints, and all related EOA (Externally Owned Account) hashes. We reserve the absolute, uncontestable right to terminate WebSocket access, revoke session tokens, and nullify intelligence subscription tiers without prior notification, without right to appeal, and without obligation of refund.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">04</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Intellectual Architecture & Reverse Engineering</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The structural engineering, the specific mathematical models (including our deterministic Merkle Tree generation algorithms and highly optimized Cypher multi-hop graph querying protocols), and the unique visual topology presented within the Institutional Interface remain the exclusive, proprietary architecture of the Sovereign Master Node protocol and its maintaining entities.
                                </p>
                                <p>
                                    Reverse-engineering, decompilation, unauthorized replication, or derivative mirroring of our classification engine, visual data shaders, D3.js force-graph algorithms, or proprietary telemetry pipelines constitutes a catastrophic material violation of these Terms. We actively monitor client-side memory hooking and DOM tampering. Unauthorized replication will be aggressively prosecuted to the maximum extent permitted by applicable cryptographic, international, and terrestrial legal frameworks. You are granted a limited, non-exclusive, non-transferable, and highly revocable license to interact with the frontend compilation solely for personal or authorized institutional intelligence gathering.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">05</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Archival Node Dependencies & Pruning Vectors</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The Terminal's retrospective intelligence modules rely extensively on deep-historical state validation queried through decentralized RPC providers, Alchemy, Ankr Archive Nodes, and our proprietary indexing clusters. In the event of catastrophic upstream infrastructure failure, persistent RPC latency, or "missing trie node" synchronization errors on the Ethereum mainnet or subsequent Layer 2 rollups, the Terminal is programmed to degrade gracefully rather than output hallucinatory data.
                                </p>
                                <p>
                                    We accept zero liability for intelligence delays, missing block states, or corrupted data frames caused by upstream Layer 1 consensus failures, network forks, node operator malfeasance, or global infrastructure degradation at the foundational protocol layer. The Terminal merely reads the chain; it cannot resurrect pruned states that the broader decentralized network has abandoned.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">06</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Force Majeure & L1 Consensus Failure</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The Sovereign Master Node operates asynchronously atop vast, global, decentralized networks. We accept absolute zero liability for cascading failures, capital destruction, or systemic halting originating at Layer 1 or Layer 2. 
                                </p>
                                <p>
                                    In the catastrophic event of a 51% attack, a Byzantine fault cascade, profound finality delays, critical validator slashes, or contentious hard forks resulting in blockchain reorganization, the Terminal will automatically trigger a complete halting of data ingestion to preserve the integrity of the local Akashic Ledger. Data retrieved, displayed, or executed during periods of extreme network instability must be considered strictly provisional until cryptographic finality is formally confirmed by the network consensus algorithm. You operate during these epochs at your own profound peril.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 7 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">07</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Institutional Auditing Protocols</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    Institutional actors, sovereign wealth funds, or regulatory bodies requesting verification of specific Akashic records must exclusively utilize our public cryptographic endpoints (e.g., `/api/akashic/verify`) to retrieve the Merkle Root Hash associated with the target epoch. 
                                </p>
                                <p>
                                    We do not provide manual database dumps, arbitrary CSV exports, or bespoke data curation services for legal compliance. Proof-of-Inclusion must be mathematically derived by the auditing party using standard SHA-256 validation libraries against the public endpoints provided. By requiring cryptographic proof rather than trusting our database outputs, we maintain the trustless integrity of the system. If you cannot calculate the Merkle proof, you do not possess the clearance to audit the system.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 8 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">08</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Dispute Resolution & Cryptographic Jurisdiction</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    Given the decentralized, open-source, and stateless global nature of the Sovereign Master Node infrastructure, traditional terrestrial jurisdictional boundaries are secondary to cryptographic immutability. The code is the ultimate arbiter of truth. 
                                </p>
                                <p>
                                    However, any legal disputes arising from the misuse of this interface—specifically pertaining to intellectual property theft, API exploitation, or distributed denial of service (DDoS) attacks against our localized infrastructure endpoints—will be aggressively prosecuted in the appropriate terrestrial jurisdictions. The operator explicitly, knowingly, and irrevocably waives any right to participate in a class action lawsuit, class-wide arbitration, or multi-party litigation against the creators, maintainers, or hosting providers of the Terminal.
                                </p>
                            </div>
                        </div>
                    </section>
                    
                    {/* SECTION 9 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">09</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Finality of Protocol Modification</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    We reserve the absolute right to modify, amend, rewrite, or entirely deprecate these Terms of Sovereign Operation at any moment, without prior broadcast, consent, or consultation. The continued use of the Terminal, the WebSocket connections, or the Smart Contract ABIs after the deployment of modified Terms constitutes an unconditional acceptance of the new cryptographic parameters.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-40 pt-16 border-t border-black/10">
                    <Globe className="mb-6 text-black/20" size={48} />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-center text-black/40">
                        Sovereign Master Node · Legal Compendium L-1 · Absolute Finality
                    </p>
                </div>
            </div>
        </div>
    );
}
