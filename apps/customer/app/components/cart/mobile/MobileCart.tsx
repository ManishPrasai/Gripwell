'use client'

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useCart } from '../../../context/CartContext'
import {
  VEHICLE_TYPES, fittingRate, computeTotals,
  type VehicleType, type FulfilMethod,
} from '../../../../lib/fitting'

/*
  Phone / tablet "Cart" page — the [data-vw="mobile"] tree for /cart.

  Ported from the "Mobile Cart & Checkout" artboard (the `page: 'cart'` branch).
  Same three-step spine as the desktop CartContents — items → fitting/pickup →
  store — but as a single scrolling column with a sticky order-summary bar.

  Business logic is shared with desktop: lib/fitting for rates + totals, the
  same `nova_fitting` / `nova_selected_store` localStorage keys the /checkout
  route reads to charge the right amount server-side.
*/

const StoreMap = dynamic(() => import('../../locations/StoreMap'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#E9E6DC' }} />,
})

interface StoreData {
  id: string; name: string; slug: string
  address: string; suburb: string; state: string; postcode: string
  latitude: number | null; longitude: number | null
  phone: string | null
  fittingPrices?: Partial<Record<VehicleType, number>>
}

const money = (n: number) => `A$${n.toFixed(2)}`

/* Short vehicle labels — the lib labels ("SUV / LT / 4x4") are too long for
   the artboard's 2-up grid. */
const VEH_SHORT: Record<VehicleType, string> = {
  passenger: 'Passenger', suv: 'SUV / 4x4', commercial: 'Commercial', truck: 'Truck',
}
const VEH_ICON: Record<VehicleType, React.ReactNode> = {
  passenger: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13m-14 0h14m-14 0v4h2v-2m10 2h2v-4m-2 4v-2" /><circle cx="7.5" cy="15" r="1" /><circle cx="16.5" cy="15" r="1" /></svg>,
  suv: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13l1-4a2 2 0 0 1 2-1.5h11a2 2 0 0 1 1.7 1L21 13m-18 0h18m-18 0v4h2v-2m14 2h2v-4M8 8v5" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></svg>,
  commercial: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h11v9H3zM14 9h4l3 3v3h-7z" /><circle cx="7" cy="17" r="1.4" /><circle cx="17" cy="17" r="1.4" /></svg>,
  truck: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5h13v11H2zM15 8h4l3 4v4h-7z" /><circle cx="6" cy="18" r="1.4" /><circle cx="18" cy="18" r="1.4" /></svg>,
}

const TyreIco = ({ s = 18 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#076330" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6" />
  </svg>
)

const card: React.CSSProperties = { border: '1px solid #E7E5DE', borderRadius: '10px', padding: '14px' }
const stepBadge: React.CSSProperties = {
  width: '22px', height: '22px', borderRadius: '50%', background: '#076330', color: '#fff',
  fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}
const stepTitle: React.CSSProperties = {
  fontFamily: "'Bebas Neue', sans-serif", fontSize: '15px', letterSpacing: '0.02em', color: '#16211B',
}

function radio(on: boolean, size = 16): React.CSSProperties {
  return {
    width: `${size}px`, height: `${size}px`, borderRadius: '50%',
    background: on ? '#076330' : '#fff', border: `2px solid ${on ? '#076330' : '#E7E5DE'}`,
    color: '#fff', fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }
}

export default function MobileCart() {
  const { items, updateQty, removeItem, cartCount, cartTotal } = useCart()

  const [method, setMethod] = useState<FulfilMethod>('fit')
  const [vehicleType, setVehicleType] = useState<VehicleType>('passenger')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [stores, setStores] = useState<StoreData[]>([])
  const [storesLoading, setStoresLoading] = useState(true)
  const [fitCount, setFitCount] = useState<number | null>(null) // null = fit all
  const [showDetails, setShowDetails] = useState(false)

  const isFit = method === 'fit'
  const fitQty = fitCount === null ? cartCount : Math.max(0, Math.min(fitCount, cartCount))
  const takeHome = cartCount - fitQty

  useEffect(() => {
    fetch('/api/stores')
      .then(r => r.json())
      .then(d => setStores(d.stores ?? []))
      .catch(() => {})
      .finally(() => setStoresLoading(false))
  }, [])

  const active = stores.find(s => s.id === selectedStore) ?? null
  const storePrices = active?.fittingPrices ?? null
  const rate = fittingRate(vehicleType, storePrices)

  const totals = useMemo(
    () => computeTotals({ subtotal: cartTotal, itemCount: fitQty, fittingRate: rate, fit: isFit }),
    [cartTotal, fitQty, rate, isFit],
  )

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

  const mappable = stores
    .filter(s => s.latitude != null && s.longitude != null)
    .map(s => ({
      id: s.id, name: s.name, address: s.address,
      suburb: `${s.suburb} ${s.state} ${s.postcode}`,
      lat: s.latitude as number, lng: s.longitude as number,
    }))
  const mapSelected = mappable.find(m => m.id === selectedStore) ?? null

  const feeLabel = isFit ? `Fitting (${fitQty} × ${money(rate)})` : 'Pickup'
  const feeValue = isFit ? money(totals.fitting) : 'Free'
  const canCheckout = items.length > 0

  return (
    <div style={{ background: '#0D1A12' }}>
      <div
        className="nv-mob-shell"
        style={{
          background: '#fff', fontFamily: "'DM Sans', sans-serif", maxWidth: '420px', margin: '0 auto',
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
        }}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <header style={{ background: '#fff', borderBottom: '1px solid #E7E5DE', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', position: 'sticky', top: 0, zIndex: 5 }}>
          <Link href="/tyres/results" aria-label="Back to shopping" style={{ fontSize: '18px', lineHeight: 1, color: '#16211B', textDecoration: 'none', padding: '2px 4px' }}>‹</Link>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.03em', color: '#16211B' }}>Your Cart</span>
        </header>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '24px', flex: 1 }}>

          {/* ── Step 1: items ───────────────────────────────── */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={stepBadge}>1</span>
              <span style={stepTitle}>Your Tyres &amp; Wheels</span>
            </div>

            {items.length === 0 ? (
              <p style={{ margin: 0, fontSize: '11px', color: '#999' }}>
                Your cart is empty. <Link href="/tyres/results" style={{ fontWeight: 700, color: '#076330' }}>Shop tyres</Link>
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map(it => (
                  <div key={it.id} style={{ borderTop: '1px solid #E7E5DE', padding: '10px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link
                      href={`/${it.productType === 'tyre' ? 'tyres' : 'wheels'}/${it.id}`}
                      style={{ width: '40px', height: '40px', border: '1px solid #F2F2F0', borderRadius: '7px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAF8', overflow: 'hidden' }}
                    >
                      {it.image
                        ? <img src={it.image} alt={it.model} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px', boxSizing: 'border-box' }} />
                        : <TyreIco />}
                    </Link>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#16211B' }}>{it.model}</span>
                      <span style={{ display: 'block', fontSize: '9.5px', color: '#999' }}>{it.size} · {money(it.price)} ea</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <button type="button" aria-label="One less" onClick={() => updateQty(it.id, -1)} disabled={it.qty <= 1}
                          style={{ width: '18px', height: '18px', border: '1px solid #DBDBD7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', background: '#fff', cursor: it.qty <= 1 ? 'not-allowed' : 'pointer', opacity: it.qty <= 1 ? 0.4 : 1, color: '#16211B' }}>–</button>
                        <span style={{ fontSize: '10px', fontWeight: 800, width: '14px', textAlign: 'center' }}>{it.qty}</span>
                        <button type="button" aria-label="One more" onClick={() => updateQty(it.id, 1)}
                          style={{ width: '18px', height: '18px', border: '1px solid #DBDBD7', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', background: '#fff', cursor: 'pointer', color: '#16211B' }}>+</button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#16211B' }}>{money(it.price * it.qty)}</span>
                      <button type="button" onClick={() => removeItem(it.id)} aria-label={`Remove ${it.model}`}
                        style={{ fontSize: '9px', color: '#B5B3AC', marginTop: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Step 2: fulfilment ──────────────────────────── */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={stepBadge}>2</span>
              <span style={stepTitle}>How Would You Like Them?</span>
            </div>
            <p style={{ margin: '0 0 10px 30px', fontSize: '10px', color: '#999' }}>Either way, no extra cost to collect.</p>

            <button type="button" onClick={() => setMethod('fit')}
              style={{ width: '100%', textAlign: 'left', border: `2px solid ${isFit ? '#076330' : '#E7E5DE'}`, background: isFit ? '#E8F5EE' : '#fff', borderRadius: '8px', padding: '11px', marginBottom: '7px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#16211B' }}>
                  Fit on my car
                  <span style={{ background: '#076330', color: '#fff', fontSize: '7px', padding: '2px 6px', borderRadius: '8px', marginLeft: '4px', fontWeight: 800 }}>RECOMMENDED</span>
                </span>
                <span style={radio(isFit)}>{isFit ? '✓' : ''}</span>
              </div>
              <span style={{ display: 'block', fontSize: '9.5px', color: '#666', marginTop: '5px', lineHeight: 1.4 }}>Drive in, we do everything — fitting, balancing, new valves. About an hour.</span>
              <span style={{ display: 'block', fontSize: '9.5px', fontWeight: 800, color: '#076330', marginTop: '5px' }}>+ {money(rate)} per tyre</span>
            </button>

            <button type="button" onClick={() => setMethod('pickup')}
              style={{ width: '100%', textAlign: 'left', border: `2px solid ${!isFit ? '#076330' : '#E7E5DE'}`, background: !isFit ? '#E8F5EE' : '#fff', borderRadius: '8px', padding: '11px', marginBottom: isFit ? '10px' : '0', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#16211B' }}>Just pick them up</span>
                <span style={radio(!isFit)}>{!isFit ? '✓' : ''}</span>
              </div>
              <span style={{ display: 'block', fontSize: '9.5px', color: '#666', marginTop: '5px', lineHeight: 1.4 }}>Collect &amp; take home — your mechanic can fit later.</span>
              <span style={{ display: 'inline-block', marginTop: '5px', background: '#E8F5EE', borderRadius: '8px', padding: '3px 9px', fontSize: '9px', fontWeight: 800, color: '#076330' }}>No fitting fee</span>
            </button>

            {isFit && (
              <div style={{ background: '#F1F9F4', borderRadius: '8px', padding: '11px' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 800, display: 'block', marginBottom: '8px', color: '#16211B' }}>What do you drive?</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                  {VEHICLE_TYPES.map(v => {
                    const on = vehicleType === v.id
                    return (
                      <button key={v.id} type="button" onClick={() => setVehicleType(v.id)} aria-pressed={on}
                        style={{ background: on ? '#fff' : 'rgba(255,255,255,.5)', border: `2px solid ${on ? '#076330' : '#C9E0D2'}`, borderRadius: '7px', padding: '8px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <span style={{ color: on ? '#076330' : '#8AA294', display: 'flex' }}>{VEH_ICON[v.id]}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#16211B' }}>{VEH_SHORT[v.id]}</span>
                          <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#076330' }}>${fittingRate(v.id, storePrices)}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {cartCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #C9E0D2', borderRadius: '8px', padding: '9px', marginTop: '9px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '9.5px', fontWeight: 800, color: '#16211B' }}>{fitQty} fitted</span>
                      {takeHome > 0 && <span style={{ display: 'block', fontSize: '8.5px', color: '#666' }}>{takeHome} taken home, no fee</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.4px solid #DBDBD7', borderRadius: '14px', overflow: 'hidden' }}>
                      <button type="button" aria-label="Fit fewer" onClick={() => setFitCount(Math.max(0, fitQty - 1))} disabled={fitQty <= 0}
                        style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', background: '#fff', border: 'none', cursor: fitQty <= 0 ? 'not-allowed' : 'pointer', opacity: fitQty <= 0 ? 0.4 : 1, color: '#16211B' }}>–</button>
                      <span style={{ width: '22px', textAlign: 'center', fontSize: '10px', fontWeight: 800 }}>{fitQty}</span>
                      <button type="button" aria-label="Fit more" onClick={() => setFitCount(Math.min(cartCount, fitQty + 1))} disabled={fitQty >= cartCount}
                        style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', background: '#fff', border: 'none', cursor: fitQty >= cartCount ? 'not-allowed' : 'pointer', opacity: fitQty >= cartCount ? 0.4 : 1, color: '#16211B' }}>+</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Step 3: store ──────────────────────────────── */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '9px' }}>
              <span style={stepBadge}>3</span>
              <span style={stepTitle}>{isFit ? 'Where should we fit them?' : 'Where will you collect them?'}</span>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', height: '150px', marginBottom: '9px', background: '#E9E6DC' }}>
              {mappable.length > 0 ? (
                <StoreMap
                  stores={mappable}
                  selectedStore={mapSelected}
                  interactive={false}
                  onSelectStore={m => {
                    const full = stores.find(s => s.id === m.id)
                    if (full) handleStoreSelect(full)
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '10px', color: '#999' }}>
                  {storesLoading ? 'Loading map…' : 'Map unavailable'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {storesLoading ? (
                <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>Loading stores…</p>
              ) : stores.length === 0 ? (
                <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>No stores available.</p>
              ) : stores.map(s => {
                const on = selectedStore === s.id
                return (
                  <button key={s.id} type="button" onClick={() => handleStoreSelect(s)}
                    style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', background: on ? '#E8F5EE' : '#fff', border: `2px solid ${on ? '#076330' : '#E7E5DE'}`, borderRadius: '8px', padding: '9px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                    <span style={radio(on)}>{on ? '✓' : ''}</span>
                    <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#16211B' }}>
                      {s.name} <span style={{ color: '#076330', fontSize: '9px', fontWeight: 700 }}>{s.state}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Sticky order summary ──────────────────────────── */}
        <div style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid #E7E5DE', padding: '8px 16px', boxShadow: '0 -4px 12px rgba(0,0,0,.08)' }}>
          {showDetails && (
            <div style={{ padding: '8px 0', fontSize: '10.5px', color: '#444', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Products ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span><strong>{money(totals.subtotal)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{feeLabel}</span><strong>{feeValue}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}><span>GST (incl.)</span><strong>{money(totals.gst)}</strong></div>
            </div>
          )}
          <button type="button" onClick={() => setShowDetails(v => !v)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ fontSize: '10px', color: '#666' }}>Order details {showDetails ? '▾' : '▸'}</span>
            <span style={{ fontSize: '9.5px', color: '#666' }}>Total <b style={{ color: '#076330', fontSize: '13px', marginLeft: '4px' }}>{money(totals.total)}</b></span>
          </button>

          {canCheckout ? (
            <Link href="/checkout" style={{ display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center', background: '#E8572A', color: '#fff', fontSize: '11px', fontWeight: 800, borderRadius: '20px', padding: '10px', marginTop: '6px', textDecoration: 'none' }}>
              🔒 Checkout Securely
            </Link>
          ) : (
            <Link href="/tyres/results" style={{ display: 'block', width: '100%', boxSizing: 'border-box', textAlign: 'center', background: '#E7E5DE', color: '#8D8B85', fontSize: '11px', fontWeight: 800, borderRadius: '20px', padding: '10px', marginTop: '6px', textDecoration: 'none' }}>
              Shop tyres
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
