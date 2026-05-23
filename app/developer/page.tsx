import React from 'react';
import Link from 'next/link';
import { Terminal, Code, Cpu, Shield, BookOpen, GitBranch } from 'lucide-react';

export default function DeveloperPage() {
  return (
    <div className="w-full min-h-screen bg-white text-slate-900 py-16 font-sans">
      <div className="w-full max-w-[1000px] mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-6">
            Developer Hub
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl">
            Build privacy-preserving applications on top of the Humanity Ledger using the Aztec Network stack and Noir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-[#0088cc]">
              <Terminal size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Getting Started</h3>
            <p className="text-slate-600 mb-4 text-sm">
              Learn how to spin up a local Aztec sandbox, deploy the QDs token contract, and interact with the private state.
            </p>
            <Link href="/developer/quickstart" className="text-[#0088cc] font-medium text-sm hover:underline">
              Read the Quickstart Guide &rarr;
            </Link>
          </div>

          <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-[#0088cc]">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Noir Circuits</h3>
            <p className="text-slate-600 mb-4 text-sm">
              Explore the core cryptographic circuits that power the Humanity Ledger. Learn how we prove membership without revealing identity.
            </p>
            <Link href="https://github.com/atfortyseven-creations/Humanity-Ledger" target="_blank" className="text-[#0088cc] font-medium text-sm hover:underline">
              View Circuits on GitHub &rarr;
            </Link>
          </div>

          <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-[#0088cc]">
              <Code size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">API Reference</h3>
            <p className="text-slate-600 mb-4 text-sm">
              Comprehensive API documentation for fetching public forum data, validating proofs, and querying network status.
            </p>
            <Link href="/api-docs" className="text-[#0088cc] font-medium text-sm hover:underline">
              View API Docs &rarr;
            </Link>
          </div>

          <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-[#0088cc]">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Security Architecture</h3>
            <p className="text-slate-600 mb-4 text-sm">
              Deep dive into the security model, nullifier trees, and how we handle front-running protection.
            </p>
            <Link href="/whitepaper" className="text-[#0088cc] font-medium text-sm hover:underline">
              Read the Architecture Paper &rarr;
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Resources</h2>
        
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <BookOpen size={20} className="text-slate-400" />
              <a href="https://docs.aztec.network/" target="_blank" rel="noreferrer" className="text-slate-700 hover:text-[#0088cc] font-medium">
                Aztec Network Official Documentation
              </a>
            </li>
            <li className="flex items-center gap-3">
              <BookOpen size={20} className="text-slate-400" />
              <a href="https://noir-lang.org/docs" target="_blank" rel="noreferrer" className="text-slate-700 hover:text-[#0088cc] font-medium">
                Noir Language Book
              </a>
            </li>
            <li className="flex items-center gap-3">
              <GitBranch size={20} className="text-slate-400" />
              <a href="https://github.com/AztecProtocol/aztec-packages" target="_blank" rel="noreferrer" className="text-slate-700 hover:text-[#0088cc] font-medium">
                Aztec Monorepo (GitHub)
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
