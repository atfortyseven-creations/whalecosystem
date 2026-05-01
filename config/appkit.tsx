"use client";

import { useTheme } from "next-themes";
import { CreateConnectorFn, WagmiProvider } from 'wagmi';
import { AppKitNetwork, mainnet, base, arbitrum, polygon, optimism, bsc } from "@reown/appkit/networks";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { cookieToInitialState, createStorage, cookieStorage } from 'wagmi';
import { createAppKit } from '@reown/appkit/react';
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask, injected, walletConnect, safe } from 'wagmi/connectors';
// @ts-ignore - Supress missing module error until user runs npm install
import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe';

// 1. Get projectId — Falls back to real project ID so the app renders even without the env var.
// Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Railway for clean env separation.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    || process.env.NEXT_PUBLIC_WC_PROJECT_ID
    || 'dd0819151fda02095518d0ffb20c64a0'; // Whale Alert Network production project
if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
    if (typeof window !== 'undefined') {
        console.warn('[WalletConnect] Using hardcoded project ID. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Railway for clean env separation.');
    }
}

// 2. Interstellar Node Override
const dedicatedBase = {
    ...base,
    rpcUrls: {
        ...base.rpcUrls,
        default: { http: [process.env.GETBLOCK_BASE_RPC || base.rpcUrls.default.http[0]] },
        public: { http: [process.env.GETBLOCK_BASE_RPC || base.rpcUrls.default.http[0]] }
    }
};

// Infura key — server-side only, never expose in client bundle
const infuraKey = process.env.INFURA_API_KEY ?? '';

const dedicatedMainnet = {
    ...mainnet,
    rpcUrls: {
        ...mainnet.rpcUrls,
        default: { http: [process.env.ETH_RPC_URL || 'https://go.getblock.us/81ed63d96d704589999ff99c9a1ff64b'] },
        public: { http: [process.env.ETH_RPC_URL || 'https://go.getblock.us/81ed63d96d704589999ff99c9a1ff64b'] }
    }
};

const dedicatedBsc = {
    ...bsc,
    rpcUrls: {
        ...bsc.rpcUrls,
        default: { http: [process.env.BNB_RPC_URL || 'https://go.getblock.us/8405bc34194e4343a10cdc7a76360793'] },
        public: { http: [process.env.BNB_RPC_URL || 'https://go.getblock.us/8405bc34194e4343a10cdc7a76360793'] }
    }
};

// 3. World Chain definition
const worldchain: AppKitNetwork = {
    id: 480,
    name: 'World Chain',
    caipNetworkId: 'eip155:480',
    chainNamespace: 'eip155',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: [`https://worldchain-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "YOUR_ALCHEMY_KEY"}`] }
    },
    blockExplorers: {
        default: { name: 'Worldscan', url: 'https://worldscan.org' }
    }
} as any;

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [dedicatedMainnet, dedicatedBsc, polygon, dedicatedBase, arbitrum, optimism, worldchain];

export const wagmiAdapter = new WagmiAdapter({
    ssr: true,
    // Explicit cookieStorage: guarantees wagmi state is available synchronously
    // on SSR and survives Android Chrome tab destruction after deep-link redirects.
    // Per Reown official docs (2025-2026), this must be set explicitly alongside ssr:true.
    // @ts-ignore: Wagmi v2 type mismatch between AppKit and Wagmi core
    storage: createStorage({ storage: cookieStorage as any }),
    projectId,
    networks,
})

export const config = wagmiAdapter.wagmiConfig

const queryClient = new QueryClient()

// CRITICAL: metadata.url MUST match a domain registered in WalletConnect/Reown Cloud.
// We must use window.location.origin EXACTLY. If the user is on humanidfi.com (no www),
// redirecting them to www.humanidfi.com breaks the WalletConnect connection because
// IndexedDB/localStorage pairing sessions are isolated per subdomain.
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://humanidfi.com';

const metadata = {
    name: 'Whale Alert Network',
    description: 'Humanity Ledger — Sovereign Institutional Intelligence',
    // CRITICAL: Must be hardcoded without trailing slash AND must match the domain
    // registered in WalletConnect/Reown Cloud. Using window.location.origin was
    // causing mismatches when users landed on subpaths (/sync, /connect, etc.).
    url: 'https://humanidfi.com',
    // Real icon URL (min 512x512) — empty array caused Rainbow "Connection failed"
    // on some relay nodes. A valid icon prevents relay timeout on mobile handshake.
    icons: ['https://humanidfi.com/icon.png'],
}

// ── 1-Click Auth: SIWE Configuration
const siweConfig = createSIWEConfig({
  getMessageParams: async () => ({
    domain: typeof window !== 'undefined' ? window.location.host : 'humanidfi.com',
    uri: typeof window !== 'undefined' ? window.location.origin : APP_URL,
    chains: networks.map(n => n.id) as number[],
    statement: 'Authenticate into the Whale Alert Sovereign Network. This request will not trigger a blockchain transaction or cost any gas fees.'
  }),
  createMessage: ({ address, ...args }: any) => formatMessage(args, address),
  getNonce: async () => {
    const res = await fetch('/api/siwe/nonce', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to get nonce');
    return res.text();
  },
  getSession: async () => {
    try {
        const res = await fetch('/api/siwe/session');
        if (!res.ok) throw new Error('Failed to get session');
        const data = await res.json();
        return data && data.address && data.chainId ? { address: data.address, chainId: data.chainId } : null;
    } catch {
        return null;
    }
  },
  verifyMessage: async ({ message, signature }: { message: string, signature: string }) => {
    try {
      const res = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature })
      });
      return res.ok;
    } catch {
      return false;
    }
  },
  signOut: async () => {
    try {
      await fetch('/api/siwe/logout');
      return true;
    } catch {
      return false;
    }
  }
});

// ── CRITICAL: createAppKit must be called at module level (not inside window check).
// Reown AppKit hooks (useAppKit, useAppKitAccount, etc.) are used during SSR in
// Next.js server components. The hooks throw "Please call createAppKit before
// using useAppKit hook" when this function hasn't been called before the hook runs.
// Solution: Call createAppKit unconditionally at module import time with a singleton
// guard. The WagmiAdapter's ssr:true handles the server-side hydration safely.
let appKitInitialized = false;

try {
    if (!appKitInitialized) {
        appKitInitialized = true;
        createAppKit({
            adapters: [wagmiAdapter],
            networks,
            projectId,
            metadata,
            // siweConfig disabled to prevent OS passcode crashes on mobile wallets during 1-click auth
            // ── allowUnsupportedChain: prevents AppKit from auto-triggering the
            // "Switch Network" modal when the user's wallet is on a network not
            // in our list. Network switching is handled exclusively in Portfolio.
            allowUnsupportedChain: true,
            features: {
                analytics: true,
                email: false,
                socials: [],
                emailShowWallets: false,
                swaps: false,
                onramp: false,
            },
            themeMode: 'dark',
            themeVariables: {
                '--w3m-accent': '#ffffff',
                '--w3m-color-mix': '#050505',
                '--w3m-border-radius-master': '2rem',
                '--w3m-font-family': 'FT Regola Neue, Inter, sans-serif',
                '--w3m-z-index': 9999,
            },
            enableInjected: true,
            enableEIP6963: true,
            enableWalletConnect: true,
            enableCoinbase: true,
            allWallets: 'SHOW',
            customWallets: []
        });
    }
} catch (e) {
    console.warn('[AppKit] Initialization skipped (already initialized):', e);
}

export function Web3ModalProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    // initialState: parse the wagmi cookie so the WagmiProvider can hydrate
    // synchronously on the server. Without this, wagmi starts in an empty state
    // on every page load and has to reconnect async from IndexedDB (1-3s delay).
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies);
    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as any} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}


