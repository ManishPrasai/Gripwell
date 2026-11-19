import Link from 'next/link'
import Image from 'next/image'
import MobileHeader from './MobileHeader'
import MobileDealsRail from './MobileDealsRail'
import MobileServicesList from './MobileServicesList'
import MobileStoreMap from './MobileStoreMap'
import MobileTabBar from '../../layout/mobile/MobileTabBar'
import MobileFooter from '../../layout/mobile/MobileFooter'
import { STORES, telHref } from '../../../../lib/stores'
import { money, DEFAULT_FITTING_PRICES } from '../../../../lib/fitting'

/*
  Phone / tablet homepage — the [data-vw="mobile"] tree.

  Ported from the "Mobile Hero — Find My Tyre" artboard. The file is a server
  component (zero JavaScript) except four small client islands: MobileHeader
  (cart badge), MobileFindTyre (hero size flow), MobileDealsRail (featured
  feed) and MobileServicesList / MobileTabBar. Everything else is static
  markup, so the tree a desktop visitor never sees costs almost nothing.

  Data is shared with the desktop sections — same store list (lib/stores),
  same brand set (BrandsStrip), same admin-featured product feed — so the two
  designs can't drift. Only the layout differs.

  On tablet widths the whole thing is a centred 480px column (.nv-mob-shell)
  on a dark backdrop, rather than a stretched-wide phone layout.
*/

const CATEGORIES = [
  { name: 'Passenger',   href: '/tyres/results?type=PASSENGER',   img: '/images/tyres/tyre-passenger.png' },
  { name: '4x4 / SUV',   href: '/tyres/results?type=SUV',         img: '/images/tyres/tyre-neutral.png' },
  { name: 'Mud-Terrain', href: '/tyres/results?type=MUD_TERRAIN', img: '/images/tyres/tyre-neutral.png' },
  { name: 'Wheels',      href: '/wheels',                          img: '/images/tyres/tyre-neutral.png' },
]

/* Same nine as the desktop BrandsStrip marquee. */
const BRANDS = [
  { name: 'Meridian' },
  { name: 'Corsaro' },
  { name: 'Kova' },
  { name: 'Zetland' },
  { name: 'Terrain X' },
  { name: 'Brackley' },
]

const STANDARD = [
  { n: '01', t: 'Clear, all-in prices',       d: `Prices include VAT. Fitting from ${money(DEFAULT_FITTING_PRICES.passenger, { whole: true })} a tyre, balancing and valves included.` },
  { n: '02', t: 'Warehouse-direct prices',    d: 'No middleman markup — just fair prices on every brand.' },
]

const SOCIAL = [
  { src: '/images/social/social-1.jpg', tag: 'IG', alt: 'Customer car on the open road' },
  { src: '/images/social/social-2.jpg', tag: 'IG', alt: 'Fresh set of wheels in the bay' },
  { src: '/images/social/social-3.jpg', tag: 'FB', alt: 'A Gripwell fit-out' },
  { src: '/images/social/social-4.jpg', tag: 'IG', alt: 'Front end of a customer car' },
]

export default function MobileHome({ hero }: { hero?: React.ReactNode }) {
  const storeList = STORES

  return (
    <div style={{ background: '#1A1D23' }}>
      <div className="nv-mob-shell" style={{ background: '#FAF9F5', fontFamily: "'DM Sans', sans-serif", maxWidth: '480px', margin: '0 auto' }}>
        <MobileHeader />
        {hero}

        {/* ── Best deals (admin-featured feed) ────────────────── */}
        <MobileDealsRail />

        {/* ── Shop by category ───────────────────────────────── */}
        <section style={{ background: '#FAF9F5', padding: '22px 0 28px 16px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF6A1A', marginBottom: '10px', paddingRight: '16px' }}>
            Shop by category
          </span>
          <div className="nv-mob-rail" style={{ paddingRight: '16px' }}>
            {CATEGORIES.map(c => (
              <Link key={c.name} href={c.href} style={{ width: '116px', background: '#FFFFFF', border: '1px solid #E7E5DE', borderRadius: '14px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                  <Image src={c.img} alt={c.name} fill sizes="64px" style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1A1D23' }}>{c.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Services ───────────────────────────────────────── */}
        <section style={{ background: '#FFFFFF', padding: '22px 16px 28px', borderTop: '1px solid #E7E5DE' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF6A1A' }}>
              More than tyres · Services
            </span>
            <Link href="/service" style={{ flexShrink: 0, border: '1.5px solid #2A2E36', color: '#2A2E36', textDecoration: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '11.5px', fontWeight: 700 }}>
              Book
            </Link>
          </div>
          <MobileServicesList />
        </section>

        {/* ── The Gripwell Standard ──────────────────────────────── */}
        <section style={{ background: '#0F2A1C', padding: '26px 16px 30px' }}>
          <span style={{ display: 'block', color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            The Gripwell Standard
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {STANDARD.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: '12px', padding: '14px 0', borderTop: '1px solid rgba(255,255,255,.15)', borderBottom: i === STANDARD.length - 1 ? '1px solid rgba(255,255,255,.15)' : undefined }}>
                <span style={{ color: '#FF6A1A', fontSize: '20px', fontWeight: 700, flexShrink: 0 }}>{s.n}</span>
                <div>
                  <span style={{ display: 'block', color: '#fff', fontSize: '13.5px', fontWeight: 700, marginBottom: '3px' }}>{s.t}</span>
                  <span style={{ display: 'block', color: '#9EA3AD', fontSize: '12px', lineHeight: 1.5 }}>{s.d}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Brands ─────────────────────────────────────────── */}
        <section style={{ background: '#FAF9F5', padding: '24px 16px 28px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', marginBottom: '14px' }}>
            Brands we carry
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {BRANDS.map(b => (
              <div key={b.name} style={{ background: '#FFFFFF', border: '1px solid #E7E5DE', borderRadius: '8px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                <span style={{ fontSize: '12px', fontFamily: "'DM Sans', sans-serif", fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1A1D23', textAlign: 'center' }}>{b.name}</span>
              </div>
            ))}
          </div>
          <Link href="/tyres" style={{ display: 'inline-block', marginTop: '14px', fontSize: '12.5px', fontWeight: 700, color: '#2A2E36', textDecoration: 'none' }}>
            Search by brand →
          </Link>
        </section>

        {/* ── Find a store (real network) ────────────────────── */}
        <section style={{ background: '#FAF9F5', padding: '24px 16px 30px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B7280', marginBottom: '14px' }}>
            Find a store
          </span>
          <MobileStoreMap />
          <div className="nv-mob-vscroll" style={{ background: '#FFFFFF', border: '1px solid #E7E5DE', borderRadius: '12px', padding: '4px 14px', maxHeight: '256px' }}>
            {storeList.map((s, i) => (
              <a
                key={s.id}
                href={telHref(s.tel)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '12px 2px', borderBottom: i === storeList.length - 1 ? 'none' : '1px solid #EEE', textDecoration: 'none' }}
              >
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1A1D23' }}>{s.short}</span>
                  <span style={{ display: 'block', fontSize: '11px', color: '#9EA3AD', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.suburb}</span>
                </span>
                <span style={{ flexShrink: 0, fontSize: '11.5px', fontWeight: 700, color: '#2A2E36' }}>{s.tel}</span>
              </a>
            ))}
          </div>
          <Link href="/service?goto=shops" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12.5px', fontWeight: 700, color: '#2A2E36', textDecoration: 'none' }}>
            View all {STORES.length} locations →
          </Link>
        </section>

        {/* ── Social ─────────────────────────────────────────── */}
        <section style={{ background: '#FFFFFF', borderTop: '1px solid #E7E5DE', padding: '26px 0 4px' }}>
          <div style={{ padding: '0 16px', marginBottom: '14px' }}>
            <h2 style={{ margin: '0 0 8px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: '22px', letterSpacing: '0.02em', color: '#1A1D23' }}>
              <span style={{ color: '#FF6A1A' }}>#gripwell</span> in Social Media
            </h2>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['Facebook', 'Instagram', 'TikTok'].map(s => (
                <span key={s} style={{ fontSize: '12px', fontWeight: 700, color: '#2A2E36' }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 0 }}>
            {SOCIAL.map(s => (
              <div key={s.src} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#12241A' }}>
                <Image src={s.src} alt={s.alt} fill sizes="50vw" style={{ objectFit: 'cover' }} />
                <span style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(13,26,18,.72)', color: '#F1EFE7', fontSize: '9px', padding: '2px 6px', borderRadius: '5px' }}>{s.tag}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <MobileFooter />

        <MobileTabBar />
      </div>
    </div>
  )
}
