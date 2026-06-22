/**
 * API Route Test: /api/auth/forgot-password
 * POST - Şifre sıfırlama talebi (public, rate-limited)
 */

// Mock prisma
const mockUserFindUnique = jest.fn();
const mockDeleteMany = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
    },
    passwordResetToken: {
      deleteMany: (...args: unknown[]) => mockDeleteMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Mock email
jest.mock("@/lib/email", () => ({
  sendEmail: jest.fn(() => Promise.resolve({ success: true })),
  buildPasswordResetEmail: jest.fn(() => ({
    subject: "[MoneyShop] Parola Sıfırlama Talebi",
    text: "Test email text",
    html: "<p>Test HTML</p>",
  })),
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { POST } from "@/app/api/auth/forgot-password/route";

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 and sends email when email exists", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ id: "user-1", name: "Test User" });
    mockDeleteMany.mockResolvedValueOnce({ count: 1 });
    mockCreate.mockResolvedValueOnce({});
    const { sendEmail, buildPasswordResetEmail } = require("@/lib/email");

    const req = new Request("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { email: "test@test.com" },
      select: { id: true, name: true },
    });
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { email: "test@test.com" } });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "test@test.com",
          token: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      })
    );
    expect(buildPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "test@test.com", userName: "Test User" })
    );
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "test@test.com" })
    );
  });

  it("returns 200 when email does not exist (no email sent)", async () => {
    mockUserFindUnique.mockResolvedValueOnce(null);
    const { sendEmail } = require("@/lib/email");

    const req = new Request("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "nonexistent@test.com" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { email: "nonexistent@test.com" },
      select: { id: true, name: true },
    });
    expect(mockDeleteMany).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("creates token with 1 hour expiry", async () => {
    mockUserFindUnique.mockResolvedValueOnce({ id: "user-1", name: "Test" });
    mockDeleteMany.mockResolvedValueOnce({ count: 0 });

    const req = new Request("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "test@test.com" }),
    });
    await POST(req);

    const createArgs = mockCreate.mock.calls[0][0];
    const expiresAt = createArgs.data.expiresAt as Date;
    const now = Date.now();
    expect(expiresAt.getTime()).toBeGreaterThan(now + 59 * 60 * 1000);
    expect(expiresAt.getTime()).toBeLessThan(now + 61 * 60 * 1000);
  });

  it("returns 400 for invalid email", async () => {
    const req = new Request("http://localhost:3000/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Doğrulama hatası.");
  });
});
