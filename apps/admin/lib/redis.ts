/**
 * Admin-app Redis client.
 *
 * Uses lazyConnect so the process starts even when Redis is down.
 * Attaches an error listener to prevent unhandled 'error' events from
 * crashing the Node.js process (ioredis emits these when the connection
 * fails, and without a listener Node treats it as an uncaught exception).
 *
 * All commands in rateLimit.ts are already wrapped in try/catch, so
 * a Redis outage degrades gracefully to "allow login".
 */
import Redis from 'ioredis'

let _redis: Redis | null = null

export function getAdminRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null

  if (!_redis) {
    _redis = new Redis(process.env.REDIS_URL, {
      lazyConnect:          true,   // don't connect until first command
      maxRetriesPerRequest: 1,      // fail fast so try/catch works
      retryStrategy:        () => null, // no reconnect loop
      enableOfflineQueue:   false,  // reject commands immediately when offline
    })

    /* Prevent unhandled 'error' event from crashing the process */
    _redis.on('error', (err: Error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[admin-redis] connection error (graceful degradation):', err.message)
      }
    })
  }

  return _redis
}
