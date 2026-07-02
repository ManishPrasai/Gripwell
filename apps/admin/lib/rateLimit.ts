/**
 * Redis sliding-window rate limiter for the admin login endpoint.
 *
 * Per-IP sliding window (15-minute window, 5-attempt ceiling):
 *  - Uses a sorted set keyed by IP: admin:ratelimit:login:<ip>
 *    Each member = unique attempt ID, score = timestamp ms.
 *  - On every call we prune entries older than the window, then count.
 *  - On breach we write a separate lockout key with a 15-min TTL.
 *
 * Falls back gracefully to "allow" when Redis is unavailable so a Redis
 * outage never blocks legitimate logins. The DB-backed LoginAttempt table
 * still records every attempt for audit purposes.
 */
import { getAdminRedis } from './redis'

const WINDOW_MS      = 15 * 60 * 1000   // 15 minutes
const WINDOW_SECONDS = 15 * 60
const MAX_ATTEMPTS   = 5

function ipKey(ip: string)      { return `admin:ratelimit:login:${ip}` }
function lockoutKey(ip: string) { return `admin:lockout:${ip}` }

export interface RateLimitResult {
  allowed:   boolean
  remaining: number        // attempts remaining in current window
  resetAt:   Date          // when the window / lockout expires
  locked:    boolean       // true when a hard lockout is in effect
}

/**
 * Record one login attempt from `ip` and return whether it is allowed.
 * Call this BEFORE password verification so every request is counted.
 */
const ALLOW_FALLBACK: RateLimitResult = {
  allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt: new Date(), locked: false,
}

export async function checkLoginRateLimit(ip: string): Promise<RateLimitResult> {
  const redis = getAdminRedis()
  if (!redis) return ALLOW_FALLBACK

  try {
    const now = Date.now()

    // --- 1. Check active lockout ---
    const lockoutTTL = await redis.ttl(lockoutKey(ip))
    if (lockoutTTL > 0) {
      return {
        allowed:   false,
        remaining: 0,
        resetAt:   new Date(now + lockoutTTL * 1000),
        locked:    true,
      }
    }

    const key = ipKey(ip)
    const windowStart = now - WINDOW_MS

    // --- 2. Sliding window: remove stale entries, count, add new ---
    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, 0, windowStart)
    pipeline.zcard(key)
    pipeline.zadd(key, now, `${now}-${Math.random().toString(36).slice(2, 9)}`)
    pipeline.expire(key, WINDOW_SECONDS)
    const results = await pipeline.exec()

    const countBefore = (results?.[1]?.[1] as number) ?? 0
    const countAfter  = countBefore + 1

    // --- 3. Enforce limit ---
    if (countAfter > MAX_ATTEMPTS) {
      await redis.set(lockoutKey(ip), '1', 'EX', WINDOW_SECONDS)
      await redis.del(key)
      return {
        allowed:   false,
        remaining: 0,
        resetAt:   new Date(now + WINDOW_SECONDS * 1000),
        locked:    true,
      }
    }

    return {
      allowed:   true,
      remaining: MAX_ATTEMPTS - countAfter,
      resetAt:   new Date(now + WINDOW_SECONDS * 1000),
      locked:    false,
    }
  } catch (err) {
    // Redis unreachable — degrade gracefully so logins still work
    console.error('[rateLimit] Redis error, falling back to allow:', err)
    return ALLOW_FALLBACK
  }
}

/**
 * Clear the rate-limit state for an IP (call after a successful login
 * so a legitimate admin who had previous failures isn't penalised).
 */
export async function clearLoginRateLimit(ip: string): Promise<void> {
  const redis = getAdminRedis()
  if (!redis) return
  try {
    await redis.del(ipKey(ip), lockoutKey(ip))
  } catch {
    // best-effort clear
  }
}
