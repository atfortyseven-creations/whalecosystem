"use client";

import React from "react";
import { OptimizedLocalLottie } from "./OptimizedLocalLottie";
import { Scan } from "lucide-react";
import { WorldMapBackground, BtcTransferLegend } from "./WorldMapBackground";
import { WhalecosystemTweetFeed } from "./WhalecosystemTweetFeed";

// Pre-defined list of lottie files matching the narrative sections.
// This preserves the "zero build-time bloat" since these are just string paths
// and they are fetched on-demand at runtime by OptimizedLocalLottie.
const MANIFESTO_LOTTIES = [
  "Earth globe rotating with Seamless loop animation.json",
  "DeeWork About Blockchain.json",
  "Crypto coins.json",
  "Big Data Analytics.json",
  "Isometric data analysis.json",
  "A Female Employee is Reading Financial Statements.json",
  "enterprice.json",
  "Manufacturing Industry Working Staff.json",
  "Business Analysis.json",
  "Browser Loading.json",
  "Abstract Isometric Loader #1.json",
  "Trade.json",
  "Online Payment.json",
  "Payments.json",
  "website.json",
  "Share.json",
  "History.json",
  "Search for value.json",
  "Business plan.json",
  "Business.json",
  "Virtual Education.json",
  "Distance Learning.json",
  "Geography.json",
  "Bitcoin touch.json",
  "Invest - Trade - concept.json",
  "BlockChain.json"
];

const IMMERSIVE_PAGES = [
  {
    title: "I. The Origin of the System: Eliminating Asymmetry",
    paragraphs: [
      "The decentralized financial ecosystem was born with the promise of transparency. However, reality proved otherwise: large capital operates with an overwhelming informational advantage, moving millions through private networks and contracts before the retail market can react.",
      "To resolve this disparity, we created Sovereign Terminal. Our foundational directive was clear: build an infrastructure capable of reading, decoding, and analyzing the behavior of these giants directly from the blockchain, without relying on centralized servers or manipulable oracles.",
      "We began by developing real-time indexing algorithms. It was not enough to observe surface volume; we needed to identify exactly the origin of the capital, its internal rotations, and its final destination, capturing it from the mempool before its irreversible execution."
    ]
  },
  {
    title: "II. Stochastic Filtering and Absolute Privacy",
    paragraphs: [
      "Blockchains generate a massive volume of daily noise. Conventional explorers merely list unintelligible transfers. We, instead, designed an indexing engine that mathematically filters that noise, isolating only the critical anomalies that impact global liquidity.",
      "We implemented Zero-Knowledge proof technology (ZK-SNARKs) to guarantee pure mathematical privacy. Our operators can query specific movements and wallets without ever revealing their surveillance strategies to the system. A truly impenetrable infrastructure.",
      "This modular architecture allowed us to expand our tracking from Ethereum to scalability networks (Rollups) and cross-chain bridges, detecting tactical movements hours before liquidity consolidates its destination."
    ]
  },
  {
    title: "III. Consolidation of the Intelligence Network",
    paragraphs: [
      "With the operational core established, the next step was to interpret the data. We integrated advanced heuristic models to de-obfuscate and label dark entities. Today, our system automatically identifies thousands of platforms, institutional funds, and known attackers.",
      "When an entity attempts to camouflage its capital by fragmenting it into hundreds of smaller wallets, our algorithmic engine groups those transactions and reveals the underlying behavioral signature, exposing the true magnitude of the maneuver.",
      "Sovereign Terminal is today the definitive standard of on-chain intelligence. We provide the infrastructure necessary to operate with the same precision, speed, and clarity as global financial elites, ensuring true technical sovereignty."
    ]
  }
];

// ── 50 Historic Catastrophic Crypto & Finance Events ──────────────────────
const HISTORIC_EVENTS = [
  { date: "Oct 1929", code: "BLACK-001", title: "Crash of '29 — Black Thursday", text: "The disintegration of 89% of the Dow Jones Industrial Average over three years, evaporating mortgage guarantees and annihilating 14 million jobs in the US. The greatest stock market collapse of the 20th century, a direct prelude to the global Great Depression." },
  { date: "Aug 1971", code: "NIXON-002", title: "Nixon Shock — End of the Gold Standard", text: "Richard Nixon unilaterally suppresses dollar-gold convertibility, destroying the Bretton Woods system. The global monetary order mutated towards a free float of fiat currencies with no intrinsic backing. The greatest readjustment of global purchasing power in the modern century." },
  { date: "Oct 1987", code: "BLACK-003", title: "Black Monday 1987 — Algorithmic Collapse", text: "The Dow Jones falls 22.6% in a single day. 'Portfolio insurance' programs trigger cascading sales via algorithmic logic. The first crash systematically caused by automated software, a direct premonition of the flash crashes of the 21st century." },
  { date: "Sep 1992", code: "SOROS-004", title: "The Breaking of the European Monetary System", text: "George Soros bet $10B against the British pound, forcing its expulsion from the ERM. The forced devaluation of the Bank of England accumulated losses of £3.4B in a single day. Empirical proof that private speculators can overcome the defense capacity of sovereign central banks." },
  { date: "Dec 1994", code: "PESO-005", title: "Mexican Peso Crisis — The December Mistake", text: "The abrupt devaluation of the peso triggered a savage capital flight from emerging markets. The Tequila effect infected the markets of Argentina, Brazil, and Southeast Asia. The IMF required a $50B bailout to prevent complete sovereign default." },
  { date: "Jul 1997", code: "ASIA-006", title: "Asian Financial Crisis", text: "The collapse of the Thai baht detonated a contagion that collapsed the currencies of Indonesia, South Korea, and Malaysia. The IMF imposed austerity adjustments that exterminated entire middle classes. Indonesia's GDP fell 13.7% in one year: the largest economic contraction since WWII in the region." },
  { date: "Aug 1998", code: "RUSSIA-007", title: "Russian Sovereign Default", text: "Moscow repudiated $40B in internal government debt (GKOs), devalued the ruble, and suspended payments to foreign private creditors. The collapse dragged the hedge fund LTCM to the edge of the systemic abyss, requiring a coordinated bailout operation by the NY Fed to prevent global contagion." },
  { date: "Sep 1998", code: "LTCM-008", title: "The Implosion of Long-Term Capital Management", text: "A fund with two Nobel laureates on its board lost $4.6B in weeks due to the collapse of its mathematical arbitrage models. The Fed orchestrated a $3.65B private bailout from 14 banks to prevent its forced liquidation from collapsing global bond markets." },
  { date: "Mar 2000", code: "DOTCOM-009", title: "Burst of the Dot-Com Bubble", text: "The NASDAQ loses 78% of its value between 2000 and 2002. Companies valued in the billions with zero real revenue evaporate in months. Webvan, Pets.com, and Boo.com burn $2T in speculative capital. The greatest destroyer of technological wealth of the millennium until the arrival of ICOs." },
  { date: "Sep 2001", code: "911-010", title: "Closure of the NYSE Post-9/11", text: "The NYSE closes for 6 consecutive business days, the longest period since 1933. Upon reopening, the Dow Jones loses $1.4T in market value in a single week. The first terrorist event with systemic consequences on modern global financial architecture." },
  { date: "Sep 2008", code: "LEH-011", title: "Bankruptcy of Lehman Brothers", text: "The largest corporate bankruptcy in history: $613B in debt. The collapse of the 158-year-old investment bank froze global interbank credit in a matter of hours, prompting the largest government financial bailout in history: $700B in the US alone." },
  { date: "Oct 2008", code: "BAIL-012", title: "The TARP Bailout — Socialization of Private Losses", text: "The US government injects $700B into insolvent private banks with taxpayer money. The foundational paradox of modern capitalism: profits are private, collapses are public. The event that directly inspired the Bitcoin Genesis Block with Satoshi's message." },
  { date: "Jan 2009", code: "BTC-013", title: "Bitcoin Genesis — Block 0", text: "Satoshi Nakamoto embeds a journalistic message about the second bailout of British banks into the first block of the chain, declaring war on centralized finance. The birth of the first truly decentralized, immutable digital currency without a central custodian." },
  { date: "May 2010", code: "PIZZA-014", title: "The Bitcoin Pizza — 10,000 BTC", text: "Laszlo Hanyecz pays 10,000 BTC for two pizzas, the first documented commercial transaction in Bitcoin. At the all-time high reached in 2024, that pizza would equal $680 million. The most mythical value assignment event in the history of the digital economy." },
  { date: "Mar 2013", code: "CYPRUS-015", title: "Cyprus Banking Crisis — Digital Corralito", text: "The ECB and the IMF impose a 'bail-in' on Cypriot bank deposits exceeding €100,000. The government taxes citizens' savings at 9.9% to save the banks. Bitcoin demand spiked 300% in Europe in 72 hours." },
  { date: "Apr 2013", code: "BTC-016", title: "First Major Bitcoin Crash — $266 to $50", text: "The first severe Bitcoin bear market. The price collapses from $266 to $50 in hours following the overload of the Mt. Gox exchange during an unprecedented demand spike. The first crash generated by deficient centralized infrastructure in a decentralized market." },
  { date: "Feb 2014", code: "GOXZERO-017", title: "Mt. Gox Collapses — 850,000 BTC Stolen", text: "The exchange processing 70% of global Bitcoin volume announces the loss of 850,000 BTC (≈$450M at the time). Private keys were extracted for years without detection. The foundational event proving that centralized custody is irreconcilable with cryptographic sovereignty." },
  { date: "Aug 2015", code: "CHINA-018", title: "Chinese Black Monday — Shanghai Composite Flash Crash", text: "The Shanghai stock index loses 8.49% in one day, erasing $3.2T in market value. The Chinese government intervenes with massive emergency purchases. The event provoked a chain of global collapses affecting 19 stock exchanges on the same day." },
  { date: "Jun 2016", code: "DAO-019", title: "The DAO Hack and the Ethereum Hard Fork", text: "An attacker drains 3.6 million ETH exploiting a reentrancy vulnerability in The DAO contract. The Ethereum community decides to revert the chain via hard fork, splitting the ecosystem into ETH and ETC. The first existential crisis of decentralized governance." },
  { date: "Jan 2018", code: "ICO-020", title: "The Great ICO Burst — End of the Boom", text: "The ICO market reaches $6.3B raised in 2017 only to collapse 90%+ in 2018. Projects with no real products or verifiable teams evaporate billions. The SEC issues massive warnings and shuts down fraudulent operations. The modern echo of the dot-com bubble." },
  { date: "Dec 2017", code: "BCASH-021", title: "The Great Bitcoin Fork — BCH vs BTC", text: "The Bitcoin civil war culminates in the hard fork generating Bitcoin Cash. The dispute over block size divides the community, miners, and exchanges. BTC price collapses 45% in three weeks, demonstrating the geopolitical fragility of decentralized governance." },
  { date: "Nov 2018", code: "BCHSV-022", title: "The BCH/BSV Hash War", text: "Craig Wright and Roger Ver launch a destructive mining war to impose their protocol version. The cost of the 'hash war' destroys billions in miner profitability, with both chains suffering reorganizations and zero confirmations for days." },
  { date: "Mar 2020", code: "COVIDCRASH-023", title: "Covid Black Thursday — Bitcoin Drops 50% in 24h", text: "On March 12, 2020, Bitcoin loses 50% of its value in a single trading day, falling from $8,000 to $4,000. Cascading liquidations of leveraged derivative positions destroyed $1B in less than an hour. The largest single-day percentage crash since 2013." },
  { date: "Apr 2021", code: "TURKEY-024", title: "Collapse of the Turkish Lira — Flight to Crypto", text: "The Turkish lira loses 44% of its value in 2021 following President Erdoğan's decision to fire the central bank governor. USDTRY trading volume on crypto exchanges spikes 1,200%. The first sovereign hyperinflation where the mass refuge was digital." },
  { date: "May 2021", code: "CHINABAN-025", title: "China Bans All Crypto Transactions", text: "Beijing prohibits financial institutions from processing cryptocurrency transactions and forces the shutdown of mining operations. Global Bitcoin hashrate collapses 50%. The largest regulatory shock in market history, demonstrating decentralized resilience: the network recovered in 3 months." },
  { date: "May 2022", code: "LUNA-026", title: "The Terra/LUNA Collapse — $60B Evaporated", text: "The UST stablecoin algorithm collapses in a death spiral. LUNA goes from $80 to $0.0001 in 72 hours. $60B in market cap evaporates, dragging down dozens of venture capital funds and causing the most devastating contagion in DeFi history." },
  { date: "Jun 2022", code: "3AC-027", title: "Insolvency of Three Arrows Capital", text: "The world's largest crypto hedge fund collapses with $3.5B in debt. Its massive exposure to LUNA and structured yield products like stETH/ETH triggers unmeetable margin calls. The domino effect destroyed Voyager Digital, BlockFi, and Genesis in weeks." },
  { date: "Jun 2022", code: "CELSIUS-028", title: "Celsius Halts Withdrawals — 1.7M Users Trapped", text: "The lending platform freezes all withdrawals, swaps, and transfers. 1.7 million users are unable to access their funds for months during bankruptcy proceedings. The largest capture of retail capital in crypto credit history." },
  { date: "Nov 2022", code: "FTX-029", title: "The FTX Collapse — The Master Scandal", text: "Sam Bankman-Fried designs an opaque architecture where Alameda Research freely accesses FTX customer deposits. $8B in user funds are used for proprietary trading. The largest corporate fraud since Enron, ending with SBF arrested in the Bahamas." },
  { date: "Nov 2022", code: "CONTAGIO-030", title: "Post-FTX Contagion — BlockFi, Genesis, Gemini", text: "The FTX bankruptcy initiates a chain reaction. BlockFi declares bankruptcy with $1.2B exposure to FTX. Genesis freezes withdrawals. Gemini suspends its Earn product. The market loses $200B in market cap in two weeks. The greatest crisis of systemic trust in ecosystem history." },
  { date: "Mar 2023", code: "SVB-031", title: "Collapse of Silicon Valley Bank — Banking Detonator", text: "SVB collapses in 48 hours with $175B in deposits, the second-largest bank failure in US history. Circle (USDC) reveals $3.3B trapped in SVB. USDC depegs to $0.87, generating panic across DeFi. Traditional financial contagion invades the decentralized ecosystem." },
  { date: "Jan 2024", code: "ETFBUY-032", title: "US Spot Bitcoin ETF Approval — The Great Influx", text: "The SEC approves the first spot Bitcoin ETFs in the US after years of resistance. BlackRock, Fidelity, and Invesco absorb $12B in the first 30 days. The largest flow of institutional capital into a digital asset in modern financial history." },
  { date: "Apr 2024", code: "HALVING-033", title: "Fourth Bitcoin Halving — Reward to 3.125 BTC", text: "The new halving reduces Bitcoin issuance to 3.125 BTC per block. For the first time, transaction fees exceed the block reward during a period of high congestion, marking the structural transition towards a pure fee economy." },
  { date: "Mar 2020", code: "BITMEX-034", title: "BitMEX Liquidations — $1B in 1 Hour", text: "During the COVID crash, BitMEX processes $1B in forced liquidations in less than 60 minutes, accelerating the market collapse. The platform is later accused by the DOJ of operating without an AML license. The paradigmatic case of the risk of unregulated derivative exchanges." },
  { date: "May 2010", code: "FLASH-035", title: "2010 Flash Crash — 1,000 Points in Minutes", text: "The Dow Jones falls nearly 1,000 points in minutes due to HFT algorithms in a chain reaction. The event exposed the systemic fragility of the modern stock market dominated by algorithmic trading. The SEC implemented circuit breakers following the event." },
  { date: "Feb 2021", code: "GAME-036", title: "GameStop Gamma Squeeze — r/WallStreetBets vs Hedge Funds", text: "Small investors coordinated on Reddit execute a massive short squeeze against hedge funds. GameStop rises 2,400% in weeks. Melvin Capital loses $6.8B. Robinhood suspends purchases, exposing how regulation protects institutional capital against retail." },
  { date: "Aug 2022", code: "TORNADO-037", title: "OFAC Sanction of Tornado Cash", text: "The US government sanctions immutable on-chain smart contracts for the first time. Developer Roman Storm was arrested. The action marks the beginning of the era of regulatory retaliation against cryptographic privacy." },
  { date: "May 2022", code: "BEANSTALK-038", title: "Beanstalk Hack — $182M via Flash Loan Governance Attack", text: "An attacker executes a $1B flash loan, temporarily acquires protocol governance control in a single transaction, and drains $182M in assets. The most sophisticated attack in DeFi to date." },
  { date: "Mar 2022", code: "RONIN-039", title: "Ronin Bridge Hack — $625M Stolen", text: "Hackers linked to North Korea's Lazarus Group compromise 5 of 9 validators of Axie Infinity's Ronin bridge. $625M in ETH and USDC are stolen. The largest hack in DeFi history proved that decentralization is not binary but spectral." },
  { date: "Oct 2021", code: "SQUID-040", title: "Squid Game Token — $3.4M Rug Pull", text: "A SQUID token based on the popular Netflix series collapses 99.99% in seconds when its creators execute a rug pull. The token rose 2,400% in hours before collapsing. The most emblematic case of the pump-and-dump cycle fueled by viral cultural trends." },
  { date: "Dec 2021", code: "JUNO-041", title: "Juno Network Governance Crisis", text: "The Juno community votes to confiscate 3.3M tokens from a single suspicious whale wallet. The proposal is executed on-chain, and it is later discovered that it partially affected the wrong wallet. The first documented 'decentralized censorship' in DAO history." },
  { date: "Nov 2022", code: "BINANCE-042", title: "CZ Reveals FTX Insolvency — The Catalyst Tweet", text: "Binance's CZ tweets the decision to liquidate FTT positions. In 24 hours, $6.3B is withdrawn from FTX. The most expensive digital event in history: a tweet that triggered the largest crypto bank run ever recorded." },
  { date: "Jun 2023", code: "SEC-043", title: "The SEC Sues Binance and Coinbase", text: "The SEC files charges against the world's two largest exchanges on consecutive days, classifying dozens of tokens as unregistered securities. The regulatory impact erases $100B in market cap. The beginning of the period of highest coordinated regulatory pressure on crypto." },
  { date: "Aug 2023", code: "XRP-044", title: "XRP Is Not a Security for Retail — Partial Victory", text: "Judge Analisa Torres rules that XRP sales to the public do not constitute securities offerings under the Howey test. The industry's first major legal victory against the SEC, reopening debates on the regulatory taxonomy of digital assets." },
  { date: "Dec 2023", code: "BINDEPART-045", title: "CZ Pleads Guilty — $4.3B Fine for Binance", text: "Changpeng Zhao pleads guilty to AML violations and is sentenced to 4 months in prison. Binance pays the largest fine in crypto history: $4.3B to the DOJ/FinCEN. The world's highest-volume exchange is forced to restructure under federal supervision." },
  { date: "Mar 2024", code: "MEME-046", title: "The 2024 MEME Cycle — Dogwifhat and BOME", text: "The memecoin market reaches a total market cap of $65B. Dogwifhat rises 10,000%. Book of Meme captures $1B in market cap in 48 hours from launch. The largest speculative bubble of assets without intrinsic utility in modern trading history." },
  { date: "Oct 2024", code: "EIGEN-047", title: "EigenLayer and the Systemic Risk of Restaking", text: "EigenLayer launches its EIGEN token with controversial transferability restrictions. The promise of restaking generates $15B in deposits, but its circular economic model generates systemic concerns directly evoking the collateralized CDOs of the 2008 crisis." },
  { date: "Nov 2024", code: "HYPERLIQ-048", title: "$200M Whale Exploit on Hyperliquid", text: "A trader accumulates a $200M position in JELLY executing foundational price manipulation and forcing the protocol to assume systemic losses. The HLP vault loses millions in hours. Reveals the fragility of perpetual DEXs with insufficient liquidity in primary vaults." },
  { date: "Apr 2025", code: "TRUMP-049", title: "2025 Trump Tariffs — Crypto Loses $1T in Weeks", text: "President Trump announces 145% tariffs on Chinese imports. The crypto market loses $1T in market cap in 10 days. Bitcoin falls from $109,000 to $74,000. The first massive-scale demonstration that digital assets are highly correlated with macroeconomic geopolitics." },
  { date: "Apr 2025", code: "BYBIT-050", title: "Bybit Hack — $1.4B Stolen by Lazarus Group", text: "The North Korean Lazarus group compromises Bybit's multi-sig signing infrastructure, stealing $1.4B in stETH and derivative tokens in a single transaction. The largest theft in digital credit history, surpassing the Ronin hack. Proved that even tier-1 exchanges with institutional custody are vulnerable to advanced social engineering attacks on human signers." },
  { date: "Mar 2025", code: "DOGE-051", title: "DOGE Gov Tokenomics — Political Speculation to $95B", text: "The officialization of the 'Department of Government Efficiency' promoted by Elon Musk generates a speculative narrative catapulting Dogecoin to a $95B market cap with no technical foundation. The clearest case that geopolitical power amplifies digital assets regardless of their on-chain fundamentals." },
];

const LEFT_SIDEBAR_CONTENT = [
  {
    title: "Mt. Gox Embezzlement (2014)",
    text: "The original paroxysm of centralized custodian fragility. By delegating the custody of eight hundred and fifty thousand Bitcoin units to traditional server infrastructure with mutable SQL databases, the security asymmetry led to the silent and prolonged theft of seventy percent of the global volume. Absolute foundational postulate: reliable algorithmic possession is non-existent outside of cryptographic private keys."
  },
  {
    title: "Terra/LUNA Death Spiral (2022)",
    text: "The empirical demonstration of the mathematical failure of undercollateralized algorithmic stablecoins. Fostered by reserves of faith rather than oversized mathematical immutability, the value pegs collapsed under hyperbolic pressure, evaporating sixty billion in fiat capital in seventy-two hours. Crudely reveals that the cyber economy does not survive leverage without tangible anchors at layer zero."
  },
  {
    title: "Collapse of the FTX Empire (2022)",
    text: "The global zenith of institutional opacity in the 21st century. Operating behind a false curtain of regulation, the algorithmic rehypothecation of user capital through 'backdoors' in traditional codebase facilitated the abysmal squandering of reserves. This systematic implosion purified the ecosystem, evidencing that without on-chain transparency tools and deterministic settlement, human oracles fall into depravity."
  },
  {
    title: "The Fall of Celsius Network (2022)",
    text: "The mirage of perpetual yield. The cascading rehypothecation of retail assets in exotic protocols with no liquidity contingency resulted in immediate mathematical insolvency. Taxative evidence that off-chain balance sheet opacity invariably masks catastrophic risks if there are no publicly auditable deterministic backings."
  },
  {
    title: "The Tornado Cash Schism (2022)",
    text: "State-level intervention at the protocol layer. The OFAC sanction of immutable smart contracts demonstrated the coercive latency of fiat jurisdictions over open-source developers. A prelude to the final battle for algorithmic privacy, proving that true cryptographic networks require irremediably encrypted obfuscation."
  },
  {
    title: "Central Consensus Saturation (2024)",
    text: "The progressive monopoly of validation. Dominant Liquid Staking platforms amassed critical levels of the main network's confirmatory power, evidencing the inherent gradual vulnerability of Proof-of-Stake against oligopolistic capitalization cartels. A drastic reminder that elite ecosystems lean towards quasi-feudal power asymmetries without correction systems."
  }
];

const RIGHT_SIDEBAR_CONTENT = [
  {
    title: "The DAO Fork (2016)",
    text: "The deepest fissure event in the 'Code is Law' axiomatic. Following the massive collection of Ether in the nascent Ethereum Virtual Machine, a reentrancy attack severely drained the master contract. The correction required a brutal amputation via Hard Fork, forever altering the genesis of the network and exposing the biological immaturity of pure immutable computational logic."
  },
  {
    title: "The Ronin Bridge Extraction (2022)",
    text: "The absolute disaster caused by the illusion of decentralization. A scalability bridge yielded over six hundred million dollars because its mathematical authority resided in an extremely precarious M-of-N scheme (five of nine validators). By compromising the signatures through corporate social engineering attack vectors, the underlying narrative of true distributed security was completely dismantled."
  },
  {
    title: "The Wormhole Fissure (2022)",
    text: "The climax of vulnerability in poly-chain (Cross-chain) topology. Through the algorithmic falsification of attestations and the bypass of trivial validations in bridge smart contracts, the architecture suffered an immediate large-scale theft with no reactive countermeasures possible. Definitively concluding that poly-chain vectors elevate systemic entropy exponentially if not audited against the abyss."
  },
  {
    title: "The Nomad Anomaly (2022)",
    text: "Technical decay in cross-chain routing bridges. A null parametric configuration of variables in the Merkle validation routine allowed the first massive decentralized crowdsourced extraction. A draconian warning testifying empirically that any superfluous abstraction in cryptography transfers infinite value directly to the basal void."
  },
  {
    title: "USDC Depeg (2023)",
    text: "The residual contagion of the classic fractional reserve mechanism. The over-reliance of the treasury on fiat entities (Silicon Valley Bank) temporarily undermined the absolute parity of the ecosystem's hegemonic stablecoin. A taxative verification: any binding conjunction, however subtle, with the flaws of analog banking exposes the on-chain architecture to external chaos."
  },
  {
    title: "The Iron Finance Void (2021)",
    text: "The irrational hysteria of overstabilization collateral arbitrage. A defective tokenomic design detonated a purely entropic and hyperbolic feedback loop, sinking liquid capital and diluting the governance token in a precipitous and lethal deflation. The event crystallizes again that highly efficient capital is completely agnostic to a narrative lacking proven empirical resilience."
  }
];

export function ImmersiveManifestoLanding({ onOpenScanner, hideMap = false }: { onOpenScanner?: () => void, hideMap?: boolean }) {
  
  return (
    <div className="relative min-h-[100dvh] bg-[#FDFCF8] text-[#050505] selection:bg-black selection:text-[#FDFCF8] font-sans antialiased overflow-x-hidden">
      
      {/* ── Top Map & Intelligence Section ── */}
      <section className="w-full flex flex-col items-center pb-12 pt-8 bg-[#FDFCF8] border-b border-black/10">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
          
          <div className="mb-6 flex flex-col items-center text-center px-4">
             <h2 className="text-[32px] sm:text-[46px] md:text-[60px] leading-[1.0] font-black uppercase tracking-tighter text-black">
               WHALE ALERT NETWORK
             </h2>
          </div>

          {/* Map Container */}
          {!hideMap && (
            <div className="relative w-full h-[35vh] sm:h-[45vh] lg:h-[55vh] max-h-[600px] min-h-[300px] overflow-hidden rounded-3xl border border-black/10 bg-[#f8f7f2] shadow-sm mb-6 flex items-center justify-center">
               <WorldMapBackground />
            </div>
          )}

          {/* Legend directly underneath */}
          <div className="w-full">
            <BtcTransferLegend />
          </div>

        </div>
      </section>

      <div className={`relative z-10 w-full max-w-[1750px] mx-auto px-5 sm:px-8 flex justify-center gap-12 xl:gap-24 ${onOpenScanner ? 'pb-32' : 'pb-16'}`}>
        
        {/* Left Academic Column */}
        <aside className="hidden min-[1350px]:flex flex-col pt-36 w-[320px] shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto no-scrollbar pb-12">
          <div className="border-b-[1.5px] border-black pb-2 mb-8">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">
              Tract I: Opacity & Ruin
            </h3>
          </div>
          <div className="flex flex-col gap-24">
            {LEFT_SIDEBAR_CONTENT.map((item, i) => (
              <article key={i} className="flex flex-col relative group">
                <div className="absolute -left-4 top-1 bottom-0 w-px bg-black/10 group-hover:bg-black transition-colors duration-500" />
                <h4 className="font-mono text-[9px] uppercase tracking-widest text-[#222] font-bold mb-3 leading-loose">
                  [{String(i + 1).padStart(2, '0')}] {item.title}
                </h4>
                <p className="font-serif text-[11px] text-[#444] leading-[1.85] text-justify opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </aside>

        {/* Central Immersive Manifesto */}
        <main className="w-full max-w-[850px] shrink-0 py-12 sm:py-16 flex flex-col gap-16 sm:gap-24">
          
          <header className="flex flex-col gap-6 text-center mb-8">
          <h1 className="text-[32px] md:text-[42px] font-serif text-black leading-tight tracking-tight">
            In the pursuit of <br/><span className="italic font-light">transparency</span>
          </h1>
          <div className="flex justify-center -mt-2 mb-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-black/30">
              © 2026 atfortyseven-creations
            </span>
          </div>
          <p className="font-serif text-[13px] text-[#444] max-w-xl mx-auto leading-relaxed border-t border-b border-black/10 py-6">
            Foundational document on pure mathematical abstraction, zero-knowledge cryptographic mechanisms, 
            and deterministic heuristic paradigms that cement the immutable global infrastructure.
          </p>
        </header>

        <div className="flex flex-col gap-16">
          {IMMERSIVE_PAGES.map((page, pageIndex) => (
            <section key={pageIndex} className="flex flex-col relative w-full">
              <div className="w-full border-b-[1.5px] border-black pb-3 mb-6 flex items-end">
                <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
                  {page.title}
                </h2>
              </div>
              
              {/* Stack Data Grid - Dense and tightly packed */}
              <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm">
                {page.paragraphs.map((para, pIndex) => {
                   const globalIndex = (pageIndex * 3) + pIndex;
                   const lottieFile = MANIFESTO_LOTTIES[globalIndex % MANIFESTO_LOTTIES.length];

                   return (
                     <div key={pIndex} tabIndex={0} className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden focus:outline-none cursor-pointer">
                       
                       {/* Lottie fixed block on the left (solid stack integration) */}
                       <div className="w-full sm:w-[320px] bg-[#f5f4ef] flex items-center justify-center p-8 sm:p-6 border-b sm:border-b-0 sm:border-r border-black/10 shrink-0 relative overflow-hidden transition-colors duration-500 group-hover:bg-[#f0efe9]">
                          <div className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] grayscale mix-blend-multiply opacity-85 transition-transform duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105">
                             <OptimizedLocalLottie filename={lottieFile} />
                          </div>
                       </div>
                       
                       {/* Text Content */}
                       <div className="flex-1 p-5 sm:p-6 md:p-8 flex items-start">
                          <span className="font-mono text-[10px] text-black/30 tracking-widest mr-3 sm:mr-6 select-none flex-shrink-0 mt-[2px]">
                             [{String(pageIndex + 1).padStart(2, '0')}.{String(pIndex + 1).padStart(2, '0')}]
                          </span>
                          <p className="font-serif text-[12px] sm:text-[13px] text-[#222] leading-[1.8] text-justify w-full">
                             {para}
                          </p>
                       </div>

                     </div>
                   );
                })}
               </div>
            </section>
          ))}
        </div>

        {/* ─── Public Akashic Ledger Zero-Mock Sample ─── */}
        <PublicAkashicLedgerSample />

        {/* ─── Scanner Direct Handshake Documentation ─── */}
        <ScannerDocumentation />

        {/* ─── 50 Historic Catastrophic Events Chronicle ─── */}
        <CatastropheChronicle />

        {/* ─── Strategic, Legal & Business Framework ─── */}
        <StrategicCorporateDocumentation />

        {/* ─── Live Ecosystem Intel ─── */}
        <div className="w-full flex flex-col pt-12 pb-8">
          <WhalecosystemTweetFeed />
        </div>

        </main>

        {/* Right Academic Column */}
        <aside className="hidden min-[1350px]:flex flex-col pt-36 w-[320px] shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto no-scrollbar pb-12">
          <div className="border-b-[1.5px] border-black pb-2 mb-8">
            <h3 className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#555]">
              Tract II: Central Entropy
            </h3>
          </div>
          <div className="flex flex-col gap-24">
            {RIGHT_SIDEBAR_CONTENT.map((item, i) => (
              <article key={i} className="flex flex-col relative group">
                <div className="absolute -left-4 top-1 bottom-0 w-px bg-black/10 group-hover:bg-black transition-colors duration-500" />
                <h4 className="font-mono text-[9px] uppercase tracking-widest text-[#222] font-bold mb-3 leading-loose">
                  [{String(i + 4).padStart(2, '0')}] {item.title}
                </h4>
                <p className="font-serif text-[11px] text-[#444] leading-[1.85] text-justify opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </aside>

      </div>

      {/* Floating Scanner Panel - Always visible on mobile when onOpenScanner is provided */}
      {onOpenScanner && (
        <div className="fixed bottom-0 left-0 w-full flex flex-col z-[200]">
           <div className="h-12 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8]/90 to-transparent w-full pointer-events-none" />
           {/* Full dock bar */}
           <div className="w-full bg-[#FDFCF8] border-t border-black/10 flex justify-center py-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
             <button
               type="button"
               onClick={onOpenScanner}
               className="px-10 py-3.5 bg-black text-white font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-3 rounded-none select-none touch-manipulation cursor-pointer"
               style={{ WebkitTapHighlightColor: 'transparent' }}
             >
               <Scan size={13} />
               Connect Wallet
             </button>
           </div>
        </div>
      )}


    </div>
  );
}

function CatastropheChronicle() {
  return (
    <section
      className="w-full max-w-[850px] shrink-0 pt-12 pb-16 flex flex-col"
      aria-label="Chronicle of Historic Catastrophic Events"
    >
      <div className="border-b-[1.5px] border-black pb-3 mb-0 flex items-end gap-4">
        <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
          HISTORICAL CHRONICLE — 50 Events that Detonated the Financial Order
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-black border border-black border-t-0 shadow-sm">
        {HISTORIC_EVENTS.map((ev, i) => (
          <div
            key={ev.code}
            className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden cursor-default hover:bg-[#f5f4ef] transition-colors duration-300"
          >
            {/* Date / Code pill */}
            <div className="w-full sm:w-[160px] bg-[#f5f4ef] group-hover:bg-[#eceae3] border-b sm:border-b-0 sm:border-r border-black/10 flex flex-col items-center justify-center p-4 shrink-0 transition-colors duration-300">
              <span className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-black/30 mb-1">{ev.date}</span>
              <span className="font-mono text-[10px] font-black uppercase tracking-wider text-black/60 group-hover:text-black transition-colors duration-300">{ev.code}</span>
            </div>
            {/* Content */}
            <div className="flex-1 p-5 sm:p-6 flex flex-col gap-1.5">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black">
                [{String(i + 1).padStart(2, '0')}] {ev.title}
              </span>
              <p className="font-serif text-[12px] sm:text-[13px] text-[#333] leading-[1.8] text-justify">
                {ev.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface AkashicEntry {
  id: string;
  chain: string;
  amountUsd: number;
  storedHash: string;
  timestamp: string;
}

function PublicAkashicLedgerSample() {
  const [feed, setFeed] = React.useState<AkashicEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/akashic/verify')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          if (data && data.feed) setFeed(data.feed.slice(0, 4));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="w-full max-w-[850px] shrink-0 pt-12 pb-4 flex flex-col">
      <div className="border-b-[1.5px] border-black pb-3 mb-0 flex items-end justify-between">
        <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black flex items-center gap-2">
          <Scan size={14} /> Akashic Ledger — Public Audit Sample
        </h2>
        <span className="text-[9px] font-mono uppercase tracking-widest text-black/40 animate-pulse">
          Live Feed Active
        </span>
      </div>
      <div className="flex flex-col gap-[1px] bg-black border border-black border-t-0 shadow-sm">
        {loading ? (
          <div className="bg-[#fdfbf6] p-8 flex justify-center text-[10px] font-mono uppercase tracking-widest text-black/40">
            Syncing Sovereign Consensus...
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-[#fdfbf6] p-8 flex justify-center text-[10px] font-mono uppercase tracking-widest text-black/40">
            Awaiting $50M+ Threshold Crossings
          </div>
        ) : (
          feed.map((entry, i) => (
            <div key={i} className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch group overflow-hidden hover:bg-[#f5f4ef] transition-colors duration-300">
              <div className="w-full sm:w-[160px] bg-[#f5f4ef] group-hover:bg-[#eceae3] border-b sm:border-b-0 sm:border-r border-black/10 flex flex-col items-center justify-center p-4 shrink-0 transition-colors duration-300">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-black/50 mb-1">{entry.chain}</span>
                <span className="font-mono text-[11px] font-black tracking-wider text-black group-hover:text-[#D4AF37] transition-colors duration-300">
                  ${(entry.amountUsd / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="flex-1 p-5 flex flex-col gap-2 justify-center">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/50">
                    ID: AKASHIC-{entry.id}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-black/60 flex items-center gap-1">
                    <Scan size={10} /> Verified
                  </span>
                </div>
                <div className="font-mono text-[8px] sm:text-[9px] text-[#555] break-all leading-relaxed bg-black/5 p-2 border border-black/10 selection:bg-black selection:text-white">
                  SHA256: {entry.storedHash}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[8px] uppercase tracking-widest text-black/40">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <a 
                    href={`/status`} 
                    target="_blank"
                    className="font-mono text-[8px] uppercase tracking-widest text-black hover:underline"
                  >
                    View Infrastructure Status →
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ScannerDocumentation() {
  const steps = [
    {
      phase: "01",
      label: "Challenge Generation",
      protocol: "CHALLENGE · secp256k1",
      detail: "The server generates a 256-bit cryptographic nonce linked to the active session of the desktop terminal. This challenge has a maximum validity of 90 seconds and is mathematically unique: no other device can reuse or anticipate it.",
    },
    {
      phase: "02",
      label: "Sovereign QR Encoding",
      protocol: "QR · ECC Level H · URI Scheme",
      detail: "The challenge is encoded in a high error-correction QR code (Level H, up to 30% data recovery). The embedded URI contains the session ID, the challenge hash, and the resolution endpoint. The terminal screen automatically regenerates the code every 60 seconds.",
    },
    {
      phase: "03",
      label: "ECDSA Signature from Mobile Device",
      protocol: "ECDSA · EIP-191 · personal_sign",
      detail: "The mobile device scans the code with the native OS camera. The sovereign wallet (MetaMask, Coinbase, Rainbow, or any WalletConnect v2 compatible) prompts the user for a signature on the challenge message using their private key. The private key never leaves the device: only the resulting signature is transmitted.",
    },
    {
      phase: "04",
      label: "On-Chain Verification & Session Issuance",
      protocol: "ecrecover · SHA3-Keccak · JWT",
      detail: "The server receives the signature, executes `ecrecover` to derive the signer's public address, and compares it against the registered database address. If it matches, an HTTPOnly session cookie is issued with a 7-day duration. The desktop terminal is notified via Server-Sent Events and unlocked in real-time.",
    },
  ];

  const specs = [
    { key: "Signature Algorithm", value: "ECDSA · secp256k1 curve" },
    { key: "Message Hash", value: "Keccak-256 (SHA-3)" },
    { key: "Standard", value: "EIP-191 · personal_sign" },
    { key: "Nonce Validity", value: "90 seconds (anti-replay window)" },
    { key: "Session Transport", value: "HTTPOnly Cookie · SameSite=Lax" },
    { key: "Session Duration", value: "7 days (renewable via re-signature)" },
    { key: "Notification Channel", value: "Server-Sent Events (SSE)" },
    { key: "Compatibility", value: "WalletConnect v2 · EIP-4361 (SIWE)" },
  ];

  return (
    <section className="w-full max-w-[850px] shrink-0 pt-12 pb-16 flex flex-col gap-8">
      <div className="border-b-[1.5px] border-black pb-3 mb-0 flex items-end">
        <h2 className="text-[12px] font-bold font-mono tracking-[0.2em] uppercase text-black">
          Scanner Architecture — Direct Handshake Protocol
        </h2>
      </div>

      {/* Intro */}
      <div className="flex flex-col gap-4 font-serif text-[13px] text-[#222] leading-relaxed text-justify">
        <p>
          The Sovereign Terminal authentication system uses no passwords, no emails, and no credential databases. The operator's identity is established exclusively by the provable possession of a cryptographic private key. This mechanism is called the <strong>Direct QR Handshake</strong>: a handshake between the sovereign mobile device and the desktop web terminal, mediated by an ephemeral QR code signed with elliptic curve cryptography.
        </p>
        <p>
          Unlike conventional two-factor authentication systems, there is no trusted third party, no remote session database, and no persistent shared secret. Each access is an independent mathematical proof of identity.
        </p>
      </div>

      {/* Protocol Steps */}
      <div className="flex flex-col gap-[1px] bg-black border border-black shadow-sm">
        {steps.map((step, i) => (
          <div key={step.phase} className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch hover:bg-[#f5f4ef] transition-colors duration-200">
            <div className="w-full sm:w-[120px] bg-[#f5f4ef] border-b sm:border-b-0 sm:border-r border-black/10 flex flex-col items-center justify-center p-4 shrink-0">
              <span className="font-mono text-[20px] font-black text-black/20 leading-none">
                {step.phase}
              </span>
            </div>
            <div className="flex-1 p-5 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black">
                  {step.label}
                </span>
                <span className="font-mono text-[8px] uppercase tracking-widest text-black/40 bg-black/5 px-2 py-0.5 self-start sm:self-auto">
                  {step.protocol}
                </span>
              </div>
              <p className="font-serif text-[12px] sm:text-[13px] text-[#333] leading-[1.8] text-justify">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Specs */}
      <div className="flex flex-col gap-0">
        <div className="border-b border-black pb-2 mb-0">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-black/50 font-bold">
            Technical Parameters
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-black/10 border border-black/10 border-t-0">
          {specs.map((spec) => (
            <div key={spec.key} className="bg-[#fdfbf6] flex flex-col sm:flex-row items-stretch">
              <div className="w-full sm:w-[190px] bg-[#f5f4ef] border-b sm:border-b-0 sm:border-r border-black/8 px-4 py-3 flex items-center shrink-0">
                <span className="font-mono text-[8px] uppercase tracking-wider text-black/50 font-bold">
                  {spec.key}
                </span>
              </div>
              <div className="flex-1 px-4 py-3 flex items-center">
                <span className="font-mono text-[10px] text-black font-black tracking-wide">
                  {spec.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Note */}
      <div className="border-l-2 border-black pl-4 flex flex-col gap-1.5">
        <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-black/40 font-bold">
          Security Note
        </span>
        <p className="font-serif text-[12px] text-[#444] leading-relaxed text-justify">
          The signature produced by the mobile device is publicly verifiable but reveals no information whatsoever about the operator's private key. The server only stores the derived public wallet address. Any attempt to replay an old session is automatically blocked by the single-use nonce system and the 90-second validity window.
        </p>
      </div>
    </section>
  );
}

function StrategicCorporateDocumentation() {
  const phases = [
    {
      id: "IV",
      title: "IP & Legal Infrastructure",
      subtitle: "Absolute Jurisdictional Invulnerability",
      items: [
        { label: "IP Registration", text: "SHA-256 code hashing and Safe Creative deposition for 'Sovereign Network'. Complete patent compartmentalization for the Z-Score engine." },
        { label: "Asymmetric NDA", text: "24-month non-circumvention clauses with liquidated damages to eliminate enterprise extraction vectors." },
        { label: "GDPR Mastery", text: "EIP-191 authentication completely bypasses PII ingestion. No emails, no IP storage. Mathematical proof over biometric liability." },
        { label: "Corporate Entity", text: "Formal transfer of software architecture rights to the central SL vehicle, cementing intellectual property into tangible capital." }
      ]
    },
    {
      id: "V",
      title: "Business & Funding Matrix",
      subtitle: "Hyper-Scalable Capital Architecture",
      items: [
        { label: "B2B SaaS Canvas", text: "Dual-tier revenue flow targeting institutional funds and elite retail whales via frictionless on-chain API gateways." },
        { label: "Financial Projections", text: "18-month runway modeling with LTV/CAC ratio strictly > 4. Sub-3% projected churn on enterprise licenses." },
        { label: "Institutional Pitch", text: "15-slide master narrative focused on 'Zero-Trust Architecture', leveraging the initial 30-user elite evaluation cohort." },
        { label: "ENISA / CDTI", text: "Structured R&D memory targeting non-dilutive government grants for the proprietary session-reconciliation engine." }
      ]
    },
    {
      id: "VI",
      title: "Final System Alignment",
      subtitle: "The Master Execution Checklist",
      items: [
        { label: "Code Integrity", text: "TitaniumGate and Wagmi reconciliations achieved zero infinite-redirect loops. Audited and sealed." },
        { label: "Founders Pact", text: "1-year cliff and 4-year vesting matrix mathematically enforcing alignment among core architects." },
        { label: "Societal Constitution", text: "Notarial certification, statutory broad scope, and capital injection finalized for operational dominance." }
      ]
    }
  ];

  return (
    <section className="w-full max-w-[850px] shrink-0 pt-16 pb-16 flex flex-col gap-10">
      <div className="flex flex-col gap-4 text-center items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black border border-black/10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#FDFCF8]">Corporate Ready</span>
        </div>
        <h2 className="text-[28px] md:text-[36px] font-serif text-black leading-tight tracking-tight mt-2">
          Strategic & Corporate <br /><span className="italic font-light text-black/60">Execution Framework</span>
        </h2>
        <p className="font-serif text-[13px] text-[#444] max-w-xl mx-auto leading-relaxed border-t border-b border-black/10 py-6 mt-4">
          Sovereign Terminal is not merely a technical infrastructure. The following matrix details the absolute perfection achieved across Intellectual Property, Business Modeling, and Institutional Compliance.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {phases.map((phase) => (
          <div key={phase.id} className="flex flex-col gap-[1px] bg-black border border-black shadow-sm group">
            <div className="bg-[#111] text-[#FDFCF8] flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[24px] font-black tracking-tighter text-[#D4AF37] opacity-80 group-hover:opacity-100 transition-opacity">
                  {phase.id}.
                </span>
                <span className="font-mono text-[12px] uppercase tracking-widest font-bold">
                  {phase.title}
                </span>
              </div>
              <span className="hidden sm:block font-mono text-[9px] uppercase tracking-widest text-[#FDFCF8]/40">
                {phase.subtitle}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-black">
              {phase.items.map((item, idx) => (
                <div key={idx} className="bg-[#fdfbf6] p-6 hover:bg-[#f5f4ef] transition-colors duration-300 flex flex-col gap-3">
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-black/60">
                    {item.label}
                  </span>
                  <p className="font-serif text-[12px] text-[#222] leading-[1.8] text-justify">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
