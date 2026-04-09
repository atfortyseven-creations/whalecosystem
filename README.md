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
  --set secrets.databaseUrl="postgresql://..." \
  --set secrets.redisUrl="redis://..." \
  --set secrets.alchemyApiKey="..." \
  --set secrets.telegramBotToken="..."
```

### Required Environment Variables

```bash
DATABASE_URL            # PostgreSQL connection string (required)
REDIS_URL               # Redis connection string (required)
ALCHEMY_API_KEY         # RPC access — BASE + Ethereum (required)
TELEGRAM_BOT_TOKEN      # Bot token — worker exits if missing (required)
NEXTAUTH_SECRET         # Auth encryption key (required)
BASE_DEADMAN_ADDRESS    # Deployed WhaleDeadmanSwitch addr (optional)
BASE_TIMELOCK_ADDRESS   # Deployed HumanTimeLock addr (optional)
```

---

## 📡 API

All routes are documented in [`PROJECT_COMPILATION.md`](./PROJECT_COMPILATION.md).

### Sovereign API Marketplace

Distribute whale intelligence signals to your dApp without revealing source wallets:

```bash
# Free tier (10 req/min, last 10 events)
curl https://whalealert.network/api/market/signals \
  -H "X-API-Key: your_free_key"

# Institutional tier (300 req/min, HMAC-signed)
curl https://whalealert.network/api/market/signals?chain=BASE&minUsd=500000 \
  -H "X-API-Key: your_institutional_key" \
  -H "X-Timestamp: 1712600000" \
  -H "X-Signature: sha256=<hmac>"
```

**Tiers**: FREE (10/min) · PRO (60/min) · INSTITUTIONAL (300/min, HMAC required)

### Dune Analytics Export

```bash
# Download 30 days of whale events as CSV (Dune-ready)
curl "https://whalealert.network/api/analytics/dune/export?format=csv&days=30&minUsd=100000" \
  -o whale_events.csv

# Get curated Dune SQL query catalog (6 queries)
curl https://whalealert.network/api/analytics/dune/queries
```

Upload `whale_events.csv` to [dune.com/uploads](https://dune.com) as `whalealert_sovereign_events` and run any query from the catalog.

### Live On-Chain Contract Status

```bash
curl "https://whalealert.network/api/contracts/status?chain=base&address=0xYourWallet"
```

Returns live DeadmanSwitch state (lastPing, expiresAt, daysRemaining) and TimeLock balance directly from the blockchain.

---

## 🛡️ Smart Contracts

| Contract | Network | Coverage |
|----------|---------|----------|
| `WhaleDeadmanSwitch` | BASE / Polygon | ✅ 21 tests, 100% branches |
| `HumanTimeLock` | BASE / Polygon | ✅ 13 tests, 100% branches |
| `WhalePass` (NFT) | BASE | In audit |
| `WhaleKnowledgeGraph` | BASE | In audit |

### Deploy Sovereign Contracts

```bash
# Testnet
npm run deploy:sovereign:testnet

# Mainnet (BASE)
npm run deploy:sovereign

# Run full test suite
npm run test:contracts
```

### WhaleDeadmanSwitch Security Stack

- `Ownable2Step` — prevents single-tx ownership hijack
- `ReentrancyGuard` — CEI pattern; contract holds **zero** assets
- `Pausable` — emergency halt by owner
- `SafeERC20` — safe transfer for USDT/non-standard tokens
- **72h cooldown** on backup wallet changes (anti-last-minute rerouting)
- **Non-custodial**: only moves pre-approved token allowances from owner → backup

---

## 🏆 Community

### Hall of Fame

Community members who detect whale events that the algorithm missed earn **Sentinel badges**:

```bash
# Submit a detection for verification
curl -X POST https://whalealert.network/api/leaderboard/hall-of-fame \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x...","txHash":"0x...","chain":"BASE","description":"..."}'
```

Badge tiers: 🥉 WATCHER → 🥈 SENTINEL → 🥇 ELITE SENTINEL → 🏆 GRAND SENTINEL

### Ambassador Program

Earn commissions (5–20%) for referring institutional users:

```bash
GET /api/ambassador?address=0xYourWallet    # Check your tier
POST /api/ambassador                         # Apply with WorldID proof
```

### Powered By Whale Alert

Integrate sovereign intelligence into your dApp:

```html
<script src="https://whalealert.network/sdk/powered-by.js" data-theme="dark" async></script>
```

[![Powered by Whale Alert](https://img.shields.io/badge/Powered%20by-Whale%20Alert-gold?logo=data:image/svg%2bxml;base64,)](https://whalealert.network)

---

## ☸️ Kubernetes

Production manifests in `k8s/`:

| Resource | Description |
|----------|-------------|
| `ConfigMap` | Non-secret runtime config |
| `Deployment: app` | Next.js (2 replicas, rolling update, zero-downtime) |
| `Deployment: scanner` | Whale worker (Recreate — prevents duplicate detection) |
| `Deployment: telegram` | Notifier worker |
| `HPA` | Auto-scales app 2→10 pods on CPU/memory |
| `PodDisruptionBudget` | minAvailable: 1 during cluster maintenance |
| `Ingress` | NGINX + cert-manager TLS + security headers |

> **SSE Note**: Ingress has `proxy-buffering: off` — required for Server-Sent Events to work correctly.

```bash
npm run k8s:status    # kubectl get all -n whale-alert
npm run helm:upgrade  # Rolling upgrade preserving secrets
```

---

## 🏛️ Enterprise Edition

Enterprise adds **support and SLA guarantees**. It never removes sovereignty.

| Tier | SLA | Support | Commission |
|------|-----|---------|------------|
| COMMUNITY | — | GitHub Issues | — |
| PRO ($99/mo) | 99.5% | Email 48h | — |
| ENTERPRISE | 99.9% | Slack 4h | — |
| SOVEREIGN | 99.99% + air-gap | Phone+Slack 2h + on-site | 20% Ambassador |

```bash
# View full feature matrix
GET /api/enterprise

# Enterprise inquiry (received by our team in Telegram within minutes)
curl -X POST https://whalealert.network/api/enterprise/contact \
  -d '{"companyName":"...","email":"...","tier":"ENTERPRISE","useCase":"..."}'
```

---

## 📊 2026 Intelligence Report

From the [State of Whale Intelligence 2026](./STATE_OF_WHALE_INTELLIGENCE_2026.md):

| Metric | 2026 |
|--------|------|
| Whale transactions detected | **842,000+** |
| Total USD volume captured | **$4.7 Trillion** |
| Detection latency | **890ms avg** |
| False positive rate | **12.3%** (was 31% in 2025) |
| Chains monitored | **5** |
| Q1 price correlation | **R² = 0.847** |

---

## 🔐 Security

Found a vulnerability? Email `security@whalealert.network` — we operate a responsible disclosure policy. See [`SECURITY.md`](./SECURITY.md).

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
