import type { Metadata } from 'next'
import { DM_Sans, DM_Mono, Inter, Manrope, Doto } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { Analytics } from '@vercel/analytics/next'

/* ── Google Fonts via next/font ──────────────────────────────────────────
   Fonts are downloaded at build time, self-hosted by Next.js, and injected
   as @font-face — no external network request at runtime, no layout shift,
   and no "custom font in <head>" linting warning.
──────────────────────────────────────────────────────────────────────── */
const dmSans = DM_Sans({
  weight:   ['400', '500', '600', '700', '800', '900'],
  style:    ['normal', 'italic'],
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  display:  'swap',
})

/* DM Mono — the service page reference design uses it for kickers,
   form labels, stats and metadata (styles.css --font-mono) */
const dmMono = DM_Mono({
  weight:   ['400', '500'],
  subsets:  ['latin'],
  variable: '--font-dm-mono',
  display:  'swap',
})

const inter = Inter({
  weight:   ['400', '500', '600'],
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

/* Redesign type system: Manrope everywhere (the logo's wordmark face),
   Doto (OFL dot-matrix) only for the departure board's numerals. */
const manrope = Manrope({
  subsets:  ['latin'],
  variable: '--font-manrope',
  display:  'swap',
})

const doto = Doto({
  weight:   ['700', '900'],
  subsets:  ['latin'],
  variable: '--font-doto',
  display:  'swap',
})

export const metadata: Metadata = {
  title:       'Gripwell — Tyres & Wheels, London',
  description: 'Buy tyres and wheels online and get them fitted same day at one of our 7 stores across London.',
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/brand/favicon.ico', sizes: 'any' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
  manifest: '/brand/site.webmanifest',
  openGraph: { images: [{ url: '/brand/og-image.png', width: 1200, height: 630 }] },
  twitter:   { card: 'summary_large_image', images: ['/brand/og-image.png'] },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmMono.variable} ${inter.variable} ${manrope.variable} ${doto.variable}`}
    >
      <head>
        {/* Tabler icons CDN — kept here as it is a CSS icon font, not a text font */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
