# API Reference

Complete reference for all Whale Alert Network REST API endpoints. All requests must be authenticated with a valid API key in the `Authorization: Bearer` header unless noted otherwise.

**Base URL:** `https://humanidfi.com/api/v1`

---

## Authentication

```http
Authorization: Bearer wha_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

All responses include rate limit headers:

```http
X-RateLimit-Limit: 50000
X-RateLimit-Remaining: 49858
X-RateLimit-Reset: 1743379200
```

---

## Whale Events

### `GET /whale/recent`

Returns the most recent whale events passing the anomaly threshold.

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `network` | string |  | `ethereum` \| `polygon` \| `base` \| `arbitrum` \| `optimism` \| `bsc` \| `worldchain` |
| `minUsd` | number |  | Minimum USD value (default: `500000`) |
| `maxUsd` | number |  | Maximum USD value filter |
| `token` | string |  | Token symbol filter (e.g. `USDC`, `ETH`) |
| `direction` | string |  | `exchange_inflow` \| `exchange_outflow` \| `wallet_to_wallet` \| `contract_interaction` \| `bridge` |
| `confirmed` | boolean |  | `true` = confirmed only, `false` = mempool only, omit = both (ELITE+) |
| `limit` | number |  | Results per page, max `100` (default: `20`) |
| `page` | number |  | Page number (default: `1`) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "wh_01HX9KABCDEF",
      "network": "ethereum",
      "hash": "0xf3a9b2...",
      "from": "0xDeadBeef...",
      "to": "0xCafe...",
      "token": "USDC",
      "tokenAddress": "0xA0b869...",
      "amountRaw": "50000000000000",
      "amountUsd": 50000000,
      "anomalyScore": 4.82,
      "direction": "exchange_inflow",
      "exchangeLabel": "Binance Hot Wallet",
      "timestamp": "2026-03-30T19:41:22.183Z",
      "blockNumber": 21847501,
      "confirmed": true
    }
  ],
  "meta": {
    "total": 847,
    "page": 1,
    "pageSize": 20,
    "hasNext": true,
    "generatedAt": "2026-03-30T19:42:01.003Z",
    "latencyMs": 38
  }
}
```

---

### `GET /whale/history`

Query historical whale events. Available to PRO and ELITE plans.

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `network` | string |  | Network filter |
| `from` | string |  | ISO 8601 start date |
| `to` | string |  | ISO 8601 end date (max range: 90 days for PRO, unlimited for ELITE) |
| `token` | string |  | Token filter |
| `minUsd` | number |  | Minimum USD value |
| `direction` | string |  | Direction filter |
| `limit` | number |  | Max `1000` |
| `page` | number |  | Page number |
| `format` | string |  | `json` (default) \| `csv` |

---

### `GET /whale/:id`

Retrieve a single whale event by ID.

**Response `200`:** Single `WhaleEvent` object.

**Response `404`:**
```json
{ "error": "NOT_FOUND", "message": "Whale event wh_xxx not found", "code": 404 }
```

---

## Signals

### `GET /signals/recent`

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `type` | string |  | `accumulation` \| `distribution` \| `liquidity_drain` \| `bridge_flow` \| `smart_money_entry` |
| `minConfidence` | number |  | Minimum confidence score 0100 (default: `40`) |
| `asset` | string |  | Asset symbol filter |
| `network` | string |  | Network filter |
| `limit` | number |  | Max `50` (default: `10`) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "sig_01HX9K...",
      "type": "accumulation",
      "confidence": 87,
      "relatedWhaleIds": ["wh_01HX9K...", "wh_01HX9L..."],
      "asset": "USDC",
      "networks": ["ethereum", "polygon"],
      "description": "Large USDC accumulation detected across 3 wallets over 90 minutes",
      "interpretation": "Potential pre-positioning ahead of significant market event",
      "generatedAt": "2026-03-30T19:38:00.000Z",
      "expiresAt": "2026-03-30T23:38:00.000Z"
    }
  ],
  "meta": { "total": 12, "page": 1, "pageSize": 10, "hasNext": true }
}
```

---

## Markets (Polymarket)

### `GET /markets`

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `status` | string |  | `active` \| `resolved` \| `cancelled` |
| `category` | string |  | `crypto` \| `politics` \| `sports` \| `science` \| `economics` |
| `minVolume` | number |  | Minimum USDC volume |
| `sortBy` | string |  | `volume` \| `openInterest` \| `endDate` \| `liquidity` |
| `order` | string |  | `asc` \| `desc` (default: `desc`) |
| `limit` | number |  | Max `100` (default: `20`) |
| `page` | number |  | Page |

---

### `GET /markets/:conditionId`

Retrieve a single market with full outcome data.

---

### `GET /markets/:conditionId/orderbook`

Retrieve the current order book for a market outcome. Available to STANDARD+ plans.

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `outcome` | string |  | Outcome label (e.g. `Yes`, `No`) |
| `depth` | number |  | Price levels on each side (default: `10`, max: `50`) |

**Response `200`:**
```json
{
  "conditionId": "0xabc123...",
  "outcome": "Yes",
  "midPrice": 0.623,
  "bestBid": 0.620,
  "bestAsk": 0.625,
  "spreadBps": 80,
  "bids": [
    { "price": 0.620, "size": 5000, "total": 5000 },
    { "price": 0.615, "size": 12000, "total": 17000 }
  ],
  "asks": [
    { "price": 0.625, "size": 8000, "total": 8000 },
    { "price": 0.630, "size": 15000, "total": 23000 }
  ],
  "timestamp": "2026-03-30T19:42:01.003Z"
}
```

---

## Liquidity (PRO / ELITE)

### `GET /liquidity/:network/:tokenAddress`

Retrieve full liquidity snapshot for a token.

**Response `200`:**
```json
{
  "network": "ethereum",
  "token": "USDC",
  "tokenAddress": "0xA0b869...",
  "liquidityScore": 82,
  "poolDepth1pct": 45000000,
  "poolDepth5pct": 180000000,
  "priceImpact": {
    "10k": 0.0001,
    "50k": 0.0005,
    "100k": 0.0011,
    "500k": 0.0058,
    "1m":   0.0121,
    "5m":   0.0734
  },
  "bidAskSpreadBps": 1,
  "updatedAt": "2026-03-30T19:42:00.000Z"
}
```

---

### `GET /liquidity/bridge`

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `asset` | string |  | Asset symbol |
| `period` | string |  | `1h` \| `4h` \| `24h` (default: `4h`) |
| `networks` | string[] |  | Comma-separated list |

---

## Authentication & Identity

### `GET /auth/verify`

Verify your API key and return plan details. No rate limiting applied.

**Response `200`:**
```json
{
  "status": "active",
  "walletAddress": "0xAbC...1234",
  "plan": "PRO",
  "requestsToday": 142,
  "dailyLimit": 50000,
  "resetAt": "2026-03-31T00:00:00Z"
}
```

---

### `POST /auth/qr-sync`

Completes a mobile-to-desktop QR synchronization handshake. Called from the mobile scanner after QR code is scanned.

**Body:**
```json
{
  "token": "uuid-session-token",
  "address": "0xWalletAddress..."
}
```

**Response `200`:** Sets `whale_handshake` cookie and returns:
```json
{ "success": true, "sessionEstablished": true }
```

---

## User

### `GET /user/wallet`

Returns the authenticated user's wallet data. Requires authentication.

**Response `200`:**
```json
{
  "walletAddress": "0xAbC...1234",
  "plan": "PRO",
  "kycStatus": "APPROVED",
  "humanScore": 95,
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

### `GET /wallet/history`

Returns transaction history for the authenticated wallet. Requires authentication.

**Parameters:**

| Param | Type | Required | Description |
|---|---|---|---|
| `network` | string |  | Filter by network |
| `limit` | number |  | Max `100` |
| `page` | number |  | Page |

---

## Webhooks

### `POST /webhooks`

Register a webhook endpoint.

**Body:**
```json
{
  "url": "https://your-server.com/webhook",
  "events": ["whale.detected", "signal.generated"],
  "filters": {
    "minUsd": 5000000,
    "networks": ["ethereum"],
    "signalTypes": ["accumulation"]
  },
  "secret": "your_signing_secret"
}
```

**Response `201`:**
```json
{
  "id": "wh_webhook_01HX...",
  "url": "https://your-server.com/webhook",
  "events": ["whale.detected", "signal.generated"],
  "active": true,
  "createdAt": "2026-03-30T19:00:00Z"
}
```

---

### `GET /webhooks`

List all registered webhooks for your API key.

---

### `DELETE /webhooks/:id`

Delete a webhook.

---

## Health

### `GET /health`

Public endpoint  no authentication required. Returns system operational status.

**Response `200`:**
```json
{
  "status": "operational",
  "version": "4.0.0",
  "services": {
    "api": "operational",
    "websocket": "operational",
    "database": "operational",
    "redis": "operational",
    "ethereum_rpc": "operational",
    "polymarket_feed": "operational"
  },
  "timestamp": "2026-03-30T19:42:00.000Z"
}
```

---

## Error Codes

| HTTP Code | Error Code | Description |
|---|---|---|
| `400` | `BAD_REQUEST` | Missing or invalid request parameters |
| `401` | `UNAUTHORIZED` | Missing, invalid, or expired API key |
| `403` | `FORBIDDEN` | Authenticated but insufficient plan for this endpoint |
| `403` | `RESTRICTED_JURISDICTION` | Request from a geofenced country |
| `403` | `KYC_REQUIRED` | Route requires KYC approval |
| `404` | `NOT_FOUND` | Resource does not exist |
| `422` | `UNPROCESSABLE` | Request structure is valid but semantically incorrect |
| `429` | `RATE_LIMITED` | Daily quota exceeded  check `Retry-After` header |
| `429` | `WAF_RATE_LIMITED` | Per-endpoint WAF limit exceeded |
| `503` | `SERVICE_UNAVAILABLE` | Upstream data source temporarily unreachable |
| `403` | `WAF_BLOCK` | Request blocked by security policy |

---

## WebSocket Streams

### `WSS /stream/whale`

Real-time whale event stream. Requires `Authorization` header at connection time.

**Stream message types:**

| Type | Description |
|---|---|
| `WHALE_DETECTED` | New whale event (confirmed or mempool depending on plan) |
| `SIGNAL_GENERATED` | New analytics signal |
| `PING` | Keepalive (every 30s  respond with `PONG` within 10s) |
| `ERROR` | Stream-level error with code and message |
| `RECONNECT` | Server-initiated reconnect request (maintenance) |

**Message format:**
```json
{
  "type": "WHALE_DETECTED",
  "id": "msg_01HX9K...",
  "timestamp": "2026-03-30T19:42:07.441Z",
  "payload": { ... }
}
```

**Connection example:**
```javascript
const ws = new WebSocket('wss://humanidfi.com/api/v1/stream/whale', {
  headers: { Authorization: 'Bearer wha_live_xxx' }
});
ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' }));
  if (msg.type === 'WHALE_DETECTED') handleWhale(msg.payload);
});
```
