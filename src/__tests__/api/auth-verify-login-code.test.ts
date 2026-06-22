/**
 * API Route Test: POST /api/auth/verify-login-code
 * Giriş SMS kodu doğrulama
 */

// Mock prisma
const mockPendingFindFirst = jest.fn();
const mockPendingDelete = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    pendingRegistration: {
      findFirst: (...args: unknown[]) => mockPendingFindFirst(...args),
      delete: (...args: unknown[]) => mockPendingDelete(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock validations
jest.mock("@/lib/validations", () => ({
  verifyLoginCodeSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { phone: "+905551234567", code: "654321" },
  })),
}));

// Mock sms
jest.mock("@/lib/sms", () => ({
  hashSmsCode: jest.fn(() => "hashed_code"),
}));

import { POST } from "@/app/api/auth/verify-login-code/route";

const validPayload = {
  phone: "+905551234567",
  code: "654321",
};

const mockPending = {
  id: "pending-1",
  phone: "+905551234567",
  name: "LOGIN",
  code: "hashed_code",
  expiresAt: new Date(Date.now() + 30 * 60 * 1000),
};

describe("POST /api/auth/verify-login-code", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("verifies login SMS code successfully", async () => {
    mockPendingFindFirst.mockResolvedValueOnce(mockPending);
    mockPendingDelete.mockResolvedValueOnce(mockPending);

    const req = new Request("http://localhost:3000/api/auth/verify-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("Doğrulama");
  });

  it("returns 404 when pending record not found", async () => {
    mockPendingFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/verify-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toContain("bulunamadı");
  });

  it("returns 410 when code is expired", async () => {
    mockPendingFindFirst.mockResolvedValueOnce({
      ...mockPending,
      expiresAt: new Date(Date.now() - 60 * 1000),
    });

    const req = new Request("http://localhost:3000/api/auth/verify-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(410);
    expect(body.error).toContain("süresi doldu");
  });

  it("deletes expired pending record", async () => {
    const expired = {
      ...mockPending,
      expiresAt: new Date(Date.now() - 60 * 1000),
    };
    mockPendingFindFirst.mockResolvedValueOnce(expired);

    const req = new Request("http://localhost:3000/api/auth/verify-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { id: "pending-1" } });
  });

  it("returns 400 when code is invalid", async () => {
    mockPendingFindFirst.mockResolvedValueOnce(mockPending);
    const { hashSmsCode } = require("@/lib/sms");
    hashSmsCode.mockReturnValueOnce("wrong_hashed_code");

    const req = new Request("http://localhost:3000/api/auth/verify-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Hatalı");
  });

  it("deletes pending record after successful verification", async () => {
    mockPendingFindFirst.mockResolvedValueOnce(mockPending);
    mockPendingDelete.mockResolvedValueOnce(mockPending);

    const req = new Request("http://localhost:3000/api/auth/verify-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { id: "pending-1" } });
  });
});
