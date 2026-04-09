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

    output: 'standalone',
    // NOTE: 'standalone' output ACTIVATED. We are now running a Multi-Stage Docker Build
    // for absolute resource efficiency on Railway 8GB Hobby Plan.

    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,

    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },

    // External packages: Only specify packages with native bindings (Rust/C++/WASM).
    // Pure JS packages (ethers, stripe, bcryptjs, snarkjs) will be automatically traced
    // and optimally bundled inside the .next/standalone/node_modules output.
    serverExternalPackages: [
        '@prisma/client',
        'prisma'
    ],

    env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        // Injected at build time so the client bundle never sees 'undefined'
        NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '093232b25784a0694c642ad54a6331fa',
        NEXT_PUBLIC_WC_PROJECT_ID: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '093232b25784a0694c642ad54a6331fa',
    },

    // NOTE: CSP is handled exclusively by middleware.ts (per-request, nonce-based).
    // Defining it here too would send DUPLICATE CSP headers causing the browser
    // to apply the most restrictive combination - breaking Clerk & WalletConnect.
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
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
