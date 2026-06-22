/**
 * API Route Test: /api/transactions
 * GET  - İşlemleri listele (filtreleme + sayfalama)
 * POST - Yeni işlem oluştur (bakiye güncellemesi ile)
 */

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test User" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockTxFindMany = jest.fn();
const mockTxCount = jest.fn();
const mockTxCreate = jest.fn();
const mockAccountFindFirst = jest.fn();
const mockAccountUpdate = jest.fn();
const mockTransaction = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      findMany: (...args: unknown[]) => mockTxFindMany(...args),
      count: (...args: unknown[]) => mockTxCount(...args),
      create: (...args: unknown[]) => mockTxCreate(...args),
    },
    financialAccount: {
      findFirst: (...args: unknown[]) => mockAccountFindFirst(...args),
      update: (...args: unknown[]) => mockAccountUpdate(...args),
    },
    $transaction: (cb: Function) => cb({
      transaction: { create: (...args: unknown[]) => mockTxCreate(...args) },
      financialAccount: { update: (...args: unknown[]) => mockAccountUpdate(...args) },
    }),
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock validations
jest.mock("@/lib/validations", () => {
  return {
    createTransactionSchema: {},
    listTransactionsSchema: {},
    validateRequest: jest.fn(() => ({ success: true, data: { page: 1, limit: 10 } })),
  };
});

// Mock audit (silent)
jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test" })),
}));

// Mock email (silent)
jest.mock("@/lib/email", () => ({
  sendNotification: jest.fn(() => Promise.resolve()),
  buildTransactionEmail: jest.fn(() => ({})),
  buildTransferEmail: jest.fn(() => ({})),
}));

// Mock ws (silent)
jest.mock("@/lib/ws", () => ({
  emitTransactionEvent: jest.fn(),
  emitBalanceEvent: jest.fn(),
  emitNotification: jest.fn(),
}));

// Mock push-notifications (silent)
jest.mock("@/lib/push-notifications", () => ({
  sendPushNotification: jest.fn(() => Promise.resolve()),
  buildTransactionPushPayload: jest.fn(() => ({})),
  buildTransferPushPayload: jest.fn(() => ({})),
}));

// Mock utils
jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

const mockValidCreateParams = {
  accountId: "acc-1",
  type: "EXPENSE",
  amount: 250,
  currency: "TRY",
  description: "Market alışverişi",
};

import { GET, POST } from "@/app/api/transactions/route";

describe("GET /api/transactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns paginated transactions list", async () => {
    const transactions = [
      { id: "tx-1", type: "EXPENSE", amount: 250, description: "Market", accountId: "acc-1" },
    ];
    mockTxFindMany.mockResolvedValueOnce(transactions);
    mockTxCount.mockResolvedValueOnce(1);

    const req = new Request("http://localhost:3000/api/transactions?page=1&limit=10");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(transactions);
    expect(body.total).toBe(1);
    expect(body.totalPages).toBe(1);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transactions");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });

  it("applies type filter when provided", async () => {
    mockTxFindMany.mockResolvedValueOnce([]);
    mockTxCount.mockResolvedValueOnce(0);

    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({ success: true, data: { page: 1, limit: 10, type: "INCOME" } });

    const req = new Request("http://localhost:3000/api/transactions?type=INCOME");
    await GET(req);

    expect(mockTxFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: "INCOME",
        }),
      })
    );
  });
});

describe("POST /api/transactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates expense transaction and returns 201", async () => {
    const validData = { ...mockValidCreateParams };
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({ success: true, data: validData });

    mockAccountFindFirst.mockResolvedValueOnce({ id: "acc-1", userId: "user-1", name: "Vadesiz", currency: "TRY", balance: 5000 });
    mockTxCreate.mockResolvedValueOnce({ id: "tx-new", ...validData, createdAt: new Date() });

    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      body: JSON.stringify(validData),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("creates income transaction and updates balance", async () => {
    const validData = { ...mockValidCreateParams, type: "INCOME", amount: 5000 };
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({ success: true, data: validData });

    mockAccountFindFirst.mockResolvedValueOnce({ id: "acc-1", userId: "user-1", name: "Vadesiz", currency: "TRY", balance: 5000 });
    mockTxCreate.mockResolvedValueOnce({ id: "tx-inc", ...validData, createdAt: new Date() });

    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      body: JSON.stringify(validData),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
  });

  it("returns 404 when account not found", async () => {
    const validData = { ...mockValidCreateParams };
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({ success: true, data: validData });

    mockAccountFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      body: JSON.stringify(validData),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Hesap bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      body: JSON.stringify(mockValidCreateParams),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });

  it("creates audit log on transaction", async () => {
    const validData = { ...mockValidCreateParams };
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({ success: true, data: validData });
    const { createAuditLog } = require("@/lib/audit");

    mockAccountFindFirst.mockResolvedValueOnce({ id: "acc-1", userId: "user-1", name: "Vadesiz", currency: "TRY", balance: 5000 });
    mockTxCreate.mockResolvedValueOnce({ id: "tx-audit", ...validData, createdAt: new Date() });

    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      body: JSON.stringify(validData),
    });
    await POST(req);

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "CREATE",
        entity: "TRANSACTION",
      })
    );
  });
});
