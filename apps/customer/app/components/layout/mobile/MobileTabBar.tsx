'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '../../../context/CartContext'
import MobileHeader from '../../home/mobile/MobileHeader'
import MobileShopView from '../../home/mobile/MobileShopView'
import MobileSearchView from '../../home/mobile/MobileSearchView'

/*
  Fixed 5-tab bottom nav from the mobile artboards. Only rendered inside the
  [data-vw="mobile"] tree, so it never coexists with the desktop Navbar.

  Home / Shop / Search are in-page views, exactly as the artboard models them
  (goShop → view:'shop', etc.) — Shop and Search open a full-height overlay
  above the home content, keeping the green header and this bar in place.
  Cart / Account are real routes. The Cart tab carries a live count badge.
*/

type Overlay = 'shop' | 'search' | null

const ICONS = {
  home:   <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
  shop:   <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></>,
  cart:   <><path d="M3 3h2.2l2.1 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 7H6" /><circle cx="10" cy="20" r="1.4" /><circle cx="17.5" cy="20" r="1.4" /></>,
  account: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
} as const

const tabStyle = (active: boolean): React.CSSProperties => ({
  position: 'relative', border: 'none', background: 'none', cursor: 'pointer',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '9px 2px',
  textDecoration: 'none', color: active ? '#F1EFE7' : '#7C9084', fontFamily: "'DM Sans', sans-serif",
})

function TabInner({ icon, label, badge }: { icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <>
      <span style={{ position: 'relative' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {icon}
        </svg>
        {badge != null && badge > 0 && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-9px', minWidth: '15px', height: '15px',
            padding: '0 3px', borderRadius: '999px', background: '#E8572A', color: '#fff',
            fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {badge}
          </span>
        )}
      </span>
      <span style={{ fontSize: '10px', fontWeight: 600 }}>{label}</span>
    </>
  )
}

/* `active` is the resting highlight when no overlay is open — set it to the
   nav slot the current route belongs to ("shop" on /tyres, /wheels, …). */
export default function MobileTabBar({ active = 'home' }: { active?: 'home' | 'shop' | 'search' } = {}) {
  const { cartCount } = useCart()
  const [overlay, setOverlay] = useState<Overlay>(null)

  // Lock the page behind the overlay so only its own area scrolls.
  useEffect(() => {
    if (!overlay) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [overlay])

  const activeKey = overlay ?? active

  return (
    <>
      {overlay && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 70, maxWidth: '480px', margin: '0 auto',
            background: '#FAF9F5', display: 'flex', flexDirection: 'column',
          }}
        >
          <MobileHeader />
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '62px' }}>
            {overlay === 'shop'
              ? <MobileShopView onNavigate={() => setOverlay(null)} />
              : <MobileSearchView onNavigate={() => setOverlay(null)} />}
          </div>
        </div>
      )}

      <nav
        aria-label="Primary"
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', background: '#12241A',
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 80,
          maxWidth: '480px', margin: '0 auto',
          boxShadow: '0 -6px 16px rgba(0,0,0,.25)', paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Link href="/" onClick={() => setOverlay(null)} aria-current={activeKey === 'home' ? 'page' : undefined} style={tabStyle(activeKey === 'home')}>
          <TabInner icon={ICONS.home} label="Home" />
        </Link>
        <button type="button" onClick={() => setOverlay('shop')} aria-current={activeKey === 'shop' ? 'page' : undefined} style={tabStyle(activeKey === 'shop')}>
          <TabInner icon={ICONS.shop} label="Shop" />
        </button>
        <button type="button" onClick={() => setOverlay('search')} aria-current={activeKey === 'search' ? 'page' : undefined} style={tabStyle(activeKey === 'search')}>
          <TabInner icon={ICONS.search} label="Search" />
        </button>
        <Link href="/cart" onClick={() => setOverlay(null)} aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`} style={tabStyle(false)}>
          <TabInner icon={ICONS.cart} label="Cart" badge={cartCount} />
        </Link>
        <Link href="/account" onClick={() => setOverlay(null)} style={tabStyle(false)}>
          <TabInner icon={ICONS.account} label="Account" />
        </Link>
      </nav>
    </>
  )
}
