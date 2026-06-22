const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test User" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockRtFindMany = jest.fn();
const mockRtCount = jest.fn();
const mockRtCreate = jest.fn();
const mockAccountFindFirst = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    recurringTransaction: {
      findMany: (...args: unknown[]) => mockRtFindMany(...args),
      count: (...args: unknown[]) => mockRtCount(...args),
      create: (...args: unknown[]) => mockRtCreate(...args),
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

jest.mock("@/lib/email", () => ({
  sendNotification: jest.fn(() => Promise.resolve()),
  buildTransactionEmail: jest.fn(() => ({})),
}));

import { GET, POST } from "@/app/api/recurring-transactions/route";

describe("GET /api/recurring-transactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns paginated recurring transactions list", async () => {
    const items = [
      { id: "rt-1", type: "EXPENSE", amount: 250, frequency: "MONTHLY", status: "ACTIVE", account: { id: "acc-1" }, category: { id: "cat-1" } },
    ];
    mockRtFindMany.mockResolvedValueOnce(items);
    mockRtCount.mockResolvedValueOnce(1);

    const req = new Request("http://localhost:3000/api/recurring-transactions?page=1&limit=10");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(items);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.limit).toBe(10);
    expect(body.totalPages).toBe(1);
  });

  it("filters by status", async () => {
    mockRtFindMany.mockResolvedValueOnce([]);
    mockRtCount.mockResolvedValueOnce(0);

    const req = new Request("http://localhost:3000/api/recurring-transactions?status=ACTIVE");
    await GET(req);

    expect(mockRtFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "ACTIVE" }),
      })
    );
  });

  it("includes account and category relations", async () => {
    mockRtFindMany.mockResolvedValueOnce([{ id: "rt-1", account: { id: "acc-1" }, category: { id: "cat-1" } }]);
    mockRtCount.mockResolvedValueOnce(1);

    const req = new Request("http://localhost:3000/api/recurring-transactions");
    await GET(req);

    expect(mockRtFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { account: true, category: true },
      })
    );
  });

  it("applies pagination skip/take", async () => {
    mockRtFindMany.mockResolvedValueOnce([]);
    mockRtCount.mockResolvedValueOnce(0);

    const req = new Request("http://localhost:3000/api/recurring-transactions?page=2&limit=5");
    await GET(req);

    expect(mockRtFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/recurring-transactions");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/recurring-transactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    accountId: "acc-1",
    type: "EXPENSE",
    amount: 250,
    currency: "TRY",
    description: "Monthly subscription",
    frequency: "MONTHLY",
    intervalCount: 1,
    startDate: "2025-01-01",
  };

  it("creates a monthly recurring transaction and returns 201", async () => {
    mockAccountFindFirst.mockResolvedValueOnce({ id: "acc-1", userId: "user-1", name: "Vadesiz", currency: "TRY", balance: 5000 });
    mockRtCreate.mockResolvedValueOnce({
      id: "rt-new", ...validPayload, status: "ACTIVE", nextDate: new Date("2025-02-01"), createdAt: new Date(),
    });

    const req = new Request("http://localhost:3000/api/recurring-transactions", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(mockRtCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          frequency: "MONTHLY",
          intervalCount: 1,
          status: "ACTIVE",
        }),
      })
    );
  });

  it("creates a weekly recurring transaction", async () => {
    const weeklyPayload = { ...validPayload, frequency: "WEEKLY", startDate: "2025-01-01" };
    mockAccountFindFirst.mockResolvedValueOnce({ id: "acc-1", userId: "user-1", name: "Vadesiz", currency: "TRY", balance: 5000 });
    mockRtCreate.mockResolvedValueOnce({
      id: "rt-weekly", ...weeklyPayload, status: "ACTIVE", nextDate: new Date("2025-01-08"), createdAt: new Date(),
    });

    const req = new Request("http://localhost:3000/api/recurring-transactions", {
      method: "POST",
      body: JSON.stringify(weeklyPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 400 when required fields are missing", async () => {
    const req = new Request("http://localhost:3000/api/recurring-transactions", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Hesap, işlem türü, tutar, sıklık ve başlangıç tarihi zorunludur.");
  });

  it("returns 400 when amount is zero or negative", async () => {
    const req = new Request("http://localhost:3000/api/recurring-transactions", {
      method: "POST",
      body: JSON.stringify({ ...validPayload, amount: 0 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Tutar 0'dan büyük olmalıdır.");
  });

  it("returns 404 when account is not found", async () => {
    mockAccountFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/recurring-transactions", {
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

    const req = new Request("http://localhost:3000/api/recurring-transactions", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
