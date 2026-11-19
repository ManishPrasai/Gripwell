'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/*
  Mobile "Featured wheels" — horizontal snap rail fed by the same feed as the
  desktop FeaturedWheels grid (/api/wheels?limit=N, newest stock first). Shows
  four cards, matching the desktop FEATURED_COUNT.
*/

const FEATURED_COUNT = 4

interface ApiWheel {
  slug: string; brand: string; model: string
  diameter: number; width: string | number
  images: { url: string }[]
}
interface Wheel {
  id: string; brand: string; model: string; size: string; href: string; image: string
}

export default function MobileFeaturedWheels() {
  const [wheels, setWheels] = useState<Wheel[] | null>(null)

  useEffect(() => {
    fetch(`/api/wheels?limit=${FEATURED_COUNT}`)
      .then(r => r.json())
      .then(d => {
        const list: Wheel[] = Array.isArray(d.wheels) ? d.wheels.map((w: ApiWheel) => ({
          id: w.slug, brand: w.brand, model: w.model,
          size: `${w.diameter}" × ${parseFloat(String(w.width)).toFixed(1)}`,
          href: `/wheels/${w.slug}`,
          image: w.images[0]?.url ?? '/images/wheels/king-kt5.png',
        })) : []
        setWheels(list)
      })
      .catch(() => setWheels([]))
  }, [])

  return (
    <section style={{ background: '#FAF9F5', padding: '18px 0 20px 16px', borderTop: '1px solid #E7E5DE' }}>
      <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF6A1A', marginBottom: '2px', paddingRight: '16px' }}>
        This month&apos;s picks
      </span>
      <h2 style={{ margin: '2px 0 12px', fontSize: '18px', fontWeight: 800, color: '#1A1D23', textTransform: 'uppercase', paddingRight: '16px' }}>
        Featured wheels
      </h2>
      <div className="nv-mob-rail" style={{ paddingRight: '16px' }}>
        {wheels === null
          ? Array.from({ length: FEATURED_COUNT }).map((_, i) => (
              <div key={i} style={{ width: '158px', height: '208px', background: '#F0EFE9', border: '1px solid #E7E5DE', borderRadius: '14px' }} />
            ))
          : wheels.length === 0
          ? <span style={{ fontSize: '13px', color: '#6B7280', paddingRight: '16px' }}>No featured wheels right now.</span>
          : wheels.map(w => (
              <Link key={w.id} href={w.href} style={{ width: '158px', background: '#FFFFFF', border: '1px solid #E7E5DE', borderRadius: '14px', padding: '14px', textDecoration: 'none', color: '#1A1D23', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', aspectRatio: '4/3', marginBottom: '10px' }}>
                  <Image src={w.image} alt={`${w.brand} ${w.model}`} fill sizes="158px" style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ alignSelf: 'flex-start', border: '1px solid #E7E5DE', borderRadius: '2px', padding: '3px 8px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2A2E36', marginBottom: '6px' }}>
                  {w.brand}
                </span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '2px' }}>{w.model}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#6B7280' }}>{w.size}</span>
                <span style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', fontWeight: 700, color: '#FF6A1A' }}>View range →</span>
              </Link>
            ))}
        {wheels !== null && wheels.length > 0 && (
          <Link href="/wheels/results" style={{ width: '60px', border: '1.5px dashed #D8D5CA', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9EA3AD', textDecoration: 'none', fontSize: '11px', fontWeight: 700, textAlign: 'center', padding: '0 4px' }}>
            View all →
          </Link>
        )}
      </div>
    </section>
  )
}
