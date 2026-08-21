/* ────────────────────────────────────────────────────────────────────────────
   Fitting prices, GST and cart totals — the single source of truth.

   Business rules (confirmed with the client):
   • Fitting is charged PER tyre/wheel fitted, at a rate that depends on the
     vehicle type. Defaults below; per-store overrides come from the DB (Phase 2)
     and fall back to these when a store has none.
   • GST is 10%, ADDED on top of the product subtotal (products are treated as
     GST-exclusive). GST is NOT charged on the fitting service.
   • Pickup (no fitting) → no fitting fee.

   Money is handled in dollars for display and in integer cents on the server so
   the Stripe charge is exact.
   ──────────────────────────────────────────────────────────────────────────── */

export type VehicleType = 'passenger' | 'suv' | 'commercial' | 'truck'
export type FulfilMethod = 'fit' | 'pickup'

export const GST_RATE = 0.10

/** Per-tyre/wheel fitting rate by vehicle type (A$). Store overrides fall back here. */
export const DEFAULT_FITTING_PRICES: Record<VehicleType, number> = {
  passenger:  25,
  suv:        30,
  commercial: 35,
  truck:      50,
}

export const VEHICLE_TYPES: { id: VehicleType; label: string; desc: string }[] = [
  { id: 'passenger',  label: 'Passenger Car',   desc: 'Sedans, hatchbacks, coupes, wagons' },
  { id: 'suv',        label: 'SUV / LT / 4x4',  desc: 'SUV, light trucks, 4WDs' },
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

const round2 = (n: number) => Math.round(n * 100) / 100

export interface CartTotals {
  subtotal: number   // products only (GST-exclusive)
  gst:      number   // 10% of subtotal
  fitting:  number   // rate × itemCount (0 when pickup)
  discount: number
  total:    number
}

/** Display-side totals in dollars. `itemCount` is the total tyres+wheels fitted. */
export function computeTotals(opts: {
  subtotal:    number
  itemCount:   number
  fittingRate: number
  fit:         boolean
  discount?:   number
}): CartTotals {
  const subtotal = round2(opts.subtotal)
  const gst      = round2(subtotal * GST_RATE)
  const fitting  = opts.fit ? round2(opts.fittingRate * opts.itemCount) : 0
  const discount = round2(opts.discount ?? 0)
  const total    = round2(Math.max(0, subtotal + gst + fitting - discount))
  return { subtotal, gst, fitting, discount, total }
}

/* ── Server (cents) — authoritative Stripe amount ──────────────────────────── */
export interface CartTotalsCents {
  subtotalCents: number
  gstCents:      number
  fittingCents:  number
  discountCents: number
  totalCents:    number
}

/** Server-side totals in integer cents. `subtotalCents` and `discountCents`
    are already integers; GST and fitting are derived and rounded to the cent. */
export function computeTotalsCents(opts: {
  subtotalCents: number
  itemCount:     number
  fittingRate:   number   // dollars per item
  fit:           boolean
  discountCents?: number
}): CartTotalsCents {
  const gstCents      = Math.round(opts.subtotalCents * GST_RATE)
  const fittingCents  = opts.fit ? Math.round(opts.fittingRate * 100) * opts.itemCount : 0
  const discountCents = opts.discountCents ?? 0
  const totalCents    = Math.max(50, opts.subtotalCents + gstCents + fittingCents - discountCents)
  return { subtotalCents: opts.subtotalCents, gstCents, fittingCents, discountCents, totalCents }
}
