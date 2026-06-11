import Redis from 'ioredis'

const globalForRedis = global as unknown as {
  redis: Redis | null | undefined
}

function createRedis(): Redis | null {
  if (!process.env.REDIS_URL) return null
  return new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
  })
}

export const redis: Redis | null =
  globalForRedis.redis !== undefined
    ? globalForRedis.redis
    : createRedis()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

export default redis