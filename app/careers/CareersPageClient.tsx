"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Globe, Cpu, CheckCircle2, Clock, MapPin, DollarSign, Zap, Users, ChevronRight, Mail, Code } from 'lucide-react';
import { SovereignFooter } from '@/components/landing/SovereignFooter';
import { motion } from 'framer-motion';
import { RemoteLottie } from '@/components/ui/RemoteLottie';
import { OPEN_ROLES, BENEFITS } from './data';

export function CareersPageClient() {
  return (
    <div className="relative min-h-screen bg-transparent text-white font-sans antialiased overflow-x-hidden selection:bg-white/10">

      {/* ── NESTR HERO ── */}
      <header className="w-full bg-transparent pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white/5 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 overflow-hidden relative">
                
                <div className="w-full lg:w-1/2 relative z-10 space-y-6 lg:space-y-8 text-center lg:text-left">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/20 dark:bg-black/20 backdrop-blur-md border border-black/5 dark:border-white/5 rounded-full shadow-sm mx-auto lg:mx-0">
                        <Code size={14} className="text-[#0a0a0a] dark:text-white" />
                    </div>
                    
                    <h1 className="text-[40px] md:text-[56px] font-black uppercase tracking-tighter text-white leading-[0.95]">
                        Build the <br /><span className="text-black/30 dark:text-white/30">Protocol.</span>
                    </h1>
                    
                    <p className="font-sans text-[16px] md:text-[18px] text-white/60 leading-relaxed max-w-lg mx-auto lg:mx-0">
                        We track the largest capital flows in the world, in real time, with cryptographic precision. Join our engineering and intelligence teams to build the tools that give professional traders a forensic edge over the market.
                    </p>

                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 pt-4">
                        {['Engineering', 'Cryptography', 'Intelligence', 'Design'].map(tag => (
                        <div key={tag} className="px-5 py-2.5 bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/70 shadow-sm">
                            {tag}
                        </div>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-1/2 relative aspect-square md:aspect-video flex items-center justify-center bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-sm p-6 overflow-hidden">
                    <div className="flex flex-col items-center justify-center gap-4 text-white opacity-20">
                        <Users size={64} strokeWidth={1} />
                        <span className="font-mono text-sm tracking-widest uppercase font-bold">Global Operations</span>
                    </div>
                </div>

            </motion.div>
        </div>
      </header>

      <main className="max-w-[2560px] mx-auto px-5 sm:px-8 py-16 md:py-28 flex flex-col gap-20 md:gap-32 text-left items-start">

        {/* Open Positions */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 md:mb-12 pb-6 border-b border-black/10">
            <div>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-white/40 block mb-2">Active Roles</span>
              <h2 className="text-[28px] sm:text-[32px] md:text-[40px] font-black tracking-tight text-white leading-none">Open Positions</h2>
            </div>
            <div className="inline-flex items-center justify-center px-5 py-2.5 bg-white/10 border border-white/10 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white w-fit">
              {OPEN_ROLES.length} Open Roles
            </div>
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            {OPEN_ROLES.map(role => (
              <Link
                key={role.id}
                href={`/careers/${role.id}`}
                className="group block bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden hover:border-white/20 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6 sm:p-8 md:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 md:gap-8 mb-6 md:mb-8">
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-white/10 bg-white/10 text-white/60">
                          {role.department}
                        </span>
                        {role.badge && (
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full bg-[#0a0a0a] text-white">
                            {role.badge}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-[22px] sm:text-[26px] md:text-[32px] font-black tracking-tight text-white group-hover:text-white/70 transition-colors mb-4 leading-tight">
                        {role.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-6">
                        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-white/50">
                          <MapPin size={14} className="text-white/60" />
                          {role.location}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-white/50">
                          <Clock size={14} className="text-white/60" />
                          {role.type}
                        </div>
                        <div className="flex items-center gap-2 text-[12px] sm:text-[13px] font-bold text-white/50">
                          <DollarSign size={14} className="text-white/60" />
                          {role.salary}
                        </div>
                      </div>
                      
                      <p className="text-[14px] sm:text-[15px] text-white/50 leading-relaxed font-medium max-w-3xl">
                        {role.description}
                      </p>
                    </div>

                    {/* CTA */}
                    <div className="shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
                      <div className="inline-flex items-center justify-center w-full lg:w-auto gap-3 px-6 py-4 bg-white text-black rounded-xl text-[11px] font-black uppercase tracking-[0.2em] group-hover:bg-white/80 transition-colors">
                        View Mandate
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  <div className="flex flex-wrap items-center gap-2 pt-6 md:pt-8 border-t border-black/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 mr-2">Core Tech:</span>
                    {role.skills.map(skill => (
                      <span key={skill} className="text-[10px] sm:text-[11px] font-bold px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white/60 uppercase tracking-widest">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Culture & Benefits */}
        <section>
          <div className="mb-12 md:mb-16">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 block mb-2">Our Culture</span>
            <h2 className="text-[28px] sm:text-[32px] md:text-[40px] font-black tracking-tight text-[#0a0a0a] leading-none">Why Join Whale Alert Network</h2>
          </div>

          {/* Mission Statement */}
          <div className="mb-10 md:mb-12 bg-[#0a0a0a] rounded-2xl md:rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
              <div className="flex-1 max-w-2xl">
                <p className="text-[24px] sm:text-[32px] font-black tracking-tight text-white leading-tight mb-5">
                  Your work becomes the market consensus.
                </p>
                <p className="text-[15px] sm:text-[16px] text-white/60 leading-relaxed">
                  Every algorithm deployed, every interface refined, directly influences how traders, hedge funds, and professional entities interpret on-chain reality. We are not building another analytics dashboard — we are building the forensic layer of global finance.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/10 rounded-full w-fit">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white">Global Operations</span>
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-24">
            {BENEFITS.map(b => (
              <div key={b.title} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:border-white/20 hover:shadow-xl hover:shadow-black/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:border-white/20 transition-colors duration-300">
                  <b.icon size={20} className="text-white/60 group-hover:text-black transition-colors duration-300" />
                </div>
                <h3 className="text-[16px] sm:text-[18px] font-black tracking-tight text-white mb-3">{b.title}</h3>
                <p className="text-[13px] sm:text-[14px] text-white/50 leading-relaxed font-medium">{b.body}</p>
              </div>
            ))}
          </div>

          {/* Core Principles */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
              {[
                { icon: Shield, title: 'Cryptographic Integrity', body: 'We build systems where trust is mathematically guaranteed, not promised. Our culture reflects this: transparency, verifiable results, and absolute intellectual honesty above all else.' },
                { icon: Cpu, title: 'High-Velocity Execution', body: 'Small, autonomous units. No bureaucratic friction. We deploy professional-grade infrastructure rapidly by trusting our engineers to make executive decisions without redundant oversight.' },
                { icon: Globe, title: 'Global Operations', body: 'Globally distributed by design. Work asynchronously from anywhere. We compensate competitively in fiat or stablecoins to respect your financial privacy.' },
              ].map((p, i) => (
                <div key={i} className="p-8 sm:p-12 flex flex-col gap-5 hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <p.icon size={20} className="text-white/80" />
                  </div>
                  <div>
                    <h3 className="text-[16px] sm:text-[18px] font-black tracking-tight text-white mb-3">{p.title}</h3>
                    <p className="text-[13px] sm:text-[14px] text-white/50 leading-relaxed">{p.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spontaneous Application */}
        <section className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-10 sm:p-16 md:p-24 relative overflow-hidden">
           <div className="absolute inset-0 bg-white/3 pointer-events-none" />
           <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 shadow-sm flex items-center justify-center mb-8">
              <Mail size={24} className="text-white/80" />
            </div>
            <h3 className="text-[28px] sm:text-[36px] font-black tracking-tight text-white mb-4">Don't see your specific expertise?</h3>
            <p className="text-[15px] sm:text-[16px] text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              We are constantly expanding our cryptographic, engineering, and intelligence teams. If you are an elite operator with a deep specialisation in on-chain systems, ZK proofs, or professional finance, we want to hear from you.
            </p>
            <a
              href="mailto:careers@humanidfi.com"
              className="inline-flex items-center justify-center w-full sm:w-auto gap-4 px-8 sm:px-10 py-5 bg-[#0a0a0a] text-white rounded-xl text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
            >
              <Mail size={16} />
              Submit Spontaneous Application
              <ArrowRight size={16} />
            </a>
            <p className="mt-6 text-[11px] text-slate-400 font-bold uppercase tracking-widest">careers@humanidfi.com</p>
          </div>
        </section>
      </main>
      <SovereignFooter />
    </div>
  );
}
