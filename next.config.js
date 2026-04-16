const isExtension = process.env.EXT_BUILD === 'true';

/** @type {import('next').NextConfig} */
// Force deployment trigger [INSTITUTIONAL SYNC]: 2026-04-15T01:37:00Z
const nextConfig = {
    transpilePackages: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        '@react-three/postprocessing',
        'postprocessing',
        'framer-motion',
        'wagmi',
        'viem',
        'lucide-react'
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
        unoptimized: false,
        minimumCacheTTL: 31536000,
        remotePatterns: [
            // Universal wildcard — allows images from any HTTPS domain
            // (CoinDesk, CoinTelegraph, Decrypt, etc.)
            { protocol: 'https', hostname: '**' },
            { protocol: 'http',  hostname: '**' },
        ]
    },

    // output: 'standalone', // DISABLING STANDALONE: We need full node_modules and TSX to run background workers.
    // NOTE: 'standalone' output DEACTIVATED. We reverted to standard build to run background workers via start.sh.

    compress: true,
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    reactStrictMode: true,
    // swcMinify: REMOVED — always enabled by default in Next.js 15

    // Moved from experimental in Next.js 15
    serverExternalPackages: ['@prisma/client', 'prisma', 'ioredis', 'neo4j-driver', 'snarkjs'],

    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion', 'three', '@react-three/fiber'],
        reactCompiler: true,
        esmExternals: 'loose',
        serverActions: {
            bodySizeLimit: '10mb'
        }
    },

    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },

    // External packages are defined above in experimental.serverComponentsExternalPackages

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
