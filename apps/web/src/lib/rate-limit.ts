/**
 * TraceRoute X — Rate Limiter
 * ==============================
 * Upstash Redis sliding window rate limiter.
 * Falls back to no-op in development if Redis is not configured.
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type RateLimitConfig = {
  /** Max requests allowed in the time window */
  limit: number
  /** Window duration string (e.g., "1m", "1h", "1d") */
  window: `${number} ${"s" | "m" | "h" | "d"}`
}

const CONFIGS = {
  /** Public API endpoints (comments, likes) */
  api: { limit: 30, window: "1 m" as const },
  /** Auth endpoints (login, register) */
  auth: { limit: 5, window: "1 m" as const },
  /** Analytics endpoints (pageviews) */
  analytics: { limit: 60, window: "1 m" as const },
  /** Admin endpoints */
  admin: { limit: 20, window: "1 m" as const },
} satisfies Record<string, RateLimitConfig>

export type RateLimitType = keyof typeof CONFIGS

/**
 * Create a rate limiter for a given type.
 * Returns null if Redis is not configured (dev mode fallback).
 */
function createRateLimiter(type: RateLimitType) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return null
  }

  const config = CONFIGS[type]

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    analytics: true,
    prefix: `traceroutex:ratelimit:${type}`,
  })
}

/**
 * Check rate limit for a given identifier (usually IP or user ID).
 * Returns { success, limit, remaining, reset } or allows through if Redis is unavailable.
 */
export async function rateLimit(
  identifier: string,
  type: RateLimitType = "api",
) {
  const limiter = createRateLimiter(type)

  if (!limiter) {
    // No Redis configured — allow all requests (development mode)
    return { success: true, limit: 0, remaining: 0, reset: 0 }
  }

  return limiter.limit(identifier)
}

/**
 * Get client IP from request headers (works with Vercel proxy).
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "anonymous"
  )
}
