import React from 'react';

export default function ManifestoPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 py-16 font-sans">
      <div className="w-full max-w-[800px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">
            The Financial Privacy Manifesto
          </h1>
          <p className="text-lg text-slate-500">
            A declaration for sovereignty in the programmable web.
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
          <p>
            Privacy is not secrecy; privacy is the power to selectively reveal oneself to the world.
          </p>

          <p>
            In the early days of the blockchain, transparency was a feature required to bootstrap trust in a trustless environment. Every transaction, every balance, every interaction was permanently inscribed on a public ledger for anyone to analyze. While this solved the double-spending problem, it created a surveillance apparatus unprecedented in human history.
          </p>

          <p>
            We believe that financial privacy is a fundamental human right.
          </p>

          <p>
            When financial data is public by default, users are vulnerable to targeted exploitation, front-running, and systemic profiling. The current architecture of public ledgers treats user privacy as an afterthought, an inconvenience to be solved with complex mixers or centralized custodians.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">The Zero-Knowledge Standard</h2>
          
          <p>
            We are building upon the Aztec Network because it represents a paradigm shift. By leveraging zero-knowledge proofs (ZKPs), Aztec allows for programmable privacy at the protocol level.
          </p>

          <p>
            The system we are deploying enforces a radical new standard:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Privacy by Default:</strong> Your balances and transaction history are encrypted. They are mathematically provable, yet practically invisible to the public.</li>
            <li><strong>Programmable Trust:</strong> Identity and reputation can be asserted without revealing the underlying data. You can prove you belong to a community without proving who you are.</li>
            <li><strong>Local Computation:</strong> Cryptographic proofs are generated client-side. The network verifies the proof, but it never sees the data.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">The Next Layer of the Web</h2>

          <p>
            The transition from a transparent web to a private web is not merely a technical upgrade; it is a societal necessity. As digital interactions become deeply intertwined with our physical lives, the boundary between public transparency and private sovereignty must be fiercely defended.
          </p>

          <p>
            We are not building another ledger. We are building a secure foundation for human interaction on the internet.
          </p>

          <div className="mt-16 border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-500 italic">
              Built on Aztec Network. Secured by cryptography.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
