<p align="center">
  <img src="https://raw.githubusercontent.com/atfortyseven-creations/whalecosystem/main/public/official-whale-monochrome.png" width="120" alt="Whale Alert Network">
</p>

<h1 align="center">WHALE ALERT NETWORK</h1>
<h3 align="center">The Sovereign Intelligence Protocol — Institutional Grade On-Chain Analytics</h3>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Version-4.0.0--Final-gold?style=for-the-badge" alt="Version"></a>
  <a href="#"><img src="https://img.shields.io/badge/Railway-Pro%20Deploy-blueviolet?style=for-the-badge&logo=railway" alt="Railway"></a>
  <a href="#"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node-22.11.0-green?style=for-the-badge&logo=node.js" alt="Node"></a>
  <a href="#"><img src="https://img.shields.io/badge/Chains-16%20EVM%20%2B%20Solana-blue?style=for-the-badge" alt="Chains"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vault-EIP--1193%20Sovereign-red?style=for-the-badge" alt="Vault"></a>
  <a href="#"><img src="https://img.shields.io/badge/Mobile-Xiaomi%20%2B%20iOS%20Hardened-orange?style=for-the-badge" alt="Mobile"></a>
</p>

---

## 📌 Protocol Abstract

El sistema procesa transacciones de alto valor (ballenas) a través de múltiples redes simultáneamente aplicando filtros ZK, correlaciones temporales y Z-score propietario con latencias sub-500ms. El **Sovereign Akashic Ledger** registra cada handshake con hashes SHA-256 reales de Ethereum Mainnet en tiempo real, proporcionando una pista de auditoría inmutable de grado institucional.

### 💎 Key Institutional Features
- **Zero-Trust Signing**: EIP-1193 Sovereign Vault integrado (sin custodios externos).
- **Multi-Chain Handshake**: Sincronización nativa con 16 redes EVM (Base, Arbitrum, etc).
- **Akashic Transparency**: Registro público de hashes SHA-256 para verificación de integridad de señales.
- **Mobile Perfection**: Optimización extrema para dispositivos de bajo consumo (Xiaomi/Redmi) y WebKit (iOS).

> *"El conocimiento del mercado más poderoso no es el que puedes comprar. Es el que el mercado emite y nadie más puede leer."*

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHALE ALERT NETWORK v3.0                     │
├─────────────────┬───────────────────┬───────────────────────────┤
│   FRONTEND      │    BACKEND CORE   │   SOVEREIGN LAYER         │
│                 │                   │                           │
│  Next.js 15     │  PostgreSQL 1TB   │  Sovereign Mesh (TCP)     │
│  TypeScript     │  Redis Streams    │  ECDSA P-256 Signing      │
│  Three.js       │  Prisma ORM       │  ZK Proof Verification    │
│  GSAP + Framer  │  Redis Pub/Sub    │  AVS Node Network         │
│  Wagmi/Viem     │  BullMQ Queues    │  EigenLayer Integration   │
│  Tailwind CSS   │  PgBouncer Pool   │  Deadman Switch Contract  │
├─────────────────┴───────────────────┴───────────────────────────┤
│                    INFRASTRUCTURE LAYER                         │
│                                                                 │
│  Railway Pro (42 réplicas · 1TB Storage · 1000 vCPU)           │
│  Docker Compose (web + worker-solana + worker-mesh)             │
│  GitHub Actions CI → Railway Auto-Deploy                        │
│  Global RPC Router (6 endpoints · Auto-Failover)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔬 Stack Técnico Completo

### Frontend
| Tecnología | Uso |
|---|---|
| **Next.js 15** (App Router) | Framework principal, SSR/SSG/Streaming |
| **TypeScript 5.7** | Tipado estricto en todo el sistema |
| **Three.js + R3F** | Renderizado 3D de la interfaz y visualizaciones |
| **GSAP 3** | Animaciones de alta performance (GPU-accelerated) |
| **Framer Motion 12** | Transiciones y microinteracciones |
| **Wagmi + Viem** | Conexión Web3 y gestión de wallets |
| **RainbowKit / Reown** | UI de conexión de wallet multi-protocolo |
| **Lucide React** | Sistema de iconografía institucional |
| **SWR + React Query** | Fetching de datos con caché inteligente |
| **Recharts + D3** | Gráficos de analytics institucionales |
| **Lightweight Charts v5** | Charts Pro acelerados por Hardware (Zero-Crash API) |
| **Aztec Brutalism UI** | Arquitectura visual minimalista, texto-driven sin neones |

### Backend & Datos
| Tecnología | Uso |
|---|---|
| **PostgreSQL** | Base de datos relacional principal (1TB en Railway) |
| **Prisma 6** | ORM con 14 índices compuestos estratégicos |
| **PgBouncer** | Connection pooling para 42+ réplicas simultáneas |
| **Redis (ioredis)** | Caché, Pub/Sub, Streams XADD/XREAD |
| **Redis Streams** | Cola de eventos persistente con At-Least-Once delivery |
| **Neo4j** | Grafo de relaciones entre wallets (Arkham killer) |
| **BullMQ** | Sistema de colas para workers escalables |

### Blockchain & Contratos
| Tecnología | Uso |
|---|---|
| **Solana Web3.js** | Captura de señales SIMD-0109 (sub-500ms) |
| **Ethers.js 6 + Viem** | Interacción EVM multi-chain |
| **Hardhat** | Entorno de compilación y pruebas de contratos |
| **Solidity ^0.8** | Smart contracts (TimeLock, DeadmanSwitch, GoldTicket) |
| **OpenZeppelin** | Primitivas de seguridad para contratos |
| **SIWE** | Sign-In with Ethereum (autenticación no custodial) |
| **SnarkJS** | Pruebas de conocimiento cero (ZK Proofs) |

### Seguridad & Identidad
| Tecnología | Uso |
|---|---|
| **ECDSA secp256k1** | Firma criptográfica real de señales del Mesh |
| **World ID (WorldCoin)** | Verificación de identidad humana |
| **Clerk** | Gestión de sesiones institucionales |
| **bcryptjs** | Hash de credenciales de acceso |
| **HMAC-SHA256** | Autenticación de API keys institucionales |
| **Zod** | Validación estricta de variables de entorno |

---

## 🧠 Módulos del Sistema

### 1. 🐋 Real-Time Whale Stream (SSE)
El corazón del sistema. Captura transacciones de alto valor en tiempo real mediante:
- **Solana Worker**: Monitor de `ComputeBudget` (SIMD-0109). Intercepta órdenes institucionales por Priority Fees > 15,000 microlamports, hasta 400ms antes de que la liquidez del pool se resuelva.
- **EVM Scanner**: Monitoreo de mempool para ETH, BSC, Arbitrum, Base y Polygon.
- **Redis Streams (XADD/XREAD)**: Garantía de entrega At-Least-Once. Los eventos nunca se pierden, incluso si el servidor reinicia durante una captura crítica.

### 2. 🌐 Sovereign Mesh Network
Red P2P descentralizada para propagación de señales ZK entre nodos:
- **Protocolo**: Redis Pub/Sub sobre TCP (compatible con VPCs de Railway/AWS).
- **Criptografía**: Firma ECDSA real por nodo. Cada señal lleva `pubKey + signature` verificables.
- **Auto-Escalado Seguro**: Cola de retención límite `MAXLEN` (OOM prevent) y BullMQ Stalled Jobs Detection.
- **Client-Side Zero-Fetch Policy**: El frontend no hace llamadas directas a APIs externas (venciendo CORS, Rate Limits y adblockers globally) mediante proxy inverso en memoria React Context.

### 3. 📊 1TB Indexing Engine
Motor de pre-cómputo que mantiene el 1TB de PostgreSQL accesible en microsegundos:
- **6 Aggregators paralelos**: Leaderboard global, por cadena, sectores, top eventos 24h, resumen de cadena, feed ZK.
- **Railway Cron**: Ciclo automático cada 15 segundos vía `/api/cron/indexer`.
- **14 Índices Compuestos**: Cubren todos los patrones de consulta del dashboard, leaderboard y feed institucional.

### 4. 🔐 API Institucional con Tiers
Sistema de acceso por niveles para la API de Market Signals:
- **Tier Basic**: Rate limiting conservador, datos básicos.
- **Tier Pro**: Filtros avanzados (chain, token, minUsd), rate limit extendido.
- **Tier Institutional**: Acceso completo, sin restricciones, HMAC auth.
- **Redis Micro-Cache**: TTL de 5 segundos por request para absorber picos sin perder granularidad.

### 5. 🏆 Leaderboard Hall of Fame
Ranking en tiempo real de las wallets más activas de la red:
- Datos servidos desde Redis (cache 60s).
- On-miss: consulta Prisma con índice `@@index([walletAddress])` optimizado.
- Endpoint: `GET /api/leaderboard/hall-of-fame`

### 6. 🎟️ Gold Ticket Genesis System
Sistema de membresía VIP no custodial:
- Generación de tickets mediante firma criptográfica ECDSA off-chain (gasless).
- Verificación on-chain opcional vía ERC-1155 en Base/Polygon.
- SIWE nonce-based auth para prevenir replay attacks.

### 7. 🧬 ZK AVS (Actively Validated Service)
Capa de verificación de conocimiento cero:
- Integración con EigenLayer AVS para validación de señales institucionales.
- SnarkJS para generación y verificación de pruebas ZK en Node.js.
- Firma de señales con clave privada efímera de nodo en cada nuevo despliegue.

---

## 🚀 Despliegue en Railway Pro

### Variables de Entorno Requeridas
```env
# Base de Datos
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Autenticación
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://tu-dominio.up.railway.app
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...

# Blockchain RPCs
SOLANA_RPC_1=https://...
SOLANA_RPC_WSS=wss://...
ETH_RPC_1=https://...
ALCHEMY_API_KEY=...

# Seguridad del Sistema
CRON_SECRET=...             # Protege /api/cron/indexer
HMAC_SECRET=...             # Protege endpoints institucionales

# Opcional: AI y Notificaciones
OPENAI_API_KEY=...
TELEGRAM_BOT_TOKEN=...
RESEND_API_KEY=...
```

### Inicialización Local (Desarrollo)
```bash
# Node.js >= 22.11.0 requerido
npm install

# Sincronizar schema con DB (sin migraciones)
npx prisma db push

# Iniciar todos los workers en paralelo
npm run workers:start

# Servidor de desarrollo
npm run dev
```

### Despliegue en Producción
```bash
# Build y deploy en Railway (auto-detectado por git push)
git add -A && git commit -m "deploy: ..." && git push origin main

# El start:prod de Railway maneja automáticamente:
# 1. prisma db push (sincroniza schema + indices)
# 2. next start -p $PORT
```

### Workers Independientes (Docker Compose)
```bash
# Levantar el stack completo en local
docker compose up -d

# Servicios:
# - web:            Next.js en puerto 3000
# - worker-solana:  SIMD-0109 Solana Scanner
# - worker-mesh:    Sovereign Mesh Redis Pub/Sub
```

---

## 📋 Auditoría de Contratos

```bash
# Compilar contratos
npm run build:contracts

# Tests unitarios
npm run test:contracts

# Análisis estático Slither
npm run audit:prepare

# Reporte de gas
npm run test:gas
```

---

## 🔭 Visión de Futuro (Roadmap)

### Fase Inmediata (Q2 2026)
- [ ] **Prisma Accelerate**: Migración al pooler global de Prisma para latencia sub-10ms en todo el mundo.
- [ ] **Métricas en tiempo real**: Dashboard de observabilidad interno consumiendo los aggregators del indexer.
- [ ] **PWA Screenshots**: Generación automática de capturas para la App Store de Chrome/Edge.

### Corto Plazo (Q3 2026)
- [ ] **EigenLayer AVS Mainnet**: Despliegue del operador AVS en mainnet Ethereum para validación descentralizada de señales.
- [ ] **Kafka Pipeline**: Sustitución de Redis Streams por Apache Kafka para volúmenes de 1M+ eventos/hora.
- [ ] **Mobile Native (React Native)**: Aplicación nativa iOS/Android con alertas push nativas APNs/FCM.

### Medio Plazo (Q4 2026)
- [ ] **API Pública v1**: Documentación OpenAPI 3.0 completa y SDK en Python/JS para desarrolladores externos.
- [ ] **Inteligencia Artificial Predictiva**: Modelos LSTM para predicción de movimientos de ballenas basados en patrones históricos del 1TB.
- [ ] **zkTLS Attestations**: Verificación de datos de APIs web2 (Twitter, LinkedIn) mediante ZK proofs para enriquecer el grafo de identidad.

### Largo Plazo (2027+)
- [ ] **10,000 Nodos Sovereign Mesh**: Expansión de la red P2P ZK a escala global descentralizada.
- [ ] **Protocolo Propio L2**: Chain optimizada para telemetría on-chain de alta frecuencia.
- [ ] **Integración MiCA**: Plena conformidad con el reglamento europeo de activos digitales.
- [ ] **Institutional API SLA 99.99%**: Acuerdos de nivel de servicio institucionales con garantías on-chain.
---

## 🧠 Perfil Requerido: Arquitecto de Sistemas Core (Búsqueda Abierta)

Dada la colosal envergadura técnica, criptográfica y matemática del **Whale Alert Network**, estamos en la búsqueda de un Ingeniero/Arquitecto de Software de élite. El candidato ideal debe poseer la erudición técnica absoluta para construir, depurar y escalar sistemas distribuidos de grado institucional **desde cero y sin la asistencia de modelos de Inteligencia Artificial (LLMs)**. 

Este rol exige un profundo dominio de los fundamentos de las Ciencias de la Computación, requiriendo un perfil que trascienda el desarrollo web tradicional y se adentre en la ingeniería estructural de sistemas asíncronos distribuidos en tiempo real.

### 🔬 Competencias Técnicas Indispensables

1. **Ingeniería de Sistemas Distribuidos y Alta Concurrencia:**
   - Dominio absoluto del modelo de red puro (Handshakes TCP/IP, WebSockets, SSE). Experiencia sólida arquitectando y consumiendo colas de mensajería persistentes con delivery guarantees (*Redis Streams, Apache Kafka*).
   - Capacidad matemática para gestionar arquitecturas stateful vs stateless, evadir *race conditions*, y resolver *deadlocks* en memorias compartidas distribuidas a través de clústeres de Nodos (Ej. *Replica Scaling con PgBouncer*).

2. **Criptografía Aplicada y Zero-Trust:**
   - Comprensión fundacional de Curvas Elípticas (*ECDSA secp256k1*) implementadas a bajo nivel (Node.js/C++). 
   - Diseño de atestaciones e identidades asimétricas (*Sign-In with Ethereum - SIWE, Nonces, Time-Locks*).
   - Implementación y diseño pre-compilatorio de Pruebas de Conocimiento Cero (*Zero-Knowledge Proofs*). Dominio académico de zk-SNARKs (Groth16/Plonk) y arquitecturas AVS (Ej: EigenLayer/SnarkJS).

3. **Arquitectura de Base de Datos y Optimización HFT (Terabytes):**
   - Análisis forense de cuellos de botella mediante *Query Profiling* (*PostgreSQL*).
   - Diseño geométrico de agrupaciones en disco y memoria (*14+ índices compuestos, B-Tree, particiones GIN*). Capacidad para mantener latencias <5ms en *tablescans* y *joins* mutantes sobre 1TB+ de datos transaccionales.

4. **Infraestructura Blockchain de Baja Latencia (RPC & Mempools):**
   - Anatomía interna de la *EVM Mempool*, gas limit mechanics, e intercepción de liquidaciones MEV.
   - Ingeniería de bajo nivel en Solana (RPC): Capacidad para abrir flujos de logs binarios WebSocket y descodificar campos abstractos como *ComputeBudget* (SIMD-0109) en crudo (sub-500ms) evadiendo envolturas high-level ineficientes.

5. **Renderizado Frontend Gráfico de Hardware (Capa de Presentación):**
   - Mecánica extrema del *Event Loop* del navegador (V8 / SpiderMonkey) y optimización de jerarquías del DOM de React (Next.js 15 SSR/RSC) para evitar los *Garbage Collector stalls*.
   - Ingeniería visual directa sobre la caché del Compositor de GPU (Zero-Paint Pipelines, *will-change* matrices). Experiencia inmersiva uniendo WebGL (*Three.js, R3F*) con matemáticas vectoriales atadas al scroll del usuario (*GSAP, Lenis*).

6. **DevOps Determinista e Infraestructura Inmutable:**
   - Gobierno puro contiguo de la red a través de Bash Scripting, Webhooks asíncronos y despliegues dockerizados en nube privada (*Railway Pro*).
   - Desarrollo de guardianes activos (*Watchdogs*) que suicidan contenedores ante latencias RPC, forzando Auto-Healing instantáneo.

7. **Doctrina Visual Institutional-Grade (Aztec Brutalism):**
   - Rechazo frontal de estéticas gamificadas (neones, luces pulsantes, badges). Implementación de UIs solemnes, orientadas a terminal de texto de máxima legibilidad (Railway-inspired).

### 💡 Perfil Cognitivo Excluyente

Buscamos una mente de ingeniería purista y matemática. Un profesional al que le fascine diseccionar la fluctuación de un latido milisegundo a milisegundo por red óptica global. Alguien capaz de leer fallos abstractos (*stacktraces* anónimos fragmentados) de memoria; alguien cuya extrema resiliencia investigativa, lectura intensa de documentación cruda (RFCs), y lógica constructiva inherente superen por completo cualquier dependencia a la I.A. actual. 

Si operativamente usted es el núcleo de certidumbre en sistemas donde equivocarse es catastrófico, usted es la mente arquitectónica que buscamos.

---

## 📁 Estructura del Repositorio

```
whalecosystem/
├── app/                        # Next.js App Router
│   ├── api/                    # Rutas de API
│   │   ├── cron/indexer/       # 🆕 Cron de indexación 1TB
│   │   ├── leaderboard/        # Hall of Fame con Redis Cache
│   │   ├── market/signals/     # API Institucional con Tiers
│   │   ├── whale-stream/       # SSE via Redis Streams XREAD
│   │   └── zk/avs/             # ZK Proof endpoints
│   └── (pages)/                # Landing, Dashboard, Docs
├── components/                 # Componentes React reutilizables
├── context/                    # WhaleStreamContext (SSE)
├── contracts/                  # Smart contracts Solidity
├── lib/
│   ├── indexer/                # 🆕 Aggregation Service
│   ├── redis/                  # Redis client + Zero-Crash Safeguard
│   ├── prisma.ts               # 🆕 Singleton con PgBouncer
│   └── rpc-router.ts           # 🆕 Global RPC Failover (Zod validated)
├── prisma/
│   └── schema.prisma           # 🆕 14 índices compuestos
├── scripts/
│   ├── solana-worker.ts        # 🆕 SIMD-0109 + XADD
│   └── sovereign-mesh.ts       # 🆕 ECDSA real + Redis Pub/Sub
├── public/
│   └── manifest.json           # 🆕 PWA institucional completo
├── k8s/                        # Kubernetes / Helm charts
├── docker-compose.yml          # 🆕 Microservicios aislados
└── railway.json                # 🆕 Cron job registrado
```

---

## 🛡️ Postura de Seguridad

- **Sovereign EIP-1193 Vault**: La clave privada nunca abandona el browser. Se firma con `viem` `LocalAccount` en-cliente — sin custodios, sin servidores.
- **Domain-Keyed XOR Encryption**: El vault se cifra en `localStorage` con clave derivada del `window.location.origin`. No sobrevive cambios de dominio.
- **Zero-Trust**: Ninguna clave privada de usuario toca el servidor ni la base de datos.
- **SIWE**: Autenticación EIP-712 Sign-In with Ethereum con nonces de un solo uso.
- **HMAC-SHA256**: API keys institucionales con comparación resistente a timing attacks.
- **ECDSA secp256k1**: Cada señal del Sovereign Mesh está firmada criptográficamente por el nodo emisor.
- **Zod Validation**: Variables de entorno validadas en tiempo de boot.
- **PgBouncer**: Límite de 5 conexiones por réplica, evitando agotamiento del pool en 42+ instancias.
- **Anti-DDOS WebSocket**: Debounce de 2500ms en `useSmartWebSockets` previene saturación en ráfagas de transacciones.
- **iOS WebKit Compliant**: Cámara QR inicializada solo por user-gesture explícito — sin crash silencioso en Safari.

---

## 🏛️ Alianzas Estratégicas e Infraestructura Soberana

El **Whale Alert Network** opera bajo el respaldo tecnológico de las entidades líderes en infraestructura criptográfica y computación distribuida. Estas alianzas garantizan la integridad, la privacidad y la persistencia de las señales institucionales a escala global.

### Aztec Network
Implementamos la capa de privacidad soberana de Aztec para garantizar que el flujo de inteligencia ZK se procese con un grado de anonimato institucional. Su tecnología de rollups de conocimiento cero es el pilar sobre el cual construimos nuestras atestaciones inmutables.

### GetBlock
La infraestructura de nodos de GetBlock proporciona el acceso redundante y de ultra-baja latencia a las 16 redes EVM monitoreadas por el terminal. Su robustez técnica permite que el Sovereign Mesh opere con tiempos de respuesta sub-milisegundo.

### Alchemy
Constituye el núcleo de nuestra capa de datos enriquecida. Mediante el uso de su infraestructura de indexación avanzada, el Whale Alert Network procesa terabytes de información histórica y tiempo real con una precisión matemática absoluta.

### Redis
El motor de estado global del sistema. Redis garantiza la persistencia de los flujos de datos asíncronos y la sincronización en tiempo real entre los nodos del Mesh, gestionando la concurrencia masiva sin comprometer la integridad estructural.

### Morpho
Nuestra integración con Morpho permite la gestión eficiente de la liquidez y el monitoreo de mercados de préstamo peer-to-peer. Su modelo de eficiencia de capital es fundamental para las estrategias de análisis de mercado de alta frecuencia que el terminal emite.

---

<p align="center">
  <strong>Whale Alert Network</strong> · Powered by Mathematics · Bound by Decentralization · Driven by Truth
  <br>
  <em>© 2026 atfortyseven-creations. All rights reserved.</em>
</p>
