/**
 * API Route Test: /api/budgets/[id]
 * GET   - Bütçe detayı (kategori ile)
 * PUT   - Bütçe güncelle
 * DELETE - Bütçe sil
 */

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockFindFirst = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    budget: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { GET, PUT, DELETE } from "@/app/api/budgets/[id]/route";

const mockCategory = { id: "cat-1", name: "Market", type: "EXPENSE", icon: "shopping-cart", color: "#ef4444" };

const mockBudget = {
  id: "budget-1",
  userId: "user-1",
  categoryId: "cat-1",
  amount: 5000,
  currency: "TRY",
  period: "MONTHLY",
  startDate: new Date("2026-01-01").toISOString(),
  endDate: null,
  createdAt: new Date().toISOString(),
  category: mockCategory,
};

describe("GET /api/budgets/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with budget details including category", async () => {
    mockFindFirst.mockResolvedValueOnce(mockBudget);

    const req = new Request("http://localhost:3000/api/budgets/budget-1");
    const res = await GET(req, { params: Promise.resolve({ id: "budget-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockBudget);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: "budget-1", userId: "user-1" },
      include: { category: true },
    });
  });

  it("returns 404 when budget not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/budgets/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe("Bütçe bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/budgets/budget-1");
    const res = await GET(req, { params: Promise.resolve({ id: "budget-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/budgets/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates budget amount and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockBudget);
    mockUpdate.mockResolvedValueOnce({ ...mockBudget, amount: 8000 });

    const req = new Request("http://localhost:3000/api/budgets/budget-1", {
      method: "PUT",
      body: JSON.stringify({ amount: 8000 }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "budget-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.amount).toBe(8000);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "budget-1" },
        data: expect.objectContaining({ amount: 8000 }),
      })
    );
  });

  it("updates period and category", async () => {
    mockFindFirst.mockResolvedValueOnce(mockBudget);
    mockUpdate.mockResolvedValueOnce({ ...mockBudget, period: "YEARLY", categoryId: "cat-2" });

    const req = new Request("http://localhost:3000/api/budgets/budget-1", {
      method: "PUT",
      body: JSON.stringify({ period: "YEARLY", categoryId: "cat-2" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "budget-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "budget-1" },
        data: expect.objectContaining({ period: "YEARLY", categoryId: "cat-2" }),
      })
    );
  });

  it("returns 404 when budget to update not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/budgets/nonexistent", {
      method: "PUT",
      body: JSON.stringify({ amount: 5000 }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/budgets/budget-1", {
      method: "PUT",
      body: JSON.stringify({ amount: 5000 }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "budget-1" }) });

    expect(res.status).toBe(401);
  });

  it("converts string dates to Date objects", async () => {
    mockFindFirst.mockResolvedValueOnce(mockBudget);
    mockUpdate.mockResolvedValueOnce(mockBudget);

    const req = new Request("http://localhost:3000/api/budgets/budget-1", {
      method: "PUT",
      body: JSON.stringify({ startDate: "2026-06-01T00:00:00.000Z", endDate: "2026-12-31T00:00:00.000Z" }),
    });
    await PUT(req, { params: Promise.resolve({ id: "budget-1" }) });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        }),
      })
    );
  });
});

describe("DELETE /api/budgets/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes budget and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockBudget);
    mockDelete.mockResolvedValueOnce(mockBudget);

    const req = new Request("http://localhost:3000/api/budgets/budget-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "budget-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Bütçe silindi.");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "budget-1" } });
  });

  it("returns 404 when budget to delete not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/budgets/nonexistent", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/budgets/budget-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "budget-1" }) });

    expect(res.status).toBe(401);
  });
});
