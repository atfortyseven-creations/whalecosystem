import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Cookie } from 'lucide-react';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#050505] selection:bg-black selection:text-white font-sans">
            <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#888888] hover:text-[#050505] transition-colors mb-16">
                    <ArrowLeft size={14} /> Return to Network
                </Link>

                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-black text-white rounded-xl">
                            <Cookie size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888]">Legal Framework</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                        Cookie <span className="text-[#888888]">Policy</span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">Last Updated: Q2 2026</p>
                </header>

                <div className="space-y-12 text-sm leading-relaxed text-[#555555]">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">1. The State Object</h2>
                        <p className="mb-4">
                            Sovereign relies on deterministic HTTP-only cookies and cryptographic localized browser storage to ensure zero downtime between sessions. When you approve the "Initialize" sequence upon accessing the network, a core identity manifest is pinned to your local cache.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">2. Functional & Essential Arrays</h2>
                        <p className="mb-4">
                            These elements are immune to deactivation. They ensure your dashboard theme coordinates securely, your selected active networks do not glitch, and your cryptographic sessions remain anchored uniquely to your browser.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">3. Analytical Telemetry arrays</h2>
                        <p className="mb-4">
                            When verified, pingbacks are sent to Vercel/Railway performance grids purely to understand which RPC node endpoints might be creating bottlenecks. No IP-address correlation is constructed. You can toggle this explicitly out of your matrix parameters on the main landing footer.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
