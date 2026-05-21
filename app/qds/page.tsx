"use client";

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useScrollVelocity } from '@/components/shared/QDsAtomRenderer';

// Load the 3D atom only on the client (WebGL needs browser)
const QDsAtomRenderer = dynamic(
  () => import('@/components/shared/QDsAtomRenderer').then(m => ({ default: m.QDsAtomRenderer })),
  { ssr: false, loading: () => null }
);

// ─── Page Data ───────────────────────────────────────────────────────────────

const STATS = [
  { label: 'Total Supply',      value: '21,000,000', sub: 'QDs — mathematically fixed' },
  { label: 'Decimal Precision', value: '8 places',   sub: '2.1 quadrillion units total' },
  { label: 'Distribution',      value: '100% mined', sub: 'Open participation only' },
  { label: 'Team Allocation',   value: '0%',          sub: 'No pre-mine, no reserves' },
  { label: 'Mainnet Launch',    value: 'Before 2027', sub: 'Genesis block before Dec 31 2026' },
  { label: 'Governance',        value: 'None',        sub: 'Supply rule is immutable' },
];

const SECTIONS = [
  {
    num: '01',
    title: 'What QDs is',
    paragraphs: [
      'QDs (Quantum Dots) is a digital asset designed to act as the foundational unit of economic exchange within the Whale Alert network. It is not a governance token, a reward coupon, or a speculative vehicle with hidden unlock schedules. It is a base layer of exchange: finite, minable, and enforced entirely by the deployed contract code.',
      'The name derives from the concept of quantum dots — the smallest indivisible unit of verifiable computational work. Just as physical matter cannot be reduced below the atomic scale, QDs cannot be created beyond its defined ceiling or subdivided beyond its defined precision.',
      'Every design decision for QDs was measured against one test: does this reduce complexity, or add it? Any structure that added complexity without adding a mathematical guarantee was removed. What remains is a token defined by absolute clarity.',
      'The full technical specification of QDs is publicly auditable from day one. There are no hidden parameters, no admin keys, and no emergency override functions. The rules encoded at genesis govern QDs until the final token is mined.',
    ],
  },
  {
    num: '02',
    title: 'The 21,000,000 limit',
    paragraphs: [
      'The supply of QDs is capped at exactly twenty-one million tokens. This number is written into the genesis contract as an immutable constant. It cannot be changed by any vote, team decision, or on-chain governance action — because no such mechanism exists in the protocol.',
      'Scarcity is not a feature layered on top of QDs. It is the architecture. Every participant, from the first block to the last, can know in advance the total number of tokens that will ever exist. Uncertainty about future supply is removed by design, not by promise.',
      'Each token is divisible to eight decimal places, yielding two quadrillion one hundred trillion discrete units. This granularity is sufficient for all practical economic uses while preserving the mathematical weight of the twenty-one million ceiling.',
      'Any system claiming to offer QDs in quantities exceeding twenty-one million is operating outside the canonical protocol. The only authoritative record is the on-chain state of the genesis-deployed contract. No exception to this rule exists.',
    ],
  },
  {
    num: '03',
    title: 'Mining: earned, not issued',
    paragraphs: [
      'QDs is distributed exclusively through mining. There are no pre-mines, no team allocations, no investor reserves, and no foundation treasury. From the first block, every token enters circulation through computational work performed by open, permissionless participants.',
      'The mining process follows a deterministic emission schedule. As more computational power joins the network, the difficulty of finding a valid block increases proportionally, keeping the rate of new token issuance stable and predictable regardless of participation levels.',
      'Block rewards halve at fixed intervals following a geometric decay schedule. Each halving reduces the new tokens issued per block by fifty percent, extending the mining timeline while preserving the overall supply ceiling. The final QDs will be issued through fractional issuance as the block reward approaches its lower bound.',
      'Anyone with compatible hardware and a network connection can begin mining immediately after mainnet launch. There is no whitelist, no minimum stake requirement, and no registration process. The protocol is permissionless at every level of participation.',
    ],
  },
  {
    num: '04',
    title: 'No team, no treasury',
    paragraphs: [
      'Zero percent of the QDs supply is allocated to the founding team, early investors, advisors, or any organizational entity. This is not a policy position subject to future amendment — it is a technical constraint baked into the genesis contract from which there is no administrative exit.',
      'The absence of a team allocation eliminates the most common form of misalignment in token design: the disconnect between team incentives and participant incentives. Every QDs token that exists was earned through the same mining process available to all participants.',
      'There is no treasury wallet with signing authority over accumulated funds. There is no multisig controlled by named individuals who could, under pressure or incentive, alter the distribution model. The contract is the only authority.',
      'Operating costs for the Whale Alert network are funded separately from QDs supply. The protocol economics and the operational economics are structurally independent, so neither can compromise the other.',
    ],
  },
  {
    num: '05',
    title: 'The halving schedule',
    paragraphs: [
      'Block rewards in the QDs protocol decrease by fifty percent at regular intervals. This halving mechanism ensures that early miners receive proportionally more tokens for their initial network-bootstrapping work, while later participants still have meaningful earning potential from transaction fees and residual block rewards.',
      'The halving schedule is predictable in advance by any participant. Block heights at which halvings occur are defined in the genesis parameters and cannot be adjusted. This predictability allows participants to plan hardware investments and energy costs with a clear view of expected revenue trajectories.',
      'As the block reward decreases toward zero, transaction fees become the primary economic incentive for miners. The QDs fee market operates without a fee floor or ceiling imposed by the protocol — fees are determined by the competitive dynamics between transaction submitters and block producers.',
      'The final token will be mined in a distant future defined by the geometric decay rate of the emission schedule. The protocol does not set an end date for mining — it sets a mathematical limit that the emission curve asymptotically approaches.',
    ],
  },
  {
    num: '06',
    title: 'Immutable supply rule',
    paragraphs: [
      'The twenty-one million supply ceiling is enforced by the contract itself, not by the goodwill of any team or governance body. Attempting to mint tokens beyond this ceiling will cause the transaction to revert with a protocol-level error. No account has the authority to modify this rule.',
      'Immutability of the supply rule serves a specific function: it makes QDs useful as a unit of account in long-range planning. When the supply ceiling cannot be changed, participants can make calculations about QDs-denominated values that hold across time horizons longer than any single organization's commitment.',
      'The contract code governing QDs supply is open source and independently auditable. Any cryptographer, developer, or analyst can verify the constraint directly from the on-chain bytecode without relying on documentation, announcements, or team statements.',
      'Forks of the QDs protocol that alter the supply ceiling are not QDs. A fork is a separate protocol with separate economics. The canonical QDs is the chain launched at genesis with the original parameters intact.',
    ],
  },
  {
    num: '07',
    title: 'Integration with Whale Alert',
    paragraphs: [
      'QDs functions as the native economic layer of the Whale Alert network. Participants who contribute value to the network — through mining, data validation, or infrastructure provisioning — are compensated in QDs. Participants who consume network services pay in QDs.',
      'The Whale Alert platform tracks on-chain capital flows across multiple blockchain networks. QDs provides the internal accounting unit that aligns the economic interests of data producers and data consumers within this system.',
      'The fixed supply of QDs creates a deflationary pressure as network usage grows. More participants consuming network services while the supply remains constant means each QDs unit represents a greater share of network economic activity over time.',
      'Integration between QDs and the broader Whale Alert ecosystem is documented in the technical specifications available in the developer section of this site. The integration is designed to function without custodial intermediaries — all settlement occurs on-chain.',
    ],
  },
  {
    num: '08',
    title: 'Technical specification',
    paragraphs: [
      'QDs is implemented as an ERC-20 compatible token on the Ethereum Virtual Machine. The contract inherits the standard interface to ensure compatibility with existing wallets, exchanges, and DeFi infrastructure without requiring custom integration work from third parties.',
      'The contract includes a single additional function beyond the ERC-20 standard: the mine() function, which allows eligible participants to claim block rewards during the mining period. No other non-standard functions exist. The attack surface of the contract is minimal by design.',
      'Gas consumption for QDs transactions is comparable to any standard ERC-20 transfer. No exotic opcodes, delegatecall patterns, or proxy architectures are used. The contract is static — what is deployed at genesis is what runs for the lifetime of the token.',
      'Security audits of the QDs contract will be published before mainnet launch. Multiple independent audit firms will review the contract. All findings, including any that are remediated before launch, will be disclosed in full in the public audit documentation.',
    ],
  },
  {
    num: '09',
    title: 'Participation and access',
    paragraphs: [
      'Mining QDs requires no permission, registration, or identity verification. Any device capable of performing the required computational work and maintaining a connection to the QDs network can participate in mining from the moment the genesis block is produced.',
      'Hardware requirements for mining will be specified in the technical documentation released before mainnet launch. The protocol is designed to remain accessible to a broad range of hardware configurations for as long as technically feasible, consistent with the security requirements of the network.',
      'Holding and transferring QDs requires only a standard Ethereum-compatible wallet. No special software, proprietary clients, or custodial accounts are required. Participants retain full self-custody of their tokens at all times.',
      'There are no geographic restrictions on participation enforced at the protocol level. Access to QDs mining and holding is determined by network connectivity and hardware capability, not by jurisdiction, nationality, or any externally administered access control.',
    ],
  },
  {
    num: '10',
    title: 'Before 2027',
    paragraphs: [
      'The QDs genesis block will be produced before December 31, 2026. This commitment is public and specific. The date is not contingent on market conditions, funding rounds, regulatory approvals, or any external variable within the control of the Whale Alert team.',
      'The period between now and mainnet launch is used for final contract auditing, infrastructure preparation, and public documentation of the protocol parameters. No tokens exist before the genesis block. There are no pre-launch sale events.',
      'Participants can prepare for mining by reviewing the hardware requirements and protocol documentation as they are published. No deposit, reservation, or registration is required or accepted in advance of launch.',
      'After the genesis block, the protocol operates autonomously. The Whale Alert team contributes to the network as participants, not as administrators. The network is maintained by its participants, secured by its miners, and governed by its code.',
    ],
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function QDsPage() {
  const vel     = useScrollVelocity();
  const heroRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroTextY = useTransform(scrollYProgress, [0, 1], ['0%', '32%']);
  const heroOpa   = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased overflow-x-hidden selection:bg-black selection:text-white">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative w-full overflow-hidden bg-white"
        style={{ minHeight: '100svh' }}
      >
        {/* 3D Atom — covers full hero, client-only */}
        {mounted && (
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ willChange: 'transform' }}
          >
            <QDsAtomRenderer vel={vel} isDark={false} enableScale={true} />
          </div>
        )}

        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-56 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, white)' }}
        />

        {/* Hero text — parallax on scroll */}
        <motion.div
          style={{ y: heroTextY, opacity: heroOpa, minHeight: '100svh' } as any}
          className="relative z-20 flex flex-col items-center justify-center text-center px-6 select-none pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center" style={{ minHeight: '100svh' }}>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="font-mono text-[11px] font-black uppercase tracking-[0.5em] text-black/30 mb-8 block"
            >
              Humanity Ledger · Digital Asset
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="font-black tracking-tighter uppercase leading-[0.85] text-black mb-6"
              style={{ fontSize: 'clamp(72px, 16vw, 180px)' }}
            >
              QDs
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
              className="font-serif text-black/40 max-w-[560px] leading-relaxed"
              style={{ fontSize: 'clamp(16px, 2vw, 22px)' }}
            >
              Quantum Dots. 21,000,000 units. Mined, not issued.
              <br className="hidden md:block" />
              Launching before 2027.
            </motion.p>

            {/* Scroll cue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
              className="mt-16 flex flex-col items-center gap-2"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-black/20">Scroll</span>
              <div className="w-px h-10 bg-gradient-to-b from-black/15 to-transparent" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAND ────────────────────────────────────────────────────── */}
      <section className="w-full border-y border-black/[0.06] bg-[#FAFAF8] py-14">
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col gap-2 p-5 rounded-2xl bg-white border border-black/[0.06] hover:border-black/15 transition-colors shadow-sm"
            >
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-black/30">
                {s.label}
              </span>
              <span className="font-black text-[20px] tracking-tight text-black leading-none">
                {s.value}
              </span>
              <span className="font-mono text-[9px] text-black/40 leading-snug">
                {s.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CONTENT SECTIONS ─────────────────────────────────────────────── */}
      <section className="w-full max-w-[960px] mx-auto px-6 py-28 md:py-40 flex flex-col gap-28 md:gap-40">
        {SECTIONS.map((s) => (
          <motion.article
            key={s.num}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col md:flex-row gap-8 md:gap-20"
          >
            {/* Section label */}
            <div className="w-full md:w-[220px] shrink-0 flex flex-col gap-3 pt-1">
              <span className="font-mono text-[10px] font-black text-black/22 tracking-[0.3em]">
                {s.num}
              </span>
              <h2 className="text-[22px] md:text-[28px] font-black tracking-tight leading-[1.15] text-black">
                {s.title}
              </h2>
              <div className="w-8 h-[2px] bg-black rounded-full mt-2" />
            </div>

            {/* Body text */}
            <div className="flex-1 flex flex-col gap-6">
              {s.paragraphs.map((p, pi) => (
                <p
                  key={pi}
                  className="font-serif text-black/58 leading-[1.9]"
                  style={{ fontSize: 'clamp(15px, 1.5vw, 17px)' }}
                >
                  {p}
                </p>
              ))}
            </div>
          </motion.article>
        ))}
      </section>

      {/* ── MID-PAGE ATOM DIVIDER ─────────────────────────────────────────── */}
      <section
        className="w-full relative border-y border-black/[0.06] bg-[#F8F8F6] overflow-hidden"
        style={{ height: 'clamp(340px, 45vh, 520px)' }}
      >
        {mounted && (
          <div className="absolute inset-0">
            <QDsAtomRenderer vel={vel} isDark={false} enableScale={false} />
          </div>
        )}
        {/* Edge fades */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#F8F8F6] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F8F8F6] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.55em] text-black/18">
            QDs · Quantum Dots · 21,000,000 · 2026
          </span>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="w-full bg-black py-36 px-6 flex flex-col items-center text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.04) 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-2xl flex flex-col items-center gap-8"
        >
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.5em] text-white/22">
            Genesis Block · Before 2027
          </span>
          <h2
            className="font-black tracking-tighter uppercase leading-[0.87] text-white text-balance"
            style={{ fontSize: 'clamp(36px, 7vw, 72px)' }}
          >
            Mining starts soon.
          </h2>
          <p
            className="font-serif text-white/40 leading-relaxed max-w-xl"
            style={{ fontSize: 'clamp(15px, 1.7vw, 19px)' }}
          >
            Open participation. Fixed supply. No exceptions to either rule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              href="/status"
              className="px-10 py-5 bg-white text-black hover:bg-white/90 rounded-full font-mono text-[11px] font-black uppercase tracking-[0.22em] transition-transform active:scale-95 shadow-xl"
            >
              Network Status
            </Link>
            <Link
              href="/developer"
              className="px-10 py-5 bg-transparent border border-white/18 text-white/70 hover:border-white/40 hover:text-white rounded-full font-mono text-[11px] font-black uppercase tracking-[0.22em] transition-all active:scale-95"
            >
              Technical Docs
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="w-full bg-white border-t border-black/[0.05] py-10 px-6">
        <div className="max-w-[960px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.28em] text-black/28">
            © 2026 Humanity Ledger · QDs Protocol
          </span>
          <div className="flex items-center gap-6">
            {[
              { label: 'Privacy',   href: '/privacy'   },
              { label: 'Developer', href: '/developer' },
              { label: 'Status',    href: '/status'    },
              { label: 'Legal',     href: '/legal'     },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/28 hover:text-black transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
