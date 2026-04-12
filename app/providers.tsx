"use client";

import React, { ReactNode, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon, bsc, avalanche, zksync, linea, scroll, celo, mantle, fantom, blast, gnosis, moonbeam } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, getDefaultConfig, RainbowKitAuthenticationProvider, createAuthenticationAdapter } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { SiweMessage } from 'siwe';
import { MarketStreamProvider } from '@/context/MarketStreamContext';
import { WhaleStreamProvider } from '@/context/WhaleStreamContext';
import { VIPStoreBootstrap } from '@/components/providers/VIPStoreBootstrap';
import { AlphaToaster } from '@/components/ui/AlphaToaster';
import { ShortcutVisualizer } from '@/components/ui/ShortcutVisualizer';
import { WalletConnectionBridge } from '@/components/providers/WalletConnectionBridge';
import { SovereignVaultBootstrap } from '@/components/providers/SovereignVaultBootstrap';

// BUG-12 FIX: Do NOT create QueryClient at module level — it leaks state
// between server-rendered requests in Railway multi-replica environments.
// Must be created per-component instance using useState.

// Sovereign AppKit Configuration — ALL CHAINS ENABLED
const config = getDefaultConfig({
  appName: 'Sovereign Terminal Omniverse',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '093232b25784a0694c642ad54a6331fa',
  chains: [
    mainnet,
    base,
    arbitrum,
    optimism,
    polygon,
    bsc,
    avalanche,
    zksync,
    linea,
    scroll,
    celo,
    mantle,
    fantom,
    blast,
    gnosis,
    moonbeam,
  ],
  transports: {
    [mainnet.id]:  http(),
    [base.id]:     http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]:  http(),
    [bsc.id]:      http(),
    [avalanche.id]:http(),
    [zksync.id]:   http(),
    [linea.id]:    http(),
    [scroll.id]:   http(),
    [celo.id]:     http(),
    [mantle.id]:   http(),
    [fantom.id]:   http(),
    [blast.id]:    http(),
    [gnosis.id]:   http(),
    [moonbeam.id]: http(),
  },
  ssr: true,
});

// Hardened SIWE Adapter
const authenticationAdapter = createAuthenticationAdapter({
  getNonce: async () => {
    const response = await fetch('/api/siwe/nonce');
    const nonce = await response.text();
    return nonce;
  },
  createMessage: ({ nonce, address, chainId }) => {
    return new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in to the Sovereign Terminal to unlock Nivel 9 Clearance.',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
    });
  },
  verify: async ({ message, signature }) => {
    const response = await fetch('/api/siwe/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature }),
    });
    return response.ok;
  },
  signOut: async () => {
    await fetch('/api/siwe/logout');
  },
});

export function Web3SovereignProvider({ children }: { children: ReactNode }) {
  // BUG-12 FIX: per-instance QueryClient prevents SSR data leaks across users
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 10_000, retry: 1 } }
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status="unauthenticated"
        >
          <RainbowKitProvider 
            theme={darkTheme({
              accentColor: '#050505',
              accentColorForeground: 'white',
              borderRadius: 'large',
              fontStack: 'system',
              overlayBlur: 'small',
            })}
          >
            <MarketStreamProvider>
              <WhaleStreamProvider>
                <AlphaToaster />
                <ShortcutVisualizer />
                <WalletConnectionBridge />
                <VIPStoreBootstrap />
                <SovereignVaultBootstrap />
                {children}
              </WhaleStreamProvider>
            </MarketStreamProvider>
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
