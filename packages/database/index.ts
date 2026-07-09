import { PrismaClient } from '@prisma/client/wasm'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

function getPrisma(): PrismaClient {
  if (!global.prisma) global.prisma = createPrismaClient()
  return global.prisma
}

// Lazy proxy: the real PrismaClient (which loads the edge/WASM query engine) is
// constructed only on first property access — never at import time. During
// `next build`, page-data collection imports these modules in Node, where the
// WASM engine cannot load; deferring construction keeps the build clean and
// moves it to request time on workerd, where the WASM engine loads correctly.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma()
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

export * from '@prisma/client'
export * from './lib/auth'
export * from './lib/redis'
export * from './lib/cache'
