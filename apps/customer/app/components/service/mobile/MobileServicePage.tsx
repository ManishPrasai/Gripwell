import MobileHeader from '../../home/mobile/MobileHeader'
import MobileTabBar from '../../layout/mobile/MobileTabBar'
import MobileFooter from '../../layout/mobile/MobileFooter'
import MobileServiceTiers from './MobileServiceTiers'
import MobileServiceReviews from './MobileServiceReviews'
import MobileServiceBooking from './MobileServiceBooking'
import MobileServiceLocations from './MobileServiceLocations'

/*
  Phone / tablet Service page — the [data-vw="mobile"] tree for /service.
  Ported from the "Mobile Service Page" artboard, same design language as the
  other mobile pages (dark hero, kicker + H2, shared footer / tab bar). The
  interactive blocks — service tiers, Google-reviews, call-back form, store
  accordion — are the client islands; everything else is static markup.
*/

const MARQUEE = ['Fully Qualified Mechanics', 'Warranty-Safe Log Books', 'Quality Parts & Oils', 'Free Safety Inspection', 'Pre-RWC Checks']

const FREEBIES = [
  { title: 'Pre-RWC Check', body: 'Going for a Road Worthy Certificate? We inspect your vehicle and tell you exactly what it needs to pass — before you spend a cent on the test.', cta: 'Book a free check →', href: '#svc-book' },
  { title: 'Safety Inspection', body: "Get your tyres fitted with us and we'll run a complimentary safety inspection of your car — so you always leave knowing you're safe on the road.", cta: 'Browse tyres →', href: '/tyres' },
]

const WHY = [
  { icon: '🔧', title: 'Quality Parts & Oils', desc: 'Only genuine-grade parts and oils — never cut corners.', idx: '01' },
  { icon: '🛡', title: 'Warranty-Safe', desc: 'Log book stamped — your new-car warranty stays intact.', idx: '02' },
  { icon: '☀', title: 'Fully Qualified', desc: 'Right tools, right training, every time.', idx: '03' },
  { icon: '🕐', title: 'Safety First', desc: 'Safety inspection comes standard with every service.', idx: '04' },
]

const BRANDS = [
  { name: 'Continental', src: '/images/brands/continental.svg' },
  { name: 'Pirelli', src: '/images/brands/pirelli.svg' },
  { name: 'Bridgestone', src: '/images/brands/bridgestone.svg' },
  { name: 'Michelin', src: '/images/brands/michelin.svg' },
  { name: 'Yokohama', src: '/images/brands/yokohama.svg' },
  { name: 'Hankook', src: '/images/brands/hankook.svg' },
  { name: 'BFGoodrich', src: '/images/brands/bfgoodrich.svg' },
]

const STATS = [
  { n: '40+', l: 'Brands' }, { n: '6', l: 'Workshops' }, { n: '98%', l: 'Recommend' }, { n: '15+', l: 'Years' },
]

const kicker: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#E8572A',
}

export default function MobileServicePage() {
  return (
    <div style={{ background: '#0D1A12' }}>
      <div className="nv-mob-shell" style={{ background: '#FAF9F5', fontFamily: "'DM Sans', sans-serif", maxWidth: '480px', margin: '0 auto' }}>
        <MobileHeader />

        {/* ── Hero ────────────────────────────────────────────── */}
        <section style={{ background: '#111', padding: '32px 16px' }}>
          <span style={{ display: 'block', color: '#9DB0A5', fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Auto service · Melbourne-wide
          </span>
          <h1 style={{ margin: '0 0 8px', color: '#fff', fontSize: '26px', fontWeight: 800, lineHeight: 1.05 }}>
            Servicing<br />done <em style={{ color: '#E8572A', fontStyle: 'normal' }}>right.</em>
          </h1>
          <p style={{ margin: '0 0 14px', color: '#ccc', fontSize: '12.5px', lineHeight: 1.5 }}>
            From a free Pre-RWC check to the Ultimate overhaul — fully qualified mechanics, quality parts, and a log-book stamp that keeps your warranty intact.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <a href="#svc-tiers" style={{ background: '#E8572A', color: '#fff', fontSize: '12px', fontWeight: 700, borderRadius: '8px', padding: '9px 14px', textDecoration: 'none' }}>Explore services →</a>
            <a href="#svc-book" style={{ border: '1px solid rgba(255,255,255,.4)', color: '#fff', fontSize: '12px', fontWeight: 700, borderRadius: '8px', padding: '9px 14px', textDecoration: 'none' }}>Get a call-back</a>
          </div>
          <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,.15)', paddingTop: '12px' }}>
            {[['10+', 'Locations AUS-wide'], ['100%', 'Warranty-safe'], ['<1HR', 'Call-back time']].map(([n, l]) => (
              <div key={l}>
                <span style={{ display: 'block', color: '#fff', fontSize: '16px', fontWeight: 800 }}>{n}</span>
                <span style={{ fontSize: '9px', color: '#9DB0A5' }}>{l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Marquee strip ──────────────────────────────────── */}
        <div style={{ background: '#076330', padding: '7px 0', overflow: 'hidden' }}>
          <div className="nv-mob-marquee" style={{ gap: '20px', whiteSpace: 'nowrap' }}>
            {[0, 1].map(k => (
              <span key={k} style={{ color: '#fff', fontSize: '10px', fontWeight: 700, paddingRight: '20px' }}>
                {MARQUEE.join(' · ')} ·
              </span>
            ))}
          </div>
        </div>

        {/* ── Two things we do for free ──────────────────────── */}
        <section style={{ padding: '20px 16px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={kicker}>On the house</span>
          <h2 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#16211B' }}>Two things we do for free.</h2>
          {FREEBIES.map(f => (
            <div key={f.title} style={{ background: '#FAF9F5', border: '1px solid #E7E5DE', borderRadius: '12px', padding: '14px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#076330', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '5px' }}>Free</span>
              <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 800, color: '#16211B', paddingRight: '40px' }}>{f.title}</span>
              <p style={{ margin: '6px 0 8px', fontSize: '11.5px', color: '#666', lineHeight: 1.5 }}>{f.body}</p>
              <a href={f.href} style={{ fontSize: '11.5px', fontWeight: 700, color: '#076330', textDecoration: 'none' }}>{f.cta}</a>
            </div>
          ))}
        </section>

        {/* ── Service menu ───────────────────────────────────── */}
        <section id="svc-tiers" style={{ background: '#fff', borderTop: '1px solid #E7E5DE', padding: '22px 16px 24px', scrollMarginTop: '56px' }}>
          <span style={kicker}>Service menu</span>
          <h2 style={{ margin: '4px 0 14px', fontSize: '17px', fontWeight: 800, color: '#16211B' }}>Pick your level of service.</h2>
          <MobileServiceTiers />
        </section>

        {/* ── Why Nova ───────────────────────────────────────── */}
        <section style={{ background: '#fff', padding: '22px 16px 24px', borderTop: '1px solid #E7E5DE' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#999', letterSpacing: '0.1em', marginBottom: '6px' }}>
            <span style={{ width: '11px', height: '1px', background: '#E8572A' }} />WHY NOVA
          </span>
          <h2 style={{ margin: '0 0 14px', fontSize: '22px', fontWeight: 800, color: '#16211B', lineHeight: 1.1, textTransform: 'uppercase' }}>
            Servicing you<br />can trust.
          </h2>
          <div style={{ border: '1px solid #E7E5DE', borderRadius: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {WHY.map((w, i) => (
              <div key={w.title} style={{ padding: '13px', borderRight: i % 2 === 0 ? '1px solid #E7E5DE' : 'none', borderBottom: i < 2 ? '1px solid #E7E5DE' : 'none' }}>
                <span style={{ color: '#E8572A', fontSize: '15px' }}>{w.icon}</span>
                <span style={{ display: 'block', fontSize: '9.5px', fontWeight: 800, color: '#16211B', marginTop: '6px', textTransform: 'uppercase' }}>{w.title}</span>
                <span style={{ display: 'block', fontSize: '9px', color: '#666', lineHeight: 1.4, marginTop: '4px' }}>{w.desc}</span>
                <span style={{ display: 'block', fontSize: '8px', color: '#aaa', marginTop: '6px' }}>{w.idx}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Brands we service & sell ───────────────────────── */}
        <section style={{ background: '#FAF9F5', padding: '22px 0 24px 16px', borderTop: '1px solid #E7E5DE' }}>
          <span style={{ display: 'inline-block', border: '1px solid #E7E5DE', borderRadius: '12px', padding: '3px 9px', fontSize: '9px', fontWeight: 700, color: '#666', marginBottom: '10px' }}>Our partners</span>
          <h2 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 800, color: '#16211B', paddingRight: '16px' }}>Brands we service &amp; sell</h2>
          <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#666', paddingRight: '16px' }}>Budget to premium — every major tyre, wheel &amp; lubricant brand.</p>
          <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)' }}>
            <div className="nv-mob-marquee" style={{ gap: '10px', animationDuration: '18s' }}>
              {[...BRANDS, ...BRANDS].map((b, i) => (
                <div key={`${b.name}-${i}`} style={{ flex: 'none', width: '82px', height: '48px', background: '#fff', border: '1px solid #E7E5DE', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.src} alt={b.name} loading="lazy" style={{ maxHeight: '18px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ border: '1px solid #E7E5DE', borderRadius: '12px', display: 'flex', margin: '14px 16px 0 0' }}>
            {STATS.map((s, i) => (
              <div key={s.l} style={{ flex: 1, padding: '10px 5px', textAlign: 'center', borderRight: i < STATS.length - 1 ? '1px solid #E7E5DE' : 'none' }}>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#16211B' }}>{s.n}</span>
                <span style={{ fontSize: '7.5px', color: '#666' }}>{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Google reviews ─────────────────────────────────── */}
        <MobileServiceReviews />

        {/* ── Book a service ─────────────────────────────────── */}
        <section id="svc-book" style={{ background: '#FAF9F5', padding: '22px 16px 24px', borderTop: '1px solid #E7E5DE', scrollMarginTop: '56px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#999', letterSpacing: '0.08em', marginBottom: '6px' }}>
            <span style={{ width: '9px', height: '1px', background: '#E8572A' }} />BOOK A SERVICE
          </span>
          <h2 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 800, color: '#16211B', lineHeight: 1.15, textTransform: 'uppercase' }}>
            Tell us about your car.
          </h2>
          <p style={{ margin: '0 0 14px', fontSize: '11px', color: '#666', lineHeight: 1.5 }}>
            Enter your details and we&apos;ll call you back — usually within the hour during opening times.
          </p>
          <MobileServiceBooking />
        </section>

        {/* ── Where to find us ───────────────────────────────── */}
        <section style={{ background: '#fff', padding: '22px 16px 24px', borderTop: '1px solid #E7E5DE' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#999', letterSpacing: '0.08em', marginBottom: '6px' }}>
            <span style={{ width: '9px', height: '1px', background: '#E8572A' }} />FIND YOUR NEAREST SHOP
          </span>
          <h2 style={{ margin: '0 0 12px', fontSize: '17px', fontWeight: 800, color: '#16211B', lineHeight: 1.2 }}>Where to find us.</h2>
          <MobileServiceLocations />
        </section>

        {/* ── Footer ─────────────────────────────────────────── */}
        <MobileFooter />

        <MobileTabBar active="shop" />
      </div>
    </div>
  )
}
