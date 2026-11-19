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

/* The list is rendered twice so the -50% keyframe lands exactly on the seam,
   making the scroll look continuous. The duplicate half is decorative. */
const LOOP = [...BRANDS, ...BRANDS]

export default function BrandsStrip() {
  return (
    <section
      style={{
        background: '#FFFFFF', borderTop: '1px solid #E7E5DE', borderBottom: '1px solid #E7E5DE',
        padding: 'clamp(44px,5vw,68px) 0 0', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif",
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
          <span style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#FF6A1A', marginBottom: '12px' }}>
            Brands in stock
          </span>
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(36px,4.6vw,58px)', letterSpacing: '0.015em', lineHeight: 1, color: '#1A1D23' }}>
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

      {/* Edges fade out under a mask so names enter and leave without a hard cut */}
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div
          style={{
            position: 'relative', padding: 'clamp(24px,3vw,34px) 0',
            border: '1px solid #E7E5DE', borderRadius: '22px', overflow: 'hidden',
            WebkitMaskImage: 'linear-gradient(to right,transparent,#000 6%,#000 94%,transparent)',
            maskImage:       'linear-gradient(to right,transparent,#000 6%,#000 94%,transparent)',
          }}
        >
          <div className="nv-marquee" style={{ display: 'flex', width: 'max-content', gap: '16px' }}>
            {LOOP.map((b, i) => (
              <span
                key={`${b.name}-${i}`}
                aria-hidden={i >= BRANDS.length}
                style={{
                  flex: '0 0 auto', width: '176px', height: '76px',
                  border: '1px solid #E7E5DE', borderRadius: '12px', backgroundColor: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '17px', fontFamily: "'DM Sans', sans-serif", fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1A1D23',
                }}
              >
                {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
