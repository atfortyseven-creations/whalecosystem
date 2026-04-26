"use client";

import { useTheme } from "next-themes";
import { CreateConnectorFn, WagmiProvider, cookieToInitialState } from 'wagmi';
import { AppKitNetwork, mainnet, base, arbitrum, polygon, optimism } from "@reown/appkit/networks";
import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// @ts-ignore - Supress missing module error until user runs npm install
import { createSIWEConfig, formatMessage } from '@reown/appkit-siwe'

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
        default: { http: [process.env.ETH_RPC_URL || 'https://go.getblock.us/81ed63d96d704589999ff99c9a1ff64b'] },
        public: { http: [process.env.ETH_RPC_URL || 'https://go.getblock.us/81ed63d96d704589999ff99c9a1ff64b'] }
    }
};

import { bsc } from "@reown/appkit/networks";
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

import { metaMask, injected, walletConnect, safe } from 'wagmi/connectors'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [dedicatedMainnet, dedicatedBsc, polygon, dedicatedBase, arbitrum, optimism, worldchain];

export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks
})

export const config = wagmiAdapter.wagmiConfig

const queryClient = new QueryClient()

// CRITICAL: URL must match exactly the domain registered in WalletConnect/Reown Cloud.
// Using window.location.origin fixes local/Railway testing mismatches.
const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://humanidfi.com';

const metadata = {
    name: 'Whale Alert Network',
    description: 'Sovereign Institutional Intelligence',
    url: APP_URL,
    // Empty icons array: prevents WalletConnect relay from fetching a potentially
    // slow/blocked icon URL during the mobile handshake (root cause of Rainbow
    // "Connection failed" error). AppKit renders a native gradient avatar instead.
    icons: [],
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
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}


