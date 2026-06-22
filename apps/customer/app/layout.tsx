import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, DM_Mono, Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import { Analytics } from '@vercel/analytics/next'

/* ── Google Fonts via next/font ──────────────────────────────────────────
   Fonts are downloaded at build time, self-hosted by Next.js, and injected
   as @font-face — no external network request at runtime, no layout shift,
   and no "custom font in <head>" linting warning.
──────────────────────────────────────────────────────────────────────── */
const bebasNeue = Bebas_Neue({
  weight:   ['400'],
  subsets:  ['latin'],
  variable: '--font-bebas-neue',
  display:  'swap',
})

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

export const metadata: Metadata = {
  title:       "Nova Tyres — Australia's Best Tyre Deals",
  description: 'Buy tyres online and get them fitted same day at one of our 9 locations across Australia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable} ${inter.variable}`}
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
