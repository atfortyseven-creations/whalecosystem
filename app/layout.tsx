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
    'On-chain Forensic Analytics', 'Crypto Whale Detector', 'Binance Whale Alerts',
    'Real-time Crypto Tracking', 'Institutional Flow Analysis'
  ],
  authors: [{ name: 'Whale Alert Pro Team' }],
  metadataBase: new URL('https://whalealert.pro'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: [
    {
      rel: 'icon',
      url: '/official-whale.png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/official-whale.png',
    },
  ],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Whale Alert Network',
  },
  openGraph: {
    title: 'Whale Alert Network | Real-Time Elite Intelligence',
    description: 'Track elite flows of millions in real time. The definitive whale alert tool for serious traders. Pure signal, zero noise.',
    url: 'https://whalealert.pro',
    siteName: 'Whale Alert Network',
    images: [
      {
        url: '/official-whale.png',
        width: 1200,
        height: 630,
        alt: 'Whale Alert Network Elite Matrix Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whale Alert Network | Elite Whale Intelligence',
    description: 'The world\'s most precise whale alert tool for legendary on-chain detection.',
    images: ['/official-whale.png'],
    creator: '@WhaleAlertPro',
  },
  alternates: {
    canonical: 'https://whalealert.pro',
  },
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#B6EA26' },
    { media: '(prefers-color-scheme: dark)',  color: '#B6EA26' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: true,
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="theme-color" content="#F2EEE1" />
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

