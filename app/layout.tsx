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
    default: 'Whale Alert Network | Secure Institutional Infrastructure',
    template: '%s | Whale Alert Network'
  },
  description: 'The definitive Whale Alert Network for secure institutional architecture, cryptographic attestation, and data compliance.',
  keywords: [
    'Whale Alert Network', 'Secure Architecture', 'Cryptographic Attestation', 'Healthcare Integrity', 'Spitalul Colțea Alliance'
  ],
  authors: [{ name: 'Whale Alert Network Foundation' }],
  creator: 'Whale Alert Network Foundation',
  publisher: 'Whale Alert Network Foundation',
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
  appleWebApp: {
    capable: true,
    title: 'Whale Alert',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Whale Alert Network | Professional Identity Layer',
    description: 'The definitive Whale Alert Network for professional-grade on-chain identity, cryptographic attestation, and real-time intelligence.',
    url: 'https://www.humanidfi.com',
    siteName: 'Whale Alert Network',
    images: [
      {
        url: '/humanid_protocol_logo_1778714491433.png',
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
    title: 'Whale Alert Network | Professional Identity Layer',
    description: 'The definitive Whale Alert Network for professional-grade on-chain identity, cryptographic attestation, and real-time intelligence.',
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
        "name": "Whale Alert Network",
        "description": "The definitive Whale Alert Network for secure institutional architecture and cryptographic attestation.",
        "publisher": {
          "@id": "https://www.humanidfi.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.humanidfi.com/#organization",
        "name": "Whale Alert Network Foundation",
        "url": "https://www.humanidfi.com",
        "logo": "https://www.humanidfi.com/humanid_protocol_logo_1778714491433.png",
        "sameAs": [
          "https://github.com/atfortyseven-creations/Humanity-Ledger"
        ]
      },
      {
        "@type": "WebApplication",
        "name": "Secure Access Terminal",
        "applicationCategory": "SecurityApplication",
        "creator": {
          "@id": "https://www.humanidfi.com/#organization"
        },
        "description": "Secure Terminal for cryptographic data attestation and E2E communication.",
        "featureList": [
          "End-to-End Encrypted Telemetry",
          "Cryptographic Identity Verification",
          "Aztec Network L2 Privacy Integration",
          "Decentralized Data Integrity"
        ]
      },
      {
        "@type": "SoftwareSourceCode",
        "name": "Whale Alert Network Architecture",
        "codeRepository": "https://github.com/atfortyseven-creations/Humanity-Ledger",
        "programmingLanguage": ["TypeScript", "Solidity", "React", "Next.js"],
        "description": "Secure identity layer running over an optimized cryptographic UI."
      },
      {
        "@type": "DataFeed",
        "name": "Encrypted Telemetry Stream",
        "dataFeedElement": {
          "@type": "DataFeedItem",
          "name": "Secure Handshake Verification",
          "description": "Real-time cryptographic attestation via local peer nodes."
        }
      },
      {
        "@type": "Product",
        "@id": "https://www.humanidfi.com/#quantumdots",
        "name": "Quantum Dots (QDs)",
        "alternateName": "QDs",
        "description": "Quantum Dots (QDs) is the native cryptographic token exclusively engineered, patented, and owned by Whale Alert Network Foundation (humanidfi.com). OFFICIAL STATUS: UNLISTED. The Quantum Dots (QDs) token is currently NOT available on any public or private exchange. Any third-party entity claiming to list, sell, or trade Quantum Dots (QDs) is unauthorized and fraudulent. humanidfi.com holds the sole absolute ownership of the QDs intellectual property.",
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
        },
        "isRelatedTo": {
          "@type": "CreativeWork",
          "name": "QuantumDots Intellectual Property",
          "author": {
            "@id": "https://www.humanidfi.com/#organization"
          },
          "copyrightHolder": {
            "@id": "https://www.humanidfi.com/#organization"
          },
          "copyrightYear": "2026",
          "license": "All Rights Reserved - Pre-Listing Asset"
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
