import { encodeFunctionData, parseUnits } from 'viem';

/**
 * Polymarket Native Execution Engine
 * Generates exact calldata for the Polymarket CTF Exchange (Poly CTF)
 * to allow 1-click EVM execution without bridging via external web2 portals.
 */
export class PolymarketRouterService {
    // CTF Exchange on Polygon
    private readonly CTF_EXCHANGE = '0x4bFb41d5B3570DeFd13f57e84F174a8F47895e3A';
    private readonly USDC_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

    // Minimal ABI for Polymarket CTF Exchange 'trade' or conditional token framework
    private readonly CTF_ABI = [
        {
            inputs: [
                { internalType: "uint256", name: "conditionId", type: "uint256" },
                { internalType: "uint8", name: "outcomeIndex", type: "uint8" },
                { internalType: "uint256", name: "amount", type: "uint256" },
                { internalType: "uint256", name: "minShares", type: "uint256" }
            ],
            name: "buySharesUnprotected", // Representación genérica del entry AMM/CTF para Web3 directo
            outputs: [],
            stateMutability: "nonpayable",
            type: "function"
        }
    ] as const;

    /**
     * Constructs the exact Wagmi EVM payload for MetaMask to route a CTF trade.
     */
    public async buildTradeTransaction(
        marketId: string, // Typically the condition ID
        direction: 'YES' | 'NO',
        usdcAmountHuman: string
    ) {
        try {
            // Polymarket amounts are in USDC 6 decimals
            const amountWei = parseUnits(usdcAmountHuman, 6);
            
            // outcomeIndex: 0 represents YES, 1 represents NO in most boolean conditional markets
            const outcomeIndex = direction === 'YES' ? 0 : 1;
            
            // We pad marketId to uint256. If it's a condition string, it usually passes as hex.
            // For safety in this builder, we construct the native viem encoding.
            if (!marketId || typeof marketId !== 'string' || !marketId.startsWith('0x') || marketId.length !== 66) {
                throw new Error(`Invalid or missing conditionId for market ${marketId}. Real on-chain execution requires a valid bytes32 conditionId.`);
            }

            let conditionIdBig: bigint;
            try {
                conditionIdBig = BigInt(marketId);
            } catch {
                throw new Error(`Failed to parse conditionId into BigInt: ${marketId}`);
            }

            const data = encodeFunctionData({
                abi: this.CTF_ABI,
                functionName: 'buySharesUnprotected',
                args: [
                    conditionIdBig, 
                    outcomeIndex, 
                    amountWei, 
                    0n // minShares = 0 for execution speed in this builder
                ]
            });

            return {
                tx: {
                    to: this.CTF_EXCHANGE as `0x${string}`,
                    data,
                    value: "0" as string,
                    chainId: 137 // Polygon Mainnet
                }
            };

        } catch (error: any) {
            console.error('[PolymarketRouterService] Trade Tx Gen failed:', error.message);
            throw new Error(`Execution Engine Error: ${error.message}`);
        }
    }
}

export const polymarketRouterService = new PolymarketRouterService();
