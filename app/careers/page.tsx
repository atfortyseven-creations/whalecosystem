import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, Shield, Globe, Cpu, CheckCircle2, Clock, MapPin, DollarSign, Zap, Users, ChevronRight, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers | Whale Alert Network',
  description: 'Join the engineering and intelligence teams building the most trusted on-chain forensic platform for global institutions.',
  openGraph: {
    title: 'Careers | Whale Alert Network',
    description: 'Architect the global financial ledger. Remote-first, high-autonomy, and institutional scale.',
    url: 'https://humanidfi.com/careers',
    siteName: 'Whale Alert Network',
    locale: 'en_US',
    type: 'website',
  },
};

const OPEN_ROLES = [
  {
    id: 'senior-blockchain-engineer',
    title: 'Senior Blockchain Engineer',
    department: 'Core Infrastructure',
    location: 'Remote — Global',
    type: 'Full-Time',
    salary: '€120k – €180k',
    color: '#6366f1',
    badge: 'Priority Hire',
    skills: ['Solidity', 'EVM internals', 'Node.js', 'Rust (optional)'],
    description: 'Architect and maintain the on-chain data ingestion pipeline that powers our real-time whale detection engine. You will work directly with Ethereum RPC nodes, write event log parsers, optimize gas estimation models, and build the forensic data infrastructure used by institutional traders globally.',
  },
  {
    id: 'senior-web3-educator',
    title: 'Senior Web3 Educator & Content Strategist',
    department: 'Content Architecture',
    location: 'Remote — Global',
    type: 'Full-Time',
    salary: '€80k – €120k',
    color: '#06b6d4',
    badge: null,
    skills: ['DeFi expertise', 'Technical writing', 'Content strategy', 'On-chain analysis'],
    description: 'Create the knowledge infrastructure that transforms complex on-chain intelligence into actionable insights for traders, hedge funds, and institutional operators. You will produce deep-dive research, API documentation, tutorial content, and educational resources that position Whale Alert Network as the authoritative voice in institutional crypto forensics.',
  },
  {
    id: 'protocol-security-researcher',
    title: 'Protocol Security Researcher (Zero-Knowledge)',
    department: 'Cryptography',
    location: 'Remote — EU / US',
    type: 'Full-Time',
    salary: '€140k – €200k',
    color: '#8b5cf6',
    badge: 'Senior Level',
    skills: ['ZK circuits (Noir / Circom)', 'Aztec Network', 'Smart contract auditing', 'Cryptographic proof systems'],
    description: 'Conduct original research into ZK-proof based identity verification, dark pool detection, and privacy-preserving forensic methods. You will design cryptographic circuits for our Aztec Pipeline, audit smart contract security, and develop novel methodologies for identifying institutional wallet clusters without compromising user privacy.',
  },
  {
    id: 'devrel-engineer',
    title: 'Developer Relations Engineer',
    department: 'Ecosystem Growth',
    location: 'Remote — Global',
    type: 'Full-Time',
    salary: '€90k – €130k',
    color: '#10b981',
    badge: null,
    skills: ['REST/WebSocket APIs', 'Python / JavaScript', 'Developer advocacy', 'Technical documentation'],
    description: 'Build relationships with the developer community and drive API adoption across trading desks, algorithmic trading firms, and independent builders. You will create integrations, write SDK documentation, host technical workshops, and serve as the primary point of contact between our infrastructure team and external developers.',
  },
];

const BENEFITS = [
  { icon: DollarSign, title: 'Institutional Compensation', body: 'Top-percentile base salaries paid in EUR or USDC. Equity participation available for senior roles. Fully transparent compensation bands published internally.' },
  { icon: MapPin, title: 'Fully Remote & Async-First', body: 'Work from anywhere on Earth. No mandatory meetings, no time-zone discrimination. All communication is written, precise, and documented for deep-focus execution.' },
  { icon: Cpu, title: 'Hardware & Tooling Budget', body: '€3,000 annual workstation stipend on joining, plus €1,500/year for tooling, subscriptions, and peripheral upgrades. We invest in your execution environment.' },
  { icon: Zap, title: 'Zero Micromanagement', body: 'You receive a mandate and the resources to execute it. No hourly tracking, no bureaucratic approval chains. Impact is the only metric that matters.' },
  { icon: Users, title: 'Continuous Education', body: '€2,000 annual budget for courses, certifications, conferences, and books. We invest in your learning as aggressively as we invest in our infrastructure.' },
  { icon: Clock, title: 'Flexible Hours & Autonomy', body: 'Output-driven culture with no fixed schedule. We trust you to manage your own time professionally. Deadlines are explicit; beyond that, the how and when are yours.' },
];

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-[#FAFAF8] text-[#0a0a0a] font-sans antialiased overflow-x-hidden">

      {/* Hero */}
      <div className="w-full border-b border-black/6 bg-white">
        <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">We Are Hiring</span>
          </div>
          <h1 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-[0.92] text-[#0a0a0a] mb-6">
            Build the Intelligence<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500">Layer of Finance.</span>
          </h1>
          <p className="text-[17px] text-slate-500 font-medium max-w-2xl leading-relaxed mb-8">
            We track the largest capital flows in the world, in real time, with cryptographic precision. Come build the tools that give institutional traders a forensic edge over the market.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Remote-First', 'High Autonomy', 'Competitive Pay', 'Async Culture'].map(tag => (
              <div key={tag} className="px-4 py-2 bg-slate-50 border border-black/8 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-500">
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col gap-24">

        {/* Open Positions */}
        <section>
          <div className="flex items-center justify-between mb-8 pb-5 border-b border-black/8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-1">Active Mandates</span>
              <h2 className="text-[26px] font-black tracking-tight text-[#0a0a0a]">Open Positions</h2>
            </div>
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-700">
              {OPEN_ROLES.length} Open Roles
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {OPEN_ROLES.map(role => (
              <div
                key={role.id}
                className="group bg-white border border-black/8 rounded-2xl overflow-hidden hover:border-black/20 hover:shadow-lg hover:shadow-black/4 transition-all duration-300"
              >
                <div className="p-7">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border"
                          style={{ color: role.color, borderColor: `${role.color}30`, backgroundColor: `${role.color}08` }}
                        >
                          {role.department}
                        </span>
                        {role.badge && (
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full bg-[#0a0a0a] text-white">
                            {role.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="text-[19px] font-black tracking-tight text-[#0a0a0a] group-hover:text-indigo-600 transition-colors mb-2">
                        {role.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <MapPin size={11} />
                          {role.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <Clock size={11} />
                          {role.type}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                          <DollarSign size={11} />
                          {role.salary}
                        </div>
                      </div>
                      <p className="text-[13px] text-slate-500 leading-relaxed font-medium max-w-2xl">{role.description}</p>
                    </div>
                    <div className="shrink-0">
                      <Link
                        href={`/careers/${role.id}`}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#0a0a0a] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black/80 transition-all"
                      >
                        View Mandate
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.skills.map(skill => (
                      <span key={skill} className="text-[10px] font-bold px-3 py-1.5 bg-slate-50 border border-black/6 rounded-lg text-slate-600 uppercase tracking-wider">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Join */}
        <section>
          <div className="mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-1">Our Culture</span>
            <h2 className="text-[26px] font-black tracking-tight text-[#0a0a0a]">Why Join Whale Alert Network</h2>
          </div>

          {/* Mission statement */}
          <div className="mb-8 bg-[#0a0a0a] rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[22px] font-black tracking-tight text-white leading-snug mb-4 max-w-2xl">
                Your work becomes the market consensus.
              </p>
              <p className="text-[14px] text-white/60 leading-relaxed max-w-2xl">
                Every algorithm deployed, every interface refined, directly influences how traders, hedge funds, and sovereign entities interpret on-chain reality. We are not building another analytics dashboard — we are building the forensic layer of global finance.
              </p>
              <div className="flex items-center gap-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">Scale: Global Operations · 50+ Countries</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(b => (
              <div key={b.title} className="group bg-white border border-black/8 rounded-2xl p-6 hover:border-black/20 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-black/8 flex items-center justify-center mb-4 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all">
                  <b.icon size={18} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-[14px] font-black tracking-tight text-[#0a0a0a] mb-2">{b.title}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Culture Principles */}
        <section className="bg-white rounded-2xl border border-black/8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-black/8">
            {[
              { icon: Shield, color: '#6366f1', title: 'Cryptographic Integrity', body: 'We build systems where trust is mathematically guaranteed, not promised. Our culture reflects this: transparency, verifiable results, and absolute intellectual honesty above all else.' },
              { icon: Cpu, color: '#06b6d4', title: 'High-Velocity Execution', body: 'Small, autonomous units. No bureaucratic friction. We deploy institutional-grade infrastructure rapidly by trusting our engineers to make executive decisions without redundant oversight.' },
              { icon: Globe, color: '#10b981', title: 'Sovereign Operations', body: 'Globally distributed by design. Work asynchronously from anywhere. We compensate competitively in fiat or stablecoins to respect your financial sovereignty.' },
            ].map(p => (
              <div key={p.title} className="p-8 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${p.color}12`, border: `1px solid ${p.color}25` }}>
                  <p.icon size={18} style={{ color: p.color }} />
                </div>
                <div>
                  <h3 className="text-[14px] font-black tracking-tight text-[#0a0a0a] mb-2">{p.title}</h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spontaneous Application */}
        <section className="text-center bg-white border border-black/8 rounded-2xl p-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-black/8 flex items-center justify-center mx-auto mb-5">
            <Mail size={20} className="text-slate-600" />
          </div>
          <h3 className="text-[22px] font-black tracking-tight text-[#0a0a0a] mb-3">Don't see your specific expertise?</h3>
          <p className="text-[14px] text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed">
            We are constantly expanding our cryptographic, engineering, and intelligence teams. If you are an elite operator with a deep specialisation in on-chain systems, ZK proofs, or institutional finance, we want to hear from you.
          </p>
          <a
            href="mailto:careers@humanidfi.com"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0a0a0a] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <Mail size={14} />
            Submit Spontaneous Application
            <ArrowRight size={14} />
          </a>
          <p className="mt-4 text-[10px] text-slate-400 font-medium">careers@humanidfi.com · We respond to every serious application within 5 business days.</p>
        </section>

      </div>
    </div>
  );
}
