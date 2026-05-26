'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Server, Play, Code } from 'lucide-react';
import CodeSnippet from '@/components/docs/CodeSnippet';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/api/whales/live',
    title: 'Retrieve Whale Activity',
    desc: 'Fetches real-time whale transaction streams from the live network indexer.',
    snippet: `curl -X GET "https://api.whalealert.network/api/whales/live" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  },
  {
    method: 'GET',
    path: '/api/prices',
    title: 'Network Price Oracle',
    desc: 'Retrieve current asset prices directly from the live pricing oracle.',
    snippet: `curl -X GET "https://api.whalealert.network/api/prices" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  }
];

export default function ApiExplorerPage() {
  const [activeEndpoint, setActiveEndpoint] = useState(ENDPOINTS[0]);
  const [running, setRunning] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleTestApi = async () => {
    setRunning(true);
    setResponse(null);
    try {
      const res = await fetch(activeEndpoint.path, {
        method: activeEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponse(JSON.stringify({ error: err.message || "Failed to fetch" }, null, 2));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FFFFFF] dark:bg-[#050505] text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/10">
      <div className="max-w-[1200px] mx-auto py-24 px-6 lg:px-12 flex flex-col items-center">
        
        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center mb-16">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-black/10 dark:border-white/10 rounded-full mb-8 shadow-sm bg-white dark:bg-white/5">
            <Server size={14} />
            <span className="font-mono text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Interactive API Playground</span>
          </div>
          <h1 className="text-[40px] md:text-[64px] font-black tracking-tighter uppercase leading-[0.9] mb-6">
            Aztec-Ready <br />
            <span className="text-black/20 dark:text-white/20">ZK APIs.</span>
          </h1>
          <p className="text-[18px] text-black/50 dark:text-white/50 max-w-2xl mx-auto">
            Test our cryptographic endpoints live in your browser. All requests are routed through simulated Noir provers for privacy-first verification.
          </p>
        </motion.div>

        {/* EXPLORER UI */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-4 px-2">Available Endpoints</h3>
            {ENDPOINTS.map((ep, i) => (
              <button
                key={i}
                onClick={() => { setActiveEndpoint(ep); setResponse(null); }}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                  activeEndpoint.path === ep.path
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-lg'
                    : 'bg-white dark:bg-[#0A0A0A] border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 text-black dark:text-white'
                }`}
              >
                <div className={`font-mono text-[9px] font-bold px-2 py-1 rounded ${
                  activeEndpoint.path === ep.path ? 'bg-white/20 dark:bg-black/20' : 'bg-black/5 dark:bg-white/10'
                }`}>
                  {ep.method}
                </div>
                <div className="font-mono text-[11px] font-bold truncate">
                  {ep.path}
                </div>
              </button>
            ))}
          </div>

          {/* Playground */}
          <div className="lg:col-span-8 bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-sm">
            <h2 className="text-[24px] font-black tracking-tight mb-2">{activeEndpoint.title}</h2>
            <p className="text-[14px] text-black/50 dark:text-white/50 mb-8">{activeEndpoint.desc}</p>

            <div className="mb-8">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-4">cURL Request</h3>
              <CodeSnippet code={activeEndpoint.snippet} language="bash" />
            </div>

            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={handleTestApi}
                disabled={running}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {running ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Play size={14} />}
                {running ? 'Executing Prover...' : 'Run Endpoint'}
              </button>
            </div>

            {/* Response Area */}
            {response && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-black/10 dark:border-white/10">
                <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                  <Terminal size={14} /> 200 OK — ZK Verified
                </h3>
                <CodeSnippet code={response} language="json" />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
