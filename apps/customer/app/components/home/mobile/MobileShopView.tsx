import Link from 'next/link'

/*
  The "Shop" view from the Mobile Hero artboard's bottom-nav (`goShop` →
  view: 'shop'). A hub screen, not a jump straight to /tyres: a 2×2 grid of
  destinations plus a "More" list. Rendered as an overlay by MobileTabBar so
  the green header and the tab bar stay put, matching the artboard.
*/

const DEST = [
  { label: 'Find Tyres',  href: '/tyres',    icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.4" /></> },
  { label: 'Find Wheels', href: '/wheels',   icon: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.4" /><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.6 2.6M18 6l-2.6 2.6M6 18l2.6-2.6M18 18l-2.6-2.6" /></> },
  { label: 'Service',     href: '/service',  icon: <path d="M14.6 6.4a4 4 0 0 1-5.2 5.2l-5.7 5.7a2 2 0 1 0 2.8 2.8l5.7-5.7a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.2-2.2 2.5-2.5Z" /> },
  { label: 'Warranty',    href: '/warranty', icon: <><path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6Z" /><path d="M9 12l2 2 4-4" /></> },
]

const MORE = [
  { label: 'Store locations',  href: '/service?goto=shops' },
  { label: 'Warranty details', href: '/warranty' },
]

const heading: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
  textTransform: 'uppercase', marginBottom: '10px',
}

export default function MobileShopView({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <section style={{ background: '#FAF9F5', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '18px', animation: 'nvMobFade .25s ease' }}>
      <div>
        <span style={{ ...heading, color: '#FF6A1A' }}>Shop</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {DEST.map(d => (
            <Link
              key={d.label}
              href={d.href}
              onClick={onNavigate}
              style={{ textDecoration: 'none', background: '#FFFFFF', border: '1px solid #E7E5DE', borderRadius: '14px', padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <span style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#F0EFE9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2A2E36" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d.icon}</svg>
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1A1D23' }}>{d.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <span style={{ ...heading, color: '#6B7280' }}>More</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {MORE.map((m, i) => (
            <Link
              key={m.label}
              href={m.href}
              onClick={onNavigate}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 4px', borderBottom: i === MORE.length - 1 ? 'none' : '1px solid #E7E5DE', textDecoration: 'none', color: '#1A1D23', fontSize: '14px', fontWeight: 600 }}
            >
              {m.label}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9EA3AD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
