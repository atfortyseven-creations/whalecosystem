# Quickstart — API

This guide takes you from zero to your first authenticated API response in under 5 minutes.

---

## Prerequisites

- A Web3 wallet (MetaMask, Coinbase Wallet, Trust Wallet, Rainbow, or any EIP-6963-compatible wallet)
- An API key from the [Developer Dashboard](https://humanidfi.com/dashboard)
- `curl` or any HTTP client

> **Jurisdictional Note:** API access is unavailable for requests originating from the United States, Cuba, Iran, North Korea, and Syria, in accordance with CFTC and OFAC regulations.

---

## Step 1 — Obtain an API Key

1. Navigate to [humanidfi.com](https://humanidfi.com) on desktop
2. Connect your wallet using the **CONNECT WALLET** button
3. Complete identity verification if required for your target plan tier
4. Go to **Settings → Developer → API Keys**
5. Generate a new key — it is shown only once. Store it securely.

API keys are scoped to your wallet address and plan tier. They cannot be transferred.

---

## Step 2 — Authenticate

All API requests must include your key in the `Authorization` header using the Bearer scheme:

```http
Authorization: Bearer wha_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Example — verify your key is active:**

```bash
curl https://humanidfi.com/api/v1/auth/verify \
  -H "Authorization: Bearer wha_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Response:**

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

## Step 3 — Your First Request

### Fetch recent whale transactions

```bash
curl "https://humanidfi.com/api/v1/whale/recent?network=ethereum&minUsd=1000000&limit=10" \
  -H "Authorization: Bearer wha_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**Response:**

```json
{
  "data": [
    {
      "id": "wh_01HX9K...",
      "network": "ethereum",
      "hash": "0xf3a9...",
      "from": "0xDeadBeef...",
      "to": "0xCafe...",
      "token": "USDC",
      "amountRaw": "50000000000000",
      "amountUsd": 50000000,
      "anomalyScore": 4.82,
      "timestamp": "2026-03-30T19:41:22.183Z",
      "blockNumber": 21847501,
      "confirmed": true
    }
  ],
  "meta": {
    "total": 10,
    "network": "ethereum",
    "generatedAt": "2026-03-30T19:42:01.003Z",
    "latencyMs": 38
  }
}
```

---

## Step 4 — Subscribe to Real-Time Stream

For live data, open a WebSocket connection to the streaming endpoint:

```javascript
const ws = new WebSocket(
  'wss://humanidfi.com/api/v1/stream/whale',
  [],
  {
    headers: {
      Authorization: 'Bearer wha_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    }
  }
);

ws.onmessage = (event) => {
  const whale = JSON.parse(event.data);
  console.log(`[${whale.network}] $${whale.amountUsd.toLocaleString()} — ${whale.token}`);
};

ws.onclose = (event) => {
  // Implement exponential backoff reconnection
  // delay = Math.min(1000 * 2^attempt, 30000)
};
```

**Stream message format:**

```json
{
  "type": "WHALE_DETECTED",
  "payload": {
    "id": "wh_01HX9K...",
    "network": "polygon",
    "token": "MATIC",
    "amountUsd": 2800000,
    "anomalyScore": 3.91,
    "timestamp": "2026-03-30T19:42:07.441Z"
  }
}
```

---

## Common Errors

| Code | Message | Resolution |
|---|---|---|
| `401` | `UNAUTHORIZED` | Check your API key — it may be invalid, expired, or from the wrong environment |
| `403` | `RESTRICTED_JURISDICTION` | Your IP is in a geofenced jurisdiction |
| `429` | `RATE_LIMITED` | You have exceeded your plan's request quota — wait for `Retry-After` seconds |
| `503` | `SERVICE_UNAVAILABLE` | Upstream RPC provider is temporarily unreachable |

---

## SDK Quick Install

```bash
npm install @whalecosystem/sdk
```

```typescript
import { WhaleClient } from '@whalecosystem/sdk';

const client = new WhaleClient({ apiKey: 'wha_live_xxx' });

const whales = await client.whale.recent({
  network: 'ethereum',
  minUsd: 1_000_000,
  limit: 10
});
```

See [Whale Code SDK →](./whale-code-sdk.md) for full reference.
