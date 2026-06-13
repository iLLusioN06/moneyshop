// =============================================
// MoneyShop - Rate Limiter (Redis + In-Memory Fallback)
// =============================================
// Production: Redis (sorted set + Lua — atomic sliding window)
// Fallback:   In-memory Map (local dev, tests, Redis yoksa)
//
// Her iki backend de aynı RateLimitResult arayüzünü döndürür,
// böylece arayan kod (withRateLimit) hiçbir değişiklik gerektirmez.
// =============================================

import { redis } from "@/lib/redis";

// ─── Public Types ────────────────────────────────────────

export interface RateLimitConfig {
  /** Maksimum istek sayısı */
  maxRequests: number;
  /** Zaman penceresi (milisaniye) */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

// ─── Lua Script (Redis Atomic Sliding Window) ────────────

const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local maxReq = tonumber(ARGV[3])
local memberId = ARGV[4]
local cutoff = now - window

-- Eski kayıtları temizle
redis.call('ZREMRANGEBYSCORE', key, 0, cutoff)

-- Mevcut sayıyı al
local count = redis.call('ZCARD', key)

if count >= maxReq then
  -- Red — en eski kaydın süresini döndür (retry-after hesaplaması için)
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local oldestTimestamp = tonumber(oldest[2])
  return {0, oldestTimestamp + window, maxReq}
end

-- İzin ver — yeni kaydı ekle
redis.call('ZADD', key, now, memberId)
redis.call('EXPIRE', key, math.ceil(window / 1000))
return {1, maxReq - count - 1, maxReq, now + window}
`;

// ─── Redis Store ─────────────────────────────────────────

async function redisRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  if (!redis) return fallbackRateLimit(key, config);

  const now = Date.now();
  const memberId = `${now}-${crypto.randomUUID()}`;

  try {
    const result = await redis.eval(
      RATE_LIMIT_SCRIPT,
      1, // number of keys
      key,
      now,
      config.windowMs,
      config.maxRequests,
      memberId
    ) as number[];

    // Lua dönüşü: [success(0/1), remaining/resetAt, limit, resetAt]
    if (result[0] === 0) {
      return {
        success: false,
        remaining: 0,
        resetAt: result[1],
        limit: config.maxRequests,
      };
    }

    return {
      success: true,
      remaining: result[1],
      limit: config.maxRequests,
      resetAt: result[3],
    };
  } catch (err) {
    console.error("Redis rate-limit hatası, in-memory fallback:", err);
    return fallbackRateLimit(key, config);
  }
}

// ─── In-Memory Store (Fallback) ─────────────────────────

interface MemoryEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, MemoryEntry>();

// Periyodik temizlik (dakikada bir, thread bloke etmez)
const CLEANUP_INTERVAL = setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    const oldestValid = entry.timestamps[0] ?? 0;
    if (now - oldestValid > 120_000) {
      memoryStore.delete(key);
    }
  }
}, 60_000);

if (CLEANUP_INTERVAL.unref) CLEANUP_INTERVAL.unref();

async function fallbackRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  let entry = memoryStore.get(key);

  if (!entry) {
    entry = { timestamps: [now] };
    memoryStore.set(key, entry);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
      limit: config.maxRequests,
    };
  }

  const cutoff = now - config.windowMs;
  entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0]!;
    return {
      success: false,
      remaining: 0,
      resetAt: oldest + config.windowMs,
      limit: config.maxRequests,
    };
  }

  entry.timestamps.push(now);
  return {
    success: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetAt: now + config.windowMs,
    limit: config.maxRequests,
  };
}

// ─── Public API (async — eski senkron API'den farklı) ───

/**
 * Rate limit kontrolü yapar.
 * Redis varsa Redis üzerinden atomic Lua script ile,
 * yoksa in-memory Map ile.
 *
 * @param key Benzersiz anahtar (ör: "rl:user:{userId}:{route}")
 * @param config Rate limit yapılandırması
 */
export async function rateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 30, windowMs: 60_000 }
): Promise<RateLimitResult> {
  if (redis) {
    return redisRateLimit(key, config);
  }
  return fallbackRateLimit(key, config);
}

// ─── withRateLimit Wrapper ───────────────────────────────

/**
 * API route handler'ları için rate limit wrapper.
 * Artık async rateLimit kullanır — aynı arayüz, aynı kullanım.
 *
 * @example
 * ```ts
 * export const POST = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, handler);
 * ```
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: Request) => Promise<Response>,
  keyFn?: (req: Request) => string | null
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    let key: string | null = null;

    if (keyFn) {
      key = keyFn(req);
    }

    if (!key) {
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() || "anonymous";
      const url = new URL(req.url);
      key = `rl:${ip}:${url.pathname}`;
    }

    const result = await rateLimit(key, config);

    if (!result.success) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      return new Response(
        JSON.stringify({
          error: "Çok fazla istek gönderdiniz. Lütfen bekleyin.",
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        }
      );
    }

    const response = await handler(req);
    const cloned = new Response(response.body, response);
    cloned.headers.set("X-RateLimit-Limit", String(result.limit));
    cloned.headers.set("X-RateLimit-Remaining", String(result.remaining));
    cloned.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

    return cloned;
  };
}

/**
 * Test amaçlı: in-memory store'u sıfırla.
 * (Redis store testlerde ayrı ele alınmalıdır.)
 */
export function resetRateLimitStore(): void {
  memoryStore.clear();
}
