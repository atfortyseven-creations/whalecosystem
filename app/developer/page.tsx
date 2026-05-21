"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SovereignFooter } from "@/components/landing/SovereignFooter";

export default function DeveloperLanding() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden font-sans flex flex-col bg-white text-black selection:bg-black selection:text-white">
      
      {/* ── HEADER ── */}
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

      {/* ── MASSIVE API & INTEGRATION DOCUMENTATION ── */}
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
              6. Post-Quantum Cryptography & MEV Shielding
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The inevitable advent of fault-tolerant quantum computers running Shor’s algorithm poses a terminal threat to traditional Elliptic Curve Cryptography (ECC). The Humanity Ledger operates under a \"Store Now, Decrypt Later\" (SNDL) threat model. To future-proof our infrastructure, we are actively implementing hybrid key encapsulation mechanisms (KEMs), specifically integrating the NIST-standardized Kyber-768 lattice-based cryptography alongside standard ECDSA.
              </p>
              <p>
                When an institutional developer initiates a high-security webhook or opens a WebSocket tunnel for private execution, the handshake derives its forward-secrecy through both a classic Diffie-Hellman exchange and a post-quantum lattice problem. Even if a nation-state harvests our encrypted TCP packets today, they will not have the mathematical capability to decrypt them tomorrow.
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
                This capability allows quantitative hedge funds to deploy autonomous AI agents that trade entirely based on topological shifts within the graph matrix, reacting to the shape of the capital flow rather than the arbitrary price of an asset.
              </p>
            </div>
          </section>

        </div>
      </main>

      <SovereignFooter />
    </div>
  );
}
