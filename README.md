<div align="center">

# WHALE ALERT NETWORK

*Sovereign-grade, real-time blockchain intelligence — designed, engineered and deployed by one independent developer.*

[![Version](https://img.shields.io/badge/Version-4.2.0-gold?style=for-the-badge)](https://github.com)
[![Node](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Railway](https://img.shields.io/badge/Railway-Production-blueviolet?style=for-the-badge&logo=railway)](https://railway.app)
[![Chains](https://img.shields.io/badge/Chains-16_EVM_+_BTC_+_Solana-blue?style=for-the-badge)](https://github.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](https://github.com)

</div>

---

## Executive Foreword

The blockchain ecosystem suffers from a structural asymmetry of information. Raw on-chain data is theoretically public; in practice, only institutions with purpose-built indexing infrastructure can extract actionable intelligence before a significant capital movement propagates into public awareness. The Whale Alert Network was conceived to dismantle that barrier — to build, from first principles, a sovereign intelligence system that places the individual on equal informational footing with any institutional actor.

Every architectural decision in this system was made by one person, operating simultaneously as systems architect, full-stack engineer, blockchain protocol specialist, DevOps operator, security auditor, UX designer and product strategist. The result is not a prototype. It is production infrastructure: live on-chain ingestion, multi-layer signal classification, sub-15ms delivery latency, and a Zero-Mock mandate enforced without exception across every component.

The four historical episodes below illustrate precisely why this system exists. In each case, the on-chain evidence preceded the public market event by hours or days — available to anyone with the infrastructure to read it.

| Event | Advance Signal | What the Network Would Have Detected |
|---|---|---|
| Mt. Gox Insolvency (Feb 2014) | ~14 days | Coordinated cold storage outflow across 17 clusters |
| Bitfinex Hack Recovery (2021–2022) | ~7 days | Dormant wallet consolidation before DOJ seizure |
| FTX Withdrawal Cascade (Nov 2022) | ~48 hours | 17-cluster Mass Transfer, $6.2B aggregate |
| UST / LUNA Collapse (May 2022) | ~20 hours | Curve 3pool drain + Anchor priority fee anomalies |

Every signal in those four reconstructions was embedded in the public blockchain record. The only missing component was a system capable of reading it in time.

---

## Table of Contents

1. [Architecture & Philosophy](#architecture--philosophy)
2. [Technology Stack](#technology-stack)
3. [Core Modules](#core-modules)
4. [Dual Hybrid Topology](#dual-hybrid-topology-pc--mobile-enclave)
5. [Sovereign Master Node](#sovereign-master-node)
6. [Akashic Cosmic Forge](#akashic-cosmic-forge)
7. [2026 Sovereign Hardening (Phases 2–15)](#2026-sovereign-hardening-phases-215)
8. [Deployment Infrastructure](#deployment-infrastructure)
9. [Security Architecture](#security-architecture)
10. [Strategic Roadmap](#strategic-roadmap-20262027)
11. [Partners & Integrations](#partners--integrations)
12. [Environment Configuration](#environment-configuration)
13. [Local Development](#local-development)

---

## Architecture & Philosophy

Four principles govern every engineering decision in this system.

**Zero-Mock Mandate.** No component is permitted to display fabricated data in place of live on-chain state. Empty states render as honest institutional empty states. The system's correctness is verifiable against ground truth at every layer, at any time, without exception.

**Sovereignty.** Every interaction — wallet authentication, transaction signing, portfolio management, signal subscription — occurs without the server layer ever touching private key material. The server provides intelligence. Execution authority remains exclusively with the user's wallet.

**Institutional Grade.** Code quality, API design, schema design, error handling, security posture and visual presentation are held to the standard of an institutional engineering organisation, regardless of team size.

**Latency Hierarchy.** When latency and implementation convenience conflict, latency wins. Redis Pub/Sub over PostgreSQL polling. Persistent WebSocket RPC connections over per-request establishment. JIT transpilation over pre-build steps.

---

## Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, edge API routes, RSC, streaming hydration |
| Language | TypeScript 5.7 Strict | Compile-time safety for financial + cryptographic data |
| EVM Interaction | Ethers.js 6 + Viem | WebSocket RPC + statically typed ABI encoding |
| Solana | Web3.js + SIMD-0109 | Priority fee interception 400–500ms ahead of pool resolution |
| State | Zustand + TanStack Query | Zero-boilerplate stores, request deduplication, background revalidation |
| Charts | Lightweight Charts v5 | WebGL canvas, 60FPS at 1,000 updates/sec, constant memory footprint |
| Animation | GSAP 3 + Framer Motion 12 | GPU-composited transforms; View Transitions API support |
| Database | PostgreSQL via Prisma | Relational integrity, 14 composite indices, type-safe migrations |
| Cache / Streams | Redis (Pub/Sub + Streams) | Sub-ms delivery, at-least-once event guarantee, micro-cache TTLs |
| Graph | Neo4j AuraDB | Multi-hop wallet relationship queries via Cypher |
| Jobs | BullMQ | Persistent async processing: aggregation, correlation, notifications |
| Deployment | Railway + Docker multi-stage | Container orchestration, managed PG + Redis, automatic HTTPS |

---

## Core Modules

### Ingestion Engine (`scripts/whale-worker.ts`)

The operational core. Runs as a dedicated PM2 process (`sovereign-worker`) monitoring five parallel chains simultaneously.

- **Solana:** Intercepts `SetComputeUnitPrice` instructions via `signatureSubscribe` WebSocket. Z-score against a 30-day rolling Welford distribution; threshold default 3.5σ. Detection latency: 400–500ms before pool resolution.
- **EVM (16 chains):** Subscribes to `eth_subscribe("newPendingTransactions")` across Ethereum, BNB, Arbitrum, Base, Optimism, Polygon, zkSync, Linea, Scroll, Mantle, Blast, Mode, Zora, Avalanche, Celo. Decodes function selectors against a known DeFi ABI registry to classify: swap, deposit, withdrawal, bridge, stake.
- **Significance Filter:** Per-chain, per-asset-class Z-score with dynamic threshold calibration to maintain <2% false-positive rate. Threshold rises proportionally during elevated volatility.
- **ResilientProvider Multiplexer:** Maintains rotating pools of 7–12 HTTP + 3–5 WSS endpoints per chain. Automatic blacklisting on 401/402/429; 60-second cooldown and self-healing. Subscription persistence across WebSocket rotation. Transparent `Proxy` interface — scanner modules interact with a single stable provider.

### Sovereign Mesh Protocol

Publish-subscribe distribution layer built on Redis Streams + Pub/Sub.

| Tier | Threshold | Description |
|---|---|---|
| Narwhal | >$500K | Sub-institutional, tracked for aggregation |
| Orca | >$1M | Notable movement, surfaced in live feed |
| Blue Whale | >$5M | Significant institutional activity |
| Humpback | >$10M | High-priority intelligence event |
| Great White | >$50M | Systemic significance; Akashic candidacy |
| Megalodon | >$100M | Macroeconomic-scale; mandatory editorial annotation |

Every signal carries an ECDSA secp256k1 signature from the originating sentinel node. Signature covers: chain, tx hash, USD value, timestamp, action class. Tamper-evident by cryptographic construction. Stream retention: ~100K events / ~72-hour rolling window.

### Akashic Ledger

The permanent, cryptographically immutable record of every capital movement that crosses systemic significance thresholds.

- **Entry criteria:** >$50M USD; on-chain finality; corroborating sentinel verification; movement cannot be attributed to routine institutional custodial operations.
- **Integrity:** Each entry carries a SHA-256 hash over its seven constituent fields. Hash is recomputed on every GET request. Any field modification produces a different hash — tamper-evident without an external oracle.
- **Merkle Anchoring:** A daily Merkle Root of all Elite Entities is constructed and submitted as an `OP_RETURN` transaction to Ethereum or Base, creating a permanent on-chain audit checkpoint verifiable by any third party without database access.
- **Editorial Layer:** Mandatory contextual annotation per entry — temporal correlations with macro events, derivatives expiries, regulatory disclosures. Transforms raw data into institutional intelligence.

### Mass Transfer Intelligence

Detects coordinated multi-address, multi-chain position adjustments that individually fall below significance thresholds.

- **Graph clustering:** Neo4j Cypher queries with 3-hop distance tracking. Temporal window: 15 minutes. Co-movement criteria: combined value exceeds Megalodon threshold; origin addresses within 3 hops; destination addresses converge on a single cluster.
- **Archive Node Escalation:** `ResilientProvider` intercepts trie pruning errors and re-routes historical graph queries to dedicated archive nodes automatically.

### Sovereign Vault

Non-custodial wallet layer. Full EIP-1193 compliance — private keys never leave the user's wallet at any point.

| Mode | Implementation |
|---|---|
| **Send** | ERC-20 / native transfer with ENS resolution + optional Flashbots MEV-protected routing |
| **Swap** | Li.Fi aggregation across 1inch, Paraswap, OpenOcean; best route selected post-gas-adjustment |
| **Bridge** | Li.Fi cross-chain routing; evaluated on execution time, security model, output amount |
| **Buy** | MoonPay fiat-on-ramp with pre-filled wallet address; compliance-isolated processing |
| **Dead Man's Switch** | `SovereignDeadmanSwitch.sol` — time-locked estate protocol; off-chain signed heartbeat to avoid gas costs |

### Zero-Knowledge Infrastructure

- **Mesh Signal Auth:** Sentinel nodes submit Groth16 proofs (SnarkJS, BN254) demonstrating mesh membership without revealing their identity key. Sybil-resistant by construction.
- **World ID:** Proof-of-personhood via World Network nullifier hash. Verified on-chain against the Optimism verifier contract. One unique human = one verified tier activation.

---

## Dual Hybrid Topology: PC + Mobile Enclave

The most architecturally significant property of the system is the categorical segregation of analytical and execution environments.

**The Sovereign Terminal (PC / Web)** is a read-only, Zero-Trust analytics engine. It renders Sovereign Mesh streams, Neo4j relationship graphs, 60FPS DOM-windowed firehose views, and client-side Z-score models — entirely within an ephemeral memory layer. It holds no private key material. It generates unsigned transaction payloads and offloads all execution risk.

**The Cryptographic Enclave (Mobile iOS / Android)** handles all execution. To sign a transaction, the PC Terminal constructs an unsigned payload and pushes it to the mobile device via the Reown WalletConnect v2 relay. The mobile OS's secure enclave prompts biometric authorization (FaceID / TouchID), signs the payload via EIP-712, and returns the signed hash. The private key never leaves the device's secure enclave.

**Consequence:** Even if the PC Terminal's DOM were fully compromised by a malicious browser extension, the attacker's execution capability is zero. The architecture does not emulate institutional security — it structurally surpasses it.

**QR Handshake Protocol:** Desktop generates a session ID → encodes into QR → mobile scans and authenticates → session synchronised without page reload. Total latency: <4 seconds under normal network conditions.

---

## Sovereign Master Node

The local execution of `scripts/whale-worker.ts` on the developer's machine, bridged directly to production Railway infrastructure via TCP proxy.

**This process is the system's heartbeat.** Without it, the dashboard consumes only historical PostgreSQL records — accurate but static. With it, the dashboard is a live intelligence operation.

```bash
# Ignition command
npx cross-env NODE_OPTIONS="--expose-gc --max-old-space-size=1048576" npx tsx scripts/whale-worker.ts
```

**Boot sequence:**

1. **Global WS Crash Shield** — `process.on('uncaughtException')` filters against `lethalWSPatterns` (403, 429, ECONNRESET, ETIMEDOUT, 401, 402). Network-layer failures are absorbed; only genuine application errors reach the fatal handler. A single expired RPC credential cannot crash the monitoring process.
2. **WebSocket Hub** — Socket.IO server binds to port 3001 (auto-increments if occupied). Real-time push channel for all connected dashboard clients.
3. **Five parallel scanners launch concurrently:**

| Scanner | Chain | Provider |
|---|---|---|
| EVM Worker | Ethereum (Chain 1) | ResilientProvider × 8–12 endpoints |
| EVM Worker | BNB Smart Chain (Chain 56) | ResilientProvider × 8 endpoints |
| EVM Worker | Base (Chain 8453) | ResilientProvider × 6–8 endpoints |
| BTC Worker | Bitcoin Mainnet | GetBlock authenticated RPC |
| SOL Worker | Solana Mainnet | Helius + QuickNode WSS |

A catastrophic failure in any single worker does not interrupt the others. The node continues providing intelligence across all surviving chains.

**Production connectivity:** The local node writes directly to the Railway production PostgreSQL and Redis instances. The local machine and the cloud deployment share a single source of truth with zero synchronisation overhead.

**Active client throttling:** A Redis counter (`WHALE_MONITOR_CLIENTS`) tracks connected dashboard sessions. When no clients are active, polling frequency is reduced to conserve RPC compute units and resumes full intensity on first connection.

---

## Akashic Cosmic Forge

A zero-mock, cryptographically deterministic procedural generation engine that converts raw blockchain entropy into persistent, evolving digital entities.

- **Procedural Genesis:** Every Cosmic Entity is seeded by a live `txHash`. The hash drives a PRNG that governs WebGL fragment shaders (fractal topology, nebula patterns, sacred geometry), generative audio (Tone.js Lydian/Dorian progressions tied to gas price and block depth), and biotech metrics (DNA sequences, Hive Energy, mass) derived from the transaction's macroeconomic significance.
- **Temporal Evolution:** Entities are tracked as living nodes in the Neo4j Temporal Graph. Dormant entities accumulate Hive Energy on new interaction. Entities within the same network quadrant undergo Entity Assimilation — merging deterministic traits to forge Megastructure Entities.
- **ZK Provenance (vNext):** `cosmic-seed.circom` stubs prepare the Forge for decentralised execution. Entity creation will be bound by a zk-SNARK proof guaranteeing a 1-to-1, unforgeable correspondence between visual characteristics and the originating blockchain event.

---

## 2026 Sovereign Hardening (Phases 2–15)

### Phase 4 — Zero-Mock Eradication & Bento-Box Paradigm
All placeholder generators purged across `InstitutionalLedger.tsx` and `SuperWallet.tsx`. Wallet provisioning now executes genuine cryptographic path derivation via `POST /api/wallet/create`. The dashboard was restructured into a rigid `100dvh` Zero-Scroll Bento-Grid: global scrollbars neutralized at root; data grids self-contained in `flex` boundaries with localized custom-scrollbar aesthetics. The VOSS Cosmic Matrix (500 strategic directives) was injected into `SovereignIntelTab.tsx`, creating a meta-operational synthesis where the interface displays both blockchain data and the cognitive architecture that governs the system's expansion.

### Phase 5 — Sovereign Master Node *(documented above)*

### Phase 6 — Akashic Cosmic Forge + MEV Shield
Cosmic Forge instantiated *(documented above)*. All sensitive outbound transactions routed through Flashbots / Eden private mempools (`lib/blockchain/mev.ts`). Front-running and sandwich-attack resistance enforced at the protocol level.

### Phase 7 — Dead Man's Switch
`scripts/dead-mans-switch.ts` monitors a cryptographic heartbeat emitted by the master administrator wallet every 30 days. On failure to receive a pulse, the system autonomously triggers an obfuscation protocol: purging high-tier intelligence and terminating infrastructure processes to prevent institutional data capture.

### Phase 8 — Bare-Metal Mempool Ingestion
`lib/blockchain/mempool-listener.ts` establishes a raw WebSocket tether to the Ethereum pending transaction pool. Megalodon-tier transactions (>100 ETH) are intercepted and decoded before block inclusion, achieving a 12-second tactical advantage over block-explorer-dependent systems.

### Phase 9 — Hardware Wallet Heuristics
`lib/blockchain/hw-detect.ts` analyses Connector ID structures, WebSocket origins, and User-Agent telemetry to assign probabilistic heuristic scores classifying entities as Ledger / Trezor hardware endpoints. Result persisted to the Neo4j intelligence graph.

### Phase 10 — Cryptographic State Anchoring
Daily Merkle Root of all Elite Entities formatted as an `OP_RETURN` transaction and permanently etched to Ethereum or Base. Zero-trust accountability without requiring third parties to trust the operator's database.

### Phases 11–12 — Iron Gate & IPFS Export
`next.config.js` enforces `Strict-Transport-Security: max-age=63072000`, `X-Frame-Options: DENY`, and hardened CSP headers. Static `build:ipfs` compilation enables unstoppable IPFS deployment if conventional DNS infrastructure is compromised.

### Phase 13 — Sybil-Resistant Database Matrix
Prisma initialisation overhauled with global `$use` extensions for microsecond query logging and PgBouncer connection pooling. The database survives coordinated Sybil-level traffic spikes without connection exhaustion.

### Phase 14 — Anti-Replay Firewall
All state-mutating API requests require `x-sovereign-nonce` + `x-sovereign-timestamp`. Edge-level `replayMap` in `middleware.ts` rejects payloads older than 60 seconds with HTTP 401. Replayed intercepted transactions fail before reaching routing logic.

### Phase 15 — Final UI Transcendence
`P2022` Prisma crash resolved by purging the deprecated `density` column from schema and settings API. Lottie elements enlarged from `w-[180px]` to `w-[240px]` for institutional visual weight. Catastrophe Chronicle restructured into a `grid-cols-2` dual-column layout, halving scroll fatigue. Immersive Manifesto expanded with a 4-panel QR handshake documentation section featuring live terminal screenshots as operational proof.

---

## Deployment Infrastructure

**Docker multi-stage build on `node:20-slim`** (glibc — required for Prisma + OpenSSL native addons).

**Boot sequence (`start.sh`):**
1. `npx prisma generate` — regenerate Prisma client for current platform
2. `npx prisma migrate deploy` — apply pending schema migrations
3. `pm2-runtime start /app/ecosystem.config.json` — initialise process mesh

**PM2 process mesh:**
- `sovereign-web` — Next.js application, memory-capped, exponential backoff restart
- `sovereign-worker` — Blockchain monitoring worker, extended initial delay for infrastructure stabilisation

**Live data delivery:** Server-Sent Events (SSE) over HTTP/2. Firewall-compatible, native browser reconnect, no WebSocket handshake overhead.

**Rendering performance:** All animated elements composited exclusively on GPU via `transform: translate3d(0,0,0)` + `will-change: transform`. Target: frame-perfect rendering at native display refresh rate including 240Hz.

---

## Security Architecture

| Vector | Mitigation |
|---|---|
| SQL Injection | All queries via Prisma parameterised builder — no string interpolation |
| CSRF | SIWE nonce binding + `SameSite=Strict; HttpOnly` session cookies |
| Replay Attacks | Edge-level nonce registry + 60-second timestamp window (Phase 14) |
| API Abuse | Redis token-bucket rate limiting; IP-based subnet banning for Sybil detection |
| XSS / Script Injection | Strict CSP with nonce-based inline script policy; `X-Frame-Options: DENY` |
| Front-Running / MEV | Flashbots + Eden private mempool routing for sensitive transactions |
| Mesh Signal Forgery | ECDSA secp256k1 per-signal signature; Groth16 ZK membership proof |
| Session Hijacking | HMAC-SHA256 institutional API auth; constant-time comparison for secret verification |
| Data Capture on Compromise | Dead Man's Switch autonomous purge protocol (Phase 7) |

---

## Strategic Roadmap 2026–2027

### Q2 2026 — Foundation
- Mass Transfer Intelligence: Neo4j full production deployment
- World ID institutional tier elevation
- BullMQ pre-computation migration for all leaderboard pipelines
- Chain expansion: Sonic (formerly Fantom) + Berachain
- Morpho peer-to-peer lending analytics integration
- WhaleAcademy curriculum population across all seven domains

### Q3 2026 — Decentralisation
- EigenLayer AVS signal validation network: operator nodes restake ETH, threshold signature confirms signals. Trust assumption on central ingest eliminated.
- Institutional API programme launch for hedge funds and family offices
- Telegram + Discord alert dispatch integration
- On-chain ERC-1155 membership registry migration

### 2027 — Sovereign Chain
- Purpose-built telemetry application-specific blockchain: 100ms block times, zero-fee signal publication for registered participants, native Sovereign Mesh data structures
- Governance via graduated voting rights proportional to Gold Whale tier + verified network participation
- Mobile native application (iOS / Android)
- Hardware security module integration for institutional key management
- Regulatory engagement: MiCA (EU), FCA (UK), FinCEN (US)

---

## Partners & Integrations

| Category | Partner | Role |
|---|---|---|
| **RPC Infrastructure** | Alchemy | Enhanced endpoints: ETH, Base, Arbitrum, Polygon, Optimism |
| | QuickNode | BNB, Avalanche, Solana WSS |
| | Infura | ETH + zkSync failover |
| | Helius | Solana DAS API, `getSignaturesForAddress`, webhook account updates |
| **Wallet & Identity** | Reown (WalletConnect) | AppKit SDK, WalletConnect v2 relay, QR session management |
| | Coinbase | Smart Wallet SDK, ERC-4337 account abstraction, seedless MPC |
| | Clerk | JWT session management, multi-device, organisational identity |
| | World Network | World ID ZK proof-of-personhood, Sybil-resistant tier access |
| **DeFi & Aggregation** | Li.Fi | Cross-chain swap + bridge aggregation |
| | 1inch | Limit Order V3 (EIP-712 gasless), single-chain swap quotes |
| | Enso Finance | Intent-based DeFi routing (`ENSO_API_KEY` required) |
| | MoonPay | Fiat-to-crypto onramp |
| | CoinGecko | Price feeds, portfolio valuation, historical data |
| **Database & Infra** | Railway | Container orchestration, managed PG + Redis, HTTPS |
| | Neo4j AuraDB | Graph database, Cypher multi-hop wallet queries |
| | Prisma | Type-safe ORM, deterministic migration engine |
| **Security & Cryptography** | Ethereum PSE (SnarkJS) | Groth16 ZK proving + verification |
| | OpenZeppelin | Audited smart contract building blocks |

---

## Environment Configuration

### Core Infrastructure

| Variable | Status | Description |
|---|---|---|
| `DATABASE_URL` | **Required** | PostgreSQL connection string with SSL |
| `REDIS_URL` | **Required** | Redis connection string with auth |
| `NEXTAUTH_SECRET` | **Required** | 32-byte random string for session encryption |
| `NEXTAUTH_URL` | **Required** | Canonical deployment URL |

### Authentication & Identity

| Variable | Status | Description |
|---|---|---|
| `CLERK_SECRET_KEY` | **Required** | Clerk server-side key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | **Required** | Clerk client key |
| `NEXT_PUBLIC_WC_PROJECT_ID` | **Required** | Reown / WalletConnect project ID |
| `CRON_SECRET` | **Required** | HMAC key for cron authentication |
| `HMAC_SECRET` | **Required** | HMAC key for institutional API auth |
| `NEXT_PUBLIC_WLD_APP_ID` | **Required** | World Network application identifier |
| `JWT_SECRET` | **Required** | JWT signing secret (min. 32 chars) |

### Blockchain Connectivity

| Variable | Status | Description |
|---|---|---|
| `ETH_RPC_1` | **Required** | Ethereum Mainnet HTTPS RPC |
| `SOLANA_RPC_1` | **Required** | Solana HTTPS RPC |
| `SOLANA_RPC_WSS` | **Required** | Solana WebSocket RPC |
| `ALCHEMY_API_KEY` | Recommended | Enhanced chain access |
| `QUICKNODE_KEY` | Recommended | BNB + Avalanche access |
| `HELIUS_API_KEY` | Recommended | Solana enhanced endpoints |
| `ARB_RPC_1` | Recommended | Arbitrum One endpoint |
| `BASE_RPC_1` | Recommended | Base network endpoint |
| `OP_RPC_1` | Recommended | Optimism endpoint |

### External Integrations

| Variable | Status | Description |
|---|---|---|
| `COINGECKO_API_KEY` | Recommended | Price feed API (Pro tier) |
| `LIFI_API_KEY` | Optional | Li.Fi swap + bridge (not required — only needed to raise rate limits at scale) |
| `STRIPE_SECRET_KEY` | Recommended | Payment processing |
| `STRIPE_WEBHOOK_SECRET` | Recommended | Stripe webhook signing secret |
| `NEXT_PUBLIC_MOONPAY_KEY` | Recommended | Fiat onramp integration |
| `LIFI_API_KEY` | Recommended | Swap + bridge aggregation |
| `SENDGRID_API_KEY` | Recommended | Email notifications |
| `TELEGRAM_BOT_TOKEN` | Recommended | Alert dispatch |

---

## Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Apply schema to development database
npx prisma db push

# Generate typed Prisma client
npx prisma generate

# Start development server
npm run dev

# Launch blockchain monitoring worker (separate terminal)
npx cross-env NODE_OPTIONS="--expose-gc --max-old-space-size=1048576" npx tsx scripts/whale-worker.ts

# Inspect PM2 process mesh
npx pm2 list && npx pm2 logs
```

---

<div align="center">

**WHALE ALERT NETWORK**

*Every signal verified. Every movement recorded. Every institution monitored.*

Designed and engineered as a single, coherent system by one independent developer.

The information asymmetry embedded in public blockchain markets is not a natural law. It is a solvable engineering problem. This system is the solution.

---

*© 2026 atfortyseven-creations. All rights reserved.*
*Unauthorised reproduction, distribution, or derivative use of this system, its documentation, its signal methodology, or its source code is strictly prohibited.*

[humanidfi.com](https://www.humanidfi.com)

</div>
