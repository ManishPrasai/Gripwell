'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ── Free services cards ──────────────────────────────────────────────────────
const FREE_SERVICES = [
  {
    image:    '/images/service/free-prerwc-check.jpg',
    alt:      'Mechanic performing pre-RWC fluid and engine bay inspection',
    title:    'Free Pre-RWC Check',
    body:     "Going for a Road Worthy Certificate? We inspect your vehicle and tell you exactly what it needs to pass — before you spend a cent on the official test.",
    cta:      'Book a free check',
    scrollId: 'book' as string | null,
    href:     '#book',
  },
  {
    image:    '/images/service/free-safety-inspection.jpg',
    alt:      'Technician performing tyre and wheel safety check with torque wrench',
    title:    'Free Safety Inspection',
    body:     "Get your tyres fitted with us and we'll run a complimentary safety inspection of your car — so you always leave knowing you're road-safe.",
    cta:      'Book an inspection',
    scrollId: 'book' as string | null,
    href:     '#book',
  },
]

// ── Service tier data ────────────────────────────────────────────────────────
const TIERS = [
  {
    name: 'Pre-RWC Check', tag: 'FREE', tagBg: '#076330', price: 'FREE', sub: 'No obligation',
    includes: [
      'Visual vehicle safety inspection',
      'Brake condition assessment',
      'Tyre tread depth check',
      'Lights & indicators check',
      'Steering & suspension visual',
      'Written report of findings',
    ],
  },
  {
    name: 'Log Book Service', tag: 'ESSENTIAL', tagBg: '#1A1A1A', price: 'From $149', sub: 'Keeps your warranty safe',
    includes: [
      'Engine oil & filter change',
      'Log book stamp',
      'Multi-point safety inspection',
      'Wiper blade check',
      'Fluid level top-up',
      'Tyre pressure check',
    ],
  },
  {
    name: 'Yearly Service', tag: 'POPULAR', tagBg: '#FF5A1F', price: 'From $199', sub: 'Great for everyday drivers',
    includes: [
      'Everything in Log Book Service',
      'Air filter inspection',
      'Battery load test',
      'Tyre rotation',
      'Brake fluid condition check',
      '45-point vehicle inspection',
    ],
  },
  {
    name: '3 Year Service', tag: 'VALUE', tagBg: '#2D6BFF', price: 'From $299', sub: 'Thorough maintenance package',
    includes: [
      'Everything in Yearly Service',
      'Cabin air filter inspection',
      'Spark plug inspection',
      'Brake pad depth measurement',
      'Coolant condition check',
      'Steering & suspension check',
    ],
  },
  {
    name: '6 Year Service', tag: 'PREMIUM', tagBg: '#6C47FF', price: 'From $399', sub: 'For high-mileage vehicles',
    includes: [
      'Everything in 3 Year Service',
      'Transmission fluid check',
      'Differential fluid inspection',
      'Fuel filter inspection',
      'Drive belt condition check',
      'Full road test report',
    ],
  },
  {
    name: 'Ultimate Service', tag: 'BEST', tagBg: '#FF5A1F', price: 'From $549', sub: 'The complete overhaul',
    includes: [
      'Everything in 6 Year Service',
      'Full fluid flush & replacement',
      'Premium synthetic oil & filter',
      'Brake pad replacement (if needed)',
      'Wheel alignment check',
      'Full safety certificate',
    ],
  },
]

// ── Brand logos ──────────────────────────────────────────────────────────────
const BRANDS = [
  { name: 'Continental',  src: '/images/brands/continental.svg',  h: 28 },
  { name: 'Pirelli',      src: '/images/brands/pirelli.svg',       h: 30 },
  { name: 'Bridgestone',  src: '/images/brands/bridgestone.svg',   h: 26 },
  { name: 'Michelin',     src: '/images/brands/michelin.svg',      h: 26 },
  { name: 'Yokohama',     src: '/images/brands/yokohama.svg',      h: 40 },
  { name: 'Maxxis',       src: '/images/brands/maxxis.svg',        h: 38 },
  { name: 'Nitto',        src: '/images/brands/nitto.svg',         h: 28 },
  { name: 'Hankook',      src: '/images/brands/hankook.svg',       h: 32 },
  { name: 'Atlander',     src: '/images/brands/atlander.svg',      h: 28 },
  { name: 'BFGoodrich',   src: '/images/brands/bfgoodrich.svg',    h: 30 },
]

// ── Store data ───────────────────────────────────────────────────────────────
const STORES = [
  { name: 'Springvale', state: 'VIC', address: '4/134 Springvale Rd, Springvale VIC 3171', phone: '03 9562 4269', wa: 'https://wa.me/61401531756', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Springvale', note: '4/134 Springvale Rd · Service & mechanical', coming: false },
  { name: 'Dandenong',  state: 'VIC', address: '308 S Gippsland Hwy, Dandenong South VIC 3175', phone: '03 8787 5846', wa: 'https://wa.me/61413792400', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Dandenong', note: '308 S Gippsland Hwy · Dandenong South', coming: false },
  { name: 'Bayswater',  state: 'VIC', address: '194 Canterbury Rd, Bayswater North VIC 3153', phone: '03 9720 9354', wa: 'https://wa.me/61411879425', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Bayswater', note: '194 Canterbury Rd · Bayswater North', coming: false },
  { name: 'Alphington', state: 'VIC', address: '200 Grange Rd, Alphington VIC 3078', phone: '03 7009 7700', wa: 'https://wa.me/61403884151', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Alphington', note: '200 Grange Rd · Melbourne', coming: false },
  { name: 'Sunshine',   state: 'VIC', address: '1B Berkshire Rd, Sunshine North VIC 3020', phone: null, wa: 'https://wa.me/61401199224', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Sunshine', note: '1B Berkshire Rd · Sunshine North', coming: false },
  { name: 'Sefton',     state: 'NSW · Sydney', address: '107 Carlingford St, Sefton NSW 2162', phone: null, wa: 'https://wa.me/61403388774', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Sefton', note: '107 Carlingford St · Sydney', coming: false },
  { name: 'Brisbane',   state: 'QLD', address: '', phone: null, wa: null, maps: null, note: 'Serviced now from our Melbourne workshops', coming: true },
  { name: 'Adelaide',   state: 'SA',  address: '', phone: null, wa: null, maps: null, note: 'Serviced now from our Melbourne workshops', coming: true },
]

// ── Review data ──────────────────────────────────────────────────────────────
const REVIEW_TABS = [
  { id: 'all', label: 'All locations' },
  { id: 'springvale', label: 'Springvale' },
  { id: 'dandenong', label: 'Dandenong' },
  { id: 'bayswater', label: 'Bayswater' },
  { id: 'alphington', label: 'Alphington' },
  { id: 'sunshine', label: 'Sunshine' },
  { id: 'sefton', label: 'Sefton' },
]

const REVIEW_CARDS = [
  { id: 'springvale', store: 'Nova Tyres Springvale', loc: 'Springvale, VIC', rating: 4.9, count: 842, avatarColor: '#FF5A1F', av: 'DM', reviewer: 'Daniel M.', when: '2 weeks ago', quote: 'Same-day log book service, warranty stamp and all — no upsell.' },
  { id: 'dandenong',  store: 'Nova Tyres Dandenong',  loc: 'Dandenong, VIC',  rating: 4.8, count: 511, avatarColor: '#2D6BFF', av: 'SK', reviewer: 'Sophie K.', when: '1 week ago',  quote: 'Free pre-RWC check saved me a fortune. Genuinely helpful crew.' },
  { id: 'bayswater',  store: 'Nova Tyres Bayswater',  loc: 'Bayswater, VIC',  rating: 4.9, count: 388, avatarColor: '#19D26A', av: 'RT', reviewer: 'Raj T.',    when: '3 days ago',  quote: 'Ultimate Service and it drives like new. Call-back within the hour.' },
  { id: 'alphington', store: 'Nova Tyres Melbourne',  loc: 'Alphington, VIC', rating: 4.7, count: 276, avatarColor: '#FFB300', av: 'LN', reviewer: 'Lauren N.', when: '5 days ago',  quote: 'Friendly, fast, fair priced. Dropped before work, ready by lunch.' },
  { id: 'sunshine',   store: 'Nova Tyres Sunshine',   loc: 'Sunshine, VIC',   rating: 4.8, count: 203, avatarColor: '#FF3B6B', av: 'MV', reviewer: 'Marco V.',  when: '1 week ago',  quote: 'Sorted my brakes same day and were clear about costs upfront.' },
  { id: 'sefton',     store: 'Nova Tyres Sefton',     loc: 'Sefton, NSW',     rating: 4.9, count: 164, avatarColor: '#8B5CF6', av: 'PS', reviewer: 'Priya S.',  when: '4 days ago',  quote: "So glad they're in Sydney now. Quick, honest and tidy work." },
]

const FEATURED = [
  { av: 'JM', name: 'Jessica M.', meta: '2 days ago · Springvale', quote: '"Top-notch service — honest, fast and the team genuinely cares. Couldn\'t be happier!"' },
  { av: 'TK', name: 'Tom K.',     meta: '1 week ago · Dandenong',  quote: '"Brought my car in for an Ultimate service. Drove away feeling brand new. Highly recommend!"' },
  { av: 'AN', name: 'Anika N.',   meta: '3 days ago · Bayswater',  quote: '"Super transparent about what was needed. No surprises on the bill. Will be back."' },
]

// ── Google G SVG ─────────────────────────────────────────────────────────────
function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.5 5.5 0 0 1-2.4 3.62v3h3.86c2.26-2.09 3.57-5.17 3.57-8.86z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.86-3c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/>
    </svg>
  )
}

// ── Star row ─────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '1px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#FBBC05' : '#D1D5DB'}>
          <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.7L12 17.8 6 20.6l1.4-6.7L2.3 9l6.9-.7z"/>
        </svg>
      ))}
    </span>
  )
}

// ── Counter hook ─────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1400, triggered: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!triggered) return
    const start = Date.now()
    const step = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      setValue(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [triggered, target, duration])
  return value
}

// ── Smooth-scroll a section to the vertical centre of the viewport ───────────
function scrollToCenter(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ServicePage() {
  const [activeTier,   setActiveTier]   = useState(2)           // default Yearly
  const [openShop,     setOpenShop]     = useState<number|null>(null)
  const [activeTab,    setActiveTab]    = useState('all')
  const [featIdx,      setFeatIdx]      = useState(0)
  const [submitted,    setSubmitted]    = useState(false)
  const [showModal,    setShowModal]    = useState(false)
  const [modalRating,  setModalRating]  = useState(0)
  const [statTriggered,setStatTriggered]= useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const locCount  = useCounter(10,  1400, statTriggered)
  const warCount  = useCounter(100, 1200, statTriggered)

  // Trigger counters when hero stats scroll into view
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatTriggered(true) }, { threshold: 0.6 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Auto-rotate featured review
  useEffect(() => {
    const id = setInterval(() => setFeatIdx(i => (i + 1) % FEATURED.length), 4500)
    return () => clearInterval(id)
  }, [])

  const visibleReviews = REVIEW_CARDS.filter(r => activeTab === 'all' || r.id === activeTab)
  const tier = TIERS[activeTier]
  const feat = FEATURED[featIdx]

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main style={{ background: '#FAF9F5' }}>
      {/* Global keyframes for this page */}
      <style>{`
        @keyframes svc-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes svc-fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* ── Free-service cards ── */
        .svc-free-card {
          transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .svc-free-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 32px 56px rgba(0,0,0,0.28);
        }
        .svc-free-card:hover .svc-free-img {
          transform: scale(1.05);
          filter: brightness(1.15);
        }
        .svc-free-img {
          transition: transform 0.55s cubic-bezier(0.22,1,0.36,1),
                      filter 0.4s ease;
        }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative flex items-center overflow-hidden bg-[#0C0D0F]"
        style={{ minHeight: '100vh' }}
      >
        {/* ── Background image ── */}
        <Image
          src="/images/service/workshop-hero.jpg"
          alt="Nova Tyres workshop — BMW on a four-post hoist"
          fill
          priority
          className="object-cover"
          style={{ objectPosition: '68% center' }}
        />

        {/* ── Scrim: dense black left → fully transparent at ~72% ──
             Extra stop at 40% keeps the headline zone pitch-dark even on
             wide monitors where the hoist post creeps left. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.91) 22%, rgba(0,0,0,0.78) 40%, rgba(0,0,0,0.42) 58%, rgba(0,0,0,0) 72%)',
          }}
        />

        {/* ── Content ── */}
        <div
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ paddingTop: '140px', paddingBottom: '88px' }}
        >
          {/* Text column — hard cap at 460 px so it always clears the hoist beam */}
          <div style={{ maxWidth: '460px' }}>

            {/* Eyebrow */}
            <p
              style={{
                color: 'rgba(255,255,255,0.50)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: '20px',
                animation: 'svc-fadeUp 0.55s ease both',
              }}
            >
              Auto service &amp; mechanical · Melbourne-wide
            </p>

            {/* H1 */}
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(58px, 6.5vw, 86px)',
                lineHeight: 0.95,
                letterSpacing: '0.025em',
                color: '#ffffff',
                marginBottom: '26px',
                animation: 'svc-fadeUp 0.55s 0.12s ease both',
              }}
            >
              Servicing<br />
              <span style={{ WebkitTextStroke: '2px rgba(255,255,255,0.85)', color: 'transparent' }}>
                done
              </span><br />
              <em style={{ color: 'rgb(7,99,48)', fontStyle: 'normal' }}>right.</em>
            </h1>

            {/* Body */}
            <p
              style={{
                color: 'rgba(255,255,255,0.60)',
                fontSize: '15px',
                lineHeight: 1.8,
                fontFamily: "'DM Sans', sans-serif",
                marginBottom: '36px',
                animation: 'svc-fadeUp 0.55s 0.22s ease both',
              }}
            >
              From a free Pre-RWC check to the Ultimate overhaul — fully qualified
              mechanics, quality parts, and a log-book stamp that keeps your warranty intact.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                animation: 'svc-fadeUp 0.55s 0.32s ease both',
              }}
            >
              <a
                href="#tiers"
                onClick={(e) => { e.preventDefault(); scrollToCenter('tiers') }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: '#FF5A1F', color: '#fff',
                  fontSize: '13px', fontWeight: 700,
                  padding: '13px 26px', borderRadius: '999px',
                  textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Explore services
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
              <a
                href="#book"
                onClick={(e) => { e.preventDefault(); scrollToCenter('book') }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontSize: '13px', fontWeight: 600,
                  padding: '13px 26px', borderRadius: '999px',
                  border: '1.5px solid rgba(255,255,255,0.22)',
                  textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Get a call-back
              </a>
            </div>
          </div>

          {/* Stats row — constrained to same column width, left-bordered dividers */}
          <div
            ref={statsRef}
            style={{
              display: 'flex',
              gap: '0',
              marginTop: '60px',
              flexWrap: 'wrap',
              maxWidth: '460px',
              animation: 'svc-fadeUp 0.55s 0.44s ease both',
            }}
          >
            {[
              { n: `${locCount}+`, label: 'Locations AUS-wide' },
              { n: `${warCount}%`, label: 'Warranty-safe' },
              { n: '<1HR',         label: 'Call-back time' },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  paddingLeft: i === 0 ? '0' : '28px',
                  marginLeft: i === 0 ? '0' : '28px',
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', color: '#ffffff', lineHeight: 1, letterSpacing: '0.02em' }}>{s.n}</div>
                <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", marginTop: '4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════════ */}
      <div style={{ background: '#FF5A1F', overflow: 'hidden', padding: '13px 0', borderTop: '1px solid rgba(0,0,0,0.1)' }} aria-hidden="true">
        <div style={{ display: 'flex', animation: 'svc-marquee 28s linear infinite', width: 'max-content' }}>
          {Array(2).fill(['Fully Qualified Mechanics', 'Warranty-Safe Log Books', 'Quality Parts & Oils', 'Free Safety Inspection', 'Pre-RWC Checks', 'Same-Day Service']).flat().map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '28px', whiteSpace: 'nowrap', paddingRight: '28px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: '#ffffff', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {item}
              <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
            </span>
          ))}
        </div>
      </div>

      {/* ══ FREE SERVICES ══════════════════════════════════════════════════════ */}
      <section id="free" style={{ background: '#0C0D0F', padding: '96px 0' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div style={{ marginBottom: '52px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(7,99,48,0.15)', border: '1px solid rgba(7,99,48,0.35)',
              color: '#19D26A', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              padding: '5px 12px', borderRadius: '999px',
              fontFamily: "'DM Sans', sans-serif", marginBottom: '18px',
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5"/></svg>
              On the house
            </span>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(38px, 5vw, 58px)',
              color: '#ffffff', letterSpacing: '0.03em',
              lineHeight: 0.95, margin: 0,
            }}>
              Two things we<br />
              <span style={{ color: 'rgb(7,99,48)' }}>do for free.</span>
            </h2>
          </div>

          {/* Cards grid — 1 col mobile → 2 col desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))', gap: '20px' }}>
            {FREE_SERVICES.map((card) => (
              <div
                key={card.title}
                className="svc-free-card"
                style={{
                  position: 'relative',
                  background: '#111214',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.11)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* ── Image panel ── */}
                <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', flexShrink: 0 }}>
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="svc-free-img"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                  {/* Bottom gradient so card body text floats cleanly above the image edge */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(17,18,20,0.9) 100%)',
                  }} />
                  {/* FREE badge — top-left overlay */}
                  <span style={{
                    position: 'absolute', top: '16px', left: '18px',
                    background: 'rgba(7,99,48,0.82)', backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(25,210,106,0.35)',
                    color: '#19D26A', fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    padding: '5px 12px', borderRadius: '999px',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    FREE
                  </span>
                </div>

                {/* ── Content panel ── */}
                <div style={{ padding: '28px 32px 32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{
                    color: '#ffffff', fontSize: '22px', fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.2, marginBottom: '12px',
                  }}>
                    {card.title}
                  </h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.52)', fontSize: '14px',
                    lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif",
                    marginBottom: '24px', flex: 1,
                  }}>
                    {card.body}
                  </p>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '22px' }} />

                  {/* CTA */}
                  {card.scrollId ? (
                    <a
                      href={card.href}
                      onClick={(e) => { e.preventDefault(); scrollToCenter(card.scrollId!) }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        color: '#19D26A', fontSize: '13px', fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
                        letterSpacing: '0.04em', cursor: 'pointer',
                      }}
                    >
                      {card.cta}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </a>
                  ) : (
                    <Link
                      href={card.href}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        color: '#19D26A', fontSize: '13px', fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif", textDecoration: 'none',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {card.cta}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ══ SERVICE TIERS ══════════════════════════════════════════════════════ */}
      <section id="tiers" style={{ background: '#0C0D0F', padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Background image container — add <Image fill> here when ready */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(255,90,31,0.05) 0%, transparent 60%)' }} />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#FF5A1F', fontSize: '11px', fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }}>Service menu</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 52px)', color: '#ffffff', letterSpacing: '0.03em', lineHeight: 1, marginBottom: '12px' }}>
            Pick your level of service.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", marginBottom: '52px', maxWidth: '480px' }}>
            Each service builds on the last — select one to see exactly what's included.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="lg:grid-cols-2 grid-cols-1">
            {/* Tier list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {TIERS.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setActiveTier(i)}
                  style={{
                    background:   i === activeTier ? 'rgba(255,90,31,0.12)' : 'rgba(255,255,255,0.04)',
                    border:       `1.5px solid ${i === activeTier ? '#FF5A1F' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px',
                    padding:      '16px 22px',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'space-between',
                    cursor:       'pointer',
                    textAlign:    'left',
                    transition:   'background 0.25s, border-color 0.25s',
                  }}
                >
                  <div>
                    <span style={{ background: t.tagBg, color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', padding: '2px 8px', borderRadius: '999px', marginRight: '10px', fontFamily: "'DM Sans', sans-serif" }}>{t.tag}</span>
                    <span style={{ color: i === activeTier ? '#ffffff' : 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '15px', fontFamily: "'DM Sans', sans-serif" }}>{t.name}</span>
                  </div>
                  <span style={{ color: i === activeTier ? '#FF5A1F' : 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '14px', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', marginLeft: '12px' }}>{t.price}</span>
                </button>
              ))}
            </div>

            {/* Tier detail */}
            <div
              key={activeTier}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '36px 32px',
                animation: 'svc-fadeUp 0.4s ease both',
              }}
            >
              <span style={{ background: tier.tagBg, color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: '999px', fontFamily: "'DM Sans', sans-serif" }}>{tier.tag}</span>
              <h3 style={{ color: '#ffffff', fontSize: '26px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginTop: '14px', marginBottom: '4px' }}>{tier.name}</h3>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", marginBottom: '20px' }}>{tier.sub}</p>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#FF5A1F', fontFamily: "'DM Sans', sans-serif", marginBottom: '28px' }}>{tier.price}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tier.includes.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                    <svg style={{ flexShrink: 0, marginTop: '2px' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#19D26A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="#book" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FF5A1F', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '13px 28px', borderRadius: '999px', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif" }}>
                Book this service
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY NOVA ═══════════════════════════════════════════════════════════ */}
      <section id="why" style={{ background: '#1C3A2B', padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Background image container — add <Image fill> here when ready */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1C3A2B 0%, #0f2218 100%)' }} />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }}>Why Nova</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 52px)', color: '#ffffff', letterSpacing: '0.03em', lineHeight: 1, marginBottom: '52px' }}>
            Servicing you can trust.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2px' }}>
            {[
              { icon: 'ti-tool',        num: '01', title: 'Quality Parts & Oils',  body: 'Only genuine-grade parts and quality oils go into your vehicle — never cut corners, never compromise.' },
              { icon: 'ti-shield',      num: '02', title: 'Warranty-Safe',          body: 'We stamp your log book as an official record — keeping your new-car warranty fully intact.' },
              { icon: 'ti-certificate', num: '03', title: 'Fully Qualified',        body: 'Every service is carried out by fully qualified mechanics with the right tools and the right training.' },
              { icon: 'ti-heart-check', num: '04', title: 'Safety First',           body: 'A comprehensive safety inspection comes standard with every service, so you always leave road-ready.' },
            ].map(cell => (
              <div
                key={cell.num}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '40px 32px',
                  position: 'relative',
                }}
              >
                <i className={`ti ${cell.icon}`} style={{ fontSize: '30px', color: '#19D26A', display: 'block', marginBottom: '20px' }} aria-hidden="true" />
                <h3 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }}>{cell.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>{cell.body}</p>
                <span style={{ position: 'absolute', bottom: '20px', right: '24px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', color: 'rgba(255,255,255,0.06)', letterSpacing: '0.05em' }}>{cell.num}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BRANDS ════════════════════════════════════════════════════════════ */}
      <section id="brands" style={{ background: '#ffffff', padding: '80px 0' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,90,31,0.08)', border: '1px solid rgba(255,90,31,0.2)', color: '#FF5A1F', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', padding: '4px 14px', borderRadius: '999px', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif" }}>Our partners</span>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 4vw, 46px)', color: '#111', letterSpacing: '0.03em', lineHeight: 1.05, marginBottom: '12px' }}>
              Brands we <span style={{ color: '#FF5A1F' }}>service &amp; sell</span>
            </h2>
            <p style={{ color: '#555', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", maxWidth: '420px', margin: '0 auto' }}>From budget to premium, we stock and fit every major tyre, wheel &amp; lubricant brand.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '40px 48px' }}>
            {BRANDS.map(b => (
              <div key={b.name} style={{ height: `${b.h}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '60px', transition: 'opacity 0.2s', opacity: 1 }} className="hover:opacity-60">
                <img src={b.src} alt={b.name} style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
              </div>
            ))}
          </div>

          {/* Trust stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', marginTop: '56px', paddingTop: '40px', borderTop: '1px solid #EBEBEB' }}>
            {[
              { icon: 'ti-building-store', stat: '40+',  label: 'Brands stocked' },
              { icon: 'ti-map-pin',        stat: '6',    label: 'Workshops' },
              { icon: 'ti-shield-check',   stat: '98%',  label: 'Would recommend' },
              { icon: 'ti-award',          stat: '15+',  label: 'Years of trust' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '40px', height: '40px', background: 'rgba(255,90,31,0.08)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: '18px', color: '#FF5A1F' }} aria-hidden="true" />
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '20px', color: '#111', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{s.stat}</div>
                  <div style={{ color: '#888', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ═══════════════════════════════════════════════════════════ */}
      <section id="reviews" style={{ background: '#FAF9F5', padding: '96px 0' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top row: intro + featured */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '56px', alignItems: 'start' }} className="lg:grid-cols-2 grid-cols-1">
            {/* Intro */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <GoogleG size={22} />
                <Stars rating={4.8} size={16} />
                <span style={{ color: '#555', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}><strong>4.8</strong> average rating</span>
              </div>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 4vw, 46px)', color: '#111', letterSpacing: '0.03em', lineHeight: 1.05, marginBottom: '14px' }}>
                Google reviews<br />across our stores.
              </h2>
              <p style={{ color: '#555', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, maxWidth: '380px' }}>
                Real feedback from real customers — see why drivers across Melbourne &amp; Sydney trust Nova Tyres.
              </p>
            </div>

            {/* Featured review */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', border: '1px solid #EBEBEB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <GoogleG size={18} />
                <span style={{ background: '#FF5A1F', color: '#fff', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', padding: '3px 8px', borderRadius: '999px', fontFamily: "'DM Sans', sans-serif" }}>Featured review</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{feat.av}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#111', fontFamily: "'DM Sans', sans-serif" }}>{feat.name}</div>
                  <div style={{ color: '#888', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>{feat.meta}</div>
                </div>
              </div>
              <Stars rating={5} size={14} />
              <p style={{ color: '#333', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, marginTop: '10px', fontStyle: 'italic' }}>{feat.quote}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                <button onClick={() => setFeatIdx(i => (i - 1 + FEATURED.length) % FEATURED.length)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #E5E5E5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {FEATURED.map((_, i) => <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === featIdx ? '#FF5A1F' : '#D1D5DB', transition: 'background 0.3s' }} />)}
                </div>
                <button onClick={() => setFeatIdx(i => (i + 1) % FEATURED.length)} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #E5E5E5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Stat row */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '40px' }}>
            {[
              { icon: 'ti-star-filled', val: '4.8',   label: 'Average rating',   color: '#FBBC05' },
              { icon: 'ti-message',     val: '2,384',  label: 'Total reviews',    color: '#4285F4' },
              { icon: 'ti-map-pin',     val: '6',      label: 'Locations',        color: '#34A853' },
              { icon: 'ti-heart',       val: '98%',    label: 'Recommend us',     color: '#EA4335' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, minWidth: '140px', background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #EBEBEB', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '38px', height: '38px', background: `${s.color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: '18px', color: s.color }} aria-hidden="true" />
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '20px', color: '#111', fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{s.val}</div>
                  <div style={{ color: '#888', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", marginTop: '2px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Location tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {REVIEW_TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    background: activeTab === t.id ? '#111' : '#ffffff',
                    color: activeTab === t.id ? '#fff' : '#555',
                    border: `1px solid ${activeTab === t.id ? '#111' : '#E5E5E5'}`,
                    borderRadius: '999px',
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: '999px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
            >
              <i className="ti ti-pencil" style={{ fontSize: '14px' }} />
              Write a review
            </button>
          </div>

          {/* Review cards + sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }} className="lg:grid-cols-2-sidebar grid-cols-1">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {visibleReviews.map(r => (
                <div key={r.id} style={{ background: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #EBEBEB', display: 'flex', flexDirection: 'column' }}>
                  {/* Store photo container — add <Image> here when ready */}
                  <div style={{ height: '160px', background: 'linear-gradient(135deg, #1C3A2B 0%, #0C0D0F 100%)', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '12px' }}>
                    <span style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '999px', backdropFilter: 'blur(8px)', fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <i className="ti ti-map-pin" style={{ fontSize: '12px' }} />
                      {r.loc}
                    </span>
                  </div>
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#111', fontSize: '16px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>{r.store}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                      <strong style={{ fontSize: '15px', color: '#111', fontFamily: "'DM Sans', sans-serif" }}>{r.rating}</strong>
                      <Stars rating={r.rating} size={13} />
                      <span style={{ color: '#888', fontSize: '12px', fontFamily: "'DM Sans', sans-serif" }}>({r.count})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: r.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '11px', fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>{r.av}</div>
                      <p style={{ color: '#444', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                        <strong>{r.reviewer}</strong> · {r.when}<br />
                        {r.quote}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <button onClick={() => setActiveTab(r.id)} style={{ flex: 1, background: 'transparent', border: '1px solid #E5E5E5', color: '#555', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>View reviews</button>
                      <a href={`https://www.google.com/search?q=Nova+Tyres+${r.store.split(' ').pop()}+reviews`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, background: '#4285F4', color: '#fff', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <GoogleG size={12} /> Google
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rating bars sidebar */}
            <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #EBEBEB', position: 'sticky', top: '80px' }}>
              <h3 style={{ color: '#111', fontSize: '16px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: '20px' }}>What customers say</h3>
              {[{ stars: 5, count: 2041, pct: 86 }, { stars: 4, count: 243, pct: 10 }, { stars: 3, count: 61, pct: 4 }, { stars: 2, count: 24, pct: 2 }, { stars: 1, count: 15, pct: 1 }].map(r => (
                <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#888', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", minWidth: '24px' }}>
                    {r.stars}<svg width="11" height="11" viewBox="0 0 24 24" fill="#FBBC05"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.7L12 17.8 6 20.6l1.4-6.7L2.3 9l6.9-.7z"/></svg>
                  </span>
                  <div style={{ flex: 1, height: '7px', background: '#F0F0F0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${r.pct}%`, height: '100%', background: '#FBBC05', borderRadius: '999px', transition: 'width 0.8s ease' }} />
                  </div>
                  <span style={{ color: '#888', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", minWidth: '36px', textAlign: 'right' }}>{r.count.toLocaleString()}</span>
                </div>
              ))}
              <a href="https://www.google.com/search?q=Nova+Tyres+reviews" target="_blank" rel="noopener noreferrer" style={{ display: 'block', color: '#4285F4', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', marginTop: '16px', marginBottom: '12px' }}>
                View all reviews on Google →
              </a>
              <button onClick={() => setShowModal(true)} style={{ width: '100%', background: '#1A1A1A', color: '#fff', border: 'none', borderRadius: '999px', padding: '11px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <i className="ti ti-pencil" style={{ fontSize: '14px' }} />
                Leave us a review
              </button>
            </div>
          </div>

          <p style={{ color: '#888', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="ti ti-shield-check" style={{ fontSize: '15px', color: '#19D26A' }} />
            Reviews are verified and collected from Google.
          </p>
        </div>
      </section>

      {/* ══ BOOKING ════════════════════════════════════════════════════════════ */}
      <section id="book" style={{ background: '#ffffff', padding: '96px 0' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }} className="lg:grid-cols-2 grid-cols-1">
            <div>
              <p style={{ color: '#FF5A1F', fontSize: '11px', fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }}>Book a service</p>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 52px)', color: '#111', letterSpacing: '0.03em', lineHeight: 1, marginBottom: '18px' }}>
                Tell us about<br />your car.
              </h2>
              <p style={{ color: '#555', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, maxWidth: '380px' }}>
                Enter your details and we'll call you back — usually within the hour during opening times.
              </p>
            </div>

            <div style={{ background: '#FAF9F5', borderRadius: '20px', padding: '36px', border: '1px solid #EBEBEB' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(25,210,106,0.12)', border: '2px solid #19D26A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <i className="ti ti-check" style={{ fontSize: '24px', color: '#19D26A' }} />
                  </div>
                  <h3 style={{ color: '#111', fontSize: '20px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", marginBottom: '8px' }}>Request sent!</h3>
                  <p style={{ color: '#555', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>One of our team will call you back shortly to lock in your service.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[{ id: 'f-name', label: 'Your name', type: 'text', placeholder: 'Jane Smith' }, { id: 'f-phone', label: 'Phone', type: 'tel', placeholder: '0400 000 000' }].map(f => (
                      <div key={f.id}>
                        <label htmlFor={f.id} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>{f.label}</label>
                        <input id={f.id} type={f.type} placeholder={f.placeholder} required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label htmlFor="f-vehicle" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>Vehicle</label>
                      <input id="f-vehicle" type="text" placeholder="Make & model" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label htmlFor="f-service" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>Service</label>
                      <select id="f-service" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                        {TIERS.map(t => <option key={t.name}>{t.name}</option>)}
                        <option>Not sure — please advise</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="f-loc" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>Preferred location</label>
                    <select id="f-loc" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#fff', outline: 'none', boxSizing: 'border-box' }}>
                      {STORES.filter(s => !s.coming).map(s => <option key={s.name}>Nova Tyres {s.name}</option>)}
                      <option>Not sure — please advise</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="f-msg" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>Anything else?</label>
                    <textarea id="f-msg" placeholder="Preferred day/time, warning lights, noises…" rows={3} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#fff', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: '999px', padding: '14px', fontSize: '14px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                    Request my call-back
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", justifyContent: 'center' }}>
                    <i className="ti ti-lock" style={{ fontSize: '14px' }} />
                    No obligation — we'll never share your details.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SHOPS ══════════════════════════════════════════════════════════════ */}
      <section id="shops" style={{ background: '#FAF9F5', padding: '96px 0 80px' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ color: '#FF5A1F', fontSize: '11px', fontWeight: 700, letterSpacing: '0.20em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", marginBottom: '12px' }}>Find your nearest shop</p>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(36px, 5vw, 52px)', color: '#111', letterSpacing: '0.03em', lineHeight: 1, marginBottom: '48px' }}>
            Where to find us.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {STORES.map((store, i) => (
              <div key={store.name} style={{ background: '#ffffff', border: '1px solid #EBEBEB', borderRadius: i === 0 ? '16px 16px 4px 4px' : i === STORES.length - 1 ? '4px 4px 16px 16px' : '4px', overflow: 'hidden' }}>
                {/* Shop header */}
                <button
                  onClick={() => !store.coming && setOpenShop(openShop === i ? null : i)}
                  disabled={store.coming}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: 'none', border: 'none', cursor: store.coming ? 'default' : 'pointer', gap: '16px', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#111', fontFamily: "'DM Sans', sans-serif" }}>{store.name}</span>
                        <span style={{ color: '#888', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>{store.state}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                      <span style={{ background: store.coming ? '#F0F0F0' : 'rgba(25,210,106,0.1)', color: store.coming ? '#888' : '#076330', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', fontFamily: "'DM Sans', sans-serif", border: `1px solid ${store.coming ? '#E5E5E5' : 'rgba(7,99,48,0.2)'}` }}>
                        {store.coming ? 'Coming soon' : 'Open'}
                      </span>
                      <span style={{ color: '#888', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>{store.note}</span>
                    </div>
                  </div>
                  {!store.coming && (
                    <svg style={{ flexShrink: 0, transform: openShop === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  )}
                </button>

                {/* Shop panel */}
                {openShop === i && !store.coming && (
                  <div style={{ borderTop: '1px solid #F0F0F0', padding: '24px', background: '#FAFAFA', animation: 'svc-fadeUp 0.3s ease both' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', alignItems: 'start' }}>
                      {/* Store photo container — add <Image> here when ready */}
                      <div style={{ height: '160px', background: 'linear-gradient(135deg, #1C3A2B 0%, #0C0D0F 100%)', borderRadius: '12px' }} />
                      <div>
                        <a href={store.maps!} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#333', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", textDecoration: 'none', marginBottom: '16px' }}>
                          <i className="ti ti-map-pin" style={{ fontSize: '16px', color: '#FF5A1F', marginTop: '1px', flexShrink: 0 }} />
                          {store.address}
                        </a>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <a href={store.wa!} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#25D366', color: '#fff', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
                            <i className="ti ti-brand-whatsapp" style={{ fontSize: '15px' }} />
                            WhatsApp
                          </a>
                          {store.phone && (
                            <a href={`tel:${store.phone.replace(/\s/g, '')}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1A1A1A', color: '#fff', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
                              <i className="ti ti-phone" style={{ fontSize: '15px' }} />
                              {store.phone}
                            </a>
                          )}
                          <a href={store.maps!} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#555', border: '1px solid #E5E5E5', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
                            <i className="ti ti-map" style={{ fontSize: '15px' }} />
                            Get directions
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <p style={{ color: '#888', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', marginTop: '32px' }}>
            Six workshops open across Melbourne &amp; Sydney — more locations opening soon right across Australia.
          </p>
        </div>
      </section>

      {/* ══ REVIEW MODAL ══════════════════════════════════════════════════════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#ffffff', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', animation: 'svc-fadeUp 0.3s ease both' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #E5E5E5', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}><GoogleG size={22} /><h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111', fontFamily: "'DM Sans', sans-serif" }}>Leave a review</h3></div>
            <p style={{ color: '#888', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", marginBottom: '24px' }}>Tell us how we did — pick your store and rate your visit.</p>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>Which store?</label>
                <select required style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#fff', boxSizing: 'border-box' }}>
                  <option value="" disabled>Select a location…</option>
                  {STORES.filter(s => !s.coming).map(s => <option key={s.name}>Nova Tyres {s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '8px' }}>Your rating</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setModalRating(v)} style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill={v <= modalRating ? '#FBBC05' : '#E5E5E5'}>
                        <path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.7L12 17.8 6 20.6l1.4-6.7L2.3 9l6.9-.7z"/>
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[{ id: 'rv-name', label: 'Your name', type: 'text', placeholder: 'Jane S.' }, { id: 'rv-email', label: 'Email (optional)', type: 'email', placeholder: 'jane@email.com' }].map(f => (
                  <div key={f.id}>
                    <label htmlFor={f.id} style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>{f.label}</label>
                    <input id={f.id} type={f.type} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#fff', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div>
                <label htmlFor="rv-text" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#333', fontFamily: "'DM Sans', sans-serif", marginBottom: '6px' }}>Your review</label>
                <textarea id="rv-text" placeholder="What stood out about your visit?" rows={4} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", background: '#fff', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FF5A1F', color: '#fff', border: 'none', borderRadius: '999px', padding: '14px', fontSize: '14px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
                Submit review
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
