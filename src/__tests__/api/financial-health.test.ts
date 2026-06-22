/**
 * API Route Test: /api/financial-health
 * GET  - Finansal sağlık skorunu hesapla
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockIncomeAggregate = jest.fn();
const mockExpenseAggregate = jest.fn();
const mockAccountsFindMany = jest.fn();
const mockBudgetsFindMany = jest.fn();
const mockTxFindMany = jest.fn();
const mockTxGroupBy = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      aggregate: (...args: unknown[]) => {
        const [params] = args;
        if (params.where?.type === "INCOME") return mockIncomeAggregate(...args);
        return mockExpenseAggregate(...args);
      },
      findMany: (...args: unknown[]) => mockTxFindMany(...args),
      groupBy: (...args: unknown[]) => mockTxGroupBy(...args),
    },
    financialAccount: {
      findMany: (...args: unknown[]) => mockAccountsFindMany(...args),
    },
    budget: {
      findMany: (...args: unknown[]) => mockBudgetsFindMany(...args),
    },
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

import { GET } from "@/app/api/financial-health/route";

describe("GET /api/financial-health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with health score breakdown", async () => {
    mockIncomeAggregate.mockResolvedValueOnce({ _sum: { amount: 50000 } });
    mockExpenseAggregate.mockResolvedValueOnce({ _sum: { amount: 30000 } });
    mockAccountsFindMany.mockResolvedValueOnce([
      { id: "acc-1", type: "CHECKING", balance: 100000, isActive: true },
      { id: "acc-2", type: "SAVINGS", balance: 50000, isActive: true },
    ]);
    mockBudgetsFindMany.mockResolvedValueOnce([
      { id: "budget-1", amount: 5000, spent: 3000, category: { name: "Market" } },
    ]);
    mockTxFindMany.mockResolvedValueOnce(
      Array.from({ length: 20 }, (_, i) => ({ id: `tx-${i}`, date: new Date(2025, 0, i + 1) }))
    );
    mockTxGroupBy.mockResolvedValueOnce([
      { date: new Date(2025, 0, 1), _sum: { amount: 1000 } },
    ]);

    const req = new Request("http://localhost:3000/api/financial-health");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.overall).toBeDefined();
    expect(body.data.breakdown).toBeDefined();
    expect(body.data.breakdown.savingsRate).toBeDefined();
    expect(body.data.breakdown.budgetAdherence).toBeDefined();
    expect(body.data.breakdown.emergencyFund).toBeDefined();
    expect(body.data.breakdown.transactionConsistency).toBeDefined();
    expect(body.data.breakdown.accountDiversity).toBeDefined();
    expect(body.data.tips).toBeInstanceOf(Array);
  });

  it("returns 200 with low scores and tips for minimal data", async () => {
    mockIncomeAggregate.mockResolvedValueOnce({ _sum: { amount: 5000 } });
    mockExpenseAggregate.mockResolvedValueOnce({ _sum: { amount: 5000 } });
    mockAccountsFindMany.mockResolvedValueOnce([
      { id: "acc-1", type: "CHECKING", balance: 2000, isActive: true },
    ]);
    mockBudgetsFindMany.mockResolvedValueOnce([]);
    mockTxFindMany.mockResolvedValueOnce(
      Array.from({ length: 3 }, (_, i) => ({ id: `tx-${i}`, date: new Date(2025, 0, i + 1) }))
    );
    mockTxGroupBy.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/financial-health");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.tips.length).toBeGreaterThan(0);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/financial-health");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
