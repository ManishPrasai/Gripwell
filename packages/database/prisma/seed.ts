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

  console.log('Seeding complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())