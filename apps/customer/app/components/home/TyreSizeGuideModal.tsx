'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ============================================================
   SIDEWALL DIAGRAM — tyre code breakdown (205/55 R16 91V)
   ============================================================ */
function WidthIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 56 56" aria-hidden="true">
      <rect x="19" y="6" width="18" height="30" rx="6" fill="#0F231A" stroke="#E8572A" strokeWidth="2" />
      <line x1="24" y1="12" x2="24" y2="30" stroke="#5C7568" strokeWidth="1.6" />
      <line x1="28" y1="12" x2="28" y2="30" stroke="#5C7568" strokeWidth="1.6" />
      <line x1="32" y1="12" x2="32" y2="30" stroke="#5C7568" strokeWidth="1.6" />
      <line x1="15" y1="45" x2="41" y2="45" stroke="#9DB0A5" strokeWidth="1.8" />
      <path d="M15 45 L19.5 41.5 M15 45 L19.5 48.5" stroke="#9DB0A5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M41 45 L36.5 41.5 M41 45 L36.5 48.5" stroke="#9DB0A5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function ProfileIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="24" cy="26" r="19" fill="#0F231A" stroke="#5C7568" strokeWidth="2" />
      <circle cx="24" cy="26" r="9" fill="#132A1F" stroke="#E8572A" strokeWidth="2" />
      <line x1="48" y1="8" x2="48" y2="18" stroke="#9DB0A5" strokeWidth="1.8" />
      <path d="M48 8 L45 11 M48 8 L51 11" stroke="#9DB0A5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M48 18 L45 15 M48 18 L51 15" stroke="#9DB0A5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function RimIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="26" r="18" fill="#0F231A" stroke="#5C7568" strokeWidth="2" />
      <circle cx="28" cy="26" r="13" fill="none" stroke="#E8572A" strokeWidth="2" />
      <circle cx="28" cy="26" r="3.5" fill="#E8572A" />
      <line x1="28" y1="26" x2="28" y2="14" stroke="#5C7568" strokeWidth="1.6" />
      <line x1="28" y1="26" x2="38.4" y2="19.6" stroke="#5C7568" strokeWidth="1.6" />
      <line x1="28" y1="26" x2="38.4" y2="32.4" stroke="#5C7568" strokeWidth="1.6" />
      <line x1="28" y1="26" x2="17.6" y2="32.4" stroke="#5C7568" strokeWidth="1.6" />
      <line x1="28" y1="26" x2="17.6" y2="19.6" stroke="#5C7568" strokeWidth="1.6" />
      <line x1="16" y1="47" x2="40" y2="47" stroke="#9DB0A5" strokeWidth="1.8" />
      <path d="M16 47 L20.5 43.5 M16 47 L20.5 50.5" stroke="#9DB0A5" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M40 47 L35.5 43.5 M40 47 L35.5 50.5" stroke="#9DB0A5" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

/* ============================================================
   MODAL — light theme, centered, single "how to read" section
   ============================================================ */
export default function TyreSizeGuideModal({ onClose }: { onClose: () => void }) {
  const [show, setShow] = useState(false)
  const closingRef = useRef(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    // rAF for a smooth transition, with a setTimeout fallback in case rAF is
    // throttled (hidden/background tab) — guarantees the modal becomes visible.
    const r = requestAnimationFrame(() => setShow(true))
    const t = setTimeout(() => setShow(true), 80)
    return () => {
      document.body.style.overflow = ''
      cancelAnimationFrame(r)
      clearTimeout(t)
    }
  }, [])

  const handleClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    setShow(false)
    setTimeout(onClose, 220)
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  return (
    <div
      className={'tsg-backdrop' + (show ? ' show' : '')}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="tsg-modal" role="dialog" aria-modal="true" aria-label="Where to find my tyre size">
        <div className="m-head">
          <span />
          <span className="title">Where to find my tyre size</span>
          <button className="m-iconbtn" onClick={handleClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <div className="m-body">
          <div className="sec-label">
            <span className="bar" />
            HOW TO READ YOUR TYRE SIZE
          </div>

          <div className="sw-panel">
            <div className="sw-code">
              <span className="chip hl">205</span>
              <span className="slash">/</span>
              <span className="chip hl">55</span>
              <span className="chip tiny">R</span>
              <span className="chip hl">16</span>
              <span className="chip tiny">91</span>
              <span className="chip tiny">V</span>
            </div>

            <div className="sw-icons">
              <div className="iconcard">
                <WidthIcon />
                <span className="ic-label">Width</span>
                <span className="ic-sub">205 mm</span>
              </div>
              <div className="iconcard">
                <ProfileIcon />
                <span className="ic-label">Profile</span>
                <span className="ic-sub">55 %</span>
              </div>
              <div className="iconcard">
                <RimIcon />
                <span className="ic-label">Rim</span>
                <span className="ic-sub">16 inch</span>
              </div>
            </div>

            <div className="sw-legend">
              <div className="legend-row"><span className="lk">R</span><span className="lv">Radial construction</span></div>
              <div className="legend-row"><span className="lk">91</span><span className="lv">Load index — max weight per tyre</span></div>
              <div className="legend-row"><span className="lk">V</span><span className="lv">Speed rating — max rated speed</span></div>
            </div>
          </div>

          <p className="m-text">
            Your size is printed on the <strong>sidewall</strong> of the tyre.
            Read it left to right — <strong>width</strong>, <strong>profile</strong>, then <strong>rim diameter</strong>.
          </p>
        </div>

        <div className="m-foot">
          <button className="got-btn" onClick={handleClose}>Got it</button>
        </div>
      </div>

      <style jsx>{`
        .tsg-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(13,26,18,0.55);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          opacity: 0;
          transition: opacity .2s ease;
        }
        .tsg-backdrop.show { opacity: 1; }

        .tsg-modal {
          position: relative;
          width: 420px; max-width: 100%;
          max-height: 80vh;
          display: flex; flex-direction: column;
          background: #FFFFFF;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 30px 70px -20px rgba(13,26,18,0.45);
          overflow: hidden;
          border-radius: 20px;
          transform: translateY(14px) scale(0.97);
          opacity: 0;
          transition: transform .25s cubic-bezier(.22,1,.36,1), opacity .2s ease;
        }
        .tsg-backdrop.show .tsg-modal { transform: translateY(0) scale(1); opacity: 1; }

        .m-head {
          flex-shrink: 0;
          display: grid; grid-template-columns: 40px 1fr 40px; align-items: center;
          padding: 16px 12px;
          border-bottom: 1px solid #F0EFE9;
        }
        .m-head .title { text-align: center; font-size: 16px; font-weight: 800; color: #16211B; letter-spacing: -0.01em; }
        .m-iconbtn {
          width: 36px; height: 36px; border-radius: 10px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; border: 0; color: #6E7C74; transition: color .15s ease;
        }
        .m-iconbtn:hover { color: #076330; }

        .m-body { overflow-y: auto; overflow-x: hidden; padding: 22px 22px 6px; -webkit-overflow-scrolling: touch; }
        .m-body::-webkit-scrollbar { width: 8px; }
        .m-body::-webkit-scrollbar-thumb { background: #E7E5DE; border-radius: 8px; }

        .sec-label {
          display: inline-flex; align-items: center; gap: 9px;
          font-family: 'DM Mono', monospace;
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em; color: #E8572A;
          margin-bottom: 14px;
        }
        .sec-label .bar { width: 20px; height: 2px; background: #E8572A; border-radius: 2px; }

        .sw-panel {
          position: relative;
          background: #FAF9F5; border: 1px solid #E7E5DE; border-radius: 14px;
          padding: 18px 14px 16px;
        }
        .sw-code { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }
        .chip {
          font-family: 'DM Mono', monospace; font-weight: 700; font-size: 18px;
          color: #16211B; background: #fff; border: 1px solid #E7E5DE;
          border-radius: 8px; padding: 9px 12px; min-width: 38px; text-align: center; line-height: 1;
        }
        .chip.hl { color: #fff; background: #076330; border-color: #076330; }
        .chip.tiny { font-size: 14px; padding: 8px 9px; min-width: 30px; }
        .slash { color: #9DB0A5; font-weight: 700; font-size: 18px; }

        .sw-icons { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 16px; }
        .iconcard {
          background: #fff; border: 1px solid #E7E5DE; border-radius: 12px;
          padding: 12px 6px 10px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .iconcard svg { display: block; }
        .iconcard .ic-label { font-size: 10.5px; font-weight: 800; letter-spacing: 0.05em; color: #16211B; text-transform: uppercase; }
        .iconcard .ic-sub { font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600; color: #E8572A; }

        .sw-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
        .legend-row { display: flex; align-items: center; gap: 10px; font-size: 12.5px; }
        .legend-row .lk {
          font-weight: 800; font-size: 11px; color: #16211B;
          background: #fff; border: 1px solid #E7E5DE; border-radius: 6px;
          padding: 3px 8px; min-width: 28px; text-align: center;
        }
        .legend-row .lv { color: #6E7C74; font-weight: 500; }

        .m-text { font-size: 13px; line-height: 1.55; color: #6E7C74; margin: 16px 0 20px; }
        .m-text strong { color: #16211B; font-weight: 700; }

        .m-foot { flex-shrink: 0; padding: 14px 18px calc(18px + env(safe-area-inset-bottom)); border-top: 1px solid #F0EFE9; }
        .got-btn {
          width: 100%; appearance: none; border: 0; cursor: pointer;
          font-family: inherit; font-size: 15px; font-weight: 700; color: #fff;
          background: #E8572A; border-radius: 12px; padding: 14px;
          transition: background .15s ease;
        }
        .got-btn:hover { background: #D8470F; }

        @media (prefers-reduced-motion: reduce) {
          .tsg-backdrop, .tsg-modal { transition: none !important; }
        }
      `}</style>
    </div>
  )
}
