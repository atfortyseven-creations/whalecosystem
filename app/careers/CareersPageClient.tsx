"use client";

import React, { useState } from 'react';
import LegalDocLayout, { TocItem } from '@/components/layout/LegalDocLayout';
import { Briefcase, ArrowRight, Code, Globe, Shield, Users, Heart, Zap, MapPin, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOC: TocItem[] = [
  { id: 'intro', label: 'Why Join Us' },
  { id: 'benefits', label: 'Benefits & Culture' },
  { id: 'principles', label: 'Our Principles' },
  { id: 'positions', label: 'Open Positions' },
  { id: 'process', label: 'Hiring Process' },
];

const JOBS = [
  {
    id: 'frontend-engineer',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'We are seeking an exceptionally talented Senior Frontend Engineer to lead the development of our highly interactive web interfaces. You will collaborate closely with our design and backend teams to ensure seamless integration of complex financial data streams into an intuitive user experience.',
    requirements: [
      '5+ years of professional experience with React and modern web technologies.',
      'Deep understanding of Next.js, including Server Components and the App Router architecture.',
      'Exceptional CSS skills, with strong experience with animation libraries such as Framer Motion.',
      'Strong focus on web accessibility standards (WCAG) and performance optimisation.',
      'Experience interacting with Web3 libraries (viem, wagmi) is a significant advantage.',
      'Excellent communication skills and ability to articulate technical decisions clearly.',
    ],
  },
  {
    id: 'backend-engineer',
    title: 'Backend Systems Engineer',
    department: 'Engineering',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'As a Backend Systems Engineer, you will design, build, and maintain the highly scalable infrastructure that powers real-time market data, secure user authentication, and blockchain indexing for our global user base. Your work will directly impact the reliability and speed of the platform.',
    requirements: [
      'Strong proficiency in Node.js, TypeScript, and advanced API design (REST and GraphQL).',
      'Extensive experience with PostgreSQL, ORMs (Prisma), and caching strategies (Redis).',
      'Solid knowledge of cloud infrastructure deployment (Vercel, AWS) and Docker.',
      'Deep understanding of security best practices and data protection regulations.',
      'Familiarity with Ethereum node infrastructure and interacting with RPC providers.',
    ],
  },
  {
    id: 'product-designer',
    title: 'Lead Product Designer',
    department: 'Design',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'We are looking for a Lead Product Designer to shape the visual identity and user experience of Whale Alert Network. You will own the end-to-end design process, ensuring our product remains visually stunning, accessible, and user-centric.',
    requirements: [
      'Extensive portfolio demonstrating high-end digital product design in complex web applications.',
      'Mastery of Figma including advanced prototyping and scalable design systems.',
      'Demonstrated ability to translate complex technical requirements into elegant UI solutions.',
      'Strong understanding of modern design trends, micro-interactions, and typography.',
      'Excellent cross-functional collaboration skills with engineering teams.',
    ],
  },
  {
    id: 'community-manager',
    title: 'Global Community Manager',
    department: 'Marketing',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'The Global Community Manager will be responsible for growing and nurturing our international user base across social platforms, including Discord and Twitter. This role involves developing engagement strategies, organising digital events, and acting as the vital link between our user community and internal product teams.',
    requirements: [
      'Proven experience managing large, active online communities in tech or finance.',
      'Exceptional written and verbal communication skills.',
      'Experience organising online events and AMA sessions.',
      'A solid understanding of decentralised finance concepts.',
      'Ability to gather user feedback and present actionable insights to product teams.',
    ],
  },
  {
    id: 'financial-analyst',
    title: 'Senior Market Data Analyst',
    department: 'Data',
    location: 'Remote (Worldwide)',
    type: 'Full-time',
    description: 'Join our data division to help interpret complex blockchain transactions and market trends. As a Senior Market Data Analyst, you will build automated reporting tools, define new analytical metrics, and ensure the accuracy of financial data presented on our platform.',
    requirements: [
      'Degree in Finance, Economics, Computer Science, Data Science, or related field.',
      'Expert proficiency in SQL and Python for data analysis and visualisation.',
      'Deep understanding of traditional financial markets and DeFi mechanics.',
      'Experience working with large datasets and BI tools (Tableau, Looker).',
      'Strong analytical mindset with obsessive attention to data accuracy.',
    ],
  },
];

const PERKS = [
  { icon: <Globe size={18} />, title: 'Work From Anywhere', desc: 'We are a 100% remote company. We care entirely about your results and contributions, not your geographical location.' },
  { icon: <Heart size={18} />, title: 'Health & Wellness', desc: 'Comprehensive health, dental, and vision insurance. Plus a monthly wellness stipend for gym, yoga, or mental health applications.' },
  { icon: <Zap size={18} />, title: 'Premium Hardware', desc: 'A generous budget to equip your home office with the exact laptop, monitor, and ergonomic setup you need to do your best work.' },
  { icon: <Briefcase size={18} />, title: 'Flexible Time Off', desc: 'We believe in working hard and resting well. Flexible, untracked paid time off policy for everyone.' },
  { icon: <Users size={18} />, title: 'Annual Retreats', desc: 'Once a year, we fly the entire global team to a destination for in-person team building, strategic planning, and celebration.' },
  { icon: <Code size={18} />, title: 'Continuous Learning', desc: 'An annual stipend for online courses, textbooks, industry conferences, and professional certifications.' },
];

const PRINCIPLES = [
  { icon: <CheckCircle size={16} />, title: 'User-Centric Execution', desc: 'Everything we build starts with the user. We implement technology to solve real, tangible problems — not for its own sake.' },
  { icon: <Users size={16} />, title: 'Transparent Communication', desc: 'Being fully remote requires exceptional communication. We document everything and share decisions openly across all levels.' },
  { icon: <Shield size={16} />, title: 'Ownership & Autonomy', desc: 'We hire intelligent, capable people and trust them to make critical decisions with full ownership over their projects.' },
  { icon: <Zap size={16} />, title: 'Continuous Shipping', desc: 'We value momentum. We break down large features into logical updates and ship frequently to iterate on real user feedback.' },
];

export function CareersPageClient() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  return (
    <LegalDocLayout
      title="Careers"
      subtitle="Join our global team and help build the most accessible, secure, and technologically advanced infrastructure for the Humanity Ledger."
      lastUpdated="May 25, 2026"
      category="Company"
      toc={TOC}
      backHref="/"
      backLabel="Back to Home"
    >
      <div className="space-y-10 sm:space-y-14 text-black">

        {/* Intro */}
        <section id="intro">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Why Join Us
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70">
            <p>
              We are a rapidly growing, fully remote team of software engineers, product designers, and financial innovators. Our mission is to democratise access to financial technology, and we are actively seeking passionate individuals to join us on this journey.
            </p>
            <p>
              If you value professional excellence, clear communication, and user-centric design — you belong with us. We operate with a flat, meritocratic structure, high individual autonomy, and a shared obsession with building software that is genuinely useful to millions of people worldwide.
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Benefits &amp; Culture
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PERKS.map(({ icon, title, desc }) => (
              <div key={title} className="border border-black/8 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="text-black/40">{icon}</div>
                  <h3 className="font-semibold text-black text-[14px]">{title}</h3>
                </div>
                <p className="text-[13px] text-black/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section id="principles">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Our Operating Principles
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PRINCIPLES.map(({ icon, title, desc }) => (
              <div key={title} className="border border-black/8 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="text-black/35">{icon}</div>
                  <h3 className="font-semibold text-black text-[14px]">{title}</h3>
                </div>
                <p className="text-[13px] text-black/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section id="positions">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-black/10">
            <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black">
              Open Positions
            </h2>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/40 border border-black/15 rounded-full px-3 py-1">
              {JOBS.length} Roles
            </span>
          </div>

          <div className="space-y-3">
            {JOBS.map((job) => (
              <div key={job.id} className="border border-black/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
                  className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-black/[0.015] transition-colors text-left"
                >
                  <div>
                    <h3 className="text-[15px] font-bold text-black mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-[12px] text-black/45 font-medium">
                      <span className="flex items-center gap-1.5"><Briefcase size={12} /> {job.department}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="hidden sm:block text-[10px] font-mono font-bold uppercase tracking-widest text-black/35 border border-black/10 rounded-full px-3 py-1">
                      {job.type}
                    </span>
                    <div className={`transition-transform duration-200 ${selectedJob === job.id ? 'rotate-90' : ''}`}>
                      <ArrowRight size={16} className="text-black/30" />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {selectedJob === job.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-black/8"
                    >
                      <div className="px-6 py-6 bg-black/[0.01]">
                        <p className="text-[14px] text-black/65 leading-relaxed mb-5">{job.description}</p>
                        <h4 className="text-[12px] font-mono font-bold uppercase tracking-widest text-black/40 mb-3">Requirements</h4>
                        <ul className="space-y-2 mb-6">
                          {job.requirements.map((req) => (
                            <li key={req} className="flex items-start gap-3 text-[13px] text-black/65 leading-relaxed">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-black/30 shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                        <button className="px-6 py-3 bg-black text-white text-[11px] font-bold font-mono uppercase tracking-widest hover:bg-black/80 transition-colors">
                          Apply for this Role
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Hiring Process */}
        <section id="process">
          <h2 className="text-[1.1rem] font-bold uppercase tracking-[0.08em] text-black mb-6 pb-3 border-b border-black/10">
            Hiring Process
          </h2>
          <div className="space-y-4 text-[15px] leading-[1.75] text-black/70 mb-6">
            <p>
              We deeply value your time and effort. Our hiring process is designed to be efficient, transparent, and respectful. We aim to complete the full evaluation within two to three weeks of initial contact.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Initial Screening', desc: 'A 30-minute conversation with our recruitment team to discuss your background and align on expectations.' },
              { step: '02', title: 'Technical Evaluation', desc: 'A practical, collaborative session with the engineering or design team to explore your skills and portfolio.' },
              { step: '03', title: 'Leadership Conversation', desc: 'A final conversation with executive leadership to ensure cultural fit and answer any remaining questions.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="border border-black/8 rounded-xl p-5">
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-black/25 mb-3">{step}</p>
                <h3 className="font-bold text-black text-[14px] mb-2">{title}</h3>
                <p className="text-[13px] text-black/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </LegalDocLayout>
  );
}
