/* Fitting-price constants (mirror of apps/customer/lib/fitting.ts). Kept small
   and dependency-free; the customer app owns the pricing math. */

export type VehicleType = 'passenger' | 'suv' | 'commercial' | 'truck'

export const DEFAULT_FITTING_PRICES: Record<VehicleType, number> = {
  passenger:  25,
  suv:        30,
  commercial: 35,
  truck:      50,
}

export const VEHICLE_TYPES: { id: VehicleType; label: string }[] = [
  { id: 'passenger',  label: 'Passenger Car' },
  { id: 'suv',        label: 'SUV / LT / 4x4' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'truck',      label: 'Truck' },
]

export function isVehicleType(v: string): v is VehicleType {
  return v === 'passenger' || v === 'suv' || v === 'commercial' || v === 'truck'
}
