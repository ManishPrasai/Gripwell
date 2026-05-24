const brands = [
  { name: 'Continental', logo: '/images/brands/continental.svg' },
  { name: 'Pirelli',     logo: '/images/brands/pirelli.svg' },
  { name: 'Nitto',       logo: '/images/brands/nitto.svg' },
  { name: 'Yokohama',    logo: '/images/brands/yokohama.svg' },
  { name: 'Maxxis',      logo: '/images/brands/maxxis.svg' },
  { name: 'Atlander',    logo: '/images/brands/atlander.svg' },
  { name: 'Bridgestone', logo: '/images/brands/bridgestone.svg' },
  { name: 'Michelin',    logo: '/images/brands/michelin.svg' },
]

export default function BrandsStrip() {
  return (
    <section className="py-10 px-4 border-y" style={{ background: 'white', borderColor: '#E5E5E5' }}>
      <div className="max-w-7xl mx-auto">
        <p
          className="text-center uppercase tracking-widest mb-6"
          style={{ color: '#888', letterSpacing: '0.15em', fontSize: '12px', fontWeight: 500 }}
        >
          Trusted Brands — 200+ Models in Stock
        </p>

        <div className="flex items-center justify-center gap-8 flex-wrap">
          {brands.map(brand => (
            <div
              key={brand.name}
              className="flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity"
              style={{ height: '32px', minWidth: '80px' }}
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-full object-contain grayscale"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}