"use client";

import React, { useState } from 'react';
import { Shield, Search, AlertTriangle, CheckCircle2, XCircle, Info, ExternalLink, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RiskItem {
    severity: 'critical' | 'high' | 'medium' | 'low';
    label: string;
    description: string;
}

interface SecurityReport {
    address: string;
    chain: string;
    name: string;
    symbol: string;
    totalSupply: string;
    safetyScore: number;
    verdict: 'SAFE' | 'CAUTION' | 'DANGER' | 'SCAM';
    risks: RiskItem[];
    positives: string[];
    analyzedAt: number;
}

export default function SecurityScanner() {
    const [address, setAddress] = useState('');
    const [chain, setChain] = useState('ethereum');
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<SecurityReport | null>(null);
    const [error, setError] = useState('');

    const scan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) return;
        setLoading(true);
        setError('');
        try {
            const r = await fetch(`/api/security/scan?address=${address}&chain=${chain}`);
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            setReport(d);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getVerdictColor = (v: string) => {
        if (v === 'SAFE') return 'var(--az-emerald)';
        if (v === 'CAUTION') return 'var(--az-amber)';
        if (v === 'DANGER') return 'var(--az-rose)';
        return 'var(--az-rose)';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            {/* Header / Search */}
            <div style={{ padding: '24px', borderBottom: '1px solid var(--az-border)' }}>
                <div className="az-label-lime" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Shield size={12} /> ANTI-RUGPULL SECURITY SCANNER
                </div>
                <form onSubmit={scan} style={{ display: 'flex', gap: 12 }}>
                    <select 
                        value={chain} 
                        onChange={(e) => setChain(e.target.value)}
                        className="az-select"
                        style={{ width: 120 }}
                    >
                        <option value="ethereum">ETHEREUM</option>
                        <option value="bsc">BSC</option>
                        <option value="polygon">POLYGON</option>
                        <option value="arbitrum">ARBITRUM</option>
                        <option value="base">BASE</option>
                        <option value="solana">SOLANA</option>
                    </select>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input 
                            type="text"
                            placeholder="PEGA LA DIRECCIÓN DEL CONTRATO (0x...)"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="az-input"
                            style={{ paddingLeft: 40 }}
                        />
                        <Search size={14} color="rgba(255,255,255,0.2)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                    <button type="submit" disabled={loading} className="az-btn-primary" style={{ padding: '0 24px' }}>
                        {loading ? 'ESCANEANDO...' : 'ANALIZAR'}
                    </button>
                </form>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }} className="az-scroll">
                <AnimatePresence mode="wait">
                    {!report && !loading && !error && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, opacity: 0.3 }}
                        >
                            <Shield size={48} style={{ marginBottom: 16 }} />
                            <p className="az-label" style={{ textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                                Análisis profundo de contratos inteligentes para detectar honeypots, impuestos ocultos y liquidez no bloqueada.
                            </p>
                        </motion.div>
                    )}

                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <div className="az-spinner" style={{ width: 40, height: 40, marginBottom: 20 }} />
                            <div className="az-label animate-pulse">ANALIZANDO CÓDIGO FUENTE...</div>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ padding: 24, display: 'flex', gap: 12, color: 'var(--az-rose)', background: 'rgba(255,64,96,0.05)', margin: 24, border: '1px solid rgba(255,64,96,0.2)' }}
                        >
                            <AlertTriangle size={16} />
                            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)' }}>ERROR: {error}</div>
                        </motion.div>
                    )}

                    {report && !loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ padding: 24 }}
                        >
                            {/* Summary Header */}
                            <div className="az-surface-2" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderLeft: `4px solid ${getVerdictColor(report.verdict)}` }}>
                                <div>
                                    <div className="az-label" style={{ marginBottom: 4 }}>TOKEN DETECTADO</div>
                                    <h2 className="az-header-lg" style={{ fontFamily: 'var(--font-mono)' }}>{report.name} ({report.symbol})</h2>
                                    <p className="az-label" style={{ fontSize: 9, marginTop: 4, opacity: 0.5 }}>{report.address}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="az-label" style={{ marginBottom: 4 }}>SAFETY SCORE</div>
                                    <div className="az-value-xl" style={{ color: getVerdictColor(report.verdict) }}>{report.safetyScore}<span style={{ fontSize: 16, opacity: 0.3 }}>/100</span></div>
                                    <div className="az-badge" style={{ background: getVerdictColor(report.verdict), color: '#000', border: 'none', marginTop: 8 }}>{report.verdict}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                {/* Risks Section */}
                                <div>
                                    <div className="az-label-rose" style={{ marginBottom: 16, color: 'var(--az-rose)', fontWeight: 800, fontSize: 10, letterSpacing: '0.2em' }}>RIESGOS DETECTADOS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {report.risks.length === 0 ? (
                                            <div style={{ padding: 16, border: '1px solid var(--az-border)', opacity: 0.4, fontSize: 11 }}>No se detectaron riesgos críticos en el contrato.</div>
                                        ) : (
                                            report.risks.map((risk, i) => (
                                                <div key={i} className="az-surface-3" style={{ padding: 12, borderLeft: risk.severity === 'critical' || risk.severity === 'high' ? '2px solid var(--az-rose)' : '2px solid var(--az-amber)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        {risk.severity === 'critical' ? <XCircle size={14} color="var(--az-rose)" /> : <AlertTriangle size={14} color="var(--az-amber)" />}
                                                        <span className="az-label" style={{ color: risk.severity === 'critical' ? 'var(--az-rose)' : 'var(--az-amber)', fontSize: 10, fontWeight: 800 }}>{risk.label}</span>
                                                    </div>
                                                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{risk.description}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Positives Section */}
                                <div>
                                    <div className="az-label-emerald" style={{ marginBottom: 16, color: 'var(--az-emerald)', fontWeight: 800, fontSize: 10, letterSpacing: '0.2em' }}>PUNTOS POSITIVOS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {report.positives.map((pos, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)', padding: '8px 12px', background: 'rgba(0,232,122,0.03)', border: '1px solid rgba(0,232,122,0.1)' }}>
                                                <CheckCircle2 size={12} color="var(--az-emerald)" /> {pos}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Footer / Info */}
                            <div className="az-explainer" style={{ marginTop: 32 }}>
                                <div className="az-explainer-title">SOBRE EL ANÁLISIS</div>
                                <div className="az-explainer-body">
                                    Este escaneo utiliza la motor de seguridad de <strong>GoPlus Labs</strong> para analizar el contrato en tiempo real. Aunque un score de 100/100 es excelente, nunca inviertas dinero que no puedas permitirte perder. Los estafadores siempre buscan nuevas formas de engañar.
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
