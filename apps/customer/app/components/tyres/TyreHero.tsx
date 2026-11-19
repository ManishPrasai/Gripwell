'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { C, FONT, FIELD_LABEL, SELECT, CTA } from '../shop/tokens'
import { NOVA_SWITCHBOARD, NOVA_SWITCHBOARD_HREF } from '../../../lib/stores'

const WIDTHS   = ['165','175','185','195','205','215','225','235','245','255','265','275','285']
const PROFILES = ['30','35','40','45','50','55','60','65','70','75','80']
const RIMS     = ['13','14','15','16','17','18','19','20','21','22']

/* Brands actually carried in the tyre catalogue (all fictional). Wheel
   brands live on /wheels, so listing them here would filter to nothing. */
const BRANDS = ['All brands', 'Brackley', 'Meridian', 'Kova', 'Terrain X', 'Corsaro', 'Zetland']

/* Only the four types the catalogue can actually serve (TyreType enum). */
const TYPES = [
  { label: 'All types',   value: '' },
  { label: 'Passenger',   value: 'PASSENGER' },
  { label: '4x4 / SUV',   value: 'SUV' },
  { label: 'Commercial',  value: 'COMMERCIAL' },
  { label: 'Mud terrain', value: 'MUD_TERRAIN' },
]

const RECENT_KEY = 'gw_recent_tyre_sizes'
const RECENT_MAX = 4

interface SizeCombo { width: number; profile: number; rimDiameter: number }

function profilesFor(combos: SizeCombo[], w: string): string[] {
  const m = combos.filter(c => c.width === Number(w))
  if (!m.length) return PROFILES
  const set = new Set(m.map(c => String(c.profile)))
  const out = PROFILES.filter(p => set.has(p))
  return out.length ? out : PROFILES
}

function rimsFor(combos: SizeCombo[], w: string, p: string): string[] {
  const m = combos.filter(c => c.width === Number(w) && c.profile === Number(p))
  if (!m.length) return RIMS
  const set = new Set(m.map(c => String(c.rimDiameter)))
  const out = RIMS.filter(r => set.has(r))
  return out.length ? out : RIMS
}

export default function TyreHero() {
  const router = useRouter()
  const [mode, setMode]       = useState<'size' | 'brand'>('size')
  const [width, setWidth]     = useState('205')
  const [profile, setProfile] = useState('55')
  const [rim, setRim]         = useState('16')
  const [brand, setBrand]     = useState('All brands')
  const [type, setType]       = useState('')
  const [recent, setRecent]   = useState<string[]>([])

  /* Recent searches are real: written on submit, read back on mount. */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      const arr = raw ? JSON.parse(raw) : []
      if (Array.isArray(arr)) setRecent(arr.filter((s): s is string => typeof s === 'string').slice(0, RECENT_MAX))
    } catch {}
  }, [])

  function persistRecent(next: string[]) {
    setRecent(next)
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)) } catch {}
  }

  const [combos, setCombos] = useState<SizeCombo[]>([])
  useEffect(() => {
    fetch('/api/tyres/sizes')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.sizes)) setCombos(d.sizes) })
      .catch(() => {})
  }, [])

  const availProfiles = useMemo(() => profilesFor(combos, width), [combos, width])
  const availRims     = useMemo(() => rimsFor(combos, width, profile), [combos, width, profile])

  function onWidth(next: string) {
    setWidth(next)
    const ps = profilesFor(combos, next)
    const nextP = ps.includes(profile) ? profile : ps[0]
    if (nextP !== profile) setProfile(nextP)
    const rs = rimsFor(combos, next, nextP)
    if (!rs.includes(rim)) setRim(rs[0])
  }

  function onProfile(next: string) {
    setProfile(next)
    const rs = rimsFor(combos, width, next)
    if (!rs.includes(rim)) setRim(rs[0])
  }

  function searchBySize() {
    const label = `${width}/${profile}R${rim}`
    persistRecent([label, ...recent.filter(r => r !== label)].slice(0, RECENT_MAX))
    router.push(`/tyres/results?width=${width}&profile=${profile}&rim=${rim}`)
  }

  function searchByBrand() {
    const params = new URLSearchParams()
    if (brand !== 'All brands') params.set('brand', brand)
    if (type) params.set('type', type)
    router.push(`/tyres/results${params.toString() ? `?${params}` : ''}`)
  }

  function applyRecent(label: string) {
    const m = label.match(/(\d+)\/(\d+)R(\d+)/)
    if (!m) return
    setMode('size'); setWidth(m[1]); setProfile(m[2]); setRim(m[3])
    router.push(`/tyres/results?width=${m[1]}&profile=${m[2]}&rim=${m[3]}`)
  }

  const tab = (on: boolean): React.CSSProperties => ({
    border: 'none', cursor: 'pointer', padding: '14px 26px',
    font: `800 clamp(19px,2vw,24px) ${FONT}`, textTransform: 'uppercase',
    letterSpacing: '.5px', borderRadius: '4px 4px 0 0',
    background: on ? C.orange : 'rgba(255,255,255,.85)',
    color: on ? '#fff' : C.muted2,
  })

  return (
    <section style={{ position: 'relative', background: '#0B1F14', overflow: 'hidden', fontFamily: FONT }}>
      <style>{`
        .ft-fields { display: flex; gap: 12px; flex-wrap: wrap; align-items: flex-end; }
        .ft-cta:hover { background: ${C.orangeDark}; }
        .ft-chip:hover { border-color: ${C.green}; color: ${C.green}; }
      `}</style>

      {/* Background plate */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/tyres-bg.jpg" alt="" aria-hidden="true"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(4,51,27,.55),rgba(4,51,27,.82))' }} />

      <div style={{ position: 'relative', maxWidth: '1600px', margin: '0 auto', padding: 'clamp(36px,5vw,72px) clamp(16px,3vw,64px)' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '18px' }}>
            <h1 style={{ font: `800 clamp(30px,4vw,48px)/1.05 ${FONT}`, color: '#fff', margin: 0 }}>Find your tyres</h1>
            <p style={{ fontSize: 'clamp(14px,1.5vw,16.5px)', color: C.onDark, margin: '8px 0 0' }}>
              Two ways to search — by the size printed on your tyre, or by a brand you trust.
            </p>
          </div>

          <div style={{ display: 'flex' }}>
            <button type="button" onClick={() => setMode('size')}  style={tab(mode === 'size')}>By Size</button>
            <button type="button" onClick={() => setMode('brand')} style={tab(mode === 'brand')}>By Brand</button>
          </div>

          <div style={{ background: '#fff', borderRadius: '0 4px 4px 4px', boxShadow: '0 16px 40px rgba(0,0,0,.3)', padding: 'clamp(16px,2.2vw,26px)' }}>

            {mode === 'size' ? (
              <>
                <div className="ft-fields">
                  <label style={{ flex: 1, minWidth: '110px' }}>
                    <span style={FIELD_LABEL}>1. Width</span>
                    <select style={SELECT} value={width} onChange={e => onWidth(e.target.value)}>
                      {WIDTHS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                  <label style={{ flex: 1, minWidth: '110px' }}>
                    <span style={FIELD_LABEL}>2. Profile</span>
                    <select style={SELECT} value={profile} onChange={e => onProfile(e.target.value)}>
                      {availProfiles.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                  <label style={{ flex: 1, minWidth: '110px' }}>
                    <span style={FIELD_LABEL}>3. Rim size</span>
                    <select style={SELECT} value={rim} onChange={e => setRim(e.target.value)}>
                      {availRims.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                  <button className="ft-cta" onClick={searchBySize} style={{ ...CTA, flex: 1, minWidth: '160px' }}>Find Tyres</button>
                </div>
                <div style={{ marginTop: '14px', fontSize: '13.5px', color: C.muted }}>
                  Your size looks like <strong style={{ color: C.ink }}>245 / 70 / R16</strong> — width, profile and rim, printed on your tyre&apos;s side wall.
                  Can&apos;t find it? <a href={NOVA_SWITCHBOARD_HREF} style={{ fontWeight: 700 }}>Call us</a>, we&apos;ll read it for you.
                </div>
              </>
            ) : (
              <div className="ft-fields">
                <label style={{ flex: 2, minWidth: '200px' }}>
                  <span style={FIELD_LABEL}>1. Brand</span>
                  <select style={SELECT} value={brand} onChange={e => setBrand(e.target.value)}>
                    {BRANDS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
                <label style={{ flex: 1.4, minWidth: '150px' }}>
                  <span style={FIELD_LABEL}>
                    2. Type <span style={{ textTransform: 'none', color: C.muted3 }}>(optional)</span>
                  </span>
                  <select style={SELECT} value={type} onChange={e => setType(e.target.value)}>
                    {TYPES.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
                <button className="ft-cta" onClick={searchByBrand} style={{ ...CTA, flex: 1, minWidth: '160px' }}>Find Tyres</button>
              </div>
            )}

            {/* Recent searches — only rendered once the visitor has some */}
            {recent.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.line2}`, marginTop: '16px', paddingTop: '12px', display: 'flex', gap: '8px 12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: C.ink3 }}>Recent searches</span>
                {recent.map(label => (
                  <span key={label} className="ft-chip"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C.wash, border: `1px solid ${C.line}`, borderRadius: '2px', padding: '6px 10px 6px 12px', fontSize: '13px', fontWeight: 600, color: C.ink2 }}>
                    <button type="button" onClick={() => applyRecent(label)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
                      {label}
                    </button>
                    <button type="button" aria-label={`Remove ${label}`}
                      onClick={() => persistRecent(recent.filter(r => r !== label))}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: C.muted2, lineHeight: 1 }}>
                      ✕
                    </button>
                  </span>
                ))}
                <button type="button" onClick={() => persistRecent([])}
                  style={{ marginLeft: 'auto', background: C.ink, color: '#fff', border: 'none', borderRadius: '12px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: FONT }}>
                  Clear all
                </button>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14.5px', color: C.onDark }}>
            Need help? Contact us — <a href={NOVA_SWITCHBOARD_HREF} style={{ color: C.onDarkWarm, fontWeight: 700, textDecoration: 'none' }}>{NOVA_SWITCHBOARD}</a>
            {' '}or <Link href="/#locations" style={{ color: C.onDarkWarm, fontWeight: 700, textDecoration: 'none' }}>choose a location →</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
