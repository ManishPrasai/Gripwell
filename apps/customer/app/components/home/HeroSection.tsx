'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Select as SelectPrimitive } from 'radix-ui'
import TyreSizeGuideModal from './TyreSizeGuideModal'
import { STORES } from '../../../lib/stores'
import { money, DEFAULT_FITTING_PRICES } from '../../../lib/fitting'

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

/* ── Shared field styling ────────────────────────────────────────────────── */
const fieldLabel: React.CSSProperties = {
  fontFamily:    "'DM Mono', monospace",
  fontSize:      '10.5px',
  letterSpacing: '0.14em',
  color:         '#6B7280',
}

const selectStyle: React.CSSProperties = {
  width:        '100%',
  padding:      '12px 10px',
  border:       '1px solid #E7E5DE',
  borderRadius: '8px',
  background:   '#FAF9F5',
  fontFamily:   "'DM Mono', monospace",
  fontSize:     '16px',
  color:        '#1A1D23',
  cursor:       'pointer',
  transition:   'border-color .2s',
}

const triggerStyle: React.CSSProperties = {
  ...selectStyle,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  gap:            '6px',
}

/* Width/Profile/Rim all need to open the exact same way regardless of scroll
   position — a native <select> lets the browser flip the list upward when it
   doesn't fit below, and with three different option-count lists (17/11/10)
   that made the three fields behave inconsistently. This uses Radix's Select
   (already a dependency, already wired into the design system's CSS vars via
   components/ui/select.tsx) with collision-avoidance turned off so it always
   opens downward, same as its siblings, no matter where it sits on the page. */
function HeroSelect({
  value, onChange, options, suffix, ariaLabel,
}: {
  value: string; onChange: (v: string) => void; options: string[]; suffix?: string; ariaLabel: string
}) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onChange}>
      <SelectPrimitive.Trigger className="nv-hero-select" style={triggerStyle} aria-label={ariaLabel}>
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper" side="bottom" sideOffset={6}
          className="nv-hero-select-content"
        >
          <SelectPrimitive.Viewport style={{ padding: '6px' }}>
            {options.map(o => (
              <SelectPrimitive.Item key={o} value={o} className="nv-hero-select-item">
                <SelectPrimitive.ItemText>{o}{suffix}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

const searchBtn: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  background:     '#FF6A1A',
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
        .nv-hero-select:hover   { border-color: #2A2E36; }
        .nv-hero-select[data-state=open] { border-color: #2A2E36; }
        .nv-hero-select-content {
          background: #FFFFFF; border: 1px solid #DEDCD4; border-radius: 8px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          z-index: 1000;
          width: var(--radix-select-trigger-width);
          max-height: min(240px, var(--radix-select-content-available-height));
          overflow-y: auto;
        }
        .nv-hero-select-item {
          padding: 9px 10px; border-radius: 6px; cursor: pointer; outline: none;
          font-family: 'DM Mono', monospace; font-size: 15px; color: #1A1D23;
          transition: background .12s, color .12s;
        }
        .nv-hero-select-item[data-highlighted] { background: #F0EFE9; color: #1A1D23; }
        .nv-hero-select-item[data-state=checked] { background: #EAF3ED; color: #2A2E36; font-weight: 700; }
        .nv-hero-cta:hover      { background: #FF6A1A; transform: translateY(-2px); box-shadow: 0 14px 26px -14px rgba(232,87,42,0.95); }
        .nv-hero-cta:active     { transform: translateY(0); }
        .nv-trust-pill:hover    { background: rgba(250,249,245,0.14); border-color: rgba(250,249,245,0.34); }
        .nv-size-help:hover     { color: #2A2E36; }
      `}</style>

      <section
        style={{
          position: 'relative', overflow: 'hidden', background: '#1A1D23',
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
            aria-label="Gripwell workshop"
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
            Quality tyres,<br /><span style={{ color: '#FF6A1A' }}>fitted the same day.</span>
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
                      borderBottom: on ? '2px solid #FF6A1A' : '2px solid transparent',
                      background: 'transparent', fontFamily: "'DM Sans', sans-serif",
                      fontWeight: on ? 700 : 400, fontSize: '15px',
                      color: on ? '#2A2E36' : '#6B7280',
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={fieldLabel}>WIDTH</span>
                    <HeroSelect value={width} onChange={setWidth} options={TYRE_WIDTHS} ariaLabel="Tyre width" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={fieldLabel}>PROFILE</span>
                    <HeroSelect value={profile} onChange={setProfile} options={TYRE_PROFILES} ariaLabel="Tyre profile" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                    <span style={fieldLabel}>RIM</span>
                    <HeroSelect value={rim} onChange={setRim} options={RIM_SIZES} suffix={'"'} ariaLabel="Rim diameter" />
                  </div>
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
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10.5px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#6B7280', marginRight: '4px' }}>
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
                      border: `1px solid ${on ? '#2A2E36' : '#E7E5DE'}`,
                      background: on ? '#EDEEF0' : '#FFFFFF',
                      color: on ? '#2A2E36' : '#6B7280',
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
                  fontWeight: 600, color: '#4B5563', background: 'none', border: 0, padding: '10px 2px',
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
              title={`Fitting from ${money(DEFAULT_FITTING_PRICES.passenger, { whole: true })}`} sub="per tyre, VAT incl."
              icon={
                <span style={pillIconWrap('rgba(232,87,42,0.18)')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8A5C" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><circle cx="7.5" cy="7.5" r="1.5" />
                  </svg>
                </span>
              }
            />
            <TrustPill
              title={`${STORES.length} branches`} sub="across London"
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
                background: i === heroSlide ? '#FF6A1A' : 'rgba(250,249,245,0.42)',
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
