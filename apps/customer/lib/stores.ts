/* ── Nova Tyres retail network ────────────────────────────────────────────
   One canonical store list. The footer, homepage locator, fitting-location
   cards, warranty contact card and cart store picker all read from here, so a
   new branch (or a changed phone number) is a single edit instead of five that
   drift apart.

   Addresses, phone numbers and coordinates come from the Cart / Warranty /
   FindWheels designs, which agree with each other and with the app's existing
   FittingLocations data. The earlier homepage-v3 file listed rounder addresses
   plus Brisbane and Adelaide branches; those two are not part of the network.
──────────────────────────────────────────────────────────────────────── */

export interface Store {
  id:      string
  /** Branch name on its own — "Springvale", not "Nova Tyres Springvale". */
  short:   string
  /** Full display name, used in map popups and contact cards. */
  name:    string
  state:   'VIC' | 'NSW'
  /** Street line only. */
  address: string
  /** Suburb + state + postcode. */
  suburb:  string
  tel:     string
  /** WhatsApp number in international form, digits only. */
  whatsapp: string
  lat:     number
  lng:     number
  /** Storefront photo, or null where we don't have one yet. */
  image:   string | null
}

export const STORES: Store[] = [
  { id: 'springvale', short: 'Springvale', name: 'Nova Tyres — Springvale', state: 'VIC', address: '4/134 Springvale Rd',   suburb: 'Springvale VIC 3171',       tel: '(03) 9562 4269', whatsapp: '61401531756', lat: -37.9439, lng: 145.1500, image: '/images/stores/springvale.jpg' },
  { id: 'dandenong',  short: 'Dandenong',  name: 'Nova Tyres — Dandenong',  state: 'VIC', address: '308 S Gippsland Hwy',  suburb: 'Dandenong South VIC 3175',  tel: '(03) 8787 5846', whatsapp: '61413792400', lat: -38.0080, lng: 145.2160, image: '/images/stores/dandenong.jpg' },
  { id: 'alphington', short: 'Alphington', name: 'Nova Tyres — Alphington', state: 'VIC', address: '200 Grange Rd',        suburb: 'Alphington VIC 3078',       tel: '(03) 7009 7700', whatsapp: '61403884151', lat: -37.7745, lng: 145.0330, image: '/images/stores/alphington.jpg' },
  { id: 'bayswater',  short: 'Bayswater',  name: 'Nova Tyres — Bayswater',  state: 'VIC', address: '194 Canterbury Rd',    suburb: 'Bayswater North VIC 3153',  tel: '(03) 9720 9354', whatsapp: '61411879425', lat: -37.8265, lng: 145.2865, image: '/images/stores/bayswater.jpg' },
  { id: 'sunshine',   short: 'Sunshine',   name: 'Nova Tyres — Sunshine',   state: 'VIC', address: '1B Berkshire Rd',      suburb: 'Sunshine North VIC 3020',   tel: '0401 199 224',   whatsapp: '61401199224', lat: -37.7660, lng: 144.8390, image: null },
  { id: 'geelong',    short: 'Geelong',    name: 'Nova Tyres — Geelong',    state: 'VIC', address: '7 Leather St',         suburb: 'Breakwater VIC 3219',       tel: '(03) 5248 6146', whatsapp: '61478698884', lat: -38.1700, lng: 144.3730, image: null },
  { id: 'sefton',     short: 'Sefton',     name: 'Nova Tyres — Sefton',     state: 'NSW', address: '107 Carlingford St',   suburb: 'Sefton NSW 2162',           tel: '0403 388 774',   whatsapp: '61403388774', lat: -33.8875, lng: 151.0035, image: '/images/stores/sefton.jpg' },
]

/** Distinct states we trade in, in the order they appear above. */
export const STORE_STATES_SERVED = Array.from(new Set(STORES.map(s => s.state)))

/** "7 stores across VIC & NSW" — derived so copy can never drift from the data. */
export const STORE_NETWORK_LABEL =
  `${STORES.length} stores across ${STORE_STATES_SERVED.join(' & ')}`

export const STORE_FILTERS = ['All', ...STORE_STATES_SERVED] as const
export type StoreFilter = typeof STORE_FILTERS[number]

/** Central switchboard, used when the caller has no specific branch in mind. */
export const NOVA_SWITCHBOARD      = '1300 11 NOVA'
export const NOVA_SWITCHBOARD_HREF = 'tel:1300116682'

/** Strips spaces, brackets and dashes so the number is dialable from a link. */
export function telHref(tel: string): string {
  return `tel:${tel.replace(/[^0-9+]/g, '')}`
}

export function waHref(store: Store): string {
  return `https://wa.me/${store.whatsapp}`
}

/** Full street address as one line — used for map queries and directions. */
export function fullAddress(store: Store): string {
  return `${store.address}, ${store.suburb}`
}

/** Google Maps turn-by-turn to a branch, resolved from the visitor's location. */
export function directionsHref(store: Store): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress(store))}`
}
