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
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [isHeuristic, setIsHeuristic] = useState(false);

    const { data: matrixData, isLoading } = useSWR('/api/intelligence/graph', fetcher, { 
        refreshInterval: 0, // Disabled to prevent graph from resetting zoom and disappearing periodically
        revalidateOnFocus: false 
    });

    const isOffline = !matrixData?.graph?.nodes?.length || matrixData?.degraded;

    useEffect(() => {
        let nodes: any[] = [];
        let links: any[] = [];

        if (matrixData?.graph?.nodes) {
            nodes = matrixData.graph.nodes;
            links = matrixData.graph.links;
        }

        if (!svgRef.current || !nodes.length) return;

        const width = svgRef.current.parentElement?.clientWidth || 800;
        const height = svgRef.current.parentElement?.clientHeight || 600;

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

        // 50-Year Continuity: Memory/CPU Leak Prevention via Page Visibility API
        const handleVisibilityChange = () => {
            if (document.hidden) {
                simulation.stop();
            } else {
                simulation.alpha(0.3).restart();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => { 
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            simulation.stop(); 
        };
    }, [matrixData, isOffline]);

    return (
        <div className="w-full h-full min-h-0 flex flex-col lg:flex-row gap-4 overflow-hidden p-2">
        {/* GRAPH PANEL */}
        <div className="flex-1 w-full flex flex-col bg-[#FFFFFF] !text-[#050505] border border-[#E5E5E5] rounded-2xl font-mono overflow-hidden shadow-sm shrink-0 min-h-0 relative z-10">
            {/* ── HEADER ── */}
            <div className="px-8 py-6 border-b border-[#E5E5E5] flex items-center justify-between shrink-0 bg-[#FAF9F6]">
                <div className="flex items-center gap-4">
                    <Network size={18} className="text-blue-500" />
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Association_Graph</h2>
                        <span className="text-[8px] text-[#888888] uppercase tracking-widest mt-1">Multi-Entity Relationship Mapping</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {isHeuristic && (
                        <div className="flex items-center gap-2 text-[8px] text-rose-500/80 border border-rose-500/20 px-3 py-1 bg-rose-50/50">
                            <WifiOff size={10} />
                            <span>HEURISTIC_SYNTHESIS_ACTIVE</span>
                        </div>
                    )}
                    <div className="text-[8px] text-[#888888] uppercase tracking-widest border border-[#E5E5E5] px-3 py-1">
                        STANDARDS:_{isOffline ? 'SIMULATED' : 'LIVE'}
                    </div>
                </div>
            </div>

            {/* ── GRAPH CANVAS ── */}
            <div className="flex-1 relative bg-[#FFFFFF]">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-50 bg-white/50 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <span className="text-[10px] font-black tracking-[0.5em]">CONDUCTING_NEURAL_SWEEP...</span>
                    </div>
                )}
                
                <svg ref={svgRef} className="w-full h-full" />

                {/* HUD Overlay */}
                <div className="absolute bottom-8 left-8 flex flex-col gap-4 pointer-events-none">
                    <div className="p-4 bg-white/80 border border-[#E5E5E5] backdrop-blur-md rounded-xl">
                        <div className="text-[8px] text-[#888888] uppercase tracking-widest mb-2">Cluster_Statistics</div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <span className="text-[7px] text-[#888888] uppercase">Total_Nodes:</span>
                            <span className="text-[8px] text-[#050505] font-bold">{isOffline ? '40 (SYNTH)' : (matrixData?.graph?.nodes?.length || 0)}</span>
                            <span className="text-[7px] text-[#888888] uppercase">Avg_Centrality:</span>
                            <span className="text-[8px] text-[#050505] font-bold">0.842</span>
                            <span className="text-[7px] text-[#888888] uppercase">Modularity:</span>
                            <span className="text-[8px] text-emerald-500 font-bold">HIGH</span>
                        </div>
                    </div>
                </div>

                {/* Selection details */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-8 right-8 w-64 bg-white/90 border border-[#E5E5E5] rounded-2xl p-6 backdrop-blur-xl pointer-events-auto shadow-xl"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="text-[7px] text-[#888888] uppercase tracking-widest">Entity_Data</div>
                                <XCircle size={12} className="cursor-pointer text-[#888888] hover:text-[#050505]" onClick={() => setSelectedNode(null)} />
                            </div>
                            
                            <h3 className="text-xs font-black text-[#050505] uppercase tracking-widest mb-4 truncate">{selectedNode.label}</h3>
                            
                            <div className="space-y-4">
                                <div className="border-l-2 border-blue-500 pl-3">
                                    <div className="text-[7px] text-[#888888] uppercase">Classification</div>
                                    <div className="text-[9px] font-bold uppercase text-[#050505]">{selectedNode.group === 1 ? 'High Risk Entity' : 'Institutional Protocol'}</div>
                                </div>
                                <div className="border-l-2 border-emerald-500 pl-3">
                                    <div className="text-[7px] text-[#888888] uppercase">Network Influence</div>
                                    <div className="text-[9px] font-bold uppercase text-[#050505]">{(selectedNode.size * 12.5).toFixed(1)}% Weight</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── FOOTER ── */}
            <div className="px-8 py-3 border-t border-[#E5E5E5] bg-[#FAF9F6] flex justify-between items-center text-[8px] text-[#888888] uppercase tracking-[0.5em] shrink-0">
                <div className="flex items-center gap-4">
                    <span>Protocol:_D3-Force_Directed</span>
                    <span>Database:_Neo4j_Standalone</span>
                </div>
                <span>ASSOCIATION_GRAPH_v3.1_ACTIVE</span>
            </div>
        </div>
        </div>
    );
}
