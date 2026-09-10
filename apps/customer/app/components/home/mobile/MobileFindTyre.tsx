'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { STORES, STORE_STATES_SERVED } from '../../../../lib/stores'

/*
  The phone hero's interactive core, ported from the "Mobile Hero — Find My
  Tyre" artboard. Two views:
    • pitch  — headline + stat cards + "Find My Tyre" CTA
    • size   — manual width / profile / rim entry, then push to /tyres/results

  This is the only client island in the mobile hero; everything around it in
  MobileHome is static server markup.
*/

const WIDTHS  = ['155', '165', '175', '185', '195', '205', '215', '225', '235', '245', '255', '265', '275', '285', '295']
const PROFILES = ['30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80']
const RIMS    = ['13', '14', '15', '16', '17', '18', '19', '20', '21', '22']

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  width: '100%',
  background: '#FFFFFF',
  border: '1px solid #E7E5DE',
  borderRadius: '8px',
  padding: '12px 8px',
  textAlign: 'center',
  fontFamily: "'DM Mono', monospace",
  fontSize: '15px',
  color: '#16211B',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.1em',
  color: '#6E7C74',
}

export default function MobileFindTyre() {
  const router = useRouter()
  const [view, setView]       = useState<'pitch' | 'size'>('pitch')
  const [width, setWidth]     = useState('205')
  const [profile, setProfile] = useState('55')
  const [rim, setRim]         = useState('16')

  const search = () => {
    router.push(`/tyres/results?width=${width}&profile=${profile}&rim=${rim}`)
  }

  if (view === 'size') {
    return (
      <div style={{ animation: 'nvMobFade .25s ease', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <button
          onClick={() => setView('pitch')}
          style={{
            alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            color: '#9DB0A5', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          Back
        </button>

        <span style={{ color: '#FAF9F5', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700 }}>
          Enter your tyre size
        </span>

        <div style={{ display: 'flex', gap: '8px' }}>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={labelStyle}>WIDTH</span>
            <select value={width} onChange={e => setWidth(e.target.value)} style={selectStyle} aria-label="Tyre width">
              {WIDTHS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={labelStyle}>PROFILE</span>
            <select value={profile} onChange={e => setProfile(e.target.value)} style={selectStyle} aria-label="Tyre profile">
              {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span style={labelStyle}>RIM</span>
            <select value={rim} onChange={e => setRim(e.target.value)} style={selectStyle} aria-label="Rim diameter">
              {RIMS.map(r => <option key={r} value={r}>{r}&quot;</option>)}
            </select>
          </label>
        </div>

        <button
          onClick={search}
          className="nv-mob-press"
          style={{
            border: 'none', cursor: 'pointer', background: '#E8572A', color: '#fff',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.05em',
            borderRadius: '8px', padding: '14px',
          }}
        >
          SEARCH
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setView('size')}
        className="nv-mob-press"
        style={{
          border: 'none', cursor: 'pointer', background: '#E8572A', color: '#fff',
          fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase', borderRadius: '10px', padding: '16px 32px',
        }}
      >
        Find My Tyre
      </button>

      <div className="nv-mob-pills" style={{ width: '100%', marginTop: '14px' }}>
        {[
          {
            n: '4.8 on Google', l: '1,240+ reviews', ring: '#FFFFFF',
            icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22 12.06c0-.7-.06-1.38-.18-2.03H12v3.83h5.6a4.8 4.8 0 0 1-2.08 3.15v2.6h3.36c1.97-1.81 3.12-4.48 3.12-7.55Z" />
                <path fill="#34A853" d="M12 22c2.66 0 4.9-.88 6.52-2.39l-3.36-2.6c-.93.63-2.13 1-3.16 1a5.62 5.62 0 0 1-5.3-3.85H3.7v2.68A9.99 9.99 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.7 13.66a5.87 5.87 0 0 1-.31-1.87c0-.65.11-1.28.31-1.87V7.24H3.7A9.98 9.98 0 0 0 2.66 12c0 1.63.4 3.16 1.04 4.34l3-2.68Z" />
                <path fill="#EA4335" d="M12 6.28c1.45 0 2.75.5 3.78 1.47l2.98-2.98A9.9 9.9 0 0 0 12 2 9.99 9.99 0 0 0 3.7 7.24l3 2.68A5.63 5.63 0 0 1 12 6.28Z" />
              </svg>
            ),
          },
          {
            n: `${STORES.length} stores`, l: `${STORE_STATES_SERVED.length} states`, ring: '#E8572A',
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
            ),
          },
          {
            n: 'Price beaten', l: 'on any written quote', ring: 'rgba(255,255,255,.15)',
            icon: (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.6 12.6 12 21.2a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8L11.4 3.4a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v6.6a2 2 0 0 1-.4 1.6Z" />
                <circle cx="15.5" cy="7.5" r="1.2" fill="#fff" stroke="none" />
              </svg>
            ),
          },
        ].map(s => (
          <div key={s.n} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,0,0,.35)', borderRadius: '999px', padding: '8px 14px 8px 8px',
          }}>
            <span style={{
              width: '26px', height: '26px', borderRadius: '50%', background: s.ring,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {s.icon}
            </span>
            <div style={{ lineHeight: 1.2 }}>
              <span style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 700 }}>{s.n}</span>
              <span style={{ fontSize: '9.5px', color: '#B9C4BE' }}>{s.l}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
