"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search, Download, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SessionLog {
  id: string;
  userId: string | null;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export function SessionLogsPanel() {
  const [logs, setLogs] = useState<SessionLog[]>([]);
  const [search, setSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Fetch initial logs
  useEffect(() => {
    fetch("/api/session-logs?limit=100")
      .then(res => res.json())
      .then(data => {
        if (data.logs) setLogs(data.logs);
      })
      .catch(console.error);
  }, []);

  // SSE for live updates
  useEffect(() => {
    const eventSource = new EventSource("/api/session-logs/sse");
    
    eventSource.addEventListener("new_logs", (e) => {
      try {
        const newLogs = JSON.parse(e.data);
        setLogs(prev => {
          const combined = [...newLogs, ...prev];
          // deduplicate just in case
          const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
          return unique.slice(0, 1000); // keep max 1000
        });
      } catch (err) {
        console.error("SSE parse error", err);
      }
    });

    return () => eventSource.close();
  }, []);

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
    if (!search) return logs;
    const lower = search.toLowerCase();
    return logs.filter(l => 
      l.action.toLowerCase().includes(lower) || 
      (l.userId && l.userId.toLowerCase().includes(lower)) ||
      (l.ipAddress && l.ipAddress.toLowerCase().includes(lower))
    );
  }, [logs, search]);

  const columns = React.useMemo<ColumnDef<SessionLog>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: (info) => <span className="font-mono text-white/50">{new Date(info.getValue() as string).toLocaleString()}</span>,
      },
      {
        accessorKey: "action",
        header: "Action / Event",
        cell: (info) => (
          <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[#00f5ff] text-[10px] uppercase font-bold tracking-widest">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "userId",
        header: "Sovereign ID",
        cell: (info) => <span className="font-mono text-white/80">{info.getValue() as string || "Anonymous"}</span>,
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: (info) => <span className="font-mono text-white/40">{info.getValue() as string || "Hidden"}</span>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredLogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-white overflow-hidden rounded-2xl border border-white/10">
      
      {/* Header & Controls */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
         <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black font-sans uppercase tracking-tight text-white flex items-center gap-2">
              Security Logs <span className="w-2 h-2 rounded-full bg-[#00f5ff] animate-pulse" />
            </h2>
            <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
              Live Sovereign Action Audit Trail
            </p>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
               <input 
                 type="text" 
                 placeholder="Search action, IP, ID..." 
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="bg-black border border-white/10 rounded-lg pl-9 pr-4 py-2 text-[12px] font-mono focus:border-[#00f5ff] outline-none text-white w-64"
               />
            </div>
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              <Download size={14} /> {isExporting ? "Exporting..." : "Export CSV"}
            </button>
         </div>
      </div>

      {/* Table Body (Virtualized) */}
      <div ref={tableContainerRef} className="flex-1 overflow-y-auto no-scrollbar relative min-h-0 bg-black/20">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {/* Table Header Row (absolute positioned so it doesn't scroll with virtual, wait, typical virtual uses sticky or independent header) */}
          {/* We will just put it inline above, actually standard table semantics are hard with virtualization, we use flex rows */}
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/10 shadow-sm">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 bg-[#0a0a0a]">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative', display: 'block' }}>
            {rowVirtualizer.getVirtualItems().map(virtualRow => {
              const row = rows[virtualRow.index];
              return (
                <tr 
                  key={row.id} 
                  className="absolute w-full border-b border-white/5 hover:bg-white/5 transition-colors group flex items-center"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <td key={cell.id} className="p-4 text-[12px]" style={{ width: i === 0 ? '25%' : i === 1 ? '25%' : i === 2 ? '30%' : '20%' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <AlertCircle size={32} />
              <div className="text-[12px] font-mono tracking-widest uppercase">No logs found</div>
           </div>
        )}
      </div>
    </div>
  );
}
