import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ─── Corpus ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Announcements', slug: 'announcements', description: 'Official protocol updates',     color: '#2D0A59', orderIndex: 1 },
  { name: 'General',       slug: 'general',       description: 'General discussions',           color: '#050505', orderIndex: 2 },
  { name: 'Aztec',         slug: 'aztec',         description: 'Zero Knowledge research',       color: '#10B981', orderIndex: 3 },
  { name: 'Noir',          slug: 'noir',          description: 'Noir smart contracts',          color: '#000000', orderIndex: 4 },
  { name: 'Site Feedback', slug: 'site-feedback', description: 'Meta discussion about the forum', color: '#6B7280', orderIndex: 5 },
  { name: 'DeFi Yields',   slug: 'defi-yields',   description: 'Execution layer intents',       color: '#D4AF37', orderIndex: 6 },
];

const NAMES = [
  'Vitalik_Shadow', 'ZkProver_01', 'NullifierNode', 'MevExtractor',
  'BaseMiner_X', 'AztecResearcher', 'SovereignWhale', 'LayerZeroOp',
  'ChainAnalyst_9', 'ProofSystem_42', 'DarkPoolOp', 'GasArbitrage',
  'FlashLoan_Max', 'BridgeValidator', 'OmnichainNode', 'QuantumMEV',
  'ZkRollup_Dev', 'BeaconChainOp', 'EigenLayer_X', 'RealWorldAsset',
  'PerpTrader_01', 'VaultOperator', 'CrossChain_99', 'SynthDeployer',
  'OracleNode_7', 'Staker_Maximus', 'ValidatorSet', 'NomadBridge',
  'ProtocolDAO_X', 'L2Sequencer', 'ProofMarket_1', 'CircuitBreaker',
  'TrustlessOp', 'AtomicSwap_X', 'ZeroLatency', 'InstitutionPRO',
  'BlockPropagator', 'FinalityNode', 'StateSyncer', 'MerkleProver',
  'ConsensusBot', 'GenesisValidator', 'SovereignNode', 'CapitalFlow_X',
  'ArbitrageMatrix', 'LiquidityPRO', 'DeltaNeutral', 'VanishingPoint',
  'CryptoNomad_88', 'NullAddress_0',
];

const TOPICS_CORPUS = [
  {
    catSlug: 'aztec',
    title: 'ZK-SNARK proof generation bottleneck at scale — analysis',
    content: 'After running 50k proofs in production I have identified three specific bottlenecks in the proving pipeline. The witness generation step consumes 67% of total time. Multi-scalar multiplication (MSM) is the next bottleneck at 22%. The remaining 11% is proof serialization overhead. Sharing the full benchmark methodology here for peer review.',
    replies: [
      'This matches our internal benchmarks exactly. We are using batch proving to reduce MSM overhead by 40%. Happy to share the implementation details.',
      'The witness generation issue is well-known in the proving community. Nova-Scotia offers 3x improvement here — have you evaluated it?',
      'What circuit size are we talking? Our 1M constraint circuits hit different bottlenecks than smaller ones. The ratio changes significantly past 500k constraints.',
      'We solved this by moving witness generation to GPU. 8x speedup on A100. Not practical for all deployments but game-changing for institutional use cases.',
      'For MSM specifically — BLS12-381 vs BN254 makes a significant difference. Which curve is your system using? The field arithmetic costs are very different.',
    ],
  },
  {
    catSlug: 'general',
    title: 'MEV extraction strategies post-EIP-4844 — what changed',
    content: 'EIP-4844 (proto-danksharding) fundamentally altered the MEV landscape. Blob transactions introduced new arbitrage vectors between L1 and L2 that did not exist before. This thread documents the new patterns we are observing and how the existing searcher infrastructure needs to adapt.',
    replies: [
      'The blob fee market is completely separate from execution fees. This creates interesting cross-market arbitrage for validators who can see mempool state across both.',
      'L2 sequencer centralization is the real MEV story here. The sequencer captures 100% of ordering MEV on most rollups. Decentralized sequencing cannot arrive fast enough.',
      'We have been tracking blob inclusion patterns and there is a clear temporal pattern — blobs are strategically delayed to create ordering advantages for certain relayers.',
      'The 4844 data availability cost reduction is real but it created second-order effects nobody predicted. The economics of blob space will stabilize within 6 months as the market finds equilibrium.',
    ],
  },
  {
    catSlug: 'noir',
    title: 'Noir constraint system deep-dive: optimal circuit decomposition',
    content: 'Building production Noir circuits requires deep understanding of the constraint system. This post covers: (1) how to decompose complex business logic into efficient circuits, (2) common antipatterns that bloat constraint counts, (3) our methodology for reducing circuit size by 60% in the Identity Verification module.',
    replies: [
      'The range check optimization you described saves us approximately 200 constraints per field element. Over 10k invocations this is significant.',
      'For decomposition — have you explored using nested functions vs flat circuits? We found that function call overhead in Noir adds ~15 constraints per invocation which matters at scale.',
      'The 60% reduction claim is significant. Can you share the before/after constraint counts and the specific transformations applied? Would be invaluable for the community.',
      'We hit a similar wall with the merkle tree verification circuit. The solution was precomputing intermediate nodes off-circuit and only verifying the final membership proof in-circuit.',
      'What version of Noir? There were substantial constraint system improvements between 0.17 and 0.19 that might partially explain the optimization gains.',
    ],
  },
  {
    catSlug: 'defi-yields',
    title: 'Delta-neutral yield strategy: 18-month performance report',
    content: 'We have been running a systematic delta-neutral strategy across major DeFi protocols since Q3 2023. Net APY after funding rates, gas costs, and rebalancing friction: 14.7%. Sharpe ratio: 2.1. Maximum drawdown: 4.3% during the March 2024 volatility spike. Full methodology and risk-adjusted metrics below.',
    replies: [
      'The 2.1 Sharpe is exceptional for DeFi. What is your rebalancing frequency and what triggers a delta adjustment? The friction costs at high frequency can destroy returns.',
      'March 2024 was brutal for delta-neutral. 4.3% max drawdown means your hedging was very tight. Did you use options or purely perp-based delta hedging?',
      'Funding rates have been compressing across perpetual exchanges. How does the strategy perform in a low-funding-rate environment? The backtest before 2023 would show the stress case.',
      'Which protocols are in the yield stack? If it includes any Curve/Convex positions the smart contract risk profile is non-trivial even if the delta is neutral.',
      'The gas cost component is often underreported. At what TVL does this strategy become economically viable? Our calculations suggest the minimum is ~$500k to overcome friction.',
      'We ran a similar strategy but with a vol-targeting overlay. The Sharpe improved to 2.8 at the cost of 3% lower raw APY. The risk-adjusted improvement justified it for institutional allocators.',
    ],
  },
  {
    catSlug: 'aztec',
    title: 'Private state in Aztec Network: architectural patterns for production apps',
    content: 'Aztec\'s private state model is fundamentally different from public blockchain programming. Notes, commitments, and nullifiers replace the familiar account balance model. This is a comprehensive guide for developers transitioning from Solidity to Noir+Aztec, covering the mental model shift and common architectural mistakes.',
    replies: [
      'The note model took me weeks to internalize coming from Solidity. The key insight is thinking in terms of UTXO sets rather than account state. Once that clicks everything else follows.',
      'What is your recommended pattern for private-to-public information flow? We have a use case that requires some state to be provably public (for regulatory compliance) while the counterparty remains private.',
      'The nullifier tree management is critical for performance. What tree depth are you using and how do you handle the nullifier set growth over time?',
      'For production apps — what is the current proof generation time on a standard user device? The UX implications of >5 second client-side proofs are significant for mainstream adoption.',
    ],
  },
  {
    catSlug: 'general',
    title: 'On-chain identity verification without KYC: World ID analysis',
    content: 'World ID offers an interesting primitive: proof of unique humanness without revealing identity. After integrating it into our platform we have observations on the UX tradeoffs, the nullifier hash system for privacy preservation, and the real-world adoption curve. This is not an endorsement — it is a technical analysis.',
    replies: [
      'The nullifier hash design is elegant. One World ID → one nullifier per action scope means Sybil resistance without cross-context linking. The cryptographic design is sound.',
      'The Orb distribution is the fundamental bottleneck. Cryptographic elegance does not matter if verification requires physical access to a device in a handful of cities.',
      'We integrated World ID 6 months ago. The UX is better than expected but the false rejection rate for users with certain facial features is a documented and unresolved problem.',
      'The alternative approaches — Proof of Humanity, Bright ID — have their own tradeoffs. What matters is the threat model. World ID is well-suited for Sybil resistance, not for full KYC compliance.',
      'The semaphore protocol underneath is solid peer-reviewed cryptography. The risk is not the ZK layer — it is the centralized Orb issuance and the biometric data custody model.',
    ],
  },
  {
    catSlug: 'site-feedback',
    title: 'Capital Ledger UX feedback — the new floor presets are excellent',
    content: 'The new pill-based floor preset system in the Capital Ledger is significantly better than the slider. The $100K/$500K/$1M/$5M/$10M/$50M presets map exactly to the decision thresholds we actually care about in practice. One request: add a custom input for non-standard thresholds.',
    replies: [
      'Agreed. The slider was imprecise and hard to use on mobile. The pills are instant. Excellent design decision.',
      'The Sonar audio ping for new transactions above the floor threshold is a nice touch. More institutional data platforms should think about ambient audio feedback.',
      'Would love a saved preset per session — if I close and reopen the Ledger, having it remember my last floor selection would save friction.',
      'The LIVE indicator and event counter update in real-time which builds trust in the data feed. Small detail but it matters for institutional users who need to know the connection is alive.',
    ],
  },
  {
    catSlug: 'noir',
    title: 'Recursive proof composition in Noir: current state and limitations',
    content: 'Recursive proofs — verifying a proof inside a circuit — are the key enabler for proof aggregation and scalable ZK systems. This post covers the current state of recursion support in Noir, performance characteristics, and the specific limitations that prevent naive recursion from being practical at scale today.',
    replies: [
      'The current recursion overhead in Noir makes it impractical for circuits >100k constraints. The inner verification circuit adds ~300k constraints of its own. That math does not work for most applications.',
      'Folding schemes (Nova, HyperNova) are the solution to the recursion overhead problem. They amortize the verification cost across many steps. When does Aztec plan to integrate folding?',
      'We have been experimenting with proof batching as a workaround — aggregate many proofs at the application layer before recursive verification. It shifts the complexity but reduces per-proof cost.',
      'The limitations are temporary engineering constraints, not fundamental. Give it 12-18 months and recursive Noir proofs will be practical. The research is ahead of the tooling.',
    ],
  },
  {
    catSlug: 'defi-yields',
    title: 'Real-world asset tokenization yield comparison: Q1 2025',
    content: 'Comparing on-chain RWA yields: US T-Bill tokens (OUSG, USYC, TBILL) currently offer 4.8-5.2% APY. Tokenized private credit platforms (Centrifuge, Maple) offer 8-12% with substantially higher credit risk. This analysis covers the risk-adjusted comparison and liquidity considerations for each category.',
    replies: [
      'The credit risk on Maple private credit is real and has materialized — see the Orthogonal Trading default in 2022. Treat the headline yield as gross of expected default losses.',
      'For OUSG specifically — the KYC requirement and $100k minimum creates a selective market. The buyers are institutional and the secondary liquidity is thin. Not suitable for retail or smaller allocators.',
      'The on-chain T-Bill products are the most interesting development in DeFi in 2024. Risk-free rate on-chain finally makes cash management in DeFi treasuries rational rather than forced into riskier positions.',
      'Centrifuge pools have varying quality. The pool-level underwriting standards differ significantly. Blanket comparison of "private credit" hides huge dispersion in actual risk profiles.',
      'The liquidity consideration you raise is critical. In stress scenarios, the redemption queues on some of these products can be weeks. That is fine for strategic allocations but deadly for liquidity management.',
    ],
  },
  {
    catSlug: 'general',
    title: 'Whale wallet clustering methodology: how we identify coordinated accumulation',
    content: 'Entity resolution on public blockchain data requires combining multiple heuristics: common input ownership, timing correlation, fee-payment relationships, and interaction graph analysis. This post describes our methodology for identifying wallet clusters that represent a single economic actor, with precision/recall benchmarks against known labeled datasets.',
    replies: [
      'The common-input-ownership heuristic is well-established for UTXO chains. For account-model chains (EVM) the equivalent is looking at shared nonce managers and factory contract relationships.',
      'Timing correlation is underutilized. Transactions from the same actor across different wallets tend to cluster temporally because they originate from the same infrastructure. The inter-arrival time distribution is a strong signal.',
      'What is your false positive rate on the precision/recall benchmark? In our experience, sophisticated actors specifically game the heuristics — timing randomization, chain mixing between wallet uses.',
      'The legal implication of entity resolution matters here. Publishing a cluster that incorrectly links two independent actors has real consequences. How do you handle uncertainty in the output?',
      'The fee payment relationship heuristic is extremely powerful. If wallet A consistently pays gas for wallet B, the probability they are co-owned is >95% in our analysis.',
    ],
  },
];

// ─── GET Handler ──────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const results: Record<string, number> = {
      categories: 0, users: 0, topics: 0, posts: 0,
    };

    // 1. Upsert categories
    for (const cat of CATEGORIES) {
      await (prisma as any).forumCategory.upsert({
        where:  { slug: cat.slug },
        update: cat,
        create: cat,
      });
      results.categories++;
    }

    // 2. Load categories map
    const categories = await (prisma as any).forumCategory.findMany();
    const catMap: Record<string, string> = {};
    for (const c of categories) catMap[c.slug] = c.id;

    // 3. Upsert 50 users with deterministic wallets
    const users: any[] = [];
    for (let i = 0; i < 50; i++) {
      const hex   = i.toString(16).padStart(4, '0');
      const addr  = `0x${hex}SEED${hex}FEED${hex}CAFE${hex}DEAD${hex}BEEF${hex}0000`.slice(0, 42);
      const name  = NAMES[i] || `Node_${i}`;
      const isPro = i < 10;
      const tier  = i < 5 ? 'ELITE' : i < 15 ? 'PRO' : i < 30 ? 'STANDARD' : 'FREE';

      // Stagger createdAt over the past 12 months
      const monthsAgo = Math.floor(i * 0.25);
      const createdAt = new Date();
      createdAt.setMonth(createdAt.getMonth() - monthsAgo);
      createdAt.setDate(1 + (i % 28));

      const user = await (prisma as any).user.upsert({
        where:  { walletAddress: addr },
        update: { displayName: name, isPro, tier },
        create: {
          walletAddress: addr,
          displayName:   name,
          isPro,
          tier,
          createdAt,
          lastActive: new Date(),
        },
      });
      users.push(user);
      results.users++;
    }

    // 4. Create topics + replies
    let userIdx = 0;
    const nextUser = () => { const u = users[userIdx % users.length]; userIdx++; return u; };

    for (const tc of TOPICS_CORPUS) {
      const catId   = catMap[tc.catSlug];
      if (!catId) continue;
      const author  = nextUser();

      // Stagger topic timestamps over past 60 days
      const topicDate = new Date();
      topicDate.setDate(topicDate.getDate() - (TOPICS_CORPUS.indexOf(tc) * 6));

      const topic = await (prisma as any).forumTopic.create({
        data: {
          title:      tc.title,
          content:    tc.content,
          categoryId: catId,
          authorId:   author.id,
          status:     'PUBLISHED',
          views:      Math.floor(Math.random() * 800) + 50,
          createdAt:  topicDate,
          updatedAt:  topicDate,
        },
      });
      results.topics++;

      // Create replies with staggered timestamps
      for (let ri = 0; ri < tc.replies.length; ri++) {
        const replyAuthor = nextUser();
        const replyDate   = new Date(topicDate);
        replyDate.setHours(replyDate.getHours() + (ri + 1) * 2);

        await (prisma as any).forumPost.create({
          data: {
            content:   tc.replies[ri],
            topicId:   topic.id,
            authorId:  replyAuthor.id,
            status:    'PUBLISHED',
            createdAt: replyDate,
            updatedAt: replyDate,
          },
        });
        results.posts++;

        // Update topic updatedAt to latest reply
        await (prisma as any).forumTopic.update({
          where: { id: topic.id },
          data:  { updatedAt: replyDate },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Forum seeded with 50 institutional nodes and live discourse.',
      results,
    });

  } catch (e: any) {
    console.error('[Seed Forum]', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
