import * as dotenv from 'dotenv'
dotenv.config()
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create first Super Admin
  const passwordHash = await bcrypt.hash('admin123456', 12)

  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@novatyres.com.au' },
    update: {},
    create: {
      firstName: 'Nova',
      lastName: 'Admin',
      email: 'admin@novatyres.com.au',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true
    }
  })

  console.log('Super Admin created:', superAdmin.email)

  const stores = [
    { name: 'Nova Tyres Springvale', slug: 'springvale', suburb: 'Springvale', state: 'VIC', postcode: '3171', address: '123 Springvale Road', phone: '03 9547 0000', email: 'springvale@novatyres.com.au', latitude: -37.9498, longitude: 145.1526 },
    { name: 'Nova Tyres Dandenong', slug: 'dandenong', suburb: 'Dandenong', state: 'VIC', postcode: '3175', address: '456 Lonsdale Street', phone: '03 9792 0000', email: 'dandenong@novatyres.com.au', latitude: -37.9872, longitude: 145.2150 },
    { name: 'Nova Tyres Alphington', slug: 'alphington', suburb: 'Alphington', state: 'VIC', postcode: '3078', address: '789 Heidelberg Road', phone: '03 9499 0000', email: 'alphington@novatyres.com.au', latitude: -37.7833, longitude: 145.0167 },
    { name: 'Nova Tyres Bayswater', slug: 'bayswater', suburb: 'Bayswater', state: 'VIC', postcode: '3153', address: '321 Mountain Highway', phone: '03 9720 0000', email: 'bayswater@novatyres.com.au', latitude: -37.8500, longitude: 145.2667 },
    { name: 'Nova Tyres Sunshine', slug: 'sunshine', suburb: 'Sunshine', state: 'VIC', postcode: '3020', address: '654 Ballarat Road', phone: '03 9311 0000', email: 'sunshine@novatyres.com.au', latitude: -37.7833, longitude: 144.8333 },
    { name: 'Nova Tyres Geelong', slug: 'geelong', suburb: 'Geelong', state: 'VIC', postcode: '3220', address: '987 Moorabool Street', phone: '03 5221 0000', email: 'geelong@novatyres.com.au', latitude: -38.1499, longitude: 144.3617 },
    { name: 'Nova Tyres Sefton', slug: 'sefton', suburb: 'Sefton', state: 'NSW', postcode: '2162', address: '147 Sefton Road', phone: '02 9644 0000', email: 'sefton@novatyres.com.au', latitude: -33.8667, longitude: 151.0167 },
    { name: 'Nova Tyres Brisbane', slug: 'brisbane', suburb: 'Cooper Plains', state: 'QLD', postcode: '4108', address: '258 Ipswich Road', phone: '07 3276 0000', email: 'brisbane@novatyres.com.au', latitude: -27.5667, longitude: 153.0167 },
    { name: 'Nova Tyres Adelaide', slug: 'adelaide', suburb: 'Croydon Park', state: 'SA', postcode: '5008', address: '369 Port Road', phone: '08 8346 0000', email: 'adelaide@novatyres.com.au', latitude: -34.8833, longitude: 138.5500 },
  ]

  for (const store of stores) {
    await prisma.store.upsert({
      where: { slug: store.slug },
      update: {},
      create: {
        ...store,
        isActive: true
      }
    })
    console.log(`Store created: ${store.name}`)
  }

  // Create TyreSizes
  const tyreSizes = [
    { width: 205, profile: 55, rimDiameter: 16, loadIndex: 91, speedRating: 'V', construction: 'R' },
    { width: 225, profile: 45, rimDiameter: 17, loadIndex: 94, speedRating: 'W', construction: 'R' },
    { width: 235, profile: 65, rimDiameter: 17, loadIndex: 108, speedRating: 'H', construction: 'R' },
    { width: 265, profile: 70, rimDiameter: 16, loadIndex: 112, speedRating: 'H', construction: 'R' },
    { width: 195, profile: 65, rimDiameter: 15, loadIndex: 91, speedRating: 'H', construction: 'R' },
    { width: 245, profile: 40, rimDiameter: 18, loadIndex: 97, speedRating: 'Y', construction: 'R' },
    { width: 275, profile: 55, rimDiameter: 20, loadIndex: 117, speedRating: 'H', construction: 'R' },
    { width: 215, profile: 60, rimDiameter: 16, loadIndex: 95, speedRating: 'H', construction: 'R' },
  ]

  const createdSizes = []
  for (const size of tyreSizes) {
    const created = await prisma.tyreSize.upsert({
      where: {
        width_profile_rimDiameter: {
          width: size.width,
          profile: size.profile,
          rimDiameter: size.rimDiameter
        }
      },
      update: {},
      create: size
    })
    createdSizes.push(created)
    console.log(`TyreSize created: ${size.width}/${size.profile}R${size.rimDiameter}`)
  }

  // Create Tyres
  const tyres = [
    {
      brand: 'Bridgestone',
      model: 'Ecopia EP150',
      tyreSizeId: createdSizes[0].id,
      type: 'PASSENGER' as const,
      price: 149.00,
      compareAtPrice: 189.00,
      stockQuantity: 50,
      isBestSeller: true,
      isFeatured: true,
      fuelEfficiencyRating: 'A',
      wetGripRating: 'B',
      noiseLevelDb: 68,
      slug: 'bridgestone-ecopia-ep150-205-55r16',
      isActive: true
    },
    {
      brand: 'Michelin',
      model: 'Energy XM2',
      tyreSizeId: createdSizes[0].id,
      type: 'PASSENGER' as const,
      price: 179.00,
      compareAtPrice: 219.00,
      stockQuantity: 35,
      isBestSeller: true,
      isFeatured: false,
      fuelEfficiencyRating: 'A',
      wetGripRating: 'A',
      noiseLevelDb: 69,
      slug: 'michelin-energy-xm2-205-55r16',
      isActive: true
    },
    {
      brand: 'Pirelli',
      model: 'P Zero SUV',
      tyreSizeId: createdSizes[1].id,
      type: 'SUV' as const,
      price: 289.00,
      compareAtPrice: 349.00,
      stockQuantity: 20,
      isBestSeller: true,
      isFeatured: true,
      fuelEfficiencyRating: 'B',
      wetGripRating: 'A',
      noiseLevelDb: 71,
      slug: 'pirelli-p-zero-suv-225-45r17',
      isActive: true
    },
    {
      brand: 'Continental',
      model: 'ContiCrossContact',
      tyreSizeId: createdSizes[2].id,
      type: 'SUV' as const,
      price: 249.00,
      compareAtPrice: 299.00,
      stockQuantity: 30,
      isBestSeller: false,
      isFeatured: true,
      fuelEfficiencyRating: 'B',
      wetGripRating: 'B',
      noiseLevelDb: 72,
      slug: 'continental-conticrosscontact-235-65r17',
      isActive: true
    },
    {
      brand: 'Hankook',
      model: 'Kinergy Eco',
      tyreSizeId: createdSizes[4].id,
      type: 'PASSENGER' as const,
      price: 119.00,
      compareAtPrice: 149.00,
      stockQuantity: 60,
      isBestSeller: false,
      isFeatured: false,
      fuelEfficiencyRating: 'B',
      wetGripRating: 'B',
      noiseLevelDb: 67,
      slug: 'hankook-kinergy-eco-195-65r15',
      isActive: true
    },
    {
      brand: 'Dunlop',
      model: 'SP Sport Maxx',
      tyreSizeId: createdSizes[5].id,
      type: 'PASSENGER' as const,
      price: 219.00,
      compareAtPrice: 269.00,
      stockQuantity: 25,
      isBestSeller: false,
      isFeatured: false,
      fuelEfficiencyRating: 'A',
      wetGripRating: 'A',
      noiseLevelDb: 70,
      slug: 'dunlop-sp-sport-maxx-245-40r18',
      isActive: true
    },
    {
      brand: 'Yokohama',
      model: 'Geolandar AT',
      tyreSizeId: createdSizes[3].id,
      type: 'MUD_TERRAIN' as const,
      price: 199.00,
      compareAtPrice: 249.00,
      stockQuantity: 40,
      isBestSeller: true,
      isFeatured: true,
      fuelEfficiencyRating: 'C',
      wetGripRating: 'C',
      noiseLevelDb: 74,
      slug: 'yokohama-geolandar-at-265-70r16',
      isActive: true
    },
    {
      brand: 'BF Goodrich',
      model: 'All Terrain TA',
      tyreSizeId: createdSizes[6].id,
      type: 'MUD_TERRAIN' as const,
      price: 329.00,
      compareAtPrice: 399.00,
      stockQuantity: 15,
      isBestSeller: false,
      isFeatured: true,
      fuelEfficiencyRating: 'D',
      wetGripRating: 'C',
      noiseLevelDb: 76,
      slug: 'bf-goodrich-all-terrain-ta-275-55r20',
      isActive: true
    },
    {
      brand: 'Toyo',
      model: 'Open Country MT',
      tyreSizeId: createdSizes[3].id,
      type: 'MUD_TERRAIN' as const,
      price: 259.00,
      compareAtPrice: 319.00,
      stockQuantity: 22,
      isBestSeller: false,
      isFeatured: false,
      fuelEfficiencyRating: 'D',
      wetGripRating: 'D',
      noiseLevelDb: 77,
      slug: 'toyo-open-country-mt-265-70r16',
      isActive: true
    },
    {
      brand: 'Michelin',
      model: 'LTX AT2',
      tyreSizeId: createdSizes[2].id,
      type: 'SUV' as const,
      price: 299.00,
      compareAtPrice: 359.00,
      stockQuantity: 18,
      isBestSeller: false,
      isFeatured: false,
      fuelEfficiencyRating: 'C',
      wetGripRating: 'B',
      noiseLevelDb: 73,
      slug: 'michelin-ltx-at2-235-65r17',
      isActive: true
    },
  ]

  for (const tyre of tyres) {
    await prisma.tyre.upsert({
      where: { slug: tyre.slug },
      update: {},
      create: tyre
    })
    console.log(`Tyre created: ${tyre.brand} ${tyre.model}`)
  }

  // Create Wheels
  const wheels = [
    {
      brand: 'King Wheels',
      model: 'D-Hole Black',
      diameter: 16,
      width: 8.0,
      pcd: '5x114.3',
      offset: 0,
      bore: 84.1,
      material: 'steel',
      finish: 'black',
      price: 89.00,
      compareAtPrice: 119.00,
      stockQuantity: 30,
      slug: 'king-wheels-d-hole-black-16',
      isActive: true
    },
    {
      brand: 'King Wheels',
      model: 'Terra Black',
      diameter: 16,
      width: 8.0,
      pcd: '6x139.7',
      offset: 0,
      bore: 108.0,
      material: 'steel',
      finish: 'black',
      price: 95.00,
      compareAtPrice: 129.00,
      stockQuantity: 25,
      slug: 'king-wheels-terra-black-16',
      isActive: true
    },
    {
      brand: 'Simmons',
      model: 'OM-1 Matte Black',
      diameter: 17,
      width: 9.0,
      pcd: '5x127',
      offset: 0,
      bore: 78.1,
      material: 'alloy',
      finish: 'matte black',
      price: 349.00,
      compareAtPrice: 429.00,
      stockQuantity: 12,
      slug: 'simmons-om1-matte-black-17',
      isActive: true
    },
  ]

  for (const wheel of wheels) {
    await prisma.wheel.upsert({
      where: { slug: wheel.slug },
      update: {},
      create: wheel
    })
    console.log(`Wheel created: ${wheel.brand} ${wheel.model}`)
  }


  console.log('Seeding complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())