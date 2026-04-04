"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ChevronsDown, Loader } from 'lucide-react';
import { NodeData } from './CanvasEngine';

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

    // Simulate real-time RPC logs based on active nodes
    useEffect(() => {
        let logCounter = 0;
        
        const generateLog = () => {
            logCounter++;
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            
            const activeNodes = nodes.filter(n => n.status !== 'error');
            if (activeNodes.length === 0) return;
            
            // Deterministic node selection
            const nodeIndex = (now.getMinutes() + now.getSeconds()) % activeNodes.length;
            const targetNode = activeNodes[nodeIndex];

            // Deterministic log selection based on timestamp
            const hash = (now.getMinutes() * 60 + now.getSeconds() + (targetNode.id || 0)) % 100;
            let newLog: LogEntry;

            if (hash > 90 && targetNode.type === 'bot') {
                newLog = {
                    id: logCounter,
                    timestamp: timeStr,
                    type: 'success',
                    message: <span><span className="text-[var(--aztec-orchid)]">[{targetNode.title}]</span> ✅ Ejecución exitosa. Beneficio: <span className="text-[var(--aztec-chartreuse)]">+$4,500</span></span>
                };
            } else if (hash > 70) {
                newLog = {
                    id: logCounter,
                    timestamp: timeStr,
                    type: 'info',
                    message: <span><span className="text-[var(--aztec-orchid)]">[{targetNode.title}]</span> ⚡ Tx iniciada...</span>
                };
            } else if (hash > 50) {
                newLog = {
                    id: logCounter,
                    timestamp: timeStr,
                    type: 'warning',
                    message: <span><span className="text-[var(--aztec-orchid)]">[{targetNode.title}]</span> ⏳ Esperando confirmación de bloque. Latencia: {targetNode.latency}ms.</span>
                };
            } else {
                newLog = {
                    id: logCounter,
                    timestamp: timeStr,
                    type: 'info',
                    message: <span><span className="text-[var(--aztec-orchid)]">[{targetNode.title}]</span> Pooling RPC via WSS matrix.</span>
                };
            }

            setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
        };

        const interval = setInterval(generateLog, 2500); // New log every 2.5s
        
        // Initial setup logs
        setLogs([
            { id: -2, timestamp: 'System', type: 'info', message: 'Initializing UltraFluid WebSocket Topology...' },
            { id: -1, timestamp: 'System', type: 'success', message: 'Docker nodes mounted. Matrix synchronized.' },
        ]);

        return () => clearInterval(interval);
    }, [nodes]);

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

