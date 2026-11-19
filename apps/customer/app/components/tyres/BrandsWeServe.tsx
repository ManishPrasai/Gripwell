'use client'

import { useState } from 'react'
import Link from 'next/link'
import { C, FONT, CONTAINER, KICKER } from '../shop/tokens'

/* Every brand we stock, as a text wordmark (no manufacturer artwork).
   `cat` routes each tile to the catalogue that stocks it. */
const BRANDS: { name: string; cat: 'tyres' | 'wheels' | 'none' }[] = [
  { name: 'Meridian', cat: 'tyres' },
  { name: 'Corsaro', cat: 'tyres' },
  { name: 'Kova', cat: 'tyres' },
  { name: 'Zetland', cat: 'tyres' },
  { name: 'Terrain X', cat: 'tyres' },
  { name: 'Brackley', cat: 'tyres' },
  { name: 'Halden', cat: 'wheels' },
  { name: 'Ostra', cat: 'wheels' },
  { name: 'Marlow', cat: 'wheels' },
  { name: 'Vanta', cat: 'wheels' },
]

function brandHref(b: (typeof BRANDS)[number]): string {
  if (b.cat === 'none') return '/tyres/results'
  return `/${b.cat}/results?brand=${encodeURIComponent(b.name)}`
}

export default function BrandsWeServe() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section style={{ background: '#fff', padding: '0 clamp(16px,3vw,64px) clamp(36px,5vw,56px)', fontFamily: FONT }}>
      <div style={{ ...CONTAINER, borderTop: `1px solid ${C.line}`, paddingTop: 'clamp(24px,3vw,36px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div>
            <div style={KICKER}>Brands we serve</div>
            <h2 style={{ font: `800 clamp(24px,2.8vw,34px) ${FONT}`, color: C.ink, margin: 0 }}>
              80+ brands, original stock only
            </h2>
          </div>
          <Link href="/tyres/results" style={{ fontSize: '14px', fontWeight: 700, color: C.green, textDecoration: 'none' }}>
            Shop all brands →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px' }}>
          {BRANDS.map(b => (
            <Link
              key={b.name}
              href={brandHref(b)}
              aria-label={`Shop ${b.name}`}
              onMouseEnter={() => setHovered(b.name)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '84px', background: '#fff',
                border: `1px solid ${hovered === b.name ? C.line3 : C.line}`,
                borderRadius: '10px', padding: '14px', boxSizing: 'border-box',
                textDecoration: 'none', transition: 'border-color .18s ease',
              }}
            >
              <span style={{ fontSize: '16px', fontFamily: "'DM Sans', sans-serif", fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1A1D23' }}>{b.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
