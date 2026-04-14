"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LifeBuoy, MessageCircle, ChevronDown, ChevronUp, Clock, Send
} from 'lucide-react';
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
        <div className="flex flex-col space-y-6 p-6">
            {/* ── Header ── */}
            <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Support Center</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Institutional support pipeline · Average response &lt; 4h
                </p>
            </div>

            {/* ── Status Banner ── */}
            <div className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(0,192,118,0.08)', border: '1px solid rgba(0,192,118,0.2)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,192,118,0.15)' }}>
                    <LifeBuoy size={20} style={{ color: '#00C076' }}/>
                </div>
                <div>
                    <div className="font-black text-white text-sm uppercase tracking-tight">Support Center Online</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Sub-15ms resolution triage · 24/7 coverage</div>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00C076' }}/>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00C076' }}>Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* ── New Ticket Form ── */}
                <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                        <MessageCircle size={11} style={{ color: 'rgba(255,255,255,0.4)' }}/>
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] font-black" style={{ color: 'rgba(255,255,255,0.4)' }}>Protocol Request</span>
                    </div>
                    <div className="p-5 space-y-4">
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] font-black block mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Subject</label>
                            <input value={subject} onChange={e => setSubject(e.target.value)}
                                placeholder="Classification of inquiry…"
                                className="w-full rounded-xl px-4 py-3 text-[11px] font-mono text-white outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] font-black block mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Priority Tier</label>
                            <div className="flex gap-2">
                                {(['Low','Medium','High'] as const).map(p => (
                                    <button key={p} onClick={() => setPriority(p)}
                                        className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        style={{
                                            background: priority === p ? '#fff' : 'rgba(255,255,255,0.04)',
                                            color: priority === p ? '#0B0E11' : 'rgba(255,255,255,0.4)',
                                            border: priority === p ? '1px solid #fff' : '1px solid rgba(255,255,255,0.08)',
                                        }}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="font-mono text-[9px] uppercase tracking-[0.2em] font-black block mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Metadata Report</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                                placeholder="Provide high-fidelity details concerning the operational anomaly…"
                                className="w-full rounded-xl px-4 py-3 text-[11px] font-mono text-white outline-none resize-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                        </div>
                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] text-black transition-all hover:scale-[1.02] disabled:opacity-50"
                            style={{ background: '#fff', boxShadow: '0 8px 24px rgba(255,255,255,0.1)' }}>
                            {submitting ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : <Send size={14}/>}
                            Dispatch Ticket
                        </button>
                    </div>
                </div>

                {/* ── Right: Tickets + FAQ ── */}
                <div className="flex flex-col gap-4">
                    {/* Active tickets */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] font-black" style={{ color: 'rgba(255,255,255,0.4)' }}>Active Comm-Links</span>
                            <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{tickets.length} session(s)</span>
                        </div>
                        <div>
                            {ticketsLoading ? (
                                <div className="py-12 text-center font-mono text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Awaiting data fetch…</div>
                            ) : tickets.length === 0 ? (
                                <div className="py-12 text-center font-mono text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>No previous comms established.</div>
                            ) : tickets.map((t, i) => (
                                <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                                    className="px-5 py-4 hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>#{t.id}</span>
                                                <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase"
                                                    style={{ background: (PRIORITY_COLORS[t.priority.toLowerCase()] || '#888') + '18', color: PRIORITY_COLORS[t.priority.toLowerCase()] || '#888', border: `1px solid ${(PRIORITY_COLORS[t.priority.toLowerCase()] || '#888')}30` }}>
                                                    {t.priority}
                                                </span>
                                            </div>
                                            <p className="text-[12px] font-black text-white uppercase tracking-tight mb-1">{t.subject}</p>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={9} style={{ color: 'rgba(255,255,255,0.3)' }}/>
                                                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Sync: {t.lastReply}</span>
                                            </div>
                                        </div>
                                        <span className="text-[8px] px-2.5 py-1 rounded-full font-black uppercase shrink-0 text-white" style={{ background: STATUS_COLORS[t.status] }}>
                                            {t.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                            <span className="font-mono text-[9px] uppercase tracking-[0.25em] font-black" style={{ color: 'rgba(255,255,255,0.4)' }}>Protocol FAQ</span>
                        </div>
                        <div>
                            {FAQ.map((faq, i) => (
                                <div key={i} className="cursor-pointer hover:bg-white/[0.02] transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="px-5 py-4 flex items-center justify-between gap-3">
                                        <span className="text-[12px] font-black text-white uppercase tracking-tight leading-snug">{faq.q}</span>
                                        {openFaq === i ? <ChevronUp size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink:0 }}/> : <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.3)', flexShrink:0 }}/>}
                                    </div>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-5 pb-4">
                                                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{faq.a}</p>
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
