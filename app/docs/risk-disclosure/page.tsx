import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function RiskDisclosurePage() {
    return (
        <div className="min-h-screen bg-transparent text-[#050505] selection:bg-black selection:text-white font-sans">
            <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#888888] hover:text-[#050505] transition-colors mb-16">
                    <ArrowLeft size={14} /> Return to Network
                </Link>

                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-black text-white rounded-xl">
                            <AlertTriangle size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888]">Legal Framework</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                        Risk <span className="text-[#888888]">Disclosure</span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">Last Updated: Q2 2026</p>
                </header>

                <div className="space-y-12 text-sm leading-relaxed text-[#555555]">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">1. High-Volatility Warning</h2>
                        <p className="mb-4">
                            Cryptographic assets and on-chain liquidity metrics are hyper-volatile. Whale tracking, meme-pool analytics, and mempool radar intelligence do not guarantee future trajectory. Absolute loss of capital is a statistically probable outcome when trading on-chain.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">2. Technological Obsolescence</h2>
                        <p className="mb-4">
                            Smart contracts present inherent risks of zero-day exploits, logical vulnerabilities, and consensus collapse. The Sovereign Terminal visualizes the blockchain topography; it cannot insure or recover burnt tokens resulting from decentralized protocol failure.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">3. Oracle Desync</h2>
                        <p className="mb-4">
                            Data ingested from RPC pools or third-party indexes natively suffers from theoretical latency or node forks. While Sovereign Intelligence utilizes multi-endpoint redundancy, false positives related to massive entity clustering can occur. You deploy capital entirely at your discretion.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
