import { ClerkProvider } from '@clerk/nextjs'
import { headers } from 'next/headers'
import { Inter, Martel, Roboto_Mono } from 'next/font/google'
import './globals.css'
import './smooth-scroll.css'
import Providers from "@/components/Providers";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/roboto-mono/700.css";
import "@fontsource/roboto-mono/400.css";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { Toaster } from 'sonner'
import { CookieProvider } from "@/components/privacy/CookieContext";
import { CookieConsent } from "@/components/privacy/CookieConsent";
import { GoogleTagManager } from "@/components/privacy/GoogleTagManager";
import { initializeBackgroundServices } from "@/lib/services/init";
import { ErrorSuppressor } from "@/components/ui/ErrorSuppressor";
import { ReactNode } from "react";
import { MobileEnforcer } from "@/components/layout/MobileEnforcer";
import { ClientOverlays } from "@/components/layout/ClientOverlays";


const inter = Inter({ subsets: ['latin'] })

const martel = Martel({
  subsets: ['latin'],
  weight: ['300', '400', '700', '800', '900'],
  variable: '--font-aztec-serif',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-aztec-mono',
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'Whale Alert Network | Sovereign Institutional Interface',
    template: '%s | Whale Alert Network'
  },
  description: 'The world\'s most advanced whale alert tool for real-time elite on-chain intelligence. Track massive capital flows across blockchains with institutional-grade forensic instrumentation, zero-knowledge proofs, and real-time AI signals.',
  keywords: [
    'Whale Alert Network', 'Whale Alert', 'Whale Tracker', 'Elite Whale Intelligence', 
    'On-chain Forensic Analytics', 'Crypto Whale Detector', 'Institutional Flow Analysis',
    'Dark Pool Heatmap', 'Bitcoin Mempool', 'Sovereign Infrastructure'
  ],
  authors: [{ name: 'Sovereign Institutional Team' }],
  creator: 'Sovereign Institutional Team',
  publisher: 'Sovereign Institutional Team',
  metadataBase: new URL('https://humanidfi.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Whale Alert',
  },
  openGraph: {
    title: 'Whale Alert Network | Sovereign Intelligence',
    description: 'Track elite flows of millions in real time. The definitive whale alert tool with asymmetric institutional intelligence.',
    url: 'https://humanidfi.com',
    siteName: 'Whale Alert Network',
    images: [
      {
        url: '/official-whale-monochrome.png',
        width: 1200,
        height: 1200,
        alt: 'Whale Alert Network Elite Matrix',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whale Alert Network | Elite Tracker',
    description: 'Sovereign On-chain Analytics. Real-time institutional detection algorithms.',
    images: ['/official-whale-monochrome.png'],
  },
}

export const viewport = {
  themeColor: '#FAF9F6', // Perfect Ivory Monochrome Match
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-visual',
}

export default async function RootLayout({
  children,
  }: {
  children: React.ReactNode
}) {
  const headersList = await headers();
  const cookies = headersList.get('cookie');

  // Start the omni-channel background event dispatcher
  initializeBackgroundServices();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "url": "https://humanidfi.com/",
        "name": "Whale Alert Network",
        "description": "Cryptographic shield and on-chain intelligence protocol. Mastering EVM thermodynamics, ZK-Circuits, and Real-Time Algorithmic Forensics.",
        "publisher": {
          "@id": "https://humanidfi.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://humanidfi.com/#organization",
        "name": "Sovereign Institutional Team",
        "url": "https://humanidfi.com",
        "logo": "https://humanidfi.com/official-whale-monochrome.png",
        "sameAs": [
          "https://github.com/atfortyseven-creations/whalecosystem"
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "Whale Alert Network Terminal",
        "operatingSystem": "Web",
        "applicationCategory": "FinanceApplication",
        "creator": {
          "@id": "https://humanidfi.com/#organization"
        },
        "description": "The definitive sovereign terminal for real-time elite on-chain intelligence. Integrating Zero-Knowledge rollups, EVM thermodynamic analytics, and deterministic AI signals.",
        "url": "https://humanidfi.com/network"
      }
    ]
  };

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={`${inter.className} ${martel.variable} ${robotoMono.variable} perf-ultra`}>
          <CookieProvider>
             <GoogleTagManager gtmId="GTM-52B9SCRM" />
              <Providers cookies={cookies}>
                <MobileEnforcer>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
                </MobileEnforcer>
                <Toaster richColors position="top-right" />
                <CookieConsent />
                <ClientOverlays />
                <ErrorSuppressor />
              </Providers>
          </CookieProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
