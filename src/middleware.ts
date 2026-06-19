// =============================================
// MoneyShop — Next.js Middleware (Rate Limit Only)
// =============================================
// Sadece rate limit uygular. Auth koruması route'larda yapılıyor.
// =============================================

import { NextResponse } from "next/server";

// ─── Rate Limit Store ─────────────────────────────────

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// ─── Rate Limit Config ────────────────────────────────

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/auth/login": { max: 5, windowMs: 60_000 },
  "/api/auth/register": { max: 3, windowMs: 60_000 },
  "/api/auth/forgot-password": { max: 3, windowMs: 900_000 },
  "/api/auth/reset-password": { max: 5, windowMs: 900_000 },
  "/api/auth/send-login-code": { max: 5, windowMs: 60_000 },
  "/api/auth/verify-login-code": { max: 5, windowMs: 60_000 },
  "/api/auth/verify-sms": { max: 5, windowMs: 60_000 },
  "/api/auth/2fa": { max: 10, windowMs: 60_000 },
  "/api/transactions": { max: 30, windowMs: 60_000 },
  "/api/transfers": { max: 10, windowMs: 60_000 },
  "/api/deposits": { max: 10, windowMs: 60_000 },
  "/api/withdrawals": { max: 10, windowMs: 60_000 },
  "/api/payments": { max: 10, windowMs: 60_000 },
  "/api/investments": { max: 20, windowMs: 60_000 },
  "/api/cards": { max: 20, windowMs: 60_000 },
  "/api/accounts": { max: 30, windowMs: 60_000 },
  "/api/categories": { max: 30, windowMs: 60_000 },
  "/api/budgets": { max: 30, windowMs: 60_000 },
  "/api/support-tickets": { max: 10, windowMs: 60_000 },
  "/api/installments": { max: 15, windowMs: 60_000 },
  "/api/savings": { max: 15, windowMs: 60_000 },
  "/api/beneficiaries": { max: 15, windowMs: 60_000 },
  "/api/split-bills": { max: 15, windowMs: 60_000 },
  "/api/transaction-templates": { max: 15, windowMs: 60_000 },
  "/api/dashboard": { max: 60, windowMs: 60_000 },
  "/api/search": { max: 30, windowMs: 60_000 },
  "/api/reports": { max: 10, windowMs: 60_000 },
  "/api/cbi-rates": { max: 10, windowMs: 60_000 },
  "/api/exchange-rates": { max: 10, windowMs: 60_000 },
  "/api/notifications": { max: 30, windowMs: 60_000 },
  "/api/admin": { max: 60, windowMs: 60_000 },
};

const DEFAULT_LIMIT = { max: 60, windowMs: 60_000 };

// ─── Cleanup ──────────────────────────────────────────

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (now - (entry.timestamps[0] ?? 0) > 120_000) {
      store.delete(key);
    }
  }
}

// ─── Rate Limit Check ─────────────────────────────────

function checkRateLimit(
  key: string,
  config: { max: number; windowMs: number }
): { success: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [now] };
    store.set(key, entry);
    return { success: true, remaining: config.max - 1, retryAfter: 0 };
  }

  const cutoff = now - config.windowMs;
  entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);

  if (entry.timestamps.length >= config.max) {
    const oldest = entry.timestamps[0]!;
    const retryAfter = Math.ceil((oldest + config.windowMs - now) / 1000);
    return { success: false, remaining: 0, retryAfter };
  }

  entry.timestamps.push(now);
  return { success: true, remaining: config.max - entry.timestamps.length, retryAfter: 0 };
}

// ─── Middleware ────────────────────────────────────────

export function middleware(request: Request) {
  const url = new URL(request.url);
  const { pathname } = url;

  // Sadece API route'larına uygula
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Health check, auth ve static asset'leri atla
  if (
    pathname === "/api/health" ||
    pathname.startsWith("/api/ws") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Rate limit config'i bul
  let config = DEFAULT_LIMIT;
  for (const [prefix, limitConfig] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) {
      config = limitConfig;
      break;
    }
  }

  // IP al
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "anonymous";
  const key = `rl:${ip}:${pathname}`;

  // Rate limit kontrolü
  cleanup();
  const result = checkRateLimit(key, config);

  if (!result.success) {
    return NextResponse.json(
      { error: "Çok fazla istek gönderdiniz.", retryAfter: result.retryAfter },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfter),
          "X-RateLimit-Limit": String(config.max),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
