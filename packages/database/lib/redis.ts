import Redis from 'ioredis'

const globalForRedis = global as unknown as {
  redis: Redis | null | undefined
}

/**
 * Detect the Cloudflare Workers runtime. There is no reachable Redis there
 * (the dev default `redis://localhost:6379` gets inlined into the bundle at
 * build time and localhost is unroutable on Workers), so we skip creating a
 * client entirely — the cache helpers then no-op and queries hit the DB
 * directly instead of the client crashing the isolate on a failed connect.
 */
function isCloudflareWorkers(): boolean {
  return typeof navigator !== 'undefined' &&
    (navigator as any).userAgent === 'Cloudflare-Workers'
}

function createRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (isCloudflareWorkers()) return null

  const client = new Redis(process.env.REDIS_URL, {
    lazyConnect:          true,        // don't connect until first command
    maxRetriesPerRequest: 1,           // fail fast so try/catch degrades gracefully
    retryStrategy:        () => null,  // no infinite reconnect loop
    enableOfflineQueue:   false,       // reject commands immediately when offline
  })

  // Without an 'error' listener, ioredis' connection-failure 'error' events are
  // treated as unhandled and crash the process/isolate. All cache helpers are
  // already wrapped in try/catch, so a Redis outage degrades to "no cache".
  client.on('error', (err: Error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[redis] connection error (graceful degradation):', err.message)
    }
  })

  return client
}

export const redis: Redis | null =
  globalForRedis.redis !== undefined
    ? globalForRedis.redis
    : createRedis()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

export default redis
