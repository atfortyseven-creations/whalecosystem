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
import { OfflineDetector } from "@/components/ui/OfflineScreen";
import { ClientFortress } from "@/components/ui/ClientFortress";
import { initializeBackgroundServices } from "@/lib/services/init";
import { ErrorSuppressor } from "@/components/ui/ErrorSuppressor";
import { AztecNoise } from "@/components/ui/AztecNoise";
import { ReactNode } from "react";
import { MobileEnforcer } from "@/components/layout/MobileEnforcer";

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
    default: 'Whale Alert Network',
    template: '%s | Whale Alert Network'
  },
  description: 'The world\'s most advanced whale alert tool for real-time elite on-chain intelligence. Track whales across 24 crypto assets with institutional-grade forensic instrumentation.',
  keywords: [
    'Whale Alert Network', 'Whale Alert', 'Whale Tracker', 'Elite Whale Intelligence', 
    'On-chain Forensic Analytics', 'Crypto Whale Detector', 'Institutional Flow Analysis'
  ],
  authors: [{ name: 'Sovereign Institutional Team' }],
  metadataBase: new URL('https://humanidfi.com'),
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Whale Alert',
  },
  openGraph: {
    title: 'Whale Alert Network | Sovereign Intelligence',
    description: 'Track elite flows of millions in real time. The definitive whale alert tool.',
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
    title: 'Whale Alert Network',
    description: 'Sovereign On-chain Analytics.',
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

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <head>
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={`${inter.className} ${martel.variable} ${robotoMono.variable} perf-ultra`}>
          <AztecNoise />
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
                <OfflineDetector />
                <ClientFortress />
                <ErrorSuppressor />
              </Providers>
          </CookieProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
