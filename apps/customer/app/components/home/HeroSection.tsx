'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const TYRE_WIDTHS   = ['155','165','175','185','195','205','215','225','235','245','255','265','275','285','295','305']
const TYRE_PROFILES = ['25','30','35','40','45','50','55','60','65','70','75','80']
const RIM_SIZES     = ['13','14','15','16','17','18','19','20','21','22','24']
const POPULAR_RIMS  = ['15','16','17','18','19','20','22']

/*
  Navbar wrapper = 18px top-padding + 64px nav row = 82px.
  NAV_CLEAR adds breathing room above the badge.
*/
const NAV_CLEAR = 110

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 38px 11px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  color: '#fff',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '16px',
  fontWeight: 500,
  appearance: 'none',
  WebkitAppearance: 'none',
  cursor: 'pointer',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '1.5px',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '6px',
  textTransform: 'uppercase',
}

export default function HeroSection() {
  const router = useRouter()
  const [tab, setTab]         = useState<'tyres' | 'wheels'>('tyres')
  const [width, setWidth]     = useState('205')
  const [profile, setProfile] = useState('55')
  const [rim, setRim]         = useState('16')
  const [wRim, setWRim]       = useState('17')

  function handleSearch() {
    if (tab === 'tyres') {
      router.push(`/tyres?width=${width}&profile=${profile}&rim=${rim}`)
    } else {
      router.push(`/wheels?rim=${wRim}`)
    }
  }

  return (
    <>
      <style>{`
        /*
          Two layout rules solve both problems permanently:
          1. clamp() caps the hero on large monitors (kills the empty gap).
          2. 100svh uses the *small* viewport height, so scaled-screen
             browser chrome doesn't push content below the fold.
          Fallback: 100vh for browsers that don't support svh yet.

          Content is natural height (no flex-spacer stretching it down),
          so nothing can overflow or get clipped.
        */

        .hs-section {
          /* svh = actual visible viewport, ignoring browser chrome */
          min-height: clamp(640px, calc(100vh - 120px), 860px);
          min-height: clamp(640px, calc(100svh - 120px), 860px);
        }

        /* — Tight screen: scale font & card, never clip — */
        @media (max-height: 820px) {
          .hs-content  { padding-top: 100px !important; padding-bottom: 56px !important; }
          .hs-badge    { margin-bottom: 20px !important; }
          .hs-headline { font-size: clamp(30px, 4.2vw, 54px) !important; margin-bottom: 20px !important; }
          .hs-card     { padding: 22px 24px !important; }
          .hs-card-hd  { margin: 0 0 14px !important; }
          .hs-seg      { margin-bottom: 14px !important; }
          .hs-drops    { margin-bottom: 12px !important; }
          .hs-help     { margin-bottom: 12px !important; }
          .hs-stats    { margin-top: 20px !important; padding-top: 18px !important; }
          .hs-stat-num { font-size: 22px !important; line-height: 28px !important; }
          .hs-stat-lbl { font-size: 12px !important; }
        }

        /* — Very tight (125–150 % OS scaling on 1366×768) — */
        @media (max-height: 680px) {
          .hs-content  { padding-top: 94px !important; padding-bottom: 48px !important; }
          .hs-badge    { display: none !important; }
          .hs-headline { font-size: clamp(26px, 3.8vw, 44px) !important; margin-bottom: 14px !important; }
          .hs-card     { padding: 16px 20px !important; border-radius: 14px !important; }
          .hs-card-hd  { font-size: 14px !important; margin: 0 0 10px !important; }
          .hs-seg      { margin-bottom: 10px !important; }
          .hs-drops    { margin-bottom: 8px !important; }
          .hs-help     { margin-bottom: 8px !important; }
          .hs-cta      { padding: 11px !important; font-size: 15px !important; }
          .hs-stats    { margin-top: 16px !important; padding-top: 14px !important; }
          .hs-stat-num { font-size: 19px !important; line-height: 24px !important; }
          .hs-stat-lbl { font-size: 11px !important; }
        }
      `}</style>

      {/*
        position:relative + overflow:hidden clips the background.
        min-height is set by .hs-section above.
        No explicit height — section grows with content if viewport
        is extremely small, enabling natural page scroll instead of clipping.
      */}
      <section className="hs-section relative w-full overflow-hidden">

        {/* ── Background ── */}
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline
            className="w-full h-full object-cover"
            poster="/images/hero-poster.jpg">
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.22)' }} />
          <div className="absolute left-0 right-0"
            style={{ height: '310px', top: '-187px', background: 'rgba(0,0,0,0.82)', filter: 'blur(57.75px)' }} />
          <div className="absolute"
            style={{ width: '110%', left: '-5%', height: '118px', top: '503px', background: '#000', filter: 'blur(67.8px)' }} />
        </div>

        {/*
          Content is naturally tall (not flex:1).
          This is the key change: without stretching, the content block
          stays compact regardless of how tall the hero section is.
          The dark video background fills the remaining hero height below.
        */}
        <div
          className="hs-content relative z-10 flex flex-col items-center text-center px-4"
          style={{ paddingTop: `${NAV_CLEAR}px`, paddingBottom: '64px' }}
        >

          {/* 1 — Badge */}
          <div
            className="hs-badge inline-flex items-center justify-center text-white mb-7"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.20)',
              borderRadius: '999px',
              padding: '9px 26px',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '13px',
              lineHeight: '20px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), inset 1px 0 0 rgba(255,255,255,0.15), inset -1px 0 0 rgba(255,255,255,0.10), 0 8px 24px rgba(0,0,0,0.12)',
            }}
          >
            Warehouse Direct Price
          </div>

          {/* 2 — Headline */}
          <h1
            className="hs-headline text-white mb-7"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(34px, 4.4vw, 58px)',
              lineHeight: 1.1,
              maxWidth: '780px',
              width: '100%',
            }}
          >
            Quality Tyres &amp; Wheels<br />
            at the{' '}
            <span style={{ color: '#E8572A' }}>Best Prices</span>
          </h1>

          {/* 3 — Search card */}
          <div className="w-full" style={{ maxWidth: '590px' }}>
            <div
              className="hs-card"
              style={{
                background: 'rgba(12, 10, 15, 0.92)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '18px',
                padding: '26px 28px',
                textAlign: 'left',
              }}
            >
              <p className="hs-card-hd"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
                Search tyres and wheels by size in seconds.
              </p>

              {/* Segmented Control */}
              <div className="hs-seg"
                style={{ display: 'inline-flex', padding: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '9999px', marginBottom: '16px' }}>
                {(['tyres', 'wheels'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{
                      padding: '7px 22px', borderRadius: '9999px',
                      background: tab === t ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
                      fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                    }}>
                    <i className={t === 'tyres' ? 'ti ti-circle-dot' : 'ti ti-disc'} aria-hidden="true"
                      style={{ fontSize: '16px', color: tab === t ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                    {t === 'tyres' ? 'Tyres' : 'Wheels'}
                  </button>
                ))}
              </div>

              {/* Dropdowns */}
              <div className="hs-drops" style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                {tab === 'tyres' ? (
                  <>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Width</label>
                      <div style={{ position: 'relative' }}>
                        <select value={width} onChange={e => setWidth(e.target.value)} style={selectStyle}>
                          {TYRE_WIDTHS.map(v => <option key={v} value={v} style={{ background: '#0c0a0f' }}>{v}</option>)}
                        </select>
                        <i className="ti ti-chevron-down" aria-hidden="true" style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '15px', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Profile</label>
                      <div style={{ position: 'relative' }}>
                        <select value={profile} onChange={e => setProfile(e.target.value)} style={selectStyle}>
                          {TYRE_PROFILES.map(v => <option key={v} value={v} style={{ background: '#0c0a0f' }}>{v}</option>)}
                        </select>
                        <i className="ti ti-chevron-down" aria-hidden="true" style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '15px', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Rim</label>
                      <div style={{ position: 'relative' }}>
                        <select value={rim} onChange={e => setRim(e.target.value)} style={selectStyle}>
                          {RIM_SIZES.map(v => <option key={v} value={v} style={{ background: '#0c0a0f' }}>{v}&quot;</option>)}
                        </select>
                        <i className="ti ti-chevron-down" aria-hidden="true" style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '15px', pointerEvents: 'none' }} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width: 'calc(33.33% - 8px)', flexShrink: 0 }}>
                      <label style={labelStyle}>Rim Size</label>
                      <div style={{ position: 'relative' }}>
                        <select value={wRim} onChange={e => setWRim(e.target.value)} style={selectStyle}>
                          {RIM_SIZES.map(v => <option key={v} value={v} style={{ background: '#0c0a0f' }}>{v}&quot;</option>)}
                        </select>
                        <i className="ti ti-chevron-down" aria-hidden="true" style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '15px', pointerEvents: 'none' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Popular sizes
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        {POPULAR_RIMS.map(v => (
                          <button key={v} onClick={() => setWRim(v)}
                            style={{
                              padding: '6px 14px', borderRadius: '20px',
                              background: wRim === v ? '#E8572A' : 'transparent',
                              border: `1px solid ${wRim === v ? '#E8572A' : '#E5E5E5'}`,
                              color: wRim === v ? '#fff' : '#444',
                              fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500,
                              cursor: 'pointer', transition: 'all 0.15s ease',
                            }}>
                            {v}&quot;
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Help */}
              <div className="hs-help" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '16px' }}>
                <i className="ti ti-info-circle" aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }} />
                <Link href="/tyre-size-guide"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
                  Need help finding your tyre size?
                </Link>
              </div>

              {/* CTA */}
              <button className="hs-cta" onClick={handleSearch}
                style={{ width: '100%', padding: '14px', background: '#E8572A', color: '#fff', borderRadius: '12px', border: 'none', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '17px', cursor: 'pointer', transition: 'opacity 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
                {tab === 'tyres' ? 'Search Tyres' : 'Search Wheels'}
              </button>
            </div>
          </div>

          {/* 4 — Trust signals: fixed margin from card, no stretching spacer */}
          <div
            className="hs-stats w-full"
            style={{
              maxWidth: '590px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '24px',
              paddingTop: '22px',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              flexWrap: 'wrap',
              gap: '0',
            }}
          >
            <div className="flex items-center gap-2" style={{ padding: '0 24px', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ color: '#F5A623', fontSize: '20px', lineHeight: 1 }}>★</span>
              <div className="text-left">
                <p className="hs-stat-num" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '24px', lineHeight: '30px', color: '#fff', margin: 0 }}>4.8</p>
                <p className="hs-stat-lbl" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>Google Reviews</p>
              </div>
            </div>
            <div className="text-left" style={{ padding: '0 24px', borderRight: '1px solid rgba(255,255,255,0.12)' }}>
              <p className="hs-stat-num" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '24px', lineHeight: '30px', color: '#fff', margin: 0 }}>9+</p>
              <p className="hs-stat-lbl" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px', lineHeight: '18px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>Locations Across AU</p>
            </div>
            <div className="text-left" style={{ padding: '0 24px' }}>
              <p className="hs-stat-num" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '24px', lineHeight: '30px', color: '#E8572A', margin: 0 }}>80+</p>
              <p className="hs-stat-lbl" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px', lineHeight: '18px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>Major Brands</p>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
