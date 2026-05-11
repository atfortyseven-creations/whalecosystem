"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DISCLAIMER, INTRODUCTION_PARAGRAPHS, CHAPTERS, Paragraph } from '@/app/developers/compendium-content';

const renderParagraph = (p: Paragraph, index: number) => {
  switch (p.type) {
    case 'h3':
      return <h3 key={index} className="text-xl font-bold mt-12 mb-6 font-serif text-[#0A0A0A] dark:text-white leading-[1.3]">{p.text}</h3>;
    case 'h4':
      return <h4 key={index} className="text-sm font-bold uppercase tracking-widest mt-10 mb-4 font-mono text-[#0044CC] dark:text-[#4488FF]">{p.text}</h4>;
    case 'code':
      return (
        <pre key={index} className="bg-black/5 dark:bg-white/5 p-6 rounded-md font-mono text-xs overflow-x-auto my-6 border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white/80">
          <code>{p.text}</code>
        </pre>
      );
    case 'math':
      return (
        <div key={index} className="bg-[#FAF9F6] dark:bg-black/40 p-6 rounded-sm font-mono text-sm overflow-x-auto my-6 border-l-4 border-[#0044CC] text-center italic text-[#0A0A0A] dark:text-white/70">
          {p.text}
        </div>
      );
    case 'list':
      return (
        <ul key={index} className="list-none pl-6 my-6 space-y-4">
          {p.items?.map((item, i) => (
            <li key={i} className="relative text-[15px] leading-[1.8] text-[#1a1a1a] dark:text-white/70">
              <span className="absolute -left-6 top-1.5 w-1.5 h-1.5 rounded-full bg-[#0044CC] opacity-50" />
              {item}
            </li>
          ))}
        </ul>
      );
    case 'flowchart':
      return null;
    default:
      return <p key={index} className="text-[16px] leading-[1.9] text-[#1a1a1a] dark:text-white/75 mb-6 tracking-[0.01em]">{p.text}</p>;
  }
};

export default function CompendiumPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-20"
      >
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#0044CC] dark:text-[#4488FF] mb-8">Architectural Syllabus</div>
        <h1 className="font-serif text-5xl md:text-6xl font-normal leading-[1.05] tracking-tight text-[#0A0A0A] dark:text-white mb-8">
          The Compendium of <br/><span className="italic text-black/40 dark:text-white/40">Sovereign Intelligence.</span>
        </h1>
        
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-sm mb-12">
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-400 mb-3">Regulatory Disclaimer</h4>
          <p className="text-sm leading-relaxed text-red-900/80 dark:text-red-200/60 font-serif italic">{DISCLAIMER}</p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {INTRODUCTION_PARAGRAPHS.map((p, i) => renderParagraph(p, i))}
        </div>
      </motion.div>

      <div className="space-y-32 border-t border-black/10 dark:border-white/10 pt-20">
        {CHAPTERS.map((chapter) => (
          <motion.div 
            key={chapter.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="scroll-mt-32"
            id={chapter.id}
          >
            <div className="mb-16">
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#0044CC] dark:text-[#4488FF] block mb-4">
                {chapter.number}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-normal leading-[1.1] text-[#0A0A0A] dark:text-white mb-6">
                {chapter.title}
              </h2>
              <p className="text-xl text-black/50 dark:text-white/50 font-sans leading-relaxed max-w-3xl border-l-2 border-black/10 dark:border-white/10 pl-6">
                {chapter.subtitle}
              </p>
            </div>

            <div className="space-y-16">
              {chapter.sections.map((section) => (
                <div key={section.id} id={section.id} className="scroll-mt-32">
                  <h3 className="font-serif text-2xl font-normal text-[#0A0A0A] dark:text-white mb-8 border-b border-black/5 dark:border-white/5 pb-4">
                    {section.title}
                  </h3>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {section.content.map((p, i) => renderParagraph(p, i))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
