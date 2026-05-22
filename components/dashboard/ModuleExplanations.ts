export const MODULE_EXPLANATIONS: Record<string, { title: string, subtitle: string, overview: string, features: { title: string, desc: string }[] }> = {
    'dashboard': {
        title: 'Encrypted Telemetry',
        subtitle: 'Node Telemetry Processing',
        overview: 'Direct integration with full nodes guarantees secure transmission of network state variables. This environment ensures strict data provenance.',
        features: [
            { title: 'Data Aggregation', desc: 'Secure consolidation of inter-network variations.' },
            { title: 'Network Health', desc: 'Continuous evaluation of connection stability and node latency.' },
            { title: 'Metric Normalization', desc: 'Dynamic adjustment of cryptographic metrics to provide clarity.' }
        ]
    },
    'watchlist': {
        title: 'Address Classification',
        subtitle: 'Secure Monitoring System',
        overview: 'A dedicated tool for monitoring and classifying specific ledger entities. By isolating specific addresses, you receive secure telemetry regarding capital movements.',
        features: [
            { title: 'Independent Monitoring', desc: 'Continuous tracking of entities using direct ledger integration.' },
            { title: 'Custom Alert Thresholds', desc: 'Configurable parameters to notify you of key state transitions.' },
            { title: 'Noise Reduction', desc: 'Proactive filtering of unverified transactions.' }
        ]
    },
    'news': {
        title: 'Global Analytics',
        subtitle: 'Macroeconomic Analysis',
        overview: 'An advanced aggregator that securely streams global financial reporting and macroeconomic events without centralized trackers.',
        features: [
            { title: 'Event Evaluation', desc: 'Measures the potential market impact of global reports.' },
            { title: 'Continuous Updates', desc: 'Uninterrupted delivery of breaking analytics.' },
            { title: 'Relevance Filtering', desc: 'Discards redundant data packets.' }
        ]
    },
    'gold': {
        title: 'Identity Provisioning',
        subtitle: 'Account Level Management',
        overview: 'The central administration area for your cryptographic access. Here you can view your current authorization parameters, manage your connection, and verify your active permissions.',
        features: [
            { title: 'Dedicated Infrastructure', desc: 'Priority access to private nodes for stable performance.' },
            { title: 'Enhanced Privacy', desc: 'Advanced routing to ensure your session remains secure and private.' },
            { title: 'Unrestricted Access', desc: 'Full permission to deploy secure analytics without standard limitations.' }
        ]
    },
    'markets': {
        title: 'Network State Telemetry',
        subtitle: 'Real-time Observation',
        overview: 'Our dedicated secure node infrastructure directly interfaces with the global mempool, allowing for precise tracking of transaction execution pipelines milliseconds after signing.',
        features: [
            { title: 'Depth Analysis', desc: 'Clear identification of capital barriers.' },
            { title: 'Capital Flow Metrics', desc: 'Quantitative mapping of net flow across primary channels.' },
            { title: 'Price Indexing', desc: 'Consolidation of fragmented data into a single verified metric.' }
        ]
    },
    'newpairs': {
        title: 'Contract Verifications',
        subtitle: 'Bytecode Verification',
        overview: 'A secure monitoring system for newly deployed smart contracts. It evaluates fundamental token metrics and bytecode integrity to assess the structure of emerging assets.',
        features: [
            { title: 'Real-Time Detection', desc: 'Immediate identification of new contracts upon deployment.' },
            { title: 'Structural Diagnostics', desc: 'Automatic review of contract logic and distribution.' },
            { title: 'Verification', desc: 'Filters assets based on fundamental cryptographic proofs.' }
        ]
    },
    'omniexplorer': {
        title: 'On-Chain Explorer',
        subtitle: 'Multi-Chain Network Search',
        overview: 'A clean, unified interface for securely exploring multiple blockchain networks without relying on external tracking entities.',
        features: [
            { title: 'Multi-Network Support', desc: 'Automatic resolution across different blockchain architectures.' },
            { title: 'Clear Data Formatting', desc: 'Translation of complex blockchain data into readable formats.' },
            { title: 'Distraction-Free Interface', desc: 'A minimalist design focused purely on the transaction data.' }
        ]
    },
    'brc': {
        title: 'Bitcoin Mainnet',
        subtitle: 'L1 Operations Tracking',
        overview: 'A specialized infrastructure for examining the Bitcoin network. It provides clear visibility into ledger activity directly from native Bitcoin Core nodes.',
        features: [
            { title: 'Native Ledger Integration', desc: 'Direct reading of transactions from Bitcoin Core nodes.' },
            { title: 'Asset Tracking', desc: 'Clear representation of verified transfers and balances.' },
            { title: 'Balance Consolidation', desc: 'Simplified views of fragmented holdings.' }
        ]
    },
    'firehose': {
        title: 'Encrypted Event Stream',
        subtitle: 'Live Network Monitoring',
        overview: 'A direct connection to the network mempool, delivering encrypted event streams. Designed for secure monitoring of raw blockchain activity as it occurs.',
        features: [
            { title: 'Zero-Delay Indexing', desc: 'Real-time synchronization with the main node.' },
            { title: 'Dynamic Filtering', desc: 'Systems to eliminate minor movements.' },
            { title: 'Structured Data Output', desc: 'Automated classification of transfers.' }
        ]
    },
    'sov-intel': {
        title: 'Pattern Recognition',
        subtitle: 'Advanced Correlation',
        overview: 'A secure profiling tool that correlates on-chain interactions with network behaviors to trace institutional movement with total privacy.',
        features: [
            { title: 'Behavioral Correlation', desc: 'Identification of entities based on network usage patterns.' },
            { title: 'Activity Tracking', desc: 'Detection of peer-to-peer transfers.' },
            { title: 'Accumulation Studies', desc: 'Detailed analysis of asset inflows and outflows.' }
        ]
    },
    'inst-ledger': {
        title: 'Entity Resolution',
        subtitle: 'Multi-Hop De-Obfuscation',
        overview: 'We securely map complex multi-hop interactions and trace transaction outputs in real-time to group fragmented wallets into unified entities.',
        features: [
            { title: 'Historical Preservation', desc: 'Reliable access to historical ledger state.' },
            { title: 'Advanced Search', desc: 'Filtering tools based on secure thresholds.' },
            { title: 'Clean Export Formats', desc: 'Structured data ready for compliance review.' }
        ]
    },
    'mass-transfer': {
        title: 'Bulk Transfer Logs',
        subtitle: 'Reserve Migration Tracking',
        overview: 'A tracking module focused on the redistribution of massive global reserves, maintaining absolute discretion over the queried data.',
        features: [
            { title: 'Flow Classification', desc: 'Distinguishes between reserve deposits, rotations, and staking.' },
            { title: 'Reserve Monitoring', desc: 'Notifications regarding sudden contractions in network liquidity.' },
            { title: 'Clear Visualization', desc: 'A clean layout offering high information density.' }
        ]
    },
    'graph': {
        title: 'Entity Graph',
        subtitle: 'Relational Network Visualization',
        overview: 'A visual tool that translates complex transaction histories into interactive, private relational maps.',
        features: [
            { title: 'Dynamic Mapping', desc: 'Interactive nodes reflecting financial relationships.' },
            { title: 'Concentration Analysis', desc: 'Highlights key addresses to reveal risk distribution.' },
            { title: 'Smooth Performance', desc: 'Optimized rendering to ensure stability.' }
        ]
    },
    'defi': {
        title: 'Protocol Liquidity',
        subtitle: 'Vault Analytics',
        overview: 'A comprehensive monitor for decentralized protocols. It tracks secure vaults and liquidity pools to evaluate organic network yield.',
        features: [
            { title: 'Yield Calculation', desc: 'Clear metrics separating real yields from inflation.' },
            { title: 'Liquidity Verification', desc: 'Monitoring of total value locked.' },
            { title: 'Opportunity Highlighting', desc: 'Clear identification of discrepancies.' }
        ]
    },
    'polymarket': {
        title: 'Prediction Markets',
        subtitle: 'Global Event Probabilities',
        overview: 'An integration of data from major prediction markets. This viewer captures the mathematical probabilities of global socioeconomic events.',
        features: [
            { title: 'Probability Metrics', desc: 'Clear numerical probabilities derived from market state.' },
            { title: 'Momentum Tracking', desc: 'Monitoring of rapid shifts in probabilities.' },
            { title: 'Outcome Analysis', desc: 'Structured tracking of key scenarios.' }
        ]
    },
    'forge': {
        title: 'System Configuration',
        subtitle: 'Terminal Parameterization',
        overview: 'The central administration area for configuring your terminal environment, ensuring connection parameters remain fully private.',
        features: [
            { title: 'Configuration Interface', desc: 'A clean command interface to adjust settings.' },
            { title: 'Data Integrity Audits', desc: 'Tools to verify that all data is extracted securely.' },
            { title: 'Extensibility', desc: 'Designed to support future secure integrations.' }
        ]
    },

    'live-port': {
        title: 'Quick Portfolio',
        subtitle: 'Background Balance Monitor',
        overview: 'A minimalist tool designed to display your key balances without compromising system security or resources.',
        features: [
            { title: 'Fast Initialization', desc: 'Optimized rendering for immediate response upon authentication.' },
            { title: 'Focused Visibility', desc: 'Prioritizes your most important assets.' },
            { title: 'Resource Efficiency', desc: 'Automatically suspends background activity when dormant.' }
        ]
    },
    'whale-port': {
        title: 'Entity Portfolio Mirroring',
        subtitle: 'Secure Address Watch',
        overview: 'An analytical tool that allows you to safely observe public portfolios of dominant market participants without leaving metadata traces.',
        features: [
            { title: 'Wallet Mirroring', desc: 'Securely visualizes the holdings of external addresses.' },
            { title: 'Cost Basis Estimation', desc: 'Calculates the estimated entry prices.' },
            { title: 'Allocation Comparison', desc: 'Clear visual tools to contrast exposure.' }
        ]
    },
    'vault': {
        title: 'System Vault',
        subtitle: 'Encrypted Credential Storage',
        overview: 'A secure, isolated memory environment for protecting sensitive settings and API configurations. Data remains private and is never stored centrally.',
        features: [
            { title: 'In-Memory Security', desc: 'Data is held in volatile memory and is cleared upon disconnection.' },
            { title: 'Cryptographic Authentication', desc: 'Access is strictly controlled through secure handshake.' },
            { title: 'Zero-Trust Architecture', desc: 'Eliminates reliance on external databases.' }
        ]
    },
    'zk': {
        title: 'Cryptographic Integrity',
        subtitle: 'Zero-Knowledge Architecture',
        overview: 'The network operates on a strict zero-knowledge architecture. Identity is mathematically verified via elliptic-curve cryptography, ensuring absolute privacy.',
        features: [
            { title: 'Request Obfuscation', desc: 'Routes queries through nodes to conceal origin.' },
            { title: 'Tracking Mitigation', desc: 'Filters out known data-collection methods.' },
            { title: 'Secure Channels', desc: 'Provides End-to-End Encrypted data channels.' }
        ]
    },
    'logs': {
        title: 'Session Logs',
        subtitle: 'Activity Audit Trail',
        overview: 'A comprehensive, localized record of your actions during the current session, providing a transparent audit trail stored purely on your device.',
        features: [
            { title: 'Detailed Event Tracking', desc: 'Records significant interactions and queries.' },
            { title: 'Performance Debugging', desc: 'Helps identify potential connection issues.' },
            { title: 'Structured Review', desc: 'Presents session data in a clean, immutable format.' }
        ]
    },
    'academy': {
        title: 'Documentation',
        subtitle: 'Technical Resources',
        overview: 'A curated library of technical documentation regarding the security, cryptography, and operation of the internal systems.',
        features: [
            { title: 'Technical Guides', desc: 'Structured guides covering network architecture.' },
            { title: 'Standardized Glossary', desc: 'Clear definitions of security parameters.' },
            { title: 'Distraction-Free Reading', desc: 'A clean, focused layout optimized for deep reading.' }
        ]
    },
    'support': {
        title: 'Technical Support',
        subtitle: 'Encrypted Assistance Channel',
        overview: 'Your direct, secure line of communication with our technical operators to resolve operational disruptions with total privacy.',
        features: [
            { title: 'Direct Escalation', desc: 'Bypasses standard queues to connect you directly with experts.' },
            { title: 'Secure Context Sharing', desc: 'Allows you to share diagnostic information without exposing identity.' },
            { title: 'Incident Updates', desc: 'Clear, transparent communication regarding system status.' }
        ]
    }
};
