// =============================================
// MoneyShop - Rate Limiter
// =============================================
// In-memory sliding window rate limiter.
// Production'da Redis tabanlı çözüm (Upstash) ile değiştirilmelidir.
// Edge Runtime'da çalışmaz — sadece Node.js API route'larında kullanılabilir.

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitConfig {
  /** Maksimum istek sayısı */
  maxRequests: number;
  /** Zaman penceresi (milisaniye) */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

const store = new Map<string, RateLimitEntry>();

// Temizlik aralığı (dakikada bir temizle)
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // 1 dakikadan eski entry'leri temizle
      const oldestValid = entry.timestamps[0] ?? 0;
      if (now - oldestValid > 120_000) {
        store.delete(key);
      }
    }
  },
  60_000,
).unref();

/**
 * Rate limit kontrolü yapar.
 * @param key Benzersiz anahtar (ör: "api:user:{userId}:{route}")
 * @param config Rate limit yapılandırması
 */
export function rateLimit(key: string, config: RateLimitConfig = { maxRequests: 30, windowMs: 60_000 }): RateLimitResult {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [now] };
    store.set(key, entry);
    return { success: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs, limit: config.maxRequests };
  }

  // Zaman penceresi dışındaki timestamp'leri temizle
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

/**
 * API route handler'ları için rate limit wrapper.
 * Başarısız olursa 429 Too Many Requests döner.
 *
 * @example
 * ```ts
 * import { withRateLimit } from "@/lib/rate-limit";
 *
 * export const GET = withRateLimit({ maxRequests: 20, windowMs: 60_000 }, async (req) => {
 *   // handler code
 * });
 * ```
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (req: Request) => Promise<Response>,
  keyFn?: (req: Request) => string | null,
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    // Rate limit anahtarını oluştur
    let key: string | null = null;

    // Önce custom keyFn dene
    if (keyFn) {
      key = keyFn(req);
    }

    // Yoksa IP + path bazlı key oluştur
    if (!key) {
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() || "anonymous";
      const url = new URL(req.url);
      key = `rl:${ip}:${url.pathname}`;
    }

    const result = rateLimit(key, config);

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
        },
      );
    }

    // Handler'ı çağır ve header'larını ekle
    const response = await handler(req);

    // Response immutable olabilir, clone'la
    const cloned = new Response(response.body, response);
    cloned.headers.set("X-RateLimit-Limit", String(result.limit));
    cloned.headers.set("X-RateLimit-Remaining", String(result.remaining));
    cloned.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

    return cloned;
  };
}

/**
 * Test amacıyla store'u sıfırlama
 */
export function resetRateLimitStore(): void {
  store.clear();
}
