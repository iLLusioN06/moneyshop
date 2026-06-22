/**
 * API Route Test: POST /api/auth/2fa/verify-setup
 * İki faktörlü doğrulama kurulum doğrulama
 */

// Mock auth
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

// Mock prisma
const mockUserUpdate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
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
  twoFactorVerifySetupSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { method: "AUTHENTICATOR", secret: "JBSWY3DPEHPK3PXP", code: "123456" },
  })),
}));

// Mock two-factor
jest.mock("@/lib/two-factor", () => ({
  verifyTotpTokenRaw: jest.fn(() => Promise.resolve(true)),
  encryptSecret: jest.fn(() => "encrypted_secret"),
  storeSmsCode: jest.fn(() => Promise.resolve()),
  verifySmsCode: jest.fn(() => Promise.resolve(true)),
}));

// Mock audit
jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test-agent" })),
}));

// Mock sms
jest.mock("@/lib/sms", () => ({
  generateSmsCode: jest.fn(() => "654321"),
}));

import { POST } from "@/app/api/auth/2fa/verify-setup/route";

const mockSession = {
  user: { id: "user-1", email: "test@example.com", name: "Test User" },
};

describe("POST /api/auth/2fa/verify-setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("verifies TOTP setup and saves encrypted secret", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserUpdate.mockResolvedValueOnce({ id: "user-1" });

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-setup", {
      method: "POST",
      body: JSON.stringify({ method: "AUTHENTICATOR", secret: "JBSWY3DPEHPK3PXP", code: "123456" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("Doğrulama başarılı");
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: { twoFactorSecret: "encrypted_secret" },
      })
    );
  });

  it("verifies SMS setup successfully", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { method: "SMS", code: "654321" },
    });

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-setup", {
      method: "POST",
      body: JSON.stringify({ method: "SMS", code: "654321" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("SMS doğrulaması başarılı");
  });

  it("returns 400 when TOTP code is invalid", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    const { verifyTotpTokenRaw } = require("@/lib/two-factor");
    verifyTotpTokenRaw.mockResolvedValueOnce(false);

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-setup", {
      method: "POST",
      body: JSON.stringify({ method: "AUTHENTICATOR", secret: "JBSWY3DPEHPK3PXP", code: "000000" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Hatalı");
  });

  it("returns 400 when SMS code is invalid", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    const { verifySmsCode } = require("@/lib/two-factor");
    verifySmsCode.mockResolvedValueOnce(false);
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { method: "SMS", code: "000000" },
    });

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-setup", {
      method: "POST",
      body: JSON.stringify({ method: "SMS", code: "000000" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("hatalı");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-setup", {
      method: "POST",
      body: JSON.stringify({ method: "AUTHENTICATOR", secret: "JBSWY3DPEHPK3PXP", code: "123456" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("Oturum");
  });

  it("creates audit log on successful TOTP verification", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserUpdate.mockResolvedValueOnce({ id: "user-1" });
    const { createAuditLog } = require("@/lib/audit");

    const req = new Request("http://localhost:3000/api/auth/2fa/verify-setup", {
      method: "POST",
      body: JSON.stringify({ method: "AUTHENTICATOR", secret: "JBSWY3DPEHPK3PXP", code: "123456" }),
    });
    await POST(req);

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "UPDATE",
        details: expect.objectContaining({ twoFactorSetup: "AUTHENTICATOR" }),
      })
    );
  });
});
