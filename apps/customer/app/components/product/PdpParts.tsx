'use client'

/* eslint-disable @next/next/no-img-element */
/* Shared building blocks for the redesigned product detail page (tyre + wheel).
   Plain <img> is used throughout so the ported pdp.css `img` selectors size and
   fit images exactly as the reference design intended. */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

interface MapStore {
  id: string; name: string; address: string; suburb: string; lat: number; lng: number
}

const StoreMap = dynamic(() => import('../locations/StoreMap'), { ssr: false })

/* Official Nova Tyres social profiles — reused by the footer + review share. */
export const NOVA_SOCIAL = {
  facebook:  'https://www.facebook.com/Novatyres.Official',
  instagram: 'https://www.instagram.com/novatyres/',
}

export const PAYMENT_LOGOS = [
  { name: 'Stripe',     src: '/images/footer/payment-stripe.png' },
  { name: 'VISA',       src: '/images/footer/payment-visa.png' },
  { name: 'Mastercard', src: '/images/footer/payment-mastercard.png' },
  { name: 'Apple Pay',  src: '/images/footer/payment-applepay.png' },
  { name: 'Afterpay',   src: '/images/footer/payment-afterpay.png' },
  { name: 'Klarna',     src: '/images/footer/payment-klarna.png' },
]

/* ── Store phone / WhatsApp directory (from the reference design) ─────────── */
const EXPERT_STORES: Record<string, { label: string; tel: string; disp: string; wa: string }> = {
  springvale: { label: 'Springvale · VIC', tel: '0395624269', disp: '03 9562 4269', wa: '61401531756' },
  bayswater:  { label: 'Bayswater · VIC',  tel: '0397209354', disp: '03 9720 9354', wa: '61411879425' },
  dandenong:  { label: 'Dandenong · VIC',  tel: '0387875846', disp: '03 8787 5846', wa: '61413792400' },
  alphington: { label: 'Alphington · VIC', tel: '0403884151', disp: '0403 884 151', wa: '61403884151' },
  sunshine:   { label: 'Sunshine · VIC',   tel: '0401199224', disp: '0401 199 224', wa: '61401199224' },
  geelong:    { label: 'Geelong · VIC',    tel: '0478698884', disp: '0478 698 884', wa: '61478698884' },
  sefton:     { label: 'Sefton · NSW',     tel: '0403388774', disp: '0403 388 774', wa: '61403388774' },
}

/* ════════════════════════════════════════════════════════════════════════
   Inline SVG icons — ported straight from the reference so the look matches.
════════════════════════════════════════════════════════════════════════ */
const S = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const IcoChevR   = () => <svg viewBox="0 0 24 24" strokeWidth={2.4} {...S}><polyline points="9 18 15 12 9 6" /></svg>
export const IcoChevD   = () => <svg viewBox="0 0 24 24" strokeWidth={2.2} {...S}><polyline points="6 9 12 15 18 9" /></svg>
export const IcoInfo    = () => <svg viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" /></svg>
/* ── Spec-grid icons — line-art matched to the reference design ───────────── */
export const IcoDiameter = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><circle cx="12" cy="12" r="9" /></svg>
export const IcoWidth    = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><path d="M4 12h16M4 12l3-3M4 12l3 3M20 12l-3-3M20 12l-3 3" /></svg>
export const IcoProfile  = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><path d="M12 4v16M12 4l-3 3M12 4l3 3M12 20l-3-3M12 20l3 3" /></svg>
export const IcoRim      = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></svg>
export const IcoPcd      = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
export const IcoOffset   = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><line x1="12" y1="4" x2="12" y2="20" /><polyline points="8 8 12 4 16 8" /></svg>
export const IcoFinish   = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" stroke="none" /></svg>
export const IcoSpeed    = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><path d="M3.5 13a8.5 8.5 0 0 1 17 0" /><path d="M12 13l4.5-3" /><circle cx="12" cy="13" r="1.2" fill="currentColor" stroke="none" /></svg>
export const IcoLoad     = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><path d="M6 9h12l1.6 11H4.4z" /><path d="M9 9a3 3 0 0 1 6 0" /></svg>
export const IcoBore     = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /></svg>

/* ════════════════════════════════════════════════════════════════════════
   ProductSpecs — key attribute strip, reused across product types.
   A horizontal row of tiles; inside each tile the icon, LABEL and value are
   stacked vertically for hierarchy + scannability. Accepts any set of metrics
   (tyres: Width/Profile/Rim/…, wheels: PCD/Offset/Bore/…), any count.
════════════════════════════════════════════════════════════════════════ */
export interface SpecItem { label: string; value: React.ReactNode; icon: React.ReactNode }

export function ProductSpecs({ items }: { items: SpecItem[] }) {
  return (
    <div className="pdp-specs">
      {items.map((s, i) => (
        <div className="pdp-spec" key={i}>
          <span className="sp-ico">{s.icon}</span>
          <span className="sp-label">{s.label}</span>
          <span className="sp-val">{s.value}</span>
        </div>
      ))}
    </div>
  )
}
export const IcoZoom    = () => <svg viewBox="0 0 24 24" strokeWidth={1.9} {...S}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
export const IcoTruck   = () => <svg viewBox="0 0 24 24" strokeWidth={1.8} {...S}><rect x="1" y="3" width="15" height="13" /><path d="M16 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
export const IcoPin     = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
export const IcoShield  = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
export const IcoShieldChk = () => <svg viewBox="0 0 24 24" strokeWidth={1.5} {...S}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
export const IcoHeadset = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
export const IcoLock    = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
export const IcoCheck   = () => <svg viewBox="0 0 24 24" strokeWidth={2.6} {...S}><polyline points="20 6 9 17 4 12" /></svg>
export const IcoMinus   = () => <svg viewBox="0 0 24 24" strokeWidth={2.4} {...S}><line x1="5" y1="12" x2="19" y2="12" /></svg>
export const IcoPlus    = () => <svg viewBox="0 0 24 24" strokeWidth={2.4} {...S}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
export const IcoCart    = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><circle cx="9" cy="21" r="1.5" /><circle cx="18" cy="21" r="1.5" /><path d="M2.5 3h2.2l2.2 12.4a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L21.5 7H6" /></svg>
export const IcoWarehouse = () => <svg viewBox="0 0 24 24" strokeWidth={1.5} {...S}><path d="M3 21h18M5 21V8l7-4 7 4v13" /><path d="M9 21v-6h6v6" /></svg>
export const IcoMic     = () => <svg viewBox="0 0 24 24" strokeWidth={1.5} {...S}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" /></svg>
export const IcoPhone   = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
export const IcoWhatsApp = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.15-1.7-.83-1.96-.92-.26-.1-.45-.14-.64.14-.19.28-.73.92-.9 1.1-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.46-.48-.64-.48l-.54-.01c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.33 0 1.38 1 2.71 1.14 2.9.14.19 1.97 3.01 4.78 4.22.67.29 1.19.46 1.59.59.67.21 1.28.18 1.76.11.54-.08 1.66-.68 1.89-1.33.23-.65.23-1.21.16-1.33-.07-.12-.25-.19-.53-.33zM12 2a10 10 0 0 0-8.55 15.13L2 22l4.97-1.3A10 10 0 1 0 12 2z" /></svg>
export const IcoFacebook = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
export const IcoInstagram = () => <svg viewBox="0 0 24 24" strokeWidth={2} fill="none" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
export const IcoGoogle  = () => (
  <svg viewBox="0 0 48 48" className="rc-g" aria-hidden="true">
    <path fill="#4285F4" d="M45 24c0-1.6-.1-2.8-.4-4H24v7.6h12c-.2 2-1.6 5-4.6 7l7 5.4c4.1-3.8 6.6-9.4 6.6-16z" />
    <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.9-12.5-9.2l-7.2 5.6C7.9 41 15.3 46 24 46z" />
    <path fill="#FBBC05" d="M11.5 28.2c-.5-1.4-.7-2.8-.7-4.2s.3-2.9.7-4.2l-7.2-5.6C2.8 17 2 20.4 2 24s.8 7 2.3 9.8l7.2-5.6z" />
    <path fill="#EA4335" d="M24 10.8c3.3 0 5.5 1.4 6.8 2.6l5.9-5.7C33 4.3 28 2 24 2 15.3 2 7.9 7 4.3 14.2l7.2 5.6C13.3 14.7 18.2 10.8 24 10.8z" />
  </svg>
)

/* ════════════════════════════════════════════════════════════════════════
   Breadcrumb
════════════════════════════════════════════════════════════════════════ */
export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav className="pdp-crumb" aria-label="Breadcrumb">
      {trail.map((c, i) => {
        const last = i === trail.length - 1
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {last ? <b>{c.label}</b> : <Link href={c.href ?? '#'}>{c.label}</Link>}
            {!last && <IcoChevR />}
          </span>
        )
      })}
    </nav>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Accordion (left column, under the gallery)
════════════════════════════════════════════════════════════════════════ */
export function Accordion({ items }: { items: { q: string; points: React.ReactNode[] }[] }) {
  const [open, setOpen] = useState(0)
  return (
    <div className="pdp-acc">
      {items.map((it, i) => (
        <div key={i} className={`pdp-acc-item${open === i ? ' open' : ''}`}>
          <button className="pdp-acc-head" type="button" onClick={() => setOpen(open === i ? -1 : i)}>
            {it.q}
            <span className="acc-chev"><IcoChevD /></span>
          </button>
          <div className="pdp-acc-panel">
            <div>
              <ul>{it.points.map((p, j) => <li key={j}>{p}</li>)}</ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Feature chips + secure-checkout block (shared right-column bits)
════════════════════════════════════════════════════════════════════════ */
export function FeatureChips() {
  const feats = [
    { ico: <IcoTruck />,  label: 'Fast delivery' },
    { ico: <IcoPin />,    label: 'Fit at 9 locations' },
    { ico: <IcoShield />, label: 'Fitment guaranteed' },
    { ico: <IcoHeadset />,label: 'Expert support' },
  ]
  return (
    <div className="pdp-feats">
      {feats.map(f => <span key={f.label} className="pdp-feat">{f.ico}{f.label}</span>)}
    </div>
  )
}

export function SecureCheckout() {
  return (
    <div className="pdp-secure">
      <div className="pdp-secure-head"><IcoLock />Secure checkout</div>
      <div className="pdp-pays">
        {PAYMENT_LOGOS.map(p => (
          <span key={p.name} className="pdp-pay"><img src={p.src} alt={p.name} /></span>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Aside: write-a-review, fitting fees, "talk to an expert" store selector
════════════════════════════════════════════════════════════════════════ */
export function WriteReviewBox() {
  return (
    <div className="pdp-review-box">
      <h4>Write a review</h4>
      <div className="pdp-review-row">
        <span className="pdp-review-input"><input type="text" placeholder="Say something about this product…" /></span>
      </div>
      <div className="pdp-review-row" style={{ marginTop: 18, justifyContent: 'flex-end' }}>
        <span className="pdp-share">Share
          <a href={NOVA_SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><IcoFacebook /></a>
          <a href={NOVA_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><IcoInstagram /></a>
        </span>
      </div>
    </div>
  )
}

export function FittingFeesCard() {
  const fees = [
    { label: 'Passenger car', price: '$25' },
    { label: 'SUV / LT / 4x4', price: '$30' },
    { label: 'Commercial', price: '$35' },
    { label: 'Truck', price: '$50' },
  ]
  return (
    <div className="aside-card">
      <h4 className="aside-title">Fitting at our stores</h4>
      <ul className="aside-fees">
        {fees.map(f => <li key={f.label}><span>{f.label}</span><b>{f.price}</b></li>)}
      </ul>
      <p className="aside-note">Per wheel/tyre, fitted &amp; balanced while you wait — add it at the cart.</p>
    </div>
  )
}

export function ExpertCard({ kind }: { kind: 'tyre' | 'wheel' }) {
  const [store, setStore] = useState<string>('')
  const s = store ? EXPERT_STORES[store] : null
  return (
    <div className="aside-card aside-cta">
      <h4 className="aside-title">Talk to a {kind} expert</h4>
      <p className="aside-note">Confirm fitment for your exact vehicle before you buy — free, no bookings needed. Select your store:</p>
      <div className="aside-select">
        <select value={store} onChange={e => setStore(e.target.value)} aria-label="Choose a store">
          <option value="" disabled>Choose a store…</option>
          {Object.entries(EXPERT_STORES).map(([id, v]) => <option key={id} value={id}>{v.label}</option>)}
        </select>
        <span className="chev"><IcoChevD /></span>
      </div>
      {s && (
        <div className="aside-btns">
          <a className="aside-btn call" href={`tel:${s.tel}`}><IcoPhone />{s.disp}</a>
          <a className="aside-btn wa" href={`https://wa.me/${s.wa}`} target="_blank" rel="noopener noreferrer"><IcoWhatsApp />WhatsApp</a>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Similar products grid
════════════════════════════════════════════════════════════════════════ */
export interface SimilarItem { brand: string; sub: string; price: number; slug: string; image: string }

export function SimilarGrid({ title, basePath, items }: { title: string; basePath: 'tyres' | 'wheels'; items: SimilarItem[] }) {
  return (
    <section className="pdp-sec">
      <h2 className="pdp-sec-title">{title}</h2>
      <div className="similar-grid">
        {items.map((it, i) => (
          <article className="similar-card" key={i}>
            <div className="similar-photo"><img src={it.image} alt={`${it.brand} ${it.sub}`} /></div>
            <div className="sc-brand">{it.brand}</div>
            <div className="sc-model">{it.sub}</div>
            <div className="sc-price">A${it.price.toFixed(2)}</div>
            <div className="sc-acts">
              <Link className="sc-view" href={`/${basePath}/${it.slug}`}>View details</Link>
              <Link className="sc-cart" href={`/${basePath}/${it.slug}`} aria-label="View product"><IcoCart /></Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   "Why choose Nova Tyres?" band
════════════════════════════════════════════════════════════════════════ */
export function WhyBand() {
  const cells = [
    { ico: <IcoWarehouse />, h: 'Warehouse-direct pricing', p: 'The best brands at the best price.' },
    { ico: <IcoMic />,       h: 'Expert support',           p: "We're here to help you choose." },
    { ico: <IcoTruck />,     h: 'Fast & reliable',          p: 'Quick delivery Australia-wide.' },
    { ico: <IcoShieldChk />, h: 'Trusted by 1,240+ drivers',p: 'Rated 4.8 out of 5.' },
  ]
  return (
    <section className="why-band">
      <span className="wb-title">Why choose Nova Tyres?</span>
      {cells.map(c => (
        <div className="wb-cell" key={c.h}>
          <span className="wb-ico">{c.ico}</span>
          <div><h4>{c.h}</h4><p>{c.p}</p></div>
        </div>
      ))}
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Reviews band
════════════════════════════════════════════════════════════════════════ */
export interface ReviewCard { text: string; initials: string; name: string; place: string }

export function ReviewsBand({ avg, count, reviews }: { avg: number; count: string; reviews: ReviewCard[] }) {
  return (
    <section className="rev-band" id="storeReviews">
      <div className="rev-score">
        <div className="rs-num">{avg.toFixed(1)}</div>
        <div className="rs-stars">★★★★★</div>
        <div className="rs-based">Based on {count} reviews</div>
        <a className="rs-btn" href="#">Write a review</a>
      </div>
      <div className="rev-cards">
        {reviews.map((r, i) => (
          <article className="rev-card" key={i}>
            <div className="rc-top"><span className="rc-stars">★★★★★</span><IcoGoogle /></div>
            <p className="rc-txt">&ldquo;{r.text}&rdquo;</p>
            <div className="rc-who">
              <span className="rc-av">{r.initials}</span>
              <div><b>{r.name}</b><span>{r.place}</span></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Locations band — green panel + live interactive store map
════════════════════════════════════════════════════════════════════════ */
export function LocationsBand({ kind }: { kind: 'tyres' | 'wheels' }) {
  const [stores, setStores] = useState<MapStore[]>([])
  const [selected, setSelected] = useState<MapStore | null>(null)

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(data => {
        const mapped: MapStore[] = (data.stores ?? [])
          .filter((s: { latitude?: number; longitude?: number }) => s.latitude && s.longitude)
          .map((s: { id: string; name: string; address: string; suburb: string; state: string; postcode: string; latitude: number; longitude: number }) => ({
            id: s.id, name: s.name, address: s.address,
            suburb: `${s.suburb} ${s.state} ${s.postcode}`, lat: s.latitude, lng: s.longitude,
          }))
        setStores(mapped)
        if (mapped.length) setSelected(mapped[0])
      })
      .catch(() => {})
  }, [])

  return (
    <section className="loc-band">
      <div className="loc-band-inner">
        <div className="loc-copy">
          <span className="loc-kick">Our locations</span>
          <h2>Multiple stores <em>one phone call</em> away for new {kind}.</h2>
          <div className="loc-store-list">
            {stores.slice(0, 4).map(s => (
              <button
                key={s.id}
                type="button"
                className={`loc-store${selected?.id === s.id ? ' active' : ''}`}
                onClick={() => setSelected(s)}
              >
                <b>{s.name}</b>
                <span>{s.address}, {s.suburb}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="loc-map">
          <StoreMap stores={stores} selectedStore={selected} onSelectStore={setSelected} />
        </div>
      </div>
    </section>
  )
}
