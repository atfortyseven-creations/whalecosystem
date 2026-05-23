import React from 'react';

export default function ManifestoPage() {
  return (
    <div className="flex-1 w-full min-h-screen bg-white text-slate-900 py-16 font-sans">
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
            Privacy is a fundamental right that empowers individuals to selectively share their personal information in a secure and respectful manner.
          </p>

          <p>
            In the early days of distributed networks, public transparency was a necessary feature to establish trust. Every transaction and interaction was permanently inscribed on a public ledger for universal verification. While this successfully solved critical technical challenges, it unintentionally created an environment where personal financial data became entirely visible.
          </p>

          <p>
            We respectfully believe that personal financial privacy is an essential human right.
          </p>

          <p>
            When financial information is public by default, users may become vulnerable to targeted analysis and profiling. The foundational architecture of public ledgers has often treated user privacy as a secondary consideration, relying on complex external solutions to protect sensitive data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">The Zero-Knowledge Standard</h2>
          
          <p>
            We are honored to build upon the Aztec Network, as it represents a significant advancement in technological privacy. By utilizing zero-knowledge proofs (ZKPs), this infrastructure enables programmable privacy directly at the protocol level.
          </p>

          <p>
            The system we are deploying upholds a highly secure and respectful standard:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Privacy by Default:</strong> Your balances and transaction history remain encrypted. They are mathematically provable and secure, ensuring complete confidentiality.</li>
            <li><strong>Programmable Trust:</strong> Identity and reputation can be safely asserted without exposing underlying personal data. You may verify your participation in a community while fully protecting your identity.</li>
            <li><strong>Local Computation:</strong> Cryptographic proofs are safely generated on your own device. The network verifies the proof to ensure integrity, but it never accesses your private data.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">The Next Layer of the Web</h2>

          <p>
            The transition from a completely transparent web to a respectfully private web is a vital societal step forward. As digital interactions become increasingly integrated into our daily lives, the balance between necessary transparency and personal sovereignty must be carefully maintained.
          </p>

          <p>
            We are dedicated to building a highly secure, private, and polite foundation for human interaction on the internet.
          </p>

          <div className="mt-16 border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-500 italic">
              Built on Aztec Network. Secured by advanced cryptography.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
