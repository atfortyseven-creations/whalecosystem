# Whale Ecosystem powered by Humanity Ledger
**Privacy-First Analytics & Encrypted Communications built natively on Aztec Network**

The Whale Ecosystem is a comprehensive suite of on-chain analytics, real-time capital detection, and encrypted social coordination tools. By leveraging the Aztec Network's zero-knowledge rollup and Noir circuits, we have engineered a system where institutional-grade data ingestion meets absolute programmable privacy. 

This repository serves as our official submission for the Aztec Network Grant.

## Architecture & Aztec Integration

Our architecture utilizes Aztec's L2 to fundamentally solve the information asymmetry and privacy leaks inherent in public EVM chains. 

- **Noir Circuits for Private State:** We utilize Noir to compile zero-knowledge circuits that manage the Humanity Ledger. This allows users to prove reputation, authenticate actions, and interact with the platform without revealing their underlying Ethereum addresses or historical transaction data.
- **Custom Aztec Account Contracts:** Implementing advanced account abstraction on Aztec, enabling secure features like multi-device synchronization and session hydration without relying on centralized identity providers.
- **Encrypted Logs & Messaging (Whale Chat):** Leveraging Aztec's private state primitives to facilitate peer-to-peer communications where message metadata and content remain strictly confidential and unobservable by network sequencers.

## Core Components

### 1. Humanity Ledger Scanner
A high-frequency analytics engine that detects coordinated capital movements across major EVM networks.
- **Local-First Processing:** Ingests raw mempool streams and block data locally on the user's hardware. No query patterns, watched addresses, or alert thresholds are ever exposed to a cloud provider.
- **Advanced EVM Heuristics:** Utilizes a custom algorithmic model analyzing gas expenditure and EIP-1153 (Transient Storage) opcode density to detect institutional operations natively on-chain.
- **Sub-Second Latency:** Delivers real-time alerts via a highly optimized Server-Sent Events (SSE) pipeline backed by Redis BLPOP.

### 2. Whale Chat & Private Forums
A decentralized coordination layer for verified network participants.
- Authenticated strictly via cryptographically proven wallet ownership (EIP-191 signatures) and Aztec private state primitives.
- Sybil-resistant design utilizing verifiable credentials to ensure 1-to-1 human participation without doxing personal data.

### 3. Non-Custodial Dashboard
A Next.js 15 (App Router) based Progressive Web App (PWA).
- Employs strict React hydration safety and atomic mobile redirection to handle complex WalletConnect v2 state transitions seamlessly.
- Hyper-optimized UI built with Tailwind CSS and Framer Motion for a premium institutional experience.

## Technical Stack
- **Zero-Knowledge Layer:** Aztec Network, Noir (Rust-based DSL)
- **Frontend Core:** Next.js 15, React 18, Ethers.js v6
- **Backend Core:** Node.js 22, Redis (BullMQ), PostgreSQL (Prisma ORM)
- **Analytics Graph:** Neo4j (for real-time multi-hop transaction correlation)
- **Infrastructure:** Docker multi-stage builds, Kubernetes, GitHub Actions

## Getting Started (For Reviewers)

To evaluate the repository locally:

```bash
git clone https://github.com/atfortyseven-creations/Humanity-Ledger
cd Humanity-Ledger

# Install dependencies
npm install

# Start the background detection workers (Redis required)
npm run workers:start

# Start the Next.js development server
npm run dev
```
Navigate to `http://localhost:3000`. 

*Note: Required environment variables (RPC endpoints, database URIs) must be configured in `.env.local` prior to execution. Please refer to `DEPLOYMENT.md` for comprehensive local and production setup instructions.*

## License & Project Status

This project is open-source and licensed under the **MIT License** (see `LICENSE`). 
We are committed to building transparent, sustainable infrastructure for the Web3 ecosystem, reflected by over 6,550 active commits and contributions throughout 2026.

**Author:** Stefan Antonio Cirisanu (@whalecosystem)  
**Website:** [humanidfi.com](https://humanidfi.com)  
**Grant Proposal:** [Pending publication on Aztec Forum]
