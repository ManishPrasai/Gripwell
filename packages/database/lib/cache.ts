import { redis } from './redis'

// TTL values in seconds
export const TTL = {
  TYRES_LIST:     5 * 60,        // 5 minutes
  TYRE_SINGLE:    60 * 60,       // 1 hour
  BESTSELLERS:    10 * 60,       // 10 minutes
  FEATURED:       10 * 60,       // 10 minutes
  STORES:         60 * 60,       // 1 hour
  WHEELS_LIST:    5 * 60,        // 5 minutes
  WHEEL_SINGLE:   60 * 60,       // 1 hour
  SEARCH:         5 * 60,        // 5 minutes
}

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!redis) return null
  try {
    const cached = await redis.get(key)
    if (cached) return JSON.parse(cached) as T
    return null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export const setCache = async (
  key: string,
  data: unknown,
  ttl: number
): Promise<void> => {
  if (!redis) return
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

export const deleteCache = async (key: string): Promise<void> => {
  if (!redis) return
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Cache delete error:', error)
  }
}

export const deleteCachePattern = async (pattern: string): Promise<void> => {
  if (!redis) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error)
  }
}