/**
 * API Route Test: /api/dashboard
 * GET - Dashboard özet istatistikleri
 */

import { NextRequest } from "next/server";

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockFinancialAccountFindMany = jest.fn();
const mockTransactionAggregate = jest.fn();
const mockTransactionFindMany = jest.fn();
const mockQueryRaw = jest.fn();
const mockTransactionGroupBy = jest.fn();
const mockCategoryFindMany = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    financialAccount: {
      findMany: (...args: unknown[]) => mockFinancialAccountFindMany(...args),
    },
    transaction: {
      aggregate: (...args: unknown[]) => mockTransactionAggregate(...args),
      findMany: (...args: unknown[]) => mockTransactionFindMany(...args),
      groupBy: (...args: unknown[]) => mockTransactionGroupBy(...args),
    },
    category: {
      findMany: (...args: unknown[]) => mockCategoryFindMany(...args),
    },
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
  },
}));

// Mock exchange-rates
jest.mock("@/lib/exchange-rates", () => ({
  SUPPORTED_CURRENCIES: ["TRY", "USD", "EUR", "GBP"],
  getExchangeRates: jest.fn(() =>
    Promise.resolve({ TRY: 1, USD: 0.031, EUR: 0.028, GBP: 0.024 }),
  ),
  convertAmount: jest.fn((amount: number) => amount),
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  getCacheHeaders: jest.fn(() => ({})),
}));

import { GET } from "@/app/api/dashboard/route";

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost:3000/api/dashboard");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });

  it("returns 200 with full dashboard data", async () => {
    mockFinancialAccountFindMany.mockResolvedValueOnce([
      {
        id: "acc-1",
        name: "Vadesiz",
        type: "CHECKING",
        balance: 15000,
        currency: "TRY",
        isActive: true,
      },
    ]);

    mockTransactionAggregate
      .mockResolvedValueOnce({ _sum: { amount: 10000 } })
      .mockResolvedValueOnce({ _sum: { amount: 5000 } })
      .mockResolvedValueOnce({ _sum: { amount: 8000 } })
      .mockResolvedValueOnce({ _sum: { amount: 4000 } });

    mockTransactionFindMany.mockResolvedValueOnce([
      { id: "tx-1", amount: 500, description: "Test", date: new Date() },
    ]);

    mockQueryRaw.mockResolvedValueOnce([
      { month: new Date("2026-01-01"), type: "INCOME", total: 10000 },
      { month: new Date("2026-01-01"), type: "EXPENSE", total: 5000 },
    ]);

    mockTransactionGroupBy.mockResolvedValueOnce([
      { categoryId: "cat-1", _sum: { amount: 3000 } },
    ]);
    mockCategoryFindMany.mockResolvedValueOnce([
      { id: "cat-1", name: "Food", color: "#ff0000", icon: "utensils" },
    ]);

    const req = new NextRequest("http://localhost:3000/api/dashboard?base=TRY");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.totalIncome).toBe(10000);
    expect(body.data.totalExpense).toBe(5000);
    expect(body.data.currency).toBe("TRY");
    expect(body.data.incomeChange).toBe(25);
    expect(body.data.expenseChange).toBe(25);
    expect(body.data.accounts).toHaveLength(1);
    expect(body.data.accounts[0]).toHaveProperty("originalBalance", 15000);
    expect(body.data.accounts[0]).toHaveProperty("convertedCurrency", "TRY");
    expect(body.data.recentTransactions).toHaveLength(1);
    expect(body.data.monthlyData).toHaveLength(6);
    expect(body.data.monthlyData[0]).toHaveProperty("month");
    expect(body.data.monthlyData[0]).toHaveProperty("income");
    expect(body.data.monthlyData[0]).toHaveProperty("expense");
    expect(body.data.categoryBreakdown).toHaveLength(1);
    expect(body.data.categoryBreakdown[0]).toHaveProperty("category", "Food");
    expect(body.data.categoryBreakdown[0]).toHaveProperty("percentage", 100);
    expect(body.data).toHaveProperty("exchangeRates");
  });

  it("returns 200 with empty data when no accounts or transactions", async () => {
    mockFinancialAccountFindMany.mockResolvedValueOnce([]);
    mockTransactionAggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });
    mockTransactionFindMany.mockResolvedValueOnce([]);
    mockQueryRaw.mockResolvedValueOnce([]);
    mockTransactionGroupBy.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost:3000/api/dashboard?base=TRY");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.totalIncome).toBe(0);
    expect(body.data.totalExpense).toBe(0);
    expect(body.data.totalBalance).toBe(0);
    expect(body.data.accounts).toEqual([]);
    expect(body.data.recentTransactions).toEqual([]);
    expect(body.data.categoryBreakdown).toEqual([]);
    expect(body.data.incomeChange).toBe(0);
    expect(body.data.expenseChange).toBe(0);
  });

  it("defaults unsupported currency to TRY", async () => {
    mockFinancialAccountFindMany.mockResolvedValueOnce([]);
    mockTransactionAggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });
    mockTransactionFindMany.mockResolvedValueOnce([]);
    mockQueryRaw.mockResolvedValueOnce([]);
    mockTransactionGroupBy.mockResolvedValueOnce([]);

    const req = new NextRequest("http://localhost:3000/api/dashboard?base=XYZ");
    const res = await GET(req);
    const body = await res.json();

    const { getExchangeRates } = require("@/lib/exchange-rates");
    expect(getExchangeRates).toHaveBeenCalledWith("TRY");
    expect(body.data.currency).toBe("TRY");
  });
});
