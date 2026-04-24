"use client";

import React, { useState } from 'react';
import { BookOpen, Terminal, Database, ShieldCheck, Cpu, Globe, Search, Network, Workflow, Zap } from 'lucide-react';

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    
    return (
        <div 
            style={{ backgroundColor: "#FDFCF8", color: "#1a1a1a", minHeight: "100vh" }} 
            className="w-full overflow-x-hidden font-sans selection:bg-[#1a1a1a] selection:text-[#FDFCF8]"
        >
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#777" }} className="font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-8">
                    Architectural Treatise • Section D-1
                </div>
                
                <h1 
                    style={{ color: "#050505", fontFamily: "'Georgia', serif" }} 
                    className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.05] mb-6"
                >
                    Technical Specifications.
                </h1>
                
                <div className="flex items-center gap-6 mb-12">
                    <p style={{ color: "#555" }} className="font-mono text-sm uppercase tracking-widest m-0 font-bold">
                        Version: Sovereign Master Node 4.2.0
                    </p>
                    <a 
                        href="/developer" 
                        className="bg-[#1a1a1a] text-[#FDFCF8] font-mono text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-md hover:bg-[#333] transition-colors"
                    >
                        View Full Manifesto
                    </a>
                </div>

                {/* ── SEARCH BAR ── */}
                <div className="w-full max-w-2xl mb-24 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search the sovereign archives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#FFFFFF] border border-black/10 rounded-xl py-4 pl-12 pr-4 text-[#1a1a1a] font-mono text-sm focus:outline-none focus:border-black transition-colors shadow-sm"
                        style={{ outline: "none" }}
                    />
                    {searchQuery && (
                        <div className="absolute top-full mt-2 w-full bg-[#FFFFFF] border border-black/10 rounded-xl p-4 z-10 text-sm text-[#555] font-mono shadow-lg">
                            Press Enter to query the Akashic Ledger for &quot;{searchQuery}&quot;...
                        </div>
                    )}
                </div>

                {/* ── MODULE CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-24">
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Terminal style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">EVM Ingestion Layer</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            WebSockets bound to multi-rpc clusters, extracting blocks asynchronously with Archive Node escalation fallbacks.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Database style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Akashic State Engine</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            PostgreSQL coupled with Prisma ORM. Topologies persisted with zero latency and secured by Merkle Tree proofs.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Network style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Neo4j Cypher Graph</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Mass Transfer 3-Hop heuristic engine linking decentralized liquidity pools to isolated cold storage matrices.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Zap style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Chaos Monkey Protocol</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Active circuit breakers testing RPC resiliency through injected Redis latency and forced memory dropouts.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <ShieldCheck style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">MEV Flashbots Shield</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Absolute Sovereignty via Private Mempool routing, establishing total resistance against sandwich and front-running attacks.
                        </p>
                    </div>
                    <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0, 0, 0, 0.08)" }} className="p-8 rounded-2xl shadow-sm">
                        <Workflow style={{ color: "#1a1a1a" }} size={24} strokeWidth={1.5} className="mb-6" />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight">Zero-Mock Architecture</h3>
                        <p style={{ color: "#555" }} className="text-xs font-mono leading-relaxed uppercase tracking-wide">
                            Every component renders exclusively from live cryptographic states. Falsified fallback UI patterns have been eradicated.
                        </p>
                    </div>
                </div>

                {/* ── CORE TEXT SECTIONS ── */}
                <div className="flex flex-col gap-20 w-full max-w-4xl mx-auto">
                    
                    {/* SECTION 1 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            01.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Abstract Configuration & Zero-Mock Integrity
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed mb-4 text-justify">
                                The Whale Alert Network operates as a high-fidelity intelligence canvas structured via Next.js 15 and optimized through GPU-accelerated CSS rendering. State management transcends local buffers, securing the absolute mathematical coherence of the user's intelligence topology. 
                            </p>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Under the **Zero-Mock Mandate**, the entire infrastructure has been purged of simulated environments. The UI components (e.g., `VossSupremacyPanel.tsx`) natively handle empty states, displaying "NO INSTITUTIONAL CLEARANCES ISSUED" until authentic, real-time data is actively ingested from the blockchain. The interface strictly reflects cryptographic reality.
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
                                Event Synthesis & Archive Node Escalation
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed mb-6 text-justify">
                                Blockchain interactions contain immense stochastic noise. Our algorithm filters transactional artifacts through conditional heuristics (Z-score variations, liquidity pool drain signatures) allowing only empirically significant "Whale Events" to penetrate the visualization layer. The `ResilientProvider` architecture multiplexes RPC calls, and crucially, intercepts "missing trie node" errors to dynamically route historical queries to deep-state Archive Nodes, preventing indexer stalls.
                            </p>
                            <div style={{ backgroundColor: "#F5F3EC", borderLeft: "4px solid #1a1a1a" }} className="p-6 rounded-lg font-mono text-xs overflow-x-auto text-[#333]">
                                <code>
                                    <span style={{ color: "#000", fontWeight: "bold" }}>import</span> {'{ BlockchainListener }'} <span style={{ color: "#000", fontWeight: "bold" }}>from</span> <span style={{ color: "#555" }}>'@/lib/blockchain/ingestion'</span>;<br/><br/>
                                    <span style={{ color: "#000", fontWeight: "bold" }}>const</span> filterNoise = (tx: Entity) =&gt; {'{'}<br/>
                                    &nbsp;&nbsp;<span style={{ color: "#000", fontWeight: "bold" }}>if</span> (tx.volume &lt; THRESHOLD) <span style={{ color: "#000", fontWeight: "bold" }}>return</span> <span style={{ color: "#555" }}>false</span>;<br/>
                                    &nbsp;&nbsp;<span style={{ color: "#000", fontWeight: "bold" }}>return</span> verifyMerkleProof(tx);<br/>
                                    {'};'}
                                </code>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            03.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Cryptographic Provenance (Merkle Trees)
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                The Akashic Ledger is continuously hashed using SHA-256 Merkle Tree cryptography (`lib/blockchain/merkle.ts`). This structure provides absolute, mathematically unforgeable Proofs-of-Inclusion. External intelligence auditors can mathematically verify that a specific Mass Transfer event was registered by the Sovereign Terminal without downloading the entire PostgreSQL database state.
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
                                Absolute Sovereignty (MEV Shield)
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                To protect protocol operations from malicious mempool actors, sensitive transactions executed by the Terminal are routed through Flashbots and Eden Private Mempools (`lib/blockchain/mev.ts`). This prevents block-builder sandwich attacks and front-running bots from extracting value from our administrative maneuvers, achieving true, absolute operational sovereignty.
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
                                Real-time Memory Topology & WebSocket Architecture
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed mb-6 text-justify">
                                The Sovereign Terminal abandons traditional REST polling mechanics in favor of a full-duplex WebSocket architecture binding the EVM ingestion workers directly to the client's React Virtual DOM. This `Memory Topology` bypasses standard database disk-write latency, pushing state changes directly from the `BlockchainListener` memory buffer to the frontend at sub-15ms intervals. PostgreSQL acts strictly as a persistent ledger for historical queries, never as a middleman for real-time telemetry.
                            </p>
                            <div style={{ backgroundColor: "#F5F3EC", borderLeft: "4px solid #1a1a1a" }} className="p-6 rounded-lg font-mono text-xs overflow-x-auto text-[#333]">
                                <code>
                                    <span style={{ color: "#000", fontWeight: "bold" }}>// Real-time Event Broadcaster (whale-worker.ts)</span><br/><br/>
                                    <span style={{ color: "#000", fontWeight: "bold" }}>const</span> wsClients = <span style={{ color: "#000", fontWeight: "bold" }}>new</span> Set&lt;WebSocket&gt;();<br/>
                                    <span style={{ color: "#000", fontWeight: "bold" }}>export function</span> broadcast(event: SovereignEvent) {'{'}<br/>
                                    &nbsp;&nbsp;<span style={{ color: "#000", fontWeight: "bold" }}>const</span> payload = JSON.stringify(event);<br/>
                                    &nbsp;&nbsp;wsClients.forEach((client) =&gt; {'{'}<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "#000", fontWeight: "bold" }}>if</span> (client.readyState === WebSocket.OPEN) client.send(payload);<br/>
                                    &nbsp;&nbsp;{'}'});<br/>
                                    {'}'}
                                </code>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6 */}
                    <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                        <div style={{ color: "#ccc" }} className="font-mono text-3xl md:text-4xl font-bold shrink-0">
                            06.
                        </div>
                        <div>
                            <h2 style={{ fontFamily: "'Georgia', serif" }} className="text-3xl font-normal mb-6">
                                Heuristic API Limiting & Threat Mitigation
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                Our API edge nodes (`app/api/`) implement mathematically rigorous heuristic rate limiting backed by Redis volatile memory. Rather than simply enforcing static limits per IP, the system analyzes the *velocity* and *breadth* of the request footprint. If a single IP subnet requests `Golden Ticket` claims for multiple distinct wallet addresses within a condensed temporal window, the Neo4j Sybil detection algorithm classifies the node as a threat and enforces a strict, unappealable 3600-second ban across the entire Redis cluster.
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
                                Deployment Pipeline & Infrastructure Resilience
                            </h2>
                            <p style={{ color: "#333", fontSize: "1.05rem" }} className="font-serif leading-relaxed text-justify">
                                The Sovereign Terminal is packaged and deployed via a highly optimized 5-stage Dockerfile pipeline, executing strictly on Railway's institutional infrastructure. The build phase entirely excludes development dependencies (`npm ci --only=production`), utilizes `Next.js standalone` output mode to drastically minimize image weight, and employs PM2 cluster mode to dynamically load-balance incoming telemetry across available CPU cores. This guarantees maximum horizontal scalability under severe duress.
                            </p>
                        </div>
                    </section>

                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-32 pt-16 border-t border-black/10">
                    <Globe style={{ color: "#1a1a1a", opacity: 0.2 }} size={48} className="mb-6" />
                    <p style={{ color: "#777" }} className="font-mono text-xs uppercase tracking-[0.2em] font-bold text-center">
                        Sovereign Master Node · Core Infrastructure
                    </p>
                </div>
            </div>
        </div>
    );
}
