/**
 * API Route Test: POST /api/auth/2fa/init-login
 * 2FA giriş başlatma - şifre doğrulama ve pending token
 */

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  compare: jest.fn(() => Promise.resolve(true)),
}));

// Mock prisma
const mockUserFindUnique = jest.fn();
const mockUserFindFirst = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      findFirst: (...args: unknown[]) => mockUserFindFirst(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock validations
jest.mock("@/lib/validations", () => ({
  twoFactorInitLoginSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { email: "test@example.com", password: "StrongP@ss1" },
  })),
}));

// Mock two-factor
jest.mock("@/lib/two-factor", () => ({
  createPendingAuthToken: jest.fn(() => Promise.resolve("pending-token-abc")),
}));

import { POST } from "@/app/api/auth/2fa/init-login/route";

const validPayload = {
  email: "test@example.com",
  password: "StrongP@ss1",
};

const mockUserWith2FA = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  password: "hashed_password",
  role: "USER",
  image: null,
  isActive: true,
  twoFactorEnabled: true,
  twoFactorMethod: "AUTHENTICATOR",
};

const mockUserWithout2FA = {
  ...mockUserWith2FA,
  twoFactorEnabled: false,
  twoFactorMethod: null,
};

describe("POST /api/auth/2fa/init-login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns pending token when 2FA is enabled", async () => {
    mockUserFindUnique.mockResolvedValueOnce(mockUserWith2FA);

    const req = new Request("http://localhost:3000/api/auth/2fa/init-login", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.twoFactorRequired).toBe(true);
    expect(body.method).toBe("AUTHENTICATOR");
    expect(body.pendingToken).toBe("pending-token-abc");
  });

  it("returns twoFactorRequired false when 2FA is not enabled", async () => {
    mockUserFindUnique.mockResolvedValueOnce(mockUserWithout2FA);

    const req = new Request("http://localhost:3000/api/auth/2fa/init-login", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.twoFactorRequired).toBe(false);
  });

  it("returns 401 when credentials are wrong", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/2fa/init-login", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("E-posta");
  });

  it("returns 401 when password is invalid", async () => {
    mockUserFindUnique.mockResolvedValueOnce(mockUserWith2FA);
    const { compare } = require("bcryptjs");
    compare.mockResolvedValueOnce(false);

    const req = new Request("http://localhost:3000/api/auth/2fa/init-login", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("E-posta");
  });

  it("returns 401 when user is inactive", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ ...mockUserWith2FA, isActive: false });

    const req = new Request("http://localhost:3000/api/auth/2fa/init-login", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("E-posta");
  });

  it("looks up by name when email not found", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    mockUserFindFirst.mockResolvedValueOnce(mockUserWith2FA);

    const req = new Request("http://localhost:3000/api/auth/2fa/init-login", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.twoFactorRequired).toBe(true);
    expect(mockUserFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: "test@example.com" } })
    );
  });
});
