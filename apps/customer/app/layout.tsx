import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import TrustBar from './components/home/TrustBar'

export const metadata: Metadata = {
  title: 'Nova Tyres — Australia\'s Best Tyre Deals',
  description: 'Buy tyres online and get them fitted same day at one of our 9 locations across Australia.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css"
        />
      </head>
      <body>
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 60
  }}>
    <TrustBar />
    <Navbar />
  </div>
  {children}
  <Footer />
</body>
    </html>
  )
}