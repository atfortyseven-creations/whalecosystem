import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { getRealTimePrice } from "../../lib/priceHelper";
import { addWhaleToQueue } from "../../lib/queues/whaleQueue";
import { baseResilientProvider, ethereumResilientProvider, bscResilientProvider, ResilientProvider } from "../../lib/blockchain/ResilientProvider";

dotenv.config();

const WHALE_THRESHOLD_USD = Number(process.env.WHALE_THRESHOLD_USD) || 50000;
const prisma = new PrismaClient();

const TOKEN_CONFIG: Record<string, { symbol: string, decimals: number }> = {
  // --- BASE ---
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": { symbol: "USDC", decimals: 6 },
  "0x4200000000000000000000000000000000000006": { symbol: "WETH", decimals: 18 },
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": { symbol: "DAI", decimals: 18 },
  // --- BSC ---
  "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": { symbol: "WBNB", decimals: 18 },
  "0x55d398326f99059ff775485246999027b3197955": { symbol: "USDT", decimals: 18 },
  // --- ETHEREUM ---
  "0xdac17f958d2ee523a2206206994597c13d831ec7": { symbol: "USDT", decimals: 6 },
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": { symbol: "USDC", decimals: 6 },
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": { symbol: "WETH", decimals: 18 },
};

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

export async function startEvmWorker(resilient: ResilientProvider, chainLabel: string) {
  console.log(`📡 [${chainLabel} Hub] Activating Standalone EVM Stream...`);
  const ws = resilient.getWsProvider();
  
  if (!ws) {
      console.warn(`⚠️ [${chainLabel}] No WebSocket. Using Polling.`);
      return startPollingWorker(resilient, chainLabel);
  }

  ws.on("block", async (blockNumber) => {
    try {
        const block = await resilient.call<any>(p => p.getBlock(blockNumber, true));
        if (!block || !block.prefetchedTransactions) return;
        const ethPrice = await getRealTimePrice("ETH") || 3300;

        for (const tx of block.prefetchedTransactions) {
            const valueEth = parseFloat(ethers.formatEther(tx.value));
            const usdValue = valueEth * ethPrice;
            if (usdValue >= WHALE_THRESHOLD_USD) {
                await processWhaleTx(tx.hash, tx.from, tx.to || "Contract", "ETH", valueEth, usdValue, blockNumber, chainLabel, { method: "Native" });
            }
        }
    } catch (e: any) {}
  });

  const filter = { topics: [TRANSFER_TOPIC] };
  ws.on(filter, async (log) => {
    try {
        const config = TOKEN_CONFIG[log.address.toLowerCase()];
        if (!config) return;
        const price = await getRealTimePrice(config.symbol) || 1;
        const parsedLog = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data);
        const tokenAmount = parseFloat(ethers.formatUnits(parsedLog[0], config.decimals));
        const usdValue = tokenAmount * price;

        if (usdValue >= WHALE_THRESHOLD_USD) {
            const from = (ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[1])[0] as string);
            const to = (ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[2])[0] as string);
            await processWhaleTx(log.transactionHash, from, to, config.symbol, tokenAmount, usdValue, log.blockNumber, chainLabel, { method: "ERC20" });
        }
    } catch (e) {}
  });
}

async function startPollingWorker(resilient: ResilientProvider, chainLabel: string) {
    let lastProcessedBlock = await resilient.call<number>(p => p.getBlockNumber());
    while (true) {
        try {
            const currentBlock = await resilient.call<number>(p => p.getBlockNumber());
            if (currentBlock > lastProcessedBlock) {
                const logs = await resilient.call<any[]>(p => p.getLogs({
                    fromBlock: lastProcessedBlock + 1,
                    toBlock: currentBlock,
                    topics: [TRANSFER_TOPIC]
                }));
                for (const log of logs) {
                    const config = TOKEN_CONFIG[log.address.toLowerCase()];
                    if (config) {
                        const price = await getRealTimePrice(config.symbol) || 1;
                        const tokenAmount = parseFloat(ethers.formatUnits(ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], log.data)[0], config.decimals));
                        if (tokenAmount * price >= WHALE_THRESHOLD_USD) {
                            let fromAddr = "Unknown";
                            let toAddr = "Unknown";
                            try {
                                if (log.topics && log.topics.length >= 3) {
                                    fromAddr = (ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[1])[0] as string);
                                    toAddr = (ethers.AbiCoder.defaultAbiCoder().decode(["address"], log.topics[2])[0] as string);
                                }
                            } catch (e) {
                                // Fallback only if totally unparseable, but do not emit 0x...
                            }
                            await processWhaleTx(log.transactionHash, fromAddr, toAddr, config.symbol, tokenAmount, tokenAmount * price, log.blockNumber, chainLabel, { method: "Polling" });
                        }
                    }
                }
                lastProcessedBlock = currentBlock;
            }
            await new Promise(r => setTimeout(r, 12000));
        } catch (e) {
            await new Promise(r => setTimeout(r, 30000));
        }
    }
}

async function processWhaleTx(hash: string, from: string, to: string, asset: string, amount: number, usdValue: number, blockNumber: number, chain: string, metadata: any) {
    const exists = await prisma.whaleActivity.findUnique({ where: { transactionHash: hash } });
    if (exists) return;

    console.log(`🌊 [${chain}] Standalone WHALE: $${usdValue.toLocaleString()} USD`);

    await prisma.whaleActivity.create({
        data: {
            walletAddress: from,
            type: metadata.method || "TRANSFER",
            token: asset,
            amount,
            usdValue,
            fromAddress: from,
            toAddress: to,
            transactionHash: hash,
            blockNumber: BigInt(blockNumber),
            chain,
            metadata,
            timestamp: new Date(),
        }
    }).catch(e => {
        console.error(`❌ [${chain}] Error persisting whale activity in DB:`, e.message);
    });

    await addWhaleToQueue({ hash, from, to, asset, amount, usdValue, blockNumber: blockNumber.toString(), chain, type: metadata.method, metadata }).catch(e => {
        console.error(`❌ [${chain}] Error adding whale to Redis queue:`, e.message);
    });
}
