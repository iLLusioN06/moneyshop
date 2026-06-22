// =============================================
// MoneyShop — API Error Handler (Tutarlı Hata Yönetimi)
// =============================================
// Tüm API route'ları aynı wrapper'ı kullanarak tutarlı hata döndürür.
// =============================================

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// ─── Custom Error Classes ──────────────────────────────

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Oturum açmanız gerekiyor.") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Bu işlem için yetkiniz yok.") {
    super(403, message, "FORBIDDEN");
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Kayıt bulunamadı.") {
    super(404, message, "NOT_FOUND");
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Geçersiz veri.", public details?: Record<string, string>) {
    super(400, message, "VALIDATION_ERROR");
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Bu kayıt zaten mevcut.") {
    super(409, message, "CONFLICT");
  }
}

// ─── Type Definitions ──────────────────────────────────

type ApiHandler = (req: Request, context?: unknown) => Promise<Response>;

interface ApiWrapperOptions {
  /** Otomatik auth kontrolü */
  requireAuth?: boolean;
  /** Admin yetkisi gerekli mi */
  requireAdmin?: boolean;
}

// ─── Error Response Helper ─────────────────────────────

function errorResponse(statusCode: number, message: string, code?: string, details?: unknown) {
  const body: Record<string, unknown> = { error: message };
  if (code) body.code = code;
  if (details) body.details = details;

  return NextResponse.json(body, { status: statusCode });
}

// ─── Prisma Error Handler ──────────────────────────────

function handlePrismaError(error: Prisma.PrismaClientKnownRequestError) {
  switch (error.code) {
    case "P2002":
      return errorResponse(409, "Bu kayıt zaten mevcut.", "CONFLICT");
    case "P2025":
      return errorResponse(404, "Kayıt bulunamadı.", "NOT_FOUND");
    case "P2003":
      return errorResponse(400, "İlişkili kayıt bulunamadı.", "FOREIGN_KEY_ERROR");
    case "P2014":
      return errorResponse(400, "Zorunlu alan eksik.", "REQUIRED_FIELD");
    default:
      return errorResponse(500, "Veritabanı hatası.", "DATABASE_ERROR");
  }
}

// ─── Main Wrapper ──────────────────────────────────────

/**
 * API handler'ları için tutarlı hata yönetimi wrapper'ı.
 *
 * @example
 * ```ts
 * // Basit kullanım
 * export const GET = apiHandler(async (req) => {
 *   const data = await prisma.user.findMany();
 *   return NextResponse.json({ success: true, data });
 * });
 *
 * // Auth gerektiren
 * export const POST = apiHandler(async (req) => {
 *   const body = await req.json();
 *   // ...
 * }, { requireAuth: true });
 *
 * // Admin gerektiren
 * export const DELETE = apiHandler(async (req) => {
 *   // ...
 * }, { requireAuth: true, requireAdmin: true });
 * ```
 */
export function apiHandler(
  handler: ApiHandler,
  options: ApiWrapperOptions = {}
) {
  return async (req: Request, context?: unknown): Promise<Response> => {
    try {
      // Auth kontrolü
      if (options.requireAuth || options.requireAdmin) {
        const session = await auth();
        if (!session?.user) {
          return errorResponse(401, "Oturum açmanız gerekiyor.", "UNAUTHORIZED");
        }
        if (options.requireAdmin && session.user.role !== "ADMIN") {
          return errorResponse(403, "Bu işlem için yetkiniz yok.", "FORBIDDEN");
        }
      }

      // Handler'ı çalıştır
      const response = await handler(req, context);
      return response;
    } catch (error) {
      // ApiError (özel hatalar)
      if (error instanceof ApiError) {
        return errorResponse(error.statusCode, error.message, error.code, (error as ValidationError).details);
      }

      // Prisma hataları
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error("Prisma error:", error.code, error.message);
        return handlePrismaError(error);
      }

      // JSON parse hatası
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return errorResponse(400, "Geçersiz JSON formatı.", "INVALID_JSON");
      }

      // Diğer tüm hatalar
      console.error("Unhandled API error:", error);
      return errorResponse(500, "Sunucu hatası oluştu.", "INTERNAL_ERROR");
    }
  };
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Paginated success response helper
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
