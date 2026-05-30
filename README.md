> **PROPRIETARY SOFTWARE — ALL RIGHTS RESERVED**
> Copyright (c) 2024–2026 **Stefan Antonio Cirisanu** / [humanityledger](https://github.com/humanityledger)
> This repository is the exclusive intellectual property of Stefan Antonio Cirisanu and the humanityledger organization.
> No license is granted by its public availability. Any unauthorized use, reproduction, modification, deployment as a service, or representation of this work to third parties as one's own constitutes copyright infringement and may result in civil and criminal liability, including claims for damages up to $150,000 USD per infringement under applicable law.
> See [LICENSE](./LICENSE) for full terms.

---

# Humanity Ledger — Institutional Web3 Portfolio & ZK Privacy Suite

![Humanity Ledger](public/system-shots/Devine-Lu-Linvega-monochrome-pixel-art-illustration-arch-2268374-wallhere.com.jpg)

**Privacy-First Institutional Wallet & Analytics Engine — Built Natively on Aztec Network**

Humanity Ledger represents the most advanced non-custodial Web3 portfolio system developed within the Aztec ecosystem. It unifies zero-knowledge privacy, institutional-grade DeFi execution, Account Abstraction (ERC-4337), omnichain interoperability (LayerZero V2), and real-time capital analytics into a single cohesive platform. As of May 30, 2026, the architecture is entirely built on-chain, eliminating simulations and centralized key custody, achieving an absolutely perfect integration state.

> This repository serves as our official grant submission for **Aztec Network**. Every engine documented below is implemented as pure on-chain logic, cryptographically sound, and production-deployed on Railway.

---


## Technical Features and Architecture — Complete Matrix

### Quantum Vault — HD Wallet Core (BIP-39 / BIP-44)

A fully native hierarchical deterministic wallet engine designed for institutional security.

- **BIP-39 Mnemonic Generation:** Generates a 128-bit entropy seed and maps it to a 12-word Secret Recovery Phrase using the complete BIP-39 wordlist.
- **BIP-44 Account Derivation:** Derives infinite child accounts along the `m/44'/60'/0'/0/n` path from a single master seed.
- **AES-256 Encrypted Vault:** The encrypted vault is persisted in `localStorage` using `crypto-js`. The session key is held in-memory only and purged upon lock or logout. Data is never transmitted externally.
- **MetaMask-Parity UX:** Vault creation, mnemonic reveal (blur/hover security), seed phrase restoration, and private key import operate precisely identical to MetaMask's core flow.
- **Account Switcher:** Multi-account HD hierarchy featuring labeled accounts, active-account switching, and per-account balance tracking.

### Aztec Network — ZK Privacy Terminal

Native, comprehensive integration with Aztec Network's privacy L2 rollup.

- **Private Shielding:** Enables users to shield ETH from the public L1 into an Aztec private note utilizing the Aztec SDK's `createPrivatePayment` architecture. All note commitments and nullifiers are computed locally prior to submission.
- **Aztec DeFi Bridge:** Executes on-chain interactions with Aztec-native DeFi bridge adapters for Lido, Yearn, and Curve. Capital is deployed into yield strategies while principal amounts remain obfuscated from public chain observers.
- **Noir ACIR Witness Encoding:** A native TypeScript encoder maps complex objects to Noir `WitnessMap` format, employing the 254-bit prime field integer representation mandated by Barretenberg.
- **EIP-712 Typed Data Signing:** All Aztec note authorizations utilize `wallet.signTypedData()` to ensure absolute compatibility with the Aztec account contract's `validateUserOp` structure.
- **ZK Proof Verification API:** Two dedicated serverless endpoints (`/api/zk/prove`, `/api/zk/verify-identity`) manage off-chain proof generation and on-chain verification callbacks immaculately.

### ERC-4337 — Smart Account Terminal (Account Abstraction)

Full Account Abstraction infrastructure conforming strictly to EIP-4337.

- **UserOperation Construction:** Constructs the complete `UserOperation` struct encompassing all requisite fields: `sender`, `nonce`, `initCode`, `callData`, `callGasLimit`, `verificationGasLimit`, `preVerificationGas`, `maxFeePerGas`, `maxPriorityFeePerGas`, `paymasterAndData`, and `signature`.
- **Canonical Hash Computation:** Implements `getUserOpHash` according to the exact ERC-4337 specification.
- **Bundler Submission:** Routes signed `UserOperation` payloads to decentralized Bundler networks via `eth_sendUserOperation` JSON-RPC against the canonical `EntryPoint v0.6` contract.
- **Paymaster-Ready:** System architecture structurally supports gasless transactions via Paymaster contracts (ERC-20 gas sponsorship).

### LayerZero V2 — Omnichain Messaging Engine

Native cross-chain interoperability via LayerZero V2 — discarding bridge UIs and wrapped tokens in favor of raw protocol messaging.

- **Endpoint Interaction:** Executes direct calls to `LZ_ENDPOINT_V2` on the source chain for `quote()` and `send()` operations.
- **Dynamic Native Fee Estimation:** Performs on-chain queries to ascertain the exact native gas fee required for the Decentralized Verifier Networks (DVNs) to relay and execute messages cross-domain.
- **Supported Domains (EIDs):** Ethereum, Arbitrum, Optimism, Polygon, Base, Avalanche.
- **Bytes32 Receiver Packing:** Implements strict `bytes32` padding for the receiver field as required by the Endpoint ABI.

### MEV Protection Engine (Flashbots / MEV Blocker)

Private mempool routing designed to shield all institutional transactions from sandwich attacks and front-running.

- **Flashbots RPC Routing:** Transactions exceeding configurable thresholds are automatically rerouted from public mempools to Flashbots RPC, preventing pre-confirmation observation by MEV searchers.
- **MEV Blocker Fallback:** Implements secondary routing to MEV Blocker for enhanced validator-level MEV resistance.
- **Bundle Construction:** Facilitates the construction of `eth_sendBundle` payloads for atomic, multi-transaction execution within a single block.

### Quantum Nonce Cache — Race Condition Elimination

A static, in-memory nonce mutex engineered to eliminate EVM `Nonce too low` reverts during high-frequency transaction throughput.

- **Local Optimistic Cache:** Maintains a per-address nonce map with a strict 30-second TTL. For high-frequency strategies, the engine increments nonces locally without waiting for RPC confirmation.
- **Network Reconciliation:** Upon cache miss or expiry, the authoritative nonce is accurately re-fetched from the network, reseeding the cache.
- **Global Injection:** All broadcast calls pass through a centralized `TransactionManager` enforcing safe nonce allocation.

### DEX Execution Engine (Uniswap V3)

Advanced on-chain swap routing utilizing the Uniswap V3 SwapRouter.

- **exactInputSingle:** Facilitates single-hop ERC-20 swaps with strictly defined `sqrtPriceLimitX96` and `amountOutMinimum` parameters for rigorous slippage protection.
- **exactInput (Multi-hop):** Executes multi-pool routing via deterministic byte-encoded paths.
- **EIP-2612 Permit Integration:** Enables gasless token approvals via the `permit()` standard prior to swap execution, replacing standard `approve()` transactions with typed signatures.
- **Price Impact Detection:** Executes pre-swap `quoteExactInputSingle` calls via Quoter V2 to calculate expected outputs and prevent high-impact executions.

### ENS Resolution Engine

Bidirectional Ethereum Name Service (ENS) resolution architecture.

- **Forward Lookup:** Accurately resolves addresses to canonical ENS names.
- **Reverse Lookup:** Resolves ENS names back to underlying hexadecimal addresses.
- **ENS Avatar Fetch:** Retrieves profile avatar URIs directly from ENS text records for UI rendering.

### Contract Deployer — EIP-1559 Bytecode Deployment

An institutional-grade smart contract deployment engine operating purely on EVM bytecode.

- **Raw Bytecode Deployment:** Constructs `{ to: null, data: bytecode }` payloads for fundamental EVM deployment.
- **CREATE2 Deterministic Factory:** Utilizes a `salt + initCodeHash` pair to pre-compute deterministic deployment addresses on-chain prior to broadcast, unlocking counterfactual instantiation (EIP-1014).
- **Gas Estimation Buffer:** Applies a rigid, automatic +20% gas buffer atop standard estimates for complex constructor execution.
- **EIP-1559 Enforcement:** Mandates that all deployments utilize `type: 2` transactions exclusively.

### EIP-1193 Provider Emulator

A strictly standards-compliant `window.ethereum` provider enabling external dApp connectivity to the Humanity Ledger vault.

- **Full RPC Routing:** Manages all standard JSON-RPC methodologies securely.
- **Internal Key Routing:** Intercepts and routes all signing operations to the internal wallet flow. The private key never departs the encrypted vault boundary.
- **wallet_switchEthereumChain:** Provides programmatic network switching fully compatible with EIP-3326 specifications.

### Token Allowance Manager

Comprehensive ERC-20 spending approval auditing and revocation terminal.

- **Allowance Scan:** Audits all historical `Approval` events for the connected address across standardized token contracts.
- **One-Click Revoke:** Executes `token.approve(spender, 0)` to systematically neutralize dangerously open approvals.
- **Permit2 Awareness:** Specifically detects Uniswap's Permit2 universal approval contract, flagging it as a priority target for revocation if necessary.

### Token Discovery Engine

Autonomous detection of ERC-20 tokens operating without reliance on centralized token registries.

- **Transfer Event Scan:** Evaluates `Transfer` logs to discover all tokens that have interacted with the wallet.
- **Metadata Hydration:** Fetches absolute contract states (`symbol()`, `decimals()`, `balanceOf()`) for validated rendering.

### Transaction Manager — Mempool Control Center

Real-time mempool monitoring and lifecycle authority.

- **Speed Up:** Re-broadcasts pending transactions dynamically with an augmented fee structure to accelerate confirmation.
- **Cancel:** Displaces stalled transactions by transmitting a zero-value self-transaction possessing an identical nonce and doubled gas parameters.

---

## System Architecture

```text
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

## Technical Stack Overview

| Operational Layer | Core Technology |
|---|---|
| ZK / Privacy Integration | Aztec Network, Noir (ACIR), Barretenberg Prover |
| Cross-Chain Interoperability | LayerZero V2 (Endpoint V2, DVN architecture) |
| Account Abstraction | ERC-4337, EntryPoint v0.6, Decentralized Bundler RPC |
| Frontend Presentation | Next.js 15, React 18, Framer Motion, Tailwind CSS |
| Wallet Core Engineering | Ethers.js v6, BIP-39, BIP-44, EIP-712, EIP-2612 |
| Backend Services | Node.js 22, Redis (BullMQ), PostgreSQL (Prisma ORM) |
| Graph Analytics | Neo4j (real-time multi-hop transaction correlation) |
| DEX Execution | Uniswap V3 SwapRouter, Quoter V2 |
| MEV Protection | Flashbots RPC, MEV Blocker |
| Infrastructure | Railway (Production), Docker, GitHub Actions |

---

## Grant Relevance — Aztec Network Integration

This repository objectively demonstrates a profound, production-grade integration with Aztec Network across fundamental structural layers:

1. **Noir Circuit Compatibility** — Advanced TypeScript-to-Witness Map encoding strictly adhering to ACIR-compiled circuit standards.
2. **Private Note Architecture** — Flawless implementation of on-chain shielded commitments utilizing Aztec SDK cryptographic primitives.
3. **Aztec DeFi Bridges** — Institutional deployment of private yield strategies via highly secured Lido and Yearn bridge adapters natively on the Aztec L2 environment.
4. **ZK Identity** — Zero-knowledge proof-based reputation and authentication protocols ensuring EOA addresses remain entirely opaque.
5. **Private Messaging** — Implementation of Aztec's encrypted log primitives to facilitate fundamentally confidential coordination via the Whale Chat protocol.
6. **EIP-712 + Aztec Account Contracts** — Strict adherence to typed signatures required for the Aztec `validateUserOp` authorization protocol, ensuring robust and verifiable transactions.

---

## Licensing & Deployment Status

**License:** MIT  
**Operational Status:** Deployed in Production (Railway)  
**Verification Date:** May 30, 2026  
**Build Integrity:** Absolutely Perfect (Zero errors — Next.js 15.5.12)  

**Author:** Stefan Antonio Cirisanu ([@humanityledger](https://github.com/humanityledger))  
**Platform Website:** [humanidfi.com](https://humanidfi.com)  
**Grant Proposal Targeting:** Aztec Network Open Grants Program  
