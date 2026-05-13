"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Lock, Globe, Database, Network, Copy, Check } from 'lucide-react';

const ENDPOINTS = [
  { method: 'GET',  path: '/api/auth/nonce',               desc: 'Obtiene un nonce SIWE para iniciar la autenticación', plan: 'FREE' },
  { method: 'POST', path: '/api/auth/verify',              desc: 'Verifica firma SIWE y emite cookie JWT de sesión', plan: 'FREE' },
  { method: 'GET',  path: '/api/auth/session',             desc: 'Usuario autenticado actual, tier y suscripción', plan: 'FREE' },
  { method: 'POST', path: '/api/auth/signout',             desc: 'Cierra sesión y elimina cookies', plan: 'FREE' },
  { method: 'GET',  path: '/api/whale/alerts',             desc: 'Movimientos whale. Params: chain, minUsd, limit, page', plan: 'FREE' },
  { method: 'GET',  path: '/api/wallet/:address',          desc: 'Perfil on-chain: saldo, etiquetas, tier', plan: 'FREE' },
  { method: 'GET',  path: '/api/wallet/:address/history',  desc: 'Historial de transacciones paginado', plan: 'FREE' },
  { method: 'GET',  path: '/api/market/top',               desc: 'Top mercados por volumen 24h', plan: 'FREE' },
  { method: 'GET',  path: '/api/market/global',            desc: 'Market cap total, dominancia BTC, tokens activos', plan: 'FREE' },
  { method: 'GET',  path: '/api/market/signals',           desc: 'Señales del motor Z-Score', plan: 'STANDARD' },
  { method: 'GET',  path: '/api/markets/stream',           desc: 'Stream de precios (polling 3s)', plan: 'FREE' },
  { method: 'GET',  path: '/api/newpairs',                 desc: 'Tokens nuevos en DEXs. Params: chain, limit', plan: 'FREE' },
  { method: 'GET',  path: '/api/intel/institutional',      desc: 'Transferencias institucionales grandes (>$50K)', plan: 'FREE' },
  { method: 'GET',  path: '/api/intel/mass-transfers',     desc: 'Movimientos coordinados multi-wallet', plan: 'STANDARD' },
  { method: 'GET',  path: '/api/defi/yields',              desc: 'Tasas DeFi (Morpho, Aave, Compound)', plan: 'STANDARD' },
  { method: 'GET',  path: '/api/defi/morpho',              desc: 'TVL y APY Morpho Blue (Base)', plan: 'FREE' },
  { method: 'GET',  path: '/api/polymarket/markets',       desc: 'Mercados de predicción activos', plan: 'FREE' },
  { method: 'GET',  path: '/api/explorer/:chain/:hash',    desc: 'Detalles de transacción o bloque', plan: 'FREE' },
  { method: 'POST', path: '/api/forum/posts',              desc: 'Crear post firmado (requiere sesión SIWE)', plan: 'FREE' },
  { method: 'POST', path: '/api/payment/stripe/checkout',  desc: 'Inicia checkout Stripe', plan: 'FREE' },
  { method: 'POST', path: '/api/payment/confirm',          desc: 'Confirma pago TRC-20 USDT manualmente', plan: 'FREE' },
  { method: 'GET',  path: '/api/network/getblock-health',  desc: 'Estado del nodo RPC GetBlock', plan: 'FREE' },
  { method: 'GET',  path: '/api/health',                   desc: 'Healthcheck del servidor', plan: 'FREE' },
];

const PLANS = [
  { name: 'FREE',     calls: '100 req / 10s',   ws: 'Solo lectura', webhooks: 'No' },
  { name: 'STANDARD', calls: '500 req / 10s',   ws: 'Sí',           webhooks: 'Sí' },
  { name: 'PRO',      calls: '2.000 req / 10s', ws: 'Sí',           webhooks: 'Sí' },
  { name: 'ELITE',    calls: 'Sin límite',       ws: 'Sí',           webhooks: 'Sí' },
];

export default function DeveloperOverviewPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Developer / Overview</p>
      <h1>Developer Overview</h1>

      <p>
        La API de Whale Alert Network proporciona acceso programático a inteligencia on-chain en tiempo real.
        La autenticación se realiza exclusivamente mediante <strong>EIP-4361 (Sign-In With Ethereum)</strong>.
        No hay API keys independientes — tu sesión SIWE (cookie <code>human_session</code>) es tu credencial.
      </p>

      <div className="callout">
        <p>
          <strong>Autenticación:</strong> Envía todas las peticiones con <code>credentials: 'include'</code>
          para que el navegador incluya automáticamente las cookies de sesión. Para peticiones server-to-server,
          incluye el header <code>Cookie: human_session=JWT</code>. Ver{' '}
          <Link href="/docs/quickstart" className="underline opacity-80 hover:opacity-100">Quickstart</Link>.
        </p>
      </div>

      <h2>URL Base</h2>
      <pre>{`https://humanidfi.com/api`}</pre>

      <h2>Flujo de Autenticación</h2>
      <pre>{`// 1. Nonce anti-replay
const { nonce } = await fetch('/api/auth/nonce').then(r => r.json());

// 2. Construir mensaje SIWE (EIP-4361)
const message = new SiweMessage({
  domain: window.location.host,
  address: '0xTuWallet',
  statement: 'Acceso a Whale Alert Network',
  uri: window.location.origin,
  version: '1',
  chainId: 1,
  nonce,
});

// 3. Firmar con el wallet del usuario
const signature = await wallet.signMessage(message.prepareMessage());

// 4. Verificar — el servidor emite cookie 'human_session' (JWT)
const { ok, user } = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ message, signature }),
}).then(r => r.json());
// user = { userId, address, tier, email? }`}</pre>

      <h2>Referencia de Endpoints</h2>

      <div className="flex flex-col gap-px border border-black/8 dark:border-white/8 my-6">
        {ENDPOINTS.map((ep, i) => (
          <div key={i} className="flex items-start gap-4 px-5 py-3.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <span className={`font-mono text-[10px] font-black tracking-widest shrink-0 mt-0.5 w-10 ${ep.method === 'GET' ? 'text-[#00C076]' : 'text-blue-400'}`}>
              {ep.method}
            </span>
            <code className="font-mono text-[11px] flex-1 min-w-0">{ep.path}</code>
            <span className="font-mono text-[10px] opacity-40 flex-1 hidden md:block">{ep.desc}</span>
            <span className={`font-mono text-[9px] font-black px-2 py-0.5 rounded shrink-0 ${ep.plan === 'FREE' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              {ep.plan}
            </span>
          </div>
        ))}
      </div>

      <h2>Rate Limiting</h2>
      <p>
        Ventana deslizante de 10 segundos via Redis Upstash. Respuesta <code>429</code> con
        header <code>Retry-After: 10</code> al superar el límite.
      </p>
      <table>
        <thead><tr><th>Plan</th><th>Llamadas REST</th><th>WebSocket</th><th>Webhooks</th></tr></thead>
        <tbody>
          {PLANS.map((p, i) => (
            <tr key={i}>
              <td><strong>{p.name}</strong></td>
              <td><code>{p.calls}</code></td>
              <td>{p.ws}</td>
              <td>{p.webhooks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>WebSocket — Eventos en Tiempo Real</h2>
      <pre>{`import { io } from 'socket.io-client';

const socket = io('/', {
  path: '/api/socket',
  transports: ['websocket'],
  withCredentials: true,
});

// Evento principal: nueva transacción whale detectada
socket.on('vitals.tx.new', (event) => {
  // event = { hash, from, to, valueUsd, chain, token,
  //           blockNumber, timestamp, zScore, tier }
  // tier: 'PROBE' (Z≥2.0) | 'HIGH_CONVICTION' (Z≥3.0) | 'MEGA_EVENT' (Z≥4.5)
  console.log(\`🐋 \${event.tier}: $\${event.valueUsd.toLocaleString()}\`);
});

// Suscribirse a alertas de un wallet
socket.emit('subscribe:wallet', { address: '0x...' });`}</pre>

      <h2>Códigos de Error</h2>
      <table>
        <thead><tr><th>HTTP</th><th>Error</th><th>Causa</th></tr></thead>
        <tbody>
          {[
            ['401', 'UNAUTHORIZED', 'Sin cookie de sesión válida o expirada'],
            ['403', 'FORBIDDEN', 'Plan insuficiente para el endpoint'],
            ['403', 'RESTRICTED_JURISDICTION', 'IP desde país geobloqueado'],
            ['429', 'RATE_LIMITED', 'Límite superado — reintentar en 10s'],
            ['401', 'REPLAY_DETECTED', 'Nonce ya utilizado en petición anterior'],
            ['503', 'SERVICE_UNAVAILABLE', 'Error en subsistema de seguridad'],
          ].map(([code, err, cause], i) => (
            <tr key={i}>
              <td><code>{code}</code></td>
              <td><code>{err}</code></td>
              <td>{cause}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Capacidades Principales</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {[
          { icon: Zap,      title: 'Latencia <100ms',       desc: 'Desde detección en mempool hasta el cliente WebSocket.' },
          { icon: Lock,     title: 'Sin contraseñas',       desc: 'EIP-4361 SIWE. El servidor verifica la firma criptográficamente.' },
          { icon: Globe,    title: 'Multi-Chain',           desc: 'ETH, Base, Polygon, Arbitrum, Optimism, BNB, Solana, BTC.' },
          { icon: Database, title: 'Grafo Neo4j',           desc: 'Consultas Cypher de 5 saltos a través de mixers y puentes.' },
          { icon: Network,  title: 'Z-Score Detector',      desc: 'Ventana de 14 bloques. Z≥2.0=PROBE, Z≥3.0=HIGH, Z≥4.5=MEGA.' },
          { icon: Lock,     title: 'Seguridad Multicapa',   desc: 'WAF OWASP, rate limiting, anti-replay, honeypots, CSP nonce.' },
        ].map((f, i) => (
          <div key={i} className="p-5 border border-black/8 dark:border-white/8 hover:border-[#00C076]/40 transition-colors">
            <div className="flex items-center gap-2 mb-2 opacity-60">
              <f.icon size={16} />
              <span className="font-mono text-[10px] uppercase tracking-widest font-black">{f.title}</span>
            </div>
            <p className="text-[13px] leading-relaxed opacity-55 m-0">{f.desc}</p>
          </div>
        ))}
      </div>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Quickstart — integración en 5 minutos', href: '/docs/quickstart' },
          { label: 'Referencia completa del API', href: '/docs/developer/compendium' },
          { label: 'Desplegar tu propio nodo', href: '/docs/operator/overview' },
        ].map((lnk, i) => (
          <Link key={i} href={lnk.href}
            className="flex items-center gap-2 font-mono text-[12px] opacity-40 hover:opacity-100 hover:text-[#00C076] transition-all group py-1">
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            {lnk.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
