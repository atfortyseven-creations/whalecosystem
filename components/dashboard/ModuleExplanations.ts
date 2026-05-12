export const MODULE_EXPLANATIONS: Record<string, { title: string, subtitle: string, overview: string, features: { title: string, desc: string }[] }> = {
    'dashboard': {
        title: 'Platform Overview',
        subtitle: 'Global Market Intelligence',
        overview: 'The central hub of your Sovereign Terminal. This module provides a clear, real-time consolidation of the global market state, filtering out unnecessary noise to present you with precise, actionable data for informed decision-making.',
        features: [
            { title: 'Data Aggregation', desc: 'Instant consolidation of inter-market variations to reflect the true state of the ecosystem.' },
            { title: 'Network Health', desc: 'Continuous evaluation of connection stability and node latency.' },
            { title: 'Metric Normalization', desc: 'Dynamic adjustment of key metrics to provide a clear view during high volatility.' }
        ]
    },
    'watchlist': {
        title: 'Entity Watchlist',
        subtitle: 'Institutional Tracking System',
        overview: 'A dedicated tool for monitoring and classifying significant institutional participants. By isolating specific addresses, you receive early notifications regarding important capital movements before they impact the broader market.',
        features: [
            { title: 'Independent Monitoring', desc: 'Continuous tracking of entities using direct ledger integration.' },
            { title: 'Custom Alert Thresholds', desc: 'Configurable parameters to notify you when significant capital is deployed.' },
            { title: 'Noise Reduction', desc: 'Proactive filtering of minor transactions to focus exclusively on relevant activity.' }
        ]
    },
    'news': {
        title: 'Live News Feed',
        subtitle: 'Market Sentiment Analysis',
        overview: 'An advanced aggregator that decodes global financial news and macroeconomic events. It interprets the potential market impact of media reports, helping you anticipate institutional reactions to breaking news.',
        features: [
            { title: 'Sentiment Evaluation', desc: 'Measures the potential market impact of global news reports.' },
            { title: 'Continuous Updates', desc: 'Uninterrupted delivery of breaking financial news.' },
            { title: 'Relevance Filtering', desc: 'Discards redundant information to preserve essential market signals.' }
        ]
    },
    'gold': {
        title: 'Access Pass',
        subtitle: 'Account Level Management',
        overview: 'The central management area for your institutional access. Here you can view your current authorization level, manage your connection, and verify your active permissions within the Sovereign network.',
        features: [
            { title: 'Dedicated Infrastructure', desc: 'Priority access to corporate nodes for stable performance.' },
            { title: 'Enhanced Privacy', desc: 'Advanced routing to ensure your analysis remains secure and private.' },
            { title: 'Unrestricted Access', desc: 'Full permission to deploy intensive analytics without standard limitations.' }
        ]
    },
    'markets': {
        title: 'Top Markets',
        subtitle: 'Liquidity & Order Book Analysis',
        overview: 'A detailed visualization of the most dominant trading pairs. This module scans order books to help you distinguish between genuine liquidity and artificial barriers, revealing true support and resistance levels.',
        features: [
            { title: 'Order Book Depth', desc: 'Clear identification of capital barriers and liquidity concentrations.' },
            { title: 'Capital Flow Metrics', desc: 'Quantitative mapping of net flows across major exchanges.' },
            { title: 'Price Indexing', desc: 'Consolidation of fragmented exchange data into a single, reliable metric.' }
        ]
    },
    'newpairs': {
        title: 'New Listings',
        subtitle: 'Early Asset Detection',
        overview: 'A monitoring system for newly deployed smart contracts and initial liquidity provisions. It evaluates fundamental token metrics to help you assess the safety and structure of emerging assets.',
        features: [
            { title: 'Real-Time Detection', desc: 'Immediate identification of new contracts upon deployment.' },
            { title: 'Structural Diagnostics', desc: 'Automatic review of wallet distribution and initial decentralization.' },
            { title: 'Liquidity Verification', desc: 'Filters new assets based on fundamental launch capital requirements.' }
        ]
    },
    'omniexplorer': {
        title: 'Block Explorer',
        subtitle: 'Multi-Chain Network Search',
        overview: 'A clean, unified interface for exploring multiple blockchain networks. Search for wallets, transactions, or contracts without the visual clutter typical of public block explorers.',
        features: [
            { title: 'Multi-Network Support', desc: 'Automatic resolution and indexing across different blockchain architectures.' },
            { title: 'Clear Data Formatting', desc: 'Translation of complex blockchain data into readable, structured formats.' },
            { title: 'Distraction-Free Interface', desc: 'A minimalist design focused purely on the transaction data you need.' }
        ]
    },
    'brc': {
        title: 'Bitcoin Explorer',
        subtitle: 'L1 Ordinals & BRC-20 Tracking',
        overview: 'A specialized infrastructure for examining the Bitcoin network. It provides clear visibility into Ordinals and BRC-20 activity directly from the native ledger.',
        features: [
            { title: 'Native Ledger Integration', desc: 'Direct reading of transactions from Bitcoin Core nodes.' },
            { title: 'Asset Tracking', desc: 'Clear representation of secondary transfers and balances.' },
            { title: 'Balance Consolidation', desc: 'Simplified views of fragmented holdings for easier auditing.' }
        ]
    },
    'firehose': {
        title: 'Data Firehose',
        subtitle: 'Live Mempool Monitoring',
        overview: 'A direct connection to the network mempool, delivering thousands of events per second. Designed for advanced operators who need to filter and observe raw, unfiltered blockchain activity as it happens.',
        features: [
            { title: 'Zero-Delay Indexing', desc: 'Real-time synchronization with the main node for accurate historical context.' },
            { title: 'Dynamic Filtering', desc: 'Systems to eliminate minor movements and focus on significant activity.' },
            { title: 'Structured Data Output', desc: 'Automated classification of transfers for easier reading.' }
        ]
    },
    'sov-intel': {
        title: 'Sovereign Intelligence',
        subtitle: 'Advanced Entity Correlation',
        overview: 'An advanced profiling tool that correlates databases with network behaviors to identify significant institutional participants and track their strategic market repositioning.',
        features: [
            { title: 'Behavioral Correlation', desc: 'Identification of entities based on network usage and transfer patterns.' },
            { title: 'Activity Tracking', desc: 'Detection of significant peer-to-peer liquidations outside standard exchanges.' },
            { title: 'Accumulation Studies', desc: 'Detailed analysis of asset inflows and outflows over specified timeframes.' }
        ]
    },
    'inst-ledger': {
        title: 'Whale Ledger',
        subtitle: 'Historical Transaction Audit',
        overview: 'A persistent record of significant capital movements. This module acts as the long-term memory of the blockchain, allowing you to review and audit historical market events with complete transparency.',
        features: [
            { title: 'Historical Preservation', desc: 'Reliable access to the data surrounding previous market events.' },
            { title: 'Advanced Search', desc: 'Filtering tools based on capital thresholds, addresses, and timeframes.' },
            { title: 'Clean Export Formats', desc: 'Structured data ready for compliance review and external auditing.' }
        ]
    },
    'mass-transfer': {
        title: 'Mass Transfers',
        subtitle: 'Exchange Migration Tracking',
        overview: 'A tracking module focused on the redistribution of large global reserves. It monitors significant deposits and withdrawals from major exchanges to help anticipate shifts in market supply.',
        features: [
            { title: 'Flow Classification', desc: 'Distinguishes between exchange deposits, cold storage rotations, and staking.' },
            { title: 'Reserve Monitoring', desc: 'Notifications regarding sudden contractions or expansions in exchange reserves.' },
            { title: 'Clear Visualization', desc: 'A clean layout offering high information density for quick reading.' }
        ]
    },
    'graph': {
        title: 'Entity Graph',
        subtitle: 'Relational Network Visualization',
        overview: 'A visual tool that translates complex transaction histories into interactive relational maps. It allows you to see the connections and capital flows between different wallets and institutions at a glance.',
        features: [
            { title: 'Dynamic Mapping', desc: 'Interactive nodes that reflect the financial relationship between entities.' },
            { title: 'Concentration Analysis', desc: 'Highlights key addresses to reveal risk distribution within a network.' },
            { title: 'Smooth Performance', desc: 'Optimized rendering to ensure stability during extensive network analyses.' }
        ]
    },
    'defi': {
        title: 'DeFi Yields',
        subtitle: 'Liquidity Pool Analytics',
        overview: 'A comprehensive monitor for decentralized finance protocols. It tracks vaults and liquidity pools to help you evaluate organic yields and understand where institutional capital is being deployed.',
        features: [
            { title: 'Yield Calculation', desc: 'Clear metrics separating real yields from protocol-subsidized inflation.' },
            { title: 'Liquidity Verification', desc: 'Monitoring of total value locked to detect potential capital flight.' },
            { title: 'Opportunity Highlighting', desc: 'Clear identification of yield discrepancies across different networks.' }
        ]
    },
    'polymarket': {
        title: 'Prediction Markets',
        subtitle: 'Global Event Probabilities',
        overview: 'An integration of data from major prediction markets. This viewer captures the financial probabilities of global socioeconomic events, providing objective statistics derived directly from market liquidity.',
        features: [
            { title: 'Probability Metrics', desc: 'Clear numerical probabilities derived from active market participation.' },
            { title: 'Momentum Tracking', desc: 'Monitoring of rapid shifts in market sentiment regarding specific events.' },
            { title: 'Outcome Analysis', desc: 'Structured tracking of key scenarios and their expected resolutions.' }
        ]
    },
    'forge': {
        title: 'Cosmic Forge',
        subtitle: 'Terminal Configuration & Testing',
        overview: 'The central administration area for configuring your terminal environment. It provides the tools necessary to test smart contracts and adjust network extraction parameters safely.',
        features: [
            { title: 'Configuration Interface', desc: 'A clean command interface to adjust settings without interrupting workflows.' },
            { title: 'Data Integrity Audits', desc: 'Tools to verify that all data is extracted directly from reliable nodes.' },
            { title: 'Extensibility', desc: 'Designed to support future automated sequences and external integrations.' }
        ]
    },
    'portfolio': {
        title: 'Main Portfolio',
        subtitle: 'Comprehensive Asset Overview',
        overview: 'The central dashboard for your connected assets. It provides a complete, private view of your holdings across all supported blockchains, helping you monitor and balance your portfolio efficiently.',
        features: [
            { title: 'Secure Integration', desc: 'Read-only connection that keeps your private keys completely secure.' },
            { title: 'Asset Distribution', desc: 'Clear visual breakdowns of your portfolio allocation.' },
            { title: 'Exposure Tracking', desc: 'Holistic monitoring of your capital held in decentralized protocols.' }
        ]
    },
    'live-port': {
        title: 'Quick Portfolio',
        subtitle: 'Background Balance Monitor',
        overview: 'A minimalist tool designed to display your key balances without consuming significant system resources. It ensures you can monitor your assets while focusing on deep analysis in other modules.',
        features: [
            { title: 'Fast Initialization', desc: 'Optimized rendering for immediate response upon authentication.' },
            { title: 'Focused Visibility', desc: 'Prioritizes your most important assets while filtering out minor balances.' },
            { title: 'Resource Efficiency', desc: 'Automatically suspends background activity when not actively viewed.' }
        ]
    },
    'whale-port': {
        title: 'Whale Portfolio',
        subtitle: 'Institutional Wallet Mirroring',
        overview: 'An analytical tool that allows you to safely observe the public portfolios of dominant market participants. Compare their asset allocation against your own to gain strategic insights.',
        features: [
            { title: 'Wallet Mirroring', desc: 'Securely visualizes the holdings of external addresses within your dashboard.' },
            { title: 'Cost Basis Estimation', desc: 'Calculates the estimated entry prices of observed institutional purchases.' },
            { title: 'Allocation Comparison', desc: 'Clear visual tools to contrast your exposure against market leaders.' }
        ]
    },
    'vault': {
        title: 'Sovereign Vault',
        subtitle: 'Encrypted Credential Storage',
        overview: 'A secure, isolated memory environment for protecting your sensitive settings and API configurations. It ensures your data remains private and is never stored on centralized servers.',
        features: [
            { title: 'In-Memory Security', desc: 'Data is held in volatile memory and is cleared upon disconnection.' },
            { title: 'Wallet Authentication', desc: 'Access is strictly controlled through your secure Web3 connection.' },
            { title: 'Zero-Trust Architecture', desc: 'Eliminates reliance on external databases to protect against remote extraction.' }
        ]
    },
    'zk': {
        title: 'ZK Shield',
        subtitle: 'Network Privacy Tools',
        overview: 'A suite of privacy features designed to protect your analytical activities. It helps mask your network requests, preventing third parties from tracking your areas of interest.',
        features: [
            { title: 'Request Obfuscation', desc: 'Routes queries through multiple nodes to conceal your direct focus.' },
            { title: 'Tracking Mitigation', desc: 'Filters out known data-collection methods used by external analytics firms.' },
            { title: 'Secure Channels', desc: 'Lays the groundwork for future integration with Zero-Knowledge networks.' }
        ]
    },
    'logs': {
        title: 'Session Logs',
        subtitle: 'Activity Audit Trail',
        overview: 'A comprehensive record of your actions during the current session. This provides a transparent audit trail for your own review, ensuring you can track exactly how and when data was accessed.',
        features: [
            { title: 'Detailed Event Tracking', desc: 'Records significant interactions and queries for your personal reference.' },
            { title: 'Performance Debugging', desc: 'Helps identify potential connection issues by logging network responses.' },
            { title: 'Structured Review', desc: 'Presents session data in a clean, readable format for easy verification.' }
        ]
    },
    'academy': {
        title: 'Academy',
        subtitle: 'Educational Resources',
        overview: 'A curated library of technical documentation and market concepts. Designed to provide you with clear, factual information regarding blockchain mechanics and institutional trading strategies.',
        features: [
            { title: 'Technical Curriculum', desc: 'Structured guides covering network architecture and protocol mechanics.' },
            { title: 'Standardized Glossary', desc: 'Clear definitions of industry terms to ensure accurate understanding.' },
            { title: 'Distraction-Free Reading', desc: 'A clean, focused layout optimized for deep learning and retention.' }
        ]
    },
    'support': {
        title: 'Support',
        subtitle: 'Direct Assistance Channel',
        overview: 'Your direct line of communication with our technical team. In the event of an issue, this module ensures you receive prompt, professional assistance to resolve operational disruptions.',
        features: [
            { title: 'Direct Escalation', desc: 'Bypasses standard queues to connect you directly with resolution experts.' },
            { title: 'Secure Context Sharing', desc: 'Allows you to share diagnostic information safely without exposing credentials.' },
            { title: 'Incident Updates', desc: 'Clear, transparent communication regarding any broader network outages.' }
        ]
    }
};
