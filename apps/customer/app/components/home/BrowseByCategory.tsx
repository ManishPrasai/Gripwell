'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/*
  Each card points at a filter the catalogue can actually serve. The TyreType
  enum is PASSENGER | SUV | COMMERCIAL | MUD_TERRAIN, so the design's
  "All-Terrain" slot is filled by COMMERCIAL — the one remaining real type —
  rather than linking to a filter that returns nothing.
*/
const CATEGORIES = [
  { name: 'PASSENGER',  tag: 'QUIET & ECONOMICAL', cta: 'Shop Passenger',  href: '/tyres/results?type=PASSENGER',   img: '/images/tyres/tyre-passenger.png',   alt: 'Passenger car tyre' },
  { name: '4X4 / SUV',  tag: 'BUILT FOR LOAD',     cta: 'Shop 4x4 / SUV',  href: '/tyres/results?type=SUV',         img: '/images/tyres/tyre-suv.png',         alt: '4x4 and SUV tyre' },
  { name: 'COMMERCIAL', tag: 'VANS & UTES',        cta: 'Shop Commercial', href: '/tyres/results?type=COMMERCIAL',  img: '/images/tyres/tyre-all-terrain.png', alt: 'Commercial van tyre' },
  { name: 'MUD-TERRAIN',tag: 'MAXIMUM BITE',       cta: 'Shop Mud-Terrain',href: '/tyres/results?type=MUD_TERRAIN', img: '/images/tyres/tyre-mud.png',         alt: 'Mud-terrain tyre' },
  { name: 'WHEELS',     tag: 'ALLOY & PACKAGES',   cta: 'Shop Wheels',     href: '/wheels',                         img: '/images/wheels/king-kt5.png',        alt: 'Alloy wheel' },
]

export default function BrowseByCategory() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section style={{ background: '#0D1A12', padding: 'clamp(44px,5vw,68px) 0', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        .nv-cat-grid { display: grid; gap: 16px; grid-template-columns: repeat(5,minmax(0,1fr)); }
        @media (max-width: 1100px) { .nv-cat-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        @media (max-width: 780px)  { .nv-cat-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
      `}</style>

      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div data-reveal style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ margin: '0 0 10px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(34px,4vw,46px)', letterSpacing: '0.02em', color: '#F1EFE7' }}>
            Find the right tyre for your drive
          </h2>
          <p style={{ margin: '0 auto', maxWidth: '56ch', color: '#9DB0A5', fontSize: '15px' }}>
            Engineered for performance, safety and confidence.
          </p>
        </div>

        <div data-reveal className="nv-cat-grid nv-d1">
          {CATEGORIES.map((c, i) => {
            const on = hovered === i
            return (
              <Link
                key={c.name}
                href={c.href}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  boxSizing: 'border-box', minHeight: 'clamp(250px,23vw,300px)', overflow: 'hidden',
                  borderRadius: '14px', textDecoration: 'none',
                  background: on ? '#25543C' : '#1C3A2B',
                  border: `1px solid ${on ? 'rgba(250,249,245,0.42)' : 'rgba(250,249,245,0.18)'}`,
                  padding: '20px',
                  transform: on ? 'translateY(-6px)' : 'translateY(0)',
                  transition: 'transform .32s cubic-bezier(.22,1,.36,1), background .3s, border-color .3s',
                }}
              >
                {/* Product shot floats above the label block rather than filling
                    the card — keeps the silhouette readable on the dark ground. */}
                <span style={{
                  position: 'absolute', left: '50%', top: '8%', width: '76%', height: '50%',
                  transform: on ? 'translateX(-50%) scale(1.04)' : 'translateX(-50%)',
                  transition: 'transform .5s cubic-bezier(.22,1,.36,1)',
                }}>
                  <Image src={c.img} alt={c.alt} fill sizes="(max-width: 780px) 45vw, 220px" style={{ objectFit: 'contain' }} />
                </span>

                <span style={{
                  position: 'absolute', top: '14px', right: '14px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '999px',
                  background: on ? '#E8572A' : 'rgba(250,249,245,0.14)', color: '#F1EFE7',
                  transform: on ? 'translateX(4px)' : 'translateX(0)',
                  transition: 'background .25s, transform .3s cubic-bezier(.22,1,.36,1)',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>

                <span style={{ position: 'relative', display: 'block', minWidth: 0 }}>
                  <span style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.16em', color: '#FF8A5C', marginBottom: '7px', overflowWrap: 'anywhere' }}>
                    {c.tag}
                  </span>
                  <span style={{ display: 'block', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(22px,2.2vw,28px)', letterSpacing: '0.02em', color: '#F1EFE7', lineHeight: 1, marginBottom: '12px', overflowWrap: 'anywhere' }}>
                    {c.name}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', paddingTop: '11px', borderTop: '1px solid rgba(250,249,245,0.16)', width: '100%', fontSize: '13px', fontWeight: 700, color: '#F1EFE7' }}>
                    {c.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
