'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MappableStore {
  id:      string
  name:    string
  address: string
  suburb:  string
  lat:     number
  lng:     number
}

const DEFAULT_CENTER: [number, number] = [51.505, -0.09]
const DEFAULT_ZOOM   = 11
const FOCUS_ZOOM     = 14

/* Fix Leaflet's default icon path broken by webpack asset hashing. */
function fixLeafletIcons() {
  if (typeof window === 'undefined') return
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}
fixLeafletIcons()

function MapController({ selected }: { selected: MappableStore | null }) {
  const map = useMap()
  useEffect(() => {
    if (!selected) return
    map.setView([selected.lat, selected.lng], Math.max(map.getZoom(), FOCUS_ZOOM))
  }, [map, selected])
  return null
}

function FitAll({ stores }: { stores: MappableStore[] }) {
  const map  = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (done.current || stores.length === 0) return
    if (stores.length === 1) {
      map.setView([stores[0].lat, stores[0].lng], FOCUS_ZOOM)
    } else {
      map.fitBounds(stores.map(s => [s.lat, s.lng] as [number, number]), { padding: [48, 48] })
    }
    done.current = true
  }, [map, stores])
  return null
}

interface StoreMapProps<T extends MappableStore> {
  stores:        T[]
  selectedStore: T | null
  onSelectStore: (store: T) => void
  fullDetail?:   boolean
  interactive?:  boolean
}

export default function StoreMap<T extends MappableStore>({
  stores, selectedStore, onSelectStore, interactive = true,
}: StoreMapProps<T>) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '260px' }}>
      <style>{`
        .leaflet-container { font-family: 'DM Sans', system-ui, sans-serif; }
        .leaflet-popup-content-wrapper { border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,.12); }
        .leaflet-popup-content { margin: 12px 14px; }
      `}</style>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%', minHeight: '260px' }}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        touchZoom={interactive}
        keyboard={interactive}
        attributionControl
      >
        <TileLayer
          /* OpenStreetMap standard tiles: no API key. CARTO basemaps now return an
             "API KEY REQUIRED" watermark tile, so they were dropped. OSM's tile
             policy requires the visible attribution below. */
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {stores.map(store => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            eventHandlers={{ click: () => onSelectStore(store) }}
          >
            <Popup>
              <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 2px', color: '#1B1C1E' }}>{store.name}</p>
              <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{store.address}</p>
              <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{store.suburb}</p>
            </Popup>
          </Marker>
        ))}

        <FitAll stores={stores} />
        <MapController selected={selectedStore} />
      </MapContainer>
    </div>
  )
}
