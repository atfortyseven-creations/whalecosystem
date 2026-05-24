"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// === DATA ===
const ROADMAP_DATA = [
  {
    title: 'Core Platform',
    description: 'Live and operational Web3 platform with programmable privacy.',
    nodes: [
      { id: '1', label: 'Humanity Ledger', status: 'Complete', description: 'Real-time private on-chain scanner and indexer' },
      { id: '2', label: 'Whale Chat', status: 'Complete', description: 'End-to-end encrypted wallet-to-wallet messaging' },
      { id: '3', label: 'Portfolio', status: 'Complete', description: 'Token visualization and tracking with $QDs infrastructure' },
      { id: '4', label: 'News Module', status: 'Complete', description: 'Live news feed and updates' },
    ],
    connections: [['1', '2'], ['2', '3'], ['3', '4']]
  },
  {
    title: 'Community & Education',
    description: 'Educational resources and community engagement tools.',
    nodes: [
      { id: '5', label: 'Web3 Academy', status: 'Complete', description: 'Educational content and tutorials' },
      { id: '6', label: 'Encrypted Forum', status: 'Complete', description: 'Private community discussions' },
      { id: '7', label: 'System Status', status: 'Complete', description: 'Live operational status monitoring' },
      { id: '8', label: 'Privacy Protocol', status: 'Complete', description: 'Privacy protocol documentation' },
    ],
    connections: [['5', '6'], ['6', '7'], ['7', '8']]
  },
  {
    title: 'Advanced Features',
    description: 'Cross-device sync and advanced blockchain integration.',
    nodes: [
      { id: '9', label: 'QR Code Sync', status: 'Complete', description: 'Mobile-to-desktop session synchronization' },
      { id: '10', label: 'On-chain Signing', status: 'Complete', description: 'Blockchain transaction signing and minting' },
      { id: '11', label: 'Multi-chain Tracking', status: 'Complete', description: 'Whale movement tracking across chains' },
      { id: '12', label: 'Provenance Studio', status: 'Complete', description: 'Asset provenance and verification' },
    ],
    connections: [['9', '10'], ['10', '11'], ['11', '12']]
  },
  {
    title: 'Aztec & Noir Integration',
    description: 'Deep integration with Aztec Network and Noir circuits.',
    nodes: [
      { id: '13', label: 'Custom Noir Circuits', status: 'Complete', description: 'Custom circuits for private functionality' },
      { id: '14', label: 'Private State', status: 'Complete', description: 'Aztec private state integration' },
      { id: '15', label: 'ZK Proofs', status: 'Complete', description: 'Zero-knowledge proof implementation' },
      { id: '16', label: 'Confidential Execution', status: 'Complete', description: 'Aztec confidential execution environment' },
    ],
    connections: [['13', '14'], ['14', '15'], ['15', '16']]
  },
  {
    title: 'Infrastructure',
    description: 'Network stability and operational excellence.',
    nodes: [
      { id: '17', label: '7/7 Nodes', status: 'Complete', description: 'Full node network deployment' },
      { id: '18', label: 'Low Latency', status: 'Complete', description: 'Optimized network performance' },
      { id: '19', label: 'Zero Issues', status: 'Complete', description: 'Stable operational status' },
      { id: '20', label: 'Seed Equity', status: 'Complete', description: 'Seed equity section and documentation' },
    ],
    connections: [['17', '18'], ['18', '19'], ['19', '20']]
  },
  {
    title: 'Next Phase (Grant)',
    description: 'Planned enhancements with grant funding support.',
    nodes: [
      { id: '21', label: 'Security Audits', status: 'Upcoming', description: 'Independent audits of Noir circuits and contracts' },
      { id: '22', label: 'Mobile Apps', status: 'Upcoming', description: 'Native iOS and Android applications' },
      { id: '23', label: 'Ledger Expansion', status: 'Upcoming', description: 'Additional chains and enhanced capabilities' },
      { id: '24', label: '$QDs Infrastructure', status: 'Upcoming', description: 'Complete token infrastructure deployment' },
    ],
    connections: [['21', '22'], ['22', '23'], ['23', '24']]
  }
];

export default function RoadmapPage() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const getNodeStyle = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-slate-900 text-white border-slate-900';
      case 'In Progress':
        return 'bg-slate-100 text-slate-900 border-slate-900 border-2';
      case 'Upcoming':
        return 'bg-white text-slate-400 border-slate-300 border-2';
      default:
        return 'bg-white text-slate-400 border-slate-300 border-2';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return <CheckCircle2 size={16} className="text-white" />;
      case 'In Progress':
        return <Clock size={16} className="text-slate-900" />;
      case 'Upcoming':
        return <AlertCircle size={16} className="text-slate-400" />;
      default:
        return <AlertCircle size={16} className="text-slate-400" />;
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white text-slate-900 font-sans overflow-hidden flex flex-col relative">
      
      {/* HEADER */}
      <header className="p-8 md:p-12 z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative bg-slate-50 border-b border-slate-200">
        <Link href="/" className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <ArrowLeft size={24} />
        </Link>
        <div className="mt-8 md:mt-0 flex flex-col gap-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-tight">
            Roadmap
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-500 max-w-2xl">
            Our journey building a complete Web3 platform with programmable privacy on Aztec Network.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">Controls</h3>
            <div className="flex gap-2">
              <button onClick={zoomIn} className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors rounded-xl">
                <ZoomIn size={18} />
              </button>
              <button onClick={zoomOut} className="w-10 h-10 bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors rounded-xl">
                <ZoomOut size={18} />
              </button>
              <button onClick={resetView} className="w-10 h-10 bg-slate-200 text-slate-900 flex items-center justify-center hover:bg-slate-300 transition-colors rounded-xl">
                <Maximize size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-2xl">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">Status</h3>
             <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-900 rounded"></div>
                    <span className="font-bold text-slate-700">Complete</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-100 border-2 border-slate-900 rounded"></div>
                    <span className="font-bold text-slate-700">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-slate-300 rounded"></div>
                    <span className="font-bold text-slate-700">Upcoming</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* SWIMLANES (Draggable and Zoomable) */}
      <div 
        className="flex-1 overflow-hidden bg-slate-50 relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
          <motion.div 
            ref={contentRef}
            style={{ 
              scale,
              transformOrigin: 'center center',
              x: position.x,
              y: position.y
            }}
            className="p-8 min-w-[1400px] flex flex-col gap-8"
            animate={{ x: position.x, y: position.y, scale }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {ROADMAP_DATA.map((lane, index) => (
                <div key={index} className="flex border-b border-slate-200 pb-8 last:border-0">
                    
                    {/* Lane Header */}
                    <div className="w-[320px] shrink-0 p-8 bg-slate-100 border-2 border-slate-200 rounded-r-3xl flex flex-col justify-center">
                        <h2 className="text-2xl font-black text-slate-900 mb-3">{lane.title}</h2>
                        <p className="text-sm text-slate-500">{lane.description}</p>
                    </div>

                    {/* Nodes Area */}
                    <div className="flex-1 relative flex items-center pl-16">
                        {/* Connecting Line */}
                        <div className="absolute left-16 right-16 h-[2px] bg-slate-200 top-1/2 -translate-y-1/2"></div>
                        
                        <div className="flex justify-between w-full relative z-10">
                            {lane.nodes.map((node, i) => (
                                <div key={node.id} className="flex flex-col items-center">
                                    <div className="mb-3 flex items-center gap-2">
                                        {getStatusIcon(node.status)}
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{node.status}</span>
                                    </div>
                                    <div className={`
                                        px-5 py-4 font-black text-sm text-center w-[180px] min-h-[70px] flex flex-col items-center justify-center shadow-sm rounded-xl transition-all hover:shadow-md
                                        ${getNodeStyle(node.status)}
                                    `}>
                                        <span className="mb-1">{node.label}</span>
                                        {node.description && (
                                          <span className="text-[10px] font-normal opacity-70 leading-tight">{node.description}</span>
                                        )}
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
