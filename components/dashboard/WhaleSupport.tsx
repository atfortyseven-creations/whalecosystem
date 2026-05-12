"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, MessageCircle, ChevronDown, ChevronUp, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
    id: string;
    subject: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    createdAt: string;
    lastReply: string;
}

const FAQ = [
    {
        q: 'How do I connect my wallet to the platform?',
        a: 'Click "Connect Wallet" on the top navigation bar. We support MetaMask, WalletConnect, Coinbase Wallet, and Google Auth via AppKit. Once connected your on-chain portfolio will auto-sync.',
    },
    {
        q: 'What is the Gold Ticket and how do I claim it?',
        a: 'The Gold Ticket is a one-time cryptographic access pass that grants lifetime Whale Network clearance. Navigate to "Entity Registry" in the sidebar to check eligibility and claim.',
    },
    {
        q: 'Can I use the platform on mobile?',
        a: 'Yes. Scan the QR code from the landing page to sync your mobile wallet session. Full EVM signing capabilities are available via the AppKit Mobile Bridge.',
    },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    'Open':        { bg: '#EFF6FF', text: '#0052FF' },
    'In Progress': { bg: '#FFF7ED', text: '#FF9500' },
    'Resolved':    { bg: '#F0FDF4', text: '#00C076' },
};

const PRIORITY_COLORS: Record<string, string> = {
    low:      '#888888',
    medium:   '#FF9500',
    high:     '#FF3B30',
    critical: '#9945FF',
};

export function WhaleSupport() {
    const [openFaq, setOpenFaq]       = useState<number | null>(null);
    const [subject, setSubject]       = useState('');
    const [message, setMessage]       = useState('');
    const [priority, setPriority]     = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [submitting, setSubmitting] = useState(false);
    const [tickets, setTickets]       = useState<Ticket[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch('/api/support/tickets');
                if (res.ok) {
                    const data = await res.json();
                    setTickets(data.tickets || []);
                }
            } catch {} finally {
                setTicketsLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const handleSubmit = async () => {
        if (!subject || !message) { toast.error('Fill in subject and message'); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Whale Network User',
                    email: 'terminal@whalecosystem.com',
                    category: 'Support Ticket',
                    section: priority,
                    message: `[SUBJECT: ${subject}]\n\n${message}`
                })
            });
            if (res.ok) {
                toast.success('Ticket dispatched to HQ ✓');
                setSubject(''); setMessage('');
            } else {
                toast.error('Failed to dispatch. Try again.');
            }
        } catch {
            toast.error('Connection error.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-full min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-5 pb-4">

            {/* ── Header ── */}
            <div className="shrink-0 px-6 pt-5 pb-4 border-b border-[#E5E5E5] bg-white rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#050505]">
                            Operational Guard
                        </h1>
                    </div>
                    <p className="text-[10px] text-[#050505]/40 font-bold uppercase tracking-[0.2em] leading-tight">
                        Direct secure link to tactical maintenance architecture.
                    </p>
                </div>
                <div className="flex items-center gap-1.5 hidden md:flex" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── Ticket Form ── */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-[#F0F0F0] bg-[#FAF9F6] flex items-center gap-2">
                        <MessageCircle size={11} className="text-[#888888]" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888888]">Protocol Request</span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] block mb-1.5">Subject</label>
                            <input value={subject} onChange={e => setSubject(e.target.value)}
                                placeholder="Classification of inquiry..."
                                className="w-full rounded-xl px-4 py-3 text-[11px] font-mono text-[#050505] bg-[#FAF9F6] border border-[#E5E5E5] outline-none focus:border-[#050505] transition-all placeholder:text-[#CCCCCC]"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] block mb-1.5">Priority Tier</label>
                            <div className="flex gap-2">
                                {(['Low', 'Medium', 'High'] as const).map(p => (
                                    <button key={p} onClick={() => setPriority(p)}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                            priority === p
                                                ? 'bg-[#050505] text-white border-[#050505]'
                                                : 'bg-[#FAF9F6] text-[#888888] border-[#E5E5E5] hover:border-[#050505] hover:text-[#050505]'
                                        }`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] block mb-1.5">Message</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                                placeholder="Provide high-fidelity details concerning the operational anomaly..."
                                className="w-full rounded-xl px-4 py-3 text-[11px] font-mono text-[#050505] bg-[#FAF9F6] border border-[#E5E5E5] outline-none focus:border-[#050505] resize-none transition-all placeholder:text-[#CCCCCC]"
                            />
                        </div>
                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-[#050505] text-white hover:bg-[#333] transition-all disabled:opacity-50">
                            {submitting
                                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <Send size={13} />}
                            Dispatch Ticket
                        </button>
                    </div>
                </div>

                {/* ── Right: Tickets + FAQ ── */}
                <div className="flex flex-col gap-4">

                    {/* Active tickets */}
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-[#F0F0F0] bg-[#FAF9F6] flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888888]">Active Comm-Links</span>
                            <span className="text-[9px] font-mono text-[#CCCCCC]">{tickets.length} session(s)</span>
                        </div>
                        <div>
                            {ticketsLoading ? (
                                <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">Syncing...</div>
                            ) : tickets.length === 0 ? (
                                <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-[#CCCCCC]">No previous tickets.</div>
                            ) : tickets.map((t, i) => {
                                const sc = STATUS_COLORS[t.status] || { bg: '#F5F5F5', text: '#888888' };
                                return (
                                    <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                                        className="px-5 py-4 border-b border-[#F0F0F0] hover:bg-[#FAF9F6] transition-colors last:border-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-[9px] text-[#CCCCCC]">#{t.id}</span>
                                                    <span className="text-[8px] px-1.5 py-0.5 rounded font-black uppercase"
                                                        style={{ color: PRIORITY_COLORS[t.priority.toLowerCase()] || '#888', background: (PRIORITY_COLORS[t.priority.toLowerCase()] || '#888') + '15' }}>
                                                        {t.priority}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] font-black text-[#050505] uppercase tracking-tight mb-1">{t.subject}</p>
                                                <span className="text-[9px] text-[#888888]">Last sync: {t.lastReply}</span>
                                            </div>
                                            <span className="text-[8px] px-2.5 py-1 rounded-full font-black uppercase shrink-0 whitespace-nowrap"
                                                style={{ background: sc.bg, color: sc.text }}>
                                                {t.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-[#F0F0F0] bg-[#FAF9F6]">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888888]">Protocol FAQ</span>
                        </div>
                        {FAQ.map((faq, i) => (
                            <div key={i} className="cursor-pointer border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAF9F6] transition-colors"
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                <div className="px-5 py-4 flex items-center justify-between gap-3">
                                    <span className="text-[11px] font-black text-[#050505] uppercase tracking-tight leading-snug">{faq.q}</span>
                                    {openFaq === i
                                        ? <ChevronUp size={13} className="text-[#888888] shrink-0" />
                                        : <ChevronDown size={13} className="text-[#888888] shrink-0" />}
                                </div>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            className="px-5 pb-4">
                                            <p className="text-[11px] text-[#555555] leading-relaxed">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
