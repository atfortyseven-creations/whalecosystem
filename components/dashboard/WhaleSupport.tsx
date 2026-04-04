"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LifeBuoy, MessageCircle, Mail, ExternalLink,
    ChevronDown, ChevronUp, Clock, CheckCircle,
    Zap, Shield, Phone, Book, Send
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

const DEMO_TICKETS: Ticket[] = [
    { id: 'WHK-1042', subject: 'API key rate limit exceeded — need enterprise tier',    status: 'In Progress', priority: 'High',     createdAt: '2026-04-01', lastReply: '2026-04-03' },
    { id: 'WHK-1038', subject: 'Watchlist not saving across sessions',                  status: 'Resolved',    priority: 'Medium',   createdAt: '2026-03-28', lastReply: '2026-03-30' },
    { id: 'WHK-1031', subject: 'Request: Telegram bot integration for alerts',          status: 'Open',        priority: 'Low',      createdAt: '2026-03-22', lastReply: '2026-03-22' },
    { id: 'WHK-1019', subject: 'Gold Ticket claim not processing — payment stuck',      status: 'Resolved',    priority: 'Critical', createdAt: '2026-03-15', lastReply: '2026-03-16' },
];

const FAQ = [
    {
        q: 'How do I connect my wallet to the platform?',
        a: 'Click "Connect Wallet" on the top navigation bar. We support MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, and Rainbow Wallet. Once connected your on-chain portfolio will auto-sync.',
    },
    {
        q: 'What is the Gold Ticket and how do I claim it?',
        a: 'The Gold Ticket is a one-time NFT-based access pass that grants lifetime Sovereign tier access. Navigate to the "Gold Ticket" section in the sidebar to check eligibility and claim. A $5/month subscription is required to maintain API access.',
    },
    {
        q: 'Why is my Watchlist not showing market data?',
        a: 'Market data enrichment requires a valid session. If you see placeholders, try disconnecting and reconnecting your wallet. Demo data is shown for unauthenticated users.',
    },
    {
        q: 'How often does New Pairs data refresh?',
        a: 'New Pairs refreshes every 8 seconds with high-frequency polling across Ethereum, Solana, and Base chains. Security scores are computed with each refresh.',
    },
    {
        q: 'Can I set up Telegram notifications for Alerts?',
        a: 'Yes. Go to Alerts → New Alert → select "Telegram" as a notification channel. You will need to connect your Telegram account in Settings first.',
    },
    {
        q: 'What data sources power the platform?',
        a: 'We use Alchemy (on-chain), Binance (market data), DexScreener (DEX pairs), and DefiLlama (TVL + DeFi protocols) as our primary data sources. All enriched through our proprietary Neural Engine.',
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

    const handleSubmit = async () => {
        if (!subject || !message) { toast.error('Please fill in subject and message'); return; }
        setSubmitting(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Sovereign Whale',
                    email: 'terminal@whalecosystem.com',
                    category: 'Support Ticket',
                    section: priority,
                    message: `[SUBJECT: ${subject}]\n\n${message}`
                })
            });
            if (res.ok) {
                toast.success('Sovereign ticket dispatched securely to HQ ✓');
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
        <div className="flex flex-col space-y-6">
            {/* ── Header ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#050505] flex items-center justify-center">
                        <LifeBuoy size={22} className="text-white"/>
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-[#050505] uppercase tracking-widest">Whale Support Center</h2>
                        <p className="text-[10px] text-[#888888]">Average response time: under 4 hours · 24/7 for critical issues</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse"/>
                    <span className="text-[9px] font-black text-[#00C076] uppercase">Support Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── New Ticket Form ── */}
                <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-[10px] font-black text-[#050505] uppercase tracking-widest mb-5 flex items-center gap-2">
                        <MessageCircle size={14}/> Open a Ticket
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1 block">Subject</label>
                            <input value={subject} onChange={e => setSubject(e.target.value)}
                                placeholder="Describe your issue briefly…"
                                className="w-full border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-[11px] font-mono text-[#050505] outline-none focus:border-[#050505] transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1 block">Priority</label>
                            <div className="flex gap-2">
                                {(['Low','Medium','High'] as const).map(p => (
                                    <button key={p} onClick={() => setPriority(p)}
                                        className={`flex-1 py-2 rounded-lg border text-[9px] font-black uppercase transition-all ${priority === p ? 'bg-[#050505] text-white border-[#050505]' : 'text-[#888888] border-[#E5E5E5] hover:border-[#888888]'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-1 block">Message</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                                placeholder="Please describe your issue in detail, including any error messages you saw…"
                                className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[11px] font-mono text-[#050505] outline-none focus:border-[#050505] resize-none transition-all"
                            />
                        </div>
                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#050505] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#050505]/85 disabled:opacity-50 transition-all">
                            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Send size={14}/>}
                            Submit Ticket
                        </button>
                    </div>

                    {/* Contact methods */}
                    <div className="mt-5 pt-5 border-t border-[#E5E5E5] space-y-3">
                        <p className="text-[9px] font-black text-[#888888] uppercase tracking-widest mb-3">Other channels</p>
                        {[
                            { icon: <Mail size={14}/>,     label: 'support@whalecosystem.com', sub: 'Response within 24h',    href: 'mailto:support@whalecosystem.com' },
                            { icon: <MessageCircle size={14}/>, label: 'Telegram Community',  sub: '@WhaleCosystemSupport',  href: 'https://t.me/whalecosystem' },
                        ].map((c, i) => (
                            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl hover:bg-[#E5E5E5]/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-[#888888]">{c.icon}</span>
                                    <div>
                                        <div className="text-[10px] font-black text-[#050505]">{c.label}</div>
                                        <div className="text-[8px] text-[#888888]">{c.sub}</div>
                                    </div>
                                </div>
                                <ExternalLink size={11} className="text-[#888888]"/>
                            </a>
                        ))}
                    </div>
                </div>

                {/* ── Right column: Tickets + FAQ ── */}
                <div className="flex flex-col gap-6">
                    {/* My Tickets */}
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#FAF9F6] flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#050505] uppercase tracking-widest">My Tickets</span>
                            <span className="text-[8px] text-[#888888]">{DEMO_TICKETS.length} total</span>
                        </div>
                        <div className="divide-y divide-[#F0F0F0]">
                            {DEMO_TICKETS.map((t, i) => (
                                <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                                    className="px-5 py-4 hover:bg-[#FAF9F6] transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-black text-[#888888] font-mono">{t.id}</span>
                                                <span className="text-[7px] px-1.5 py-0.5 rounded font-black uppercase border"
                                                    style={{ background: (PRIORITY_COLORS[t.priority.toLowerCase()] || '#888') + '15', color: PRIORITY_COLORS[t.priority.toLowerCase()] || '#888', borderColor: (PRIORITY_COLORS[t.priority.toLowerCase()] || '#888') + '40' }}>
                                                    {t.priority}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-black text-[#050505] leading-tight">{t.subject}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock size={8} className="text-[#888888]"/>
                                                <span className="text-[8px] text-[#888888]">Last reply: {t.lastReply}</span>
                                            </div>
                                        </div>
                                        <span className="text-[7px] px-2 py-1 rounded-full font-black uppercase shrink-0 text-white" style={{ background: STATUS_COLORS[t.status] }}>
                                            {t.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#FAF9F6]">
                            <span className="text-[10px] font-black text-[#050505] uppercase tracking-widest flex items-center gap-2"><Book size={13}/> FAQ</span>
                        </div>
                        <div className="divide-y divide-[#F0F0F0]">
                            {FAQ.map((faq, i) => (
                                <div key={i} className="cursor-pointer hover:bg-[#FAF9F6] transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <div className="px-5 py-4 flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-black text-[#050505]">{faq.q}</span>
                                        {openFaq === i ? <ChevronUp size={14} className="shrink-0 text-[#888888]"/> : <ChevronDown size={14} className="shrink-0 text-[#888888]"/>}
                                    </div>
                                    {openFaq === i && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-5 pb-4">
                                            <p className="text-[10px] text-[#888888] leading-relaxed">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
