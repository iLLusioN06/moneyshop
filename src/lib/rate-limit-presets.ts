import { withRateLimit } from "@/lib/rate-limit";

// Admin routes
export const adminRateLimit = { maxRequests: 30, windowMs: 60_000 };
export const adminWriteRateLimit = { maxRequests: 10, windowMs: 60_000 };

// Write routes
export const writeRateLimit = { maxRequests: 20, windowMs: 60_000 };
export const deleteRateLimit = { maxRequests: 10, windowMs: 60_000 };

// Read routes
export const readRateLimit = { maxRequests: 60, windowMs: 60_000 };

// Auth routes (strict)
export const authRateLimit = { maxRequests: 5, windowMs: 60_000 };
export const authStrictRateLimit = { maxRequests: 3, windowMs: 900_000 };

// Public routes
export const publicRateLimit = { maxRequests: 30, windowMs: 60_000 };

/**
 * Wrapper for common rate limit patterns
 */
export function withAdminRateLimit(handler: (req: Request) => Promise<Response>) {
  return withRateLimit(adminRateLimit, handler);
}

export function withWriteRateLimit(handler: (req: Request) => Promise<Response>) {
  return withRateLimit(writeRateLimit, handler);
}

export function withReadRateLimit(handler: (req: Request) => Promise<Response>) {
  return withRateLimit(readRateLimit, handler);
}
