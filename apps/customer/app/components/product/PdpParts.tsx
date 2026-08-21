'use client'

/* eslint-disable @next/next/no-img-element */
/* Shared building blocks for the product detail page (tyre + wheel), built to
   match the Product design canvas. Plain <img> is used throughout so the
   pdp.css `img` rules size and fit images exactly as the design intended. */

import { useState } from 'react'
import Link from 'next/link'
import { STORES, NOVA_SWITCHBOARD, NOVA_SWITCHBOARD_HREF, waHref } from '../../../lib/stores'

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

export const IcoCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

/* ════════════════════════════════════════════════════════════════════════
   Breadcrumb — plain "Home / Tyres / Brand / Model" trail.
════════════════════════════════════════════════════════════════════════ */
export function Breadcrumb({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav className="pdp-crumb" aria-label="Breadcrumb">
      {trail.map((c, i) => (
        <span key={i}>
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="current">{c.label}</span>}
          {i < trail.length - 1 && <i> / </i>}
        </span>
      ))}
    </nav>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Trust badges — the pill row under the product photo.
════════════════════════════════════════════════════════════════════════ */
export function TrustBadges() {
  return (
    <div className="pdp-trust">
      {['Original stock', 'Manufacturer warranty', 'Fitted same day'].map(t => (
        <span key={t} className="pdp-trust-badge"><IcoCheck />{t}</span>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Accordion — the stack under the buy box. One panel open at a time, with a
   +/− glyph, exactly as the design specifies.
════════════════════════════════════════════════════════════════════════ */
export function Accordion({ items, initial = -1 }: {
  items: { title: string; body: React.ReactNode }[]
  initial?: number
}) {
  const [open, setOpen] = useState(initial)
  return (
    <div className="pdp-acc">
      {items.map((it, i) => (
        <div key={it.title} className={`pdp-acc-item${open === i ? ' open' : ''}`}>
          <button type="button" className="pdp-acc-head" onClick={() => setOpen(open === i ? -1 : i)}>
            {it.title}
            <span className="acc-glyph">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <div className="pdp-acc-panel">{it.body}</div>}
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Accordion panel contents
════════════════════════════════════════════════════════════════════════ */
export function PaymentsPanel() {
  return (
    <>
      <div className="pdp-pays">
        {PAYMENT_LOGOS.map(p => (
          <span key={p.name} className="pdp-pay"><img src={p.src} alt={p.name} /></span>
        ))}
      </div>
      <p className="pdp-note">Pay online or in store — all prices include GST.</p>
    </>
  )
}

export function PickupPanel() {
  return (
    <ul className="pdp-ticks">
      <li>Free pickup at any of our {STORES.length} stores</li>
      <li>Same-day fitting, usually under an hour</li>
      <li>Computerised balancing &amp; new valves included</li>
      <li>Old tyre disposal included</li>
    </ul>
  )
}

export function ExpertPanel({ kind }: { kind: 'tyre' | 'wheel' }) {
  return (
    <>
      <p className="pdp-panel-lead">
        Not sure this is the right {kind}? We&apos;ll check your size and match your driving
        — no obligation.
      </p>
      <div className="pdp-panel-btns">
        <a className="pdp-btn-solid" href={NOVA_SWITCHBOARD_HREF}>Call {NOVA_SWITCHBOARD}</a>
        <a className="pdp-btn-ghost" href={waHref(STORES[0])} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      </div>
      <p className="pdp-note">Mon–Sat 8am–6pm AEST</p>
    </>
  )
}

const FITTING_FEES = [
  { label: 'Passenger car',        price: '$25 per tyre' },
  { label: 'SUV, ute or 4WD',      price: '$30 per tyre' },
  { label: 'Van / light commercial', price: '$35 per tyre' },
  { label: 'Truck',                price: '$50 per tyre' },
]

export function FittingPanel() {
  return (
    <>
      <dl className="pdp-rows">
        {FITTING_FEES.map(f => (
          <div key={f.label}><dt>{f.label}</dt><dd>{f.price}</dd></div>
        ))}
      </dl>
      <p className="pdp-note">
        Includes balancing, new valves &amp; disposal ·{' '}
        <Link href="/#locations">Find your store →</Link>
      </p>
    </>
  )
}

export function ReviewPanel() {
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <>
        <p className="pdp-sent"><IcoCheck />Thanks! Your review has been submitted.</p>
        <p className="pdp-note">It will appear once verified against a purchase.</p>
      </>
    )
  }

  return (
    <>
      <label className="pdp-field">
        <span>Your rating</span>
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          <option value={5}>★★★★★ — Excellent</option>
          <option value={4}>★★★★ — Good</option>
          <option value={3}>★★★ — Okay</option>
          <option value={2}>★★ — Poor</option>
          <option value={1}>★ — Bad</option>
        </select>
      </label>
      <textarea
        className="pdp-textarea"
        rows={3}
        placeholder="How does this product drive? Fitting experience?"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button type="button" className="pdp-btn-solid full" onClick={() => setSent(true)}>
        Submit review
      </button>
    </>
  )
}

/* ════════════════════════════════════════════════════════════════════════
   Similar products grid
════════════════════════════════════════════════════════════════════════ */
export interface SimilarItem { brand: string; sub: string; price: number; slug: string; image: string }

export function SimilarGrid({ title, basePath, items }: {
  title: string
  basePath: 'tyres' | 'wheels'
  items: SimilarItem[]
}) {
  return (
    <section className="pdp-sec">
      <div className="pdp-sec-head">
        <h2>{title}</h2>
        <Link href={`/${basePath}/results`}>View all →</Link>
      </div>
      <div className="similar-grid">
        {items.map((it, i) => (
          <Link key={i} className="similar-card" href={`/${basePath}/${it.slug}`}>
            <span className="sc-photo"><img src={it.image} alt={`${it.brand} ${it.sub}`} /></span>
            <span className="sc-brand">{it.brand}</span>
            <span className="sc-model">{it.sub}</span>
            <span className="sc-price">A${it.price.toFixed(2)}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
