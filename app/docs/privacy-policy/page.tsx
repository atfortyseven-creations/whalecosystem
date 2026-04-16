import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F6] text-[#050505] selection:bg-black selection:text-white font-sans">
            <div className="max-w-3xl mx-auto px-6 pt-16 pb-12">
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#888888] hover:text-[#050505] transition-colors mb-16">
                    <ArrowLeft size={14} /> Return to Network
                </Link>

                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-black text-white rounded-xl">
                            <ShieldCheck size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#888888]">Legal Framework</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-6">
                        Privacy <span className="text-[#888888]">Policy</span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#888888]">Last Updated: Q2 2026</p>
                </header>

                <div className="space-y-12 text-sm leading-relaxed text-[#555555]">
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">1. Data Sovereignty</h2>
                        <p className="mb-4">
                            The Sovereign Protocol strictly operates on localized logic. On-chain addresses, wallet signatures, and institutional network tracing queries are executed directly on your client or through encrypted RPC nodes. We do not maintain unencrypted persistence of your personal portfolio identifiers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">2. Telemetry and Analytics</h2>
                        <p className="mb-4">
                            To maintain the high-frequency institutional feed, our edge servers analyze degraded network states and synthetic performance metrics. This telemetry is mathematically anonymized. By running the Terminal, you consent strictly to infrastructure-level tracking for bandwidth alignment and API rate optimization.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">3. Local Wallet Generation (Zero-Knowledge)</h2>
                        <p className="mb-4">
                            Any Vault or "Cold Storage" entities generated via the Sovereign Interface are compiled strictly on the client hardware. Private keys are never transmitted. The cryptographic seed extraction remains the sole responsibility of the hardware operator. 
                        </p>
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-black uppercase tracking-tight text-[#050505] mb-4">4. Cookie & Local Storage Compliance</h2>
                        <p className="mb-4">
                            Our architecture relies heavily on browser-native storage (IndexedDB, LocalStorage, HTTP-Only Cookies) to preserve the state of your Intelligence Graphs and Dashboard Matrix. You maintain full authority to purge this data via your browser settings or our Privacy Module.
                        </p>
                        <Link href="/docs/cookie-policy" className="text-[#050505] font-black underline uppercase tracking-widest text-[10px]">Review Cookie Policy</Link>
                    </section>
                </div>
            </div>
        </div>
    );
}
