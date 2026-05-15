"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Terminal, Lock, Activity, Server, Globe, Cpu, ShieldCheck, Database, Key } from "lucide-react";
import { SovereignFooter } from "@/components/landing/SovereignFooter";
import { RemoteLottie } from "@/components/ui/RemoteLottie";

const FADE_UP: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// ─── COMPONENTS ───

const BuilderAnnouncements = () => {
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('https://api.github.com/repos/ethereum/go-ethereum/commits?per_page=3')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCommits(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto py-24 px-6 lg:px-12">
      <div className="flex flex-col mb-16 gap-4">
        
        <h2 className="text-[36px] md:text-[48px] font-black uppercase text-[#0A0A0A] leading-none tracking-tight">
          Infrastructure <span className="text-[#0044CC]">Releases.</span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-3 text-center py-32 font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400 bg-white border border-black/5 rounded-[2.5rem]">
             <div className="w-4 h-4 rounded-full bg-[#0044CC] animate-ping mx-auto mb-4" />
             Synchronizing core repository state...
           </div>
        ) : commits.map((c, i) => {
          const dateStr = new Date(c.commit.author.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const sha = c.sha.slice(0, 7);
          const fullMsg = c.commit.message as string;
          const title = fullMsg.split('\n')[0];
          const desc = fullMsg.split('\n').slice(1).join(' ').trim() || "Core protocol architectural update and optimization.";

          return (
            <motion.div 
               key={i}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "-50px" }}
               variants={FADE_UP}
               transition={{ delay: i * 0.1 }}
               className="group relative bg-white p-10 border border-black/5 rounded-[2.5rem] flex flex-col justify-between hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
            >
               <div className="relative z-10">
                 <div className="font-mono text-[10px] uppercase tracking-[0.2em] font-black text-slate-400 mb-8 flex items-center justify-between gap-2">
                   <div className="flex items-center gap-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#0044CC] animate-pulse" /> {dateStr}
                   </div>
                   <span className="text-[#0044CC] bg-[#0044CC]/10 px-3 py-1 rounded-full">SHA: {sha}</span>
                 </div>
                 <h3 className="font-sans text-[22px] font-black uppercase tracking-tight text-[#0A0A0A] mb-4 leading-tight line-clamp-3">
                    {title}
                 </h3>
                 <p className="font-serif text-slate-500 text-[15px] leading-relaxed mb-8 line-clamp-4">
                    {desc}
                 </p>
               </div>
               <a href={c.html_url} target="_blank" rel="noopener noreferrer" className="relative z-10 w-full flex justify-center items-center gap-3 px-6 py-4 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#0A0A0A] dark:text-white hover:bg-[#0044CC] hover:text-white transition-all group-hover:shadow-md cursor-pointer">
                  Inspect Diff <ArrowRight size={14} />
               </a>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default function DeveloperLanding() {
  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-[#0044CC]/20 overflow-x-hidden">

      {/* ── MASSIVE NESTR HERO ── */}
      <section className="pt-40 pb-20 px-6 lg:px-12 max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        
        <div className="w-full lg:w-1/2 space-y-10 relative z-10 text-center lg:text-left">
          
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[48px] sm:text-[64px] lg:text-[80px] font-black text-[#0A0A0A] leading-[0.95] tracking-tighter uppercase">
            Build on the <br />
            <span className="text-[#0044CC]">Mempool.</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[18px] sm:text-[20px] font-medium text-slate-500 leading-relaxed font-serif max-w-2xl mx-auto lg:mx-0">
            For quantitative engineers and high-frequency trading desks. We provide programmatic, zero-latency access to the global blockchain mempool via REST, WebSocket, and Webhook interfaces.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start pt-4">
            <a href="/docs/developer/overview" className="flex items-center justify-center gap-4 px-10 py-5 w-full sm:w-auto bg-[#0044CC] text-white rounded-2xl text-[14px] font-bold tracking-wide hover:bg-[#003399] transition-colors shadow-lg">
              Read the Docs <ArrowRight size={18} />
            </a>
            <a href="#releases" className="flex items-center justify-center gap-4 px-10 py-5 w-full sm:w-auto bg-white border border-black/5 text-[#0A0A0A] rounded-2xl text-[14px] font-bold tracking-wide hover:bg-slate-50 transition-colors shadow-sm">
              View Commits
            </a>
          </motion.div>
        </div>
        
        <div className="w-full lg:w-1/2 relative aspect-square flex items-center justify-center bg-white dark:bg-[#0A0A0A] rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm p-12 overflow-hidden">
            <div className="flex flex-col items-center justify-center gap-4 text-[#0a0a0a] dark:text-white opacity-20">
                <Terminal size={64} strokeWidth={1} />
                <span className="font-mono text-sm tracking-widest uppercase font-bold">Protocol Interface</span>
            </div>
        </div>

      </section>

      {/* ── BENTO ARCHITECTURE BLOCKS ── */}
      <section className="py-32 px-6 lg:px-12 bg-white border-t border-black/5">
        <div className="max-w-[1400px] mx-auto space-y-32">
            
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h2 className="text-[40px] md:text-[56px] font-black uppercase text-[#0A0A0A] tracking-tight leading-none">
                    Core <span className="text-[#0044CC]">Infrastructure.</span>
                </h2>
                <p className="font-serif text-[18px] text-slate-500 leading-relaxed">
                    Designed for maximum throughput and minimum latency. The Protocol is built using state-of-the-art Rust indexers and distributed Kafka streams.
                </p>
            </div>

            {/* Block 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <div className="w-full lg:w-1/2 order-2 lg:order-1 bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm p-12 flex items-center justify-center aspect-square">
                    <div className="flex flex-col items-center justify-center gap-4 text-[#0a0a0a] dark:text-white opacity-20">
                        <Globe size={64} strokeWidth={1} />
                        <span className="font-mono text-sm tracking-widest uppercase font-bold">Distributed Memory</span>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center">
                        <Server size={24} className="text-[#0044CC]" />
                    </div>
                    <h3 className="text-[36px] sm:text-[48px] font-black text-[#0A0A0A] uppercase tracking-tight leading-none">
                        Distributed Memory Mesh.
                    </h3>
                    <p className="font-serif text-[18px] text-slate-500 leading-relaxed">
                        To achieve sub-100ms latency globally, we bypass traditional database queries. Our entire real-time state is held in an active Redis and Kafka memory mesh, allowing instantaneous retrieval of complex wallet clusters before the data is committed to cold storage.
                    </p>
                </div>
            </div>

            {/* Block 2 */}
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                <div className="w-full lg:w-1/2 space-y-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#0044CC]/10 flex items-center justify-center">
                        <Lock size={24} className="text-[#0044CC]" />
                    </div>
                    <h3 className="text-[36px] sm:text-[48px] font-black text-[#0A0A0A] uppercase tracking-tight leading-none">
                        Cryptographic E2E Security.
                    </h3>
                    <p className="font-serif text-[18px] text-slate-500 leading-relaxed">
                        Data is not just transmitted; it is mathematically verified. Every WebSocket payload is signed using your unique API Key derived from your Ethereum wallet signature. We employ strict mutual TLS (mTLS) for all institutional data streams.
                    </p>
                </div>
                <div className="w-full lg:w-1/2 bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm p-12 flex items-center justify-center aspect-square">
                    <div className="flex flex-col items-center justify-center gap-4 text-[#0a0a0a] dark:text-white opacity-20">
                        <Lock size={64} strokeWidth={1} />
                        <span className="font-mono text-sm tracking-widest uppercase font-bold">E2E Security</span>
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* ── BUILDER ANNOUNCEMENTS ── */}
      <section id="releases" className="bg-transparent border-t border-black/5 dark:border-white/5">
        <BuilderAnnouncements />
      </section>
      
      <SovereignFooter />
    </div>
  );
}
