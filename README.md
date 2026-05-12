# Whale Alert Network Pro

> **Institutional-grade on-chain intelligence.** Real-time forensic surveillance of ERC-20 capital flows, decentralised E2EE messaging, and ZK-proof infrastructure — delivered through a sovereign, zero-trust web terminal.

[![Build](https://img.shields.io/badge/build-passing-00C076?style=flat-square&logo=railway)](https://railway.app)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![XMTP](https://img.shields.io/badge/XMTP-v5.2-9945FF?style=flat-square)](https://xmtp.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-proprietary-red?style=flat-square)](LICENSE)

---

## Overview

Whale Alert Network Pro is a full-stack Web3 intelligence platform that monitors institutional ERC-20 transfer activity across Ethereum and L2 networks. It combines on-chain forensic analysis, cryptographic identity, and decentralised communication into a unified terminal interface.

The platform is built for traders, analysts, and institutional desks who require unmediated access to large-capital movement data with sub-second latency and zero reliance on centralised data providers.

---

## Core Modules

| Module | Description |
|---|---|
| **Whale Ledger** | Real-time feed of ERC-20 transfers ≥ $100K. ECDSA-verified, block-confirmed, zero-latency delivery. |
| **Mass Transfer Intel** | Detection of coordinated multi-wallet token movements. Identifies institutional accumulation and wash trading patterns. |
| **Entity Graph** | Interactive Neo4j-backed graph of wallet relationships and capital routing across DeFi protocols. |
| **Mempool Forensics** | AI heuristic engine scanning Ethereum mempools for MEV sandwiches, drainer contracts, and phishing transactions in real time. |
| **Whale Chat** | Decentralised E2EE messaging via XMTP v5. Messages are encrypted with double-ratchet forward secrecy. No server stores any message content. |
| **DeFi Yields** | Aggregated APY and TVL data across major DeFi protocols. Morpho Blue (Base) integration included. |
| **Aztec Pipeline** | Live ZK-rollup block sequencer monitoring. Tracks proving, sequencing, and settlement stages on Aztec Network. |
| **Trading Terminal** | Hyperliquid L1 perpetuals execution layer. Zero-gas institutional trade routing. |
| **Sovereign Vault** | AES-256 encrypted local storage for private notes and credentials. Unlocked exclusively by wallet signature. |
| **Reputation SBT** | Soulbound Token passport tracking milestones and on-chain contributions. Non-transferable identity attestation. |
| **Ticket Mint** | WGT-GENESIS NFT credential portal on Optimism L2. 200 genesis passes — permanent platform access. |

---

## Security Architecture

The platform operates on a **Zero-Trust, Privacy-by-Void** model. No component assumes trust at any boundary.

### Authentication
- **TitaniumGate Middleware** — All protected routes are gated behind a `sovereign_handshake` cryptographic cookie derived from a SIWE (Sign-In with Ethereum) session.
- **Session Locking** — Inactivity auto-disconnect with configurable timer (15m / 1h / 24h / never). Re-authentication requires on-chain signature verification.
- **Redis Session Locking** — Upstash Redis enforces single-session constraints per wallet address.

### Messaging (Whale Chat)
- **Protocol:** XMTP v5 browser-sdk — peer-to-peer, decentralised message transport.
- **Encryption:** Double-ratchet algorithm with ephemeral key derivation (forward secrecy guaranteed).
- **Identity:** Messaging keys are derived deterministically from the wallet's ECDSA private key via a gasless signature. Keys are stored exclusively in browser IndexedDB — never transmitted.
- **Server role:** Zero. No message content is routed through, stored by, or accessible to any platform server.

### Smart Contracts
- **Audited with Slither** — static analysis enforced in CI via `.github/workflows/security.yml`.
- **Randomness:** All session nonces use `crypto.randomUUID()` and `crypto.getRandomValues()`. `Math.random()` is forbidden.
- **OpenZeppelin v5** contracts for all token and access-control logic.

### Infrastructure
- **Next.js 15** — App Router, async RSC, streaming SSR.
- **PostgreSQL via Prisma** — typed ORM, schema-enforced migrations.
- **Redis (Upstash)** — rate limiting, session state, real-time telemetry.
- **IPFS via Pinata** — immutable asset pinning for NFT metadata.
- **PM2 + Railway** — zero-downtime process management.

---

## Whale Alert Network API

The WAN API provides programmatic access to all forensic data streams. Authentication via Bearer token (API key).

### Tier Comparison

| | Standard | Starter | Pro | Elite |
|---|---|---|---|---|
| **Price** | $14.99 / mo | $49 / mo | $299 / mo | $1,999 / mo |
| **Requests / day** | 5,000 | 10,000 | 500,000 | Unlimited |
| **Tokens** | 3 (BTC, ETH, BNB) | 5 | All 24 | All + custom |
| **Threshold** | ≥ $1M | ≥ $500K | ≥ $100K | ≥ $50K |
| **Window** | 12h | 24h sliding | 30-day history | 12-month history |
| **Delivery** | REST | REST | REST + WS + Webhooks | REST + WS + FIX |
| **SLA** | — | — | — | 99.99% + dedicated infra |

### Endpoints (REST)

```
GET  /api/network/evm/recent          Whale events (last 100 transfers)
GET  /api/network/evm/stream          WebSocket stream (Pro+)
POST /api/network/webhooks            Register delivery endpoint (Pro+)
GET  /api/market/ticker               Live price feed (24 tokens)
GET  /api/network/getblock-health     Node health check
```

### Event Schema

```json
{
  "token":       "USDT",
  "amount":      "1420000.00",
  "amountUSD":   "1420000.00",
  "direction":   "OUTFLOW",
  "fromAddress": "0xabc...123",
  "toAddress":   "0xdef...456",
  "txHash":      "0x...",
  "blockNumber": 21045823,
  "timestamp":   "2026-05-11T14:00:00Z",
  "entity":      "Binance Hot Wallet",
  "riskScore":   12
}
```

---

## Local Development

```bash
# Prerequisites: Node ≥ 20, PostgreSQL, Redis

git clone <repo-url>
cd whale-alert-pro

cp .env.example .env.local   # Fill required env vars

npm install
npm run db:sync              # Prisma schema push
npm run dev                  # Next.js + scanner worker
```

### Required Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `UPSTASH_REDIS_REST_URL` | Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token |
| `NEXT_PUBLIC_XMTP_ENV` | `production` or `dev.xmtp.network` |
| `NEXT_PUBLIC_WC_PROJECT_ID` | WalletConnect / Reown project ID |
| `ALCHEMY_API_KEY` | Ethereum RPC access |
| `PINATA_JWT` | IPFS pinning auth |
| `STRIPE_SECRET_KEY` | Payment processing |

---

## Project Structure

```
├── app/                  Next.js 15 App Router (routes, API handlers)
│   ├── api/              Server-side API routes
│   └── dashboard/        Authenticated terminal shell
├── components/
│   ├── dashboard/        All dashboard module panels
│   ├── landing/          Public marketing pages
│   └── shared/           Reusable UI primitives
├── lib/
│   ├── xmtp/             XMTP v5 E2EE client wrapper
│   ├── store/            Zustand state management
│   └── config/           Pricing tiers, feature flags
├── services/             Background workers (scanner, alerts, mesh)
├── scripts/              CLI utilities and deployment helpers
├── contracts/            Solidity smart contracts (Hardhat)
└── prisma/               Schema and migrations
```

---

## Deployment

```bash
# Production build
npm run build:railway

# Start production server
npm run start:prod

# Start all workers via PM2
npm run start:all
```

Railway auto-deploys on `git push origin main` via the `push:railway` script.

---

## License

Proprietary. All rights reserved. Unauthorised reproduction or distribution of this codebase is prohibited.

© 2026 Whalecosystem Corp.
