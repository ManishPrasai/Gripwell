import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const SUPER = { stores: 2, bookings: 2, messages: 2, inventory: 2, staff: 2, reviews: 2, website: 2, finance: 2, roles: 2 }
const MGR   = { stores: 1, bookings: 2, messages: 2, inventory: 2, staff: 2, reviews: 2, website: 1, finance: 1, roles: 0 }

async function main() {
  const superRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: { scope: 'all', isBuiltIn: true, permissions: SUPER, description: 'Full control across every store and setting.', color: '#076330' },
    create: { name: 'Super Admin', scope: 'all', isBuiltIn: true, permissions: SUPER, description: 'Full control across every store and setting.', color: '#076330' },
  })
  const mgrRole = await prisma.role.upsert({
    where: { name: 'Store Manager' },
    update: { scope: 'store', isBuiltIn: true, permissions: MGR, description: 'Runs the day-to-day for a single store.', color: '#2D6BE0' },
    create: { name: 'Store Manager', scope: 'store', isBuiltIn: true, permissions: MGR, description: 'Runs the day-to-day for a single store.', color: '#2D6BE0' },
  })

  // Backfill existing admins to their built-in role.
  const a = await prisma.adminUser.updateMany({ where: { role: 'SUPER_ADMIN', roleId: null }, data: { roleId: superRole.id } })
  const b = await prisma.adminUser.updateMany({ where: { role: 'STORE_MANAGER', roleId: null }, data: { roleId: mgrRole.id } })
  console.log(`roles seeded. backfilled ${a.count} super-admins, ${b.count} managers`)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
