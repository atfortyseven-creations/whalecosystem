import type { AztecDocSection } from '@/components/landing/AztecDocPage';

export const WHITEPAPER_SECTIONS: AztecDocSection[] = [
  {
    id: 'introduction',
    title: '1. Introduction — Privacy as a Core Feature',
    paragraphs: [
      'Humanity Ledger is a privacy-first coordination layer built on the Aztec Network. On most public blockchains, balances, votes, and messages are visible to everyone. Here, confidentiality is built into the protocol and enforced with cryptography—not optional settings or policy promises.',
      'Aztec supports programmable private state: smart contracts run over encrypted notes while publishing only compact zero-knowledge proofs to Ethereum. Humanity Ledger uses this stack for verifiable social activity, private QDs transfers, and large-wallet analytics—without giving up settlement on Ethereum.',
    ],
    bullets: [
      'Client-side proving with Barretenberg (@aztec/bb.js)—sensitive inputs stay on the user’s device.',
      'Noir circuits express membership, reputation, and transfer rules in a language designed for formal verification.',
      'Dual-state design: public indexes for discovery; private UTXO-style trees for balances and relationships.',
    ],
  },
  {
    id: 'architecture',
    title: '2. Architecture (Client · Aztec L2 · Ethereum L1)',
    paragraphs: [
      'The system spans three trust zones. The local prover builds witnesses and proofs from keys held by the user. The Aztec rollup sequencer orders private function calls and verifies proofs in batches. Ethereum L1 anchors state roots, governance, and bridge liquidity—providing economic finality without exposing shielded activity.',
      'Cross-layer messaging uses Aztec’s bridge and note hashing. Humanity Ledger does not custody user keys; servers validate proofs and serve public metadata only.',
    ],
    callout: {
      title: 'Aligned with Aztec',
      body: 'We share Aztec’s view that everyday users should not face permanent financial surveillance. Private-by-default L2 execution is a practical path to digital identity people can actually control.',
      href: 'https://docs.aztec.network/',
      hrefLabel: 'Aztec documentation',
    },
  },
  {
    id: 'zk-primitives',
    title: '3. Zero-Knowledge Building Blocks',
    paragraphs: [
      'Private notes commit to value, owner, and randomness. Spending reveals a nullifier derived from the note secret—proving the note was used once without revealing which note it was. This UTXO-style model prevents double-spends in the shielded pool while keeping amounts and counterparties private.',
      'Authorization Witnesses (AuthWit) let contracts act on a user’s behalf without leaving a trail of raw signatures. Users approve policies once; later private calls authenticate with in-circuit proofs instead of linkable on-chain signatures.',
    ],
    bullets: [
      'Membership proofs: show forum tier or governance weight without exposing full wallet history.',
      'Range proofs and balance checks run in Noir before any mint or transfer.',
      'Recursive proof aggregation (where enabled) lowers L1 verification cost at scale.',
    ],
  },
  {
    id: 'tokenomics',
    title: '4. QDs — Private Utility on Aztec',
    paragraphs: [
      'QDs is deployed as an Aztec token contract supporting shield, unshield, and private transfer. Issuance follows a decaying emission curve recorded in public state; rewards go to contributors only after valid Proof-of-Contribution verification.',
      'Peer transfers stay inside the shielded pool. Outside observers see that a proof is valid—not who sent what to whom.',
    ],
  },
  {
    id: 'security',
    title: '5. Security, Audits, and Formal Methods',
    paragraphs: [
      'Critical Noir circuits go through fuzzing, constraint review, and third-party audit. Public Solidity surfaces are limited to bridge and registry logic. We run responsible disclosure and a structured bug bounty (see Security Policy).',
    ],
    callout: {
      title: 'Open for review',
      body: 'Circuit artifacts and verification keys are published for community review. Security researchers can reproduce proofs in the Aztec sandbox.',
      href: '/security',
      hrefLabel: 'Security & bounty',
    },
  },
];

export const MANIFESTO_SECTIONS: AztecDocSection[] = [
  {
    title: 'Why financial privacy matters',
    paragraphs: [
      'Privacy is not a luxury feature—it is a baseline for free participation. When every transfer, vote, and social signal is public by default, power shifts to whoever collects, scores, and resells that data. Humanity Ledger exists to change that default on Aztec: private first, transparent only when you choose to be.',
    ],
  },
  {
    title: 'The cost of fully transparent ledgers',
    paragraphs: [
      'Public blockchains solved double-spending and global settlement. They also created a permanent record anyone can analyze. Adversaries—states and companies alike—map wallets to people, front-run flows, and pressure holders. People deserve the same confidentiality they expect in banking and messaging, delivered with math—not marketing.',
    ],
    bullets: [
      'Metadata alone can deanonymize users even when amounts are hidden elsewhere.',
      'Reputation systems on transparent chains punish experimentation and dissent.',
      'Institutions cannot operate in full public view without competitive harm.',
    ],
  },
  {
    title: 'Privacy by default on Aztec',
    paragraphs: [
      'Aztec embeds privacy at the execution layer. Noir programs state what must be true; Barretenberg proves it; the rollup verifies without seeing private inputs. Humanity Ledger uses this for sensitive state: balances, direct messages, governance votes, and contributor credentials.',
    ],
    bullets: [
      'Private by default: encrypted notes, unique nullifiers, no global balance registry.',
      'Selective disclosure: prove an attribute (humanity score, tier, non-sybil status) without exposing the wallet.',
      'Local control: keys and witnesses stay on-device; the network receives proofs only.',
    ],
    callout: {
      title: 'Noir and dignity at scale',
      body: 'Noir lets us write auditable rules—“this voter is eligible” without “this voter is wallet 0xABC.” That is how online communities can grow without forcing everyone into a glass house.',
      href: 'https://noir-lang.org/docs',
      hrefLabel: 'Noir language docs',
    },
  },
  {
    title: 'Verifiable trust for the next web',
    paragraphs: [
      'The next layer of the web is not “more transparency everywhere.” It is verifiable rules with confidential inputs. Social graphs, markets, and identity will run on ZK rollups that inherit Ethereum security without panopticon economics.',
      'Humanity Ledger contributes large-wallet intelligence for public benefit, private coordination for communities, and QDs incentives tied to real work—not passive extraction.',
    ],
  },
  {
    title: 'Our commitments',
    paragraphs: [
      'We commit to open circuits, responsible disclosure, and governance that cannot unilaterally deanonymize users. We commit to Aztec for private execution and Ethereum for economic finality. We build so privacy is normal—not a niche option.',
    ],
  },
];

export const TOKENOMICS_SECTIONS: AztecDocSection[] = [
  {
    title: 'QDs — Utility token on Aztec',
    paragraphs: [
      'QDs is the native utility asset of Humanity Ledger, issued and transferred inside Aztec’s shielded pool. Supply is capped at 21,000,000 units with algorithmic emission decay—scarcity with rewards aimed at verified contribution rather than passive holding alone.',
    ],
  },
  {
    title: 'Emission and allocation',
    paragraphs: [
      'Half of supply funds Proof of Contribution—minters submit valid ZK proofs of forum quality, node uptime, or other protocol-defined work. One quarter sits in an on-chain treasury governed by public proposals (with optional private voting). Core contributors vest over four years with a one-year cliff. A liquidity slice supports AMM depth at launch without sacrificing long-term alignment.',
    ],
    bullets: [
      'Community mining (PoC): 50% — 10.5M QDs, decay over 10 years.',
      'Ecosystem treasury: 25% — 5.25M QDs, governance-locked at launch.',
      'Core contributors: 15% — 3.15M QDs, 4-year linear vest, 1-year cliff.',
      'Liquidity: 10% — 2.1M QDs, AMM provision at launch.',
    ],
  },
  {
    title: 'How shielded transfers work',
    paragraphs: [
      'QDs do not behave like a standard public ERC-20. Balances are note-based commitments in Aztec’s private state tree. Transfers consume input notes and create outputs of equal value, backed by a zkSNARK validators check in constant time relative to witness size.',
      'Shield and unshield bridge public Ethereum ERC-20 liquidity into the private pool—users choose their exposure. Inside the pool, counterparties and amounts stay private; only proof validity is public.',
    ],
  },
  {
    title: 'Proof of Contribution (PoC)',
    paragraphs: [
      'PoC rewards verifiable work: quality forum posts, infrastructure relays, circuit reviews, and accurate whale-detection contributions. Each claim is encoded in Noir, proved locally, and verified on-chain before mint authorization.',
    ],
    callout: {
      title: 'Incentives that match the stack',
      body: 'Emissions flow to people who strengthen the private economy—builders and provers—not to passive observers of public mempools.',
      href: '/whitepaper',
      hrefLabel: 'Technical whitepaper',
    },
  },
  {
    title: 'Governance and treasury',
    paragraphs: [
      'Treasury spending needs passing public proposal thresholds, with optional private ballot aggregation. Parameter changes (emission slope, fee burns, circuit upgrades) are timelocked on L1 with Aztec execution for sensitive votes. No admin key can mint inside the shielded pool without circuit authorization.',
    ],
  },
];

export const DEVELOPER_SECTIONS: AztecDocSection[] = [
  {
    title: 'Build on private state',
    paragraphs: [
      'Humanity Ledger offers APIs, SDKs, and reference circuits for developers who want privacy-preserving apps without running their own prover fleet. The stack assumes the Aztec sandbox for local work, Noir for constraints, and TypeScript for client integration.',
    ],
  },
  {
    title: 'Getting started — Aztec sandbox',
    paragraphs: [
      'Install the Aztec CLI, run a local network, deploy the QDs token artifact, and fund a PXE (Private Execution Environment) account. The guides walk through posting a private forum reaction and checking the nullifier on-chain.',
    ],
    bullets: [
      'aztec-nargo for compiling Noir contracts.',
      '@aztec/aztec.js for PXE wallet and contract calls.',
      '@aztec/bb.js for browser-side proving where supported.',
    ],
    callout: {
      title: 'Developer guides',
      body: 'Step-by-step: sandbox setup, deploy, shield QDs, submit a PoC proof.',
      href: '/developer',
      hrefLabel: 'Developer hub',
    },
  },
  {
    title: 'Noir circuits — Verifiable policy',
    paragraphs: [
      'Our circuits encode membership tiers, transfer limits, and reputation updates. Study them to fork private governance or plug Humanity Ledger identity into your app. Circuits are versioned; breaking changes need governance approval and audit.',
    ],
    callout: {
      title: 'Circuit repository',
      body: 'Reference implementations and verification keys for auditors.',
      href: 'https://github.com/hvbr1s/noir-circuits',
      hrefLabel: 'Noir circuits on GitHub',
    },
  },
  {
    title: 'API surface',
    paragraphs: [
      'REST endpoints expose public forum indexes, whale signal metadata, and health checks. Authenticated routes accept HMAC-signed requests for paid tiers. WebSocket streams deliver large-wallet alerts with sub-second latency on supported plans.',
      'Private operations never send plaintext secrets over REST—clients prove in Noir; servers verify proofs or relay to Aztec nodes.',
    ],
    callout: {
      title: 'API reference',
      body: 'Documentation for REST, WebSocket, and webhook integrations.',
      href: '/developers/api-docs',
      hrefLabel: 'API reference',
    },
  },
  {
    title: 'Security for integrators',
    paragraphs: [
      'Never log private keys, note secrets, or witness buffers. Rate-limit by API key tier. Validate proofs server-side before trusting client claims. Follow our CSP and WAF guidance for production deployments.',
    ],
  },
];

export const SECURITY_SECTIONS: AztecDocSection[] = [
  {
    id: 'policy',
    title: 'Security policy',
    paragraphs: [
      'Humanity Ledger assumes hostile networks, compromised clients, and curious operators. We do not trust the browser, the API layer, or the sequencer—only verified cryptography and minimal public state changes.',
    ],
    bullets: [
      'All private transitions require client-generated zkSNARKs; servers cannot forge spends.',
      'No custody of user keys, note plaintext, or XMTP session material.',
      'Production: WAF, CSP, HSTS, rate limits, and segregated secrets in Railway/K8s.',
      'Session cookies use httpOnly and secure flags; wallet auth uses JWT with rotating secrets.',
    ],
  },
  {
    id: 'bounty',
    title: 'Bug bounty — $250,000 pool',
    paragraphs: [
      'We invite researchers to audit Noir circuits, bridge contracts, API auth, and client proving pipelines. Rewards are paid in USDC and QDs by severity, with bonuses for novel breaks affecting shielded balances.',
    ],
    bullets: [
      'Critical (up to $50,000): unauthorized mint/transfer, nullifier reuse, private data exposure, circuit soundness break.',
      'High (up to $10,000): auth bypass on paid APIs, privilege escalation, fund loss under realistic conditions.',
      'Medium (up to $2,000): XSS/CSRF on sensitive domains, DoS with economic impact, information leaks.',
      'Low: defense-in-depth improvements accepted case-by-case.',
    ],
    callout: {
      title: 'Responsible disclosure',
      body: 'Email security@humanidfi.com with proof of concept and impact analysis. Allow 14 days for a patch before public disclosure. We aim to respond within 24 hours.',
    },
  },
  {
    id: 'audits',
    title: 'Audits and formal verification',
    paragraphs: [
      'Third-party audits cover Noir circuits (membership, transfer, PoC mint), Solidity bridge proxies, and critical API authentication paths. Reports publish here when complete, with remediation status.',
      'Continuous fuzzing runs on constraint systems; differential testing compares Noir witnesses against reference implementations. We track Aztec security advisories and deploy patches under emergency timelock when required.',
    ],
    bullets: [
      'Circuit audit — scheduled Q3 (firm TBA).',
      'Bridge contracts — internal review complete; external audit queued.',
      'Frontend / API — annual penetration test aligned with enterprise SLA tiers.',
    ],
  },
];

export const API_MARKETPLACE_INTRO: AztecDocSection[] = [
  {
    title: 'Institutional signal API',
    paragraphs: [
      'The API Marketplace delivers large-wallet detection, mempool-adjacent alerts, and cross-chain flow analytics to trading desks, quants, and builders. Public metadata is available over REST and WebSocket; future tiers may require zero-knowledge eligibility proofs.',
      'Plans scale from independent researchers to enterprise teams with custom SLAs, dedicated keys, and webhook delivery.',
    ],
    bullets: [
      'HMAC-authenticated requests with replay protection.',
      'Tiered rate limits and token coverage per plan.',
      'Optional ZK-gated endpoints for verified human operators (roadmap).',
    ],
  },
];

export const ROADMAP_SECTIONS: AztecDocSection[] = [
  {
    title: 'Product roadmap',
    paragraphs: [
      'We ship privacy infrastructure before scale: identity and shielded state first, portfolio tools second, social features third, and hardened Noir governance last. Each milestone ships with verifiable circuits—not slide-deck promises.',
      'Aztec is the execution layer where whale analytics, QDs incentives, and encrypted messaging meet—without exposing user graphs on public mempools.',
    ],
    bullets: [
      'Phase I — Identity & privacy: passkeys, ZK-proven transactions, privacy scoring, stealth interfaces.',
      'Phase II — Portfolio & assets: multi-chain analytics, live whale signals, forensic graph expansion.',
      'Phase III — Social & comms: ZK forum, secure attachments, PIN-gated Whale Chat, XMTP E2EE.',
      'Phase IV — Security & Noir contracts: timelocks, WAF/CSP hardening, $250k bounty, audited Noir deployments.',
    ],
    callout: {
      title: 'Living document',
      body: 'The interactive graph below updates as milestones complete. Mainnet-scale private governance waits on audited Noir deployments.',
    },
  },
];

export const COMMUNITY_FORUM_INTRO: AztecDocSection[] = [
  {
    title: 'Community forum',
    paragraphs: [
      'The Humanity Ledger forum is where the community discusses protocol upgrades, Noir circuit proposals, and QDs economics. Categories cover whale-network intelligence, Aztec testnets, Noir development, and QDs Connect integrations.',
      'Reputation and rewards tie to Proof of Contribution—quality posts can unlock shielded QDs mints when circuits validate non-sybil participation.',
    ],
    bullets: [
      'Guidelines for responsible disclosure and no doxxing.',
      'PIN-gated Whale Chat links forum identity to encrypted messaging.',
      'Governance polls will move to private ballots on Aztec as circuits mature.',
    ],
    callout: {
      title: 'Aztec community',
      body: 'Join builders and privacy advocates working on the next private execution environment.',
      href: 'https://discord.gg/aztec',
      hrefLabel: 'Aztec Discord',
    },
  },
];
