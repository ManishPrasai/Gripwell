import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

// One-off: migrate AdminUser bcrypt password hashes to PBKDF2 (Workers-safe).
const prisma = new PrismaClient()

async function main() {
  const admins = await prisma.adminUser.findMany({ select: { id: true, email: true, role: true } })
  for (const a of admins) {
    const plain = a.role === 'SUPER_ADMIN' ? 'admin123456' : 'manager123456'
    const hash = await hashPassword(plain)
    await prisma.adminUser.update({ where: { id: a.id }, data: { passwordHash: hash } })
    console.log('rehashed', a.email, '→ pbkdf2')
  }
  console.log(`done: ${admins.length} admin users`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
