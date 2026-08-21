import { PrismaClient as PrismaClientWasm } from '@prisma/client/wasm'
import { PrismaClient as PrismaClientNode } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Prisma ships two client builds. The wasm query engine only initialises under
// workerd (the deployed Worker); under Node — `next dev`, `next build`,
// `prisma seed` — it throws "The loaded wasm module was unexpectedly null once
// loaded", which 500s every query in local dev. So instantiate the build that
// matches the runtime. `@prisma/client` is already in the Worker bundle (see
// `export *` below), so importing it here adds no weight and it is only ever
// *instantiated* on Node — never under workerd.
const isWorkerd =
  typeof navigator !== 'undefined' &&
  (navigator as { userAgent?: string }).userAgent === 'Cloudflare-Workers'

const PrismaClient: typeof PrismaClientWasm =
  isWorkerd ? PrismaClientWasm : (PrismaClientNode as unknown as typeof PrismaClientWasm)

type PrismaClientInstance = InstanceType<typeof PrismaClientWasm>

declare global {
  var prisma: PrismaClientInstance | undefined
}

function createPrismaClient(connectionString?: string) {
  const adapter = new PrismaPg({
    connectionString: connectionString || process.env.DATABASE_URL,
    // Small on purpose. Hyperdrive already pools connections at the edge, so a
    // Worker request doesn't need its own big pool — it just needs enough to run
    // its queries. With max:5, ~8 concurrent /api/admin/data requests demanded
    // ~40 connections at once and Postgres/Hyperdrive started refusing (fast
    // 500s under load). max:3 balances that: each request's parallel queries
    // still overlap 3 at a time (good single-request latency) while a burst of
    // several dashboards loading at once stays well under the connection ceiling.
    max: 3,
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
      // Workers forbid reusing a DB socket across requests (even a Hyperdrive one),
      // so build one client per request. Route it through the Hyperdrive binding
      // when present — that pools connections at the edge, so per-request clients
      // don't exhaust connections under load.
      let client = requestClients.get(ctx as object)
      if (!client) {
        const hyperdrive = (env as any)?.HYPERDRIVE?.connectionString
        client = createPrismaClient(hyperdrive || process.env.DATABASE_URL)
        requestClients.set(ctx as object, client)
        // NOTE: no explicit $disconnect() here. ctx.waitUntil() starts its promise
        // immediately rather than at request end, so disconnecting through it would
        // kill the pool mid-query. The pool config (idleTimeoutMillis /
        // allowExitOnIdle) is what lets the sockets and timers drop, which in turn
        // lets the WeakMap entry actually be collected once the ctx dies.
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
export const prisma: PrismaClientInstance = new Proxy({} as PrismaClientInstance, {
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
