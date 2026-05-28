"use client";

import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// ─── Roadmap Data ─────────────────────────────────────────────────────────────

interface RoadmapNode {
  id: string;
  title: string;
  status: 'live' | 'building' | 'planned';
  quarter: string;
  description: string;
  x: number;
  y: number;
}

interface RoadmapEdge {
  from: string;
  to: string;
}

const NODES: RoadmapNode[] = [
  // Live
  { id: 'm1-connect', title: 'ZK Connect Logic', status: 'live', quarter: 'Milestone 1', description: 'Real-time Aztec network connection and EIP-712 wallet generation using Zustand and Wagmi.', x: 100, y: 140 },
  { id: 'm1-ui', title: 'Whale Network UI', status: 'live', quarter: 'Milestone 1', description: 'Advanced zero-knowledge protocol interface deployed with 60FPS GPU animations.', x: 100, y: 300 },
  
  // Building (Milestone 2)
  { id: 'm2-portfolio', title: 'Portfolio State Proofs', status: 'building', quarter: 'Milestone 2', description: 'Integration with Noir circuits to read balances and UTXOs seamlessly without leaking metadata.', x: 450, y: 140 },
  { id: 'm2-registry', title: 'Global Network State', status: 'building', quarter: 'Milestone 2', description: 'Live monitoring of Aztec network nodes, privacy sets, and encrypted transaction streams.', x: 450, y: 300 },

  // Live (Milestone 3)
  { id: 'm3-mobile', title: 'Mobile Finalization', status: 'live', quarter: 'Milestone 3', description: 'Native iOS/Android apps finalization. ZK-secured QR synchronization flawlessly across devices.', x: 800, y: 140 },
  
  // Planned (Milestone 4)
  { id: 'm3-mainnet', title: 'Final Mainnet Launch', status: 'planned', quarter: 'Milestone 4', description: 'Seamless, privacy-preserving cross-device wallet experience deployed to Aztec mainnet.', x: 800, y: 300 },
];

const EDGES: RoadmapEdge[] = [
  { from: 'm1-connect', to: 'm2-portfolio' },
  { from: 'm1-ui', to: 'm2-registry' },
  { from: 'm2-portfolio', to: 'm3-mobile' },
  { from: 'm2-registry', to: 'm3-mainnet' },
];

const STATUS_CONFIG = {
  live:     { label: 'Active',     dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]',       text: 'text-emerald-400',       border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
  building: { label: 'In Audit',   dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]',    text: 'text-amber-400',    border: 'border-amber-500/40', bg: 'bg-amber-500/10' },
  planned:  { label: 'Planned',    dot: 'bg-slate-600',    text: 'text-slate-500',    border: 'border-slate-800', bg: 'bg-slate-900/50' },
};

const NODE_W = 240;
const NODE_H = 100;

// ─── Canvas Component ─────────────────────────────────────────────────────────

function RoadmapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 100, y: 100, scale: 0.95 });
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<RoadmapNode | null>(null);
  const dragStart = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null);

  const CANVAS_W = 1740;
  const CANVAS_H = 620;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    const { mx, my, tx, ty } = dragStart.current;
    const dx = e.clientX - mx;
    const dy = e.clientY - my;
    setTransform(t => ({ ...t, x: tx + dx, y: ty + dy }));
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setTransform(t => {
      const next = Math.min(2, Math.max(0.3, t.scale + delta));
      return { ...t, scale: next };
    });
  }, []);

  const zoomIn  = () => setTransform(t => ({ ...t, scale: Math.min(2, t.scale + 0.15) }));
  const zoomOut = () => setTransform(t => ({ ...t, scale: Math.max(0.3, t.scale - 0.15) }));
  const reset   = () => setTransform({ x: 100, y: 100, scale: 0.95 });

  function edgePath(from: RoadmapNode, to: RoadmapNode) {
    const x1 = from.x + NODE_W;
    const y1 = from.y + NODE_H / 2;
    const x2 = to.x;
    const y2 = to.y + NODE_H / 2;
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#050505]">
      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full flex-1 overflow-hidden"
        style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        {/* Glowing orb background */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />

        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: `${32 * transform.scale}px ${32 * transform.scale}px`,
            backgroundPosition: `${transform.x}px ${transform.y}px`,
          }}
        />

        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            width: CANVAS_W,
            height: CANVAS_H,
            position: 'absolute',
          }}
        >
          {/* Quarter labels */}
          {[
            { label: 'Milestone 1', x: 100 },
            { label: 'Milestone 2', x: 450 },
            { label: 'Milestone 3 & 4', x: 800 },
          ].map(q => (
            <div
              key={q.label}
              style={{ position: 'absolute', left: q.x, top: -20, width: NODE_W }}
              className="flex items-center"
            >
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="px-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                {q.label}
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>
          ))}

          {/* SVG Edges */}
          <svg
            style={{ position: 'absolute', top: 0, left: 0, width: CANVAS_W, height: CANVAS_H, pointerEvents: 'none', overflow: 'visible' }}
          >
            {EDGES.map(e => {
              const fromNode = NODES.find(n => n.id === e.from);
              const toNode   = NODES.find(n => n.id === e.to);
              if (!fromNode || !toNode) return null;
              
              const isLive = fromNode.status === 'live' && toNode.status === 'live';
              const strokeColor = isLive ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.05)';
              
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(fromNode, toNode)}
                  stroke={strokeColor}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={toNode.status === 'planned' ? '6 6' : undefined}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {NODES.map(node => {
            const cfg = STATUS_CONFIG[node.status];
            const isSelected = selected?.id === node.id;
            return (
              <motion.div
                key={node.id}
                data-node="true"
                whileHover={{ scale: 1.02, y: -2 }}
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y + 24,
                  width: NODE_W,
                  minHeight: NODE_H,
                }}
                className={`backdrop-blur-md border rounded-xl transition-all duration-300 cursor-pointer select-none overflow-hidden ${
                  isSelected ? `ring-2 ring-emerald-500/50 ${cfg.border} ${cfg.bg}` : `${cfg.border} ${cfg.bg} hover:border-white/30 hover:shadow-xl`
                }`}
                onClick={() => setSelected(isSelected ? null : node)}
              >
                {/* Glow effect at the top of live cards */}
                {node.status === 'live' && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-emerald-500/0 opacity-70" />
                )}
                
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                      <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-[14px] font-semibold tracking-wide text-white/90 leading-snug">
                    {node.title}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[700px] border border-white/10 bg-[#0a0a0c]/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 flex items-start gap-6 z-30"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selected.status].dot}`} />
              <span className={`font-mono text-[11px] font-bold uppercase tracking-wider ${STATUS_CONFIG[selected.status].text}`}>
                {selected.quarter} · {STATUS_CONFIG[selected.status].label}
              </span>
            </div>
            <h3 className="text-[18px] font-bold tracking-tight text-white mb-2">{selected.title}</h3>
            <p className="text-[14px] text-white/60 leading-relaxed">{selected.description}</p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white"
          >
            ×
          </button>
        </motion.div>
      )}
      
      {/* Toolbar */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2 px-3 py-2 border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-md rounded-xl shadow-lg">
        <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 font-bold text-lg leading-none">−</button>
        <button onClick={zoomIn}  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/60 font-bold text-lg leading-none">+</button>
        <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
        <button onClick={reset}   className="px-3 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-[10px] font-mono font-bold uppercase tracking-wider text-white/60">Center</button>
      </div>
    </div>
  );
}
