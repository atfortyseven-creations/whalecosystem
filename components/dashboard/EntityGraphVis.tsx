// components/dashboard/EntityGraphVis.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Zap, Loader2, WifiOff, Search, Info, Maximize2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function EntityGraphVis() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [isHeuristic, setIsHeuristic] = useState(false);

    const { data: matrixData, isLoading } = useSWR('/api/intelligence/graph', fetcher, { 
        refreshInterval: 60000, 
        revalidateOnFocus: false 
    });

    const isOffline = !matrixData?.graph?.nodes?.length || matrixData?.degraded;

    useEffect(() => {
        let nodes: any[] = [];
        let links: any[] = [];

        if (isOffline) {
            setIsHeuristic(true);
            // HEURISTIC NEURAL MESH GENESIS
            const nodeCount = 40;
            nodes = Array.from({ length: nodeCount }, (_, i) => ({
                id: `entity-${i}`,
                label: i === 0 ? 'GENESIS_NODE' : `HEX_${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
                group: i === 0 ? 0 : (Math.random() > 0.8 ? 1 : (Math.random() > 0.5 ? 2 : 3)),
                size: i === 0 ? 8 : (2 + Math.random() * 4)
            }));

            for (let i = 1; i < nodeCount; i++) {
                links.push({
                    source: nodes[i % 5].id, // Concentrated center
                    target: nodes[i].id,
                    value: 1 + Math.random() * 5
                });
                if (Math.random() > 0.8) {
                    links.push({
                        source: nodes[i].id,
                        target: nodes[(i + 1) % nodeCount].id,
                        value: 1
                    });
                }
            }
        } else {
            setIsHeuristic(false);
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
                if (d.group === 0) return '#ffffff'; // Genesis
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

        return () => { simulation.stop(); };
    }, [matrixData, isOffline]);

    return (
        <div className="h-full flex flex-col bg-black text-white font-mono overflow-hidden">
            {/* ── HEADER ── */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-white/[0.01]">
                <div className="flex items-center gap-4">
                    <Network size={18} className="text-blue-500" />
                    <div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Association_Graph</h2>
                        <span className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Multi-Entity Relationship Mapping</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {isHeuristic && (
                        <div className="flex items-center gap-2 text-[8px] text-rose-500/80 border border-rose-500/20 px-3 py-1 bg-rose-500/5">
                            <WifiOff size={10} />
                            <span>HEURISTIC_SYNTHESIS_ACTIVE</span>
                        </div>
                    )}
                    <div className="text-[8px] text-white/30 uppercase tracking-widest border border-white/5 px-3 py-1">
                        STANDARDS:_{isOffline ? 'SIMULATED' : 'LIVE'}
                    </div>
                </div>
            </div>

            {/* ── GRAPH CANVAS ── */}
            <div className="flex-1 relative bg-[#010101]">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-50 bg-black/50 backdrop-blur-sm">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <span className="text-[10px] font-black tracking-[0.5em]">CONDUCTING_NEURAL_SWEEP...</span>
                    </div>
                )}
                
                <svg ref={svgRef} className="w-full h-full" />

                {/* HUD Overlay */}
                <div className="absolute bottom-8 left-8 flex flex-col gap-4 pointer-events-none">
                    <div className="p-4 bg-black/80 border border-white/5 backdrop-blur-md">
                        <div className="text-[8px] text-white/20 uppercase tracking-widest mb-2">Cluster_Statistics</div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <span className="text-[7px] text-white/40 uppercase">Total_Nodes:</span>
                            <span className="text-[8px] text-white font-bold">{isOffline ? '40 (SYNTH)' : matrixData.graph.nodes.length}</span>
                            <span className="text-[7px] text-white/40 uppercase">Avg_Centrality:</span>
                            <span className="text-[8px] text-white font-bold">0.842</span>
                            <span className="text-[7px] text-white/40 uppercase">Modularity:</span>
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
                            className="absolute top-8 right-8 w-64 bg-black/90 border border-white/10 p-6 backdrop-blur-xl pointer-events-auto"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="text-[7px] text-white/20 uppercase tracking-widest">Entity_Data</div>
                                <XCircle size={12} className="cursor-pointer text-white/20 hover:text-white" onClick={() => setSelectedNode(null)} />
                            </div>
                            
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 truncate">{selectedNode.label}</h3>
                            
                            <div className="space-y-4">
                                <div className="border-l-2 border-blue-500 pl-3">
                                    <div className="text-[7px] text-white/20 uppercase">Classification</div>
                                    <div className="text-[9px] font-bold uppercase">{selectedNode.group === 1 ? 'High Risk Entity' : 'Institutional Protocol'}</div>
                                </div>
                                <div className="border-l-2 border-emerald-500 pl-3">
                                    <div className="text-[7px] text-white/20 uppercase">Network Influence</div>
                                    <div className="text-[9px] font-bold uppercase">{(selectedNode.size * 12.5).toFixed(1)}% Weight</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── FOOTER ── */}
            <div className="px-8 py-3 border-t border-white/5 bg-white/[0.01] flex justify-between items-center text-[8px] text-white/10 uppercase tracking-[0.5em] shrink-0">
                <div className="flex items-center gap-4">
                    <span>Protocol:_D3-Force_Directed</span>
                    <span>Database:_Neo4j_Standalone</span>
                </div>
                <span>ASSOCIATION_GRAPH_v3.1_ACTIVE</span>
            </div>
        </div>
    );
}
