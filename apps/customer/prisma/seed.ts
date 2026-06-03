import { PrismaClient, TyreType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  /* ── Tyre sizes ──────────────────────────────────────────────────────────── */
  const sizes = await Promise.all([
    prisma.tyreSize.upsert({ where: { width_profile_rimDiameter: { width: 245, profile: 70, rimDiameter: 16 } }, update: {}, create: { width: 245, profile: 70, rimDiameter: 16, loadIndex: 118, speedRating: 'S' } }),
    prisma.tyreSize.upsert({ where: { width_profile_rimDiameter: { width: 215, profile: 65, rimDiameter: 16 } }, update: {}, create: { width: 215, profile: 65, rimDiameter: 16, loadIndex: 98,  speedRating: 'H' } }),
    prisma.tyreSize.upsert({ where: { width_profile_rimDiameter: { width: 245, profile: 45, rimDiameter: 18 } }, update: {}, create: { width: 245, profile: 45, rimDiameter: 18, loadIndex: 100, speedRating: 'Y' } }),
    prisma.tyreSize.upsert({ where: { width_profile_rimDiameter: { width: 225, profile: 40, rimDiameter: 18 } }, update: {}, create: { width: 225, profile: 40, rimDiameter: 18, loadIndex: 92,  speedRating: 'Y' } }),
    prisma.tyreSize.upsert({ where: { width_profile_rimDiameter: { width: 205, profile: 55, rimDiameter: 16 } }, update: {}, create: { width: 205, profile: 55, rimDiameter: 16, loadIndex: 91,  speedRating: 'V' } }),
    prisma.tyreSize.upsert({ where: { width_profile_rimDiameter: { width: 225, profile: 50, rimDiameter: 17 } }, update: {}, create: { width: 225, profile: 50, rimDiameter: 17, loadIndex: 98,  speedRating: 'W' } }),
  ])

  /* ── Tyres ───────────────────────────────────────────────────────────────── */
  const tyreData = [
    { brand: 'Continental', model: 'CrossContact A/T',  slug: 'continental-crosscontact-at-245-70r16', type: TyreType.SUV,       price: 91.50,  sizeIndex: 0, isSale: true, description: 'The CrossContact A/T combines on-road comfort with proven off-road capability. Ideal for SUVs and 4WDs that need reliable all-terrain performance.' },
    { brand: 'Hankook',     model: 'Ventus S1 evo3',    slug: 'hankook-ventus-s1-evo3-215-65r16',     type: TyreType.PASSENGER, price: 120.50, sizeIndex: 1, isSale: false, description: 'The Ventus S1 evo3 delivers outstanding dry and wet handling for sporty passenger vehicles. High-speed stability and responsive steering feel.' },
    { brand: 'Continental', model: 'UltraContact UX7',  slug: 'continental-ultracontact-ux7-215-65r16', type: TyreType.PASSENGER, price: 100.00, sizeIndex: 1, isSale: true, description: 'The UltraContact UX7 is Continental\'s advanced touring tyre offering exceptional comfort, fuel efficiency and all-weather safety.' },
    { brand: 'Pirelli',     model: 'P Zero Sport',      slug: 'pirelli-p-zero-sport-245-45r18',        type: TyreType.PASSENGER, price: 185.00, sizeIndex: 2, isSale: false, description: 'The P Zero Sport is Pirelli\'s flagship ultra-high-performance tyre. Track-derived technology for maximum grip and ultimate driving dynamics.' },
    { brand: 'Maxxis',      model: 'Victra Sport 5',    slug: 'maxxis-victra-sport-5-225-40r18',       type: TyreType.PASSENGER, price: 145.00, sizeIndex: 3, isSale: true, description: 'The Victra Sport 5 provides high performance at a competitive price. Optimised for sports and performance vehicles with excellent handling.' },
    { brand: 'Hankook',     model: 'Kinergy Eco 2',     slug: 'hankook-kinergy-eco2-205-55r16',        type: TyreType.PASSENGER, price: 98.00,  sizeIndex: 4, isSale: false, description: 'The Kinergy Eco 2 prioritises fuel efficiency and all-season safety. Perfect for everyday commuters seeking economy without sacrificing safety.' },
    { brand: 'Pirelli',     model: 'Cinturato P7',      slug: 'pirelli-cinturato-p7-225-50r17',        type: TyreType.PASSENGER, price: 160.00, sizeIndex: 5, isSale: false, description: 'The Cinturato P7 combines efficiency and safety with low rolling resistance. Pirelli\'s signature green performance tyre for premium vehicles.' },
  ]

  for (const t of tyreData) {
    const existing = await prisma.tyre.findUnique({ where: { slug: t.slug } })
    if (!existing) {
      const tyre = await prisma.tyre.create({
        data: {
          brand:         t.brand,
          model:         t.model,
          description:   t.description,
          slug:          t.slug,
          type:          t.type,
          price:         t.price,
          compareAtPrice: t.isSale ? t.price * 1.2 : null,
          stockQuantity: Math.floor(Math.random() * 20) + 5,
          isBestSeller:  t.isSale,
          isFeatured:    t.sizeIndex === 0,
          tyreSizeId:    sizes[t.sizeIndex].id,
        },
      })
      await prisma.tyreImage.create({
        data: { tyreId: tyre.id, url: '/images/tyres/Tyre 1.png', altText: `${t.brand} ${t.model}`, sortOrder: 0 },
      })
      console.log(`Created tyre: ${t.brand} ${t.model}`)
    }
  }

  /* ── Wheels ──────────────────────────────────────────────────────────────── */
  const wheelData = [
    { brand: 'Black Rhino', model: 'AWOL',    slug: 'black-rhino-awol-17x85',    diameter: 17, width: 8.5, pcd: '6×139.7', offset: -18, finish: 'Matte Black',  price: 230.00, description: 'The Black Rhino AWOL is a premium off-road alloy wheel built for serious 4WD performance. Deep dish design with aggressive styling.' },
    { brand: 'Black Rhino', model: 'Arsenal', slug: 'black-rhino-arsenal-18x9',  diameter: 18, width: 9.0, pcd: '5×114.3', offset:  12, finish: 'Bronze',       price: 265.00, description: 'The Black Rhino Arsenal brings military-grade durability to your ride. Multi-spoke design available in multiple premium finishes.' },
    { brand: 'ROH',         model: 'Terrain', slug: 'roh-terrain-16x8',          diameter: 16, width: 8.0, pcd: '6×139.7', offset: -10, finish: 'Gunmetal',     price: 195.00, description: 'The ROH Terrain is Australia\'s trusted off-road wheel. Engineered for tough conditions with a proven track record across all terrains.' },
    { brand: 'ROH',         model: 'Warrior', slug: 'roh-warrior-20x9',          diameter: 20, width: 9.0, pcd: '5×150',   offset:  18, finish: 'Satin Black',  price: 295.00, description: 'The ROH Warrior combines aggressive styling with everyday usability. Large diameter options for lifted trucks and SUVs.' },
    { brand: 'King Wheels', model: 'Force',   slug: 'king-force-17x8',           diameter: 17, width: 8.0, pcd: '6×139.7', offset: -10, finish: 'Gloss Black',  price: 185.00, description: 'The King Force is a value-packed alloy wheel offering great looks at an accessible price. Perfect for 4WDs and utes.' },
    { brand: 'Sonix',       model: 'XR7',     slug: 'sonix-xr7-18x85',           diameter: 18, width: 8.5, pcd: '5×112',   offset:  35, finish: 'Hyper Silver', price: 175.00, description: 'The Sonix XR7 delivers European styling at an Australian price. Multi-spoke design with a refined hyper silver finish.' },
  ]

  for (const w of wheelData) {
    const existing = await prisma.wheel.findUnique({ where: { slug: w.slug } })
    if (!existing) {
      const wheel = await prisma.wheel.create({
        data: {
          brand:         w.brand,
          model:         w.model,
          description:   w.description,
          slug:          w.slug,
          diameter:      w.diameter,
          width:         w.width,
          pcd:           w.pcd,
          offset:        w.offset,
          material:      'Alloy',
          finish:        w.finish,
          price:         w.price,
          stockQuantity: Math.floor(Math.random() * 16) + 4,
        },
      })
      await prisma.wheelImage.create({
        data: { wheelId: wheel.id, url: '/images/wheel/Wheel 1.png', altText: `${w.brand} ${w.model}`, sortOrder: 0 },
      })
      console.log(`Created wheel: ${w.brand} ${w.model}`)
    }
  }

  /* ── Stores ──────────────────────────────────────────────────────────────── */
  const storeData = [
    { name: 'Nova Tyres Springvale',  slug: 'springvale',  address: '4/134 Springvale Rd',   suburb: 'Springvale',  state: 'VIC', postcode: '3171', phone: '03 9562 4269', email: 'springvale@novadtyres.com.au', lat: -37.9519, lon: 145.1523 },
    { name: 'Nova Tyres Dandenong',   slug: 'dandenong',   address: '308 S Gippsland Hwy',   suburb: 'Dandenong',   state: 'VIC', postcode: '3175', phone: '03 8787 5846', email: 'dandenong@novatyres.com.au',   lat: -38.0026, lon: 145.2167 },
    { name: 'Nova Tyres Alphington',  slug: 'alphington',  address: '200 Grange Rd',          suburb: 'Alphington',  state: 'VIC', postcode: '3078', phone: '03 7009 7700', email: 'alphington@novatyres.com.au',  lat: -37.7787, lon: 145.0204 },
    { name: 'Nova Tyres Bayswater',   slug: 'bayswater',   address: '194 Canterbury Rd',      suburb: 'Bayswater',   state: 'VIC', postcode: '3153', phone: '03 9720 9354', email: 'bayswater@novatyres.com.au',   lat: -37.8465, lon: 145.2683 },
    { name: 'Nova Tyres Sunshine',    slug: 'sunshine',    address: '9 Devonshire Rd',        suburb: 'Sunshine',    state: 'VIC', postcode: '3020', phone: '03 9311 0000', email: 'sunshine@novatyres.com.au',    lat: -37.7893, lon: 144.8337 },
    { name: 'Nova Tyres Geelong',     slug: 'geelong',     address: '1/118 Bellarine Hwy',    suburb: 'Newcomb',     state: 'VIC', postcode: '3219', phone: '04 7869 8884', email: 'geelong@novatyres.com.au',     lat: -38.1510, lon: 144.3933 },
    { name: 'Nova Tyres Sefton',      slug: 'sefton',      address: '107 Carlingford St',     suburb: 'Sefton',      state: 'NSW', postcode: '2162', phone: '04 0338 8774', email: 'sefton@novatyres.com.au',      lat: -33.8918, lon: 151.0249 },
    { name: 'Nova Tyres Brisbane',    slug: 'brisbane',    address: '123 Ipswich Rd',         suburb: 'Woolloongabba', state: 'QLD', postcode: '4102', phone: '07 3000 0000', email: 'brisbane@novatyres.com.au', lat: -27.4975, lon: 153.0257 },
    { name: 'Nova Tyres Adelaide',    slug: 'adelaide',    address: '456 Port Rd',            suburb: 'Hindmarsh',   state: 'SA',  postcode: '5007', phone: '08 8000 0000', email: 'adelaide@novatyres.com.au',    lat: -34.9001, lon: 138.5784 },
  ]

  for (const s of storeData) {
    await prisma.store.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.name, slug: s.slug, address: s.address, suburb: s.suburb,
        state: s.state, postcode: s.postcode, phone: s.phone, email: s.email,
        latitude: s.lat, longitude: s.lon,
      },
    })
  }
  console.log('Stores seeded.')

  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
