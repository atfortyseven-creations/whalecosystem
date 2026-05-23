import React from 'react';
import Link from 'next/link';

export default function WhitepaperPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 py-16 font-sans">
      <div className="w-full max-w-[900px] mx-auto px-6">
        <div className="mb-16 border-b border-slate-200 pb-8">
          <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-[#0088cc] uppercase tracking-wider">
            Technical Paper
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Humanity Ledger: Privacy-Native Social State
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl">
            A technical architecture for verifiable social interaction utilizing Zero-Knowledge proofs on the Aztec Network.
          </p>
        </div>

        <div className="prose prose-slate max-w-none prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-a:text-[#0088cc]">
          
          <h2>1. Introduction</h2>
          <p>
            The transition from read-only ledgers to programmable state has enabled complex decentralized applications. However, public state visibility fundamentally breaks user privacy. The Humanity Ledger is a privacy-first protocol designed to facilitate verifiable interactions without exposing user metadata, leveraging the <strong>Aztec Network</strong> and the <strong>Noir</strong> programming language.
          </p>

          <h2>2. System Architecture</h2>
          <p>
            Our architecture is divided into three layers: the Local Prover (Client), the Aztec L2 Network (State), and the Ethereum L1 (Settlement).
          </p>
          <ul>
            <li><strong>Client-Side Proving:</strong> We utilize <code>@aztec/bb.js</code> to generate Barretenberg proofs directly in the user's browser. This ensures that private inputs never leave the local environment.</li>
            <li><strong>Noir Circuits:</strong> The core logic of the application is written in Noir. We implement custom circuits for membership verification and reputation tracking.</li>
            <li><strong>State Management:</strong> The system employs Aztec's dual state model, segregating public state (e.g., global topic indexes) from private state (e.g., individual user balances and reputation notes).</li>
          </ul>

          <h2>3. Zero-Knowledge Primitives</h2>
          <p>
            To achieve absolute privacy, we rely on the UTXO (Unspent Transaction Output) model enforced by Aztec's private state trees.
          </p>
          
          <h3>3.1 Private Notes & Nullifiers</h3>
          <p>
            User interactions (likes, votes, transactions) are represented as encrypted notes. To prevent double-spending or replay attacks, each consumed note generates a unique <strong>nullifier</strong>. The network verifies that the nullifier has not been previously emitted without revealing which specific note is being consumed.
          </p>

          <h3>3.2 Authorization Witnesses (AuthWit)</h3>
          <p>
            Traditional DApps require explicit, visible ECDSA signatures for every action, linking the action directly to the public key. We employ Aztec's <code>AuthWit</code> standard, allowing an account contract to authenticate actions on behalf of the user using zero-knowledge proofs, obfuscating the execution trace.
          </p>

          <h2>4. Tokenomics and Distribution (QDs)</h2>
          <p>
            The native utility token of the ecosystem is QDs. Unlike transparent ERC-20 tokens, QDs are deployed as an Aztec Token Contract, supporting both <code>shield</code> and <code>unshield</code> operations.
          </p>
          <p>
            The total supply is capped mathematically, with issuance governed by a strict decay curve modeled within the public state. Transfers occur entirely within the shielded pool via the <code>transfer_private</code> function, guaranteeing that observers cannot determine the sender, receiver, or amount of the transaction.
          </p>

          <h2>5. Security and Formal Verification</h2>
          <p>
            All critical circuits are subjected to fuzzing and static analysis. The smart contracts governing public state are designed with minimalistic surface areas. We actively maintain a public <Link href="/security">Security Policy</Link> and a bug bounty program.
          </p>

          <div className="mt-20 p-8 bg-slate-50 border border-slate-200 rounded-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2 mt-0">Build with Us</h3>
            <p className="text-slate-600 mb-6">
              The Humanity Ledger is open source. Review our code, audit our circuits, or contribute to the protocol.
            </p>
            <Link href="/developer" className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              Read Developer Documentation
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
