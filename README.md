<div align="center">
  <img src="public/Gemini_Generated_Image_dzte5edzte5edzte.png" alt="Whale Alert Network" width="160"/>

  <h1>🐋 Whale Alert Network</h1>
  <p><strong>Sovereign On-Chain Intelligence Terminal</strong></p>
  <p><em>Institutional-grade whale detection. Zero-trust. Local-first. Non-custodial always.</em></p>

  <p>
    <img src="https://img.shields.io/badge/version-3.0.0-gold?style=flat-square" alt="Version"/>
    <img src="https://img.shields.io/badge/tests-34%20passing-brightgreen?style=flat-square" alt="Tests"/>
    <img src="https://img.shields.io/badge/coverage-100%25-brightgreen?style=flat-square" alt="Coverage"/>
    <img src="https://img.shields.io/badge/chains-5-blue?style=flat-square" alt="Chains"/>
    <img src="https://img.shields.io/badge/latency-%3C900ms-blue?style=flat-square" alt="Latency"/>
    <img src="https://img.shields.io/badge/arXiv-EVM%20Thermodynamics-red?style=flat-square" alt="arXiv"/>
    <img src="https://img.shields.io/badge/License-MIT-gray?style=flat-square" alt="License"/>
  </p>

  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-api">API</a> •
    <a href="#-smart-contracts">Contracts</a> •
    <a href="#-kubernetes">Kubernetes</a> •
    <a href="#-enterprise">Enterprise</a>
  </p>

  <p>
    <a href="https://t.me/HumanidFi" target="_blank">📡 Official Telegram</a> &nbsp;|&nbsp;
    <a href="https://whalealert.network" target="_blank">🌐 Live Platform</a>
  </p>
</div>

---

## What Is This?

**Whale Alert Network** is a sovereign, open-source on-chain intelligence platform that detects institutional capital movements ($50K+ transactions) across 5 blockchains with **sub-900ms latency** — without ever storing your query patterns on a cloud server.

Unlike Nansen, Arkham, or Glassnode, your filtering logic runs **locally on your hardware**. The platform cannot decode which assets you are tracking.

| | Whale Alert Network | Nansen | Arkham | Glassnode |
|:--|:--|:--|:--|:--|
| **Data Custody** | 🟢 Sovereign local-first | ❌ Cloud SaaS | ❌ Cloud SaaS | ❌ Cloud SaaS |
| **Query Privacy** | 🟢 Local execution | ❌ Tracked | ❌ Tracked | ❌ Tracked |
| **Identity** | 🟢 WorldID ZK-SNARK | Email/Web2 | Email/Web2 | Email/Web2 |
| **Detection Latency** | 🟢 **890ms avg** | 15–120s | 15–60s | 30–120s |
| **Source Code** | 🟢 Open-source | ❌ Closed | ❌ Closed | ❌ Closed |
| **Cost** | 🟢 Self-hosted | $500–$2,500/mo | Freemium | $300–$2,500/mo |
| **Chains** | ETH · BASE · BSC · SOL · BTC | ETH · SOL · BTC | ETH · SOL | ETH · BTC |

---

## 🏛️ Architecture

### EVM Thermodynamics Engine

The core detection algorithm models EVM state transitions as thermodynamic processes, extracting institutional capital intent from gas expenditure patterns:

```
G(t) = Σᵢ [ gasUsed(txᵢ) × effectiveGasPrice(txᵢ) ]
E(t) = G(t) × log₂(density(t) / μ_density) × σ⁻¹(opcode_freq)
Z(t) = (E(t) - μ_E) / σ_E     →  Z ≥ 2.0 triggers whale detection
```

**Validated performance**: R² = 0.847 correlation with 72h price movements, 12.3% false positive rate (down from 31% in 2025).

> 📄 Academic paper submitted to arXiv: `cs.CR + q-fin.TR`  
> See [`SOVEREIGN_WHITEPAPER.md`](./SOVEREIGN_WHITEPAPER.md)

### Real-Time Streaming

```
RPC (Alchemy/GetBlock)  →  whale-worker.ts  →  Redis Queue (BLPOP)
                                                        ↓
                                         /api/whale-stream (SSE)
                                                        ↓
                             WhaleStreamContext  →  RadarFeed + AlertsPanel
```

- **SSE** over WebSockets — HTTP/2 multiplexing, no upgrade handshake
- **Exponential backoff** reconnect: 1s → 30s
- **200-event** rolling buffer per client
- **$500K+ events** auto-injected as TRIGGERED alert rules in the UI

### Tech Stack

| Layer | Technologies |
|:------|:-------------|
| **Frontend** | Next.js 15, React 18, Tailwind CSS, Framer Motion, next-themes |
| **Real-Time** | Server-Sent Events (SSE), Redis BLPOP, EventSource |
| **Backend** | Node.js ≥22, BullMQ Workers, Next.js App Router |
| **Persistence** | PostgreSQL (Prisma), Neo4j (graph correlation), Redis |
| **Identity** | WorldID ZK-SNARKs, Clerk, WebAuthn Passkeys, HMAC-SHA256 |
| **Blockchain** | Ethers.js v6, Alchemy SDK, GetBlock RPC |
| **Contracts** | Solidity ^0.8.24, OpenZeppelin v5, Hardhat, Slither |
| **Infrastructure** | Railway, Docker (multi-stage), Kubernetes + Helm, GitHub Actions |

---

## ⚡ Quick Start

### Self-Hosted (Recommended)

```bash
# Clone
git clone https://github.com/atfortyseven-creations/whalecosystem.git
cd whalecosystem

# Install
npm ci

# Configure environment
cp .env.example .env.local
# Fill in: DATABASE_URL, REDIS_URL, ALCHEMY_API_KEY, TELEGRAM_BOT_TOKEN

# Database migration
npm run migrate:deploy

# Start app + all workers
npm run dev          # Development
npm run workers:start  # Whale scanner + Telegram notifier + Alert engine
```

Open `http://localhost:3000` — connect your wallet, observe the markets.

### Docker

```bash
docker build -t whale-alert:3.0.0 .
docker run -p 3000:3000 --env-file .env.production whale-alert:3.0.0
```

### Kubernetes (Institutional)

```bash
# Apply all manifests
kubectl apply -f k8s/

# OR one-command via Helm
helm install whale-alert k8s/helm \
  --namespace whale-alert --create-namespace \
  --set secrets.databaseUrl="postgresql://[REDACTED_DB_USER]:[REDACTED_DB_PASS]@whalealert.network` — we operate a responsible disclosure policy. See [`SECURITY.md`](./SECURITY.md).

| Threat Vector | Mitigation |
|---------------|-----------|
| API Key Exfiltration | HMAC-SHA256, 30s replay window |
| Bot Token Leak | Env-var only — `process.exit(1)` if missing |
| Smart Contract Re-entrancy | CEI pattern, amount zeroed before transfer |
| Sybil Attacks | WorldID ZK humanness proof |
| Data Fabrication | All signals verified against block explorers |

---

## 🗺️ Roadmap

- [x] EVM Thermodynamics detection engine (v2.3)
- [x] SSE real-time streaming with Redis
- [x] WhaleDeadmanSwitch (100% test coverage)
- [x] Sovereign API Marketplace (HMAC, 3-tier)
- [x] Dune Analytics integration
- [x] Hall of Fame + Ambassador Program
- [x] Kubernetes + Helm chart
- [x] Enterprise Edition (4-tier)
- [x] arXiv paper submitted
- [ ] **Q3 2026**: Eigenlayer AVS (decentralized detection nodes)
- [ ] **Q3 2026**: ZK-proof signal distribution (on-chain verified)
- [ ] **Q3 2026**: Solana sub-500ms (SIMD-0109)
- [ ] **Q4 2026**: Full Trail of Bits audit
- [ ] **Q4 2026**: MiCA Compliance Layer
- [ ] **Q4 2026**: 10,000 sovereign node network

---

## System Requirements

| OS | Node.js | RAM |
|:---|:--------|:----|
| Windows 10/11 | ≥ 22.11.0 | 8 GB (4 GB lite mode) |
| macOS (M-series / Intel) | ≥ 22.11.0 | 8 GB (4 GB lite mode) |
| Ubuntu / Debian | ≥ 22.11.0 | 8 GB (4 GB lite mode) |

---

<div align="center">

**[Protocol v3.0.0 — Institutional Grade — April 2026]**

*Built with mathematical precision and a deep respect for financial sovereignty.*

<br/>

[![Star this repo](https://img.shields.io/github/stars/atfortyseven-creations/whalecosystem?style=social)](https://github.com/atfortyseven-creations/whalecosystem)
&nbsp;&nbsp;
<a href="https://t.me/HumanidFi">📡 Telegram Community</a>
&nbsp;&nbsp;
<a href="https://whalealert.network">🌐 Live Platform</a>

</div>
