export const docContent: Record<string, { title: string; category: string; content: string }> = {
  "overview": {
    title: "Getting Started",
    category: "Getting Started",
    content: "# Getting Started\n\nWelcome to the Humanity Ledger platform. This documentation provides a comprehensive guide to integrating with our systems, exploring the zero-knowledge execution environment, and understanding the core mechanics of our analytics engine.\n\nThe Humanity Ledger is designed for seamless integration and maximum privacy. Start by initializing the local environment and configuring your wallet connections. Our architecture relies strictly on client-side execution for sensitive data handling, ensuring that your privacy is preserved at all times.\n\n## Prerequisites\n\n- Node.js (version 20 or higher)\n- A modern web browser with WebGL support\n- A compatible cryptocurrency wallet (MetaMask, WalletConnect, etc.)\n\n## Installation\n\nRun the following commands to bootstrap your local environment:\n\n```bash\nnpm install\nnpm run build\nnpm run start\n```\n\nThese steps will compile the necessary cryptographic circuits and initialize the web application."
  },
  "quickstart": {
    title: "API Reference",
    category: "API Docs",
    content: "# API Reference\n\nOur API provides RESTful endpoints and high-speed WebSocket channels for real-time data consumption. Authentication is required for all endpoints, leveraging cryptographic signatures rather than traditional API keys.\n\n## REST API\n\nBase URL: `https://api.humanidfi.com/v1`\n\n### Authentication\n\nAll requests must include an `Authorization` header containing an EIP-191 signed message payload. The server validates the signature to determine identity and permissions.\n\n### Endpoints\n\n#### `GET /network/status`\n\nReturns the current health and synchronization status of the network.\n\n#### `POST /analytics/query`\n\nSubmit a localized query for historical on-chain events. Payload must specify target blocks and filtering parameters.\n\n## WebSocket Streams\n\nConnect to `wss://api.humanidfi.com/stream` for real-time market data.\n\nEvents emitted:\n\n- `block_processed`: Fired when a new block is successfully analyzed.\n- `transfer_alert`: Fired when a transaction exceeds the predefined volume threshold."
  },
  "core-concepts": {
    title: "Noir Circuit Guides",
    category: "API Docs",
    content: "# Noir Circuit Guides\n\nZero-knowledge proofs form the foundation of our privacy model. We utilize Noir to construct and compile our circuits. \n\n## Writing Circuits\n\nCircuits define the logical constraints required for a valid proof. A basic private transfer circuit ensures that the inputs and outputs sum correctly, without revealing the amounts to the network.\n\n```rust\nfn main(x: Field, y: pub Field) {\n    assert(x != y);\n}\n```\n\n## Proving and Verifying\n\nThe local client handles proof generation using the Barretenberg backend. Verifications are executed by the network sequencers to ensure mathematical soundness before state transitions are finalized."
  },
  "whale-code": {
    title: "Compliance SDK",
    category: "API Docs",
    content: "# Compliance SDK\n\nThe Compliance SDK allows developers and institutions to generate selective disclosure proofs for regulatory reporting without compromising underlying system privacy.\n\n## Features\n\n- **Viewing Key Generation:** Create scoped access keys that reveal transaction history exclusively to authorized auditors.\n- **Range Proofs:** Cryptographically prove that a balance exceeds a specific threshold without revealing the exact amount.\n- **Verifiable Credentials:** Issue and verify W3C-compliant credentials that map on-chain identity to off-chain compliance assertions.\n\n## Usage\n\n```typescript\nimport { ComplianceProvider } from '@humanity-ledger/sdk';\n\nconst provider = new ComplianceProvider(wallet);\nconst proof = await provider.generateRangeProof(targetAsset, minThreshold);\n```"
  },
  "platform/architecture": {
    title: "Architecture Overview",
    category: "API Docs",
    content: "# Architecture Overview\n\nThe Humanity Ledger architecture is decoupled into distinct execution layers to maximize security, privacy, and scalability.\n\n## Data Ingestion\n\nRedundant RPC nodes subscribe to raw blockchain streams. Transactions and memory pool events are captured in real-time.\n\n## Analytics Engine\n\nA local processing node parses the raw data stream, applying advanced clustering algorithms and database operations to construct a meaningful view of the network's capital flows.\n\n## Client Layer\n\nThe Next.js application runs locally in your browser. It communicates with the backend via encrypted WebSocket tunnels, ensuring that your queries and analytical focuses remain strictly confidential."
  },
  "platform/auth": {
    title: "Security Audits",
    category: "API Docs",
    content: "# Security Audits\n\nOur system undergoes rigorous and continuous security evaluations by independent cryptographic researchers and auditing firms.\n\n## Formal Verification\n\nThe zero-knowledge circuits and smart contracts have been formally verified to eliminate classes of vulnerabilities related to underflows, overflows, and logic constraints.\n\n## Penetration Testing\n\nRegular penetration tests are conducted against our infrastructure to ensure resilience against DDoS attacks, injection vectors, and session hijacking attempts.\n\n## Bug Bounty\n\nWe operate a public bug bounty program. Researchers are encouraged to review our open-source repositories and responsibly disclose any identified issues."
  },
  "platform/neo4j": {
    title: "Privacy Policy",
    category: "Privacy Policy",
    content: "# Privacy Policy\n\nYour privacy is fundamentally guaranteed by mathematics, not by policy.\n\n## Zero-Knowledge Principle\n\nWe do not collect, transmit, or store your private keys, transaction histories, or behavioral analytics. All sensitive data is processed locally on your device.\n\n## Data Collection\n\nThe only information we store is the mathematical proof of your interactions with our network, which cannot be reverse-engineered to reveal your identity or capital.\n\n## Third-Party Services\n\nWe do not employ third-party analytics trackers or data brokers. The platform is entirely self-contained."
  },
  "platform/node-deployment": {
    title: "About Us",
    category: "About Us",
    content: "# About Us\n\nHumanity Ledger is built by a team of cryptographic researchers and systems engineers dedicated to creating a verifiably private financial ecosystem.\n\nOur mission is to level the playing field between institutional and individual participants by providing equal access to on-chain analytics, without sacrificing privacy or sovereignty.\n\n## Core Team\n\nWe are a distributed group of engineers contributing to open-source protocols. Our work focuses on the intersection of zero-knowledge proofs, distributed systems, and real-time data processing."
  }
};