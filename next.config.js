const isExtension = process.env.EXT_BUILD === 'true';

/** @type {import('next').NextConfig} */
// Force deployment trigger: 2026-04-04T14:50:00
const nextConfig = {
    transpilePackages: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/postprocessing',
        'postprocessing',
    ],
    webpack: (config, { isServer }) => {
        // [LEGENDARY BUILD FIX] Force bypass for missing third-party SDK dependencies
        config.resolve.alias = {
            ...config.resolve.alias,
            '@react-native-async-storage/async-storage': false,
            'porto': false,
            'porto/internal': false,
        };

        // Three.js: prevent server-side import issues
        if (isServer) {
            config.externals = [...(config.externals || []),
                'three', '@react-three/fiber', '@react-three/drei',
                '@react-three/postprocessing', 'postprocessing'
            ];
        }

        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                readline: false,
                os: false,
                path: false,
                crypto: false,
            };
        }
        return config;
    },
    trailingSlash: isExtension,
    distDir: isExtension ? 'out' : '.next',

    images: {
        unoptimized: true,
        remotePatterns: [
            // Universal wildcard — allows images from any HTTPS domain
            // (CoinDesk, CoinTelegraph, Decrypt, etc.)
            { protocol: 'https', hostname: '**' },
            { protocol: 'http',  hostname: '**' },
        ]
    },

    // Standalone output required for Docker multi-stage build (Dockerfile COPY .next/standalone)
    // Skipped in extension builds which use 'out' distDir instead.
    output: isExtension ? undefined : 'standalone',

    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,

    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },

    // External packages
    serverExternalPackages: [
        '@prisma/client',
        'prisma',
        'bcryptjs',
        '@xmtp/browser-sdk',
        'ethers',
        'web3',
        '@walletconnect/ethereum-provider',
        'socket.io',
        'stripe',
        'snarkjs'
    ],

    env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self';",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://js.stripe.com https://api.stripe.com https://*.googletagmanager.com;",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
                            "img-src 'self' data: https: blob: https://grainy-gradients.vercel.app;",
                            "font-src 'self' https://fonts.gstatic.com;",
                            "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://js.stripe.com https://api.stripe.com https://verify.walletconnect.org https://verify.walletconnect.com https://*.worldcoin.org;",
                            "connect-src 'self' https://api.exchangerate-api.com https://*.moralis.io https://clob.polymarket.com https://go.getblock.io https://go.getblock.us https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com https://*.alchemy.com wss://*.alchemy.com https://*.google-analytics.com https://*.googletagmanager.com https://api.stripe.com https://api.web3modal.org https://cca-lite.coinbase.com https://pulse.walletconnect.org https://rpc.walletconnect.org https://rpc.walletconnect.com wss://relay.walletconnect.org https://*.walletconnect.com https://*.walletconnect.org https://*.coingecko.com https://api.coingecko.com https://*.binance.com wss://*.binance.com wss://stream.binance.com:9443 https://api.bybit.com wss://stream.bybit.com https://eth.llamarpc.com https://*.llamarpc.com wss://*.llamarpc.com wss://*.bridge.walletconnect.org wss://*.relay.walletconnect.com wss://polymarketwallet.up.railway.app https://polymarketwallet.up.railway.app https://www.humanidfi.com wss://www.humanidfi.com https://hermes.pyth.network wss://hermes.pyth.network https://api.etherscan.io https://*.worldcoin.org wss://*.worldcoin.org https://li.quest https://api.li.fi https://*.li.fi https://mainnet.base.org https://*.base.org https://base-mainnet.g.alchemy.com https://*.rpc.rivet.cloud https://*.metamask.io wss://*.metamask.io https://metamask-sdk.api.cx.metamask.io https://mm-sdk-analytics.api.cx.metamask.io https://api.clerk.com;",
                            "worker-src 'self' blob:;",
                            "media-src 'self';",
                            "object-src 'none';",
                        ].join(' ')
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    }
                ]
            }
        ];
    }
};

// Forced clean production build: 2026-02-05T15:32:00Z
module.exports = nextConfig;
