'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ── Dropdown data ─────────────────────────────────────────────────────── */
const BRANDS   = ['Black Rhino','ROH','King Wheels','Nitto','Atlander','Sonix','BFGoodrich']
const DIAMETERS = ['15"','16"','17"','18"','19"','20"','21"','22"']
const FINISHES  = ['Gloss Black','Matte Black','Silver','Chrome','Gunmetal','Bronze','Satin Black']

const SELECT: React.CSSProperties = {
  width: '100%',
  appearance: 'none',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: '10px',
  padding: '14px 40px 14px 16px',
  fontSize: '16px',
  fontWeight: 600,
  color: '#fff',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.65)',
  marginBottom: '8px',
  fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
}

function DropdownBox({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={LABEL}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={SELECT}>
          <option value="" style={{ background: '#1a1a1a' }}>— select —</option>
          {options.map(o => <option key={o} value={o} style={{ background: '#1a1a1a' }}>{o}</option>)}
        </select>
        <i className="ti ti-chevron-down" style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'rgba(255,255,255,0.6)', pointerEvents: 'none' }} aria-hidden="true" />
      </div>
    </div>
  )
}

export default function WheelHero() {
  const [brand,    setBrand]    = useState('')
  const [diameter, setDiameter] = useState('')
  const [finish,   setFinish]   = useState('')

  const href = `/wheels/results?brand=${encodeURIComponent(brand)}&diameter=${encodeURIComponent(diameter)}&finish=${encodeURIComponent(finish)}`

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#111', minHeight: '400px', display: 'flex', alignItems: 'center' }}
    >
      {/* Background image — place your wheel showroom photo at /public/images/wheels-bg.jpg */}
      <img
        src="/images/wheels-bg.jpg"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.30)' }} />

      <div className="relative z-10 w-full px-4" style={{ paddingTop: '100px', paddingBottom: '48px' }}>
        <div
          className="mx-auto"
          style={{
            maxWidth: '700px',
            background: 'rgba(10,10,10,0.55)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '32px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          }}
        >
          {/* Heading + orange underline */}
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(26px, 4vw, 40px)',
            color: '#fff',
            marginBottom: '10px',
            lineHeight: 1.1,
          }}>
            Search by Size
          </h1>
          <div style={{ height: '4px', background: '#E8572A', borderRadius: '2px', marginBottom: '28px' }} />

          {/* Dropdowns row */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
              <DropdownBox label="Brand"    value={brand}    options={BRANDS}    onChange={setBrand} />
            </div>
            <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
              <DropdownBox label="Diameter" value={diameter} options={DIAMETERS} onChange={setDiameter} />
            </div>
            <div style={{ flex: '1 1 120px', minWidth: '120px' }}>
              <DropdownBox label="Finish"   value={finish}   options={FINISHES}  onChange={setFinish} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Link
                href={href}
                style={{
                  background: '#E8572A',
                  color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: '15px',
                  letterSpacing: '0.06em',
                  padding: '0 26px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                SEARCH WHEELS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
