import { http, createConfig } from 'wagmi'
import { optimism, baseSepolia } from 'wagmi/chains'
import { walletConnect } from 'wagmi/connectors'

// 1. Usamos el Project ID que ya tienes en Railway
// 1. Usamos el Project ID que ya tienes en Railway
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WC_PROJECT_ID || '0ce6bdc0b433d45ab19d32f130dd4f18';

// Token address provided by user (Ensure this matches the one in env or use one of them)
// Using value from user env vars: NEXT_PUBLIC_WLD_TOKEN_ADDRESS
export const WLD_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_WLD_TOKEN_ADDRESS || '0xdc6f18f83959cd25095c2453192f16d08b496666') as `0x${string}`;

export const config = createConfig({
    chains: [optimism, baseSepolia],
    connectors: [
        walletConnect({
            projectId,
            showQrModal: true,
            // CORE PIECE: Without this, the QR will fail in World App
            metadata: {
                name: 'WhaleAlert ID.fi',
                description: 'The Sovereign Identity & Prediction Market Suite',
                url: 'https://humanidfi.com',
                icons: ['/official-whale-legendary.png'],
            }
        }),
    ],
    transports: {
        // Usamos tu RPC de Alchemy para Optimism
        [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC || "https://mainnet.optimism.io"),
        [baseSepolia.id]: http(process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
    },
})

