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
    default: 'HumanID Protocol | Institutional Identity Layer',
    template: '%s | HumanID Protocol'
  },
  description: 'The definitive HumanID Protocol for institutional-grade on-chain identity, cryptographic attestation, and real-time intelligence.',
  keywords: [
    'HumanID Protocol', 'HumanID', 'Institutional Identity', 'ZK-Biometrics', 'On-chain Intelligence', 'Zero-Knowledge Proofs'
  ],
  authors: [{ name: 'HumanID Protocol Foundation' }],
  creator: 'HumanID Protocol Foundation',
  publisher: 'HumanID Protocol Foundation',
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
    title: 'HumanID',
  },
  openGraph: {
    title: 'HumanID Protocol | Institutional Identity Layer',
    description: 'The definitive HumanID Protocol for institutional-grade on-chain identity, cryptographic attestation, and real-time intelligence.',
    url: 'https://www.humanidfi.com',
    siteName: 'HumanID Protocol',
    images: [
      {
        url: '/humanid_protocol_logo_1778714491433.png',
        width: 1200,
        height: 1200,
        alt: 'HumanID Protocol',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HumanID Protocol | Institutional Identity Layer',
    description: 'The definitive HumanID Protocol for institutional-grade on-chain identity, cryptographic attestation, and real-time intelligence.',
    images: ['/humanid_protocol_logo_1778714491433.png'],
  },
}

export const viewport = {
  themeColor: '#FAFAF8',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        "name": "HumanID Protocol",
        "description": "The definitive HumanID Protocol for institutional-grade on-chain identity, cryptographic attestation, and real-time intelligence.",
        "publisher": {
          "@id": "https://www.humanidfi.com/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.humanidfi.com/#organization",
        "name": "HumanID Protocol Foundation",
        "url": "https://www.humanidfi.com",
        "logo": "https://www.humanidfi.com/humanid_protocol_logo_1778714491433.png",
        "sameAs": [
          "https://github.com/atfortyseven-creations/Humanity-Ledger"
        ]
      },
      {
        "@type": "SoftwareApplication",
        "name": "HumanID Terminal",
        "operatingSystem": "Web",
        "applicationCategory": "FinanceApplication",
        "creator": {
          "@id": "https://www.humanidfi.com/#organization"
        },
        "description": "HumanID Terminal for real-time institutional on-chain identity and intelligence.",
        "url": "https://www.humanidfi.com/dashboard",
        "featureList": [
          "HumanID Terminal (Zero-Trust Forensic Suite)",
          "ZK-Biometric Identity Attestation",
          "Aztec Network L2 Privacy Integration",
          "Protocol Ledger Heuristics"
        ]
      },
      {
        "@type": "SoftwareSourceCode",
        "name": "HumanID Protocol Architecture",
        "codeRepository": "https://github.com/atfortyseven-creations/Humanity-Ledger",
        "programmingLanguage": ["TypeScript", "Solidity", "PostgreSQL", "Neo4j", "React", "Next.js"],
        "description": "Institutional-grade identity layer running Next.js 15 App router over a sterilized Ivory-and-Ink UI."
      },
      {
        "@type": "DataFeed",
        "name": "Live Institutional Identity Feed",
        "dataFeedElement": {
          "@type": "DataFeedItem",
          "name": "Protocol Identity Matrix",
          "description": "Real-time cryptographic attestation of network participants via local Node daemon."
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
        className="bg-[#FAFAF8] text-[#0A0A0A] antialiased selection:bg-black/10 selection:text-black transition-colors duration-300"
        suppressHydrationWarning
      >


        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">
          Skip to absolute content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
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
