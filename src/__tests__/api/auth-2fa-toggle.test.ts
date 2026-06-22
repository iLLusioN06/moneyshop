/**
 * API Route Test: POST /api/auth/2fa/toggle
 * İki faktörlü doğrulama aç/kapa
 */

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  compare: jest.fn(() => Promise.resolve(true)),
}));

// Mock auth
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
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
  twoFactorToggleSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { enabled: true, method: "AUTHENTICATOR" },
  })),
}));

// Mock two-factor
jest.mock("@/lib/two-factor", () => ({
  generateBackupCodes: jest.fn(() => ({
    plain: ["BACKUP-1234", "BACKUP-5678"],
    hashed: "hashed_backup_codes",
  })),
  encryptSecret: jest.fn(() => "encrypted_secret"),
  verifyTotpToken: jest.fn(() => Promise.resolve(true)),
  verifyBackupCode: jest.fn(() => "updated_hashed_codes"),
  verifySmsCode: jest.fn(() => Promise.resolve(true)),
}));

// Mock audit
jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test-agent" })),
}));

import { POST } from "@/app/api/auth/2fa/toggle/route";

const mockSession = {
  user: { id: "user-1", email: "test@example.com", name: "Test User" },
};

const mockUserWithSecret = {
  twoFactorEnabled: false,
  twoFactorMethod: null,
  twoFactorSecret: "encrypted_secret",
};

const mockFullUser = {
  password: "hashed_password",
  twoFactorEnabled: true,
  twoFactorMethod: "AUTHENTICATOR",
  twoFactorSecret: "encrypted_secret",
  twoFactorBackupCodes: "hashed_backup_codes",
};

describe("POST /api/auth/2fa/toggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("enables 2FA with AUTHENTICATOR method", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserFindUnique.mockResolvedValueOnce(mockUserWithSecret);
    mockUserUpdate.mockResolvedValueOnce({ id: "user-1" });

    const req = new Request("http://localhost:3000/api/auth/2fa/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: true, method: "AUTHENTICATOR" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("aktif");
    expect(body.backupCodes).toBeInstanceOf(Array);
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({
          twoFactorEnabled: true,
          twoFactorMethod: "AUTHENTICATOR",
        }),
      })
    );
  });

  it("enables 2FA with SMS method", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserFindUnique.mockResolvedValueOnce({
      twoFactorEnabled: false,
      twoFactorMethod: null,
      twoFactorSecret: null,
    });
    mockUserUpdate.mockResolvedValueOnce({ id: "user-1" });
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { enabled: true, method: "SMS" },
    });

    const req = new Request("http://localhost:3000/api/auth/2fa/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: true, method: "SMS" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("aktif");
  });

  it("returns 400 when enabling AUTHENTICATOR without secret", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserFindUnique.mockResolvedValueOnce({
      twoFactorEnabled: false,
      twoFactorMethod: null,
      twoFactorSecret: null,
    });
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { enabled: true, method: "AUTHENTICATOR" },
    });

    const req = new Request("http://localhost:3000/api/auth/2fa/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: true, method: "AUTHENTICATOR" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("kurulumunu");
  });

  it("disables 2FA with password and TOTP code", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserFindUnique.mockResolvedValueOnce({
      twoFactorEnabled: true,
      twoFactorMethod: "AUTHENTICATOR",
      twoFactorSecret: "encrypted_secret",
    });
    mockUserFindUnique.mockResolvedValueOnce(mockFullUser);
    mockUserUpdate.mockResolvedValueOnce({ id: "user-1" });
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { enabled: false, password: "StrongP@ss1", code: "123456" },
    });

    const req = new Request("http://localhost:3000/api/auth/2fa/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: false, password: "StrongP@ss1", code: "123456" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("devre dışı");
  });

  it("disables 2FA using backup code", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);
    mockUserFindUnique.mockResolvedValueOnce({
      twoFactorEnabled: true,
      twoFactorMethod: "AUTHENTICATOR",
      twoFactorSecret: "encrypted_secret",
    });
    mockUserFindUnique.mockResolvedValueOnce(mockFullUser);
    mockUserUpdate.mockResolvedValueOnce({ id: "user-1" });
    const { verifyTotpToken } = require("@/lib/two-factor");
    verifyTotpToken.mockResolvedValueOnce(false);
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { enabled: false, password: "StrongP@ss1", code: "BACKUP-1234" },
    });

    const req = new Request("http://localhost:3000/api/auth/2fa/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: false, password: "StrongP@ss1", code: "BACKUP-1234" }),
    });
    await POST(req);

    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-1" },
        data: expect.objectContaining({ twoFactorBackupCodes: "updated_hashed_codes" }),
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/2fa/toggle", {
      method: "POST",
      body: JSON.stringify({ enabled: true, method: "AUTHENTICATOR" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("Oturum");
  });
});
