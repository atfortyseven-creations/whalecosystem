"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Server, Shield, Activity, Cpu } from 'lucide-react';

const HARDWARE = [
  { spec: 'CPU',     fullNode: '8-core / 16 vCPU',  seq: '16-core dedicados',  prover: '32-core (AVX-512 recomendado)' },
  { spec: 'RAM',     fullNode: '16 GB',              seq: '32 GB ECC',          prover: '64 GB ECC' },
  { spec: 'Storage', fullNode: '1 TB NVMe SSD',      seq: '2 TB NVMe SSD',      prover: '2 TB NVMe SSD' },
  { spec: 'Red',     fullNode: '25 Mbps simétrico',  seq: '100 Mbps estático',  prover: '1 Gbps dedicado' },
];

const PORTS = [
  { port: '3000',  proto: 'TCP',     purpose: 'Servidor Next.js (desarrollo)' },
  { port: '3001',  proto: 'TCP',     purpose: 'Servidor Socket.io (desarrollo concurrente)' },
  { port: '40400', proto: 'TCP+UDP', purpose: 'P2P peer discovery (si corres libp2p)' },
  { port: '8080',  proto: 'TCP',     purpose: 'HTTP API pública' },
  { port: '8880',  proto: 'TCP',     purpose: 'Admin API (NUNCA exponer públicamente)' },
  { port: '5432',  proto: 'TCP',     purpose: 'PostgreSQL (solo local/intranet)' },
  { port: '6379',  proto: 'TCP',     purpose: 'Redis local (solo local/intranet)' },
  { port: '7687',  proto: 'TCP',     purpose: 'Neo4j Bolt (solo local/intranet)' },
];

export default function OperatorOverviewPage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Operator / Overview</p>
      <h1>Operator Overview</h1>

      <p>
        Esta sección cubre todo lo necesario para desplegar, operar y mantener la infraestructura
        de Whale Alert Network. La aplicación es una plataforma Next.js 15 que se puede desplegar
        en Railway (configuración recomendada), Vercel, o en infraestructura propia con Docker y PM2.
      </p>

      <p>
        El sistema está diseñado para operar en <strong>Modo Degradado</strong>: si Redis no está disponible,
        la aplicación arranca igualmente y sirve la UI. Si el nodo RPC falla, se activa el proveedor
        de respaldo configurado. El objetivo es que el servicio sea siempre accesible.
      </p>

      <div className="callout">
        <p>
          <strong>Inicio rápido:</strong> Revisa los{' '}
          <Link href="/docs/operator/prerequisites" className="underline opacity-80 hover:opacity-100">Requisitos previos</Link>,
          configura las variables de entorno, y ejecuta <code>npm run start:all</code> (que usa{' '}
          <code>concurrently</code> para iniciar Next.js y el servidor Socket.io en paralelo).
        </p>
      </div>

      <h2>Modos de Despliegue</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        {[
          {
            icon: Server,
            title: 'Railway (Recomendado)',
            desc: 'Despliegue con un clic. Los servicios PostgreSQL, Redis y la aplicación Next.js se gestionan automáticamente. Variables de entorno en el panel de Railway. Logs en tiempo real integrados.',
          },
          {
            icon: Shield,
            title: 'Docker + Docker Compose',
            desc: 'El archivo docker-compose.yml define todos los servicios: Next.js (Next Server), Socket.io Worker, PostgreSQL y Redis. Adecuado para infraestructura propia o VPS dedicado.',
          },
          {
            icon: Cpu,
            title: 'PM2 (Producción Local)',
            desc: 'El archivo ecosystem.config.json define los procesos Next.js y el worker Socket.io para gestión con PM2. Incluye auto-restart y clustering configurable.',
          },
          {
            icon: Activity,
            title: 'Desarrollo Local (SovereignVault)',
            desc: 'El script SovereignVault_RUN.bat (Windows) o npm run start:all ejecuta Next.js y el servidor Socket.io en modo concurrente con recarga en caliente.',
          },
        ].map((item, i) => (
          <div key={i} className="p-5 border border-black/8 dark:border-white/8 hover:border-[#00C076]/40 transition-colors">
            <div className="flex items-center gap-2 mb-3 opacity-70">
              <item.icon size={16} />
              <span className="font-mono text-[10px] uppercase tracking-widest font-black">{item.title}</span>
            </div>
            <p className="text-[13px] leading-relaxed opacity-60 m-0">{item.desc}</p>
          </div>
        ))}
      </div>

      <h2>Guía de Inicio Rápido</h2>
      <div className="flex flex-col gap-px border border-black/8 dark:border-white/8 my-4">
        {[
          { step: '01', label: 'Revisar Requisitos Previos', href: '/docs/operator/prerequisites', note: 'Node.js ≥ 20, Docker, variables de entorno' },
          { step: '02', label: 'Configurar Variables de Entorno', href: '/docs/operator/prerequisites', note: 'DATABASE_URL, REDIS_URL, ALCHEMY_API_KEY...' },
          { step: '03', label: 'Inicializar la Base de Datos', href: '/docs/operator/setup', note: 'prisma migrate deploy + prisma db push' },
          { step: '04', label: 'Desplegar la Aplicación', href: '/docs/operator/setup', note: 'Railway / Docker Compose / PM2' },
          { step: '05', label: 'Configurar Monitorización', href: '/docs/operator/monitoring', note: 'PM2 logs, Railway metrics, alertas Telegram' },
        ].map((s, i) => (
          <Link key={i} href={s.href}
            className="flex items-center gap-5 px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
            <span className="font-mono text-[22px] font-black opacity-10 group-hover:opacity-25 transition-opacity w-8 shrink-0">{s.step}</span>
            <div className="flex-1">
              <div className="font-mono text-[12px] font-black uppercase tracking-wide">{s.label}</div>
              <div className="font-mono text-[10px] opacity-35 mt-0.5">{s.note}</div>
            </div>
            <ArrowRight size={12} className="opacity-20 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>

      <h2>Requisitos de Hardware Mínimos</h2>
      <table>
        <thead>
          <tr><th>Componente</th><th>Full Node</th><th>Sequencer</th><th>Prover ZK</th></tr>
        </thead>
        <tbody>
          {HARDWARE.map((h, i) => (
            <tr key={i}>
              <td><strong>{h.spec}</strong></td>
              <td>{h.fullNode}</td>
              <td>{h.seq}</td>
              <td>{h.prover}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Sistema Operativo Compatible</h2>
      <p>La aplicación se ejecuta en cualquier sistema con Node.js ≥ 20:</p>
      <table>
        <thead><tr><th>OS</th><th>Soporte</th><th>Notas</th></tr></thead>
        <tbody>
          {[
            ['Ubuntu 22.04 LTS', 'Producción', 'Recomendado para servidores'],
            ['Debian 12', 'Producción', 'Alternativa estable'],
            ['macOS (ARM/Intel)', 'Desarrollo', 'Docker Desktop requerido'],
            ['Windows 11', 'Desarrollo', 'WSL2 recomendado; SovereignVault_RUN.bat disponible'],
          ].map(([os, soporte, nota], i) => (
            <tr key={i}>
              <td><strong>{os}</strong></td>
              <td>{soporte}</td>
              <td>{nota}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Puertos Requeridos</h2>
      <table>
        <thead><tr><th>Puerto</th><th>Protocolo</th><th>Propósito</th></tr></thead>
        <tbody>
          {PORTS.map((p, i) => (
            <tr key={i}>
              <td><code>{p.port}</code></td>
              <td>{p.proto}</td>
              <td>{p.purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Componentes del Sistema</h2>
      <p>El sistema se compone de los siguientes procesos que deben estar en ejecución:</p>
      <table>
        <thead><tr><th>Proceso</th><th>Comando</th><th>Propósito</th></tr></thead>
        <tbody>
          {[
            ['Next.js Server', 'npm run dev / npm run start', 'Servidor web principal, API Routes, SSR'],
            ['Socket.io Worker', 'node server/socketio-worker.js', 'WebSocket bidireccional para eventos en tiempo real'],
            ['BullMQ Workers', 'node workers/queue-worker.js', 'Procesamiento asíncrono de colas (alertas, emails)'],
            ['PostgreSQL', 'Railway / Docker / local', 'Base de datos relacional principal'],
            ['Redis/Upstash', 'Railway / Upstash / local', 'PubSub, caché de sesiones, rate limiting'],
            ['Neo4j', 'Docker / AuraDB', 'Grafo de relaciones entre wallets (opcional)'],
          ].map(([proc, cmd, purpose], i) => (
            <tr key={i}>
              <td><strong>{proc}</strong></td>
              <td><code>{cmd}</code></td>
              <td>{purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Variables de Entorno Críticas</h2>
      <pre>{`# Base de datos
DATABASE_URL="postgresql://[REDACTED_DB_USER]:[REDACTED_DB_PASS]@host:5432/whale_alert"

# Redis (Upstash serverless o instancia local)
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxx..."
REDIS_URL="redis://[REDACTED_REDIS_USER]:[REDACTED_REDIS_PASS]@humanidfi.com"

# KYC (Sumsub)
SUMSUB_APP_TOKEN="tu_token_sumsub"
SUMSUB_SECRET_KEY="tu_secreto_sumsub"

# Neo4j (opcional)
NEO4J_URI="bolt://localhost:7687"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="tu_password"

# Telegram (alertas opcionales)
TELEGRAM_BOT_TOKEN="tu_bot_token"
TELEGRAM_CHAT_ID="tu_chat_id"`}</pre>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Requisitos previos completos', href: '/docs/operator/prerequisites' },
          { label: 'Monitorización y logs', href: '/docs/operator/monitoring' },
          { label: 'API para desarrolladores', href: '/docs/developer/overview' },
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
