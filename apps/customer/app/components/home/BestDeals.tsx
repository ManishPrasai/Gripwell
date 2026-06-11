'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

// ─── Brand logo map ────────────────────────────────────────────────────────
const BRAND_LOGOS: Record<string, string> = {
  'continental':  '/images/brands/continental.svg',
  'hankook':      '/images/brands/hankook.svg',
  'pirelli':      '/images/brands/pirelli.svg',
  'maxxis':       '/images/brands/maxxis.svg',
  'yokohama':     '/images/brands/yokohama.svg',
  'bf goodrich':  '/images/brands/bfgoodrich.svg',
  'bfgoodrich':   '/images/brands/bfgoodrich.svg',
  'black rhino':  '/images/brands/Black Rino.svg',
  'roh':          '/images/brands/roh.svg',
  'king wheels':  '/images/brands/king-wheels.svg',
  'sonix':        '/images/brands/sonix.svg',
  'nitto':        '/images/brands/nitto.svg',
  'atlander':     '/images/brands/atlander.svg',
}

function getBrandLogo(brand: string): string {
  return BRAND_LOGOS[brand.toLowerCase()] ?? '/images/brands/continental.svg'
}

// ─── Shared card shape ─────────────────────────────────────────────────────
interface Product {
  id:        string
  brand:     string
  brandLogo: string
  model:     string
  size:      string
  spec:      string
  price:     number
  slug:      string
  image:     string
  tab:       'tyres' | 'wheels'
}

// ─── API response types ────────────────────────────────────────────────────
interface TyreItem {
  id:    string
  brand: string
  model: string
  slug:  string
  price: string | number
  tyreSize: {
    width:       number
    profile:     number
    rimDiameter: number
    loadIndex:   number | null
    speedRating: string | null
  }
  images: { url: string; altText: string | null }[]
}

interface WheelItem {
  id:       string
  brand:    string
  model:    string
  slug:     string
  price:    string | number
  diameter: number
  width:    string | number
  pcd:      string
  images:   { url: string; altText: string | null }[]
}

// ─── Mappers ───────────────────────────────────────────────────────────────
function mapTyre(t: TyreItem): Product {
  const { width, profile, rimDiameter, loadIndex, speedRating } = t.tyreSize
  return {
    tab:       'tyres',
    id:        t.slug,              // raw slug → used as CartItem.productId for price lookup
    brand:     t.brand,
    brandLogo: getBrandLogo(t.brand),
    model:     t.model,
    size:      `${width}/${profile}R${rimDiameter}`,
    spec:      loadIndex && speedRating ? `${loadIndex}${speedRating}` : speedRating ?? '',
    price:     parseFloat(String(t.price)),
    slug:      `/tyres/${t.slug}`,  // URL path for navigation links only
    image:     t.images[0]?.url ?? '/images/tyres/tyre-passenger.png',
  }
}

function mapWheel(w: WheelItem): Product {
  return {
    tab:       'wheels',
    id:        w.slug,              // raw slug → used as CartItem.productId for price lookup
    brand:     w.brand,
    brandLogo: getBrandLogo(w.brand),
    model:     w.model,
    size:      `${w.diameter}" × ${parseFloat(String(w.width)).toFixed(1)}J`,
    spec:      w.pcd,
    price:     parseFloat(String(w.price)),
    slug:      `/wheels/${w.slug}`, // URL path for navigation links only
    image:     w.images[0]?.url ?? '/images/wheel/Wheel 1.png',
  }
}

// ─── Layout constant ───────────────────────────────────────────────────────
const BUTTON_AREA_H = 54

// ─── Skeleton card ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      style={{
        height:       '380px',
        borderRadius: '16px',
        border:       '1px solid #E5E5E5',
        background:   '#fff',
        overflow:     'hidden',
      }}
    >
      <div style={{ height: '220px', background: '#F0F0F0', margin: '16px 16px 0' }} />
      <div style={{ padding: '14px 16px' }}>
        <div style={{ width: '64px', height: '20px', background: '#F0F0F0', borderRadius: '4px', marginBottom: '12px' }} />
        <div style={{ width: '80%',  height: '16px', background: '#F0F0F0', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ width: '50%',  height: '14px', background: '#F0F0F0', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function BestDeals() {
  const [tab,          setTab]          = useState<'tyres' | 'wheels'>('tyres')
  const [hoveredCard,  setHoveredCard]  = useState<number | null>(null)
  const [addedId,      setAddedId]      = useState<string | null>(null)
  const [tyreProducts, setTyreProducts] = useState<Product[]>([])
  const [wheelProducts,setWheelProducts]= useState<Product[]>([])
  const [loading,      setLoading]      = useState(true)
  const { addToCart } = useCart()

  /* Sliding pill behind the active Tyres/Wheels toggle button — measured from
     the actual button rects so it tracks perfectly regardless of label width. */
  const segRefs = useRef<Record<'tyres' | 'wheels', HTMLButtonElement | null>>({ tyres: null, wheels: null })
  const [segIndicator, setSegIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    function measure() {
      const el = segRefs.current[tab]
      if (el) setSegIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [tab])

  useEffect(() => {
    Promise.all([
      fetch('/api/tyres/bestsellers?limit=4').then(r => r.json()),
      fetch('/api/wheels?limit=4').then(r => r.json()),
    ])
      .then(([tyreData, wheelData]) => {
        if (Array.isArray(tyreData.tyres))  setTyreProducts(tyreData.tyres.map(mapTyre))
        if (Array.isArray(wheelData.wheels)) setWheelProducts(wheelData.wheels.map(mapWheel))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  function handleAddToCart(e: React.MouseEvent, product: Product) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id:          product.id,   // raw slug, matches Tyre/Wheel.slug in DB
      productType: product.tab === 'tyres' ? 'tyre' : 'wheel',
      brand:       product.brand,
      brandLogo:   product.brandLogo,
      model:       product.model,
      size:        product.size,
      spec:        product.spec,
      price:       product.price,
      image:       product.image,
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1400)
  }

  const visible = tab === 'tyres' ? tyreProducts : wheelProducts

  return (
    <section
      style={{
        background:    '#FAF9F5',
        marginTop:     '-32px',
        position:      'relative',
        zIndex:         10,
        borderRadius:  '16px 16px 0 0',
        boxShadow:     '0 -4px 20px rgba(0,0,0,0.08)',
        paddingTop:    '76px',
        paddingBottom: '48px',
      }}
    >
      {/* Tab-switch transitions — each grid always enters from its own side:
          Tyres glides in right to left, Wheels glides in left to right. */}
      <style>{`
        @keyframes bdSlideFromLeft {
          from { opacity: 0; transform: translateX(-28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bdSlideFromRight {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .bd-grid-tyres  { animation: bdSlideFromRight 0.38s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .bd-grid-wheels { animation: bdSlideFromLeft  0.38s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>

      {/* Core Page Container — .nv-shell: the one shared 1280px content
          boundary with fixed gutter guards, identical on every page. */}
      <div className="nv-shell">

        {/* ── Header row ── */}
        <div data-reveal className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2
            style={{
              color:         '#1A1A1A',
              fontFamily:    "'Bebas Neue', sans-serif",
              fontSize:      'clamp(28px, 4vw, 40px)',
              letterSpacing: '0.02em',
              lineHeight:     1.1,
            }}
          >
            Best deals on tyres &amp; wheels
          </h2>

          {/* Tyres / Wheels toggle — sliding pill glides between buttons,
              measured from the actual button rects so it tracks label width. */}
          <div
            className="relative inline-flex gap-1 p-1"
            style={{ border: '1px solid #E5E5E5', borderRadius: '8px', background: '#fff' }}
          >
            <div
              className="absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out pointer-events-none"
              style={{ left: `${segIndicator.left}px`, width: `${segIndicator.width}px`, background: '#E8572A' }}
            />
            {(['tyres', 'wheels'] as const).map(t => {
              const active = tab === t
              return (
                <button
                  key={t}
                  ref={el => { segRefs.current[t] = el }}
                  onClick={() => setTab(t)}
                  className="relative z-10 cursor-pointer transition-colors duration-300 ease-out"
                  style={{
                    padding:       '8px 20px',
                    background:    'transparent',
                    color:         active ? '#fff' : '#888',
                    fontFamily:    "'DM Sans', sans-serif",
                    fontSize:      '12px',
                    fontWeight:     700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    border:        'none',
                    borderRadius:  '6px',
                  }}
                >
                  {t === 'tyres' ? 'Tyres' : 'Wheels'}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Product grid — keyed per tab so React remounts the panel and
              re-triggers its directional slide-in animation on every toggle ── */}
        <div key={tab} className={`grid grid-cols-2 md:grid-cols-4 gap-4 bd-grid-${tab}`}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : visible.map((product, i) => {
                const isHovered = hoveredCard === i
                return (
                  <Link
                    key={product.id}
                    href={product.slug}
                    style={{ textDecoration: 'none' }}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/*
                      Card — fixed height + overflow:hidden is the layout lock.
                      All three inner layers (image, info, button) are absolutely
                      positioned so they can never push each other around.
                    */}
                    <div
                      style={{
                        position:   'relative',
                        overflow:   'hidden',
                        background: '#fff',
                        borderRadius: '16px',
                        border:     '1px solid #E5E5E5',
                        height:     '380px',
                        boxShadow:  isHovered
                          ? '0 12px 40px rgba(0,0,0,0.14)'
                          : '0 1px 4px rgba(0,0,0,0.04)',
                        transition: 'box-shadow 0.3s ease',
                      }}
                    >

                      {/* ── Layer 1: Product image ── */}
                      <div
                        style={{
                          position:       'absolute',
                          inset:           0,
                          paddingTop:     '20px',
                          paddingBottom:  '160px',
                          display:        'flex',
                          alignItems:     'center',
                          justifyContent: 'center',
                          perspective:    '700px',
                        }}
                      >
                        <Image
                          src={product.image}
                          alt={`${product.brand} ${product.model}`}
                          width={320}
                          height={260}
                          style={{
                            objectFit:      'contain',
                            width:          '90%',
                            height:         '100%',
                            transformStyle: 'preserve-3d',
                            transform: isHovered
                              ? 'translateZ(-60px) scale(0.86)'
                              : 'translateZ(0px)   scale(1)',
                            transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
                          }}
                        />
                      </div>

                      {/* ── Layer 2: Info (brand logo · name · spec) ── */}
                      <div
                        style={{
                          position:   'absolute',
                          bottom:      0,
                          left:        0,
                          right:       0,
                          background: '#fff',
                          padding:    '14px 16px 10px',
                          transform:  isHovered ? `translateY(-${BUTTON_AREA_H}px)` : 'translateY(0)',
                          transition: 'transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94)',
                        }}
                      >
                        <div
                          style={{
                            display:      'inline-flex',
                            alignItems:   'center',
                            border:       '1px solid #E5E5E5',
                            borderRadius: '6px',
                            padding:      '3px 10px',
                            background:   '#fff',
                            height:       '28px',
                            marginBottom: '8px',
                          }}
                        >
                          <Image
                            src={product.brandLogo}
                            alt={product.brand}
                            width={72}
                            height={16}
                            style={{ objectFit: 'contain', height: '14px', width: 'auto' }}
                          />
                        </div>

                        <p
                          style={{
                            color:        '#1A1A1A',
                            fontFamily:   "'DM Sans', sans-serif",
                            fontSize:     '15px',
                            fontWeight:    600,
                            marginBottom: '3px',
                            lineHeight:    1.3,
                          }}
                        >
                          {product.model}
                        </p>

                        <p
                          style={{
                            color:      '#888',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize:   '13px',
                            fontWeight:  500,
                          }}
                        >
                          {product.size}&nbsp;&nbsp;{product.spec}
                        </p>
                      </div>

                      {/* ── Layer 3: SHOP NOW button — grows upward from card bottom ── */}
                      <div
                        style={{
                          position:      'absolute',
                          bottom:         0,
                          left:           0,
                          right:          0,
                          overflow:      'hidden',
                          maxHeight:     isHovered ? '68px' : '0px',
                          transition:    'max-height 0.38s cubic-bezier(0.25,0.46,0.45,0.94)',
                          pointerEvents: isHovered ? 'auto' : 'none',
                        }}
                      >
                        <div style={{ padding: '8px 16px 16px', background: '#fff' }}>
                        <button
                          onClick={e => handleAddToCart(e, product)}
                          style={{
                            width:          '100%',
                            padding:        '11px 16px',
                            background:     addedId === product.id ? '#22c55e' : '#1A1A1A',
                            color:          '#fff',
                            borderRadius:   '8px',
                            border:         'none',
                            cursor:         'pointer',
                            fontFamily:     "'DM Sans', sans-serif",
                            fontSize:       '13px',
                            fontWeight:      700,
                            letterSpacing:  '0.06em',
                            textAlign:      'center',
                            transition:     'background 0.2s ease',
                            display:        'flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            gap:            '6px',
                          }}
                        >
                          <i
                            className={addedId === product.id ? 'ti ti-check' : 'ti ti-shopping-cart'}
                            style={{ fontSize: '14px' }}
                            aria-hidden="true"
                          />
                          {addedId === product.id ? 'Added!' : 'SHOP NOW'}
                        </button>
                        </div>
                      </div>

                    </div>
                  </Link>
                )
              })
          }
        </div>

        {/* ── Footer link ── */}
        <div className="text-center mt-8">
          <Link
            href={tab === 'tyres' ? '/tyres/results' : '/wheels/results'}
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
            style={{
              color:      '#E8572A',
              fontFamily: "'DM Sans', sans-serif",
              fontSize:   '14px',
              fontWeight:  600,
            }}
          >
            {tab === 'tyres' ? 'Shop all tyres' : 'Shop all wheels'}
            <i className="ti ti-arrow-right" style={{ fontSize: '16px' }} aria-hidden="true" />
          </Link>
        </div>

      </div>
    </section>
  )
}
