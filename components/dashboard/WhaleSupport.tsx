"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ChevronDown, ChevronUp, Send, CheckCircle, Zap, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { RemoteLottie } from '@/components/ui/RemoteLottie';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Ticket {
    id: string;
    subject: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    createdAt: string;
    lastReply: string;
}

type Priority = 'Low' | 'Medium' | 'High';

// ─── Constants ───────────────────────────────────────────────────────────────

const FAQ = [
    {
        q: 'How do I connect my wallet?',
        a: 'Click "Connect Wallet" on the top navigation bar. MetaMask, WalletConnect, Coinbase Wallet, and Google Auth are all supported via AppKit. Your on-chain portfolio auto-syncs on connection.',
    },
    {
        q: 'What is the Gold Ticket and how do I claim it?',
        a: 'The Gold Ticket is a one-time cryptographic access pass granting lifetime Whale Network clearance. Navigate to "Entity Registry" in the sidebar to check eligibility and claim your pass.',
    },
    {
        q: 'Can I use the platform on mobile?',
        a: 'Yes. Scan the QR code from the desktop landing page to sync your mobile wallet session in real-time. Full EVM signing capabilities are available via the AppKit Mobile Bridge.',
    },
    {
        q: 'How does the on-chain mempool intelligence work?',
        a: 'Our dedicated node mesh interfaces directly with the global mempool. Large transactions are intercepted and analyzed milliseconds after signing — before block confirmation — giving you a true pre-execution edge.',
    },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    'Open':        { bg: '#EFF6FF', text: '#0044CC' },
    'In Progress': { bg: '#FFF7ED', text: '#FF9500' },
    'Resolved':    { bg: '#F0FDF4', text: '#00A36C' },
};

const PRIORITY_COLORS: Record<string, string> = {
    low:      '#888888',
    medium:   '#FF9500',
    high:     '#FF3B30',
    critical: '#9945FF',
};

const FADE_UP: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
        opacity: 1, 
        y: 0, 
        transition: { 
            delay: i * 0.07, 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1] as any 
        } 
    }),
};

// ─── Component ───────────────────────────────────────────────────────────────

export function WhaleSupport() {
    const [openFaq, setOpenFaq]         = useState<number | null>(null);
    const [subject, setSubject]         = useState('');
    const [message, setMessage]         = useState('');
    const [priority, setPriority]       = useState<Priority>('Medium');
    const [submitting, setSubmitting]   = useState(false);
    const [submitted, setSubmitted]     = useState(false);
    const [tickets, setTickets]         = useState<Ticket[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('whale_support_tickets');
        if (stored) {
            try {
                setTickets(JSON.parse(stored));
            } catch (e) {}
        }
        setTicketsLoading(false);
    }, []);

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) {
            toast.error('Subject and message are required.');
            return;
        }
        setSubmitting(true);
        try {
            await new Promise(r => setTimeout(r, 600)); // Simulate processing delay
            const newTicket: Ticket = {
                id: Math.floor(Math.random() * 100000).toString(),
                subject,
                status: 'Open',
                priority,
                createdAt: new Date().toISOString(),
                lastReply: new Date().toISOString()
            };
            
            const updated = [newTicket, ...tickets];
            setTickets(updated);
            localStorage.setItem('whale_support_tickets', JSON.stringify(updated));
            
            setSubmitted(true);
            setSubject('');
            setMessage('');
            toast.success('Ticket dispatched to operations center.');
            setTimeout(() => setSubmitted(false), 4000);
        } catch {
            toast.error('System error. Please check your connection.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-full min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-6 pb-8">

            {/* ── Hero Header ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative rounded-[2rem] overflow-hidden bg-[#0a0a0a] text-white min-h-[220px] flex items-center px-10 py-10"
            >
                {/* Background lottie — decorative */}
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-30 pointer-events-none overflow-hidden">
                    <RemoteLottie
                        path="Connect.json"
                        className="w-full h-full object-contain scale-110"
                    />
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-10" />

                <div className="relative z-20 flex flex-col gap-3 max-w-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">Operations Center</span>
                    </div>
                    <h1 className="text-[32px] md:text-[42px] font-black uppercase tracking-tighter leading-none">
                        Operational<br />
                        <span className="text-white/30">Guard.</span>
                    </h1>
                    <p className="text-[13px] text-white/50 font-serif leading-relaxed max-w-sm">
                        Direct secure link to the tactical maintenance architecture. All transmissions are protocol-encrypted.
                    </p>
                </div>
            </motion.div>

            {/* ── Main Grid ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                {/* ── LEFT: Ticket Form (col-span-3) ──────────────────────── */}
                <motion.div
                    custom={0} initial="hidden" animate="visible" variants={FADE_UP}
                    className="lg:col-span-3 bg-white border border-black/5 rounded-[1.75rem] overflow-hidden shadow-sm"
                >
                    {/* Form header */}
                    <div className="px-6 py-5 border-b border-black/5 bg-[#FAFAF8] flex items-center gap-2.5">
                        <Lock size={12} className="text-[#0044CC]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a0a0a]">Dispatch Protocol Request</span>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Subject */}
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 block mb-2">Subject</label>
                            <input
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Classification of inquiry..."
                                className="w-full rounded-xl px-4 py-3.5 text-[12px] font-mono text-[#050505] bg-[#FAFAF8] border border-black/5 outline-none focus:border-[#0044CC] focus:ring-2 focus:ring-[#0044CC]/10 transition-all placeholder:text-black/20"
                            />
                        </div>

                        {/* Priority Tier */}
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 block mb-2">Priority Tier</label>
                            <div className="flex gap-2">
                                {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            priority === p
                                                ? 'bg-[#0a0a0a] text-white border-[#0a0a0a] shadow-md'
                                                : 'bg-[#FAFAF8] text-black/40 border-black/5 hover:border-black/20 hover:text-[#0a0a0a]'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/40 block mb-2">Message</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={5}
                                placeholder="Provide high-fidelity details concerning the operational anomaly..."
                                className="w-full rounded-xl px-4 py-3.5 text-[12px] font-mono text-[#050505] bg-[#FAFAF8] border border-black/5 outline-none focus:border-[#0044CC] focus:ring-2 focus:ring-[#0044CC]/10 resize-none transition-all placeholder:text-black/20"
                            />
                        </div>

                        {/* Submit */}
                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center justify-center gap-3 py-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700"
                                >
                                    <CheckCircle size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-wider">Ticket Dispatched Successfully</span>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="submit"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] bg-[#0a0a0a] text-white hover:bg-[#0044CC] transition-all disabled:opacity-50 shadow-lg shadow-black/10"
                                >
                                    {submitting
                                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        : <Send size={13} />
                                    }
                                    {submitting ? 'Dispatching...' : 'Dispatch Ticket'}
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* ── RIGHT: Tickets + Status (col-span-2) ────────────────── */}
                <div className="lg:col-span-2 flex flex-col gap-5">

                    {/* Active Tickets */}
                    <motion.div
                        custom={1} initial="hidden" animate="visible" variants={FADE_UP}
                        className="bg-white border border-black/5 rounded-[1.75rem] overflow-hidden shadow-sm"
                    >
                        <div className="px-5 py-4 border-b border-black/5 bg-[#FAFAF8] flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0a0a0a]">Active Comm-Links</span>
                            <span className="font-mono text-[9px] text-black/30">{tickets.length} session(s)</span>
                        </div>
                        <div className="divide-y divide-black/[0.04]">
                            {ticketsLoading ? (
                                <div className="py-10 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-black/10 border-t-[#0044CC] rounded-full animate-spin" />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="py-10 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-black/20">No active tickets</p>
                                </div>
                            ) : tickets.map((t, i) => {
                                const sc = STATUS_STYLES[t.status] || { bg: '#F5F5F5', text: '#888' };
                                return (
                                    <motion.div
                                        key={t.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="px-5 py-4 hover:bg-[#FAFAF8] transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-[8px] text-black/25">#{t.id}</span>
                                                    <span
                                                        className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase"
                                                        style={{ color: PRIORITY_COLORS[t.priority.toLowerCase()] || '#888', background: (PRIORITY_COLORS[t.priority.toLowerCase()] || '#888') + '18' }}
                                                    >
                                                        {t.priority}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-black text-[#0a0a0a] uppercase tracking-tight truncate mb-1">{t.subject}</p>
                                                <span className="text-[9px] text-black/30">Last sync: {t.lastReply}</span>
                                            </div>
                                            <span
                                                className="text-[8px] px-2.5 py-1 rounded-full font-black uppercase whitespace-nowrap shrink-0"
                                                style={{ background: sc.bg, color: sc.text }}
                                            >
                                                {t.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Lottie Status Card */}
                    <motion.div
                        custom={2} initial="hidden" animate="visible" variants={FADE_UP}
                        className="bg-[#0a0a0a] rounded-[1.75rem] overflow-hidden p-6 flex flex-col items-center gap-4 text-white relative"
                    >
                        <div className="w-full h-[160px] flex items-center justify-center">
                            <RemoteLottie
                                path="Business Analysis.json"
                                className="w-full h-full object-contain scale-110"
                            />
                        </div>
                        <div className="text-center space-y-1">
                            <div className="flex items-center justify-center gap-1.5 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">Systems Nominal</span>
                            </div>
                            <p className="text-[12px] font-black uppercase tracking-tight">Response SLA: 24h</p>
                            <p className="text-[10px] text-white/40 font-serif">All incidents are triaged by priority tier and addressed by the operations engineering team.</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ── FAQ ─────────────────────────────────────────────────────── */}
            <motion.div
                custom={3} initial="hidden" animate="visible" variants={FADE_UP}
                className="bg-white border border-black/5 rounded-[1.75rem] overflow-hidden shadow-sm"
            >
                <div className="px-6 py-5 border-b border-black/5 bg-[#FAFAF8] flex items-center gap-2.5">
                    <Zap size={11} className="text-[#0044CC]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0a0a0a]">Protocol FAQ</span>
                </div>
                <div className="divide-y divide-black/[0.04]">
                    {FAQ.map((faq, i) => (
                        <div
                            key={i}
                            className="cursor-pointer hover:bg-[#FAFAF8] transition-colors"
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        >
                            <div className="px-6 py-5 flex items-center justify-between gap-4">
                                <span className="text-[12px] font-black text-[#0a0a0a] uppercase tracking-tight leading-snug">{faq.q}</span>
                                <motion.div
                                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="shrink-0"
                                >
                                    <ChevronDown size={13} className="text-black/30" />
                                </motion.div>
                            </div>
                            <AnimatePresence>
                                {openFaq === i && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        className="overflow-hidden"
                                    >
                                        <p className="px-6 pb-5 text-[12px] text-black/50 leading-relaxed font-serif">{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </motion.div>

        </div>
    );
}
