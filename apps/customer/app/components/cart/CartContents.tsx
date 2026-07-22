'use client'

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useCart } from '../../context/CartContext'
import {
  VEHICLE_TYPES, fittingRate, computeTotals,
  type VehicleType, type FulfilMethod,
} from '../../../lib/fitting'
import './cart.css'

const PAYMENT_LOGOS = [
  { name: 'Stripe',     src: '/images/footer/payment-stripe.png' },
  { name: 'VISA',       src: '/images/footer/payment-visa.png' },
  { name: 'Mastercard', src: '/images/footer/payment-mastercard.png' },
  { name: 'Apple Pay',  src: '/images/footer/payment-applepay.png' },
  { name: 'Afterpay',   src: '/images/footer/payment-afterpay.png' },
  { name: 'Klarna',     src: '/images/footer/payment-klarna.png' },
]

type StoreData = {
  id: string; name: string; address: string; suburb: string; state: string; postcode: string; phone: string | null
  fittingPrices?: Partial<Record<VehicleType, number>>
}

const money = (n: number) => `$${n.toFixed(2)}`

/* ── inline icons (match the reference design) ─────────────────────────────── */
const S = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const IcoTrash  = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
const IcoMinus  = () => <svg viewBox="0 0 24 24" strokeWidth={2.4} {...S}><line x1="5" y1="12" x2="19" y2="12" /></svg>
const IcoPlus   = () => <svg viewBox="0 0 24 24" strokeWidth={2.4} {...S}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
const IcoCheck  = () => <svg viewBox="0 0 24 24" strokeWidth={3.2} {...S}><polyline points="20 6 9 17 4 12" /></svg>
const IcoTool   = () => <svg viewBox="0 0 24 24" strokeWidth={1.7} {...S}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-6 6a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l6-6a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z" /></svg>
const IcoBag    = () => <svg viewBox="0 0 24 24" strokeWidth={1.7} {...S}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
const IcoPin    = () => <svg viewBox="0 0 24 24" strokeWidth={1.9} {...S}><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
const IcoSend   = () => <svg viewBox="0 0 24 24" strokeWidth={1.9} {...S}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
const IcoLock   = () => <svg viewBox="0 0 24 24" strokeWidth={2} {...S}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
const IcoClock  = () => <svg viewBox="0 0 24 24" strokeWidth={1.7} {...S}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
const IcoList   = () => <svg viewBox="0 0 24 24" strokeWidth={1.7} {...S}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
const IcoTarget = () => <svg viewBox="0 0 24 24" strokeWidth={1.7} {...S}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.2" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></svg>
const IcoShieldPin = () => <svg viewBox="0 0 24 24" strokeWidth={1.7} {...S}><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" /><path d="M9 10l2 2 4-4" /></svg>
const IcoHeadset = () => <svg viewBox="0 0 24 24" {...S}><path d="M3 12a9 9 0 0 1 18 0" /><path d="M3 12v4a2 2 0 0 0 2 2h1v-6H4M21 12v4a2 2 0 0 1-2 2h-1v-6h2" /></svg>
const IcoTruck  = () => <svg viewBox="0 0 24 24" {...S}><path d="M1 3h13v13H1zM14 8h4l3 3v5h-7z" /><circle cx="6" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>
const IcoExpert = () => <svg viewBox="0 0 24 24" {...S}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>

const VEHICLE_ICONS: Record<VehicleType, React.ReactNode> = {
  passenger:  <svg viewBox="0 0 24 24" strokeWidth={1.6} {...S}><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v4h2v-2m10 2h2v-4m-2 4v-2" /><circle cx="7.5" cy="15" r="1" /><circle cx="16.5" cy="15" r="1" /></svg>,
  suv:        <svg viewBox="0 0 24 24" strokeWidth={1.6} {...S}><path d="M3 13l1-4a2 2 0 0 1 2-1.5h11a2 2 0 0 1 1.7 1L21 13m-18 0h18m-18 0v4h2v-2m14 2h2v-4M8 8v5" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></svg>,
  commercial: <svg viewBox="0 0 24 24" strokeWidth={1.6} {...S}><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><circle cx="7" cy="17" r="1.4" /><circle cx="17" cy="17" r="1.4" /></svg>,
  truck:      <svg viewBox="0 0 24 24" strokeWidth={1.6} {...S}><path d="M2 5h13v11H2zM15 8h4l3 4v4h-7z" /><circle cx="6" cy="18" r="1.4" /><circle cx="18" cy="18" r="1.4" /></svg>,
}

/* ── brand logo with text fallback ─────────────────────────────────────────── */
function Brand({ src, brand }: { src: string; brand: string }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <span className="brand-tag">{brand}</span>
  return <img className="brand-logo" src={src} alt={brand} onError={() => setErr(true)} />
}

/* ════════════════════════════════════════════════════════════════════════════ */
export default function CartContents() {
  const { items, updateQty, removeItem, cartCount, cartTotal } = useCart()

  const [method,        setMethod]        = useState<FulfilMethod>('fit')
  const [vehicleType,   setVehicleType]   = useState<VehicleType>('passenger')
  const [postcode,      setPostcode]      = useState('')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [stores,        setStores]        = useState<StoreData[]>([])
  const [storesLoading, setStoresLoading] = useState(true)

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
      localStorage.setItem('nova_fitting', JSON.stringify({ method, vehicleType, storeId: selectedStore }))
    } catch {}
  }, [method, vehicleType, selectedStore])

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
  const storePrices = stores.find(s => s.id === selectedStore)?.fittingPrices ?? null
  const rate = fittingRate(vehicleType, storePrices)
  const totals = useMemo(
    () => computeTotals({ subtotal: cartTotal, itemCount: cartCount, fittingRate: rate, fit: method === 'fit' }),
    [cartTotal, cartCount, rate, method],
  )

  const stationList = (
    <div className="station-list">
      {storesLoading
        ? <p style={{ fontSize: 13, color: 'var(--text-dim)', padding: '10px 2px' }}>Loading stores…</p>
        : stores.length === 0
          ? <p style={{ fontSize: 13, color: 'var(--text-dim)', padding: '10px 2px' }}>No stores available.</p>
          : stores.map(s => (
            <button
              key={s.id}
              type="button"
              className={`station-item${selectedStore === s.id ? ' active' : ''}`}
              onClick={() => handleStoreSelect(s)}
            >
              <span className="st-pin"><IcoPin /></span>
              <span className="st-body">
                <span className="st-name">{s.name}</span>
                <span className="st-addr"><IcoPin />{s.address}, {s.suburb} {s.state} {s.postcode}</span>
              </span>
              <span className="st-radio" />
            </button>
          ))}
    </div>
  )

  const mapEmbed = (
    <div className="picker-map">
      <iframe
        title="Nova Tyres store locations"
        src="https://www.openstreetmap.org/export/embed.html?bbox=144.5,-38.3,151.3,-33.7&layer=mapnik"
        loading="lazy"
      />
    </div>
  )

  return (
    <main className="nova-cart" style={{ paddingTop: 64 }}>
      <div className="cart-page">
        <div className="nv-shell">

          <div className="cart-title">
            <h1>Your cart</h1>
            <span>({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          </div>

          <div className="cart-grid">
            {/* ════════ LEFT ════════ */}
            <div className="cart-left">

              {/* cart items */}
              {items.length === 0 ? (
                <div className="cart-empty">
                  <svg viewBox="0 0 24 24" {...S} strokeWidth={1.6}><circle cx="9" cy="21" r="1.5" /><circle cx="18" cy="21" r="1.5" /><path d="M2.5 3h2.2l2.2 12.4a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.3L21.5 7H6" /></svg>
                  Your cart is empty. <Link href="/tyres/results">Shop tyres</Link>
                </div>
              ) : (
                <div className="cart-items">
                  {items.map(it => (
                    <div className="cart-item" key={it.id}>
                      <span className="ci-thumb"><img src={it.image} alt={it.model} /></span>
                      <div className="ci-info">
                        <div className="ci-brand"><Brand src={it.brandLogo} brand={it.brand} /></div>
                        <div className="ci-name">{it.model}</div>
                        <div className="ci-spec">{it.size}{it.spec ? ` · ${it.spec}` : ''}</div>
                        <button className="ci-remove" type="button" onClick={() => removeItem(it.id)}><IcoTrash />Remove</button>
                      </div>
                      <div className="ci-price"><b>A${it.price.toFixed(2)}</b><small>each</small></div>
                      <div className="qty">
                        <button type="button" aria-label="Decrease" onClick={() => updateQty(it.id, -1)} disabled={it.qty <= 1}><IcoMinus /></button>
                        <span>{it.qty}</span>
                        <button type="button" aria-label="Increase" onClick={() => updateQty(it.id, +1)}><IcoPlus /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* fulfilment choice */}
              <div className="block">
                <div className="block-head">
                  <h2>How would you like to get them?</h2>
                  <p>Collect your tyres &amp; wheels yourself, or have us fit and balance them at one of our stores.</p>
                </div>
                <div className="fulfil-opts">
                  <button type="button" className={`fulfil-card${method === 'fit' ? ' active' : ''}`} onClick={() => setMethod('fit')}>
                    <span className="fc-check"><IcoCheck /></span>
                    <span className="fc-ico"><IcoTool /></span>
                    <span className="fc-body">
                      <h3>Fit at a Nova store</h3>
                      <p>We professionally fit &amp; balance at your chosen workshop while you wait.</p>
                      <span className="fc-fee">+ {money(rate)} per tyre/wheel fitting</span>
                    </span>
                  </button>
                  <button type="button" className={`fulfil-card${method === 'pickup' ? ' active' : ''}`} onClick={() => setMethod('pickup')}>
                    <span className="fc-check"><IcoCheck /></span>
                    <span className="fc-ico"><IcoBag /></span>
                    <span className="fc-body">
                      <h3>Pick up in-store</h3>
                      <p>Collect from any Nova Tyres store — ready when you are, no fitting fee.</p>
                      <span className="fc-fee">No fitting fee</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* fitting flow */}
              <div className="flow" hidden={method !== 'fit'}>
                <div className="flow-step">
                  <div className="flow-marker"><span className="flow-num">1</span><span className="flow-line" /></div>
                  <div className="flow-body">
                    <h3>Select your vehicle type</h3>
                    <p>Fitting price depends on your vehicle category.</p>
                    <div className="veh-grid">
                      {VEHICLE_TYPES.map(v => (
                        <button key={v.id} type="button" className={`veh-card${vehicleType === v.id ? ' active' : ''}`} onClick={() => setVehicleType(v.id)}>
                          {VEHICLE_ICONS[v.id]}
                          <b>{v.label}<span className="veh-fee">{money(fittingRate(v.id, storePrices))}</span></b>
                          <small>{v.desc}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flow-step">
                  <div className="flow-marker"><span className="flow-num">2</span><span className="flow-line" /></div>
                  <div className="flow-body">
                    <h3>Fitting station near you</h3>
                    <p>We&apos;ll show the nearest fitting station based on your location.</p>
                    <div className="loc-row">
                      <span className="loc-input"><IcoPin /><input type="text" value={postcode} onChange={e => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="0000" inputMode="numeric" maxLength={4} /></span>
                      <span className="loc-or">Or</span>
                      <button type="button" className="loc-btn-geo"><IcoSend />Use my location</button>
                    </div>
                  </div>
                </div>

                <div className="flow-step">
                  <div className="flow-marker"><span className="flow-num">3</span></div>
                  <div className="flow-body">
                    <h3>Choose a fitting station</h3>
                    <p>Select where you&apos;d like your tyres &amp; wheels fitted.</p>
                    <div className="picker"><div className="picker-layout">{mapEmbed}{stationList}</div></div>
                  </div>
                </div>
              </div>

              {/* pickup flow */}
              <div className="flow" hidden={method !== 'pickup'}>
                <div className="flow-step">
                  <div className="flow-marker"><span className="flow-num">1</span></div>
                  <div className="flow-body">
                    <h3>Choose a pickup store</h3>
                    <p>Select the store you&apos;d like to collect your order from — we&apos;ll notify you when it&apos;s ready.</p>
                    <div className="picker"><div className="picker-layout">{mapEmbed}{stationList}</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ════════ RIGHT ════════ */}
            <aside className="summary">
              <div className="summary-card">
                <h2>Order Summary</h2>
                <div className="sum-row">
                  <span className="sr-label">Products <small>({cartCount} {cartCount === 1 ? 'item' : 'items'})</small></span>
                  <span className="sr-val">{money(totals.subtotal)}</span>
                </div>
                <div className="sum-row">
                  <span className="sr-label">GST <small>(10%)</small></span>
                  <span className="sr-val">{money(totals.gst)}</span>
                </div>
                {method === 'fit' && (
                  <div className="sum-row">
                    <span className="sr-label">Fitting service price <small>({cartCount} × {money(rate)})</small></span>
                    <span className="sr-val">{money(totals.fitting)}</span>
                  </div>
                )}
                <div className="sum-divider" />
                <div className="sum-total">
                  <span className="st-label"><b>Total</b><small>GST included</small></span>
                  <span className="st-amt">{money(totals.total)}</span>
                </div>

                <Link className="checkout-btn" href="/checkout"><IcoLock />Proceed to checkout</Link>

                <div className="secure">
                  <span className="secure-label">🔒 Secured checkout</span>
                  <div className="pay-row">
                    {PAYMENT_LOGOS.map(p => <span key={p.name} className="pay-badge"><img src={p.src} alt={p.name} /></span>)}
                  </div>
                </div>
              </div>

              {method === 'fit' && (
                <div className="info-card">
                  <span className="ic-ico"><IcoClock /></span>
                  <div><h4>Estimated fitting time <em>45–60min</em></h4><p>Time may vary by store &amp; vehicle.</p></div>
                </div>
              )}
              <div className="info-card">
                <span className="ic-ico"><IcoList /></span>
                <div><h4>What&apos;s included</h4><p>Fitting &amp; balancing.</p></div>
              </div>
              <div className="info-card">
                <span className="ic-ico"><IcoTarget /></span>
                <div><h4>GST included</h4><p>10% GST applied to product prices.</p></div>
              </div>
              <div className="info-card">
                <span className="ic-ico"><IcoShieldPin /></span>
                <div><h4>Store availability</h4><p>Availability may vary by vehicle type.</p></div>
              </div>
            </aside>
          </div>

          {/* assurance band */}
          <div className="assure">
            <div className="assure-grid">
              <div className="assure-cell"><span className="as-ico"><IcoHeadset /></span><div><h4>Need help choosing?</h4><p>Our tyre experts are here to help find the perfect fit.</p></div></div>
              <div className="assure-cell"><span className="as-ico"><IcoTruck /></span><div><h4>Fast delivery</h4><p>Quick shipping on in-stock tyres.</p></div></div>
              <div className="assure-cell"><span className="as-ico"><IcoTool /></span><div><h4>Fitting available</h4><p>Official fitting locations available.</p></div></div>
              <div className="assure-cell"><span className="as-ico"><IcoExpert /></span><div><h4>Expert support</h4><p>Support from our friendly team.</p></div></div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
