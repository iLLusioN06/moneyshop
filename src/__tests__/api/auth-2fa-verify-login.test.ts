/**
 * API Route Test: POST /api/auth/2fa/verify-login
 * 2FA giriş doğrulama - JWT oluşturma
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
const mockUserFindUnique = jest.fn();
const mockUserUpdate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock validations
jest.mock("@/lib/validations", () => ({
  twoFactorVerifyLoginSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { pendingToken: "pending-token-abc", code: "123456", isBackupCode: false },
  })),
}));

// Mock two-factor
jest.mock("@/lib/two-factor", () => ({
  consumePendingAuth: jest.fn(() =>
    Promise.resolve({
      userId: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    })
  ),
  verifyTotpToken: jest.fn(() => Promise.resolve(true)),
  verifySmsCode: jest.fn(() => Promise.resolve(true)),
  verifyBackupCode: jest.fn(() => "updated_hashed_codes"),
}));

// Mock audit
jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test-agent" })),
}));

import { POST } from "@/app/api/auth/2fa/verify-login/route";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "USER",
  image: null,
  twoFactorEnabled: true,
  twoFactorMethod: "AUTHENTICATOR",
  twoFactorSecret: "encrypted_secret",
  twoFactorBackupCodes: "hashed_backup_codes",
};

describe("POST /api/auth/2fa/verify-login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("verifies TOTP code and returns JWT", async () => {
    const { consumePendingAuth } = require("@/lib/two-factor");
    consumePendingAuth.mockResolvedValueOnce({
      userId: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    });
    mockUserFindUnique.mockResolvedValueOnce(mockUser);

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ pendingToken: "pending-token-abc", code: "123456" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("başarılı");
    expect(body.user).toBeDefined();
    expect(body.user.id).toBe("user-1");
  });

  it("sets JWT cookie on successful verification", async () => {
    const { consumePendingAuth } = require("@/lib/two-factor");
    consumePendingAuth.mockResolvedValueOnce({
      userId: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    });
    mockUserFindUnique.mockResolvedValueOnce(mockUser);

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ pendingToken: "pending-token-abc", code: "123456" }),
    });
    const res = await POST(req);

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("authjs.session-token");
  });

  it("verifies backup code successfully", async () => {
    const { consumePendingAuth } = require("@/lib/two-factor");
    consumePendingAuth.mockResolvedValueOnce({
      userId: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    });
    mockUserFindUnique.mockResolvedValueOnce(mockUser);
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { pendingToken: "pending-token-abc", code: "BACKUP-1234", isBackupCode: true },
    });

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ pendingToken: "pending-token-abc", code: "BACKUP-1234", isBackupCode: true }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: { twoFactorBackupCodes: "updated_hashed_codes" },
      })
    );
  });

  it("returns 410 when pending token is expired or invalid", async () => {
    const { consumePendingAuth } = require("@/lib/two-factor");
    consumePendingAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ pendingToken: "invalid-token", code: "123456" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(410);
    expect(body.error).toContain("süresi doldu");
  });

  it("returns 400 when TOTP code is invalid", async () => {
    const { consumePendingAuth } = require("@/lib/two-factor");
    consumePendingAuth.mockResolvedValueOnce({
      userId: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    });
    mockUserFindUnique.mockResolvedValueOnce(mockUser);
    const { verifyTotpToken } = require("@/lib/two-factor");
    verifyTotpToken.mockResolvedValueOnce(false);

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ pendingToken: "pending-token-abc", code: "000000" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Hatalı");
  });

  it("returns 400 when 2FA is not enabled for user", async () => {
    const { consumePendingAuth } = require("@/lib/two-factor");
    consumePendingAuth.mockResolvedValueOnce({
      userId: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    });
    mockUserFindUnique.mockResolvedValueOnce({ ...mockUser, twoFactorEnabled: false });

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ pendingToken: "pending-token-abc", code: "123456" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("2FA aktif değil");
  });

  it("creates audit log on successful login", async () => {
    const { consumePendingAuth } = require("@/lib/two-factor");
    consumePendingAuth.mockResolvedValueOnce({
      userId: "user-1",
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      image: null,
      method: "AUTHENTICATOR",
    });
    mockUserFindUnique.mockResolvedValueOnce(mockUser);
    const { createAuditLog } = require("@/lib/audit");

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ pendingToken: "pending-token-abc", code: "123456" }),
    });
    await POST(req);

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "LOGIN",
        details: expect.objectContaining({ twoFactorVerified: true }),
      })
    );
  });
});
