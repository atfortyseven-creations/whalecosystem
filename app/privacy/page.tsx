"use client";

import React from 'react';
import { Shield, Lock, Eye, Globe } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="privacy-portal-container">
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

                .privacy-portal-container {
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
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 80px;
                }

                .pillar-card {
                    padding: 32px;
                    background: var(--aztec-ink);
                    border: 1px solid var(--aztec-ink);
                    border-radius: 28px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .pillar-card h3 {
                    font-size: 18px;
                    font-weight: 800;
                }

                .pillar-card p {
                    font-size: 13px;
                    color: var(--aztec-parchment);
                    line-height: 1.6;
                }

                .pillar-card h3 {
                    color: var(--aztec-parchment);
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

                .content-list {
                    margin-top: 24px;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    list-style: none;
                }

                .content-list li {
                    padding: 20px;
                    background: var(--aztec-ink);
                    border: 1px solid var(--aztec-ink);
                    border-radius: 16px;
                    font-size: 14px;
                    color: var(--aztec-parchment);
                    font-weight: 500;
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
                    .content-list { grid-template-columns: 1fr; }
                    .section { flex-direction: column; gap: 8px; }
                }
            `}</style>


            <div className="page-layout">
                <main>
                    <div className="content-width-wrapper">
                        <div className="legal-eyebrow">Legal Compliance</div>
                        <h1 className="legal-title">Privacy Policy</h1>
                        <p className="legal-meta">Last updated: March 8, 2026</p>

                    <div className="pillar-grid">
                        <div className="pillar-card">
                            <Shield className="text-blue-600" size={28} />
                            <h3>Sovereign Identity</h3>
                            <p>We never sell your data. Your identity belongs to you, not us.</p>
                        </div>
                        <div className="pillar-card">
                            <Lock className="text-blue-600" size={28} />
                            <h3>Zero-Knowledge</h3>
                            <p>We use the highest encryption standards to protect your keys.</p>
                        </div>
                        <div className="pillar-card">
                            <Eye className="text-blue-600" size={28} />
                            <h3>Total Transparency</h3>
                            <p>We clearly communicate what data we process to improve your experience.</p>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-num">01</div>
                        <div className="section-content">
                            <h2>Data Collection</h2>
                            <p>
                                Whale Alert collects information necessary to provide you with the best whale tracking and Elite network services. 
                                This includes public on-chain data associated with your connected wallets and basic technical data provided by your browser (cookies).
                            </p>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-num">02</div>
                        <div className="section-content">
                            <h2>Use of Information</h2>
                            <p>
                                We utilize data to enhance the resolution of our forensic scanners and provide personalized intelligence.
                            </p>
                            <ul className="content-list">
                                <li>Personalization of ALPHA and OMEGA signals.</li>
                                <li>Optimization of latency in Elite scanner.</li>
                                <li>Fraud prevention & protection bots.</li>
                                <li>Infrastructure scaling & optimization.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-num">03</div>
                        <div className="section-content">
                            <h2>Humanitarian Identity</h2>
                            <p>
                                We are deeply committed to human sovereignty. Integrating World ID allows us to verify that you are a real human 
                                without compromising your personal anonymity. We do not track real physical identities.
                            </p>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-num">04</div>
                        <div className="section-content">
                            <h2>Proactive Security</h2>
                            <p style={{fontStyle: 'italic'}}>
                                "Security is not a destination, it is a constant state." We implement forensic safeguards and circuit breakers 
                                to protect the integrity of your financial and operational data.
                            </p>
                        </div>
                    </div>

                    <footer>
                        <Globe className="text-[var(--accent)]/10 mx-auto mb-8" size={64} />
                        <p className="footer-brand">Whale Alert Protocol · Compendium Section L-2</p>
                    </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
