/**
 * Rate limiter for the admin login endpoint.
 *
 * Primary:  Redis sliding-window (per-IP, 5 attempts / 15 min).
 * Fallback: DB-backed count via the LoginAttempt table when Redis is
 *           unavailable — so the limit fires even without a local Redis server.
 *
 * Lockout email is sent by the caller (login route) when locked === true.
 */
import { getAdminRedis } from './redis'
import { prisma } from '@nova/database'

const WINDOW_MS      = 15 * 60 * 1000   // 15 minutes
const WINDOW_SECONDS = 15 * 60
const MAX_ATTEMPTS   = 5

function ipKey(ip: string)      { return `admin:ratelimit:login:${ip}` }
function lockoutKey(ip: string) { return `admin:lockout:${ip}` }

export interface RateLimitResult {
  allowed:   boolean
  remaining: number
  resetAt:   Date
  locked:    boolean   // true on the exact attempt that triggers lockout
}

/* ─── Redis path ──────────────────────────────────────────────────────────── */

async function checkRedis(ip: string): Promise<RateLimitResult | null> {
  const redis = getAdminRedis()
  if (!redis) return null

  try {
    const now = Date.now()

    // 1. Check existing lockout
    const lockoutTTL = await redis.ttl(lockoutKey(ip))
    if (lockoutTTL > 0) {
      return { allowed: false, remaining: 0, resetAt: new Date(now + lockoutTTL * 1000), locked: false }
    }

    const key         = ipKey(ip)
    const windowStart = now - WINDOW_MS

    // 2. Sliding window
    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, 0, windowStart)
    pipeline.zcard(key)
    pipeline.zadd(key, now, `${now}-${Math.random().toString(36).slice(2, 9)}`)
    pipeline.expire(key, WINDOW_SECONDS)
    const results = await pipeline.exec()

    const countBefore = (results?.[1]?.[1] as number) ?? 0
    const countAfter  = countBefore + 1

    // 3. Enforce
    if (countAfter > MAX_ATTEMPTS) {
      await redis.set(lockoutKey(ip), '1', 'EX', WINDOW_SECONDS)
      await redis.del(key)
      return { allowed: false, remaining: 0, resetAt: new Date(now + WINDOW_SECONDS * 1000), locked: true }
    }

    return { allowed: true, remaining: MAX_ATTEMPTS - countAfter, resetAt: new Date(now + WINDOW_SECONDS * 1000), locked: false }
  } catch (err) {
    console.error('[rateLimit] Redis error, switching to DB fallback:', err)
    return null   // signal: use DB fallback
  }
}

/* ─── DB fallback path ────────────────────────────────────────────────────── */

async function checkDB(ip: string): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - WINDOW_MS)
  const resetAt     = new Date(Date.now() + WINDOW_MS)

  const count = await prisma.loginAttempt.count({
    where: {
      ipAddress:   ip,
      attemptedAt: { gte: windowStart },
    },
  })

  // count here is BEFORE we add the current attempt (added by the caller)
  const countAfter = count + 1

  if (countAfter > MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt, locked: countAfter === MAX_ATTEMPTS + 1 }
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - countAfter, resetAt, locked: false }
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  const redisResult = await checkRedis(ip)
  if (redisResult !== null) return redisResult
  return checkDB(ip)
}

export async function clearLoginRateLimit(ip: string): Promise<void> {
  const redis = getAdminRedis()
  if (!redis) return
  try {
    await redis.del(ipKey(ip), lockoutKey(ip))
  } catch {
    // best-effort
  }
}
