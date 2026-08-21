'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { C, FONT, FIELD_LABEL, SELECT, CTA } from '../shop/tokens'
import { NOVA_SWITCHBOARD_HREF } from '../../../lib/stores'

const WHEEL_BRANDS = ['All brands', 'King Wheels', 'ROH', 'Black Rhino', 'Sonix']
const DIAMETERS    = ['13','14','15','16','17','18','19','20','22']

/* Exactly the finishes stocked in the Wheel table — the design also mocked
   "Silver / machined" and "Chrome", which no wheel carries, so those options
   would have returned an empty grid. */
const FINISHES = [
  { label: 'All finishes', value: '' },
  { label: 'Matte black',  value: 'Matte Black' },
  { label: 'Gloss black',  value: 'Gloss Black' },
  { label: 'Satin black',  value: 'Satin Black' },
  { label: 'Gunmetal',     value: 'Gunmetal' },
  { label: 'Hyper silver', value: 'Hyper Silver' },
  { label: 'Bronze',       value: 'Bronze' },
]

export default function WheelHero() {
  const router = useRouter()
  const [brand, setBrand]       = useState('All brands')
  const [diameter, setDiameter] = useState('')
  const [finish, setFinish]     = useState('')

  function search() {
    const params = new URLSearchParams()
    if (brand !== 'All brands') params.set('brand', brand)
    if (diameter)               params.set('diameter', diameter)
    if (finish)                 params.set('finish', finish)
    router.push(`/wheels/results${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <section style={{ position: 'relative', background: '#101211', overflow: 'hidden', fontFamily: FONT }}>
      <style>{`.fw-cta:hover { background: ${C.orangeDark}; }`}</style>

      <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/wheels-bg.jpg" alt="" aria-hidden="true"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,12,11,.55),rgba(10,12,11,.82))' }} />

      <div style={{ position: 'relative', maxWidth: '1600px', margin: '0 auto', padding: 'clamp(40px,5.5vw,80px) clamp(16px,3vw,64px)' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <h1 style={{ font: `800 clamp(30px,4vw,48px)/1.05 ${FONT}`, color: '#fff', margin: 0 }}>Find your wheels</h1>
            <p style={{ fontSize: 'clamp(14px,1.5vw,16.5px)', color: '#D8D8D5', margin: '8px 0 0' }}>
              Pick a brand, size or finish — every wheel is fitted and balanced free.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 16px 40px rgba(0,0,0,.3)', padding: 'clamp(18px,2.4vw,28px)' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <label style={{ flex: 1, minWidth: '150px' }}>
                <span style={FIELD_LABEL}>1. Brand</span>
                <select style={{ ...SELECT, borderRadius: '8px', padding: '14px 12px' }} value={brand} onChange={e => setBrand(e.target.value)}>
                  {WHEEL_BRANDS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
              <label style={{ flex: 1, minWidth: '150px' }}>
                <span style={FIELD_LABEL}>2. Diameter</span>
                <select style={{ ...SELECT, borderRadius: '8px', padding: '14px 12px' }} value={diameter} onChange={e => setDiameter(e.target.value)}>
                  <option value="">Any size</option>
                  {DIAMETERS.map(o => <option key={o} value={o}>{o}&quot;</option>)}
                </select>
              </label>
              <label style={{ flex: 1, minWidth: '150px' }}>
                <span style={FIELD_LABEL}>
                  3. Finish <span style={{ textTransform: 'none', color: C.muted3 }}>(optional)</span>
                </span>
                <select style={{ ...SELECT, borderRadius: '8px', padding: '14px 12px' }} value={finish} onChange={e => setFinish(e.target.value)}>
                  {FINISHES.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <button className="fw-cta" onClick={search}
                style={{ ...CTA, flex: 1, minWidth: '170px', borderRadius: '999px', padding: '16px 24px' }}>
                Search Wheels
              </button>
            </div>

            <div style={{ marginTop: '14px', fontSize: '13.5px', color: C.muted }}>
              Wheel diameter (like <strong style={{ color: C.ink }}>16&quot;</strong>) is stamped on the back of your rim — or{' '}
              <a href={NOVA_SWITCHBOARD_HREF} style={{ fontWeight: 700 }}>call us</a> and we&apos;ll check for you.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
