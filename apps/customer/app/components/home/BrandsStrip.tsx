import Link from 'next/link'

const BRANDS = [
  { name: 'Meridian' },
  { name: 'Corsaro' },
  { name: 'Kova' },
  { name: 'Zetland' },
  { name: 'Terrain X' },
  { name: 'Brackley' },
  { name: 'Halden' },
  { name: 'Ostra' },
  { name: 'Marlow' },
  { name: 'Vanta' },
]

export default function BrandsStrip() {
  return (
    <section
      style={{
        background: '#FFFFFF', borderTop: '1px solid #E7E5DE', borderBottom: '1px solid #E7E5DE',
        padding: 'clamp(44px,5vw,68px) 0 0', fontFamily: 'var(--gw-font)',
      }}
    >
      <div
        style={{
          maxWidth: '1180px', margin: '0 auto clamp(28px,3.4vw,44px)',
          padding: '0 clamp(16px,4vw,40px)', display: 'flex', flexWrap: 'wrap',
          alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px 24px',
        }}
      >
        <div>
          <span style={{ display: 'block', fontFamily: 'var(--gw-font)', fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#FF6A1A', marginBottom: '12px' }}>
            Brands in stock
          </span>
          <h2 style={{ margin: 0, fontFamily: 'var(--gw-font)', fontWeight: 800, fontSize: 'clamp(26px,3.3vw,42px)', letterSpacing: '-0.02em', lineHeight: 1, color: '#1A1D23' }}>
            Our Brands
          </h2>
        </div>
        <Link
          href="/tyres"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontWeight: 700, color: '#2A2E36', textDecoration: 'none', paddingBottom: '4px', borderBottom: '1.5px solid transparent', transition: 'border-color .2s' }}
        >
          Search by brand
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* Static wrap: every brand fully visible at every width, no clipping marquee */}
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px) clamp(44px,5vw,68px)' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: '12px' }}>
          {BRANDS.map(b => (
            <li
              key={b.name}
              style={{
                height: '68px', border: '1px solid #E7E5DE', borderRadius: '12px', backgroundColor: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1A1D23',
              }}
            >
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
