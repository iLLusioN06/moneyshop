/**
 * API Route Test: /api/search
 * GET - Evrensel arama (işlemler, hesaplar, kategoriler, kullanıcılar)
 */

import { NextRequest } from "next/server";

// Mock auth (non-admin by default)
const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockTransactionFindMany = jest.fn();
const mockFinancialAccountFindMany = jest.fn();
const mockCategoryFindMany = jest.fn();
const mockUserFindMany = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      findMany: (...args: unknown[]) => mockTransactionFindMany(...args),
    },
    financialAccount: {
      findMany: (...args: unknown[]) => mockFinancialAccountFindMany(...args),
    },
    category: {
      findMany: (...args: unknown[]) => mockCategoryFindMany(...args),
    },
    user: {
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
    },
  },
}));

import { GET } from "@/app/api/search/route";

describe("GET /api/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/search?q=test");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });

  it("returns empty results for query shorter than 2 characters", async () => {
    const req = new NextRequest("http://localhost:3000/api/search?q=a");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toEqual([]);
  });

  it("returns search results for non-admin user", async () => {
    mockTransactionFindMany.mockResolvedValueOnce([
      {
        id: "tx-1",
        type: "EXPENSE",
        amount: 500,
        currency: "TRY",
        description: "Market alışverişi",
        status: "COMPLETED",
        date: new Date(),
        recipientName: "Migros",
      },
    ]);
    mockFinancialAccountFindMany.mockResolvedValueOnce([
      { id: "acc-1", name: "Vadesiz Hesap", type: "CHECKING", balance: 15000, currency: "TRY" },
    ]);
    mockCategoryFindMany.mockResolvedValueOnce([
      { id: "cat-1", name: "Market", icon: "shopping-cart", color: "#ff0000", type: "EXPENSE" },
    ]);

    const req = new NextRequest("http://localhost:3000/api/search?q=market");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results.transactions).toHaveLength(1);
    expect(body.results.accounts).toHaveLength(1);
    expect(body.results.categories).toHaveLength(1);
    expect(body.results).not.toHaveProperty("users");
    expect(body.total).toBe(3);

    expect(mockTransactionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-1" }),
      })
    );
  });

  it("returns no results when nothing matches", async () => {
    mockTransactionFindMany.mockResolvedValueOnce([]);
    mockFinancialAccountFindMany.mockResolvedValueOnce([]);
    mockCategoryFindMany.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost:3000/api/search?q=zzzzzzz");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results.transactions).toEqual([]);
    expect(body.results.accounts).toEqual([]);
    expect(body.results.categories).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("includes users in results when admin searches", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({
      user: { id: "admin-1", email: "admin@test.com", name: "Admin", role: "ADMIN" },
    });

    mockTransactionFindMany.mockResolvedValueOnce([]);
    mockFinancialAccountFindMany.mockResolvedValueOnce([]);
    mockCategoryFindMany.mockResolvedValueOnce([]);
    mockUserFindMany.mockResolvedValueOnce([
      { id: "user-2", name: "Jane", email: "jane@test.com", phone: "123", role: "USER", isActive: true },
    ]);

    const req = new NextRequest("http://localhost:3000/api/search?q=jane");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toHaveProperty("users");
    expect(body.results.users).toHaveLength(1);
    expect(body.total).toBe(1);
    expect(mockUserFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: "jane", mode: "insensitive" } }),
          ]),
        }),
      })
    );
  });
});
