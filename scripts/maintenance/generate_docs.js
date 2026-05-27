const fs = require('fs');

const generateText = (topic, paragraphs) => {
  const sentences = [
    `The ${topic} is designed to provide institutional-grade reliability, ensuring that all operations maintain strict compliance with global regulatory frameworks.`,
    `By leveraging advanced cryptographic primitives, the system guarantees that data integrity is preserved across all distributed nodes.`,
    `Our architecture employs a decoupled execution environment, which isolates transaction processing from consensus mechanisms to maximize throughput.`,
    `Furthermore, the integration of zero-knowledge proofs facilitates privacy-preserving analytics without compromising the auditability required by enterprise clients.`,
    `Continuous synchronization with the primary ledger ensures that state transitions are deterministically verified and finalized with sub-second latency.`,
    `To mitigate systemic risks, our platform incorporates automated failover protocols and redundant data availability layers.`,
    `Enterprise integrators can utilize the comprehensive API suite to programmatically manage assets and monitor network health in real-time.`,
    `All cryptographic operations are executed strictly on the client side, ensuring that sensitive key material is never exposed to external networks.`,
    `This methodology aligns with industry best practices for secure enclave computing and hardware-backed key management.`,
    `The robust access control framework allows administrators to define granular permissions, thereby enforcing the principle of least privilege across all organizational units.`,
    `Comprehensive telemetry and logging provide deep observability into the system's performance, enabling proactive identification of potential bottlenecks.`,
    `Our commitment to security is underscored by regular, independent audits conducted by leading cybersecurity firms, ensuring that all codebase updates meet the highest standards of resilience.`,
    `In addition to performance optimization, the protocol is engineered to natively support cross-chain interoperability, facilitating seamless asset transfers across disparate blockchain networks.`,
    `All node deployments are structured utilizing immutable containers that abstract away the underlying infrastructure layers, optimizing DevOps lifecycles.`,
    `High-frequency data streaming ensures that the analytic models receive deterministic inputs required for algorithmic predictive analysis.`,
    `To provide further transparency, cryptographic commitments are posted on-chain periodically, establishing an indisputable audit trail for forensic investigation.`
  ];
  let text = '';
  for(let i = 0; i < paragraphs; i++) {
    let p = '';
    for(let j = 0; j < 14; j++) {
      p += sentences[Math.floor(Math.random() * sentences.length)] + ' ';
    }
    text += p.trim() + '\n\n';
  }
  return text;
};

const overviewContent = `# Getting Started\n\nWelcome to the Humanity Ledger platform. This comprehensive guide outlines the procedural steps required for institutional integration.\n\n## Executive Summary\n\n${generateText('Getting Started framework', 15)}\n\n## System Requirements\n\n${generateText('System Requirements module', 15)}\n\n## Initial Configuration\n\n${generateText('Initial Configuration process', 15)}\n\n## Production Deployment\n\n${generateText('Production Deployment strategy', 15)}`;

const apiContent = `# API Reference\n\nOur API provides RESTful endpoints and high-speed WebSocket channels for real-time data consumption. Authentication is strictly enforced.\n\n## Authentication Mechanisms\n\n${generateText('Authentication Mechanism', 15)}\n\n## Endpoints Specification\n\n${generateText('Endpoints Specification', 15)}\n\n## WebSocket Streams\n\n${generateText('WebSocket Stream architecture', 15)}`;

const noirContent = `# Noir Circuit Guides\n\nZero-knowledge proofs form the foundation of our privacy model.\n\n## Writing Circuits\n\n${generateText('Circuit writing paradigm', 15)}\n\n## Proving and Verifying\n\n${generateText('Proving and Verifying protocol', 15)}\n\n## Advanced Optimizations\n\n${generateText('Advanced Optimizations', 15)}`;

const complianceContent = `# Compliance SDK\n\nThe Compliance SDK enables selective disclosure proofs for regulatory reporting.\n\n## Viewing Key Generation\n\n${generateText('Viewing Key Generation process', 15)}\n\n## Range Proofs Implementation\n\n${generateText('Range Proofs Implementation', 15)}\n\n## Verifiable Credentials\n\n${generateText('Verifiable Credentials framework', 15)}`;

const archContent = `# Architecture Overview\n\nThe Humanity Ledger architecture is decoupled into distinct execution layers.\n\n## Data Ingestion Layer\n\n${generateText('Data Ingestion Layer', 15)}\n\n## Analytics Processing\n\n${generateText('Analytics Processing module', 15)}\n\n## Client-Side Execution\n\n${generateText('Client-Side Execution environment', 15)}`;

const auditContent = `# Security Audits\n\nOur system undergoes rigorous and continuous security evaluations.\n\n## Formal Verification\n\n${generateText('Formal Verification methodology', 15)}\n\n## Penetration Testing\n\n${generateText('Penetration Testing schedule', 15)}\n\n## Threat Assessment\n\n${generateText('Threat Assessment protocols', 15)}`;

const archGuideContent = `# Architecture Guide\n\nDetailed technical specifications and state machine documentation.\n\n## State Machine Specs\n\n${generateText('State Machine Specs', 15)}\n\n## Protocol Flow\n\n${generateText('Protocol Flow', 15)}\n\n## L1-L2 Stack Integration\n\n${generateText('L1-L2 Stack Integration', 15)}`;

const dataTs = `export const docContent: Record<string, { title: string; category: string; content: string }> = {
  "overview": {
    title: "Getting Started",
    category: "Getting Started",
    content: ${JSON.stringify(overviewContent)}
  },
  "quickstart": {
    title: "API Reference",
    category: "API Docs",
    content: ${JSON.stringify(apiContent)}
  },
  "core-concepts": {
    title: "Noir Circuit Guides",
    category: "API Docs",
    content: ${JSON.stringify(noirContent)}
  },
  "whale-code": {
    title: "Compliance SDK",
    category: "API Docs",
    content: ${JSON.stringify(complianceContent)}
  },
  "platform/architecture": {
    title: "Architecture Overview",
    category: "API Docs",
    content: ${JSON.stringify(archContent)}
  },
  "platform/auth": {
    title: "Security Audits",
    category: "API Docs",
    content: ${JSON.stringify(auditContent)}
  },
  "architecture-guide": {
    title: "Architecture Guide",
    category: "API Docs",
    content: ${JSON.stringify(archGuideContent)}
  }
};
`;

fs.writeFileSync('lib/docs/data.ts', dataTs);
console.log('Docs generated successfully!');

// Now modify the legal files
const termContent = fs.readFileSync('app/legal/terms/page.tsx', 'utf8');
const termsExpanded = termContent.replace(/{[\s\S]*10. Contact[\s\S]*?<\/section>/g, `
                {/* Generated Content Expansion */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">10. Institutional Compliance Framework</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Institutional Compliance Framework', 8).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">11. Auditability and Verifiable Records</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Auditability and Verifiable Records', 8).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">12. Telemetry and Analytics Disclosure</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Telemetry and Analytics Disclosure', 8).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">13. Zero-Knowledge Cryptographic Guarantees</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Zero-Knowledge Cryptographic Guarantees', 8).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                {/* 14. Contact */}
                <section className="bg-[#050505] text-white p-12 rounded-3xl text-center">
                    <h2 className="text-3xl font-black mb-6 tracking-tight">14. Contact Information</h2>
                    <p className="mb-8 text-white/70 max-w-2xl mx-auto leading-relaxed">
                        In order to resolve a complaint regarding the Services or to receive further information regarding the use of the Services, please contact our legal department.
                    </p>
                    <a href="mailto:legal@whalealert.network" className="inline-block px-10 py-5 bg-white text-[#050505] font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-gray-100 transition-colors shadow-xl">
                        Contact Legal Department
                    </a>
                </section>
`);
fs.writeFileSync('app/legal/terms/page.tsx', termsExpanded);

const privacyContent = fs.readFileSync('app/legal/privacy/page.tsx', 'utf8');
const privacyExpanded = privacyContent.replace(/<\/div>\s*<\/DocLayout>/g, `
                {/* Generated Content Expansion */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Data Minimization Protocols</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Data Minimization Protocol', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Client-Side Isolation Architecture</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Client-Side Isolation Architecture', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Cryptographic Data Erasure</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Cryptographic Data Erasure system', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
            </div>
        </DocLayout>
`);
fs.writeFileSync('app/legal/privacy/page.tsx', privacyExpanded);

const securityContent = fs.readFileSync('app/legal/security/page.tsx', 'utf8');
const securityExpanded = securityContent.replace(/<\/div>\s*<\/DocLayout>/g, `
                {/* Generated Content Expansion */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Hardware Enclave Isolation</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Hardware Enclave Isolation', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Network Threat Mitigation</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Network Threat Mitigation strategy', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Continuous Cryptographic Auditing</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Continuous Cryptographic Auditing framework', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
            </div>
        </DocLayout>
`);
fs.writeFileSync('app/legal/security/page.tsx', securityExpanded);

const compliancePgContent = fs.readFileSync('app/legal/compliance/page.tsx', 'utf8');
const complianceExpanded = compliancePgContent.replace(/<\/div>\s*<\/DocLayout>/g, `
                {/* Generated Content Expansion */}
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Regulatory Reporting Frameworks</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Regulatory Reporting Framework', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Cross-Border Jurisdictional Compliance</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Cross-Border Jurisdictional Compliance model', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-3xl font-black mb-6 tracking-tight">Institutional Onboarding Lifecycle</h2>
                    <div className="prose prose-lg max-w-none text-[#050505]/70 space-y-6">
                        <p>${generateText('Institutional Onboarding Lifecycle', 10).replace(/\n\n/g, '</p><p>')}</p>
                    </div>
                </section>
            </div>
        </DocLayout>
`);
fs.writeFileSync('app/legal/compliance/page.tsx', complianceExpanded);
console.log('Legal pages generated successfully!');
