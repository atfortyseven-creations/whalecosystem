import type { AztecDocSection } from '@/components/landing/AztecDocPage';

// ─── WHITEPAPER ───────────────────────────────────────────────────────────────

export const WHITEPAPER_SECTIONS: AztecDocSection[] = [
  {
    id: 'executive-summary',
    title: '1. Executive Summary',
    paragraphs: [
      'Humanity Ledger is a privacy-preserving protocol built natively on the Aztec Network. It provides a zero-knowledge execution environment where financial activity, identity verification, and governance actions are proven locally on the user device and verified by the network — without the network ever accessing the underlying private data.',
      'Public blockchains, by design, expose all transaction metadata to every observer. This creates fundamental problems for individuals, businesses, and institutions that require confidentiality as a standard operating condition. Humanity Ledger resolves this by making privacy the default state of the network, not an opt-in feature.',
      'The protocol is deeply integrated with the Whale Alert Network, which provides real-time monitoring of large capital flows across major blockchains. Users can act on this intelligence — setting alerts, analyzing flows, executing trades — entirely within the shielded environment. Their positions and intentions remain cryptographically hidden from all external observers.',
      'This document describes the technical architecture, cryptographic primitives, economic model, and development roadmap of the Humanity Ledger protocol.',
    ],
  },
  {
    id: 'problem-statement',
    title: '2. The Problem with Transparent Ledgers',
    paragraphs: [
      'Every transaction recorded on a public blockchain is permanently visible to any observer. Wallet addresses, transaction amounts, timing, counterparties, and accumulated balances are all stored in plain view. This level of transparency is fundamentally incompatible with standard expectations of financial privacy.',
      'For individuals, this creates risks of targeted attacks, social engineering, and surveillance by both commercial actors and adversarial entities. For businesses, it exposes operational data, counterparty relationships, and treasury movements that would normally be protected by commercial confidentiality. For institutions, the absence of privacy prevents participation in decentralized finance entirely.',
      'Current privacy tools — such as mixing services and coin-join implementations — are additive patches to transparent systems. They introduce additional trust assumptions, compliance risks, and forensic vulnerabilities. A fundamentally private architecture requires that privacy be embedded at the execution layer, not grafted on afterward.',
    ],
    bullets: [
      'Front-running: Transaction intent is publicly visible in the mempool before confirmation, allowing adversarial actors to exploit pending activity.',
      'Address clustering: Blockchain analytics firms link wallet addresses into identity clusters using graph analysis, effectively deanonymizing users.',
      'Surveillance: Governments and commercial entities continuously analyze on-chain data to build behavioral profiles of network participants.',
      'Competitive exposure: Businesses operating on public chains expose their treasury, counterparty relationships, and operational strategy to competitors.',
    ],
  },
  {
    id: 'cryptographic-foundations',
    title: '3. Cryptographic Foundations',
    paragraphs: [
      'Humanity Ledger is built on zk-SNARKs — Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge. A zk-SNARK allows one party (the prover) to demonstrate to another party (the verifier) that a statement is true, without revealing any information beyond the truth of the statement itself.',
      'In the context of Humanity Ledger, the prover is the user device running the local proving environment. The verifier is the Aztec Network. The user proves that a state transition — for example, a transfer of funds — was executed correctly according to the protocol rules, without revealing who sent what to whom, or for how much.',
      'State is managed using a private UTXO model structured as an encrypted Merkle tree. Each asset is represented as a private note committing to its owner, value, and a random blinding factor. To spend a note, the user generates a deterministic nullifier derived from the note secret and submits it alongside the proof. The nullifier is recorded publicly to prevent double-spending, while the note itself remains opaque.',
    ],
    bullets: [
      'Client-side proving: All witness generation and proof construction occur on the user device. The network receives only the proof and the public inputs — never the private data.',
      'Nullifier trees: Prevent double-spending without revealing which note was spent or establishing any linkability between transactions.',
      'Authorization witnesses (AuthWit): Allow smart contracts to execute actions on a user\'s behalf through in-circuit proofs, eliminating the need for linkable on-chain signatures.',
      'Barretenberg backend: The proving system is implemented using the Barretenberg library, supporting the UltraPlonk constraint system with efficient proof generation in browser and native environments.',
    ],
  },
  {
    id: 'system-architecture',
    title: '4. System Architecture',
    paragraphs: [
      'The Humanity Ledger architecture is divided into three distinct operational layers, each with well-defined responsibilities and trust boundaries.',
      'The Client Layer runs entirely on the user device. It holds cryptographic keys, manages the local Private Execution Environment (PXE), constructs private state transitions, and generates zk-SNARKs using the Barretenberg proving backend. No private inputs are transmitted outside this layer under any circumstances.',
      'The Aztec L2 Layer operates as a zkRollup on Ethereum. It receives proofs from users, verifies their validity in batches, and updates the global state roots. The sequencer processes encrypted data and publishes verified state commitments without accessing the underlying private content. The L2 layer is responsible for transaction ordering, proof verification, and state root publication.',
      'The Ethereum L1 Layer provides ultimate settlement and data availability. State roots published by the Aztec sequencer are anchored to Ethereum, providing economic finality, censorship resistance, and a permanent audit trail of verified state transitions. Ethereum serves as the source of truth for the Aztec L2 state.',
    ],
  },
  {
    id: 'whale-network-integration',
    title: '5. Integration with Whale Alert Network',
    paragraphs: [
      'The Whale Alert Network monitors capital flows across more than 20 major blockchain networks in real time. It identifies large asset transfers, exchange inflows and outflows, wallet activations, and macroeconomic flow patterns, and surfaces these events as structured, queryable data.',
      'This intelligence is accessible within the Humanity Ledger shielded environment through private indexing logic. Users interact with the data — querying events, setting alert conditions, analyzing accumulation patterns — entirely inside the Aztec shielded pool. Their queries, alert configurations, and subsequent actions are cryptographically hidden from the public network.',
      'The architecture creates a dual-state design: market intelligence is derived from publicly available on-chain data, while user engagement with that intelligence remains entirely private. A user who acts on a large transfer alert cannot be observed by competitors or adversarial actors.',
    ],
    bullets: [
      'Alert Engine: Configurable alert conditions triggered by specific flow events across monitored networks.',
      'Private queries: Alert configurations and filter criteria are stored in the local PXE database, never transmitted to the network.',
      'Real-time delivery: Matching events are delivered to the user within sub-second latency via authenticated WebSocket streams.',
      'Cross-chain coverage: Bitcoin, Ethereum, BNB Chain, Solana, Polygon, Arbitrum, Optimism, Avalanche, and 12+ additional networks.',
    ],
  },
  {
    id: 'identity-layer',
    title: '6. Identity and Sybil Resistance',
    paragraphs: [
      'The Humanity Ledger identity layer uses zero-knowledge biometric proofs to establish unique human status without exposing personally identifiable information. Users prove uniqueness through integration with established liveness protocols — including World ID — by generating a ZK proof of credential possession rather than submitting the credential itself.',
      'The network can verify that a participant is a unique, verified human without learning their identity, device details, or the specific credential used. This enables Sybil-resistant governance and reward distribution without traditional KYC — a requirement that would fundamentally compromise the privacy guarantees of the protocol.',
      'For institutional participants requiring formal compliance, the protocol supports selective disclosure through viewing keys and W3C Verifiable Credentials. Institutions can prove specific attributes to regulators — balance thresholds, transaction limits, jurisdictional compliance — without revealing their full transactional history or counterparty graph.',
    ],
  },
  {
    id: 'security-model',
    title: '7. Security Model and Threat Assumptions',
    paragraphs: [
      'Humanity Ledger operates under a zero-trust threat model. We assume that all network intermediaries — including the Aztec sequencer, API gateways, and the client browser environment — may be compromised. Security is guaranteed exclusively through cryptographic proofs, not through trust in infrastructure operators.',
      'Private keys are generated and stored exclusively on the user device. No server, API endpoint, or network component holds or has access to user private keys. State transitions require a valid zk-SNARK generated locally, making unauthorized state changes mathematically impossible regardless of the state of any server-side component.',
      'All Noir circuits and Ethereum bridge contracts are subjected to formal verification and independent third-party audits before deployment. Circuit soundness is verified against reference constraint models through differential testing. Audit reports are published in full.',
    ],
    bullets: [
      'Cryptographic soundness: Security derives from the mathematical properties of the proving system, not from operational trust.',
      'Non-extractable keys: Private keys never leave the device and are processed only within hardware-isolated environments where available.',
      'Formal verification: Critical circuits are formally verified to confirm the impossibility of generating false proofs.',
      'Continuous testing: Automated fuzzing and symbolic execution run continuously against the constraint system to identify edge cases before exploitation.',
    ],
  },
  {
    id: 'economic-model',
    title: '8. Economic Model and Token Distribution',
    paragraphs: [
      'The Humanity Ledger protocol uses a native utility asset, QDs, to align participant incentives, facilitate private coordination, and secure the network through a Proof of Contribution mechanism. The total supply of QDs is fixed at 21,000,000 units. Issuance follows an algorithmic decay curve over ten years.',
      'QDs are issued exclusively within the Aztec shielded pool. All token operations — transfers, staking, governance voting, and reward claims — occur as private state transitions. External observers cannot determine the distribution or flow of QDs among participants.',
      'Proof of Contribution rewards participants who provide verifiable value to the network: forensic analysis submissions, infrastructure uptime, open-source circuit contributions, and governance participation. Contributions are verified by zk-SNARKs submitted to the network. The network authorizes minting only after proof verification — without knowing the identity of the contributor.',
    ],
    bullets: [
      'Community mining (50% — 10,500,000 QDs): Distributed over ten years to verified contributors via Proof of Contribution.',
      'Ecosystem treasury (25% — 5,250,000 QDs): Governed by cryptographic community vote. Funds protocol development, audits, and integrations.',
      'Core contributors (15% — 3,150,000 QDs): Four-year linear vesting with a one-year cliff.',
      'Initial liquidity (10% — 2,100,000 QDs): Deployed at launch to establish protocol liquidity pools.',
    ],
  },
  {
    id: 'development-roadmap',
    title: '9. Development Roadmap',
    paragraphs: [
      'The protocol development is structured across sequential phases, each building on verified foundations before expanding to additional capabilities. The roadmap is governed by milestone-based funding unlocks, where treasury disbursements require cryptographic proof of milestone completion verified by the community.',
      'Phase one established the core infrastructure: Aztec PXE integration, primary Noir circuits for private transfers, Whale Network v1 data feeds, and the identity layer. These components are live.',
      'Phase two focuses on compliance and institutional tooling: selective disclosure SDK, threshold multi-signature circuits, and the cross-chain bridge. These components are in active development.',
      'Phase three introduces scaled applications: real-world asset integration, dark pool liquidity matching, and decentralized governance. These are planned for delivery in 2026.',
    ],
  },
  {
    id: 'conclusion',
    title: '10. Conclusion',
    paragraphs: [
      'Humanity Ledger provides the missing privacy layer for decentralized finance. By integrating natively with the Aztec Network and combining institutional market intelligence from Whale Alert with cryptographically private execution, the protocol enables a new category of financial activity: verifiable, compliant, and completely private.',
      'The architecture is designed to scale without compromising its privacy guarantees. Each component — proving, sequencing, settlement, identity — operates with well-defined trust boundaries. Users retain exclusive control over their keys and data at all times.',
      'We invite developers, institutions, and privacy advocates to build on Humanity Ledger, contribute to its open-source circuits, and participate in governance. The protocol belongs to its participants.',
    ],
  },
];

// ─── MANIFESTO ────────────────────────────────────────────────────────────────

export const MANIFESTO_SECTIONS: AztecDocSection[] = [
  {
    title: 'Privacy Is Not Optional',
    paragraphs: [
      'Financial privacy is a prerequisite for human autonomy. The ability to transact, save, and coordinate without exposing every detail of your financial life to permanent public surveillance is not a luxury — it is a fundamental operating requirement for individuals, businesses, and institutions alike.',
      'The current paradigm of public blockchains — where every balance, every counterparty, every amount is globally visible and permanently recorded — represents a radical departure from the confidentiality that has underpinned financial systems for centuries. A payment network where every participant can observe every other participant\'s complete financial history is not a neutral innovation. It is a surveillance system.',
    ],
  },
  {
    title: 'The Limitations of Transparency as Default',
    paragraphs: [
      'Proponents of transparent blockchains argue that visibility creates accountability. This argument conflates auditability — the ability to verify specific claims — with surveillance — the continuous observation of all activity by all parties. These are not the same thing, and conflating them leads to architectures that sacrifice privacy without gaining proportionate accountability.',
      'A business does not post its complete transaction history publicly to demonstrate it pays its taxes. It submits verified reports to regulators through controlled, legally defined processes. An individual does not broadcast their salary, rent, and grocery spending to prove they operate within the law. The disclosure of specific information to specific parties for specific purposes is fundamentally different from unrestricted public access to all information at all times.',
      'Zero-knowledge cryptography makes it possible to provide the former without the latter. A user can prove solvency without revealing their balance. A business can prove regulatory compliance without revealing its counterparties. An institution can prove policy adherence without revealing its trading strategy. Verifiable claims do not require full transparency.',
    ],
  },
  {
    title: 'Default Privacy, Selective Disclosure',
    paragraphs: [
      'Humanity Ledger is built on a simple principle: privacy is the default, and disclosure is a controlled choice made by the user. This is not a technical limitation — it is an architectural decision made deliberately, because we believe users should control their data, not the other way around.',
      'When a user needs to demonstrate compliance, they generate a viewing key or a cryptographic range proof. The auditor receives verifiable evidence of the specific claim being made. Nothing else is disclosed. The process is controlled, auditable, and mathematically precise.',
      'This model resolves the apparent conflict between privacy and regulation. Regulators get the evidence they need. Users retain control over what is disclosed, to whom, and under what conditions. The network enforces these properties cryptographically — not through policy statements or terms of service, but through mathematics.',
    ],
  },
  {
    title: 'Open Infrastructure, Private Data',
    paragraphs: [
      'We believe that the code governing a financial protocol must be publicly auditable. Every circuit, every smart contract, every cryptographic primitive used by Humanity Ledger is open-source and available for public review. Researchers, developers, and adversaries are all invited to analyze the system and identify weaknesses.',
      'This commitment to open infrastructure is not in conflict with our commitment to data privacy. The code is public. The data it processes is not. This is the correct architecture for a trustworthy financial system: transparent rules applied to private inputs.',
      'Protocol upgrades are subject to community governance. The rules of the protocol cannot be changed unilaterally by any individual or organization, including the founding team. Governance requires participation from verified community members, and changes take effect only after cryptographic ratification.',
    ],
  },
  {
    title: 'The Role of Market Intelligence',
    paragraphs: [
      'Understanding capital flows is a legitimate and important activity. Large movements of assets across blockchain networks often signal significant market events: institutional accumulation, exchange insolvency risk, protocol migrations, and macro repositioning. Participants who understand these flows are better positioned to make informed decisions.',
      'The Whale Alert Network makes this intelligence available. The challenge is that acting on public intelligence in a public environment creates a surveillance problem: if your alerts, queries, and trades are all visible, the intelligence advantage is neutralized and your own position becomes vulnerable.',
      'Humanity Ledger solves this by integrating market intelligence into a private execution environment. You can access the same on-chain data, configure the same alerts, and execute the same strategies — without any of your activity being observable. The intelligence is derived from public data. Your response to it is not.',
    ],
  },
  {
    title: 'What We Are Building',
    paragraphs: [
      'We are building the private coordination layer for decentralized finance. A system where individuals and institutions can participate in open financial networks without sacrificing the confidentiality that is a basic requirement of professional financial activity.',
      'We are not building privacy as an afterthought or as a feature. We are building it as the foundational operating condition of the network. Every component — the proving environment, the state model, the identity layer, the analytics integrations — is designed with privacy as the primary constraint.',
      'We believe this is the architecture that allows decentralized finance to reach its potential. Not because privacy is necessary to hide illicit activity — the protocol provides compliance tools precisely because legitimate activity sometimes requires disclosure — but because privacy is necessary for every participant who does not want to operate in permanent public view.',
    ],
  },
];

// ─── TOKENOMICS ───────────────────────────────────────────────────────────────

export const TOKENOMICS_SECTIONS: AztecDocSection[] = [
  {
    title: 'Overview',
    paragraphs: [
      'QDs is the native utility asset of the Humanity Ledger protocol. It operates exclusively within the Aztec shielded pool, meaning all QDs activity — transfers, staking, governance participation, and reward claims — is conducted as private state transitions. External observers cannot observe the distribution or flow of QDs among participants.',
      'The total supply of QDs is fixed at 21,000,000 units. There is no mechanism for supply expansion beyond the predetermined issuance schedule. Issuance follows an algorithmic decay curve over ten years, designed to reward early and sustained participation while ensuring long-term scarcity.',
    ],
  },
  {
    title: 'Supply Distribution',
    paragraphs: [
      'The QDs supply is allocated across four categories, each governed by distinct vesting and unlock conditions. The structure is designed to prevent concentration, align long-term incentives, and fund sustainable protocol development.',
    ],
    bullets: [
      'Community mining — 50% (10,500,000 QDs): Distributed over ten years to participants who contribute verifiable value to the network through the Proof of Contribution mechanism. This is the largest allocation and is the primary source of circulating supply.',
      'Ecosystem treasury — 25% (5,250,000 QDs): Locked at genesis and governed by verified community vote. Funds are disbursed for protocol development, security audits, ecosystem grants, and strategic integrations. No unilateral disbursements are possible.',
      'Core contributors — 15% (3,150,000 QDs): Subject to a four-year linear vesting schedule with a one-year cliff. Ensures long-term alignment between the founding team and the protocol.',
      'Initial liquidity provision — 10% (2,100,000 QDs): Deployed at launch to establish liquidity in approved trading venues. Managed under a multisignature arrangement with predefined operational parameters.',
    ],
  },
  {
    title: 'Proof of Contribution',
    paragraphs: [
      'QDs are not mined through computational work. They are earned by contributing verifiable value to the network. This mechanism — Proof of Contribution — distributes new issuance to participants who perform specific, predefined actions that benefit the network.',
      'Eligible contributions include: forensic analysis submissions that identify significant on-chain events, infrastructure uptime for network nodes, open-source circuit development and peer review, and governance participation. Each contribution type has a predefined reward structure and verification requirement.',
      'To claim a contribution reward, a participant submits a zk-SNARK proving that the eligible action was completed. The network verifies the proof and authorizes the minting of the corresponding QDs allocation — without ever learning the identity of the contributor. Rewards are deposited directly into the participant\'s shielded account.',
    ],
  },
  {
    title: 'Governance',
    paragraphs: [
      'Protocol governance is exercised through cryptographic voting. Verified participants cast votes within the shielded environment. The network tallies votes by verifying a set of valid, non-duplicate proofs of participation — without identifying individual voters or revealing the distribution of votes before the outcome is finalized.',
      'Proposals can cover protocol parameter changes, circuit upgrades, treasury disbursements, and new feature integrations. All proposals follow a defined submission, review, and voting process with predefined timelock periods between approval and implementation.',
      'The governance structure is designed to be resistant to plutocratic capture. Voting weight is not proportional to token holdings alone — it is modulated by verified contribution history, ensuring that active participants have proportionally greater influence over protocol direction than passive holders.',
    ],
  },
  {
    title: 'QDs Utility',
    paragraphs: [
      'Within the protocol, QDs serve several distinct functions beyond simple value transfer.',
    ],
    bullets: [
      'Access credentials: Certain protocol features — including premium alert tiers, dark pool participation, and advanced analytics — require holding a verified QDs balance.',
      'Governance participation: Verified QDs holders can submit and vote on protocol proposals.',
      'Fee settlement: Network fees for proof submission and sequencer interaction can be settled in QDs.',
      'Contribution staking: Participants staking QDs as collateral are eligible for higher-tier contribution opportunities with correspondingly larger rewards.',
    ],
  },
];

// ─── DEVELOPER DOCS ───────────────────────────────────────────────────────────

export const DEVELOPER_SECTIONS: AztecDocSection[] = [
  {
    title: 'Getting Started',
    paragraphs: [
      'Humanity Ledger provides a set of developer tools for building applications that leverage private state transitions on the Aztec Network. These tools abstract the complexity of zk-SNARK generation and private state management, enabling developers to integrate privacy-preserving features without requiring deep expertise in zero-knowledge cryptography.',
      'The primary integration surface is the Humanity Ledger API, which provides REST endpoints for querying public protocol state and WebSocket streams for real-time event delivery. For applications requiring direct interaction with the shielded pool, the local Aztec PXE must be initialized and configured.',
    ],
    bullets: [
      'Install the Aztec sandbox: npm install -g @aztec/aztec-cli',
      'Initialize a local PXE: aztec start --sandbox',
      'Deploy a test account: aztec create-account',
      'Submit your first private transaction using the Humanity Ledger SDK',
    ],
  },
  {
    title: 'Authentication',
    paragraphs: [
      'All API requests require authentication via HMAC-SHA256 request signing. Each API key has an associated secret used to generate the signature. The signature is computed over the request method, path, timestamp, and body hash.',
      'API keys are issued through the developer portal after identity verification. Keys are scoped to specific capabilities — read-only access for analytics queries, write access for proof submission, and administrative access for key management.',
      'For endpoints interacting with the shielded pool, the API functions strictly as a relay. It receives client-generated proofs and routes them to the Aztec sequencer. The API does not hold any cryptographic keys and cannot initiate or modify private state transitions.',
    ],
  },
  {
    title: 'The Noir Programming Language',
    paragraphs: [
      'All private logic in Humanity Ledger is expressed in Noir, a domain-specific language designed for zero-knowledge circuit development. Noir provides a Rust-like syntax that compiles efficiently to the constraint representations required by the Barretenberg proving backend.',
      'Developers building custom circuits for integration with Humanity Ledger should review the published reference circuits, which demonstrate standard patterns for membership verification, private asset transfers, and authorization witness generation. These circuits are available under open-source licenses and serve as both reference implementations and building blocks for custom applications.',
      'The Aztec sandbox provides a local development environment for compiling, testing, and deploying Noir circuits. It includes deterministic block production, pre-funded test accounts, and full event logging for debugging proving pipelines.',
    ],
    bullets: [
      'Install the Noir compiler: curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash',
      'Create a new circuit project: nargo new my_circuit',
      'Compile to constraint system: nargo compile',
      'Generate a proof locally: nargo prove',
    ],
  },
  {
    title: 'WebSocket Streams',
    paragraphs: [
      'The Humanity Ledger WebSocket API provides real-time delivery of on-chain events identified by the Whale Alert Network. Connections are authenticated using the same HMAC mechanism as REST requests, with the initial handshake including a signed timestamp.',
      'Once connected, clients subscribe to specific event channels. Available channels include large transfer events (by chain and minimum value), exchange flow events (deposits and withdrawals above threshold), and wallet activation events (first outbound transaction from a previously inactive address).',
      'Events are delivered as structured JSON objects with a consistent schema across all channels. Each event includes the originating chain, transaction identifier, asset type, normalized USD value, and a confidence score indicating the reliability of the classification.',
    ],
  },
  {
    title: 'Rate Limits and SLAs',
    paragraphs: [
      'The API enforces rate limits on all endpoints to ensure equitable access and prevent abuse. Default limits apply per API key, with higher limits available under enterprise agreements.',
      'Standard tier limits: 100 REST requests per minute, 10 concurrent WebSocket connections, 1,000 events per connection per minute.',
      'Enterprise tier: Custom rate limits, dedicated infrastructure, 99.9% uptime SLA, and priority support with defined response times.',
      'Rate limit status is communicated through response headers on all REST requests. WebSocket connections include a real-time flow control mechanism that signals approaching limits before disconnection occurs.',
    ],
  },
];

// ─── SECURITY ────────────────────────────────────────────────────────────────

export const SECURITY_SECTIONS: AztecDocSection[] = [
  {
    id: 'security-architecture',
    title: 'Security Architecture',
    paragraphs: [
      'The security architecture of Humanity Ledger is built on a single principle: no trust assumption should stand between a user and the security of their assets. Every security property of the protocol is guaranteed by cryptographic proof, not by the integrity of any server, operator, or intermediary.',
      'This means that the security of the protocol does not degrade if any single component — including the API gateway, the Aztec sequencer, or the indexing infrastructure — is compromised. Private keys never leave user devices. State transitions require locally generated proofs. The network can only advance state based on valid proofs, regardless of what any other actor does.',
    ],
  },
  {
    id: 'threat-model',
    title: 'Threat Model',
    paragraphs: [
      'We model the following adversaries as within scope for the protocol\'s security guarantees:',
    ],
    bullets: [
      'Passive network observers: Entities that monitor all network traffic, including the Aztec sequencer\'s data availability layer, and attempt to extract private information from public data.',
      'Compromised infrastructure: API servers, sequencer nodes, or indexing services that behave maliciously — either by withholding service or by attempting to forge state transitions.',
      'Colluding validators: A subset of the sequencer network that attempts to manipulate transaction ordering or censorship resistance.',
      'Advanced forensic analysis: Commercial blockchain analytics firms applying graph analysis, timing correlation, and value heuristics to deanonymize users.',
      'Long-term decryption: Adversaries who record encrypted data today with the intention of decrypting it in the future using advances in computing.',
    ],
  },
  {
    id: 'audits-verification',
    title: 'Audits and Formal Verification',
    paragraphs: [
      'All critical protocol components — Noir circuits, Ethereum bridge contracts, and client-side proving pipelines — are subjected to independent third-party security audits before deployment. Audit scope includes cryptographic soundness, implementation correctness, and denial-of-service resistance.',
      'In addition to external audits, we apply formal verification to the most critical circuit components. Formal verification uses mathematical proof techniques to demonstrate that a circuit correctly enforces its intended constraints under all possible inputs — providing a stronger guarantee than testing alone.',
      'Audit reports, formal verification certificates, and the specific scope of each engagement are published in full at the time of completion. We do not delay disclosure of audit findings.',
    ],
  },
  {
    id: 'vulnerability-disclosure',
    title: 'Vulnerability Disclosure and Bug Bounty',
    paragraphs: [
      'We maintain an active bug bounty program covering all components of the protocol. Scope includes Noir circuit soundness, Ethereum contract vulnerabilities, API authentication bypasses, and client-side proving pipeline integrity.',
      'Critical vulnerabilities — those that could result in loss of user funds or deanonymization of users — are eligible for rewards up to $500,000 USD, payable in a combination of USDC and QDs at the reporter\'s election.',
      'Researchers are asked to submit findings to security@humanityledger.com with a clear proof-of-concept demonstrating the vulnerability. We commit to acknowledging receipt within 24 hours and providing an initial assessment within 72 hours. We adhere to a responsible disclosure timeline of 90 days, after which findings are disclosed publicly regardless of remediation status.',
    ],
    callout: {
      title: 'Responsible Disclosure',
      body: 'Do not attempt to exploit vulnerabilities against the production network or against any user\'s funds. Submit findings to our security team with a proof-of-concept in a controlled environment. We will work with you on coordinated disclosure.',
      href: 'mailto:security@humanityledger.com',
      hrefLabel: 'Contact the security team',
    },
  },
  {
    id: 'key-management',
    title: 'Key Management',
    paragraphs: [
      'User private keys are generated, stored, and used exclusively on the user device. The protocol does not provide a key custody service. Users are responsible for maintaining secure backups of their key material.',
      'For devices supporting hardware security modules — including iOS Secure Enclave and Android StrongBox — the Humanity Ledger client uses hardware-backed key storage. In this configuration, the private key is non-extractable: it cannot be read from the device even by the application itself. All signing operations are performed inside the secure hardware element.',
      'For institutional users requiring multi-party key management, the protocol supports threshold signatures proven inside a Noir circuit. M-of-N signers are required to authorize a transaction, with the proof confirming that the threshold was met without revealing the total number of signers or their individual identities.',
    ],
  },
];

// ─── ROADMAP ────────────────────────────────────────────────────────────────

export const ROADMAP_SECTIONS: AztecDocSection[] = [
  {
    title: 'Development Philosophy',
    paragraphs: [
      'The Humanity Ledger roadmap is structured to build on verified foundations. Each phase delivers specific, testable capabilities before the next phase begins. We do not deploy components to production until they have been independently audited and formally verified where applicable.',
      'The roadmap is governed by milestone-based funding. Treasury disbursements for each phase require a community vote verifying that the previous phase\'s deliverables meet the defined acceptance criteria. This structure prevents speculative development and ensures that protocol resources are directed toward delivering working, audited code.',
    ],
  },
  {
    title: 'Phase 1: Core Protocol (Delivered)',
    paragraphs: [
      'Phase 1 established the foundational infrastructure of the Humanity Ledger protocol. All components in this phase have been deployed, audited, and are operational on the Aztec Network.',
    ],
    bullets: [
      'Aztec PXE integration: The local Private Execution Environment is initialized and integrated into the client. All private state transitions are generated and proven on the user device.',
      'Core Noir circuits: The primary circuit set — private transfers, note commitments, nullifier generation — is deployed and operational.',
      'Wallet connectivity: EIP-1193 compatible wallet integration supporting MetaMask and hardware wallets.',
      'Whale Network v1: Real-time capital flow monitoring operational across 20+ blockchain networks.',
      'ZK identity layer: World ID integration and biometric liveness proof support for Sybil-resistant access.',
      'Block explorer: Privacy-respecting explorer for Aztec L2 state — viewable commitments, no data exposure.',
      'Alert engine: Configurable alert conditions with sub-second delivery on matching events.',
    ],
  },
  {
    title: 'Phase 2: Compliance and Institutional Tooling (In Progress)',
    paragraphs: [
      'Phase 2 focuses on the tools required for institutional participation in the protocol. These components are in active development, with target delivery in Q4 2025.',
    ],
    bullets: [
      'Selective disclosure SDK: Viewing key generation and ZK range proofs for regulatory and audit compliance. Supports W3C Verifiable Credential issuance and verification.',
      'Threshold multi-signature: M-of-N authorization proven inside a Noir circuit. Designed for treasury governance and institutional custody.',
      'Cross-chain bridge: Encrypted asset transfers between Aztec L2 and Ethereum L1 using ZK bridge contracts.',
      'Portfolio dashboard: Aggregated private portfolio view with shielded balance display and position analytics.',
      'Compliance API: Endpoints for issuing and consuming Verifiable Credentials for regulated financial activity.',
    ],
  },
  {
    title: 'Phase 3: Scale Applications (Planned — 2026)',
    paragraphs: [
      'Phase 3 introduces large-scale financial applications building on the privacy infrastructure established in phases 1 and 2. Delivery is planned across Q1 and Q2 2026.',
    ],
    bullets: [
      'Real-world asset integration: Tokenization of RWAs on Aztec under smart contract custody, with ZK attestation of underlying asset validity.',
      'Dark pool liquidity: Blind order matching using ZK proofs and multi-party computation. Order intent is not published before matching. MEV extraction is structurally impossible.',
      'Decentralized governance: Full community control of protocol parameters, circuit upgrades, and treasury allocation via cryptographic voting.',
      'Developer SDK: Embeddable SDK for browser and mobile environments. PXE initialization, proving, and submission abstracted into a clean developer interface.',
      'Developer sandbox: Local CLI and GUI environment for simulating Aztec L1/L2. Full visibility into note flow, nullifier generation, and witness construction for debugging.',
    ],
  },
];

// ─── API REFERENCE ────────────────────────────────────────────────────────────

export const API_REFERENCE_SECTIONS: AztecDocSection[] = [
  {
    title: 'API Overview',
    paragraphs: [
      'The Humanity Ledger API provides programmatic access to network analytics, Aztec L2 state data, real-time Whale Network event streams, and proof submission endpoints. The API is designed around RESTful principles for request-response interactions and WebSocket connections for real-time event delivery.',
      'The base URL for all API endpoints is https://api.humanidfi.com/v1. All requests must be made over HTTPS. Plaintext HTTP connections are rejected.',
    ],
  },
  {
    title: 'Authentication',
    paragraphs: [
      'All API requests require authentication via HMAC-SHA256 request signing. To authenticate a request, you must include three headers: X-API-Key (your API key identifier), X-Timestamp (Unix timestamp of the request, must be within 300 seconds of server time), and X-Signature (the HMAC-SHA256 signature of the canonical request string).',
      'The canonical request string is constructed as: METHOD + "\\n" + PATH + "\\n" + TIMESTAMP + "\\n" + SHA256(BODY). The HMAC is computed using your API secret as the key. The resulting hex-encoded signature is included in the X-Signature header.',
    ],
    bullets: [
      'GET /v1/events — List recent large transfer events across monitored chains',
      'GET /v1/events/:id — Retrieve a specific event by identifier',
      'GET /v1/state/roots — Current Aztec L2 state roots',
      'POST /v1/proofs — Submit a client-generated zk-SNARK for sequencer relay',
      'GET /v1/account/:address — Public state for an Aztec account address',
    ],
  },
  {
    title: 'Event Objects',
    paragraphs: [
      'All event objects returned by the API share a consistent schema regardless of the originating chain or event type. This allows client applications to handle events uniformly without conditional logic for each chain.',
    ],
    bullets: [
      'id (string): Unique event identifier. Stable across API versions.',
      'chain (string): Originating blockchain identifier (e.g., "ethereum", "solana", "bnb").',
      'type (string): Event classification ("large_transfer", "exchange_inflow", "exchange_outflow", "wallet_activation").',
      'asset (string): Asset ticker symbol.',
      'amount_usd (number): Normalized USD value at the time of detection.',
      'tx_hash (string): Transaction identifier on the originating chain.',
      'detected_at (string): ISO 8601 timestamp of event detection.',
      'confidence (number): Confidence score between 0 and 1 indicating classification reliability.',
    ],
  },
  {
    title: 'WebSocket Streams',
    paragraphs: [
      'Connect to the WebSocket endpoint at wss://stream.humanidfi.com/v1. Authentication is performed during the initial handshake by including the same headers required for REST requests as connection parameters.',
      'After connecting, send a subscription message to begin receiving events on specific channels. Subscriptions can be updated at any time without reconnecting.',
      'The connection remains active until explicitly closed by the client or until a 60-second ping timeout occurs. Clients should send a ping frame at least every 30 seconds to maintain the connection. The server will respond with a pong frame within 10 seconds.',
    ],
  },
  {
    title: 'Error Codes',
    paragraphs: [
      'The API uses standard HTTP status codes for REST responses. Error responses include a JSON body with a machine-readable error code and a human-readable message.',
    ],
    bullets: [
      '400 Bad Request: The request is malformed, missing required parameters, or contains invalid values.',
      '401 Unauthorized: Authentication failed. The API key is invalid, the signature is incorrect, or the timestamp is outside the acceptable window.',
      '403 Forbidden: The request is authenticated but the API key does not have permission to access the requested resource.',
      '404 Not Found: The requested resource does not exist.',
      '429 Too Many Requests: The rate limit for the API key has been exceeded. The Retry-After header indicates when requests can resume.',
      '500 Internal Server Error: An unexpected error occurred on the server. These are logged and investigated automatically.',
    ],
  },
];

// ─── NOIR CIRCUITS ────────────────────────────────────────────────────────────

export const NOIR_CIRCUITS_SECTIONS: AztecDocSection[] = [
  {
    title: 'Overview',
    paragraphs: [
      'The Humanity Ledger protocol logic is expressed in Noir circuits. These circuits define the mathematical constraints that a state transition must satisfy to be accepted by the network. A state transition is valid if and only if a valid proof can be generated demonstrating that the transition satisfies its circuit constraints.',
      'Circuits are compiled using the Noir compiler (nargo) to generate an abstract circuit representation and a corresponding proving key. The proving key is used by the client prover to generate proofs for specific inputs. The verification key is published on-chain and used by the Aztec sequencer to verify submitted proofs.',
    ],
  },
  {
    title: 'Private Transfer Circuit',
    paragraphs: [
      'The private transfer circuit governs the shielded movement of assets between accounts. Given a set of input notes and a set of output notes, the circuit proves that: the input notes are valid commitments to unspent assets in the state tree, the total value of outputs equals the total value of inputs, the input nullifiers are correctly derived from the input note secrets, and the output notes are correctly committed to the state tree.',
      'The circuit reveals only the nullifiers of spent input notes and the commitments of new output notes. The amounts, sender, and recipient are not revealed.',
    ],
  },
  {
    title: 'Identity Circuit',
    paragraphs: [
      'The identity circuit enables users to prove possession of a valid identity credential without revealing the credential itself. It takes a signed credential from an approved identity oracle as a private input and produces a public output confirming that the credential is valid and meets specific criteria — for example, that it represents a unique, verified human.',
      'The circuit does not reveal which oracle signed the credential, which specific credential was used, or any identifying information about the holder. It produces only a Boolean confirmation that the proof is valid.',
    ],
  },
  {
    title: 'Membership Circuit',
    paragraphs: [
      'The membership circuit proves that a user holds sufficient QDs to access a specific protocol feature without revealing their exact balance. It takes the user\'s private note set as input and produces a proof that the total committed value meets or exceeds the required threshold.',
      'This circuit enables tier-based feature access — for example, confirming eligibility for dark pool participation — without requiring users to disclose their actual holdings to any counterparty or observer.',
    ],
  },
  {
    title: 'Governance Circuit',
    paragraphs: [
      'The governance circuit proves that a valid, non-duplicate vote has been cast in an active governance proposal. It takes the voter\'s identity proof and their QDs note set as private inputs, and produces a proof confirming: the voter is a verified participant, the voter has not previously voted on this proposal (proven via nullifier), and the vote weight is correctly derived from the voter\'s eligible balance.',
      'The circuit reveals only the nullifier (to prevent double voting) and the vote weight. The voter\'s identity, address, and specific holdings are not disclosed.',
    ],
  },
];

// ─── ARCHITECTURE VISION ──────────────────────────────────────────────────────

export const ARCHITECTURE_VISION_SECTIONS: AztecDocSection[] = [
  {
    title: 'Cryptographic Architecture',
    paragraphs: [
      'The cryptographic foundation of Humanity Ledger is designed for long-term security. The current architecture uses CRYSTALS-Dilithium for digital signatures and the Barretenberg UltraPlonk proving system for zk-SNARKs. These represent current best practice for post-quantum-resistant signatures and efficient zero-knowledge proving.',
      'The protocol is designed to be upgrade-compatible with future cryptographic improvements. Circuit components are modular, allowing signature schemes and hash functions to be updated through governance as standards evolve without requiring a complete protocol migration.',
    ],
    bullets: [
      'Proving system: Barretenberg UltraPlonk — efficient proof generation suitable for browser and native environments.',
      'Signature scheme: CRYSTALS-Dilithium — NIST-standardized, lattice-based digital signature algorithm.',
      'Hash function: Poseidon — ZK-friendly hash function optimized for circuit efficiency.',
      'Key exchange: X25519 for session encryption with planned hybrid integration of CRYSTALS-Kyber for post-quantum resistance.',
    ],
  },
  {
    title: 'State Management',
    paragraphs: [
      'Private state is managed as a set of note commitments stored in an append-only Merkle tree. Notes represent ownership of assets and are encrypted using the recipient\'s public key. Only the recipient, who possesses the corresponding private key, can decrypt and spend a note.',
      'When a note is spent, a nullifier derived from the note secret is published to the network. The nullifier set is maintained publicly to prevent double-spending. Because nullifiers are derived using a one-way function from note secrets, they reveal nothing about the note itself — only that it has been spent.',
      'The global state consists of two primary data structures: the note hash tree, containing commitments to all created notes, and the nullifier tree, containing all published nullifiers. The roots of these trees are published by the sequencer and anchored to Ethereum L1.',
    ],
  },
  {
    title: 'Sequencer Architecture',
    paragraphs: [
      'The Aztec sequencer is responsible for ordering private transactions, verifying their associated zk-SNARKs, and publishing verified state roots to Ethereum. The sequencer processes encrypted transaction data — it receives proofs and public inputs but never has access to private witness data.',
      'Transaction ordering is currently centralized in the Aztec sequencer, with full decentralization planned as the Aztec Network protocol matures. The security of user funds does not depend on the sequencer\'s honest behavior — invalid proofs are rejected by the on-chain verification contract regardless of sequencer actions.',
      'The sequencer\'s primary censorship resistance mechanism is the L1 forced transaction queue. If the sequencer withholds a transaction, users can force inclusion directly through the Ethereum L1 bridge contract after a defined waiting period.',
    ],
  },
  {
    title: 'Data Availability',
    paragraphs: [
      'Encrypted transaction data is published to Ethereum calldata, ensuring that the full history required to reconstruct private state is permanently available and censorship-resistant. Users can re-derive their private note set from the published data if the local PXE database is lost.',
      'Note encryption uses the recipient\'s public key, derived from their private key through the Aztec key derivation scheme. The recipient scans published transaction data, attempting decryption with their private key. Successfully decrypted notes are added to the local PXE database for future spending.',
    ],
  },
  {
    title: 'L1–L2 Bridge',
    paragraphs: [
      'Assets move between Ethereum L1 and the Aztec L2 shielded pool through the portal contract system. Deposits from L1 to L2 create a private note in the shielded pool — no public record of the L2 recipient is created. Withdrawals from L2 to L1 require a valid proof of ownership of the corresponding L2 note.',
      'Cross-chain asset movements through the bridge are therefore private in one direction: the L1 deposit is publicly visible (as it must be, being an Ethereum transaction), but the L2 recipient is not. Similarly, the L2 withdrawal proof is publicly verifiable, but the source note and its history within the shielded pool are not.',
    ],
  },
];

// ─── COMMUNITY FORUM INTRO ───────────────────────────────────────────────────

export const COMMUNITY_FORUM_INTRO: AztecDocSection[] = [
  {
    title: 'Welcome to the Community',
    paragraphs: [
      'This is the primary discussion space for the Humanity Ledger community. It is a place for technical discussions about the Aztec Network integration, Noir circuit development, and protocol governance — as well as broader conversations about the future of financial privacy.',
      'We expect discussions to be substantive, respectful, and conducted in good faith. This is not a space for trading signals, price speculation, or promotional content. Posts that do not contribute to protocol development or community understanding will be removed.',
      'Protocol governance proposals should be discussed here before formal submission. Community feedback during the discussion phase helps refine proposals and improves the quality of on-chain governance decisions.',
    ],
  },
];
