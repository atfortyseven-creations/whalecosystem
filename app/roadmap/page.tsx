"use client";

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// === DATA ===
const ROADMAP_DATA = [
  {
    title: 'Identity & Privacy',
    description: 'Zero-knowledge proofs applied to identity and transaction masking.',
    color: 'border-[#c4f344] bg-[#c4f344]/5 text-[#c4f344]',
    nodeColor: 'bg-[#c4f344] text-[#050e0d]',
    nodes: [
      { id: '1', label: 'Passkey Auth', status: 'Complete' },
      { id: '2', label: 'ZK-Proven TX', status: 'Complete' },
      { id: '3', label: 'Privacy Score', status: 'Complete' },
      { id: '4', label: 'Stealth Mode', status: 'Complete' },
    ],
    connections: [['1', '2'], ['2', '3'], ['3', '4']]
  },
  {
    title: 'Portfolio & Assets',
    description: 'Multi-chain aggregation, UTXO encryption, and deep whale analytics.',
    color: 'border-[#44f3e6] bg-[#44f3e6]/5 text-[#44f3e6]',
    nodeColor: 'bg-[#44f3e6] text-[#050e0d]',
    nodes: [
      { id: '5', label: 'Multi-chain Analytics', status: 'Complete' },
      { id: '6', label: 'Whale Tracking', status: 'Complete' },
      { id: '7', label: 'Live Signals', status: 'Complete' },
      { id: '8', label: 'Network Forensics', status: 'In Progress' },
    ],
    connections: [['5', '6'], ['6', '7'], ['7', '8']]
  },
  {
    title: 'Social & Communication',
    description: 'Verifiable reputation and secure, encrypted messaging.',
    color: 'border-[#f344d5] bg-[#f344d5]/5 text-[#f344d5]',
    nodeColor: 'bg-[#f344d5] text-[#050e0d]',
    nodes: [
      { id: '9', label: 'ZK Forum', status: 'Complete' },
      { id: '10', label: 'Secure Attachments', status: 'Complete' },
      { id: '11', label: 'PIN-Gated Chat', status: 'Complete' },
      { id: '12', label: 'XMTP Encryption', status: 'Complete' },
    ],
    connections: [['9', '10'], ['10', '11'], ['11', '12']]
  },
  {
    title: 'Security & Infrastructure',
    description: 'Robust architecture with enterprise-grade protection.',
    color: 'border-[#f36b44] bg-[#f36b44]/5 text-[#f36b44]',
    nodeColor: 'bg-[#f36b44] text-[#050e0d]',
    nodes: [
      { id: '13', label: 'Timelock Policy', status: 'Complete' },
      { id: '14', label: 'WAF / CSP', status: 'Complete' },
      { id: '15', label: '$250k Bug Bounty', status: 'Complete' },
      { id: '16', label: 'Noir Smart Contracts', status: 'Upcoming' },
    ],
    connections: [['13', '14'], ['14', '15'], ['15', '16']]
  }
];

export default function RoadmapPage() {
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => console.log(err));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050e0d] text-white font-sans overflow-hidden flex flex-col relative">
      
      {/* HEADER */}
      <header className="p-8 md:p-12 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative bg-[#020605]">
        <Link href="/" className="absolute top-4 left-4 p-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={24} />
        </Link>
        <div className="mt-8 md:mt-0 flex flex-col gap-6">
          <div className="flex items-center gap-6 mb-4">
             {/* Aztec Logo */}
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-[#c4f344] rounded-sm transform rotate-45 flex items-center justify-center">
                     <div className="w-4 h-4 bg-[#020605] rounded-sm"></div>
                 </div>
                 <span className="text-xl font-bold tracking-tight text-white">Aztec</span>
             </div>
             <div className="w-[1px] h-8 bg-white/10"></div>
             {/* Whale Alert Logo */}
             <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M20 12v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/><path d="M12 2v10"/><path d="M8 6l4-4 4 4"/></svg>
                 </div>
                 <span className="text-xl font-bold tracking-tight text-white">Whale Alert</span>
             </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif text-[#c4f344] tracking-tight leading-tight">
            Our Road <br />
            <span className="text-[#c4f344] italic">to the Future</span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-[#f344d5] max-w-2xl font-medium tracking-tight">
            Our journey towards a fully decentralized, privacy-preserving Identity & Portfolio Network.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-8">
          <div className="bg-[#0a1614] p-6 rounded-lg border border-[#1a2e2a]">
            <h3 className="text-[#44f3e6] text-sm font-bold uppercase mb-4 tracking-widest">How to use</h3>
            <div className="flex flex-col gap-2">
              <button onClick={zoomIn} className="w-12 h-12 bg-[#c4f344] text-[#050e0d] flex items-center justify-center hover:bg-[#b0df3d] transition-colors">
                <ZoomIn size={24} />
              </button>
              <button onClick={zoomOut} className="w-12 h-12 bg-[#c4f344] text-[#050e0d] flex items-center justify-center hover:bg-[#b0df3d] transition-colors">
                <ZoomOut size={24} />
              </button>
              <button onClick={toggleFullscreen} className="w-12 h-12 bg-[#c4f344] text-[#050e0d] flex items-center justify-center hover:bg-[#b0df3d] transition-colors mt-2">
                <Maximize size={24} />
              </button>
            </div>
          </div>

          <div className="bg-[#0a1614] p-6 rounded-lg border border-[#1a2e2a]">
             <h3 className="text-[#44f3e6] text-sm font-bold uppercase mb-4 tracking-widest">Milestone states</h3>
             <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-6 bg-[#c4f344]"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">Complete</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-6 border-2 border-[#c4f344] bg-[#c4f344]/20 flex items-center justify-center">
                        <div className="w-6 h-full bg-[#c4f344] ml-auto"></div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">In progress</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-6 border-2 border-[#c4f344]"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">Upcoming</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* SWIMLANES (Scrollable) */}
      <div className="flex-1 overflow-auto bg-[#0a1614] relative">
          <motion.div 
            style={{ scale, transformOrigin: '0 0' }}
            className="p-8 min-w-[1200px] flex flex-col gap-6"
          >
            {ROADMAP_DATA.map((lane, index) => (
                <div key={index} className="flex border-b-2 border-[#1a2e2a] pb-6 last:border-0">
                    
                    {/* Lane Header */}
                    <div className={`w-[300px] shrink-0 p-8 border-2 ${lane.color} rounded-r-3xl flex flex-col justify-center`}>
                        <h2 className="text-2xl font-bold mb-4">{lane.title}</h2>
                        <p className="text-sm opacity-80">{lane.description}</p>
                    </div>

                    {/* Nodes Area */}
                    <div className="flex-1 relative flex items-center pl-16">
                        {/* Connecting Line */}
                        <div className="absolute left-16 right-16 h-[2px] bg-[#1a2e2a] top-1/2 -translate-y-1/2"></div>
                        
                        <div className="flex justify-between w-full relative z-10">
                            {lane.nodes.map((node, i) => (
                                <div key={node.id} className="flex flex-col items-center">
                                    <div className="mb-4 text-[10px] uppercase font-bold text-white/50 tracking-widest">{node.status}</div>
                                    <div className={`
                                        px-6 py-4 font-bold text-sm text-center w-[160px] min-h-[60px] flex items-center justify-center shadow-lg
                                        ${node.status === 'Complete' ? lane.nodeColor : ''}
                                        ${node.status === 'In Progress' ? `border-2 border-current text-current bg-transparent bg-gradient-to-r from-transparent to-current/20` : ''}
                                        ${node.status === 'Upcoming' ? `border-2 border-current text-current bg-transparent` : ''}
                                    `}>
                                        {node.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            ))}
          </motion.div>
      </div>

    </div>
  );
}
