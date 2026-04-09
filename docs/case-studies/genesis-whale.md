# Case Study: Genesis Accumulation Detection

**Date:** April 8, 2026
**Network:** Base L2
**Assets Tracked:** Wrapped ETH (WETH), Custom ERC-20 Meme
**Alert Type:** Thermodynamic Pre-Pump Accumulation

## Context
A major liquidity shift was detected 4 hours before significant price appreciation. The Sovereing Vault flagged a high-density "Warm Access" (EIP-2929) anomaly clustered around three seemingly unrelated wallets. 

## The Heuristic Trigger
Our local `Whale Worker` identified the following pattern:
1. **Wallet A** funded **Wallet B** and **Wallet C** via an OTC hidden bridge transaction (flagged by zero-fee transfers via custom smart contracts).
2. Within 15 minutes, all three wallets executed a sequential drain of a specific liquidity pool on Uniswap V3 (Base), pulling out $1.4M in total liquidity into cold storage.
3. The thermodynamic Z-Score of the mempool spiked to `4.8` (anything above `3.0` indicates extreme statistical deviance from the 90-day MA).

## Sovereign Validation
Because the user was running the node locally in `LITE_MODE=false`, the Neo4j graph automatically mapped the "Elite Neighbors". Wallet A was previously observed depositing 400 ETH to Coinbase Prime 6 months prior.

## Outcome
The terminal signaled an "Institutional Accumulation" alert locally, without anyone else on the network knowing the user was observing it. 4 hours later, the asset experienced a +240% volume breakout as retail caught onto the liquidity crunch.

*Note: All data in this case study is anonymized to protect network integrity. Our goal is to provide alpha without participating in market manipulation.*
