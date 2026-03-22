import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { getRealTimePrice } from "../../lib/priceHelper";
import { addWhaleToQueue } from "../../lib/queues/whaleQueue";

dotenv.config();

const WHALE_THRESHOLD_USD = Number(process.env.WHALE_THRESHOLD_USD) || 50000;
const BTC_RPC_URL = process.env.BITCOIN_RPC_URL;
const prisma = new PrismaClient();

async function btcRpcCall(method: string, params: any[] = []) {
    const response = await fetch(BTC_RPC_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: "1.0", id: "btc-standalone", method, params })
    });
    const data = await response.json();
    return data.result;
}

export async function startBtcWorker() {
    let lastBlock = await btcRpcCall("getblockcount");
    console.log(`📡 [BTC Scanner] Connected. Height: ${lastBlock}`);

    while (true) {
        try {
            const currentBlock = await btcRpcCall("getblockcount");
            if (currentBlock > lastBlock) {
                 const blockHash = await btcRpcCall("getblockhash", [currentBlock]);
                 const block = await btcRpcCall("getblock", [blockHash, 2]); 
                 const btcPrice = await getRealTimePrice("BTC") || 98000;

                 for (const tx of block.tx) {
                     let totalOutputBtc = 0;
                     for (const vout of tx.vout) totalOutputBtc += vout.value;
                     const usdValue = totalOutputBtc * btcPrice;

                     if (usdValue >= WHALE_THRESHOLD_USD) {
                         await processWhaleTx(tx.txid, "Unknown", "Multiple Outputs", "BTC", totalOutputBtc, usdValue, currentBlock, 'BITCOIN', { method: "BTC" });
                     }
                 }
                 lastBlock = currentBlock;
            }
            await new Promise(r => setTimeout(r, 20000));
        } catch (e) {
            await new Promise(r => setTimeout(r, 60000));
        }
    }
}

async function processWhaleTx(hash: string, from: string, to: string, asset: string, amount: number, usdValue: number, blockNumber: number, chain: string, metadata: any) {
    const exists = await prisma.whaleActivity.findUnique({ where: { transactionHash: hash } });
    if (exists) return;
    await prisma.whaleActivity.create({
        data: { walletAddress: from, type: "BTC_TRANSFER", token: asset, amount, usdValue, fromAddress: from, toAddress: to, transactionHash: hash, blockNumber: BigInt(blockNumber), chain, metadata, timestamp: new Date() }
    }).catch(e => {});
    await addWhaleToQueue({ hash, from, to, asset, amount, usdValue, blockNumber: blockNumber.toString(), chain, type: "BTC", metadata }).catch(e => {});
}
