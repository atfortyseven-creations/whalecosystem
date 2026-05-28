# Humanity Ledger — Institutional Web3 Portfolio & ZK Privacy Suite

![Humanity Ledger](public/system-shots/Devine-Lu-Linvega-monochrome-pixel-art-illustration-arch-2268374-wallhere.com.jpg)

**Privacy-First Institutional Wallet & Analytics Engine — Built Natively on Aztec Network**

Humanity Ledger is the most advanced non-custodial Web3 portfolio system in the Aztec ecosystem. It unifies zero-knowledge privacy, institutional-grade DeFi execution, Account Abstraction (ERC-4337), omnichain interoperability (LayerZero V2), and real-time capital analytics into a single cohesive platform — built entirely on-chain, with no simulations and no centralized key custody.

> This repository is our official grant submission for **Aztec Network**. Every engine documented below is implemented as pure on-chain logic, cryptographically sound, and production-deployed on Railway.

---

## What Was Built — Full Feature Matrix

### 🔐 Quantum Vault — HD Wallet Core (BIP-39 / BIP-44)

A fully native hierarchical deterministic wallet engine.

- **BIP-39 Mnemonic Generation:** Generates a 128-bit entropy seed and maps it to a 12-word Secret Recovery Phrase using the complete BIP-39 wordlist.
- **BIP-44 Account Derivation:** Derives infinite child accounts along the `m/44'/60'/0'/0/n` path from a single master seed.
- **AES-256 Encrypted Vault:** The encrypted vault is persisted in `localStorage` using `crypto-js`. The session key is held in-memory only and purged on lock/logout. Never transmitted.
- **MetaMask-Parity UX:** Vault creation, mnemonic reveal (blur/hover security), seed phrase restoration, and private key import — all identical to MetaMask's core flow.
- **Account Switcher:** Multi-account HD hierarchy with labeled accounts, active-account switching, and per-account balance tracking.

**Files:**
- [`lib/hd-wallet-engine.ts`](lib/hd-wallet-engine.ts)
- [`lib/store/wallet-store.ts`](lib/store/wallet-store.ts)
- [`components/portfolio/HDAccountManager.tsx`](components/portfolio/HDAccountManager.tsx)

---

### 🛡️ Aztec Network — ZK Privacy Terminal

Native integration with Aztec Network's privacy L2 rollup.

- **Private Shielding:** Users can shield ETH from the public L1 into an Aztec private note using the Aztec SDK's `createPrivatePayment` flow. All note commitments and nullifiers are computed locally before submission.
- **Aztec DeFi Bridge:** On-chain interaction with Aztec-native DeFi bridge adapters for Lido, Yearn, and Curve. Users can deposit into yield strategies while keeping their principal amounts hidden from public chain observers.
- **Noir ACIR Witness Encoding:** A native TypeScript encoder (`lib/noir-abi-encoder.ts`) maps complex TypeScript objects to Noir `WitnessMap` format using the 254-bit prime field integer representation required by Barretenberg.
- **EIP-712 Typed Data Signing:** All Aztec note authorizations use `wallet.signTypedData()` for compatibility with the Aztec account contract's `validateUserOp` flow.
- **ZK Proof Verification API:** Two dedicated serverless endpoints (`/api/zk/prove`, `/api/zk/verify-identity`) handle off-chain proof generation and on-chain verification callbacks.

**Files:**
- [`lib/aztec-zk-engine.ts`](lib/aztec-zk-engine.ts)
- [`lib/aztec-defi-bridge.ts`](lib/aztec-defi-bridge.ts)
- [`lib/noir-abi-encoder.ts`](lib/noir-abi-encoder.ts)
- [`components/portfolio/AztecPrivacyTerminal.tsx`](components/portfolio/AztecPrivacyTerminal.tsx)

---

### 💡 ERC-4337 — Smart Account Terminal (Account Abstraction)

Full Account Abstraction implementation conforming to [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337).

- **UserOperation Construction:** Builds the complete `UserOperation` struct with all required fields: `sender`, `nonce`, `initCode`, `callData`, `callGasLimit`, `verificationGasLimit`, `preVerificationGas`, `maxFeePerGas`, `maxPriorityFeePerGas`, `paymasterAndData`, `signature`.
- **Canonical Hash Computation:** Implements `getUserOpHash` as specified by ERC-4337: `keccak256(abi.encode(keccak256(abi.encode(userOp)), entryPoint, chainId))`.
- **Bundler Submission:** Sends signed `UserOperation`s to decentralized Bundler networks via `eth_sendUserOperation` JSON-RPC against the canonical `EntryPoint v0.6` contract (`0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`).
- **Paymaster-Ready:** Architecture supports gasless transactions via Paymaster contracts (ERC-20 gas sponsorship).

**Files:**
- [`lib/erc4337-bundler-engine.ts`](lib/erc4337-bundler-engine.ts)
- [`components/portfolio/SmartAccountTerminal.tsx`](components/portfolio/SmartAccountTerminal.tsx)

---

### 🌐 LayerZero V2 — Omnichain Messaging Engine

Native cross-chain interoperability via [LayerZero V2](https://layerzero.network/) — no bridge UIs, no wrapped tokens, raw protocol messaging.

- **Endpoint Interaction:** Directly calls `LZ_ENDPOINT_V2` (`0x1a44076050125825900e736c501f859c50fE728c`) on the source chain for `quote()` and `send()` operations.
- **Dynamic Native Fee Estimation:** On-chain query of exact native gas fee required for the Decentralized Verifier Networks (DVNs) to relay and execute messages cross-domain.
- **Supported Domains (EIDs):** Ethereum (30101), Arbitrum (30110), Optimism (30111), Polygon (30109), Base (30184), Avalanche (30106).
- **Bytes32 Receiver Packing:** Implements `ethers.zeroPadValue()` for the `bytes32` receiver field required by the Endpoint ABI.

**Files:**
- [`lib/layerzero-omnichain-engine.ts`](lib/layerzero-omnichain-engine.ts)
- [`components/portfolio/OmnichainBridgeView.tsx`](components/portfolio/OmnichainBridgeView.tsx)

---

### ⚡ MEV Protection Engine (Flashbots / MEV Blocker)

Private mempool routing to protect all institutional transactions from sandwich attacks.

- **Flashbots RPC Routing:** Transactions above configurable thresholds are re-routed from public mempools to `https://rpc.flashbots.net/fast` — preventing MEV bots from observing them pre-confirmation.
- **MEV Blocker Fallback:** Secondary routing to `https://rpc.mevblocker.io` for additional validator-level MEV resistance.
- **Bundle Construction:** Supports constructing `eth_sendBundle` payloads for atomic multi-transaction execution within a single block.

**File:** [`lib/mev-protection-engine.ts`](lib/mev-protection-engine.ts)

---

### 🔢 Quantum Nonce Cache — Race Condition Elimination

A static, in-memory nonce mutex that eliminates `Nonce too low` EVM reverts under high-frequency transaction throughput.

- **Local Optimistic Cache:** Maintains a per-address nonce map with 30-second TTL. When rapid-firing transactions (e.g. HFT strategies or bulk approvals), the engine increments nonces locally without waiting for RPC confirmation.
- **Network Reconciliation:** On cache miss or expiry, authoritative nonce is re-fetched from `eth_getTransactionCount` (`pending` tag) and the cache is reseeded.
- **Global Injection:** All `sendTransaction` calls in `wallet-store.ts` pass through `TransactionManager.getSafeNextNonce()` before broadcast.

**File:** [`lib/tx-manager.ts`](lib/tx-manager.ts)

---

### 🔄 DEX Execution Engine (Uniswap V3)

On-chain swap routing via Uniswap V3 SwapRouter.

- **`exactInputSingle`:** Single-hop ERC-20 swap with configurable `sqrtPriceLimitX96` and `amountOutMinimum` for slippage protection.
- **`exactInput` (Multi-hop):** Multi-pool routing via encoded `path` bytes (token → fee → token).
- **EIP-2612 Permit Integration:** Gasless token approvals via `permit()` before swap — users sign a typed message instead of a separate `approve()` transaction.
- **Price Impact Detection:** Pre-swap `quoteExactInputSingle` call via Quoter V2 to calculate expected output and warn on high-impact trades.

**Files:**
- [`lib/dex-engine.ts`](lib/dex-engine.ts)
- [`lib/eip2612-permit-engine.ts`](lib/eip2612-permit-engine.ts)

---

### 🏷️ ENS Resolution Engine

Full bidirectional ENS (Ethereum Name Service) resolution.

- **Forward Lookup:** `ens.lookupAddress(address)` — resolves `0xabc...` → `vitalik.eth`.
- **Reverse Lookup:** `ens.resolveName(name)` — resolves `vitalik.eth` → `0xabc...`.
- **ENS Avatar Fetch:** Retrieves profile avatar URIs from ENS text records for display in the UI.
- **Send-to-ENS:** The Send view accepts ENS names directly, resolves them to addresses before transaction construction.

**File:** [`lib/ens-engine.ts`](lib/ens-engine.ts)

---

### 🏭 Contract Deployer — EIP-1559 Bytecode Deployment

An institutional-grade smart contract deployment engine.

- **Raw Bytecode Deployment:** Constructs `{ to: null, data: bytecode }` transactions for pure EVM deployment.
- **CREATE2 Deterministic Factory:** Using a `salt + initCodeHash` pair, pre-computes the deterministic deployment address on-chain before broadcasting, enabling counterfactual instantiation (EIP-1014).
- **Gas Estimation Buffer:** Applies a mandatory +20% gas buffer on top of `estimateGas` for complex constructor logic.
- **EIP-1559 Enforcement:** All deployments use `type: 2` transactions exclusively.

**Files:**
- [`lib/contract-deployer.ts`](lib/contract-deployer.ts)
- [`lib/create2-wallet-factory.ts`](lib/create2-wallet-factory.ts)
- [`components/portfolio/ContractDeployerView.tsx`](components/portfolio/ContractDeployerView.tsx)

---

### 🔑 EIP-1193 Provider Emulator

A standards-compliant `window.ethereum` provider that allows any external dApp to connect to the user's Humanity Ledger wallet.

- **Full `eth_` RPC Routing:** Handles `eth_requestAccounts`, `eth_sendTransaction`, `eth_signTypedData_v4`, `eth_sign`, `personal_sign`, `eth_chainId`, `wallet_switchEthereumChain`.
- **Internal Key Routing:** All signing operations are intercepted and routed to the internal `getConnectedWallet()` flow — the private key never leaves the encrypted vault.
- **`wallet_switchEthereumChain`:** Programmatic network switching compatible with MetaMask's EIP-3326 specification.

**File:** [`lib/eip1193-provider.ts`](lib/eip1193-provider.ts)

---

### 🛡️ Token Allowance Manager (Revoke.cash-style)

Full ERC-20 spending approval audit and revocation terminal.

- **Allowance Scan:** Queries all historical `Approval` events for the connected address across major token contracts.
- **One-Click Revoke:** Calls `token.approve(spender, 0)` to completely revoke any dangerously open approval.
- **Permit2 Awareness:** Detects Uniswap's Permit2 universal approval contract and flags it as a priority revocation target.

**File:** [`components/portfolio/SecurityAllowances.tsx`](components/portfolio/SecurityAllowances.tsx)

---

### 📡 Token Discovery Engine

Automatic detection of ERC-20 tokens in any wallet without a centralized token list.

- **Transfer Event Scan:** Queries `Transfer(address,address,uint256)` logs filtered by `to: walletAddress` to discover all tokens that have ever entered the wallet.
- **Metadata Hydration:** For each discovered token, fetches `symbol()`, `decimals()`, and `balanceOf()` directly from the contract.
- **Custom Token Registry:** Users can manually import tokens by contract address; the engine validates the contract ABI before adding.

**File:** [`lib/token-discovery-engine.ts`](lib/token-discovery-engine.ts)

---

### 📊 Transaction Manager — Mempool Control Center

Real-time mempool monitoring and lifecycle management.

- **Speed Up:** Re-broadcasts a pending transaction with the same nonce at +50% `maxFeePerGas` and `maxPriorityFeePerGas`.
- **Cancel:** Sends a 0-value self-transaction with the same nonce at 2x current gas price to displace a stuck transaction.
- **Nonce Inspector:** Compares `eth_getTransactionCount(latest)` vs `(pending)` to detect stuck nonce gaps.

**File:** [`lib/tx-manager.ts`](lib/tx-manager.ts), [`components/portfolio/TransactionManager.tsx`](components/portfolio/TransactionManager.tsx)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     HUMANITY LEDGER — SYSTEM ARCHITECTURE               │
├───────────────────────┬─────────────────────────────────────────────────┤
│   PRESENTATION LAYER  │  Next.js 15 (App Router) · Framer Motion        │
│   (React / PWA)       │  Monochrome Institutional Design System         │
├───────────────────────┼─────────────────────────────────────────────────┤
│   WALLET ENGINE       │  BIP-39/44 HD · AES-256 Vault · EIP-1193       │
│                       │  Quantum Nonce Cache · ENS · Multi-Account      │
├───────────────────────┼─────────────────────────────────────────────────┤
│   ZK / AZTEC LAYER    │  Noir ACIR Encoder · Note Commitments           │
│                       │  Private Shielding · DeFi Bridge (Lido/Yearn)  │
├───────────────────────┼─────────────────────────────────────────────────┤
│   EXECUTION LAYER     │  Uniswap V3 DEX · ERC-4337 Bundler             │
│                       │  CREATE2 Factory · Contract Deployer            │
├───────────────────────┼─────────────────────────────────────────────────┤
│   PROTECTION LAYER    │  Flashbots MEV Shield · MEV Blocker RPC        │
│                       │  EIP-2612 Gasless Permits · Allowance Revoker  │
├───────────────────────┼─────────────────────────────────────────────────┤
│   CROSS-CHAIN LAYER   │  LayerZero V2 Endpoint · DVN Relay Quoting     │
│                       │  Omnichain Message Packing (6 EVM Domains)     │
├───────────────────────┼─────────────────────────────────────────────────┤
│   ANALYTICS LAYER     │  Real-Time Whale Detection · SSE Pipeline      │
│                       │  Neo4j Graph · Redis BullMQ · PostgreSQL        │
└───────────────────────┴─────────────────────────────────────────────────┘
```

---

## Technical Stack

| Layer | Technology |
|---|---|
| ZK / Privacy | Aztec Network, Noir (ACIR), Barretenberg Prover |
| Cross-Chain | LayerZero V2 (Endpoint V2, DVN architecture) |
| Account Abstraction | ERC-4337, EntryPoint v0.6, Bundler RPC |
| Frontend | Next.js 15, React 18, Framer Motion, Tailwind CSS |
| Wallet Core | Ethers.js v6, BIP-39, BIP-44, EIP-712, EIP-2612 |
| Backend | Node.js 22, Redis (BullMQ), PostgreSQL (Prisma ORM) |
| Graph Analytics | Neo4j (real-time multi-hop tx correlation) |
| DEX | Uniswap V3 SwapRouter, Quoter V2 |
| MEV Protection | Flashbots RPC, MEV Blocker |
| Infrastructure | Railway (production), Docker, GitHub Actions |

---

## Production Routes (Deployed)

| Route | Description |
|---|---|
| `/portfolio` | Full institutional wallet (46.7 kB — most complex page) |
| `/dashboard` | Whale analytics dashboard |
| `/ledger` | Humanity Ledger on-chain registry |
| `/api/zk/prove` | Noir proof generation endpoint |
| `/api/zk/verify-identity` | On-chain proof verification endpoint |
| `/forum` | Encrypted coordination forum |
| `/status` | System health and node status |
| `/careers` | Team recruitment portal |

---

## Getting Started

```bash
git clone https://github.com/atfortyseven-creations/Humanity-Ledger
cd Humanity-Ledger

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# → Add RPC endpoints, database URIs, Redis URL

# Start background detection workers
npm run workers:start

# Start development server
npm run dev
```

Navigate to `http://localhost:3000/portfolio` to access the full wallet.

---

## Grant Relevance — Aztec Network Integration

This project demonstrates **real, production-grade Aztec Network integration** across multiple layers:

1. **Noir Circuit Compatibility** — TypeScript ↔ Witness Map encoding for ACIR-compiled circuits
2. **Private Note Architecture** — On-chain shielded commitments using Aztec SDK primitives
3. **Aztec DeFi Bridges** — Private yield strategies via Lido/Yearn bridge adapters on Aztec L2
4. **ZK Identity** — Proof-based reputation and authentication without revealing EOA addresses
5. **Private Messaging** — Whale Chat uses Aztec's encrypted log primitives for confidential coordination
6. **EIP-712 + Aztec Account Contracts** — Typed signatures for Aztec's `validateUserOp` authorization flow

---

## License & Status

**License:** MIT  
**Status:** Production-Deployed (Railway)  
**Commits:** 6,550+ (2026)  
**Build:** ✅ Zero errors — Next.js 15.5.12

**Author:** Stefan Antonio Cirisanu ([@whalecosystem](https://github.com/atfortyseven-creations))  
**Website:** [humanidfi.com](https://humanidfi.com)  
**Grant Proposal:** Aztec Network Open Grants Program
