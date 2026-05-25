import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApplicationForm } from '@/components/careers/ApplicationForm';
import { OPEN_ROLES } from '../data';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const role = OPEN_ROLES.find(r => r.id === id);
  if (!role) return { title: 'Not Found | Humanity Ledger' };

  return {
    title: `${role.title} | Careers`,
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
    <div className="w-full flex-1 flex flex-col bg-white text-slate-900 font-sans antialiased overflow-y-auto no-scrollbar">

      {/*  MAIN WRAPPER  */}
      <div className="w-full flex flex-col items-center justify-start p-4 md:p-8 relative min-h-screen">
        
        {/*  MAIN PANEL  */}
        <div className="w-full max-w-[1000px] bg-white/80 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.07)] p-7 md:p-10 lg:p-16 flex flex-col transition-all duration-500 z-10 mt-16 md:mt-24">
          
          {/* Breadcrumb Navigation */}
          <nav className="mb-10 sm:mb-16">
            <Link 
              href="/careers" 
              className="inline-flex px-5 py-2.5 bg-black/5 border border-slate-200/60 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              Return to Positions
            </Link>
          </nav>

          {/* Role Header */}
          <header className="flex flex-col text-left mb-12 sm:mb-16 border-b border-slate-200/60 pb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-slate-200 bg-black/5 text-slate-500">
                {role.department}
              </span>
              {role.badge && (
                <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-slate-900 text-white">
                  {role.badge}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1] md:leading-[0.95] tracking-tight mb-8">
              {role.title}
            </h1>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-6">
              <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                 {role.location}
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
              <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                 {role.type}
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-300" />
              <div className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                 {role.salary}
              </div>
            </div>
          </header>

          {/* Content Sections */}
          <article className="flex flex-col gap-16 sm:gap-20">
            
            <section className="flex flex-col md:flex-row gap-6 md:gap-16">
              <div className="md:w-1/3 shrink-0">
                 <h3 className="text-[18px] sm:text-[20px] font-black tracking-tight text-slate-900 uppercase">
                   The Role
                 </h3>
              </div>
              <div className="md:w-2/3 flex flex-col gap-6">
                {role.paragraphs.map((para, idx) => (
                  <p key={idx} className="text-[15px] sm:text-[16px] text-slate-600 leading-[1.8] font-medium">
                    {para}
                  </p>
                ))}
              </div>
            </section>

            <section className="flex flex-col md:flex-row gap-6 md:gap-16">
              <div className="md:w-1/3 shrink-0">
                 <h3 className="text-[18px] sm:text-[20px] font-black tracking-tight text-slate-900 uppercase">
                   Requirements
                 </h3>
              </div>
              <div className="md:w-2/3">
                <ul className="flex flex-col gap-6">
                  {role.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-5">
                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-[15px] sm:text-[16px] text-slate-600 leading-[1.7] font-medium">{req}</span>
                      </li>
                  ))}
                </ul>
              </div>
            </section>

          </article>

          {/* Application Form */}
          <section className="mt-20 sm:mt-32 pt-16 sm:pt-20 border-t border-slate-200/60">
            <div className="mb-10 text-center">
              <h2 className="text-[28px] sm:text-[36px] font-black tracking-tight text-slate-900 mb-3">Apply for this Position</h2>
              <p className="text-[15px] text-slate-500">Submit your application below.</p>
            </div>
            <div className="bg-black/5 border border-slate-200/60 rounded-3xl p-6 sm:p-10">
              <ApplicationForm role={role.title} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
