const brands = [
  { name: 'Continental', logo: '/images/brands/continental.svg' },
  { name: 'Pirelli',     logo: '/images/brands/pirelli.svg' },
  { name: 'Bridgestone', logo: '/images/brands/bridgestone.svg' },
  { name: 'Michelin',    logo: '/images/brands/michelin.svg' },
  { name: 'Yokohama',    logo: '/images/brands/yokohama.svg' },
  { name: 'Maxxis',      logo: '/images/brands/maxxis.svg' },
  { name: 'Nitto',       logo: '/images/brands/nitto.svg' },
  { name: 'Hankook',     logo: '/images/brands/hankook.svg' },
  { name: 'Atlander',    logo: '/images/brands/atlander.svg' },
]

export default function BrandsStrip() {
  return (
    <section className="py-10 border-y" style={{ background: 'white', borderColor: '#E5E5E5' }}>
      <div className="nv-shell">

        {/* Heading — wrapper lets desktop keep mb-8 while mobile gets a subtitle */}
        <div className="text-center mb-5 md:mb-8">
          <p
            className="uppercase tracking-widest"
            style={{ color: '#888', letterSpacing: '0.15em', fontSize: '12px', fontWeight: 500 }}
          >
            Trusted Brands — 200+ Models in Stock
          </p>
          {/* Mobile-only subtitle — communicates the value, not just the list */}
          <p
            className="md:hidden mt-2"
            style={{ color: '#555', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", fontWeight: 400, lineHeight: 1.4 }}
          >
            All original products. Manufacturer warranty on every tyre.
          </p>
        </div>

        {/* Mobile: 3×3 card grid — Desktop: original flex row */}
        <div className="grid grid-cols-3 gap-2.5 md:flex md:flex-wrap md:items-center md:justify-center md:gap-10">
          {brands.map(brand => (
            <div
              key={brand.name}
              className={[
                /* Mobile card */
                'flex flex-col items-center justify-center gap-1.5 min-h-[86px] rounded-xl',
                'border border-[#EBEBEB] bg-[#FAFAFA]',
                /* Desktop: strip the card treatment, restore flex-item sizing */
                'md:min-h-0 md:rounded-none md:border-0 md:bg-transparent md:p-0',
                'transition-opacity duration-200 hover:opacity-70',
              ].join(' ')}
              style={{ minWidth: '60px' }}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                /* Mobile: 42px gives wordmarks enough height to be legible
                   Desktop: 32px ≈ original 30–32px per-brand heights */
                className="w-auto object-contain max-h-[42px] md:max-h-[32px]"
              />
              {/* Brand name — mobile only, acts as fallback label for mark-only logos */}
              <span
                className="md:hidden leading-none"
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: '#BEBEBE',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {brand.name}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile-only closing line — reinforces quality, anchors the section */}
        <p
          className="md:hidden text-center mt-5"
          style={{ fontSize: '11.5px', color: '#AAA', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
        >
          Original stock · No grey imports · Fitted by certified technicians
        </p>

      </div>
    </section>
  )
}
