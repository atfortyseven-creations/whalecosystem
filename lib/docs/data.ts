export const docContent: Record<string, { title: string; category: string; content: string }> = {
  "overview": {
    "title": "System Overview",
    "category": "Getting Started",
    "content": "# Sovereign System Overview\n\nWelcome to the official, institutional-grade documentation portal for the Whale Alert Corporation Sovereign Protocol. This technical reference manual is designed for quantitative trading desks, institutional DevOps engineers, security auditors, and node operators requiring zero-latency, cryptographically secure access to global on-chain telemetry.\n\nThe Sovereign Protocol represents a major leap in decentralized network intelligence, merging high-throughput mempool ingestion pipelines with advanced graph-based entity resolution and peer-to-peer end-to-end encrypted (E2EE) communication layers.\n\n## Core Pillars of the Architecture\n\n*   **Zero-Trust Topology:** Unlike legacy analytics dashboards that record client IP addresses, email logs, and plaintext search history, the Sovereign Terminal functions as a local-first, zero-knowledge client. Private keys remain inside cold storage or trusted hardware wallets (such as Ledger, Trezor, or Keystone). Session authorization is established purely through cryptographic ECDSA signatures (EIP-191) and client-side ephemeral keys.\n*   **Kinetic Heuristic Ingestion:** By tracking capital velocity, directionality, and momentum vectors instead of static wallet balances, our parser models real-time liquidity transitions. This enables programmatic detection of OTC desk preparation, exchange hot-wallet inflows/outflows, and multi-signature Treasury movements before they are finalized on-chain.\n*   **Distributed Graph Database (Akashic Ledger):** Our custom Neo4j graph cluster aggregates multi-chain transaction paths in real time. The engine groups address nodes using advanced clustering models (e.g. Louvain Community Detection) up to 6+ hops deep to uncover controlling entities behind proxy routing contracts.\n*   **Decentralized Communication (Whale Chat):** Verified wallets can access the Whale Chat network, a zero-metadata messaging protocol powered by XMTP. Whale Chat uses the Double Ratchet cryptographic protocol to ensure forward secrecy and post-compromise security, allowing sovereign actors to coordinate and share alpha without central surveillance.\n\n## Access Framework\n\nTo interact with the network's API endpoints or access the premium dashboard features, operators must authenticate using the Sign-In with Ethereum (SIWE) protocol. In mobile environments, authentication is secured by WebGL-based liveness verification, preventing automated Sybil crawlers from draining network resources. Upon verification, the gateway issues a secure session token enabling high-rate REST and WebSocket access."
  },
  "quickstart": {
    "title": "Quickstart Guide",
    "category": "Getting Started",
    "content": "# Developer Quickstart (5 Minutes)\n\nFollow this step-by-step guide to configure your local developer environment and execute your first authenticated request to the Sovereign API.\n\n## Step 1: Establish Your Session via SIWE\n1.  Navigate to the **Connect** page of the Sovereign Terminal.\n2.  Select your preferred Web3 provider (injected browser extension like MetaMask, or mobile wallet via WalletConnect v2 / AppKit).\n3.  Accept the cryptographic signing request. The wallet will prompt you to sign a standard EIP-4361 message containing an ephemeral nonce to prevent replay attacks.\n4.  Once signed, the server validates the signature and returns an HTTP-only secure cookie, redirecting you automatically to the dashboard.\n\n## Step 2: Retrieve Your API Credentials\n1.  On the terminal dashboard, navigate to the **Settings** menu.\n2.  Select the **Developer Settings** tab from the left sidebar.\n3.  Click the **Generate API Key** button.\n4.  Optionally input an IP Whitelist rule (e.g. `203.0.113.50` or a CIDR range like `198.51.100.0/24`) to restrict key usage.\n5.  Copy your new API key (e.g. `wh_live_a1b2c3d4e5f6g7h8i9j0`). Keep this key secure; it is hashed in the database using bcrypt and cannot be retrieved again.\n\n## Step 3: Execute Your First Test Request\nVerify your credentials using a shell curl request. We query the system status endpoint to verify authorization headers and check current rate limits:\n\n```bash\ncurl -X GET \\\n     -H \"x-sovereign-key: wh_live_a1b2c3d4e5f6g7h8i9j0\" \\\n     -H \"Accept: application/json\" \\\n     https://api.humanidfi.com/v3/telemetry/ping\n```\n\n### Expected Response Payload (HTTP 200 OK)\n```json\n{\n  \"status\": \"success\",\n  \"message\": \"Sovereign network gateway fully operational.\",\n  \"timestamp\": 1779264000,\n  \"rateLimit\": {\n    \"remaining\": 299,\n    \"reset\": 60\n  }\n}\n```\n\n## Step 4: Stream Real-Time Mempool Updates\nWebSockets allow you to capture transaction telemetry at sub-millisecond speeds. Create a file named `stream.js` and initialize a WebSocket listener:\n\n```javascript\nconst WebSocket = require('ws');\n\nconst API_KEY = 'wh_live_a1b2c3d4e5f6g7h8i9j0';\nconst ws = new WebSocket(`wss://stream.humanidfi.com/v3/connect?key=${API_KEY}`);\n\nws.on('open', () => {\n  console.log('Connected to Sovereign Real-Time Gateway.');\n  \n  // Subscribe to the alerts channel\n  ws.send(JSON.stringify({\n    op: 'SUBSCRIBE',\n    channels: ['alerts_kinetic'],\n    params: {\n      minUsdValue: 1000000\n    }\n  }));\n});\n\nws.on('message', (data) => {\n  const message = JSON.parse(data);\n  if (message.event === 'KINETIC_ALERT') {\n    console.log(`[ALERT] Large capital flow: ${message.data.amountUsd} USD of ${message.data.asset} from ${message.data.fromEntity} to ${message.data.toEntity}`);\n  }\n});\n\nws.on('close', (code, reason) => {\n  console.log(`Connection closed: ${code} - ${reason}. Reconnecting in 3 seconds...`);\n  setTimeout(connect, 3000);\n});\n```"
  },
  "core-concepts": {
    "title": "Core Concepts",
    "category": "Getting Started",
    "content": "# Sovereign Core Concepts\n\nOperating on the Sovereign Protocol requires familiarity with key cryptographic, mathematical, and networking primitives.\n\n## Kinetic Heuristics\nLegacy blockchain parsers focus on static balances. The Sovereign Engine introduces **Kinetic Heuristics**, which model the movement of tokens as vectors. A transaction is not merely a transfer; it is a force defined by:\n*   **Mass ($M$):** The USD value of the tokens transferred.\n*   **Velocity ($V$):** The speed at which the transaction was propagated through the network's mempool before inclusion.\n*   **Direction ($D$):** The topological shift in the graph ledger (e.g., cold storage $\\to$ OTC deposit address).\n\nBy calculating the kinetic energy ($E_k = \\frac{1}{2} M V^2$) of transaction flows, quantitative models can predict near-term market volatility with high accuracy.\n\n## Multi-Hop Entity Resolution\nWallets are cheap. Large actors typically distribute their holdings across thousands of addresses. The **Akashic Ledger** uses graph clustering algorithms (such as Louvain community detection) to aggregate disparate nodes into a single \"resolved entity.\"\n\n| Metric | Relational Database (SQL) | Graph Database (Neo4j) |\n| :--- | :--- | :--- |\n| Tracing Depth | 1 - 2 hops max | Up to 6+ hops |\n| Query Latency (4-hop) | > 2,000ms | < 35ms |\n| Memory Complexity | High (nested joins) | Low (pointer chasing) |\n\n## Zero-Knowledge Liveness\nSybil resistance is maintained via zero-knowledge liveness checks. Users attesting their identity do not upload 3D face scans to our servers. Instead, a local WebGL engine executes a liveness capture, computes a mathematical proof of human presence, and uploads only the cryptographic proof."
  },
  "whale-code": {
    "title": "Whale Code",
    "category": "Getting Started",
    "content": "# Whale Code DSL Specification\n\nWhale Code is a lightweight, domain-specific language (DSL) compiled into WebAssembly (Wasm) and executed inside sandboxed edge containers. It allows developers to deploy high-frequency surveillance rules that execute directly next to RPC ingest nodes.\n\n## Sample Script\nThe following script registers an event handler that triggers a webhook alert if an address associated with a specific entity moves more than 1,000,000 USDC:\n\n```rust\n// Whale Code v1.0\nimport alert_service;\nimport entity_resolver;\n\nfn on_mempool_transaction(tx: Transaction) {\n    if tx.asset == \"USDC\" && tx.value >= 1_000_000.0 {\n        let sender = entity_resolver::resolve(tx.from_address);\n        if sender.classification == \"MarketMaker\" {\n            alert_service::dispatch_webhook({\n                \"rule\": \"whale_usdc_outflow\",\n                \"entity\": sender.name,\n                \"amount\": tx.value,\n                \"tx_hash\": tx.hash\n            });\n        }\n    }\n}\n```\n\n## Compiler Target\nWhale Code compiles to the `wasm32-unknown-unknown` target and runs on our sandboxed edge nodes with a maximum memory ceiling of 64MB per worker, ensuring fast execution without crashing hosting servers."
  },
  "platform/architecture": {
    "title": "Sovereign Architecture",
    "category": "Platform",
    "content": "# Platform Architecture\n\nThe Sovereign Terminal relies on a layered architecture ensuring data integrity, strict access control, and low-latency performance on both PC and mobile devices.\n\n```mermaid\ngraph TD\n    Client[Sovereign Client] -->|EIP-4361 SIWE| Auth[Auth API]\n    Client -->|WebSocket / REST| Gateway[WAF Gateway]\n    Gateway -->|Rate Limiter| Redis[(Redis Cluster)]\n    Gateway -->|GraphQL / REST| Ingest[Ingest Service]\n    Ingest -->|Write| Neo4j[(Neo4j Graph Database)]\n    Ingest -->|Read| Postgres[(PostgreSQL DB via Prisma)]\n```\n\n## Desktop Client Security\nThe React application acts as a zero-trust interface. It maintains no local credentials beyond the secure cookie session. If the local authorization state changes, the application unmounts the dashboard, purges sensitive state memory, and triggers a clean redirect to the login screen.\n\n## Mobile Verification Relay\nTo accommodate users on mobile networks (4G/5G), we implement an asynchronous handshake pattern:\n1.  **Session Handshake Initialized:** The desktop client connects to the auth server and receives an ephemeral UUID session ID.\n2.  **QR Code Displayed:** The session ID is formatted as a QR code.\n3.  **Mobile Capture & attestation:** The mobile device scans the QR code, performs a SIWE signature and biometric attestation locally, and uploads the signature to the server.\n4.  **Instant Hydration:** The server validates the proof, updates the session ID status in Redis to authenticated, and the desktop client’s WebSocket listener automatically triggers state hydration."
  },
  "platform/authentication": {
    "title": "Authentication (SIWE)",
    "category": "Platform",
    "content": "# Cryptographic Authentication (SIWE)\n\nAuthentication on the Sovereign Protocol bypasses standard email/password patterns in favor of public-key cryptography.\n\n## Sign-In With Ethereum (EIP-4361)\nThe authentication flow follows the SIWE standard:\n\n1.  **Challenge Generation:** The client requests a unique cryptographic nonce from `/api/auth/nonce`.\n2.  **Signing:** The client prompts the user's web3 wallet (via Wagmi or AppKit) to sign a standard SIWE message:\n    ```text\n    humanidfi.com wants you to sign in with your Ethereum account:\n    0x95222290DD7278Aa3Ddd389Cc1E1d165CC4BAfe5\n\n    Sign this message to authenticate securely.\n\n    URI: https://humanidfi.com\n    Version: 1\n    Chain ID: 1\n    Nonce: 8f3c7e9b2a1c\n    Issued At: 2026-05-19T18:00:00Z\n    ```\n3.  **Verification:** The signature is sent to `/api/auth/sovereign-verify`. The server recreates the message, performs public key recovery using `ethers` or `viem`, and checks the nonce validity.\n4.  **Session Establishment:** Upon successful verification, the server issues an encrypted HTTP-only session cookie containing a secure JWT.\n\n## Biometric Liveness Attestation\nFor premium and institutional tiers, users must complete a ZK-Liveness check via their device camera:\n*   **Local Rendering:** WebGL captures micro-movements of facial geometry.\n*   **Liveness Check:** The local engine validates eye blinking and depth map changes, ensuring a real human is present.\n*   **ZK Proof Creation:** A proof is generated showing the liveness check succeeded without transmitting raw video data.\n*   **Submission:** The proof is verified on-chain or inside a secure enclave."
  },
  "platform/neo4j": {
    "title": "Neo4j Akashic Ledger",
    "category": "Platform",
    "content": "# Neo4j Akashic Ledger\n\nThe core data repository for entity resolution and capital flow tracing is the **Akashic Ledger**, a high-performance Neo4j graph cluster.\n\n## Graph Schema\nThe graph consists of two node types and two relationship types:\n*   **Nodes:**\n    *   `Address`: Representing individual blockchain accounts (e.g., `0x71C.../ETH`).\n    *   `Entity`: Representing grouped clusters (e.g., `Alameda Research`, `Wintermute`).\n*   **Relationships:**\n    *   `TRANSFERRED`: Represents transaction paths. Contains properties: `amountUsd`, `timestamp`, `txHash`.\n    *   `BELONGS_TO`: Links an address to a resolved entity with a `confidence` score.\n\n```mermaid\ngraph LR\n    Address1[Address: 0x123] -->|BELONGS_TO| Entity1[Entity: Jump Trading]\n    Address2[Address: 0x456] -->|BELONGS_TO| Entity1\n    Address1 -->|TRANSFERRED| Address3[Address: 0x789]\n```\n\n## Sample Cypher Query\nTo query paths between two known institutional clusters up to 3 hops deep:\n\n```cypher\nMATCH path = (e1:Entity {name: \"Binance\"})-[:BELONGS_TO|TRANSFERRED*1..3]-(e2:Entity {name: \"Jump Trading\"})\nRETURN path, [r IN relationships(path) | r.amountUsd] AS transferValues\nLIMIT 10\n```"
  },
  "platform/smart-contracts": {
    "title": "Smart Contracts",
    "category": "Platform",
    "content": "# Protocol Smart Contracts\n\nSovereign Protocol leverages a set of immutable smart contracts on Ethereum Mainnet and Arbitrum to coordinate nodes, manage subscription keys, and verify identity claims.\n\n## Contract Architecture\n\n*   **SovereignRegistry.sol:** Stores public keys and routing endpoints of verified edge nodes.\n    *   `registerNode(address operator, string endpoint, bytes32 ipfsHash)`\n*   **SubscriptionManager.sol:** Handles recurring billing in stablecoins (USDC/USDT).\n    *   `subscribe(uint256 planId, uint256 durationMonths)`\n    *   Uses ERC-20 `transferFrom` to lock funds in the treasury contract.\n*   **LivenessVerifier.sol:** Contains the ZK-SNARK verifier contract generated using ZoKrates or SnarkJS to cryptographically verify liveness claims.\n\n## Deployment Addresses (Arbitrum One)\n\n| Contract | Address |\n| :--- | :--- |\n| `SovereignRegistry` | `0x3A21c33f4Be3587b9bC932df88F61aD287b9FCfc` |\n| `SubscriptionManager` | `0x9fC5c39D2678c0Fde35B796bF58f1aD2c0F8721c` |\n| `LivenessVerifier` | `0xEfA123cCd786FaBcde3fE912d09E387FdfBCEe21` |"
  },
  "platform/node-deployment": {
    "title": "Node Deployment",
    "category": "Platform",
    "content": "# Edge Node Deployment Guide\n\nOperating an Edge Node allows institutional users to deploy local APIs directly inside their firewalls, dropping RPC and network routing overhead to the minimum possible latency.\n\n## Architecture\n\nEdge Nodes run as lightweight Docker containers. They pull transaction traces from our primary validator nodes via a secure, gRPC-over-Noise protocol and maintain a local Redis cache.\n\n## Docker Compose File\nCreate a `docker-compose.yml` file:\n\n```yaml\nversion: '3.8'\n\nservices:\n  sovereign-node:\n    image: whalealert/edge-node:v2.4.1\n    container_name: sovereign-edge-node\n    environment:\n      - ETH_RPC_URL=http://your-local-geth:8545\n      - EDGE_API_KEY=wh_live_a1b2c3d4e5f6\n      - REDIS_URL=redis://redis-cache:6379/0\n      - LOG_LEVEL=info\n    ports:\n      - \"8080:8080\"\n    depends_on:\n      - redis-cache\n    restart: unless-stopped\n\n  redis-cache:\n    image: redis:7-alpine\n    container_name: edge-node-cache\n    command: redis-server --appendonly yes\n    volumes:\n      - redis-data:/data\n\nvolumes:\n  redis-data:\n```\n\n## Bootstrapping\n1.  Verify ports `8080` and `9090` are open on your security group.\n2.  Run the engine:\n    ```bash\n    docker compose up -d\n    ```\n3.  Test local resolution:\n    ```bash\n    curl http://localhost:8080/v3/resolve/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\n    ```"
  },
  "platform/websocket-streams": {
    "title": "WebSocket Streams",
    "category": "Platform",
    "content": "# High-Performance WebSocket Streams\n\nWebSocket feeds are designed for high-frequency trading applications requiring millisecond-level capital flow telemetry.\n\n## Connection Lifecycle\nWebSockets require a valid API key in the connection URI:\n`wss://stream.humanidfi.com/v3/connect?key=wh_live_...`\n\nUpon connection, the server sends an authorization confirmation frame:\n```json\n{\n  \"op\": \"CONNECTED\",\n  \"sessionId\": \"sess_987654321\",\n  \"heartbeatMs\": 15000\n}\n```\n\n## Heartbeats\nTo prevent socket termination by load balancers, client applications must respond to ping frames within 15 seconds:\n*   **Server Frame:** `{\"op\": \"PING\"}`\n*   **Client Response:** `{\"op\": \"PONG\"}`\n\n## Channel Subscriptions\nTo subscribe to ETH Mempool logs:\n```json\n{\n  \"op\": \"SUBSCRIBE\",\n  \"channels\": [\"mempool_eth\"],\n  \"params\": {\n    \"minUsdValue\": 500000\n  }\n}\n```"
  },
  "platform/whale-chat": {
    "title": "Whale Chat Forum",
    "category": "Platform",
    "content": "# Whale Chat Forum Architecture\n\nThe **Whale Chat Forum** is a zero-metadata, end-to-end encrypted (E2EE) messaging protocol deeply embedded within the Sovereign Terminal. It provides verified institutional wallets, quant desks, and sovereign operators a censorship-resistant environment to communicate, share OTC order flows, and broadcast zero-knowledge market intelligence.\n\n## Cryptographic Foundation (XMTP & Double Ratchet)\nUnder the hood, Whale Chat abstracts away traditional client-server communication using the **Extensible Message Transport Protocol (XMTP)** and the Signal Double Ratchet algorithm.\n\n### 1. Identity Key Generation\nUpon initial connection, the user's web3 wallet generates a deterministic identity keypair. This keypair is signed by their Ethereum or Arbitrum account address, linking their cryptographic identity to their public on-chain alias without exposing their private seed phrase.\n\n### 2. Session Initialization (X3DH)\nWhen User A attempts to message User B, the protocol executes an Extended Triple Diffie-Hellman (X3DH) key agreement. It fetches User B's pre-keys from the decentralized XMTP node network to establish a shared secret, preventing active Man-in-the-Middle (MitM) attacks even if the relay nodes are compromised.\n\n### 3. Message Encryption (Double Ratchet)\nEvery single message sent across the network is encrypted using a unique, ephemeral message key. The Double Ratchet algorithm guarantees:\n*   **Forward Secrecy:** If a key is compromised today, the attacker cannot decrypt historical messages.\n*   **Post-Compromise Security:** If a key is compromised today, the attacker cannot decrypt future messages once the users exchange a new ratcheted message.\n\n## Decentralized Payload Routing\nEncrypted message envelopes are transmitted to the decentralized XMTP node cluster. Sovereign Protocol operates its own verified relayer nodes, ensuring that message broadcast latency remains under 50ms globally.\n\n*   **No Central Storage:** Sovereign does not host databases of your chat logs. Messages are retrieved from the decentralized web using your local client.\n*   **Zero Metadata Leakage:** To external observers, message traffic appears as indistinguishable encrypted BLOBs. Connection IP addresses are scrubbed at the gateway proxy layer.\n\n## Automated Trading Integration\nFor algorithmic desks, the Whale Chat API acts as a programmable intelligence feed. Bots can be deployed to automatically ingest messages, parse natural language or JSON payloads, and execute smart contract functions directly on-chain.\n\n**Common Use Cases:**\n*   **OTC Liquidity Coordination:** Broadcast large block trades to trusted counterparties securely.\n*   **Automated Alert Subscriptions:** Subscribe to algorithmic market makers that publish shifting order book states.\n*   **Multi-Sig Treasury Execution:** Securely transmit partial signatures across team members before an on-chain execution.\n\nFor deep technical implementation rules, refer to the [Whale Chat REST API Docs](/docs/developer/rest/forum) and the [TypeScript SDK](/docs/developer/sdk/typescript)."
  },
  "integrations/walletconnect": {
    "title": "WalletConnect v2",
    "category": "Integrations",
    "content": "# WalletConnect v2 Integration\n\nThe Sovereign Terminal uses WalletConnect v2 as its primary interface for mobile wallets, hardware wallets, and browser extensions.\n\n## Configuration\nWagmi is configured to support standard WalletConnect project IDs:\n\n```typescript\nimport { createConfig, http } from 'wagmi';\nimport { mainnet, arbitrum } from 'wagmi/chains';\nimport { walletConnect } from 'wagmi/connectors';\n\nexport const config = createConfig({\n  chains: [mainnet, arbitrum],\n  connectors: [\n    walletConnect({\n      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',\n      metadata: {\n        name: 'Sovereign Terminal',\n        description: 'Institutional On-Chain Intelligence',\n        url: 'https://humanidfi.com',\n        icons: ['https://humanidfi.com/icon.png'],\n      },\n    }),\n  ],\n  transports: {\n    [mainnet.id]: http(),\n    [arbitrum.id]: http(),\n  },\n});\n```\n\n## Known Mobile Connection Behavior\nWhen connecting via 4G or 5G, firewalls and cellular providers can interrupt long-lived WebSockets. AppKit uses WebSocket recovery mechanisms to re-establish connections when switching cell towers."
  },
  "integrations/tron": {
    "title": "Tron (TRC-20)",
    "category": "Integrations",
    "content": "# Tron Network (TRC-20) Support\n\nTron is a significant network for stablecoin volume, particularly TRC-20 USDT. The Sovereign Terminal tracks Tron transactions through a dedicated indexer.\n\n## Address Formatting\nUnlike Ethereum addresses (`0x...`), Tron addresses use base58 check encoding (`T...`). The API automatically detects address schemes and routes requests:\n\n*   **Ethereum Route:** `/v3/entities/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5`\n*   **Tron Route:** `/v3/entities/TX9xZdG575mYwK25hWz3wU2Z7F`\n\n## Ingestion Metrics\nTRC-20 events are parsed in real time directly from Tron Solidity nodes, calculating kinetic heuristics such as transaction velocity and source-destination relationships."
  },
  "integrations/getblock": {
    "title": "GetBlock RPC",
    "category": "Integrations",
    "content": "# GetBlock RPC Infrastructure\n\nThe platform uses GetBlock as a primary RPC provider, ensuring 99.999% uptime for transaction tracing and historical state lookups.\n\n## Fallback Logic\nIf a primary RPC node fails or is throttled, the request is automatically routed to GetBlock:\n\n```mermaid\ngraph TD\n    Client[Client Request] --> Gateway[Gateway Router]\n    Gateway -->|Primary RPC| Node1[Custom Node Cluster]\n    Node1 -->|Timeout / 503| Node2[GetBlock Fallback API]\n    Node2 --> Response[JSON RPC Response]\n```\n\n## Supported Networks\n*   Ethereum Mainnet\n*   Arbitrum One\n*   Base L2\n*   Polygon PoS\n*   BNB Smart Chain"
  },
  "integrations/resend": {
    "title": "Resend Email Alerts",
    "category": "Integrations",
    "content": "# Resend Integration\n\nThe platform uses **Resend** to dispatch real-time email alerts for monitored entities and wallet events.\n\n## Creating Alerts\nAlert structures are configured via the API or Dashboard. When a monitored wallet transfers funds, the engine builds an alert payload and submits it to Resend:\n\n```typescript\nimport { Resend } from 'resend';\n\nconst resend = new Resend(process.env.RESEND_API_KEY);\n\nexport async function sendWhaleAlert(email: string, alertData: any) {\n  await resend.emails.send({\n    from: 'alerts@whalealert.com',\n    to: email,\n    subject: `[Whale Alert] Large movement detected: ${alertData.asset}`,\n    html: `\n      <h3>Kinetic Outflow Detected</h3>\n      <p><strong>Entity:</strong> \${alertData.entityName}</p>\n      <p><strong>Amount:</strong> \${alertData.valueUsd} USD</p>\n      <p><strong>Tx Hash:</strong> \${alertData.txHash}</p>\n    `\n  });\n}\n```"
  },
  "integrations/prisma": {
    "title": "Prisma ORM",
    "category": "Integrations",
    "content": "# Prisma Relational Schema\n\nPrisma handles user profiles, subscription plans, API keys, and notification preferences, while the graph ledger indexes transactional relationships.\n\n## Database Schema\nThe database is defined in `prisma/schema.prisma`:\n\n```prisma\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\ngenerator client {\n  provider = \"prisma-client-js\"\n}\n\nmodel User {\n  id            String    @id @default(uuid())\n  address       String    @unique\n  role          String    @default(\"USER\")\n  createdAt     DateTime  @default(now())\n  apiKeys       ApiKey[]\n  subscription  Subscription?\n}\n\nmodel ApiKey {\n  id        String   @id @default(uuid())\n  keyHash   String   @unique\n  name      String\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt DateTime @default(now())\n  expiresAt DateTime?\n}\n\nmodel Subscription {\n  id        String   @id @default(uuid())\n  userId    String   @unique\n  user      User     @relation(fields: [userId], references: [id])\n  tier      String   @default(\"STANDARD\")\n  active    Boolean  @default(true)\n  endsAt    DateTime\n}\n```"
  },
  "developer/overview": {
    "title": "Developer Portal",
    "category": "Getting Started",
    "content": "# Developer Overview\n\nWelcome to the Sovereign Developer Portal. The API provides programmatic access to on-chain surveillance data, real-time alerts, and messaging capabilities.\n\n## Access Tiers\n*   **Standard:** REST API access, limited to 60 requests per minute.\n*   **Pro:** REST and WebSocket access, limited to 300 requests per minute. Includes basic entity resolution.\n*   **Institutional:** Full WebSocket access, infinite REST limits, and dedicated Kafka streaming capabilities.\n\nAPI keys can be generated and managed directly from the **Developer Settings** page in the dashboard."
  },
  "developer/auth": {
    "title": "Authentication",
    "category": "Getting Started",
    "content": "# API Authentication\n\nAll developer requests must authenticate using a valid API key passed in the headers.\n\n## Authentication Header\nInclude your API key as the value of the `x-sovereign-key` header:\n\n```http\nx-sovereign-key: wh_live_a1b2c3d4e5f6g7h8i9j0\n```\n\n## Security Guidelines\n*   **Keep Keys Secret:** Never expose your API keys in client-side applications (like frontend web apps or mobile apps). Route all requests through your backend.\n*   **Rotate Keys:** We recommend rotating API keys every 90 days.\n*   **Revocation:** If you suspect an API key is compromised, revoke it immediately via the settings dashboard."
  },
  "developer/api-keys": {
    "title": "API Keys",
    "category": "Getting Started",
    "content": "# Generating and Rotating API Keys\n\nManage your API keys from the Developer Settings dashboard or programmatically.\n\n## API Key Format\nAll keys are prefixed with `wh_` to identify their environment:\n*   `wh_live_...`: Active production keys.\n*   `wh_test_...`: Sandbox keys for development and testing.\n\n## Endpoint Restrictions (IP Whitelisting)\nTo secure your endpoints, you can restrict an API key to a set of IP addresses. Requests coming from other IPs will receive a `403 Forbidden` response."
  },
  "developer/rate-limits": {
    "title": "Rate Limits",
    "category": "Getting Started",
    "content": "# Rate Limits and WAF Rules\n\nSovereign API endpoints are protected by a Web Application Firewall (WAF) to prevent abuse and ensure high availability.\n\n## Rate Limit Headers\nEvery response includes headers detailing your current usage state:\n\n```http\nX-RateLimit-Limit: 300\nX-RateLimit-Remaining: 295\nX-RateLimit-Reset: 1779264060\n```\n\n## Limit Violations\nIf you exceed your allowed rate limit, the API returns a `429 Too Many Requests` response:\n\n```json\n{\n  \"error\": {\n    \"code\": \"RATE_LIMIT_EXCEEDED\",\n    \"message\": \"Too many requests. Please retry in 42 seconds.\",\n    \"retryAfter\": 42\n  }\n}\n```"
  },
  "developer/rest/overview": {
    "title": "REST API Overview",
    "category": "REST API",
    "content": "# REST API Reference\n\nThe REST API exposes endpoints for querying historical transaction alerts, market liquidity states, entity profiles, and chat message pipelines.\n\n## Server Settings\n*   **Production Base URL:** `https://api.humanidfi.com/v3`\n*   **Response Format:** Standard JSON, adhering to the JSend specification."
  },
  "developer/rest/whale-alerts": {
    "title": "Whale Alerts API",
    "category": "REST API",
    "content": "# Whale Alerts API\n\nQuery historical and real-time alerts.\n\n## GET /alerts/kinetic\nRetrieve high-volume capital flow events.\n\n### Query Parameters\n*   `minUsd` (number, optional): Minimum value in USD. Defaults to `100000`.\n*   `limit` (number, optional): Number of alerts to return. Max `100`.\n\n### Sample Request\n```bash\ncurl -H \"x-sovereign-key: wh_live_...\" \\\n     \"https://api.humanidfi.com/v3/alerts/kinetic?minUsd=5000000&limit=1\"\n```\n\n### Sample Response\n```json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"alerts\": [\n      {\n        \"id\": \"alert_1827c9\",\n        \"hash\": \"0x4a9b2c3d...\",\n        \"asset\": \"USDT\",\n        \"amount\": 25000000,\n        \"amountUsd\": 25000000,\n        \"fromAddress\": \"0x7a1b2...\",\n        \"toAddress\": \"0x9c3d4...\",\n        \"fromEntity\": \"Kraken Exchange\",\n        \"toEntity\": \"Wintermute\",\n        \"timestamp\": \"2026-05-19T18:30:00Z\",\n        \"velocity\": 0.85\n      }\n    ]\n  }\n}\n```"
  },
  "developer/rest/market-data": {
    "title": "Market Data API",
    "category": "REST API",
    "content": "# Market Data API\n\nRetrieve aggregated liquidity metrics.\n\n## GET /market/liquidity\nFetch capital flows and transaction velocities.\n\n### Query Parameters\n*   `chain` (string, optional): Filter by chain (e.g. `ethereum`, `arbitrum`).\n\n### Sample Request\n```bash\ncurl -H \"x-sovereign-key: wh_live_...\" \\\n     https://api.humanidfi.com/v3/market/liquidity?chain=ethereum\n```\n\n### Sample Response\n```json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"chain\": \"ethereum\",\n    \"totalVolume24h\": 8450000000,\n    \"whaleInflow24h\": 1250000000,\n    \"whaleOutflow24h\": 980000000,\n    \"netInflow\": 270000000,\n    \"velocityIndex\": 0.72\n  }\n}\n```"
  },
  "developer/rest/wallets": {
    "title": "Wallets & Entities API",
    "category": "REST API",
    "content": "# Wallets and Entities API\n\nResolve public addresses into known entity clusters.\n\n## GET /entities/resolve/{address}\nQuery the identity database for details on an address.\n\n### Sample Request\n```bash\ncurl -H \"x-sovereign-key: wh_live_...\" \\\n     https://api.humanidfi.com/v3/entities/resolve/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\n```\n\n### Sample Response\n```json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"address\": \"0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\",\n    \"entity\": {\n      \"id\": \"ent_jump_trading\",\n      \"name\": \"Jump Trading\",\n      \"category\": \"MarketMaker\",\n      \"riskScore\": 0.12,\n      \"confidence\": 0.99,\n      \"tags\": [\"HighFrequency\", \"Arbitrage\"]\n    }\n  }\n}\n```"
  },
  "developer/rest/forum": {
    "title": "Whale Chat Forum API",
    "category": "REST API",
    "content": "# Whale Chat REST API (XMTP Integration)\n\nThe **Whale Chat API** provides a powerful HTTP interface for programmatic interaction with the decentralized E2EE messaging network. Unlike consumer-grade messaging protocols, this API facilitates automated institutional execution, alerts, and highly secure multi-signature coordination.\n\n## Get Active Conversations\nRetrieve an active index of all E2EE conversation peers associated with your authenticated developer key.\n\n### Request\n\`\`\`http\nGET /v3/chat/conversations\nHost: api.humanidfi.com\nx-sovereign-key: wh_live_...\nAccept: application/json\n\`\`\`\n\n### Sample Response Payload\n\`\`\`json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"conversations\": [\n      {\n        \"peerAddress\": \"0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\",\n        \"alias\": \"Sovereign Admin\",\n        \"lastMessageAt\": \"2026-05-19T18:45:00Z\",\n        \"unreadCount\": 0,\n        \"isActive\": true\n      },\n      {\n        \"peerAddress\": \"0x0000000000000000000000000000000000000000\",\n        \"alias\": \"System Broadcasts\",\n        \"lastMessageAt\": \"2026-05-19T10:10:00Z\",\n        \"unreadCount\": 12,\n        \"isActive\": true\n      }\n    ]\n  }\n}\n\`\`\`\n\n## Fetch Historical Messages\nRetrieve and automatically decrypt historical message logs for a specific counterparty address.\n\n### Request\n\`\`\`http\nGET /v3/chat/messages?peerAddress=0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5&limit=50&sort=desc\nHost: api.humanidfi.com\nx-sovereign-key: wh_live_...\nAccept: application/json\n\`\`\`\n\n### Sample Response Payload\n\`\`\`json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"messages\": [\n      {\n        \"id\": \"msg_01h37b8c...\",\n        \"sender\": \"0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\",\n        \"recipient\": \"0x7a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t\",\n        \"content\": \"A critical liquidity shift is preparing on Arbitrum. GMX perpetual pools are rapidly adjusting their GLP weighting.\",\n        \"timestamp\": \"2026-05-19T18:45:00Z\",\n        \"status\": \"delivered\"\n      }\n    ],\n    \"pagination\": {\n      \"hasMore\": false,\n      \"nextCursor\": null\n    }\n  }\n}\n\`\`\`\n\n## Publish Encrypted Message\nSend a highly secure, encrypted message programmatically. The API executes the X3DH key exchange against the recipient's public pre-keys, encrypts the payload, and signs the envelope before publishing it to the network.\n\n### Request\n\`\`\`http\nPOST /v3/chat/send\nHost: api.humanidfi.com\nx-sovereign-key: wh_live_...\nContent-Type: application/json\n\`\`\`\n\n### Request Body\n\`\`\`json\n{\n  \"peerAddress\": \"0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\",\n  \"message\": \"System diagnostic complete. All 24 global edge nodes are synchronized and validating headers.\"\n}\n\`\`\`\n\n### Sample Response Payload\n\`\`\`json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"messageId\": \"msg_87b2c9a1...\",\n    \"recipient\": \"0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\",\n    \"timestamp\": \"2026-05-19T18:50:00Z\",\n    \"networkConfirmations\": 1\n  }\n}\n\`\`\`\n\n## Error Handling\nWhen interacting with the Chat API, common error codes include:\n*   \`400 Bad Request\`: The recipient address has never activated their XMTP profile, so pre-keys are unavailable.\n*   \`401 Unauthorized\`: Missing or invalid \`x-sovereign-key\`.\n*   \`429 Too Many Requests\`: Message broadcast rate limits exceeded (max 10 msgs/second for Pro tiers)."
  },
  "developer/rest/subscriptions": {
    "title": "Subscriptions API",
    "category": "REST API",
    "content": "# Subscriptions API\n\nManage billing and usage tiers programmatically.\n\n## GET /subscriptions/status\nRetrieve subscription info for the active user account.\n\n### Sample Response\n```json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"tier\": \"PRO\",\n    \"status\": \"active\",\n    \"expiresAt\": \"2026-08-19T00:00:00Z\",\n    \"monthlyLimit\": 1000000,\n    \"usageThisMonth\": 245000\n  }\n}\n```"
  },
  "developer/rest/transactions": {
    "title": "Transactions API",
    "category": "REST API",
    "content": "# Transactions API\n\nAccess raw, uncensored transaction traces.\n\n## GET /tx/trace/{hash}\nFetch detailed internal calls and execution steps for a specific transaction hash.\n\n### Sample Request\n```bash\ncurl -H \"x-sovereign-key: wh_live_...\" \\\n     https://api.humanidfi.com/v3/tx/trace/0x95d823...\n```\n\n### Sample Response\n```json\n{\n  \"status\": \"success\",\n  \"data\": {\n    \"hash\": \"0x95d823...\",\n    \"blockNumber\": 21004502,\n    \"gasUsed\": 85000,\n    \"calls\": [\n      {\n        \"type\": \"CALL\",\n        \"from\": \"0x...\",\n        \"to\": \"0x...\",\n        \"value\": \"0\",\n        \"input\": \"0xa9059cbb...\"\n      }\n    ]\n  }\n}\n```"
  },
  "developer/ws/connection": {
    "title": "WS Connection",
    "category": "WebSocket API",
    "content": "# WebSocket Connection\n\nEstablish persistent, low-latency WebSocket connections for real-time telemetry.\n\n## Connection URL\n`wss://stream.humanidfi.com/v3/connect?key=YOUR_API_KEY`\n\n## Connection Handshake\nUpon successful handshake, the server sends a confirmation message:\n\n```json\n{\n  \"event\": \"connection_established\",\n  \"data\": {\n    \"socketId\": \"sock_01h...\",\n    \"authorized\": true\n  }\n}\n```"
  },
  "developer/ws/channels": {
    "title": "WS Channels",
    "category": "WebSocket API",
    "content": "# WebSocket Channels\n\nAvailable data feeds for real-time subscriptions.\n\n## Available Channels\n*   `mempool_eth`: Emits raw Ethereum mempool transactions.\n*   `alerts_kinetic`: Emits parsed high-volume transactions as they are detected.\n*   `orderbook_shifts`: Emits large limit order book modifications on supported DEXes.\n\n## Subscription Frame\nTo subscribe to a channel, send a subscribe payload:\n\n```json\n{\n  \"op\": \"SUBSCRIBE\",\n  \"channels\": [\"alerts_kinetic\"],\n  \"params\": {\n    \"minUsd\": 10000000\n  }\n}\n```"
  },
  "developer/ws/events": {
    "title": "WS Event Schemas",
    "category": "WebSocket API",
    "content": "# WebSocket Event Schemas\n\nEvent payloads emitted by the WebSocket gateway.\n\n## KINETIC_ALERT Event\nPayload structure for the `alerts_kinetic` channel:\n\n```json\n{\n  \"event\": \"KINETIC_ALERT\",\n  \"channel\": \"alerts_kinetic\",\n  \"timestamp\": 1779264100,\n  \"data\": {\n    \"hash\": \"0x4a7c...\",\n    \"asset\": \"USDC\",\n    \"amountUsd\": 18500000,\n    \"fromEntity\": \"Binance Hot Wallet\",\n    \"toEntity\": \"Cumberland\",\n    \"velocity\": 0.92\n  }\n}\n```"
  },
  "developer/sdk/typescript": {
    "title": "TypeScript SDK",
    "category": "SDKs",
    "content": "# TypeScript SDK Reference\n\nInitialize the SDK and interact with our endpoints in TypeScript.\n\n## Installation\n```bash\nnpm install @sovereign/whale-sdk\n```\n\n## Quick Start Example\nInitialize the client and resolve an entity:\n\n```typescript\nimport { SovereignClient } from '@sovereign/whale-sdk';\n\nconst client = new SovereignClient({\n  apiKey: process.env.SOVEREIGN_API_KEY || ''\n});\n\nasync function run() {\n  const entity = await client.entities.resolve('0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5');\n  console.log('Resolved Entity:', entity.name, 'Category:', entity.category);\n}\n\nrun().catch(console.error);\n```\n\n## Whale Chat Interface\nYou can send encrypted messages to other addresses using the SDK:\n\n```typescript\n// Send an encrypted Whale Chat message via the SDK\nawait client.chat.sendMessage({\n  peerAddress: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',\n  message: 'Security alert: Outflow detected'\n});\n```"
  },
  "developer/sdk/python": {
    "title": "Python SDK",
    "category": "SDKs",
    "content": "# Python SDK Reference\n\nProgrammatic access to the API via Python.\n\n## Installation\n```bash\npip install sovereign-whale-sdk\n```\n\n## Quick Start Example\nInitialize the client and retrieve alerts:\n\n```python\nfrom sovereign_sdk import SovereignClient\nimport os\n\nclient = SovereignClient(\n    api_key=os.environ.get(\"SOVEREIGN_API_KEY\")\n)\n\nalerts = client.alerts.get_kinetic(\n    min_usd=10000000,\n    limit=5\n)\n\nfor alert in alerts:\n    print(f\"Alert {alert.id}: {alert.amount_usd} USD of {alert.asset} moved.\")\n```"
  },
  "developer/sdk/webhooks": {
    "title": "Webhook Guide",
    "category": "SDKs",
    "content": "# Webhook Integration\n\nWebhooks allow you to receive HTTP POST payloads when specific monitored alerts trigger.\n\n## Configure a Webhook Endpoint\n1.  Navigate to **Developer Settings** > **Webhooks**.\n2.  Click **Add Endpoint**.\n3.  Enter your server's listener URL (e.g. `https://api.yourdomain.com/v1/webhooks`).\n4.  Select the events to subscribe to.\n5.  Copy your Webhook Secret Key (`whsec_...`).\n\n## Verifying Signatures\nEvery webhook request contains a signature header, `x-sovereign-signature`. You must verify this signature to ensure the request originated from our server:\n\n```typescript\nimport crypto from 'crypto';\n\nexport function verifyWebhook(\n  payload: string,\n  signature: string,\n  secret: string\n): boolean {\n  const hmac = crypto.createHmac('sha256', secret);\n  const digest = hmac.update(payload).digest('hex');\n  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));\n}\n```"
  },
  "developer/sdk/changelog": {
    "title": "SDK Changelog",
    "category": "SDKs",
    "content": "# SDK Changelog\n\n## v3.0.0 (May 2026)\n*   **Whale Chat Integration:** Added full support for programmatic E2EE messaging via XMTP node wrappers.\n*   **Neo4j Graph Queries:** Expose Cypher query execution for Institutional tier clients.\n*   **Arbitrum Native Support:** Optimized telemetry feeds on Arbitrum and Base.\n\n## v2.4.0 (March 2026)\n*   **HMAC Webhook Signatures:** Upgraded webhook security to use standard SHA256 timing-safe signatures.\n*   **Rate Limit Handlers:** SDK now automatically handles HTTP 429 retries using exponential backoff."
  },
  "operator/overview": {
    "title": "Node Operator Overview",
    "category": "Getting Started",
    "content": "# Node Operator Overview\n\nWelcome to the Sovereign Node Operator Portal. By running a node, you help secure, index, and distribute on-chain telemetry to our users.\n\n## Node Role\nNodes query blockchain networks, decode transactions, and stream structured data to the Neo4j graph cluster.\n\n## Incentive Structure\nOperators earn a percentage of transaction fees processed by the network. Yield is calculated based on:\n*   **Uptime:** Monitored 24/7.\n*   **Fidelity:** Data must match the consensus output of other nodes.\n*   **Bandwidth:** Rate of blocks processed and synchronized."
  },
  "operator/prerequisites": {
    "title": "Operator Prerequisites",
    "category": "Getting Started",
    "content": "# Hardware & Network Requirements\n\nSovereign Node instances must meet the following hardware criteria to prevent latency penalties.\n\n## Server Specifications\n*   **CPU:** 8 Cores (AMD EPYC or Intel Xeon recommended).\n*   **RAM:** 32 GB DDR4 ECC.\n*   **Storage:** 2 TB NVMe Gen4 SSD (minimum 5000 IOPS write speed).\n*   **Network:** 1 Gbps symmetric fiber connection.\n\n## Firewall Configuration\nEnsure the following ports are open:\n*   `30303` (TCP/UDP): P2P Node Discovery.\n*   `8545` (TCP): RPC Interface (restrict access to localhost/internal network).\n*   `9090` (TCP): Prometheus Telemetry."
  },
  "operator/setup/node": {
    "title": "Running a Full Node",
    "category": "Setup",
    "content": "# Deploying a Full Node\n\nDeploy a full indexing node using Docker Compose.\n\n## 1. Clone the Node Repository\n```bash\ngit clone https://github.com/atfortyseven/sovereign-node.git\ncd sovereign-node\n```\n\n## 2. Edit Configuration\nCopy the template configuration file:\n```bash\ncp config.example.toml config.toml\n```\nEdit `config.toml` to add your Ethereum RPC URL and operator address.\n\n## 3. Run the Node\nStart the containers in detached mode:\n```bash\ndocker compose -f docker-compose.prod.yml up -d\n```\n\nVerify logs:\n```bash\ndocker compose logs -f sovereign-node\n```"
  },
  "operator/setup/sequencer": {
    "title": "Running a Sequencer",
    "category": "Setup",
    "content": "# Running a Sequencer\n\nSequencers are responsible for collecting, ordering, and batching state transactions before submitting proofs to the main L1 chain.\n\n## Setup Requirements\nRunning a sequencer requires sub-millisecond network proximity to mainnet RPC nodes. Sequencers must be deployed in high-bandwidth cloud regions (AWS us-east-1 or GCP us-central1).\n\n## Deployment CLI Command\n```bash\n./sovereign-node sequencer start \\\n  --private-key-file /etc/sovereign/keys/seq.key \\\n  --gas-price-multiplier 1.15\n```"
  },
  "operator/setup/prover": {
    "title": "Running a Prover",
    "category": "Setup",
    "content": "# Running a ZK Prover\n\nProvers generate mathematical proofs verifying execution states without exposing underlying data.\n\n## Hardware Specifications\nGenerating ZK proofs is GPU-intensive.\n*   **GPU:** Nvidia A100 or H100 with minimum 40GB VRAM.\n*   **System Memory:** 128 GB RAM.\n\n## Execution\nStart the prover daemon:\n```bash\n./sovereign-node prover start --threads 16 --gpu-id 0\n```"
  },
  "operator/setup/source": {
    "title": "Building from Source",
    "category": "Setup",
    "content": "# Compiling from Source\n\nWe compile the node software from source using Rust.\n\n## Prerequisites\n*   Rust 1.75 or higher.\n*   C++ Compiler (clang/gcc).\n*   OpenSSL development libraries.\n\n## Build Script\n```bash\n# Install dependencies (Ubuntu example)\nsudo apt update && sudo apt install -y build-essential libssl-dev pkg-config\n\n# Clone and compile\ngit clone https://github.com/atfortyseven/sovereign-node.git\ncd sovereign-node\ncargo build --release\n\n# Run binaries\n./target/release/sovereign-node --version\n```"
  },
  "operator/setup/snapshots": {
    "title": "Snapshots & Syncing",
    "category": "Setup",
    "content": "# Snapshots and Fast Syncing\n\nSynchronizing a new node from genesis can take days. We publish daily state snapshots to allow fast sync in under 4 hours.\n\n## Download Snapshot\nRetrieve the snapshot file matching your target block number:\n\n```bash\nwget https://snapshots.humanidfi.com/mainnet/sovereign-db-block-21000000.tar.gz\n```\n\n## Extract and Hydrate\nStop your node, unpack the snapshot into your data directory, and restart the service:\n\n```bash\ntar -xzvf sovereign-db-block-21000000.tar.gz -C /var/lib/sovereign/data/\ndocker compose start\n```"
  },
  "operator/operation/monitoring": {
    "title": "Monitoring",
    "category": "Operation",
    "content": "# Telemetry & Monitoring\n\nMaintain high reliability by monitoring your node metrics.\n\n## Prometheus Integration\nNodes export Prometheus metrics on port `9090` by default:\n*   `sovereign_sync_block_height`: Current block height of the local ledger.\n*   `sovereign_peers_connected`: Number of active network peers.\n*   `sovereign_mempool_backlog`: Size of the local transaction mempool queue.\n\n## Grafana Dashboard\nA pre-configured dashboard template is available in the `/monitoring` folder of the node repository. Import it into your Grafana instance to monitor system resources (CPU, Memory, IOPS)."
  },
  "operator/operation/keystore": {
    "title": "Keystore Management",
    "category": "Operation",
    "content": "# Keystore Management\n\nValidator and operator keys are stored in encrypted JSON keystore files.\n\n## Creating a Keystore\nCreate a new key pair and export it as an encrypted JSON keystore:\n\n```bash\nsovereign-node keys generate --out /etc/sovereign/keys/operator.json\n```\nYou will be prompted to enter a password.\n\n## Loading Keys\nPass the password securely using environment variables or a password file:\n\n```bash\nsovereign-node start --keystore /etc/sovereign/keys/operator.json --password-file /etc/sovereign/.pass\n```"
  },
  "operator/operation/sequencer": {
    "title": "Sequencer Management",
    "category": "Operation",
    "content": "# Sequencer Management\n\nManage and monitor sequencer instances to ensure transaction batching proceeds without interruption.\n\n## Tuning Block Time\nAdjust sequencer block intervals in your settings to balance network throughput and gas fees:\n\n```toml\n[sequencer]\nblock_interval_ms = 250\nmax_batch_tx_count = 5000\n```"
  },
  "operator/operation/faq": {
    "title": "FAQs & Common Issues",
    "category": "Operation",
    "content": "# Operator FAQs\n\n### Why is my node falling behind block consensus?\nThis is typically caused by insufficient disk IOPS. Ensure your database data directory is stored on a high-speed NVMe Gen4 drive. Do not run the data directory over network-attached storage (NAS).\n\n### How do I check if my node is peers with other instances?\nRun the peer query CLI command:\n```bash\nsovereign-node peers list\n```"
  },
  "operator/reference/cli": {
    "title": "CLI Reference",
    "category": "Reference",
    "content": "# CLI Command Reference\n\nManaging node execution via the CLI.\n\n## Key Commands\n*   `sovereign-node status`: Displays sync state, peer count, and version.\n*   `sovereign-node keys import`: Imports validator keys from a backup file.\n*   `sovereign-node db compact`: Compresses the database to reclaim disk space."
  },
  "operator/reference/rpc": {
    "title": "Node JSON RPC API",
    "category": "Reference",
    "content": "# JSON-RPC API Reference\n\nInteract with your node locally using JSON-RPC requests on port `8545`.\n\n## Method: sovereign_clientVersion\nGet client version information.\n\n### Request Payload\n```json\n{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"sovereign_clientVersion\",\n  \"params\": [],\n  \"id\": 1\n}\n```\n\n### Response Payload\n```json\n{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 1,\n  \"result\": \"sovereign-node/v2.4.1/rust1.75\"\n}\n```"
  },
  "operator/reference/changelog": {
    "title": "Changelog",
    "category": "Reference",
    "content": "# Operator Changelog\n\n## v2.4.1 (April 2026)\n*   **DB Compaction Upgrade:** Compaction now releases disk space dynamically without requiring node restarts.\n*   **Peer Handshake Fix:** Fixed peer connection issues occurring on slow network segments."
  },
  "operator/reference/glossary": {
    "title": "Glossary",
    "category": "Reference",
    "content": "# Operator Glossary\n\n*   **Epoch:** A cycle of 32 blocks (approx. 6.4 minutes) used for validation metrics.\n*   **Slashing:** Cryptographic penalty where staked funds are burned due to node downtime or conflicting validator signatures.\n*   **Ingestor:** Thread pool that processes incoming mempool transactions."
  },
  "legal/terms-of-service": {
    "title": "Terms of Service",
    "category": "Legal",
    "content": "# Terms of Service\n\n**Last Updated:** May 2026\n\nWelcome to the Sovereign Protocol. By accessing the terminal or calling the API, you agree to these Terms of Service.\n\n## 1. Use of Services\nThe platform provides analytical and cryptographic tools for institutional actors. You agree to use the services in compliance with local regulations and secure your session keys.\n\n## 2. API Tiers and Suspensions\nWe reserve the right to suspend API keys or IP addresses that violate rate-limiting guidelines or participate in DDoS attacks."
  },
  "legal/privacy-policy": {
    "title": "Privacy Policy",
    "category": "Legal",
    "content": "# Privacy Policy\n\n**Last Updated:** May 2026\n\nWhale Alert Corporation respects the privacy of our institutional clients.\n\n## Data Minimization\nWe operate on a zero-trust model. We do not store:\n*   Email addresses.\n*   IP addresses tied to user wallets.\n*   Plaintext surveillance watchlists.\n\nAll configuration files are encrypted on the client side before submission."
  },
  "legal/cookie-policy": {
    "title": "Cookie Policy",
    "category": "Legal",
    "content": "# Cookie Policy\n\nWe use cookies strictly for session authorization and preferences.\n\n## Cookies Used\n*   `human_session`: Encrypted JWT used to authorize requests to dashboard pages.\n*   `theme_preference`: Stores dark/light mode configurations."
  },
  "legal/risk-disclosure": {
    "title": "Risk Disclosure",
    "category": "Legal",
    "content": "# Risk Disclosure\n\n**WARNING: Volatile Assets and Protocol Risks**\n\nInteracting with blockchain systems involves financial, cryptographic, and software risks.\n\n## Financial Risk\nOn-chain signals represent historical block states and are predictive models. They do not constitute financial advice.\n\n## Software Risk\nThe network interacts with decentralized protocols (XMTP, RPC Providers, L2 nodes) which may experience downtime or bugs."
  },
  "legal/whale-code": {
    "title": "Whale Code License",
    "category": "Legal",
    "content": "# Whale Code Licensing\n\nWhale Code is proprietary software licensed by Whale Alert Corporation. You may build, compile, and run Whale Code agents on your local nodes. Redistributing Whale Code compilers or modifying core library files is prohibited."
  },
  "legal/whitepaper": {
    "title": "Institutional Whitepaper",
    "category": "Legal",
    "content": "# Sovereign Whitepaper v3.1\n\nThe **Sovereign Whitepaper** provides a technical and mathematical breakdown of our Kinetic Heuristics Engine and Neo4j Akashic Ledger.\n\n## Document Sections\n1.  **Mempool Vector Calculations:** Formulating flow velocity and momentum.\n2.  **Entity Resolution Models:** Resolving wallet clusters in Neo4j.\n3.  **ZK-Liveness Proofs:** Cryptographic attestation details.\n\n[Download PDF v3.1 Specification](#)"
  }
};
