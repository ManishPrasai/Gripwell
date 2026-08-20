'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import TyreSizeGuideModal from './TyreSizeGuideModal'

const TYRE_WIDTHS   = ['155','165','175','185','195','205','215','225','235','245','255','265','275','285','295','305']
const TYRE_PROFILES = ['25','30','35','40','45','50','55','60','65','70','75','80']
const RIM_SIZES     = ['13','14','15','16','17','18','19','20','21','22','24']
const POPULAR_RIMS  = ['15','16','17','18','19','20','22']

/* ── Tyres dropdown: popular picks shown first, then the full sorted range ── */
const POPULAR_TYRE_WIDTHS   = ['205','225','245']
const POPULAR_TYRE_PROFILES = ['55','60','65']
const POPULAR_TYRE_RIMS     = ['16','17','18']

const byNumAsc = (a: string, b: string) => Number(a) - Number(b)

const SORTED_TYRE_WIDTHS      = [...TYRE_WIDTHS].sort(byNumAsc)
const SORTED_TYRE_PROFILES    = [...TYRE_PROFILES].sort(byNumAsc)
const SORTED_RIM_SIZES        = [...RIM_SIZES].sort(byNumAsc)
const SORTED_POPULAR_WIDTHS   = [...POPULAR_TYRE_WIDTHS].sort(byNumAsc)
const SORTED_POPULAR_PROFILES = [...POPULAR_TYRE_PROFILES].sort(byNumAsc)
const SORTED_POPULAR_RIMS     = [...POPULAR_TYRE_RIMS].sort(byNumAsc)

interface TyreSizeCombo { width: number; profile: number; rimDiameter: number }

/* Pure helpers — derive valid next-dropdown options from real inventory combos,
   falling back to the full sorted range when nothing matches (keeps the UI usable). */
function profilesForWidth(combos: TyreSizeCombo[], w: string): string[] {
  const matches = combos.filter(c => c.width === Number(w))
  if (!matches.length) return SORTED_TYRE_PROFILES
  const set      = new Set(matches.map(c => String(c.profile)))
  const filtered = SORTED_TYRE_PROFILES.filter(p => set.has(p))
  return filtered.length ? filtered : SORTED_TYRE_PROFILES
}

function rimsForWidthProfile(combos: TyreSizeCombo[], w: string, p: string): string[] {
  const matches = combos.filter(c => c.width === Number(w) && c.profile === Number(p))
  if (!matches.length) return SORTED_RIM_SIZES
  const set      = new Set(matches.map(c => String(c.rimDiameter)))
  const filtered = SORTED_RIM_SIZES.filter(r => set.has(r))
  return filtered.length ? filtered : SORTED_RIM_SIZES
}

/* Custom listbox — native <select> popups pick their own open direction (often
   upward) based on browser heuristics we can't override.

   Both desktop panel and mobile sheet are portalled to <body>. A portal is
   mandatory, not cosmetic: the search card's backdrop-filter creates a
   stacking context (as does the persistent transform left on .hs-drops by its
   fill-mode:both entry animation), so any z-index applied to an in-card panel
   is trapped inside the card and loses to the later-in-DOM trust-signal pill,
   which forms its own stacking context. Rendering from <body> with
   position:fixed escapes every ancestor stacking context, letting the panel
   float over the CTA button, card edge, and trust badges without ever
   affecting layout flow. */
function SizeDropdown({
  label,
  value,
  onChange,
  groups,
  suffix = '',
}: {
  label:    string
  value:    string
  onChange: (v: string) => void
  groups:   { popular: string[]; all: string[] }
  suffix?:  string
}) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const [panelPos, setPanelPos] = useState<{ left: number; top: number; width: number; maxHeight: number } | null>(null)
  const rootRef    = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)

  /* Single flat list (popular block first, then all) so keyboard navigation
     has one continuous index space across both visual groups. */
  const flatOptions = useMemo(
    () => [...groups.popular, ...groups.all],
    [groups.popular, groups.all],
  )

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /* Desktop: anchor the fixed-position panel to the trigger's viewport rect.
     Re-measure on scroll/resize so it stays glued while open. */
  useEffect(() => {
    if (!open || isMobile) return
    function updatePos() {
      const el = triggerRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setPanelPos({
        left:      r.left,
        top:       r.bottom + 8,
        width:     r.width,
        maxHeight: Math.max(160, Math.min(288, window.innerHeight - r.bottom - 24)),
      })
    }
    updatePos()
    window.addEventListener('resize', updatePos)
    window.addEventListener('scroll', updatePos, true)
    return () => {
      window.removeEventListener('resize', updatePos)
      window.removeEventListener('scroll', updatePos, true)
      setPanelPos(null)
    }
  }, [open, isMobile])

  /* Desktop: close on outside tap. Panel lives in a portal, so check both
     the trigger subtree and the panel subtree. Mobile sheet has its own backdrop. */
  useEffect(() => {
    if (!open || isMobile) return
    function onPointerDown(e: PointerEvent) {
      const t = e.target as Node
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, isMobile])

  /* On open, start keyboard highlight at the currently selected value */
  useEffect(() => {
    if (!open) return
    const idx = flatOptions.indexOf(value)
    setHighlighted(idx >= 0 ? idx : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  /* Keep the highlighted option visible while arrowing through the list */
  useEffect(() => {
    if (!open || isMobile || !panelPos) return
    panelRef.current
      ?.querySelector(`[data-idx="${highlighted}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [highlighted, open, isMobile, panelPos])

  /* Keyboard: Escape dismisses (both layouts); arrows/Home/End/Enter drive
     selection on desktop. Focus stays on the trigger, listbox-style. */
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (isMobile) return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlighted(i => Math.min(i + 1, flatOptions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlighted(i => Math.max(i - 1, 0))
          break
        case 'Home':
          e.preventDefault()
          setHighlighted(0)
          break
        case 'End':
          e.preventDefault()
          setHighlighted(flatOptions.length - 1)
          break
        case 'Enter':
        case ' ': {
          e.preventDefault()
          const v = flatOptions[highlighted]
          if (v !== undefined) pick(v)
          break
        }
        case 'Tab':
          setOpen(false)
          break
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, isMobile, highlighted, flatOptions])

  /* Mobile sheet: lock body scroll while open */
  useEffect(() => {
    if (!(open && isMobile)) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open, isMobile])

  function pick(v: string) {
    onChange(v)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function renderOption(v: string, idx: number, mobile = false) {
    const active = v === value
    const isHighlighted = !mobile && idx === highlighted
    return (
      <button key={idx} type="button" role="option" aria-selected={active}
        data-idx={idx} tabIndex={-1}
        onClick={() => pick(v)}
        onMouseEnter={() => { if (!mobile) setHighlighted(idx) }}
        className={`w-full text-left rounded-lg transition-colors duration-100 cursor-pointer ${
          mobile ? 'px-4 py-3.5 text-base' : 'px-4 py-2 text-sm'
        } ${
          active
            ? 'bg-orange-600/15 text-orange-400 font-semibold'
            : isHighlighted
              ? 'bg-neutral-800 text-white font-medium'
              : 'text-white font-medium hover:bg-neutral-800'
        }`}>
        {v}{suffix}
      </button>
    )
  }

  function renderGroups(mobile = false) {
    const popLen = groups.popular.length
    return (
      <>
        {popLen > 0 && (
          <div className="mb-1.5">
            <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">Popular Sizes</p>
            {groups.popular.map((v, i) => renderOption(v, i, mobile))}
          </div>
        )}
        <div>
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">All Options</p>
          {groups.all.map((v, i) => renderOption(v, popLen + i, mobile))}
        </div>
      </>
    )
  }

  return (
    <div className="relative" ref={rootRef}>
      <button type="button" ref={triggerRef} onClick={() => setOpen(o => !o)}
        onKeyDown={e => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        aria-haspopup="listbox" aria-expanded={open}
        className="w-full flex items-center justify-between bg-neutral-900/90 border border-neutral-800 text-white rounded-xl px-3 py-2.5 md:px-4 md:py-3.5 text-base font-semibold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 cursor-pointer">
        <span>{value}{suffix}</span>
        <svg className={`text-neutral-400 w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Desktop: body-portalled fixed panel — escapes the card's
           backdrop-filter stacking context, floats over CTA + trust badges,
           and never shifts page layout. Opaque bg-neutral-900 prevents any
           bleed-through from content behind it. ── */}
      {open && !isMobile && panelPos && typeof document !== 'undefined' && createPortal(
        <div ref={panelRef} role="listbox" aria-label={`Select ${label}`}
          className="fixed overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] z-[10000] p-2"
          style={{ left: panelPos.left, top: panelPos.top, width: panelPos.width, maxHeight: panelPos.maxHeight }}>
          {renderGroups()}
        </div>,
        document.body,
      )}

      {/* ── Mobile: full-bleed bottom sheet ──
           SSR-safe: isMobile is false until the matchMedia effect runs after
           mount, so this branch can never execute on the server; the typeof
           guard makes that invariant explicit. */}
      {open && isMobile && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10050]" role="dialog" aria-modal="true" aria-label={`Select ${label}`}>
          <div
            className="absolute inset-0 bg-black/60"
            style={{ animation: 'nv-fade-in 0.25s ease both' }}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 right-0 bottom-0 rounded-t-2xl border-t border-neutral-800 bg-neutral-900 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] flex flex-col"
            style={{ maxHeight: '72svh', animation: 'nv-sheet-up 0.32s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            {/* Drag handle + title row */}
            <div className="flex-shrink-0 pt-3 pb-2 px-5">
              <div className="mx-auto w-10 h-1 rounded-full bg-neutral-700 mb-3" />
              <div className="flex items-center justify-between">
                <span className="text-white text-base font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Select {label}
                </span>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 cursor-pointer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="overflow-y-auto overscroll-contain p-3 pb-[max(16px,env(safe-area-inset-bottom))]">
              {renderGroups(true)}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

/*
  Navbar wrapper = 18px top-padding + 64px nav row = 82px.
  NAV_CLEAR adds breathing room above the badge.
*/
const NAV_CLEAR = 110

export default function HeroSection() {
  const router = useRouter()
  const [tab, setTab]         = useState<'tyres' | 'wheels'>('tyres')
  const [width, setWidth]     = useState('205')
  const [profile, setProfile] = useState('55')
  const [rim, setRim]         = useState('16')
  const [wRim, setWRim]       = useState('17')
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  /* Sliding pill behind the active Tyres/Wheels toggle button — measured from
     the actual button rects so it tracks perfectly regardless of label width. */
  const segRefs = useRef<Record<'tyres' | 'wheels', HTMLButtonElement | null>>({ tyres: null, wheels: null })
  const [segIndicator, setSegIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    function measure() {
      const el = segRefs.current[tab]
      if (el) setSegIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [tab])

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

  /* Width changed — cascade-validate profile, then rim; reset to first matching popular option if invalid */
  function handleWidthChange(next: string) {
    setWidth(next)

    const profiles    = profilesForWidth(sizeCombos, next)
    const nextProfile = profiles.includes(profile)
      ? profile
      : (SORTED_POPULAR_PROFILES.find(p => profiles.includes(p)) ?? profiles[0])
    if (nextProfile !== profile) setProfile(nextProfile)

    const rims = rimsForWidthProfile(sizeCombos, next, nextProfile)
    if (!rims.includes(rim)) {
      setRim(SORTED_POPULAR_RIMS.find(r => rims.includes(r)) ?? rims[0])
    }
  }

  /* Profile changed — cascade-validate rim */
  function handleProfileChange(next: string) {
    setProfile(next)
    const rims = rimsForWidthProfile(sizeCombos, width, next)
    if (!rims.includes(rim)) {
      setRim(SORTED_POPULAR_RIMS.find(r => rims.includes(r)) ?? rims[0])
    }
  }

  /* Popular-Sizes optgroup only lists values that remain valid for the current selection */
  const widthOptionGroups = {
    popular: SORTED_POPULAR_WIDTHS,
    all:     SORTED_TYRE_WIDTHS,
  }
  const profileOptionGroups = {
    popular: availableProfiles,
    all:     SORTED_TYRE_PROFILES,
  }
  const rimOptionGroups = {
    popular: availableRims,
    all:     SORTED_RIM_SIZES,
  }
  const wheelRimOptionGroups = {
    popular: POPULAR_RIMS,
    all:     RIM_SIZES,
  }

  function handleSearch() {
    if (tab === 'tyres') {
      router.push(`/tyres/results?width=${width}&profile=${profile}&rim=${rim}`)
    } else {
      router.push(`/wheels/results?diameter=${wRim}%22`)
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

        /* Tab-switch transitions — each panel always enters from its own side:
           Wheels glides in left→right, Tyres glides in right→left. */
        @keyframes hsSlideFromLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hsSlideFromRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .hs-drops-tyres  { animation: hsSlideFromRight 0.38s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .hs-drops-wheels { animation: hsSlideFromLeft  0.38s cubic-bezier(0.16, 1, 0.3, 1) both; }
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
          <img
            src="/images/hero-poster.jpg"
            alt="Nova Tyres"
            className="w-full h-full object-cover"
          />
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
        {/* Core Page Container — w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
            Same 1280px content boundary as the Navbar and Best Deals, so the
            badge/headline/search card line up with the rest of the page grid
            on every viewport from laptop to ultrawide. */}
        <div
          className="hs-content nv-shell relative z-10 flex flex-col items-center text-center"
          style={{ paddingTop: `${NAV_CLEAR}px`, paddingBottom: '88px' }}
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
              className="hs-card bg-neutral-950/70 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]"
              style={{ textAlign: 'left' }}
            >
              <p className="hs-card-hd"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>
                Search tyres and wheels by size in seconds.
              </p>

              {/* Tyres / Wheels toggle */}
              <div className="hs-seg relative bg-neutral-900/80 border border-neutral-800 rounded-xl p-1.5 flex w-full md:inline-flex md:w-auto gap-1">
                {/* Sliding active-pill — glides between buttons instead of popping */}
                <div className="absolute top-1.5 bottom-1.5 rounded-lg bg-neutral-800 shadow-md transition-all duration-300 ease-out pointer-events-none"
                  style={{ left: `${segIndicator.left}px`, width: `${segIndicator.width}px` }} />
                {(['tyres', 'wheels'] as const).map(t => {
                  const active = tab === t
                  return (
                    <button key={t} ref={el => { segRefs.current[t] = el }} onClick={() => setTab(t)}
                      className={`relative z-10 flex-1 justify-center md:flex-none md:justify-start inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-colors duration-300 ease-out ${
                        active ? 'text-white' : 'bg-transparent text-neutral-400 hover:text-white'
                      }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      <i className={t === 'tyres' ? 'ti ti-circle-dot' : 'ti ti-disc'} aria-hidden="true"
                        style={{ fontSize: '16px', color: 'inherit' }} />
                      {t === 'tyres' ? 'Tyres' : 'Wheels'}
                    </button>
                  )
                })}
              </div>

              {/* Selection fields */}
              {tab === 'tyres' ? (
                <div key="tyres" className="hs-drops hs-drops-tyres grid grid-cols-3 gap-2 md:gap-4 mt-5">
                  <div className="relative">
                    <label className="text-[10px] md:text-[11px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5 md:mb-2 block">Width</label>
                    <SizeDropdown label="Width" value={width} onChange={handleWidthChange} groups={widthOptionGroups} />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] md:text-[11px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5 md:mb-2 block">Profile</label>
                    <SizeDropdown label="Profile" value={profile} onChange={handleProfileChange} groups={profileOptionGroups} />
                  </div>
                  <div className="relative">
                    <label className="text-[10px] md:text-[11px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5 md:mb-2 block">Rim</label>
                    <SizeDropdown label="Rim" value={rim} onChange={setRim} groups={rimOptionGroups} suffix={'"'} />
                  </div>
                </div>
              ) : (
                <div key="wheels" className="hs-drops hs-drops-wheels grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 items-end mt-4">
                  <div className="relative">
                    <label className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5 block">Rim Size</label>
                    <SizeDropdown label="Rim Size" value={wRim} onChange={setWRim} groups={wheelRimOptionGroups} suffix={'"'} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase mb-1.5 block">Popular sizes</label>
                    <div className="grid grid-cols-7 gap-2">
                      {POPULAR_RIMS.map(v => {
                        const active = wRim === v
                        return (
                          <button key={v} onClick={() => setWRim(v)}
                            className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full border text-xs md:text-sm font-semibold cursor-pointer transition-all duration-150 ${
                              active
                                ? 'bg-orange-600 border-orange-600 text-white font-bold shadow-lg shadow-orange-600/20'
                                : 'border-neutral-800 text-neutral-400 hover:border-neutral-500 hover:text-white'
                            }`}
                            style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {v}&quot;
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Help */}
              <div className="hs-help flex items-center gap-1.5 mt-4 mb-1">
                <i className="ti ti-info-circle" aria-hidden="true" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }} />
                <button type="button" onClick={() => setShowSizeGuide(true)}
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
                  Need help finding your tyre size?
                </button>
              </div>

              {/* CTA */}
              <button className="hs-cta mt-6 w-full bg-[#f05a28] hover:bg-[#d94f21] text-white font-bold text-base py-4 px-6 rounded-xl shadow-lg shadow-orange-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 ease-in-out cursor-pointer text-center"
                onClick={handleSearch}
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {tab === 'tyres' ? 'Search Tyres' : 'Search Wheels'}
              </button>
            </div>
          </div>

          {/* 4 — Trust signals */}
          <div className="hs-stats w-full flex justify-center mt-10">
            <div
              className="inline-flex flex-row items-center rounded-full"
              style={{
                background: 'rgba(4,4,4,0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* ── Block 1: Google rating ── */}
              <div className="flex items-center gap-2 md:gap-3 px-3 sm:px-5 md:px-6 py-3 md:py-3.5">
                <svg width="20" height="20" viewBox="0 0 48 48" aria-label="Google" className="flex-shrink-0 hidden xs:block sm:block">
                  <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.1 3l6.1-6.1C34.9 4.5 29.7 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
                  <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 6 1.1 8.1 3l6.1-6.1C34.9 4.5 29.7 2 24 2 16.2 2 9.4 7.3 6.3 14.7z"/>
                  <path fill="#FBBC05" d="M24 46c5.6 0 10.8-1.9 14.8-5.1l-6.8-5.6C29.9 37 27.1 38 24 38c-5.8 0-10.7-3.9-12.4-9.3l-7 5.4C7.9 41.7 15.4 46 24 46z"/>
                  <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.7-4.9 6.2l6.8 5.6C41.8 37.3 45 31 45 24c0-1.3-.2-2.7-.5-4z"/>
                </svg>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="text-white font-black leading-none" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', letterSpacing: '-0.02em' }}>4.8</span>
                    <div className="flex items-center gap-px" aria-label="4.8 out of 5 stars">
                      {[1,2,3,4].map(i => (
                        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill="#FF5A1F">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                      <svg width="11" height="11" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="tsg-half" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="80%" stopColor="#FF5A1F"/>
                            <stop offset="80%" stopColor="rgba(255,255,255,0.12)"/>
                          </linearGradient>
                        </defs>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#tsg-half)"/>
                      </svg>
                    </div>
                  </div>
                  <p className="m-0 leading-none text-zinc-200" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600 }}>
                    450+ Reviews
                  </p>
                </div>
              </div>

              {/* vertical divider — always visible since layout is always horizontal */}
              <span className="w-px self-stretch flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)', margin: '10px 0' }} />

              {/* ── Block 2: Locations ── */}
              <div className="flex items-center gap-2 md:gap-3 px-3 sm:px-5 md:px-6 py-3 md:py-3.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e4e4e7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 hidden xs:block sm:block">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5" fill="#e4e4e7" stroke="none"/>
                </svg>
                <div className="flex flex-col gap-1">
                  <span className="text-white font-black leading-none" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', letterSpacing: '-0.02em' }}>9+</span>
                  <p className="m-0 leading-none text-zinc-200" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600 }}>
                    Locations
                  </p>
                </div>
              </div>

              {/* vertical divider */}
              <span className="w-px self-stretch flex-shrink-0" style={{ background: 'rgba(255,255,255,0.12)', margin: '10px 0' }} />

              {/* ── Block 3: Major Brands ── */}
              <div className="flex items-center gap-2 md:gap-3 px-3 sm:px-5 md:px-6 py-3 md:py-3.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 hidden xs:block sm:block" aria-label="Major tyre brands">
                  <circle cx="12" cy="12" r="11" stroke="#FF5A1F" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="5.5" stroke="#FF5A1F" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="1.8" fill="#FF5A1F"/>
                  <rect x="10.2" y="1.4" width="3.6" height="3.2" rx="0.8" fill="#FF5A1F"/>
                  <rect x="10.2" y="19.4" width="3.6" height="3.2" rx="0.8" fill="#FF5A1F"/>
                  <rect x="1.4" y="10.2" width="3.2" height="3.6" rx="0.8" fill="#FF5A1F"/>
                  <rect x="19.4" y="10.2" width="3.2" height="3.6" rx="0.8" fill="#FF5A1F"/>
                  <rect x="3.8" y="3.2" width="3" height="1.8" rx="0.6" fill="#FF5A1F" transform="rotate(45 5.3 4.1)"/>
                  <rect x="16.5" y="3.2" width="3" height="1.8" rx="0.6" fill="#FF5A1F" transform="rotate(-45 18 4.1)"/>
                  <rect x="3.8" y="17.8" width="3" height="1.8" rx="0.6" fill="#FF5A1F" transform="rotate(-45 5.3 18.7)"/>
                  <rect x="16.5" y="17.8" width="3" height="1.8" rx="0.6" fill="#FF5A1F" transform="rotate(45 18 18.7)"/>
                </svg>
                <div className="flex flex-col gap-1">
                  <span className="font-black leading-none" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', letterSpacing: '-0.02em', color: '#FF5A1F' }}>80+</span>
                  <p className="m-0 leading-none text-zinc-200" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600 }}>
                    Major Brands
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {showSizeGuide && <TyreSizeGuideModal onClose={() => setShowSizeGuide(false)} />}
    </>
  )
}
