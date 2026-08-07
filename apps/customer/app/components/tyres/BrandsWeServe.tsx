'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { C, FONT, CONTAINER, KICKER } from '../shop/tokens'

/* All twelve marks the design calls for — every one has real artwork in
   public/images/brands, so no tile falls back to a placeholder.

   `cat` routes each tile to the catalogue that actually stocks it: tyre brands
   to /tyres/results, wheel brands to /wheels/results. Nitto and Atlander are
   marks we serve but hold no stock for, so they open the unfiltered tyre grid
   rather than an empty brand filter. */
const BRANDS: { name: string; src: string; cat: 'tyres' | 'wheels' | 'none' }[] = [
  { name: 'Continental', src: '/images/brands/continental.svg', cat: 'tyres' },
  { name: 'Pirelli',     src: '/images/brands/pirelli.svg',     cat: 'tyres' },
  { name: 'Nitto',       src: '/images/brands/nitto.svg',       cat: 'none' },
  { name: 'Yokohama',    src: '/images/brands/yokohama.svg',    cat: 'tyres' },
  { name: 'Maxxis',      src: '/images/brands/maxxis.svg',      cat: 'tyres' },
  { name: 'Atlander',    src: '/images/brands/atlander.svg',    cat: 'none' },
  { name: 'King Wheels', src: '/images/brands/king-wheels.svg', cat: 'wheels' },
  { name: 'ROH',         src: '/images/brands/roh.svg',         cat: 'wheels' },
  { name: 'Black Rhino', src: '/images/brands/Black Rino.svg',  cat: 'wheels' },
  { name: 'Sonix',       src: '/images/brands/sonix.svg',       cat: 'wheels' },
  { name: 'BF Goodrich', src: '/images/brands/bfgoodrich.svg',  cat: 'tyres' },
  { name: 'Hankook',     src: '/images/brands/hankook.svg',     cat: 'tyres' },
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
              <Image src={b.src} alt={b.name} width={110} height={30}
                style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto', maxHeight: '34px', width: 'auto' }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
