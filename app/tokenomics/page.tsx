import React from 'react';

export default function TokenomicsPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 py-16 font-sans">
      <div className="w-full max-w-[900px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">
            QDs Tokenomics & Distribution
          </h1>
          <p className="text-lg text-slate-500">
            Mathematical parameters and zero-knowledge issuance model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Max Supply</div>
            <div className="text-3xl font-bold text-slate-900">21,000,000</div>
            <div className="text-xs text-slate-500 mt-2">QDs</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Consensus</div>
            <div className="text-xl font-bold text-slate-900 mt-1">Proof of Contribution</div>
            <div className="text-xs text-slate-500 mt-2">Zero-Knowledge Validated</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Privacy Model</div>
            <div className="text-xl font-bold text-slate-900 mt-1">Aztec Shielded</div>
            <div className="text-xs text-slate-500 mt-2">UTXO Notes</div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Distribution Mechanics</h2>
          <p>
            The distribution of QDs is designed to reward early protocol contributors while ensuring long-term sustainability. The issuance is governed by a decaying algorithmic curve deployed within the Aztec public state.
          </p>

          <table className="min-w-full divide-y divide-slate-200 my-8">
            <thead>
              <tr>
                <th className="py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                <th className="py-3 text-left text-sm font-semibold text-slate-900">Allocation</th>
                <th className="py-3 text-left text-sm font-semibold text-slate-900">Vesting Schedule (On-Chain)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 text-sm text-slate-700 font-medium">Community Mining (Proof of Contribution)</td>
                <td className="py-3 text-sm text-slate-600">50% (10.5M)</td>
                <td className="py-3 text-sm text-slate-600">Algorithmic decay over 10 years</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-slate-700 font-medium">Ecosystem Treasury</td>
                <td className="py-3 text-sm text-slate-600">25% (5.25M)</td>
                <td className="py-3 text-sm text-slate-600">Locked via governance; 0% unlocked at TGE</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-slate-700 font-medium">Core Contributors</td>
                <td className="py-3 text-sm text-slate-600">15% (3.15M)</td>
                <td className="py-3 text-sm text-slate-600">4-year linear vesting, 1-year cliff</td>
              </tr>
              <tr>
                <td className="py-3 text-sm text-slate-700 font-medium">Liquidity Bootstrapping</td>
                <td className="py-3 text-sm text-slate-600">10% (2.1M)</td>
                <td className="py-3 text-sm text-slate-600">100% unlocked at TGE for AMM provision</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Privacy Architecture</h2>
          <p>
            Unlike traditional ERC-20 tokens where balances and transfers are public, QDs function as an <strong>Aztec Token Contract</strong>. 
          </p>
          <p>
            When a user receives QDs (e.g., as a reward for forum participation), the token is issued directly into the shielded pool. The user's wallet manages encrypted <em>notes</em>. A transfer involves proving the destruction of input notes and the creation of output notes summing to the same value, accompanied by a valid zero-knowledge proof.
          </p>
          <p>
            Observers on the blockchain can only verify that a mathematically valid transaction occurred; they cannot see the sender, receiver, or amount transferred.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Proof of Contribution</h2>
          <p>
            QDs are minted algorithmically based on verifiable network participation. Instead of proof-of-work (burning energy) or proof-of-stake (capital lockup), users generate Barretenberg proofs demonstrating they have authored high-quality content or provided network utility. These proofs are verified by the smart contract before authorizing the minting of new shielded tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
