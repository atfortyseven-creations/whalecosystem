import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Shield, Globe, Cpu, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers | Whale Alert Network',
  description: 'Join the engineering and intelligence teams building the most trusted on-chain forensic platform for global institutions.',
  openGraph: {
    title: 'Careers | Whale Alert Network',
    description: 'Architect the global financial ledger. Remote-first, high-autonomy, and institutional scale.',
    url: 'https://humanidfi.com/careers',
    siteName: 'Whale Alert Network',
    images: [{ url: '/models/update/3d-shape-glowing-with-bright-holographic-colors.jpg', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
};

const CULTURE_PILLARS = [
  {
    id: "01",
    icon: <Shield size={18} className="text-[#050505]" />,
    title: "Cryptographic Integrity",
    text: "We build systems where trust is mathematically guaranteed, not promised. Our culture reflects this: we value transparency, verifiable results, and absolute intellectual honesty above all else."
  },
  {
    id: "02",
    icon: <Cpu size={18} className="text-[#050505]" />,
    title: "High-Velocity Execution",
    text: "Small, autonomous units. No bureaucratic friction. We deploy institutional-grade infrastructure rapidly by trusting our engineers to make executive decisions without redundant oversight."
  },
  {
    id: "03",
    icon: <Globe size={18} className="text-[#050505]" />,
    title: "Sovereign Operations",
    text: "We are globally distributed by design. Work asynchronously from anywhere. We compensate competitively, offering settlements in fiat or stablecoins to respect your financial sovereignty."
  }
];

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-[#FAF9F6] text-[#050505] selection:bg-[#00C076]/30 font-sans antialiased overflow-x-hidden">
      
      {/* ── Ambient Background Texture ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
         <div className="w-[800px] h-[800px] bg-black/[0.02] rounded-full blur-[120px] absolute -top-40 opacity-70" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] mx-auto px-6 sm:px-12 pt-32 pb-32 flex flex-col gap-24">
        
        {/* ── Hero Section ── */}
        <header className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 bg-white/50 backdrop-blur-sm shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/70">Global Recruitment Active</span>
          </div>
          
          <h1 className="text-[44px] md:text-[56px] font-black tracking-tighter leading-[1.05] text-[#050505]">
            Architect the Infrastructure <br className="hidden md:block"/> of Financial Truth.
          </h1>
          
          <p className="font-serif text-[17px] md:text-[19px] text-[#050505]/60 leading-[1.6] max-w-2xl">
            Whale Alert Network is the premier intelligence layer for the blockchain ecosystem. We are recruiting elite operators to build systems that analyze billions in capital flow for the world's leading institutions.
          </p>
        </header>

        {/* ── The Mandate (Why Join Us) ── */}
        <section className="w-full relative">
           <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-black/10 to-transparent" />
           <div className="pl-8 sm:pl-12 flex flex-col gap-12">
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#050505]/40">The Mandate</span>
                 <h2 className="text-[28px] font-bold tracking-tight text-[#050505]">An environment engineered for extreme competence.</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {CULTURE_PILLARS.map((pillar) => (
                  <div key={pillar.id} className="flex flex-col gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-white border border-black/10 flex items-center justify-center shadow-sm group-hover:border-[#00C076]/40 group-hover:bg-[#00C076]/5 transition-all duration-300">
                       {pillar.icon}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-[15px] font-bold tracking-tight text-[#050505]">
                        {pillar.title}
                      </h3>
                      <p className="font-serif text-[14px] text-[#050505]/60 leading-[1.7]">
                        {pillar.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </section>

        {/* ── Institutional Value Proposition ── */}
        <section className="w-full bg-white border border-black/10 rounded-[32px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
           <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-black/10">
              
              <div className="lg:col-span-2 p-10 sm:p-12 bg-[#050505] text-[#FAF9F6] flex flex-col justify-between relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#00C076]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                 <div className="relative z-10 flex flex-col gap-4">
                    <span className="w-10 h-px bg-white/20 mb-2" />
                    <h3 className="text-[24px] font-black tracking-tight leading-snug">
                      Your work becomes the market consensus.
                    </h3>
                    <p className="font-serif text-[14px] text-white/60 leading-[1.7]">
                      Every algorithm deployed, every interface refined, directly influences how traders, hedge funds, and sovereign entities interpret on-chain reality.
                    </p>
                 </div>
                 <div className="relative z-10 mt-12 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Scale: Global Operations</span>
                 </div>
              </div>

              <div className="lg:col-span-3 p-10 sm:p-12 flex flex-col justify-center gap-8 bg-white">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                       <h4 className="text-[13px] font-black uppercase tracking-widest text-[#050505]">Institutional Compensation</h4>
                       <p className="font-serif text-[13px] text-[#050505]/60 leading-[1.6]">
                         Top-percentile base salaries ranges ($80k–$160k). Fully transparent, paid seamlessly in your preferred fiat currency or stablecoins.
                       </p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-[13px] font-black uppercase tracking-widest text-[#050505]">Zero Micro-Management</h4>
                       <p className="font-serif text-[13px] text-[#050505]/60 leading-[1.6]">
                         We don't track hours, we track impact. You are given a mandate, absolute ownership, and the resources required to execute flawlessly.
                       </p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-[13px] font-black uppercase tracking-widest text-[#050505]">Asynchronous Mastery</h4>
                       <p className="font-serif text-[13px] text-[#050505]/60 leading-[1.6]">
                         No arbitrary meetings. Our communication is written, precise, and documented, allowing you to achieve deep focus anywhere on Earth.
                       </p>
                    </div>
                    <div className="flex flex-col gap-2">
                       <h4 className="text-[13px] font-black uppercase tracking-widest text-[#050505]">Hardware & Health</h4>
                       <p className="font-serif text-[13px] text-[#050505]/60 leading-[1.6]">
                         Premium equipment stipends for your workstation, continuous education budgets, and comprehensive wellness considerations.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ── Open Positions List ── */}
        <section className="flex flex-col w-full">
          <div className="w-full flex items-center justify-between pb-6 mb-2 border-b border-black/10">
            <h2 className="text-[20px] font-bold tracking-tight text-[#050505]">
              Active Operational Mandates
            </h2>
            <div className="px-3 py-1 rounded-full bg-black/5 text-[#050505] text-[10px] font-black font-mono uppercase tracking-[0.2em]">
              2 Open Roles
            </div>
          </div>
          
          <div className="flex flex-col">
            <Link 
              href="/careers/web3-educator" 
              className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 px-4 -mx-4 rounded-2xl hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-black/5 border border-transparent transition-all duration-300"
            >
               <div className="flex flex-col gap-2.5">
                 <h3 className="text-[18px] font-black tracking-tight text-[#050505] group-hover:text-[#00C076] transition-colors">
                   Senior Web3 Educator & Content Strategist
                 </h3>
                 <div className="flex items-center gap-3 font-mono text-[10px] text-[#050505]/50 uppercase tracking-[0.2em]">
                   <span className="text-[#050505]/80 font-bold">Content Architecture</span>
                   <span className="w-1 h-1 rounded-full bg-black/20" />
                   <span>Remote (Global)</span>
                   <span className="w-1 h-1 rounded-full bg-black/20" />
                   <span>Full-Time</span>
                 </div>
               </div>
               
               <div className="mt-6 sm:mt-0 flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 bg-white group-hover:border-[#00C076]/30 transition-colors">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#050505]">View Mandate</span>
                   <ChevronRight size={14} className="text-[#050505]/40 group-hover:text-[#00C076] transition-colors" />
                 </div>
               </div>
            </Link>

            <Link 
              href="/careers/protocol-security-researcher" 
              className="group flex flex-col sm:flex-row sm:items-center justify-between py-6 px-4 -mx-4 rounded-2xl hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-black/5 border border-transparent transition-all duration-300"
            >
               <div className="flex flex-col gap-2.5">
                 <h3 className="text-[18px] font-black tracking-tight text-[#050505] group-hover:text-[#00C076] transition-colors">
                   Protocol Security Researcher (Zero-Knowledge)
                 </h3>
                 <div className="flex items-center gap-3 font-mono text-[10px] text-[#050505]/50 uppercase tracking-[0.2em]">
                   <span className="text-[#050505]/80 font-bold">Cryptography</span>
                   <span className="w-1 h-1 rounded-full bg-black/20" />
                   <span>Remote (EU/US)</span>
                   <span className="w-1 h-1 rounded-full bg-black/20" />
                   <span>Full-Time</span>
                 </div>
               </div>
               
               <div className="mt-6 sm:mt-0 flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 bg-white group-hover:border-[#00C076]/30 transition-colors">
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#050505]">View Mandate</span>
                   <ChevronRight size={14} className="text-[#050505]/40 group-hover:text-[#00C076] transition-colors" />
                 </div>
               </div>
            </Link>
          </div>
        </section>

        {/* ── Spontaneous Application ── */}
        <section className="w-full flex flex-col items-center text-center p-12 bg-white border border-black/10 rounded-[32px] mt-8">
           <h3 className="text-[20px] font-black tracking-tight text-[#050505] mb-3">Don't see your specific expertise?</h3>
           <p className="font-serif text-[15px] text-[#050505]/60 max-w-lg mb-8">
             We are constantly expanding our cryptographic, engineering, and intelligence teams. If you are an elite operator, we want to know you.
           </p>
           <a 
             href="mailto:careers@humanidfi.com"
             className="flex items-center gap-3 px-6 py-3.5 bg-[#050505] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-lg"
           >
             Submit Spontaneous Application
             <ArrowRight size={14} />
           </a>
        </section>

      </div>
    </div>
  );
}
