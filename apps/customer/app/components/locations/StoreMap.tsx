'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Store } from './StoreLocator'

/* ── Fix default Leaflet marker icons under Next.js (avoids 404s on bundled assets) ── */
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STADIA_TILE_URL =
  `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${process.env.NEXT_PUBLIC_STADIA_API_KEY}`

const STADIA_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> ' +
  '&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'

const DEFAULT_CENTER: [number, number] = [-33.8688, 145.0]
const DEFAULT_ZOOM   = 4

/* Custom brand-orange teardrop pins — glow against the slate basemap so
   stores read instantly; the active store gets a brighter, larger glow. */
function storeIcon(active: boolean) {
  const size = active ? 36 : 28
  return L.divIcon({
    className: '',
    html: `<span class="store-pin${active ? ' store-pin--active' : ''}" style="width:${size}px;height:${size}px"></span>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size],
    popupAnchor: [0, -size],
  })
}

/* ── Sub-component: syncs map view + popup with the selected store ──────────── */
function MapViewSync({
  selectedStore,
  markerRefs,
}: {
  selectedStore:  Store | null
  markerRefs:     React.MutableRefObject<Record<string, L.Marker | null>>
}) {
  const map = useMap()

  useEffect(() => {
    if (!selectedStore) return

    map.flyTo([selectedStore.lat, selectedStore.lng], 13, { duration: 1.1 })

    const marker = markerRefs.current[selectedStore.id]
    if (marker) {
      const t = setTimeout(() => marker.openPopup(), 600)
      return () => clearTimeout(t)
    }
  }, [selectedStore, map, markerRefs])

  return null
}

/* ── Map ─────────────────────────────────────────────────────────────────── */
interface StoreMapProps {
  stores:        Store[]
  selectedStore: Store | null
  onSelectStore: (store: Store) => void
}

export default function StoreMap({ stores, selectedStore, onSelectStore }: StoreMapProps) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({})

  return (
    <div
      className="relative w-full h-full after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:z-[1000] after:shadow-[inset_0_0_120px_rgba(15,23,42,0.12)]"
    >
      {/* Leaflet applies this className straight to each tile <img> — gives the
          basemap a clean, light luxury "Slate/Silver" dashboard tint that keeps
          street detail crisp and readable, without touching the tile source. */}
      <style>{`
        .map-tile-noir { filter: grayscale(100%) brightness(1.08) contrast(0.95) sepia(5%) hue-rotate(200deg); }
        .store-pin {
          display: block;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #f05a28;
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 0 12px rgba(240,90,40,0.45), 0 4px 10px rgba(0,0,0,0.25);
          transition: box-shadow 0.2s ease, background 0.2s ease;
        }
        .store-pin--active {
          background: #ff7849;
          box-shadow: 0 0 22px rgba(255,120,73,0.85), 0 6px 16px rgba(0,0,0,0.3);
        }
        .leaflet-control-zoom a {
          background: #ffffff !important;
          color: #1a1a1a !important;
          border: 1px solid rgba(0,0,0,0.12) !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }
        .leaflet-control-zoom a:hover { background: #f5f5f5 !important; }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 16px 40px rgba(0,0,0,0.2);
          border: 1px solid rgba(0,0,0,0.06);
        }
      `}</style>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url={STADIA_TILE_URL} attribution={STADIA_ATTRIBUTION} className="map-tile-noir" />

        {stores.map(store => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            icon={storeIcon(selectedStore?.id === store.id)}
            ref={ref => { markerRefs.current[store.id] = ref }}
            eventHandlers={{ click: () => onSelectStore(store) }}
          >
            <Popup>
              <div style={{ fontFamily: "'DM Sans', sans-serif", minWidth: '160px' }}>
                <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{store.name}</p>
                <p style={{ fontSize: '12px', color: '#555' }}>{store.address}</p>
                <p style={{ fontSize: '12px', color: '#555' }}>{store.suburb}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapViewSync selectedStore={selectedStore} markerRefs={markerRefs} />
      </MapContainer>
    </div>
  )
}
