import Link from 'next/link'
import Image from 'next/image'
import MobileHeader from '../../home/mobile/MobileHeader'
import MobileTabBar from '../../layout/mobile/MobileTabBar'
import MobileFooter from '../../layout/mobile/MobileFooter'
import MobileFindTyresFaq from './MobileFindTyresFaq'
import MobileStoreRail from '../../layout/mobile/MobileStoreRail'

/*
  Phone / tablet "Find Tyres" page — the [data-vw="mobile"] tree for /tyres.

  Ported from the "Mobile Find Tyres" artboard. Server component (zero JS) bar
  the shared client islands: MobileHeader (cart badge), MobileTabBar (nav +
  Shop/Search overlays) and MobileFindTyresFaq (accordion). Categories, brands
  and store data are the same sources the desktop /tyres sections read, so the
  two designs can't drift.
*/

/* Same four real TyreTypes as the desktop ShopByTyreType. */
const TYPES = [
  { name: 'Passenger',   href: '/tyres/results?type=PASSENGER',   img: '/images/tyres/tyre-passenger.png',   alt: 'Passenger tyre' },
  { name: '4x4 / SUV',   href: '/tyres/results?type=SUV',         img: '/images/tyres/tyre-suv.png',         alt: '4x4 and SUV tyre' },
  { name: 'Commercial',  href: '/tyres/results?type=COMMERCIAL',  img: '/images/tyres/tyre-all-terrain.png', alt: 'Commercial tyre' },
  { name: 'Mud Terrain', href: '/tyres/results?type=MUD_TERRAIN', img: '/images/tyres/tyre-mud.png',         alt: 'Mud-terrain tyre' },
]

const BRAND_LOGOS = [
  { name: 'Michelin',    src: '/images/brands/michelin.svg' },
  { name: 'Pirelli',     src: '/images/brands/pirelli.svg' },
  { name: 'Bridgestone', src: '/images/brands/bridgestone.svg' },
  { name: 'Maxxis',      src: '/images/brands/maxxis.svg' },
  { name: 'Hankook',     src: '/images/brands/hankook.svg' },
]

const kicker: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#E8572A',
}

const tileBox: React.CSSProperties = {
  height: '52px', background: '#fff', border: '1px solid #E7E5DE', borderRadius: '10px',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px',
}

export default function MobileFindTyres() {
  return (
    <div style={{ background: '#0D1A12' }}>
      <div className="nv-mob-shell" style={{ background: '#FAF9F5', fontFamily: "'DM Sans', sans-serif", maxWidth: '480px', margin: '0 auto' }}>
        <MobileHeader />

        {/* ── Hero ────────────────────────────────────────────── */}
        <section style={{ background: '#111', padding: '34px 16px', textAlign: 'center' }}>
          <span style={{ display: 'block', color: 'rgba(255,255,255,.7)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Premium Performance Every Journey
          </span>
          <h1 style={{ margin: 0, color: '#E8572A', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.01em' }}>
            Our Tyre Collection
          </h1>
        </section>

        {/* ── Shop by tyre type ──────────────────────────────── */}
        <section style={{ padding: '18px 0 20px 16px' }}>
          <span style={{ ...kicker, marginBottom: '2px', paddingRight: '16px' }}>Every drive covered</span>
          <h2 style={{ margin: '2px 0 12px', fontSize: '18px', fontWeight: 800, color: '#16211B', textTransform: 'uppercase', paddingRight: '16px' }}>
            Shop by tyre type
          </h2>
          <div className="nv-mob-rail" style={{ paddingRight: '16px' }}>
            {TYPES.map(t => (
              <Link key={t.name} href={t.href} style={{ width: '118px', textDecoration: 'none', background: '#FAF9F5', border: '1px solid #E7E5DE', borderRadius: '8px', padding: '10px' }}>
                <div style={{ position: 'relative', aspectRatio: '1', marginBottom: '8px' }}>
                  <Image src={t.img} alt={t.alt} fill sizes="118px" style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 800, color: '#16211B', textTransform: 'uppercase' }}>
                  {t.name} <span style={{ color: '#E8572A' }}>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Brands we serve ────────────────────────────────── */}
        <section style={{ padding: '20px 16px', borderTop: '1px solid #E7E5DE' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={kicker}>Brands we serve</span>
            <h2 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800, color: '#16211B' }}>80+ brands, original stock</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
            {BRAND_LOGOS.map(b => (
              <div key={b.name} style={tileBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.src} alt={b.name} loading="lazy" style={{ maxHeight: '22px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            ))}
            <Link href="/tyres/results" style={{ ...tileBox, textDecoration: 'none', fontSize: '10px', fontWeight: 800, color: '#6E7C74' }}>
              +75 more
            </Link>
          </div>
          <Link href="/tyres/results" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12.5px', fontWeight: 700, color: '#076330', textDecoration: 'none' }}>
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
          <MobileFindTyresFaq />
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <MobileFooter />

        <MobileTabBar active="shop" />
      </div>
    </div>
  )
}
