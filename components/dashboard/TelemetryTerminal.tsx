"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronsDown, Loader, Activity, RadioTower } from 'lucide-react';
import { NodeData } from './CanvasEngine';
import { io, Socket } from 'socket.io-client';

interface TelemetryTerminalProps {
    nodes: NodeData[];
}

interface LogEntry {
    id: number;
    timestamp: string;
    message: React.ReactNode;
    type: 'info' | 'success' | 'warning' | 'error';
}

export function TelemetryTerminal({ nodes }: TelemetryTerminalProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const endOfLogsRef = useRef<HTMLDivElement>(null);

    // Reemplazar simulación con streams WebSockets reales del motor de Node.js
    useEffect(() => {
        const socket = io();
        let logCounter = 0;

        setLogs([
            { id: -2, timestamp: 'System', type: 'info', message: 'Initializing Institutional WebSocket Topology...' },
            { id: -1, timestamp: 'System', type: 'info', message: <span className="text-[#888888]">Connecting to background daemon...</span> }
        ]);

        socket.on('connect', () => {
            setLogs(prev => [...prev.slice(-49), {
                id: ++logCounter,
                timestamp: 'System',
                type: 'success',
                message: <span className="text-[#00C076] font-black">WS ENGINE ONLINE // CONNECTION ESTABLISHED</span>
            }]);
        });
        
        socket.on('whale_tx', (data) => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
            
            setLogs(prev => [...prev.slice(-49), {
                id: ++logCounter,
                timestamp: timeStr,
                type: 'warning',
                message: <span><span className="text-[#E5E5E5]">[{data.chain.toUpperCase()}]</span> ⚡ ALERTA INSTITUCIONAL: {data.type} detectado por <span className="text-[#FF9500] font-black">${(data.amountUsd).toLocaleString()}</span> USD.</span>
            }]);
        });

        socket.on('engine_status', (status) => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            
            // Limit status print to prevent flooding if it updates every second, maybe print every 10th
            if (status.processedTxs % 10 === 0) {
                 setLogs(prev => [...prev.slice(-49), {
                    id: ++logCounter,
                    timestamp: timeStr,
                    type: 'info',
                    message: <span className="text-[#888888]"><Activity size={10} className="inline mr-1"/> Motor Mempool: {status.tps} TPS | Tx Totales: {status.processedTxs.toLocaleString()} | Uptime: {Math.floor(status.uptime)}s</span>
                }]);
            }
        });

        socket.on('mempool_tick', (data) => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            
            // Only capture 5% of normal ticks to not overflow the dom terminal visually (simulate extreme volume)
            if (Math.random() < 0.05) {
                setLogs(prev => [...prev.slice(-49), {
                    id: ++logCounter,
                    timestamp: timeStr,
                    type: 'info',
                    message: <span><span className="text-[#888888]">[{data.chain}]</span> Pool Trace: {data.id}</span>
                }]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isExpanded) {
            endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isExpanded]);

    return (
        <motion.div 
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`absolute bottom-4 left-4 right-[360px] bg-[#0c0c0c]/80 backdrop-blur-2xl border border-white/10 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-40 ${isExpanded ? 'h-64' : 'h-12'}`}
        >
            {/* Header / Truncated View */}
            <div 
                className="h-12 flex items-center justify-between px-4 cursor-pointer hover:bg-white/5"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 w-full truncate">
                    <Terminal size={14} className="text-[var(--aztec-chartreuse)]" />
                    <div className="text-xs font-mono text-white/50 truncate">
                        {logs.length > 0 ? (
                            <span className="flex gap-4">
                                <span>[{logs[logs.length-1].timestamp}]</span>
                                {logs[logs.length-1].message}
                            </span>
                        ) : (
                            <span className="flex items-center gap-2"><Loader size={12} className="animate-spin" /> Awaiting Telemetry...</span>
                        )}
                    </div>
                </div>
                <button className="p-1 hover:bg-white/10 rounded ml-2">
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <ChevronsDown size={14} className="text-white/40" />
                    </motion.div>
                </button>
            </div>

            {/* Expanded Console Logs */}
            <div className="flex-1 overflow-y-auto p-4 border-t border-white/5 font-mono text-xs flex flex-col gap-2 terminal-scroll">
                {logs.map(log => (
                    <div key={log.id} className="flex gap-4 items-start">
                        <span className="text-white/30 shrink-0">[{log.timestamp}]</span>
                        <span className={
                            log.type === 'success' ? 'text-white' : 
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'warning' ? 'text-yellow-400/80' : 
                            'text-white/70'
                        }>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={endOfLogsRef} />
            </div>
            
            <style jsx>{`
                .terminal-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .terminal-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .terminal-scroll::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                }
            `}</style>
        </motion.div>
    );
}

