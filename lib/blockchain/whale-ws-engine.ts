/**
 * GetBlock WebSocket Whale Engine — EP2
 * Subscribes to all on-chain ERC-20 Transfer events above $WHALE_THRESHOLD_USD
 * Feeds the WhalePortfolio leaderboard and the live whale alert feed.
 * Uses: wss://go.getblock.io/95cb42a5aa444537a068031ce279d343
 */

import WebSocket from 'ws';

const WS_URL = process.env.GETBLOCK_ETH_WS_2 || process.env.GETBLOCK_ETH_WS;
const WHALE_USD_THRESHOLD = parseInt(process.env.WHALE_THRESHOLD_USD || '50000', 10);

// ERC-20 Transfer event topic
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

// Known high-value ERC-20 tokens with USD price approximations
const TOKEN_REGISTRY: Record<string, { symbol: string; decimals: number; approxUsdPerToken: number }> = {
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC',  decimals: 6,  approxUsdPerToken: 1        },
    '0xdac17f958d2ee523a2206206994597c13d831ec7': { symbol: 'USDT',  decimals: 6,  approxUsdPerToken: 1        },
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { symbol: 'WETH',  decimals: 18, approxUsdPerToken: 2200     },
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { symbol: 'WBTC',  decimals: 8,  approxUsdPerToken: 68000    },
    '0x6b175474e89094c44da98b954eedeac495271d0f': { symbol: 'DAI',   decimals: 18, approxUsdPerToken: 1        },
    '0x514910771af9ca656af840dff83e8264ecf986ca': { symbol: 'LINK',  decimals: 18, approxUsdPerToken: 14       },
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': { symbol: 'UNI',   decimals: 18, approxUsdPerToken: 8        },
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': { symbol: 'AAVE',  decimals: 18, approxUsdPerToken: 95       },
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': { symbol: 'MKR',   decimals: 18, approxUsdPerToken: 1800     },
};

export interface WhaleEvent {
    txHash:     string;
    blockNumber: number;
    token:      string;
    symbol:     string;
    from:       string;
    to:         string;
    amount:     number;
    usdValue:   number;
    timestamp:  number;
}

type WhaleListener = (event: WhaleEvent) => void;

/** Singleton WebSocket whale monitor */
class WhaleWebSocketEngine {
    private ws:          WebSocket | null = null;
    private listeners:   Set<WhaleListener> = new Set();
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private subId:       string | null = null;

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) return;
        if (!WS_URL) {
            console.warn('[WhaleEngine] GETBLOCK_ETH_WS_2 is not set. Real-time stream disabled.');
            return;
        }

        this.ws = new WebSocket(WS_URL);

        this.ws.on('open', () => {
            console.info('[WhaleEngine] GetBlock WS connected (EP2)');
            // Subscribe to ALL Transfer logs — we filter by USD value in handler
            this.ws!.send(JSON.stringify({
                jsonrpc: '2.0', id: 1,
                method:  'eth_subscribe',
                params:  ['logs', { topics: [TRANSFER_TOPIC] }],
            }));
        });

        this.ws.on('message', (raw: Buffer) => {
            try {
                const msg = JSON.parse(raw.toString());

                // Capture subscription ID
                if (msg.id === 1 && msg.result) {
                    this.subId = msg.result;
                    return;
                }

                // Process incoming log
                if (msg.method === 'eth_subscription' && msg.params?.result) {
                    this.handleLog(msg.params.result);
                }
            } catch { /* ignore parse errors */ }
        });

        this.ws.on('close', () => {
            console.warn('[WhaleEngine] WS disconnected — reconnecting in 5s');
            this.scheduleReconnect();
        });

        this.ws.on('error', (err) => {
            console.error('[WhaleEngine] WS error:', err.message);
        });
    }

    private handleLog(log: any) {
        const contractAddr = (log.address || '').toLowerCase();
        const tokenInfo = TOKEN_REGISTRY[contractAddr];
        if (!tokenInfo) return; // Only track known high-value tokens

        const topics = log.topics || [];
        if (topics.length < 3) return;

        // Decode from / to from topics (addresses are padded to 32 bytes)
        const from   = '0x' + topics[1].slice(26);
        const to     = '0x' + topics[2].slice(26);
        const rawAmt = log.data && log.data !== '0x' ? BigInt(log.data) : BigInt(0);
        const amount = Number(rawAmt) / Math.pow(10, tokenInfo.decimals);
        const usdValue = amount * tokenInfo.approxUsdPerToken;

        if (usdValue < WHALE_USD_THRESHOLD) return; // Below threshold

        const event: WhaleEvent = {
            txHash:      log.transactionHash,
            blockNumber: parseInt(log.blockNumber, 16),
            token:       contractAddr,
            symbol:      tokenInfo.symbol,
            from,
            to,
            amount,
            usdValue,
            timestamp:   Date.now(),
        };

        // Broadcast to all registered listeners
        this.listeners.forEach(fn => fn(event));
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    }

    subscribe(fn: WhaleListener) {
        this.listeners.add(fn);
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.connect();
        }
        return () => this.listeners.delete(fn);
    }

    disconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.ws?.close();
        this.ws = null;
    }
}

export const whaleEngine = new WhaleWebSocketEngine();
