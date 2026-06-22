/**
 * API Route Test: POST /api/auth/verify-sms
 * Kayıt SMS kodu doğrulama, kullanıcı oluşturma ve JWT
 */

// Mock next/server (cookies.set)
jest.mock("next/server", () => {
  return {
    NextResponse: {
      json: jest.fn((body: unknown, init?: ResponseInit) => {
        const status = init?.status ?? 200;
        const headerMap = new Map<string, string>();
        headerMap.set("content-type", "application/json");
        const cookieMap = new Map<string, string>();
        return {
          status,
          ok: status >= 200 && status < 300,
          json: () => Promise.resolve(body),
          headers: {
            get: (name: string) => headerMap.get(name.toLowerCase()) ?? null,
            set: (name: string, value: string) => headerMap.set(name.toLowerCase(), value),
          },
          cookies: {
            set: jest.fn((name: string, value: string) => {
              cookieMap.set(name, value);
              const existing = headerMap.get("set-cookie") || "";
              headerMap.set("set-cookie", existing ? `${existing}, ${name}=${value}` : `${name}=${value}`);
            }),
            get: jest.fn((name: string) => cookieMap.get(name)),
          },
        };
      }),
    },
  };
});

// Mock next-auth/jwt
jest.mock("next-auth/jwt", () => ({
  encode: jest.fn(() => Promise.resolve("mock_jwt_token")),
}));

// Mock prisma
const mockPendingFindUnique = jest.fn();
const mockPendingFindFirst = jest.fn();
const mockPendingDelete = jest.fn();
const mockUserCreate = jest.fn();
const mockCardCreate = jest.fn();
const mockCategoryCreateMany = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    pendingRegistration: {
      findUnique: (...args: unknown[]) => mockPendingFindUnique(...args),
      findFirst: (...args: unknown[]) => mockPendingFindFirst(...args),
      delete: (...args: unknown[]) => mockPendingDelete(...args),
    },
    user: {
      create: (...args: unknown[]) => mockUserCreate(...args),
    },
    card: {
      create: (...args: unknown[]) => mockCardCreate(...args),
    },
    category: {
      createMany: (...args: unknown[]) => mockCategoryCreateMany(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock validations
jest.mock("@/lib/validations", () => ({
  verifySmsSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { phone: "+905551234567", code: "654321", pendingToken: "token-123" },
  })),
}));

// Mock sms
jest.mock("@/lib/sms", () => ({
  hashSmsCode: jest.fn(() => "hashed_code"),
}));

// Mock audit
jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test-agent" })),
}));

// Mock card-utils
jest.mock("@/lib/card-utils", () => ({
  generateCardNumber: jest.fn(() => "4111111111111111"),
  generateCvv: jest.fn(() => "123"),
  encryptCardNumber: jest.fn(() => "encrypted_card_number"),
  encryptCvv: jest.fn(() => "encrypted_cvv"),
}));

import { POST } from "@/app/api/auth/verify-sms/route";

const validPayload = {
  phone: "+905551234567",
  code: "654321",
  pendingToken: "token-123",
};

const mockPending = {
  id: "pending-1",
  name: "Test User",
  email: "test@example.com",
  phone: "+905551234567",
  password: "hashed_password",
  code: "hashed_code",
  expiresAt: new Date(Date.now() + 30 * 60 * 1000),
};

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  phone: "+905551234567",
  role: "USER",
  image: null,
};

describe("POST /api/auth/verify-sms", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates user, card, categories and returns JWT", async () => {
    mockPendingFindUnique.mockResolvedValueOnce(mockPending);
    mockUserCreate.mockResolvedValueOnce(mockUser);
    mockCardCreate.mockResolvedValueOnce({ id: "card-1" });
    mockCategoryCreateMany.mockResolvedValueOnce({ count: 11 });
    mockPendingDelete.mockResolvedValueOnce(mockPending);

    const req = new Request("http://localhost:3000/api/auth/verify-sms", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toContain("oluşturuldu");
    expect(mockUserCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Test User",
          email: "test@example.com",
          phone: "+905551234567",
        }),
      })
    );
    expect(mockCardCreate).toHaveBeenCalled();
    expect(mockCategoryCreateMany).toHaveBeenCalled();
    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { id: "pending-1" } });
  });

  it("sets JWT cookie on successful verification", async () => {
    mockPendingFindUnique.mockResolvedValueOnce(mockPending);
    mockUserCreate.mockResolvedValueOnce(mockUser);
    mockCardCreate.mockResolvedValueOnce({ id: "card-1" });
    mockCategoryCreateMany.mockResolvedValueOnce({ count: 11 });
    mockPendingDelete.mockResolvedValueOnce(mockPending);

    const req = new Request("http://localhost:3000/api/auth/verify-sms", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("authjs.session-token");
  });

  it("returns 404 when pending record not found", async () => {
    mockPendingFindUnique.mockResolvedValueOnce(null);
    mockPendingFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/verify-sms", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toContain("bulunamadı");
  });

  it("returns 410 when code is expired", async () => {
    const expired = {
      ...mockPending,
      expiresAt: new Date(Date.now() - 60 * 1000),
    };
    mockPendingFindUnique.mockResolvedValueOnce(expired);

    const req = new Request("http://localhost:3000/api/auth/verify-sms", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(410);
    expect(body.error).toContain("süresi doldu");
  });

  it("returns 400 when code is invalid", async () => {
    mockPendingFindUnique.mockResolvedValueOnce(mockPending);
    const { hashSmsCode } = require("@/lib/sms");
    hashSmsCode.mockReturnValueOnce("wrong_hashed_code");

    const req = new Request("http://localhost:3000/api/auth/verify-sms", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Hatalı");
  });

  it("looks up by phone when pendingToken not provided", async () => {
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValue({
      success: true,
      data: { phone: "+905551234567", code: "654321", pendingToken: undefined },
    });

    const prismaModule = require("@/lib/prisma");
    prismaModule.prisma.pendingRegistration.findFirst = jest.fn(() => Promise.resolve(mockPending));
    prismaModule.prisma.pendingRegistration.delete = jest.fn(() => Promise.resolve(mockPending));
    mockUserCreate.mockResolvedValueOnce(mockUser);
    mockCardCreate.mockResolvedValueOnce({ id: "card-1" });
    mockCategoryCreateMany.mockResolvedValueOnce({ count: 11 });

    const req = new Request("http://localhost:3000/api/auth/verify-sms", {
      method: "POST",
      body: JSON.stringify({ phone: "+905551234567", code: "654321" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);

    validateRequest.mockReturnValue({
      success: true,
      data: { phone: "+905551234567", code: "654321", pendingToken: "token-123" },
    });
  });

  it("creates audit log after user creation", async () => {
    mockPendingFindUnique.mockResolvedValueOnce(mockPending);
    mockUserCreate.mockResolvedValueOnce(mockUser);
    mockCardCreate.mockResolvedValueOnce({ id: "card-1" });
    mockCategoryCreateMany.mockResolvedValueOnce({ count: 11 });
    mockPendingDelete.mockResolvedValueOnce(mockPending);
    const { createAuditLog } = require("@/lib/audit");

    const req = new Request("http://localhost:3000/api/auth/verify-sms", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", action: "REGISTER" })
    );
  });
});
