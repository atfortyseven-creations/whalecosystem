"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    LayoutDashboard, Wallet, Activity, Settings, QrCode, X,
    Plus, Cpu, Bot, Link as LinkIcon, ChevronRight, Circle,
    Zap, TrendingUp, AlertTriangle, Terminal, RefreshCw, Home,
    Save
} from 'lucide-react';
import { SovereignBridge } from '@/components/premium/SovereignBridge';
import { useDashboardStore } from '@/lib/store/useDashboardStore';
import Link from 'next/link';
import { useAccount, useBalance } from 'wagmi';

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
type Tab = 'canvas' | 'portfolio' | 'activity' | 'settings';
type NodeType = 'wallet' | 'bot' | 'contract' | 'api';

interface NodeData {
    id: string;
    type: NodeType;
    x: number;
    y: number;
    title: string;
    status: 'active' | 'syncing' | 'error';
    latency: number;
    data?: any; // For config panel
}

interface EdgeData {
    id: string;
    source: string;
    target: string;
}

// ─────────────────────────────────────────
// Icons per type
// ─────────────────────────────────────────
function NodeIcon({ type, size = 14 }: { type: NodeType; size?: number }) {
    switch (type) {
        case 'wallet': return <Wallet size={size} />;
        case 'bot': return <Bot size={size} />;
        case 'contract': return <Cpu size={size} />;
        case 'api': return <LinkIcon size={size} />;
    }
}

const STATUS_COLOR: Record<string, string> = {
    active: '#4ade80',
    syncing: '#38bdf8',
    error: '#f87171',
};

// ─────────────────────────────────────────
// Mini canvas node card
// ─────────────────────────────────────────
function CanvasNode({
    node,
    selected,
    onPointerDown,
    onClick,
    onAnchorDragStart,
}: {
    node: NodeData;
    selected: boolean;
    onPointerDown: (e: React.PointerEvent) => void;
    onClick: () => void;
    onAnchorDragStart: (e: React.PointerEvent, nodeId: string, isSource: boolean) => void;
}) {
    // We provide a right anchor (output) and left anchor (input)
    return (
        <div
            onPointerDown={onPointerDown}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{ transform: `translate(${node.x}px, ${node.y}px)`, position: 'absolute', top: 0, left: 0 }}
            className={`w-44 cursor-grab active:cursor-grabbing select-none rounded-xl border bg-[#111] shadow-lg transition-colors z-10 ${
                selected
                    ? 'border-[#a855f7]/70 shadow-[0_0_16px_rgba(168,85,247,0.3)]'
                    : 'border-white/[0.07] hover:border-white/20'
            }`}
        >
            {/* Input Anchor (Left) */}
            <div 
                className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 rounded-full bg-[#111] border border-[#a855f7] cursor-crosshair z-20 hover:scale-125 transition-transform"
                onPointerDown={(e) => onAnchorDragStart(e, node.id, false)}
            />

            <div className="px-3 py-2.5 flex items-center gap-2 border-b border-white/[0.06] pointer-events-none">
                <div className="text-white/50">
                    <NodeIcon type={node.type} size={13} />
                </div>
                <span className={`text-xs font-semibold truncate flex-1 ${selected ? 'text-white' : 'text-white/90'}`}>
                    {node.title}
                </span>
                <Circle
                    size={7}
                    fill={STATUS_COLOR[node.status]}
                    strokeWidth={0}
                    style={{ color: STATUS_COLOR[node.status] }}
                />
            </div>
            <div className="px-3 py-2 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">{node.type}</span>
                <span className="text-[10px] font-mono text-white/30">{node.latency}ms</span>
            </div>

            {/* Output Anchor (Right) */}
            <div 
                className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 rounded-full bg-[#111] border border-[#a855f7] cursor-crosshair z-20 hover:scale-125 transition-transform"
                onPointerDown={(e) => onAnchorDragStart(e, node.id, true)}
            />
        </div>
    );
}

// ─────────────────────────────────────────
// Context menu
// ─────────────────────────────────────────
function ContextMenu({
    x, y, nodeId, onClose, onAdd, onDelete,
}: {
    x: number; y: number; nodeId?: string;
    onClose: () => void;
    onAdd: (type: NodeType) => void;
    onDelete: () => void;
}) {
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
            <div
                style={{ top: y, left: x }}
                className="fixed z-50 w-52 rounded-xl border border-white/10 bg-[#111]/95 backdrop-blur-xl shadow-2xl overflow-hidden py-1"
                onContextMenu={(e) => e.preventDefault()}
            >
                {!nodeId ? (
                    <>
                        <MenuLabel>Add Node</MenuLabel>
                        {(['wallet', 'bot', 'contract', 'api'] as NodeType[]).map(t => (
                            <MenuItem key={t} onClick={() => { onAdd(t); onClose(); }} icon={<NodeIcon type={t} />}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </MenuItem>
                        ))}
                    </>
                ) : (
                    <>
                        <MenuLabel>Node Actions</MenuLabel>
                        <MenuItem onClick={() => { onDelete(); onClose(); }} icon={<X size={13} />} danger>
                            Delete Node
                        </MenuItem>
                    </>
                )}
            </div>
        </>
    );
}

function MenuLabel({ children }: { children: React.ReactNode }) {
    return <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-white/30 font-mono">{children}</div>;
}

function MenuItem({ children, onClick, icon, danger }: {
    children: React.ReactNode; onClick: () => void;
    icon?: React.ReactNode; danger?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors ${
                danger ? 'text-red-400 hover:bg-red-500/10' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
        >
            <span className="opacity-60">{icon}</span>
            {children}
        </button>
    );
}

// ─────────────────────────────────────────
// Helper to draw a bezier curve
// ─────────────────────────────────────────
function generateBezierPath(sx: number, sy: number, tx: number, ty: number) {
    const dx = Math.abs(tx - sx);
    const controlPointOffset = Math.max(dx * 0.5, 50);
    return `M ${sx} ${sy} C ${sx + controlPointOffset} ${sy}, ${tx - controlPointOffset} ${ty}, ${tx} ${ty}`;
}

// ─────────────────────────────────────────
// Operations Canvas (the main tab)
// ─────────────────────────────────────────
function OperationsCanvas({ 
    selectedId, 
    setSelectedId, 
    nodes, setNodes 
}: { 
    selectedId: string | null; 
    setSelectedId: (id: string | null) => void; 
    nodes: NodeData[]; 
    setNodes: React.Dispatch<React.SetStateAction<NodeData[]>>;
}) {
    const { addLog } = useDashboardStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState<EdgeData[]>([]);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSaved, setLastSaved] = useState<string>('');
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // Edge dragging state
    const [draftEdge, setDraftEdge] = useState<{ sourceNodeId: string, isSourceOut: boolean, mouseX: number, mouseY: number } | null>(null);

    const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
    const dragNodeStart = useRef({ mx: 0, my: 0, nx: 0, ny: 0 });

    // Load from DB
    useEffect(() => {
        fetch('/api/dashboard', { cache: 'no-store' })
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d?.nodes) setNodes(d.nodes);
                if (d?.edges) setEdges(d.edges);
                addLog('Canvas topography loaded from PostgreSQL', 'success');
            })
            .catch(() => addLog('Failed to load canvas from database', 'error'))
            .finally(() => setIsLoading(false));
    }, []);

    // Debounced autosave
    const schedSave = useCallback((n: NodeData[], e: EdgeData[]) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
            try {
                const r = await fetch('/api/dashboard', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nodes: n, edges: e }),
                });
                if (r.ok) {
                    const time = new Date().toLocaleTimeString();
                    setLastSaved(time);
                }
            } catch {}
        }, 1500);
    }, []);

    const addNode = useCallback((type: NodeType, cx: number, cy: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = cx - rect.left - pan.x - 88;
        const y = cy - rect.top - pan.y - 44;
        const node: NodeData = {
            id: crypto.randomUUID?.() ?? Date.now().toString(36),
            type, x, y,
            title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            status: 'syncing',
            latency: Math.floor(Math.random() * 30) + 5,
            data: {}
        };
        setNodes(prev => {
            const next = [...prev, node];
            schedSave(next, edges);
            return next;
        });
        setTimeout(() => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'active' } : n)), 800);
        addLog(`Deployed ${type} node to topography`, 'info');
        setSelectedId(node.id);
    }, [pan, edges, schedSave, addLog]);

    const deleteNode = useCallback((id: string) => {
        setNodes(prev => {
            const next = prev.filter(n => n.id !== id);
            setEdges(prevE => {
                const nextE = prevE.filter(e => e.source !== id && e.target !== id);
                schedSave(next, nextE);
                return nextE;
            });
            return next;
        });
        if (selectedId === id) setSelectedId(null);
        addLog(`Deleted node from topography`, 'warning');
    }, [selectedId, schedSave, addLog]);

    // Canvas panning — pointer events
    const onCanvasPointerDown = (e: React.PointerEvent) => {
        if (draggingNodeId || draftEdge) return;
        if (e.button !== 0 && e.button !== 1) return; // Allow panning with middle or left click
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onCanvasPointerMove = (e: React.PointerEvent) => {
        if (draggingNodeId) {
            // Move node
            setNodes(prev => prev.map(n => {
                if (n.id !== draggingNodeId) return n;
                return {
                    ...n,
                    x: dragNodeStart.current.nx + (e.clientX - dragNodeStart.current.mx),
                    y: dragNodeStart.current.ny + (e.clientY - dragNodeStart.current.my),
                };
            }));
        } else if (draftEdge) {
            // Update draft line mouse pos
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
                setDraftEdge({
                    ...draftEdge,
                    mouseX: e.clientX - rect.left - pan.x,
                    mouseY: e.clientY - rect.top - pan.y
                });
            }
        } else if (isPanning) {
            setPan({
                x: panStart.current.px + (e.clientX - panStart.current.x),
                y: panStart.current.py + (e.clientY - panStart.current.y),
            });
        }
    };

    const onCanvasPointerUp = (e: React.PointerEvent) => {
        if (draggingNodeId) {
            setNodes(prev => { schedSave(prev, edges); return prev; });
            setDraggingNodeId(null);
        }
        if (draftEdge) {
            // Let's see if we dropped on another node
            const elements = document.elementsFromPoint(e.clientX, e.clientY);
            const targetNodeEl = elements.find(el => el.getAttribute('data-node-id'));
            
            if (targetNodeEl) {
                const targetId = targetNodeEl.getAttribute('data-node-id')!;
                if (targetId !== draftEdge.sourceNodeId) {
                    // Valid connection
                    const newEdge: EdgeData = {
                        id: crypto.randomUUID?.() ?? Date.now().toString(36),
                        source: draftEdge.isSourceOut ? draftEdge.sourceNodeId : targetId,
                        target: draftEdge.isSourceOut ? targetId : draftEdge.sourceNodeId
                    };
                    
                    // Don't duplicate edges
                    if (!edges.find(edge => edge.source === newEdge.source && edge.target === newEdge.target)) {
                        setEdges(prev => {
                            const next = [...prev, newEdge];
                            schedSave(nodes, next);
                            return next;
                        });
                        addLog('Established topology connection', 'success');
                    }
                }
            }
            setDraftEdge(null);
        }
        setIsPanning(false);
    };

    const startNodeDrag = (e: React.PointerEvent, node: NodeData) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedId(node.id);
        setDraggingNodeId(node.id);
        dragNodeStart.current = { mx: e.clientX, my: e.clientY, nx: node.x, ny: node.y };
        (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
    };

    const startAnchorDrag = (e: React.PointerEvent, nodeId: string, isSourceOut: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            setDraftEdge({
                sourceNodeId: nodeId,
                isSourceOut,
                mouseX: e.clientX - rect.left - pan.x,
                mouseY: e.clientY - rect.top - pan.y
            });
            (containerRef.current as HTMLElement)?.setPointerCapture(e.pointerId);
        }
    };

    const onCtxMenu = (e: React.MouseEvent, nodeId?: string) => {
        if (draftEdge) return;
        e.preventDefault();
        e.stopPropagation();
        setCtxMenu({ x: e.clientX, y: e.clientY, nodeId });
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-[#a855f7] border-t-transparent animate-spin" />
                    <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest">Loading canvas…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 relative overflow-hidden bg-[#050505]">
            {/* Grid background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                    backgroundPosition: `${pan.x % 32}px ${pan.y % 32}px`,
                }}
            />

            {/* Top toolbar */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111] border border-white/[0.07] text-[10px] font-mono text-white/30">
                    <Circle size={5} fill="#4ade80" strokeWidth={0} className="text-[#4ade80]" />
                    {lastSaved ? `Saved ${lastSaved}` : 'Canvas ready'}
                </div>
                <button
                    onClick={() => { setPan({ x: 0, y: 0 }); }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#111] border border-white/[0.07] text-[10px] font-mono text-white/30 hover:text-white/60 hover:border-white/20 transition-colors flex items-center gap-1.5"
                >
                    <RefreshCw size={10} /> Reset view
                </button>
            </div>

            {/* Empty state */}
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                    <Plus size={32} className="text-white/10 mb-4" />
                    <p className="text-[11px] font-mono text-white/20 uppercase tracking-widest">Right-click to add your first node</p>
                </div>
            )}

            {/* Canvas interaction surface */}
            <div
                ref={containerRef}
                className={`absolute inset-0 ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onContextMenu={(e) => onCtxMenu(e)}
                onClick={() => setSelectedId(null)}
            >
                {/* Transform layer */}
                <div style={{ transform: `translate(${pan.x}px, ${pan.y}px)`, position: 'absolute', inset: 0 }}>
                    
                    {/* Edges SVG Layer */}
                    <svg className="absolute inset-0 overflow-visible pointer-events-none z-0">
                        {edges.map(edge => {
                            const sourceNode = nodes.find(n => n.id === edge.source);
                            const targetNode = nodes.find(n => n.id === edge.target);
                            if (!sourceNode || !targetNode) return null;
                            
                            // Right side of source node (w-44 = 176px)
                            const sx = sourceNode.x + 176;
                            const sy = sourceNode.y + 30; // approx center vertically
                            // Left side of target node
                            const tx = targetNode.x;
                            const ty = targetNode.y + 30;
                            
                            return (
                                <path 
                                    key={edge.id}
                                    d={generateBezierPath(sx, sy, tx, ty)}
                                    fill="none"
                                    stroke="url(#purpleGlow)"
                                    strokeWidth="2"
                                    className="opacity-70 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                                />
                            );
                        })}

                        {/* Draft Edge */}
                        {draftEdge && (() => {
                            const sourceNode = nodes.find(n => n.id === draftEdge.sourceNodeId);
                            if (!sourceNode) return null;
                            const sx = draftEdge.isSourceOut ? sourceNode.x + 176 : sourceNode.x;
                            const sy = sourceNode.y + 30;
                            const tx = draftEdge.mouseX;
                            const ty = draftEdge.mouseY;
                            
                            return (
                                <path 
                                    d={generateBezierPath(draftEdge.isSourceOut ? sx : tx, draftEdge.isSourceOut ? sy : ty, draftEdge.isSourceOut ? tx : sx, draftEdge.isSourceOut ? ty : sy)}
                                    fill="none"
                                    stroke="#a855f7"
                                    strokeWidth="2"
                                    strokeDasharray="4 4"
                                    className="animate-pulse"
                                />
                            );
                        })()}

                        <defs>
                            <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
                                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Nodes Layer */}
                    {nodes.map(node => (
                        <div key={node.id} data-node-id={node.id} className="absolute z-10" style={{ transform: `translate(${node.x}px, ${node.y}px)` }}>
                            <CanvasNode
                                node={{...node, x: 0, y: 0}} // Transform applied to parent wrapper for Hit detection
                                selected={selectedId === node.id}
                                onClick={() => setSelectedId(node.id === selectedId ? null : node.id)}
                                onPointerDown={(e) => startNodeDrag(e, node)}
                                onAnchorDragStart={startAnchorDrag}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Context menu */}
            {ctxMenu && (
                <ContextMenu
                    x={ctxMenu.x}
                    y={ctxMenu.y}
                    nodeId={ctxMenu.nodeId}
                    onClose={() => setCtxMenu(null)}
                    onAdd={(type) => addNode(type, ctxMenu.x, ctxMenu.y)}
                    onDelete={() => {
                        if (ctxMenu.nodeId) deleteNode(ctxMenu.nodeId);
                    }}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// Node Config Slide-over Panel
// ─────────────────────────────────────────
function NodeConfigPanel({ node, onClose, onUpdate }: { node: NodeData; onClose: () => void; onUpdate: (nd: NodeData) => void }) {
    const [title, setTitle] = useState(node.title);
    const [addr, setAddr] = useState(node.data?.address || '');
    const [webhook, setWebhook] = useState(node.data?.webhook || '');
    
    // Sync state if node changes externally
    useEffect(() => {
        setTitle(node.title);
        setAddr(node.data?.address || '');
        setWebhook(node.data?.webhook || '');
    }, [node]);

    const handleSave = () => {
        onUpdate({
            ...node,
            title,
            data: { ...node.data, address: addr, webhook }
        });
    };

    return (
        <aside className="w-80 shrink-0 border-l border-white/[0.06] bg-[#0a0a0a] flex flex-col absolute right-0 top-0 bottom-0 z-30 shadow-2xl">
            <div className="px-4 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <NodeIcon type={node.type} size={16} />
                    <span className="font-semibold text-sm text-white/90">Node Config</span>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/80 transition-colors">
                    <X size={15} />
                </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-6">
                {/* General Settings */}
                <div className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Node Title</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-[#111] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#a855f7]/50" 
                    />
                </div>

                {/* Specific Settings */}
                {node.type === 'wallet' && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Tracked Address</label>
                        <input 
                            type="text" 
                            placeholder="0x..."
                            value={addr}
                            onChange={(e) => setAddr(e.target.value)}
                            className="w-full bg-[#111] border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-[#a855f7]/50" 
                        />
                    </div>
                )}

                {node.type === 'bot' && (
                    <div className="space-y-3">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-white/40">Strategy Webhook</label>
                        <input 
                            type="text" 
                            placeholder="https://api..."
                            value={webhook}
                            onChange={(e) => setWebhook(e.target.value)}
                            className="w-full border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-white font-mono outline-none focus:border-[#a855f7]/50" 
                            style={{ backgroundColor: '#111' }}
                        />
                    </div>
                )}
                
                {(node.type === 'contract' || node.type === 'api') && (
                    <div className="p-3 bg-[#a855f7]/10 border border-[#a855f7]/20 rounded-lg">
                        <p className="text-[11px] text-[#a855f7] leading-relaxed">Advanced config requires institutional tier subscription.</p>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-white/[0.06]">
                <button
                    onClick={handleSave}
                    className="w-full py-2.5 rounded-lg bg-[#a855f7] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#b06cf7] transition-colors"
                >
                    <Save size={15} /> Save Configuration
                </button>
            </div>
        </aside>
    );
}

// ─────────────────────────────────────────
// Activity Tab — Unified UI + Backend Core Logs
// ─────────────────────────────────────────
function ActivityTab() {
    const { logs: localLogs, clearLogs } = useDashboardStore();
    const [backendLogs, setBackendLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/logs');
                const json = await res.json();
                if (mounted && json.data) {
                    setBackendLogs(json.data);
                }
            } catch (e) {
                console.error(e);
            }
            if (mounted) setLoading(false);
        };
        
        // Initial fetch
        fetchLogs();
        
        // Poll every 10 seconds for Heartbeat logs
        const interval = setInterval(fetchLogs, 10000);
        return () => { mounted = false; clearInterval(interval); };
    }, []);

    // Merge UI logs and Backend Core logs
    const unifiedLogs = [
        ...localLogs.map(l => ({ id: l.id, time: l.time, msg: l.msg, type: l.type, source: 'UI' })),
        ...backendLogs.map(l => {
            const d = new Date(l.createdAt);
            return {
                id: l.id,
                time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`,
                msg: l.message,
                type: l.level,
                source: l.source.toUpperCase()
            };
        })
    ].sort((a, b) => b.id.localeCompare(a.id)); // Crude sort by CUID/Date

    return (
        <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-sm font-semibold text-white/80">System Activity</h2>
                    {!loading && <span className="flex h-2 w-2 rounded-full bg-[#4ade80] animate-pulse" title="Core Engine Connected"></span>}
                </div>
                <button onClick={clearLogs} className="text-[10px] font-mono text-white/30 hover:text-white/60 uppercase tracking-widest px-2 py-1 rounded bg-white/5">
                    Clear UI Logs
                </button>
            </div>
            
            {unifiedLogs.length === 0 ? (
                <div className="text-center text-white/20 text-xs font-mono py-10 border border-dashed border-white/10 rounded-xl flex flex-col items-center gap-2">
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin"></div>
                            Connecting to Engine Database...
                        </>
                    ) : (
                        "No activity recorded in the database or current session."
                    )}
                </div>
            ) : (
                <div className="space-y-1 font-mono text-xs">
                    {unifiedLogs.map(log => {
                        let colorClass = 'text-white/50';
                        if (log.type === 'success') colorClass = 'text-[#4ade80]';
                        if (log.type === 'warning') colorClass = 'text-[#f59e0b]';
                        if (log.type === 'error') colorClass = 'text-red-400';
                        if (log.type === 'info') colorClass = 'text-[#38bdf8]';
                        
                        return (
                            <div key={log.id} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] px-2 rounded transition-colors -mx-2">
                                <span className="text-white/20 shrink-0 w-16 align-top">{log.time}</span>
                                <span className={`shrink-0 w-20 text-[9px] uppercase tracking-widest bg-white/[0.03] px-1 py-0.5 rounded text-center ${log.source === 'UI' ? 'text-white/30' : 'text-[#a855f7] border border-[#a855f7]/30'}`}>
                                    [{log.source}]
                                </span>
                                <span className={`${colorClass} leading-[1.4]`}>{log.msg}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// Settings Tab
// ─────────────────────────────────────────
function SettingsTab() {
    return (
        <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-sm font-semibold text-white/80 mb-6">Settings</h2>
            <div className="space-y-4 max-w-md">
                <Section title="Device Bridge">
                    <SovereignBridge />
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/[0.07] overflow-hidden" style={{ backgroundColor: '#111' }}>
            <div className="px-4 py-3 border-b border-white/[0.06]">
                <span className="text-[11px] font-mono uppercase tracking-widest text-white/40">{title}</span>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

// ─────────────────────────────────────────
// Portfolio Tab — Live Wagmi Data
// ─────────────────────────────────────────
function PortfolioTab() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });
    const { addLog } = useDashboardStore();

    useEffect(() => {
        if (isConnected && address) {
            addLog(`Portfolio synced with wallet ${address.slice(0, 6)}...${address.slice(-4)}`, 'success');
        }
    }, [isConnected, address, addLog]);

    return (
        <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-sm font-semibold text-white/80 mb-6">Portfolio</h2>
            
            {isConnected && address ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="rounded-xl border border-[#4ade80]/20 bg-[#4ade80]/5 p-4 shadow-[0_0_20px_rgba(74,222,128,0.05)]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#4ade80]">Native Balance</span>
                                <span className="text-[#4ade80]"><TrendingUp size={14} /></span>
                            </div>
                            <div className="text-2xl font-semibold text-white">
                                {balance?.formatted ? parseFloat(balance.formatted).toFixed(4) : '0.0000'} <span className="text-sm text-white/40">{balance?.symbol}</span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-white/[0.07] bg-[#111] p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">Active Nodes</span>
                                <span className="text-white/20"><Zap size={14} /></span>
                            </div>
                            <div className="text-xl font-semibold text-white/70">Live Topology</div>
                        </div>

                        <div className="rounded-xl border border-white/[0.07] bg-[#111] p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">System Alerts</span>
                                <span className="text-white/20"><AlertTriangle size={14} /></span>
                            </div>
                            <div className="text-xl font-semibold text-white/70">No incidents</div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.07] p-5" style={{ backgroundColor: '#111' }}>
                        <h3 className="text-xs font-semibold text-white/80 mb-4">Connected Wallet</h3>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] font-mono text-sm">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#4ade80] opacity-80" />
                            <span className="text-white/80">{address}</span>
                            <span className="ml-auto text-[10px] uppercase tracking-widest text-[#4ade80] bg-[#4ade80]/10 px-2 py-1 rounded">Connected</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="rounded-xl border border-white/[0.07] py-16 text-center flex flex-col items-center" style={{ backgroundColor: '#111' }}>
                    <Wallet size={32} className="text-white/10 mb-4" />
                    <p className="text-sm font-semibold text-white/60 mb-2">No Wallet Connected</p>
                    <p className="text-xs text-white/30 font-mono max-w-xs leading-relaxed">
                        Connect your Web3 wallet via the main terminal hub to aggregate live on-chain data here.
                    </p>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// Sidebar nav item
// ─────────────────────────────────────────
function NavItem({ icon, label, active, onClick }: {
    icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                    ? 'bg-white/[0.07] text-white'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
            }`}
        >
            <span className={active ? 'text-[#a855f7]' : 'text-current'}>{icon}</span>
            <span className="font-medium">{label}</span>
            {active && <ChevronRight size={12} className="ml-auto text-white/20" />}
        </button>
    );
}

// ─────────────────────────────────────────
// Dashboard Shell — the main export
// ─────────────────────────────────────────
export function DashboardShell() {
    const [tab, setTab] = useState<Tab>('canvas');
    const [bridgeOpen, setBridgeOpen] = useState(false);
    
    // Lift state so Shell can pass to Canvas & Config Panel
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [nodes, setNodes] = useState<NodeData[]>([]);

    const selectedNode = nodes.find(n => n.id === selectedId);

    const handleNodeUpdate = (updatedNode: NodeData) => {
        setNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
        // Autosave handled in Canvas implicitly when DB loads, but we should trigger it manually here ideally.
        // For now, next canvas interaction saves it.
    };

    const navItems: { id: Tab; icon: React.ReactNode; label: string }[] = [
        { id: 'canvas', icon: <LayoutDashboard size={15} />, label: 'Operations Canvas' },
        { id: 'portfolio', icon: <Wallet size={15} />, label: 'Portfolio' },
        { id: 'activity', icon: <Terminal size={15} />, label: 'Activity' },
        { id: 'settings', icon: <Settings size={15} />, label: 'Settings' },
    ];

    return (
        <div data-dashboard="true" className="flex text-white" style={{ position: 'fixed', inset: 0, zIndex: 100, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#080808', color: '#ffffff' }}>

            {/* ── LEFT SIDEBAR ── */}
            <aside className="dashboard-shell-aside w-52 shrink-0 flex flex-col">
                {/* Wordmark */}
                <div className="px-4 py-4 border-b border-white/[0.06]">
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">Operations V2</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-2 space-y-0.5">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={tab === item.id}
                            onClick={() => { setTab(item.id); setSelectedId(null); }}
                        />
                    ))}
                </nav>

                {/* Bottom Tools */}
                <div className="p-2 border-t border-white/[0.06] space-y-1">
                    <button
                        onClick={() => setBridgeOpen(v => !v)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            bridgeOpen ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                        }`}
                    >
                        <QrCode size={14} />
                        <span className="font-medium text-sm">Device Bridge</span>
                    </button>
                    
                    <Link
                        href="/"
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
                    >
                        <Home size={14} />
                        <span className="font-medium text-sm">Terminal Hub</span>
                    </Link>
                </div>
            </aside>

            {/* ── MAIN AREA ── */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Top bar */}
                <header className="dashboard-shell-header h-12 shrink-0 flex items-center px-4 gap-3 z-20">
                    <span className="text-sm font-medium text-white/60">
                        {navItems.find(n => n.id === tab)?.label}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">humanidfi.com/dashboard</span>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden relative">
                    {tab === 'canvas' && (
                        <>
                            <div className={`flex-1 transition-all duration-300 ${selectedNode ? 'mr-80' : ''}`}>
                                <OperationsCanvas 
                                    selectedId={selectedId} 
                                    setSelectedId={setSelectedId} 
                                    nodes={nodes}
                                    setNodes={setNodes}
                                />
                            </div>
                            
                            {/* Node property slide-over */}
                            {selectedNode && (
                                <NodeConfigPanel 
                                    node={selectedNode} 
                                    onClose={() => setSelectedId(null)} 
                                    onUpdate={handleNodeUpdate}
                                />
                            )}
                        </>
                    )}
                    {tab === 'portfolio' && <PortfolioTab />}
                    {tab === 'activity' && <ActivityTab />}
                    {tab === 'settings' && <SettingsTab />}
                </div>
            </div>

            {/* ── DEVICE BRIDGE DRAWER ── */}
            {bridgeOpen && (
                <aside className="w-72 shrink-0 border-l border-white/[0.06] bg-[#0a0a0a] flex flex-col z-30 shadow-2xl">
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-white/70">Device Bridge</p>
                            <p className="text-[10px] font-mono text-white/30 mt-0.5">Generate QR on PC → scan on mobile</p>
                        </div>
                        <button onClick={() => setBridgeOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
                            <X size={14} />
                        </button>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
                        <SovereignBridge />
                    </div>
                </aside>
            )}
        </div>
    );
}
