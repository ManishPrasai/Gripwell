const brands = [
  { name: 'Continental', logo: '/images/brands/continental.svg',  h: 30 },
  { name: 'Pirelli',     logo: '/images/brands/pirelli.svg',       h: 32 },
  { name: 'Bridgestone', logo: '/images/brands/bridgestone.svg',   h: 30 },
  { name: 'Michelin',    logo: '/images/brands/michelin.svg',       h: 30 },
  { name: 'Yokohama',    logo: '/images/brands/yokohama.svg',       h: 30 },
  { name: 'Maxxis',      logo: '/images/brands/maxxis.svg',         h: 30 },
  { name: 'Nitto',       logo: '/images/brands/nitto.svg',          h: 30 },
  { name: 'Hankook',     logo: '/images/brands/hankook.svg',        h: 30 },
  { name: 'Atlander',    logo: '/images/brands/atlander.svg',       h: 29 },
]

export default function BrandsStrip() {
  return (
    <section className="py-10 px-4 border-y" style={{ background: 'white', borderColor: '#E5E5E5' }}>
      <div style={{ maxWidth: '96%', margin: '0 auto' }}>
        <p
          className="text-center uppercase tracking-widest mb-8"
          style={{ color: '#888', letterSpacing: '0.15em', fontSize: '12px', fontWeight: 500 }}
        >
          Trusted Brands — 200+ Models in Stock
        </p>

        <div className="flex items-center justify-center gap-10 flex-wrap">
          {brands.map(brand => (
            <div
              key={brand.name}
              className="flex items-center justify-center transition-opacity duration-200 hover:opacity-70"
              style={{ height: `${brand.h}px`, minWidth: '60px' }}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
