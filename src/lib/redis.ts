// =============================================
// MoneyShop - Redis Client Singleton
// =============================================
// ioredis ile Redis bağlantısı.
// REDIS_URL ortam değişkeni ile yapılandırılır.
// Bağlantı kurulamazsa null döner (graceful fallback).
// =============================================

import { Redis, type RedisOptions } from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined;
};

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "⚠️  REDIS_URL tanımlanmamış! Rate limiter in-memory çalışacak. " +
        "Multi-instance ortamlarda tutarsız olabilir."
      );
    }
    return null;
  }

  try {
    const options: RedisOptions = {
      lazyConnect: true, // ilk istekte bağlan
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null; // vazgeç
        return Math.min(times * 200, 2000);
      },
      enableOfflineQueue: false,
    };

    const redis = new Redis(url, options);

    redis.on("error", (err) => {
      console.error("Redis bağlantı hatası:", err.message);
    });

    redis.on("connect", () => {
      console.log("✅ Redis bağlantısı kuruldu.");
    });

    return redis;
  } catch (err) {
    console.error("Redis başlatılamadı, in-memory fallback kullanılacak:", err);
    return null;
  }
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
