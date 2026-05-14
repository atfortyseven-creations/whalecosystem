"use client";

import React, { useState } from "react";

const AZTEC_PILLARS = [
  {
    index: "01",
    label: "Programmable Privacy Layer",
    protocol: "AZTEC L2 · ZK-ROLLUP · EVM-EQUIVALENT",
    body: "Aztec Network constitutes a cryptographic Layer 2 built atop Ethereum Mainnet, operating as a ZK-rollup with native programmable privacy. Unlike conventional rollups that publish transaction data to L1 in plaintext, Aztec compresses and verifies state transitions using recursive zero-knowledge proofs, enabling execution environments where both the inputs and the outputs of a computation remain provably private — without requiring trust in any intermediary."
  },
  {
    index: "02",
    label: "UltraPlonk Proving System",
    protocol: "PLONK · PEDERSEN HASHES · KZG COMMITMENTS",
    body: "The Aztec protocol is anchored by UltraPLONK, a universal and updateable zk-SNARK construction derived from the PLONK framework. UltraPLONK employs KZG polynomial commitments over the BN254 elliptic curve, enabling constant-size proofs regardless of circuit depth. The commitment scheme leverages Pedersen hashes for efficient in-circuit Merkle tree operations — a critical requirement for the note-based UTXO model that governs Aztec's private state."
  },
  {
    index: "03",
    label: "Noir: Domain-Specific Cryptography",
    protocol: "NOIR LANGUAGE · ACIR IR · BARRETENBERG",
    body: "Aztec's native circuit programming language, Noir, compiles to an intermediate representation (ACIR — Abstract Circuit Intermediate Representation) that is subsequently transpiled into arithmetic circuits solvable by the Barretenberg proving backend. Whale Alert Network's integration leverages Noir circuits to encode private query logic — enabling operators to formulate cryptographic proofs of on-chain knowledge without exposing surveillance strategies or target addresses to any external observer."
  },
  {
    index: "04",
    label: "Note Encryption & UTXO Model",
    protocol: "AZTEC NOTES · HYBRID ENCRYPTION · NULLIFIER TREE",
    body: "Private state in Aztec is modeled as encrypted notes: discrete value commitments appended to an append-only Merkle tree. Each note is encrypted under the recipient's public key using hybrid encryption (ECDH key exchange + symmetric cipher). Expenditure is proven via nullifiers — one-way hash derivatives that prevent double-spending without revealing which note was consumed. Whale Chat exploits this architecture to establish private channels that are cryptographically verifiable yet computationally opaque to external forensic analysis."
  },
  {
    index: "05",
    label: "Whale Chat Integration Architecture",
    protocol: "AZTEC.JS SDK · PRIVATE FUNCTION CALLS · FEE ABSTRACTION",
    body: "The Whale Chat's cryptographic authentication pipeline is designed for native Aztec.js SDK compatibility. Session establishment initiates a private function call circuit that commits the operator's ECDSA public key into an Aztec contract state without broadcasting the identity on-chain in readable form. Fee abstraction allows relayers to submit proofs on behalf of operators, preserving network-level anonymity at the transport layer while maintaining cryptographic accountability at the proof layer."
  },
  {
    index: "06",
    label: "Zero-Knowledge Surveillance Proofs",
    protocol: "ZK-ATTESTATIONS · RANGE PROOFS · MEMBERSHIP CIRCUITS",
    body: "The most fundamental operational requirement of the Whale Chat is the ability to prove knowledge of on-chain events without revealing the methodology of surveillance. Through Aztec-compatible ZK-attestation circuits, the system generates membership proofs demonstrating that a given wallet address is part of a classified watchlist, and range proofs certifying that a transfer volume exceeds institutional thresholds — all without disclosing the watchlist contents, the threshold parameters, or the surveillance history to any party, including the infrastructure layer itself."
  }
];

const SPECS = [
  { key: "Proving System", value: "UltraPLONK (PLONK + custom gates)" },
  { key: "Elliptic Curve", value: "BN254 (alt-bn128, 128-bit security)" },
  { key: "Commitment Scheme", value: "KZG Polynomial Commitments" },
  { key: "In-Circuit Hash", value: "Pedersen Hash Function" },
  { key: "Circuit Language", value: "Noir (→ ACIR → Barretenberg)" },
  { key: "State Model", value: "UTXO Notes + Nullifier Tree" },
  { key: "L1 Settlement", value: "Ethereum Mainnet (EIP-4844 blobs)" },
  { key: "Privacy Scope", value: "Inputs, Outputs, Execution Logic" },
];

export function AztecArchitectureSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section
      className="w-full bg-[#FAFAF8] border-t border-black/8"
      aria-label="Aztec Network Integration Architecture"
    >
      <div className="w-full max-w-[1750px] mx-auto px-5 sm:px-8 py-24 flex flex-col gap-16">

        {/* ── Section Header ── */}
        <div className="w-full max-w-[850px] mx-auto flex flex-col gap-6">
          <div className="border-b-[1.5px] border-black pb-3 flex items-end justify-between">
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-black">
              Cryptographic Infrastructure — Aztec Network Integration
            </h2>
            <a
              href="https://aztec.network"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[8px] uppercase tracking-[0.3em] text-black/30 hover:text-black transition-colors duration-300"
            >
              aztec.network ↗
            </a>
          </div>

          {/* Academic abstract */}
          <div className="flex flex-col gap-4 font-serif text-[13px] text-[#222] leading-relaxed text-justify">
            <p>
              The Whale Chat's cryptographic substrate is anchored to{" "}
              <strong>Aztec Network</strong> — the first general-purpose zero-knowledge Layer 2 on
              Ethereum with native programmable privacy. The selection of Aztec as the foundational
              cryptographic layer is not a commercial alignment; it is a precise engineering decision
              predicated on the irreducible requirement that institutional-grade on-chain surveillance
              must be itself <em>unobservable</em>.
            </p>
            <p>
              Conventional blockchain analytics infrastructure — regardless of its computational
              sophistication — operates in a transparent environment: queries are publicly attributable,
              watchlist membership is inferable from access patterns, and surveillance strategies can be
              reverse-engineered from transaction histories. Aztec eliminates this class of
              vulnerability by providing a proving environment in which <em>the act of knowing</em> can
              be separated from <em>the act of revealing</em>.
            </p>
          </div>
        </div>

        {/* ── Six Academic Pillars ── */}
        <div className="w-full max-w-[850px] mx-auto">
          <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm">
            {AZTEC_PILLARS.map((pillar) => {
              const isOpen = expanded === pillar.index;
              return (
                <button
                  key={pillar.index}
                  onClick={() => setExpanded(isOpen ? null : pillar.index)}
                  className="bg-white text-left flex flex-col sm:flex-row items-stretch group overflow-hidden hover:bg-[#FAFAF8] transition-colors duration-200 w-full"
                >
                  {/* Index column */}
                  <div className="w-full sm:w-[100px] bg-[#FAFAF8] group-hover:bg-[#f2f1eb] border-b sm:border-b-0 sm:border-r border-black/10 flex items-center justify-center p-4 shrink-0 transition-colors duration-200">
                    <span className="font-mono text-[22px] font-black text-black/15 leading-none select-none">
                      {pillar.index}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black text-left">
                        {pillar.label}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono text-[7px] uppercase tracking-widest text-black/30 bg-black/5 px-2 py-0.5 border border-black/8 text-left">
                          {pillar.protocol}
                        </span>
                        <span className="font-mono text-[10px] text-black/20 select-none">
                          {isOpen ? "−" : "+"}
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <p className="font-serif text-[12px] sm:text-[13px] text-[#333] leading-[1.85] text-justify border-t border-black/8 pt-3 mt-1">
                        {pillar.body}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Technical Parameters ── */}
        <div className="w-full max-w-[850px] mx-auto flex flex-col gap-0">
          <div className="border-b border-black pb-2 mb-0">
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/50 font-bold">
              Cryptographic Parameter Reference
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-black/10 border border-black/10 border-t-0">
            {SPECS.map((spec) => (
              <div key={spec.key} className="bg-white flex flex-col sm:flex-row items-stretch">
                <div className="w-full sm:w-[200px] bg-[#FAFAF8] border-b sm:border-b-0 sm:border-r border-black/8 px-4 py-3 flex items-center shrink-0">
                  <span className="font-mono text-[8px] uppercase tracking-wider text-black/45 font-bold">
                    {spec.key}
                  </span>
                </div>
                <div className="flex-1 px-4 py-3 flex items-center">
                  <span className="font-mono text-[10px] text-black font-black tracking-wide">
                    {spec.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Closing axiom ── */}
        <div className="w-full max-w-[850px] mx-auto border-l-2 border-black pl-5 flex flex-col gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-black/35 font-bold">
            Operational Axiom
          </span>
          <p className="font-serif text-[13px] text-[#444] leading-relaxed text-justify">
            In the architecture of institutional intelligence, the ultimate security property is not the
            encryption of data in transit, but the mathematical impossibility of proving{" "}
            <em>who surveils</em>, <em>what is surveilled</em>, and <em>when surveillance occurs</em>{" "}
            — even to a computationally unbounded adversary with access to all on-chain data. Aztec
            Network is the only production-grade system that provides this guarantee through verified
            cryptographic proofs rather than policy, jurisdiction, or trust.
          </p>
        </div> rather than policy, jurisdiction, or trust.
          </p>
        </div>

      </div>
    </section>
  );
}
