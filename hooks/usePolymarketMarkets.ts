import { useState, useEffect } from 'react';
import axios from 'axios';

export interface PolymarketMarket {
    condition_id: string;
    question: string;
    tokens: { token_id: string; outcome: string }[];
    market_slug: string;
    description: string;
}

const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com/events?active=true&closed=false&limit=10';

export function usePolymarketMarkets() {
    const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                // We use Gamma API to get high-level market data (titles, questions, and token IDs)
                const response = await axios.get(POLYMARKET_GAMMA_API);
                if (response.data && Array.isArray(response.data)) {
                    // Extracting the markets embedded within the events
                    const activeMarkets: PolymarketMarket[] = [];
                    for (const event of response.data) {
                        if (event.markets && Array.isArray(event.markets)) {
                            for (const market of event.markets) {
                                if (market.active && market.tokens && market.tokens.length >= 2) {
                                    activeMarkets.push({
                                        condition_id: market.conditionId,
                                        question: market.question || event.title,
                                        tokens: market.tokens,
                                        market_slug: market.slug || event.slug,
                                        description: market.description || event.description,
                                    });
                                }
                            }
                        }
                    }
                    
                    setMarkets(activeMarkets.slice(0, 10)); // Top 10 for terminal
                }
                setError(null);
            } catch (err: any) {
                console.error("Error fetching available markets:", err);
                if (err.response && err.response.status === 429) {
                    setError("Polymarket API Rate Limited. Retrying...");
                } else {
                    setError("Failed to load active markets from L1");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchMarkets();
        // Sync markets occasionally but avoid rate limits (every 60s)
        const interval = setInterval(fetchMarkets, 60000); 

        return () => clearInterval(interval);
    }, []);

    return { markets, isLoading, error };
}
