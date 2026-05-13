export const docContent: Record<string, { title: string; category: string; content: string }> = {
  'protocol/identity': {
    title: 'Sovereign Identity Protocol',
    category: 'Institutional Protocol',
    content: `
# Sovereign Identity & Neural Handshake

The **Sovereign Identity Protocol** is the definitive standard for institutional session bridging on the Whale Alert Protocol.

## The Neural Handshake
The "Neural Handshake" is a cryptographic synchronization mechanism that links a mobile wallet session with a PC terminal.

### Key Features
* **Zero-Knowledge Handshake**: Verify your identity without exposing your private keys to the PC environment.
* **Biometric Inheritance**: Secure your session using mobile biometric sensors (FaceID/TouchID).
* **Cross-Device Persistence**: Stay authenticated for 7 days via secure, encrypted cookies.

## Technical Orchestration
1. **QR Generation**: The PC generates a unique, short-lived session token.
2. **Mobile Signing**: The mobile device signs the token using the verified wallet address.
3. **Session Fulfillment**: The backend verifies the signature and issues an institutional session cookie to the PC.
    `
  },
  'protocol/intelligence': {
    title: 'Neural Intelligence Hub',
    category: 'Institutional Protocol',
    content: `
# Neural Intelligence Hub

The **Neural Hub** is the heart of the Whale Alert surveillance engine. It processes millions of raw transactions to distill high-conviction institutional signals.

## Signal Extraction
Using **Kinetic Heuristics**, the Hub identifies patterns of accumulation, distribution, and wash-trading across all major liquidity pools.

### intelligence Metrics
* **Whale Intensity (WI)**: A metric measuring the concentration of capital movement within a specific block.
* **Flow Velocity**: The speed at which assets are moving between exchange cold wallets.
* **Dark Pool Proximity**: Identification of transactions originating from or destined for institutional dark pools.
    `
  },
  'protocol/security': {
    title: 'Security & Anti-Phishing',
    category: 'Institutional Protocol',
    content: `
# Institutional Security Protocols

Whale Alert Corporation™ employs a multi-layered security architecture to protect institutional data and user privacy.

## Legendary Security Proxy
All outbound requests are routed through the **Legendary Security Proxy**, which obfuscates the terminal's IP and session metadata.

### Safeguards
* **Anti-Phishing Layer**: Automatic detection and blocking of malicious redirection attempts.
* **Titanium Gate**: A strict whitelisting system that prevents unauthorized access to private terminal areas.
* **Signature Verification**: Every significant action within the terminal requires a cryptographic signature from a verified sovereign device.
    `
  },
  'protocol/liquidity': {
    title: 'Liquidity & Dark Pool Analytics',
    category: 'Institutional Protocol',
    content: `
# Liquidity Analytics

The terminal provide deep visibility into global liquidity across L1 and L2 networks.

## Dark Pool Monitoring
Monitor private institutional order books and OTC desk movements that are invisible to standard explorers.

### Analytics Suite
* **L1/L2 Bridge Monitoring**: Track massive capital migrations between Ethereum, Base, Arbitrum, and Solana.
* **Liquidity Heatmaps**: Real-time visualization of where institutional capital is pooling.
    `
  },
  'protocol/compliance': {
    title: 'Institutional Audit & Compliance',
    category: 'Institutional Protocol',
    content: `
# Compliance & Audit Protocols

Whale Alert Corporation™ ensures that all telemetry and monitoring activities align with global institutional standards.

## Immutable Audit Trails
Maintain complete, encrypted logs of all surveillance activity for internal compliance and regulatory oversight.

### Compliance Features
* **ESG Alignment**: Monitoring for capital flows associated with verified green-energy and ethical initiatives.
* **Sanctioned Entity Filtering**: Real-time alerts for flows interacting with restricted sovereign addresses.
    `
  },
  'intro': {
    title: 'Institutional Overview',
    category: 'Guides',
    content: `
# Institutional Overview

Whale Alert Corporation™ is the global leader in high-fidelity on-chain data surveillance. 

## The Mission
Our mission is to provide sovereign entities with the tools required to navigate the complex landscape of global digital capital flows with absolute precision and security.
    `
  },
  'quickstart': {
    title: 'Quickstart (5 min)',
    category: 'Guides',
    content: `
# Platform Quickstart

Initialize your Sovereign Terminal session and execute your first query in under 5 minutes.

## 1. Cryptographic Handshake
Navigate to the Connect portal. If you are on a PC, use your mobile device to scan the QR code and authorize the session via ECDSA signature.

## 2. Global Mempool Access
Once authenticated, navigate to the Dashboard. The terminal will automatically synchronize with the Neo4j active memory graph.

## 3. First API Request
Generate an API key in your Settings panel and execute a test query:
\`\`\`bash
curl -H "Authorization: Bearer \$WHALE_KEY" https://api.humanidfi.com/v3/telemetry/ping
\`\`\`
    `
  },
  'platform/architecture': {
    title: 'Platform Architecture',
    category: 'Core Architecture',
    content: `
# Sovereign Architecture

The Sovereign Master Node infrastructure is designed for absolute deterministic reliability and zero-latency execution.

## The Tri-Layer Matrix
1. **Edge Ingestion**: Globally distributed Rust nodes listen directly to the Ethereum, Base, and Solana mempools.
2. **Kinetic Memory Mesh**: Incoming telemetry is streamed via Kafka into a distributed Redis/Neo4j graph for real-time clustering.
3. **Execution Terminal**: The frontend React/Next.js interface acts as a passive, zero-mock observer, rendering the state of the graph.

## Decentralization Posture
While the memory mesh is proprietary, all execution routing is handled locally by the user's wallet. The platform never holds custody of assets or private keys.
    `
  },
  'platform/auth': {
    title: 'Authentication (SIWE)',
    category: 'Core Architecture',
    content: `
# SIWE & Zero-Knowledge Authentication

Authentication on the Sovereign Protocol is strictly cryptographic. We do not use passwords.

## The EIP-4361 Standard
Sign-In with Ethereum (SIWE) provides a secure, standard way to authenticate.
1. The server generates a single-use \`Nonce\`.
2. The client signs a standard message containing the \`Nonce\`, \`Domain\`, and \`URI\`.
3. The server verifies the ECDSA signature against the provided \`Address\`.

## Biometric Liveness (V3)
For institutional access, the terminal requires a 3D ZK-Liveness attestation. This ensures the operator is biologically present and mitigates automated Sybil attacks.
    `
  },
  'developer/overview': {
    title: 'Developer Overview',
    category: 'Developer',
    content: `
# Developer Integration

Welcome to the Sovereign API. Our infrastructure provides programmatic access to the world's most sophisticated on-chain surveillance data.

## Access Tiers
* **Standard**: REST access, 60 requests/min.
* **Pro**: REST + WebSocket access, 300 requests/min.
* **Institutional**: Dedicated Kafka streams, infinite limits.

Navigate to your Dashboard > Settings to generate your \`wh_...\` API keys.
    `
  },
  'developer/api/overview': {
    title: 'REST API Reference',
    category: 'Developer',
    content: `
# REST API V3

The primary interface for historical queries, state fetching, and configuration.

## Base URL
\`https://api.humanidfi.com/v3\`

## Authentication
Pass your API key via the \`x-sovereign-key\` header.

## Core Endpoints
* \`/wallet/{address}/telemetry\`: Get historical flows.
* \`/mempool/pending\`: Query active institutional dark pool transactions.
* \`/zk-proof/verify\`: Validate a user's biological attestation.
    `
  },
  'developer/ws/connection': {
    title: 'WebSocket Streaming',
    category: 'Developer',
    content: `
# High-Frequency WebSocket Streams

For real-time telemetry, subscribe to our multiplexed WebSocket endpoints.

## Connection
\`wss://stream.humanidfi.com/v3/connect?token=YOUR_API_KEY\`

## Channels
Subscribe to channels using the \`SUBSCRIBE\` opcode:
\`\`\`json
{
  "op": "SUBSCRIBE",
  "channel": "whale_alerts_eth",
  "threshold": 5000000
}
\`\`\`
    `
  },
  'developer/sdk/typescript': {
    title: 'TypeScript SDK',
    category: 'Developer',
    content: `
# Sovereign TypeScript SDK

The official, fully typed SDK for Node.js and browser environments.

## Installation
\`\`\`bash
npm install @sovereign/whale-sdk
\`\`\`

## Usage
\`\`\`typescript
import { SovereignClient } from '@sovereign/whale-sdk';

const client = new SovereignClient({ apiKey: process.env.WHALE_KEY });

client.on('whaleTx', (tx) => {
  console.log(\`Massive transfer: \${tx.usdValue} on \${tx.chain}\`);
});
\`\`\`
    `
  },
  'operator/overview': {
    title: 'Node Operator Overview',
    category: 'Operator',
    content: `
# Node Operator Infrastructure

Become a foundational pillar of the Sovereign Network by deploying a full indexing node.

## Why Operate?
Node operators receive programmatic yield generated by the network's API fees, proportional to their uptime and verified data integrity.

## Node Types
1. **Archive Indexer**: Stores the full historical graph.
2. **Mempool Sentinel**: Monitors edge connections for pending transactions.
    `
  },
  'operator/prerequisites': {
    title: 'Hardware Prerequisites',
    category: 'Operator',
    content: `
# Hardware Requirements

Running a Sovereign Node requires institutional-grade hardware.

## Minimum Specifications (Mempool Sentinel)
* **CPU**: 8 Cores (e.g., AMD Ryzen 7 / Intel Core i7)
* **RAM**: 32 GB ECC
* **Storage**: 2 TB NVMe Gen4 SSD
* **Network**: 1 Gbps Symmetric Fiber

## Recommended Specifications (Archive Indexer)
* **CPU**: 32 Cores (e.g., AMD EPYC / Intel Xeon)
* **RAM**: 256 GB ECC
* **Storage**: 16 TB NVMe Gen5 RAID 0
* **Network**: 10 Gbps Dedicated Line
    `
  },
  'operator/setup/node': {
    title: 'Node Deployment Guide',
    category: 'Operator',
    content: `
# Deploying a Full Node

## 1. Clone the Repository
\`\`\`bash
git clone https://github.com/atfortyseven/sovereign-node.git
cd sovereign-node
\`\`\`

## 2. Configure Environment
Edit the \`.env.operator\` file and inject your staking wallet private key.

## 3. Initialize Docker Swarm
\`\`\`bash
docker compose -f docker-compose.prod.yml up -d
\`\`\`
The node will begin synchronizing the graph. This process may take up to 72 hours.
    `
  },
  'operator/monitoring': {
    title: 'Telemetry & Monitoring',
    category: 'Operator',
    content: `
# Node Monitoring

Maintain a 99.99% uptime to avoid cryptographic slashing.

## Grafana Dashboard
Every node instance ships with a pre-configured Grafana dashboard accessible at port \`3030\`.

## Critical Alerts
Set up alerting for:
* **Sync Delay**: If your node falls more than 50 blocks behind the mainnet.
* **Disk IO**: NVMe degradation can cause database corruption.
* **Memory Pressure**: Sudden spikes in RAM usage during high-volatility market events.
    `
  },
  'get-started': {
    title: 'Terminal Quickstart',
    category: 'Guides',
    content: `
# Get Started

Initialize your Legendary Terminal session in three steps.

1. **Connect Wallet**: Authenticate via MetaMask or WalletConnect.
2. **Perform Handshake**: Sync your PC screen with your mobile device.
3. **Calibrate Feed**: Set your surveillance filters for specific asset classes.
    `
  },
  'whale-code/overview': {
    title: 'Whale Code DSL',
    category: 'Whale Code',
    content: `
# Whale Code™ Overview

Whale Code is a proprietary, domain-specific language designed for high-frequency data surveillance. It bridges the gap between raw blockchain telemetry and autonomous agent logic.
    `
  },
  'whale-code/quickstart': {
    title: 'Quickstart (Whale Code)',
    category: 'Whale Code',
    content: `
# Quickstart (Whale Code)

Get your first surveillance script running in under 2 minutes.

\`\`\`whale
on flow(amount > $100M) {
  signal_terminal("Institutional Whale Detected");
}
\`\`\`
    `
  },
  'whale-code/memory': {
    title: 'ZK-Memory Layers',
    category: 'Whale Code',
    content: `
# Memory Management

Whale Code subagents utilize a multi-layered memory architecture.

* **Hot Memory**: Sub-millisecond access for real-time heuristics.
* **Cold Memory**: Persistent ZK-storage for historical pattern matching.
    `
  },
  'api/reference/agents': {
    title: 'Agent API Reference',
    category: 'API Reference',
    content: `
# Agent API

Manage and orchestrate institutional subagents via REST.

## Endpoints
* \`GET /v2/agents\`: List active subagents.
* \`POST /v2/agents\`: Deploy a new surveillance unit.
    `
  },
  'api/reference/tokens': {
    title: 'Access Tokens & Identity',
    category: 'API Reference',
    content: `
# Access Tokens

Manage corporate identity and API access layers.

## Generation
Tokens are generated via the **Neural Handshake Portal** and are cryptographically bound to your sovereign device.
    `
  },
  'pricing': {
    title: 'Sovereign Tiers',
    category: 'Guides',
    content: `
# Institutional Tiers

* **Elite**: $1B+ Flow monitoring, ZK-Privacy, 1ms Latency.
* **Pro**: Full surveillance suite, 10ms Latency.
    `
  },
  'tools': {
    title: 'Protocol Tools',
    category: 'Guides',
    content: `
# Tools & Utilities

The protocol provides a suite of tools for institutional developers.

* **Whale-CLI**: Terminal-based tracking.
* **Handshake-Bridge**: Secure device linking.
    `
  },
  'setup': {
    title: 'Infrastructure Setup',
    category: 'Guides',
    content: `
# Server Setup

Deploy the Whale Alert Protocol on your own institutional hardware.

## Docker Deployment
\`\`\`bash
docker run -p 3000:3000 whale-corporation/terminal:latest
\`\`\`
    `
  },
  'messages': { title: 'Neural Messages', category: 'Guides', content: '# Neural Messages\n\nEncrypted communication between sovereign subagents.' },
  'memory': { title: 'ZK-Memory', category: 'Guides', content: '# ZK-Memory\n\nPersistent and hot memory layers for autonomous units.' },
  'filesystem': { title: 'Sovereign Filesystem', category: 'Guides', content: '# Filesystem\n\nVirtual institutional filesystem for agent data storage.' },
  'agent-file': { title: 'AgentFile (.af)', category: 'Guides', content: '# AgentFile (.af)\n\nThe definitive configuration standard for sovereign agents.' },
  'providers': { title: 'Model Providers', category: 'Guides', content: '# Model Providers\n\nInstitutional integration with OpenAI, Anthropic, and local LLM nodes.' },
  'tutorials/first-steps': { title: 'First Steps', category: 'Tutorials', content: '# First Steps\n\nYour first 10 minutes in the Whale Alert Corporation environment.' },
  'tutorials/retrieval': { title: 'Advanced Retrieval', category: 'Tutorials', content: '# Advanced Retrieval\n\nExtracting signal from noise using RAG and Neural Hub heuristics.' },
  'tutorials/patterns': { title: 'Multi-Agent Patterns', category: 'Tutorials', content: '# Multi-Agent Patterns\n\nOrchestrating swarms of subagents for global market surveillance.' },
  'integrations': { title: 'Institutional Integrations', category: 'Advanced', content: '# Integrations\n\nConnecting Whale Alert to Bloomberg, Reuters, and proprietary bank feeds.' },
  'dev-tools': { title: 'Development Tools', category: 'Advanced', content: '# Dev Tools\n\nThe internal suite for building and debugging Whale Code subagents.' },
  'api/intro': { title: 'API Introduction', category: 'API Reference', content: '# API Introduction\n\nHigh-performance access to the world\'s most liquid telemetry.' },
  'api/sdks': { title: 'Client SDKs', category: 'API Reference', content: '# Client SDKs\n\nNative libraries for TypeScript, Python, and Rust.' },
  'api/reference/blocks': { title: 'Blocks API', category: 'API Reference', content: '# Blocks API\n\nAccess raw ledger state and block-level heuristics.' },
  'api/reference/archives': { title: 'Archives API', category: 'API Reference', content: '# Archives API\n\nHistorical telemetry spanning since the genesis of the protocol.' },
  'api/reference/mcp': { title: 'MCP Servers', category: 'API Reference', content: '# MCP Servers\n\nModel Context Protocol integration for AI-driven surveillance.' },
  'whale-code/skills': { title: 'Agent Skills', category: 'Whale Code', content: '# Agent Skills\n\nModular capabilities that can be dynamically loaded into subagents.' },
  'whale-code/hooks': { title: 'Deep Hooks', category: 'Whale Code', content: '# Deep Hooks\n\nDirect kernel-level integration with the Whale Alert monitoring engine.' },
  'whale-code/reference/commands': { title: 'Slash Commands', category: 'Whale Code', content: '# Slash Commands\n\nThe interface for human-to-agent terminal communication.' },
  'whale-code/reference/cli': { title: 'CLI Reference', category: 'Whale Code', content: '# CLI Reference\n\nCommand-line toolset for institutional DevOps.' },
  'api/reference/tools': { title: 'Tools API', category: 'API Reference', content: '# Tools API\n\nManage and call sovereign agent tools.' },
  'api/reference/runs': { title: 'Runs API', category: 'API Reference', content: '# Runs API\n\nMonitor and manage active execution runs.' },
  'api/reference/conversations': { title: 'Conversations API', category: 'API Reference', content: '# Conversations API\n\nSecure communication logs between agents and operators.' },
  'whale-code/reference/auto-loop': { title: 'Auto-Looping', category: 'Whale Code', content: '# Auto-Looping Protocols\n\nContinuous state re-evaluation at the node level.' },
  'whale-code/reference/docker': { title: 'Docker Reference', category: 'Whale Code', content: '# Docker Reference\n\nContainerization standards for sovereign subagents.' },
  'whale-code/reference/inner-workings': { title: 'Inner Workings', category: 'Whale Code', content: '# Inner Workings\n\nDeep dive into the kinetic flow engine and ZK-memory synchronization.' },
  'terms-of-service': {
    title: 'Terms of Service',
    category: 'Legal',
    content: `
# Terms of Service

**Last Updated:** May 2026

Welcome to the Whale Alert Network ("Platform"). By accessing or using the Platform, you agree to be bound by these Terms of Service.

## 1. Institutional Access
Access to the terminal is granted strictly to verified sovereign entities. You are responsible for maintaining the confidentiality of your EIP-4361 (SIWE) session credentials.

## 2. API Usage & Rate Limiting
API access is governed by your subscription tier. The Platform reserves the right to throttle or suspend access if usage exceeds the automated limits defined in the Developer Overview.

## 3. Data Integrity
While we employ advanced cryptographic primitives to ensure data fidelity, on-chain telemetry is provided "as is". We make no warranties regarding the absolute completeness of dark-pool liquidity feeds.

## 4. Node Operations
Operators participating in the decentralized network must adhere to the hardware and uptime requirements specified in the Operator documentation. Malicious behavior will result in stake slashing.
    `
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    category: 'Legal',
    content: `
# Privacy Policy

**Last Updated:** May 2026

Whale Alert Corporation™ respects the privacy of our institutional clients. This policy outlines our data handling practices.

## Zero-Knowledge Architecture
The Platform operates on a principle of absolute data minimization.

* **Identity:** We do not store email addresses or personal identifiers unless explicitly provided for billing. Authentication is handled entirely via ECDSA signatures.
* **Telemetry:** Your private queries, Watchlist configurations, and Neural Hub filters are encrypted client-side. The protocol cannot decipher your surveillance targets.

## Data Retention
Node operator IP addresses and telemetry metrics are retained for 14 days solely for network health diagnostics, after which they are permanently purged from the active cache.
    `
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    category: 'Legal',
    content: `
# Cookie Policy

The Whale Alert Platform uses cookies exclusively for secure session management and essential institutional functionality.

## Essential Cookies
* \`sovereign_handshake\`: An encrypted JWT that maintains your authenticated session across the terminal.
* \`theme_preference\`: Stores your dark/light mode UI configuration.

## Third-Party Tracking
We **do not** use third-party analytics, marketing trackers, or cross-site tracking pixels. Your surveillance activity remains entirely isolated within the Platform.
    `
  },
  'risk-disclosure': {
    title: 'Risk Disclosure',
    category: 'Legal',
    content: `
# Risk Disclosure

**WARNING: High-Volatility Environments**

The tools provided by the Whale Alert Network are designed for professional, institutional actors analyzing on-chain dynamics.

## 1. Protocol Risks
Interacting with decentralized networks, including L2 rollups and dark pools, involves inherent smart contract and consensus risks.

## 2. Signal Validity
Heuristic signals, including "Whale Intensity" and "Flow Velocity", are predictive models based on historical blockchain state. They do not constitute financial advice and are susceptible to manipulation by highly capitalized actors via wash-trading.
    `
  }
};
