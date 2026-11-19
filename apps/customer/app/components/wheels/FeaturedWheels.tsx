'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { C, FONT, CONTAINER, SECTION_PAD, KICKER, H2 } from '../shop/tokens'

const FEATURED_COUNT = 4

interface WheelItem {
  id: string; brand: string; model: string; slug: string
  diameter: number; width: string | number
  images: { url: string; altText: string | null }[]
}

interface Featured {
  id: string; brand: string; model: string; href: string; image: string; size: string
}

function mapWheel(w: WheelItem): Featured {
  return {
    id:    w.slug,
    brand: w.brand,
    model: w.model,
    href:  `/wheels/${w.slug}`,
    image: w.images[0]?.url ?? '/images/wheels/wheel-neutral.png',
    size:  `${w.diameter}" × ${parseFloat(String(w.width)).toFixed(1)}`,
  }
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: '4px', padding: '16px' }}>
      <div style={{ aspectRatio: '4/3', background: C.wash, borderRadius: '3px' }} />
      <div style={{ width: '110px', height: '26px', background: C.wash, borderRadius: '2px', marginTop: '14px' }} />
      <div style={{ width: '70%', height: '17px', background: C.wash, borderRadius: '2px', marginTop: '10px' }} />
    </div>
  )
}

export default function FeaturedWheels() {
  const [wheels, setWheels]   = useState<Featured[]>([])
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState<string | null>(null)

  /* Real stock, newest first — the design's three cards were placeholders that
     all pointed at the same wheel. */
  useEffect(() => {
    fetch(`/api/wheels?limit=${FEATURED_COUNT}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.wheels)) setWheels(d.wheels.map(mapWheel)) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <section style={{ background: '#fff', padding: SECTION_PAD, fontFamily: FONT }}>
      <div style={CONTAINER}>
        <div style={{ marginBottom: '22px' }}>
          <div style={KICKER}>This month&apos;s picks</div>
          <h2 style={H2}>Featured wheels</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px' }}>
          {loading
            ? Array.from({ length: FEATURED_COUNT }).map((_, i) => <SkeletonCard key={i} />)
            : wheels.map(w => {
                const on = hovered === w.id
                return (
                  <Link
                    key={w.id}
                    href={w.href}
                    onMouseEnter={() => setHovered(w.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      textDecoration: 'none', background: '#fff', border: `1px solid ${C.line}`,
                      borderRadius: '4px', padding: '16px',
                      transform: on ? 'translateY(-2px)' : 'translateY(0)',
                      boxShadow: on ? '0 10px 22px rgba(0,0,0,.12)' : 'none',
                      transition: 'transform .18s ease, box-shadow .18s ease',
                    }}
                  >
                    <span style={{ display: 'block', position: 'relative', aspectRatio: '4/3', background: C.wash, borderRadius: '3px', overflow: 'hidden' }}>
                      <Image src={w.image} alt={`${w.brand} ${w.model}`} fill
                        sizes="(max-width: 780px) 90vw, 380px" style={{ objectFit: 'contain' }} />
                    </span>
                    <span style={{ display: 'inline-block', marginTop: '14px', border: `1px solid ${C.line}`, borderRadius: '2px', padding: '4px 10px', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: C.ink3 }}>
                      {w.brand}
                    </span>
                    <span style={{ display: 'block', fontSize: '17px', fontWeight: 700, color: C.ink, marginTop: '8px' }}>{w.model}</span>
                    <span style={{ display: 'block', fontSize: '13px', color: C.muted, marginTop: '3px' }}>{w.size}</span>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: C.orange, marginTop: '6px' }}>View range →</span>
                  </Link>
                )
              })}
        </div>

        {!loading && wheels.length === 0 && (
          <p style={{ fontSize: '14px', color: C.muted, padding: '24px 0' }}>
            No featured wheels right now — <Link href="/wheels/results" style={{ fontWeight: 700, color: C.green }}>browse the full range</Link>.
          </p>
        )}
      </div>
    </section>
  )
}
