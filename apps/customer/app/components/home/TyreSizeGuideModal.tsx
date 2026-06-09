'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ============================================================
   ICONS
   ============================================================ */
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ============================================================
   SIDEWALL DIAGRAM — tyre code breakdown (205/55 R16 91V)
   ============================================================ */
function WidthIcon() {
  return (
    <svg width="50" height="50" viewBox="0 0 56 56" fill="none">
      <rect x="19" y="5" width="18" height="32" rx="6" fill="#0c0c0e" stroke="#F4581E" strokeWidth="2" />
      <line x1="24" y1="11" x2="24" y2="31" stroke="#3a3a42" strokeWidth="1.6" />
      <line x1="28" y1="11" x2="28" y2="31" stroke="#3a3a42" strokeWidth="1.6" />
      <line x1="32" y1="11" x2="32" y2="31" stroke="#3a3a42" strokeWidth="1.6" />
      <line x1="16" y1="46" x2="40" y2="46" stroke="#9A9AA3" strokeWidth="1.8" />
      <path d="M16 46 L20 43 M16 46 L20 49" stroke="#9A9AA3" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M40 46 L36 43 M40 46 L36 49" stroke="#9A9AA3" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function ProfileIcon() {
  return (
    <svg width="50" height="50" viewBox="0 0 56 56" fill="none">
      <circle cx="24" cy="25" r="19" fill="#0c0c0e" stroke="#3a3a42" strokeWidth="2" />
      <circle cx="24" cy="25" r="9" fill="#18181c" stroke="#F4581E" strokeWidth="2" />
      <line x1="48" y1="6" x2="48" y2="16" stroke="#9A9AA3" strokeWidth="1.8" />
      <path d="M48 6 L45 9 M48 6 L51 9" stroke="#9A9AA3" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M48 16 L45 13 M48 16 L51 13" stroke="#9A9AA3" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="43" y1="6" x2="50" y2="6" stroke="#3a3a42" strokeWidth="1.2" />
      <line x1="43" y1="16" x2="50" y2="16" stroke="#3a3a42" strokeWidth="1.2" />
    </svg>
  )
}
function RimIcon() {
  return (
    <svg width="50" height="50" viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="24" r="18" fill="#0c0c0e" stroke="#3a3a42" strokeWidth="2" />
      <circle cx="28" cy="24" r="13" fill="none" stroke="#F4581E" strokeWidth="2" />
      <circle cx="28" cy="24" r="3.5" fill="#F4581E" />
      {[0, 72, 144, 216, 288].map((a) => (
        <line key={a} x1="28" y1="24"
          x2={28 + 12 * Math.cos((a - 90) * Math.PI / 180)}
          y2={24 + 12 * Math.sin((a - 90) * Math.PI / 180)}
          stroke="#3a3a42" strokeWidth="1.6" />
      ))}
      <line x1="16" y1="49" x2="40" y2="49" stroke="#9A9AA3" strokeWidth="1.8" />
      <path d="M16 49 L20 46 M16 49 L20 52" stroke="#9A9AA3" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M40 49 L36 46 M40 49 L36 52" stroke="#9A9AA3" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SidewallDiagram() {
  return (
    <div className="sw">
      <div className="sw-codewrap">
        <div className="sw-code">
          <span className="chip hl">205</span>
          <span className="slash">/</span>
          <span className="chip hl">55</span>
          <span className="chip tiny">R</span>
          <span className="chip hl">16</span>
          <span className="chip tiny">91</span>
          <span className="chip tiny">V</span>
        </div>
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
  )
}

/* ============================================================
   PLACARD DIAGRAM — side-profile car with 4 callouts
   viewBox 0 0 380 250 ; car faces right (front = right)
   ============================================================ */
function PlacardDiagram() {
  return (
    <div className="placard">
      <svg viewBox="0 0 380 250" role="img" aria-label="Where to find your car's tyre placard">
        <line className="ground" x1="40" y1="206" x2="340" y2="206" />

        <path className="carbody" d="
          M52 150
          Q52 140 64 138
          L300 138
          Q322 138 332 152
          L344 168
          Q350 176 350 184
          L350 192
          Q350 200 342 200
          L62 200
          Q52 200 52 192
          Z" />
        <path className="carbody" d="
          M120 138
          L150 102
          Q156 96 166 96
          L250 96
          Q262 96 270 106
          L294 138
          Z" />
        <path className="carglass" d="M158 132 L176 106 L210 106 L210 132 Z" />
        <path className="carglass" d="M220 132 L220 106 L246 106 Q254 106 259 113 L274 132 Z" />

        <circle className="tyre" cx="116" cy="200" r="27" />
        <circle className="rim" cx="116" cy="200" r="13" />
        <circle className="tyre" cx="288" cy="200" r="27" />
        <circle className="rim" cx="288" cy="200" r="13" />

        <path className="lead" d="M318 150 L342 120 L368 120" />
        <circle className="dot-ring" cx="318" cy="150" r="7" />
        <circle className="dot" cx="318" cy="150" r="3.2" />
        <text className="clabel" x="366" y="114" textAnchor="end">Under the bonnet</text>
        <text className="csub" x="366" y="128" textAnchor="end">ENGINE BAY STRUT</text>

        <path className="lead" d="M262 124 L300 64 L368 64" />
        <circle className="dot-ring" cx="262" cy="124" r="7" />
        <circle className="dot" cx="262" cy="124" r="3.2" />
        <text className="clabel" x="366" y="58" textAnchor="end">Inside the glove box</text>
        <text className="csub" x="366" y="72" textAnchor="end">OWNER MANUAL AREA</text>

        <path className="lead" d="M205 152 L160 64 L92 64" />
        <circle className="dot-ring" cx="205" cy="152" r="7" />
        <circle className="dot" cx="205" cy="152" r="3.2" />
        <text className="clabel" x="14" y="58">Driver&apos;s door jamb</text>
        <text className="csub" x="14" y="72">DOOR EDGE STICKER</text>

        <path className="lead" d="M80 150 L52 120 L14 120" />
        <circle className="dot-ring" cx="80" cy="150" r="7" />
        <circle className="dot" cx="80" cy="150" r="3.2" />
        <text className="clabel" x="14" y="114">Inside the fuel cap</text>
        <text className="csub" x="14" y="128">FUEL FILLER FLAP</text>
      </svg>
    </div>
  )
}

/* ============================================================
   GUIDE CONTENT — shared modal body
   ============================================================ */
function GuideContent() {
  return (
    <>
      <div className="sec-label">
        <span className="bar"></span>
        HOW TO READ YOUR TYRE SIZE
      </div>
      <SidewallDiagram />
      <p className="m-text">
        Your size is printed on the <strong>sidewall</strong> of the tyre. Read it left to
        right — <strong>width</strong>, <strong>profile</strong>, then <strong>rim diameter</strong>,
        followed by the load &amp; speed rating.
      </p>

      <div className="sec-divider"></div>

      <div className="sec-label">
        <span className="bar"></span>
        WHERE TO FIND YOUR SIZE
      </div>
      <p className="m-text" style={{ marginTop: 0, marginBottom: 16 }}>
        Check your vehicle&apos;s <strong>tyre placard</strong> for the recommended sizes — it lists
        wheel &amp; tyre combinations, load capacity, speed rating and tyre pressure. You&apos;ll
        usually find it in one of these spots:
      </p>
      <PlacardDiagram />
    </>
  )
}

/* ============================================================
   MODAL — centered "Classic" variant with entrance/exit animation
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
    setTimeout(onClose, 300)
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  return (
    <div
      className={'tsg-backdrop center' + (show ? ' show' : '')}
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="tsg-modal" role="dialog" aria-modal="true" aria-label="Where to find my tyre size">
        <div className="m-head">
          <button className="m-iconbtn" onClick={handleClose} aria-label="Back"><BackIcon /></button>
          <span className="title">Where to find my tyre size?</span>
          <button className="m-iconbtn" onClick={handleClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <div className="m-body">
          <GuideContent />
        </div>

        <div className="m-foot">
          <button className="got-btn" onClick={handleClose}>Got it</button>
        </div>
      </div>

      <style jsx>{`
        .tsg-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(6,6,8,0.72);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center; padding: 20px;
          opacity: 0;
          transition: opacity .26s ease;
        }
        .tsg-backdrop.show { opacity: 1; }

        .tsg-modal {
          position: relative;
          width: 440px; max-width: 100%;
          max-height: 80vh;
          margin-top: 72px;
          display: flex; flex-direction: column;
          background: #18181c;
          box-shadow: 0 30px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
          overflow: hidden;
          border-radius: 22px;
          transform: translateY(16px) scale(0.96);
          opacity: 0;
          transition: transform .3s cubic-bezier(.2,.9,.3,1.1), opacity .26s ease;
        }
        .tsg-backdrop.show .tsg-modal { transform: translateY(0) scale(1); opacity: 1; }

        .m-head {
          flex-shrink: 0;
          display: grid; grid-template-columns: 40px 1fr 40px; align-items: center;
          padding: 16px 14px;
          border-bottom: 1px solid #2e2e35;
          background: rgba(255,255,255,0.015);
        }
        .m-head .title { text-align: center; font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.01em; }
        .m-iconbtn {
          width: 36px; height: 36px; border-radius: 10px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          background: transparent; border: 0; color: #9A9AA3; transition: all .16s ease;
        }
        .m-iconbtn:hover { background: #26262c; color: #fff; }

        .m-body { overflow-y: auto; overflow-x: hidden; padding: 22px 22px 14px; -webkit-overflow-scrolling: touch; }
        .m-body::-webkit-scrollbar { width: 8px; }
        .m-body::-webkit-scrollbar-thumb { background: #3a3a42; border-radius: 8px; }

        .m-body :global(.sec-label) {
          display: inline-flex; align-items: center; gap: 9px;
          font-size: 11px; font-weight: 800; letter-spacing: 0.16em; color: #FF8048;
          margin-bottom: 14px;
        }
        .m-body :global(.sec-label .bar) { width: 22px; height: 2px; background: #F4581E; border-radius: 2px; }

        .m-body :global(.m-text) { font-size: 13.5px; line-height: 1.6; color: #9A9AA3; font-weight: 500; margin-top: 14px; }
        .m-body :global(.m-text strong) { color: #ECECEF; font-weight: 700; }

        .m-body :global(.sec-divider) { height: 1px; background: #2e2e35; margin: 24px 0; }

        .m-foot { flex-shrink: 0; padding: 14px 18px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid #2e2e35; background: #18181c; }
        .got-btn {
          width: 100%; appearance: none; border: 0; cursor: pointer;
          font-family: inherit; font-size: 15.5px; font-weight: 800; color: #fff;
          background: #F4581E; border-radius: 13px; padding: 15px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 12px 30px -12px rgba(244, 88, 30, 0.30);
          transition: transform .1s ease, background .16s ease;
          white-space: nowrap;
        }
        .got-btn:hover { background: #D8470F; }
        .got-btn:active { transform: scale(0.985); }

        /* ---------- Sidewall diagram ---------- */
        .m-body :global(.sw-codewrap) {
          position: relative;
          background: #131316;
          border: 1px solid #2e2e35;
          border-radius: 14px;
          padding: 18px 14px 16px;
          overflow: hidden;
        }
        .m-body :global(.sw-codewrap)::before {
          content: ""; position: absolute; left: 0; right: 0; top: 0; height: 46px;
          background: repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 6px, transparent 6px 14px);
          -webkit-mask: linear-gradient(180deg, #000, transparent);
          mask: linear-gradient(180deg, #000, transparent);
          opacity: .5;
        }
        .m-body :global(.sw-code) {
          position: relative;
          display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap;
        }
        .m-body :global(.chip) {
          font-weight: 800; font-size: 18px;
          color: #ECECEF; background: #26262c; border: 1px solid #3a3a42;
          border-radius: 9px; padding: 9px 11px; min-width: 38px; text-align: center;
          line-height: 1;
        }
        .m-body :global(.chip.hl) { color: #fff; background: rgba(244,88,30,0.14); border-color: rgba(244,88,30,0.55); box-shadow: 0 0 0 1px rgba(244,88,30,0.18) inset; }
        .m-body :global(.chip.tiny) { font-size: 14px; padding: 8px 9px; min-width: 30px; }
        .m-body :global(.slash) { color: #6E6E77; font-weight: 700; font-size: 18px; }

        .m-body :global(.sw-icons) { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 14px; }
        .m-body :global(.iconcard) {
          background: #131316; border: 1px solid #2e2e35; border-radius: 12px;
          padding: 12px 8px 10px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .m-body :global(.iconcard svg) { display: block; }
        .m-body :global(.iconcard .ic-label) { font-size: 10.5px; font-weight: 800; letter-spacing: 0.06em; color: #ECECEF; text-transform: uppercase; }
        .m-body :global(.iconcard .ic-sub) { font-size: 11px; font-weight: 700; color: #FF8048; }

        .m-body :global(.sw-legend) { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
        .m-body :global(.legend-row) { display: flex; align-items: center; gap: 10px; font-size: 12.5px; }
        .m-body :global(.legend-row .lk) {
          font-weight: 800; font-size: 12px; color: #ECECEF;
          background: #26262c; border: 1px solid #3a3a42; border-radius: 6px;
          padding: 3px 8px; min-width: 30px; text-align: center;
        }
        .m-body :global(.legend-row .lv) { color: #9A9AA3; font-weight: 500; }

        /* ---------- Placard diagram ---------- */
        .m-body :global(.placard) {
          background: #131316;
          border: 1px solid #2e2e35;
          border-radius: 14px;
          padding: 8px;
        }
        .m-body :global(.placard svg) { width: 100%; height: auto; display: block; }
        .m-body :global(.placard .lead) { stroke: #3a3a42; stroke-width: 1.4; fill: none; }
        .m-body :global(.placard .dot) { fill: #F4581E; }
        .m-body :global(.placard .dot-ring) { fill: none; stroke: #F4581E; stroke-width: 1.5; opacity: .5; }
        .m-body :global(.placard .clabel) { fill: #ECECEF; font-weight: 700; font-size: 11px; }
        .m-body :global(.placard .csub) { fill: #6E6E77; font-weight: 600; font-size: 9px; letter-spacing: .04em; }
        .m-body :global(.placard .carbody) { fill: #26262c; stroke: #3a3a42; stroke-width: 1.5; }
        .m-body :global(.placard .carglass) { fill: #101015; }
        .m-body :global(.placard .tyre) { fill: #0c0c0e; stroke: #3a3a42; stroke-width: 2; }
        .m-body :global(.placard .rim) { fill: none; stroke: #6E6E77; stroke-width: 2; }
        .m-body :global(.placard .ground) { stroke: #2e2e35; stroke-width: 1.5; stroke-dasharray: 3 5; }

        @media (prefers-reduced-motion: reduce) {
          .tsg-backdrop, .tsg-modal { transition: none !important; }
        }

        @media (max-width: 460px) {
          .tsg-backdrop.center { padding: 0; align-items: flex-end; }
          .tsg-modal { border-radius: 22px 22px 0 0; width: 100%; max-height: 100vh; margin-top: 0; }
        }
      `}</style>
    </div>
  )
}
