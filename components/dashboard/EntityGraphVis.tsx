"use client";

import React, { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import * as d3 from 'd3';
import { Network, Search, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function EntityGraphVis() {
    const svgRef = useRef<SVGSVGElement>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    const { data: matrixData, isLoading } = useSWR('/api/intelligence/graph', fetcher, { 
        refreshInterval: 60000, 
        revalidateOnFocus: false 
    });

    useEffect(() => {
        if (!matrixData?.graph || !svgRef.current) return;
        const width = svgRef.current.parentElement?.clientWidth || 800;
        const height = svgRef.current.parentElement?.clientHeight || 600;

        const nodes = matrixData.graph.nodes.map((d: any) => Object.create(d));
        const links = matrixData.graph.links.map((d: any) => Object.create(d));

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove(); // Clear prev

        svg.attr("viewBox", [0, 0, width, height].join(' '))
           .style("max-width", "100%")
           .style("height", "auto");

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius((d: any) => (d.size * 5) + 20));

        // Links
        const link = svg.append("g")
            .attr("stroke", "#333333")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", (d: any) => Math.sqrt(d.value));

        // Nodes
        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", (d: any) => Math.max(10, d.size * 3))
            .attr("fill", (d: any) => {
                if (d.group === 1) return '#FF3B30'; // MEV Bot
                if (d.group === 2) return '#D4AF37'; // Institutional
                return '#0052FF'; // Normal Whale
            })
            .attr("stroke", "#050505")
            .call(drag(simulation) as any)
            .on("click", (event, d) => {
                setSelectedNode(d);
                toast.success(`Entity Selected: ${d.label}`);
            });

        // Labels
        const label = svg.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .text((d: any) => d.label)
            .attr("font-size", "8px")
            .attr("dx", 15)
            .attr("dy", 4)
            .attr("fill", "#888888")
            .style("font-family", "monospace")
            .style("text-transform", "uppercase")
            .style("pointer-events", "none");

        simulation.on("tick", () => {
            link.attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y);

            label.attr("x", (d: any) => d.x)
                 .attr("y", (d: any) => d.y);
        });

        function drag(simulation: any) {
            function dragstarted(event: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            function dragged(event: any) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            function dragended(event: any) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        return () => {
            simulation.stop();
        };

    }, [matrixData]);

    return (
        <div className="w-full h-full flex flex-col bg-[#000000] text-white border border-[#222222]">
            <div className="px-6 py-4 border-b border-[#222222] bg-[#050505] flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <Network size={18} className="text-[#00FF55]" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-white">Neural Omni-Graph</h2>
                    <span className="ml-2 px-2 py-0.5 rounded-sm bg-[#00FF55]/10 border border-[#00FF55]/20 text-[9px] text-[#00FF55] uppercase font-bold">Live Mining</span>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-[#020202]">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-[#00FF55]" size={32} />
                        <span className="text-[10px] font-mono text-[#888888] tracking-widest">MINING NEURAL VECTORS...</span>
                    </div>
                ) : (
                    <svg ref={svgRef} className="w-full h-full cursor-crosshair" />
                )}
                
                {/* Overlay Panel */}
                {selectedNode && (
                    <div className="absolute top-4 right-4 w-64 bg-[#0a0a0a]/90 backdrop-blur-md border border-[#333333] p-4 font-mono shadow-2xl">
                        <div className="text-[10px] text-[#888888] uppercase mb-1">Entity ID</div>
                        <div className="text-xs font-bold text-white mb-4 truncate">{selectedNode.id}</div>
                        
                        <div className="text-[10px] text-[#888888] uppercase mb-1">Classification</div>
                        <div className={`text-xs font-bold mb-4 uppercase ${selectedNode.group === 1 ? 'text-[#FF3B30]' : selectedNode.group === 2 ? 'text-[#D4AF37]' : 'text-[#0052FF]'}`}>
                            {selectedNode.label}
                        </div>
                        
                        <div className="text-[10px] text-[#888888] uppercase mb-1">Node Weight</div>
                        <div className="text-xs font-bold text-emerald-400 capitalize flex items-center gap-2">
                           <Zap size={10} /> {(selectedNode.size * 10).toFixed(1)} PTL
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
