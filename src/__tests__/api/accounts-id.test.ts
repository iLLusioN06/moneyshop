/**
 * API Route Test: /api/accounts/[id]
 * GET  - Hesap detayı
 * PUT  - Hesap güncelle
 * DELETE - Hesap sil (soft delete)
 */

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockFindFirst = jest.fn();
const mockUpdate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    financialAccount: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// Mock api-handler (functional mock for wrapper)
jest.mock("@/lib/api-handler", () => {
  const { auth } = jest.requireMock("@/lib/auth");
  class ApiError extends Error {
    statusCode: number;
    code?: string;
    constructor(statusCode: number, message: string, code?: string) {
      super(message);
      this.name = "ApiError";
      this.statusCode = statusCode;
      this.code = code;
    }
  }
  class NotFoundError extends ApiError {
    constructor(message = "Kayıt bulunamadı.") {
      super(404, message, "NOT_FOUND");
    }
  }
  return {
    ApiError,
    NotFoundError,
    successResponse: (data: unknown, status = 200) =>
      Response.json({ success: true, data }, { status }),
    apiHandler: (
      handler: (req: Request, context?: unknown) => Promise<Response>,
      options: { requireAuth?: boolean; requireAdmin?: boolean } = {}
    ) => {
      return async (req: Request, context?: unknown) => {
        try {
          if (options.requireAuth || options.requireAdmin) {
            const session = await auth();
            if (!session?.user) {
              return Response.json(
                { error: "Oturum açmanız gerekiyor.", code: "UNAUTHORIZED" },
                { status: 401 }
              );
            }
            if (options.requireAdmin && session.user.role !== "ADMIN") {
              return Response.json(
                { error: "Bu işlem için yetkiniz yok.", code: "FORBIDDEN" },
                { status: 403 }
              );
            }
          }
          return await handler(req, context);
        } catch (error) {
          if (error instanceof ApiError) {
            return Response.json(
              { error: error.message, code: error.code },
              { status: error.statusCode }
            );
          }
          throw error;
        }
      };
    },
  };
});

// Mock audit (silent)
jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test" })),
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { GET, PUT, DELETE } from "@/app/api/accounts/[id]/route";

const mockAccount = {
  id: "acc-1",
  name: "Vadesiz Hesap",
  type: "CHECKING",
  balance: 5000,
  currency: "TRY",
  icon: "wallet",
  color: "#10b981",
  isActive: true,
  userId: "user-1",
  createdAt: new Date().toISOString(),
};

describe("GET /api/accounts/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with account details", async () => {
    mockFindFirst.mockResolvedValueOnce(mockAccount);

    const req = new Request("http://localhost:3000/api/accounts/acc-1");
    const res = await GET(req, { params: Promise.resolve({ id: "acc-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockAccount);
  });

  it("returns 404 when account not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/accounts/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/accounts/acc-1");
    const res = await GET(req, { params: Promise.resolve({ id: "acc-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/accounts/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates account and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockAccount);
    mockUpdate.mockResolvedValueOnce({ ...mockAccount, name: "Güncellenmiş Hesap" });

    const req = new Request("http://localhost:3000/api/accounts/acc-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Güncellenmiş Hesap" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "acc-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Güncellenmiş Hesap");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "acc-1" },
        data: expect.objectContaining({ name: "Güncellenmiş Hesap" }),
      })
    );
  });

  it("returns 404 when account to update not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/accounts/nonexistent", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("creates audit log on update", async () => {
    mockFindFirst.mockResolvedValueOnce(mockAccount);
    mockUpdate.mockResolvedValueOnce(mockAccount);
    const { createAuditLog } = require("@/lib/audit");

    const req = new Request("http://localhost:3000/api/accounts/acc-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Güncellenmiş Hesap" }),
    });
    await PUT(req, { params: Promise.resolve({ id: "acc-1" }) });

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "UPDATE",
        entity: "ACCOUNT",
      })
    );
  });
});

describe("DELETE /api/accounts/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("soft-deletes account (sets isActive=false)", async () => {
    mockFindFirst.mockResolvedValueOnce(mockAccount);
    mockUpdate.mockResolvedValueOnce({ ...mockAccount, isActive: false });

    const req = new Request("http://localhost:3000/api/accounts/acc-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "acc-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "acc-1" },
        data: { isActive: false },
      })
    );
  });

  it("returns 404 when account to delete not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/accounts/nonexistent", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("creates audit log on deactivate", async () => {
    mockFindFirst.mockResolvedValueOnce(mockAccount);
    mockUpdate.mockResolvedValueOnce({ ...mockAccount, isActive: false });
    const { createAuditLog } = require("@/lib/audit");

    const req = new Request("http://localhost:3000/api/accounts/acc-1", { method: "DELETE" });
    await DELETE(req, { params: Promise.resolve({ id: "acc-1" }) });

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "DEACTIVATE",
        entity: "ACCOUNT",
      })
    );
  });
});
