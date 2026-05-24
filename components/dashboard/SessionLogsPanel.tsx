"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, Download, AlertCircle, Lock, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";

interface SessionLog {
    id: string;
    userId: string | null;
    action: string;
    ipAddress: string | null;
    timestamp: string;
}

const PRIVACY_PILLARS = [
    {
        icon: <Lock size={18} />,
        title: "Zero-Knowledge Identity",
        desc: "Your wallet address is your identity. No email, phone, or government ID is ever required to access the Humanity Ledger. All authentication is cryptographic.",
    },
    {
        icon: <Lock size={18} />,
        title: "Private Execution via Aztec",
        desc: "Transactions execute inside Aztec Network's private execution environment. Smart contract logic, capital flows, and state transitions are fully shielded from public view on L1.",
    },
    {
        icon: <FileText size={18} />,
        title: "No Server-Side Message Storage",
        desc: "Whale Chat uses the XMTP protocol. Messages are encrypted client-side with your wallet keys and transmitted peer-to-peer. No message content ever touches our servers.",
    },
    {
        icon: <Lock size={18} />,
        title: "IP Anonymity",
        desc: "Your IP address is never persistently logged or associated with your on-chain identity. All API requests are routed through Cloudflare's edge network with no client fingerprinting.",
    },
    {
        icon: <FileText size={18} />,
        title: "Cryptographic Audit Trail",
        desc: "Your session audit log is generated client-side and never transmitted to external servers. You hold the only record of your own activity on this platform.",
    },
    {
        icon: <Lock size={18} />,
        title: "Auto-Session Expiration",
        desc: "Sessions auto-expire after your configured inactivity period (15m / 1h / 24h). All session keys are destroyed on disconnect, with no persistent tokens stored server-side.",
    },
];

export function SessionLogsPanel() {
    const [logs, setLogs] = useState<SessionLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const [activeView, setActiveView] = useState<'policy' | 'logs'>('policy');

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/session-logs');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.logs || []);
                } else {
                    setLogs([]);
                }
            } catch (error) {
                console.error('Error fetching session logs:', error);
                setLogs([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = React.useMemo(() => {
        let result = logs;
        if (search.trim()) {
            const lower = search.toLowerCase();
            result = logs.filter(l =>
                l.action.toLowerCase().includes(lower) ||
                (l.userId && l.userId.toLowerCase().includes(lower)) ||
                (l.ipAddress && l.ipAddress.toLowerCase().includes(lower))
            );
        }
        return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, search]);

    const handleExport = () => {
        setIsExporting(true);
        try {
            const csv = ["Timestamp,Action,Identity,Source IP",
                ...filteredLogs.map(l => `${l.timestamp},${l.action},${l.userId || "Anonymous"},${l.ipAddress || "Hidden"}`)
            ].join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `audit_${Date.now()}.csv`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
            toast.success("Audit log exported");
        } catch { toast.error("Export failed"); }
        finally { setIsExporting(false); }
    };

    const rowVirtualizer = useVirtualizer({
        count: filteredLogs.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => 52,
        overscan: 8,
    });

    const TABS = [
        { id: 'policy', label: 'Privacy Policy', icon: <FileText size={14} /> },
        { id: 'logs',   label: 'Audit Log',       icon: <FileText size={14} /> },
    ] as const;

    return (
        <div className="w-full h-full min-h-0 flex flex-col items-center justify-start p-4 md:p-8 text-black font-sans overflow-y-auto no-scrollbar relative bg-white">
            <div className="w-full max-w-[880px] mx-auto bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] p-7 md:p-10 flex flex-col transition-all duration-500 z-10">

                {/* ── HEADER ── */}
                <div className="w-full border-b border-slate-200/60 pb-5 mb-7">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-slate-900 leading-none">
                                Privacy
                            </h1>
                            <span className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                Aztec Network · Zero-Knowledge Privacy Architecture · Cryptographic Audit Trail
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/[0.03] border border-black/8 rounded-full">
                            <Lock size={10} className="text-black/40" />
                            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-black/40">ZK-Shielded</span>
                        </div>
                    </div>

                    {/* Section Tabs */}
                    <div className="flex items-center gap-1 mt-6 bg-black/[0.02] border border-black/5 p-1 rounded-xl w-fit">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveView(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === tab.id ? 'bg-black text-white shadow-sm' : 'text-black/40 hover:text-black hover:bg-black/[0.04]'}`}>
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── PRIVACY POLICY VIEW ── */}
                {activeView === 'policy' && (
                    <motion.div key="policy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col gap-6">

                        {/* Hero Statement */}
                        <div className="w-full bg-slate-900 text-white rounded-2xl p-8 md:p-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Lock size={20} className="text-white/60" />
                                <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Privacy Manifesto</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white leading-tight">
                                Your data belongs to you.<br />Not to us. Not to anyone.
                            </h2>
                            <p className="font-mono text-[12px] text-white/50 leading-relaxed max-w-2xl">
                                Humanity Ledger is built on Aztec Network's zero-knowledge L2. Every cryptographic operation that touches your identity, capital, or communications is executed privately on your device and verified on-chain without ever revealing the underlying data.
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                                <Link href="/manifesto" className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                                    Read Full Manifesto <ExternalLink size={11} />
                                </Link>
                                <Link href="/security" className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors">
                                    Security Policy <ExternalLink size={11} />
                                </Link>
                            </div>
                        </div>

                        {/* Privacy Pillars Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {PRIVACY_PILLARS.map((pillar, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="flex flex-col gap-3 p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md hover:border-black/15 transition-all duration-300"
                                >
                                    <div className="w-9 h-9 flex items-center justify-center bg-slate-100 border border-slate-200 rounded-xl text-slate-600">
                                        {pillar.icon}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <span className="font-black text-[13px] text-slate-900 tracking-tight">{pillar.title}</span>
                                        <p className="font-mono text-[10px] text-slate-500 leading-relaxed">{pillar.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Legal Links */}
                        <div className="w-full bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200/60 bg-slate-50/60">
                                <FileText size={14} className="text-slate-400" />
                                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-slate-500">Legal Documents</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                                {[
                                    { label: 'Privacy Policy',       href: '/legal/privacy',      desc: 'How we handle your data and GDPR compliance.' },
                                    { label: 'Terms of Service',     href: '/terms',              desc: 'Terms governing access to the Humanity Ledger platform.' },
                                    { label: 'Security Policy',      href: '/security',           desc: 'Vulnerability disclosure and security architecture.' },
                                    { label: 'Audit Reports',        href: '/security',           desc: 'Third-party audit results and formal verification.' },
                                ].map(l => (
                                    <Link key={l.label} href={l.href} className="group flex items-center justify-between p-5 hover:bg-slate-50/60 transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-[13px] text-slate-800 group-hover:text-black transition-colors">{l.label}</span>
                                            <span className="font-mono text-[10px] text-slate-400">{l.desc}</span>
                                        </div>
                                        <ExternalLink size={12} className="text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-3" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── AUDIT LOG VIEW ── */}
                {activeView === 'logs' && (
                    <motion.div key="logs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex flex-col gap-4">
                        {/* Controls */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 group max-w-sm">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <input type="text" className="block w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200/60 rounded-xl text-[12px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all font-mono placeholder:text-slate-400" placeholder="Filter action, IP, identity..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200/60 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50 shrink-0">
                                <Download size={14} />
                                {isExporting ? "Exporting..." : "Export CSV"}
                            </button>
                        </div>

                        <div className="w-full flex-1 flex flex-col border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-sm" style={{ minHeight: 300 }}>
                            <div className="hidden md:grid grid-cols-[1.5fr_2fr_2fr_1.5fr] px-6 py-4 border-b border-slate-200/60 bg-slate-50/60 font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <div>Timestamp</div>
                                <div>Action</div>
                                <div>Identity</div>
                                <div>Source</div>
                            </div>
                            <div ref={tableContainerRef} className="flex-1 overflow-y-auto no-scrollbar" style={{ height: 400 }}>
                                {isLoading ? (
                                    <div className="h-full flex items-center justify-center font-mono text-[11px] text-slate-400 uppercase tracking-widest animate-pulse">Initializing Audit Stream...</div>
                                ) : filteredLogs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                                        <AlertCircle size={28} strokeWidth={1.5} />
                                        <span className="font-mono text-[11px] font-black uppercase tracking-widest">No logs found</span>
                                    </div>
                                ) : (
                                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
                                        {rowVirtualizer.getVirtualItems().map(virtualRow => {
                                            const log = filteredLogs[virtualRow.index];
                                            if (!log) return null;
                                            return (
                                                <div
                                                    key={log.id}
                                                    onClick={() => { navigator.clipboard.writeText(JSON.stringify(log, null, 2)); toast.success("Copied"); }}
                                                    className="absolute w-full border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer flex flex-col md:grid md:grid-cols-[1.5fr_2fr_2fr_1.5fr] md:items-center px-6 py-4 gap-2 md:gap-0"
                                                    style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                                                >
                                                    <div className="font-mono text-[11px] text-slate-400 truncate">{new Date(log.timestamp).toLocaleString("en-US", { hour12: false })}</div>
                                                    <div><span className="px-2.5 py-1 bg-slate-100 border border-slate-200/60 rounded-md font-mono text-[9px] font-black text-slate-700 uppercase tracking-widest">{log.action}</span></div>
                                                    <div className="font-mono text-[11px] font-bold text-slate-700 truncate">{log.userId || "Anonymous"}</div>
                                                    <div className="font-mono text-[11px] text-slate-400 truncate">{log.ipAddress || "Hidden"}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black">
                            Cryptographic Audit Trail · Client-Side Only · Never Transmitted
                        </p>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
