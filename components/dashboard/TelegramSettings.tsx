"use client";

import React, { useState, useEffect } from 'react';
import { Send, Bell, Settings, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TelegramConfig {
    configured: boolean;
    chatId: string | null;
    minApy: number;
    evSignals: boolean;
}

export default function TelegramSettings({ wallet }: { wallet: string }) {
    const [config, setConfig] = useState<TelegramConfig | null>(null);
    const [chatId, setChatId] = useState('');
    const [minApy, setMinApy] = useState(20);
    const [evSignals, setEvSignals] = useState(true);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const fetchConfig = async () => {
        try {
            const r = await fetch(`/api/telegram/connect?wallet=${wallet}`);
            const d = await r.json();
            setConfig(d);
            if (d.configured) {
                setMinApy(d.minApy);
                setEvSignals(d.evSignals);
            }
        } catch (_) {}
    };

    useEffect(() => { if (wallet) fetchConfig(); }, [wallet]);

    const connect = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            const r = await fetch('/api/telegram/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet, chatId, minApy, evSignals })
            });
            const d = await r.json();
            if (d.error) throw new Error(d.error);
            setStatus({ type: 'success', msg: 'Mensaje de prueba enviado. Verifica tu Telegram.' });
            fetchConfig();
            setChatId('');
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        } finally {
            setLoading(false);
        }
    };

    const disconnect = async () => {
        if (!confirm('¿Desactivar alertas de Telegram?')) return;
        try {
            await fetch('/api/telegram/connect', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wallet })
            });
            fetchConfig();
            setStatus({ type: 'success', msg: 'Alertas desactivadas.' });
        } catch (_) {}
    };

    return (
        <div className="az-surface-2" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Bell size={16} color="var(--az-lime)" />
                <div className="az-label" style={{ fontSize: 11, color: '#fff' }}>ALERTAS DE TELEGRAM</div>
                {config?.configured && <span className="az-badge az-badge-emerald" style={{ marginLeft: 'auto' }}>ACTIVO</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                {/* Info Block */}
                <div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 16 }}>
                        Recibe notificaciones críticas en tiempo real sobre oportunidades de arbitraje en <strong>Polymarket</strong> y pools de alto rendimiento en <strong>DeFi</strong>.
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, border: '1px solid var(--az-border)' }}>
                        <div className="az-label" style={{ fontSize: 8, marginBottom: 6 }}>INSTRUCCIONES</div>
                        <ol style={{ paddingLeft: 16, fontSize: 9, color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <li>Busca <code>@userinfobot</code> en Telegram.</li>
                            <li>Obtén tu <strong>Chat ID</strong> numérico.</li>
                            <li>Pégalo aquí para vincular tu wallet.</li>
                        </ol>
                    </div>
                </div>

                {/* Form Block */}
                <form onSubmit={connect} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {!config?.configured ? (
                        <>
                            <div className="az-label" style={{ fontSize: 8 }}>CHAT ID DE TELEGRAM</div>
                            <input 
                                type="text" 
                                placeholder="Ej: 123456789" 
                                value={chatId} 
                                onChange={e => setChatId(e.target.value)}
                                className="az-input"
                                required
                            />
                        </>
                    ) : (
                        <div style={{ background: 'rgba(224,255,0,0.03)', border: '1px dashed var(--az-lime-glow)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div className="az-label" style={{ fontSize: 8 }}>VINCULADO A</div>
                                <div className="az-value-sm" style={{ fontFamily: 'var(--font-mono)' }}>{config.chatId}</div>
                            </div>
                            <button type="button" onClick={disconnect} className="az-btn-ghost" style={{ padding: 6, border: 'none' }}>
                                <Trash2 size={14} color="var(--az-rose)" />
                            </button>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                            <div className="az-label" style={{ fontSize: 8, marginBottom: 4 }}>MIN APY %</div>
                            <select className="az-select" style={{ width: '100%' }} value={minApy} onChange={e => setMinApy(+e.target.value)}>
                                {[5, 10, 20, 50, 100].map(v => <option key={v} value={v}>{v}%+</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="az-label" style={{ fontSize: 8, marginBottom: 4 }}>SIGNALS</div>
                            <button 
                                type="button"
                                onClick={() => setEvSignals(!evSignals)}
                                className="az-btn-ghost" 
                                style={{ width: '100%', padding: '6px 0', borderColor: evSignals ? 'var(--az-lime)' : 'var(--az-border)' }}
                            >
                                {evSignals ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="az-btn-primary" style={{ width: '100%', marginTop: 8 }}>
                        {loading ? 'CONECTANDO...' : config?.configured ? 'GUARDAR CAMBIOS' : 'ACTIVAR ALERTAS'}
                    </button>
                </form>
            </div>

            {status && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: status.type === 'success' ? 'rgba(0,232,122,0.1)' : 'rgba(255,64,96,0.1)', border: `1px solid ${status.type === 'success' ? 'var(--az-emerald)' : 'var(--az-rose)'}`, color: status.type === 'success' ? 'var(--az-emerald)' : 'var(--az-rose)', fontSize: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {status.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {status.msg}
                </div>
            )}
        </div>
    );
}
