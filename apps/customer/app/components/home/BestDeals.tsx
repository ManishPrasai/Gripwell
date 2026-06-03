'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../../context/CartContext'

interface Product {
  brand: string
  brandLogo: string
  model: string
  size: string
  spec: string
  price: number
  slug: string
  image: string
  tab: 'tyres' | 'wheels'
}

const PRODUCTS: Product[] = [
  { tab: 'tyres',  brand: 'Hankook',     brandLogo: '/images/brands/hankook.svg',     model: 'Ventus S1 evo3',   size: '215/65R16', spec: '98H',     price: 120.50, slug: '/tyres/hankook-ventus-s1-evo3-215-65r16',       image: '/images/tyres/Tyre 1.png' },
  { tab: 'tyres',  brand: 'Continental', brandLogo: '/images/brands/continental.svg', model: 'UltraContact UX7', size: '215/65R16', spec: '98H',     price: 100.00, slug: '/tyres/continental-ultracontact-ux7-215-65r16', image: '/images/tyres/Tyre 1.png' },
  { tab: 'tyres',  brand: 'Pirelli',     brandLogo: '/images/brands/pirelli.svg',     model: 'P Zero Sport',     size: '245/45R18', spec: '100Y',    price: 185.00, slug: '/tyres/pirelli-p-zero-sport-245-45r18',         image: '/images/tyres/Tyre 1.png' },
  { tab: 'tyres',  brand: 'Maxxis',      brandLogo: '/images/brands/maxxis.svg',      model: 'Victra Sport 5',   size: '225/40R18', spec: '92Y',     price: 145.00, slug: '/tyres/maxxis-victra-sport-5-225-40r18',        image: '/images/tyres/Tyre 1.png' },
  { tab: 'wheels', brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg',  model: 'AWOL',             size: '17" × 8.5', spec: '6×139.7', price: 230.00, slug: '/wheels/black-rhino-awol-17x85',                image: '/images/wheel/Wheel 1.png' },
  { tab: 'wheels', brand: 'Black Rhino', brandLogo: '/images/brands/Black Rino.svg',  model: 'Arsenal',          size: '18" × 9J',  spec: '5×114.3', price: 265.00, slug: '/wheels/black-rhino-arsenal-18x9',              image: '/images/wheel/Wheel 1.png' },
  { tab: 'wheels', brand: 'ROH',         brandLogo: '/images/brands/roh.svg',          model: 'Terrain',          size: '16" × 8J',  spec: '6×139.7', price: 195.00, slug: '/wheels/roh-terrain-16x8',                      image: '/images/wheel/Wheel 1.png' },
  { tab: 'wheels', brand: 'ROH',         brandLogo: '/images/brands/roh.svg',          model: 'Warrior',          size: '20" × 9J',  spec: '5×150',   price: 295.00, slug: '/wheels/roh-warrior-20x9',                      image: '/images/wheel/Wheel 1.png' },
]

/*
  BUTTON_AREA_H: vertical space (px) reserved at the very bottom of every card
  for the SHOP NOW button.  In default state the button is opacity-0 / shifted
  down a few pixels; on hover it fades + lifts into this pre-allocated slot.
  Math: 0px (wrapper top pad) + 11px (btn top pad) + ~16px (13px text) + 11px (btn bottom pad) + 16px (wrapper bottom pad) = 54px
*/
const BUTTON_AREA_H = 54

export default function BestDeals() {
  const [tab, setTab]                 = useState<'tyres' | 'wheels'>('tyres')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [addedId,     setAddedId]     = useState<string | null>(null)
  const { addToCart } = useCart()

  function handleAddToCart(e: React.MouseEvent, product: Product) {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id:          product.slug,
      productType: product.tab === 'tyres' ? 'tyre' : 'wheel',
      brand:       product.brand,
      brandLogo:   product.brandLogo,
      model:       product.model,
      size:        product.size,
      spec:        product.spec,
      price:       product.price,
      image:       product.image,
    })
    setAddedId(product.slug)
    setTimeout(() => setAddedId(null), 1400)
  }

  const visible = PRODUCTS.filter(p => p.tab === tab)

  return (
    <section
      className="px-4"
      style={{
        background: '#FAF9F5',
        marginTop: '-32px',
        position: 'relative',
        zIndex: 10,
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        paddingTop: '76px',
        paddingBottom: '48px',
      }}
    >
      <div style={{ maxWidth: '80%', margin: '0 auto' }}>

        {/* ── Header row ── */}
        <div className="flex items-center justify-between mb-8">
          <h2
            style={{
              color: '#1A1A1A',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(28px, 4vw, 40px)',
              letterSpacing: '0.02em',
              lineHeight: 1.1,
            }}
          >
            Best deals on tyres &amp; wheels
          </h2>

          {/* Tyres / Wheels toggle */}
          <div
            className="flex overflow-hidden"
            style={{ border: '1px solid #E5E5E5', borderRadius: '6px' }}
          >
            {(['tyres', 'wheels'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 20px',
                  background: tab === t ? '#E8572A' : '#fff',
                  color:      tab === t ? '#fff'    : '#888',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize:   '12px',
                  fontWeight:  700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {t === 'tyres' ? 'Tyres' : 'Wheels'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Product grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visible.map((product, i) => {
            const isHovered = hoveredCard === i
            return (
              <Link
                key={`${tab}-${i}`}
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
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #E5E5E5',
                    height: '380px',
                    boxShadow: isHovered
                      ? '0 12px 40px rgba(0,0,0,0.14)'
                      : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'box-shadow 0.3s ease',
                  }}
                >

                  {/* ── Layer 1: Tyre / wheel image ──
                      Fills the upper portion of the card.
                      paddingBottom reserves the info + button zone so the image
                      never slides under the text at any hover state.
                      The perspective wrapper gives 3-D space for the scale-back. */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      paddingTop:    '20px',
                      paddingBottom: '160px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      perspective: '700px',
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

                  {/* ── Layer 2: Info (brand logo · name · spec) ──
                      Pinned at bottom: BUTTON_AREA_H so it sits directly on top
                      of the button slot.  It NEVER moves — not on hover, not on
                      any state change. */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom:   `${BUTTON_AREA_H}px`,
                      left:  0,
                      right: 0,
                      background: '#fff',
                      padding: '14px 16px 10px',
                    }}
                  >
                    <div
                      style={{
                        display:     'inline-flex',
                        alignItems:  'center',
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

                  {/* ── Layer 3: SHOP NOW button ──
                      Space is always pre-allocated here (position absolute, bottom 0).
                      Default state: opacity 0 + shifted down 6px  → invisible.
                      Hover state:   opacity 1 + translateY(0)      → fades in cleanly.
                      pointerEvents: none when invisible prevents accidental clicks. */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left:   0,
                      right:  0,
                      padding: '0 16px 16px',
                      background: '#fff',
                      opacity:       isHovered ? 1 : 0,
                      transform:     isHovered ? 'translateY(0)' : 'translateY(6px)',
                      transition:    'opacity 0.3s ease, transform 0.3s ease',
                      pointerEvents: isHovered ? 'auto' : 'none',
                    }}
                  >
                    <button
                      onClick={e => handleAddToCart(e, product)}
                      style={{
                        width:         '100%',
                        padding:       '11px 16px',
                        background:    addedId === product.slug ? '#22c55e' : '#1A1A1A',
                        color:         '#fff',
                        borderRadius:  '8px',
                        border:        'none',
                        cursor:        'pointer',
                        fontFamily:    "'DM Sans', sans-serif",
                        fontSize:      '13px',
                        fontWeight:     700,
                        letterSpacing: '0.06em',
                        textAlign:     'center',
                        transition:    'background 0.2s ease',
                        display:       'flex',
                        alignItems:    'center',
                        justifyContent:'center',
                        gap:           '6px',
                      }}
                    >
                      <i className={addedId === product.slug ? 'ti ti-check' : 'ti ti-shopping-cart'} style={{ fontSize: '14px' }} aria-hidden="true" />
                      {addedId === product.slug ? 'Added!' : 'SHOP NOW'}
                    </button>
                  </div>

                </div>
              </Link>
            )
          })}
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
