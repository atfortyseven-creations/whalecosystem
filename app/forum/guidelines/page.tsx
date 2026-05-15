import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, BookOpen, Users, Zap, Flag, Scale, MessageSquare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Guidelines | Whale Alert Network Forum',
  description: 'The standards and rules for participating in the Whale Alert Network sovereign intelligence forum.',
};

const RULES = [
  {
    n: '01',
    icon: BookOpen,
    color: '#6366f1',
    title: 'Post substantive, data-backed content',
    body: 'Share analysis, research, trade ideas, or technical questions that deliver real value for fellow members. Every claim about on-chain activity must be supported by verifiable evidence: transaction hashes, block explorers, reproducible scripts, or authenticated data sources. Low-effort posts, unsubstantiated speculation, and content-free commentary will be removed without warning.',
    dos: ['Share TX hashes when citing specific on-chain events', 'Include methodology and data sources in research posts', 'Ask clear, specific technical questions'],
    donts: ['Post "to the moon" or equivalent content-free commentary', 'Share unverified rumours as fact', 'Copy-paste content from other sources without attribution'],
  },
  {
    n: '02',
    icon: Shield,
    color: '#ef4444',
    title: 'Zero tolerance for market manipulation',
    body: 'Coordinating pump-and-dump activity, posting misleading buy or sell signals, creating sybil accounts to amplify narratives, or any other form of market manipulation is an immediate and permanent ban — no appeal, no second chance. This community exists to improve market transparency, not to exploit it.',
    dos: ['Share your genuine, independent analysis', 'Disclose your positions when discussing specific assets', 'Report suspicious coordinated activity to moderators'],
    donts: ['Coordinate buys/sells in private or public threads', 'Post signals you know to be misleading', 'Create multiple accounts to upvote your own content'],
  },
  {
    n: '03',
    icon: Scale,
    color: '#f59e0b',
    title: 'Respect all participants',
    body: 'Debate ideas with full intellectual force — but never attack the person behind them. Personal insults, harassment, doxing, or abusive language directed at any member will result in an immediate suspension. Disagreement and contrarian analysis are actively encouraged; contempt and disrespect are not. This is a high-signal community; keep the discourse at that level.',
    dos: ['Challenge arguments with counter-evidence, not insults', 'Acknowledge when someone makes a valid point against yours', 'Use neutral, precise language in technical debates'],
    donts: ['Use derogatory language about other members', 'Share or attempt to reveal personal information of other users', 'Pile on users who make mistakes — correct them once, clearly'],
  },
  {
    n: '04',
    icon: Zap,
    color: '#06b6d4',
    title: 'Stay on-topic and relevant',
    body: 'This forum is dedicated to on-chain intelligence, Web3 infrastructure, DeFi forensics, whale behaviour analysis, and the Whale Alert Network platform specifically. General crypto chat, NFT promotion, presale shilling, and unrelated technology discussions belong elsewhere. Keep your contributions tightly scoped to the forum\'s mandate.',
    dos: ['Open threads in the correct category (Analysis, Platform, Research, etc.)', 'Link back to related prior discussions to build context', 'Use descriptive thread titles that make the content scannable'],
    donts: ['Promote your own projects, tokens, or NFTs without prior moderator approval', 'Post general crypto news available on any aggregator', 'Spam the same content across multiple categories'],
  },
  {
    n: '05',
    icon: Flag,
    color: '#8b5cf6',
    title: 'Report, do not retaliate',
    body: 'If you encounter content that violates these guidelines, use the report function — do not engage, retaliate, or attempt to publicly shame the offending user. Escalating conflicts publicly reduces the quality of the community for everyone. Our moderation team reviews all reports within 24 hours and takes proportionate action.',
    dos: ['Use the report function for any guideline violation', 'Contact moderators directly for urgent or sensitive issues', 'Trust the moderation process'],
    donts: ['Respond to bad-faith posts with more bad-faith content', 'Publicly call out or shame specific users', 'Attempt to "brigade" or downvote other users as a group'],
  },
  {
    n: '06',
    icon: Users,
    color: '#10b981',
    title: 'Protect privacy — yours and others\'',
    body: 'Never share your full wallet addresses, seed phrases, private keys, or any authentication credentials in the forum — ever. Equally, do not attempt to dox, identify, or link the real-world identity of any pseudonymous community member. Violations of this rule are treated at the highest severity level and may result in legal action where applicable.',
    dos: ['Truncate wallet addresses (0x1234...5678) when referencing them', 'Treat the sovereign pseudonymity of other members with respect', 'Use encrypted channels for any sensitive coordination'],
    donts: ['Share full private keys, seed phrases, or session tokens under any circumstances', 'Attempt to link a pseudonym to a real-world identity', 'Post screenshots that expose other users\' private account details'],
  },
];

export default function ForumGuidelinesPage() {
  return (
    <div className="min-h-screen bg-transparent text-[#0a0a0a] dark:text-[#FAF9F6] font-sans antialiased">

      {/* Top nav breadcrumb */}
      <div className="w-full border-b border-black/6 bg-white sticky top-0 z-50 backdrop-blur-xl bg-white/90">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/forum" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0a0a0a] transition-colors">
            <ArrowLeft size={13} />
            Forum
          </Link>
          <span className="text-slate-200">/</span>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0a0a0a]">Community Guidelines</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-16 pb-32">

        {/* Hero */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Forum / Guidelines</span>
          </div>
          <h1 className="text-[42px] md:text-[54px] font-black tracking-tighter leading-[0.95] text-[#0a0a0a] mb-5">
            Community<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">Guidelines</span>
          </h1>
          <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-2xl">
            The Whale Alert Network forum is a high-signal space for on-chain forensics, institutional intelligence, and sovereign finance research. These rules exist to protect that signal. Read them once, apply them always.
          </p>
        </div>

        {/* Quote banner */}
        <div className="mb-14 p-6 bg-white border border-black/8 rounded-2xl flex items-start gap-4">
          <MessageSquare size={18} className="text-indigo-500 mt-0.5 shrink-0" />
          <p className="text-[14px] italic text-slate-600 leading-relaxed font-medium">
            "A community is only as good as its worst-tolerated behaviour. We set the bar exceptionally high — because the people who rely on this intelligence deserve nothing less."
          </p>
        </div>

        {/* Rules */}
        <div className="flex flex-col gap-6">
          {RULES.map(rule => (
            <div key={rule.n} className="bg-white rounded-2xl border border-black/8 overflow-hidden hover:border-black/15 transition-colors duration-200">
              
              {/* Rule header */}
              <div className="flex items-start gap-5 px-8 pt-7 pb-6">
                <div className="flex items-center gap-4 shrink-0 pt-0.5">
                  <span className="text-[11px] font-mono font-bold text-slate-300">{rule.n}</span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${rule.color}14`, border: `1px solid ${rule.color}25` }}
                  >
                    <rule.icon size={16} style={{ color: rule.color }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-[17px] font-black tracking-tight text-[#0a0a0a] mb-2">{rule.title}</h2>
                  <p className="text-[14px] text-slate-500 leading-relaxed font-medium">{rule.body}</p>
                </div>
              </div>

              {/* Do / Don't */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black/5 border-t border-black/5">
                <div className="bg-white px-7 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600">Do</span>
                  </div>
                  <ul className="space-y-2">
                    {rule.dos.map((d, i) => (
                      <li key={i} className="text-[12px] text-slate-600 font-medium leading-snug pl-3 border-l-2 border-emerald-200">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#fefefe] px-7 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={12} className="text-red-400" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Don't</span>
                  </div>
                  <ul className="space-y-2">
                    {rule.donts.map((d, i) => (
                      <li key={i} className="text-[12px] text-slate-600 font-medium leading-snug pl-3 border-l-2 border-red-200">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enforcement */}
        <div className="mt-10 bg-white rounded-2xl border border-black/8 p-8">
          <h3 className="text-[16px] font-black tracking-tight text-[#0a0a0a] mb-3">Enforcement & Appeals</h3>
          <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-5">
            Violations are handled proportionally: minor infractions receive a warning, repeated or serious violations result in temporary suspension (3–30 days), and severe violations (manipulation, doxing, repeated harassment) result in a permanent ban. Ban appeals can be submitted to <span className="text-indigo-600 font-bold">moderation@humanidfi.com</span> within 14 days of the enforcement action. Appeals are reviewed by a panel of two senior moderators and resolved within 5 business days.
          </p>
          <div className="flex items-center gap-2 pt-4 border-t border-black/5">
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Last Updated — May 2026 · v3.1</span>
          </div>
        </div>

      </div>
    </div>
  );
}
