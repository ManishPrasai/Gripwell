'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import TyreSizeGuideModal from './TyreSizeGuideModal'
import { STORES, STORE_STATES_SERVED } from '../../../lib/stores'

/* ── Size ranges ─────────────────────────────────────────────────────────── */
const TYRE_WIDTHS   = ['155','165','175','185','195','205','215','225','235','245','255','265','275','285','295','305','315']
const TYRE_PROFILES = ['30','35','40','45','50','55','60','65','70','75','80']
const RIM_SIZES     = ['13','14','15','16','17','18','19','20','21','22']
const WHEEL_WIDTHS  = ['6.5','7.0','7.5','8.0','8.5','9.0','9.5','10.0','11.0','12.0']

const POPULAR_SIZES = ['205/55R16', '225/45R17', '235/45R17', '265/70R16']

/* Rotating hero plates — local assets, no external requests at runtime */
const HERO_IMAGES = [
  '/images/hero/hero-1.jpg',
  '/images/hero/hero-2.jpg',
  '/images/hero/hero-3.jpg',
]
const HERO_INTERVAL_MS = 6500

interface TyreSizeCombo { width: number; profile: number; rimDiameter: number }

/* Derive the valid next-dropdown options from real inventory combos, falling
   back to the full range when nothing matches so the UI is never a dead end. */
function profilesForWidth(combos: TyreSizeCombo[], w: string): string[] {
  const matches = combos.filter(c => c.width === Number(w))
  if (!matches.length) return TYRE_PROFILES
  const set = new Set(matches.map(c => String(c.profile)))
  const filtered = TYRE_PROFILES.filter(p => set.has(p))
  return filtered.length ? filtered : TYRE_PROFILES
}

function rimsForWidthProfile(combos: TyreSizeCombo[], w: string, p: string): string[] {
  const matches = combos.filter(c => c.width === Number(w) && c.profile === Number(p))
  if (!matches.length) return RIM_SIZES
  const set = new Set(matches.map(c => String(c.rimDiameter)))
  const filtered = RIM_SIZES.filter(r => set.has(r))
  return filtered.length ? filtered : RIM_SIZES
}

/* ── Shared field styling ────────────────────────────────────────────────── */
const fieldLabel: React.CSSProperties = {
  fontFamily:    "'DM Mono', monospace",
  fontSize:      '10.5px',
  letterSpacing: '0.14em',
  color:         '#6E7C74',
}

const selectStyle: React.CSSProperties = {
  width:        '100%',
  padding:      '12px 10px',
  border:       '1px solid #E7E5DE',
  borderRadius: '8px',
  background:   '#FAF9F5',
  fontFamily:   "'DM Mono', monospace",
  fontSize:     '16px',
  color:        '#16211B',
  cursor:       'pointer',
  transition:   'border-color .2s',
}

const searchBtn: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  background:     '#E8572A',
  color:          '#fff',
  border:         'none',
  borderRadius:   '8px',
  height:         '47px',
  fontFamily:     "'Bebas Neue', sans-serif",
  fontSize:       '23px',
  letterSpacing:  '0.06em',
  cursor:         'pointer',
  transition:     'transform .18s cubic-bezier(.22,1,.36,1), background .2s, box-shadow .2s',
}

function TrustPill({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div
      className="nv-trust-pill"
      style={{
        display: 'flex', alignItems: 'center', gap: '11px',
        background: 'rgba(250,249,245,0.08)', border: '1px solid rgba(250,249,245,0.16)',
        borderRadius: '999px', padding: '9px 16px 9px 10px', minWidth: 0,
        transition: 'background .25s, border-color .25s',
      }}
    >
      {icon}
      <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0, textAlign: 'left' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{title}</span>
        <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(250,249,245,0.82)', whiteSpace: 'nowrap' }}>{sub}</span>
      </span>
    </div>
  )
}

const pillIconWrap = (bg: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: '32px', height: '32px', borderRadius: '999px', background: bg, flexShrink: 0,
})

/* ── Component ───────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const router = useRouter()
  const [tab, setTab]         = useState<'tyres' | 'wheels'>('tyres')
  const [width, setWidth]     = useState('225')
  const [profile, setProfile] = useState('45')
  const [rim, setRim]         = useState('17')
  const [wheelRim, setWheelRim]     = useState('18')
  const [wheelWidth, setWheelWidth] = useState('8.0')
  const [heroSlide, setHeroSlide]   = useState(0)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  /* Background crossfade */
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_IMAGES.length), HERO_INTERVAL_MS)
    return () => clearInterval(t)
  }, [])

  /* Real width/profile/rim combinations from inventory — drives cross-filtering */
  const [sizeCombos, setSizeCombos] = useState<TyreSizeCombo[]>([])
  useEffect(() => {
    fetch('/api/tyres/sizes')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data.sizes)) setSizeCombos(data.sizes) })
      .catch(() => {})
  }, [])

  const availableProfiles = useMemo(() => profilesForWidth(sizeCombos, width), [sizeCombos, width])
  const availableRims     = useMemo(() => rimsForWidthProfile(sizeCombos, width, profile), [sizeCombos, width, profile])

  /* Width changed — cascade-validate profile, then rim */
  function handleWidthChange(next: string) {
    setWidth(next)
    const profiles = profilesForWidth(sizeCombos, next)
    const nextProfile = profiles.includes(profile) ? profile : profiles[0]
    if (nextProfile !== profile) setProfile(nextProfile)
    const rims = rimsForWidthProfile(sizeCombos, next, nextProfile)
    if (!rims.includes(rim)) setRim(rims[0])
  }

  /* Profile changed — cascade-validate rim */
  function handleProfileChange(next: string) {
    setProfile(next)
    const rims = rimsForWidthProfile(sizeCombos, width, next)
    if (!rims.includes(rim)) setRim(rims[0])
  }

  const currentSize = `${width}/${profile}R${rim}`

  function pickPopular(label: string) {
    const m = label.match(/(\d+)\/(\d+)R(\d+)/)
    if (!m) return
    setTab('tyres')
    setWidth(m[1]); setProfile(m[2]); setRim(m[3])
  }

  function search() {
    if (tab === 'tyres') {
      router.push(`/tyres/results?width=${width}&profile=${profile}&rim=${rim}`)
    } else {
      router.push(`/wheels/results?diameter=${wheelRim}&width=${wheelWidth}`)
    }
  }

  return (
    <>
      <style>{`
        /*
          Field grids: the CTA gets 1.15fr so "SEARCH TYRES" never wraps beside
          three equal-width selects. Below 780px everything drops to two columns
          and the CTA spans the full row. Media queries, not matchMedia, so the
          server-rendered markup is already correct on first paint.
        */
        .nv-hero-fields        { display: grid; gap: 12px; align-items: end; grid-template-columns: repeat(3,minmax(0,1fr)) 1.15fr; }
        .nv-hero-fields-wheels { display: grid; gap: 12px; align-items: end; grid-template-columns: repeat(2,minmax(0,1fr)) 1.15fr; }
        @media (max-width: 780px) {
          .nv-hero-fields,
          .nv-hero-fields-wheels { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .nv-hero-cta           { grid-column: 1 / -1; }
        }
        .nv-hero-select:hover   { border-color: #076330; }
        .nv-hero-cta:hover      { background: #FF6817; transform: translateY(-2px); box-shadow: 0 14px 26px -14px rgba(232,87,42,0.95); }
        .nv-hero-cta:active     { transform: translateY(0); }
        .nv-trust-pill:hover    { background: rgba(250,249,245,0.14); border-color: rgba(250,249,245,0.34); }
        .nv-size-help:hover     { color: #076330; }
      `}</style>

      <section
        style={{
          position: 'relative', overflow: 'hidden', background: '#0D1A12',
          /* 66px = sticky header row. The announcement strip scrolls away, so
             it is deliberately not subtracted — the hero fills what remains. */
          minHeight: 'calc(100vh - 66px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Rotating backgrounds ── */}
        {HERO_IMAGES.map((src, i) => (
          <span
            key={src}
            role="img"
            aria-label="Nova Tyres workshop"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center 62%',
              opacity:   i === heroSlide ? 1 : 0,
              transform: i === heroSlide ? 'scale(1.05)' : 'scale(1)',
              transition: 'opacity 1.1s ease, transform 8s linear',
            }}
          />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(13,26,18,0.82),rgba(13,26,18,0.62) 40%,rgba(13,26,18,0.9))' }} />

        {/* ── Content ── */}
        <div
          style={{
            position: 'relative', width: '100%', maxWidth: '1180px', margin: '0 auto',
            padding: 'clamp(44px,6vw,84px) clamp(16px,4vw,40px) clamp(58px,7vw,92px)',
            boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', gap: 'clamp(22px,3vw,34px)',
          }}
        >
          <h1
            style={{
              margin: '0 auto 14px', color: '#FAF9F5',
              fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontStyle: 'italic',
              fontSize: 'clamp(48px,6.6vw,96px)', lineHeight: 0.93, letterSpacing: '0.02em',
              textWrap: 'balance', maxWidth: '900px',
            }}
          >
            Quality tyres,<br /><span style={{ color: '#E8572A' }}>fitted the same day.</span>
          </h1>

          {/* ── Search card ── */}
          <div
            style={{
              width: '100%', maxWidth: '860px', background: '#FFFFFF', borderRadius: '16px',
              padding: 'clamp(18px,2.6vw,26px)', boxShadow: '0 34px 70px -24px rgba(13,26,18,0.7)',
              textAlign: 'left',
            }}
          >
            {/* Tyres / Wheels tabs */}
            <div role="tablist" style={{ display: 'flex', gap: '16px', marginBottom: '18px', borderBottom: '1px solid #E7E5DE' }}>
              {(['tyres', 'wheels'] as const).map(t => {
                const on = tab === t
                return (
                  <button
                    key={t} role="tab" aria-selected={on} onClick={() => setTab(t)}
                    style={{
                      flex: 1, padding: '12px 6px', cursor: 'pointer', border: 'none',
                      borderBottom: on ? '2px solid #E8572A' : '2px solid transparent',
                      background: 'transparent', fontFamily: "'DM Sans', sans-serif",
                      fontWeight: on ? 700 : 400, fontSize: '15px',
                      color: on ? '#1C3A2B' : '#6E7C74',
                      transition: 'color .2s, border-color .2s',
                    }}
                  >
                    {t === 'tyres' ? 'Tyres' : 'Wheels'}
                  </button>
                )
              })}
            </div>

            {/* Fields — keyed per tab so the panel re-enters on every switch */}
            {tab === 'tyres' ? (
              <div key="tyres" style={{ animation: 'novaIn .3s ease both' }}>
                <div className="nv-hero-fields">
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={fieldLabel}>WIDTH</span>
                    <select className="nv-hero-select" style={selectStyle} value={width} onChange={e => handleWidthChange(e.target.value)}>
                      {TYRE_WIDTHS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={fieldLabel}>PROFILE</span>
                    <select className="nv-hero-select" style={selectStyle} value={profile} onChange={e => handleProfileChange(e.target.value)}>
                      {availableProfiles.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={fieldLabel}>RIM</span>
                    <select className="nv-hero-select" style={selectStyle} value={rim} onChange={e => setRim(e.target.value)}>
                      {availableRims.map(o => <option key={o} value={o}>{o}&quot;</option>)}
                    </select>
                  </label>
                  <button className="nv-hero-cta" style={searchBtn} onClick={search}>SEARCH TYRES</button>
                </div>
              </div>
            ) : (
              <div key="wheels" style={{ animation: 'novaIn .3s ease both' }}>
                <div className="nv-hero-fields-wheels">
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={fieldLabel}>RIM DIAMETER</span>
                    <select className="nv-hero-select" style={selectStyle} value={wheelRim} onChange={e => setWheelRim(e.target.value)}>
                      {RIM_SIZES.map(o => <option key={o} value={o}>{o}&quot;</option>)}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={fieldLabel}>RIM WIDTH</span>
                    <select className="nv-hero-select" style={selectStyle} value={wheelWidth} onChange={e => setWheelWidth(e.target.value)}>
                      {WHEEL_WIDTHS.map(o => <option key={o} value={o}>{o}&quot;</option>)}
                    </select>
                  </label>
                  <button className="nv-hero-cta" style={searchBtn} onClick={search}>SEARCH WHEELS</button>
                </div>
              </div>
            )}

            {/* Popular sizes + size-guide link */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10.5px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6E7C74', marginRight: '4px' }}>
                Popular
              </span>
              {POPULAR_SIZES.map(label => {
                const on = tab === 'tyres' && label === currentSize
                return (
                  <button
                    key={label} onClick={() => pickPopular(label)}
                    style={{
                      fontFamily: "'DM Mono', monospace", fontSize: '12px', padding: '7px 12px',
                      borderRadius: '8px', cursor: 'pointer',
                      border: `1px solid ${on ? '#076330' : '#E7E5DE'}`,
                      background: on ? '#E8F5EE' : '#FFFFFF',
                      color: on ? '#076330' : '#6E7C74',
                      transition: 'all .18s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="nv-size-help"
                style={{
                  marginLeft: 'auto', fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                  fontWeight: 600, color: '#47554D', background: 'none', border: 0, padding: '10px 2px',
                  cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '4px',
                  transition: 'color .2s',
                }}
              >
                Need help finding your size?
              </button>
            </div>
          </div>

          {/* ── Trust pills ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
            <TrustPill
              title="4.8 on Google" sub="1,240+ reviews"
              icon={
                <span style={pillIconWrap('#FFFFFF')}>
                  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
              }
            />
            <TrustPill
              title={`${STORES.length} stores`} sub={`${STORE_STATES_SERVED.length} states`}
              icon={
                <span style={pillIconWrap('rgba(232,87,42,0.18)')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8A5C" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
              }
            />
            <TrustPill
              title="Price beaten" sub="On any written quote"
              icon={
                <span style={pillIconWrap('rgba(250,249,245,0.12)')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FAF9F5" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                    <circle cx="7.5" cy="7.5" r="0.6" fill="#FAF9F5" />
                  </svg>
                </span>
              }
            />
          </div>
        </div>

        {/* ── Background selector dots ── */}
        <div style={{ position: 'absolute', left: '50%', bottom: '20px', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', zIndex: 2 }}>
          {HERO_IMAGES.map((_, i) => (
            // Padding grows the real tap target well past the painted 4px
            // pill (which lives on the inner span) without changing what's
            // visually drawn — background stays on the span, not the button.
            <button
              key={i} onClick={() => setHeroSlide(i)} aria-label={`Hero image ${i + 1}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '14px 10px', border: 'none', background: 'none', cursor: 'pointer',
              }}
            >
              <span style={{
                display: 'block', width: i === heroSlide ? '30px' : '9px', height: '4px', borderRadius: '999px',
                background: i === heroSlide ? '#E8572A' : 'rgba(250,249,245,0.42)',
                transition: 'width .35s cubic-bezier(.22,1,.36,1), background .3s',
              }} />
            </button>
          ))}
        </div>
      </section>

      {showSizeGuide && <TyreSizeGuideModal onClose={() => setShowSizeGuide(false)} />}
    </>
  )
}
