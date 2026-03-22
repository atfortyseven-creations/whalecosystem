"use client";

import React from 'react';
import { Gavel, Globe, Zap, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="terms-portal-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                html, body {
                    background-color: var(--aztec-parchment) !important;
                    color: var(--aztec-ink);
                    width: 100%;
                    overflow-x: hidden;
                    -webkit-text-size-adjust: 100%;
                }

                .terms-portal-container {
                    background: var(--aztec-parchment);
                    min-height: 100vh;
                    width: 100%;
                    font-family: 'Inter', system-ui, sans-serif;
                    -webkit-font-smoothing: antialiased;
                }

                :root {
                    --bg: var(--aztec-parchment);
                    --text-primary: var(--aztec-ink);
                    --text-secondary: var(--aztec-ink);
                    --text-tertiary: var(--aztec-ink);
                    --accent: #D125C7;
                    --border: rgba(0,0,0,0.08);
                    --content-max: 800px;
                }

                .page-layout {
                    width: 100%;
                    max-width: 1600px;
                    margin: 0 auto;
                    padding-top: 120px;
                    display: flex;
                    justify-content: flex-start;
                }

                main {
                    padding: 64px 5% 120px 5%;
                    width: 100%;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                .content-width-wrapper {
                    width: 100%;
                    max-width: var(--content-max);
                }

                /* ── TOPOGRAPHY ── */
                .legal-eyebrow {
                    font-family: var(--font-aztec-h2);
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.5em;
                    text-transform: uppercase;
                    color: var(--aztec-orchid);
                    margin-bottom: 24px;
                }

                .legal-title {
                    font-family: var(--font-aztec-h1);
                    font-size: 84px;
                    font-weight: 900;
                    letter-spacing: -0.04em;
                    line-height: 0.85;
                    margin-bottom: 24px;
                    color: var(--aztec-ink);
                }

                .legal-meta {
                    font-family: var(--font-aztec-body);
                    font-size: 15px;
                    color: var(--aztec-ink);
                    opacity: 0.4;
                    margin-bottom: 80px;
                }

                /* ── CARDS ── */
                .pillar-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 80px;
                }

                .pillar-card {
                    padding: 40px;
                    background: var(--aztec-ink);
                    border: 1px solid var(--aztec-ink);
                    border-radius: 32px;
                }
                .pillar-card h3, .pillar-card p {
                    color: var(--aztec-parchment);
                }

                .pillar-card h3 {
                    font-size: 20px;
                    font-weight: 800;
                    font-style: italic;
                    margin: 16px 0 8px 0;
                }

                .pillar-card p {
                    font-size: 14px;
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                /* ── SECTIONS ── */
                .section {
                    margin-bottom: 64px;
                    display: flex;
                    gap: 32px;
                }

                .section-num {
                    font-size: 24px;
                    font-weight: 900;
                    color: rgba(37,99,235,0.2);
                    font-family: 'JetBrains Mono', monospace;
                }

                .section-content h2 {
                    font-size: 28px;
                    font-weight: 800;
                    margin-bottom: 16px;
                    letter-spacing: -0.02em;
                }

                .section-content p {
                    font-size: 16px;
                    line-height: 1.8;
                    color: var(--text-secondary);
                }

                .alert-box {
                    margin-top: 24px;
                    padding: 24px;
                    background: var(--aztec-ink);
                    border: 1px solid var(--aztec-ink);
                    border-radius: 20px;
                    display: flex;
                    gap: 16px;
                }

                .alert-text {
                    font-size: 14px;
                    font-weight: 500;
                    font-style: italic;
                    color: var(--accent);
                }

                footer {
                    margin-top: 120px;
                    padding-top: 64px;
                    border-top: 1px solid var(--border);
                    text-align: center;
                }

                .footer-brand {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.3em;
                    color: var(--text-tertiary);
                }

                @media (max-width: 768px) {
                    .legal-title { font-size: 48px; }
                    .pillar-grid { grid-template-columns: 1fr; }
                    .section { flex-direction: column; gap: 8px; }
                }
            `}</style>


            <div className="page-layout">
                <main>
                    <div className="content-width-wrapper">
                        <div className="legal-eyebrow">Legal Agreement</div>
                        <h1 className="legal-title">Terms of Service</h1>
                        <p className="legal-meta">Last updated: March 8, 2026</p>

                    <div className="pillar-grid">
                        <div className="pillar-card">
                            <Zap className="text-blue-600" size={32} />
                            <h3>Extreme Performance</h3>
                            <p>By using Whale Alert, you access an Elite-grade infrastructure optimized for the lowest possible latency.</p>
                        </div>
                        <div className="pillar-card">
                            <Gavel className="text-blue-600" size={32} />
                            <h3>Data Sovereignty</h3>
                            <p>Our platform operates under principles of decentralization and individual responsibility. You are the sole owner of your interactions.</p>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-num">01</div>
                        <div className="section-content">
                            <h2>Use of Services</h2>
                            <p>
                                Access to "Whale Alert Pro" services and our Whale Intelligence API is subject to the possession of a valid subscription or an active API key. 
                                Misuse, such as unauthorized bulk scraping of our Elite database, will result in immediate termination of service.
                            </p>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-num">02</div>
                        <div className="section-content">
                            <h2>Limitation of Liability</h2>
                            <p>
                                We are not responsible for financial losses resulting from decisions based on our Whale Matrix data. 
                                Our system detects on-chain movements with 95%+ accuracy, but the market is always sovereign.
                            </p>
                            <div className="alert-box">
                                <AlertTriangle className="text-blue-600 shrink-0" size={24} />
                                <p className="alert-text">
                                    "Investment in crypto-assets carries significant risks. Whale Alert provides data analysis tools, not financial advice."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-num">03</div>
                        <div className="section-content">
                            <h2>Intellectual Property</h2>
                            <p>
                                All ALPHA and OMEGA whale detection algorithms, as well as the "Maximum Rendering" visual design of our platform, 
                                are the intellectual property of Whale Alert. Reverse engineering of our Moralis classification engine is not permitted.
                            </p>
                        </div>
                    </div>

                    <footer>
                        <Globe className="text-[var(--accent)]/10 mx-auto mb-8" size={64} />
                        <p className="footer-brand">Whale Alert Protocol · Compendium Section L-1</p>
                    </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
