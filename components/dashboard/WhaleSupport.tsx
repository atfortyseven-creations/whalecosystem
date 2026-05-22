"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Send, CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
    id: string;
    subject: string;
    status: 'OPEN' | 'IN PROGRESS' | 'RESOLVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
}

type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

const FAQ = [
    { q: 'How do I connect my wallet?',        a: 'Navigate to the Portfolio section and use the system handshake flow to link your wallet securely.' },
    { q: 'How do I upgrade my plan?',           a: 'Go to Subscription in the sidebar to view and manage available institutional tiers.' },
    { q: 'Is the dashboard available on mobile?', a: 'Yes. The entire platform is fully responsive and optimized for mobile devices.' },
    { q: 'Where does the market data come from?', a: 'Market data is sourced directly from on-chain oracles and verified exchange APIs in real time.' },
];

export function WhaleSupport() {
    const [openFaq, setOpenFaq]       = useState<number | null>(null);
    const [subject, setSubject]       = useState('');
    const [message, setMessage]       = useState('');
    const [priority, setPriority]     = useState<Priority>('MEDIUM');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted]   = useState(false);
    const [tickets, setTickets]       = useState<Ticket[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('whale_support_tickets');
            if (stored) setTickets(JSON.parse(stored));
        } catch {}
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
                subject, status: 'OPEN', priority,
                createdAt: new Date().toISOString(),
            };
            const updated = [newTicket, ...tickets];
            setTickets(updated);
            localStorage.setItem('whale_support_tickets', JSON.stringify(updated));
            setSubmitted(true); setSubject(''); setMessage('');
            toast.success('Support ticket submitted.');
            setTimeout(() => setSubmitted(false), 4000);
        } catch { toast.error('Error submitting ticket.'); }
        finally { setSubmitting(false); }
    };

    const priorityLabel: Record<Priority, string> = { LOW: 'LOW', MEDIUM: 'MED', HIGH: 'HIGH' };

    return (
        <div className="w-full h-full min-h-0 flex flex-col p-4 md:p-8 bg-white dark:bg-[#050505] text-[#050505] dark:text-white font-mono overflow-y-auto no-scrollbar transition-colors">
            <div className="max-w-[1400px] mx-auto w-full">

                {/* Main grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/*  Form  */}
                    <div className="lg:col-span-3 border border-[#E5E5E5] dark:border-white/10 rounded-2xl overflow-hidden bg-[#F9F9F9] dark:bg-[#111111]">
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-[#E5E5E5] dark:border-white/10 bg-[#E5E5E5]/50 dark:bg-white/5">
                            <Mail size={14} className="text-[#888888]" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Contact Support</span>
                        </div>

                        <div className="p-6 flex flex-col gap-5">
                            {/* Subject */}
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-[#888888] block mb-2">Subject</label>
                                <input
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="What is your issue about?"
                                    className="w-full rounded-xl px-4 py-3 text-[13px] bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-white/10 outline-none focus:border-[#050505] dark:focus:border-white transition-all placeholder:text-[#AAAAAA] dark:placeholder:text-white/30 text-[#050505] dark:text-white font-mono"
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-[#888888] block mb-2">Priority</label>
                                <div className="flex gap-2">
                                    {(['LOW', 'MEDIUM', 'HIGH'] as Priority[]).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setPriority(p)}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                priority === p
                                                    ? 'bg-[#050505] dark:bg-white text-white dark:text-[#050505] border-[#050505] dark:border-white'
                                                    : 'bg-white dark:bg-[#0A0A0A] text-[#888888] border-[#E5E5E5] dark:border-white/10 hover:border-[#050505] dark:hover:border-white hover:text-[#050505] dark:hover:text-white'
                                            }`}
                                        >
                                            {priorityLabel[p]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest text-[#888888] block mb-2">Message</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={5}
                                    placeholder="Describe your issue in detail..."
                                    className="w-full rounded-xl px-4 py-3 text-[13px] bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-white/10 outline-none focus:border-[#050505] dark:focus:border-white resize-none transition-all placeholder:text-[#AAAAAA] dark:placeholder:text-white/30 text-[#050505] dark:text-white font-mono"
                                />
                            </div>

                            {/* Submit */}
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <motion.div
                                        key="ok"
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        className="flex items-center justify-center gap-3 py-4 rounded-xl bg-[#F0F0F0] dark:bg-white/10 border border-[#E5E5E5] dark:border-white/10 text-[#050505] dark:text-white"
                                    >
                                        <CheckCircle size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ticket Submitted</span>
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        key="sub"
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] bg-[#050505] dark:bg-white text-white dark:text-[#050505] hover:opacity-80 transition-all disabled:opacity-50"
                                    >
                                        {submitting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send size={15} />}
                                        {submitting ? 'Submitting...' : 'Submit Ticket'}
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/*  Right column  */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Active Tickets */}
                        <div className="border border-[#E5E5E5] dark:border-white/10 rounded-2xl overflow-hidden bg-[#F9F9F9] dark:bg-[#111111]">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] dark:border-white/10 bg-[#E5E5E5]/50 dark:bg-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest">Your Tickets</span>
                                <span className="font-mono text-[10px] text-[#888888] font-bold">{tickets.length} total</span>
                            </div>
                            <div className="max-h-[280px] overflow-y-auto no-scrollbar divide-y divide-[#E5E5E5] dark:divide-white/10">
                                {tickets.length === 0 ? (
                                    <div className="py-10 text-center text-[11px] font-black uppercase tracking-widest text-[#888888]">No active tickets</div>
                                ) : tickets.map((t, i) => (
                                    <div key={t.id} className="px-6 py-4 hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-[9px] text-[#888888] font-bold">#{t.id}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#050505] dark:text-white border border-[#E5E5E5] dark:border-white/20 px-1.5 py-0.5 rounded">
                                                        {t.priority}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] font-bold text-[#050505] dark:text-white truncate">{t.subject}</p>
                                                <span className="text-[9px] text-[#888888] font-mono">{new Date(t.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <span className="text-[9px] px-2.5 py-1 rounded-lg font-black uppercase whitespace-nowrap shrink-0 bg-[#F0F0F0] dark:bg-white/10 border border-[#E5E5E5] dark:border-white/10 text-[#050505] dark:text-white">
                                                {t.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ */}
                        <div className="border border-[#E5E5E5] dark:border-white/10 rounded-2xl overflow-hidden bg-[#F9F9F9] dark:bg-[#111111] flex-1">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E5E5E5] dark:border-white/10 bg-[#E5E5E5]/50 dark:bg-white/5">
                                <AlertCircle size={14} className="text-[#888888]" />
                                <span className="text-[10px] font-black uppercase tracking-widest">FAQ</span>
                            </div>
                            <div className="divide-y divide-[#E5E5E5] dark:divide-white/10">
                                {FAQ.map((faq, i) => (
                                    <div
                                        key={i}
                                        className="cursor-pointer hover:bg-white dark:hover:bg-[#1A1A1A] transition-colors"
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    >
                                        <div className="px-6 py-4 flex items-center justify-between gap-4">
                                            <span className="text-[13px] font-bold text-[#050505] dark:text-white leading-snug">{faq.q}</span>
                                            <motion.div
                                                animate={{ rotate: openFaq === i ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="shrink-0"
                                            >
                                                <ChevronDown size={15} className="text-[#888888]" />
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
                                                    <p className="px-6 pb-4 text-[12px] text-[#888888] dark:text-[#AAAAAA] leading-relaxed font-mono">{faq.a}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-8 text-[9px] text-[#888888] dark:text-white/30 uppercase tracking-[0.2em] font-black">
                    INSTITUTIONAL SUPPORT DESK
                </div>
            </div>
        </div>
    );
}
