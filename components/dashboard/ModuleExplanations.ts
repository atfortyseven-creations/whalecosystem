export const MODULE_EXPLANATIONS: Record<string, { title: string, subtitle: string, overview: string, features: { title: string, desc: string }[] }> = {
    'dashboard': {
        title: 'OVERVIEW: MACROECONOMIC COMMAND CENTER',
        subtitle: 'STRUCTURAL SYNTHESIS & GLOBAL TELEMETRY',
        overview: 'The operational epicenter of Sovereign Terminal. This environment consolidates the global market state into a single interface in real-time, functioning as a financial intelligence nerve center. It processes and translates critical fluctuation vectors—from massive liquidity injections to L1 network latency disruptions—providing the institutional operator with an unmatched, data-driven tactical advantage.\n\nThrough continuous analytical processing, this module filters the inherent blockchain noise to present distilled and precise metrics, ensuring that strategy design is based exclusively on purified alpha indicators.',
        features: [
            { title: 'Analytical Convergence', desc: 'Instant algorithmic aggregation of inter-market variations to accurately reflect the true state of the ecosystem.' },
            { title: 'RPC Integrity Monitor', desc: 'Exhaustive evaluation of cryptographic latency (sub-millisecond) and redundancy of global node connections.' },
            { title: 'Metric Normalization', desc: 'Key metrics are dynamically normalized and smoothed according to volatility spikes detected in the active timeframe.' }
        ]
    },
    'watchlist': {
        title: 'WATCHLIST: HEURISTIC ENTITY TRACKING',
        subtitle: 'INSTITUTIONAL RADAR & SURVEILLANCE SYSTEM',
        overview: 'The Watchlist module transcends traditional price tracking, operating as a surveillance infrastructure aimed at tagging institutional clusters and "Smart Money". This environment allows for the technical classification and isolation of specific addresses, equipping the user with an early warning system against significant on-chain perturbations.\n\nBy cross-referencing the historical behavior of the observed entity with its real-time transfers, this viewer acts as the first line of defense against systemic manipulations or massive capital rotations.',
        features: [
            { title: 'Independent Vector Surveillance', desc: 'Uninterrupted mapping of entities with direct integration to the local ledger, completely independent of third-party centralized databases.' },
            { title: 'Predictive Alert Thresholds', desc: 'Advanced configuration of boundaries and parameters that trigger notifications upon institutional capital movement.' },
            { title: 'Transactional Noise Filtering', desc: 'Proactive suppression of minor oscillations ("dusting attacks") to focus vision exclusively on high-impact transfers.' }
        ]
    },
    'news': {
        title: 'LIVE NEWS: STRATEGIC INTELLIGENCE TERMINAL',
        subtitle: 'MEDIA SENTIMENT PARSING & EVALUATION',
        overview: 'Developed to decode massive streams of macroeconomic information and global socio-political events. The Live News module is not a simple aggregator, but a Natural Language Processing (NLP) infrastructure designed to weigh sector relevance from global news agencies (Bloomberg, Reuters, and private-grade feeds).\n\nThe system isolates and interprets the directional impact of media semantics on any asset class. This allows the manager to anticipate institutional accumulation or capitulation patterns long before these news items formally materialize in the Order Book.',
        features: [
            { title: 'Quantitative Sentiment Evaluation', desc: 'Measurement of semantic polarization and macroeconomic impact on global informative entities.' },
            { title: 'Continuous Asynchronous Flow', desc: 'Uninterrupted deployment of breaking financial reports with maximum web synchronization priority.' },
            { title: 'Semantic Debugging', desc: 'Selective algorithms that discard sensationalist redundancies to preserve exclusively the fundamental market signal.' }
        ]
    },
    'gold': {
        title: 'TICKET MINT: INSTITUTIONAL GOLDEN LABEL',
        subtitle: 'ACCESS TO PRIVILEGED ARCHITECTURE & EXCLUSIVE ROUTES',
        overview: 'The upper access echelon of Sovereign Terminal. This perimetered enclave houses the most demanding parametric tools, restricted to entities with Golden operational status. It guarantees an infrastructure with unshared bandwidth, providing absolute resilience against extreme latencies or public provider collapses.\n\nUnlocking the terminal\'s underlying layers, it ensures escalated permissions that guarantee total isolation (Zero-Knowledge) and unrestricted access to primary data conduits, ensuring critical operations never halt due to technical limitations.',
        features: [
            { title: 'Dedicated Data Vectors', desc: 'Absolute priority in the allocation of corporate RPC nodes, eliminating classic bottlenecks during hyper-saturations.' },
            { title: 'Obfuscation & Privacy (ZK)', desc: 'Activation of hidden traceability modules based on Zero-Knowledge encryption to navigate without perimeter exposure.' },
            { title: 'Rate Limit Elimination', desc: 'Absolute permissions for the deployment of intensive analytics without standard request limitation barriers.' }
        ]
    },
    'markets': {
        title: 'MARKET OVERVIEW: MICROSTRUCTURAL PANOPTICON',
        subtitle: 'FORENSIC ANALYSIS OF BOOK DEPTH & LIQUIDITY',
        overview: 'The Top Markets viewer executes continuous analytical modeling on the most dominant trading pairs in the crypto world. Operating as a microstructural scanner, it dives into the Order Book to empirically discern between real liquidity, book manipulation ("Spoofing"), or "Wash Trading".\n\nIt volumetrically decomposes the architecture and resistance of buying and selling postures. This reveals concentrations of "Smart Money", real support and resistance levels (Bid/Ask Walls), and identifies with surgical clarity the geographical vectors towards which financial dominance flows.',
        features: [
            { title: 'Order Book Radiography', desc: 'Algorithmic identification of illusory capital barriers designed to guide or trap the retail investor.' },
            { title: 'Capital Kinematics', desc: 'Quantitative mapping of net inter-exchange flows (Netflows) and directional metrics of global volume.' },
            { title: 'Fragmentation Correction', desc: 'Heuristic mitigation of price distortions by consolidating atomized platforms into a single true metric index.' }
        ]
    },
    'newpairs': {
        title: 'NEW TOKENS: GENESIS CONTRACT ANALYSIS',
        subtitle: 'SYNCHRONOUS AUDIT OF RECENTLY ISSUED ASSETS',
        overview: 'The testing ground where protocols emerge onto the mainnet. This system acts as a hypersensitive periscope interconnected to the EVM mempool, intercepting the creation of smart contracts (Contract Creation Events) and tracking initial liquidity provision in Automated Market Makers (AMMs).\n\nThrough an algorithmic risk evaluation, it examines fundamental token health metrics: master key renunciations, liquidity burns, and deceptive taxes ("Honeypot Diagnostics"), serving as the definitive analytical shield against fraud during primal periods of high volatility.',
        features: [
            { title: 'Mempool Interception', desc: 'Detection at zero-instant: forensic reading of the contract before or during the exact block of its insertion into the blockchain.' },
            { title: 'Structural Risk Diagnosis', desc: 'Automatic audit of the distribution of founding wallets and the real degree of initial decentralization.' },
            { title: 'Functional Liquidity Thresholds', desc: 'Filters immaterial tokens based exclusively on economically serious concentrations of launch capital.' }
        ]
    },
    'omniexplorer': {
        title: 'BLOCK EXPLORER: MULTI-CHAIN FORENSIC ENGINE',
        subtitle: 'UNIVERSAL CRYPTOGRAPHIC CARTOGRAPHY & DECODING',
        overview: 'The Omni Explorer replaces the fragmentation and inefficiency of conventional block browsers. It constitutes an agnostic ecosystem capable of interpreting architectures from the Ethereum network (EVM), Bitcoin (UTXO), and other L1s, grouped under an interface purified of visual noise and distractions.\n\nIt provides analytical firms with advanced capabilities to destructure any referenced metric (Transaction Hashes, Blocks, Contract Addresses), transforming raw machine code (Hex/Opcodes) into a logical, transparent diagram suitable for investigations or audits.',
        features: [
            { title: 'Dynamic Chain Detection', desc: 'Automatic resolution and indexing of the base network (Target Network) starting solely from the input hash heuristic.' },
            { title: 'Human-Readable Decoding', desc: 'Direct and frictionless translation of "Call Datas" and metadata into functional and clear records.' },
            { title: 'Visual Isolation Ergonomics', desc: 'Centralization of relevant balance deltas, eliminating the advertising perimeter pollution inherent in free explorers.' }
        ]
    },
    'brc': {
        title: 'BRC EXPLORER: NATIVE BITCOIN INSPECTOR',
        subtitle: 'METHODOLOGICAL TRACKING OF THE L1 ORDINAL ECONOMY',
        overview: 'A custom-designed technological infrastructure for forensic scrutiny and preservation of the unified Bitcoin ledger. It systematically interrupts the "Witness" segments of operations (Taproot) to examine the underlying adjacent information, providing total visibility to Ordinals inscriptions and BRC-20 ecosystem supplies.\n\nThrough its continuous state engine, it allows calculating fragmented market capitalizations directly on legendary satoshis, without the need to interact with cross-trust bridges or depend on the dictates of centralized indexers.',
        features: [
            { title: 'Native BTC Ledger Extraction', desc: 'Direct reading of raw transactions coupled to Bitcoin Core validation nodes.' },
            { title: 'BRC-20 Abstraction Telemetry', desc: 'Rigorous representation of secondary transfers, balances, and institutional retentions in the underlying protocol.' },
            { title: 'Optimized UTXO Modeling', desc: 'Fragmentation examination of the "cosmic dust" of satoshis to facilitate audits and re-consolidation of institutional wallets.' }
        ]
    },
    'firehose': {
        title: 'WHALE FIREHOSE PRO: L1 NETWORK SEISMOGRAPH',
        subtitle: 'EXTREME & LIVE MONITORING DIRECTLY FROM THE MEMPOOL',
        overview: 'The most intense intelligence component of Sovereign Terminal. "Whale Firehose" materializes as a direct-injection WebSockets conduit that captures, parses, and spits out tens of thousands of Mainnet events (Global Blocks) every second.\n\nConceived for elite operators, it requires absolute dominance over on-chain "white noise". It integrates strict parametric filters hosted on the client-side (Local Computing) to discriminate small polar operations and unequivocally reveal those transfers with massive-grade volume that will impact order books in the coming minutes.',
        features: [
            { title: 'High-Frequency Rendering (Zero-Mock)', desc: 'Real asynchronous indexing from the main EVM node without added delays, visualizing the true transactional history.' },
            { title: 'Atomic High-Scale Filtering', desc: 'Heuristic evasion systems that instantly eliminate micro-movements to focus the radar on "Whale" activity.' },
            { title: 'Tactile & Structured Telemetry', desc: 'Automated tabular classification (Transfer Type, Main Currency, Directionality, Adjusted Dollars, Gwei).' }
        ]
    },
    'sov-intel': {
        title: 'SOVEREIGN INTEL: SECOND-LAYER INTELLIGENCE',
        subtitle: 'DE-ANONYMIZATION & COUNTER-ESPIONAGE PATTERNS',
        overview: 'The sublimation of institutional profiling. Sovereign Intel works by crossing exhaustive deterministic databases with probabilistic behaviors, identifying with immense precision "Opaque Wallets" belonging to hedge funds, custodians, or large Market Makers.\n\nBy applying clustering models, it deploys an analytical framework capable of detecting the strategic repositioning of the so-called "Smart Money". It is fundamental for forecasting hidden distributions or massive Over-The-Counter (OTC) operations that retail participants are completely unaware of.',
        features: [
            { title: 'De-Anonymization Models', desc: 'Heuristic semantic identification correlating network consumption patterns, emission times, and recurring bridges.' },
            { title: 'Forensic Route of OTC Activity', desc: 'Exhaustive detection of extreme liquidations carried out peer-to-peer, totally evading conventional algorithmic tracking.' },
            { title: 'Base Accumulation Diagramming', desc: 'Intensive study of a specific cluster\'s balance by contrasting outflows versus inflows over a full fiscal quarter.' }
        ]
    },
    'inst-ledger': {
        title: 'INSTITUTIONAL LEDGER: THE AUDITABLE RECORD',
        subtitle: 'PERSISTENCE, COMPLIANCE & HISTORICAL METRICS',
        overview: 'The Institutional Ledger is an immutable and persistent platform where macroeconomic monetary alterations (Large Value Events) are recorded, analyzed, and archived. Acting as the long-term memory of the Blockchain and a corporate audit library.\n\nIt allows quantitative analysts and Compliance teams to go back in mathematical time to verify critical fluctuations, document exceptional events (Black Swans), or obtain intact, alteration-free exports required for KYC/AML reports, shareholder meetings, and international legal requirements.',
        features: [
            { title: 'Frictionless Historical Preservation', desc: 'Deterministic traceability, offering the pure metadata that framed previous volumetric perturbations in the market.' },
            { title: 'Multi-Parametric Search Criteria', desc: 'Advanced filtering tools based on dollarized capital thresholds, native hashes, and temporal status.' },
            { title: 'Modular Deliverables', desc: 'Purified tabular formats of maximum technical readability ready for review and fiscal audit.' }
        ]
    },
    'mass-transfer': {
        title: 'TRANSFER HUB: RESERVE DISTRIBUTION MAPPING',
        subtitle: 'ANALYSIS OF MIGRATIONS TOWARDS CENTRALIZED EXCHANGES',
        overview: 'A macro module exhaustively focused on tracking and notifying imminent redistributions of large global reserves (Hot/Cold Wallets). The system monitors deposit transitions to and from Centralized Exchanges, identifying the general climate and decisively anticipating disruptions in circulating inventory ("Supply Shocks").\n\nIt interprets large outflows or influx spikes with relentless heuristic logic: identifying whether hundreds of millions have aggressively entered Binance or OKX (selling pressure) or if they have been extracted to Self-Custody Wallets (imminent scarcity).',
        features: [
            { title: 'Automatic Multi-Category Classifier', desc: 'Distinguishes with metric rigor net inflows to platforms, internal hot/cold rotation, or transfers to protocol staking.' },
            { title: 'Depletion Rates Meter', desc: 'Immediate signals reporting sudden reserve contractions, typical precursors to severe "Short-Squeezes".' },
            { title: 'Tectonic Visual Traceability', desc: 'Monochromatic full-scale layout offering insuperable information densities per square metric.' }
        ]
    },
    'graph': {
        title: 'ENTITY GRAPH: D3 RELATIONAL CARTOGRAPHY',
        subtitle: 'MULTIMODAL VISUALIZATION THROUGH DIRECTED FORCES',
        overview: 'The materialization of relational forensic intelligence. It translates basic alphanumeric rows into dynamic spatial representations of Graph topological theory. Driven by Force-Directed algorithms and Neo4j logic, it reveals the hidden axes between entities and institutions at a single glance.\n\nUnder this framework, nodes (Wallets/Contracts) deploy gravity proportional to their accumulated capital. By isolating interconnected networks and evaluating cross-links, the operator can perceive ramifications for money laundering (Money Laundering Hops), pyramidal agglomeration of corporate funds, or surreptitious nested structures.',
        features: [
            { title: 'D3 Dynamic Gravitational Models', desc: 'Financial nodes gravitate and interact fluidly based on the monetary correlation injected or drained between them.' },
            { title: 'Centrality & Concentration Analytics', desc: 'Selection individualizes and immobilizes key vectors, revealing risk and the distributive proportion of the total retained balance.' },
            { title: 'Guaranteed Immersive Performance', desc: 'Hyper-optimized vector processing guaranteeing fixed frames without cuts or rendering failures in extensive analyses.' }
        ]
    },
    'defi': {
        title: 'DEFI YIELDS: PURE PROFITABILITY TRACKER',
        subtitle: 'STRATEGIC DISSECTION OF PASSIVE BEHAVIOR',
        overview: 'The master bridge to monitor the behavior of institutional passive distribution. It live-tracks and compiles vaults and Liquidity Pools from key systemic decentralized ecosystems (such as Aave, Curve Liquid Assets, or Uniswap V3).\n\nIts purpose is to analytically segregate the organic "Real Yield" from the hyperinflation caused by the harmful emissions of the protocols themselves. It strips bare where and how "Institutional Money" deposits massive safeguards, assuming marginal impermanent risk to secure scalable real interest.',
        features: [
            { title: 'Pure APY/APR Dual Calculations', desc: 'Absolute demystification of exaggerated yields by abstracting the artificial delta induced by inefficient algorithmic subsidies.' },
            { title: 'Strict Total Value Locked (TVL) Verification', desc: 'Audit of the monetary thickness of institutional portfolios to detect vulnerable hotspots prone to sudden draining.' },
            { title: 'Algorithmic Spread Discrepancies', desc: 'Explicitly points out exploitable yield liquidity gaps across the multi-chain spectrum.' }
        ]
    },
    'polymarket': {
        title: 'POLYMARKET: PREDICTION ORACLE VIEWER',
        subtitle: 'MATHEMATICAL PROBABILITY IN GLOBAL POLITICAL UNCERTAINTY',
        overview: 'An insertion of the probabilistic pulse. It integrates the most robust predictive values from the largest asymmetric prediction market: Polymarket. This viewer captures and transfers the aggregated wisdom and literal monetary bets on global socioeconomic decisions.\n\nUnder this analytical window, the terminal dissolves speculation and public narrative into raw statistics derived from risked money ("Skin in the Game"). The market objectively indicates the exact percentage that a systemic risk event or foundational milestone will occur, unwaveringly based on underlying liquidity.',
        features: [
            { title: 'Probability-Based Allocative Models', desc: 'Crystallization of the speculative spread into numerical asymmetric certainties, free of personal or journalistic analytical opinion.' },
            { title: 'Underlying Momentum Evaluation', desc: 'Allows foreseeing how drastic monetary shocks in asymmetric networks predefine crucial political verdicts.' },
            { title: 'Binary Tactical Tracking (Yes/No Scenarios)', desc: 'Rigorous mapping of inflections across pre-defined intervals marked by extremely high levels of social and economic pressure.' }
        ]
    },
    'forge': {
        title: 'COSMIC FORGE: SOVEREIGN ENVIRONMENTS & CLI',
        subtitle: 'CORE PROTOCOLIZATION & "ZERO MOCK/FAKE" CONTROL',
        overview: 'The true command anvil reserved for the terminal cluster\'s total administrator. Cosmic Forge represents the centralized access to inspect and alter internal extraction parameters. It is the only zone where absolute interference is granted over how the terminal routes, queries, and interacts with the outside world.\n\nSovereignty to the maximum exponent: its use guarantees that all information comes from "Transparent RPC Nodes", consolidating the unyielding mandate of "Zero-Mock Data". It allows fine adjustments over refresh rates (Polling) and authentication variables, transforming the entire platform into your control base.',
        features: [
            { title: 'Integrated Terminal Interface', desc: 'A structural simulation that admits advanced commands to reload connectors without interrupting L1 market flows.' },
            { title: 'Anti-Simulation Confirmation & Ruling', desc: 'Operational audits to ensure and verify that all transient data is extracted without organic or stochastic falsifications.' },
            { title: 'Enterprise Open Modularity', desc: 'Fundamentally designed to pre-scale and tolerate background sequences and future automated robotic implementations (Bots/Algos).' }
        ]
    },
    'portfolio': {
        title: 'MAIN PORTFOLIO: STABLE EQUITY VISUALIZER',
        subtitle: 'MACRO-ECONOMIC AMALGAM OF THE ABSOLUTE BALANCE SHEET',
        overview: 'The consolidated logistical checkpoint for your global liquid resources. "Main Portfolio" consolidates the complete view of cryptographic reserves held cross-chain. It measures your holdings safeguarded in stablecoins, rigid vaults (Multi-sig Hard-Assets), and speculative investments.\n\nIt grants the architect and their trading desk the ability to balance ultra-high net worth portfolios, examining the exact mathematical proportion of each asset under a hermetic infrastructure, vectorially encrypted in terminal memory that never yields tracing to Sovereign Terminal\'s online hosting.',
        features: [
            { title: 'Perimeter Cryptographic Compilation', desc: 'Algorithmic structural integration without violating Web3 permissions (Read-Only Matrix), keeping keys uncompromised.' },
            { title: 'Dominance Pie Chart Architecture', desc: 'Segmented percentage distribution to observe the divergence between profits and assets in negative float.' },
            { title: 'Systemic Risk & Hedging Control', desc: 'Holistically projects fragility or robustness against imminent disruptions of third-party capital safeguarded in decentralized protocols.' }
        ]
    },
    'live-port': {
        title: 'QUICK PORTFOLIO: LATERAL ECONOMIC SCOREBOARD',
        subtitle: 'ASYNCHRONOUS SURVEILLANCE DURING MULTITASKING',
        overview: 'Designed under the extreme premise of minimalist peripheral functionality. The "Quick Portfolio" acts as a radial indicator without demanding continuous massive graphical resources from the local GPU.\n\nIts purpose lies in imperceptibly displaying selected vital balances while the main concentration field and data processor tackle deep analysis panels and D3 Forensic heuristics. It guarantees attentive supervision without fissures in concurrent or unstable landscapes.',
        features: [
            { title: 'Clean & Fast Initialization Line', desc: 'Total absence of unnecessary renders to deliver parametric response within a tenth of a second post-authentication.' },
            { title: 'Isolated High-Impact Routes', desc: 'Semantic prioritization of the underlying top equities of the connected address, suppressing residual or "dusty" generic visibility.' },
            { title: 'Computational Cease on Collapse', desc: 'Total automatic closure of listeners when the active window of this module is not visible, in favor of maximum memory and CPU profitability.' }
        ]
    },
    'whale-port': {
        title: 'WHALE HOLDINGS: INSIDER ANALYTICAL MIRROR',
        subtitle: 'PROJECTION & SUPERPOSITION OF OPPOSING FUNDS',
        overview: 'The holographic projector of adversarial investment par excellence. This discipline allows tracing and projecting onto the platform the known or opaque portfolios of dominant institutions and giant treasuries.\n\nIt constitutes the Acid Test of the contemporary operator: to observe, superimpose, and compare down to the millimeter the behavior (Cost Basis / Token Allocation) of the great "Insiders" against the logics adopted by the local desk. It provides raw deductions aimed purely at mitigating errors through empirical learning modeled on the system\'s interconnected elite of whales.',
        features: [
            { title: 'Non-Operational Institutional Visual Copy', desc: 'Heuristic foreign entry to clone the exposure of colossal wallets onto friendly graphic boards native to the Terminal.' },
            { title: 'Longitudinal Traces of Admission & Cost Basis', desc: 'Calculates with precise logarithms in which congestion price zones these silent administrators concentrated large purchases.' },
            { title: 'Spread Evaluation', desc: 'Empirical and visual confrontation of risk exposures: confronts your distributive level against external corporate macro-structural shielding.' }
        ]
    },
    'vault': {
        title: 'SOVEREIGN VAULT: THE ZERO-TRUST CORE',
        subtitle: 'DEFENSE IN DEPTH, ENCRYPTION & ISOLATED MEMORY',
        overview: 'Sovereign Vault acts as the master gear in strict self-sovereignty and defensive architecture. A virtual memory confinement (Sandboxing In-Memory) designed to protect cryptographic credentials, asymmetric configurations of corporate APIs, or any other ultra-sensitive parameter variant dictated by the user or their organizational desk.\n\nIt trusts no database, underlying "Cloud" service, or obsolete cookies. It is cemented under a "Security-by-Design" paradigm. The lock remains closed until accredited via Web3 parametric verification, evading XSS (Cross Site Scripting) attacks and unauthorized remote inspections.',
        features: [
            { title: 'Volatile Persistence (RAM-Based Security)', desc: 'Immovable structural integration of stable and encrypted cryptographic bases that die irreparably if a fortuitous connection failure or temporary hostile reloads occur.' },
            { title: 'Cryptographic Validation & ECDSA Signature', desc: 'Activation exclusively executed by crossing secure logical transactions by the MetaMask connector or Hardware-Based sovereign providers.' },
            { title: 'Absence of Public Trail or Secondary Record', desc: 'Fosters the motto "Know and Control Your Own Keys", nullifying centralized vectors historically exploited with technical devastation on other standard analytical platforms.' }
        ]
    },
    'zk': {
        title: 'ZK SHIELD: ADVANCED PRIVACY ARMOR',
        subtitle: 'SYBIL-SAFE & RELATIONAL MITIGATION PROTOCOLS',
        overview: 'The essential anti-tracking on-chain shield for the tactical preservation of the macro-analyst. Every operation and web query implies potential relational extraction by third-party Forensic Analysis corporates. ZK Shield is the panel to activate protective barriers aimed at ensuring a "Stealth" experience that bypasses and masks the local operator\'s route regarding their interaction towards L1/L2 nodes.\n\nIt adds deterministic probabilistic algorithms (Spoofing & Selective Routing) deliberately tasked with blurring telemetric noise. Mitigating IP address correlation attacks (common OPSEC Vulnerabilities), allowing for rigorous and uncompromising anonymous forensic immersion in terms of Perimeter Security.',
        features: [
            { title: 'Peripheral Subterfuge Router', desc: 'Programmed division of multiple cross-requests against price oracles and RPC nodes to conceal direct and focal analytical intentions.' },
            { title: 'Adversarial Telemetry Suppression (Ad-Hoc Antivirus)', desc: 'Engine that filters responses attempting to collect logical correlations directly to the user actively observing the institutional market landscape.' },
            { title: 'Secure Channels Ready for Zero-Knowledge Proofs', desc: 'A scalable directive towards truly anonymous L2 networks (OP or ZK Rollups) without drastically altering terminal fluidity.' }
        ]
    },
    'logs': {
        title: 'SESSION LOGS: SOC2 BIDIRECTIONAL AUDIT',
        subtitle: 'OPERATIONAL TRANSACTION LOG INSPECTOR',
        overview: 'The supreme module in internal operational procedural guarantee. A real-time control capable of auditing from start to finish every millimeter local alteration on the ecosystem variables. From Web3 Wallet Handshake initializers to direct interventions on local App connectors or deep interactive graphic viewers intercepted from the corner of the eye.\n\nAt a corporate and institutional level, it is vital to understand exactly when or because of what a crucial reading was derived, therefore providing an indelible algorithmic documentation during the session, constituting itself as an immaculate review and debugging tool fundamental in environments without any asymptotic simulation of "Mock Data".',
        features: [
            { title: 'Click Traceability & API Forensic Queries', desc: 'Indexed records millisecond by millisecond of direct events without omitting panel changes or derived volumetric recalculations.' },
            { title: 'Longitudinal Inspection & Raw Debugging', desc: 'Direct on-site validation of possible collapses due to bottlenecks guaranteeing empirical certainty over consumable channels.' },
            { title: 'Structured Reports without File Corruption', desc: 'Deployments suitable for meticulous technical examination in a clear and explicit way, free of redundant or useless abstract decorations for an auditing analyst.' }
        ]
    },
    'academy': {
        title: 'ACADEMY: INSTITUTIONAL RIGOR LIBRARY',
        subtitle: 'DOCTRINAL CONCEPTUALIZATION & SCIENTIFIC MENTAL MODELS',
        overview: 'The inexhaustible provision of stochastically purified data must be backed by a superior degree of underlying epistemological baggage. Academy forms an isolated repository of macroeconomic interferences purely focused on honing doctrinal shields over advanced methodologies.\n\nFull Cognitive Sovereignty: This section fosters a deep understanding of Flash Loan attacks, Front-Running engineering, and organic Market-Making iterations, intellectually immunizing the manager against fictional retail narratives forged on emotions and transactional illusion. The analyst\'s advantage truly lies in assimilating that all economic courses happen programmatically (Via Hardware and Liquidity).',
        features: [
            { title: 'Cryptographic Defensive Models Formative Curriculum', desc: 'Rigorous pragmatic classification with chapters dedicated and exempt to dissections of the structures that dictate underlying Web3 L1 and L2 by logical hierarchical layers.' },
            { title: 'Superior Forensic Taxonomy of the Operational Technical Glossary', desc: 'Resounding reduction of misunderstandings through global descriptive homogenization assuming the same terms as institutional entities and cyber-intelligence experts.' },
            { title: 'Pure Visibility & Zero-Distractive Visual Impact', desc: 'Reading capsule designed specifically preventing lateral bleeding with strict borders without aggressive gradients for absolute concentrative assimilation.' }
        ]
    },
    'support': {
        title: 'SUPPORT: DIRECT COMMUNICATION TACTICAL PROTOCOL',
        subtitle: 'STRATEGIC LINKS & SHOCK LOGISTICAL INTERVENTIONS',
        overview: 'When logarithmic analysis crashes against an unresolved external algorithmic distortion, or a critical continental-level node closure (API Blackout) occurs, Sovereign Support automatically establishes the corporate red line for immediate and effective human intervention of high technical resolution.\n\nIt avoids fatal delays enabling vertical contact and communication from the cryptographic terminals directly to the system\'s directive governance; resolving complex failures, mitigating operational doubts during unusual tactical executions without delegating information or private data to public external service desks vulnerable to technical manipulation and cross-chain logical infiltrations.',
        features: [
            { title: 'Simultaneous Deterministic Escalation to Operators (Ad-Hocles)', desc: 'Guarantees without intermediation that stuck complex logarithmic guidelines or local failures reach directly to the comprehensive technical resolutive command center.' },
            { title: 'Absolute Integrity Zero Concrete & Connective Operational Exposure (Zero Leak Contexture)', desc: 'Immediate preservation and transactional masking if it required sending a local capture of a specific problem without attaching or revealing localized Seed Phrases or Private Tokens.' },
            { title: 'Continuous Documented In Situ Provision of Status & Systemic Breakdown', desc: 'Adjacent boards and computer scientists to proactively and institutionally validate catastrophic global events that temporarily affect the entire Web3 protocol as underlying global sets of temporarily fallen oracles with absolute strict rigorous transparency.' }
        ]
    }
};
