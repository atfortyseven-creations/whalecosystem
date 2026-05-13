"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Box, Activity, Database, ShieldCheck, Zap, Lock, EyeOff } from 'lucide-react';

export default function PlatformArchitecturePage() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Platform / Architecture</p>
      <h1>Sovereign Vault Architecture</h1>

      <p>
        Whale Alert Network no es una aplicación monolítica tradicional, sino un ecosistema
        distribuido diseñado bajo el paradigma <strong>Sovereign Vault</strong>. Esta arquitectura
        garantiza que la lógica de detección, el análisis de grafos y las firmas criptográficas
        puedan ejecutarse en un entorno "Zero-Trust" donde el operador tiene control absoluto
        sobre sus datos y claves.
      </p>

      <h2>Topología del Sistema</h2>

      <div className="my-8 p-6 bg-[#050505] text-white rounded-xl border border-white/10 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre">
{`[ Cliente Web3 ] <--- SIWE Auth ---> [ Next.js Edge ]
   (React 19)                           | (WAF, CSP, Rate Limit)
       |                                |
       | WebSocket (Socket.io)          v
       +-----------------------> [ API REST Routes ]
                                        |
+---------------------------------------+----------------------------------+
|                          CAPA DE SERVICIOS                               |
+---------------------------------------+----------------------------------+
|                                       |                                  |
| [ Socket.io Worker ]          [ Colas BullMQ ]       [ CRON / Webhooks ] |
|  (PubSub en tiempo real)       (Jobs en 2º plano)     (Alchemy gRPC)     |
|                                       |                                  |
+-----------+---------------------------+------------------------+---------+
            |                           |                        |
            v                           v                        v
    [ Redis / Upstash ]          [ PostgreSQL ]             [ Neo4j ]
    (Caché, Sesiones)            (Prisma ORM)             (Entity Graph)`}
      </div>

      <h2>Componentes Core</h2>

      <div className="space-y-6 my-8">
        {[
          {
            icon: Box,
            title: '1. Frontend (Next.js 15 App Router)',
            desc: 'Construido en React 19. Utiliza Server Components para renderizado estático/dinámico seguro y Client Components para interacciones Web3 (wagmi) y animaciones (Framer Motion). El estado global se maneja mediante Zustand y contextos nativos de React.'
          },
          {
            icon: ShieldCheck,
            title: '2. Capa de Seguridad (Edge Middleware)',
            desc: 'El archivo middleware.ts actúa como The Iron Gate v6. Implementa un WAF OWASP-compliant, rate limiting per-IP apoyado en Upstash Redis, inyección de nonces CSP para prevención XSS, y validación exhaustiva de tokens JWT (human_session).'
          },
          {
            icon: Zap,
            title: '3. Motor de Tiempo Real (Socket.io)',
            desc: 'Debido a las limitaciones de los Server-Sent Events (SSE) y las Serverless Functions de Vercel/Next.js para streaming bidireccional sostenido, se implementa un worker Node.js dedicado ejecutando Socket.io acoplado a un adaptador Redis para escalado horizontal.'
          },
          {
            icon: Database,
            title: '4. Capa de Datos Relacional (PostgreSQL + Prisma)',
            desc: 'Almacena perfiles de usuario, niveles de suscripción, historial de transacciones procesadas (no la blockchain completa) y metadatos de configuración. Prisma 6 asegura tipos estrictos desde la base de datos hasta el cliente.'
          },
          {
            icon: EyeOff,
            title: '5. Capa de Inteligencia (Neo4j Entity Graph)',
            desc: 'Mapea las direcciones de los wallets como Nodos y las transferencias como Aristas (Edges). Permite consultas Cypher complejas (e.g., rastrear fondos que pasan por Tornado Cash y terminan en Binance) que serían inviables en una base de datos relacional.'
          },
          {
            icon: Activity,
            title: '6. Ingesta de Datos On-Chain (Alchemy + GetBlock)',
            desc: 'Conexión primaria a los mempools y bloques minados a través de webhooks de Alchemy (Alchemy Notify) y conexiones gRPC. GetBlock actúa como failover automático. Toda la ingesta se normaliza antes de pasar por el motor estadístico (Z-Score).'
          }
        ].map((comp, i) => (
          <div key={i} className="flex items-start gap-4 p-5 border border-black/8 dark:border-white/8 hover:border-[#00C076]/40 transition-colors">
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg shrink-0 mt-1">
              <comp.icon size={18} className="text-[#050505] dark:text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide m-0 mb-2">{comp.title}</h3>
              <p className="text-[13px] m-0 opacity-70 leading-relaxed">{comp.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Flujo de Vida de un Dato (Data Pipeline)</h2>

      <ol className="space-y-4">
        <li>
          <strong>Ingesta (Mempool):</strong> Alchemy gRPC detecta una transacción pendiente de 500 ETH en Ethereum Mainnet.
        </li>
        <li>
          <strong>Filtro Inicial:</strong> El worker Node.js recibe la transacción y filtra el ruido. Si el valor USD {`>`} umbral configurado ($50k), pasa a la siguiente fase.
        </li>
        <li>
          <strong>Análisis Z-Score:</strong> Se calcula el Z-Score comparando el valor de la transacción contra la media y desviación estándar de la ventana móvil de los últimos 14 bloques. Si Z ≥ 2.0, se clasifica como anomalía.
        </li>
        <li>
          <strong>Enriquecimiento:</strong> Se consulta PostgreSQL para ver si la dirección de origen o destino tiene etiquetas previas (e.g., "Binance Hot Wallet 14"). Se consulta Neo4j para encontrar rutas conectadas.
        </li>
        <li>
          <strong>Propagación:</strong> El evento se publica en Redis PubSub.
        </li>
        <li>
          <strong>Emisión a Clientes:</strong> Los workers de Socket.io reciben el mensaje de Redis y lo emiten a los clientes conectados (dashboard) a través del canal <code>vitals.tx.new</code>.
        </li>
      </ol>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2 mt-8">
        {[
          { label: 'Profundizar en la Autenticación SIWE', href: '/docs/platform/auth' },
          { label: 'Referencia para Desarrolladores', href: '/docs/developer/overview' },
          { label: 'Guía de Despliegue de Nodos', href: '/docs/operator/overview' },
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
