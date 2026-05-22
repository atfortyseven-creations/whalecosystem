# Neural Analytics

The analytics layer of Whale Alert Network is a real-time statistical processing engine that transforms raw on-chain event streams into actionable, classified signals. This document describes the algorithms, thresholds, and classification logic in production.

---

## Pipeline Overview

```
Raw Blockchain Event Stream (WebSocket)
            
            

  Stage 1: Pre-filter        
   Token whitelist check    
   Min absolute value gate  
   Transaction type class.  

               
               

  Stage 2: Z-Score Engine    
   Rolling μ (hourly mean)  
   Rolling σ (hourly stddev)
   Anomaly score computed   

               
               

  Stage 3: Classification    
   Direction labeling       
   Exchange wallet lookup   
   Bridge detection         
   Smart money tagging      

               
               

  Stage 4: Signal Generation 
   Cross-market correlation 
   Pattern matching         
   Confidence scoring       

               
               
        Distribution Layer
   (REST API / WebSocket streams)
```

---

## Stage 1  Pre-filter

Before any statistical computation, every incoming event is evaluated against three gates:

### 1.1 Token Whitelist
Only transactions involving tracked assets are processed. Spam tokens, honeypot contracts, and unverified ERC-20s are rejected at this stage.

Monitored asset categories:
- Native assets: ETH, BNB, MATIC, OP, ARB
- Stablecoins: USDC, USDT, DAI, BUSD, FRAX
- DeFi blue chips: WBTC, LINK, UNI, AAVE, CRV, LDO
- Prediction market collateral: USDC on Polygon (Polymarket settlement token)

### 1.2 Minimum Absolute Value Gate
Transactions below $50,000 USD equivalent are discarded before entering the statistical engine. This eliminates approximately 99.3% of all on-chain activity, reducing compute load on the anomaly scoring stage.

### 1.3 Transaction Type Classification
Each transaction is classified into one of five categories:
- `exchange_inflow`  from wallet to exchange hot wallet
- `exchange_outflow`  from exchange hot wallet to wallet
- `wallet_to_wallet`  between non-exchange addresses
- `contract_interaction`  call to a DeFi protocol (AMM, lending, staking)
- `bridge`  cross-chain bridge contract interaction

---

## Stage 2  Z-Score Anomaly Engine

The core of the analytics layer is a dynamic statistical anomaly detector. Unlike static threshold systems (e.g., "alert if transfer > $1M"), our system measures how statistically unusual a transaction is relative to the current market microstructure.

### Formula

```
z = (x - μ) / σ
```

Where:
- `x` = transaction volume in USD
- `μ` = rolling 1-hour mean of all transactions passing the pre-filter on the same network/token pair
- `σ` = rolling 1-hour standard deviation

### Implementation Details

The rolling statistics are maintained using **Welford's online algorithm**, which computes mean and variance incrementally without storing the full dataset:

```
For each new value x:
  n += 1
  delta = x - mean
  mean += delta / n
  delta2 = x - mean
  M2 += delta * delta2

variance = M2 / (n - 1)   # Sample variance
σ = variance
```

This runs in O(1) time and O(1) memory per new event, regardless of stream volume.

### Classification Thresholds

| Z-Score | Classification | Action |
|---|---|---|
| < 2.0 | Normal market activity | Discarded |
| 2.0  2.5 | Elevated activity | Logged, not broadcast |
| 2.5  3.5 | **Whale event** | Broadcast to STANDARD+ subscribers |
| 3.5  5.0 | **Major whale event** | Priority broadcast, signal generation triggered |
| > 5.0 | **Extreme outlier** | Emergency broadcast, all-tier notification |

---

## Stage 3  Classification

### Exchange Wallet Database
A continuously updated database of 12,000+ known exchange hot wallet addresses allows instant classification of transaction direction (inflow/outflow). This database is updated via a combination of:
- Publicly labeled addresses (Etherscan labels, Dune Analytics)
- Internal heuristic labeling (address clustering, UTXO graph analysis)
- Community contributions (verified via consensus)

### Bridge Detection
Transactions to known bridge contracts (Arbitrum bridge, Optimism gateway, Polygon PoS bridge, Stargate, LayerZero) are tagged as `bridge` and correlated with corresponding events on the destination chain to compute net cross-chain flows.

### Smart Money Identification
Wallets that have historically exhibited high-alpha behavior (profitable entries before major price moves) are tagged as `smart_money`. The score is computed as:

```
smartMoneyScore = (winRate × avgReturn) / maxDrawdown
```

Wallets with `smartMoneyScore > 2.5` are in the smart money registry and their activity triggers priority signals.

---

## Stage 4  Signal Generation

Signals are higher-order analytics products: they synthesize multiple whale events, market data, and historical patterns into a single actionable insight.

### Signal Types

| Type | Trigger Condition |
|---|---|
| `accumulation` | 3+ large inflows to same address within 4h, no corresponding outflows |
| `distribution` | Exchange inflows from same source cluster exceeding 2× daily average |
| `liquidity_drain` | Rapid reduction in Polymarket CLOB liquidity alongside outflow signals |
| `bridge_flow` | Net cross-chain flow > $10M in 1h on same asset |
| `smart_money_entry` | Smart money wallet initiates position in low-liquidity market |

### Confidence Scoring

Each signal carries a confidence score (0100):

```
confidence = base_score
  + (anomalyScore / 10) × 20    # Higher z-score = more confident
  + (source_count × 5)           # More corroborating events = more confident  
  - (time_dispersion × 2)        # Events spread over time = less confident
  + (smart_money_overlap × 15)   # Smart money wallets corroborate = high confidence
```

Signals with confidence < 40 are suppressed and not distributed.

---

## Market Analytics  Polymarket Integration

In addition to on-chain transfer analysis, the platform ingests Polymarket CLOB (Central Limit Order Book) data to correlate whale movements with prediction market positioning.

### Data Sources

- **CLOB API:** Order book depth, best bid/ask, recent trades
- **Gamma API:** Market metadata, resolution criteria, category tags
- **WebSocket feed:** Real-time price updates for tracked markets

### Correlation Analysis

When a whale event is detected on Polygon (Polymarket's settlement chain), the system:

1. Identifies USDC flows into or out of Polymarket's contract
2. Checks for corresponding position changes in active markets
3. If correlation coefficient > 0.7, generates a `smart_money_entry` or `distribution` signal tied to the specific market

This surface-level correlation provides early signals of informed trading  a meaningful edge for platform users who act on the analytics before the market reprices.
