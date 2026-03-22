import { NextRequest, NextResponse } from 'next/server';
import { getLegendaryStats } from '@/lib/stats-engine';
import { prisma } from '@/lib/prisma';
import { moralisService } from '@/lib/blockchain/MoralisService';
import { alchemyMonitor } from '@/lib/blockchain/AlchemyMonitor';
import { safeRedisGet, safeRedisSet } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    // 🔥 REGISTER user's address in real-time mempool monitor
    // This replaces the old hardcoded Vitalik address — now follows the actual user
    alchemyMonitor.watchAddress(address);

    // Call the stats engine server-side (where API keys exist)
    const stats = await getLegendaryStats(address);

    let transactions: any[] = [];
    let totalTxCount = 0;
    try {
        const [ethHist, baseHist, opHist] = await Promise.allSettled([
           moralisService.getWalletHistory(address, 'eth', 100),
           moralisService.getWalletHistory(address, 'base', 50),
           moralisService.getWalletHistory(address, 'optimism', 50),
        ]);

        const ethTxs = ethHist.status === 'fulfilled' && ethHist.value?.result ? ethHist.value.result : [];
        const baseTxs = baseHist.status === 'fulfilled' && baseHist.value?.result ? baseHist.value.result : [];
        const opTxs = opHist.status === 'fulfilled' && opHist.value?.result ? opHist.value.result : [];

        // Calculate total across chains
        totalTxCount =
            (ethHist.status === 'fulfilled' ? (ethHist.value?.total || ethTxs.length) : 0) +
            (baseHist.status === 'fulfilled' ? (baseHist.value?.total || baseTxs.length) : 0) +
            (opHist.status === 'fulfilled' ? (opHist.value?.total || opTxs.length) : 0);

        transactions = [...ethTxs, ...baseTxs, ...opTxs]
            .sort((a, b) => new Date(b.block_timestamp || 0).getTime() - new Date(a.block_timestamp || 0).getTime())
            .slice(0, 100)
            .map((tx: any) => {
                 let type = 'TRANSFER';
                 if (tx.receipt_contract_address) type = 'CONTRACT_CREATION';
                 else if (tx.input && tx.input !== '0x') {
                    const selector = tx.input.substring(0, 10).toLowerCase();
                    if (['0x7ff36ab5', '0x38ed1739', '0x8803dbee'].includes(selector)) type = 'SWAP';
                    else if (['0xa9059cbb'].includes(selector)) type = 'ERC20_TRANSFER';
                    else if (['0x095ea7b3'].includes(selector)) type = 'APPROVE';
                    else type = 'CONTRACT_CALL';
                 }

                 return {
                    hash: tx.hash || '0x0',
                    method: tx.summary ? tx.summary.split(' ')[0].substring(0, 15) : 'Tx',
                    type,
                    direction: tx.from_address?.toLowerCase() === address.toLowerCase() ? 'OUT' : 'IN',
                    from: tx.from_address || '',
                    to: tx.to_address || '',
                    value: tx.value ? (Number(tx.value) / 1e18).toString() : '0',
                    gasPrice: tx.gas_price ? (Number(tx.gas_price) / 1e9).toFixed(2) : '0',
                    gasUsed: tx.receipt_gas_used || '0',
                    nonce: tx.nonce || '0',
                    blockNumber: tx.block_number || '0',
                    inputData: (tx.input && tx.input.length > 30) ? tx.input.substring(0, 30) + '...' : tx.input,
                    status: tx.receipt_status === '1' ? 'SUCCESS' : tx.receipt_status === '0' ? 'FAILED' : 'CONFIRMED',
                    timestamp: tx.block_timestamp
                 };
            });
    } catch (e) {
        console.warn('[API] History fetch error', e);
    }
    
    if (stats) {
        stats.transactions = transactions;
        stats.totalTransactions = totalTxCount > 0 ? totalTxCount : stats.txCount;
    }

    if (stats && stats.totalValue > 0) {
      // ─── Phase 1: Redis-Throttled Persistence ─────────────────────
      // Only upsert user and save snapshot once every 12 hours per address
      const throttleKey = `throttle:portfolio_db:${address.toLowerCase()}`;
      const isThrottled = await safeRedisGet(throttleKey);

      if (!isThrottled) {
        // Create user if doesn't exist to maintain relation integrity
        await prisma.user.upsert({
          where: { walletAddress: address.toLowerCase() },
          update: { lastActive: new Date() },
          create: { walletAddress: address.toLowerCase() }
        });

        await prisma.portfolioSnapshot.create({
          data: {
            userId: address.toLowerCase(),
            totalUsd: stats.totalValue
          }
        });

        // Set throttle lock for 12 hours (43200 seconds)
        await safeRedisSet(throttleKey, '1', 'EX', 43200);
        console.log(`[API] 📸 Audited: Saved new portfolio snapshot for ${address}: $${stats.totalValue}`);
      } else {
        console.log(`[API] 🛡️ Persistence Throttled: Skipping redundant DB write for ${address}`);
      }
    }

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('[API] Portfolio stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio stats', details: error.message }, 
      { status: 500 }
    );
  }
}

