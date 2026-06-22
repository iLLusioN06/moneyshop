const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test User" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockInvFindMany = jest.fn();
const mockInvCreate = jest.fn();
const mockAccountFindFirst = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    investment: {
      findMany: (...args: unknown[]) => mockInvFindMany(...args),
      create: (...args: unknown[]) => mockInvCreate(...args),
    },
    financialAccount: {
      findFirst: (...args: unknown[]) => mockAccountFindFirst(...args),
    },
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test" })),
}));

import { GET, POST } from "@/app/api/investments/route";

describe("GET /api/investments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns investments list with portfolio summary", async () => {
    const investments = [
      { id: "inv-1", name: "Bitcoin", symbol: "BTC", type: "CRYPTO", shares: 1, buyPrice: 50000, currentPrice: 55000, account: { id: "acc-1" } },
      { id: "inv-2", name: "Apple", symbol: "AAPL", type: "STOCK", shares: 10, buyPrice: 150, currentPrice: 160, account: { id: "acc-1" } },
    ];
    mockInvFindMany.mockResolvedValueOnce(investments);

    const req = new Request("http://localhost:3000/api/investments");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(investments);
    expect(body.summary).toBeDefined();
    expect(body.summary.totalCost).toBe(51500);
    expect(body.summary.totalCurrent).toBe(56600);
    expect(body.summary.totalProfit).toBe(5100);
    expect(body.summary.profitPercent).toBeCloseTo(9.9, 1);
    expect(body.summary.typeBreakdown).toEqual({
      CRYPTO: { cost: 50000, current: 55000 },
      STOCK: { cost: 1500, current: 1600 },
    });
  });

  it("returns empty list and zero summary when no investments", async () => {
    mockInvFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/investments");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.summary.totalCost).toBe(0);
    expect(body.summary.totalCurrent).toBe(0);
    expect(body.summary.totalProfit).toBe(0);
    expect(body.summary.profitPercent).toBe(0);
    expect(body.summary.typeBreakdown).toEqual({});
  });

  it("filters by accountId", async () => {
    mockInvFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/investments?accountId=acc-1");
    await GET(req);

    expect(mockInvFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ accountId: "acc-1" }),
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/investments");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/investments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    accountId: "acc-1",
    name: "Bitcoin",
    symbol: "BTC",
    type: "CRYPTO",
    shares: 1.5,
    buyPrice: 45000,
    currency: "TRY",
    notes: "Long term hold",
  };

  it("creates an investment and returns 201", async () => {
    mockAccountFindFirst.mockResolvedValueOnce({ id: "acc-1", userId: "user-1", name: "Yatırım", currency: "TRY", balance: 100000 });
    mockInvCreate.mockResolvedValueOnce({ id: "inv-new", ...validPayload, currentPrice: 45000, createdAt: new Date() });

    const req = new Request("http://localhost:3000/api/investments", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(mockInvCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Bitcoin",
          symbol: "BTC",
          shares: 1.5,
        }),
      })
    );
  });

  it("returns 400 when required fields are missing", async () => {
    const req = new Request("http://localhost:3000/api/investments", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Hesap, ad, sembol, miktar ve alış fiyatı zorunludur.");
  });

  it("returns 404 when account not found", async () => {
    mockAccountFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/investments", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Hesap bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/investments", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
