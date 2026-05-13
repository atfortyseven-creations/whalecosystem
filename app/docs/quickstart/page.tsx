"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Check, AlertTriangle, Info } from 'lucide-react';

export default function DocQuickstart() {
  const [copied, setCopied] = React.useState<number | null>(null);

  const copy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const steps = [
    {
      n: '01',
      title: 'Instalar dependencias',
      desc: 'Instala las librerías necesarias para autenticarte y recibir eventos en tiempo real. Estas son las dependencias reales utilizadas por la plataforma.',
      code: `# Dependencias de autenticación Web3
npm install wagmi viem siwe @reown/appkit @reown/appkit-adapter-wagmi

# Cliente WebSocket para eventos en tiempo real
npm install socket.io-client

# Opcional: interacción avanzada con contratos
npm install ethers@^6`,
    },
    {
      n: '02',
      title: 'Configurar el proveedor Web3',
      desc: 'Inicializa el proveedor de Reown AppKit (WalletConnect v2) con tu Project ID. Obtén tu Project ID en cloud.reown.com.',
      code: `// lib/web3-config.ts
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, base, polygon } from '@reown/appkit/networks';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, base, polygon],
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, base, polygon],
  projectId,
  metadata: {
    name: 'Whale Alert Network',
    description: 'Inteligencia on-chain en tiempo real',
    url: 'https://humanidfi.com',
    icons: ['https://humanidfi.com/icon.png'],
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;`,
    },
    {
      n: '03',
      title: 'Autenticarse con SIWE (EIP-4361)',
      desc: 'El flujo de autenticación genera un mensaje SIWE, solicita la firma del wallet del usuario y lo verifica en el servidor. No hay contraseñas ni API keys.',
      code: `// Paso 1: Solicitar nonce al servidor
const nonceRes = await fetch('/api/auth/nonce');
const { nonce } = await nonceRes.json();

// Paso 2: Construir el mensaje SIWE
import { SiweMessage } from 'siwe';

const message = new SiweMessage({
  domain: window.location.host,
  address: walletAddress,        // de useAccount() de wagmi
  statement: 'Acceso a Whale Alert Network',
  uri: window.location.origin,
  version: '1',
  chainId: 1,                    // Ethereum Mainnet
  nonce,
});

// Paso 3: Firmar con el wallet del usuario
import { useSignMessage } from 'wagmi';
const { signMessageAsync } = useSignMessage();
const signature = await signMessageAsync({
  message: message.prepareMessage(),
});

// Paso 4: Verificar en el servidor
const verifyRes = await fetch('/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, signature }),
});

// El servidor responde con una cookie 'human_session' (JWT)
// y opcionalmente 'sovereign_handshake' (dirección raw)
const { ok, user } = await verifyRes.json();
// user = { userId, address, tier, email? }`,
    },
    {
      n: '04',
      title: 'Suscribirse a eventos whale en tiempo real',
      desc: 'Una vez autenticado, conecta al servidor Socket.io para recibir alertas de movimientos de capital en tiempo real. El servidor emite el evento vitals.tx.new cada vez que detecta una transacción relevante.',
      code: `// components/WhaleAlertListener.tsx
"use client";
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface WhaleEvent {
  hash: string;
  from: string;
  to: string;
  valueUsd: number;
  chain: string;
  token: string;
  blockNumber: number;
  timestamp: number;
  zScore?: number;          // Anomalía Z-Score (≥ 2.0 = whale event)
  tier: 'PROBE' | 'HIGH_CONVICTION' | 'MEGA_EVENT';
}

export function WhaleAlertListener() {
  const [events, setEvents] = useState<WhaleEvent[]>([]);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    const socket: Socket = io('/', {
      path: '/api/socket',
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('[WAN] Conectado al stream de whale events');
    });

    // Evento principal: nueva transacción whale detectada
    socket.on('vitals.tx.new', (event: WhaleEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 50)); // Mantener últimas 50
      if (event.valueUsd > 1_000_000) {
        console.log(\`🐋 WHALE ALERT: $\${event.valueUsd.toLocaleString()} en \${event.chain}\`);
      }
    });

    // Latencia del stream
    socket.on('stream:latency', (ms: number) => setLatency(ms));

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <p>Latencia: {latency}ms — {events.length} eventos recibidos</p>
      {events.map(e => (
        <div key={e.hash}>
          [{e.tier}] ${e.valueUsd.toLocaleString()} · {e.chain} · {e.hash.slice(0, 10)}...
        </div>
      ))}
    </div>
  );
}`,
    },
    {
      n: '05',
      title: 'Consultar el API REST',
      desc: 'Todos los endpoints REST requieren una sesión válida (cookie human_session o sovereign_handshake). No existen API keys independientes — tu sesión SIWE es tu token de acceso.',
      code: `// Ejemplo: obtener alertas whale recientes
const res = await fetch('/api/whale/alerts?chain=ethereum&minUsd=500000', {
  credentials: 'include', // Incluye las cookies de sesión automáticamente
});
const { data } = await res.json();
// data = WhaleEvent[]

// Ejemplo: consultar perfil de un wallet
const profileRes = await fetch('/api/wallet/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', {
  credentials: 'include',
});
const wallet = await profileRes.json();
// wallet = { address, balance, tier, txCount, labels[] }

// Ejemplo: obtener mercados top por volumen
const marketsRes = await fetch('/api/market/top?limit=20', {
  credentials: 'include',
});
const markets = await marketsRes.json();`,
    },
  ];

  return (
    <div className="doc-content">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-25 mb-8">Docs / Quickstart</p>
      <h1>Quickstart</h1>

      <p>
        Esta guía muestra cómo integrar Whale Alert Network en tu aplicación en menos de 15 minutos.
        Todos los ejemplos de código utilizan librerías reales disponibles en npm — no hay paquetes ficticios.
        La autenticación se realiza exclusivamente mediante <strong>EIP-4361 (Sign-In With Ethereum)</strong>;
        no hay contraseñas, claves de API independientes, ni registro por email obligatorio.
      </p>

      <div className="callout">
        <p>
          <strong>Requisito previo:</strong> Node.js ≥ 20.0.0, un wallet compatible con EIP-1193
          (MetaMask, Coinbase Wallet, Rabby, WalletConnect v2), y un{' '}
          <a href="https://cloud.reown.com" target="_blank" rel="noopener noreferrer" className="underline opacity-80">
            Project ID de Reown
          </a>.
        </p>
      </div>

      {steps.map((step, i) => (
        <div key={i} className="py-10 border-b border-black/6 dark:border-white/6">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="font-mono text-[32px] font-black opacity-8">{step.n}</span>
            <h2 className="m-0 p-0 border-0">{step.title}</h2>
          </div>
          <p>{step.desc}</p>
          <div className="relative group">
            <pre>{step.code}</pre>
            <button
              onClick={() => copy(step.code, i)}
              className="absolute top-3 right-3 p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
              title="Copiar"
            >
              {copied === i ? <Check size={13} className="text-[#00C076]" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      ))}

      <div className="my-8 p-5 border border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Seguridad</p>
            <p className="m-0 text-[13px]">
              Nunca expongas variables de entorno sensibles en el cliente. Las claves <code>ALCHEMY_API_KEY</code>,{' '}
              <code>JWT_SECRET</code>, <code>DATABASE_URL</code> y <code>REDIS_URL</code> deben
              permanecer exclusivamente en el servidor. Usa <code>NEXT_PUBLIC_</code> únicamente para
              valores seguros que el navegador necesita conocer (como el Project ID de WalletConnect).
            </p>
          </div>
        </div>
      </div>

      <h2>Variables de Entorno Requeridas</h2>
      <p>El archivo <code>.env.example</code> en la raíz del proyecto documenta todas las variables. Las mínimas para ejecutar la aplicación en modo desarrollo son:</p>
      <pre>{`# Base de datos (PostgreSQL)
DATABASE_URL="postgresql://[REDACTED_DB_USER]:[REDACTED_DB_PASS]@localhost:5432/whale_alert"

# Redis (Upstash o Redis local)
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxx..."
REDIS_URL="redis://localhost:6379"

# Blockchain RPC
ALCHEMY_API_KEY="tu_clave_alchemy"
NEXT_PUBLIC_ALCHEMY_API_KEY="tu_clave_alchemy_publica"

# Autenticación JWT (mínimo 32 caracteres)
JWT_SECRET="genera_un_secreto_aleatorio_seguro_de_64_chars"
KYC_SECRET="genera_un_secreto_para_kyc_tokens"

# WalletConnect / Reown
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="tu_project_id_de_reown_cloud"

# Neo4j (opcional, para funciones de grafo)
NEO4J_URI="bolt://localhost:7687"
NEO4J_USERNAME="neo4j"
NEO4J_PASSWORD="tu_password_neo4j"`}
      </pre>

      <h2>Siguientes Pasos</h2>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Guía de autenticación SIWE completa', href: '/docs/developer/overview' },
          { label: 'Referencia completa de endpoints REST', href: '/docs/developer/compendium' },
          { label: 'Desplegar tu propio nodo', href: '/docs/operator/overview' },
          { label: 'Conceptos de la plataforma', href: '/docs/intro' },
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
