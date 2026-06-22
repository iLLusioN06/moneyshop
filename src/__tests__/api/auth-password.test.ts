/**
 * API Route Test: /api/auth/password
 * PUT - Parola değiştirme (auth required, rate-limited)
 */

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// Mock bcryptjs
const mockCompare = jest.fn(() => Promise.resolve(true));
const mockHash = jest.fn(() => Promise.resolve("hashed-password"));
jest.mock("bcryptjs", () => ({
  compare: (...args: unknown[]) => mockCompare(...args),
  hash: (...args: unknown[]) => mockHash(...args),
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { PUT } from "@/app/api/auth/password/route";

describe("PUT /api/auth/password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("changes password successfully", async () => {
    mockFindUnique.mockResolvedValueOnce({ password: "old-hashed" });

    const req = new Request("http://localhost:3000/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: "OldPass1", newPassword: "NewPass123" }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockCompare).toHaveBeenCalledWith("OldPass1", "old-hashed");
    expect(mockHash).toHaveBeenCalledWith("NewPass123", 12);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { password: "hashed-password" },
    });
  });

  it("returns 400 when current password is wrong", async () => {
    mockFindUnique.mockResolvedValueOnce({ password: "old-hashed" });
    mockCompare.mockResolvedValueOnce(false);

    const req = new Request("http://localhost:3000/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: "WrongPass1", newPassword: "NewPass123" }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Mevcut parola yanlış.");
  });

  it("returns 400 when user has no password set", async () => {
    mockFindUnique.mockResolvedValueOnce({ password: null });

    const req = new Request("http://localhost:3000/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: "OldPass1", newPassword: "NewPass123" }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("uygun hesap bulunamadı");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: "OldPass1", newPassword: "NewPass123" }),
    });
    const res = await PUT(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 for validation error", async () => {
    const req = new Request("http://localhost:3000/api/auth/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: "", newPassword: "weak" }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Doğrulama hatası.");
  });
});
