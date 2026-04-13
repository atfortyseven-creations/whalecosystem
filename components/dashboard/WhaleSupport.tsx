"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LifeBuoy, MessageCircle, Mail, ExternalLink,
    ChevronDown, ChevronUp, Clock, CheckCircle,
    Zap, Shield, Phone, Book, Send
} from 'lucide-react';
import { toast } from 'sonner';
import ScrollFloat from '@/components/ui/ScrollFloat';

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
        a: 'Click "Connect Wallet" on the top navigation bar. We support MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, and Rainbow Wallet. Once connected your on-chain portfolio will auto-sync.',
    },
    {
        q: 'What is the Gold Ticket and how do I claim it?',
        a: 'The Gold Ticket is a one-time NFT-based access pass that grants lifetime Whale Network access. Navigate to the "Gold Ticket" section in the sidebar to check eligibility and claim. A $5/month subscription is required to maintain API access.',
    },
];

const STATUS_COLORS: Record<string, string> = {
    'Open':        '#0052FF',
    'In Progress': '#FF9500',
    'Resolved':    '#00C076',
};

const PRIORITY_COLORS: Record<string, string> = {
    low:      '#888888',
    medium:   '#FF9500',
    high:     '#FF3B30',
    critical: '#9945FF',
};

export function WhaleSupport() {
    const [openFaq, setOpenFaq]     = useState<number | null>(null);
    const [subject, setSubject]     = useState('');
    const [message, setMessage]     = useState('');
    const [priority, setPriority]   = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [submitting, setSubmitting] = useState(false);
    const [tickets, setTickets]     = useState<Ticket[]>([]);
    const [ticketsLoading, setTicketsLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await fetch('/api/support/tickets');
                if (res.ok) {
                    const data = await res.json();
                    setTickets(data.tickets || []);
                }
            } catch {
            } finally {
                setTicketsLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const handleSubmit = async () => {
        if (!subject || !message) { toast.error('Please fill in subject and message'); return; }
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
                toast.success('Professional ticket dispatched securely to HQ ✓');
                setSubject(''); setMessage('');
            } else {
                toast.error('Failed to dispatch ticket. Neural network busy.');
            }
        } catch (e) {
            toast.error('Terminal connection error.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col space-y-8">
            {/* ── Legendary Header ── */}
            <div className="px-2">
                <ScrollFloat 
                    textClassName="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-[#050505]"
                    animationDuration={1}
                    stagger={0.03}
                >
                    Sovereign HQ
                </ScrollFloat>
                <div className="flex items-center gap-2 mt-2 opacity-40">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#050505] animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Institutional Support Pipeline Active</span>
                </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#050505] flex items-center justify-center">
                        <LifeBuoy size={26} className="text-white"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-[#050505] uppercase tracking-tighter">Support Center</h2>
                        <p className="text-[10px] uppercase font-bold text-[#888888] tracking-widest mt-1">Average response: under 4 hours · Sub-15ms resolution triage</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── New Ticket Form ── */}
                <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm">
                    <h3 className="text-[11px] font-black text-[#050505] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                        <MessageCircle size={16}/> Protocol Request
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-2 block">Subject</label>
                            <input value={subject} onChange={e => setSubject(e.target.value)}
                                placeholder="Classification of inquiry…"
                                className="w-full border border-[#E5E5E5] rounded-2xl px-5 py-3 text-[11px] font-mono text-[#050505] outline-none focus:border-[#050505] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-2 block">Priority Tier</label>
                            <div className="flex gap-2">
                                {(['Low','Medium','High'] as const).map(p => (
                                    <button key={p} onClick={() => setPriority(p)}
                                        className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${priority === p ? 'bg-[#050505] text-white border-[#050505] shadow-lg shadow-black/10' : 'text-[#888888] border-[#E5E5E5] hover:border-[#888888]'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-2 block">Metadata Report</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={6}
                                placeholder="Provide high-fidelity details concerning the operational anomaly…"
                                className="w-full border border-[#E5E5E5] rounded-2xl px-5 py-4 text-[11px] font-mono text-[#050505] outline-none focus:border-[#050505] resize-none transition-all"
                            />
                        </div>
                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-[#050505] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all shadow-xl shadow-black/10">
                            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Send size={16}/>}
                            Dispatch Ticket
                        </button>
                    </div>
                </div>

                {/* ── Right column: Tickets + FAQ ── */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between">
                            <span className="text-[11px] font-black text-[#050505] uppercase tracking-[0.2em]">Active Comm-Links</span>
                            <span className="text-[10px] font-mono font-bold text-[#888888] uppercase tracking-widest">{tickets.length} session(s)</span>
                        </div>
                        <div className="divide-y divide-[#F0F0F0]">
                            {ticketsLoading ? (
                                <div className="py-20 text-center text-[10px] font-mono text-[#888888] uppercase tracking-widest">Awaiting data fetch…</div>
                            ) : tickets.length === 0 ? (
                                <div className="py-20 text-center text-[10px] font-mono text-[#888888] uppercase tracking-widest">No previous comms established.</div>
                            ) : tickets.map((t, i) => (
                                <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                                    className="px-8 py-5 hover:bg-[#FAF9F6] transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black text-[#888888] font-mono uppercase tracking-widest">ID: {t.id}</span>
                                                <span className="text-[8px] px-2 py-0.5 rounded-full font-black uppercase border"
                                                    style={{ background: (PRIORITY_COLORS[t.priority.toLowerCase()] || '#888') + '10', color: PRIORITY_COLORS[t.priority.toLowerCase()] || '#888', borderColor: (PRIORITY_COLORS[t.priority.toLowerCase()] || '#888') + '30' }}>
                                                    {t.priority}
                                                </span>
                                            </div>
                                            <p className="text-[12px] font-black text-[#050505] tracking-tight mb-2 uppercase">{t.subject}</p>
                                            <div className="flex items-center gap-2">
                                                <Clock size={10} className="text-[#888888]"/>
                                                <span className="text-[9px] text-[#888888] uppercase font-bold tracking-wider">Sync: {t.lastReply}</span>
                                            </div>
                                        </div>
                                        <span className="text-[8px] px-3 py-1.5 rounded-full font-black uppercase shrink-0 text-white shadow-lg" style={{ background: STATUS_COLORS[t.status], boxShadow: `0 4px 12px ${STATUS_COLORS[t.status]}40` }}>
                                            {t.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm">
                        <div className="px-8 py-5 border-b border-[#E5E5E5] bg-[#FAF9F6]">
                            <span className="text-[11px] font-black text-[#050505] uppercase tracking-[0.2em] flex items-center gap-2">Protocol FAQ</span>
                        </div>
                        <div className="divide-y divide-[#F0F0F0]">
                            {FAQ.map((faq, i) => (
                                <div key={i} className="cursor-pointer hover:bg-[#FAF9F6] transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <div className="px-8 py-5 flex items-center justify-between gap-4">
                                        <span className="text-[11px] font-black text-[#050505] uppercase tracking-tight">{faq.q}</span>
                                        {openFaq === i ? <ChevronUp size={16} className="text-[#888888]"/> : <ChevronDown size={16} className="text-[#888888]"/>}
                                    </div>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-8 pb-6">
                                                <p className="text-[11px] text-[#888888] leading-relaxed uppercase font-bold tracking-widest">{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
