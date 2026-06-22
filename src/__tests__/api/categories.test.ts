/**
 * API Route Test: /api/categories
 * GET  - Kategorileri listele
 * POST - Yeni kategori oluştur
 */

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockFindMany = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      findFirst: jest.fn(),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { GET, POST } from "@/app/api/categories/route";

describe("GET /api/categories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with categories list", async () => {
    const mockCategories = [
      { id: "cat-1", name: "Maaş", type: "INCOME", icon: "briefcase", color: "#10b981" },
      { id: "cat-2", name: "Market", type: "EXPENSE", icon: "shopping-cart", color: "#ef4444" },
    ];
    mockFindMany.mockResolvedValueOnce(mockCategories);

    const req = new Request("http://localhost:3000/api/categories");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockCategories);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/categories");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/categories", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates category and returns 201", async () => {
    const newCategory = {
      id: "cat-3",
      userId: "user-1",
      name: "Kira",
      type: "EXPENSE",
      icon: "home",
      color: "#8b5cf6",
    };
    mockCreate.mockResolvedValueOnce(newCategory);

    const req = new Request("http://localhost:3000/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Kira", type: "EXPENSE", icon: "home", color: "#8b5cf6" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(newCategory);
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost:3000/api/categories", {
      method: "POST",
      body: JSON.stringify({ type: "EXPENSE" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("zorunludur");
  });

  it("returns 400 when type is missing", async () => {
    const req = new Request("http://localhost:3000/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("zorunludur");
  });

  it("returns 400 for invalid type", async () => {
    const req = new Request("http://localhost:3000/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Test", type: "INVALID" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçersiz kategori türü. INCOME veya EXPENSE olmalıdır.");
  });

  it("uses defaults for optional fields", async () => {
    mockCreate.mockResolvedValueOnce({
      id: "cat-4",
      userId: "user-1",
      name: "Minimal",
      type: "INCOME",
      icon: "circle",
      color: "#94a3b8",
    });

    const req = new Request("http://localhost:3000/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Minimal", type: "INCOME" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          icon: "circle",
          color: "#94a3b8",
        }),
      })
    );
  });
});
