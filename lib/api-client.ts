import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// SOVEREIGN ENDPOINT REGISTRY
// ============================================================================
// The user will inject the production on-chain endpoints here in the next step.
export const REGISTRY = {
  MARKET_DATA: {
    watchlist:      "/api/premium/watched-wallets",
    gainersLosers:  "/api/markets/stream", // Map directly to the central market stream provider
    newPairs:       "/api/market/new-pairs",
    polymarket:     "/api/polymarket/orders",
  },
  SOVEREIGN_INTEL: {
    massTransfers:  "/api/intelligence/mass-transfers", // mapped interceptor
    entityMap:      "/api/network/evm/recent", 
    smartSignals:   "/api/whale-stream",
    eventLedger:    "/api/network/mempool/recent",
    cosmicForge:    "/api/forge/status",
  },
  VAULT_DATA: {
    portfolio:      "/api/wallet/portfolio",
    whaleWallets:   "/api/premium/watched-wallets",
    coldStorage:    "/api/wallet/onchain-balances",
    zkShield:       "/api/network/forensics",
  },
  OMNI_INFRA: {
    blockExplorer:  "/api/network/evm/recent",
    brc20:          "/api/network/mempool/recent",
    sessionLogs:    "/api/session-logs",
    news:           "/api/news",
  }
};

// ============================================================================
// BASE FETCHER WITH TITANIUM SECURITY HEADERS
// ============================================================================
const fetchSovereign = async (url: string, requiresAuth: boolean = false) => {
  if (!url || url.includes('tbd-')) {
     // Suspend fetching intentionally until endpoints are provided by the user
     return new Promise(() => {}); // Infinite suspense / loading state
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    // Generate the Titanium HMAC signature (Placeholder integration point)
    const timestamp = Date.now().toString();
    headers['X-Forge-Timestamp'] = timestamp;
    headers['X-Forge-Signature'] = 'EXPECTING_INJECTION'; 
  }

  // Rewrite /api/intelligence/mass-transfers internally if we haven't built the exact route yet,
  // pointing directly to the evm/recent scanner engine for immediate functionality:
  const fetchUrl = url === '/api/intelligence/mass-transfers' ? '/api/network/evm/recent' : url;

  const res = await fetch(fetchUrl, { headers });
  
  if (!res.ok) {
    throw new Error(`Sovereign API Error: ${res.status}`);
  }
  
  let data = await res.json();
  
  // HOTFIX ADAPTER: If fetching mass-transfers, map the EVM scanner data directly to the WhaleEvent schema expected by MassTransferIntel and LiveTransactions components
  if (url === '/api/intelligence/mass-transfers') {
     const getTier = (usd: number) => {
       if (usd >= 100_000_000) return 'ULTRA_CAPITAL_FLOW';
       if (usd >= 50_000_000)  return 'PRINCIPAL_BLOCK';
       if (usd >= 10_000_000)  return 'ENTERPRISE_TRANSFER';
       if (usd >= 5_000_000)   return 'LIQUIDITY_NODE';
       if (usd >= 1_000_000)   return 'STANDARD_FLOW';
       if (usd >= 500_000)     return 'RETAIL_PRO';
       return 'MICRO_TRANSFER';
     }
     const mappedEvents = (Array.isArray(data) ? data : []).map((tx: any) => ({
        hash: tx.hash || tx.id,
        wallet: tx.from || 'Unknown', // Backwards compatibility for other components
        from: tx.from || 'Unknown',
        to: tx.to || 'Unknown',
        action: tx.type || 'TRANSFER',
        token: tx.asset || 'ETH',
        amount: tx.amount || 0,
        usdValue: tx.usdValue || 0,
        tier: getTier(tx.usdValue || 0),
        chain: (tx.chain || 'ETH').substring(0, 3),
        dex: tx.method || null, // Keep for backward compat
        method: tx.method || 'Native Transfer',
        gasPriceGwei: tx.gasPriceGwei || '0',
        confirmations: tx.confirmations || 0,
        status: tx.status || 'CONFIRMED',
        timestamp: new Date(tx.timestamp || Date.now()).toISOString(),
     }));
     // Both MassTransferIntel (rawData?.events) and LiveTransactions (rawData?.transfers)
     // receive the same data under both keys for compatibility:
     data = { events: mappedEvents, transfers: mappedEvents };
  }

  return data;
};

// ============================================================================
// UNIVERSAL HOOKS
// ============================================================================

export function useMarketData(endpointKey: keyof typeof REGISTRY.MARKET_DATA) {
  return useQuery({
    queryKey: ['market', endpointKey],
    // Force auth for watchlist since it's sharing the vault endpoint
    queryFn: () => fetchSovereign(REGISTRY.MARKET_DATA[endpointKey], endpointKey === 'watchlist'),
    refetchInterval: 60000, 
  });
}

// Highly secured intelligence fetches
export function useSovereignIntel(endpointKey: keyof typeof REGISTRY.SOVEREIGN_INTEL) {
  return useQuery({
    queryKey: ['intel', endpointKey],
    queryFn: () => fetchSovereign(REGISTRY.SOVEREIGN_INTEL[endpointKey], true),
    refetchInterval: 60000,
  });
}

// Authenticated vault data for connected wallets
export function useVaultData(endpointKey: keyof typeof REGISTRY.VAULT_DATA) {
  return useQuery({
    queryKey: ['vault', endpointKey],
    queryFn: () => fetchSovereign(REGISTRY.VAULT_DATA[endpointKey], true),
  });
}

export function useOmniInfrastructure(endpointKey: keyof typeof REGISTRY.OMNI_INFRA) {
  return useQuery({
    queryKey: ['infra', endpointKey],
    queryFn: () => fetchSovereign(REGISTRY.OMNI_INFRA[endpointKey], false),
    refetchInterval: endpointKey === 'sessionLogs' ? 10000 : 120000,
  });
}
