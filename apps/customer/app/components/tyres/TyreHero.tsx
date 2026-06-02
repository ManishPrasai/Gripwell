'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const WIDTHS   = ['145','155','165','175','185','195','205','215','225','235','245','255','265','275','285','295','305','315']
const PROFILES = ['25','30','35','40','45','50','55','60','65','70','75','80']
const RIMS     = ['13','14','15','16','17','18','19','20','21','22','23','24']
const BRAND_LIST = [
  'Continental','Pirelli','Yokohama','Maxxis','Black Rhino',
  'Nitto','Atlander','King Wheels','BFGoodrich','Sonix','ROH','Hankook',
]
const LOCATIONS = ['All Stores','Springvale','Dandenong','Alphington','Bayswater','Sunshine','Geelong','Sefton','Brisbane','Adelaide']

/* ── Shared styles ─────────────────────────────────────────────────────── */
const LABEL: React.CSSProperties = {
  fontSize: '13px', fontWeight: 700, color: '#777',
  marginBottom: '8px', fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block',
}

const SELECT: React.CSSProperties = {
  width: '100%', appearance: 'none',
  background: '#F7F7F7', border: '1.5px solid #E2E2E2',
  borderRadius: '10px', padding: '13px 40px 13px 16px',
  fontSize: '17px', fontWeight: 700, color: '#1A1A1A',
  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", outline: 'none',
  lineHeight: 1.3,
}

const FIND_BTN: React.CSSProperties = {
  background: '#E8572A', color: '#fff',
  fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
  fontSize: '15px', letterSpacing: '0.06em',
  padding: '0 28px', borderRadius: '10px',
  textDecoration: 'none', whiteSpace: 'nowrap',
  height: '52px', display: 'flex', alignItems: 'center',
  justifyContent: 'center', flexShrink: 0,
  border: 'none', cursor: 'pointer',
}

const CHIP: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '4px',
  background: '#F0F0F0', borderRadius: '6px',
  padding: '4px 10px', fontSize: '12px',
  color: '#444', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
}

/* ── Select box ──────────────────────────────────────────────────────────── */
function SizeSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={LABEL}>{label}</label>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} style={SELECT}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <i className="ti ti-chevron-down" style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '17px', color: '#999', pointerEvents: 'none' }} aria-hidden="true" />
      </div>
    </div>
  )
}

/* ── Recent-search chips ─────────────────────────────────────────────────── */
function RecentRow({ items, onRemove, onClear }: {
  items: string[]; onRemove: (v: string) => void; onClear: () => void
}) {
  if (!items.length) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
      <i className="ti ti-clock-hour-4" style={{ fontSize: '13px', color: '#ccc' }} aria-hidden="true" />
      <span style={{ fontSize: '12px', color: '#bbb', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
        Recent Searches
      </span>
      {items.map(s => (
        <span key={s} style={CHIP}>
          {s}
          <button onClick={() => onRemove(s)} style={{ color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '15px' }} aria-label={`Remove ${s}`}>×</button>
        </span>
      ))}
      <button onClick={onClear} style={{ fontSize: '12px', color: '#E8572A', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
        Clear all
      </button>
    </div>
  )
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function TyreHero() {
  const [tab,          setTab]          = useState<'size' | 'brand'>('size')
  const [width,        setWidth]        = useState('205')
  const [profile,      setProfile]      = useState('55')
  const [rim,          setRim]          = useState('16')
  const [brand,        setBrand]        = useState('')
  const [location,     setLocation]     = useState('')
  const [locOpen,      setLocOpen]      = useState(false)
  const [sizeRecent,   setSizeRecent]   = useState(['205/55R16', '265/55R16', '205/55R'])
  const [brandRecent,  setBrandRecent]  = useState(['Continental', 'Pirelli'])

  const sizeHref  = `/tyres/results?width=${width}&profile=${profile}&rim=${rim}`
  const brandHref = brand ? `/tyres/results?brand=${encodeURIComponent(brand)}` : '/tyres'

  return (
    <>
      <style>{`
        @keyframes widgetFade { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        .wf { animation: widgetFade 0.3s ease-in-out; }
        .loc-opt:hover { background: #F5F5F5 !important; }
      `}</style>

      <section
        className="relative overflow-hidden"
        style={{ background: '#111', minHeight: '460px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <Image src="/images/tyres-bg.jpg" alt="" fill priority style={{ objectFit: 'cover', opacity: 0.5 }} />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />

        <div className="relative z-10 px-4" style={{ paddingTop: '100px', paddingBottom: '40px' }}>

          {/* ── Widget card ── */}
          <div
            className="mx-auto rounded-2xl overflow-visible"
            style={{ maxWidth: '700px', background: '#fff', boxShadow: '0 28px 72px rgba(0,0,0,0.30)', borderRadius: '16px' }}
          >

            {/* Tab strip */}
            <div style={{ display: 'flex', borderRadius: '16px 16px 0 0', overflow: 'hidden', borderBottom: '1px solid #EDEDED' }}>
              {(['size', 'brand'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '16px 0', border: 'none', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '15px',
                    letterSpacing: '0.03em',
                    background:
                      t === tab
                        ? t === 'brand' ? '#E8572A' : '#ffffff'
                        : '#F2F2F2',
                    color:
                      t === tab
                        ? t === 'brand' ? '#ffffff' : '#1A1A1A'
                        : '#AAAAAA',
                    transition: 'background 0.3s ease-in-out, color 0.3s ease-in-out',
                  }}
                >
                  By {t === 'size' ? 'Size' : 'Brand'}
                </button>
              ))}
            </div>

            {/* ── Input row: all four groups always in DOM, width-animated ── */}
            <div style={{ padding: '22px 24px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>

                {/*
                  Size group — max-width collapses to 0 when brand tab active.
                  overflow:hidden clips the internal content during the morph.
                */}
                <div style={{
                  flex: 1, display: 'flex', gap: '12px',
                  maxWidth: tab === 'size' ? '800px' : '0px',
                  overflow: 'hidden',
                  opacity: tab === 'size' ? 1 : 0,
                  transition: 'max-width 0.42s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease-in-out',
                  pointerEvents: tab === 'size' ? 'auto' : 'none',
                }}>
                  <SizeSelect label="Width"   value={width}   options={WIDTHS}   onChange={setWidth} />
                  <SizeSelect label="Profile" value={profile} options={PROFILES} onChange={setProfile} />
                  <SizeSelect label="Rim"     value={rim}     options={RIMS}     onChange={setRim} />
                </div>

                {/*
                  Brand group — expands from 0 to full width when brand tab active.
                */}
                <div style={{
                  flex: 1, minWidth: 0,
                  maxWidth: tab === 'brand' ? '800px' : '0px',
                  overflow: 'hidden',
                  opacity: tab === 'brand' ? 1 : 0,
                  transition: 'max-width 0.42s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease-in-out',
                  pointerEvents: tab === 'brand' ? 'auto' : 'none',
                }}>
                  <div style={{ width: '100%', minWidth: '200px' }}>
                    <label style={LABEL}>Select a Brand</label>
                    <div style={{ position: 'relative' }}>
                      <select value={brand} onChange={e => setBrand(e.target.value)} style={SELECT}>
                        <option value="">Choose a brand</option>
                        {BRAND_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <i className="ti ti-chevron-down" style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', fontSize: '17px', color: '#999', pointerEvents: 'none' }} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* FIND TYRES — always visible */}
                <Link href={tab === 'size' ? sizeHref : brandHref} style={FIND_BTN}>
                  FIND TYRES
                </Link>
              </div>

              {/* Recent searches — per-tab */}
              <div style={{ minHeight: '44px' }}>
                {tab === 'size' && (
                  <RecentRow
                    items={sizeRecent}
                    onRemove={v => setSizeRecent(p => p.filter(x => x !== v))}
                    onClear={() => setSizeRecent([])}
                  />
                )}
                {tab === 'brand' && (
                  <RecentRow
                    items={brandRecent}
                    onRemove={v => setBrandRecent(p => p.filter(x => x !== v))}
                    onClear={() => setBrandRecent([])}
                  />
                )}
              </div>
            </div>

            {/* Bottom spacer */}
            <div style={{ height: '20px' }} />
          </div>

          {/* ── Need help + location bar ── */}
          <div style={{ maxWidth: '700px', margin: '16px auto 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="ti ti-phone" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)' }} aria-hidden="true" />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
                Need help? Contact us
              </span>
            </div>

            {/* Choose location with dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLocOpen(v => !v)}
                style={{ background: '#E8572A', color: '#fff', fontSize: '13px', fontWeight: 700, padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontFamily: "'DM Sans', sans-serif" }}
              >
                {location || 'Choose location'}
                <i className={`ti ti-chevron-${locOpen ? 'up' : 'down'}`} style={{ fontSize: '12px' }} aria-hidden="true" />
              </button>

              {locOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.18)', overflow: 'hidden', zIndex: 100, minWidth: '190px', border: '1px solid #EBEBEB' }}>
                  {LOCATIONS.map(loc => (
                    <button
                      key={loc}
                      className="loc-opt"
                      onClick={() => { setLocation(loc === 'All Stores' ? '' : loc); setLocOpen(false) }}
                      style={{ display: 'block', width: '100%', padding: '11px 18px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: loc === 'All Stores' ? 700 : 400, color: '#1A1A1A', borderBottom: loc !== LOCATIONS[LOCATIONS.length - 1] ? '1px solid #F5F5F5' : 'none' }}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
