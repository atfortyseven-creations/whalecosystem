# Pricing & Plan Tiers

Whale Alert Network operates a tiered access model. All tiers share the same underlying data infrastructure — the difference is throughput, concurrency, and access to premium intelligence features.

---

## Plan Comparison

| Feature | FREE | STANDARD | STARTER | PRO | ELITE |
|---|---|---|---|---|---|
| **Daily API Requests** | 500 | 5,000 | 15,000 | 50,000 | Unlimited |
| **Real-Time WebSocket** | ❌ | ✅ (1 stream) | ✅ (3 streams) | ✅ (10 streams) | ✅ Unlimited |
| **Whale Detection** | Delayed 60s | Delayed 15s | Near-real-time | Real-time | Pre-confirmation (mempool) |
| **Signal Intelligence** | ❌ | ❌ | Basic | Advanced | Full (all signal types) |
| **Polymarket Data** | Public only | Public only | ✅ | ✅ | ✅ + Order Book Depth |
| **Liquidity Analytics** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Governance Access** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **KYC-Gated Trading** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Gasless Execution** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Dedicated RPC** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **SLA Uptime Guarantee** | None | None | 99.5% | 99.9% | 99.99% |
| **Support** | Community | Email | Email | Priority | Dedicated |

---

## Rate Limits by Plan

Rate limits are enforced at two layers:

1. **WAF Layer (in-memory):** Per-endpoint sliding window, enforced at the Edge before any application code runs. Shared across all plans.
2. **Redis Layer (distributed):** Per-API-key daily quota, enforced atomically via Lua scripting on Redis.

### Per-Endpoint Limits (all plans)

| Endpoint | Max Requests | Window |
|---|---|---|
| `/api/verify-human` | 10 | 1 hour |
| `/api/auth/*` | 20 | 1 minute |
| `/api/polymarket/*` | 100 | 1 minute |
| `/api/defi/deposit` | 20 | 1 minute |
| `/api/defi/copy-trading` | 30 | 1 minute |
| `/api/user/nuke` | 2 | 24 hours |
| All other `/api/*` | 300 | 1 minute |

### Daily Quota by Plan

| Plan | Daily Requests | Burst Behavior |
|---|---|---|
| FREE | 500 | Hard block after quota |
| STANDARD | 5,000 | Hard block after quota |
| STARTER | 15,000 | Hard block after quota |
| PRO | 50,000 | Soft warning at 80%, block at 100% |
| ELITE | -1 (unlimited) | No quota — SLA-governed only |

> **Implementation note:** Elite plan keys return `{ success: true, limit: -1, remaining: -1 }` from the rate limiter, bypassing all quota checks. Rate limiting for Elite is governed exclusively by the per-endpoint WAF limits above.

---

## Pricing

| Plan | Monthly | Annual (20% off) |
|---|---|---|
| FREE | $0 | $0 |
| STANDARD | $29 | $278 |
| STARTER | $79 | $758 |
| PRO | $199 | $1,910 |
| ELITE | $999 | $9,590 |

> Enterprise pricing for funds, institutions, and API resellers is available on request. Contact us via the institutional channel on the dashboard.

---

## Upgrading Your Plan

Plan upgrades take effect immediately. Your API key inherits the new tier's limits within the same request cycle — no re-authentication required.

Downgrading is effective at the start of the next billing cycle. Active sessions maintain their current tier until then.

---

## KYC Requirement for Trading Routes

Access to `/trade` and all trading-related API routes requires:

1. An active Whale Alert session (wallet connected)
2. A valid `kyc_token` cookie containing a JWT signed with your deployment's `KYC_SECRET`
3. The JWT payload must contain `{ status: "APPROVED" }`

The KYC flow is accessible at `/verify-human`. Approval is typically completed within 24 hours for standard verification.

---

## Overage Policy

There are no surprise overage charges. When a FREE, STANDARD, STARTER, or PRO key reaches its daily quota:

- All further API requests return `HTTP 429` with a `Retry-After` header indicating seconds until midnight UTC reset
- WebSocket connections already open remain connected — only new subscription requests are blocked
- The quota resets atomically at midnight UTC via Redis key expiry
