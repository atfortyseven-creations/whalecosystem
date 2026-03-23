"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Shield, Zap, Globe, Cpu, Twitter, Smartphone, Laptop, Activity, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { InstitutionalHeader } from '@/components/shared/InstitutionalHeader';
import { CSSiPhoneFrame, CSSMacbookFrame } from '@/components/support/DeviceFrames';
export default function SupportPage() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                toast.success('Transmission Successful', { 
                    description: 'Intelligence core has received your dispatch.',
                });
                setForm({ name: '', email: '', message: '' });
            } else {
                toast.error('Transmission Failed', {
                    description: 'Network handshake unsuccessful.'
                });
            }
        } catch {
            toast.error('Handshake Timeout');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-[var(--aztec-ink)] font-sans relative overflow-hidden">
            
            {/* Ambient Lighting */}
            <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(212,255,40,0.08),transparent_70%)] pointer-events-none" />
            <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(255,45,244,0.05),transparent_70%)] pointer-events-none" />

            <div className="relative z-10 w-full max-w-[2560px] mx-auto min-h-screen flex flex-col">

                <main className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-32">
                    {/* Header Removed */}
                    <h1 className="font-aztec-h1 text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.85] tracking-tight text-[var(--aztec-ink)] mb-10 uppercase italic">
                        Support <br/> <span className="text-[var(--aztec-orchid)]">Assistance</span>.
                    </h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
                    {/* Propaganda Section: iPhone */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                        className="relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--aztec-orchid)]/20 to-transparent blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative">
                            <CSSiPhoneFrame />
                            <div className="absolute -bottom-10 -right-4 bg-[var(--aztec-parchment)] p-8 border border-[var(--aztec-ink)]/10 shadow-2xl max-w-xs transition-transform hover:scale-105 z-40">
                                <Smartphone className="text-[var(--aztec-orchid)] mb-4" size={32} />
                                <h3 className="font-aztec-h1 text-xl font-black text-[var(--aztec-ink)] uppercase mb-2 italic tracking-tighter leading-none">Mobile Dominance</h3>
                                <p className="font-aztec-body text-[11px] text-[var(--aztec-ink)]/70 leading-relaxed uppercase tracking-wider font-bold">
                                    Our interface is perfectly optimized for the iPhone 16 Pro Max, delivering zero-latency forensic intelligence directly to your pocket.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                        className="bg-white/40 border border-black/5 backdrop-blur-3xl p-12 lg:p-16 relative overflow-hidden shadow-2xl glitch-hover"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--aztec-chartreuse)]/5 blur-3xl" />
                        
                        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="font-aztec-mono text-[10px] uppercase font-black tracking-[0.4em] text-[var(--aztec-ink)]/40 block border-l-2 border-[var(--aztec-chartreuse)] pl-4">FULL NAME</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        className="w-full bg-black/5 border border-black/5 px-8 py-5 text-[var(--aztec-ink)] font-aztec-mono text-[11px] uppercase tracking-widest outline-none focus:border-[var(--aztec-chartreuse)] transition-all placeholder:text-[var(--aztec-ink)]/20"
                                        placeholder="ENTER YOUR NAME"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="font-aztec-mono text-[10px] uppercase font-black tracking-[0.4em] text-[var(--aztec-ink)]/40 block border-l-2 border-[var(--aztec-orchid)] pl-4">EMAIL ADDRESS</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        className="w-full bg-black/5 border border-black/5 px-8 py-5 text-[var(--aztec-ink)] font-aztec-mono text-[11px] uppercase tracking-widest outline-none focus:border-[var(--aztec-orchid)] transition-all placeholder:text-[var(--aztec-ink)]/20"
                                        placeholder="ENTER YOUR EMAIL"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="font-aztec-mono text-[10px] uppercase font-black tracking-[0.4em] text-[var(--aztec-ink)]/40 block border-l-2 border-black/10 pl-4">MESSAGE</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={form.message}
                                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                        className="w-full bg-black/5 border border-black/5 px-8 py-5 text-[var(--aztec-ink)] font-aztec-mono text-[11px] uppercase tracking-widest outline-none focus:border-[var(--aztec-ink)] transition-all placeholder:text-[var(--aztec-ink)]/20 resize-none"
                                        placeholder="HOW CAN WE HELP?"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full py-6 bg-[var(--aztec-parchment)] text-[var(--aztec-ink)] font-aztec-mono font-black uppercase tracking-[0.5em] text-[10px] hover:bg-white active:scale-[0.98] transition-all disabled:opacity-30 shadow-2xl flex items-center justify-center gap-4 group"
                            >
                                <Send size={14} className={`transition-transform duration-500 ${isSending ? 'translate-x-12 opacity-0' : 'group-hover:translate-x-1'}`} />
                                {isSending ? 'TRANSMITTING...' : 'INITIATE SECURE DISPATCH'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Propaganda Section: MacBook */}
                <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                        className="space-y-8"
                    >
                        <h2 className="font-aztec-h1 text-4xl lg:text-7xl font-black text-[var(--aztec-ink)] uppercase italic tracking-tight leading-[0.85]">
                            Desktop <br/> <span className="text-[var(--aztec-chartreuse)]">Prowess</span>.
                        </h2>
                        <p className="font-aztec-body text-xl text-[var(--aztec-ink)]/50 leading-relaxed max-w-xl border-l-2 border-[var(--aztec-ink)]/10 pl-8">
                            The full power of the Whale Alert suite unleashed on MacBook Pro. Reconstruct L1/L2 callstacks, analyze dark-pool routing, and command the market with unparalleled precision.
                        </p>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center gap-4 text-[var(--aztec-chartreuse)] font-aztec-mono text-[10px] tracking-[0.4em] uppercase font-black">
                                <div className="p-2 bg-[var(--aztec-chartreuse)]/10"><Shield size={16} /></div> End-to-End Encryption
                            </div>
                            <div className="flex items-center gap-4 text-[var(--aztec-chartreuse)] font-aztec-mono text-[10px] tracking-[0.4em] uppercase font-black">
                                <div className="p-2 bg-[var(--aztec-chartreuse)]/10"><Zap size={16} /></div> Sub-Millisecond RPC Access
                            </div>
                        </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-l from-[var(--aztec-chartreuse)]/20 to-transparent blur-3xl opacity-20" />
                        <CSSMacbookFrame />
                    </motion.div>
                </div>

                {/* Twitter / Social Section */}
                <motion.section 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="p-16 lg:p-24 bg-[var(--aztec-parchment)] border border-[var(--aztec-ink)]/10 text-[var(--aztec-ink)] relative overflow-hidden flex flex-col items-center text-center shadow-2xl glitch-hover"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] scale-150 pointer-events-none text-[var(--aztec-ink)]">
                        <Twitter size={600} />
                    </div>
                    
                    <h2 className="font-aztec-h1 text-5xl lg:text-7xl font-black uppercase leading-tight mb-8 relative z-10 w-full tracking-tighter">
                        Propaganda <br/> <span className="italic text-[var(--aztec-orchid)]">Sovereignty</span>
                    </h2>
                    <p className="font-aztec-body text-xl lg:text-2xl text-[var(--aztec-ink)]/60 max-w-2xl mb-16 relative z-10 leading-relaxed italic font-medium px-4">
                        Real-time intelligence pulses on Twitter. Follow the flow, track the whales, and command the decentralized paradigm.
                    </p>
                    <a 
                        href="https://x.com/whalecosystem?s=20" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="relative z-10"
                    >
                        <button className="px-16 py-8 bg-[var(--aztec-ink)] text-[var(--aztec-chartreuse)] font-aztec-mono text-[12px] font-black uppercase tracking-[0.5em] hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex items-center gap-6">
                            <Twitter size={20} /> @whalecosystem
                        </button>
                    </a>
                </motion.section>

            </main>
            </div>
        </div>
    );
}


