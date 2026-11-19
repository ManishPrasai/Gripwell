/* ────────────────────────────────────────────────────────────────────────────
   Money, fitting prices, VAT and cart totals — the single source of truth.
   The cart, checkout, confirmation, emails and the Stripe charge all go
   through `money()` and `computeTotals*()` below, so they cannot disagree.

   Business rules:
   • Every price shown (products AND fitting) is in GBP and INCLUDES 20% VAT,
     the way UK retail prices are expected to read. VAT is never added on top;
     the VAT figure is the share already inside the total.
   • Fitting is charged once PER WHEEL POSITION fitted, at a rate that depends
     on the vehicle type. A tyre mounted on a new wheel at the same corner is
     one job, so 4 tyres + 4 wheels = 4 fittings, not 8. Defaults below; per-store overrides come from the DB and
     fall back to these when a store has none.
   • Pickup (no fitting) → no fitting fee.

   Money is handled in pounds for display and in integer pence on the server so
   the Stripe charge is exact.
   ──────────────────────────────────────────────────────────────────────────── */

export type VehicleType = 'passenger' | 'suv' | 'commercial' | 'truck'
export type FulfilMethod = 'fit' | 'pickup'

export const VAT_RATE = 0.20
export const CURRENCY = 'GBP'

const GBP  = new Intl.NumberFormat('en-GB', { style: 'currency', currency: CURRENCY })
const GBP0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })

/** The one price formatter: £1,234.50. `whole` drops ".00" from round headline
    prices (£25) but never rounds real pence away (£120.50 stays £120.50). */
export const money = (n: number, opts?: { whole?: boolean }) =>
  (opts?.whole && Number.isInteger(n) ? GBP0 : GBP).format(n)

/** VAT contained in a VAT-inclusive amount (20% → 1/6 of the gross). */
export const vatIncluded = (gross: number) => gross - gross / (1 + VAT_RATE)

/** Per-tyre/wheel fitting rate by vehicle type (£, VAT incl.). Store overrides fall back here. */
export const DEFAULT_FITTING_PRICES: Record<VehicleType, number> = {
  passenger:  25,
  suv:        30,
  commercial: 35,
  truck:      50,
}

export const VEHICLE_TYPES: { id: VehicleType; label: string; desc: string }[] = [
  { id: 'passenger',  label: 'Passenger Car',   desc: 'Sedans, hatchbacks, coupes, wagons' },
  { id: 'suv',        label: 'SUV / LT / 4x4',  desc: 'SUVs, 4x4s and pickups' },
  { id: 'commercial', label: 'Commercial',       desc: 'Vans, light commercial vehicles' },
  { id: 'truck',      label: 'Truck',            desc: 'Heavy truck & large vehicles' },
]

export function isVehicleType(v: string): v is VehicleType {
  return v === 'passenger' || v === 'suv' || v === 'commercial' || v === 'truck'
}

/** Resolve a rate from a store's price map (Phase 2), falling back to defaults. */
export function fittingRate(vehicle: VehicleType, prices?: Partial<Record<VehicleType, number>> | null): number {
  const v = prices?.[vehicle]
  return typeof v === 'number' && v >= 0 ? v : DEFAULT_FITTING_PRICES[vehicle]
}

/** Stripe's smallest chargeable GBP amount. Below this the order is refused,
    never silently rounded up to more than the customer was shown. */
export const MIN_CHARGE_PENCE = 30

/* ── Pence — the authoritative maths. Stripe charges exactly totalCents. ──── */
export interface CartTotalsCents {
  subtotalCents: number   // products, VAT incl.
  vatCents:      number   // VAT contained in the total (not added)
  fittingCents:  number   // rate × items fitted, VAT incl. (0 when pickup)
  discountCents: number
  totalCents:    number   // what the customer pays
}

export function computeTotalsCents(opts: {
  subtotalCents:  number
  itemCount:      number
  fittingRate:    number   // pounds per item
  fit:            boolean
  discountCents?: number
}): CartTotalsCents {
  const fittingCents  = opts.fit ? Math.round(opts.fittingRate * 100) * Math.max(0, opts.itemCount) : 0
  const discountCents = opts.discountCents ?? 0
  const totalCents    = Math.max(0, opts.subtotalCents + fittingCents - discountCents)
  const vatCents      = Math.round(vatIncluded(totalCents))
  return { subtotalCents: opts.subtotalCents, vatCents, fittingCents, discountCents, totalCents }
}

/* ── Order quote: the ONE function the cart, checkout and the payment route all
   call, so the total shown is the total charged. ─────────────────────────── */
export interface QuoteLine { productType: string; quantity: number; unitPrice: number }

/** Wheel positions to fit: the larger of tyres and wheels (they pair up per corner). */
export function fittingPositions(lines: { productType: string; quantity: number }[]): number {
  let tyres = 0, wheels = 0
  for (const l of lines) {
    if (l.productType === 'tyre') tyres += l.quantity
    else if (l.productType === 'wheel') wheels += l.quantity
  }
  return Math.max(tyres, wheels)
}

export interface QuoteCents extends CartTotalsCents { positions: number; fitCount: number }

export function quoteOrderCents(opts: {
  lines:          QuoteLine[]
  fittingRate:    number          // pounds per wheel position
  fit:            boolean
  fitCount?:      number | null   // positions to fit now; default all, clamped to the basket
  discountCents?: number
}): QuoteCents {
  const subtotalCents = opts.lines.reduce((s, l) => s + Math.round(l.unitPrice * 100) * l.quantity, 0)
  const positions = fittingPositions(opts.lines)
  const want = opts.fitCount
  const fitCount = typeof want === 'number' && Number.isFinite(want)
    ? Math.max(0, Math.min(Math.floor(want), positions))
    : positions
  const t = computeTotalsCents({
    subtotalCents, itemCount: fitCount, fittingRate: opts.fittingRate, fit: opts.fit, discountCents: opts.discountCents,
  })
  return { ...t, positions, fitCount }
}

/* ── Pounds: the same quote for display (cart, checkout). ─────────────────── */
export interface CartTotals {
  subtotal: number
  vat:      number
  fitting:  number
  discount: number
  total:    number
}

export function quoteOrder(opts: {
  lines:       QuoteLine[]
  fittingRate: number
  fit:         boolean
  fitCount?:   number | null
}): CartTotals & { positions: number; fitCount: number } {
  const c = quoteOrderCents(opts)
  return {
    subtotal:  c.subtotalCents / 100,
    vat:       c.vatCents / 100,
    fitting:   c.fittingCents / 100,
    discount:  c.discountCents / 100,
    total:     c.totalCents / 100,
    positions: c.positions,
    fitCount:  c.fitCount,
  }
}
