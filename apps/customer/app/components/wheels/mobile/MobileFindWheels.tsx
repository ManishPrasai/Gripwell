import Link from 'next/link'
import MobileHeader from '../../home/mobile/MobileHeader'
import MobileTabBar from '../../layout/mobile/MobileTabBar'
import MobileFooter from '../../layout/mobile/MobileFooter'
import MobileStoreRail from '../../layout/mobile/MobileStoreRail'
import MobileFeaturedWheels from './MobileFeaturedWheels'
import MobileFindWheelsFaq from './MobileFindWheelsFaq'

/*
  Phone / tablet "Find Wheels" page — the [data-vw="mobile"] tree for /wheels.

  Same design language as MobileFindTyres (dark hero, kicker + uppercase H2,
  horizontal card rails, shared store rail / footer / tab bar). Content is
  wheel-specific: featured wheels (4, matching the desktop FeaturedWheels
  count), wheel brands.
*/

const BRAND_LOGOS = [
  { name: 'King Wheels', src: '/images/brands/king-wheels.svg' },
  { name: 'ROH',         src: '/images/brands/roh.svg' },
  { name: 'Black Rhino', src: '/images/brands/Black Rino.svg' },
  { name: 'Sonix',       src: '/images/brands/sonix.svg' },
]

const kicker: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#E8572A',
}

const tileBox: React.CSSProperties = {
  height: '52px', background: '#fff', border: '1px solid #E7E5DE', borderRadius: '10px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px',
}

export default function MobileFindWheels() {
  return (
    <div style={{ background: '#0D1A12' }}>
      <div className="nv-mob-shell" style={{ background: '#FAF9F5', fontFamily: "'DM Sans', sans-serif", maxWidth: '480px', margin: '0 auto' }}>
        <MobileHeader />

        {/* ── Hero ────────────────────────────────────────────── */}
        <section style={{ background: '#111', padding: '34px 16px', textAlign: 'center' }}>
          <span style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Style Meets Strength
          </span>
          <h1 style={{ margin: 0, color: '#E8572A', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.01em' }}>
            Our Wheel Collection
          </h1>
        </section>

        {/* ── Featured wheels (4, matches desktop) ────────────── */}
        <MobileFeaturedWheels />

        {/* ── Brands we serve ────────────────────────────────── */}
        <section style={{ padding: '20px 16px', borderTop: '1px solid #E7E5DE' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={kicker}>Brands we serve</span>
            <h2 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800, color: '#16211B' }}>Alloy wheels, original stock</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
            {BRAND_LOGOS.map(b => (
              <div key={b.name} style={tileBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.src} alt={b.name} loading="lazy" style={{ maxHeight: '22px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            ))}
            <Link href="/wheels/results" style={{ ...tileBox, textDecoration: 'none', fontSize: '10px', fontWeight: 800, color: '#6E7C74' }}>
              +more
            </Link>
          </div>
          <Link href="/wheels/results" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12.5px', fontWeight: 700, color: '#076330', textDecoration: 'none' }}>
            Shop all brands →
          </Link>
        </section>

        {/* ── Find a store ───────────────────────────────────── */}
        <MobileStoreRail />

        {/* ── FAQ ────────────────────────────────────────────── */}
        <section style={{ background: '#fff', padding: '20px 16px 24px', borderTop: '1px solid #E7E5DE' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 800, color: '#16211B', textTransform: 'uppercase' }}>
            Frequently asked questions
          </h2>
          <MobileFindWheelsFaq />
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <MobileFooter />

        <MobileTabBar active="shop" />
      </div>
    </div>
  )
}
