"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Send, CheckCircle, LifeBuoy, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
    id: string;
    subject: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    priority: 'Low' | 'Medium' | 'High';
    createdAt: string;
    lastReply: string;
}

type Priority = 'Low' | 'Medium' | 'High';

const FAQ = [
    {
        q: 'How do I connect my wallet?',
        a: 'Click "Connect Wallet" on the top navigation bar. We support major wallets including MetaMask and WalletConnect.',
    },
    {
        q: 'How do I upgrade my plan?',
        a: 'Navigate to the Billing & Plan section in the sidebar to view our available subscription tiers.',
    },
    {
        q: 'Can I use the dashboard on mobile?',
        a: 'Yes, the dashboard is fully responsive and supports mobile devices.',
    },
    {
        q: 'Where does the market data come from?',
        a: 'Our market data is sourced directly from reliable on-chain oracles and exchange APIs.',
    },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    'Open':        { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
    'In Progress': { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
    'Resolved':    { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
};

const PRIORITY_COLORS: Record<string, string> = {
    low:      'text-gray-500',
    medium:   'text-orange-500',
    high:     'text-red-500',
};

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
            try { setTickets(JSON.parse(stored)); } catch (e) {}
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
            await new Promise(r => setTimeout(r, 600)); 
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
            toast.success('Support ticket submitted successfully.');
            setTimeout(() => setSubmitted(false), 4000);
        } catch {
            toast.error('Error submitting ticket. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="h-full min-h-0 overflow-y-auto no-scrollbar flex flex-col gap-6 p-4 md:p-6 text-[#050505] dark:text-[#FAF9F6]">
            {/* Header */}
            <div className="bg-white/40 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-black/[0.05] dark:border-white/10 rounded-3xl p-8 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-black/5 dark:bg-white/10 rounded-2xl">
                        <LifeBuoy size={24} className="text-[#050505] dark:text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Support</h1>
                        <p className="text-sm font-medium text-black/50 dark:text-white/50">How can we help you today?</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form */}
                <div className="lg:col-span-3 bg-white/40 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-black/[0.05] dark:border-white/10 rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="px-6 py-5 border-b border-black/[0.05] dark:border-white/10 bg-white/50 dark:bg-[#111111]/50 flex items-center gap-2.5">
                        <Mail size={16} className="text-black/60 dark:text-white/60" />
                        <span className="text-xs font-black uppercase tracking-widest">Contact Support</span>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-black/50 dark:text-white/50 block mb-2">Subject</label>
                            <input
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="What is your issue about?"
                                className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-white/50 dark:bg-[#111111]/50 border border-black/10 dark:border-white/10 outline-none focus:border-black/30 dark:focus:border-white/30 transition-all placeholder:text-black/30 dark:placeholder:text-white/30 text-[#050505] dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-black/50 dark:text-white/50 block mb-2">Priority</label>
                            <div className="flex gap-2">
                                {(['Low', 'Medium', 'High'] as Priority[]).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                                            priority === p
                                                ? 'bg-[#050505] dark:bg-white text-white dark:text-[#050505] border-[#050505] dark:border-white shadow-md'
                                                : 'bg-white/50 dark:bg-[#111111]/50 text-black/50 dark:text-white/50 border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 hover:text-black dark:hover:text-white'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-black/50 dark:text-white/50 block mb-2">Message</label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                rows={5}
                                placeholder="Describe your issue in detail..."
                                className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-white/50 dark:bg-[#111111]/50 border border-black/10 dark:border-white/10 outline-none focus:border-black/30 dark:focus:border-white/30 resize-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30 text-[#050505] dark:text-white"
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {submitted ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex items-center justify-center gap-3 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                >
                                    <CheckCircle size={18} />
                                    <span className="text-xs font-black uppercase tracking-wider">Ticket Submitted Successfully</span>
                                </motion.div>
                            ) : (
                                <motion.button
                                    key="submit"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black uppercase tracking-widest text-xs bg-[#050505] dark:bg-white text-white dark:text-[#050505] hover:opacity-90 transition-all disabled:opacity-50 shadow-md"
                                >
                                    {submitting
                                        ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        : <Send size={16} />
                                    }
                                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right side: Tickets & FAQ */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Active Tickets */}
                    <div className="bg-white/40 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-black/[0.05] dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                        <div className="px-5 py-4 border-b border-black/[0.05] dark:border-white/10 bg-white/50 dark:bg-[#111111]/50 flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-black/80 dark:text-white/80">Your Tickets</span>
                            <span className="font-mono text-[10px] text-black/40 dark:text-white/40 font-bold">{tickets.length} total</span>
                        </div>
                        <div className="divide-y divide-black/[0.05] dark:divide-white/10 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {ticketsLoading ? (
                                <div className="py-10 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin" />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="py-10 text-center">
                                    <p className="text-xs font-black uppercase tracking-widest text-black/30 dark:text-white/30">No active tickets</p>
                                </div>
                            ) : tickets.map((t, i) => {
                                const sc = STATUS_STYLES[t.status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500' };
                                return (
                                    <motion.div
                                        key={t.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-[10px] text-black/40 dark:text-white/40 font-bold">#{t.id}</span>
                                                    <span className={`text-[9px] font-black uppercase ${PRIORITY_COLORS[t.priority.toLowerCase()] || 'text-gray-500'}`}>
                                                        {t.priority}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-bold text-black dark:text-white truncate mb-1">{t.subject}</p>
                                                <span className="text-[10px] text-black/40 dark:text-white/40 font-medium">{new Date(t.lastReply).toLocaleDateString()}</span>
                                            </div>
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase whitespace-nowrap shrink-0 ${sc.bg} ${sc.text}`}>
                                                {t.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white/40 dark:bg-[#0A0A0A]/40 backdrop-blur-3xl border border-black/[0.05] dark:border-white/10 rounded-3xl overflow-hidden shadow-sm flex-1">
                        <div className="px-5 py-4 border-b border-black/[0.05] dark:border-white/10 bg-white/50 dark:bg-[#111111]/50 flex items-center gap-2.5">
                            <AlertCircle size={16} className="text-black/60 dark:text-white/60" />
                            <span className="text-xs font-black uppercase tracking-widest text-black/80 dark:text-white/80">FAQ</span>
                        </div>
                        <div className="divide-y divide-black/[0.05] dark:divide-white/10">
                            {FAQ.map((faq, i) => (
                                <div
                                    key={i}
                                    className="cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                >
                                    <div className="px-5 py-4 flex items-center justify-between gap-4">
                                        <span className="text-sm font-bold text-black dark:text-white leading-snug">{faq.q}</span>
                                        <motion.div
                                            animate={{ rotate: openFaq === i ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="shrink-0"
                                        >
                                            <ChevronDown size={16} className="text-black/40 dark:text-white/40" />
                                        </motion.div>
                                    </div>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="px-5 pb-4 text-sm text-black/60 dark:text-white/60 leading-relaxed font-medium">{faq.a}</p>
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
