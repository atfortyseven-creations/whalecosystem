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

      {/* ── MASSIVE DOCUMENTATION CONTENT ── */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-8 md:px-16 pt-24 pb-48">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-32"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-black/50 mb-8">
            Technical Specification v3.0.0
          </div>
          <h1 className="text-[48px] sm:text-[64px] md:text-[80px] font-normal tracking-[-0.04em] leading-[1.05] mb-10 font-sans max-w-[900px]">
            The Architecture of Absolute Reality.
          </h1>
          <p className="text-[18px] md:text-[22px] leading-[1.6] text-black/70 font-light max-w-[750px]">
            This documentation provides the fundamental mathematical and cryptographic precepts required to interface with the Humanity Ledger Protocol. We do not provide simulated environments or sandbox endpoints; you are connecting directly to the real-time global telemetry mesh.
          </p>
        </motion.div>

        <div className="flex flex-col gap-32">
          
          {/* SECTION 1 */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              1. The Zero-Trust Ephemeral Handshake
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                Authentication within the Humanity Ledger is not based on archaic username and password paradigms, nor does it rely on centralized OAuth providers that harvest telemetry. Instead, we have implemented a strictly mathematical Ephemeral Handshake utilizing elliptic curve cryptography (ECDSA) and the secp256k1 curve.
              </p>
              <p>
                When a client application initiates a connection to our Edge nodes, it must generate a localized, strictly ephemeral keypair. The public key is transmitted to the server alongside a zero-knowledge proof of biometric unique humanity (such as a verified WorldID nullifier hash). The system verifies the proof without ever learning the biological identity of the operator.
              </p>
              <p>
                Once verified, the server signs a cryptographic challenge and returns it. The client signs the challenge with the ephemeral private key. This creates a session tunnel. The moment the WebSocket connection is severed or the browser tab is closed, the ephemeral keys are mathematically destroyed. There are no persistent sessions, no tracking cookies, and no database records of your connection. You are a ghost interacting with the protocol.
              </p>
            </div>
          </section>

          {/* SECTION 2 */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              2. Multi-Hop WebSocket Telemetry
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The primary method of data ingestion is through our globally distributed WebSocket mesh. Unlike traditional REST APIs which require constant polling and suffer from fundamental latency limits dictated by the speed of light and TCP handshakes, our WebSocket tunnel establishes a persistent, bi-directional, encrypted stream directly to the Redis and Kafka memory mesh.
              </p>
              <p>
                When an institutional actor moves capital on the Ethereum mainnet, the transaction enters the public mempool. Within 45 milliseconds, our terrestrial nodes ingest the raw hex data, decode the opcodes, and traverse the associated addresses through a Neo4j graph matrix. If the capital is distributed across multiple intermediary wallets (a common obfuscation tactic known as "smurfing" or "multi-hop distribution"), the graph matrix correlates these movements.
              </p>
              <p>
                This fully reconstructed graph is then serialized into a binary payload and pushed down the WebSocket tunnel to your local client. Your interface renders the multi-hop movement in real-time. To subscribe to this stream, you must send a highly specific subscription payload encoded in JSON, containing the signature of your ephemeral session.
              </p>
              <div className="bg-black/5 p-8 rounded-2xl font-mono text-[13px] leading-relaxed text-[#050505]">
                <pre>{`{
  "action": "subscribe",
  "channel": "telemetry:graph_matrix",
  "filter": {
    "min_volume_usd": 1000000,
    "max_hop_depth": 7
  },
  "signature": "0x4b7c...a1f9"
}`}</pre>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              3. Z-Score Anomaly Matrix & EIP-1153
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                Standard analytical platforms observe static balances. The Humanity Ledger observes kinetic energy and thermodynamic shifts within the EVM. We achieve this by calculating the Z-Score of computational density within rolling 14-block windows.
              </p>
              <p>
                By monitoring the usage of specific opcodes, particularly those related to EIP-1153 Transient Storage (TSTORE and TLOAD), we can detect complex, multi-transaction atomic arbitrations and flash loan executions before they are fully resolved on public AMMs. The Z-Score represents the standard deviation of this computational intensity against the historical baseline of the past 24 hours.
              </p>
              <p>
                When the Z-Score exceeds a critical threshold (typically {`Z > 3.5`}), it indicates that a massive, coordinated institutional maneuver is underway. This data is exposed via our REST interface for historical querying, allowing quantitative models to backtest market reactions to these thermodynamic anomalies.
              </p>
            </div>
          </section>

          {/* SECTION 4 */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              4. End-to-End Encrypted Forum Transmissions
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The integration of the Whale Chat Forum into the Humanity Ledger is not a social feature; it is a decentralized intelligence coordination mechanism. To guarantee absolute freedom from algorithmic suppression and central censorship, every transmission must be mathematically verified.
              </p>
              <p>
                When you post a message, your local client hashes the content using SHA-256 and signs the hash with your ephemeral private key. The payload transmitted to the server contains the ciphertext, the public key, and the signature. The server verifies the signature against the public key, proving that the message was not tampered with in transit.
              </p>
              <p>
                The server has no mechanism to identify the biological entity holding the key. It only knows that a verified, unique human consciousness authored the transmission. This architecture provides an immutable, undeniably authentic, yet perfectly anonymous sanctuary for truth.
              </p>
            </div>
          </section>

          {/* SECTION 5 */}
          <section>
            <h2 className="text-[32px] md:text-[40px] font-normal tracking-tight mb-10 pb-6 border-b border-black/10">
              5. Edge Architecture & Graceful Degradation
            </h2>
            <div className="space-y-8 text-[16px] md:text-[18px] leading-[1.8] text-[#111111] font-light text-justify">
              <p>
                The Humanity Ledger is designed to survive hostile network environments. The physical infrastructure is deployed across a globally distributed mesh of Cloudflare Edge workers and isolated Railway containers. There is no central database that can be targeted or seized.
              </p>
              <p>
                If a regional node fails or is subjected to a state-level denial of service, the intelligence stream degrades gracefully. WebSocket connections automatically seamlessly reconnect to the nearest surviving node using geographic Anycast routing. The distributed Redis memory mesh ensures that no state is lost during node failure; the global consciousness of the network remains unbroken.
              </p>
              <p>
                Developers building on the protocol must implement robust exponential backoff strategies and handle the `1001 Going Away` WebSocket close frames gracefully, as nodes will routinely cycle to clear memory and prevent the accumulation of persistent tracking artifacts.
              </p>
            </div>
          </section>

        </div>
      </main>

      <SovereignFooter />
    </div>
  );
}
