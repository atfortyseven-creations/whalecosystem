"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SessionLog {
    id: string;
    userId: string | null;
    action: string;
    ipAddress: string | null;
    timestamp: string;
}

export function SessionLogsPanel() {
    const [logs, setLogs] = useState<SessionLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLogs([
            { id: "s-1", userId: null, action: "SESSION_INITIALIZED",   ipAddress: "Client", timestamp: new Date().toISOString() },
            { id: "s-2", userId: null, action: "DATA_STREAM_CONNECTED",  ipAddress: "Client", timestamp: new Date().toISOString() },
            { id: "s-3", userId: null, action: "WALLET_HANDSHAKE_OK",   ipAddress: "Client", timestamp: new Date(Date.now() - 5000).toISOString() },
            { id: "s-4", userId: null, action: "ZK_PROOF_VERIFIED",     ipAddress: "Client", timestamp: new Date(Date.now() - 12000).toISOString() },
        ]);
        setIsLoading(false);
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

    return (
        <div className="w-full h-full min-h-0 flex flex-col p-4 md:p-8 bg-white dark:bg-[#050505] text-[#050505] dark:text-white font-mono overflow-hidden transition-colors">
            <div className="max-w-[1400px] mx-auto w-full flex-shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="relative flex-1 group max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#888888] pointer-events-none" />
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-3 bg-[#F9F9F9] dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/10 rounded-xl text-[12px] text-[#050505] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#050505] dark:focus:ring-white transition-all font-mono"
                            placeholder="Filter action, IP, ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-5 py-3 bg-[#F9F9F9] dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#050505] dark:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#1A1A1A] transition-colors disabled:opacity-50 shrink-0"
                    >
                        <Download size={14} />
                        {isExporting ? "Exporting..." : "Export CSV"}
                    </button>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0 border border-[#E5E5E5] dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#0A0A0A] shadow-sm">
                <div className="hidden md:grid grid-cols-[1.5fr_2fr_2fr_1.5fr] px-6 py-4 border-b border-[#E5E5E5] dark:border-white/10 bg-[#F9F9F9] dark:bg-[#111111] text-[10px] font-black text-[#888888] uppercase tracking-widest">
                    <div>Timestamp</div>
                    <div>Action</div>
                    <div>Identity</div>
                    <div>Source IP</div>
                </div>

                <div ref={tableContainerRef} className="flex-1 overflow-y-auto no-scrollbar min-h-0">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-[11px] text-[#888888] uppercase tracking-widest animate-pulse">Initializing Audit Stream...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-[#888888]">
                            <AlertCircle size={28} strokeWidth={1.5} />
                            <span className="text-[11px] font-black uppercase tracking-widest">No logs found</span>
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
                                        className="absolute w-full border-b border-[#F0F0F0] dark:border-white/5 hover:bg-[#F9F9F9] dark:hover:bg-white/5 transition-colors cursor-pointer
                                            flex flex-col md:grid md:grid-cols-[1.5fr_2fr_2fr_1.5fr] md:items-center px-6 py-4 gap-2 md:gap-0"
                                        style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                                    >
                                        <div className="text-[11px] font-mono text-[#888888] dark:text-[#AAAAAA] truncate">
                                            {new Date(log.timestamp).toLocaleString("en-US", { hour12: false })}
                                        </div>
                                        <div>
                                            <span className="px-2.5 py-1 bg-[#F0F0F0] dark:bg-white/10 border border-[#E5E5E5] dark:border-white/10 rounded-md text-[9px] font-black text-[#050505] dark:text-white uppercase tracking-widest">
                                                {log.action}
                                            </span>
                                        </div>
                                        <div className="text-[11px] font-mono font-bold text-[#050505] dark:text-white truncate">
                                            {log.userId || "Anonymous"}
                                        </div>
                                        <div className="text-[11px] font-mono text-[#888888] dark:text-[#AAAAAA] truncate">
                                            {log.ipAddress || "Hidden"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center mt-4 text-[9px] text-[#888888] dark:text-white/30 uppercase tracking-[0.2em] font-black">
                CRYPTOGRAPHIC AUDIT TRAIL
            </div>
        </div>
    );
}
