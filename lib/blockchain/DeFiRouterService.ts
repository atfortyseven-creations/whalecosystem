import { ChainId } from './BlockchainService';
import { getUsdcAddress } from '@/config/tokens';
import { parseUnits } from 'viem';

export interface RouteResponse {
    tx: {
        to: string;
        data: string;
        value: string;
        chainId: number;
    };
    gas: number;
    expectedOutput: string;
}

/**
 * Universal DeFi Router Service using Enso Finance Intent-Based API
 * Generates exact calldata to deposit the user's base asset (USDC or ETH)
 * into ANY major DeFi protocol vault listed on DeFiLlama.
 */
export class DeFiRouterService {
    private readonly ENSO_URL = 'https://api.enso.finance/api/v1/shortcuts/route';
    private readonly BEARER_ENSO = '1e02632d-6feb-4a75-a157-something'; // Enso public default or user's specific key

    /**
     * Map DeFiLlama chains to Chain IDs
     */
    public resolveChainId(chainName: string): number {
        const MAP: Record<string, number> = {
            'Ethereum': 1, 'Arbitrum': 42161, 'Base': 8453,
            'Optimism': 10, 'Polygon': 137, 'BSC': 56,
            'Avalanche': 43114, 'Fantom': 250
        };
        return MAP[chainName] || 1;
    }

    /**
     * Gets the deposit calldata (USDC -> Vault)
     * @param chainName Name of chain from DeFiLlama
     * @param vaultAddress The pool ID/contract from DeFiLlama
     * @param amountHuman Amount in human readable (e.g. "100")
     * @param userAddress The EVM address executing the intent
     */
    public async buildDepositTransaction(
        chainName: string,
        vaultAddress: string,
        amountHuman: string,
        userAddress: string
    ): Promise<RouteResponse> {
        try {
            const chainId = this.resolveChainId(chainName);

            // Intent fallback: default depositing USDC. 
            // Most DeFiLlama stable pools accept native chain USDC.
            const usdcAddress = getUsdcAddress(chainId as ChainId);
            
            // Format amount (USDC 6 decimals standard)
            const amountWei = parseUnits(amountHuman, 6).toString();

            const params = new URLSearchParams({
                chainId: chainId.toString(),
                fromAddress: userAddress,
                receiver: userAddress, // User receives vault receipt token
                spender: userAddress,
                tokenIn: (usdcAddress || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48') as string, // The user inputs USDC
                tokenOut: vaultAddress, // The output is the Vault Receipt Token (DeFiLlama's "pool")
                amountIn: amountWei,
                routingStrategy: 'router', 
                slippage: '300' // 3% max slippage for vault entering via dex swaps if needed
            });

            console.log(`[DeFiRouter] Building route via Enso: ${this.ENSO_URL}?${params.toString()}`);

            const response = await fetch(`${this.ENSO_URL}?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${this.BEARER_ENSO}`,
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Enso API Error: ${text}`);
            }

            const data = await response.json();
            
            return {
                tx: {
                    to: data.tx.to,
                    data: data.tx.data,
                    value: data.tx.value || "0",
                    chainId
                },
                gas: data.gas || 0,
                expectedOutput: data.amountOut || "0"
            };
            
        } catch (error: any) {
            console.error('[DeFiRouterService] Deposit Tx Gen failed:', error.message);
            throw new Error(`Execution Engine Error: ${error.message}`);
        }
    }
}

export const defiRouterService = new DeFiRouterService();
