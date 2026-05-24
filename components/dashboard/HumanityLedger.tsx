"use client";

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MermaidDiagram } from '@/components/privacy/MermaidDiagram';

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
  // Q1 2025 - Foundation
  { id: 'pxe', title: 'Private Execution Environment', status: 'live', quarter: 'Q1 2025', description: 'Local Aztec PXE initialized and integrated. All state transitions proven client-side.', x: 100, y: 140 },
  { id: 'wallet', title: 'Wallet Connection', status: 'live', quarter: 'Q1 2025', description: 'MetaMask and EIP-1193 compatible wallet bridge. Supports Ethereum and Aztec accounts.', x: 100, y: 300 },

  // Q2 2025 - Core Protocol
  { id: 'noir', title: 'Noir Circuit Deployment', status: 'live', quarter: 'Q2 2025', description: 'Core Noir circuits compiled and deployed: private transfer, note commitment, nullifier generation.', x: 380, y: 80 },
  { id: 'identity', title: 'ZK Identity Layer', status: 'live', quarter: 'Q2 2025', description: 'Biometric liveness proofs and Identity integration. One human, one verified account.', x: 380, y: 220 },
  { id: 'whale', title: 'Whale Network v1', status: 'live', quarter: 'Q2 2025', description: 'Real-time on-chain capital flow monitoring across 20+ blockchain networks.', x: 380, y: 360 },

  // Q3 2025 - Intelligence
  { id: 'alerts', title: 'Alert Engine', status: 'live', quarter: 'Q3 2025', description: 'Configurable alert conditions on large transfers, exchange flows, and wallet activations.', x: 660, y: 140 },
  { id: 'portfolio', title: 'Portfolio Dashboard', status: 'live', quarter: 'Q3 2025', description: 'Aggregated private portfolio view. Balances remain shielded; position data never leaves the device.', x: 660, y: 280 },
  { id: 'ledger', title: 'Block Explorer', status: 'live', quarter: 'Q3 2025', description: 'Privacy-respecting block explorer for Aztec L2 state. Verifiable commitments, no data exposure.', x: 660, y: 420 },

  // Q4 2025 - Compliance & Security
  { id: 'disclosure', title: 'Selective Disclosure SDK', status: 'building', quarter: 'Q4 2025', description: 'Viewing key generation and ZK range proofs for regulatory and audit compliance.', x: 940, y: 80 },
  { id: 'multisig', title: 'Threshold Multi-Signature', status: 'building', quarter: 'Q4 2025', description: 'M-of-N signing proven inside a ZK circuit. Signer identities remain hidden from public observers.', x: 940, y: 240 },
  { id: 'bridge', title: 'Cross-Chain Bridge', status: 'building', quarter: 'Q4 2025', description: 'Encrypted asset transfers between Aztec L2 and Ethereum L1. Capital flows invisible to analysis.', x: 940, y: 400 },

  // Q1 2026 - Scale
  { id: 'rwa', title: 'Real World Asset Integration', status: 'planned', quarter: 'Q1 2026', description: 'Tokenization of real-world assets on Aztec under smart contract custody.', x: 1220, y: 140 },
  { id: 'darkpool', title: 'Dark Pool Liquidity', status: 'planned', quarter: 'Q1 2026', description: 'Blind order matching via ZK proofs and multi-party computation. MEV extraction made impossible.', x: 1220, y: 300 },
  { id: 'governance', title: 'Decentralized Governance', status: 'planned', quarter: 'Q1 2026', description: 'Cryptographic voting with full voter anonymity on L2. Protocol upgrades governed by verified participants.', x: 1220, y: 460 },

  // Q2 2026 - Ecosystem
  { id: 'sdk', title: 'Developer SDK', status: 'planned', quarter: 'Q2 2026', description: 'Embeddable SDK for browsers and mobile. PXE initialization, proving, and submission abstracted completely.', x: 1500, y: 200 },
  { id: 'sandbox', title: 'Developer Sandbox', status: 'planned', quarter: 'Q2 2026', description: 'Local CLI and GUI environment simulating L1/L2. Full note, nullifier, and witness visualization.', x: 1500, y: 380 },
];

const EDGES: RoadmapEdge[] = [
  { from: 'pxe', to: 'noir' },
  { from: 'wallet', to: 'identity' },
  { from: 'wallet', to: 'whale' },
  { from: 'noir', to: 'alerts' },
  { from: 'identity', to: 'portfolio' },
  { from: 'whale', to: 'portfolio' },
  { from: 'whale', to: 'ledger' },
  { from: 'alerts', to: 'disclosure' },
  { from: 'portfolio', to: 'multisig' },
  { from: 'ledger', to: 'bridge' },
  { from: 'disclosure', to: 'rwa' },
  { from: 'multisig', to: 'darkpool' },
  { from: 'bridge', to: 'governance' },
  { from: 'rwa', to: 'sdk' },
  { from: 'darkpool', to: 'sdk' },
  { from: 'governance', to: 'sandbox' },
];

const STATUS_CONFIG = {
  live:     { label: 'Live',     dot: 'bg-black',       text: 'text-black',       border: 'border-black' },
  building: { label: 'Building', dot: 'bg-black/40',    text: 'text-black/60',    border: 'border-black/40' },
  planned:  { label: 'Planned',  dot: 'bg-black/15',    text: 'text-black/35',    border: 'border-black/15' },
};

const NODE_W = 200;
const NODE_H = 88;

// ─── Canvas Component ─────────────────────────────────────────────────────────

function RoadmapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 40, y: 60, scale: 0.9 });
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
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    setTransform(t => ({ ...t, x: dragStart.current!.tx + dx, y: dragStart.current!.ty + dy }));
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
  const reset   = () => setTransform({ x: 40, y: 60, scale: 0.9 });

  // Build edge path between node centers
  function edgePath(from: RoadmapNode, to: RoadmapNode) {
    const x1 = from.x + NODE_W;
    const y1 = from.y + NODE_H / 2;
    const x2 = to.x;
    const y2 = to.y + NODE_H / 2;
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
  }

  return (
    <div className="relative w-full flex flex-col gap-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/8 bg-white">
        <div className="flex items-center gap-5">
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-black/45">{v.label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-black/30 mr-2">Drag to pan · Scroll to zoom</span>
          <button onClick={zoomOut} className="w-8 h-8 flex items-center justify-center border border-black/12 hover:bg-black/[0.03] transition-colors text-black/60 font-bold text-lg leading-none">−</button>
          <button onClick={zoomIn}  className="w-8 h-8 flex items-center justify-center border border-black/12 hover:bg-black/[0.03] transition-colors text-black/60 font-bold text-lg leading-none">+</button>
          <button onClick={reset}   className="px-3 h-8 flex items-center justify-center border border-black/12 hover:bg-black/[0.03] transition-colors text-[11px] font-mono font-bold uppercase tracking-wider text-black/50">Reset</button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-white"
        style={{ height: 540, cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        {/* Dot grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
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
            { label: 'Q1 2025', x: 100 },
            { label: 'Q2 2025', x: 380 },
            { label: 'Q3 2025', x: 660 },
            { label: 'Q4 2025', x: 940 },
            { label: 'Q1 2026', x: 1220 },
            { label: 'Q2 2026', x: 1500 },
          ].map(q => (
            <div
              key={q.label}
              style={{ position: 'absolute', left: q.x, top: 0, width: NODE_W }}
              className="flex items-center justify-center"
            >
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-black/25">
                {q.label}
              </span>
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
              return (
                <path
                  key={`${e.from}-${e.to}`}
                  d={edgePath(fromNode, toNode)}
                  stroke="rgba(0,0,0,0.12)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray={toNode.status === 'planned' ? '5 4' : undefined}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {NODES.map(node => {
            const cfg = STATUS_CONFIG[node.status];
            const isSelected = selected?.id === node.id;
            return (
              <div
                key={node.id}
                data-node="true"
                style={{
                  position: 'absolute',
                  left: node.x,
                  top: node.y + 24,
                  width: NODE_W,
                  minHeight: NODE_H,
                }}
                className={`bg-white border transition-all duration-150 cursor-pointer select-none ${
                  isSelected ? 'border-black shadow-md' : `${cfg.border} hover:border-black/40 hover:shadow-sm`
                }`}
                onClick={() => setSelected(isSelected ? null : node)}
              >
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className={`font-mono text-[9px] font-black uppercase tracking-wider ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold tracking-tight text-black leading-snug">
                    {node.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2 }}
          className="border-t border-black/8 bg-white px-6 py-5 flex items-start gap-6"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[selected.status].dot}`} />
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black/40">
                {selected.quarter} · {STATUS_CONFIG[selected.status].label}
              </span>
            </div>
            <h3 className="text-[15px] font-black tracking-tight text-black mb-1.5">{selected.title}</h3>
            <p className="text-[13px] text-black/55 leading-relaxed max-w-[640px]">{selected.description}</p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="shrink-0 w-8 h-8 flex items-center justify-center border border-black/12 hover:bg-black/[0.03] transition-colors text-black/40 font-bold text-lg leading-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HumanityLedger() {
  return (
    <div className="w-full h-full min-h-0 flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-8 border-b border-black/8">
        <div className="max-w-[900px]">
          <h1 className="text-[22px] font-black tracking-tight text-black mb-2">
            Protocol Roadmap
          </h1>
          <p className="text-[13.5px] text-black/50 leading-relaxed">
            The development timeline for Humanity Ledger on Aztec Network. Drag the canvas to explore,
            scroll to zoom, and click any node for details.
          </p>
        </div>
      </div>

      {/* Roadmap Canvas */}
      <div className="flex-1 min-h-0">
        <RoadmapCanvas />
      </div>

      {/* Architecture summary below */}
      <div className="border-t border-black/8 px-6 py-8 bg-white">
        <div className="max-w-[900px] grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[12px] font-mono font-black uppercase tracking-wider text-black/35 mb-3">Layer Architecture</h3>
            <ul className="space-y-1.5">
              {['Client proving via Aztec PXE', 'L2 sequencing and proof verification', 'L1 Ethereum settlement and finality'].map(i => (
                <li key={i} className="flex gap-2 text-[13px] text-black/60 leading-snug">
                  <span className="mt-[5px] w-1 h-1 rounded-full bg-black/25 shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-mono font-black uppercase tracking-wider text-black/35 mb-3">Core Technologies</h3>
            <ul className="space-y-1.5">
              {['Noir circuit language', 'Barretenberg proving backend', 'UltraPlonk constraint system', 'CRYSTALS-Dilithium signatures'].map(i => (
                <li key={i} className="flex gap-2 text-[13px] text-black/60 leading-snug">
                  <span className="mt-[5px] w-1 h-1 rounded-full bg-black/25 shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] font-mono font-black uppercase tracking-wider text-black/35 mb-3">Network Integrations</h3>
            <ul className="space-y-1.5">
              {['Whale Alert Network (real-time flows)', 'Zero-Knowledge Identity (Sybil resistance)', 'XMTP (encrypted messaging)', 'Ethereum L1 (settlement)'].map(i => (
                <li key={i} className="flex gap-2 text-[13px] text-black/60 leading-snug">
                  <span className="mt-[5px] w-1 h-1 rounded-full bg-black/25 shrink-0" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Explanations and Quantum Precision Diagrams */}
        <div className="mt-16 max-w-[900px] border-t border-black/8 pt-12">
          <h2 className="text-[22px] font-black tracking-tight text-black mb-4">
            System Architecture & Deep Dive Explanations
          </h2>
          <p className="text-[14px] text-black/60 leading-[1.8] mb-8">
            The Humanity Ledger is built upon a radically decentralized and privacy-preserving stack. By unifying high-frequency on-chain telemetry (Whale Network) with absolute cryptographic privacy (Aztec Layer 2), we've created an environment where capital flows can be analyzed without exposing the observer's identity. 
            All analytical computation executes strictly within a zero-knowledge execution environment on the user's localized hardware. There are no SaaS intermediaries. There is no cloud telemetry.
          </p>
          
          <h3 className="text-[16px] font-black tracking-tight text-black mb-4">Core Telemetry & Ingestion Flow</h3>
          <p className="text-[14px] text-black/60 leading-[1.8] mb-6">
            Raw block data and mempool streams are ingested via dedicated, failover-resistant RPC nodes. This unindexed data feeds directly into local Worker Nodes which perform Z-Score pattern analysis and EIP-2929 thermodynamics evaluations, mapping capital velocity into a localized Neo4j graph database.
          </p>
          
          <MermaidDiagram 
            chart={`
graph TD
    subgraph "Public Ecosystem"
        RPC[RPC Node Clusters] -->|Raw Block Data| M[Mempool Streams]
    end
    subgraph "Localized Vault Processing"
        M --> W[Whale Worker Node]
        W -->|Z-Score Eval| DB1[(Neo4j Graph)]
        W -->|Tx Vitals| DB2[(Redis/Upstash)]
        W -->|State| DB3[(Prisma/Postgres)]
        DB1 --> AG[Analytics Engine]
        DB2 --> AG
        DB3 --> AG
    end
    subgraph "Secure Client Delivery"
        AG -->|Encrypted WebSocket| UI[Next.js Client Terminal]
        UI -->|ZK Circuit| AZ[Aztec Shielded Pool]
    end
    style RPC fill:#fafafa,stroke:#333
    style W fill:#fff,stroke:#000,stroke-width:2px
    style UI fill:#050505,stroke:#000,color:#fff
            `} 
            caption="Thermodynamic Data Ingestion and Local Processing Pipeline" 
          />

          <h3 className="text-[16px] font-black tracking-tight text-black mt-12 mb-4">Zero-Knowledge Sybil Resistance</h3>
          <p className="text-[14px] text-black/60 leading-[1.8] mb-6">
            To prevent network degradation from algorithmic bots and malicious institutional swarms, the network implements a localized biometric liveness verification standard. When a user authenticates, their wallet generates a zk-SNARK proof of personhood. The root address is completely obfuscated through a cryptographic nullifier hash.
          </p>

          <MermaidDiagram 
            chart={`
sequenceDiagram
    participant User
    participant LocalClient as Local Client
    participant ZK as ZK Circuit
    participant Validator as Network Validator
    User->>LocalClient: Request Access
    LocalClient->>User: Request Signature
    User->>LocalClient: Signed Message (EIP-191)
    LocalClient->>ZK: Generate Proof (No PII)
    ZK->>LocalClient: Return ZK-SNARK
    LocalClient->>Validator: Submit SNARK & Nullifier
    Validator-->>LocalClient: Accept Proof (True/False)
    LocalClient-->>User: Grant Encrypted Session
            `}
            caption="Zero-Knowledge Authentication and Verification Sequence" 
          />

        </div>
      </div>
    </div>
  );
}
