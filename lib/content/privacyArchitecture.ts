export type PrivacyArchitectureSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  diagram?: { chart: string; caption: string };
  callout?: { title: string; body: string; href?: string; hrefLabel?: string };
};

export const PRIVACY_ARCHITECTURE_SECTIONS: PrivacyArchitectureSection[] = [
  // ===== 1. OVERVIEW =====
  {
    id: 'overview',
    title: 'System Overview: Aztec Zero-Knowledge Architecture',
    paragraphs: [
      'Humanity Ledger operates at the absolute vanguard of institutional decentralized finance. By unifying high-frequency on-chain telemetry with absolute cryptographic privacy via Aztec Layer 2 and Noir ZK circuits, the system orchestrates a frictionless execution environment for capital flows, entirely untethered from centralized SaaS intermediaries.',
      'This documentation maps the exhaustive thermodynamic flow of data, value, the Platform Token, and identity across our entire infrastructure. Every vector is secured, every state transition is proven, and all client telemetry is strictly localized on the user device.'
    ],
    bullets: [
      'Zero-Knowledge Proofs (zk-SNARKs) isolate user identity from capital vectors using Barretenberg UltraPlonk.',
      'Institutional execution vectors (Swap, Bridge, Ingress) execute directly on immutable smart contracts via Aztec L1 to L2 messaging portals.',
      'Decentralized communication via XMTP guarantees absolute end-to-end encryption.',
      'No passwords. No email. Your wallet address is your sovereign identity anchored by ECDSA signatures.',
      'Sessions are short-lived JWTs in HTTP-only cookies — JavaScript cannot read them.'
    ],
    diagram: {
      caption: 'Full System Macro Overview',
      chart: `flowchart LR
  User["End User (HSM Secured)"]
  
  subgraph Frontend ["Client Terminal (Browser/App)"]
    Client["Next.js React Application"]
    PXE["Aztec Private Execution Environment"]
    Client <--> PXE
  end
  
  subgraph CoreServices ["Core Services"]
    Auth["HMAC-SHA256 Auth Layer"]
    TokenSystem["Platform Token Escrow"]
    Portfolio["Shielded Portfolio Engine"]
    Analytics["L2 Telemetry Dashboard"]
    Chat["XMTP v5 Network"]
  end
  
  subgraph Backend ["Backend & Sequencers"]
    API["Humanity Ledger Gateway"]
    Workers["Whale ZK-Rollup Workers"]
  end
  
  subgraph Ledgers ["Immutable Ledgers"]
    Ethereum["Ethereum L1 (State Root Anchor)"]
    Aztec["Aztec L2 (Shielded Pool)"]
  end

  User --> Client
  Client --> Auth
  Client --> TokenSystem
  Client --> Portfolio
  Client --> Analytics
  Client --> Chat

  Auth --> API
  TokenSystem --> Aztec
  Portfolio --> Aztec
  Analytics --> Workers
  Chat --> API

  API --> Workers
  Aztec -->|L1ToL2Messages| Ethereum
  Ethereum -->|Rollup Verification| Aztec

  style Client fill:#000000,color:#ffffff,stroke:#000000
  style PXE fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style Aztec fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d
  style Ethereum fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style Auth fill:#f5f5ff,stroke:#333333
  style Portfolio fill:#f5fff5,stroke:#333333
  style Analytics fill:#fff5f0,stroke:#333333
  style Chat fill:#f0f5ff,stroke:#333333
  style TokenSystem fill:#fffbe6,stroke:#b38f00`
    },
    callout: {
      title: 'Legal Privacy Policy',
      body: 'For data retention, cookies, and regulatory wording, see the formal Privacy Policy.',
      href: '/legal/privacy',
      hrefLabel: 'Read the Legal Privacy Policy'
    }
  },

  // ===== 2. ZK SYBIL RESISTANCE =====
  {
    id: 'zk-authentication-sybil',
    title: 'Zero-Knowledge Sybil Resistance',
    paragraphs: [
      'The network enforces a localized biometric liveness verification standard using Noir ZK circuits. When a user authenticates, their wallet produces a zk-SNARK proof of personhood. The root address is completely obfuscated through a cryptographic nullifier hash.',
      'This guarantees the central validator can confirm authenticity without ever learning the true public key of the participant. Proof generation happens entirely in-browser via Barretenberg WebAssembly, utilizing the BN254 elliptic curve.'
    ],
    diagram: {
      caption: 'Zero-Knowledge Authentication Sequence via Barretenberg',
      chart: `sequenceDiagram
  participant User as End User (HSM)
  participant Wallet as Client Wallet
  participant PXE as Aztec PXE / Barretenberg
  participant Verifier as Network Validator
  User->>Wallet: Request Shielded Access
  Wallet->>User: Request EIP-712 Signature
  User->>Wallet: ECDSA Signed Payload Returned
  Wallet->>PXE: Compile Noir Circuit with Private Witness
  note over PXE: Private Key Scalar never leaves memory
  PXE->>Wallet: Emit zk-SNARK + Nullifier Hash
  Wallet->>Verifier: Submit Proof Bundle
  Verifier-->>Verifier: Pairing Curve Verification (BN254)
  Verifier-->>Wallet: Accept or Reject Proof
  Wallet-->>User: Grant Encrypted Shielded Session`
    }
  },

  // ===== 3. AZTEC PRIVATE STATE =====
  {
    id: 'aztec-private',
    title: 'Aztec Private State and ZK Proof Architecture',
    paragraphs: [
      'Public Ethereum shows every transfer to everyone. Aztec adds a private execution layer: balances and transfers live as encrypted UTXOs (Notes) in a shielded pool. The L1 chain only sees that a valid zero-knowledge proof was submitted by the sequencer.',
      'Humanity Ledger uses Noir to describe circuit rules (token transfers, membership checks) and Barretenberg to generate proofs entirely in your browser. The Aztec rollup verifies proofs in batches and posts a compact state commitment to Ethereum L1 for security.'
    ],
    diagram: {
      caption: 'Client-Side Proving to Aztec Rollup and Ethereum L1',
      chart: `flowchart LR
  subgraph ClientBrowser ["Client Device"]
    WIT["Private Inputs (Keys, Balances)"]
    NOIR["Noir Circuit (ACIR)"]
    BB["Barretenberg WASM Prover"]
    WIT --> NOIR --> BB
  end
  
  subgraph AztecRollup ["Aztec L2 Sequencer"]
    VER["Batch Verifier Node"]
    NOTES["Encrypted Note Tree (UTXOs)"]
    NULL["Nullifier Tree (Spend Tracking)"]
    VER --> NOTES
    VER --> NULL
  end
  
  subgraph L1 ["Ethereum Mainnet L1"]
    ROOT["Rollup State Root"]
    ROOT_VERIFY["L1 Verifier Smart Contract"]
    ROOT --> ROOT_VERIFY
  end
  
  BB -->|Submit zk-SNARK| VER
  NOTES -->|Anchor Commitment| ROOT
  NULL -->|Anchor Commitment| ROOT

  style ClientBrowser fill:#f8fff8,stroke:#006600
  style AztecRollup fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d
  style L1 fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style BB fill:#ccffcc,stroke:#006600
  style VER fill:#5533aa,color:#ffffff,stroke:#5533aa`
    },
    bullets: [
      'Private notes use Pedersen commitments and Grumpkin-derived nullifiers so each note is spent exactly once.',
      'Selective disclosure lets you prove a fact (e.g. KYC eligibility) without exporting your full history.',
      'Shielding moves assets into the private pool via L1ToL2 message boxes.'
    ],
    callout: {
      title: 'Technical Depth',
      body: 'For circuit design, tokenomics, and security audits, read the Whitepaper.',
      href: '/whitepaper',
      hrefLabel: 'Read the Whitepaper'
    }
  },

  // ===== 4. DATA BOUNDARIES =====
  {
    id: 'data-boundaries',
    title: 'Data Boundary Architecture',
    paragraphs: [
      'We designed the product so all sensitive material defaults to remaining on your device. Wallet private keys and seed phrases never leave your wallet application or local vault unlock flow. HSMs are utilized where available.',
      'Our servers see your wallet address (for the user account row), tier metadata, forum content you post, API usage telemetry, and short-lived QR bridge tokens (expiring in Redis within 60 seconds). Session JWTs prove identity but carry no copy of your on-chain portfolio.'
    ],
    diagram: {
      caption: 'Comprehensive Data Boundary and Storage Classification',
      chart: `flowchart LR
  subgraph OnDevice ["Stored Strictly On Device (HSM/IndexedDB)"]
    KEYS["ECDSA/BabyJubJub Private Keys"]
    XMTP["AES-256-GCM Chat Ciphertexts"]
    WIT["ZK Witness Inputs (Note Secrets)"]
  end
  
  subgraph OurServers ["Humanity Ledger API Servers"]
    USER["User Tier Data & Telemetry"]
    SESS["HMAC-SHA256 Session JWTs"]
  end
  
  subgraph NeverStored ["Cryptographically Inaccessible to Us"]
    NK1["BIP39 Seed Phrases"]
    NK2["Decrypted Communications"]
    NK3["Raw Portfolio Balances"]
  end

  OnDevice ~~~ OurServers ~~~ NeverStored

  style NeverStored fill:#fff8f8,stroke:#cc0000,stroke-dasharray:4 4
  style OnDevice fill:#f8fff8,stroke:#006600
  style OurServers fill:#f8f8ff,stroke:#000066
  style KEYS fill:#ffe0e0,stroke:#cc0000
  style NK1 fill:#ffcccc,stroke:#cc0000
  style NK2 fill:#ffcccc,stroke:#cc0000
  style NK3 fill:#ffcccc,stroke:#cc0000`
    }
  },

  // ===== 5. GLOBAL SECURITY ARCHITECTURE =====
  {
    id: 'global-security-architecture',
    title: 'Global Security and Circuit Breaker Architecture',
    paragraphs: [
      'Security is the absolute zero-point of the architecture. The system integrates multi-layered defense: edge-level WAF and rate limiting, middleware JWT verification, smart contract invariant monitoring, and automated circuit breakers that freeze all capital operations upon anomaly detection.',
      'If extreme market volatility or a smart contract invariant violation is detected, automated circuit breakers halt off-chain indexing, freeze fiat-ingress portals, and emit emergency alerts to the operations team.'
    ],
    diagram: {
      caption: 'Threat Mitigation, Rate Limiting and Circuit Breaker Topology',
      chart: `flowchart LR
  subgraph Edge ["Perimeter"]
    DDOS["DDoS Cloudflare Defense"]
    WAF["Web Application Firewall"]
    RATE["Edge Rate Limiter (Token Bucket)"]
    DDOS --> WAF --> RATE
  end
  
  subgraph Backend ["Verification"]
    MW["Ed25519 JWT Middleware"]
    INV["Smart Contract Invariant Monitor"]
    ANOMALY["ZK-Rollup Anomaly Engine"]
    MW --> INV --> ANOMALY
  end
  
  subgraph Defense ["Active Defense"]
    CB["L1 Circuit Breaker Contract"]
    LOCK["Freeze Capital Relays"]
    OPS["Ops Alert (PagerDuty)"]
    CB --> LOCK & OPS
  end
  
  RATE --> MW
  ANOMALY -->|Invariant Violation Trigger| CB

  style CB fill:#cc0000,color:#ffffff,stroke:#cc0000
  style LOCK fill:#ff4444,color:#ffffff,stroke:#ff4444
  style Edge fill:#f0f0ff,stroke:#0000cc
  style Backend fill:#fff5f5,stroke:#cc3333
  style Defense fill:#fff0f0,stroke:#cc0000
  style OPS fill:#ff6600,color:#ffffff,stroke:#ff6600`
    }
  }
];

export const PRIVACY_TOC = PRIVACY_ARCHITECTURE_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
}));
