'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import StoreChat from '../chat/StoreChat'
import { C, FONT, CONTAINER, SECTION_PAD, KICKER, H2, CTA_GHOST } from '../shop/tokens'
import { STORES, telHref, fullAddress, type Store } from '../../../lib/stores'

/* The design shows three storefronts with a "view all" escape hatch. */
const FEATURED_COUNT = 3

function StoreCard({ store, onChat }: { store: Store; onChat: (s: Store) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', border: `1px solid ${C.line}`, borderRadius: '4px',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: hovered ? '0 10px 22px rgba(0,0,0,.10)' : 'none',
        transition: 'box-shadow .18s ease',
      }}
    >
      <div style={{ position: 'relative', height: '150px', background: '#E9E9E7' }}>
        {store.image ? (
          <Image src={store.image} alt={store.name} fill sizes="(max-width: 780px) 100vw, 380px" style={{ objectFit: 'cover' }} />
        ) : (
          /* No storefront photo for this branch yet — a branded panel reads
             better than a broken image frame. */
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.greenSoft, color: C.green, font: `800 22px ${FONT}`, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            {store.short}
          </div>
        )}
        <span style={{ position: 'absolute', right: '10px', bottom: '10px', background: '#fff', color: '#0A8A3A', fontSize: '11.5px', fontWeight: 800, letterSpacing: '.8px', borderRadius: '2px', padding: '5px 10px' }}>
          OPEN NOW
        </span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '9px', flex: 1 }}>
        <div style={{ font: `800 21px ${FONT}`, color: C.ink, textTransform: 'uppercase', letterSpacing: '.4px' }}>
          {store.name}
        </div>
        <div style={{ fontSize: '13.5px', color: C.muted }}>{fullAddress(store)}</div>

        <a href={telHref(store.tel)}
          style={{ textAlign: 'center', border: `1.5px solid ${C.green}`, borderRadius: '3px', padding: '11px', fontWeight: 700, fontSize: '14px', color: C.green, textDecoration: 'none' }}>
          {store.tel}
        </a>

        {/* Opens our own store chat (wired to /api/chat) rather than handing the
            conversation off to WhatsApp. */}
        <button type="button" onClick={() => onChat(store)}
          style={{ textAlign: 'center', border: `1.5px solid ${C.orange}`, borderRadius: '3px', padding: '11px', fontWeight: 700, fontSize: '14px', color: C.orangeDark, background: 'transparent', cursor: 'pointer', fontFamily: FONT }}>
          Chat with store
        </button>

        <Link href="/#locations" style={{ marginTop: 'auto', fontSize: '13.5px', fontWeight: 700, color: C.green, textDecoration: 'none' }}>
          View store →
        </Link>
      </div>
    </div>
  )
}

export default function FittingLocations() {
  const [chatStore, setChatStore] = useState<Store | null>(null)

  return (
    <section style={{ background: C.wash, padding: SECTION_PAD, fontFamily: FONT }}>
      <div style={CONTAINER}>
        <div style={{ marginBottom: '22px' }}>
          <div style={KICKER}>Fitted near you</div>
          <h2 style={H2}>Fitting locations</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '16px' }}>
          {STORES.slice(0, FEATURED_COUNT).map(s => (
            <StoreCard key={s.id} store={s} onChat={setChatStore} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '22px' }}>
          <Link href="/#locations" style={CTA_GHOST}>View all stores →</Link>
        </div>
      </div>

      {chatStore && (
        <StoreChat storeSlug={chatStore.id} storeName={chatStore.name} onClose={() => setChatStore(null)} />
      )}
    </section>
  )
}
