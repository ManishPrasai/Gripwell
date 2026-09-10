'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { STORES } from '../../../../lib/stores'
import type { MappableStore } from '../../locations/StoreMap'

/*
  The "Find a store" map from the Mobile Hero artboard — a 240px pinned map
  above the branch list (the artboard shows a static "map with pins" panel).

  It's a preview, not a workspace: gestures are off (no "ctrl + scroll" /
  "two fingers to move the map" hint, and it never traps page scroll) and the
  whole panel taps through to the full locator. Lazy + client-only so it
  costs the desktop tree nothing and only loads once a phone visitor scrolls
  this far. Reuses the app's canonical StoreMap so pins and styling match the
  desktop locator.
*/
const StoreMap = dynamic(() => import('../../locations/StoreMap'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#e9e6dc' }} />,
})

const PINS: MappableStore[] = STORES.map(s => ({
  id: s.id, name: s.name, address: s.address, suburb: s.suburb, lat: s.lat, lng: s.lng,
}))

export default function MobileStoreMap() {
  return (
    <div style={{ borderRadius: '12px', overflow: 'hidden', position: 'relative', height: '240px', background: '#e9e6dc', marginBottom: '14px' }}>
      <StoreMap stores={PINS} selectedStore={null} onSelectStore={() => {}} interactive={false} />

      {/* Transparent catcher so a tap opens the full locator rather than
          nudging the (non-interactive) map. The visible "View all N
          locations" link sits just below this panel in MobileHome. */}
      <Link
        href="/service?goto=shops"
        aria-label={`Open the store locator — ${STORES.length} locations`}
        style={{ position: 'absolute', inset: 0, zIndex: 2 }}
      />
    </div>
  )
}
