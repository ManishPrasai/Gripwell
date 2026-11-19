'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { money } from '../../../../lib/fitting'

/*
  Mobile "Best deals" — a horizontal snap rail fed by the same admin-curated
  feed the desktop BestDeals grid uses (/api/tyres|wheels/featured, the
  isFeatured flag per product). Card layout is the phone artboard's; the data
  shape and the "on sale" rule match desktop so badges never disagree.
*/

interface Deal {
  id: string; brand: string; model: string; size: string
  price: number; was: number | null; href: string; image: string
}

interface ApiTyre {
  slug: string; brand: string; model: string
  price: string | number; compareAtPrice: string | number | null
  tyreSize: { width: number; profile: number; rimDiameter: number }
  images: { url: string }[]
}
interface ApiWheel {
  slug: string; brand: string; model: string
  price: string | number; compareAtPrice: string | number | null
  diameter: number; width: string | number
  images: { url: string }[]
}

function was(price: string | number, cmp: string | number | null): number | null {
  if (cmp == null) return null
  const w = parseFloat(String(cmp))
  return w > parseFloat(String(price)) ? w : null
}

const fmt = (n: number) => money(n, { whole: true })

export default function MobileDealsRail() {
  const [deals, setDeals] = useState<Deal[] | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/tyres/featured?limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/api/wheels/featured?limit=4').then(r => r.json()).catch(() => ({})),
    ]).then(([t, w]) => {
      const tyres: Deal[] = Array.isArray(t.tyres) ? t.tyres.map((x: ApiTyre) => ({
        id: `t-${x.slug}`, brand: x.brand, model: x.model,
        size: `${x.tyreSize.width}/${x.tyreSize.profile}R${x.tyreSize.rimDiameter}`,
        price: parseFloat(String(x.price)), was: was(x.price, x.compareAtPrice),
        href: `/tyres/${x.slug}`, image: x.images[0]?.url ?? '/images/tyres/tyre-passenger.png',
      })) : []
      const wheels: Deal[] = Array.isArray(w.wheels) ? w.wheels.map((x: ApiWheel) => ({
        id: `w-${x.slug}`, brand: x.brand, model: x.model,
        size: `${x.diameter}" × ${parseFloat(String(x.width)).toFixed(1)}`,
        price: parseFloat(String(x.price)), was: was(x.price, x.compareAtPrice),
        href: `/wheels/${x.slug}`, image: x.images[0]?.url ?? '/images/wheels/wheel-neutral.png',
      })) : []
      setDeals([...tyres, ...wheels].slice(0, 8))
    })
  }, [])

  return (
    <section style={{ background: '#FAF9F5', padding: '22px 0 8px 16px' }}>
      <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#FF6A1A', marginBottom: '10px', paddingRight: '16px' }}>
        Best deals
      </span>
      <div className="nv-mob-rail" style={{ paddingRight: '16px' }}>
        {deals === null
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ width: '150px', height: '210px', background: '#F0EFE9', border: '1px solid #E7E5DE', borderRadius: '14px' }} />
            ))
          : deals.length === 0
          ? <span style={{ fontSize: '13px', color: '#6B7280', paddingRight: '16px' }}>No featured deals right now.</span>
          : deals.map(d => (
              <Link key={d.id} href={d.href} style={{ width: '150px', background: '#FFFFFF', border: '1px solid #E7E5DE', borderRadius: '14px', padding: '14px', textDecoration: 'none', color: '#1A1D23', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {d.was != null && (
                  <span style={{ position: 'absolute', top: 0, right: 0, background: '#FF6A1A', color: '#fff', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', padding: '4px 9px', borderRadius: '0 14px 0 10px' }}>SALE</span>
                )}
                <div style={{ position: 'relative', height: '76px', marginBottom: '10px' }}>
                  <Image src={d.image} alt={`${d.brand} ${d.model}`} fill sizes="150px" style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '13px', letterSpacing: '0.06em', color: '#2A2E36', marginBottom: '4px' }}>{d.brand.toUpperCase()}</span>
                <span style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '2px' }}>{d.model}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#6B7280', marginBottom: '8px' }}>{d.size}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #E7E5DE' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', color: '#1A1D23' }}>{fmt(d.price)}</span>
                  {d.was != null && <span style={{ fontSize: '10px', color: '#9EA3AD', textDecoration: 'line-through' }}>{fmt(d.was)}</span>}
                </span>
              </Link>
            ))}
        {deals !== null && deals.length > 0 && (
          <Link href="/tyres" style={{ width: '60px', border: '1.5px dashed #D8D5CA', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9EA3AD', textDecoration: 'none', fontSize: '11px', fontWeight: 700, textAlign: 'center', padding: '0 4px' }}>
            View all →
          </Link>
        )}
      </div>
    </section>
  )
}
