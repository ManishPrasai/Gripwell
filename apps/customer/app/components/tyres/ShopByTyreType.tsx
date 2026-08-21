'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { C, FONT, CONTAINER, SECTION_PAD, KICKER, H2 } from '../shop/tokens'

/*
  One card per real TyreType (PASSENGER | SUV | COMMERCIAL | MUD_TERRAIN).
  The design mocked five tiles including "Performance" and "Rugged Terrain",
  which the catalogue has no way to filter on — those would have linked to an
  empty result set.
*/
const TYPES = [
  { name: 'Passenger',   href: '/tyres/results?type=PASSENGER',   img: '/images/tyres/tyre-passenger.png',   alt: 'Passenger tyre' },
  { name: '4x4 / SUV',   href: '/tyres/results?type=SUV',         img: '/images/tyres/tyre-suv.png',         alt: '4x4 and SUV tyre' },
  { name: 'Commercial',  href: '/tyres/results?type=COMMERCIAL',  img: '/images/tyres/tyre-all-terrain.png', alt: 'Commercial tyre' },
  { name: 'Mud Terrain', href: '/tyres/results?type=MUD_TERRAIN', img: '/images/tyres/tyre-mud.png',         alt: 'Mud-terrain tyre' },
]

export default function ShopByTyreType() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section style={{ background: '#fff', padding: SECTION_PAD, fontFamily: FONT }}>
      <div style={CONTAINER}>
        <div style={{ marginBottom: '22px' }}>
          <div style={KICKER}>Every drive covered</div>
          <h2 style={H2}>Shop by tyre type</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '14px' }}>
          {TYPES.map((t, i) => {
            const on = hovered === i
            return (
              <Link
                key={t.name}
                href={t.href}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  textDecoration: 'none', background: C.wash, border: `1px solid ${C.line}`,
                  borderRadius: '4px', padding: '14px',
                  transform: on ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: on ? '0 10px 22px rgba(0,0,0,.12)' : 'none',
                  transition: 'transform .18s ease, box-shadow .18s ease',
                }}
              >
                <span style={{ display: 'block', position: 'relative', aspectRatio: '1', background: '#fff', borderRadius: '3px', overflow: 'hidden' }}>
                  <Image src={t.img} alt={t.alt} fill sizes="(max-width: 780px) 45vw, 220px" style={{ objectFit: 'contain' }} />
                </span>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <span style={{ font: `800 19px ${FONT}`, color: C.ink, textTransform: 'uppercase', letterSpacing: '.5px' }}>{t.name}</span>
                  <span style={{ color: C.orange, fontSize: '15px' }}>→</span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
