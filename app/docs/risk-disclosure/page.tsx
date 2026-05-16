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
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Legal Framework</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                        Risk <span className="text-black/20">Disclosure</span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-black/40">Last Updated: Q2 2026</p>
                </header>

                <div className="space-y-12 text-sm leading-relaxed text-black/60">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-black mb-4">1. Asset Volatility</h2>
                        <p className="mb-4">
                            Cryptographic assets and on-chain records are subject to market volatility. Data analytics and network intelligence do not guarantee future outcomes. Users should be aware of the inherent risks associated with decentralized protocols.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-black mb-4">2. Technological Risk</h2>
                        <p className="mb-4">
                            Smart contracts present inherent risks of exploits or protocol failure. The Whale Alert Network provides an infrastructure layer for record management; it does not provide insurance against decentralized protocol vulnerabilities.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-black mb-4">3. Data Integrity</h2>
                        <p className="mb-4">
                            Data ingested from decentralized sources may suffer from node latency or forks. While the network utilizes redundant endpoints to maintain accuracy, users should verify critical information through independent means.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
