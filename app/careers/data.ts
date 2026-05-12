import { DollarSign, MapPin, Cpu, Zap, Users, Clock } from 'lucide-react';

export const OPEN_ROLES = [
  {
    id: 'senior-blockchain-engineer',
    title: 'Senior Blockchain Engineer',
    department: 'Core Infrastructure',
    location: 'Remote — Global',
    type: 'Full-Time',
    salary: '€120k – €180k',
    color: '#0a0a0a',
    badge: 'Priority Hire',
    skills: ['Solidity', 'EVM internals', 'Node.js', 'Rust'],
    description: 'Design and maintain the high-throughput blockchain ingestion pipelines that power our institutional data services. You will engage directly with RPC nodes, architect robust event parsers, and build the foundational data infrastructure utilized by global trading desks.',
    paragraphs: [
        'Your mandate is to engineer fault-tolerant, scalable data pipelines capable of securely indexing network activity across multiple blockchain environments in real time.',
        'You will be responsible for developing systems that process high-frequency state transitions, synthesize complex transactional data, and provide unparalleled reliability for our institutional clients.'
    ],
    requirements: [
        '5+ years of software engineering experience, with a proven track record of architecting scalable backend services in Node.js and/or Rust.',
        'Comprehensive understanding of EVM execution environments, smart contract architectures, and low-level transaction lifecycles.',
        'Extensive experience managing high-throughput databases (PostgreSQL, Redis) within enterprise environments.',
        'A rigorous approach to system stability, security auditing, and continuous deployment in production environments.'
    ]
  },
  {
    id: 'senior-web3-educator',
    title: 'Senior Technical Strategist & Educator',
    department: 'Content Architecture',
    location: 'Remote — Global',
    type: 'Full-Time',
    salary: '€80k – €120k',
    color: '#1a1a1a',
    badge: null,
    skills: ['Technical Documentation', 'Content Strategy', 'DeFi Analytics', 'Corporate Communications'],
    description: 'Develop the comprehensive knowledge base that translates advanced blockchain analytics into actionable intelligence for institutional operators. You will be responsible for producing executive research, API documentation, and authoritative educational resources.',
    paragraphs: [
        'The Sovereign Terminal provides institutional clients with unprecedented visibility into global liquidity flows. We require a highly articulate strategist to formulate and structure our technical documentation, ensuring complex cryptographic concepts are conveyed with absolute clarity.',
        'Your role involves elevating the market\'s understanding of decentralized finance. You will architect educational materials detailing our advanced analytical methodologies, smart contract evaluation frameworks, and macroeconomic liquidity assessments.'
    ],
    requirements: [
        '3+ years of demonstrable experience within the decentralized finance sector, focusing on protocol architecture and quantitative analytics.',
        'Exceptional capability to distill complex technical subjects (e.g., zero-knowledge proofs, algorithmic market making) into clear, precise, and authoritative documentation.',
        'Complete bilingual proficiency in English and Spanish (Written and Spoken), enabling our content to serve a global institutional audience.',
        'A distinguished portfolio of high-impact technical writing, developer tutorials, or executive-level research reports.'
    ]
  },
  {
    id: 'protocol-security-researcher',
    title: 'Protocol Security Researcher (Applied Cryptography)',
    department: 'Cryptography',
    location: 'Remote — EU / US',
    type: 'Full-Time',
    salary: '€140k – €200k',
    color: '#2b2b2b',
    badge: 'Senior Level',
    skills: ['Zero-Knowledge Proofs', 'Smart Contract Auditing', 'Applied Cryptography', 'Protocol Design'],
    description: 'Lead research and implementation of advanced cryptographic verification methods for our core infrastructure. You will design privacy-preserving compliance circuits, conduct rigorous security audits, and ensure the absolute integrity of our data platform.',
    paragraphs: [
        'As a Protocol Security Researcher, your objective is to ensure unparalleled system integrity. You will rigorously evaluate the cryptographic primitives that secure our institutional intelligence network.',
        'Your responsibilities will include designing zero-knowledge circuits for secure data verification, auditing our smart contract integrations, and anticipating potential security vulnerabilities before they emerge.'
    ],
    requirements: [
        '4+ years of specialized experience in applied cryptography, zero-knowledge proof systems, and rigorous smart contract security auditing.',
        'Demonstrated expertise in designing and evaluating cryptographic circuits utilizing industry-standard languages and frameworks.',
        'A proven history of successfully auditing complex decentralized protocols and identifying critical systemic vulnerabilities.',
        'An uncompromising commitment to mathematical precision and state-of-the-art security practices.'
    ]
  },
  {
    id: 'devrel-engineer',
    title: 'Developer Relations Engineer',
    department: 'Ecosystem Integration',
    location: 'Remote — Global',
    type: 'Full-Time',
    salary: '€90k – €130k',
    color: '#333333',
    badge: null,
    skills: ['API Integration', 'Python / TypeScript', 'Developer Advocacy', 'Technical Consulting'],
    description: 'Foster integration adoption and serve as the primary technical liaison for our institutional developer community. You will facilitate API adoption across major trading firms, provide architectural guidance, and establish the standard for external integrations.',
    paragraphs: [
        'You represent the critical interface between our internal engineering teams and external institutional clients. Your objective is to ensure seamless, frictionless integration of our enterprise API services.',
        'You will develop comprehensive reference architectures, author sophisticated SDK documentation, and act as a consultative partner for algorithmic trading developers integrating our data solutions.'
    ],
    requirements: [
        '3+ years of professional software engineering experience, paired with a proven ability to engage and support external developer communities.',
        'Proficiency in authoring idiomatic, high-quality reference implementations in Python, TypeScript, and/or Go.',
        'Exceptional communication skills, with the ability to convey complex architectural concepts to institutional quant teams and independent engineers alike.',
        'Experience conducting technical presentations, leading integration workshops, and maintaining world-class technical documentation.'
    ]
  },
];

export const BENEFITS = [
  { icon: DollarSign, title: 'Institutional Compensation', body: 'Highly competitive base remuneration structured for top-tier talent. Equity participation available for senior strategic roles. Compensation bands reflect our commitment to excellence.' },
  { icon: MapPin, title: 'Global Remote Operations', body: 'Operate asynchronously from any global location. We prioritize documented, precise communication over mandatory meetings, enabling deep-focus execution.' },
  { icon: Cpu, title: 'Premium Workstation Provision', body: 'A dedicated annual provision for hardware and professional tooling ensures you operate with industry-leading technology and resources.' },
  { icon: Zap, title: 'High-Autonomy Environment', body: 'We empower our teams with explicit mandates and the authority to execute them. We measure success strictly by operational impact and deliverables.' },
  { icon: Users, title: 'Professional Advancement', body: 'Substantial annual provisions are allocated for continuous professional development, certifications, and industry conferences to maintain our competitive edge.' },
  { icon: Clock, title: 'Results-Oriented Schedule', body: 'We maintain an output-driven culture. Professionals are trusted to manage their schedules efficiently, with a focus on meeting strict operational deadlines.' },
];
