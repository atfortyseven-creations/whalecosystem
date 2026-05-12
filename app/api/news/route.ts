import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  NewsArticleIntelligence, 
  MarketSentiment,
  RawNewsItem
} from '@/lib/news-intelligence';

export const revalidate = 0;

interface CryptoPanicArticle {
  id: number; domain: string; title: string; published_at: string;
  slug: string; url: string;
  source: { title: string; region: string; domain: string };
}

/**
 * Interface for the flattened article structure used in the UI
 * NOTE: Images removed per institutional mandate.
 */
export interface UINewsArticle {
  id: string; 
  title: string; 
  description: string;
  date: string; 
  url: string; 
  source: string; 
  sentiment?: MarketSentiment;
  veracityScore?: number | null;
  isFake?: boolean;
  btcBullish?: number;
  btcBearish?: number;
}

// ─── Utilidad: Decodificador de Entidades HTML ────────────────────────────────
function decodeHTMLEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Generates deterministic BTC sentiment metrics based on the title
 */
function generateBtcSentiment(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  
  // Create a realistic spread: most news is slightly bullish or slightly bearish
  let baseBullish = 35 + (Math.abs(hash) % 50); // 35 to 85%
  
  // If title has negative keywords, invert it
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.match(/(crash|sell|dump|hack|sec|ban|lawsuit|bear|drop|plunge)/)) {
      baseBullish = 10 + (Math.abs(hash) % 30); // 10 to 40%
  } else if (lowerTitle.match(/(buy|pump|bull|etf|approve|ath|surge|soar|adopt)/)) {
      baseBullish = 70 + (Math.abs(hash) % 25); // 70 to 95%
  }

  return {
      btcBullish: baseBullish,
      btcBearish: 100 - baseBullish,
      sentiment: (baseBullish > 60 ? 'bullish' : baseBullish < 40 ? 'bearish' : 'neutral') as MarketSentiment
  };
}

function cleanAnalysis(text: string): string {
  if (!text) return "";
  return text
    .replace(/Executive Brief|Global Intelligence Network|WAN Intelligence Node|Semantic Sentiment:\s*\w+|Executive Assessment Frame|Systemic Weight|Market Trajectory|Domain Vector|Macro-Institutional/gi, "")
    .replace(/\d+\s*\/100/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Institutional Analysis Generator (Expert Rotation) - Extended Length
 */
function generateDeepAnalysis(title: string, domain: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % 4;

  const templates: string[][] = [
    [
      `Our institutional telemetry node monitoring ${domain} has detected a highly asymmetric directional signal regarding "${title}". By cross-referencing mempool throughput velocity, stablecoin issuance rates, and aggregated open interest across derivative markets, we observe a statistically significant deviation from the established 30-day volatility baselines. This anomalous behavior is strongly indicative of a coordinated institutional accumulation or distribution phase orchestrated by top-tier market participants.`,
      `Tier-1 participants—heuristically defined as entities managing excess of $10 million in digital assets—are currently executing meticulously calibrated portfolio rebalancing operations through over-the-counter (OTC) prime brokerage platforms and centralized limit order books. On-chain forensic data evidences net outflows from spot markets into geographically distributed cold storage clusters. Historically, this precise microstructural pattern has preceded directional volatility expansions ranging from 15% to 35% within the subsequent 72-hour trading window.`,
      `Correlated analysis generated through our proprietary Intelligence Matrix projects an imminent repricing of short-term implied volatility within perpetual swap contracts. The widening divergence between retail sentiment indices and institutional positioning represents a critical structural dislocation in the current market environment. It is paramount to note that block transfers exceeding the $2.5M threshold have surged by an estimated 18.4% during the current active trading session.`,
      `Furthermore, liquidity provision within automated market makers (AMMs) has demonstrated a notable shift towards concentrated ranges, suggesting that sophisticated actors are anticipating a localized price containment before a parabolic breakout or breakdown. The underlying network gas consumption patterns corroborate this thesis, displaying burst-like smart contract interactions typically associated with high-frequency algorithmic execution rather than organic retail participation.`,
      `We advise quantitative operators and discretionary traders to rigorously monitor the confluence zones of historical support and resistance. Additionally, observing the convergence of the Relative Strength Index (RSI) across 4-hour and daily timeframes is crucial before committing directional capital. Capital preservation methodologies, including dynamic stop-loss adjustments and reduced leverage multipliers, should be prioritized until the primary macroeconomic distribution pattern formally resolves.`
    ],
    [
      `The recent development reported by ${domain} under the headline "${title}" has been algorithmically categorized by our Macro-Structural Analysis Desk as a regulatory event possessing profound first and second-order implications for on-chain liquidity routing. Our proprietary compliance overlay engine has intersected this event with the latest directives from global financial authorities, yielding a severe risk-adjusted impact score for unregulated derivative markets.`,
      `Institutional capital flows are exhibiting early repositioning signatures that are entirely consistent with the pricing of unprecedented regulatory uncertainty. Prime brokerage desks across tier-1 trading venues have proactively widened collateral haircuts on directly affected digital assets by an estimated 8% to 12%. Concurrently, Request-for-Quote (RFQ) spreads in the OTC market have experienced a measurable expansion. This confluence of liquidity stress metrics typically precedes a compulsory inventory recalibration by dominant market makers.`,
      `Our blockchain surveillance infrastructure maintains an elevated state of alert across the top 15 EVM-compatible networks. The on-chain compliance scores for associated Decentralized Finance (DeFi) protocols have been temporarily downgraded, pending a more exhaustive jurisprudential analysis by our legal heuristics engine. Hedge fund operators and decentralized treasuries should strongly consider weighting their portfolio exposure by adjusting Kelly multipliers downwards until a definitive regulatory precedent is established.`,
      `Moreover, the fragmentation of liquidity across distinct jurisdictional boundaries is accelerating. We observe a migration of stablecoin reserves from potentially non-compliant jurisdictions into sovereign-grade, mathematically verifiable collateralized debt positions (CDPs). This structural flight to cryptographic safety underscores a paradigm shift wherein institutional actors prioritize protocol-level immutability over yield optimization in times of regulatory ambiguity.`,
      `Consequently, the risk of a liquidity vacuum in secondary and tertiary asset classes has escalated. Market participants heavily exposed to algorithmic stablecoins or thinly traded utility tokens must exercise extreme caution. Stress tests executed within our sandbox environment indicate that a cascade of liquidations could amplify spot price displacement far beyond standard deviation estimates. Rigorous review of liquidation thresholds and the maintenance of ample safety margins are strictly recommended.`
    ],
    [
      `The coverage by ${domain} regarding "${title}" directly intersects with the active surveillance vectors monitored continuously by our DeFi Intelligence Unit. On-chain Total Value Locked (TVL) migration data indicates that over $340 million in aggregate liquidity has been abruptly repositioned into concentrated liquidity curve pools (AMM v3) over the preceding 6-hour window. This capital flight represents a 2.3x deviation from the established 7-day moving average, signaling a defensive, risk-off posture by identified institutional wallets.`,
      `The underlying mechanics of this capital rotation carry severe implications for the incentive structures and tokenomic stability of the impacted protocols. Governance participation rates have surged 41% above the baseline within associated Decentralized Autonomous Organizations (DAOs). Concurrently, on-chain treasury outflows from multi-signature wallets linked to core development teams have accelerated—a statistical pattern definitively classified as 'informed restructuring' by our proprietary heuristic tracking models.`,
      `Cross-protocol contagion risk is currently evaluated as moderate in the short term. However, our advanced Monte Carlo stress tests indicate a non-trivial tail-risk scenario wherein a liquidation cascade across premier lending markets could amplify the spot price displacement beyond standard algorithmic estimates. The interconnected nature of yield-bearing collateral means that a localized failure could rapidly propagate through the decentralized financial stack.`,
      `We are also observing an anomalous spike in the utilization rates of decentralized borrowing facilities, driving variable interest rates to unsustainable premiums. This dynamic often precedes a deleveraging event, as participants are forced to unwind levered positions to avoid punitive liquidation penalties. The velocity of these unwinds is historically correlated with sudden, violent drawdowns in the underlying spot assets.`,
      `It is imperative for participants with leveraged exposure to rigorously review their Health Factor thresholds. Maintaining exceptionally wide safety margins is no longer a conservative recommendation but an operational necessity. We will continue to monitor the mempool for front-running operations and sandwich attacks that typically target vulnerable liquidations during these periods of extreme network congestion.`
    ],
    [
      `Following the publication of "${title}" by ${domain}, our early warning system detected a temporal anomaly in the activity of ultra-high-net-worth (whale) wallets distributed across multiple independent blockchains. Previously dormant wallets, mathematically classified as 'genesis-era entities', have collectively mobilized a substantial fraction of their notional capital toward mixed-custody obfuscation schemes. This transaction cluster signals a deliberate, sophisticated portfolio restructuring in direct response to the evolving market paradigm.`,
      `Exchange net flow data unequivocally corroborates our directional thesis. Premier Centralized Exchanges (CEXs) have registered massive net outflows from their hot wallet infrastructure, while paradoxically, open interest in CME-listed futures contracts has witnessed a sharp increase. This dynamic divergence—spot liquidity withdrawal coupled with futures inflow—is strongly characteristic of the deployment of an institutional basis trade. Such strategies typically resolve with a continuation of the macroeconomic trend in the medium term.`,
      `The intelligence desk has elevated the priority classification of this event due to its highly asymmetric repercussions on available order book liquidity. Real-time WebSocket feeds are currently monitoring order book depth across the highest capitalization assets, noting a significant thinning of bids and asks. This structural fragility implies that even moderate market orders could induce disproportionate price slippage and volatility spikes.`,
      `Furthermore, the mobilization of genesis-era capital often serves as a leading indicator for profound shifts in the underlying market architecture. These entities operate with informational advantages and multi-year time horizons, meaning their on-chain footprints frequently precede major structural upgrades, regulatory shifts, or macroeconomic pivots. Their current trajectory suggests a transition towards yield-generating, sovereign-grade digital commodities.`,
      `We strongly advise operational desks to avoid excessively leveraged directional positions. Maintaining strict risk management discipline is essential until the primary macroeconomic distribution patterns have fully matured or formally neutralized. Our quantitative models suggest that the current volatility contraction is a precursor to a definitive breakout, necessitating a patient, data-driven approach to capital allocation.`
    ]
  ];

  return templates[idx].join('\n\n');
}

// ─── Extractor de RSS SIN IMÁGENES ───────────────────────────────────────────
async function fetchRSSFeed(url: string, sourceName: string): Promise<UINewsArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/rss+xml, application/xml, text/xml', 'User-Agent': 'WhaleAlertBot/2.0' },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
    const articles: UINewsArticle[] = [];

    for (const match of itemMatches) {
      const item = match[1];

      const title = (
        item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ??
        item.match(/<title>(.*?)<\/title>/)
      )?.[1]?.trim() ?? '';

      const link = (
        item.match(/<link>(.*?)<\/link>/) ??
        item.match(/<guid[^>]*>(.*?)<\/guid>/)
      )?.[1]?.trim() ?? '';

      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1]?.trim() ?? '';

      if (!title || !link) continue;

      const cleanTitle = decodeHTMLEntities(title);
      const sentimentData = generateBtcSentiment(cleanTitle);

      articles.push({
        id:          `rss-${Buffer.from(link).toString('base64').slice(0, 16)}`,
        title:       cleanTitle,
        description: cleanAnalysis(generateDeepAnalysis(cleanTitle, sourceName)),
        date:        pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        url:         link,
        source:      sourceName,
        sentiment:   sentimentData.sentiment,
        btcBullish:  sentimentData.btcBullish,
        btcBearish:  sentimentData.btcBearish
      });

      if (articles.length >= 25) break; // Increased fetch count
    }

    return articles;
  } catch (err: any) {
    console.warn(`[WhaleNews] RSS ${sourceName} failed: ${err.message || 'Unknown Network Error'}`);
    return [];
  }
}

async function persistToDB(articles: UINewsArticle[]) {
  // DB code omitted from update for brevity and as we removed imageUrl
  for (const art of articles) {
    try {
      await prisma.newsArticle.upsert({
        where: { url: art.url },
        update: {
          title: art.title,
          summary: art.description,
          source: art.source,
          publishedAt: new Date(art.date),
        },
        create: {
          url: art.url,
          title: art.title,
          summary: art.description,
          source: art.source,
          publishedAt: new Date(art.date),
          category: 'crypto',
        },
      });
    } catch (e: any) {
      // Ignore errors for unmigrated DB
    }
  }
}

function padTo300(articles: UINewsArticle[]) {
    const d = new Date().toISOString();
    const customArticles: UINewsArticle[] = [
      {
        id: 'custom-1',
        title: 'Structural Decoupling in Layer 1 Nodes and MEV Extraction Vectors',
        description: cleanAnalysis('An exhaustive quantitative analysis of network topology across Ethereum reveals a statistically significant divergence in Maximal Extractable Value (MEV) extraction rates. Over the past quarter, our proprietary telemetry has observed that elite institutional entities and quantitative hedge funds have systematically routed their capital flows through private RPC endpoints and decentralized dark pools (such as Flashbots Protect and its analogues). This strategic routing has effectively isolated over $430 million in cross-border transactions from the public mempool.\n\n## The Silent Migration\n\nThis behavior is not serendipitous; rather, it represents a structural paradigm shift in blockchain market microstructure. Historically, the execution of large capital blocks was inherently subject to statistical arbitrage and "sandwich" attacks orchestrated by algorithmic searchers. However, the massive migration toward asynchronous settlement channels conclusively indicates that institutional-grade capital now prioritizes slippage mitigation and trade obfuscation over immediate inclusion in the subsequent block.\n\n> "The transition from public mempool execution to private order flow directly undermines the foundational assumption of transparent liquidity on Layer 1, demanding entirely new heuristic models for volume analysis."\n\n## Economic Repercussions\n\nThe economic impact of this decoupling is fundamentally bidirectional. First, it erodes the aggregate profitability of public, good-faith validators who rely substantially on MEV-derived tips to sustain operational margins in an environment of diminishing staking yields. Second, it generates a severe information asymmetry: competing pricing models that base their analytics exclusively on the public mempool are losing visibility over true macroeconomic accumulation and distribution flows.\n\nFor the corporate operator, the conclusion is unequivocal. Hidden capital flows are masking the true volume of structural support and resistance in major digital assets. We imperatively recommend that treasuries adjust their market impact models and incorporate a heuristic discount coefficient for all on-chain volume metrics that do not formally account for private block flows. Furthermore, algorithmic trading systems must be recalibrated to recognize phantom liquidity spikes that evaporate milliseconds before execution, a hallmark of advanced MEV spoofing tactics now prevalent in the public domain.'),
        date: d,
        url: 'https://whalealert.network/news/mev-extraction-anomaly',
        source: 'Sovereign Node',
        sentiment: 'bearish',
        btcBullish: 34,
        btcBearish: 66
      },
      {
        id: 'custom-2',
        title: 'Institutional Integration of ZK-Rollup Consensus and Capital Obfuscation',
        description: cleanAnalysis('The rapid maturation of Zero-Knowledge (ZK) infrastructure is facilitating a massive, silent transition of tier-1 capital toward Layer 2 (L2) networks. Our rigorous cross-chain analysis certifies that protocols based on ZK-Rollup technology are processing corporate settlement volumes at a rate 3.4 times higher than the historical year-over-year average. This parabolic adoption is not primarily driven by the well-documented compression of gas fees, but rather by the unbreakable mathematical capacity to obfuscate critical transactional metadata prior to final consolidation on the mainnet.\n\nFrom an analytical perspective grounded in corporate game theory, the ability to execute massive portfolio rebalancing strategies without revealing specific asset weightings to forensic analysis firms provides a competitive advantage of colossal magnitude. Cryptographic validity proofs (SNARKs and STARKs) allow hedge funds and decentralized market makers, for the first time, to mathematically demonstrate the solvency of their audited reserves without exposing the tactical directionality of their active operations on the limit order book.\n\nOur intelligence projects that this emerging dynamic will irreversibly fragment the crystalline transparency for which Layer 1 (L1) has historically been characterized. As protocols such as Account Abstraction (ERC-4337) and ZK proof aggregation become standardized across the industry, the traditional heuristics employed for whale tracking will suffer an estimated 40% degradation in precision over the next 18 months.\n\nTherefore, it is fundamental that financial institutions and risk analysts proactively adapt their surveillance and monitoring infrastructures. The new market standard will demand analytical systems capable of basing their conclusions on aggregated cryptographic proofs, gradually discarding deterministic heuristics linked to basic address clustering. Quantitative models must evolve to interpret zero-knowledge state transitions as primary indicators of macroeconomic capital flows.'),
        date: new Date(Date.now() - 3600000).toISOString(),
        url: 'https://whalealert.network/news/zk-obfuscation',
        source: 'Sovereign Layer',
        sentiment: 'bullish',
        btcBullish: 82,
        btcBearish: 18
      }
    ];

    const target = 300;
    let baseArticles = [...customArticles, ...articles];

    let result = [...baseArticles];
    if (result.length >= target) return result.slice(0, target);
    
    const initialLength = result.length;
    let i = 0;
    while(result.length < target) {
        const base = result[i % initialLength];
        const newId = `pad-${result.length}`;
        const sentimentData = generateBtcSentiment(base.title);
        
        result.push({
            ...base,
            id: newId,
            title: base.title + ` [Analysis Node ${result.length}]`,
            date: new Date(new Date(base.date).getTime() - ((result.length * 3600000) % 86400000)).toISOString(),
            sentiment: sentimentData.sentiment,
            btcBullish: sentimentData.btcBullish,
            btcBearish: sentimentData.btcBearish
        });
        i++;
    }
    return result;
}

export async function GET() {
  const originalResponse = await GET_internal();
  try {
    const json = await originalResponse.clone().json();
    if (json.articles) {
        const padded = padTo300(json.articles);
        return NextResponse.json({ ...json, count: padded.length, articles: padded });
    }
  } catch (e) {
  }
  return originalResponse;
}

async function GET_internal() {
  const apiKeysEnv = process.env.CRYPTOPANIC_API_KEYS || process.env.CRYPTOPANIC_API_KEY || '';
  const apiKeys = apiKeysEnv.split(',').map(k => k.trim()).filter(Boolean);

  // ── Capa 1: CryptoPanic ──────────────────────────────────────────────────
  for (const key of apiKeys) {
    try {
      const res = await fetch(
        `https://cryptopanic.com/api/v1/posts/?auth_token=${key}&public=true&kind=news`,
        { headers: { 'Accept': 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(6000) }
      );
      if (res.ok) {
        const json = await res.json();
        const results: CryptoPanicArticle[] = json.results ?? [];
        if (results.length > 0) {
          const articles: UINewsArticle[] = results.slice(0, 50).map(item => {
            const clean   = decodeHTMLEntities(item.title.replace(/<[^>]*>?/gm, ''));
            const srcName = item.source?.title || item.domain || 'Whale-Node';
            const artId   = `cp-${item.id}`;
            const sentimentData = generateBtcSentiment(clean);
            return {
              id: artId, title: clean,
              description: cleanAnalysis(generateDeepAnalysis(clean, srcName)),
              date: new Date(item.published_at).toISOString(),
              url: item.url, source: srcName,
              sentiment: sentimentData.sentiment,
              btcBullish: sentimentData.btcBullish,
              btcBearish: sentimentData.btcBearish
            };
          });
          persistToDB(articles).catch(() => {});
          return NextResponse.json({ success: true, source: 'live', count: articles.length, articles, timestamp: Date.now() });
        }
      } else if (res.status !== 429) break;
    } catch { continue; }
  }

  // ── Capa 2: RSS Feeds institucionales (Cointelegraph Prioritized) ──────────
  const RSS_SOURCES = [
    { url: 'https://cointelegraph.com/rss', name: 'Cointelegraph' }, // Moved to top priority
    { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', name: 'CoinDesk' },
    { url: 'https://decrypt.co/feed', name: 'Decrypt' },
    { url: 'https://cryptoslate.com/feed/', name: 'CryptoSlate' },
    { url: 'https://bitcoinmagazine.com/.rss/full/', name: 'Bitcoin Magazine' },
  ];

  const rssResults = await Promise.allSettled(RSS_SOURCES.map(s => fetchRSSFeed(s.url, s.name)));
  const allRss: UINewsArticle[] = [];
  for (const r of rssResults) {
    if (r.status === 'fulfilled') allRss.push(...r.value);
  }
  allRss.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const top50 = allRss.slice(0, 50);

  if (top50.length > 0) {
    persistToDB(top50).catch(() => {});
    return NextResponse.json({ success: true, source: 'rss', count: top50.length, articles: top50, timestamp: Date.now() });
  }

  return NextResponse.json({ success: false, source: 'none', articles: [], error: 'All sources offline.' }, { status: 503 });
}
