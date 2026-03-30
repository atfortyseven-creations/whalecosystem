# Documentation Index — Whale Alert Network

**Platform:** [humanidfi.com](https://humanidfi.com)  
**X / Twitter:** [@whalecosystem](https://x.com/whalecosystem)  
**GitHub:** [github.com/whalecosystem](https://github.com/whalecosystem)

---

## Get Started

| Document | Description |
|---|---|
| [Intro to Whale Alert](./intro.md) | Platform overview, philosophy, supported networks |
| [Quickstart (API)](./quickstart.md) | Authentication, first request, WebSocket stream |
| [Models](./models.md) | Complete data model reference: WhaleEvent, Market, Signal |
| [Pricing](./pricing.md) | Plan tiers, rate limits, quotas |

---

## Core Concepts

| Document | Description |
|---|---|
| [Stateful Agents](./stateful-agents.md) | Autonomous intelligence units with persistent memory |
| [Sovereign Identity](./sovereign-identity.md) | EIP-191 auth, KYC JWT, AES-GCM vault encryption |
| [Neural Intelligence](./neural-intelligence.md) | Z-score engine, whale classification, signal generation |

---

## Institutional

| Document | Description |
|---|---|
| [Institutional Protocol](./institutional-protocol.md) | ELITE & enterprise access, dedicated RPC, SLA |
| [Security Architecture](./security-architecture.md) | WAF, CSP, rate limiting, cryptographic vault |
| [Liquidity Analytics](./liquidity-analytics.md) | AMM depth, CLOB order book, bridge flows |
| [Audit & Compliance](./audit-compliance.md) | CFTC/OFAC, KYC flow, audit logs, data retention |

---

## Developer Reference

| Document | Description |
|---|---|
| [Whale Code SDK](./whale-code-sdk.md) | TypeScript SDK: install, init, streams, webhooks |
| [API Reference](./api-reference.md) | All REST endpoints, parameters, responses, error codes |

---

## Quick Links

### Authentication
```bash
curl https://humanidfi.com/api/v1/auth/verify \
  -H "Authorization: Bearer wha_live_xxx"
```

### Recent Whales
```bash
curl "https://humanidfi.com/api/v1/whale/recent?network=ethereum&minUsd=1000000" \
  -H "Authorization: Bearer wha_live_xxx"
```

### System Health
```bash
curl https://humanidfi.com/api/v1/health
```

---

## Support

- **Community:** Join the discussion via [@whalecosystem](https://x.com/whalecosystem) on X
- **Email support:** Available to STANDARD plan and above (via dashboard)
- **Priority support:** PRO plan
- **Dedicated support:** ELITE and Enterprise plans

---

## Disclaimer

All data provided by Whale Alert Network is for **educational and informational purposes only**. Nothing on this platform constitutes financial advice, investment recommendations, or solicitation to trade. Users are solely responsible for their trading decisions and for understanding the regulatory requirements of their jurisdiction.

**NO RELIANCE / EDUCATIONAL PURPOSES ONLY**
