import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApplicationForm } from '@/components/careers/ApplicationForm';
import { ArrowLeft, MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { OPEN_ROLES } from '../data';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const role = OPEN_ROLES.find(r => r.id === id);
  if (!role) return { title: 'Not Found | Whale Alert Network' };

  return {
    title: `${role.title} | Careers | Whale Alert Network`,
    description: role.description,
  };
}

export default async function CareerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const role = OPEN_ROLES.find(r => r.id === id);

  if (!role) {
    notFound();
  }

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-white/10 font-sans antialiased overflow-x-hidden">
      
      {/* ── Ambient Background Texture ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center z-0">
         <div className="w-[800px] h-[800px] bg-black/[0.02] rounded-full blur-[120px] absolute -top-40 opacity-70" />
      </div>

      <main className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-8 pt-24 md:pt-36 pb-24 md:pb-32 flex flex-col">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-10 sm:mb-16">
          <Link 
            href="/careers" 
            className="group inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 border border-white/10 rounded-full font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white hover:border-white/30 transition-all backdrop-blur-sm"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Return to Positions
          </Link>
        </nav>

        {/* Role Header */}
        <header className="flex flex-col text-left mb-12 sm:mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-white/10 bg-white/10 text-white/70">
              {role!.department}
            </span>
            {role.badge && (
              <span className="text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full bg-white text-black">
                {role!.badge}
              </span>
            )}
          </div>

          <h1 className="text-[36px] sm:text-[48px] md:text-[64px] font-black text-white leading-[1] md:leading-[0.95] tracking-tight mb-8">
            {role!.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 pb-12 border-b border-white/10">
            <div className="flex items-center gap-3 font-sans text-[12px] sm:text-[13px] font-bold text-white/60">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                 <MapPin size={14} className="text-white/80" /> 
               </div>
               {role!.location}
            </div>
            <div className="flex items-center gap-3 font-sans text-[12px] sm:text-[13px] font-bold text-white/60">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                 <Clock size={14} className="text-white/80" /> 
               </div>
               {role!.type}
            </div>
            <div className="flex items-center gap-3 font-sans text-[12px] sm:text-[13px] font-bold text-white/60">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                 <DollarSign size={14} className="text-white/80" /> 
               </div>
               {role!.salary}
            </div>
          </div>
        </header>

        {/* Content Sections */}
        <article className="flex flex-col gap-16 sm:gap-20">
          
          <section className="flex flex-col md:flex-row gap-6 md:gap-16">
            <div className="md:w-1/3 shrink-0">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black font-mono text-white/70">01</div>
                 <h3 className="font-sans text-[20px] sm:text-[24px] font-black tracking-tight text-white">
                   The Role
                 </h3>
               </div>
            </div>
            <div className="md:w-2/3 flex flex-col gap-6 pt-2 md:pt-1">
              {role.paragraphs.map((para, idx) => (
                <p key={idx} className="font-sans text-[15px] sm:text-[16px] text-white/60 leading-[1.8] font-medium">
                  {para}
                </p>
              ))}
            </div>
          </section>

          <section className="flex flex-col md:flex-row gap-6 md:gap-16">
            <div className="md:w-1/3 shrink-0">
               <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black font-mono text-white/70">02</div>
                 <h3 className="font-sans text-[20px] sm:text-[24px] font-black tracking-tight text-white">
                   Requirements
                 </h3>
               </div>
            </div>
            <div className="md:w-2/3 pt-2 md:pt-1">
              <ul className="flex flex-col gap-6">
                {role.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-5">
                      <div className="mt-2 w-2 h-2 rounded-full bg-white/60 shrink-0" />
                      <span className="font-sans text-[15px] sm:text-[16px] text-white/60 leading-[1.7] font-medium">{req}</span>
                    </li>
                ))}
              </ul>
            </div>
          </section>

        </article>

        {/* Application Form Form */}
        <section className="mt-20 sm:mt-32 pt-16 sm:pt-20 border-t border-black/10">
          <div className="mb-10 text-center">
            <h2 className="text-[28px] sm:text-[36px] font-black tracking-tight text-white mb-4">Apply for this Position</h2>
            <p className="text-[15px] text-white/50">Submit your credentials. We review applications strictly on technical merit.</p>
          </div>
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10">
            <ApplicationForm role={role.title} />
          </div>
        </section>

      </main>
    </div>
  );
}
