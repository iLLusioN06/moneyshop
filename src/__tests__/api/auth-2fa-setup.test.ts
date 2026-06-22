/**
 * API Route Test: POST /api/auth/2fa/setup
 * İki faktörlü doğrulama kurulum başlatma
 */

// Mock auth
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

// Mock prisma
const mockUserFindUnique = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock validations
jest.mock("@/lib/validations", () => ({
  twoFactorSetupSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { method: "AUTHENTICATOR" },
  })),
}));

// Mock two-factor
jest.mock("@/lib/two-factor", () => ({
  generateTotpSecret: jest.fn(() => "JBSWY3DPEHPK3PXP"),
  generateTotpUri: jest.fn(() => "otpauth://totp/MoneyShop:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=MoneyShop"),
  generateBackupCodes: jest.fn(() => ({
    plain: ["ABCD-1234", "EFGH-5678", "IJKL-9012"],
    hashed: "hashed_backup_codes",
  })),
}));

import { POST } from "@/app/api/auth/2fa/setup/route";

const mockSession = {
  user: { id: "user-1", email: "test@example.com", name: "Test User" },
};

describe("POST /api/auth/2fa/setup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns TOTP secret and backup codes for AUTHENTICATOR method", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserFindUnique.mockResolvedValueOnce({ twoFactorEnabled: false, twoFactorSecret: null });

    const req = new Request("http://localhost:3000/api/auth/2fa/setup", {
      method: "POST",
      body: JSON.stringify({ method: "AUTHENTICATOR" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.method).toBe("AUTHENTICATOR");
    expect(body.secret).toBeDefined();
    expect(body.otpauth).toContain("otpauth://");
    expect(body.backupCodes).toBeInstanceOf(Array);
  });

  it("returns phone info for SMS method", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserFindUnique
      .mockResolvedValueOnce({ twoFactorEnabled: false, twoFactorSecret: null })
      .mockResolvedValueOnce({ phone: "+905551234567" });
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { method: "SMS" },
    });

    const req = new Request("http://localhost:3000/api/auth/2fa/setup", {
      method: "POST",
      body: JSON.stringify({ method: "SMS" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.method).toBe("SMS");
    expect(body.phone).toBe("+905551234567");
  });

  it("returns 400 when 2FA is already enabled", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserFindUnique.mockResolvedValueOnce({ twoFactorEnabled: true, twoFactorSecret: "secret" });

    const req = new Request("http://localhost:3000/api/auth/2fa/setup", {
      method: "POST",
      body: JSON.stringify({ method: "AUTHENTICATOR" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("zaten aktif");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/2fa/setup", {
      method: "POST",
      body: JSON.stringify({ method: "AUTHENTICATOR" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("Oturum");
  });
});
