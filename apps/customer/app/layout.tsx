import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, Inter } from 'next/font/google'
import './globals.css'
import Navbar    from './components/layout/Navbar'
import Footer    from './components/layout/Footer'
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
  weight:   ['400', '500', '700', '900'],
  style:    ['normal', 'italic'],
  subsets:  ['latin'],
  variable: '--font-dm-sans',
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
      className={`${bebasNeue.variable} ${dmSans.variable} ${inter.variable}`}
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
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
            <Navbar />
          </div>
          {children}
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
