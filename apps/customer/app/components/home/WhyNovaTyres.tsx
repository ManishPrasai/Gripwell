'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

/* ── Inline bold helper — wrap key phrases in **text** ───────────────────── */
function bold(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((p, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ color: '#1A1A1A', fontWeight: 700 }}>{p}</strong>
      : p
  )
}

/* ── Slide data ──────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    id:     1,
    kicker: 'EXPERT FITTING INCLUDED',
    text:   'Professional **fitting, balancing** and new valves included at every location — no hidden charges, ever.',
    image:  '/images/why/slide-1.jpg',
  },
  {
    id:     2,
    kicker: 'PRICE MATCH GUARANTEE',
    text:   "Find it cheaper? We'll **beat any written quote** — no questions asked. Always the best value.",
    image:  '/images/why/slide-1.jpg',
  },
  {
    id:     3,
    kicker: 'SAME-DAY SERVICE',
    text:   'Most jobs completed within **60 minutes**. Book a slot online, roll in and drive out sharper.',
    image:  '/images/why/slide-1.jpg',
  },
  {
    id:     4,
    kicker: 'AUSTRALIA-WIDE NETWORK',
    text:   '**9 convenient store locations** across VIC, NSW, QLD and SA — certified technicians at every branch.',
    image:  '/images/why/slide-1.jpg',
  },
]

/* ── Component ───────────────────────────────────────────────────────────── */
export default function WhyNovaTyres() {
  const [current,       setCurrent]       = useState(0)
  const [textVisible,   setTextVisible]   = useState(true)
  const [imgOffset,     setImgOffset]     = useState(0)       // % — 0 = visible, ±110 = off-screen
  const [imgTransition, setImgTransition] = useState(true)    // false during instant snap
  const [hovered,       setHovered]       = useState(false)
  const animatingRef                      = useRef(false)

  /*
    navigate — drives both animation phases independently:
      Phase 1 (0–220ms)  : text fades out upward, image slides out horizontally
      Phase 2 (220ms+)   : snap new slide, reverse img position instantly (no transition),
                           then let both animate in smoothly
  */
  function navigate(dir: 1 | -1, targetIndex?: number) {
    if (animatingRef.current) return
    animatingRef.current = true

    const next =
      targetIndex !== undefined
        ? targetIndex
        : (current + dir + SLIDES.length) % SLIDES.length

    /* ── exit ── */
    setTextVisible(false)
    setImgOffset(dir * -110)

    setTimeout(() => {
      /* snap to new slide, position image off-screen on the opposite side */
      setCurrent(next)
      setImgTransition(false)
      setImgOffset(dir * 110)

      /* two rAFs guarantee the snap is painted before we re-enable transition */
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setImgTransition(true)
          setTextVisible(true)
          setImgOffset(0)
          setTimeout(() => { animatingRef.current = false }, 460)
        })
      })
    }, 220)
  }

  /* ── Auto-play (4 s per slide, pauses on hover) ── */
  useEffect(() => {
    if (hovered) return
    const id = setTimeout(() => {
      if (!animatingRef.current) navigate(1)
    }, 4000)
    return () => clearTimeout(id)
  }, [current, hovered])   // eslint-disable-line react-hooks/exhaustive-deps

  const slide = SLIDES[current]

  return (
    <section className="py-16 px-4" style={{ background: '#FAF9F5' }}>
      <div style={{ maxWidth: '80%', margin: '0 auto' }}>

        {/* ── Section header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <p style={{
              color: '#E8572A', fontSize: '12px', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px',
            }}>
              Why Nova Tyres
            </p>
            <h2 style={{
              color: '#1A1A1A', fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '0.02em', lineHeight: 1.1,
            }}>
              The Smarter Way<br />to Buy Tyres
            </h2>
          </div>
          <p style={{
            color: '#999', fontSize: '13px', fontWeight: 400,
            maxWidth: '280px', lineHeight: 1.65, textAlign: 'right',
          }}>
            More than 10+ years of excellence —<br />
            Trusted by Australian drivers and trade resellers.
          </p>
        </div>

        {/* ── Carousel wrapper ── */}
        <div
          className="relative px-0 md:px-14"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >

          {/* Left nav — hidden on mobile */}
          <button
            onClick={() => navigate(-1)}
            aria-label="Previous slide"
            className="hidden md:flex absolute left-0 top-1/2 z-10 items-center justify-center"
            style={{
              transform:   'translateY(-50%)',
              width: '44px', height: '44px',
              borderRadius: '50%',
              background:  '#fff',
              border:      '1.5px solid #E5E5E5',
              boxShadow:   '0 2px 16px rgba(0,0,0,0.10)',
              cursor:      'pointer',
              transition:  'box-shadow 0.2s, border-color 0.2s',
            }}
          >
            <i className="ti ti-chevron-left" style={{ fontSize: '18px', color: '#1A1A1A' }} aria-hidden="true" />
          </button>

          {/* Right nav — hidden on mobile */}
          <button
            onClick={() => navigate(1)}
            aria-label="Next slide"
            className="hidden md:flex absolute right-0 top-1/2 z-10 items-center justify-center"
            style={{
              transform:   'translateY(-50%)',
              width: '44px', height: '44px',
              borderRadius: '50%',
              background:  '#fff',
              border:      '1.5px solid #E5E5E5',
              boxShadow:   '0 2px 16px rgba(0,0,0,0.10)',
              cursor:      'pointer',
              transition:  'box-shadow 0.2s, border-color 0.2s',
            }}
          >
            <i className="ti ti-chevron-right" style={{ fontSize: '18px', color: '#1A1A1A' }} aria-hidden="true" />
          </button>

          {/* ── White card ── */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background:  '#fff',
              boxShadow:   '0 8px 48px rgba(0,0,0,0.07)',
              border:      '1px solid #EFEFEF',
            }}
          >
            <div className="flex flex-col md:flex-row" style={{ minHeight: '400px' }}>

              {/* ── Left — text (55%) ── */}
              <div
                className="flex flex-col justify-between"
                style={{
                  flex:        '0 0 55%',
                  padding:     'clamp(28px, 4vw, 56px)',
                  borderRight: '1px solid #F2F2F2',
                }}
              >
                {/*
                  Text block — fades out upward (exit) and fades in from slightly below (enter).
                  The 60ms enter delay lets it start just after the image begins sliding in,
                  creating the intentional asynchronous premium feel.
                */}
                <div
                  style={{
                    opacity:    textVisible ? 1 : 0,
                    transform:  textVisible ? 'translateY(0)' : 'translateY(-10px)',
                    transition: textVisible
                      ? 'opacity 0.38s ease 0.06s, transform 0.38s ease 0.06s'
                      : 'opacity 0.18s ease,           transform 0.18s ease',
                  }}
                >
                  {/* Slide counter */}
                  <p style={{
                    color: '#C0C0C0', fontSize: '12px', fontWeight: 500,
                    letterSpacing: '0.08em', marginBottom: '22px',
                  }}>
                    {String(current + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(SLIDES.length).padStart(2, '0')}
                  </p>

                  {/* Kicker */}
                  <p style={{
                    color: '#E8572A', fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px',
                  }}>
                    {slide.kicker}
                  </p>

                  {/* Description with bold key phrases */}
                  <p style={{
                    color: '#555', fontSize: 'clamp(16px, 1.8vw, 22px)',
                    fontWeight: 400, lineHeight: 1.75,
                  }}>
                    {bold(slide.text)}
                  </p>
                </div>

                {/*
                  Pagination dots.
                  Active → orange elongated pill (width: 28px).
                  Inactive → small muted gray circle (width: 8px).
                  Width + background both animate via CSS transition.
                */}
                <div className="flex items-center gap-2 mt-10">
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (i === current || animatingRef.current) return
                        navigate(i > current ? 1 : -1, i)
                      }}
                      aria-label={`Go to slide ${i + 1}`}
                      style={{
                        height:       '8px',
                        width:        i === current ? '28px' : '8px',
                        borderRadius: '4px',
                        background:   i === current ? '#E8572A' : '#DEDEDE',
                        border:       'none',
                        padding:      0,
                        cursor:       i === current ? 'default' : 'pointer',
                        transition:   'width 0.38s cubic-bezier(0.25,0.46,0.45,0.94), background 0.3s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ── Right — image (45%) ── */}
              {/*
                overflow:hidden on this column clips the image as it slides past the boundary,
                creating a clean horizontal wipe — old image exits left, new enters from right.
              */}
              <div
                className="relative overflow-hidden"
                style={{ flex: '0 0 45%', minHeight: '260px' }}
              >
                <div
                  style={{
                    position:   'absolute',
                    inset:       0,
                    transform:  `translateX(${imgOffset}%)`,
                    transition:  imgTransition
                      ? 'transform 0.48s cubic-bezier(0.25,0.46,0.45,0.94)'
                      : 'none',
                  }}
                >
                  <Image
                    src={slide.image}
                    alt={slide.kicker}
                    fill
                    sizes="(max-width: 768px) 100vw, 45vw"
                    style={{ objectFit: 'cover' }}
                    priority={current === 0}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
