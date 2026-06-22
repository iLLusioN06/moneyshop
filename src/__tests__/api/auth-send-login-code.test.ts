/**
 * API Route Test: POST /api/auth/send-login-code
 * Giriş için SMS kodu gönderme
 */

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  compare: jest.fn(() => Promise.resolve(true)),
}));

// Mock prisma
const mockUserFindUnique = jest.fn();
const mockPendingFindFirst = jest.fn();
const mockPendingDelete = jest.fn();
const mockPendingCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
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
jest.mock("@/lib/validations", () => ({
  sendLoginCodeSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { email: "test@example.com", password: "StrongP@ss1" },
  })),
}));

// Mock sms
jest.mock("@/lib/sms", () => ({
  generateSmsCode: jest.fn(() => "654321"),
  hashSmsCode: jest.fn(() => "hashed_code"),
  sendSms: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock audit
jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test-agent" })),
}));

import { POST } from "@/app/api/auth/send-login-code/route";

const validPayload = {
  email: "test@example.com",
  password: "StrongP@ss1",
};

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  phone: "+905551234567",
  password: "hashed_password",
  isActive: true,
};

describe("POST /api/auth/send-login-code", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends SMS code for valid login", async () => {
    mockUserFindUnique.mockResolvedValueOnce(mockUser);
    mockPendingFindFirst.mockResolvedValueOnce(null);
    mockPendingCreate.mockResolvedValueOnce({ id: "pending-1" });

    const req = new Request("http://localhost:3000/api/auth/send-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("SMS");
    expect(body.phone).toBeDefined();
  });

  it("returns 401 when email does not exist", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/send-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("E-posta");
  });

  it("returns 401 when password is wrong", async () => {
    const { compare } = require("bcryptjs");
    compare.mockResolvedValueOnce(false);

    mockUserFindUnique.mockResolvedValueOnce(mockUser);

    const req = new Request("http://localhost:3000/api/auth/send-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("E-posta");
  });

  it("returns 401 when user is inactive", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...mockUser, isActive: false });

    const req = new Request("http://localhost:3000/api/auth/send-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("E-posta");
  });

  it("cleans up old pending login code before creating new one", async () => {
    mockUserFindUnique.mockResolvedValueOnce(mockUser);
    mockPendingFindFirst.mockResolvedValueOnce({ id: "old-pending", email: "test@example.com", name: "LOGIN" });
    mockPendingCreate.mockResolvedValueOnce({ id: "new-pending" });

    const req = new Request("http://localhost:3000/api/auth/send-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(mockPendingDelete).toHaveBeenCalledWith({ where: { id: "old-pending" } });
  });

  it("sends SMS with verification code", async () => {
    mockUserFindUnique.mockResolvedValueOnce(mockUser);
    mockPendingFindFirst.mockResolvedValueOnce(null);
    mockPendingCreate.mockResolvedValueOnce({ id: "pending-1" });
    const { sendSms } = require("@/lib/sms");

    const req = new Request("http://localhost:3000/api/auth/send-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(sendSms).toHaveBeenCalled();
  });

  it("creates audit log on successful code send", async () => {
    mockUserFindUnique.mockResolvedValueOnce(mockUser);
    mockPendingFindFirst.mockResolvedValueOnce(null);
    mockPendingCreate.mockResolvedValueOnce({ id: "pending-1" });
    const { createAuditLog } = require("@/lib/audit");

    const req = new Request("http://localhost:3000/api/auth/send-login-code", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    await POST(req);

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1", action: "LOGIN" })
    );
  });
});
