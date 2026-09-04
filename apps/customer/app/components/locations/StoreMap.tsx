'use client'

import { useEffect, useState } from 'react'
import {
  APIProvider, Map, Marker, InfoWindow, useMap, useApiIsLoaded,
} from '@vis.gl/react-google-maps'

/*
  The map only needs a pin and a popup, so it asks for the minimum shape rather
  than the full Store record. That lets both the homepage locator (which passes
  lib/stores entries) and the PDP location band (which maps live API rows) feed
  the same component without either having to grow fields it doesn't have.
*/
export interface MappableStore {
  id:      string
  name:    string
  address: string
  suburb:  string
  lat:     number
  lng:     number
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

/* Australia, framed so all stores are on screen before a selection is made. */
const DEFAULT_CENTER = { lat: -35.5, lng: 147.5 }
const DEFAULT_ZOOM   = 5
const FOCUS_ZOOM     = 14

/* Desaturated basemap so the orange pins carry the colour. Legacy JSON styling
   is used deliberately: a `mapId` would move styling to the Cloud console and
   force Advanced Markers, which need extra setup for no visual gain here. */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',            stylers: [{ color: '#f4f4f3' }] },
  { elementType: 'labels.icon',         stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#6b6a64' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#ffffff' }] },
  { featureType: 'administrative',      elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi',                 stylers: [{ visibility: 'off' }] },
  { featureType: 'road',                elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial',       elementType: 'labels',   stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway',        elementType: 'geometry', stylers: [{ color: '#e9e9e7' }] },
  { featureType: 'road.local',          elementType: 'labels',   stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',             stylers: [{ visibility: 'off' }] },
  { featureType: 'water',               elementType: 'geometry', stylers: [{ color: '#d9e6dd' }] },
]

/* Teardrop pin drawn inline so it needs no hosted asset. The active store gets
   a larger, brighter pin with a white ring. */
function pinIcon(active: boolean): google.maps.Symbol {
  return {
    path: 'M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z',
    fillColor:     active ? '#ff7849' : '#f05a28',
    fillOpacity:   1,
    strokeColor:   '#ffffff',
    strokeWeight:  active ? 3 : 2,
    scale:         active ? 1.25 : 1,
    anchor:        new google.maps.Point(12, 36),
  }
}

/* Pans and zooms to the selected store. Split out because it must live inside
   <Map> to reach the map instance via useMap(). */
function MapViewSync({ selected }: { selected: MappableStore | null }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !selected) return
    map.panTo({ lat: selected.lat, lng: selected.lng })
    /* Only zoom in — never yank a user who has zoomed out further than this. */
    if ((map.getZoom() ?? 0) < FOCUS_ZOOM) map.setZoom(FOCUS_ZOOM)
  }, [map, selected])

  return null
}

/* Frames every pin on first load so all stores are visible without panning. */
function FitAllOnce({ stores }: { stores: MappableStore[] }) {
  const map = useMap()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!map || done || stores.length === 0) return
    if (stores.length === 1) {
      map.setCenter({ lat: stores[0].lat, lng: stores[0].lng })
      map.setZoom(FOCUS_ZOOM)
    } else {
      const bounds = new google.maps.LatLngBounds()
      stores.forEach(s => bounds.extend({ lat: s.lat, lng: s.lng }))
      map.fitBounds(bounds, 48)
    }
    setDone(true)
  }, [map, stores, done])

  return null
}

/* Renders every pin + the open InfoWindow. Split out because pinIcon() touches
   `google.maps.*`, which only exists once the Maps JS API script has finished
   loading — <Marker> itself defers safely, but a prop expression like
   `icon={pinIcon(...)}` still runs immediately during render regardless.
   useApiIsLoaded() re-renders this once the script is ready, so pinIcon()
   never runs while `google` is still undefined. */
function StoreMarkers<T extends MappableStore>({
  stores, selectedStore, onSelectStore, openId, setOpenId,
}: {
  stores:        T[]
  selectedStore: T | null
  onSelectStore: (store: T) => void
  openId:        string | null
  setOpenId:     (id: string | null) => void
}) {
  const apiIsLoaded = useApiIsLoaded()
  if (!apiIsLoaded) return null

  const open = stores.find(s => s.id === openId) ?? null

  return (
    <>
      {stores.map(store => (
        <Marker
          key={store.id}
          position={{ lat: store.lat, lng: store.lng }}
          title={store.name}
          icon={pinIcon(selectedStore?.id === store.id)}
          zIndex={selectedStore?.id === store.id ? 10 : 1}
          onClick={() => { onSelectStore(store); setOpenId(store.id) }}
        />
      ))}

      {open && (
        <InfoWindow
          position={{ lat: open.lat, lng: open.lng }}
          pixelOffset={[0, -38]}
          onCloseClick={() => setOpenId(null)}
        >
          <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", minWidth: '160px' }}>
            <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 2px', color: '#1B1C1E' }}>{open.name}</p>
            <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{open.address}</p>
            <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>{open.suburb}</p>
          </div>
        </InfoWindow>
      )}
    </>
  )
}

interface StoreMapProps<T extends MappableStore> {
  stores:        T[]
  selectedStore: T | null
  onSelectStore: (store: T) => void
  /** Plain default Google Maps styling (full street/place labels) instead of
   *  the muted basemap — for a single-store locator view where the customer
   *  needs real navigation detail rather than a multi-pin overview. */
  fullDetail?: boolean
}

/* Shown when the key is absent so a missing env var degrades to a readable
   panel rather than a blank grey box or a console full of Google errors. */
function MapUnavailable() {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '260px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#EAF3ED', color: '#4E6B58', textAlign: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif", fontSize: '13.5px',
      lineHeight: 1.6, padding: '24px',
    }}>
      <span>
        Map unavailable.<br />
        Pick a store from the list — phone numbers and directions still work.
      </span>
    </div>
  )
}

/* Generic over the store shape so onSelectStore hands callers back their own
   record type, not a narrowed one they'd have to re-widen. */
export default function StoreMap<T extends MappableStore>({
  stores, selectedStore, onSelectStore, fullDetail,
}: StoreMapProps<T>) {
  /* Which pin's InfoWindow is open. Tracked by id so it survives the parent
     re-rendering with a fresh store array. */
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => { setOpenId(selectedStore?.id ?? null) }, [selectedStore])

  if (!API_KEY) return <MapUnavailable />

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          styles={fullDetail ? undefined : MAP_STYLES}
          disableDefaultUI
          zoomControl
          gestureHandling="cooperative"
          clickableIcons={false}
          style={{ width: '100%', height: '100%' }}
        >
          <StoreMarkers
            stores={stores}
            selectedStore={selectedStore}
            onSelectStore={onSelectStore}
            openId={openId}
            setOpenId={setOpenId}
          />

          <FitAllOnce stores={stores} />
          <MapViewSync selected={selectedStore} />
        </Map>
      </APIProvider>
    </div>
  )
}
