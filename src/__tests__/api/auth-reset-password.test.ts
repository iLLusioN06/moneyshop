/**
 * API Route Test: /api/auth/reset-password
 * POST - Şifre sıfırlama (token ile, public, rate-limited)
 */

// Mock prisma
const mockFindUnique = jest.fn();
const mockDelete = jest.fn();
const mockUpdate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    passwordResetToken: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashed-password")),
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { POST } from "@/app/api/auth/reset-password/route";

const validToken = "valid-reset-token";
const futureDate = new Date(Date.now() + 3600000);
const mockResetToken = {
  id: "rt-1",
  email: "test@test.com",
  token: validToken,
  expiresAt: futureDate,
};

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resets password successfully with valid token", async () => {
    mockFindUnique
      .mockResolvedValueOnce(mockResetToken)
      .mockResolvedValueOnce({ id: "user-1" });
    mockUpdate.mockResolvedValueOnce({});
    mockDelete.mockResolvedValueOnce({});

    const req = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: validToken, password: "NewPass123" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockFindUnique).toHaveBeenNthCalledWith(1, { where: { token: validToken } });
    expect(mockFindUnique).toHaveBeenNthCalledWith(
      2,
      { where: { email: "test@test.com" }, select: { id: true } }
    );
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "hashed-password" },
    });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "rt-1" } });
  });

  it("returns 400 when token is invalid", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: "nonexistent", password: "NewPass123" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçersiz veya süresi dolmuş bağlantı.");
  });

  it("returns 400 and deletes expired token", async () => {
    const expiredToken = {
      id: "rt-expired",
      email: "test@test.com",
      token: "expired-token",
      expiresAt: new Date(Date.now() - 3600000),
    };
    mockFindUnique.mockResolvedValueOnce(expiredToken);

    const req = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: "expired-token", password: "NewPass123" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("süresi dolmuş");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "rt-expired" } });
  });

  it("returns 404 when user not found", async () => {
    mockFindUnique
      .mockResolvedValueOnce(mockResetToken)
      .mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: validToken, password: "NewPass123" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Kullanıcı bulunamadı.");
  });

  it("returns 400 for validation error", async () => {
    const req = new Request("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: "", password: "weak" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Doğrulama hatası.");
  });
});
