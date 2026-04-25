import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function ForumGuidelinesPage() {
  return (
    <div className="flex flex-col w-full max-w-[900px] mx-auto pb-20">
      <div className="mb-8 border-b border-gray-200 pb-6 flex items-center gap-3">
        <Shield size={32} className="text-[#0088CC]" />
        <div>
          <h1 className="text-[28px] font-bold text-[#222222]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Institutional Guidelines
          </h1>
          <p className="text-gray-500 text-[15px] mt-1">
            The core tenets of the Sovereign Intelligence Corpus.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md shadow-sm p-6 sm:p-8 space-y-8">
        
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={20} className="text-green-600" />
            <h2 className="text-[18px] font-bold text-[#222222]">1. Absolute Signal, Zero Noise</h2>
          </div>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            The Sovereign Terminal is designed for institutional-grade intelligence. All posts must contribute actionable insights, structural analysis, or cryptographic research. Low-effort posts, "shilling," and speculative noise without data backing will be purged by the moderation consensus.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={20} className="text-red-600" />
            <h2 className="text-[18px] font-bold text-[#222222]">2. Zero-Tolerance for Manipulation</h2>
          </div>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            Coordinated market manipulation, false signal broadcasting, and Sybil attacks on the intelligence corpus are strictly prohibited. The Entity Graph actively monitors cross-account coordination. Violators will have their Golden Tickets permanently revoked and their addresses blacklisted across the Sovereign ecosystem.
          </p>
        </section>

        <section>
          <h2 className="text-[18px] font-bold text-[#222222] mb-3">3. Cryptographic Verification</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed mb-4">
            Where possible, claims regarding MEV strategies, on-chain yields, and execution logic should be backed by verified Etherscan transactions or Zero-Knowledge proofs. Do not trust; verify.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-[14px] text-gray-600 font-mono">
            "In a trustless ecosystem, your signature is your bond."
          </div>
        </section>

        <section>
          <h2 className="text-[18px] font-bold text-[#222222] mb-3">4. Professional Discourse</h2>
          <p className="text-gray-600 text-[15px] leading-relaxed">
            Debate ideas, not individuals. Ad hominem attacks, harassment, and toxic behavior degrade the quality of the intelligence network. Maintain an institutional and respectful tone at all times.
          </p>
        </section>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          Last updated: April 2026. These guidelines are enforced by the Sovereign Consensus Protocol.
        </div>
      </div>
    </div>
  );
}
