"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SystemFooter } from "@/components/landing/SystemFooter";

export default function DeveloperLanding() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col bg-white text-black selection:bg-black selection:text-white">
      
      {/*  HEADER  */}
      <header className="sticky top-0 z-50 w-full py-6 px-8 flex justify-between items-center bg-white/95 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img src="/official-whale-monochrome.png" alt="Whale" className="w-full h-full object-contain" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] font-black">
            Scanner Humanity Ledger
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Developer Protocol
        </div>
      </header>

      {/*  MASSIVE API & INTEGRATION DOCUMENTATION  */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-8 md:px-16 pt-24 pb-48">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-black/50 mb-8">
            Technical Specification & Integration Manual
          </div>
          <h1 className="text-[48px] sm:text-[64px] md:text-[80px] font-normal tracking-[-0.04em] leading-[1.05] mb-10 font-sans max-w-[900px]">
            API Integration & Authentication Guide.
          </h1>
          <p className="text-[18px] md:text-[22px] leading-[1.6] text-black/70 font-light max-w-[850px]">
            This documentation provides the fundamental technical precepts required to interface with the Humanity Ledger Protocol. Here you will learn exactly how to generate your API keys, establish secure WebSocket connections, and route raw mempool data into your own applications.
          </p>
        </motion.div>

        <div className="flex flex-col gap-32">
          
          {/* STEP 1: OBTAINING API KEYS */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              1. Obtaining and Managing API Keys
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                To interface with the Humanity Ledger, every developer must first obtain a cryptographic API Key. We do not use traditional email/password registration to issue keys. Instead, API key generation is strictly bound to your decentralized identity and wallet signature to ensure maximum security and zero reliance on centralized databases.
              </p>
              <p>
                <strong>Step 1: Decentralized Authentication.</strong> Navigate to the developer dashboard and connect your Web3 wallet (MetaMask, WalletConnect, or Coinbase Wallet). You will be prompted to sign a standard SIWE (Sign-In with Ethereum) message. This signature mathematically proves ownership of the address without exposing any private data.
              </p>
              <p>
                <strong>Step 2: Key Generation.</strong> Once authenticated, navigate to the "API Keys" section within the developer portal. Click "Generate New Key". The system will issue a public `Client_ID` and a highly secure `Client_Secret`. <strong>CRITICAL:</strong> The `Client_Secret` is generated uniquely and displayed only once. It is not stored in plain text in our databases; we only store a salted hash of it. If you lose this secret, you must revoke the key and generate a new one.
              </p>
              <p>
                <strong>Step 3: Key Rotation and Scopes.</strong> We strongly recommend rotating your API keys every 90 days. When generating a key, you must assign strictly scoped permissions. Available scopes include `read:mempool`, `read:anomalies`, `write:forum`, and `read:zk_proofs`. Assigning the principle of least privilege ensures that if an API key is compromised in your environment, the potential attack surface is minimized.
              </p>
            </div>
          </section>

          {/* STEP 2: AUTHENTICATION */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              2. Request Authentication (Bearer Tokens)
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The Humanity Ledger APIs utilize standard Bearer Token authentication via HTTP headers. You must include your API Key in the `Authorization` header of every HTTP request you make to our REST endpoints.
              </p>
              <div className="bg-black/5 p-8 rounded-2xl font-mono text-[13px] leading-relaxed text-[#050505]">
                <pre>{`curl -X GET "https://api.humanityledger.com/v1/mempool/anomalies" \\
  -H "Authorization: Bearer hl_live_YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json"`}</pre>
              </div>
              <p>
                For high-security operations, we support <strong>Mutual TLS (mTLS)</strong> and request payload signing. If enabled in your dashboard, you must hash the body of your request using HMAC-SHA256 and your `Client_Secret`, sending the resulting hash in the `X-HL-Signature` header. The server will reject any request where the signature does not perfectly match the payload, rendering replay attacks and man-in-the-middle data tampering impossible.
              </p>
            </div>
          </section>

          {/* STEP 3: WEBSOCKET INTEGRATION */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              3. Initializing the WebSocket Connection
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                While the REST API is suitable for historical querying, the true power of the Humanity Ledger is its real-time WebSocket telemetry. The WebSocket API pushes raw mempool data, Z-score anomalies, and graph traversals directly to your application with sub-50ms latency.
              </p>
              <p>
                To establish a WebSocket connection, you must pass your API key as a query parameter during the initial handshake. Do not send the `Client_Secret` over WebSockets; only use the public `Client_ID` or a specifically generated Bearer token.
              </p>
              <div className="bg-black/5 p-8 rounded-2xl font-mono text-[13px] leading-relaxed text-[#050505]">
                <pre>{`const ws = new WebSocket("wss://stream.humanityledger.com/v1/realtime?api_key=YOUR_API_KEY");

ws.onopen = () => {
  // Subscribe to massive volume transfers
  ws.send(JSON.stringify({
    action: "subscribe",
    channel: "mempool.transfers",
    filters: { min_usd_value: 1000000 }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Whale Alert Detected:", data);
};`}</pre>
              </div>
              <p>
                <strong>Ping/Pong Heartbeats:</strong> The WebSocket server will dispatch a `ping` frame every 30 seconds to verify that your connection is alive. Your client must respond with a `pong` frame within 10 seconds. If a `pong` is not received, the server will assume a zombie connection and unceremoniously terminate the socket to preserve edge node memory.
              </p>
            </div>
          </section>

          {/* STEP 4: RATE LIMITS */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              4. Rate Limiting and Architecture
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                To guarantee stability for all millions of users across the global network, strict rate limits are enforced at the Edge layer via Cloudflare Workers and Upstash Redis. Every API key is allocated a specific computational quota, measured in Request Units (RU) per second.
              </p>
              <p>
                A standard REST API `GET` request consumes 1 RU. A complex graph traversal query may consume up to 50 RU. If you exceed your allocated quota, the API will respond with an HTTP `429 Too Many Requests` status code. The response headers will include `X-RateLimit-Reset`, which indicates the exact Unix timestamp when your quota will refresh.
              </p>
              <p>
                It is absolutely critical that developers implement <strong>Exponential Backoff</strong> algorithms in their code. If you receive a 429 response, your application must wait, doubling the delay between subsequent retries, to avoid overwhelming the Edge nodes and risking an automatic, temporary IP ban.
              </p>
            </div>
          </section>

          {/* STEP 5: SDKS */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              5. Official Client SDKs
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                To accelerate development and ensure absolute cryptographic correctness, we provide official, open-source SDKs for major programming environments. These SDKs automatically handle WebSocket reconnections, HMAC-SHA256 signature generation, and exponential backoff.
              </p>
              <p>
                Currently supported environments include:
                <br /><br />
                - <strong>Node.js / TypeScript</strong> (`npm install @humanityledger/sdk`)<br />
                - <strong>Python</strong> (`pip install humanityledger-sdk`)<br />
                - <strong>Rust</strong> (`cargo add humanityledger`)<br />
                - <strong>Go</strong> (`go get github.com/humanityledger/go-sdk`)
              </p>
              <p>
                We demand excellence from developers integrating with this protocol. The data you are accessing is the raw, unfiltered reality of global financial movements. Handle it with precision, security, and ethical responsibility.
              </p>
            </div>
          </section>

          {/* STEP 6: POST-QUANTUM THREAT MODELS */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              6. Post-Core Cryptography & MEV Shielding
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The inevitable advent of fault-tolerant core computers running Shors algorithm poses a terminal threat to traditional Elliptic Curve Cryptography (ECC). The Humanity Ledger operates under a \"Store Now, Decrypt Later\" (SNDL) threat model. To future-proof our infrastructure, we are actively implementing hybrid key encapsulation mechanisms (KEMs), specifically integrating the NIST-standardized Kyber-768 lattice-based cryptography alongside standard ECDSA.
              </p>
              <p>
                When an institutional developer initiates a high-security webhook or opens a WebSocket tunnel for private execution, the handshake derives its forward-secrecy through both a classic Diffie-Hellman exchange and a post-core lattice problem. Even if a nation-state harvests our encrypted TCP packets today, they will not have the mathematical capability to decrypt them tomorrow.
              </p>
              <p>
                Furthermore, the API exposes advanced <strong>MEV (Maximal Extractable Value) Shielding</strong> vectors. If your quantitative algorithm detects a Z-Score anomaly and issues a trade execution payload through our `POST /v1/execute` endpoint, the transaction is completely obfuscated from the public mempool. We route the signed payload through private RPC relays (such as Flashbots and Eden Network), ensuring your alpha is immune to sandwich attacks and generalized front-running.
              </p>
            </div>
          </section>

          {/* STEP 7: NEURAL GRAPH STATE VECTORS */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              7. Neural Graph State Vectors
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                A simple relational database cannot comprehend the fluid dynamics of institutional liquidity. The Humanity Ledger utilizes a decentralized Neo4j Graph Database, augmented by specialized tensor processing units, to calculate \"Neural Graph State Vectors.\" Every wallet is a node; every smart contract interaction is a multidimensional edge holding specific weights related to token velocity, gas limits, and historical correlations.
              </p>
              <p>
                Through the `/v1/graph/tensors` WebSocket channel, developers can subscribe to live vector embeddings. Instead of receiving raw transaction logs, your machine learning models receive pre-computed, normalized 512-dimensional vectors representing the current \"anxiety\" or \"accumulation\" state of the network. This eliminates the need for you to maintain massive local data pipelines; you simply ingest the mathematical reality directly into your neural networks.
              </p>
              <p>
                This capability allows quantitative hedge funds to deploy autonomous AI agents that trade entirely based on topological shifts within the graph grid, reacting to the shape of the capital flow rather than the arbitrary price of an asset.
              </p>
            </div>
          </section>

          {/* STEP 8: ERROR CODES & HANDLING */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              8. Error Codes and Structured Error Handling
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                Every response from the Humanity Ledger API follows a consistent JSON error schema. When a request fails, the response body will contain a structured object with a machine-readable <strong>error code</strong>, a human-readable <strong>message</strong>, and an optional <strong>details</strong> field containing specific field-level validation failures. You must always check the HTTP status code first, then parse the body.
              </p>
              <div className="bg-black/5 p-8 rounded-2xl font-mono text-[13px] leading-relaxed text-[#050505]">
                <pre>{`// Standard Error Response Structure
{
  "error": "INVALID_API_KEY",
  "message": "The provided API key does not match any active credential.",
  "request_id": "req_3K9mNpXvQw2cL7dRtJ8sYb",
  "timestamp": 1748472000,
  "docs": "https://humanidfi.com/developer/authentication"
}

// Field Validation Error (422)
{
  "error": "VALIDATION_FAILED",
  "message": "Request body failed schema validation.",
  "details": [
    { "field": "filters.min_usd_value", "issue": "Must be a positive integer greater than 0" },
    { "field": "channel", "issue": "Unknown channel identifier. Valid: mempool.transfers, anomalies.zscore" }
  ]
}`}</pre>
              </div>
              <p>
                The complete list of machine-readable error codes includes: <strong>INVALID_API_KEY</strong> (401), <strong>INSUFFICIENT_SCOPE</strong> (403), <strong>RATE_LIMIT_EXCEEDED</strong> (429), <strong>VALIDATION_FAILED</strong> (422), <strong>INTERNAL_NODE_ERROR</strong> (503), and <strong>PAYLOAD_SIGNATURE_MISMATCH</strong> (401). Building a robust client means handling all of these deterministically rather than treating all non-200 responses identically.
              </p>
              <p>
                We strongly recommend implementing a <strong>circuit breaker pattern</strong> in production systems. If your application receives 5 consecutive 503 responses from a specific API endpoint within a 60-second window, your circuit breaker should open, redirecting traffic to a cached fallback state and alerting your operations team, rather than continuing to hammer a degraded node.
              </p>
            </div>
          </section>

          {/* STEP 9: SIWE DEEP DIVE */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              9. Sign-In With Ethereum (SIWE)  Deep Technical Reference
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The SIWE protocol (defined in EIP-4361) is the authentication backbone of the Humanity Ledger. Unlike OAuth, SIWE does not require a password, a centralized identity provider, or a third-party server. The user's cryptographic signature is the proof of identity itself. Here is the full technical flow that our server executes every time a developer authenticates.
              </p>
              <p>
                <strong>Step 1  Nonce Request.</strong> Your client calls <code>GET /api/auth/nonce</code>. The server generates a cryptographically random, single-use nonce (32 bytes, base64url-encoded) and stores it server-side in Redis with a 5-minute TTL. The nonce is returned to the client. This prevents replay attacks where an attacker records a previous valid signature and resubmits it.
              </p>
              <div className="bg-black/5 p-8 rounded-2xl font-mono text-[13px] leading-relaxed text-[#050505]">
                <pre>{`// Full SIWE Message Structure (EIP-4361 Compliant)
humanidfi.com wants you to sign in with your Ethereum account:
0xYourWalletAddress

By signing, you confirm you are the authorized holder of this address
and consent to accessing the Humanity Ledger Developer API.

URI: https://humanidfi.com
Version: 1
Chain ID: 1
Nonce: aBcDeFgHiJkLmNoPqRsT
Issued At: 2026-05-21T06:00:00.000Z
Expiration Time: 2026-05-21T06:05:00.000Z`}</pre>
              </div>
              <p>
                <strong>Step 2  Client Signs the Message.</strong> The message above is presented to the user's wallet (MetaMask, WalletConnect, etc.) using the <code>personal_sign</code> RPC method (prefixes the message with <code>\x19Ethereum Signed Message:\n</code> per EIP-191, preventing signature reuse in transactions). The wallet returns a 65-byte ECDSA signature: 32 bytes R, 32 bytes S, and 1 byte V (the recovery identifier).
              </p>
              <p>
                <strong>Step 3  Server Verification.</strong> The client submits the original message text and the 65-byte signature to <code>POST /api/auth/verify</code>. The server uses <code>ecrecover</code> to reconstruct the signing address from the message hash and the signature. If the recovered address matches the claimed address, and the nonce has not been consumed yet, authentication succeeds. The nonce is immediately invalidated in Redis to prevent replay. A signed JWT and a secure session cookie are issued in the response.
              </p>
            </div>
          </section>

          {/* STEP 10: NEO4J GRAPH QUERIES */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              10. Neo4j Graph Database  Cypher Query Reference
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The Akashic Ledger is implemented as a property graph database using Neo4j. Every on-chain entity (wallet, smart contract, token, protocol) is a labeled <strong>Node</strong>. Every interaction (transfer, swap, approval, delegation) is a directed <strong>Relationship</strong> with properties (value, timestamp, gas). This structure allows queries that are impossible in relational databases, such as finding all capital flows within 3 hops of a specific address within the last 24 hours.
              </p>
              <div className="bg-black/5 p-8 rounded-2xl font-mono text-[13px] leading-relaxed text-[#050505]">
                <pre>{`// Find all wallets that have interacted with a known whale
// within 2 hops, in the last 7 days
MATCH (whale:Wallet { address: "0xABCDEF..." })
      -[:TRANSFERRED*1..2]->
      (related:Wallet)
WHERE related.last_seen > timestamp() - 604800000
RETURN related.address, 
       related.total_volume_usd,
       related.risk_score
ORDER BY related.total_volume_usd DESC
LIMIT 50;

// Detect circular capital flows (potential wash trading)
MATCH path = (start:Wallet)-[:TRANSFERRED*3..6]->(start)
WHERE ALL(r IN relationships(path) 
          WHERE r.timestamp > timestamp() - 86400000)
RETURN start.address, 
       length(path) as cycle_length,
       [r IN relationships(path) | r.value_usd] as flow_values
ORDER BY cycle_length ASC;`}</pre>
              </div>
              <p>
                Via the REST API, you can submit parameterized Cypher queries through the <code>POST /v1/graph/query</code> endpoint. Queries are sandboxed; you cannot execute write operations (CREATE, MERGE, DELETE) without a special elevated <code>write:graph</code> scope, which requires manual review and approval from the core team. All read queries are executed against a read-replica to protect the primary ledger's write performance.
              </p>
            </div>
          </section>

          {/* STEP 11: ZK PROOF VERIFICATION */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              11. Zero-Knowledge Proof Verification
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                For use cases requiring privacy-preserving verification  such as proving that a wallet holds more than a threshold balance without revealing the exact amount, or proving membership in a whitelist without revealing the specific address  the Humanity Ledger exposes a ZK proof pipeline built on <strong>SnarkJS</strong> and <strong>Circom</strong>-compiled arithmetic circuits.
              </p>
              <p>
                The workflow is as follows: a developer submits private inputs to the <code>POST /v1/zk/prove</code> endpoint. The server executes the witness calculation and proof generation using the pre-compiled circuit and trusted setup parameters. The resulting proof object (<code>proof.json</code>) and public signals (<code>public.json</code>) are returned. Any third party can then independently verify this proof against the verification key without learning anything about the private inputs.
              </p>
              <div className="bg-black/5 p-8 rounded-2xl font-mono text-[13px] leading-relaxed text-[#050505]">
                <pre>{`// Request a ZK proof that an address holds >= $1M
POST /v1/zk/prove
Authorization: Bearer hl_live_YOUR_API_KEY
Content-Type: application/json

{
  "circuit": "balance_threshold_v2",
  "private_inputs": {
    "wallet_address": "0xYourAddress",
    "threshold_usd": 1000000
  }
}

// Response
{
  "proof": { "pi_a": [...], "pi_b": [[...],[...]], "pi_c": [...] },
  "public_signals": ["1", "0x...merkle_root..."],
  "verification_key_url": "https://cdn.humanidfi.com/circuits/balance_threshold_v2.vk.json",
  "expires_at": 1748558400
}`}</pre>
              </div>
              <p>
                The verification key is public and immutable. It is derived from a multi-party computation (MPC) trusted setup ceremony in which independent participants contribute randomness. As long as at least one participant destroyed their secret contribution, the setup is secure. Humanity Ledger's trusted setup was conducted with 128 independent participants across 14 jurisdictions.
              </p>
            </div>
          </section>

          {/* STEP 12: DEPLOYING A NODE */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              12. Deploying a Humanity Ledger Node
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The Humanity Ledger is a permissionless network. Any operator can run a full node to contribute to mempool surveillance, validation, and data distribution. Running a node not only strengthens the network's decentralization but also entitles operators to a share of the protocol's data fees, distributed in the native governance token.
              </p>
              <p>
                <strong>Minimum Hardware Requirements:</strong> 16-core CPU (AMD EPYC or Intel Xeon preferred), 64 GB RAM, 4 TB NVMe SSD (read speeds above 3,000 MB/s), and a dedicated 1 Gbps symmetric internet connection with a static IP address. The node process maintains an in-memory graph of active mempool transactions and must be able to absorb 50,000+ events per second during peak market hours without dropping data.
              </p>
              <div className="bg-black/5 p-8 rounded-2xl font-mono text-[13px] leading-relaxed text-[#050505]">
                <pre>{`# Clone the node repository
git clone https://github.com/humanityledger/node.git
cd node

# Configure your environment
cp .env.example .env.node
# Set your ETHEREUM_RPC_URL, SIGNING_PRIVATE_KEY, and NODE_ID

# Install dependencies and build
npm install && npm run build:node

# Register your node on-chain (requires ETH for gas)
npm run register:node -- --stake 1000 # Stake 1000 HL tokens

# Start the node process
npm run start:node

# Verify node health
curl http://localhost:8080/health
# { "status": "SYNCED", "peers": 47, "mempool_events_per_second": 12400 }`}</pre>
              </div>
              <p>
                Once your node is registered and synced, it will automatically begin receiving peer-to-peer mempool data from existing nodes via an encrypted libp2p GossipSub mesh. Your node's data contributions are cryptographically signed with your node's ECDSA key, ensuring data provenance and integrity across the entire network. Malicious nodes that broadcast falsified data are automatically slashed by the on-chain governance contract, losing a portion of their staked tokens.
              </p>
            </div>
          </section>

        </div>
      </main>


      <SystemFooter />
    </div>
  );
}
