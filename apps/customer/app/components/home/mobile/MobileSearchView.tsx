import Link from 'next/link'

/*
  The "Search" view from the Mobile Hero artboard's bottom-nav (`goSearch` →
  view: 'search'). The artboard's search field is a static prompt; here the
  whole field and each recent chip are real links into /tyres/results.
  Rendered as an overlay by MobileTabBar.
*/

const RECENT = [
  { label: '205/55R16',          href: '/tyres/results?width=205&profile=55&rim=16' },
  { label: 'Michelin Primacy 4', href: '/tyres/results?q=Michelin%20Primacy%204' },
  { label: '225/45R17',          href: '/tyres/results?width=225&profile=45&rim=17' },
]

export default function MobileSearchView({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <section style={{ background: '#FAF9F5', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '14px', animation: 'nvMobFade .25s ease' }}>
      <Link
        href="/tyres/results"
        onClick={onNavigate}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', border: '1.6px solid #E8572A', borderRadius: '10px', padding: '12px 14px', textDecoration: 'none' }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E8572A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <span style={{ fontSize: '14px', color: '#9DB0A5' }}>Search tyres, sizes, brands…</span>
      </Link>

      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#6E7C74', textTransform: 'uppercase' }}>
        Recent searches
      </span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {RECENT.map((r, i) => (
          <Link
            key={r.label}
            href={r.href}
            onClick={onNavigate}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 2px', borderBottom: i === RECENT.length - 1 ? 'none' : '1px solid #E7E5DE', textDecoration: 'none', color: '#16211B' }}
          >
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0EFE9', flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{r.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
