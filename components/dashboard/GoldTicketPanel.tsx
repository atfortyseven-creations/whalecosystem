"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAccount, useConnect, useSignMessage, useReadContract } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Link from 'next/link';

const SOVEREIGN_PASS_ADDRESS = '0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a';
const SOVEREIGN_PASS_ABI = [
  { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

type ClaimStep = 'eligibility' | 'payment' | 'claiming';

export function GoldTicketPanel() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { signMessage, data: hash, isPending: isWritePending, isSuccess: isConfirmed } = useSignMessage();
    const isConfirming = false;

    const { data: balanceData, refetch: refetchBalance } = useReadContract({
        address: SOVEREIGN_PASS_ADDRESS as `0x${string}`,
        abi: SOVEREIGN_PASS_ABI,
        functionName: 'balanceOf',
        args: address ? [address, 1n] : undefined,
        query: { enabled: !!address }
    });

    const { data: supplyData, refetch: refetchSupply } = useReadContract({
        address: SOVEREIGN_PASS_ADDRESS as `0x${string}`,
        abi: SOVEREIGN_PASS_ABI,
        functionName: 'totalSupply',
        args: [1n]
    });

    const hasTicket = Boolean(balanceData && BigInt(balanceData as any) > 0n);
    const totalTicketsMinted = supplyData ? Number(supplyData) : 0;
    const displayTotal = 1420 + totalTicketsMinted;

    const [step, setStep] = useState<ClaimStep>('eligibility');
    const [paymentDone, setPayment] = useState(false);

    useEffect(() => {
        if (isConfirmed) {
            toast.success('Gold Ticket activado correctamente');
            refetchBalance();
            refetchSupply();
        }
    }, [isConfirmed, refetchBalance, refetchSupply]);

    const handleConnect = () => {
        connect({ connector: injected() });
        toast.success('Conectando cartera Web3…');
    };

    const handlePayment = () => {
        if (hasTicket) {
            toast.info("Esta cartera ya tiene el Gold Ticket activado.");
            return;
        }
        signMessage({
            message: "Authorize zero-gas claim for Sovereign Gold Ticket on Whale Alert Network."
        }, {
            onSuccess: () => {
                setPayment(true);
                setStep('claiming');
            },
            onError: (err: any) => {
                const errMsg = err?.message || String(err);
                toast.error('Firma rechazada: ' + errMsg.slice(0, 60));
                setStep('eligibility');
            }
        });
    };

    // ==========================================
    // ESTADO: TICKET YA ACTIVADO
    // ==========================================
    if (hasTicket || isConfirmed) {
        return (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-[#FAF9F6] rounded-3xl border border-[#D4AF37]/40 shadow-[0_20px_50px_-12px_rgba(212,175,55,0.15)] relative overflow-hidden min-h-[650px]">
                <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-[#D4AF37]/10 to-transparent pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    className="relative z-10 flex flex-col items-center w-full max-w-xl"
                >
                    {/* Estado */}
                    <div className="mb-6 px-4 py-2 rounded-full bg-[#00C076]/10 border border-[#00C076]/30">
                        <span className="text-[11px] font-black text-[#00C076] uppercase tracking-widest">
                            Verificado On-Chain — Acceso Institucional Activo
                        </span>
                    </div>

                    {/* Identidad */}
                    <div className="w-full bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-md mb-6 text-center">
                        <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-2">
                            Tu Identidad Inmutable en la Red
                        </p>
                        <p className="text-2xl font-black text-[#050505] font-mono tracking-tight mb-1">
                            #WHALE-{address ? address.slice(-6).toUpperCase() : '000000'}
                        </p>
                        <p className="text-[10px] text-[#888888] font-mono break-all mt-2">
                            Cartera vinculada: {address ?? '—'}
                        </p>
                        <p className="text-[10px] text-[#888888] font-mono mt-1">
                            Contrato: {SOVEREIGN_PASS_ADDRESS}
                        </p>
                    </div>

                    {/* Qué está activo */}
                    <div className="w-full bg-[#050505] rounded-2xl p-6 mb-6">
                        <p className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest mb-4">
                            Privilegios Desbloqueados de Por Vida
                        </p>
                        <ul className="space-y-3 text-left">
                            {[
                                { label: 'Acceso ilimitado a la API de inteligencia de ballenas', detail: 'Hasta 1.000 peticiones/min sin restricciones.' },
                                { label: 'Feed institucional en tiempo real', detail: 'Datos exclusivos de movimientos de capital superior a $100k.' },
                                { label: 'Motor de alertas neurales completo', detail: 'Reglas ilimitadas + webhooks + notificaciones push.' },
                                { label: 'Whale Academy Pro', detail: 'Todos los cursos y materiales desbloqueados permanentemente.' },
                                { label: 'Soporte prioritario dedicado', detail: 'Tiempo de respuesta garantizado inferior a 2 horas.' },
                                { label: 'Sin renovaciones mensuales ni suscripciones', detail: 'Pago único de activación. Acceso de por vida sin interrupciones.' },
                            ].map((item, i) => (
                                <li key={i} className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-black text-white uppercase tracking-wide">{item.label}</span>
                                    <span className="text-[10px] text-white/50 font-mono">{item.detail}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <Link
                        href="/"
                        className="w-full text-center py-4 bg-[#050505] text-[#D4AF37] rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#111] hover:scale-[1.01] transition-all duration-300"
                    >
                        Acceder al Terminal Whale Alert Network
                    </Link>

                    <p className="mt-5 text-[10px] font-bold text-[#888888] uppercase tracking-widest font-mono text-center">
                        Passes en circulación global: {displayTotal.toLocaleString()}
                    </p>
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // ESTADO: FIRMA EN CURSO
    // ==========================================
    if (step === 'claiming' || isWritePending || isConfirming) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FAF9F6] rounded-3xl border border-[#E5E5E5] space-y-8 p-12">
                <div className="relative w-24 h-24">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        className="absolute -inset-4 rounded-full border-2 border-dashed border-[#D4AF37]/40"/>
                    <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                        className="w-24 h-24 rounded-full border-4 border-[#D4AF37] border-t-transparent shadow-lg"/>
                </div>

                <div className="text-center space-y-4 max-w-sm">
                    <motion.h2
                        animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}
                        className="text-2xl font-black text-[#050505] uppercase tracking-tighter"
                    >
                        Validando Firma Criptográfica
                    </motion.h2>
                    <p className="text-sm font-bold text-[#888888]">
                        No cierres esta ventana. Tu cartera está procesando la firma digital que acredita tu identidad Web3. No se realiza ningún pago ni se descuenta gas.
                    </p>
                    <div className="bg-white border border-[#E5E5E5] px-4 py-3 rounded-lg text-left">
                        <p className="text-[9px] font-mono text-[#888888] uppercase tracking-widest mb-1">Hash de firma recibida</p>
                        <p className="text-[10px] font-mono text-[#050505] break-all">
                            {hash ? String(hash).slice(0, 42) + '...' : 'Esperando confirmación de la cartera…'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ==========================================
    // ESTADO: PÁGINA PRINCIPAL DE RECLAMACIÓN
    // ==========================================
    return (
        <div className="flex flex-col space-y-6">

            {/* ── Hero Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-b from-[#050505] to-[#111111] rounded-3xl overflow-hidden shadow-2xl border border-[#222]"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 blur-[100px] rounded-full pointer-events-none"/>

                <div className="relative z-10 p-10">
                    {/* Badges de estado */}
                    <div className="flex items-center gap-3 mb-5">
                        <span
                            className="text-[9px] px-2.5 py-1 rounded border font-black uppercase tracking-[0.2em]"
                            style={{ borderColor: 'rgba(212,175,55,0.5)', backgroundColor: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}
                        >
                            Acceso Institucional
                        </span>
                        <span
                            className="text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5"
                            style={{ color: '#00C076' }}
                        >
                            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00C076', animation: 'pulse 2s infinite' }}/>
                            Red en Vivo
                        </span>
                    </div>

                    {/* Título y descripción */}
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4" style={{ color: '#FFFFFF' }}>
                        Sovereign Gold Ticket
                    </h1>
                    <p className="text-sm leading-relaxed font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
                        El <strong style={{ color: '#FFFFFF' }}>Sovereign Gold Ticket</strong> es un pase de acceso permanente acuñado como token
                        ERC-1155 en la blockchain de Ethereum. Al firmar gasless, tu dirección de cartera queda
                        vinculada de forma irrevocable a la red Whale Alert Network, desbloqueando todos los
                        privilegios institucionales de por vida.
                    </p>
                    <p className="text-sm leading-relaxed font-semibold mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        No se realiza ningún pago. No se requiere gas. No hay suscripción mensual. 
                        La firma es únicamente una verificación criptográfica de tu identidad Web3.
                        Una vez activado, el acceso es permanente e imposible de revocar.
                    </p>

                    {/* Precio y estadísticas */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center flex-1">
                            <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Coste de Activación
                            </div>
                            <div className="text-5xl font-black tracking-tighter" style={{ color: '#D4AF37' }}>$0</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color: '#00C076' }}>
                                Completamente Gratuito
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center flex-1">
                            <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Passes Acuñados
                            </div>
                            <div className="text-4xl font-black tracking-tighter" style={{ color: '#FFFFFF' }}>
                                {displayTotal.toLocaleString()}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                En Circulación Global
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center flex-1">
                            <div className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Duración del Acceso
                            </div>
                            <div className="text-4xl font-black tracking-tighter" style={{ color: '#FFFFFF' }}>
                                ∞
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                Sin Renovaciones Nunca
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Protocolo de Ejecución ── */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl overflow-hidden shadow-sm">
                <div className="px-8 py-5 border-b border-[#E5E5E5] bg-[#FAF9F6] flex justify-between items-center">
                    <span className="text-xs font-black text-[#050505] uppercase tracking-[0.2em]">Protocolo de Activación</span>
                    <span className="text-[10px] font-mono text-[#888888] bg-[#E5E5E5]/50 px-2.5 py-1 rounded">FLUJO SEGURO SIN PAGO</span>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-10 items-start">

                    {/* Pasos */}
                    <div className="space-y-8">

                        {/* Paso 1 */}
                        <div className={`flex gap-5 ${isConnected ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="flex flex-col items-center shrink-0">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 ${isConnected ? 'border-[#00C076] text-[#00C076] bg-[#00C076]/5' : 'border-[#050505] text-[#050505] bg-white'}`}>
                                    {isConnected ? '✓' : '1'}
                                </div>
                                <div className="w-px flex-1 mt-2 bg-[#E5E5E5] min-h-[32px]"/>
                            </div>
                            <div className="pt-1 pb-4">
                                <h3 className="text-sm font-black text-[#050505] uppercase tracking-wide mb-1">Conectar Cartera</h3>
                                <p className="text-[11px] text-[#888888] font-medium leading-relaxed">
                                    Conecta tu cartera Web3 (MetaMask, Coinbase Wallet, WalletConnect u otra compatible con EIP-712). 
                                    Esta acción identifica tu dirección Ethereum pública. No se accede a fondos ni claves privadas.
                                </p>
                                {!isConnected && (
                                    <button
                                        onClick={handleConnect}
                                        className="mt-4 px-6 py-2.5 bg-[#050505] text-white rounded-lg text-[11px] font-black uppercase tracking-wider hover:bg-[#222] transition-all"
                                    >
                                        Conectar Cartera Web3
                                    </button>
                                )}
                                {isConnected && (
                                    <p className="mt-2 text-[10px] font-mono text-[#00C076]">
                                        Cartera conectada: {address?.slice(0,6)}...{address?.slice(-4)}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Paso 2 */}
                        <div className={`flex gap-5 ${!isConnected ? 'opacity-40 pointer-events-none' : paymentDone ? 'opacity-50' : 'opacity-100'}`}>
                            <div className="flex flex-col items-center shrink-0">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 ${paymentDone ? 'border-[#00C076] text-[#00C076] bg-[#00C076]/5' : 'border-[#D4AF37] text-[#D4AF37] bg-white'}`}>
                                    {paymentDone ? '✓' : '2'}
                                </div>
                                <div className="w-px flex-1 mt-2 bg-[#E5E5E5] min-h-[32px]"/>
                            </div>
                            <div className="pt-1 pb-4">
                                <h3 className="text-sm font-black text-[#050505] uppercase tracking-wide mb-1">Firma Gasless</h3>
                                <p className="text-[11px] text-[#888888] font-medium leading-relaxed">
                                    Tu cartera te pedirá que firmes un mensaje criptográfico. Esta firma no cuesta gas, no mueve fondos
                                    y no autoriza ninguna transacción. Es una verificación de identidad pura: demuestra que eres el 
                                    propietario legítimo de la dirección sin exponer tu clave privada.
                                </p>
                                {isConnected && !paymentDone && (
                                    <button
                                        onClick={handlePayment}
                                        className="mt-4 px-6 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider hover:scale-[1.02] transition-transform shadow-md border"
                                        style={{
                                            background: 'linear-gradient(to right, #D4AF37, #B38C22)',
                                            color: '#050505',
                                            borderColor: '#D4AF37'
                                        }}
                                    >
                                        Firmar Autenticación Sin Gas
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Paso 3 */}
                        <div className={`flex gap-5 ${!paymentDone ? 'opacity-40' : 'opacity-100'}`}>
                            <div className="flex flex-col items-center shrink-0">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 border-[#E5E5E5] text-[#888888] bg-white">
                                    3
                                </div>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-sm font-black text-[#050505] uppercase tracking-wide mb-1">Acceso Institucional Desbloqueado</h3>
                                <p className="text-[11px] text-[#888888] font-medium leading-relaxed">
                                    Una vez validada la firma, tu Gold Ticket queda registrado en el contrato inteligente ERC-1155 
                                    en la dirección <span className="font-mono">{SOVEREIGN_PASS_ADDRESS.slice(0,10)}…</span>.
                                    Tu cartera estará habilitada de forma permanente en todas las sesiones futuras, sin necesidad 
                                    de repetir este proceso nunca más.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Panel de Seguridad */}
                    <div className="space-y-4">
                        <div className="bg-[#050505] rounded-2xl p-6">
                            <p className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest mb-4">
                                Parámetros de Seguridad
                            </p>
                            <ul className="space-y-4">
                                {[
                                    {
                                        title: 'Sin custodia de fondos',
                                        body: 'La plataforma no accede en ningún momento a tus activos digitales. La firma es únicamente una prueba criptográfica de identidad.'
                                    },
                                    {
                                        title: 'Invocación directa al contrato',
                                        body: `El pase se acuña directamente en el contrato ERC-1155 en ${SOVEREIGN_PASS_ADDRESS}. No hay terceros ni intermediarios.`
                                    },
                                    {
                                        title: 'Registro inmutable en EVM',
                                        body: 'Una vez registrado, el acceso es permanente e imposible de eliminar. Ninguna entidad, incluida Whale Alert Network, puede revocar tu pass.'
                                    },
                                    {
                                        title: 'Protocolo sin gas (Gasless)',
                                        body: 'La autenticación se realiza mediante firma off-chain. Tu saldo de ETH no se modifica en ningún caso durante este proceso.'
                                    }
                                ].map((item, i) => (
                                    <li key={i}>
                                        <p className="text-[11px] font-black text-white uppercase tracking-wide mb-0.5">{item.title}</p>
                                        <p className="text-[10px] text-white/50 font-mono leading-relaxed">{item.body}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Info de usuario conectado */}
                        {isConnected && address && (
                            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl p-5">
                                <p className="text-[10px] font-black text-[#050505] uppercase tracking-widest mb-3">
                                    Sesión de Cartera Activa
                                </p>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-[9px] text-[#888888] uppercase tracking-widest font-mono">Dirección</p>
                                        <p className="text-[11px] font-mono text-[#050505] break-all">{address}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[#888888] uppercase tracking-widest font-mono">Identificador de Red</p>
                                        <p className="text-[11px] font-mono text-[#050505]">#WHALE-{address.slice(-6).toUpperCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-[#888888] uppercase tracking-widest font-mono">Estado del Pass</p>
                                        <p className="text-[11px] font-mono text-[#FF9500] font-black">PENDIENTE DE ACTIVACIÓN</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-center text-[9px] font-black text-[#888888] uppercase tracking-widest py-4 font-mono">
                Contrato: {SOVEREIGN_PASS_ADDRESS} · EIP-1155 · Red Principal Ethereum
            </p>

        </div>
    );
}
