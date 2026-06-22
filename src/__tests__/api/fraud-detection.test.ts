/**
 * API Route Test: /api/fraud-detection
 * GET  - Şüpheli işlem tespiti ve uyarıları
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockTxFindMany = jest.fn();
const mockTxAggregate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      findMany: (...args: unknown[]) => mockTxFindMany(...args),
      aggregate: (...args: unknown[]) => mockTxAggregate(...args),
    },
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

import { GET } from "@/app/api/fraud-detection/route";

describe("GET /api/fraud-detection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with alerts and summary", async () => {
    const now = new Date();
    mockTxFindMany.mockResolvedValueOnce([]);
    mockTxAggregate.mockResolvedValueOnce({ _avg: { amount: 500 }, _max: { amount: 10000 }, _count: { id: 0 } });
    mockTxFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/fraud-detection");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.alerts).toBeInstanceOf(Array);
    expect(body.data.summary).toBeDefined();
    expect(body.data.summary.totalAlerts).toBe(0);
  });

  it("returns 200 with unusual amount alerts", async () => {
    const now = new Date();
    const avgAmount = 500;
    mockTxFindMany.mockResolvedValueOnce([
      { id: "tx-1", amount: 10000, currency: "TRY", date: now, status: "COMPLETED", userId: "user-1" },
      { id: "tx-2", amount: 200, currency: "TRY", date: now, status: "COMPLETED", userId: "user-1" },
    ]);
    mockTxAggregate.mockResolvedValueOnce({ _avg: { amount: avgAmount }, _max: { amount: 10000 }, _count: { id: 2 } });
    mockTxFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/fraud-detection");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.alerts.length).toBeGreaterThan(0);
    expect(body.data.summary.totalAlerts).toBeGreaterThan(0);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/fraud-detection");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
