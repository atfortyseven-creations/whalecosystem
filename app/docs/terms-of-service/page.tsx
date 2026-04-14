import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#050505] selection:bg-black selection:text-white font-sans">
            <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#888888] hover:text-[#050505] transition-colors mb-16">
                    <ArrowLeft size={14} /> Return to Network
                </Link>

                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-black text-white rounded-xl">
                            <BookOpen size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888]">Legal Framework</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                        Terms of <span className="text-[#888888]">Service</span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">Last Updated: Q2 2026</p>
                </header>

                <div className="space-y-12 text-sm leading-relaxed text-[#555555]">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">1. Network Admission</h2>
                        <p className="mb-4">
                            By authenticating your Web3 Identity or initiating Neural Network queries, you agree to interface with the Sovereign Ecosystem. Our application serves strictly as an informational lens covering decentralized infrastructure. 
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">2. Zero Execution Liability</h2>
                        <p className="mb-4">
                            We map liquidity flows, block topography, and massive entity associations. We do not provide financial advice, broker exchange operations, or custody capital. All bridge and swap features are peer-to-peer logic operating directly against deployed immutable contracts. Any capital decay resulting from slippage, front-running, or exploit is exclusively your liability.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">3. Termination of Node Access</h2>
                        <p className="mb-4">
                            Sovereign Whale infrastructure maintains the unconditional right to throttle or temporarily sever API routes (WebSocket connections, Intelligence Graphs) if abusive behaviors, scraping loops, or Denial-of-Service patterns are heuristically detected.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
