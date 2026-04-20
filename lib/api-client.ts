import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ============================================================================
// SOVEREIGN ENDPOINT REGISTRY
// ============================================================================
// The user will inject the production on-chain endpoints here in the next step.
export const REGISTRY = {
  MARKET_DATA: {
    watchlist:      "/api/tbd-watchlist",
    gainersLosers:  "/api/tbd-gainers",
    newPairs:       "/api/tbd-new-pairs",
    polymarket:     "/api/tbd-polymarket",
  },
  SOVEREIGN_INTEL: {
    massTransfers:  "/api/tbd-mass-transfers",
    entityMap:      "/api/tbd-entity-map",
    smartSignals:   "/api/tbd-smart-signals",
    eventLedger:    "/api/tbd-event-ledger",
    cosmicForge:    "/api/tbd-cosmic-forge",
  },
  VAULT_DATA: {
    portfolio:      "/api/tbd-portfolio",
    whaleWallets:   "/api/tbd-whale-wallets",
    coldStorage:    "/api/tbd-cold-storage",
    zkShield:       "/api/tbd-zk-shield",
  },
  OMNI_INFRA: {
    blockExplorer:  "/api/tbd-block-explorer",
    brc20:          "/api/tbd-brc-20",
    sessionLogs:    "/api/tbd-session-logs",
    news:           "/api/tbd-news",
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

  const res = await fetch(url, { headers });
  
  if (!res.ok) {
    throw new Error(`Sovereign API Error: ${res.status}`);
  }
  
  return res.json();
};

// ============================================================================
// UNIVERSAL HOOKS
// ============================================================================

export function useMarketData(endpointKey: keyof typeof REGISTRY.MARKET_DATA) {
  return useQuery({
    queryKey: ['market', endpointKey],
    queryFn: () => fetchSovereign(REGISTRY.MARKET_DATA[endpointKey], false),
    refetchInterval: 10000, 
  });
}

// Highly secured intelligence fetches
export function useSovereignIntel(endpointKey: keyof typeof REGISTRY.SOVEREIGN_INTEL) {
  return useQuery({
    queryKey: ['intel', endpointKey],
    queryFn: () => fetchSovereign(REGISTRY.SOVEREIGN_INTEL[endpointKey], true),
    refetchInterval: 15000,
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
  });
}
