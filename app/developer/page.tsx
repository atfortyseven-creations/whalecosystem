"use client";

import React from 'react';
import { Terminal, Code, Cpu, Network, Key, Shield, Zap, Globe, Database, Activity } from 'lucide-react';
import Link from 'next/link';

export default function DeveloperPage() {
    return (
        <div className="w-full overflow-x-hidden font-sans selection:bg-[#1a1a1a] selection:text-[#FAF9F6]" style={{ backgroundColor: "#FAF9F6", color: "#0A0A0A", minHeight: "100vh" }}>
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#0044CC" }} className="font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
                    <Terminal size={14} /> Developer Core • API & SDK • Section V-X
                </div>
                
                <h1 style={{ fontFamily: "'Georgia', serif" }} className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.05] mb-6 text-[#0A0A0A]">
                    Sovereign Developer API
                </h1>
                
                <p className="font-mono text-sm mb-24 uppercase tracking-widest font-bold text-black/40">
                    Integration Protocols • Edge Compute • WSS Streaming
                </p>

                {/* ── CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-32">
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Code className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">RESTful Engine</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            High-velocity, rate-limited REST endpoints for pulling topological graph structures and intelligence briefs.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Activity className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">WSS Market Firehose</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Direct WebSocket streams for sub-millisecond mempool updates, orderbook deltas, and institutional alerts.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Shield className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Cryptographic Auth</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Secure your API routes using ECDSA signatures. API keys are entirely deprecated in favor of mathematical proofs.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Cpu className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Golang SDK</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Build High-Frequency Trading (HFT) bots directly against our infrastructure using our highly optimized Go libraries.
                        </p>
                    </div>
                </div>

                {/* ── SECTIONS ── */}
                <div className="flex flex-col gap-24 w-full max-w-[900px] mx-auto font-serif">
                    
                    {/* SECTION 1 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">01</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Introduction to the Interface</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The Sovereign Developer ecosystem is engineered exclusively for quantitative analysts, institutional integrators, and elite algorithmic developers. We do not cater to consumer-level abstractions. Our API endpoints provide raw, unadulterated access to the Akashic Neo4j Engine and our private RPC node infrastructure.
                                </p>
                                <p>
                                    To interface with the Terminal programmatically, you must abandon traditional Web2 paradigms (such as OAuth2 or static API Keys). Access is strictly granted via SIWE (Sign-In with Ethereum) bearer tokens, establishing an unbroken cryptographic chain of custody from your private key to our load balancers.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">02</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Authentication via Cryptographic Signature</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    Before any endpoint can be queried, the developer must negotiate a session token. You must construct an EIP-4361 compliant message, sign it utilizing your secp256k1 private key, and POST it to our `/api/auth/verify` endpoint. 
                                </p>
                                <div className="p-6 my-8 bg-black/5 border border-black/10 rounded-sm">
                                    <p className="font-mono text-[12px] text-black/70 leading-relaxed">
                                        POST /api/auth/verify<br/><br/>
                                        {`{`}<br/>
                                        &nbsp;&nbsp;"message": "domain.com wants you to sign in...",<br/>
                                        &nbsp;&nbsp;"signature": "0x4b7f..."<br/>
                                        {`}`}
                                    </p>
                                </div>
                                <p>
                                    Upon successful cryptographic verification, the server will issue a short-lived JSON Web Token (JWT). This token must be passed in the `Authorization: Bearer` header for all subsequent REST and WebSocket requests.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">03</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">REST Query Engine (Graph Traversals)</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The REST API is utilized for historical data extraction and complex Neo4j Cypher querying. For example, developers can query the `/api/v1/graph/whales` endpoint to retrieve topological clusters of institutional liquidity spanning the last 72 hours.
                                </p>
                                <p>
                                    <strong>Rate Limiting:</strong> All REST endpoints are strictly governed by our Edge WAF and Upstash Redis rate limiters. Standard API limits are configured at 50 requests per 10-second sliding window. Elite tier members (verified via on-chain Golden Ticket ownership) receive 500 requests per second. Exceeding these limits will result in an immediate `HTTP 429 Too Many Requests` response, followed by temporary IP banishment upon repeated offenses.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">04</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">WSS Streaming Firehose</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    For High-Frequency Trading (HFT) and real-time dashboard integrations, the REST API is fundamentally insufficient due to HTTP overhead. Developers must establish a persistent WebSocket (WSS) connection to `wss://stream.sovereign-node.com`.
                                </p>
                                <p>
                                    Upon connection, you must immediately transmit an authentication payload containing your JWT. Once authenticated, you may subscribe to specific event topics, such as `mempool_pending`, `whale_transfer_confirmed`, or `polymarket_orderbook_delta`.
                                </p>
                                <div className="p-6 my-8 bg-[#0044CC]/5 border-l-4 border-[#0044CC] rounded-r-sm">
                                    <p className="font-mono text-[12px] text-black/80 leading-relaxed">
                                        // WSS Subscription Payload<br/>
                                        {`{`}<br/>
                                        &nbsp;&nbsp;"action": "SUBSCRIBE",<br/>
                                        &nbsp;&nbsp;"topic": "mempool_pending",<br/>
                                        &nbsp;&nbsp;"filters": {`{`} "min_value_eth": 100 {`}`}<br/>
                                        {`}`}
                                    </p>
                                </div>
                                <p>
                                    The WSS server broadcasts highly compressed binary representations of the graph nodes to minimize latency. Sub-millisecond parsing libraries are available in our official Go and Rust SDKs.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">05</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Official SDKs & Bot Architectures</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    While developers can interact with the API utilizing standard `fetch` or `Axios` libraries in JavaScript/TypeScript, we strongly advise against this for mission-critical trading algorithms due to Node.js garbage collection latency spikes.
                                </p>
                                <p>
                                    We maintain officially supported SDKs in <strong>Golang</strong> and <strong>Rust</strong>. These libraries come pre-configured with WebSocket reconnection logic, binary decoding protocols, and native integration with the `go-ethereum` (Geth) and `ethers-rs` libraries respectively. 
                                </p>
                                <p>
                                    Utilizing the official SDKs ensures that your architectural deployments remain synchronized with our backend upgrades, allowing you to focus entirely on algorithmic strategy formulation rather than infrastructural maintenance.
                                </p>
                            </div>
                        </div>
                    </section>
                    
                    {/* CTA to Advanced Docs */}
                    <div className="pt-16 mt-16 border-t border-black/10">
                        <Link href="/developers" className="inline-flex items-center gap-4 group">
                            <div className="w-12 h-12 bg-[#0A0A0A] rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Terminal size={18} className="text-[#FAF9F6]" />
                            </div>
                            <div>
                                <span className="block font-mono text-[10px] uppercase tracking-widest font-bold text-black/40 mb-1">Deep Dive</span>
                                <span className="block font-sans text-xl font-bold text-[#0044CC] group-hover:text-black transition-colors">Access the full Developer Portal →</span>
                            </div>
                        </Link>
                    </div>

                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-40 pt-16 border-t border-black/10">
                    <Globe className="mb-6 text-black/20" size={48} />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-center text-black/40">
                        Sovereign Master Node · Developer Ecosystem Hub
                    </p>
                </div>
            </div>
        </div>
    );
}
