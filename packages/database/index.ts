import { PrismaClient } from '@prisma/client/wasm'
import { PrismaPg } from '@prisma/adapter-pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

declare global {
  var prisma: PrismaClient | undefined
}

function createPrismaClient(connectionString?: string) {
  const adapter = new PrismaPg({
    connectionString: connectionString || process.env.DATABASE_URL,
    // Cloudflare Workers cap each invocation at 6 concurrent DB connections.
    max: 5,
  })
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

// Per-request Prisma client cache for Cloudflare Workers, keyed on the request's
// ExecutionContext. Workers forbid using a socket (DB connection) opened in one
// request from within another request — a module-global client therefore crashes
// the isolate with "Cannot perform I/O on behalf of a different request object"
// as soon as a warm isolate serves a second request. So on Workers we build one
// client per request (GC'd when the request's ctx ends); on Node (next build,
// seed, dev) we keep a single module-level singleton.
const requestClients = new WeakMap<object, PrismaClient>()

function getPrisma(): PrismaClient {
  try {
    const { env, ctx } = getCloudflareContext()
    if (ctx) {
      let client = requestClients.get(ctx as object)
      if (!client) {
        // Prefer a Hyperdrive binding if configured; otherwise the DATABASE_URL
        // secret (Supabase transaction pooler) works for per-request connections.
        const hyperdrive = (env as any)?.HYPERDRIVE?.connectionString
        client = createPrismaClient(hyperdrive || process.env.DATABASE_URL)
        requestClients.set(ctx as object, client)
      }
      return client
    }
  } catch {
    // Not inside a Cloudflare request (Node build/seed/dev) — use the singleton.
  }
  if (!global.prisma) global.prisma = createPrismaClient()
  return global.prisma
}

// Lazy proxy: resolves to the correct client on every access — a fresh
// per-request client on Workers, or the shared singleton on Node — and never
// constructs anything at import time (keeps `next build` in Node from loading
// the edge/WASM engine, which only loads on workerd).
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
