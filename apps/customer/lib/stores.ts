/* ── Gripwell retail network ────────────────────────────────────────
   One canonical store list. The footer, homepage locator, fitting-location
   cards, warranty contact card and cart store picker all read from here, so a
   new branch (or a changed phone number) is a single edit instead of five that
   drift apart.
──────────────────────────────────────────────────────────────────────── */

export interface Store {
  id:      string
  /** Branch name on its own — "Camden", not "Torque & Tread Camden". */
  short:   string
  /** Full display name, used in map popups and contact cards. */
  name:    string
  state:   'North' | 'South' | 'East' | 'West' | 'Central'
  /** Street line only. */
  address: string
  /** Area + postcode. */
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
  { id: 'camden',      short: 'Camden',      name: 'Gripwell Camden',      state: 'North',   address: '14 Kentish Town Rd',   suburb: 'Camden NW1 9NX',         tel: '+44 20 7946 0101', whatsapp: '442079460101', lat: 51.5417, lng: -0.1428, image: '/images/stores/camden.jpg' },
  { id: 'shoreditch',  short: 'Shoreditch',  name: 'Gripwell Shoreditch',  state: 'East',    address: '82 Brick Lane',         suburb: 'Shoreditch E1 6RL',      tel: '+44 20 7946 0202', whatsapp: '442079460202', lat: 51.5226, lng: -0.0718, image: '/images/stores/shoreditch.jpg' },
  { id: 'brixton',     short: 'Brixton',     name: 'Gripwell Brixton',     state: 'South',   address: '31 Atlantic Rd',        suburb: 'Brixton SW9 8HX',        tel: '+44 20 7946 0303', whatsapp: '442079460303', lat: 51.4613, lng: -0.1156, image: '/images/stores/brixton.jpg' },
  { id: 'hammersmith', short: 'Hammersmith', name: 'Gripwell Hammersmith', state: 'West',    address: '5 King St',             suburb: 'Hammersmith W6 9HR',     tel: '+44 20 7946 0404', whatsapp: '442079460404', lat: 51.4927, lng: -0.2239, image: '/images/stores/hammersmith.jpg' },
  { id: 'islington',   short: 'Islington',   name: 'Gripwell Islington',   state: 'North',   address: '118 Upper St',          suburb: 'Islington N1 1QP',       tel: '+44 20 7946 0505', whatsapp: '442079460505', lat: 51.5363, lng: -0.1032, image: null },
  { id: 'greenwich',   short: 'Greenwich',   name: 'Gripwell Greenwich',   state: 'East',    address: '47 Greenwich High Rd',  suburb: 'Greenwich SE10 8JL',     tel: '+44 20 7946 0606', whatsapp: '442079460606', lat: 51.4769, lng: -0.0004, image: null },
  { id: 'citycentre',  short: 'City',        name: 'Gripwell City', state: 'Central', address: '9 Cheapside',           suburb: 'City of London EC2V 6AA', tel: '+44 20 7946 0707', whatsapp: '442079460707', lat: 51.5138, lng: -0.0934, image: '/images/stores/citycentre.jpg' },
]

/** Distinct areas we trade in, in the order they appear above. */
export const STORE_STATES_SERVED = Array.from(new Set(STORES.map(s => s.state)))

/** "7 stores across London" — derived so copy can never drift from the data. */
export const STORE_NETWORK_LABEL = `${STORES.length} stores across London`

export const STORE_FILTERS = ['All', ...STORE_STATES_SERVED] as const
export type StoreFilter = typeof STORE_FILTERS[number]

/** Central switchboard, used when the caller has no specific branch in mind. */
export const NOVA_SWITCHBOARD      = '+44 20 7946 0800'
export const NOVA_SWITCHBOARD_HREF = 'tel:+442079460800'

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
