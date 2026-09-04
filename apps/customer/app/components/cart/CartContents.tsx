'use client'

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useCart } from '../../context/CartContext'
import {
  VEHICLE_TYPES, fittingRate, computeTotals,
  type VehicleType, type FulfilMethod,
} from '../../../lib/fitting'
import { C, FONT } from '../shop/tokens'
import { NOVA_SWITCHBOARD, NOVA_SWITCHBOARD_HREF } from '../../../lib/stores'

/* Leaflet touches `window` on import — client-only. */
const StoreMap = dynamic(() => import('../locations/StoreMap'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: C.greenSoft }} />,
})

const PAYMENT_LOGOS = [
  { name: 'VISA',       src: '/images/footer/payment-visa.png' },
  { name: 'Mastercard', src: '/images/footer/payment-mastercard.png' },
  { name: 'Apple Pay',  src: '/images/footer/payment-applepay.png' },
  { name: 'Afterpay',   src: '/images/footer/payment-afterpay.png' },
  { name: 'Klarna',     src: '/images/footer/payment-klarna.png' },
  { name: 'Stripe',     src: '/images/footer/payment-stripe.png' },
]

interface StoreData {
  id: string; name: string; slug: string
  address: string; suburb: string; state: string; postcode: string
  latitude: number | null; longitude: number | null
  phone: string | null
  fittingPrices?: Partial<Record<VehicleType, number>>
}

const money = (n: number) => `A$${n.toFixed(2)}`

/* ── icons ─────────────────────────────────────────────────────────────────── */
const S = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const IcoLock = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S} width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>

const VEHICLE_ICONS: Record<VehicleType, React.ReactNode> = {
  passenger:  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...S} width="30" height="30"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v4h2v-2m10 2h2v-4m-2 4v-2" /><circle cx="7.5" cy="15" r="1" /><circle cx="16.5" cy="15" r="1" /></svg>,
  suv:        <svg viewBox="0 0 24 24" strokeWidth={1.6} {...S} width="30" height="30"><path d="M3 13l1-4a2 2 0 0 1 2-1.5h11a2 2 0 0 1 1.7 1L21 13m-18 0h18m-18 0v4h2v-2m14 2h2v-4M8 8v5" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></svg>,
  commercial: <svg viewBox="0 0 24 24" strokeWidth={1.6} {...S} width="30" height="30"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><circle cx="7" cy="17" r="1.4" /><circle cx="17" cy="17" r="1.4" /></svg>,
  truck:      <svg viewBox="0 0 24 24" strokeWidth={1.6} {...S} width="30" height="30"><path d="M2 5h13v11H2zM15 8h4l3 4v4h-7z" /><circle cx="6" cy="18" r="1.4" /><circle cx="18" cy="18" r="1.4" /></svg>,
}

/* Brand mark with a wordmark fallback when artwork is missing or 404s. */
function Brand({ src, brand }: { src: string; brand: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) {
    return <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '.8px', textTransform: 'uppercase', color: C.ink3 }}>{brand}</span>
  }
  return <img src={src} alt={brand} onError={() => setErr(true)} style={{ height: '14px', display: 'block', marginBottom: '3px' }} />
}

/* Numbered card header — the design's three-step spine. */
function StepHead({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: sub ? '4px' : '14px' }}>
        <span style={{ flex: 'none', width: '28px', height: '28px', borderRadius: '50%', background: C.green, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13.5px', fontWeight: 800 }}>
          {n}
        </span>
        <span style={{ fontSize: '17px', fontWeight: 800, color: C.ink }}>{title}</span>
      </div>
      {sub && <p style={{ fontSize: '13.5px', color: C.muted2, margin: '0 0 14px 40px' }}>{sub}</p>}
    </>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#fff', border: `1px solid ${C.line}`, borderRadius: '10px', padding: '18px',
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function CartContents() {
  const { items, updateQty, removeItem, cartCount, cartTotal } = useCart()

  const [method,        setMethod]        = useState<FulfilMethod>('fit')
  const [vehicleType,   setVehicleType]   = useState<VehicleType>('passenger')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [stores,        setStores]        = useState<StoreData[]>([])
  const [storesLoading, setStoresLoading] = useState(true)
  const [fitCount,      setFitCount]      = useState<number | null>(null) // null = fit all

  /* How many tyres/wheels to fit now; the rest go home. Clamped to the cart. */
  const fitQty   = fitCount === null ? cartCount : Math.max(0, Math.min(fitCount, cartCount))
  const takeHome = cartCount - fitQty

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => setStores(d.stores ?? []))
      .catch(() => {})
      .finally(() => setStoresLoading(false))
  }, [])

  /* Persist the fitting choice so /checkout can charge the right total server-side. */
  useEffect(() => {
    try {
      localStorage.setItem('nova_fitting', JSON.stringify({ method, vehicleType, storeId: selectedStore, fitCount: fitQty }))
    } catch {}
  }, [method, vehicleType, selectedStore, fitQty])

  function handleStoreSelect(store: StoreData) {
    setSelectedStore(store.id)
    try {
      localStorage.setItem('nova_selected_store', JSON.stringify({
        id: store.id, name: store.name, address: store.address, suburb: store.suburb,
        state: store.state, postcode: store.postcode, phone: store.phone ?? '',
      }))
    } catch {}
  }

  /* Use the chosen store's rates when a store is selected, else app-wide defaults. */
  const active     = stores.find(s => s.id === selectedStore) ?? null
  const storePrices = active?.fittingPrices ?? null
  const rate = fittingRate(vehicleType, storePrices)
  const totals = useMemo(
    () => computeTotals({ subtotal: cartTotal, itemCount: fitQty, fittingRate: rate, fit: method === 'fit' }),
    [cartTotal, fitQty, rate, method],
  )

  const isFit = method === 'fit'

  /* Only stores with real coordinates can be pinned. */
  const mappable = stores
    .filter(s => s.latitude != null && s.longitude != null)
    .map(s => ({
      id: s.id, name: s.name, address: s.address,
      suburb: `${s.suburb} ${s.state} ${s.postcode}`,
      lat: s.latitude as number, lng: s.longitude as number,
    }))
  const mapSelected = mappable.find(m => m.id === selectedStore) ?? null

  const choiceCard = (on: boolean): React.CSSProperties => ({
    textAlign: 'left', background: on ? C.greenSoft : '#fff',
    border: `2px solid ${on ? C.green : C.line}`, borderRadius: '10px',
    padding: '16px', cursor: 'pointer', fontFamily: FONT,
  })

  const radio = (on: boolean): React.CSSProperties => ({
    flex: 'none', width: '20px', height: '20px', borderRadius: '50%',
    background: on ? C.green : '#fff', border: `2px solid ${on ? C.green : C.line3}`,
    color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  })

  return (
    <main style={{ fontFamily: FONT, background: '#fff' }}>
      <style>{`
        .ct-layout { display: flex; gap: 22px; flex-wrap: wrap; align-items: flex-start; }
        /* grid-template-columns: minmax(0,1fr) — without it a grid item's
           implicit min-width is its min-content, which lets a cart row's
           unbreakable content (icon + text + remove button) force this
           column wider than its own container on the narrowest phones. */
        .ct-main   { flex: 1.9; min-width: min(400px,100%); display: grid; grid-template-columns: minmax(0,1fr); gap: 16px; }
        .ct-aside  { flex: 1; min-width: min(320px,100%); }
        .ct-methods{ display: grid; grid-template-columns: repeat(auto-fit,minmax(270px,1fr)); gap: 12px; }
        .ct-veh    { display: grid; grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); gap: 10px; }
        .ct-store-layout { display: grid; grid-template-columns: 1.15fr 1fr; gap: 12px; }
        @media (max-width: 900px) { .ct-store-layout { grid-template-columns: 1fr; } }
        .ct-qty-btn:hover { background: ${C.wash}; }
        .ct-cta:hover { background: ${C.orangeDark}; }
        .ct-rm:hover { color: ${C.orangeDark}; }
      `}</style>

      <section style={{ padding: 'clamp(20px,3vw,36px) clamp(16px,3vw,64px) clamp(40px,5vw,64px)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          <h1 style={{ font: `800 clamp(28px,3.2vw,40px) ${FONT}`, color: C.ink, margin: 0 }}>Your Cart</h1>
          <p style={{ fontSize: '14.5px', color: C.muted, margin: '6px 0 22px' }}>
            Three quick steps: check your tyres, choose fitting or pickup, pick your store. Stuck? Call{' '}
            <a href={NOVA_SWITCHBOARD_HREF} style={{ fontWeight: 700, color: C.green }}>{NOVA_SWITCHBOARD}</a> — we&apos;ll do it with you.
          </p>

          <div className="ct-layout">
            {/* ════════ MAIN ════════ */}
            <div className="ct-main">

              {/* ── 1. Items ── */}
              <div style={cardStyle}>
                <StepHead n={1} title="Your tyres &amp; wheels" />

                {items.length === 0 ? (
                  <p style={{ fontSize: '14.5px', color: C.muted, margin: 0 }}>
                    Your cart is empty. <Link href="/tyres/results" style={{ fontWeight: 700, color: C.green }}>Shop tyres</Link>
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: '14px' }}>
                    {items.map(it => (
                      <div key={it.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', borderTop: `1px solid ${C.line2}`, paddingTop: '14px' }}>
                        <Link href={`/${it.productType === 'tyre' ? 'tyres' : 'wheels'}/${it.id}`}
                          style={{ width: '92px', height: '92px', flex: 'none', border: `1px solid #F2F2F0`, borderRadius: '8px', padding: '6px', boxSizing: 'border-box' }}>
                          <img src={it.image} alt={it.model} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </Link>

                        <div style={{ flex: 1, minWidth: '180px' }}>
                          <Brand src={it.brandLogo} brand={it.brand} />
                          <Link href={`/${it.productType === 'tyre' ? 'tyres' : 'wheels'}/${it.id}`}
                            style={{ fontSize: '16.5px', fontWeight: 700, color: C.ink, textDecoration: 'none' }}>
                            {it.model}
                          </Link>
                          <div style={{ fontSize: '13px', color: C.muted, marginTop: '3px' }}>
                            Size {it.size}{it.spec ? ` · ${it.spec}` : ''}
                          </div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: C.ink, marginTop: '3px' }}>
                            {money(it.price)} each
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid #DBDBD7`, borderRadius: '999px', overflow: 'hidden', background: '#fff' }}>
                            <button type="button" className="ct-qty-btn" aria-label="One less" onClick={() => updateQty(it.id, -1)} disabled={it.qty <= 1}
                              style={{ width: '42px', height: '42px', background: '#fff', border: 'none', fontSize: '18px', fontWeight: 700, color: C.ink, cursor: it.qty <= 1 ? 'not-allowed' : 'pointer', opacity: it.qty <= 1 ? 0.4 : 1 }}>−</button>
                            <span style={{ width: '46px', textAlign: 'center', fontSize: '16px', fontWeight: 800, color: C.ink }}>{it.qty}</span>
                            <button type="button" className="ct-qty-btn" aria-label="One more" onClick={() => updateQty(it.id, +1)}
                              style={{ width: '42px', height: '42px', background: '#fff', border: 'none', fontSize: '18px', fontWeight: 700, color: C.ink, cursor: 'pointer' }}>+</button>
                          </div>
                          <span style={{ fontSize: '12px', color: C.muted2 }}>Most cars need a set of 4</span>
                        </div>

                        <div style={{ width: '96px', textAlign: 'right', font: `800 20px ${FONT}`, color: C.ink }}>
                          {money(it.price * it.qty)}
                        </div>

                        <button type="button" title="Remove from cart" aria-label={`Remove ${it.model}`} className="ct-rm"
                          onClick={() => removeItem(it.id)}
                          style={{ background: 'none', border: 'none', fontSize: '17px', color: '#B5B3AC', cursor: 'pointer' }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── 2. Fulfilment ── */}
              <div style={cardStyle}>
                <StepHead n={2} title="How would you like them?" sub="Either way, you pay nothing extra to collect." />

                <div className="ct-methods">
                  <button type="button" onClick={() => setMethod('fit')} style={choiceCard(isFit)}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15.5px', fontWeight: 800, color: C.ink }}>
                        Fit them on my car
                        <span style={{ background: C.green, color: '#fff', borderRadius: '999px', padding: '3px 9px', fontSize: '10.5px', fontWeight: 800, letterSpacing: '.5px', marginLeft: '6px' }}>RECOMMENDED</span>
                      </span>
                      <span style={radio(isFit)}>{isFit ? '✓' : ''}</span>
                    </span>
                    <span style={{ display: 'block', fontSize: '13.5px', lineHeight: 1.5, color: C.muted, marginTop: '6px' }}>
                      Drive in, we do everything — fitting, balancing and new valves. About an hour.
                    </span>
                    <span style={{ display: 'inline-block', marginTop: '10px', fontSize: '13px', fontWeight: 800, color: C.green }}>
                      + {money(rate)} per tyre
                    </span>
                  </button>

                  <button type="button" onClick={() => setMethod('pickup')} style={choiceCard(!isFit)}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15.5px', fontWeight: 800, color: C.ink }}>Just pick them up</span>
                      <span style={radio(!isFit)}>{!isFit ? '✓' : ''}</span>
                    </span>
                    <span style={{ display: 'block', fontSize: '13.5px', lineHeight: 1.5, color: C.muted, marginTop: '6px' }}>
                      Collect from a store and take them home. Your mechanic can fit them later.
                    </span>
                    <span style={{ display: 'inline-block', marginTop: '10px', background: C.greenSoft, borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 800, color: C.green }}>
                      No fitting fee
                    </span>
                  </button>
                </div>

                {isFit && (
                  <div style={{ background: C.greenSoft, borderRadius: '8px', padding: '14px', marginTop: '12px' }}>
                    {/* What do you drive — our vehicle cards, in the design's green
                        panel. Cards rather than the mocked dropdown: they show the
                        per-type price up front and stay tappable on mobile. */}
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: C.ink, marginBottom: '10px' }}>What do you drive?</div>

                    <div className="ct-veh">
                      {VEHICLE_TYPES.map(v => {
                        const on = vehicleType === v.id
                        return (
                          <button
                            key={v.id} type="button" onClick={() => setVehicleType(v.id)}
                            aria-pressed={on}
                            style={{
                              textAlign: 'left', background: on ? '#fff' : 'rgba(255,255,255,.55)',
                              border: `2px solid ${on ? C.green : C.greenLine}`, borderRadius: '8px',
                              padding: '12px', cursor: 'pointer', fontFamily: FONT,
                              display: 'flex', flexDirection: 'column', gap: '6px',
                              boxShadow: on ? '0 6px 14px -10px rgba(7,99,48,.7)' : 'none',
                              transition: 'border-color .18s ease, background .18s ease',
                            }}
                          >
                            <span style={{ color: on ? C.green : C.ink3, display: 'flex' }}>{VEHICLE_ICONS[v.id]}</span>
                            <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13.5px', fontWeight: 800, color: C.ink }}>{v.label}</span>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: C.green }}>
                                ${fittingRate(v.id, storePrices)}
                              </span>
                            </span>
                            <span style={{ fontSize: '11.5px', lineHeight: 1.4, color: C.muted2 }}>{v.desc}</span>
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ fontSize: '13.5px', color: '#4E6B58', marginTop: '10px' }}>
                      Not sure? Pick the closest — we&apos;ll confirm at the store, never charge more without asking.
                    </div>

                    {/* How many to fit vs take home */}
                    {cartCount > 0 && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', background: '#fff', border: `1px solid ${C.greenLine}`, borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                        <div style={{ minWidth: '200px', flex: 1 }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: C.ink }}>How many do you want fitted?</div>
                          <div style={{ fontSize: '12.5px', color: C.muted2, marginTop: '2px' }}>
                            {fitQty} fitted{takeHome > 0 ? ` · ${takeHome} taken home, no fee` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid #DBDBD7`, borderRadius: '999px', overflow: 'hidden', background: '#fff' }}>
                          <button type="button" className="ct-qty-btn" aria-label="Fit fewer" onClick={() => setFitCount(Math.max(0, fitQty - 1))} disabled={fitQty <= 0}
                            style={{ width: '38px', height: '38px', background: '#fff', border: 'none', fontSize: '17px', fontWeight: 700, color: C.ink, cursor: fitQty <= 0 ? 'not-allowed' : 'pointer', opacity: fitQty <= 0 ? 0.4 : 1 }}>−</button>
                          <span style={{ width: '42px', textAlign: 'center', fontSize: '15px', fontWeight: 800, color: C.ink }}>{fitQty}</span>
                          <button type="button" className="ct-qty-btn" aria-label="Fit more" onClick={() => setFitCount(Math.min(cartCount, fitQty + 1))} disabled={fitQty >= cartCount}
                            style={{ width: '38px', height: '38px', background: '#fff', border: 'none', fontSize: '17px', fontWeight: 700, color: C.ink, cursor: fitQty >= cartCount ? 'not-allowed' : 'pointer', opacity: fitQty >= cartCount ? 0.4 : 1 }}>+</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 3. Store ── */}
              <div style={cardStyle}>
                <StepHead
                  n={3}
                  title={isFit ? 'Where should we fit them?' : 'Where will you collect them?'}
                  sub={isFit ? 'Pick the store that suits you — tap a pin or a name.' : 'Pick a store and we’ll let you know when your order is ready.'}
                />

                <div className="ct-store-layout">
                  <div style={{ borderRadius: '8px', overflow: 'hidden', background: C.greenSoft, minHeight: '300px' }}>
                    {mappable.length > 0 ? (
                      <StoreMap
                        stores={mappable}
                        selectedStore={mapSelected}
                        onSelectStore={m => {
                          const full = stores.find(s => s.id === m.id)
                          if (full) handleStoreSelect(full)
                        }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', fontSize: '13px', color: C.muted }}>
                        {storesLoading ? 'Loading map…' : 'Map unavailable'}
                      </div>
                    )}
                  </div>

                  <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'grid', gap: '8px', alignContent: 'start', paddingRight: '2px' }}>
                    {storesLoading ? (
                      <p style={{ fontSize: '13px', color: C.muted, padding: '10px 2px' }}>Loading stores…</p>
                    ) : stores.length === 0 ? (
                      <p style={{ fontSize: '13px', color: C.muted, padding: '10px 2px' }}>No stores available.</p>
                    ) : stores.map(s => {
                      const on = selectedStore === s.id
                      return (
                        <button key={s.id} type="button" onClick={() => handleStoreSelect(s)}
                          style={{
                            textAlign: 'left', display: 'flex', gap: '10px', alignItems: 'center',
                            background: on ? C.greenSoft : '#fff',
                            border: `2px solid ${on ? C.green : C.line}`,
                            borderRadius: '8px', padding: '12px', cursor: 'pointer', fontFamily: FONT,
                          }}
                        >
                          <span style={{ flex: 'none', width: '18px', height: '18px', borderRadius: '50%', background: on ? C.green : '#fff', border: `2px solid ${on ? C.green : C.line3}`, color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {on ? '✓' : ''}
                          </span>
                          <span style={{ flex: 1 }}>
                            <span style={{ display: 'block', fontSize: '14.5px', fontWeight: 800, color: C.ink }}>
                              {s.name}
                              <span style={{ fontSize: '10.5px', fontWeight: 800, color: C.green, marginLeft: '6px' }}>{s.state}</span>
                            </span>
                            <span style={{ display: 'block', fontSize: '12.5px', color: C.muted2 }}>{s.address}, {s.suburb}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <Link href="/tyres/results" style={{ fontSize: '14px', fontWeight: 700, color: C.green, textDecoration: 'none' }}>
                ← Keep shopping
              </Link>
            </div>

            {/* ════════ SUMMARY ════════ */}
            <aside className="ct-aside">
              <div style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: '10px', padding: '20px' }}>
                <h2 style={{ font: `800 20px ${FONT}`, color: C.ink, margin: '0 0 14px' }}>Order Summary</h2>

                <div style={{ display: 'grid', gap: '10px', fontSize: '14.5px', color: C.ink2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <span>Products ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                    <strong>{money(totals.subtotal)}</strong>
                  </div>
                  {isFit ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span>Fitting ({fitQty} × {money(rate)})</span>
                      <strong>{money(totals.fitting)}</strong>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span>Pickup{active ? ` at ${active.name}` : ''}</span>
                      <strong style={{ color: C.green }}>Free</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: `1.5px solid ${C.line2}`, marginTop: '14px', paddingTop: '14px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: C.ink }}>Total</span>
                  <span style={{ font: `800 30px ${FONT}`, color: C.green }}>{money(totals.total)}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: C.muted2, marginTop: '4px', textAlign: 'right' }}>GST included</div>

                <div style={{ background: C.wash, borderRadius: '8px', padding: '12px', marginTop: '12px', fontSize: '13px', color: C.ink3, lineHeight: 1.55 }}>
                  {active
                    ? <><strong style={{ color: C.ink }}>{active.name}</strong> — {isFit ? `fitting ${fitQty} of ${cartCount}, about an hour.` : 'ready for collection once we confirm.'}</>
                    : <>Pick a store above to confirm {isFit ? 'fitting' : 'collection'}.</>}
                </div>

                <Link href="/checkout" className="ct-cta"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box', width: '100%', marginTop: '14px', background: C.orange, borderRadius: '999px', padding: '15px', font: `800 15px ${FONT}`, letterSpacing: '.5px', textTransform: 'uppercase', color: '#fff', textDecoration: 'none' }}>
                  <IcoLock />Checkout Securely
                </Link>

                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: C.muted }}>
                  No account needed — check out as a guest, or{' '}
                  <Link href="/login" style={{ fontWeight: 800, color: C.green }}>sign in</Link> for faster checkout.
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {PAYMENT_LOGOS.map(p => (
                    <span key={p.name} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: '4px', padding: '4px 9px', display: 'inline-flex' }}>
                      <img src={p.src} alt={p.name} style={{ height: '13px', width: 'auto', objectFit: 'contain' }} />
                    </span>
                  ))}
                </div>

                <div style={{ borderTop: `1px solid ${C.line2}`, marginTop: '14px', paddingTop: '12px', fontSize: '13px', color: C.muted, lineHeight: 1.6, textAlign: 'center' }}>
                  Prefer a human? <a href={NOVA_SWITCHBOARD_HREF} style={{ fontWeight: 800, color: C.green }}>Call {NOVA_SWITCHBOARD}</a> and
                  we&apos;ll place the order for you — pay when you come in.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
