"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Lock, Monitor, Cpu, Database, Shield, Zap, Network,
    ArrowRight, QrCode, Wallet, CheckCircle, ChevronDown,
    LayoutDashboard, Bot, Activity, Globe, GitBranch,
    Server, BarChart3, Target, Layers, Sparkles
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { useAppKit } from '@reown/appkit/react';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(
    () => import('../dashboard/QrScanner').then(m => ({ default: m.QrScanner })),
    { ssr: false, loading: () => <div className="w-64 h-64 rounded-3xl bg-white/5 animate-pulse mx-auto" /> }
);

// ─── Aztec typography classes (defined in globals.css)
const H1 = "font-[var(--font-aztec-serif)] font-black";
const H2 = "font-[var(--font-aztec-serif)] font-black";
const MONO = "font-[var(--font-aztec-mono)]";

// ─── Section wrapper
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
    return (
        <section id={id} className={`min-h-screen w-full relative flex flex-col px-6 py-20 ${className}`}>
            {children}
        </section>
    );
}

// ─── Glowing tag
function Tag({ children, color = "orchid" }: { children: React.ReactNode; color?: string }) {
    const colors: Record<string, string> = {
        orchid: "text-[var(--aztec-orchid)] border-[var(--aztec-orchid)]/30 bg-[var(--aztec-orchid)]/5",
        green: "text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/5",
        blue: "text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/5",
        gold: "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] ${MONO} uppercase tracking-[0.25em] ${colors[color]}`}>
            {children}
        </span>
    );
}

// ─── Architecture card
function ArchCard({ icon, title, subtitle, body }: {
    icon: React.ReactNode; title: string; subtitle: string; body: string;
}) {
    return (
        <div className="relative rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-5 space-y-3 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#a855f7]/3 to-transparent pointer-events-none" />
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center text-[#a855f7] shrink-0 mt-0.5">
                    {icon}
                </div>
                <div>
                    <h4 className={`${H2} text-[15px] text-white leading-tight`}>{title}</h4>
                    <p className={`${MONO} text-[9px] uppercase tracking-[0.2em] text-white/40 mt-0.5`}>{subtitle}</p>
                </div>
            </div>
            <p className="text-[13px] text-white/55 leading-[1.75] font-light">
                {body}
            </p>
        </div>
    );
}

// ─── Feature card
function FeatureCard({ icon, title, body, color = "orchid" }: {
    icon: React.ReactNode; title: string; body: string; color?: string;
}) {
    const colors: Record<string, string> = {
        orchid: "text-[var(--aztec-orchid)] bg-[var(--aztec-orchid)]/10 border-[var(--aztec-orchid)]/20",
        green: "text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20",
        blue: "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20",
        gold: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20",
    };
    return (
        <div className="flex items-start gap-4 py-5 border-b border-white/[0.05] last:border-0">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${colors[color]}`}>
                {icon}
            </div>
            <div className="space-y-1.5">
                <h4 className={`${H2} text-[15px] text-white leading-tight`}>{title}</h4>
                <p className="text-[13px] text-white/50 leading-[1.8] font-light">{body}</p>
            </div>
        </div>
    );
}

// ─── Step
function Step({ n, title, body }: { n: number; title: string; body: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full border border-[#a855f7]/40 bg-[#a855f7]/10 flex items-center justify-center text-[10px] ${MONO} text-[#a855f7] font-bold shrink-0`}>
                    {n}
                </div>
                <div className="w-px flex-1 bg-gradient-to-b from-[#a855f7]/20 to-transparent mt-2 mb-1" />
            </div>
            <div className="pb-6 space-y-1.5">
                <h4 className={`${H2} text-[15px] text-white`}>{title}</h4>
                <p className="text-[13px] text-white/50 leading-[1.8] font-light">{body}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
export function MobileLanding() {
    const { user, isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const { open: openWallet } = useAppKit();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll({ container: containerRef });
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroY = useTransform(scrollY, [0, 300], [0, -60]);

    return (
        <div
            ref={containerRef}
            className="bg-[#030303] min-h-screen overflow-y-auto w-full text-white"
        >
            {/* Ambient top light */}
            <div className="fixed top-0 left-0 right-0 h-[50vh] bg-[radial-gradient(ellipse_at_50%_-20%,_rgba(168,85,247,0.08),_transparent_70%)] pointer-events-none z-0" />

            {/* ── SECTION 1: HERO ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#a855f7]/4 rounded-full blur-[80px]" />
                </div>

                <motion.div
                    style={{ opacity: heroOpacity, y: heroY }}
                    className="relative z-10 flex flex-col items-center gap-7"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Tag color="orchid">
                            <Lock size={9} /> PC Terminal Only
                        </Tag>
                    </motion.div>

                    {/* Main headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-3"
                    >
                        <h1 className={`${H1} text-[42px] leading-[1.05] tracking-[-0.02em]`}>
                            Whale<br />
                            <span className="text-[#a855f7]">Operations</span><br />
                            Terminal
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.9 }}
                        className="text-[15px] text-white/50 leading-[1.8] max-w-[300px] font-light"
                    >
                        An institutional-grade crypto command center. Built for operators, deployed on desktop.
                    </motion.p>

                    {/* CTA */}
                    <motion.button
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.8 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                            document.getElementById('s-connect')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/25 text-[#a855f7] text-[13px] font-semibold"
                    >
                        Connect Your Account <ArrowRight size={14} />
                    </motion.button>

                    {/* Metrics row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex items-center gap-6 pt-2"
                    >
                        {[
                            { v: '240Hz', l: 'Render' },
                            { v: 'Real-time', l: 'Data' },
                            { v: 'PostgreSQL', l: 'Persistence' },
                        ].map(m => (
                            <div key={m.l} className="text-center">
                                <div className={`${H1} text-[15px] text-white/80`}>{m.v}</div>
                                <div className={`${MONO} text-[8px] uppercase tracking-widest text-white/25 mt-0.5`}>{m.l}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30"
                >
                    <ChevronDown size={18} className="text-[#a855f7]" />
                </motion.div>
            </section>

            {/* ── SECTION 2: WHAT IS THIS SYSTEM ── */}
            <Section className="justify-start pt-24 pb-16">
                <div className="space-y-10 max-w-sm mx-auto">
                    <div className="space-y-4">
                        <Tag color="blue"><Sparkles size={9} /> The System</Tag>
                        <h2 className={`${H1} text-[32px] leading-[1.1] tracking-[-0.02em]`}>
                            Not an app.<br />
                            <span className="text-white/40">An operations center.</span>
                        </h2>
                        <p className="text-[14px] text-white/55 leading-[1.9] font-light">
                            The Whale Dashboard is a professional-grade institutional command center for cryptocurrency operators. Unlike conventional analytics tools, it gives you direct control over your entire on-chain infrastructure — wallets, bots, smart contracts, and APIs — all managed through an interactive node canvas.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[14px] text-white/55 leading-[1.9] font-light">
                            Every element of your portfolio is a living node you can deploy, configure, connect, and automate at will. The canvas responds to your intent in real-time, reflecting on-chain state through secure WebSocket connections and 240Hz-optimized rendering.
                        </p>
                        <p className="text-[14px] text-white/55 leading-[1.9] font-light">
                            This is not a read-only dashboard. It is a full execution environment — built for people who operate at scale and require infrastructure that thinks at their speed.
                        </p>
                    </div>

                    {/* Why PC only */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-3">
                        <div className="flex items-center gap-2 text-[#f59e0b]">
                            <Monitor size={14} />
                            <span className={`${MONO} text-[9px] uppercase tracking-[0.25em]`}>Why Desktop Only</span>
                        </div>
                        <p className="text-[13px] text-white/50 leading-[1.85]">
                            The Operations Canvas requires hardware-accelerated SVG rendering, precision pointer control for node topology manipulation, and sustained WebSocket throughput that mobile browsers cannot guarantee. Running this system on a mobile device would degrade the precision of every operation. Your mobile device serves as a secure bridge — not a terminal.
                        </p>
                    </div>
                </div>
            </Section>

            {/* ── SECTION 3: ARCHITECTURE ── */}
            <Section className="justify-start pt-16 pb-16 bg-[#050505]">
                <div className="space-y-8 max-w-sm mx-auto">
                    <div className="space-y-4">
                        <Tag color="green"><Server size={9} /> Architecture</Tag>
                        <h2 className={`${H1} text-[30px] leading-[1.1] tracking-[-0.02em]`}>
                            Built on production<br />
                            <span className="text-white/40">infrastructure.</span>
                        </h2>
                        <p className="text-[13px] text-white/45 leading-[1.85] font-light">
                            Every layer of the stack is production-grade, designed to handle institutional loads with cryptographic integrity at every data boundary.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <ArchCard
                            icon={<LayoutDashboard size={15} />}
                            title="Operations Canvas"
                            subtitle="Next.js 15 · React 19 · Framer Motion"
                            body="An infinite node-based canvas where you deploy your crypto infrastructure as visual components. Each node represents a live entity — wallet, bot, contract, or API webhook. Nodes are connected by animated routing edges that visualize capital flow and data pipelines. The entire state persists to PostgreSQL via a debounced autosave system."
                        />
                        <ArchCard
                            icon={<Database size={15} />}
                            title="Persistent State Engine"
                            subtitle="PostgreSQL · Prisma ORM · Railway"
                            body="Your canvas topology, portfolio positions, watched wallets, and user settings are stored in a managed PostgreSQL instance on Railway. The Prisma ORM layer provides type-safe access with automatic migrations. All canvas changes autosave within 1.5 seconds of any interaction, ensuring zero data loss."
                        />
                        <ArchCard
                            icon={<Shield size={15} />}
                            title="Zero-Trust Auth Layer"
                            subtitle="Clerk · Wagmi · WalletConnect"
                            body="Authentication uses Clerk for Google/social sign-in with JWT session management. Wallet authentication uses Wagmi v2 with AppKit, supporting MetaMask, WalletConnect, Coinbase Wallet, and 500+ other providers. Every API route is protected by a multi-layer security middleware — rate limiting, HMAC signature verification, and honeypot detection."
                        />
                        <ArchCard
                            icon={<Globe size={15} />}
                            title="Multi-Chain Data Layer"
                            subtitle="Alchemy · CoinGecko · Polymer"
                            body="On-chain data flows through Alchemy RPC nodes for Ethereum and all major EVM chains. Market data is sourced from CoinGecko OHLC feeds with 5-minute revalidation. The Polymarket trading terminal connects directly to Polygon's CLOB API for live order book data and real-money prediction market positions."
                        />
                        <ArchCard
                            icon={<Network size={15} />}
                            title="Device Bridge Protocol"
                            subtitle="Cryptographic QR · One-time tokens"
                            body="The Sovereign Bridge generates a 64-character cryptographic token that encodes your PC session into a scannable QR code. The token is one-time-use, expires in 5 minutes, and links your mobile device to the active PC session server-side. This eliminates the need for mobile browser access to the full terminal."
                        />
                        <ArchCard
                            icon={<GitBranch size={15} />}
                            title="Deployment Infrastructure"
                            subtitle="Railway · Next.js Edge · Global CDN"
                            body="The entire platform runs on Railway's production-grade container infrastructure with automatic deployments from the main branch. The Next.js App Router serves static assets through Railway's global CDN with automatic image optimization. API routes run as Node.js serverless functions with cold start times under 200ms."
                        />
                    </div>
                </div>
            </Section>

            {/* ── SECTION 4: FEATURES ── */}
            <Section className="justify-start pt-16 pb-16">
                <div className="space-y-8 max-w-sm mx-auto">
                    <div className="space-y-4">
                        <Tag color="gold"><Zap size={9} /> Features</Tag>
                        <h2 className={`${H1} text-[30px] leading-[1.1] tracking-[-0.02em]`}>
                            Every tool you<br />
                            <span className="text-white/40">need to operate.</span>
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                        <div className="px-5 divide-y divide-white/[0.05]">
                            <FeatureCard
                                icon={<Target size={14} />}
                                color="orchid"
                                title="Node Topology Canvas"
                                body="Deploy wallets, bots, smart contracts, and API nodes on an infinite grid canvas. Right-click anywhere to spawn new nodes. Drag to connect them. The system autosaves your entire topology to the database within 1.5 seconds."
                            />
                            <FeatureCard
                                icon={<BarChart3 size={14} />}
                                color="blue"
                                title="Live Portfolio Tracking"
                                body="Real-time wallet balance aggregation across Ethereum, Polygon, Base, Arbitrum, and all major EVM chains. Price data updated via CoinGecko. Historical PnL charting with institutional-grade resolution."
                            />
                            <FeatureCard
                                icon={<Activity size={14} />}
                                color="green"
                                title="Polymarket Trading Terminal"
                                body="Direct integration with Polymarket's CLOB API on Polygon. View live order books, place yes/no positions, and track your prediction market portfolio alongside your on-chain holdings in one unified interface."
                            />
                            <FeatureCard
                                icon={<Bot size={14} />}
                                color="gold"
                                title="Automation Node Layer"
                                body="Deploy bot nodes on the canvas that execute automated trading strategies, monitor liquidity pool conditions, or trigger webhooks on custom on-chain events. Bot state is persisted and survives page refreshes."
                            />
                            <FeatureCard
                                icon={<Layers size={14} />}
                                color="orchid"
                                title="Whale Intelligence Engine"
                                body="Monitor tracked wallets in real-time with the WhaleSonar. Detect front-running bots, gas spikes, exchange reserve drains, and arbitrage windows as they emerge on-chain."
                            />
                            <FeatureCard
                                icon={<QrCode size={14} />}
                                color="blue"
                                title="Sovereign Bridge QR"
                                body="Generate a one-time cryptographic QR code from the PC dashboard. Scan it with your mobile device to instantly link your session. Enables mobile-to-PC account bridging without exposing credentials."
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── SECTION 5: HOW TO ACCESS ── */}
            <Section className="justify-start pt-16 pb-16 bg-[#050505]">
                <div className="space-y-8 max-w-sm mx-auto">
                    <div className="space-y-4">
                        <Tag color="green"><Monitor size={9} /> Access Guide</Tag>
                        <h2 className={`${H1} text-[30px] leading-[1.1] tracking-[-0.02em]`}>
                            How to enter<br />
                            <span className="text-white/40">the terminal.</span>
                        </h2>
                        <p className="text-[13px] text-white/45 leading-[1.85]">
                            The Whale Dashboard is accessible exclusively from a desktop or laptop browser. Follow these steps to activate your session.
                        </p>
                    </div>

                    <div>
                        <Step
                            n={1}
                            title="Open a Desktop Browser"
                            body="Navigate to humanidfi.com from Chrome, Firefox, or Safari on a Windows, macOS, or Linux machine. The system requires a minimum viewport of 1024px for the canvas to initialize correctly."
                        />
                        <Step
                            n={2}
                            title="Connect Your Identity"
                            body="Click 'Initialize Compliance' on the landing page. Sign in with Google via Clerk for a persistent account, or connect directly with MetaMask or WalletConnect for a wallet-first session. Both paths grant full access."
                        />
                        <Step
                            n={3}
                            title="Enter the Dashboard"
                            body="Navigate to humanidfi.com/dashboard. The Operations Canvas loads your previously saved topology from PostgreSQL. If it's your first visit, a blank infinite grid awaits — right-click to deploy your first node."
                        />
                        <Step
                            n={4}
                            title="Link Your Mobile (Optional)"
                            body="In the Dashboard sidebar, open Settings → Device Bridge. Click 'Generate QR Code'. The system creates a 5-minute cryptographic token encoded in a QR code. Scan it below on this page to link your mobile to the PC session."
                        />
                    </div>
                </div>
            </Section>

            {/* ── SECTION 6: CONNECT + QR ── */}
            <Section id="s-connect" className="justify-start pt-16 pb-24">
                <div className="space-y-10 max-w-sm mx-auto">
                    <div className="space-y-4 text-center">
                        <Tag color="orchid"><QrCode size={9} /> Connect</Tag>
                        <h2 className={`${H1} text-[30px] leading-[1.1] tracking-[-0.02em]`}>
                            Link your account
                        </h2>
                        <p className="text-[13px] text-white/40 leading-[1.85]">
                            Sign in to create your account, then scan the QR code generated from your PC to bridge this session.
                        </p>
                    </div>

                    {/* Auth block */}
                    {isSignedIn ? (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[#4ade80]/5 border border-[#4ade80]/20">
                            <CheckCircle size={22} className="text-[#4ade80] shrink-0" />
                            <div>
                                <p className={`${MONO} text-[9px] uppercase tracking-widest text-[#4ade80]`}>Authenticated</p>
                                <p className="text-[14px] text-white font-semibold mt-0.5">
                                    {user?.primaryEmailAddress?.emailAddress ?? user?.username ?? 'Connected'}
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {/* Google */}
                            <button
                                onClick={() => openSignIn({ redirectUrl: '/' })}
                                className="w-full py-4 rounded-2xl bg-white text-black font-bold text-[14px] flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                            {/* WalletConnect */}
                            <button
                                onClick={() => openWallet()}
                                className="w-full py-4 rounded-2xl bg-[#3B99FC]/10 border border-[#3B99FC]/30 text-[#3B99FC] font-bold text-[14px] flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
                            >
                                <Wallet size={17} />
                                Connect Wallet
                            </button>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className={`${MONO} text-[9px] uppercase tracking-widest text-white/20`}>Scan QR from PC</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    {/* QR Scanner */}
                    <div className="space-y-4">
                        <div className="text-center space-y-1">
                            <p className={`${MONO} text-[9px] uppercase tracking-[0.25em] text-white/30`}>
                                Open <span className="text-[#a855f7]">humanidfi.com/dashboard</span> → Settings → Device Bridge
                            </p>
                        </div>
                        <QrScanner />
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-[11px] text-white/20 leading-relaxed font-light">
                        Your mobile device is a secure bridge to your PC session. Full terminal access requires desktop hardware for 240Hz topology rendering.
                    </p>
                </div>
            </Section>
        </div>
    );
}
