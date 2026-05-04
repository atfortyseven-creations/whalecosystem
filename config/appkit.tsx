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
// siweConfig imports removed — AppKit SIWE flow disabled in favour of custom EIP-191 signing

// 1. Get projectId — Falls back to real project ID so the app renders even without the env var.
// Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Railway for clean env separation.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    || process.env.NEXT_PUBLIC_WC_PROJECT_ID
    || 'bf1083a298e7222c838266166b12b2ba'; // Whale Alert Network production project
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
        default: { http: [process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ? `https://worldchain-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}` : "https://worldchain-mainnet.g.alchemy.com/public"] }
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

// CRITICAL: metadata.url MUST match EXACTLY the domain registered in WalletConnect/Reown Cloud.
//
// WalletConnect Cloud allowlist (project bf1083a298e7222c838266166b12b2ba) contains:
//   - humanidfi.com
//   - https://humanidfi.com
//   - www.humanidfi.com  (added 2026-05-05)
//
// WHY this is non-trivial:
//   createAppKit() is called at MODULE LEVEL. In Next.js SSR, window is undefined
//   so we cannot use window.location.origin. We need a build-time constant.
//   When the URL in metadata doesn't match what's registered in cloud.reown.com,
//   the WalletConnect relay silently rejects the session proposal — causing the
//   'Open' button in the wallet deep-link modal to tap but do NOTHING.
//
// Using https://humanidfi.com (no www) as canonical — it is the base allowlisted entry.
const CANONICAL_APP_URL = 'https://humanidfi.com';

// Runtime override: in local dev, use the actual origin so previews work.
// In production builds this constant is evaluated once at module load (SSR=server).
const APP_URL = (() => {
    // SSR path: window doesn't exist — return the canonical registered URL
    if (typeof window === 'undefined') return CANONICAL_APP_URL;
    const origin = window.location.origin;
    // Any humanidfi.com variant → normalise to the exact registered URL (no www)
    if (origin.includes('humanidfi.com')) return CANONICAL_APP_URL;
    // Railway preview or localhost: use the actual origin
    return origin;
})();

const metadata = {
    name: 'Whale Alert Network',
    description: 'Humanity Ledger — Sovereign Institutional Intelligence',
    // MUST match exactly the URL registered in https://cloud.reown.com
    url: APP_URL,
    // SVG icon — ultra-lightweight to prevent WalletConnect relay silent drops (>100KB causes drops)
    icons: [`${CANONICAL_APP_URL}/f_log.svg`],
}

// ── NOTE: siweConfig intentionally removed.
// The cryptographic signature flow is managed exclusively by:
//   - MobileLanding.tsx → establishSession() on mobile
//   - LinkedGate.tsx → SignContractStep on desktop
// Defining siweConfig here — even without passing it to createAppKit —
// was causing AppKit to fire its own internal SIWE modal simultaneously
// with our establishSession(), resulting in "Error signing message" on mobile.

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


