'use client'

/*
  Servicing page — 1:1 port of the reference design
  (Desktop reference: "Nova Tyres Servicing.html" + styles.css + app.js)

  - Design tokens, grids, spacing and animation curves are lifted verbatim
    from styles.css (light theme), scoped under .svcp so they can't leak
    into the global navbar/footer.
  - Behaviors are ported from app.js into React: tier selector engine,
    eased count-ups, featured-review rotator (6s, manual nav resets timer),
    tab + search filtering with empty state, rating-bar fill on view,
    write-a-review modal (star input with hover labels, validation,
    dynamic success message, Escape/backdrop close, body scroll lock),
    booking form success state, single-open shops accordion.
  - The reference's <image-slot> drag-drop placeholders are authoring
    scaffolding; their "filled" visual state is reproduced with real
    next/image photos + the same scrim layers.
*/

import { useState, useEffect, useRef, ReactNode } from 'react'
import Image from 'next/image'
import { smoothScrollToSection } from '../../../lib/scrollToSection'
import MobileServicePage from '../../components/service/mobile/MobileServicePage'

/* ════════════════════════════════════════════════════════════════════
   ICONS — exact SVG paths from the reference
═══════════════════════════════════════════════════════════════════ */
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
)
const IconArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
)
const IconChevR = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
)
const IconChevL = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
)
const IconChevD = () => (
  <svg className="shop-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
)
const IconPhone = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
)
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.7-.83-1.96-.92-.26-.1-.45-.14-.64.14-.19.28-.73.92-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.46-.48-.64-.48l-.54-.01c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.33 0 1.38 1 2.71 1.14 2.9.14.19 1.97 3.01 4.78 4.22.67.29 1.19.46 1.59.59.67.21 1.28.18 1.76.11.54-.08 1.66-.68 1.89-1.33.23-.65.23-1.21.16-1.33-.07-.12-.25-.19-.53-.33zM12 2a10 10 0 0 0-8.55 15.13L2 22l4.97-1.3A10 10 0 1 0 12 2z" /></svg>
)
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
)
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
)
const IconPencil = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
)
const IconExternal = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
)
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
)
const IconShieldCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
)
const IconZap = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5l-7 9h3v4l7-9h-3z" /></svg>
)
const IconX = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
)
const IconStar = () => (
  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.7L12 17.8 6 20.6l1.4-6.7L2.3 9l6.9-.7z" /></svg>
)
const GoogleG = () => (
  <svg viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.5 5.5 0 0 1-2.4 3.62v3h3.86c2.26-2.09 3.57-5.17 3.57-8.86z" /><path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.86-3c-1.08.72-2.45 1.16-4.08 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24z" /><path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z" /><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" /></svg>
)
const VerifiedMini = () => (
  <svg className="verified-mini" viewBox="0 0 24 24" fill="#4285F4"><path d="M12 1l2.6 1.9 3.2-.2 1 3 2.6 1.8-1 3 1 3-2.6 1.8-1 3-3.2-.2L12 23l-2.6-1.9-3.2.2-1-3L2.6 16.5l1-3-1-3 2.6-1.8 1-3 3.2.2z" /><path d="M9.5 12.5l1.8 1.8 3.7-3.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/* ════════════════════════════════════════════════════════════════════
   DATA — verbatim from the reference app.js / HTML
═══════════════════════════════════════════════════════════════════ */
interface TierInc { h: string; p: string; n?: boolean }
interface Tier {
  id: string; num: string; name: string; km: string
  eyebrow: string; big: string; lab: string
  desc: ReactNode; inc: TierInc[]
}

const TIERS: Tier[] = [
  {
    id: 'logbook', num: '01', name: 'Log Book Service', km: 'Manufacturer schedule',
    eyebrow: 'Warranty-safe servicing', big: 'LOG', lab: 'Per maker schedule',
    desc: <>For newer vehicles still following their manufacturer log book schedule. Carried out by fully qualified mechanics — <b>without affecting your new-car warranty.</b></>,
    inc: [
      { h: 'Quality Parts & Oils', p: 'Only genuine-grade parts and oils are used.' },
      { h: 'Log Book Stamp', p: 'We stamp your log book as an official service record.' },
      { h: 'Safety Inspection', p: 'Comprehensive check so you’re safe on the road.' },
      { h: 'Fully Qualified', p: 'Performed without affecting your warranty.' },
    ],
  },
  {
    id: 'yearly', num: '02', name: 'Yearly Service', km: 'Every 15,000 km',
    eyebrow: 'Essential maintenance', big: '15K', lab: 'km · every 1 year',
    desc: <>Usually done every 15,000 km. Prevents unnecessary wear and tear and keeps your car running in optimal condition.</>,
    inc: [
      { h: 'Engine Oil Change', p: 'Fresh engine oil for smooth running.' },
      { h: 'Oil Filter', p: 'New oil filter fitted.' },
      { h: 'Safety Inspection', p: 'Comprehensive safety inspection.' },
      { h: 'Under-Bonnet Check', p: 'Fluid levels checked, engine bay inspected.' },
    ],
  },
  {
    id: '3year', num: '03', name: '3 Year Service', km: 'Every 45,000 km',
    eyebrow: 'Yearly + filters & fluids', big: '45K', lab: 'km · every 3 years',
    desc: <>Usually done every 45,000 km. <b>Includes everything in a Yearly Service, plus</b> air filter and brake fluid change.</>,
    inc: [
      { h: 'Engine Oil Change', p: 'Fresh engine oil for smooth running.' },
      { h: 'Oil Filter', p: 'New oil filter fitted.' },
      { h: 'Safety Inspection', p: 'Comprehensive safety inspection.' },
      { h: 'Under-Bonnet Check', p: 'Cooling & charging systems checked.' },
      { h: 'Air Filter Replacement', p: 'Replacement of your vehicle’s air filter.', n: true },
      { h: 'Brake Fluid Change', p: 'Brake fluid change + pad & rotor wear analysis.', n: true },
    ],
  },
  {
    id: '6year', num: '04', name: '6 Year Service', km: 'Every 100,000 km',
    eyebrow: '3 Year + ignition & cooling', big: '100K', lab: 'km · every 6 years',
    desc: <>Usually done every 100,000 km. <b>Includes everything in a 3 Year Service, plus</b> coolant, spark plugs and fuel filter change.</>,
    inc: [
      { h: 'Engine Oil Change', p: 'Fresh engine oil for smooth running.' },
      { h: 'Oil Filter', p: 'New oil filter fitted.' },
      { h: 'Safety Inspection', p: 'Comprehensive safety inspection.' },
      { h: 'Under-Bonnet Check', p: 'Cooling & charging systems checked.' },
      { h: 'Air Filter Replacement', p: 'Replacement of your vehicle’s air filter.' },
      { h: 'Brake Fluid Change', p: 'Brake fluid change + pad & rotor wear analysis.' },
      { h: 'Engine Coolant', p: 'Coolant replaced for optimum performance.', n: true },
      { h: 'Spark Plugs', p: 'Replaced to cut fuel use and clear carbon.', n: true },
      { h: 'Fuel Filter', p: 'New fuel filter for even, clean operation.', n: true },
    ],
  },
  {
    id: 'ultimate', num: '05', name: 'Ultimate Service', km: 'Most comprehensive',
    eyebrow: 'The complete overhaul', big: 'MAX', lab: 'every fluid & filter',
    desc: <>The most comprehensive service. <b>Includes everything in a 6 Year Service, plus</b> fuel injection cleaning and fuel tank treatment.</>,
    inc: [
      { h: 'Engine Oil Change', p: 'Fresh engine oil for smooth running.' },
      { h: 'Oil Filter', p: 'New oil filter fitted.' },
      { h: 'Safety Inspection', p: 'Comprehensive safety inspection.' },
      { h: 'Under-Bonnet Check', p: 'Cooling & charging systems checked.' },
      { h: 'Air Filter Replacement', p: 'Replacement of your vehicle’s air filter.' },
      { h: 'Brake Fluid Change', p: 'Brake fluid change + pad & rotor wear analysis.' },
      { h: 'Engine Coolant', p: 'Coolant replaced for optimum performance.' },
      { h: 'Spark Plugs', p: 'Replaced to cut fuel use and clear carbon.' },
      { h: 'Fuel Filter', p: 'New fuel filter for even, clean operation.' },
      { h: 'Fuel Injection Clean', p: 'Removes built-up carbon from the intake system.', n: true },
      { h: 'Fuel Tank Treatment', p: 'Cleans & treats the tank for moisture and grime.', n: true },
    ],
  },
]

const SERVICE_OPTIONS = ['Free Pre-RWC Check', 'Log Book Service', 'Yearly Service', '3 Year Service', '6 Year Service', 'Ultimate Service', 'Not sure — please advise']

const STORE_OPTIONS = ['Nova Tyres Springvale', 'Nova Tyres Dandenong', 'Nova Tyres Bayswater', 'Nova Tyres Melbourne (Alphington)', 'Nova Tyres Sunshine', 'Nova Tyres Sefton (Sydney)']

const FEATURED = [
  { av: 'JM', c: '#FF5A1F', name: 'Jessica M.', meta: '2 days ago · Springvale', q: '“Top-notch service — honest, fast and the team genuinely cares. Couldn’t be happier!”' },
  { av: 'AP', c: '#2D6BFF', name: 'Andrew P.', meta: '5 days ago · Bayswater', q: '“Best workshop I’ve used. Clear quotes, quality parts, and they stand by their work.”' },
  { av: 'ML', c: '#19D26A', name: 'Mei L.', meta: '1 week ago · Sefton', q: '“Booked online, sorted same day. Sydney finally has a Nova Tyres — so happy!”' },
]

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
  { id: 'springvale', store: 'Nova Tyres Springvale', loc: 'Springvale, VIC', rating: 4.9, count: 842, c: '#FF5A1F', av: 'DM', reviewer: 'Daniel M.', when: '2 weeks ago', quote: 'Same-day log book service, warranty stamp and all — no upsell.', search: 'springvale log book warranty same-day daniel' },
  { id: 'dandenong', store: 'Nova Tyres Dandenong', loc: 'Dandenong, VIC', rating: 4.8, count: 511, c: '#2D6BFF', av: 'SK', reviewer: 'Sophie K.', when: '1 week ago', quote: 'Free pre-RWC check saved me a fortune. Genuinely helpful crew.', search: 'dandenong south pre-rwc check sophie' },
  { id: 'bayswater', store: 'Nova Tyres Bayswater', loc: 'Bayswater, VIC', rating: 4.9, count: 388, c: '#19D26A', av: 'RT', reviewer: 'Raj T.', when: '3 days ago', quote: 'Ultimate Service and it drives like new. Call-back within the hour.', search: 'bayswater north ultimate service raj' },
  { id: 'alphington', store: 'Nova Tyres Melbourne', loc: 'Alphington, VIC', rating: 4.7, count: 276, c: '#FFB300', av: 'LN', reviewer: 'Lauren N.', when: '5 days ago', quote: 'Friendly, fast, fair priced. Dropped before work, ready by lunch.', search: 'alphington melbourne fast lauren' },
  { id: 'sunshine', store: 'Nova Tyres Sunshine', loc: 'Sunshine, VIC', rating: 4.8, count: 203, c: '#FF3B6B', av: 'MV', reviewer: 'Marco V.', when: '1 week ago', quote: 'Sorted my brakes same day and were clear about costs upfront.', search: 'sunshine north brakes marco' },
  { id: 'sefton', store: 'Nova Tyres Sefton', loc: 'Sefton, NSW', rating: 4.9, count: 164, c: '#8B5CF6', av: 'PS', reviewer: 'Priya S.', when: '4 days ago', quote: 'So glad they’re in Sydney now. Quick, honest and tidy work.', search: 'sefton sydney nsw priya' },
]

const RATING_BARS = [
  { k: 5, w: 86, n: '2,041' },
  { k: 4, w: 10, n: '243' },
  { k: 3, w: 4, n: '61' },
  { k: 2, w: 2, n: '24' },
  { k: 1, w: 1, n: '15' },
]

const STORES = [
  { name: 'Springvale', state: 'VIC', note: '4/134 Springvale Rd · Service & mechanical', address: '4/134 Springvale Rd, Springvale VIC 3171', phone: '03 9562 4269', wa: 'https://wa.me/61401531756', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Springvale', soon: false },
  { name: 'Dandenong', state: 'VIC', note: '308 S Gippsland Hwy · Dandenong South', address: '308 S Gippsland Hwy, Dandenong South VIC 3175', phone: '03 8787 5846', wa: 'https://wa.me/61413792400', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Dandenong', soon: false },
  { name: 'Bayswater', state: 'VIC', note: '194 Canterbury Rd · Bayswater North', address: '194 Canterbury Rd, Bayswater North VIC 3153', phone: '03 9720 9354', wa: 'https://wa.me/61411879425', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Bayswater', soon: false },
  { name: 'Alphington', state: 'VIC', note: '200 Grange Rd · Melbourne', address: '200 Grange Rd, Alphington VIC 3078', phone: '0403 884 151', wa: 'https://wa.me/61403884151', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Alphington', soon: false },
  { name: 'Sunshine', state: 'VIC', note: '1B Berkshire Rd · Sunshine North', address: '1B Berkshire Rd, Sunshine North VIC 3020', phone: '0401 199 224', wa: 'https://wa.me/61401199224', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Sunshine+North', soon: false },
  { name: 'Sefton', state: 'NSW · Sydney', note: '107 Carlingford St · Sydney', address: '107 Carlingford St, Sefton NSW 2162', phone: '0403 388 774', wa: 'https://wa.me/61403388774', maps: 'https://www.google.com/maps/search/?api=1&query=Nova+Tyres+Sefton', soon: false },
  { name: 'Brisbane', state: 'QLD', note: 'Serviced now from our Melbourne workshops', address: '', phone: null, wa: null, maps: null, soon: true },
  { name: 'Adelaide', state: 'SA', note: 'Serviced now from our Melbourne workshops', address: '', phone: null, wa: null, maps: null, soon: true },
]

/* Stores with a real photo on disk (public/images/stores). Others get a clean
   placeholder rather than a broken image. */
const STORE_PHOTOS = new Set(['springvale', 'dandenong', 'bayswater', 'alphington', 'sefton'])
const photoFor = (name: string) => {
  const slug = name.toLowerCase()
  return STORE_PHOTOS.has(slug) ? `/images/stores/${slug}.jpg` : null
}

const MARQUEE_ITEMS = ['Fully Qualified Mechanics', 'Warranty-Safe Log Books', 'Quality Parts & Oils', 'Free Safety Inspection', 'Pre-RWC Checks']

const BRAND_CARDS = [
  { name: 'Continental', src: '/images/brands/continental.svg' },
  { name: 'Pirelli', src: '/images/brands/pirelli.svg' },
  { name: 'Bridgestone', src: '/images/brands/bridgestone.svg' },
  { name: 'Michelin', src: '/images/brands/michelin.svg' },
  { name: 'Yokohama', src: '/images/brands/yokohama.svg' },
  { name: 'Hankook', src: '/images/brands/hankook.svg' },
  { name: 'BFGoodrich', src: '/images/brands/bfgoodrich.svg' },
]
const STAR_LABELS = ['Tap to rate', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

/* ════════════════════════════════════════════════════════════════════
   HOOKS — eased count-up + in-view trigger (port of app.js countUp)
═══════════════════════════════════════════════════════════════════ */
function useInViewOnce<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect() } },
      { threshold, rootMargin: '0px 0px -10% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, on }
}

/* cubic ease-out, decimal-aware — identical curve to the reference */
function useCountUp(target: number, on: boolean, dur = 1400, decimals = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!on) return
    let raf = 0
    const t0 = performance.now()
    const step = (ts: number) => {
      const p = Math.min((ts - t0) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(eased * target)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [on, target, dur])
  return decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* "15K" → 15<small>K</small> ; "LOG"/"MAX" stay plain (reference renderDetail) */
function renderBig(big: string) {
  if (big.endsWith('K')) return <>{big.slice(0, -1)}<small>K</small></>
  return big
}

const TextStars = ({ sm = false }: { sm?: boolean }) => (
  <span className={`review-stars${sm ? ' sm' : ''}`}>★★★★★</span>
)

/* ════════════════════════════════════════════════════════════════════
   PAGE — dual-tree split (same pattern as / , /tyres , /wheels).
   Desktop design is byte-for-byte unchanged, just wrapped; the mobile
   tree renders MobileServicePage below 1024px.
═══════════════════════════════════════════════════════════════════ */
export default function ServicePage() {
  return (
    <>
      <style>{`@media (max-width:1023.98px){.nv-shared-chrome{display:none!important}}`}</style>
      <div data-vw="desktop"><ServicePageDesktop /></div>
      <div data-vw="mobile"><MobileServicePage /></div>
    </>
  )
}

function ServicePageDesktop() {
  /* tiers */
  const [tierIdx, setTierIdx] = useState(0)
  const tier = TIERS[tierIdx]

  /* featured rotator — 6s autorotate; any change (incl. manual) resets timer */
  const [featIdx, setFeatIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFeatIdx(i => (i + 1) % FEATURED.length), 6000)
    return () => clearInterval(t)
  }, [featIdx])
  const feat = FEATURED[featIdx]

  /* reviews filtering */
  const [curLoc, setCurLoc] = useState('all')
  const [query, setQuery] = useState('')
  const visibleCards = REVIEW_CARDS.filter(c => {
    const okLoc = curLoc === 'all' || c.id === curLoc
    const q = query.trim().toLowerCase()
    const hay = `${c.search} ${c.store} ${c.loc} ${c.reviewer} ${c.quote}`.toLowerCase()
    return okLoc && (!q || hay.indexOf(q) !== -1)
  })

  /* count-up triggers */
  const heroStats = useInViewOnce<HTMLDivElement>(0.2)
  const rvStats = useInViewOnce<HTMLDivElement>(0.2)
  const bars = useInViewOnce<HTMLDivElement>(0.15)

  const locCount = useCountUp(10, heroStats.on)
  const warCount = useCountUp(100, heroStats.on)
  const rvRating = useCountUp(4.8, rvStats.on, 1400, 1)
  const rvTotal = useCountUp(2384, rvStats.on)
  const rvLocs = useCountUp(6, rvStats.on)
  const rvRec = useCountUp(98, rvStats.on)

  /* booking form */
  const [bookSent, setBookSent] = useState(false)

  /* shops accordion — single open */
  const [openShop, setOpenShop] = useState<number | null>(null)

  /* Arriving from the navbar "Locations" link (/service?goto=shops): load at the
     top, then smoothly scroll DOWN to the store list. The util re-reads the
     target each frame, so the content-visibility sections above rendering
     mid-scroll can't make it overshoot (they did — it landed on the first store
     instead of the section heading). A short delay lets hydration settle. */
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('goto') !== 'shops') return
    const t = setTimeout(() => smoothScrollToSection('shops-head', { offset: 96 }), 90)
    return () => clearTimeout(t)
  }, [])

  /* write-a-review modal */
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStore, setModalStore] = useState('')
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [ratingError, setRatingError] = useState(false)
  const [reviewSent, setReviewSent] = useState(false)

  function openModal(presetLoc?: string) {
    setModalOpen(true)
    setReviewSent(false)
    setRatingError(false)
    if (presetLoc) {
      const match = STORE_OPTIONS.find(o => o.toLowerCase().includes(presetLoc))
      if (match) setModalStore(match)
    }
  }
  function closeModal() {
    setModalOpen(false)
    setRating(0)
    setHoverRating(0)
    setRatingError(false)
    setReviewSent(false)
    setModalStore('')
  }
  function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setRatingError(true); return }
    setReviewSent(true)
  }

  /* Escape close + body scroll lock (reference modal behavior) */
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [modalOpen])

  const paintedStars = hoverRating || rating
  const starLabel = ratingError ? 'Please pick a rating' : STAR_LABELS[paintedStars] || STAR_LABELS[0]

  return (
    <main className="svcp">
      <style>{CSS}</style>

      {/* ══ HERO ══════════════════════════════════════════════════════ */}
      <section className="hero" id="top">
        <Image
          src="/images/service/workshop-hero.jpg"
          alt="Nova Tyres workshop"
          fill
          priority
          className="hero-bg"
          style={{ objectFit: 'cover', objectPosition: '68% center' }}
        />
        <div className="hero-bg-overlay" />
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="kicker" data-reveal>Auto service &amp; mechanical · Melbourne-wide</span>
            <h1 data-reveal className="nv-d1">Servicing<br /><span className="stroke">done</span><br /><em>right.</em></h1>
            <p className="hero-sub nv-d2" data-reveal>From a free Pre-RWC check to the Ultimate overhaul — fully qualified mechanics, quality parts, and a log-book stamp that keeps your warranty intact.</p>
            <div className="hero-actions nv-d3" data-reveal>
              <a className="btn" href="#tiers" onClick={e => { e.preventDefault(); scrollToId('tiers') }}>Explore services <IconArrow /></a>
              <a className="btn ghost" href="#book" onClick={e => { e.preventDefault(); scrollToId('book') }}>Get a call-back</a>
            </div>
            <div className="hero-stats nv-d4" data-reveal ref={heroStats.ref}>
              <div className="stat">
                <div className="n"><span>{locCount}</span><small>+</small></div>
                <div className="l">Locations AUS-wide</div>
              </div>
              <div className="stat">
                <div className="n"><span>{warCount}</span><small>%</small></div>
                <div className="l">Warranty-safe</div>
              </div>
              <div className="stat">
                <div className="n">&lt;1<small>HR</small></div>
                <div className="l">Call-back time</div>
              </div>
            </div>
          </div>
        </div>
        <span className="hero-badge">
          <span>FROM THE</span>
          <b>FREE CHECK</b>
        </span>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════ */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="marquee-item">{item}<span className="marquee-dot" /></span>
          ))}
        </div>
      </div>

      {/* ══ FREE SERVICES ═════════════════════════════════════════════ */}
      <section className="free-band section-pad" id="free">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <span className="kicker">On the house</span>
            <h2>Two things we<br />do for free.</h2>
          </div>
          <div className="free-grid">
            <article className="free-card nv-d1" data-reveal>
              <Image className="card-bg-img" src="/images/service/free-prerwc-check.jpg" alt="" fill sizes="(max-width: 720px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              <span className="card-scrim" />
              <span className="tag-free">Free</span>
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgb(7,99,48)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              </span>
              <h3>Pre-RWC Check</h3>
              <p>Going for a Road Worthy Certificate? We inspect your vehicle and tell you exactly what it needs to pass — before you spend a cent on the test.</p>
              <a className="link" href="#book" onClick={e => { e.preventDefault(); scrollToId('book') }}>Book a free check <IconArrow /></a>
            </article>

            <article className="free-card nv-d2" data-reveal>
              <Image className="card-bg-img" src="/images/service/free-safety-inspection.jpg" alt="" fill sizes="(max-width: 720px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
              <span className="card-scrim" />
              <span className="tag-free">Free</span>
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="rgb(7,99,48)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              </span>
              <h3>Safety Inspection</h3>
              <p>Get your tyres fitted with us and we&rsquo;ll run a complimentary safety inspection of your car — so you always leave knowing you&rsquo;re safe on the road. Just ask when you book.</p>
              <a className="link" href="/tyres">Browse tyres <IconArrow /></a>
            </article>
          </div>
        </div>
      </section>

      {/* ══ SERVICE TIERS ═════════════════════════════════════════════ */}
      <section className="section-pad tiers-sec" id="tiers">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <span className="kicker">Service menu</span>
            <h2>Pick your level<br />of service.</h2>
            <p>Each service builds on the last — select one to see exactly what&rsquo;s included. From routine log-book care to the complete Ultimate overhaul.</p>
          </div>
          <div className="tiers-layout">
            <div className="tier-list" data-reveal>
              {TIERS.map((t, i) => (
                <button key={t.id} className={`tier-item${i === tierIdx ? ' active' : ''}`} onClick={() => setTierIdx(i)}>
                  <span className="tier-num">{t.num}</span>
                  <span><span className="tier-name">{t.name}</span><span className="tier-km">{t.km}</span></span>
                  <span className="tier-chev"><IconChevR /></span>
                </button>
              ))}
            </div>
            <div className="tier-detail nv-d1" data-reveal>
              <div key={tier.id}>
                <div className="detail-top">
                  <div>
                    <span className="detail-eyebrow">{tier.eyebrow}</span>
                    <h3 className="detail-title">{tier.name}</h3>
                  </div>
                  <div className="detail-interval">
                    <div className="big">{renderBig(tier.big)}</div>
                    <div className="lab">{tier.lab}</div>
                  </div>
                </div>
                <p className="detail-desc">{tier.desc}</p>
                <div className="includes-head">
                  <span className="lab">What&rsquo;s included</span>
                  <span className="count">{tier.inc.length}</span>
                  <span className="includes-line" />
                </div>
                <div className="includes">
                  {tier.inc.map((item, i) => (
                    <div key={item.h} className={`inc${item.n ? ' added' : ''}`} style={{ animationDelay: `${i * 0.045}s` }}>
                      <span className="check"><IconCheck /></span>
                      <div>
                        <h4>{item.h}{item.n && <span className="inc-new">New</span>}</h4>
                        <p>{item.p}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="detail-cta">
                  <a href="#book" className="btn" onClick={e => { e.preventDefault(); scrollToId('book') }}>Book this service <IconArrow /></a>
                  <span className="detail-note">Call-back within the hour during opening times.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY US ════════════════════════════════════════════════════ */}
      <section className="why section-pad nv-cv" id="why">
        <div className="wrap">
          <div className="section-head" data-reveal>
            <span className="kicker">Why Nova</span>
            <h2>Servicing you<br />can trust.</h2>
          </div>
          <div className="why-grid">
            <div className="why-cell nv-d1" data-reveal>
              <span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg></span>
              <h3>Quality Parts &amp; Oils</h3>
              <p>Only genuine-grade parts and quality oils go into your vehicle — never cut corners, never compromise.</p>
              <span className="idx">01</span>
            </div>
            <div className="why-cell nv-d2" data-reveal>
              <span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></span>
              <h3>Warranty-Safe</h3>
              <p>We stamp your log book as an official record — keeping your new-car warranty fully intact.</p>
              <span className="idx">02</span>
            </div>
            <div className="why-cell nv-d3" data-reveal>
              <span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" /></svg></span>
              <h3>Fully Qualified</h3>
              <p>Every service is carried out by fully qualified mechanics with the right tools and the right training.</p>
              <span className="idx">03</span>
            </div>
            <div className="why-cell nv-d4" data-reveal>
              <span className="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 2" /></svg></span>
              <h3>Safety First</h3>
              <p>A comprehensive safety inspection comes standard with every service, so you always leave road-ready.</p>
              <span className="idx">04</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BRANDS ════════════════════════════════════════════════════ */}
      <section className="brands section-pad nv-cv" id="brands">
        <div className="brands-head" data-reveal>
          <span className="brands-pill">Our partners</span>
          <h2><span className="brand-g">Brands we</span> <span className="accent">service &amp; sell</span></h2>
          <p>From budget to premium, we stock and fit every major tyre, wheel &amp; lubricant brand.</p>
          <span className="brands-divider"><i /><b /></span>
        </div>

        {/* The list is rendered twice so the -50% keyframe lands on the seam and
            the scroll reads as continuous; the duplicate half is decorative. */}
        <div className="brands-carousel" data-reveal>
          <div className="brands-track">
            {[...BRAND_CARDS, ...BRAND_CARDS].map((b, i) => (
              <div
                key={`${b.name}-${i}`}
                className="brand-card"
                aria-hidden={i >= BRAND_CARDS.length || undefined}
              >
                <img src={b.src} alt={i < BRAND_CARDS.length ? b.name : ''} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div className="brands-trust" data-reveal>
          <span className="brands-avatars">
            {[['DM', '#FF5A1F'], ['SK', '#2D6BFF'], ['RT', '#19D26A']].map(([t, c]) => (
              <span key={t} className="brand-av" style={{ background: c }}>{t}</span>
            ))}
            <span className="brand-av more">+250</span>
          </span>
          <span className="brands-trust-txt">Trusted by 250+ drivers &amp; fleets across Australia</span>
        </div>

        <div className="brands-stats" data-reveal>
          <div className="bstat">
            <span className="bstat-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" /><path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" /></svg></span>
            <div><b>40+</b><span>Brands stocked</span></div>
          </div>
          <div className="bstat">
            <span className="bstat-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" /></svg></span>
            <div><b>6</b><span>Workshops</span></div>
          </div>
          <div className="bstat">
            <span className="bstat-ico"><IconShieldCheck /></span>
            <div><b>98%</b><span>Would recommend</span></div>
          </div>
          <div className="bstat">
            <span className="bstat-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M9 14l-2 8 5-3 5 3-2-8" /></svg></span>
            <div><b>15+</b><span>Years of trust</span></div>
          </div>
        </div>
      </section>

      {/* ══ GOOGLE REVIEWS ════════════════════════════════════════════ */}
      <section className="reviews section-pad" id="reviews">
        <div className="wrap">

          {/* header + featured */}
          <div className="rv-top">
            <div className="rv-intro" data-reveal>
              <div className="rv-rate">
                <span className="g-logo" aria-hidden="true"><GoogleG /></span>
                <TextStars sm />
                <span className="rv-rate-txt"><strong>4.8</strong> average rating</span>
              </div>
              <h2>Google reviews<br />across our stores.</h2>
              <p>Real feedback from real customers — see why drivers across Melbourne &amp; Sydney trust Nova Tyres.</p>
            </div>

            <figure className="rv-featured nv-d1" data-reveal>
              <span className="rv-featured-g" aria-hidden="true"><GoogleG /></span>
              <div className="rv-featured-tag"><IconZap />Featured review</div>
              <div className="rv-featured-body">
                <div className="rv-featured-rev">
                  <span className="avatar" style={{ background: feat.c }}>{feat.av}</span>
                  <div>
                    <span className="reviewer-name">{feat.name} <VerifiedMini /></span>
                    <span className="reviewer-time">{feat.meta}</span>
                  </div>
                </div>
                <TextStars />
                <blockquote>{feat.q}</blockquote>
              </div>
              <div className="rv-featured-nav">
                <button type="button" aria-label="Previous" onClick={() => setFeatIdx(i => (i - 1 + FEATURED.length) % FEATURED.length)}><IconChevL /></button>
                <span className="rv-dots">
                  {FEATURED.map((_, i) => <i key={i} className={i === featIdx ? 'on' : ''} />)}
                </span>
                <button type="button" aria-label="Next" onClick={() => setFeatIdx(i => (i + 1) % FEATURED.length)}><IconChevR /></button>
              </div>
            </figure>
          </div>

          {/* stat cards */}
          <div className="rv-stats" data-reveal ref={rvStats.ref}>
            <div className="rv-stat">
              <span className="rv-stat-ico s-star"><IconStar /></span>
              <div className="rv-stat-txt"><b>{rvRating}</b><span>Average rating</span></div>
            </div>
            <div className="rv-stat">
              <span className="rv-stat-ico s-msg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></span>
              <div className="rv-stat-txt"><b>{rvTotal}</b><span>Total reviews</span></div>
            </div>
            <div className="rv-stat">
              <span className="rv-stat-ico s-pin"><IconPin /></span>
              <div className="rv-stat-txt"><b>{rvLocs}</b><span>Locations</span><a className="rv-stat-link" href="#shops" onClick={e => { e.preventDefault(); scrollToId('shops') }}>View all stores →</a></div>
            </div>
            <div className="rv-stat">
              <span className="rv-stat-ico s-heart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1L12 21l7.7-7.5 1.1-1a5.5 5.5 0 0 0 0-7.9z" /></svg></span>
              <div className="rv-stat-txt"><b>{rvRec}%</b><span>Recommend us</span></div>
            </div>
          </div>

          {/* toolbar */}
          <div className="rv-bar" data-reveal>
            <div className="rv-tabs">
              {REVIEW_TABS.map(t => (
                <button key={t.id} type="button" className={`rv-tab${curLoc === t.id ? ' active' : ''}`} onClick={() => setCurLoc(t.id)}>
                  {t.label}{t.id === 'all' && <IconPin />}
                </button>
              ))}
            </div>
            <div className="rv-controls">
              <label className="rv-search">
                <IconSearch />
                <input type="search" placeholder="Search stores or reviews…" aria-label="Search stores or reviews" value={query} onChange={e => setQuery(e.target.value)} />
              </label>
              <button className="rv-write-btn" type="button" onClick={() => openModal()}>
                <IconPencil />
                Write a review
              </button>
            </div>
          </div>

          {/* body: cards + aside */}
          <div className="rv-body">
            <div className="rv-cards">
              {visibleCards.map(r => (
                <article key={r.id} className="rv-card" data-reveal>
                  <div className="rv-card-photo">
                    <span className="rv-chip"><IconPin />{r.loc}</span>
                    <div className="rv-photo" />
                    <span className="rv-card-g" aria-hidden="true"><GoogleG /></span>
                  </div>
                  <div className="rv-card-body">
                    <h3>{r.store}</h3>
                    <div className="rv-card-rate"><b>{r.rating}</b><TextStars sm /><span className="rv-count">({r.count})</span></div>
                    <div className="rv-mini">
                      <span className="avatar sm" style={{ background: r.c }}>{r.av}</span>
                      <p><b>{r.reviewer}</b> · {r.when}<br />{r.quote}</p>
                    </div>
                    <div className="rv-card-acts">
                      <button type="button" className="rv-btn ghost" onClick={() => openModal(r.id)}>View reviews</button>
                      <a className="rv-btn g" href={`https://www.google.com/search?q=Nova+Tyres+${r.id.charAt(0).toUpperCase() + r.id.slice(1)}+reviews`} target="_blank" rel="noopener noreferrer">Open on Google <IconExternal /></a>
                    </div>
                  </div>
                </article>
              ))}
              {visibleCards.length === 0 && (
                <p className="rv-empty">No stores or reviews match your search.</p>
              )}
            </div>

            <aside className="rv-aside nv-d1" data-reveal>
              <div className="rv-aside-head"><h3>What customers say</h3></div>
              <div className="rv-bars" ref={bars.ref}>
                {RATING_BARS.map(b => (
                  <div key={b.k} className="rv-bar-row">
                    <span className="rv-bk">{b.k}<IconStar /></span>
                    <span className="rv-track"><i style={{ width: bars.on ? `${b.w}%` : 0 }} /></span>
                    <span className="rv-bn">{b.n}</span>
                  </div>
                ))}
              </div>
              <a className="rv-aside-link" href="https://www.google.com/search?q=Nova+Tyres+reviews" target="_blank" rel="noopener noreferrer">View all reviews on Google →</a>
              <button className="rv-write-cta" type="button" onClick={() => openModal()}>
                <IconPencil />
                Leave us a review
              </button>
            </aside>
          </div>

          <p className="rv-foot" data-reveal>
            <IconShieldCheck />
            Reviews are verified and collected from Google.
          </p>
        </div>
      </section>

      {/* ══ BOOKING ═══════════════════════════════════════════════════ */}
      <section className="book section-pad nv-cv" id="book">
        <div className="wrap">
          <div className="book-split">
            <div className="section-head" data-reveal>
              <span className="kicker">Book a service</span>
              <h2>Tell us about<br />your car.</h2>
              <p>Enter your details and we&rsquo;ll call you back — usually within the hour during opening times.</p>
            </div>

            <div className="book-form nv-d1" data-reveal>
              {bookSent ? (
                <div className="form-success show">
                  <div className="tick"><IconCheck /></div>
                  <h3>Request sent!</h3>
                  <p>Thanks — one of our team will call you back shortly to lock in your service.</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setBookSent(true) }} noValidate>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="f-name">Your name</label>
                      <input id="f-name" name="name" type="text" placeholder="Jane Smith" required />
                    </div>
                    <div className="field">
                      <label htmlFor="f-phone">Phone</label>
                      <input id="f-phone" name="phone" type="tel" placeholder="0400 000 000" required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label htmlFor="f-vehicle">Vehicle</label>
                      <input id="f-vehicle" name="vehicle" type="text" placeholder="Make & model" />
                    </div>
                    <div className="field">
                      <label htmlFor="f-service">Service</label>
                      <select id="f-service" name="service" defaultValue={SERVICE_OPTIONS[0]}>
                        {SERVICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="f-loc">Preferred location</label>
                    <select id="f-loc" name="location" defaultValue={STORE_OPTIONS[0]}>
                      {STORE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      <option>Not sure — please advise</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="f-msg">Anything else?</label>
                    <textarea id="f-msg" name="message" placeholder="Preferred day/time, warning lights, noises…" />
                  </div>
                  <button className="btn form-submit" type="submit">Request my call-back <IconArrow /></button>
                  <div className="form-foot">
                    <IconLock />
                    No obligation — we&rsquo;ll never share your details.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FIND YOUR NEAREST SHOP ════════════════════════════════════ */}
      <section className="shops" id="shops">
        {/* Scroll anchor: the Locations link lands on the heading, not the
            section's top padding — so the kicker sits just below the nav. */}
        <div className="shops-head" id="shops-head" data-reveal>
          <span className="kicker">Find your nearest shop</span>
          <h2>Where to<br />find us.</h2>
        </div>

        <div className="shops-list">
          {STORES.map((store, i) => (
            <div key={store.name} className={`shop-row${store.soon ? ' soon' : ''}${openShop === i ? ' open' : ''}`}>
              {store.soon ? (
                <div className="shop-head">
                  <span className="shop-name">{store.name}<span className="shop-state">{store.state}</span></span>
                  <span className="shop-status"><span className="shop-stat">Coming soon</span><span className="shop-note">{store.note}</span></span>
                </div>
              ) : (
                <>
                  <button
                    className="shop-head"
                    type="button"
                    aria-expanded={openShop === i}
                    onClick={() => setOpenShop(openShop === i ? null : i)}
                  >
                    <span className="shop-name">{store.name}<span className="shop-state">{store.state}</span></span>
                    <span className="shop-status"><span className="shop-stat open">Open</span><span className="shop-note">{store.note}</span></span>
                    <IconChevD />
                  </button>
                  <div className="shop-panel">
                    <div className="shop-panel-inner">
                      <div className="shop-panel-pad">
                        {(() => {
                          const src = photoFor(store.name)
                          return src ? (
                            <div className="loc-photo has-img" style={{ backgroundImage: `url(${src})` }} role="img" aria-label={`${store.name} store`} />
                          ) : (
                            <div className="loc-photo">
                              <span className="loc-photo-ph"><IconPin />{store.name} · photo coming soon</span>
                            </div>
                          )
                        })()}
                        <div className="shop-detail">
                          <a className="loc-line" href={store.maps!} target="_blank" rel="noopener noreferrer">
                            <IconPin />{store.address}
                          </a>
                          <div className="loc-contacts">
                            <a className="loc-btn wa" href={store.wa!} target="_blank" rel="noopener noreferrer"><IconWhatsApp />WhatsApp</a>
                            {store.phone && (
                              <a className="loc-btn tel" href={`tel:${store.phone.replace(/\s/g, '')}`}><IconPhone />{store.phone}</a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <p className="shops-foot" data-reveal>Six workshops open across Melbourne &amp; Sydney — more locations opening soon right across Australia.</p>
      </section>

      {/* ══ WRITE-A-REVIEW MODAL ══════════════════════════════════════ */}
      {modalOpen && (
        <div className="rv-modal">
          <div className="rv-modal-bg" onClick={closeModal} />
          <div className="rv-modal-card" role="dialog" aria-modal="true" aria-labelledby="rvModalTitle">
            <button className="rv-modal-close" type="button" aria-label="Close" onClick={closeModal}><IconX /></button>

            {reviewSent ? (
              <div className="rv-modal-success show">
                <div className="tick"><IconCheck /></div>
                <h3>Thanks for your review!</h3>
                <p>Your {rating}-star review for {modalStore || 'your store'} has been submitted — thank you!</p>
                <button className="btn ghost" type="button" onClick={closeModal}>Done</button>
              </div>
            ) : (
              <form className="rv-modal-form" onSubmit={submitReview} noValidate>
                <div className="rv-modal-head">
                  <span className="g-logo" aria-hidden="true"><GoogleG /></span>
                  <h3 id="rvModalTitle">Leave a review</h3>
                  <p>Tell us how we did — pick your store and rate your visit.</p>
                </div>

                <div className="field">
                  <label htmlFor="rv-store">Which store?</label>
                  <select id="rv-store" required value={modalStore} onChange={e => setModalStore(e.target.value)}>
                    <option value="" disabled>Select a location…</option>
                    {STORE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div className="field">
                  <label>Your rating</label>
                  <div className="rv-stars-input" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map(v => (
                      <button
                        key={v}
                        type="button"
                        className={`rv-star${v <= paintedStars ? ' on' : ''}`}
                        aria-label={`${v} star${v > 1 ? 's' : ''}`}
                        onMouseEnter={() => setHoverRating(v)}
                        onClick={() => { setRating(v); setRatingError(false) }}
                      >
                        <IconStar />
                      </button>
                    ))}
                    <span className="rv-stars-label" style={ratingError ? { color: 'var(--accent)' } : undefined}>{starLabel}</span>
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label htmlFor="rv-rname">Your name</label>
                    <input id="rv-rname" type="text" placeholder="Jane S." required />
                  </div>
                  <div className="field">
                    <label htmlFor="rv-remail">Email <span className="rv-opt">(optional)</span></label>
                    <input id="rv-remail" type="email" placeholder="jane@email.com" />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="rv-rtext">Your review</label>
                  <textarea id="rv-rtext" placeholder="What stood out about your visit?" required />
                </div>

                <button className="btn rv-modal-submit" type="submit">Submit review <IconArrow /></button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

/* ════════════════════════════════════════════════════════════════════
   CSS — ported from the reference styles.css, light theme resolved,
   scoped under .svcp. The hero re-declares the dark token set because
   the workshop photo is dark (matches the authored tweaks: white
   kicker / light text over the image).
═══════════════════════════════════════════════════════════════════ */
const CSS = `
.svcp {
  --accent: #FF6817;
  --green: #076330;
  --green-2: #0A7D3D;
  --accent-ink: #0B0B0E;
  --accent-soft: color-mix(in oklab, #FF6817 16%, transparent);
  --green-soft: color-mix(in oklab, #076330 14%, transparent);

  --maxw: 1240px;
  --gutter: clamp(20px, 5vw, 64px);
  --radius: 20px;
  --radius-sm: 12px;

  --font-display: var(--font-dm-sans), 'DM Sans', sans-serif;
  --font-body: var(--font-dm-sans), 'DM Sans', sans-serif;
  --font-mono: var(--font-dm-mono), 'DM Mono', monospace;

  --ease: cubic-bezier(.22, 1, .36, 1);

  /* light theme tokens */
  --bg: #F4F3EF;
  --bg-grad-a: #F7F6F2;
  --bg-grad-b: #EDECE6;
  --surface: #FFFFFF;
  --surface-2: #FBFAF7;
  --card: #FFFFFF;
  --card-hover: #FFFFFF;
  --line: rgba(15,15,20,.10);
  --line-strong: rgba(15,15,20,.20);
  --text: #14141A;
  --text-mid: #44444E;
  --text-dim: #76767F;
  --shadow: 0 24px 50px -30px rgba(20,20,30,.30);

  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}
.svcp section { position: relative; }
.svcp .wrap { width: 100%; max-width: var(--maxw); margin-inline: auto; padding-inline: var(--gutter); }
.svcp img, .svcp svg { display: block; max-width: 100%; }
.svcp a { color: inherit; text-decoration: none; }
.svcp button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }
.svcp ul { list-style: none; }

/* ---------- typographic helpers ---------- */
.svcp .kicker {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--text-dim);
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.svcp .kicker::before { content: ""; width: 22px; height: 1px; background: var(--accent); }
.svcp .section-head { max-width: 720px; margin-bottom: clamp(34px, 5vw, 56px); }
.svcp .section-head h2 {
  font-family: var(--font-display); font-weight: 800; text-transform: uppercase;
  font-size: clamp(34px, 5vw, 60px); line-height: .98; letter-spacing: -.02em;
  margin: 18px 0 0;
}
.svcp .section-head p { margin: 18px 0 0; font-size: 17px; color: var(--text-mid); max-width: 54ch; }
.svcp .section-pad { padding-block: clamp(64px, 9vw, 130px); }

/* ---------- buttons ---------- */
.svcp .btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  font-family: var(--font-body); font-weight: 700; font-size: 14.5px;
  padding: 13px 22px;
  border-radius: 999px;
  background: var(--accent); color: var(--accent-ink);
  letter-spacing: .01em;
  transition: transform .25s var(--ease), box-shadow .25s, filter .2s;
  white-space: nowrap;
  cursor: pointer;
}
.svcp .btn:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: 0 14px 30px -12px var(--accent); }
.svcp .btn:active { transform: translateY(0); }
.svcp .btn svg { width: 16px; height: 16px; }
.svcp .btn.ghost { background: transparent; color: var(--text); border: 1px solid var(--line-strong); }
.svcp .btn.ghost:hover { background: var(--surface); box-shadow: none; border-color: var(--text-dim); }

/* ============================================================
   HERO — dark token override (dark workshop photo, per the
   authored tweaks: white kicker over the image)
============================================================ */
.svcp .hero {
  --bg: #0A0A0D;
  --bg-grad-a: #0E0E13;
  --bg-grad-b: #08080A;
  --surface: #121217;
  --card: #131319;
  --line: rgba(255,255,255,.09);
  --line-strong: rgba(255,255,255,.16);
  --text: #F4F4F1;
  --text-mid: #B9B9C2;
  --text-dim: #7C7C86;
  --shadow: 0 24px 60px -28px rgba(0,0,0,.8);
  color: var(--text);

  position: relative;
  display: flex;
  align-items: center;
  min-height: min(92vh, 880px);
  padding-top: clamp(96px, 14vh, 160px);
  padding-bottom: clamp(60px, 10vh, 130px);
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(120% 90% at 85% -10%, var(--accent-soft), transparent 55%),
    linear-gradient(180deg, var(--bg-grad-a), var(--bg-grad-b));
}
.svcp .hero-bg { position: absolute; inset: 0; z-index: -2; }
.svcp .hero-bg-overlay {
  position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    linear-gradient(90deg, color-mix(in oklab, var(--bg) 88%, transparent) 0%, color-mix(in oklab, var(--bg) 55%, transparent) 42%, color-mix(in oklab, var(--bg) 20%, transparent) 100%),
    linear-gradient(0deg, color-mix(in oklab, var(--bg) 80%, transparent) 0%, transparent 40%);
}
.svcp .hero-inner { position: relative; z-index: 1; width: 100%; }
.svcp .hero-copy { max-width: 760px; }
.svcp .hero .kicker { color: #fff; }
.svcp .hero h1 {
  font-family: var(--font-display);
  font-weight: 900;
  text-transform: uppercase;
  line-height: .96;
  letter-spacing: -.03em;
  font-size: clamp(50px, 7.5vw, 112px);
  margin: 22px 0 0;
  text-shadow: 0 2px 24px color-mix(in oklab, var(--bg) 70%, transparent);
}
.svcp .hero h1 .stroke {
  -webkit-text-stroke: 1.5px var(--text);
  color: transparent;
  -webkit-text-fill-color: transparent;
}
.svcp .hero h1 em { font-style: normal; color: rgb(7, 99, 48); }
.svcp .hero-sub {
  margin: 26px 0 0;
  font-size: clamp(16px, 1.5vw, 19px);
  color: var(--text-mid);
  max-width: 46ch;
  line-height: 1.6;
  text-shadow: 0 2px 24px color-mix(in oklab, var(--bg) 70%, transparent);
}
.svcp .hero-actions { margin-top: 34px; display: flex; gap: 14px; flex-wrap: wrap; }
.svcp .hero-stats { margin-top: 48px; display: flex; gap: clamp(24px, 4vw, 52px); flex-wrap: wrap; }
.svcp .stat .n {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(30px, 3.4vw, 46px); line-height: 1;
  letter-spacing: -.02em;
  display: flex; align-items: baseline; gap: 2px;
}
.svcp .stat .n small { font-size: .5em; color: var(--accent); font-weight: 800; }
.svcp .stat .l {
  margin-top: 8px; font-size: 13px; color: var(--text-dim);
  font-family: var(--font-mono); letter-spacing: .04em; text-transform: uppercase;
}
.svcp .hero-badge {
  position: absolute; z-index: 1;
  right: clamp(20px, 5vw, 72px); bottom: clamp(28px, 6vh, 64px);
  background: var(--accent); color: var(--accent-ink);
  border-radius: 14px;
  padding: 14px 20px 16px;
  font-family: var(--font-display); font-weight: 800; text-transform: uppercase;
  line-height: 1.04; box-shadow: 0 24px 60px -28px rgba(0,0,0,.8);
  transform: rotate(-4deg);
}
.svcp .hero-badge span { display: block; font-family: var(--font-mono); font-weight: 700; font-size: 11px; letter-spacing: .1em; margin-bottom: 6px; opacity: .8; }
.svcp .hero-badge b { display: block; font-size: 22px; white-space: nowrap; }

/* ============================================================
   MARQUEE
============================================================ */
.svcp .marquee {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  overflow: hidden;
}
.svcp .marquee-track {
  display: flex; gap: 56px; align-items: center;
  padding: 18px 0;
  width: max-content;
  animation: svcpSlide 28s linear infinite;
}
.svcp .marquee:hover .marquee-track { animation-play-state: paused; }
.svcp .marquee-item {
  display: inline-flex; align-items: center; gap: 12px;
  font-family: var(--font-mono); font-size: 13px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--text-mid); white-space: nowrap;
}
.svcp .marquee-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
@keyframes svcpSlide { to { transform: translateX(-50%); } }

/* ============================================================
   FREE SERVICES BAND
============================================================ */
.svcp .free-band { background: var(--surface); border-block: 1px solid var(--line); }
.svcp .free-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
.svcp .free-card {
  position: relative;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: clamp(26px, 3vw, 40px);
  display: flex; flex-direction: column; gap: 16px;
  overflow: hidden;
  isolation: isolate;
  transition: border-color .3s, transform .35s var(--ease);
}
.svcp .free-card:hover { border-color: var(--accent); transform: translateY(-3px); }
.svcp .free-card .card-bg-img { z-index: 0; border-radius: inherit; }
.svcp .free-card .card-scrim {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  border-radius: inherit;
  background: linear-gradient(180deg,
    color-mix(in oklab, var(--card) 30%, transparent) 0%,
    color-mix(in oklab, var(--card) 12%, transparent) 32%,
    color-mix(in oklab, var(--card) 72%, transparent) 72%,
    color-mix(in oklab, var(--card) 94%, transparent) 100%);
}
.svcp .free-card .tag-free {
  position: absolute; top: 20px; right: 20px; z-index: 2;
  font-family: var(--font-mono); font-weight: 700; font-size: 11px; letter-spacing: .14em;
  text-transform: uppercase; color: rgb(7, 99, 48);
  border: 1px solid rgb(7, 99, 48); border-radius: 999px; padding: 5px 11px;
}
.svcp .free-card .ico {
  position: relative; z-index: 2;
  width: 52px; height: 52px; border-radius: 14px;
  display: grid; place-items: center;
  background: var(--green-soft);
}
.svcp .free-card .ico svg { width: 26px; height: 26px; }
.svcp .free-card h3 {
  position: relative; z-index: 2;
  font-family: var(--font-display); font-weight: 700; text-transform: uppercase;
  font-size: 25px; letter-spacing: -.01em;
  text-shadow: 0 1px 14px color-mix(in oklab, var(--bg) 60%, transparent);
}
.svcp .free-card p {
  position: relative; z-index: 2;
  color: var(--text-mid); font-size: 15.5px; line-height: 1.6;
  text-shadow: 0 1px 14px color-mix(in oklab, var(--bg) 60%, transparent);
}
.svcp .free-card .link {
  position: relative; z-index: 2;
  margin-top: auto; display: inline-flex; align-items: center; gap: 9px;
  font-weight: 700; font-size: 14.5px; color: var(--text);
}
.svcp .free-card .link svg { width: 16px; height: 16px; color: var(--accent); transition: transform .25s var(--ease); }
.svcp .free-card:hover .link svg { transform: translateX(5px); }

/* ============================================================
   SERVICE TIERS (interactive selector)
============================================================ */
.svcp .tiers-layout { display: grid; grid-template-columns: 380px 1fr; gap: clamp(24px, 3vw, 48px); align-items: start; }
.svcp .tier-list { display: flex; flex-direction: column; gap: 12px; }
.svcp .tier-item {
  position: relative; text-align: left; width: 100%;
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-sm);
  padding: 18px 20px;
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 16px;
  transition: border-color .25s, background .25s, transform .25s var(--ease);
}
.svcp .tier-item:hover { border-color: var(--line-strong); transform: translateX(3px); }
.svcp .tier-item.active { border-color: var(--accent); background: var(--card-hover); }
.svcp .tier-item.active::before {
  content: ""; position: absolute; left: 0; top: 12px; bottom: 12px; width: 3px;
  background: var(--accent); border-radius: 3px;
}
.svcp .tier-num { font-family: var(--font-mono); font-size: 12px; font-weight: 700; color: var(--text-dim); width: 26px; }
.svcp .tier-item.active .tier-num { color: var(--accent); }
.svcp .tier-name { display: block; font-family: var(--font-display); font-weight: 700; text-transform: uppercase; font-size: 18px; letter-spacing: -.01em; line-height: 1.05; }
.svcp .tier-km { display: block; font-family: var(--font-mono); font-size: 11.5px; color: var(--text-dim); margin-top: 5px; letter-spacing: .03em; }
.svcp .tier-item > span:nth-child(2) { min-width: 0; }
.svcp .tier-chev { width: 18px; height: 18px; color: var(--text-dim); transition: transform .25s, color .25s; }
.svcp .tier-chev svg { width: 100%; height: 100%; }
.svcp .tier-item.active .tier-chev { color: var(--accent); transform: translateX(2px); }

.svcp .tier-detail {
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
  padding: clamp(28px, 3.4vw, 48px);
  min-height: 460px;
  box-shadow: var(--shadow);
  position: relative; overflow: hidden;
}
.svcp .tier-detail::after {
  content: ""; position: absolute; right: -80px; top: -80px; width: 280px; height: 280px;
  background: radial-gradient(circle, var(--accent-soft), transparent 70%);
  pointer-events: none;
}
.svcp .detail-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 28px; }
.svcp .detail-top > div:first-child { flex: 1; min-width: 0; }
.svcp .detail-eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); }
.svcp .detail-title { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: clamp(28px, 3.2vw, 42px); line-height: .95; letter-spacing: -.02em; margin: 12px 0 0; text-wrap: balance; }
.svcp .detail-interval { text-align: right; flex-shrink: 0; }
.svcp .detail-interval .big { font-family: var(--font-display); font-weight: 800; font-size: clamp(28px, 3vw, 40px); line-height: 1; }
.svcp .detail-interval .big small { color: var(--accent); font-size: .5em; }
.svcp .detail-interval .lab { font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--text-dim); margin-top: 6px; }
.svcp .detail-desc { margin: 20px 0 0; font-size: 16.5px; color: var(--text-mid); max-width: 60ch; line-height: 1.65; }
.svcp .detail-desc b { color: var(--text); }
.svcp .includes-head { margin-top: 30px; display: flex; align-items: center; gap: 12px; }
.svcp .includes-head .lab { font-family: var(--font-mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--text-dim); }
.svcp .includes-head .count {
  font-family: var(--font-mono); font-size: 12px; font-weight: 700;
  color: var(--accent-ink); background: var(--accent); border-radius: 999px; padding: 3px 10px;
}
.svcp .includes-line { flex: 1; height: 1px; background: var(--line); }
.svcp .includes { margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px 22px; }
.svcp .inc {
  display: grid; grid-template-columns: auto 1fr; gap: 13px; align-items: start;
  padding: 4px 0;
  opacity: 0; transform: translateY(8px);
  animation: svcpIncIn .45s var(--ease) forwards;
}
@keyframes svcpIncIn { to { opacity: 1; transform: none; } }
.svcp .inc .check {
  width: 22px; height: 22px; border-radius: 7px; flex-shrink: 0; margin-top: 2px;
  background: var(--accent-soft); color: var(--accent);
  display: grid; place-items: center;
}
.svcp .inc .check svg { width: 13px; height: 13px; }
.svcp .inc.added .check { background: var(--accent); color: var(--accent-ink); }
.svcp .inc h4 { font-size: 15px; font-weight: 700; line-height: 1.3; margin: 0; }
.svcp .inc p { font-size: 13px; color: var(--text-dim); margin: 2px 0 0; line-height: 1.5; }
.svcp .inc-new {
  font-family: var(--font-mono); font-size: 9px; font-weight: 700; letter-spacing: .1em;
  color: var(--accent); border: 1px solid var(--accent); border-radius: 4px;
  padding: 1px 5px; margin-left: 7px; vertical-align: middle; text-transform: uppercase;
}
.svcp .detail-cta { margin-top: 32px; display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
.svcp .detail-note { font-size: 13px; color: var(--text-dim); }

/* ============================================================
   WHY US
============================================================ */
.svcp .why { background: var(--surface); border-block: 1px solid var(--line); }
.svcp .why-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--line); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; }
.svcp .why-cell {
  background: var(--surface); padding: clamp(26px, 3vw, 40px);
  display: flex; flex-direction: column; gap: 16px; min-height: 230px;
  transition: background .3s;
}
.svcp .why-cell:hover { background: var(--surface-2); }
.svcp .why-cell .ico { width: 46px; height: 46px; color: var(--accent); }
.svcp .why-cell .ico svg { width: 100%; height: 100%; }
.svcp .why-cell h3 { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; font-size: 20px; letter-spacing: -.01em; line-height: 1.05; margin: 0; }
.svcp .why-cell p { font-size: 14.5px; color: var(--text-mid); line-height: 1.6; margin: 0; }
.svcp .why-cell .idx { margin-top: auto; font-family: var(--font-mono); font-size: 12px; color: var(--text-dim); }

/* ============================================================
   BRANDS
============================================================ */
.svcp .brands { position: relative; background: var(--surface); border-block: 1px solid var(--line); overflow: hidden; text-align: center; }

.svcp .brands-head { max-width: 640px; margin-inline: auto; }
.svcp .brands-pill {
  display: inline-block; font-family: var(--font-mono); font-size: 11px; font-weight: 700;
  letter-spacing: .2em; text-transform: uppercase; color: var(--accent);
  border: 1px solid var(--accent); border-radius: 999px; padding: 7px 16px;
}
.svcp .brands-head h2 {
  font-family: var(--font-display); font-weight: 800; text-transform: uppercase;
  font-size: clamp(38px, 6vw, 76px); line-height: .98; letter-spacing: -.025em; margin: 20px 0 0;
}
.svcp .brands-head h2 .accent { color: var(--accent); }
.svcp .brands-head h2 .brand-g { color: var(--green); }
.svcp .brands-head p { margin: 16px 0 0; font-size: 17px; color: var(--text-mid); }
.svcp .brands-divider { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 22px; }
.svcp .brands-divider i { width: 64px; height: 3px; border-radius: 3px; background: var(--green); }
.svcp .brands-divider b { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); opacity: .7; }

.svcp .brands-carousel {
  position: relative; margin: clamp(40px, 5vw, 64px) 0 0;
  width: 100%; overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent);
}
/* The list is rendered twice and spacing lives on the cards (margin-right, not
   flex gap), so the two halves are exactly equal width and -50% lands on the
   seam regardless of the card's box model. */
.svcp .brands-track {
  display: flex; width: max-content; align-items: stretch;
  animation: svcpBrandsSlide 34s linear infinite;
}
.svcp .brands-carousel:hover .brands-track { animation-play-state: paused; }
@keyframes svcpBrandsSlide {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.svcp .brand-card {
  box-sizing: border-box;
  flex: 0 0 176px; height: clamp(94px, 8.5vw, 122px); margin-right: 16px;
  background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-sm);
  box-shadow: var(--shadow); display: grid; place-items: center; padding: 16px;
  transition: border-color .3s, box-shadow .3s;
}
.svcp .brands-carousel:hover .brand-card:hover { border-color: var(--accent); box-shadow: 0 18px 40px -18px var(--accent); }
.svcp .brand-card img { max-height: 38px; width: auto; object-fit: contain; }

.svcp .brands-trust { position: relative; z-index: 1; margin-top: 30px; display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
.svcp .brands-avatars { display: inline-flex; align-items: center; }
.svcp .brand-av {
  width: 38px; height: 38px; border: 2px solid var(--surface); background: var(--surface-2); margin-left: -10px;
  border-radius: 50%; display: grid; place-items: center;
  color: #fff; font-size: 12px; font-weight: 800; font-family: var(--font-body);
}
.svcp .brand-av:first-child { margin-left: 0; }
.svcp .brand-av.more { background: var(--accent); color: var(--accent-ink); }
.svcp .brands-trust-txt { font-size: 14.5px; color: var(--text-mid); font-weight: 600; }

.svcp .brands-stats {
  position: relative; z-index: 1; max-width: 1080px; margin: clamp(40px, 5vw, 60px) auto 0;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--line); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden;
}
.svcp .bstat { background: var(--card); display: flex; align-items: center; gap: 14px; padding: 22px clamp(16px, 2vw, 28px); text-align: left; transition: background .25s; }
.svcp .bstat:hover { background: var(--surface-2); }
.svcp .bstat-ico { width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; background: var(--accent-soft); color: var(--accent); }
.svcp .bstat-ico svg { width: 22px; height: 22px; }
.svcp .bstat b { display: block; font-family: var(--font-display); font-weight: 800; font-size: clamp(22px, 2.4vw, 30px); line-height: 1; letter-spacing: -.02em; }
.svcp .bstat span { display: block; font-size: 13px; color: var(--text-dim); margin-top: 5px; }
@media (max-width: 820px) { .svcp .brands-stats { grid-template-columns: 1fr 1fr; } }
@media (max-width: 460px) { .svcp .brands-stats { grid-template-columns: 1fr; } }

/* ============================================================
   GOOGLE REVIEWS DASHBOARD
============================================================ */
.svcp .reviews { background: var(--bg); }
.svcp .reviews > .wrap { max-width: 1680px; }
.svcp .review-stars { color: #FFB300; font-size: 17px; letter-spacing: 3px; }
.svcp .review-stars.sm { font-size: 13px; letter-spacing: 1.5px; }
.svcp .avatar {
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  display: grid; place-items: center;
  font-family: var(--font-display); font-weight: 700; font-size: 15px; letter-spacing: .02em;
  color: #fff; background: var(--accent);
}
.svcp .avatar.sm { width: 34px; height: 34px; font-size: 12px; }
.svcp .reviewer-name { display: block; font-weight: 700; font-size: 14.5px; }
.svcp .reviewer-time { display: block; font-family: var(--font-mono); font-size: 11.5px; color: var(--text-dim); margin-top: 2px; }
.svcp .verified-mini { width: 15px; height: 15px; display: inline-block; vertical-align: -2px; }

.svcp .rv-top { display: grid; grid-template-columns: 1.25fr .9fr; gap: clamp(24px, 4vw, 56px); align-items: center; }
.svcp .rv-rate { display: flex; align-items: center; gap: 12px; }
.svcp .g-logo { width: 30px; height: 30px; flex-shrink: 0; }
.svcp .g-logo svg { width: 100%; height: 100%; }
.svcp .rv-rate-txt { font-size: 14px; color: var(--text-mid); }
.svcp .rv-rate-txt strong { color: var(--text); font-weight: 800; }
.svcp .rv-intro h2 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: clamp(34px, 5vw, 60px); line-height: .98; letter-spacing: -.02em; margin: 18px 0 0; }
.svcp .rv-intro p { margin: 16px 0 0; font-size: 16.5px; color: var(--text-mid); max-width: 46ch; }

.svcp .rv-featured {
  position: relative; overflow: hidden; margin: 0;
  background:
    radial-gradient(120% 120% at 100% 0%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 60%),
    var(--card);
  border: 1px solid var(--line); border-radius: var(--radius);
  padding: clamp(22px, 2.4vw, 30px); box-shadow: var(--shadow);
}
.svcp .rv-featured-g { position: absolute; top: 18px; right: 18px; width: 34px; height: 34px; opacity: .8; }
.svcp .rv-featured-g svg { width: 100%; height: 100%; }
.svcp .rv-featured-tag { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: var(--accent); }
.svcp .rv-featured-tag svg { width: 16px; height: 16px; }
.svcp .rv-featured-body { margin-top: 16px; min-height: 132px; }
.svcp .rv-featured-rev { display: flex; align-items: center; gap: 12px; }
.svcp .rv-featured-rev .reviewer-name { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.svcp .rv-featured .review-stars { display: block; margin-top: 14px; }
.svcp .rv-featured blockquote { margin: 10px 0 0; font-size: clamp(15px, 1.5vw, 17px); line-height: 1.55; color: var(--text); text-wrap: pretty; }
.svcp .rv-featured-nav { display: flex; align-items: center; gap: 14px; margin-top: 18px; }
.svcp .rv-featured-nav button { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line-strong); color: var(--text-mid); display: grid; place-items: center; transition: border-color .2s, color .2s; }
.svcp .rv-featured-nav button:hover { border-color: var(--accent); color: var(--accent); }
.svcp .rv-featured-nav button svg { width: 15px; height: 15px; }
.svcp .rv-dots { display: inline-flex; gap: 6px; margin-right: auto; }
.svcp .rv-dots i { width: 7px; height: 7px; border-radius: 50%; background: var(--line-strong); transition: background .2s, width .2s; }
.svcp .rv-dots i.on { background: var(--accent); width: 18px; border-radius: 4px; }

.svcp .rv-stats { margin-top: clamp(32px, 4vw, 52px); display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.svcp .rv-stat { display: flex; align-items: center; gap: 16px; background: var(--card); border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 20px; transition: border-color .25s, transform .3s var(--ease); }
.svcp .rv-stat:hover { border-color: var(--line-strong); transform: translateY(-3px); }
.svcp .rv-stat-ico { width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; display: grid; place-items: center; }
.svcp .rv-stat-ico svg { width: 24px; height: 24px; }
.svcp .rv-stat-ico.s-star { background: color-mix(in oklab, #FFB300 18%, transparent); color: #FFB300; }
.svcp .rv-stat-ico.s-msg { background: color-mix(in oklab, #4285F4 18%, transparent); color: #4285F4; }
.svcp .rv-stat-ico.s-pin { background: color-mix(in oklab, #19D26A 18%, transparent); color: #19D26A; }
.svcp .rv-stat-ico.s-heart { background: color-mix(in oklab, #8B5CF6 20%, transparent); color: #8B5CF6; }
.svcp .rv-stat-txt b { display: block; font-family: var(--font-display); font-weight: 800; font-size: 26px; line-height: 1; letter-spacing: -.02em; }
.svcp .rv-stat-txt > span { display: block; font-size: 13px; color: var(--text-dim); margin-top: 4px; }
.svcp .rv-stat-link { display: inline-block; font-size: 12px; font-weight: 700; color: var(--accent); margin-top: 7px; }

.svcp .rv-bar { margin-top: clamp(28px, 3.5vw, 44px); display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.svcp .rv-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.svcp .rv-tabs::-webkit-scrollbar { display: none; }
.svcp .rv-tab { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; font-size: 13.5px; font-weight: 600; color: var(--text-mid); padding: 9px 16px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); transition: all .2s; }
.svcp .rv-tab svg { width: 14px; height: 14px; }
.svcp .rv-tab:hover { border-color: var(--line-strong); color: var(--text); }
.svcp .rv-tab.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.svcp .rv-controls { display: flex; align-items: center; gap: 12px; }
.svcp .rv-search { display: inline-flex; align-items: center; gap: 9px; background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 9px 16px; transition: border-color .2s; }
.svcp .rv-search:focus-within { border-color: var(--accent); }
.svcp .rv-search svg { width: 16px; height: 16px; color: var(--text-dim); }
.svcp .rv-search input { border: none; background: none; outline: none; font-size: 14px; width: clamp(140px, 18vw, 220px); color: var(--text); }
.svcp .rv-write-btn { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 13.5px; font-weight: 700; color: var(--accent-ink); background: var(--accent); border-radius: 999px; padding: 10px 18px; transition: transform .2s var(--ease), filter .2s; }
.svcp .rv-write-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
.svcp .rv-write-btn svg { width: 15px; height: 15px; }

.svcp .rv-body { margin-top: 22px; display: grid; grid-template-columns: 1fr 300px; gap: clamp(18px, 2vw, 26px); align-items: start; }
.svcp .rv-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.svcp .rv-card { display: flex; flex-direction: column; background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; transition: border-color .3s, transform .35s var(--ease), box-shadow .3s; }
.svcp .rv-card:hover { border-color: var(--line-strong); transform: translateY(-4px); box-shadow: var(--shadow); }
.svcp .rv-card-photo { position: relative; height: 150px; }
.svcp .rv-photo { position: absolute; inset: 0; background: linear-gradient(135deg, #1C3A2B 0%, #0C0D0F 100%); }
.svcp .rv-chip { position: absolute; top: 12px; left: 12px; z-index: 2; display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 700; color: #fff; background: rgba(0,0,0,.55); backdrop-filter: blur(6px); border-radius: 999px; padding: 6px 11px; }
.svcp .rv-chip svg { width: 12px; height: 12px; }
.svcp .rv-card-g { position: absolute; right: 12px; bottom: -16px; z-index: 2; width: 34px; height: 34px; border-radius: 50%; background: #fff; display: grid; place-items: center; box-shadow: 0 4px 12px rgba(0,0,0,.3); }
.svcp .rv-card-g svg { width: 20px; height: 20px; }
.svcp .rv-card-body { padding: 22px 18px 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; }
.svcp .rv-card-body h3 { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; font-size: 18px; letter-spacing: -.01em; margin: 0; }
.svcp .rv-card-rate { display: flex; align-items: center; gap: 9px; }
.svcp .rv-card-rate b { font-weight: 800; font-size: 15px; }
.svcp .rv-count { font-size: 12.5px; color: var(--text-dim); }
.svcp .rv-mini { display: flex; gap: 11px; align-items: flex-start; }
.svcp .rv-mini p { font-size: 13px; color: var(--text-mid); line-height: 1.5; margin: 0; }
.svcp .rv-mini p b { color: var(--text); font-weight: 700; }
.svcp .rv-card-acts { margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 9px; padding-top: 4px; }
.svcp .rv-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; font-size: 13px; font-weight: 700; padding: 11px 10px; border-radius: 10px; transition: all .2s; }
.svcp .rv-btn svg { width: 14px; height: 14px; }
.svcp .rv-btn.ghost { border: 1px solid var(--line-strong); color: var(--text); }
.svcp .rv-btn.ghost:hover { border-color: var(--accent); color: var(--accent); }
.svcp .rv-btn.g { background: #1a73e8; color: #fff; }
.svcp .rv-btn.g:hover { background: #1666cf; transform: translateY(-1px); }
.svcp .rv-empty { grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 40px; font-size: 15px; }

.svcp .rv-aside { position: sticky; top: 96px; background: var(--card); border: 1px solid var(--line); border-radius: var(--radius); padding: 24px 22px; }
.svcp .rv-aside-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.svcp .rv-aside-head h3 { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; font-size: 17px; letter-spacing: -.01em; margin: 0; }
.svcp .rv-bars { display: flex; flex-direction: column; gap: 12px; }
.svcp .rv-bar-row { display: grid; grid-template-columns: 30px 1fr auto; align-items: center; gap: 12px; margin: 0; }
.svcp .rv-bk { display: inline-flex; align-items: center; gap: 3px; font-size: 12.5px; font-weight: 700; color: var(--text-mid); }
.svcp .rv-bk svg { width: 11px; height: 11px; color: #FFB300; }
.svcp .rv-track { height: 8px; border-radius: 999px; background: color-mix(in oklab, var(--text) 8%, transparent); overflow: hidden; }
.svcp .rv-track i { display: block; height: 100%; border-radius: 999px; background: #FFB300; transition: width 1s var(--ease); }
.svcp .rv-bn { font-family: var(--font-mono); font-size: 12px; color: var(--text-dim); }
.svcp .rv-aside-link { display: inline-block; margin-top: 20px; font-size: 13.5px; font-weight: 700; color: #1a73e8; }
.svcp .rv-aside-link:hover { text-decoration: underline; }
.svcp .rv-write-cta { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; margin-top: 16px; font-size: 13.5px; font-weight: 700; color: var(--text); border: 1px solid var(--line-strong); border-radius: 10px; padding: 12px; transition: border-color .2s, color .2s, background .2s; }
.svcp .rv-write-cta:hover { border-color: var(--accent); color: var(--accent); }
.svcp .rv-write-cta svg { width: 15px; height: 15px; }

.svcp .rv-foot { margin: clamp(24px, 3vw, 36px) 0 0; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 13px; color: var(--text-dim); }
.svcp .rv-foot svg { width: 16px; height: 16px; color: #19D26A; }

@media (max-width: 1280px) {
  .svcp .rv-body { grid-template-columns: 1fr; }
  .svcp .rv-aside { position: static; }
}
@media (max-width: 1024px) {
  .svcp .rv-top { grid-template-columns: 1fr; }
  .svcp .rv-stats { grid-template-columns: repeat(2, 1fr); }
  .svcp .rv-cards { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 820px) { .svcp .rv-cards { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) {
  .svcp .rv-stats { grid-template-columns: 1fr 1fr; }
  .svcp .rv-cards { grid-template-columns: 1fr; }
  .svcp .rv-bar { flex-direction: column; align-items: stretch; }
  .svcp .rv-controls { justify-content: space-between; }
}

/* review modal */
.svcp .rv-modal { position: fixed; inset: 0; z-index: 10050; display: grid; place-items: center; padding: 24px; }
.svcp .rv-modal-bg { position: absolute; inset: 0; background: rgba(0,0,0,.66); backdrop-filter: blur(5px); animation: svcpFade .25s var(--ease); }
@keyframes svcpFade { from { opacity: 0; } }
.svcp .rv-modal-card { position: relative; z-index: 1; width: min(560px, 100%); max-height: 90vh; overflow-y: auto; background: var(--surface); border: 1px solid var(--line-strong); border-radius: var(--radius); box-shadow: var(--shadow); padding: clamp(24px, 3vw, 38px); animation: svcpPop .3s var(--ease); }
@keyframes svcpPop { from { opacity: 0; transform: translateY(14px) scale(.98); } }
.svcp .rv-modal-close { position: absolute; top: 16px; right: 16px; width: 34px; height: 34px; border-radius: 9px; display: grid; place-items: center; color: var(--text-dim); transition: background .2s, color .2s; }
.svcp .rv-modal-close:hover { background: var(--surface-2); color: var(--text); }
.svcp .rv-modal-close svg { width: 18px; height: 18px; }
.svcp .rv-modal-head { margin-bottom: 22px; }
.svcp .rv-modal-head h3 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: 26px; letter-spacing: -.01em; margin: 12px 0 0; }
.svcp .rv-modal-head p { color: var(--text-mid); font-size: 14.5px; margin: 6px 0 0; }
.svcp .rv-modal-form .field { margin-bottom: 16px; }
.svcp .rv-opt { color: var(--text-dim); font-weight: 400; text-transform: none; letter-spacing: 0; }
.svcp .rv-stars-input { display: flex; align-items: center; gap: 4px; }
.svcp .rv-star { padding: 2px; line-height: 0; color: var(--line-strong); transition: color .15s, transform .15s; }
.svcp .rv-star svg { width: 30px; height: 30px; }
.svcp .rv-star:hover { transform: scale(1.12); }
.svcp .rv-star.on { color: #FFB300; }
.svcp .rv-stars-label { margin-left: 10px; font-size: 13px; color: var(--text-dim); font-weight: 600; }
.svcp .rv-modal-submit { width: 100%; margin-top: 6px; padding: 15px; }
.svcp .rv-modal-success { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; padding: 18px 10px; }
.svcp .rv-modal-success .tick { width: 62px; height: 62px; border-radius: 50%; background: var(--accent); color: var(--accent-ink); display: grid; place-items: center; animation: svcpPopTick .45s var(--ease); }
.svcp .rv-modal-success .tick svg { width: 30px; height: 30px; }
.svcp .rv-modal-success h3 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: 26px; margin: 0; }
.svcp .rv-modal-success p { color: var(--text-mid); max-width: 36ch; margin: 0; }
.svcp .rv-modal-success .btn { margin-top: 6px; }

/* ============================================================
   BOOKING
============================================================ */
.svcp .book { background: linear-gradient(180deg, var(--bg-grad-a), var(--bg-grad-b)); }
.svcp .book.section-pad { padding-block: clamp(44px, 5.5vw, 78px); }
.svcp .book-split { display: grid; grid-template-columns: 0.82fr 1.18fr; gap: clamp(28px, 4vw, 64px); align-items: center; }
.svcp .book-split .section-head { margin-bottom: 0; }
@media (max-width: 880px) { .svcp .book-split { grid-template-columns: 1fr; gap: 26px; } }
.svcp .book-form {
  background: var(--card); border: 1px solid var(--line); border-radius: var(--radius);
  padding: clamp(22px, 2.4vw, 32px); box-shadow: var(--shadow);
}
.svcp .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 13px; }
.svcp .field { margin-bottom: 13px; }
.svcp .field label {
  display: block; font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em;
  text-transform: uppercase; color: var(--text-dim); margin-bottom: 8px;
}
.svcp .field input, .svcp .field select, .svcp .field textarea {
  width: 100%; background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius-sm); padding: 14px 16px; font-size: 15px; color: var(--text);
  transition: border-color .2s, box-shadow .2s;
}
.svcp .field input::placeholder, .svcp .field textarea::placeholder { color: var(--text-dim); opacity: .7; }
.svcp .field input:focus, .svcp .field select:focus, .svcp .field textarea:focus {
  outline: none; border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.svcp .field textarea { resize: vertical; min-height: 70px; }
.svcp .form-submit { width: 100%; margin-top: 2px; padding: 14px; font-size: 15.5px; }
.svcp .form-foot { margin-top: 13px; font-size: 12.5px; color: var(--text-dim); display: flex; align-items: center; gap: 8px; justify-content: center; }
.svcp .form-foot svg { width: 14px; height: 14px; color: var(--accent); }
@media (max-width: 720px) { .svcp .form-row { grid-template-columns: 1fr; } }

.svcp .form-success { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 14px; min-height: 360px; padding: 30px; }
.svcp .form-success .tick {
  width: 64px; height: 64px; border-radius: 50%; background: var(--accent); color: var(--accent-ink);
  display: grid; place-items: center; animation: svcpPopTick .5s var(--ease);
}
.svcp .form-success .tick svg { width: 30px; height: 30px; }
.svcp .form-success h3 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; font-size: 28px; margin: 0; }
.svcp .form-success p { color: var(--text-mid); max-width: 34ch; margin: 0; }
@keyframes svcpPopTick { 0% { transform: scale(.4); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }

/* ============================================================
   FIND YOUR NEAREST SHOP — full-bleed typographic list
============================================================ */
.svcp .shops { background: var(--bg); padding-block: clamp(60px, 9vw, 130px); overflow: hidden; }
.svcp .shops-head { max-width: 1680px; margin: 0 auto clamp(20px, 3vw, 40px); padding-inline: clamp(20px, 5vw, 80px); }
.svcp .shops-head h2 {
  font-family: var(--font-display); font-weight: 800; text-transform: uppercase;
  font-size: clamp(34px, 5vw, 60px); line-height: .98; letter-spacing: -.02em; margin: 18px 0 0;
}
.svcp .shops-list { max-width: 1680px; margin: 0 auto; padding-inline: clamp(20px, 5vw, 80px); border-top: 2px solid var(--text); }
.svcp .shop-row { border-bottom: 1px solid var(--line); }
.svcp .shop-head {
  display: grid; grid-template-columns: 1fr auto 28px; align-items: center; gap: clamp(16px, 3vw, 48px);
  width: 100%; text-align: left; background: none; cursor: pointer;
  padding: clamp(16px, 2.2vw, 28px) 0; position: relative;
}
.svcp .shop-row.soon .shop-head { cursor: default; grid-template-columns: 1fr auto; }
.svcp .shop-name {
  display: flex; align-items: baseline; gap: clamp(10px, 1.4vw, 20px); min-width: 0;
  font-family: var(--font-display); font-weight: 800; text-transform: uppercase;
  font-size: clamp(38px, 6.2vw, 96px); line-height: .88; letter-spacing: -.035em;
  color: var(--text);
  transition: color .3s var(--ease), transform .35s var(--ease);
}
.svcp .shop-state {
  font-family: var(--font-mono); font-weight: 700; letter-spacing: .12em;
  font-size: clamp(11px, 1vw, 15px); color: var(--text-dim); flex-shrink: 0;
}
.svcp .shop-row.soon .shop-name { color: var(--text-dim); opacity: .42; }
.svcp .shop-status { text-align: right; display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
.svcp .shop-stat { font-weight: 800; font-size: 14px; letter-spacing: .05em; text-transform: uppercase; color: var(--text-dim); }
.svcp .shop-stat.open { color: var(--accent); }
.svcp .shop-note { font-size: 12.5px; color: var(--text-dim); max-width: 32ch; line-height: 1.4; }
.svcp .shop-chev { width: 26px; height: 26px; color: var(--text-dim); justify-self: end; transition: transform .35s var(--ease), color .25s; }
.svcp .shop-row.open .shop-chev { transform: rotate(180deg); color: var(--accent); }
.svcp .shop-row:not(.soon) .shop-head:hover .shop-name { color: var(--accent); transform: translateX(clamp(6px, 1vw, 16px)); }
.svcp .shop-row:not(.soon) .shop-head:hover .shop-chev { color: var(--accent); }
.svcp .shop-row:not(.soon) .shop-head:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; border-radius: 4px; }

.svcp .shop-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .42s var(--ease); }
.svcp .shop-row.open .shop-panel { grid-template-rows: 1fr; }
.svcp .shop-panel > .shop-panel-inner { overflow: hidden; min-height: 0; }
.svcp .shop-panel-pad {
  display: grid; grid-template-columns: 1.15fr .85fr; gap: clamp(20px, 3vw, 52px);
  align-items: center; padding: 4px 0 clamp(26px, 3vw, 40px);
}
.svcp .loc-photo { width: 100%; height: clamp(190px, 24vw, 300px); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; background: var(--surface, #ECEAE3); display: grid; place-items: center; }
.svcp .loc-photo.has-img { background-size: cover; background-position: center; }
.svcp .loc-photo-ph { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; letter-spacing: .01em; color: var(--text-dim); }
.svcp .loc-photo-ph svg { width: 15px; height: 15px; color: var(--accent); }
.svcp .shop-detail { display: flex; flex-direction: column; gap: 18px; }
.svcp .loc-line { display: flex; align-items: flex-start; gap: 10px; font-size: clamp(15px, 1.5vw, 18px); color: var(--text-mid); line-height: 1.45; transition: color .2s; }
.svcp .loc-line:hover { color: var(--text); }
.svcp .loc-line svg { width: 16px; height: 16px; color: var(--accent); flex-shrink: 0; margin-top: 1px; }
.svcp .loc-contacts { display: flex; flex-wrap: wrap; gap: 8px; }
.svcp .loc-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 700; padding: 11px 18px; border-radius: 999px;
  border: 1px solid var(--line-strong); color: var(--text);
  transition: border-color .2s, background .2s, color .2s, transform .2s, filter .2s;
}
.svcp .loc-btn:hover { transform: translateY(-1px); }
.svcp .loc-btn svg { width: 15px; height: 15px; }
.svcp .loc-btn.tel svg { color: var(--accent); }
.svcp .loc-btn.tel:hover { border-color: var(--accent); color: var(--accent); }
.svcp .loc-btn.wa { background: #25D366; color: #06140C; border-color: #25D366; }
.svcp .loc-btn.wa:hover { filter: brightness(1.06); }
.svcp .shops-foot { max-width: 1680px; margin: clamp(22px, 3vw, 36px) auto 0; padding-inline: clamp(20px, 5vw, 80px); font-size: 13.5px; color: var(--text-dim); }

@media (max-width: 760px) {
  .svcp .shop-head { grid-template-columns: 1fr auto; gap: 12px; row-gap: 8px; }
  .svcp .shop-name { grid-column: 1 / -1; }
  .svcp .shop-status { grid-column: 1; text-align: left; align-items: flex-start; flex-direction: row; flex-wrap: wrap; gap: 4px 12px; }
  .svcp .shop-chev { grid-column: 2; grid-row: 2; justify-self: end; align-self: center; }
  .svcp .shop-panel-pad { grid-template-columns: 1fr; }
}

/* ============================================================
   RESPONSIVE (reference breakpoints)
============================================================ */
@media (max-width: 1024px) {
  .svcp .tiers-layout { grid-template-columns: 1fr; }
  .svcp .tier-list { display: grid; grid-template-columns: repeat(2, 1fr); }
  .svcp .why-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 720px) {
  .svcp .free-grid { grid-template-columns: 1fr; }
  .svcp .tier-list { grid-template-columns: 1fr; }
  .svcp .includes { grid-template-columns: 1fr; }
  .svcp .why-grid { grid-template-columns: 1fr; }
  .svcp .detail-interval { text-align: left; }
  .svcp .hero h1 { font-size: clamp(46px, 16vw, 80px); }
}

/* reduced motion (reference parity — global rules also apply) */
@media (prefers-reduced-motion: reduce) {
  .svcp .marquee-track,
  .svcp .brands-track { animation: none !important; }
  .svcp .inc { animation: none; opacity: 1; transform: none; }
}
`
