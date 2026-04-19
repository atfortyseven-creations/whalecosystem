"use client";

import { useTheme } from "next-themes";
import { CreateConnectorFn, WagmiProvider, cookieToInitialState } from 'wagmi';
import { AppKitNetwork, mainnet, base, arbitrum, polygon, optimism } from "@reown/appkit/networks";
import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// 1. Get projectId — Falls back to real project ID so the app renders even without the env var.
// Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in Railway for clean env separation.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    || process.env.NEXT_PUBLIC_WC_PROJECT_ID
    || '093232b25784a0694c642ad54a6331fa'; // Whale Alert Network production project
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
        default: { http: ['https://go.getblock.us/d9f5f9207ac44e5d9faf8d3017ca9fff'] },
        public: { http: ['https://go.getblock.us/d9f5f9207ac44e5d9faf8d3017ca9fff'] }
    }
};

import { bsc } from "@reown/appkit/networks";
const dedicatedBsc = {
    ...bsc,
    rpcUrls: {
        ...bsc.rpcUrls,
        default: { http: ['https://go.getblock.us/3cdeadc7f4174c23b37daee85bc0d517'] },
        public: { http: ['https://go.getblock.us/3cdeadc7f4174c23b37daee85bc0d517'] }
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

import { metaMask, injected, walletConnect, safe } from 'wagmi/connectors'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [dedicatedMainnet, dedicatedBsc, polygon, dedicatedBase, arbitrum, optimism, worldchain];

export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks,
    transports: {
        [mainnet.id]: http('https://go.getblock.us/d9f5f9207ac44e5d9faf8d3017ca9fff'),
        [bsc.id]: http('https://go.getblock.us/3cdeadc7f4174c23b37daee85bc0d517'),
        [polygon.id]: http(),
        [base.id]: http(process.env.GETBLOCK_BASE_RPC || base.rpcUrls.default.http[0]),
        [arbitrum.id]: http(),
        [optimism.id]: http()
    }
})

export const config = wagmiAdapter.wagmiConfig

const queryClient = new QueryClient()

// CRITICAL: URL must match exactly the domain registered in WalletConnect/Reown Cloud.
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://humanidfi.com';

const metadata = {
    name: 'Whale Alert Network',
    description: 'Sovereign Institutional Intelligence',
    url: APP_URL,
    icons: [`https://humanidfi.com/official-whale-legendary.png`],
}

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
            // ── allowUnsupportedChain: prevents AppKit from auto-triggering the
            // "Switch Network" modal when the user's wallet is on a network not
            // in our list. Network switching is handled exclusively in Portfolio.
            allowUnsupportedChain: true,
            features: {
                analytics: true,
                email: true,
                socials: ['google', 'github', 'discord', 'x', 'apple'],
                emailShowWallets: true,
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
            // Wallet IDs from WalletConnect Explorer (https://explorer.walletconnect.com)
            featuredWalletIds: [
                'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
                '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
                'fd20dc4261a8140cb8f1d41804b4c71eeb9ce33da3ec76cd022ade0b4974f0d7', // Coinbase Wallet
                '1ae92b26df02f0abca6304df07debccd18262fdf15fe789c18682a3bf88d0',   // Rainbow
                'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef', // Phantom
            ],
            allWallets: 'SHOW',
            customWallets: []
        });
    }
} catch (e) {
    console.warn('[AppKit] Initialization skipped (already initialized):', e);
}

export function Web3ModalProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    // Decode URL-encoded cookie string before parsing to prevent JSON SyntaxError
    let decodedCookies: string | null = null;
    try {
        decodedCookies = cookies ? decodeURIComponent(cookies) : null;
    } catch {
        decodedCookies = cookies;
    }
    let initialState: any = undefined;
    try {
        initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, decodedCookies);
    } catch (e) {
        console.error('[Wagmi] Failed to parse cookie to initial state:', e);
    }

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as any} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={darkTheme()}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}


