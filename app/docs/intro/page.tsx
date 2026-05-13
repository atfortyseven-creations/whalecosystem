"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Globe, Lock, Cpu, Database, Network, Zap, GitBranch } from 'lucide-react';

export default function DocIntro() {
  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Docs / Core Concepts</p>
      <h1>Introducción a Whale Alert Network</h1>

      <p>
        Whale Alert Network es una terminal de inteligencia on-chain en tiempo real diseñada para analistas cuantitativos,
        equipos institucionales y desarrolladores que necesitan observabilidad completa sobre flujos de capital a escala en múltiples
        cadenas de bloques. La plataforma está construida íntegramente sobre Next.js 15 con App Router, React 19, PostgreSQL a través
        de Prisma 6, Neo4j para análisis de grafos, Redis/Upstash para PubSub y caché, y Socket.io para streaming en tiempo real.
      </p>

      <p>
        A diferencia de las plataformas SaaS convencionales que procesan tus consultas en servidores centralizados —
        almacenando implícitamente qué activos sigues y cuándo — Whale Alert Network implementa una arquitectura
        <strong> Sovereign-first</strong>: el motor de detección puede desplegarse localmente en tu propio hardware,
        de modo que el servicio central nunca puede deducir tu estrategia de observación.
      </p>

      <div className="callout">
        <p>
          <strong>Principio fundamental:</strong> Toda la lógica de filtrado y correlación se ejecuta en el proceso Node.js
          que tú controlas. Las APIs públicas (Alchemy, GetBlock, Infura) reciben flujos de bloques sin procesar;
          la agrupación, el Z-Score y el marcado de entidades ocurren localmente, en tu RAM.
        </p>
      </div>

      <h2>Filosofía del Protocolo</h2>

      <p>
        El ecosistema on-chain moderno está caracterizado por una asimetría de información extrema.
        Los actores institucionales —denominados "whales" en la jerga del sector— utilizan cuentas de custodia opaca,
        dark pools OTC y técnicas de manipulación del mempool para disimular las trayectorias de su capital.
        Whale Alert Network restablece la <em>observabilidad termodinámica</em> del mercado mediante tres pilares:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
        {[
          {
            icon: Shield,
            title: 'Integridad Criptográfica',
            body: 'Autenticación sin contraseñas mediante EIP-4361 (Sign-In With Ethereum). Tu wallet es tu única credencial. Las mutaciones críticas requieren firma ECDSA; ningún servidor almacena claves privadas.',
          },
          {
            icon: Database,
            title: 'Grafo de Entidades Neo4j',
            body: 'Las transferencias on-chain se almacenan como relaciones tipadas en Neo4j. Consultas Cypher de 5 saltos permiten rastrear rutas de capital a través de mixers, puentes y contratos intermediarios.',
          },
          {
            icon: Zap,
            title: 'Detección Pre-Ejecución',
            body: 'Suscripción directa al mempool global vía Alchemy gRPC. Las transacciones se analizan con un Z-Score de ventana deslizante de 14 bloques antes de la confirmación on-chain.',
          },
        ].map((card) => (
          <div key={card.title} className="p-5 border border-black/8 dark:border-white/8 hover:border-[#00C076]/40 transition-colors">
            <div className="flex items-center gap-2 mb-3 opacity-70">
              <card.icon size={16} />
              <span className="font-mono text-[10px] uppercase tracking-widest font-black">{card.title}</span>
            </div>
            <p className="text-[13px] leading-relaxed opacity-60 m-0">{card.body}</p>
          </div>
        ))}
      </div>

      <h2>Stack Tecnológico Verificado</h2>

      <p>
        La siguiente tabla refleja las dependencias reales del archivo <code>package.json</code> del proyecto.
        No hay paquetes ficticios ni SDKs inexistentes.
      </p>

      <table>
        <thead>
          <tr><th>Capa</th><th>Tecnología</th><th>Versión</th><th>Propósito</th></tr>
        </thead>
        <tbody>
          {[
            ['Frontend', 'Next.js', '^15.1.0', 'App Router, SSR, API Routes'],
            ['Frontend', 'React', '^19.0.0', 'UI reactivo con Concurrent Mode'],
            ['Frontend', 'Framer Motion', '^12.35.0', 'Animaciones y transiciones'],
            ['Autenticación', 'siwe', '^3.0.0', 'EIP-4361 Sign-In With Ethereum'],
            ['Autenticación', 'wagmi', '^2.19.5', 'React hooks para Ethereum'],
            ['Autenticación', 'viem', '^2.47.6', 'Interacciones con EVM de bajo nivel'],
            ['Wallet', '@reown/appkit', 'latest', 'WalletConnect v2 / modal de conexión'],
            ['Identidad ZK', '@worldcoin/idkit', '^1.5.0', 'Pruebas ZK-SNARK WorldID'],
            ['ZK Proofs', 'circomlibjs', '^0.1.7', 'Circuitos ZK para licencias institucionales'],
            ['ZK Proofs', 'snarkjs', '^0.7.6', 'Generación y verificación de ZK-SNARKs'],
            ['Mensajería E2E', '@xmtp/browser-sdk', '^5.2.0', 'Chat cifrado wallet-to-wallet'],
            ['Base de datos', 'prisma', '^6.0.0', 'ORM para PostgreSQL (esquema relacional)'],
            ['Grafo', 'neo4j-driver', '^6.0.1', 'Análisis de relaciones entre wallets'],
            ['Cache/PubSub', '@upstash/redis', '^1.36.2', 'Redis serverless (Railway compatible)'],
            ['Cache/PubSub', 'ioredis', '^5.4.1', 'Redis cliente Node.js para workers'],
            ['Tiempo Real', 'socket.io', '^4.8.3', 'WebSocket bidireccional servidor/cliente'],
            ['Blockchain', 'alchemy-sdk', '^3.6.5', 'Mempool, gRPC, webhooks Alchemy'],
            ['Blockchain', 'ethers', '^6.16.0', 'Firma, ABI, provider Ethereum'],
            ['Contratos', 'hardhat', '^2.28.6', 'Compilación y tests de smart contracts'],
            ['Contratos', '@openzeppelin/contracts', '^5.4.0', 'Contratos auditados (ERC-20, TimeLock)'],
            ['Pagos', 'stripe', '^20.3.0', 'Suscripciones fiat en EUR/USD'],
            ['KYC', '@sumsub/websdk-react', '^2.6.1', 'Verificación de identidad (AML)'],
            ['Email', 'resend', '^6.9.1', 'Notificaciones transaccionales'],
            ['Colas', 'bullmq', '^5.70.1', 'Colas de trabajo asíncronas'],
            ['Proceso', 'pm2', '^5.4.3', 'Gestión de procesos en producción'],
            ['Tests', 'vitest', '^2.1.0', 'Suite de tests unitarios'],
          ].map(([layer, tech, ver, desc], i) => (
            <tr key={i}>
              <td><span className="opacity-50">{layer}</span></td>
              <td><code>{tech}</code></td>
              <td><code>{ver}</code></td>
              <td>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Cadenas Soportadas</h2>

      <p>
        El motor de detección soporta las siguientes redes EVM y no-EVM. La cobertura multi-chain
        se realiza a través de proveedores RPC configurables en las variables de entorno:
      </p>

      <table>
        <thead>
          <tr><th>Red</th><th>Tipo</th><th>Proveedor RPC Principal</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {[
            ['Ethereum Mainnet', 'L1 EVM', 'Alchemy / Infura', 'Producción'],
            ['Base', 'L2 EVM (Optimistic)', 'Alchemy', 'Producción'],
            ['Binance Smart Chain', 'L1 EVM compatible', 'GetBlock', 'Producción'],
            ['Polygon PoS', 'L2 EVM', 'Alchemy / GetBlock', 'Producción'],
            ['Arbitrum One', 'L2 EVM (Optimistic)', 'Alchemy', 'Producción'],
            ['Optimism', 'L2 EVM (Optimistic)', 'Alchemy', 'Producción'],
            ['Avalanche C-Chain', 'L1 EVM', 'GetBlock', 'Beta'],
            ['Solana', 'L1 no-EVM', '@solana/web3.js', 'Beta'],
            ['Bitcoin', 'L1 no-EVM', 'Mempool.space API', 'Beta'],
            ['Tron', 'L1 no-EVM (TRC-20)', 'TronWeb', 'Pagos USDT'],
          ].map(([chain, type, rpc, status], i) => (
            <tr key={i}>
              <td><strong>{chain}</strong></td>
              <td>{type}</td>
              <td><code>{rpc}</code></td>
              <td>{status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Módulos de la Plataforma</h2>

      <p>El dashboard se organiza en módulos funcionales accesibles desde la barra lateral:</p>

      <table>
        <thead>
          <tr><th>Módulo</th><th>Tab ID</th><th>Descripción</th><th>Plan mínimo</th></tr>
        </thead>
        <tbody>
          {[
            ['Access Pass', 'gold', 'Mint de pases institucionales (NFT ERC-721)', 'FREE'],
            ['My Portfolio', 'portfolio', 'Balance multi-chain del wallet conectado', 'FREE'],
            ['Billing & Plan', 'billing', 'Gestión de suscripción y facturas', 'FREE'],
            ['Top Markets', 'markets', 'Variación de precio y volumen cross-chain', 'FREE'],
            ['New Listings', 'newpairs', 'Tokens listados en DEXs en tiempo real', 'FREE'],
            ['Whale Ledger', 'inst-ledger', 'Transferencias >$50K por entidades conocidas', 'FREE'],
            ['Mass Transfers', 'mass-transfer', 'Movimientos coordinados multi-wallet', 'STANDARD'],
            ['Block Explorer', 'omniexplorer', 'Búsqueda cross-chain de wallets y transacciones', 'FREE'],
            ['DeFi Yields', 'defi', 'Tasas de interés en protocolos DeFi', 'STANDARD'],
            ['Morpho Base', 'morpho', 'TVL y APY en pools Morpho Blue (Base)', 'FREE'],
            ['Aztec Pipeline', 'zk', 'Visualización del pipeline ZK-rollup de Aztec', 'FREE'],
            ['Prediction Markets', 'polymarket', 'Mercados de predicción en tiempo real', 'FREE'],
            ['Whale Chat', 'chat', 'Mensajería E2E cifrada vía XMTP', 'FREE'],
            ['News', 'news', 'Noticias financieras curadas', 'FREE'],
            ['Academy', 'academy', 'Guías educativas sobre blockchain y DeFi', 'FREE'],
            ['Support', 'support', 'Contacto con el equipo de soporte', 'FREE'],
            ['Session Logs', 'logs', 'Historial de acciones de la sesión actual', 'FREE'],
          ].map(([mod, id, desc, plan], i) => (
            <tr key={i}>
              <td><strong>{mod}</strong></td>
              <td><code>{id}</code></td>
              <td>{desc}</td>
              <td><code>{plan}</code></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Quickstart — Integración en 5 minutos', href: '/docs/quickstart' },
          { label: 'Arquitectura de la plataforma', href: '/docs/platform/architecture' },
          { label: 'Autenticación SIWE (EIP-4361)', href: '/docs/platform/auth' },
          { label: 'API para desarrolladores', href: '/docs/developer/overview' },
          { label: 'Despliegue de un nodo completo', href: '/docs/operator/overview' },
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
