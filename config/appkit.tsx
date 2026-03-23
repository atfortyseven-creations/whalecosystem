"use client";

import { useTheme } from "next-themes";
import { CreateConnectorFn, WagmiProvider, cookieToInitialState } from 'wagmi';
import { AppKitNetwork, mainnet, base, arbitrum, polygon, optimism } from "@reown/appkit/networks";
import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createAppKit } from '@reown/appkit/react'
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 1. Get projectId
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "0ce6bdc0b433d45ab19d32f130dd4f18";

// 2. Interstellar Node Override
const dedicatedBase = {
    ...base,
    rpcUrls: {
        ...base.rpcUrls,
        default: { http: [process.env.GETBLOCK_BASE_RPC || base.rpcUrls.default.http[0]] },
        public: { http: [process.env.GETBLOCK_BASE_RPC || base.rpcUrls.default.http[0]] }
    }
};

const infuraKey = process.env.INFURA_API_KEY || "4307fae544b442c2a40443ac491ffb0e";

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

const metadata = {
    name: 'Whale Alert Network',
    description: 'Sovereign Institutional Intelligence',
    url: 'https://www.humanidfi.com',
    icons: [
        'https://www.humanidfi.com/models/update/gradient-pink-diamond-balls-assortment (2).png'
    ],
    redirect: {
        native: 'whalealert://',
        universal: 'https://humanidfi.com'
    }
}

// Create the modal instance
createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata,
    features: {
        analytics: true,
        email: true, 
        socials: ['google', 'x', 'github', 'discord', 'apple'],
        swaps: false,
        onramp: false,
    },
    themeMode: 'light',
    themeVariables: {
        '--w3m-accent': '#1D1A10',
        '--w3m-color-mix': '#F2ECD8',
        '--w3m-border-radius-master': '2rem',
        '--w3m-font-family': 'FT Regola Neue, Inter, sans-serif'
    },
    enableInjected: true,
    enableEIP6963: true,
    enableWalletConnect: true,
    featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
        'fd20dc4261a8140cb8f1d41804b4c71eeb9ce33da3ec76cd022ade0b4974f0d7', // Coinbase Wallet
    ],
    allWallets: 'SHOW'
})

export function Web3ModalProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as any} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}


