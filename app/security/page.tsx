import React from 'react';

export default function SecurityPage() {
  return (
    <div className="flex-1 w-full min-h-screen bg-white text-slate-900 py-16 font-sans">
      <div className="w-full max-w-[800px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">
            Security Policy & Bug Bounty
          </h1>
          <p className="text-lg text-slate-500">
            Our commitment to protocol security and vulnerability disclosure.
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Security Model</h2>
          <p>
            The Humanity Ledger operates on the principle of <strong>Zero-Trust Architecture</strong>. We do not trust the client, we do not trust the server, and we assume the network is hostile.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cryptography First:</strong> All private state transitions require a Zero-Knowledge proof generated locally via <code>@aztec/bb.js</code>.</li>
            <li><strong>No Centralized Custody:</strong> The platform servers do not hold, manage, or have access to user private keys or unspent notes.</li>
            <li><strong>Verifiable Contracts:</strong> All smart contracts and Noir circuits are open source and verifiable on-chain.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Bug Bounty Program</h2>
          <p>
            We strongly encourage security researchers, developers, and white-hat hackers to audit our codebase. We offer bounties paid in QDs and stablecoins for responsible disclosure of vulnerabilities.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-6 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 mt-0">Bounty Tiers</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-semibold text-red-600">Critical</span>
                <span className="text-slate-600">Up to $50,000 USD equivalent</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Vulnerabilities that allow unauthorized state transitions, fund theft, or exposure of private user data (e.g., bypassing Noir constraints).</p>
              
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-semibold text-orange-500">High</span>
                <span className="text-slate-600">Up to $10,000 USD equivalent</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Significant disruption of service or bugs that could lead to financial loss under specific edge cases.</p>
              
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-semibold text-blue-500">Medium</span>
                <span className="text-slate-600">Up to $2,000 USD equivalent</span>
              </div>
              <p className="text-sm text-slate-500">Denial of service, front-end vulnerabilities (XSS, CSRF) on critical domains.</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Responsible Disclosure</h2>
          <p>
            If you discover a vulnerability, please email <code>security@humanidfi.com</code>. We ask that you provide a minimum of 14 days for us to patch the vulnerability before public disclosure. We will respond to all reports within 24 hours.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">Audits</h2>
          <p>
            We are currently in the process of securing third-party audits for our Noir circuits and Solidity bridge contracts. Audit reports will be published here upon completion.
          </p>
        </div>
      </div>
    </div>
  );
}
