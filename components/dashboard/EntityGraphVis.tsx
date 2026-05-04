// components/dashboard/EntityGraphVis.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Zap, Loader2, WifiOff, Search, Info, Maximize2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { OmniExplorer } from './OmniExplorer';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function EntityGraphVis() {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [isHeuristic, setIsHeuristic] = useState(false);
    // mountKey increments on every mount, forcing SWR to bypass the stale cache
    // and do a fresh network fetch each time the user opens the Entity Graph tab.
    const [mountKey, setMountKey] = useState(0);

    const { data: matrixData, isLoading, mutate } = useSWR(
        `/api/intelligence/graph?t=${mountKey}`,
        fetcher,
        { refreshInterval: 0, revalidateOnFocus: false }
    );

    // Force a fresh fetch every time this component mounts (tab activation)
    useEffect(() => {
        setMountKey(Date.now());
        mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isOffline = !matrixData?.graph?.nodes?.length || matrixData?.degraded;

    useEffect(() => {
        let nodes: any[] = [];
        let links: any[] = [];

        if (matrixData?.graph?.nodes) {
            nodes = matrixData.graph.nodes;
            links = matrixData.graph.links;
        }

        if (!svgRef.current || !nodes.length) return;

        // ── ResizeObserver guard ────────────────────────────────────────────────
        // When this tab is first activated, the SVG parent container may not yet
        // have been laid out by the browser (clientWidth = 0). We observe the
        // container with ResizeObserver and only start the D3 simulation once we
        // get real non-zero dimensions, preventing the invisible-graph bug.
        const parent = svgRef.current.parentElement;
        if (!parent) return;

        let cleanupFn: (() => void) | null = null;
        let hasRun = false;

        const runD3 = (width: number, height: number) => {
            if (hasRun || !svgRef.current) return;
            hasRun = true;

        const d3Nodes = nodes.map(d => ({ ...d }));
        const d3Links = links.map(d => ({ ...d }));

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const g = svg.append("g");

        // Zoom capability for institutional-grade inspection
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => g.attr("transform", event.transform));

        svg.call(zoom as any);

        const simulation = d3.forceSimulation(d3Nodes as any)
            .force("link", d3.forceLink(d3Links).id((d: any) => d.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-400))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius((d: any) => (d.size * 6) + 10));

        const link = g.append("g")
            .selectAll("line")
            .data(d3Links)
            .join("line")
            .attr("stroke", "#ffffff10")
            .attr("stroke-width", (d: any) => Math.sqrt(d.value) * 0.5);

        const node = g.append("g")
            .selectAll("circle")
            .data(d3Nodes)
            .join("circle")
            .attr("r", (d: any) => d.size * 3)
            .attr("fill", (d: any) => {
                if (d.group === 0) return '#050505'; // Genesis
                if (d.group === 1) return '#FF3B30'; // High Risk
                if (d.group === 2) return '#00C076'; // Institutional
                return '#0052FF'; // Regular
            })
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                setSelectedNode(d);
                toast.success(`ENTITY_ANALYSIS: ${d.label}`);
            });

        const label = g.append("g")
            .selectAll("text")
            .data(d3Nodes)
            .join("text")
            .text((d: any) => d.label)
            .attr("font-size", "7px")
            .attr("dx", 12)
            .attr("dy", 3)
            .attr("fill", "#ffffff20")
            .attr("pointer-events", "none")
            .style("font-family", "monospace")
            .style("text-transform", "uppercase");

            simulation.on("tick", () => {
                link.attr("x1", (d: any) => (d.source as any).x)
                    .attr("y1", (d: any) => (d.source as any).y)
                    .attr("x2", (d: any) => (d.target as any).x)
                    .attr("y2", (d: any) => (d.target as any).y);

                node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
                label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
            });

            // Memory/CPU Leak Prevention via Page Visibility API
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    simulation.stop();
                } else {
                    simulation.alpha(0.3).restart();
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            cleanupFn = () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                simulation.stop();
            };
        };

        // Try immediately with current dimensions
        const immediateW = parent.clientWidth || 0;
        const immediateH = parent.clientHeight || 0;
        if (immediateW > 0 && immediateH > 0) {
            runD3(immediateW, immediateH);
        } else {
            // Dimensions not ready — wait for layout via ResizeObserver
            const ro = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        ro.disconnect();
                        runD3(width, height);
                        break;
                    }
                }
            });
            ro.observe(parent);
            cleanupFn = () => { ro.disconnect(); };
        }

        return () => { if (cleanupFn) cleanupFn(); };
    }, [matrixData, isOffline]);

    return (
        <div className="w-full h-full min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden p-2">
        {/* GRAPH PANEL */}
        <div className="flex-1 w-full flex flex-col bg-[#FFFFFF] !text-[#050505] border border-[#E5E5E5] rounded-2xl font-mono overflow-hidden shadow-sm shrink-0 min-h-0 relative z-10">
            {/* ── HEADER ── */}
            <div className="px-8 py-6 border-b border-[#E5E5E5] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
                <div className="flex items-center gap-4">
                    <Network size={18} className="text-[#050505]" />
                    <div>
                        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em]">ENTITY GRAPH</h2>
                        <span className="text-[8px] text-[#A0A0A0] uppercase tracking-widest mt-1">Multi-Entity Mapping</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {isHeuristic && (
                        <div className="flex items-center gap-2 text-[8px] text-[#FF3B30] border border-[#FF3B30]/30 px-3 py-1 bg-[#FF3B30]/5">
                            <WifiOff size={10} />
                            <span>HEURISTICS ACTIVE</span>
                        </div>
                    )}
                    <div className="text-[8px] text-[#888888] font-bold uppercase tracking-[0.2em] border border-[#E5E5E5] px-3 py-1">
                        STATE: {isOffline ? 'DEGRADED' : 'LIVE'}
                    </div>
                </div>
            </div>

            {/* ── GRAPH CANVAS ── */}
            <div className="flex-1 relative bg-[#FFFFFF]">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-50 bg-white/50 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-[#050505]" size={32} />
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[#050505]">INDEXING ENTITIES...</span>
                    </div>
                )}
                
                <svg ref={svgRef} className="w-full h-full" />

                {/* HUD Overlay */}
                <div className="absolute bottom-8 left-8 flex flex-col gap-4 pointer-events-none">
                    <div className="p-4 bg-white/80 border border-[#E5E5E5] backdrop-blur-md rounded">
                        <div className="text-[8px] font-bold text-[#A0A0A0] uppercase tracking-[0.1em] mb-2">GRAPH METRICS</div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <span className="text-[7px] text-[#A0A0A0] uppercase">TOTAL NODES:</span>
                            <span className="text-[8px] text-[#050505] font-bold">{matrixData?.graph?.nodes?.length || 0}</span>
                            <span className="text-[7px] text-[#A0A0A0] uppercase">TOTAL EDGES:</span>
                            <span className="text-[8px] text-[#050505] font-bold">{matrixData?.graph?.links?.length || 0}</span>
                        </div>
                    </div>

                    {/* Node Legend */}
                    <div className="p-4 bg-white/80 border border-[#E5E5E5] backdrop-blur-md rounded flex flex-col gap-2 mt-2">
                        <div className="text-[8px] font-bold text-[#A0A0A0] uppercase tracking-[0.1em] mb-1">NODE LEGEND</div>
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-[#050505]"><div className="w-2 h-2 rounded-full bg-[#050505]"></div> Genesis Node</div>
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-[#050505]"><div className="w-2 h-2 rounded-full bg-[#00C076]"></div> Institutional Hub</div>
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-[#050505]"><div className="w-2 h-2 rounded-full bg-[#0052FF]"></div> Regular Wallet</div>
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase text-[#050505]"><div className="w-2 h-2 rounded-full bg-[#FF3B30]"></div> High Risk Entity</div>
                    </div>
                </div>

                {/* Selection details */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-8 right-8 w-64 bg-white/95 border border-[#E5E5E5] rounded p-6 backdrop-blur-md pointer-events-auto shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="text-[7px] text-[#A0A0A0] font-bold uppercase tracking-[0.1em]">ENTITY DATA</div>
                                <XCircle size={12} className="cursor-pointer text-[#A0A0A0] hover:text-[#050505]" onClick={() => setSelectedNode(null)} />
                            </div>
                            
                            <h3 className="text-xs font-bold text-[#050505] uppercase tracking-[0.1em] mb-4 truncate">{selectedNode.label}</h3>
                            
                            <div className="space-y-4">
                                <div className="border-l-2 border-[#050505] pl-3">
                                    <div className="text-[7px] font-bold text-[#A0A0A0] uppercase tracking-widest">LAYER TYPE</div>
                                    <div className="text-[9px] font-bold uppercase text-[#050505]">
                                        {selectedNode.group === 0 ? 'GENESIS ORIGIN' : 
                                         selectedNode.group === 1 ? 'FLAGGED HIGH-RISK RECIPIENT' : 
                                         selectedNode.group === 2 ? 'INSTITUTIONAL LIQUIDITY HUB' : 
                                         'STANDARD PARTICIPANT WALLET'}
                                    </div>
                                </div>
                                <div className="border-l-2 border-[#0052FF] pl-3">
                                    <div className="text-[7px] font-bold text-[#A0A0A0] uppercase tracking-widest">WALLET ADDRESS</div>
                                    <div className="text-[9px] font-mono text-[#050505] break-all">{selectedNode.address || '—'}</div>
                                </div>
                                <div className="border-l-2 border-[#00C076] pl-3">
                                    <div className="text-[7px] font-bold text-[#A0A0A0] uppercase tracking-widest">NETWORK WEIGHT</div>
                                    <div className="text-[9px] font-bold uppercase text-[#050505]">{selectedNode.weight ?? selectedNode.size ?? '—'}</div>
                                </div>
                                <div className="border-l-2 border-[#FF3B30] pl-3">
                                    <div className="text-[7px] font-bold text-[#A0A0A0] uppercase tracking-widest">CONNECTIONS</div>
                                    <div className="text-[9px] font-bold uppercase text-[#050505]">{selectedNode.connections ?? '—'}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── FOOTER ── */}
            <div className="px-8 py-3 border-t border-[#E5E5E5] bg-[#FAF9F6] flex justify-between items-center text-[8px] font-bold text-[#A0A0A0] uppercase tracking-[0.2em] shrink-0">
                <div className="flex items-center gap-4">
                    <span>RENDER LAYER: D3</span>
                    <span>DATABASE: NEO4J CLUSTER</span>
                </div>
                <span>GRAPH VERIFIED</span>
            </div>
        </div>
        </div>
    );
}
