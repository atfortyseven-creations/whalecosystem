import { http, createConfig } from 'wagmi'
import { mainnet, base, bsc, optimism } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

// Project ID for WalletConnect
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WC_PROJECT_ID || '0ce6bdc0b433d45ab19d32f130dd4f18';

export const WLD_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_WLD_TOKEN_ADDRESS || '0xdc6f18f83959cd25095c2453192f16d08b496666') as `0x${string}`;

// ── INSTITUTIONAL CHAIN SET ────────────────────────────────────────────────────
// These chains MUST match what the EVM workers actually monitor (evm-worker.ts):
// ETHEREUM Mainnet, BASE Mainnet, BSC Mainnet.
// Using testnets here would cause SovereignVault to lock funds on testnets
// while the intelligence layer watches Mainnet — a catastrophic mismatch.
export const config = createConfig({
    chains: [mainnet, base, bsc, optimism],
    multiInjectedProviderDiscovery: true,   // ← EIP-6963: auto-discovers Rabby, Frame, etc.
    connectors: [
        // CRITICAL: injected must be listed FIRST so MetaMask/Rabby are
        // the default connector and contract writes get proper RPC params.
        // Only one injected() instance — having two causes 'Connector already connected' errors.
        injected({ target: 'metaMask' }),
        walletConnect({
            projectId,
            showQrModal: false,   // ← false: we manage the QR UI ourselves; true caused double-modal flicker
            metadata: {
                name: 'WhaleAlert ID.fi',
                description: 'The Sovereign Identity & Prediction Market Suite',
                url: 'https://humanidfi.com',
                icons: ['/official-whale-legendary.png'],
            }
        }),
        coinbaseWallet({ 
            appName: 'WhaleAlert ID.fi',
            // 'smartWalletOnly' requires passkeys — unavailable on iOS < 16.
            // 'all' shows both classic and smart wallet — safe for all devices.
            preference: 'all'
        }),
    ],
    transports: {
        [mainnet.id]:  http(process.env.NEXT_PUBLIC_ETHEREUM_RPC  || 'https://eth.llamarpc.com'),
        [base.id]:     http(process.env.NEXT_PUBLIC_BASE_RPC       || 'https://mainnet.base.org'),
        [bsc.id]:      http(process.env.NEXT_PUBLIC_BSC_RPC        || 'https://bsc-dataseed.binance.org'),
        [optimism.id]: http(process.env.NEXT_PUBLIC_OPTIMISM_RPC   || 'https://mainnet.optimism.io'),
    },
})


