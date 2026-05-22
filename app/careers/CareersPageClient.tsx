"use client";

import React from 'react';
import Link from 'next/link';
import { SystemFooter } from '@/components/landing/SystemFooter';
import { WhaleChatLink } from '@/components/shared/WhaleChatLink';
import { OPEN_ROLES, BENEFITS } from './data';

export function CareersPageClient() {
  return (
    <div className="w-full flex-1 flex flex-col bg-white text-slate-900 font-sans antialiased overflow-y-auto no-scrollbar">

      {/*  MAIN WRAPPER  */}
      <div className="w-full flex flex-col items-center justify-start p-4 md:p-8 relative">
        
        {/*  MAIN PANEL  */}
        <div className="w-full max-w-[1000px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] p-7 md:p-10 lg:p-16 flex flex-col transition-all duration-500 z-10">
          
          {/*  PAGE HEADER  */}
          <header className="w-full flex-shrink-0 border-b border-slate-200/60 pb-8 mb-10">
            <div className="flex flex-col gap-4">
                <div className="inline-flex items-center px-4 py-1.5 bg-slate-50 border border-slate-200/60 rounded-full w-fit">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Open Positions</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                    Join the Platform
                </h1>
                <p className="mt-2 text-slate-500 font-medium text-sm md:text-base leading-relaxed max-w-2xl">
                    We process global market data in real time with high precision. Join our engineering and analytics teams building the systems that provide actionable analytics to the public.
                </p>
            </div>
          </header>

          <div className="flex flex-col gap-16">

            {/*  OPEN POSITIONS  */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Active Roles</span>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">Open Positions</h2>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {OPEN_ROLES.map(role => (
                  <Link
                    key={role.id}
                    href={`/careers/${role.id}`}
                    className="block bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
                        
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-500">
                              {role.department}
                            </span>
                            {role.badge && (
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-800">
                                {role.badge}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 mb-3 leading-tight">
                            {role.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
                            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                              {role.location}
                            </div>
                            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                              {role.type}
                            </div>
                            <div className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                              {role.salary}
                            </div>
                          </div>
                          
                          <p className="text-[14px] text-slate-500 leading-relaxed font-medium max-w-2xl">
                            {role.description}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <div className="inline-flex items-center justify-center px-6 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-colors">
                            View Position
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-100">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mr-2">Core Tech:</span>
                        {role.skills.map(skill => (
                          <span key={skill} className="text-[9px] font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 uppercase tracking-widest">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/*  CULTURE & BENEFITS  */}
            <section>
              <div className="mb-8 border-t border-slate-200/60 pt-10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Our Culture</span>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 leading-none">Why Join Us</h2>
              </div>

              <div className="mb-10 bg-slate-50 border border-slate-200/60 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex-1 max-w-2xl">
                    <p className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight mb-4">
                      Your work drives public insight.
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Every system deployed and every interface refined directly influences how users understand the market. We are building the foundational data layer for accessible analytics.
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center px-4 py-2 bg-white border border-slate-200 rounded-full w-fit">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">Global Operations</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {BENEFITS.map((b, i) => (
                  <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-300">
                    <h3 className="text-[15px] font-black tracking-tight text-slate-900 mb-2">{b.title}</h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{b.body}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {[
                    { title: 'Data Integrity', body: 'We build systems where data is verifiable. Our culture reflects transparency and rigorous validation above all else.' },
                    { title: 'Efficient Execution', body: 'Small, autonomous units. No bureaucratic friction. We deploy professional-grade infrastructure rapidly.' },
                    { title: 'Global Focus', body: 'Globally distributed by design. Work asynchronously from anywhere. We value clear, documented communication.' },
                  ].map((p, i) => (
                    <div key={i} className="p-6 sm:p-8 flex flex-col gap-3 hover:bg-slate-50/50 transition-colors">
                      <h3 className="text-[15px] font-black tracking-tight text-slate-900">{p.title}</h3>
                      <p className="text-[13px] text-slate-500 leading-relaxed">{p.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/*  SPONTANEOUS APPLICATION  */}
            <section className="text-center bg-slate-50 border border-slate-200/60 rounded-2xl p-10 sm:p-16 relative overflow-hidden">
               <div className="relative z-10 flex flex-col items-center">
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-3">Don't see your expertise?</h3>
                <p className="text-sm text-slate-500 max-w-xl mx-auto mb-8 leading-relaxed">
                  We are constantly expanding our engineering and analytics teams. If you are a specialized professional in data systems or analytics, we want to hear from you.
                </p>
                <a
                  href="mailto:careers@humanidfi.com"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-sm"
                >
                  Submit Application
                </a>
                <p className="mt-5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">careers@humanidfi.com</p>
              </div>
            </section>

          </div>
        </div>
      </div>
      
      <WhaleChatLink />
      <SystemFooter />
    </div>
  );
}
