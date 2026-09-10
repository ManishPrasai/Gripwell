'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../../../context/CartContext'
import { fittingRate, computeTotals, isVehicleType, type VehicleType, type FulfilMethod } from '../../../../lib/fitting'

/*
  Phone / tablet "Checkout" page — the [data-vw="mobile"] tree for /checkout.

  Ported from the "Mobile Cart & Checkout" artboard (the `page: 'checkout'`
  branch): a three-step accordion — Contact → Billing → Payment. The flow is
  the same as the desktop CheckoutPage:
    • fitting choice comes from the `nova_fitting` localStorage key the cart set
    • `nova_selected_store` gives the fitting-station panel
    • step 2 → /api/checkout/create-payment-intent (server recomputes the charge)
    • Stripe confirmPayment → /api/checkout/success → /checkout/confirmation
*/

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']

const DEFAULT_STORE = {
  name: 'Nova Tyres Sefton',
  address: '107 Carlingford St, Sefton',
  state: 'NSW 2162',
}

const money = (n: number) => `A$${n.toFixed(2)}`

type Step = 1 | 2 | 3

const fieldStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', border: '1.4px solid #D8D8D8', borderRadius: '7px',
  height: '32px', padding: '0 9px', fontSize: '11px', background: '#fff', color: '#16211B',
  fontFamily: 'inherit', outline: 'none',
}
const fieldLabel: React.CSSProperties = { display: 'block', fontSize: '8px', color: '#666', marginBottom: '4px', letterSpacing: '0.04em' }
const orangeBtn: React.CSSProperties = {
  width: '100%', textAlign: 'center', background: '#FF5A1F', color: '#fff', fontSize: '11px',
  fontWeight: 700, borderRadius: '9px', padding: '11px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
}

const IcoUser = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#076330" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
const IcoTag = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#076330" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.6 12.6 12 21.2a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8L11.4 3.4a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v6.6a2 2 0 0 1-.4 1.6Z" /></svg>
const IcoCard = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#076330" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="2" /><path d="M2.5 9.5h19" /></svg>
const IcoTyre = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#076330" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7 5.6 5.6" /></svg>

interface StripeBillingDetails {
  name: string; email: string; phone: string
  address: { line1: string; city: string; state: string; postal_code: string; country: string }
}

/* ── Stripe payment form (lives inside <Elements>) — mirrors the desktop one ── */
function MobileStripeForm({
  onSuccess, total, billingDetails,
}: {
  onSuccess: (orderNumber: string, orderTotal: number) => void
  total: number
  billingDetails: StripeBillingDetails
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [payError, setPayError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [elementReady, setElementReady] = useState(false)

  async function handlePay() {
    if (!stripe || !elements || !elementReady) return
    setPaying(true)
    setPayError(null)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          payment_method_data: { billing_details: billingDetails },
        },
        redirect: 'if_required',
      })

      if (error) {
        setPayError(error.message ?? 'Payment failed. Please try again.')
        return
      }

      let ck: { email?: string; name?: string; storeName?: string } = {}
      try { ck = JSON.parse(localStorage.getItem('nova_checkout') || '{}') } catch {}
      const res = await fetch('/api/checkout/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: paymentIntent?.id ?? null, email: ck.email, name: ck.name, storeName: ck.storeName }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPayError(data.error ?? 'Order creation failed. Please contact us.')
        return
      }
      onSuccess(data.orderNumber, data.total ?? total)
    } catch (err) {
      setPayError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ background: '#EDF7F1', border: '1px solid #B8DFC5', borderRadius: '8px', padding: '9px', display: 'flex', alignItems: 'center', gap: '7px' }}>
        <svg width="14" height="16" viewBox="0 0 24 28" fill="none" aria-hidden="true"><path d="M12 1L2 5.5V12c0 6.08 4.33 11.74 10 13.12C17.67 23.74 22 18.08 22 12V5.5L12 1z" fill="#076330" /><polyline points="8 13.5 11 16.5 16 10.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#076330' }}>Pay securely powered by Stripe</span>
      </div>

      {!elementReady && (
        <p style={{ fontSize: '10px', color: '#AAA', textAlign: 'center', margin: 0 }}>Loading payment form…</p>
      )}
      <PaymentElement
        onReady={() => setElementReady(true)}
        onLoadError={(e) => setPayError(`Stripe failed to load: ${e.error?.message ?? 'unknown error'}`)}
        options={{ fields: { billingDetails: 'never' } }}
      />

      {payError && (
        <div style={{ background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '9px' }}>
          <p style={{ fontSize: '10px', color: '#C62828', margin: 0 }}>{payError}</p>
        </div>
      )}

      <button type="button" onClick={handlePay} disabled={paying || !stripe || !elements || !elementReady}
        style={{ ...orangeBtn, fontSize: '12px', fontWeight: 700, padding: '12px', marginBottom: '4px', background: (paying || !elementReady) ? '#E8E8E8' : '#FF5A1F', color: (paying || !elementReady) ? '#AAA' : '#fff', cursor: (paying || !elementReady) ? 'not-allowed' : 'pointer' }}>
        {paying ? 'Processing…' : !elementReady ? 'Loading payment form…' : `🔒 Place order — ${money(total)}`}
      </button>
    </div>
  )
}

export default function MobileCheckout() {
  const { items, cartTotal, cartCount, clearCart } = useCart()
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '', prefix: '+61' })
  const [billing, setBilling] = useState({ street: '', suburb: '', state: 'VIC', postcode: '', country: 'Australia' })

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [payIntentLoading, setPayIntentLoading] = useState(false)
  const [payIntentError, setPayIntentError] = useState<string | null>(null)

  const [selectedStore, setSelectedStore] = useState(DEFAULT_STORE)
  const [notes, setNotes] = useState('')
  const [redirectBanner, setRedirectBanner] = useState<string | null>(null)

  // Fitting choice carried from the cart — drives the displayed total.
  const [fitting, setFitting] = useState<{ method: FulfilMethod; vehicleType: VehicleType; fitCount: number | null }>({
    method: 'fit', vehicleType: 'passenger', fitCount: null,
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nova_selected_store')
      if (raw) {
        const s = JSON.parse(raw)
        setSelectedStore({
          name: s.name,
          address: `${s.address}, ${s.suburb}`,
          state: `${s.state} ${s.postcode}`,
        })
      }
    } catch {}
    try {
      const f = JSON.parse(localStorage.getItem('nova_fitting') || '{}')
      setFitting({
        method: f.method === 'pickup' ? 'pickup' : 'fit',
        vehicleType: isVehicleType(f.vehicleType) ? f.vehicleType : 'passenger',
        fitCount: typeof f.fitCount === 'number' ? f.fitCount : null,
      })
    } catch {}
  }, [])

  // Handle return from redirect-based payment methods (PayPal / Afterpay / Klarna).
  // Runs once on mount only — clearCart/router are stable.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('redirect_status')
    const piId = params.get('payment_intent')

    if (status === 'succeeded' && piId) {
      let ck: { email?: string; name?: string; storeName?: string } = {}
      try { ck = JSON.parse(localStorage.getItem('nova_checkout') || '{}') } catch {}
      fetch('/api/checkout/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: piId, email: ck.email, name: ck.name, storeName: ck.storeName }),
      })
        .then(r => r.json())
        .then(data => {
          clearCart()
          router.push(`/checkout/confirmation?order=${encodeURIComponent(data.orderNumber)}&total=${Number(data.total ?? 0).toFixed(2)}`)
        })
        .catch(() => setRedirectBanner('Payment succeeded but we could not record your order. Please contact us.'))
      return
    }
    if (status === 'failed') setRedirectBanner('Your payment was declined. Please try a different payment method.')
    else if (status === 'canceled') setRedirectBanner('Payment was cancelled. You can fill in your details and try again.')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fitQty = fitting.fitCount === null ? cartCount : Math.max(0, Math.min(fitting.fitCount, cartCount))
  const isFit = fitting.method === 'fit'
  const rate = fittingRate(fitting.vehicleType)
  const totals = useMemo(
    () => computeTotals({ subtotal: cartTotal, itemCount: fitQty, fittingRate: rate, fit: isFit }),
    [cartTotal, fitQty, rate, isFit],
  )
  const feeLabel = isFit ? `Fitting (${fitQty} × ${money(rate)})` : 'Pickup'
  const feeValue = isFit ? money(totals.fitting) : 'Free'

  const step1Valid = contact.firstName.trim() && contact.lastName.trim() && /\S+@\S+\.\S+/.test(contact.email) && contact.phone.trim()
  const step2Valid = billing.street.trim() && billing.suburb.trim() && billing.postcode.trim()

  const stripeBillingDetails: StripeBillingDetails = {
    name: `${contact.firstName} ${contact.lastName}`.trim() || 'Customer',
    email: contact.email,
    phone: `${contact.prefix}${contact.phone}`.replace(/\s/g, ''),
    address: {
      line1: billing.street, city: billing.suburb, state: billing.state,
      postal_code: billing.postcode, country: billing.country === 'New Zealand' ? 'NZ' : 'AU',
    },
  }

  async function advanceToPayment() {
    if (!step2Valid) { setPayIntentError('Please complete your billing address.'); return }
    setPayIntentLoading(true)
    setPayIntentError(null)
    try {
      let storeName = ''
      try { storeName = (JSON.parse(localStorage.getItem('nova_selected_store') || '{}') as { name?: string }).name || '' } catch {}
      localStorage.setItem('nova_checkout', JSON.stringify({
        email: contact.email, name: `${contact.firstName} ${contact.lastName}`.trim(), storeName,
      }))
    } catch {}
    try {
      let f: { vehicleType?: string; method?: string; storeId?: string; fitCount?: number } = {}
      try { f = JSON.parse(localStorage.getItem('nova_fitting') || '{}') } catch {}
      const res = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: f.vehicleType, method: f.method, storeId: f.storeId, fitCount: f.fitCount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to initialize payment')
      setClientSecret(data.clientSecret)
      setStep(3)
    } catch (err) {
      setPayIntentError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setPayIntentLoading(false)
    }
  }

  function handleSuccess(orderNumber: string, orderTotal: number) {
    clearCart()
    router.push(`/checkout/confirmation?order=${encodeURIComponent(orderNumber)}&total=${orderTotal.toFixed(2)}`)
  }

  const accordion: React.CSSProperties = { border: '1px solid #E7E5DE', borderRadius: '14px', overflow: 'hidden' }
  const accordionBtn: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '13px',
    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
  }
  const iconTile = (lit: boolean): React.CSSProperties => ({
    width: '32px', height: '32px', borderRadius: '9px', background: lit ? '#EDF7F1' : '#F5F5F5',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  })

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
          <Link href="/cart" aria-label="Back to cart" style={{ fontSize: '18px', lineHeight: 1, color: '#16211B', textDecoration: 'none', padding: '2px 4px' }}>‹</Link>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '19px', letterSpacing: '0.03em', color: '#16211B' }}>Checkout</span>
        </header>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '24px', flex: 1 }}>

          {redirectBanner && (
            <div style={{ background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '10px', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <p style={{ fontSize: '10.5px', color: '#C62828', margin: 0, flex: 1 }}>{redirectBanner}</p>
              <button type="button" onClick={() => setRedirectBanner(null)} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: '#C62828', fontSize: '15px', lineHeight: 1, cursor: 'pointer' }}>×</button>
            </div>
          )}

          {items.length === 0 && !clientSecret && (
            <div style={{ border: '1px solid #E7E5DE', borderRadius: '14px', padding: '18px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#666' }}>Your cart is empty.</p>
              <Link href="/tyres/results" style={{ fontSize: '11px', fontWeight: 800, color: '#076330' }}>Shop tyres →</Link>
            </div>
          )}

          {/* ── Step 1: Contact ────────────────────────────── */}
          <div style={accordion}>
            <button type="button" onClick={() => setStep(1)} style={accordionBtn}>
              <span style={iconTile(true)}><IcoUser /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#16211B' }}>Customer Contact Info</span>
                <span style={{ display: 'block', fontSize: '9px', color: '#999' }}>{step1Valid && step > 1 ? `${contact.firstName} ${contact.lastName} · ${contact.email}` : 'Enter your information'}</span>
              </span>
            </button>
            {step === 1 && (
              <div style={{ borderTop: '1px solid #F0F0F0', padding: '14px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '9px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={fieldLabel}>FIRST NAME</span>
                    <input style={fieldStyle} value={contact.firstName} onChange={e => setContact(p => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={fieldLabel}>LAST NAME</span>
                    <input style={fieldStyle} value={contact.lastName} onChange={e => setContact(p => ({ ...p, lastName: e.target.value }))} />
                  </div>
                </div>
                <span style={fieldLabel}>EMAIL ADDRESS</span>
                <input type="email" style={{ ...fieldStyle, marginBottom: '9px' }} value={contact.email} onChange={e => setContact(p => ({ ...p, email: e.target.value }))} />
                <span style={fieldLabel}>PHONE NUMBER</span>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  <select value={contact.prefix} onChange={e => setContact(p => ({ ...p, prefix: e.target.value }))} style={{ ...fieldStyle, width: 'auto', flexShrink: 0, padding: '0 4px' }}>
                    <option value="+61">🇦🇺 +61</option>
                    <option value="+64">🇳🇿 +64</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input type="tel" style={fieldStyle} value={contact.phone} onChange={e => setContact(p => ({ ...p, phone: e.target.value }))} placeholder="0412 345 678" />
                </div>
                <button type="button" onClick={() => setStep(2)} disabled={!step1Valid}
                  style={{ ...orangeBtn, background: step1Valid ? '#FF5A1F' : '#E8E8E8', color: step1Valid ? '#fff' : '#AAA', cursor: step1Valid ? 'pointer' : 'not-allowed' }}>
                  Continue to Billing Address →
                </button>
              </div>
            )}
          </div>

          {/* ── Step 2: Billing ────────────────────────────── */}
          <div style={accordion}>
            <button type="button" onClick={() => { if (step1Valid) setStep(2) }} style={accordionBtn}>
              <span style={iconTile(step >= 2)}><IcoTag /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#16211B' }}>Billing Address</span>
                <span style={{ display: 'block', fontSize: '9px', color: '#999' }}>{step2Valid && step > 2 ? `${billing.street}, ${billing.suburb} ${billing.state} ${billing.postcode}` : 'Add your billing address'}</span>
              </span>
            </button>
            {step === 2 && (
              <div style={{ borderTop: '1px solid #F0F0F0', padding: '14px' }}>
                <span style={fieldLabel}>STREET ADDRESS</span>
                <input style={{ ...fieldStyle, marginBottom: '9px' }} value={billing.street} onChange={e => setBilling(p => ({ ...p, street: e.target.value }))} />
                <span style={fieldLabel}>SUBURB / CITY</span>
                <input style={{ ...fieldStyle, marginBottom: '9px' }} value={billing.suburb} onChange={e => setBilling(p => ({ ...p, suburb: e.target.value }))} />
                <div style={{ display: 'flex', gap: '8px', marginBottom: '9px' }}>
                  <div style={{ flex: 1 }}>
                    <span style={fieldLabel}>STATE</span>
                    <select style={fieldStyle} value={billing.state} onChange={e => setBilling(p => ({ ...p, state: e.target.value }))}>
                      {AU_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={fieldLabel}>POSTCODE</span>
                    <input style={fieldStyle} maxLength={4} value={billing.postcode} onChange={e => setBilling(p => ({ ...p, postcode: e.target.value }))} />
                  </div>
                </div>
                <span style={fieldLabel}>COUNTRY</span>
                <select style={{ ...fieldStyle, marginBottom: '12px' }} value={billing.country} onChange={e => setBilling(p => ({ ...p, country: e.target.value }))}>
                  <option>Australia</option>
                  <option>New Zealand</option>
                </select>
                {payIntentError && (
                  <div style={{ background: '#FFF2F2', border: '1px solid #FFCDD2', borderRadius: '8px', padding: '9px', marginBottom: '10px' }}>
                    <p style={{ fontSize: '10px', color: '#C62828', margin: 0 }}>{payIntentError}</p>
                  </div>
                )}
                <button type="button" onClick={advanceToPayment} disabled={payIntentLoading || !step2Valid}
                  style={{ ...orangeBtn, background: (payIntentLoading || !step2Valid) ? '#E8E8E8' : '#FF5A1F', color: (payIntentLoading || !step2Valid) ? '#AAA' : '#fff', cursor: (payIntentLoading || !step2Valid) ? 'not-allowed' : 'pointer' }}>
                  {payIntentLoading ? 'Initializing payment…' : 'Continue to Payment Method →'}
                </button>
              </div>
            )}
          </div>

          {/* ── Step 3: Payment ────────────────────────────── */}
          <div style={accordion}>
            <button type="button" onClick={() => { if (clientSecret) setStep(3) }} style={accordionBtn}>
              <span style={iconTile(step >= 3)}><IcoCard /></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#16211B' }}>Payment Method</span>
                <span style={{ display: 'block', fontSize: '9px', color: '#999' }}>Choose a secure payment option</span>
              </span>
            </button>
            {step === 3 && (
              <div style={{ borderTop: '1px solid #F0F0F0', padding: '14px' }}>
                {/* Order Summary */}
                <div style={{ border: '1px solid #E7E5DE', borderRadius: '10px', padding: '10px', marginBottom: '11px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, display: 'block', marginBottom: '8px' }}>Order Summary</span>
                  {items.map(it => (
                    <div key={it.id} style={{ display: 'flex', gap: '7px', alignItems: 'center', borderBottom: '1px solid #F0F0F0', paddingBottom: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '7px', background: '#FAFAF8', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcoTyre /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '9.5px', fontWeight: 700 }}>{it.model}</span>
                        <span style={{ display: 'block', fontSize: '8.5px', color: '#999' }}>{it.size} · Qty {it.qty}</span>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800 }}>{money(it.price * it.qty)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#888', marginBottom: '5px' }}><span>Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span><span>{money(totals.subtotal)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#888', marginBottom: '5px' }}><span>{feeLabel}</span><span>{feeValue}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#888', marginBottom: '8px' }}><span>GST (incl.)</span><span>{money(totals.gst)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #EBEBEB', paddingTop: '8px' }}><span style={{ fontSize: '11px', fontWeight: 800 }}>Total</span><span style={{ fontSize: '16px', fontWeight: 900, color: '#FF5A1F' }}>{money(totals.total)}</span></div>
                </div>

                {/* Selected Fitting Station */}
                <div style={{ border: '1px solid #E7E5DE', borderRadius: '10px', padding: '10px', marginBottom: '11px' }}>
                  <span style={{ fontSize: '9.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}><IcoTag />Selected Fitting Station</span>
                  <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 800 }}>{selectedStore.name}</span>
                  <span style={{ display: 'block', fontSize: '9px', color: '#888', marginTop: '3px' }}>{selectedStore.address}{selectedStore.state ? `, ${selectedStore.state}` : ''}</span>
                  <div style={{ background: '#F7F7F7', border: '1px solid #E8E8E8', borderRadius: '8px', padding: '8px', marginTop: '8px', fontSize: '9px', color: '#555', lineHeight: 1.5 }}>
                    <b>Delivery — A$0.00</b><br />No shipping fee — sent directly to store.
                  </div>
                </div>

                {clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                        variables: {
                          colorPrimary: '#076330', colorBackground: '#ffffff', colorText: '#16211B',
                          colorDanger: '#C62828', fontFamily: "'DM Sans', sans-serif", borderRadius: '8px', spacingUnit: '4px',
                        },
                      },
                    }}
                  >
                    <MobileStripeForm onSuccess={handleSuccess} total={totals.total} billingDetails={stripeBillingDetails} />
                  </Elements>
                ) : (
                  <p style={{ fontSize: '10px', color: '#AAA', textAlign: 'center', padding: '12px 0', margin: 0 }}>Initializing secure payment…</p>
                )}

                <p style={{ fontSize: '9px', color: '#AAA', textAlign: 'center', margin: '8px 0 0' }}>
                  By placing your order you agree to our <Link href="/warranty" style={{ color: '#888', textDecoration: 'underline' }}>Terms of Service</Link>
                </p>

                {/* Order Notes */}
                <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: '11px', marginTop: '11px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 800, display: 'block', marginBottom: '6px' }}>Order Notes <span style={{ fontWeight: 400, color: '#999', fontSize: '9px' }}>(optional)</span></span>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value.slice(0, 300))}
                    placeholder="e.g. Please call me when my order arrives."
                    style={{ width: '100%', boxSizing: 'border-box', border: '1.4px solid #D8D8D8', borderRadius: '8px', height: '56px', padding: '9px', fontSize: '10.5px', resize: 'none', fontFamily: 'inherit', color: '#16211B', background: '#fff' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
