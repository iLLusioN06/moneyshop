/**
 * API Route Test: /api/accounts
 * GET  - Kullanıcının hesaplarını listele
 * POST - Yeni hesap oluştur
 */

import { NextRequest } from "next/server";

// Mock api-handler (prisma import chain'i kırmak için tam mock)
class MockValidationError extends Error {
  statusCode = 400;
  code = "VALIDATION_ERROR";
  details: Record<string, string> | undefined;
  constructor(message = "Geçersiz veri.", details?: Record<string, string>) {
    super(message);
    this.name = "ValidationError";
    this.details = details;
  }
}

function mockErrorResponse(statusCode: number, message: string, code?: string) {
  return Response.json(
    { error: message, ...(code ? { code } : {}) },
    { status: statusCode }
  );
}

function mockSuccessResponse(data: unknown, status = 200) {
  return Response.json({ success: true, data }, { status });
}

jest.mock("@/lib/api-handler", () => {
  const ValidationError = class extends Error {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    details: Record<string, string> | undefined;
    constructor(message = "Geçersiz veri.", details?: Record<string, string>) {
      super(message);
      this.name = "ValidationError";
      this.details = details;
    }
  };

  return {
    ApiError: class extends Error {
      statusCode: number;
      code?: string;
      constructor(statusCode: number, message: string, code?: string) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.code = code;
      }
    },
    UnauthorizedError: class extends Error {
      constructor(message = "Oturum açmanız gerekiyor.") {
        super(message);
        this.name = "UnauthorizedError";
      }
    },
    NotFoundError: class extends Error {
      constructor(message = "Kayıt bulunamadı.") {
        super(message);
        this.name = "NotFoundError";
      }
    },
    ValidationError,
    ConflictError: class extends Error {
      constructor(message = "Bu kayıt zaten mevcut.") {
        super(message);
        this.name = "ConflictError";
      }
    },
    apiHandler: (handler: Function, _options?: { requireAuth?: boolean }) => {
      return async (req: Request, context?: unknown) => {
        try {
          return await handler(req, context);
        } catch (err: unknown) {
          if (err instanceof ValidationError) {
            return mockErrorResponse(err.statusCode, err.message, err.code);
          }
          throw err;
        }
      };
    },
    successResponse: mockSuccessResponse,
    errorResponse: mockErrorResponse,
    paginatedResponse: (data: unknown[], total: number, page: number, limit: number) => {
      return Response.json({
        success: true,
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      });
    },
  };
});

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const mockFindFirst = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    financialAccount: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}));

// Mock audit (silent)
jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test" })),
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { GET, POST } from "@/app/api/accounts/route";

describe("GET /api/accounts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with accounts list", async () => {
    const mockAccounts = [
      { id: "acc-1", name: "Vadesiz Hesap", type: "CHECKING", balance: 15000, currency: "TRY" },
      { id: "acc-2", name: "Dolar Hesabı", type: "SAVINGS", balance: 1000, currency: "USD" },
    ];
    mockFindMany.mockResolvedValueOnce(mockAccounts);

    const req = new NextRequest("http://localhost:3000/api/accounts");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockAccounts);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns 200 with empty array when no accounts", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost:3000/api/accounts");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });
});

describe("POST /api/accounts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates account and returns 201", async () => {
    const newAccount = {
      id: "acc-3",
      userId: "user-1",
      name: "Yeni Hesap",
      type: "CHECKING",
      balance: 5000,
      currency: "TRY",
      icon: null,
      color: null,
    };
    mockCreate.mockResolvedValueOnce(newAccount);

    const req = new NextRequest("http://localhost:3000/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "Yeni Hesap", type: "CHECKING", balance: 5000, currency: "TRY" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(newAccount);
  });

  it("returns 400 when name is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/accounts", {
      method: "POST",
      body: JSON.stringify({ type: "CHECKING" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Hesap adı zorunludur.");
  });

  it("uses defaults for optional fields", async () => {
    mockCreate.mockResolvedValueOnce({
      id: "acc-4",
      userId: "user-1",
      name: "Minimal",
      type: "CHECKING",
      balance: 0,
      currency: "TRY",
      icon: null,
      color: null,
    });

    const req = new NextRequest("http://localhost:3000/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "Minimal" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "CHECKING",
          balance: 0,
          currency: "TRY",
        }),
      })
    );
  });

  it("creates audit log on account creation", async () => {
    const newAccount = { id: "acc-5", userId: "user-1", name: "Audit Test", type: "SAVINGS", balance: 100, currency: "TRY", icon: null, color: null };
    mockCreate.mockResolvedValueOnce(newAccount);
    const { createAuditLog } = require("@/lib/audit");

    const req = new NextRequest("http://localhost:3000/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name: "Audit Test", type: "SAVINGS", balance: 100, currency: "TRY" }),
    });
    await POST(req);

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "CREATE",
        entity: "ACCOUNT",
      })
    );
  });
});
