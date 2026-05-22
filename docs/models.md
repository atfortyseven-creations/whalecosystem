# Data Models

All API responses are typed and versioned. This document is the canonical reference for every object returned by the Whale Alert Network API.

---

## WhaleEvent

A confirmed or pending on-chain transaction that has passed the anomaly scoring threshold.

```typescript
interface WhaleEvent {
  /** Unique whale event identifier  prefix: wh_ */
  id: string;

  /** Source blockchain network */
  network: 'ethereum' | 'polygon' | 'base' | 'arbitrum' | 'optimism' | 'bsc' | 'worldchain';

  /** Transaction hash */
  hash: `0x${string}`;

  /** Sender address */
  from: `0x${string}`;

  /** Recipient address */
  to: `0x${string}`;

  /** Token symbol (e.g. USDC, ETH, MATIC) */
  token: string;

  /** Token contract address  null for native asset transfers */
  tokenAddress: `0x${string}` | null;

  /** Raw token amount in smallest denomination (wei / base units) */
  amountRaw: string;

  /** USD equivalent at time of detection */
  amountUsd: number;

  /**
   * Statistical anomaly score (Z-score).
   * Formula: z = (x - μ) / σ
   * Where x = transaction volume, μ = rolling 1-hour mean, σ = rolling 1-hour std dev.
   * Values  2.5 are classified as whale-tier events.
   */
  anomalyScore: number;

  /** ISO 8601 timestamp of event detection */
  timestamp: string;

  /** Block number at time of confirmation */
  blockNumber: number;

  /** Whether the transaction has been confirmed (false = mempool detection) */
  confirmed: boolean;

  /** Transaction direction classification */
  direction: 'exchange_inflow' | 'exchange_outflow' | 'wallet_to_wallet' | 'contract_interaction' | 'bridge';

  /** Exchange label if from/to is a known exchange hot wallet */
  exchangeLabel: string | null;
}
```

---

## Market

A Polymarket prediction market as retrieved from the CLOB API.

```typescript
interface Market {
  /** Polymarket condition ID */
  conditionId: string;

  /** Market question */
  question: string;

  /** Resolution date */
  endDate: string;

  /** Market status */
  status: 'active' | 'resolved' | 'cancelled';

  /** Outcome tokens */
  outcomes: MarketOutcome[];

  /** Total volume traded (USDC) */
  volumeUsdc: number;

  /** Total open interest (USDC) */
  openInterestUsdc: number;

  /** Liquidity currently available in the CLOB (USDC) */
  liquidityUsdc: number;

  /** Category tag (e.g. "politics", "crypto", "sports") */
  category: string;

  /** Last price update timestamp */
  updatedAt: string;
}

interface MarketOutcome {
  /** Outcome label (e.g. "Yes", "No") */
  label: string;

  /** Current best bid price (01 range, represents probability) */
  price: number;

  /** Token CLOB ID */
  tokenId: string;
}
```

---

## Signal

A computed analytics signal derived from cross-referencing whale activity with market microstructure.

```typescript
interface Signal {
  /** Unique signal identifier  prefix: sig_ */
  id: string;

  /** Signal type classification */
  type: 'accumulation' | 'distribution' | 'liquidity_drain' | 'bridge_flow' | 'smart_money_entry';

  /** Confidence score (0100) */
  confidence: number;

  /** Related whale events that triggered this signal */
  relatedWhaleIds: string[];

  /** Asset or market the signal pertains to */
  asset: string;

  /** Networks involved */
  networks: string[];

  /** Human-readable signal description */
  description: string;

  /** Suggested interpretation (not financial advice) */
  interpretation: string;

  /** Signal generation timestamp */
  generatedAt: string;

  /** Signal expiry  after this point the signal should be discarded */
  expiresAt: string;
}
```

---

## UserSession

The authenticated session object returned after wallet connection.

```typescript
interface UserSession {
  /** Clerk user ID (null if authenticated via system handshake only) */
  clerkUserId: string | null;

  /** Connected wallet address */
  walletAddress: `0x${string}`;

  /** Plan tier */
  plan: 'FREE' | 'STANDARD' | 'STARTER' | 'PRO' | 'ELITE';

  /** KYC verification status */
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_STARTED';

  /** Human Score (World ID verification level, 0100) */
  humanScore: number;

  /** Session creation timestamp */
  createdAt: string;

  /** Session expiry timestamp */
  expiresAt: string;
}
```

---

## ApiKey

```typescript
interface ApiKey {
  /** Prefixed key identifier (shown in dashboard, safe to store) */
  keyId: string;

  /** The actual secret  shown ONCE at creation, never again */
  secret?: string;

  /** Environment */
  environment: 'live' | 'test';

  /** Plan tier this key inherits limits from */
  plan: 'FREE' | 'STANDARD' | 'STARTER' | 'PRO' | 'ELITE';

  /** Requests made today */
  requestsToday: number;

  /** Daily request limit (-1 = unlimited) */
  dailyLimit: number;

  /** Key creation timestamp */
  createdAt: string;

  /** Last usage timestamp */
  lastUsedAt: string | null;

  /** Whether the key is active */
  active: boolean;
}
```

---

## PaginatedResponse

All list endpoints return this wrapper:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    generatedAt: string;
    latencyMs: number;
  };
}
```

---

## ErrorResponse

All error responses conform to this structure:

```typescript
interface ErrorResponse {
  error: string;         // Machine-readable error code (e.g. "RATE_LIMITED")
  message: string;       // Human-readable description
  code: number;          // HTTP status code
  retryAfter?: number;   // Seconds to wait before retrying (429 only)
  requestId?: string;    // Trace ID for support escalation
}
```
