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
import { MobileEnforcer } from '@/components/layout/MobileEnforcer';
import { ClientOverlays } from "@/components/layout/ClientOverlays";
import { GlobalErrorBoundary } from "@/components/ui/GlobalErrorBoundary";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { AntiTamperCore } from "@/components/security/AntiTamperCore";

import { WalletConnectProvider } from '@/components/walletconnect/WalletConnectProvider';


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
    default: 'Whale Alert — Live Crypto Whale Tracker & Blockchain Monitor',
    template: '%s | Whale Alert'
  },
  description: 'Track massive crypto transactions in real time. Whale Alert shows you every large Bitcoin, Ethereum and altcoin move the moment it happens — free, live and no sign-up needed.',
  keywords: [
    'whale alert', 'whale alert crypto', 'crypto whale tracker', 'whale transactions',
    'blockchain monitor', 'large crypto transactions', 'bitcoin whale', 'ethereum whale',
    'live crypto alerts', 'on-chain analytics', 'humanidfi', 'whale watching crypto',
    'crypto market moves', 'defi whale tracker', 'whale alert live'
  ],
  authors: [{ name: 'Whale Alert' }],
  creator: 'Whale Alert',
  publisher: 'Whale Alert',
  metadataBase: new URL('https://www.humanidfi.com'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    title: 'Whale Alert',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Whale Alert — Live Crypto Whale Tracker & Blockchain Monitor',
    description: 'Track massive crypto transactions in real time. See every large Bitcoin, Ethereum and altcoin move the moment it happens.',
    url: 'https://www.humanidfi.com',
    siteName: 'Whale Alert',
    images: [
      {
        url: '/humanid_protocol_logo_1778714491433.png',
        width: 1200,
        height: 1200,
        alt: 'Whale Alert — Live Crypto Whale Tracker',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whale Alert — Live Crypto Whale Tracker & Blockchain Monitor',
    description: 'Track massive crypto transactions in real time. See every large Bitcoin, Ethereum and altcoin move the moment it happens.',
    images: ['/humanid_protocol_logo_1778714491433.png'],
  },
}

export const viewport = {
  themeColor: '#FAFAF8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
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
        "name": "Whale Alert",
        "description": "Track massive crypto whale transactions in real time. Live blockchain monitor for Bitcoin, Ethereum and all major altcoins.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://www.humanidfi.com/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@id": "https://www.humanidfi.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.humanidfi.com/#organization",
        "name": "Whale Alert",
        "alternateName": ["Whale Alert Network", "humanidfi"],
        "url": "https://www.humanidfi.com",
        "logo": "https://www.humanidfi.com/humanid_protocol_logo_1778714491433.png",
        "sameAs": [
          "https://github.com/atfortyseven-creations/Humanity-Ledger"
        ]
      },
      {
        "@type": "WebApplication",
        "name": "Whale Alert — Live Crypto Tracker",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "creator": {
          "@id": "https://www.humanidfi.com/#organization"
        },
        "description": "Free real-time tracker of large cryptocurrency transactions. See whale moves on Bitcoin, Ethereum, and 50+ blockchains the moment they happen.",
        "featureList": [
          "Live Whale Transaction Alerts",
          "On-Chain Analytics Dashboard",
          "Portfolio Tracker",
          "Crypto News & Academy",
          "Community Forum"
        ]
      },
      {
        "@type": "Product",
        "@id": "https://www.humanidfi.com/#quantumdots",
        "name": "Quantum Dots (QDs)",
        "alternateName": "QDs",
        "description": "Quantum Dots (QDs) is the native cryptographic token exclusively engineered, patented, and owned by Whale Alert (humanidfi.com). OFFICIAL STATUS: UNLISTED. Any third-party claiming to list, sell, or trade Quantum Dots (QDs) is unauthorized and fraudulent.",
        "brand": {
          "@id": "https://www.humanidfi.com/#organization"
        },
        "manufacturer": {
          "@id": "https://www.humanidfi.com/#organization"
        },
        "category": "Cryptographic Asset",
        "offers": {
          "@type": "Offer",
          "availability": "https://schema.org/OutOfStock",
          "priceCurrency": "USD",
          "price": "0",
          "seller": {
            "@id": "https://www.humanidfi.com/#organization"
          }
        }
      }
    ]
  };

  return (
    <html lang="en" className="light" suppressHydrationWarning data-scroll-behavior="smooth">
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
    window.localStorage.setItem('__humanid_probe__','1');
    window.localStorage.removeItem('__humanid_probe__');
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
        {/* ── Global ChunkLoadError Recovery ──
            Catches router-level dynamic import failures (stale deployment)
            that bubble past React Error Boundaries. */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `(function(){
  window.addEventListener('unhandledrejection', function(event) {
    var msg = event.reason ? (event.reason.message || event.reason.name || '') : '';
    if (msg.includes('ChunkLoadError') || msg.includes('dynamically imported module')) {
      if (!sessionStorage.getItem('global_chunk_reload')) {
        sessionStorage.setItem('global_chunk_reload', '1');
        window.location.reload(true);
      } else {
        sessionStorage.removeItem('global_chunk_reload');
      }
    }
  });
})();` }} />
        <script
          nonce={nonce}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="bg-[#FAFAF8] text-black antialiased selection:bg-black/10 selection:text-black transition-colors duration-300"
        suppressHydrationWarning
      >


        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">
          Skip to absolute content
        </a>
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
                  <WalletConnectProvider />
                </CookieProvider>
              </ClientLayout>
            </MobileEnforcer>
          </GlobalErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
