# Liquidity Analytics

Liquidity Analytics is an ELITE and PRO tier feature that provides institutional-grade depth analysis of on-chain and prediction market liquidity. This document covers data sources, metrics, and interpretation.

---

## What Is Liquidity in This Context?

In traditional finance, liquidity refers to how quickly an asset can be converted to cash without moving the price. In on-chain markets, the concept is more nuanced — liquidity is fragmented across:

1. **AMM liquidity pools** (Uniswap, Curve, Balancer, Aerodrome)
2. **CLOB order books** (Polymarket, dYdX, Hyperliquid)
3. **Lending protocol liquidity** (available to borrow without moving rates)
4. **Bridge liquidity** (cross-chain transfer capacity)

The Whale Alert Network Liquidity Analytics module monitors all four dimensions simultaneously.

---

## AMM Liquidity Metrics

### Pool Depth

For any Uniswap v3 (or v2) pool, pool depth measures the USD value of assets that can be traded before the price moves by a given percentage:

```
depth(p%) = ∑ liquidity_in_ticks_within_p%_of_current_price × tick_spacing
```

For concentrated liquidity pools (Uniswap v3), this is calculated tick-by-tick across the active range.

### Price Impact

For a given trade size `Q`, the price impact is:

```
priceImpact = |executionPrice - midPrice| / midPrice
```

Where `executionPrice` is derived from the constant product formula after routing through all available liquidity:

```
x · y = k
(x + Q) · (y - ΔY) = k
priceImpact = 1 - (y - ΔY) / (y · (1 + Q/x))
```

The platform precomputes price impact curves for standard trade sizes ($10K, $50K, $100K, $500K, $1M, $5M, $10M) and updates them every 30 seconds.

### Slippage Estimation

Slippage accounts for both price impact and fee structure:

```
totalSlippage = priceImpact + poolFee + (gasPrice × gasUsed) / tradeSize
```

Pool fees are sourced directly from the pool contract's fee tier (0.01%, 0.05%, 0.30%, 1.00% for Uniswap v3).

---

## CLOB Liquidity Metrics (Polymarket)

### Order Book Depth

```
bidDepth(p%) = ∑ quantity × price for all bids within p% of best bid
askDepth(p%) = ∑ quantity × price for all asks within p% of best ask
totalDepth(p%) = bidDepth(p%) + askDepth(p%)
```

Standard depth levels reported: 1%, 2%, 5%, 10% from mid.

### Bid-Ask Spread

```
spread = bestAsk - bestBid
spreadBps = spread / midPrice × 10000
```

Spread widens during low-liquidity periods (weekends, low-activity markets) and tightens as market makers add inventory.

### Liquidity Drain Detection

When `totalDepth(5%)` decreases by more than 30% within a 15-minute window, the system triggers a `liquidity_drain` signal. This often precedes significant price movement as market makers remove inventory in anticipation of a resolution.

---

## On-Chain Lending Liquidity

### Available Borrow Capacity

For Aave v3 and Compound v3 pools, available borrow capacity is:

```
availableBorrow = totalSupply × utilizationTarget - totalBorrow
```

Where `utilizationTarget` is the protocol's optimal utilization rate (typically 80%).

### Utilization Rate

```
utilization = totalBorrow / totalSupply
```

At high utilization (>80%), borrow rates increase rapidly due to the kink model, making it expensive to maintain leveraged positions. The platform monitors utilization spikes as early indicators of forced liquidations.

### Liquidation Proximity Index

```
lpi = (healthFactor - 1) / healthFactor
```

For tracked whale wallets, the platform monitors health factors across Aave, Compound, and Morpho positions. Wallets approaching `healthFactor < 1.05` are flagged as liquidation risk — a source of predictable, high-impact on-chain activity.

---

## Cross-Chain Flow Analysis

### Net Bridge Flow

```
netFlow(asset, t) = ∑ bridgeIn(asset, t) - ∑ bridgeOut(asset, t)
```

Over a 4-hour rolling window, the net flow of USDC, ETH, and BTC equivalents across major bridges (Arbitrum, Optimism, Polygon PoS, Base, Stargate) is computed.

Positive net flow to a chain indicates capital accumulation — often a precursor to increased on-chain activity. Negative net flow indicates capital extraction.

### Bridge Capacity Utilization

```
bridgeUtilization = currentVolume / maxDailyCapacity
```

When bridge utilization exceeds 80%, users face increased slippage and longer confirmation times. The platform alerts on high bridge utilization as it affects execution quality for large positions.

---

## Liquidity Score

Each asset is assigned a composite Liquidity Score (0–100) updated every minute:

```
liquidityScore =
  (poolDepth5% / benchmarkDepth) × 30       # AMM depth weight: 30%
  + (1 - spreadBps / maxSpread) × 20         # Spread tightness weight: 20%
  + (1 - utilizationRate) × 20               # Lending availability weight: 20%
  + (1 - bridgeUtilization) × 15             # Bridge capacity weight: 15%
  + (smartMoneyVolume / totalVolume) × 15    # Smart money activity weight: 15%
```

**Interpretation:**
- 80–100: Excellent liquidity — large trades can be executed with minimal impact
- 60–79: Good liquidity — standard institutional volume executes cleanly  
- 40–59: Moderate — price impact becomes meaningful above $500K
- 20–39: Thin — elevated slippage, caution advised
- 0–19: Illiquid — market making has withdrawn, high manipulation risk

---

## API Endpoints

```bash
# Get liquidity snapshot for an asset
GET /api/v1/liquidity/{network}/{tokenAddress}

# Get order book depth for a Polymarket market
GET /api/v1/liquidity/polymarket/{conditionId}/depth

# Get bridge flow data
GET /api/v1/liquidity/bridge?asset=USDC&period=4h

# Get liquidation proximity index for tracked wallets
GET /api/v1/liquidity/liquidation-risk?network=ethereum&minRisk=0.8
```

All liquidity endpoints are available to PRO and ELITE plan holders. See [API Reference](./api-reference.md) for complete parameter documentation.
