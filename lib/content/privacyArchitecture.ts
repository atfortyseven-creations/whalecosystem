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
    title: 'System Overview: Quantum Architecture Blueprint',
    paragraphs: [
      'Humanity Ledger (Whale Alert Network) operates at the absolute vanguard of institutional decentralized finance. By unifying high-frequency on-chain telemetry with absolute cryptographic privacy via Aztec Layer 2 and Noir ZK circuits, the system orchestrates a frictionless execution environment for capital flows, entirely untethered from centralized SaaS intermediaries.',
      'This documentation maps the exhaustive thermodynamic flow of data, value, and identity across our entire infrastructure. Every vector is secured, every state transition is proven, and all client telemetry is strictly localized on the user device.'
    ],
    bullets: [
      'Zero-Knowledge Proofs (zk-SNARKs) isolate user identity from capital vectors.',
      'Institutional execution vectors (Swap, Bridge, Ingress) execute directly on immutable smart contracts via Ethers.js.',
      'Decentralized communication via XMTP guarantees absolute end-to-end encryption.',
      'No passwords. No email. Your wallet address is your sovereign identity.',
      'Sessions are short-lived JWTs in HTTP-only cookies — JavaScript cannot read them.'
    ],
    diagram: {
      caption: 'Full System Macro Overview',
      chart: `graph TD
  User(["End User"])
  Client["Next.js Client Terminal"]
  Auth["Auth Layer / JWTs"]
  Portfolio["Portfolio Execution Vectors"]
  Analytics["Analytics Dashboard"]
  Chat["Whale Chat / XMTP"]
  API["Humanity Ledger API"]
  OnChain["On-Chain Smart Contracts"]
  Workers["Whale Worker Nodes"]
  XMTPNet["XMTP Network"]
  Neo4j[("Neo4j Graph DB")]
  Redis[("Redis Cache")]
  Postgres[("Postgres DB")]
  Ethereum[("Ethereum L1")]
  Aztec[("Aztec L2 ZK Rollup")]
  User --> Client
  Client --> Auth
  Client --> Portfolio
  Client --> Analytics
  Client --> Chat
  Auth --> API
  Portfolio --> OnChain
  Analytics --> Workers
  Chat --> XMTPNet
  Workers --> Neo4j
  Workers --> Redis
  API --> Postgres
  OnChain --> Ethereum
  OnChain --> Aztec
  style Client fill:#000000,color:#ffffff,stroke:#000000
  style OnChain fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style Aztec fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d
  style Auth fill:#f5f5ff,stroke:#333333
  style Portfolio fill:#f5fff5,stroke:#333333
  style Analytics fill:#fff5f0,stroke:#333333
  style Chat fill:#f0f5ff,stroke:#333333`
    },
    callout: {
      title: 'Legal Privacy Policy',
      body: 'For data retention, cookies, and regulatory wording, see the formal Privacy Policy.',
      href: '/legal/privacy',
      hrefLabel: 'Read the Legal Privacy Policy'
    }
  },

  // ===== 2. INSTITUTIONAL ANALYTICS PIPELINE =====
  {
    id: 'institutional-analytics-pipeline',
    title: 'Institutional Real-Time Analytics Pipeline',
    paragraphs: [
      'The data ingestion engine operates in a failover-resistant topology. Unindexed raw block data is streamed via proprietary RPC node clusters directly into localized Whale Worker nodes. These evaluate thermodynamic Z-Scores and EIP-2929 gas metrics before pushing synthesized intelligence into a Neo4j graph and Redis streams.',
      'All analytical computation executes strictly within the server boundary. The Next.js client receives only encrypted, pre-processed alpha signals via WebSocket — never raw mempool data.'
    ],
    diagram: {
      caption: 'Thermodynamic Data Ingestion and Local Processing Pipeline',
      chart: `graph TD
  subgraph PublicEco ["Public Ecosystem"]
    RPC["RPC Node Clusters"]
    Mem["Mempool Streams"]
    RPC -->|"Raw Block Data"| Mem
  end
  subgraph VaultProcessing ["Localized Vault Processing"]
    WW["Whale Worker Node"]
    Neo["Neo4j Graph DB"]
    RedisDB["Redis / Upstash"]
    PG["Prisma / Postgres"]
    AE["Analytics Engine"]
    Mem --> WW
    WW -->|"Z-Score Analysis"| Neo
    WW -->|"Tx Vitals Stream"| RedisDB
    WW -->|"Persistent State"| PG
    Neo --> AE
    RedisDB --> AE
    PG --> AE
  end
  subgraph SecureDelivery ["Secure Client Delivery"]
    UI["Next.js Client Terminal"]
    AZ["Aztec Shielded Pool"]
    AE -->|"Encrypted WebSocket"| UI
    UI -.->|"ZK Circuit Delegation"| AZ
  end
  style WW fill:#ffffff,stroke:#000000,stroke-width:2px
  style UI fill:#000000,color:#ffffff,stroke:#000000
  style AZ fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d
  style AE fill:#f0f0ff,stroke:#333366
  style Neo fill:#e8f5e9,stroke:#2e7d32
  style RedisDB fill:#fff3e0,stroke:#e65100
  style PG fill:#e3f2fd,stroke:#1565c0`
    }
  },

  // ===== 3. PORTFOLIO EXECUTION VECTORS =====
  {
    id: 'portfolio-execution-vectors',
    title: 'Portfolio On-Chain Execution Vectors',
    paragraphs: [
      'The native portfolio interface rejects all iframe-based SaaS chokepoints. Instead, it uses direct Ethers.js integration to communicate with core decentralized protocols. Every execution — swap, bridge, or fiat ingress — is settled natively on the ledger.',
      'When a user authorizes a swap, the signature routes directly to Uniswap V2/V3 routers. Cross-chain bridge capital leverages LayerZero infrastructure for guaranteed finality. The fiat-to-crypto gateway opens an isolated popup to a compliant KYC provider without ever storing credentials.'
    ],
    diagram: {
      caption: 'Native Portfolio Component Architecture and Smart Contract Execution',
      chart: `flowchart TD
  subgraph UI ["Next.js Native Portfolio UI"]
    Store(["Zustand Wallet Store"])
    Buy["NativeBuyView"]
    Swap["NativeSwapView"]
    Bridge["NativeBridgeView"]
    Store --> Buy
    Store --> Swap
    Store --> Bridge
  end
  subgraph Protocols ["Decentralized Protocol Layer"]
    Moonpay(["Fiat On-Ramp Gateway"])
    UniV2(["Uniswap V2 Router"])
    UniV3(["Uniswap V3 Router"])
    LZ(["LayerZero Endpoints"])
  end
  subgraph Ledgers ["Immutable Ledgers"]
    ETH[("Ethereum Mainnet")]
    ARB[("Arbitrum Rollup")]
    POL[("Polygon PoS")]
    OPT[("Optimism Rollup")]
    BASE[("Base L2")]
  end
  Buy -.->|"Secure Popup Redirect"| Moonpay
  Swap -->|"ethers.Contract call"| UniV2
  Swap -->|"ethers.Contract call"| UniV3
  Bridge -->|"Cross-Chain Message"| LZ
  Moonpay -->|"Settlement"| ETH
  UniV2 -->|"ERC20 Transfer"| ETH
  UniV3 -->|"ERC20 Transfer"| ETH
  LZ -->|"Relayer"| ARB
  LZ -->|"Relayer"| POL
  LZ -->|"Relayer"| OPT
  LZ -->|"Relayer"| BASE
  style Store fill:#000000,color:#ffffff,stroke:#000000
  style UI fill:#f9f9f9,stroke:#000000
  style Protocols fill:#fff8f0,stroke:#996600
  style Ledgers fill:#f0f0ff,stroke:#2a1b4d`
    },
    bullets: [
      'Slippage tolerance is configurable per-swap at the component level.',
      'Bridge fees are estimated on-chain before signature request.',
      'No private key ever leaves the local wallet provider — Ethers.js operates exclusively on the signed payload.'
    ]
  },

  // ===== 4. ZERO-KNOWLEDGE SYBIL RESISTANCE =====
  {
    id: 'zk-authentication-sybil',
    title: 'Zero-Knowledge Sybil Resistance',
    paragraphs: [
      'The network enforces a localized biometric liveness verification standard using Noir ZK circuits. When a user authenticates, their wallet produces a zk-SNARK proof of personhood. The root address is completely obfuscated through a cryptographic nullifier hash.',
      'This guarantees the central validator can confirm authenticity without ever learning the true public key of the participant. Proof generation happens entirely in-browser via Barretenberg WebAssembly.'
    ],
    diagram: {
      caption: 'Zero-Knowledge Authentication and Sybil Resistance Sequence',
      chart: `sequenceDiagram
  participant User as End User
  participant Wallet as Client Wallet
  participant BB as Barretenberg Wasm
  participant Verifier as Network Validator
  User->>Wallet: Request Shielded Access
  Wallet->>User: Sign Challenge EIP-191
  User->>Wallet: Signed Message Returned
  Wallet->>BB: Compile Noir Circuit with Witness Inputs
  note over BB: Private Key Scalar + Nullifier Logic never leave the browser
  BB->>Wallet: Emit zk-SNARK + Public Nullifier Hash
  Wallet->>Verifier: Submit Proof Bundle
  Verifier-->>Verifier: Pairing Curve Verification
  Verifier-->>Wallet: Accept or Reject Proof
  Wallet-->>User: Grant Encrypted Shielded Session`
    }
  },

  // ===== 5. WALLET CONNECT + SESSION =====
  {
    id: 'wallet-connect',
    title: 'Identity and Wallet Session Matrix',
    paragraphs: [
      'Authentication supports maximum liquidity across all environments. Whether via Mobile PWA, Desktop Browser, or injected dApp browsers, the session state is meticulously preserved without compromising cryptographic integrity.',
      'Upon address verification, the server mints a pair of HTTP-only JWTs alongside a JavaScript-readable handshake cookie. This tripartite design ensures absolute resilience against XSS and iOS back-navigation re-login loops.',
      'The hook useSystemAccount resolves identity in priority order: local unlocked vault, sessionStorage restore, Wagmi connection, then the handshake cookie.'
    ],
    diagram: {
      caption: 'Wallet Connect and Tripartite Session Registration',
      chart: `flowchart TB
  subgraph mobile ["Mobile PWA or Browser"]
    M1["Open App"]
    M2["WalletConnect / AppKit"]
    M3["Wallet App Approves"]
    M4["Address Captured in Browser"]
    M1 --> M2
    M2 --> M3
    M3 --> M4
  end
  subgraph desktop ["Desktop Browser"]
    D1["Injected Extension MetaMask / Coinbase"]
    D2["Wagmi Resolves Address"]
    D1 --> D2
  end
  subgraph qr ["QR Desktop Bridge"]
    Q1["/connect QR Mode"]
    Q2["Phone Scans QR"]
    Q1 --> Q2
    Q2 --> D2
  end
  subgraph api ["Humanity Ledger Auth API"]
    V["POST /api/auth/system-verify"]
    JWT["Mint whale_session JWT — HTTP Only"]
    JWT2["Mint human_session JWT — HTTP Only"]
    HS["Mint system_handshake — JS Readable"]
    V --> JWT
    V --> JWT2
    V --> HS
  end
  App["Protected Routes and Portfolio"]
  M4 --> V
  D2 --> V
  JWT --> App
  HS --> App
  style V fill:#000000,color:#ffffff,stroke:#000000
  style App fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d
  style JWT fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style JWT2 fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style HS fill:#333333,color:#ffffff,stroke:#333333`
    },
    bullets: [
      'MobileLanding and ConnectPage both call system-verify after a wallet address is known.',
      'verify-session skips re-registration for returning authenticated users.',
      'SameSite=Lax, Secure in production, 7-day JWT max age.'
    ]
  },

  // ===== 6. SESSION COOKIE DEEP DIVE =====
  {
    id: 'auth-cookies',
    title: 'Sessions, Cookies and API Verification Deep Dive',
    paragraphs: [
      'Three cookies work in concert. `whale_session` and `human_session` are HTTP-only — JavaScript is structurally blocked from reading them. `system_handshake` is JavaScript-readable and holds your wallet address so the UI renders the "linked" state without an additional round trip.',
      'Middleware and all API routes verify the JWT on every request. A 401 redirects to /connect without exposing any sensitive state.'
    ],
    diagram: {
      caption: 'System-Verify and Full Cookie Architecture',
      chart: `sequenceDiagram
  participant Browser as Browser Client
  participant Verify as POST /system-verify
  participant DB as User Database
  participant MW as Middleware / All APIs
  Browser->>Verify: Wallet address in JSON body
  Verify->>DB: Upsert user row by address
  DB-->>Verify: User record confirmed
  Verify->>Browser: Set whale_session — HTTP-Only JWT
  Verify->>Browser: Set human_session — HTTP-Only JWT
  Verify->>Browser: Set system_handshake — Readable Cookie
  Browser->>MW: Subsequent requests include all cookies
  MW->>MW: Decode and verify JWT signature
  alt JWT Valid
    MW->>Browser: 200 OK — Serve protected content
  else JWT Expired or Missing
    MW->>Browser: 401 Redirect to /connect
  end`
    },
    bullets: [
      'Sign-out clears all three cookies plus Wagmi localStorage and session keys.',
      'Cookie expiry is 7 days rolling.',
      'Back-navigation cache on iOS is handled via the handshake cookie fallback.'
    ]
  },

  // ===== 7. QR BRIDGE =====
  {
    id: 'qr-sync',
    title: 'Quantum QR Bridge: Cross-Device Sync',
    paragraphs: [
      'The QR bridge allows instant, cryptographically secure session transfer from desktop to mobile without exposing private keys at any point. The desktop generates an ephemeral X25519 keypair and encodes the public key plus a UUID into the QR display.',
      'The phone scans, generates its own ephemeral pair, derives the shared secret, encrypts the JWT payload, and stores it in Redis with a 60-second TTL. The desktop polls and decrypts locally. No server ever sees the plaintext JWT.'
    ],
    diagram: {
      caption: 'Ephemeral Desktop to Mobile QR Session Bridge',
      chart: `sequenceDiagram
  participant Desktop as Desktop /connect
  participant QR as Ephemeral QR Code
  participant Phone as Mobile Scanner
  participant API as Auth APIs
  participant Redis as Volatile Cache TTL 60s
  Desktop->>Desktop: Generate X25519 keypair + UUID + Expiry
  Desktop->>QR: Encode UUID + PubKey + Expiry
  Phone->>QR: Camera Scan
  Phone->>Phone: Generate Mobile X25519 Keypair
  Phone->>Phone: Derive Shared ECDH Secret
  Phone->>API: POST qr-mobile-link with Encrypted JWT
  API->>Redis: Store Encrypted Payload under UUID
  loop Poll Every 1 Second
    Desktop->>API: GET /api/auth/qr-poll?uuid
    API->>Redis: Read payload
    Redis-->>API: Return Encrypted Bundle or null
    API-->>Desktop: Encrypted Bundle or 204 No Content
  end
  Desktop->>Desktop: Decrypt Bundle with Local Private Key
  Desktop->>API: POST /api/auth/qr-hydrate
  API-->>Desktop: whale_session + human_session + handshake
  Desktop-->>Phone: ACK Connection Established`
    }
  },

  // ===== 8. WHALE CHAT / XMTP =====
  {
    id: 'whale-chat',
    title: 'Decentralized Communications: Whale Chat XMTP',
    paragraphs: [
      'Whale Chat orchestrates end-to-end encrypted direct messaging via XMTP v5 protocol. At no point does the Humanity Ledger server access plaintext message data. The XMTP client is instantiated and persisted entirely in the browser via IndexedDB.',
      'All conversation states, address books, and ciphertexts remain strictly on-device. A PIN gate can lock the chat UI and a full wipe deletes all local IndexedDB databases matching the XMTP prefix.'
    ],
    diagram: {
      caption: 'End-to-End Encrypted XMTP Message Architecture',
      chart: `flowchart LR
  subgraph YourBrowser ["Your Browser"]
    W["Wallet Signs XMTP Install Message"]
    C["XMTP Client Singleton Cached"]
    IDB[("IndexedDB Ciphertexts")]
    PIN["PIN Gate — Optional Lockout"]
    W --> C
    C <-->|"Persist and Retrieve"| IDB
    PIN -.->|"Blocks UI Access"| C
  end
  subgraph XMTPNet ["XMTP Decentralized Network"]
    N["Encrypted Envelope Topics"]
  end
  subgraph PeerBrowser ["Counterparty Browser"]
    P["Their Wallet + XMTP Client"]
    PIDB[("Their IndexedDB")]
    P <-->|"Persist and Retrieve"| PIDB
  end
  C -->|"Publish Encrypted Envelope"| N
  N -->|"Subscribe + Decrypt"| P
  style XMTPNet fill:#f5f5f5,stroke:#cccccc,stroke-dasharray:5 5
  style YourBrowser fill:#f0fff0,stroke:#006600
  style PeerBrowser fill:#f0f0ff,stroke:#000066
  style C fill:#000000,color:#ffffff,stroke:#000000
  style N fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d`
    },
    bullets: [
      'Environment: NEXT_PUBLIC_XMTP_ENV defaults to production network.',
      'Stealth privacy mode in chat only masks the UI — it does not alter XMTP ciphertext.',
      'Humanity Ledger does not operate any central message database.',
      'QR sync can copy an encrypted seed from desktop to phone so both devices share the same XMTP identity.'
    ],
    callout: {
      title: 'Open Whale Chat',
      body: 'After linking your wallet, open Whale Chat from the dashboard or the /chat route.',
      href: '/chat',
      hrefLabel: 'Go to Whale Chat'
    }
  },

  // ===== 9. DATA BOUNDARIES =====
  {
    id: 'data-boundaries',
    title: 'Data Boundary Architecture',
    paragraphs: [
      'We designed the product so all sensitive material defaults to remaining on your device. Wallet private keys and seed phrases never leave your wallet application or local vault unlock flow.',
      'Our servers see your wallet address (for the user account row), tier metadata, forum content you post, API usage telemetry, and short-lived QR bridge tokens (expiring in Redis within 60 seconds). Session JWTs prove identity but carry no copy of your on-chain portfolio.'
    ],
    diagram: {
      caption: 'Comprehensive Data Boundary and Storage Classification',
      chart: `flowchart TB
  subgraph OnDevice ["On Your Device Only"]
    KEYS["Wallet Private Keys and Seed"]
    XMTP["XMTP IndexedDB Ciphertexts"]
    CONTACTS["Chat Contacts and Block Lists"]
    WIT["ZK Witness Inputs — Barretenberg"]
    WC["WalletConnect Session — Local Storage"]
    VAULT["Local Vault Encrypted Ciphertext"]
  end
  subgraph OurServers ["Humanity Ledger Servers"]
    USER["User Row: Address + Tier"]
    SESS["JWT Session Cookies"]
    FORUM["Forum Posts and API Content"]
    QRT["QR Bridge Token — Redis TTL 60s"]
    LOGS["Anonymized Interaction Telemetry"]
  end
  subgraph NeverStored ["Never Stored Anywhere by Us"]
    NK1["Private Keys or Seed Phrases"]
    NK2["Decrypted XMTP Message Archive"]
    NK3["Local Portfolio Vault Ciphertext"]
    NK4["ZK Circuit Witness Inputs"]
  end
  style NeverStored fill:#fff8f8,stroke:#cc0000,stroke-dasharray:4 4
  style OnDevice fill:#f8fff8,stroke:#006600
  style OurServers fill:#f8f8ff,stroke:#000066
  style KEYS fill:#ffe0e0,stroke:#cc0000
  style NK1 fill:#ffcccc,stroke:#cc0000
  style NK2 fill:#ffcccc,stroke:#cc0000
  style NK3 fill:#ffcccc,stroke:#cc0000
  style NK4 fill:#ffcccc,stroke:#cc0000`
    }
  },

  // ===== 10. AZTEC PRIVATE STATE =====
  {
    id: 'aztec-private',
    title: 'Aztec Private State and ZK Proof Architecture',
    paragraphs: [
      'Public Ethereum shows every transfer to everyone. Aztec adds a private execution layer: balances and transfers can live as encrypted notes in a shielded pool, while the chain only sees that a valid zero-knowledge proof was submitted.',
      'Humanity Ledger uses Noir to describe circuit rules (token transfers, membership checks) and Barretenberg to generate proofs entirely in your browser. The Aztec rollup verifies proofs in batches and posts a compact state commitment to Ethereum L1 for security.'
    ],
    diagram: {
      caption: 'Client-Side Proving to Aztec Rollup and Ethereum L1',
      chart: `flowchart LR
  subgraph ClientBrowser ["Your Browser"]
    WIT2["Build Witness from Private Inputs"]
    NOIR["Noir Circuit Compilation"]
    BB2["Barretenberg Proof Generation"]
    WIT2 --> NOIR
    NOIR --> BB2
  end
  subgraph AztecRollup ["Aztec Network"]
    VER["Proof Verifier Batch"]
    NOTES["Private Note Tree Updates"]
    NULL["Nullifier Set"]
    VER --> NOTES
    VER --> NULL
  end
  subgraph L1 ["Ethereum L1"]
    ROOT2["Anchored State Root Commitment"]
    VERIFY["L1 Verifier Contract"]
    ROOT2 --> VERIFY
  end
  BB2 -->|"Proof Only — No Witness"| VER
  NOTES --> ROOT2
  NULL --> ROOT2
  style ClientBrowser fill:#f8fff8,stroke:#006600
  style AztecRollup fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d
  style L1 fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style BB2 fill:#ccffcc,stroke:#006600
  style VER fill:#5533aa,color:#ffffff,stroke:#5533aa`
    },
    bullets: [
      'Private notes use commitments and nullifiers so each note is spent exactly once.',
      'Selective disclosure lets you prove a fact (e.g. eligibility) without exporting your full history.',
      'Shielding moves assets into the private pool; unshielding moves them back to public ERC-20.'
    ],
    callout: {
      title: 'Technical Depth',
      body: 'For circuit design, tokenomics, and security audits, read the Whitepaper.',
      href: '/whitepaper',
      hrefLabel: 'Read the Whitepaper'
    }
  },

  // ===== 11. UNIVERSAL SCAN ROUTER =====
  {
    id: 'product-scan',
    title: 'Universal Mobile Scan Router',
    paragraphs: [
      'On mobile, the Scan action opens a universal camera that reads far beyond desktop session QRs. The same scanner can link your phone to the desktop session, open a wallet address in Whale Chat, show a product passport page, or resolve a GS1 Digital Link.',
      'The routing logic is deterministic: the scan parser evaluates the payload format against all known schemas in order of specificity before dispatching to the correct handler.'
    ],
    diagram: {
      caption: 'Universal Mobile Scan Payload Router',
      chart: `flowchart TD
  CAM["Mobile Camera or Gallery Input"]
  PARSER["Scan Payload Parser"]
  SESS["Desktop Session QR Handler"]
  WALLET["Wallet Address QR Handler"]
  PASS["Passport Page Handler"]
  GS1["GS1 Resolver Handler"]
  ERR["Error + Help Link"]
  QR["POST qr-mobile-link"]
  CHAT2["Open Whale Chat to Peer"]
  VIEW["Public Passport Page"]
  RESOLVE["GET /api/passport/resolve"]
  HYDRATE["Desktop Session Hydrated"]
  CAM --> PARSER
  PARSER -->|"UUID + X25519 PubKey"| SESS
  PARSER -->|"0x Ethereum Address"| WALLET
  PARSER -->|"humanidfi.com/passport slug"| PASS
  PARSER -->|"GS1 Digital Link"| GS1
  PARSER -->|"Unknown Format"| ERR
  SESS --> QR
  WALLET --> CHAT2
  PASS --> VIEW
  GS1 --> RESOLVE
  RESOLVE --> VIEW
  QR --> HYDRATE
  style CAM fill:#000000,color:#ffffff,stroke:#000000
  style PARSER fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d
  style HYDRATE fill:#006600,color:#ffffff,stroke:#006600
  style ERR fill:#cc0000,color:#ffffff,stroke:#cc0000
  style VIEW fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e`
    },
    bullets: [
      'All format matching is deterministic and evaluated client-side only.',
      'Unknown QR codes never send data to external servers.',
      'GS1 Digital Link support enables physical product provenance verification.'
    ]
  },

  // ===== 12. SMART CONTRACT ARCHITECTURE =====
  {
    id: 'smart-contract-architecture',
    title: 'Smart Contract Architecture and Token Flows',
    paragraphs: [
      'The on-chain layer is composed of composable, immutable smart contracts deployed across multiple EVM-compatible chains. The Core Ledger contract handles transferWithReceipt logic, anchoring product passports on-chain with memos. Token flows are routed through Uniswap liquidity pools and bridged via LayerZero messaging.',
      'All contract interactions are proxied through the native portfolio components which handle gas estimation, slippage, and MEV protection natively before broadcasting signed transactions.'
    ],
    diagram: {
      caption: 'Smart Contract Interaction and Token Flow Architecture',
      chart: `graph TD
  subgraph UserWallet ["User Wallet Layer"]
    PK["Private Key Signer"]
    ETH_W["ETH Balance"]
    ERC20_W["ERC20 Token Balances"]
  end
  subgraph CoreContracts ["Core Smart Contracts"]
    CoreLedger["Core Ledger Contract"]
    PassportAnchor["Passport Anchor Registry"]
    TransferReceipt["transferWithReceipt Logic"]
    CoreLedger --> PassportAnchor
    CoreLedger --> TransferReceipt
  end
  subgraph DEX ["Decentralized Exchange Layer"]
    UniV2R["Uniswap V2 Router 02"]
    UniV3R["Uniswap V3 Router"]
    UniPool["Liquidity Pools"]
    UniV2R --> UniPool
    UniV3R --> UniPool
  end
  subgraph BridgeLayer ["Cross-Chain Bridge"]
    STG["Stargate Finance"]
    LZEndpoint["LayerZero Endpoint"]
    STG --> LZEndpoint
  end
  PK --> CoreLedger
  PK --> UniV2R
  PK --> UniV3R
  PK --> STG
  ERC20_W --> UniV2R
  ETH_W --> LZEndpoint
  UniPool --> ERC20_W
  TransferReceipt -->|"PASSPORT memo"| PassportAnchor
  style CoreContracts fill:#f0f0ff,stroke:#2a1b4d
  style DEX fill:#fff8f0,stroke:#996600
  style BridgeLayer fill:#f0fff0,stroke:#006600
  style PK fill:#000000,color:#ffffff,stroke:#000000
  style CoreLedger fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d`
    }
  },

  // ===== 13. GLOBAL SECURITY ARCHITECTURE =====
  {
    id: 'global-security-architecture',
    title: 'Global Security and Circuit Breaker Architecture',
    paragraphs: [
      'Security is the absolute zero-point of the architecture. The system integrates multi-layered defense: edge-level WAF and rate limiting, middleware JWT verification, smart contract invariant monitoring, and automated circuit breakers that freeze all capital operations upon anomaly detection.',
      'If extreme market volatility or a smart contract invariant violation is detected, automated circuit breakers halt off-chain indexing, freeze fiat-ingress portals, and emit emergency alerts to the operations team.'
    ],
    diagram: {
      caption: 'Threat Mitigation, Rate Limiting and Circuit Breaker Topology',
      chart: `graph TD
  subgraph EdgePerimeter ["Edge Perimeter"]
    WAF["Web Application Firewall"]
    RATE["Vercel Edge Rate Limiter"]
    DDOS["DDoS Mitigation Layer"]
    DDOS --> WAF
    WAF --> RATE
  end
  subgraph APILayer ["Backend API Layer"]
    MW2["Auth Middleware — JWT Verify"]
    INV["Contract Invariant Monitor"]
    ANOMALY["Anomaly Detection Engine"]
    MW2 --> INV
    INV -->|"Invariant Violation"| ANOMALY
  end
  subgraph CircuitBreaker ["Active Defense System"]
    CB(["Global Circuit Breaker"])
    LOCK["Capital Operations Lockdown"]
    OPS["Ops Alert Dispatch"]
    AUDIT["Audit Log Write"]
    CB --> LOCK
    CB --> OPS
    CB --> AUDIT
  end
  subgraph Recovery ["Recovery Path"]
    HEALTH["Health Check API"]
    RESTORE["Manual Restore Endpoint"]
    HEALTH --> RESTORE
  end
  RATE --> MW2
  ANOMALY -->|"Threshold Exceeded"| CB
  LOCK -.->|"Post Recovery"| HEALTH
  style CB fill:#cc0000,color:#ffffff,stroke:#cc0000
  style LOCK fill:#ff4444,color:#ffffff,stroke:#ff4444
  style EdgePerimeter fill:#f0f0ff,stroke:#0000cc
  style APILayer fill:#fff5f5,stroke:#cc3333
  style CircuitBreaker fill:#fff0f0,stroke:#cc0000
  style Recovery fill:#f0fff0,stroke:#006600
  style OPS fill:#ff6600,color:#ffffff,stroke:#ff6600`
    }
  },

  // ===== 14. INFRASTRUCTURE AND DEPLOYMENT =====
  {
    id: 'infrastructure-deployment',
    title: 'Infrastructure and Deployment Architecture',
    paragraphs: [
      'The platform is deployed on Railway with edge functions handled by Vercel. The Next.js application uses the App Router with server components for SEO-critical pages and client components for all wallet-interactive modules.',
      'Continuous deployment is triggered on every push to the main branch of the GitHub repository. Database migrations run automatically via Prisma. Redis clusters are managed via Upstash with automatic eviction policies for ephemeral QR tokens.'
    ],
    diagram: {
      caption: 'Cloud Infrastructure, Deployment Pipeline and Service Topology',
      chart: `flowchart TD
  DEV["Developer Push to GitHub main"]
  CI["GitHub Actions CI Pipeline"]
  BUILD["Next.js Build"]
  RAILWAY["Railway Deployment"]
  VERCEL_EDGE["Vercel Edge Network"]
  NEXTSERVER["Next.js App Server"]
  POSTGRES2["Postgres via Railway"]
  REDIS2["Upstash Redis"]
  PRISMA2["Prisma ORM Layer"]
  RPC2["Alchemy / Infura RPC"]
  XMTP2["XMTP Production Network"]
  DEV --> CI
  CI -->|"Lint + Type Check"| BUILD
  BUILD --> RAILWAY
  BUILD --> VERCEL_EDGE
  RAILWAY --> NEXTSERVER
  RAILWAY --> POSTGRES2
  RAILWAY --> REDIS2
  VERCEL_EDGE --> NEXTSERVER
  NEXTSERVER --> PRISMA2
  PRISMA2 --> POSTGRES2
  NEXTSERVER --> REDIS2
  NEXTSERVER --> RPC2
  NEXTSERVER --> XMTP2
  subgraph Monitoring ["Observability Stack"]
    LOGS2["Railway Logs"]
    METRICS["Performance Metrics"]
    ALERTS2["Error Alerting"]
  end
  RAILWAY --> Monitoring
  style CI fill:#f0f0f0,stroke:#333333
  style RAILWAY fill:#7B2FBE,color:#ffffff,stroke:#7B2FBE
  style POSTGRES2 fill:#336791,color:#ffffff,stroke:#336791
  style VERCEL_EDGE fill:#000000,color:#ffffff,stroke:#000000
  style NEXTSERVER fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style REDIS2 fill:#cc0000,color:#ffffff,stroke:#cc0000
  style Monitoring fill:#f5fff5,stroke:#006600`
    },
    bullets: [
      'Zero-downtime deployments via Railway rolling releases.',
      'Prisma migrations run in CI before traffic cutover.',
      'Redis TTLs guarantee ephemeral data does not persist beyond its operational window.'
    ]
  },

  // ===== 15. PROVENANCE PASSPORT SYSTEM =====
  {
    id: 'provenance-passport',
    title: 'Provenance Passport and On-Chain Anchoring',
    paragraphs: [
      'Product passports are public-read records stored in our database. Issuers create them in Provenance Studio (wallet required). Optional on-chain anchoring calls Core Ledger transferWithReceipt with a PASSPORT:{slug} memo, storing the Core Entropy value and transaction hash on the passport record.',
      'Passport pages are fully readable without a wallet — anyone with the URL or QR can view published fields (origin, batch, certifications, carbon). Private selective disclosure via Aztec is planned for a later phase.'
    ],
    diagram: {
      caption: 'Provenance Passport Creation, Anchoring and Verification Flow',
      chart: `flowchart TD
  ISSUER["Issuer with Connected Wallet"]
  STUDIO["Provenance Studio"]
  FORM["Fill Passport Fields"]
  SAVE["Save to Humanity Ledger DB"]
  QR2["Generate QR Label"]
  ANCHOR["On-Chain Anchoring"]
  CORETX["Core Ledger: transferWithReceipt"]
  CHAIN["Ethereum State"]
  ENTROPY["Store TxHash + Core Entropy"]
  PRINT["Physical Product Label"]
  SCAN2["Consumer Scans QR"]
  PUBVIEW["Public Passport View Page"]
  ISSUER --> STUDIO
  STUDIO --> FORM
  FORM --> SAVE
  SAVE --> QR2
  FORM -.->|"Optional"| ANCHOR
  ANCHOR --> CORETX
  CORETX -->|"PASSPORT memo"| CHAIN
  CHAIN --> ENTROPY
  ENTROPY --> SAVE
  QR2 --> PRINT
  PRINT --> SCAN2
  SCAN2 --> PUBVIEW
  PUBVIEW -->|"Read DB"| SAVE
  PUBVIEW -.->|"Verify Anchor"| CHAIN
  style ANCHOR fill:#f0fff0,stroke:#006600
  style CHAIN fill:#1a1a2e,color:#ffffff,stroke:#1a1a2e
  style CORETX fill:#2a1b4d,color:#ffffff,stroke:#2a1b4d
  style ENTROPY fill:#336791,color:#ffffff,stroke:#336791
  style ISSUER fill:#000000,color:#ffffff,stroke:#000000
  style PUBVIEW fill:#f0f0ff,stroke:#2a1b4d`
    }
  }
];

export const PRIVACY_TOC = PRIVACY_ARCHITECTURE_SECTIONS.map((s) => ({
  id: s.id,
  label: s.title,
}));
