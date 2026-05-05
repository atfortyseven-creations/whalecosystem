"use client";

import React from 'react';
import { Book, Code, Terminal, Database, Server, Hexagon, Layers, Activity, Lock, Globe } from 'lucide-react';

export default function DocsPage() {
    return (
        <div className="w-full overflow-x-hidden font-sans selection:bg-[#1a1a1a] selection:text-[#FAF9F6]" style={{ backgroundColor: "#FAF9F6", color: "#0A0A0A", minHeight: "100vh" }}>
            <div className="w-full max-w-[1200px] mx-auto pt-32 pb-40 px-6 lg:px-12 flex flex-col items-start">
                
                {/* ── TOPOGRAPHY ── */}
                <div style={{ color: "#0044CC" }} className="font-mono text-[10px] font-bold tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
                    <Book size={14} /> Master Node Documentation • Section D-1
                </div>
                
                <h1 style={{ fontFamily: "'Georgia', serif" }} className="text-5xl md:text-7xl font-normal tracking-tight leading-[1.05] mb-6 text-[#0A0A0A]">
                    Sovereign Technical Compendium
                </h1>
                
                <p className="font-mono text-sm mb-24 uppercase tracking-widest font-bold text-black/40">
                    Version 6.2.0 • Institutional Build
                </p>

                {/* ── CARDS ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-32">
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Terminal className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Core Architecture</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Understanding the Next.js Edge Runtime, Neo4j AuraDB integration, and the proprietary Wagmi/Viem transaction dispatchers.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Hexagon className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Smart Contracts</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            ABIs, deployed addresses, and functional specifications for the Golden Ticket NFT and the Akashic Ledger system.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Code className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">API Integration</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Interfacing with the Sovereign WebSocket endpoints, rate limits, and securing your REST payloads via cryptographic nonces.
                        </p>
                    </div>
                    <div className="bg-white border border-black/10 p-8 rounded-sm shadow-sm hover:shadow-md transition-shadow">
                        <Layers className="mb-6 text-black" size={24} strokeWidth={1.5} />
                        <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-black">Node Operations</h3>
                        <p className="text-xs font-mono leading-relaxed uppercase tracking-wide text-black/50">
                            Hardware requirements, Docker orchestration, and PM2 process management for deploying your own Master Node instance.
                        </p>
                    </div>
                </div>

                {/* ── SECTIONS ── */}
                <div className="flex flex-col gap-24 w-full max-w-[900px] mx-auto font-serif">
                    
                    {/* SECTION 1 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">01</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">System Architecture Overview</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The Sovereign Master Node is a full-stack, decentralized intelligence and execution platform. It transcends traditional dApp architectures by fusing an aggressive Next.js App Router (running strictly on Edge and Node.js primitives) with a deeply integrated Neo4j Graph Database for high-velocity data modeling.
                                </p>
                                <p>
                                    The client-side infrastructure leverages React Server Components to pre-render heavy cryptographic logic securely on the server, drastically reducing the JavaScript payload delivered to the client. Real-time DOM updates are handled by Framer Motion, ensuring mathematical fluidity at 60 frames per second, whilst global state is synchronized via Zustand combined with Wagmi's reactive hooks.
                                </p>
                                <p>
                                    This hybrid topology—where heavy computation occurs in the Vercel/Railway backend, and only deterministic rendering commands are dispatched to the client—ensures that the Terminal remains impenetrable, highly performant, and resistant to client-side memory exhaustion when processing millions of localized graph nodes.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">02</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">The Neo4j Akashic Ledger</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The intelligence capabilities of the Terminal are powered entirely by Neo4j AuraDB. Traditional relational databases (SQL) and document stores (NoSQL) fail catastrophically when attempting to model complex, multi-hop decentralized exchange routing, institutional wallet clustering, and recursive MEV extraction patterns.
                                </p>
                                <p>
                                    By utilizing Cypher query language over a native property graph, we can execute 5-hop pathfinding algorithms across millions of Ethereum addresses in single-digit milliseconds. The graph schema consists of `(:Wallet)`, `(:SmartContract)`, `(:Transaction)`, and `(:Token)` nodes connected by strongly typed edges such as `[:TRANSFERRED]`, `[:SWAPPED]`, and `[:VOTED]`.
                                </p>
                                <div className="p-6 my-8 bg-black/5 border border-black/10 rounded-sm">
                                    <p className="font-mono text-[13px] text-black/70">
                                        MATCH (w:Wallet)-[t:TRANSFERRED]-&gt;(sc:SmartContract)<br/>
                                        WHERE w.classification = 'WHALE' AND sc.protocol = 'UNISWAP_V3'<br/>
                                        RETURN w, t, sc LIMIT 100;
                                    </p>
                                </div>
                                <p>
                                    This infrastructure allows the Sovereign Master Node to visualize institutional liquidity flows in real-time, effectively creating a "Dark Forest Radar" for the mempool.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">03</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Cryptographic Authentication (SIWE)</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The Terminal rejects traditional username/password paradigms. All authentication is exclusively managed through EIP-4361: Sign-In with Ethereum (SIWE). When an operator initiates a connection, the server generates a cryptographically secure nonce. The local wallet signs a standardized message containing this nonce, the URI, and a timestamp.
                                </p>
                                <p>
                                    Upon validation by the backend (using `viem/utils` to recover the signer's address from the ECSDA signature), an HttpOnly JSON Web Token (JWT) is minted. This token is bound to the specific Ethereum address and cannot be hijacked via cross-site scripting (XSS).
                                </p>
                                <p>
                                    This guarantees that interactions within the Terminal—such as deploying smart contracts, interacting with the Forum, or accessing Premium intelligence tiers—are irrevocably tethered to a verifiable on-chain identity without compromising absolute anonymity.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">04</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Golden Ticket & Sovereign Identity Contracts</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The protocol relies on several foundational smart contracts deployed on Base network (an Ethereum L2). The primary access-control mechanism is the <strong>Golden Ticket ERC-721 Contract</strong>. This non-fungible token grants perpetual, uncensorable access to the Premium Intelligence tiers of the Terminal.
                                </p>
                                <p>
                                    The smart contract implements a deterministic bonding curve for minting, meaning early institutional adopters secure access at a lower capital requirement. The contract also integrates ERC-2981 for on-chain royalty enforcement and leverages custom ReentrancyGuard modules to prevent vector attacks during minting phases.
                                </p>
                                <p>
                                    All contract ABIs (Application Binary Interfaces) and TypeChain bindings are stored locally in the `contracts/` directory, ensuring that the Terminal interacts with the blockchain using perfectly typed TypeScript interfaces, eliminating runtime decoding errors.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">05</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">Node Deployment & Self-Hosting</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    For institutional actors desiring absolute sovereignty, the Terminal can be deployed on proprietary bare-metal servers. The system is fully containerized using Docker, allowing for rapid orchestration via Docker Compose or Kubernetes.
                                </p>
                                <p>
                                    <strong>Hardware Prerequisites:</strong><br/>
                                    • Processing: Dedicated 8-Core CPU (Minimum)<br/>
                                    • Memory: 32GB ECC RAM (Required for local Neo4j instances)<br/>
                                    • Storage: 2TB NVMe SSD (For synchronized RPC nodes and graph persistence)<br/>
                                    • Network: 1Gbps Dedicated Uplink
                                </p>
                                <p>
                                    To deploy, administrators must configure the `.env` file with their specific Alchemy/Infura RPC endpoints, WalletConnect Cloud IDs, and Neo4j authentication credentials. Once configured, running the `start.sh` or `SovereignVault_RUN.bat` scripts will initialize the PM2 daemon or Docker containers, spinning up the Next.js runtime, the Redis cache, and the WebSocket servers concurrently.
                                </p>
                            </div>
                        </div>
                    </section>
                    
                    {/* SECTION 6 */}
                    <section className="flex flex-col md:flex-row gap-8 md:gap-16">
                        <div className="font-mono text-3xl md:text-5xl font-bold shrink-0 text-black/10">06</div>
                        <div>
                            <h2 className="text-3xl font-normal mb-8 text-black">API Limitations & WebSockets</h2>
                            <div className="space-y-6 text-[#1a1a1a] text-[18px] leading-[1.8] tracking-[0.01em]">
                                <p>
                                    The Terminal provides a robust internal API for data fetching, but external access is strictly throttled by the Web Application Firewall (WAF) outlined in the middleware. 
                                </p>
                                <p>
                                    Live market data and orderbook streams are delivered exclusively via secure WebSockets (WSS). Clients must initiate a handshake using an authorized session token. The WebSocket server (managed via custom Next.js route handlers and Socket.io) broadcasts incremental delta updates rather than full state objects, drastically reducing bandwidth consumption and ensuring ultra-low latency execution feedback.
                                </p>
                                <p>
                                    Unrecognized socket connections or connections failing the cryptographic heartbeat challenge are abruptly terminated without response.
                                </p>
                            </div>
                        </div>
                    </section>

                </div>

                {/* ── FOOTER MARK ── */}
                <div className="w-full flex flex-col items-center justify-center mt-40 pt-16 border-t border-black/10">
                    <Globe className="mb-6 text-black/20" size={48} />
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-center text-black/40">
                        Sovereign Master Node · Technical Documentation D-1
                    </p>
                </div>
            </div>
        </div>
    );
}
