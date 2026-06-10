'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

/* ── Demo cart data ──────────────────────────────────────────────────────── */
const INITIAL_ITEMS = [
  { id: 'c1', brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'CrossContact A/T',  size: '245/70R16', spec: '118/115S', price: 91.50,  qty: 1, image: '/images/tyres/Tyre 1.png' },
  { id: 'c2', brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg',  model: 'Black Rhino AWOL', size: '17×8.5',    spec: '6×139.7',  price: 230.00, qty: 1, image: '/images/wheel/Wheel 1.png' },
  { id: 'c3', brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'CrossContact A/T',  size: '245/70R16', spec: '118/115S', price: 91.50,  qty: 1, image: '/images/tyres/Tyre 1.png' },
]

const VEHICLE_TYPES = [
  { id: 'passenger', label: 'Passenger Car',  desc: 'Sedans, hatchbacks, coupes, wagons', icon: 'ti-car' },
  { id: 'suv',       label: 'SUV/LT/4x4',     desc: 'SUV, light trucks, 4WDs',            icon: 'ti-car-suv' },
  { id: 'commercial',label: 'Commercial',      desc: 'Vans, light commercial vehicles',    icon: 'ti-truck' },
  { id: 'truck',     label: 'Truck',           desc: 'Heavy truck & large vehicles',       icon: 'ti-truck-delivery' },
]

const STORES = [
  { id: 's1', name: 'Nova Tyres Sefton',     address: '107 Carlingford St, Sefton NSW 2162' },
  { id: 's2', name: 'Nova Tyres Springvale', address: '4/134 Springvale Rd, Springvale VIC 3171' },
  { id: 's3', name: 'Nova Tyres Bayswater',  address: '194 Canterbury Rd, Bayswater North VIC 3153' },
  { id: 's4', name: 'Nova Tyres Alphington', address: '200 Grange Rd, Alphington VIC 3078' },
]

const INFO_CARDS = [
  { icon: 'ti-clock', title: 'Estimated fitting time', value: '45–60min', desc: 'Time may vary upon store & vehicle' },
  { icon: 'ti-tool',  title: "What's included",        value: '',         desc: 'Fitting & Balancing' },
  { icon: 'ti-receipt-2', title: 'Prices shown per tyre', value: '', desc: 'All prices include GST' },
  { icon: 'ti-building-store', title: 'Store availability', value: '', desc: 'Store availability may vary by vehicle type' },
]

const FITTING_COST = 25.00

const PAYMENT_LOGOS = [
  { name: 'Stripe',     src: '/images/footer/payment-stripe.png' },
  { name: 'VISA',       src: '/images/footer/payment-visa.png' },
  { name: 'Mastercard', src: '/images/footer/payment-mastercard.png' },
  { name: 'Apple Pay',  src: '/images/footer/payment-applepay.png' },
  { name: 'Afterpay',   src: '/images/footer/payment-afterpay.png' },
  { name: 'Klarna',     src: '/images/footer/payment-klarna.png' },
]

/* ── Step indicator ──────────────────────────────────────────────────────── */
function Step({ n, last = false, children }: { n: number; last?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: last ? 0 : '32px' }}>
      {/* Number + line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '50%',
          background: '#076330', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '15px',
          flexShrink: 0,
        }}>
          {n}
        </div>
        {!last && <div style={{ width: '2px', flex: 1, background: '#C5E0CD', marginTop: '6px', minHeight: '32px' }} />}
      </div>
      {/* Content */}
      <div style={{ flex: 1, paddingTop: '5px', minWidth: 0 }}>{children}</div>
    </div>
  )
}

/* ── Brand logo with fallback ────────────────────────────────────────────── */
function BrandLogo({ src, brand }: { src: string; brand: string }) {
  const [err, setErr] = useState(false)
  if (err) return <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '12px', color: '#333' }}>{brand}</span>
  return <Image src={src} alt={brand} width={72} height={18} style={{ objectFit: 'contain', height: '16px', width: 'auto', maxWidth: '72px' }} onError={() => setErr(true)} />
}

/* ── Cart item row ───────────────────────────────────────────────────────── */
function CartItemRow({ item, onUpdate, onRemove }: {
  item:     { id: string; brand: string; brandLogo: string; model: string; size: string; spec: string; price: number; qty: number; image: string }
  onUpdate: (d: number) => void
  onRemove: () => void
}) {
  const [removeHovered, setRemoveHovered] = useState(false)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid #F0F0F0' }}>
      {/* Product image */}
      <div style={{ width: '72px', height: '72px', position: 'relative', flexShrink: 0, background: '#F8F8F8', borderRadius: '10px', overflow: 'hidden' }}>
        <Image src={item.image} alt={item.model} fill style={{ objectFit: 'contain', padding: '6px' }} sizes="72px" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '4px' }}>
          <BrandLogo src={item.brandLogo} brand={item.brand} />
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1A1A1A', marginBottom: '2px' }}>{item.model}</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: '13px', color: '#888', marginBottom: '6px' }}>{item.size}&nbsp;{item.spec}</p>

        {/*
          Subtle remove — deliberately low-contrast and small so it doesn't
          draw the eye or encourage removal. Visible to someone who seeks it,
          invisible to someone who doesn't. Classic large-retailer pattern.
        */}
        <button
          onClick={onRemove}
          onMouseEnter={() => setRemoveHovered(true)}
          onMouseLeave={() => setRemoveHovered(false)}
          style={{
            background:     'none',
            border:         'none',
            padding:        0,
            cursor:         'pointer',
            fontFamily:     "'DM Sans', sans-serif",
            fontSize:       '12px',
            fontWeight:     400,
            color:          removeHovered ? '#888' : '#bbb',
            textDecoration: removeHovered ? 'underline' : 'none',
            transition:     'color 0.2s',
            letterSpacing:  '0.01em',
          }}
        >
          Remove
        </button>
      </div>

      {/* Price */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '17px', color: '#1A1A1A' }}>A${item.price.toFixed(2)}</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#aaa', fontWeight: 500 }}>each</p>
      </div>

      {/* Qty controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0, background: '#F5F5F5', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E0E0E0' }}>
        <button onClick={() => onUpdate(-1)} style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ minWidth: '28px', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '15px', color: '#1A1A1A' }}>{item.qty}</span>
        <button onClick={() => onUpdate(+1)} style={{ width: '36px', height: '36px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>
    </div>
  )
}

/* ── Vehicle type card ───────────────────────────────────────────────────── */
function VehicleCard({ v, selected, onSelect }: { v: typeof VEHICLE_TYPES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        background: selected ? '#F0F9F4' : '#fff',
        border: `1.5px solid ${selected ? '#076330' : '#E0E0E0'}`,
        borderRadius: '10px',
        padding: '14px 12px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      <i className={`ti ${v.icon}`} style={{ fontSize: '28px', color: selected ? '#076330' : '#999', display: 'block', marginBottom: '8px' }} aria-hidden="true" />
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: '#1A1A1A', marginBottom: '3px', lineHeight: 1.2 }}>{v.label}</p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '12px', color: '#888', lineHeight: 1.4 }}>{v.desc}</p>
    </button>
  )
}

/* ── Store list item ─────────────────────────────────────────────────────── */
function StoreItem({ store, selected, onSelect }: { store: typeof STORES[0]; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        background: selected ? '#F0F9F4' : '#fff',
        border: `1px solid ${selected ? '#076330' : '#EBEBEB'}`,
        borderRadius: '10px',
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '8px',
        display: 'block',
      }}
    >
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: '#1A1A1A', marginBottom: '3px' }}>{store.name}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <i className="ti ti-map-pin" style={{ fontSize: '12px', color: '#076330', flexShrink: 0 }} aria-hidden="true" />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '12px', color: '#888' }}>{store.address}</p>
      </div>
    </button>
  )
}

/* ── Info card ───────────────────────────────────────────────────────────── */
function InfoCard({ item }: { item: typeof INFO_CARDS[0] }) {
  return (
    <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E5E5', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`ti ${item.icon}`} style={{ fontSize: '22px', color: '#1A1A1A' }} aria-hidden="true" />
      </div>
      <div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '14px', color: '#1A1A1A', marginBottom: '2px', lineHeight: 1.2 }}>
          {item.title}{item.value ? <span style={{ color: '#E8572A', marginLeft: '4px' }}>{item.value}</span> : ''}
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: '12px', color: '#888', lineHeight: 1.4 }}>{item.desc}</p>
      </div>
    </div>
  )
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function CartContents() {
  const { items, updateQty, removeItem, cartCount: itemCount, cartTotal: subtotal } = useCart()
  const [vehicleType,   setVehicleType]   = useState('passenger')
  const [postcode,      setPostcode]      = useState('')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  const total = subtotal + FITTING_COST

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '24px', alignItems: 'start' }}>

        {/* ════════════ LEFT COLUMN ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Cart items card */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E5E5E5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '22px', color: '#1A1A1A', marginBottom: '4px' }}>
              Your cart{' '}
              <span style={{ color: '#888', fontWeight: 500, fontSize: '18px' }}>({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
            </h1>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa', fontFamily: "'DM Sans', sans-serif" }}>
                <i className="ti ti-shopping-cart-off" style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }} />
                Your cart is empty. <Link href="/tyres/results" style={{ color: '#E8572A' }}>Shop tyres</Link>
              </div>
            ) : (
              items.map(it => <CartItemRow key={it.id} item={it} onUpdate={d => updateQty(it.id, d)} onRemove={() => removeItem(it.id)} />)
            )}
          </div>

          {/* Steps card */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', border: '1px solid #E5E5E5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

            {/* ── Step 1 ── */}
            <Step n={1}>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '18px', color: '#1A1A1A', marginBottom: '4px' }}>
                Select Your Vehicle Type
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                Fitting price depends on your vehicle category
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {VEHICLE_TYPES.map(v => (
                  <VehicleCard key={v.id} v={v} selected={vehicleType === v.id} onSelect={() => setVehicleType(v.id)} />
                ))}
              </div>
            </Step>

            {/* ── Step 2 ── */}
            <Step n={2}>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '18px', color: '#1A1A1A', marginBottom: '4px' }}>
                Fitting station near you
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#888', marginBottom: '16px' }}>
                We'll show the nearest fitting station based on your location.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <i className="ti ti-map-pin" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: '#888' }} aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Enter postcode"
                    value={postcode}
                    onChange={e => setPostcode(e.target.value)}
                    maxLength={4}
                    style={{
                      paddingLeft: '36px', paddingRight: '14px', height: '42px',
                      border: '1px solid #D5D5D5', borderRadius: '8px',
                      fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 500,
                      outline: 'none', width: '160px', color: '#1A1A1A',
                    }}
                  />
                </div>
                <span style={{ color: '#aaa', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>Or</span>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    background: '#fff', border: '1px solid #D5D5D5', borderRadius: '8px',
                    padding: '0 16px', height: '42px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '14px', color: '#1A1A1A',
                  }}
                >
                  <i className="ti ti-current-location" style={{ fontSize: '16px', color: '#E8572A' }} aria-hidden="true" />
                  Use My Location
                </button>
              </div>
            </Step>

            {/* ── Step 3 ── */}
            <Step n={3} last>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '18px', color: '#1A1A1A' }}>
                  Choose a Fitting Station
                </h2>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#fff', border: '1px solid #D5D5D5', borderRadius: '8px',
                    padding: '0 14px', height: '36px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px', color: '#1A1A1A',
                  }}
                >
                  <i className="ti ti-current-location" style={{ fontSize: '14px', color: '#E8572A' }} aria-hidden="true" />
                  Use my location
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Map */}
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E0E0E0', height: '260px' }}>
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=144.5,-38.2,145.5,-37.5&layer=mapnik"
                    title="Store locations map"
                    style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  />
                </div>

                {/* Store list */}
                <div style={{ overflow: 'auto', maxHeight: '260px' }}>
                  {STORES.map(s => (
                    <StoreItem key={s.id} store={s} selected={selectedStore === s.id} onSelect={() => setSelectedStore(s.id)} />
                  ))}
                </div>
              </div>
            </Step>
          </div>

        </div>

        {/* ════════════ RIGHT COLUMN ════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: '100px' }}>

          {/* Order Summary */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #E5E5E5', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 900, fontSize: '18px', color: '#1A1A1A', marginBottom: '18px' }}>
              Order Summary
            </h2>

            {[
              { label: `Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`, value: `$${subtotal.toFixed(2)}`, muted: false },
              { label: 'Fitting & Balancing', value: `$${FITTING_COST.toFixed(2)}`, muted: false },
              { label: 'GST Status', value: 'GST Calculated', muted: true },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#555', fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: row.muted ? '#888' : '#1A1A1A', fontWeight: row.muted ? 400 : 600 }}>{row.value}</span>
              </div>
            ))}

            <div style={{ height: '1px', background: '#EBEBEB', margin: '14px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 800, color: '#1A1A1A' }}>Total</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: 900, color: '#E8572A' }}>
                ${total.toFixed(2)}
              </span>
            </div>

            <Link
              href="/checkout"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', background: '#E8572A', color: '#fff',
                borderRadius: '10px', padding: '14px',
                fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '15px',
                letterSpacing: '0.04em', marginBottom: '12px', textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              <i className="ti ti-lock" style={{ fontSize: '16px' }} aria-hidden="true" />
              Proceed to checkout
            </Link>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#aaa', textAlign: 'center', marginBottom: '12px' }}>
              Secured Checkout
            </p>

            {/* Payment logos */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {PAYMENT_LOGOS.map(p => (
                <div key={p.name} style={{ background: '#F8F8F8', borderRadius: '5px', padding: '4px 8px', height: '28px', display: 'flex', alignItems: 'center' }}>
                  <Image src={p.src} alt={p.name} width={44} height={18} style={{ objectFit: 'contain', height: '16px', width: 'auto' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Info cards */}
          {INFO_CARDS.map(c => <InfoCard key={c.title} item={c} />)}

        </div>
      </div>
    </div>
  )
}
