'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
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

/* One brand pin for every branch (Gripwell orange, graphite dot). A divIcon
   needs no image assets, so there is no broken default-icon path to patch. */
const PIN = L.divIcon({
  className: '',
  html: '<svg width="28" height="38" viewBox="0 0 28 38" aria-hidden="true"><path d="M14 1C7 1 1.5 6.5 1.5 13.4 1.5 22.6 14 37 14 37s12.5-14.4 12.5-23.6C26.5 6.5 21 1 14 1Z" fill="var(--gw-orange)" stroke="#fff" stroke-width="2"/><circle cx="14" cy="13.5" r="4.6" fill="var(--gw-graphite)"/></svg>',
  iconSize:    [28, 38],
  iconAnchor:  [14, 37],
  popupAnchor: [0, -34],
})

function MapController({ selected }: { selected: MappableStore | null }) {
  const map = useMap()
  useEffect(() => {
    if (!selected) return
    map.setView([selected.lat, selected.lng], Math.max(map.getZoom(), FOCUS_ZOOM))
  }, [map, selected])
  return null
}

function FitAll({ stores, reserveBottom }: { stores: MappableStore[]; reserveBottom: number }) {
  const map  = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (done.current || stores.length === 0) return
    if (stores.length === 1) {
      map.setView([stores[0].lat, stores[0].lng], FOCUS_ZOOM)
    } else {
      map.fitBounds(stores.map(s => [s.lat, s.lng] as [number, number]), { paddingTopLeft: [32, 40], paddingBottomRight: [32, 32 + reserveBottom] })
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
  stores, selectedStore, onSelectStore, interactive = true, fullDetail = false,
}: StoreMapProps<T>) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '260px' }}>
      <style>{`
        .leaflet-container { font-family: var(--gw-font); }
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
            icon={PIN}
            eventHandlers={{ click: () => onSelectStore(store) }}
          >
            <Popup>
              <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 2px', color: '#1B1C1E' }}>{store.name}</p>
              <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{store.address}</p>
              <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{store.suburb}</p>
            </Popup>
          </Marker>
        ))}

        {/* fullDetail maps carry a floating detail card along the bottom edge; keep pins clear of it */}
        <FitAll stores={stores} reserveBottom={fullDetail ? 96 : 0} />
        <MapController selected={selectedStore} />
      </MapContainer>
    </div>
  )
}
