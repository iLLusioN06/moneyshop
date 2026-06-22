/**
 * API Route Test: /api/budgets
 * GET  - Bütçeleri listele (harcama ilerlemesi ile)
 * POST - Yeni bütçe oluştur
 */

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockBudgetFindMany = jest.fn();
const mockCategoryFindFirst = jest.fn();
const mockBudgetFindFirst = jest.fn();
const mockTransactionGroupBy = jest.fn();
const mockBudgetCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    budget: {
      findMany: (...args: unknown[]) => mockBudgetFindMany(...args),
      create: (...args: unknown[]) => mockBudgetCreate(...args),
      findFirst: (...args: unknown[]) => mockBudgetFindFirst(...args),
    },
    category: {
      findFirst: (...args: unknown[]) => mockCategoryFindFirst(...args),
    },
    transaction: {
      groupBy: (...args: unknown[]) => mockTransactionGroupBy(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

import { GET, POST } from "@/app/api/budgets/route";

const categoryWithMeta = { id: "cat-1", name: "Market", type: "EXPENSE", icon: "shopping-cart", color: "#ef4444", userId: "user-1" };

describe("GET /api/budgets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns budgets with spent amounts", async () => {
    const budgets = [
      { id: "budget-1", userId: "user-1", categoryId: "cat-1", amount: 5000, currency: "TRY", period: "MONTHLY", startDate: new Date(), endDate: null, createdAt: new Date(), category: categoryWithMeta },
    ];
    mockBudgetFindMany.mockResolvedValueOnce(budgets);
    mockTransactionGroupBy.mockResolvedValueOnce([
      { categoryId: "cat-1", _sum: { amount: 1250 } },
    ]);

    const req = new Request("http://localhost:3000/api/budgets");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data[0].spent).toBe(1250);
  });

  it("returns 0 spent when no transactions", async () => {
    const budgets = [
      { id: "budget-1", userId: "user-1", categoryId: "cat-1", amount: 5000, currency: "TRY", period: "MONTHLY", startDate: new Date(), endDate: null, createdAt: new Date(), category: categoryWithMeta },
    ];
    mockBudgetFindMany.mockResolvedValueOnce(budgets);
    mockTransactionGroupBy.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/budgets");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data[0].spent).toBe(0);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/budgets");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/budgets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates budget and returns 201", async () => {
    mockCategoryFindFirst.mockResolvedValueOnce(categoryWithMeta);
    mockBudgetFindFirst.mockResolvedValueOnce(null);
    mockBudgetCreate.mockResolvedValueOnce({
      id: "budget-2",
      userId: "user-1",
      categoryId: "cat-1",
      amount: 3000,
      currency: "TRY",
      period: "MONTHLY",
      startDate: new Date(),
      endDate: null,
      category: categoryWithMeta,
    });

    const req = new Request("http://localhost:3000/api/budgets", {
      method: "POST",
      body: JSON.stringify({ categoryId: "cat-1", amount: 3000, currency: "TRY", period: "MONTHLY" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 400 when categoryId missing", async () => {
    const req = new Request("http://localhost:3000/api/budgets", {
      method: "POST",
      body: JSON.stringify({ amount: 3000 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("zorunludur");
  });

  it("returns 400 when amount is 0 or negative", async () => {
    const req = new Request("http://localhost:3000/api/budgets", {
      method: "POST",
      body: JSON.stringify({ categoryId: "cat-1", amount: 0 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("0'dan büyük");
  });

  it("returns 404 when category not found", async () => {
    mockCategoryFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/budgets", {
      method: "POST",
      body: JSON.stringify({ categoryId: "nonexistent", amount: 1000 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Kategori bulunamadı.");
  });

  it("returns 409 when duplicate budget exists", async () => {
    mockCategoryFindFirst.mockResolvedValueOnce(categoryWithMeta);
    mockBudgetFindFirst.mockResolvedValueOnce({ id: "existing" });

    const req = new Request("http://localhost:3000/api/budgets", {
      method: "POST",
      body: JSON.stringify({ categoryId: "cat-1", amount: 1000 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toContain("zaten aktif");
  });
});
