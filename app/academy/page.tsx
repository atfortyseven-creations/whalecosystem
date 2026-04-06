import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sovereign Academy | EVM Thermodynamics & ZK Logic",
  description: "Educational matrix for the Sovereign Protocol. Master EVM trace monitoring, Zero-Knowledge proofs under Aztec L2, and transient state manipulation.",
};

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white/80 selection:bg-[var(--aztec-orchid)]/30 font-sans pb-32 pt-28 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-white/60 mb-8 bg-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--aztec-orchid)]" /> 
            The Sovereign Academy
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            EVM Thermodynamics & <br />
            <span className="text-[var(--aztec-orchid)]">Cryptographic Intelligence</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl leading-relaxed">
            Theoretical mastery is the prerequisite for deterministic execution. The modules below dictate the base physical limitations of decentralized protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AcademyModule 
                title="1. Aztec L2 Zero-Knowledge Circuits" 
                desc="Mastering fractional rollups and the circomlibjs boundary. Understanding how to prove authority without linking root addresses to the Terminal session."
            />
            <AcademyModule 
                title="2. EVM Mempool Thermodynamics" 
                desc="Execution traces based on EIP-2929. Tracking SLOAD and SSTORE geometrical gas costs to evaluate incoming institutional logic execution."
            />
             <AcademyModule 
                title="3. Transient State Analysis (EIP-1153)" 
                desc="Reentrancy architectures mapped via TSTORE memory. Decoding volatile variables used by top-tier Dark Pool smart contracts."
            />
            <AcademyModule 
                title="4. Neo4j Institutional Graph" 
                desc="Navigating deep-nested cross-chain associations. Tracing multi-step liquidity bridging directly from cold-storage into Hyperliquid margins."
            />
        </div>
      </div>
    </div>
  );
}

function AcademyModule({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="border border-white/10 p-8 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
            <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
            <p className="text-[14px] text-white/50 leading-relaxed font-mono">
                {desc}
            </p>
            <div className="mt-8 flex justify-end">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--aztec-orchid)]">Initialize Module &rarr;</span>
            </div>
        </div>
    );
}
