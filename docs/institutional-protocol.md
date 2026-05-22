# Institutional Protocol

The Institutional Protocol defines the access framework, data handling standards, SLA commitments, and integration requirements for organizations that access Whale Alert Network at the ELITE tier or via enterprise agreements.

---

## What Qualifies as Institutional Access?

Institutional access is designed for:
- **Quantitative trading firms** that require pre-confirmation mempool data for latency-sensitive strategies
- **Market makers** on Polymarket and other prediction markets that need real-time liquidity monitoring
- **Crypto funds** that use whale flow analysis as part of their alpha generation process
- **Research firms** that need historical whale data for backtesting and academic analysis
- **Compliance teams** at financial institutions that monitor on-chain activity for regulatory purposes

---

## Tier Comparison: ELITE vs Enterprise

| Feature | ELITE | Enterprise |
|---|---|---|
| API requests | Unlimited | Unlimited |
| Dedicated RPC node |  |  (co-located) |
| Pre-confirmation (mempool) data |  |  |
| Custom alert thresholds |  |  |
| Private data endpoint |  |  (dedicated subdomain) |
| Custom data retention |  |  (up to 5 years queryable) |
| Dedicated infrastructure |  |  |
| SLA | 99.99% | 99.999% (custom SLA) |
| Support | Dedicated | White-glove + on-call |
| Compliance documentation | Standard | Custom (SOC 2, ISO 27001 on request) |
| Custom signal models |  |  |
| Pricing | $999/mo | Contact sales |

---

## Dedicated RPC Architecture (ELITE+)

ELITE plan holders receive access to dedicated blockchain node connections rather than shared public endpoints. This eliminates:

- **Shared rate limits**  no contention with other users on the same RPC endpoint
- **Variable latency**  dedicated nodes respond consistently under any market condition
- **Data gaps**  dedicated connections maintain persistent WebSocket state without competing for connections

### Supported Dedicated Node Providers

| Network | Provider | Endpoint Type |
|---|---|---|
| Ethereum | GetBlock | WSS (dedicated) + HTTPS |
| BNB Smart Chain | GetBlock | WSS (dedicated) + HTTPS |
| Base | GetBlock | WSS (dedicated) + HTTPS |
| Polygon | Alchemy | WSS + HTTPS |
| World Chain | Alchemy | WSS + HTTPS |
| Arbitrum | Alchemy / Infura | HTTPS (fallback) |
| Optimism | Alchemy / Public | HTTPS (fallback) |

---

## Pre-Confirmation Data (Mempool)

ELITE and Enterprise accounts receive whale event notifications for **unconfirmed transactions** detected in the public Ethereum and BSC mempools.

### How Mempool Detection Works

1. The platform subscribes to the `newPendingTransactions` WebSocket feed on archival nodes
2. Each pending transaction hash is fetched immediately via `eth_getTransactionByHash`
3. The transaction is parsed and scored against the anomaly engine
4. If it passes the Z-score threshold, it is broadcast as a `confirmed: false` event
5. Upon block confirmation, the event is updated with `confirmed: true` and the actual block number

### Mempool Data Caveats

- **Not all pending transactions confirm.** Gas price wars and RBF (Replace-By-Fee) can cause transactions to be replaced or dropped. The SDK includes a `confirmed` field that must be checked before treating mempool data as final.
- **Latency advantage is real but finite.** Pre-confirmation data arrives 400ms15 seconds before confirmation, depending on network congestion. This window is valuable for positioning but should not be used for final settlement decisions.

---

## Historical Data Access

ELITE and Enterprise plans have access to the historical whale event database:

```bash
# Query historical whale events
GET /api/v1/whale/history?
  network=ethereum&
  token=USDC&
  minUsd=10000000&
  from=2026-01-01T00:00:00Z&
  to=2026-03-31T23:59:59Z&
  limit=1000&
  page=1
```

Historical data is available from **January 1, 2024** onwards. Older data is available on Enterprise plans with custom data provision agreements.

**Export formats:**
- JSON (default)
- CSV (add `?format=csv` to query)
- Parquet (Enterprise only)

---

## Institutional Onboarding Process

1. **Connect your wallet** at [humanidfi.com](https://humanidfi.com) using a multi-sig or institutional-grade wallet
2. **Complete KYC verification**  institutional KYC requires entity documentation in addition to wallet ownership proof
3. **Select ELITE plan** or contact the institutional sales channel for Enterprise pricing
4. **Generate API credentials** from the dashboard  institutional accounts support multiple API keys with different permission scopes
5. **Configure IP allowlisting** (recommended)  restrict your API keys to specific IP ranges via the dashboard
6. **Set up webhook delivery** to your infrastructure for push-based data delivery

---

## Data Usage Policy

Institutional clients may:
- Use whale event data in proprietary trading algorithms
- Incorporate signal data into research reports (with attribution)
- Build internal dashboards and monitoring tools
- Create derivative products for internal use

Institutional clients may **not**:
- Resell or redistribute raw data to third parties without a Data Redistribution Agreement
- Create competing public market data products using Whale Alert Network data
- Use the data to reconstruct or approximate the platform's proprietary signal models

---

## SLA and Uptime Guarantees

### ELITE SLA (99.99% uptime)
- Maximum downtime: 52 minutes per year
- Incident response: within 1 hour
- Status updates: every 30 minutes during incidents
- Credits: 10% of monthly fee per hour of breach beyond SLA threshold

### Enterprise SLA (custom)
- Uptime targets up to 99.999% available
- Dedicated on-call engineer
- Custom RTO/RPO defined per agreement
- Penalized SLAs with financial credits available

---

## Compliance Documentation

Institutional accounts may request the following compliance documentation:

| Document | Availability |
|---|---|
| Data Processing Agreement (DPA) | Available on request |
| Security questionnaire (CAIQ) | Available on request |
| Penetration test executive summary | ELITE+ |
| SOC 2 Type II report | Enterprise only |
| ISO 27001 compliance attestation | Enterprise only |
| OFAC/AML compliance attestation | All institutional tiers |

Contact the institutional channel via the dashboard to request compliance documentation.
