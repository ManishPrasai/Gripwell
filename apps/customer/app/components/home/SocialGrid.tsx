'use client'

export default function SocialGrid() {
  const images = [
    '/images/social/social-1.jpg',
    '/images/social/social-2.jpg',
    '/images/social/social-3.jpg',
    '/images/social/social-4.jpg',
    '/images/social/social-5.jpg',
    '/images/social/social-6.jpg',
    '/images/social/social-7.jpg',
    '/images/social/social-8.jpg',
  ]

  return (
    <section className="py-12 px-4" style={{ background: '#FAF9F5' }}>
      <div className="max-w-7xl mx-auto">
        <h2
          className="mb-6 text-center"
          style={{ color: '#1A1A1A', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '0.02em', lineHeight: 1.1 }}
        >
          <span style={{ color: '#E8572A' }}>#NovaTyres</span> in Social Media
        </h2>

        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            
              <a
              key={index}
              href="https://instagram.com/novatyres"
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-lg group"
              style={{ aspectRatio: '1', display: 'block' }}
            >
              <div
                style={{
                  background: '#E5E5E5',
                  minHeight: '100px',
                  width: '100%',
                  height: '100%'
                }}
              >
                <img
                  src={img}
                  alt={`Nova Tyres social post ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(28,58,43,0.7)' }}
              >
                <i
                  className="ti ti-brand-instagram"
                  style={{ fontSize: '24px', color: 'white' }}
                  aria-hidden="true"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}