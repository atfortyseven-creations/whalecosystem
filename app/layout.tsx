// Sovereign layout — No Clerk provider needed (SIWE-native auth)
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
import { InteractiveFluidGrid } from "@/components/landing/InteractiveFluidGrid";
import { GoogleTagManager } from "@/components/privacy/GoogleTagManager";
import { ErrorSuppressor } from "@/components/ui/ErrorSuppressor";
import { ReactNode } from "react";
import { MobileEnforcer } from "@/components/layout/MobileEnforcer";
import { ClientOverlays } from "@/components/layout/ClientOverlays";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { GlobalErrorBoundary } from "@/components/ui/GlobalErrorBoundary";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { AntiTamperCore } from "@/components/security/AntiTamperCore";


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
    default: 'HOME | Whale Alert Network',
    template: '%s | Whale Alert Network'
  },
  description: 'La comunidad definitiva de Whale Alert Network para el análisis y seguimiento on-chain de criptomonedas en tiempo real.',
  keywords: [
    'Whale Alert Network', 'Whale Alert', 'Whale Tracker', 'Crypto Whale Detector', 'On-chain Analytics', 'Crypto Community'
  ],
  authors: [{ name: 'Whale Alert Network Team' }],
  creator: 'Whale Alert Network Team',
  publisher: 'Whale Alert Network Team',
  metadataBase: new URL('https://www.humanidfi.com'),
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
    title: 'HOME | Whale Alert Network',
    description: 'La comunidad definitiva de Whale Alert Network para el análisis y seguimiento on-chain de criptomonedas en tiempo real.',
    url: 'https://www.humanidfi.com',
    siteName: 'Whale Alert Network',
    images: [
      {
        url: '/logo-landingpage.png',
        width: 1200,
        height: 1200,
        alt: 'Whale Alert Network',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HOME | Whale Alert Network',
    description: 'La comunidad definitiva de Whale Alert Network para el análisis y seguimiento on-chain de criptomonedas en tiempo real.',
    images: ['/logo-landingpage.png'],
  },
}

export const viewport = {
  themeColor: '#FAF9F6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
  }: {
  children: React.ReactNode
}) {
  const headersList = await headers();
  const cookies = headersList.get('cookie');
  const nonce = headersList.get('x-nonce') || '';

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "url": "https://www.humanidfi.com/",
        "name": "Whale Alert Network",
        "description": "La comunidad definitiva de Whale Alert Network para el análisis y seguimiento on-chain de criptomonedas en tiempo real.",
        "publisher": {
          "@id": "https://www.humanidfi.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.humanidfi.com/#organization",
        "name": "Whale Alert Network Team",
        "url": "https://www.humanidfi.com",
        "logo": "https://www.humanidfi.com/logo-landingpage.png",
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
          "@id": "https://www.humanidfi.com/#organization"
        },
        "description": "Whale Alert Network terminal for real-time elite on-chain intelligence.",
        "url": "https://www.humanidfi.com/network",
        "featureList": [
          "Sovereign PC Vault (Local Daemon Zero-Trust)",
          "Next.js Hybrid Safari iOS Webview + QR State Sync",
          "Hardhat L2 Aztec Network ZK Integrations",
          "Whale Worker (Prisma + Neo4j + BullMQ)"
        ]
      },
      {
        "@type": "SoftwareSourceCode",
        "name": "Whale Alert Base Architecture",
        "codeRepository": "https://github.com/atfortyseven-creations/whalecosystem",
        "programmingLanguage": ["TypeScript", "Solidity", "PostgreSQL", "Neo4j", "React", "Next.js"],
        "description": "Dual-hybrid architecture running Next.js 15 App router over a Zero-Latency Bento UI."
      },
      {
        "@type": "DataFeed",
        "name": "Live Institutional Flow Feed",
        "dataFeedElement": {
          "@type": "DataFeedItem",
          "name": "EVM Thermodynamic Matrix",
          "description": "Live stochastic tracing of accumulated gas signatures natively via local Node daemon connected to Ethereum."
        }
      }
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Proper viewport already handled by Next.js `viewport` export above */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Prevent iOS Safari from auto-detecting phone numbers as links */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* ── localStorage → sessionStorage polyfill for incognito (iOS/Android) ──
            Runs BEFORE any script so WalletConnect pairing data can be stored.
            In iOS Safari Private, localStorage quota is 0 — this patches it
            with sessionStorage so WC v2 sessions survive within the tab. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `(function(){
  try{
    window.localStorage.setItem('__sovereign_probe__','1');
    window.localStorage.removeItem('__sovereign_probe__');
  }catch(e){
    try{
      var _ss=window.sessionStorage;
      Object.defineProperty(window,'localStorage',{
        configurable:true,enumerable:true,
        get:function(){return _ss;}
      });
    }catch(e2){}
  }
})();` }} />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="bg-[#0a001a] text-white antialiased selection:bg-[#D4AF37] selection:text-white transition-colors duration-300"
        suppressHydrationWarning
      >


        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">
          Skip to absolute content
        </a>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ScrollProgressBar />
          <Providers cookies={cookies}>
            <GlobalErrorBoundary>
              <MobileEnforcer>
                <ClientLayout>
                  <CookieProvider>
                    <ErrorSuppressor />
                    <GoogleTagManager gtmId="GTM-52B9SCRM" />
                    <AntiTamperCore />
                    {children}
                    <Toaster richColors position="top-right" />
                    <CookieConsent />
                    <ClientOverlays />
                    <InteractiveFluidGrid />
                  </CookieProvider>
                </ClientLayout>
              </MobileEnforcer>
            </GlobalErrorBoundary>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
