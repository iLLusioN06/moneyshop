/**
 * API Route Test: POST /api/auth/register
 * Yeni kullanıcı kaydı (SMS doğrulama ile)
 */

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashed_password_123")),
}));

// Mock prisma
const mockUserFindUnique = jest.fn();
const mockUserFindFirst = jest.fn();
const mockPendingFindFirst = jest.fn();
const mockPendingDelete = jest.fn();
const mockPendingCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      findFirst: (...args: unknown[]) => mockUserFindFirst(...args),
    },
    pendingRegistration: {
      findFirst: (...args: unknown[]) => mockPendingFindFirst(...args),
      delete: (...args: unknown[]) => mockPendingDelete(...args),
      create: (...args: unknown[]) => mockPendingCreate(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock validations
jest.mock("@/lib/validations", () => {
  return {
    registerSchema: {},
    validateRequest: jest.fn(() => ({
      success: true,
      data: { name: "Test User", email: "test@example.com", phone: "+905551234567", password: "StrongP@ss1" },
    })),
  };
});

// Mock sms
jest.mock("@/lib/sms", () => ({
  generateSmsCode: jest.fn(() => "123456"),
  hashSmsCode: jest.fn(() => "hashed_code"),
  sendSms: jest.fn(() => Promise.resolve({ success: true })),
}));

import { POST } from "@/app/api/auth/register/route";

const validPayload = {
  name: "Test User",
  email: "test@example.com",
  phone: "+905551234567",
  password: "StrongP@ss1",
};

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers user and sends SMS", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce(null);
    mockPendingFindFirst.mockResolvedValueOnce(null);
    mockPendingCreate.mockResolvedValueOnce({
      id: "pending-1",
      name: "Test User",
      email: "test@example.com",
    });

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("SMS");
    expect(body.pendingToken).toBeDefined();
  });

  it("returns 409 when email already exists", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ id: "existing", email: "test@example.com" });

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toContain("zaten kullanılıyor");
  });

  it("returns 409 when phone already exists", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce({ id: "existing", phone: "+905551234567" });

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toContain("zaten kullanılıyor");
  });

  it("cleans up old pending registration before creating new one", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce(null);
    mockPendingFindFirst.mockResolvedValueOnce({ id: "old-pending", phone: "+905551234567" });
    mockPendingCreate.mockResolvedValueOnce({ id: "new-pending" });

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { id: "old-pending" } });
  });

  it("sends SMS with verification code", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce(null);
    mockPendingFindFirst.mockResolvedValueOnce(null);
    mockPendingCreate.mockResolvedValueOnce({ id: "pending-1" });
    const { sendSms } = require("@/lib/sms");

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(sendSms).toHaveBeenCalled();
  });

  it("hashes password with bcryptjs", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce(null);
    mockPendingFindFirst.mockResolvedValueOnce(null);
    mockPendingCreate.mockResolvedValueOnce({ id: "pending-1" });
    const { hash } = require("bcryptjs");

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(hash).toHaveBeenCalledWith("StrongP@ss1", 12);
  });
});
