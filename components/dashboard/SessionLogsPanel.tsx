// SessionLogsPanel — Activity audit viewer with virtualised rendering
"use client";

import React, { useState, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, Download, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useOmniInfrastructure } from "@/lib/api-client";

interface SessionLog {
  id: string;
  userId: string | null;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export function SessionLogsPanel() {
  // =========================================================================
  // INJECTED DATA HOOK — Zero-Mock Mandate
  // Session logs endpoint injected via REGISTRY.OMNI_INFRA.sessionLogs
  // =========================================================================
  const { data: rawData, isLoading } = useOmniInfrastructure('sessionLogs');
  const logs: SessionLog[] = rawData?.logs || [];

  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/session-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exportFormat: "csv" })
      });
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `session_logs_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Logs exported successfully");
    } catch (err) {
      toast.error("Failed to export logs");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredLogs = React.useMemo(() => {
    let result = logs;
    if (search) {
      const lower = search.toLowerCase();
      result = logs.filter(l => 
        l.action.toLowerCase().includes(lower) || 
        (l.userId && l.userId.toLowerCase().includes(lower)) ||
        (l.ipAddress && l.ipAddress.toLowerCase().includes(lower))
      );
    }
    return result.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, search]);

  const columns = React.useMemo<ColumnDef<SessionLog>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: (info: any) => <span className="font-mono text-black/60">{new Date(info.getValue() as string).toLocaleString()}</span>,
      },
      {
        accessorKey: "action",
        header: "Action / Event",
        cell: (info: any) => (
          <span className="px-2 py-1 bg-black/5 border border-black/10 rounded text-black text-[10px] uppercase font-bold tracking-widest">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "userId",
        header: "Sovereign ID",
        cell: (info: any) => <span className="font-mono text-black/80">{info.getValue() as string || "Anonymous"}</span>,
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: (info: any) => <span className="font-mono text-black/40">{info.getValue() as string || "Hidden"}</span>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: filteredLogs.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  return (
    <div className="h-full flex flex-col bg-white text-black overflow-hidden rounded-2xl border border-black/10 shadow-sm relative">
      
      {/* Header & Controls */}
      <div className="p-6 border-b border-black/10 flex flex-col md:flex-row md:items-center justify-between bg-[#FDFCF8] shrink-0 gap-4">
         <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold font-sans uppercase tracking-[0.1em] text-[#050505] flex items-center gap-2">
              SECURITY AUDIT LOGS
            </h2>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
               <input 
                 type="text" 
                 placeholder="Search action, IP, ID..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="bg-transparent border border-black/10 rounded-lg pl-9 pr-4 py-2 text-[12px] font-mono focus:border-black outline-none text-black w-full md:w-64 transition-colors"
               />
            </div>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 hover:bg-black/5 border border-black/10 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 text-black shrink-0"
            >
              <Download size={14} /> {isExporting ? "Exporting..." : "Export CSV"}
            </button>
         </div>
      </div>

      {/* Table Body (Virtualized) */}
      <div ref={tableContainerRef} className="flex-1 overflow-y-auto no-scrollbar relative min-h-0 bg-white">
        <div className="w-full text-left">
          <div className="sticky top-0 z-10 bg-[#FAF9F6] border-b border-black/10 shadow-sm grid" style={{ gridTemplateColumns: '1.5fr 2fr 3fr 1.5fr' }}>
              <div className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Timestamp</div>
              <div className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Action / Event</div>
              <div className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">Sovereign ID</div>
              <div className="p-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black/50">IP Address</div>
          </div>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow: any) => {
              const logItem = filteredLogs[virtualRow.index];
              if (!logItem) return null;
              return (
                <div 
                  key={logItem.id} 
                  onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(logItem, null, 2));
                      toast.success("Log session detail copied successfully!");
                  }}
                  className="absolute w-full border-b border-black/5 hover:bg-[#FDFCF8] transition-colors group grid items-center cursor-pointer active:bg-black/5"
                  style={{
                    gridTemplateColumns: '1.5fr 2fr 3fr 1.5fr',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                    <div className="p-4 text-[11px] font-mono text-black/60 truncate" title={new Date(logItem.timestamp).toLocaleString()}>
                        {new Date(logItem.timestamp).toLocaleString()}
                    </div>
                    <div className="p-4 text-[12px] truncate">
                        <span className="px-2 py-1 bg-black/5 border border-black/10 rounded text-black text-[9px] uppercase font-bold tracking-widest truncate">
                            {logItem.action}
                        </span>
                    </div>
                    <div className="p-4 text-[11px] font-mono font-bold text-black/80 truncate">
                        {logItem.userId || "Anonymous"}
                    </div>
                    <div className="p-4 text-[11px] font-mono text-black/40 truncate">
                        {logItem.ipAddress || "Hidden"}
                    </div>
                </div>
              )
            })}
          </div>
        </div>

        {filteredLogs.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40 text-black">
              <AlertCircle size={32} />
              <div className="text-[12px] font-mono tracking-widest uppercase">No logs found</div>
           </div>
        )}
      </div>
    </div>
  );
}
