'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/*
  All logos share the same row height so no cell is taller than others,
  which eliminates the perceived gap around smaller logos.
  darkFix — brightness(0) for SVGs with white/near-white paths
*/
const ROW1 = [
  { name: 'Continental', logo: '/images/brands/continental.svg' },
  { name: 'Pirelli',     logo: '/images/brands/pirelli.svg' },
  { name: 'Nitto',       logo: '/images/brands/nitto.svg' },
  { name: 'Yokohama',    logo: '/images/brands/yokohama.svg',   logoH: 58,  logoMaxW: 220 },
  { name: 'Maxxis',      logo: '/images/brands/maxxis.svg',     logoH: 58,  logoMaxW: 220 },
  { name: 'Atlander',    logo: '/images/brands/atlander.svg' },
]

const ROW2 = [
  { name: 'King Wheels', logo: '/images/brands/king-wheels.svg', darkFix: true },
  { name: 'ROH',         logo: '/images/brands/roh.svg' },
  { name: 'Black Rhino', logo: '/images/brands/Black Rino.svg',  logoH: 78,  logoMaxW: 260 },
  { name: 'Sonix',       logo: '/images/brands/sonix.svg' },
  { name: 'BFGoodrich',  logo: '/images/brands/bfgoodrich.svg' },
  { name: 'Hankook',     logo: '/images/brands/hankook.svg' },
]

type Brand = { name: string; logo: string; logoH?: number; logoMaxW?: number; darkFix?: boolean }

function BrandCell({ name, logo, logoH = 44, logoMaxW = 160, darkFix }: {
  name: string; logo: string; logoH?: number; logoMaxW?: number; darkFix?: boolean
}) {
  const [err, setErr] = useState(false)
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0' }}>
      <Link
        href={`/tyres?brand=${encodeURIComponent(name)}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
      >
        {err ? (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '14px', color: '#1A1A1A' }}>
            {name}
          </span>
        ) : (
          <Image
            src={logo}
            alt={name}
            width={logoMaxW * 2}
            height={logoH * 2}
            style={{
              objectFit: 'contain',
              height: `${logoH}px`,
              width: 'auto',
              maxWidth: `${logoMaxW}px`,
              filter: darkFix ? 'brightness(0)' : undefined,
            }}
            onError={() => setErr(true)}
          />
        )}
      </Link>
    </div>
  )
}

export default function BrandsWeServe() {
  return (
    <section style={{ background: '#fff', paddingTop: '40px', paddingBottom: '0px' }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* Divider separating Shop by Tyre Type from Brands We Serve */}
        <div style={{ height: '1px', background: '#E8E8E8', marginBottom: '14px' }} />

        <h2 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(22px, 2.5vw, 28px)',
          fontWeight: 900,
          color: '#1A1A1A',
          marginBottom: '4px',
        }}>
          Brands We Serve
        </h2>

        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {ROW1.map(b => (
            <BrandCell key={b.name} name={b.name} logo={b.logo}
              logoH={(b as Brand).logoH} logoMaxW={(b as Brand).logoMaxW} />
          ))}
        </div>

        {/* Gap between rows */}
        <div style={{ height: '6px' }} />

        {/* Row 2 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {ROW2.map(b => (
            <BrandCell key={b.name} name={b.name} logo={b.logo}
              logoH={(b as Brand).logoH} logoMaxW={(b as Brand).logoMaxW}
              darkFix={(b as Brand).darkFix} />
          ))}
        </div>

      </div>
    </section>
  )
}
