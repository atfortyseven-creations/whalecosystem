# Whale Code SDK

The Whale Code SDK is the official TypeScript/JavaScript client for the Whale Alert Network API. It handles authentication, request construction, error handling, automatic retries with exponential backoff, and WebSocket stream management.

---

## Installation

```bash
npm install @whalecosystem/sdk
# or
yarn add @whalecosystem/sdk
# or
pnpm add @whalecosystem/sdk
```

**Requirements:** Node.js ≥ 18, TypeScript ≥ 5.0 (optional but recommended)

---

## Initialization

```typescript
import { WhaleClient } from '@whalecosystem/sdk';

const client = new WhaleClient({
  apiKey: 'wha_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',

  // Optional configuration
  baseUrl: 'https://humanidfi.com',       // Default
  timeout: 10_000,                         // Request timeout ms (default: 10s)
  maxRetries: 3,                           // Auto-retry on 5xx / network errors
  retryDelay: 'exponential',              // 'fixed' | 'exponential' (default: exponential)
});
```

---

## Whale Events

### `client.whale.recent()`

Fetch the most recent whale events.

```typescript
const events = await client.whale.recent({
  network: 'ethereum',          // Required: network to query
  minUsd: 1_000_000,            // Minimum USD value filter (default: 500_000)
  token: 'USDC',                // Optional: filter by token symbol
  limit: 25,                    // Results per page (max: 100, default: 20)
  page: 1,                      // Pagination (default: 1)
  direction: 'exchange_inflow', // Optional: filter by direction
  confirmed: true               // Optional: mempool vs confirmed (default: both)
});

// events.data: WhaleEvent[]
// events.meta: { total, page, pageSize, hasNext, latencyMs }
```

### `client.whale.stream()`

Open a persistent WebSocket stream for real-time whale events.

```typescript
const stream = client.whale.stream({
  networks: ['ethereum', 'polygon', 'base'],
  minUsd: 2_000_000,
  tokens: ['USDC', 'USDT', 'ETH']
});

stream.on('whale', (event: WhaleEvent) => {
  console.log(`🐋 $${event.amountUsd.toLocaleString()} ${event.token} on ${event.network}`);
});

stream.on('signal', (signal: Signal) => {
  console.log(`📡 Signal [${signal.type}] confidence=${signal.confidence}`);
});

stream.on('error', (err) => {
  console.error('Stream error:', err.message);
  // SDK handles reconnection automatically with exponential backoff
});

stream.on('reconnect', (attempt: number) => {
  console.log(`Reconnecting... attempt ${attempt}`);
});

// Gracefully close the stream
await stream.close();
```

**Reconnection behavior:**
```
delay = Math.min(1000 × 2^attempt, 30_000)  // Max 30 seconds between retries
```

---

## Markets (Polymarket)

### `client.markets.list()`

```typescript
const markets = await client.markets.list({
  status: 'active',
  category: 'crypto',
  minVolume: 100_000,   // Minimum USDC volume
  limit: 20,
  sortBy: 'volume',     // 'volume' | 'openInterest' | 'endDate'
  order: 'desc'
});
```

### `client.markets.get()`

```typescript
const market = await client.markets.get('0xabc123...');
// Returns: Market with full outcome data and order book snapshot
```

### `client.markets.orderBook()`

```typescript
const book = await client.markets.orderBook('0xabc123...', {
  outcome: 'Yes',
  depth: 10   // Number of price levels on each side
});

// book.bids: [{ price, size, total }]
// book.asks: [{ price, size, total }]
// book.spread: number
// book.midPrice: number
```

---

## Signals

### `client.signals.recent()`

```typescript
const signals = await client.signals.recent({
  type: 'accumulation',        // Optional: filter by signal type
  minConfidence: 60,           // Minimum confidence score (0–100)
  asset: 'USDC',              // Optional: filter by asset
  limit: 10
});
```

### `client.signals.stream()`

```typescript
const signalStream = client.signals.stream({
  types: ['accumulation', 'smart_money_entry'],
  minConfidence: 70
});

signalStream.on('signal', (s: Signal) => {
  // Handle incoming signal
});
```

---

## Liquidity (PRO / ELITE)

### `client.liquidity.snapshot()`

```typescript
const liquidity = await client.liquidity.snapshot({
  network: 'ethereum',
  tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
});

// liquidity.liquidityScore: number (0–100)
// liquidity.poolDepth1pct: number (USD)
// liquidity.poolDepth5pct: number (USD)
// liquidity.priceImpact: Record<'10k'|'50k'|'100k'|'500k'|'1m', number>
```

### `client.liquidity.bridgeFlow()`

```typescript
const flow = await client.liquidity.bridgeFlow({
  asset: 'USDC',
  period: '4h',
  networks: ['ethereum', 'polygon', 'arbitrum', 'base']
});
```

---

## Authentication Utilities

### `client.auth.verify()`

Check that your API key is active and return plan details:

```typescript
const status = await client.auth.verify();
// status.plan: 'FREE' | 'STANDARD' | 'STARTER' | 'PRO' | 'ELITE'
// status.requestsToday: number
// status.dailyLimit: number
// status.resetAt: string
```

---

## Error Handling

All SDK methods throw typed errors:

```typescript
import { WhaleApiError, RateLimitError, AuthError, GeoRestrictedError } from '@whalecosystem/sdk';

try {
  const events = await client.whale.recent({ network: 'ethereum' });
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Rate limited — retry in ${err.retryAfter}s`);
  } else if (err instanceof AuthError) {
    console.error('Invalid API key');
  } else if (err instanceof GeoRestrictedError) {
    console.error('Access blocked in your jurisdiction');
  } else if (err instanceof WhaleApiError) {
    console.error(`API error ${err.code}: ${err.message}`);
  }
}
```

---

## Webhooks

Instead of polling, PRO and ELITE plans can register webhook endpoints to receive push notifications for whale events and signals.

### Register a Webhook

```typescript
const webhook = await client.webhooks.create({
  url: 'https://your-server.com/webhooks/whale',
  events: ['whale.detected', 'signal.generated'],
  filters: {
    minUsd: 5_000_000,
    networks: ['ethereum'],
    signalTypes: ['accumulation', 'smart_money_entry']
  },
  secret: 'your_webhook_secret'  // Used to verify HMAC-SHA256 signature on delivery
});
```

### Verify Webhook Signature

Every webhook delivery includes an `X-Whale-Signature` header:

```typescript
import { verifyWebhookSignature } from '@whalecosystem/sdk';

app.post('/webhooks/whale', (req, res) => {
  const isValid = verifyWebhookSignature(
    req.rawBody,
    req.headers['x-whale-signature'],
    'your_webhook_secret'
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const { event, payload } = req.body;
  // Process event...
  res.status(200).send('OK');
});
```

---

## Full TypeScript Example

```typescript
import { WhaleClient, WhaleEvent, Signal } from '@whalecosystem/sdk';

const client = new WhaleClient({ apiKey: process.env.WHALE_API_KEY! });

async function main() {
  // Verify connection
  const auth = await client.auth.verify();
  console.log(`Connected as ${auth.plan} plan — ${auth.requestsToday}/${auth.dailyLimit} requests today`);

  // Open real-time stream
  const stream = client.whale.stream({
    networks: ['ethereum', 'polygon'],
    minUsd: 1_000_000
  });

  stream.on('whale', (event: WhaleEvent) => {
    console.log(
      `[${event.network.toUpperCase()}] ${event.token} $${(event.amountUsd / 1e6).toFixed(1)}M`,
      `z=${event.anomalyScore.toFixed(2)}`,
      event.direction
    );
  });

  stream.on('signal', (signal: Signal) => {
    if (signal.confidence >= 75) {
      console.log(`HIGH CONFIDENCE SIGNAL: ${signal.type} on ${signal.asset} (${signal.confidence}%)`);
    }
  });

  // Keep process alive
  process.on('SIGINT', async () => {
    await stream.close();
    process.exit(0);
  });
}

main().catch(console.error);
```
