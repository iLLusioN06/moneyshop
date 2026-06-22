/**
 * API Route Test: /api/auth/profile
 * GET  - Profil bilgilerini getir (auth required, rate-limited)
 * PUT  - Profil güncelle (auth required, rate-limited)
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

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { GET, PUT } from "@/app/api/auth/profile/route";

const mockUser = {
  id: "user-1",
  name: "Test User",
  email: "test@test.com",
  image: null,
  role: "USER",
  isActive: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
  emailVerified: null,
  dateOfBirth: null,
  tcKimlik: null,
  address: null,
  identityNumber: null,
  _count: { accounts: 2, transactions: 10, budgets: 1 },
};

describe("GET /api/auth/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with user profile", async () => {
    mockFindUnique.mockResolvedValueOnce(mockUser);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockUser);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: expect.objectContaining({
        id: true,
        name: true,
        email: true,
        _count: {
          select: { accounts: true, transactions: true, budgets: true },
        },
      }),
    });
  });

  it("returns 404 when user not found", async () => {
    mockFindUnique.mockResolvedValueOnce(null);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Kullanıcı bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const res = await GET();

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/auth/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates profile name successfully", async () => {
    const updatedUser = {
      id: "user-1",
      name: "Updated Name",
      email: "test@test.com",
      image: null,
      role: "USER",
      updatedAt: new Date(),
    };
    mockUpdate.mockResolvedValueOnce(updatedUser);

    const req = new Request("http://localhost:3000/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated Name" }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Updated Name");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Updated Name" },
      select: { id: true, name: true, email: true, image: true, role: true, updatedAt: true },
    });
  });

  it("updates profile with image set to null", async () => {
    const updatedUser = {
      id: "user-1",
      name: "Test User",
      email: "test@test.com",
      image: null,
      role: "USER",
      updatedAt: "2024-06-01T00:00:00.000Z",
    };
    mockUpdate.mockResolvedValueOnce(updatedUser);

    const req = new Request("http://localhost:3000/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "Test User", image: null }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { name: "Test User", image: null },
      select: { id: true, name: true, email: true, image: true, role: true, updatedAt: true },
    });
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "Updated Name" }),
    });
    const res = await PUT(req);

    expect(res.status).toBe(401);
  });

  it("returns 400 for validation error (name too short)", async () => {
    const req = new Request("http://localhost:3000/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "X" }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Doğrulama hatası.");
  });

  it("returns 400 for invalid image URL", async () => {
    const req = new Request("http://localhost:3000/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "Test User", image: "not-a-url" }),
    });
    const res = await PUT(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Doğrulama hatası.");
  });
});
