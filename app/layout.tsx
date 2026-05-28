// System layout  No Clerk provider needed (SIWE-native auth)
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
    default: 'Whale Network | Privacy-Preserving Identity Verification',
    template: '%s | Whale Network'
  },
  description: 'Whale Network is a privacy-preserving identity verification solution integrating zero-knowledge proofs to achieve compliance without compromising personal data.',
  keywords: [
    'whale network', 'identity verification', 'zero-knowledge proofs', 'privacy', 'kyc',
    'compliance', 'digital identity', 'zkp'
  ],
  authors: [{ name: 'Whale Network' }],
  creator: 'Whale Network',
  publisher: 'Whale Network',
  metadataBase: new URL('https://humanidfi.com'),
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
    title: 'Whale Network',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Whale Network | Privacy-Preserving Identity Verification',
    description: 'A privacy-preserving identity verification solution integrating zero-knowledge proofs to achieve compliance without compromising personal data.',
    url: 'https://humanidfi.com',
    siteName: 'Whale Network',
    images: [
      {
        url: '/humanid_protocol_logo_1778714491433.png',
        width: 1200,
        height: 1200,
        alt: 'Whale Network Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whale Network | Privacy-Preserving Identity Verification',
    description: 'A privacy-preserving identity verification solution integrating zero-knowledge proofs.',
    images: ['/humanid_protocol_logo_1778714491433.png'],
    site: '@whalenetwork',
    creator: '@whalenetwork',
  },
}

export const viewport = {
  themeColor: '#FFFFFF',
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
        "url": "https://humanidfi.com/",
        "name": "Whale Network",
        "description": "Privacy-preserving identity verification solution integrating zero-knowledge proofs.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://humanidfi.com/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@id": "https://humanidfi.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://humanidfi.com/#organization",
        "name": "Whale Network",
        "alternateName": ["Whale Ecosystem", "Whale Network Protocol"],
        "url": "https://humanidfi.com",
        "logo": "https://humanidfi.com/humanid_protocol_logo_1778714491433.png",
        "sameAs": [
          "https://github.com/atfortyseven-creations/Humanity-Ledger"
        ]
      },
      {
        "@type": "WebApplication",
        "name": "Whale Network Platform",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "creator": {
          "@id": "https://humanidfi.com/#organization"
        },
        "description": "Privacy-preserving identity verification and portfolio management.",
        "featureList": [
          "Identity Verification",
          "Zero-Knowledge Proofs",
          "Compliance Tools",
          "Privacy-Preserving Infrastructure"
        ]
      },
      {
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "SiteNavigationElement",
            "position": 1,
            "name": "Docs",
            "description": "Whale Network SDK enables privacy-preserving identity verification.",
            "url": "https://humanidfi.com/developers/api-docs"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 2,
            "name": "Portfolio App",
            "description": "Track cross-chain capital flows and asset balances locally. No server ever sees your complete portfolio.",
            "url": "https://humanidfi.com/portfolio"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 3,
            "name": "Whale Network Registry Explorer",
            "description": "Explore countries with supported documents, view coverage and node density.",
            "url": "https://humanidfi.com/registry"
          }
        ]
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
        {/*  localStorage  sessionStorage polyfill for incognito (iOS/Android) 
            Runs BEFORE any script so WalletConnect pairing data can be stored.
            In iOS Safari Private, localStorage quota is 0  this patches it
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
        {/*  Global ChunkLoadError Recovery 
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
        className="bg-white text-[#050505] antialiased selection:bg-black/10 selection:text-black transition-colors duration-300"
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
