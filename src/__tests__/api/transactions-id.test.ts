/**
 * API Route Test: /api/transactions/[id]
 * GET   - İşlem detayı
 * PUT   - İşlem güncelle (metadata)
 * DELETE - İşlem sil (bakiye düzeltmesi ile)
 */

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockTxFindFirst = jest.fn();
const mockTxUpdate = jest.fn();
const mockTxDelete = jest.fn();
const mockAccountUpdate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    transaction: {
      findFirst: (...args: unknown[]) => mockTxFindFirst(...args),
      update: (...args: unknown[]) => mockTxUpdate(...args),
      delete: (...args: unknown[]) => mockTxDelete(...args),
    },
    financialAccount: {
      update: (...args: unknown[]) => mockAccountUpdate(...args),
    },
    $transaction: (cb: Function) =>
      cb({
        transaction: { delete: (...args: unknown[]) => mockTxDelete(...args) },
        financialAccount: { update: (...args: unknown[]) => mockAccountUpdate(...args) },
      }),
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

// Mock validations
jest.mock("@/lib/validations", () => ({
  updateTransactionSchema: {},
  validateRequest: jest.fn(() => ({
    success: true,
    data: { categoryId: "cat-1", description: "Güncellendi", status: "COMPLETED" },
  })),
}));

import { GET, PUT, DELETE } from "@/app/api/transactions/[id]/route";

const mockTransaction = {
  id: "tx-1",
  type: "EXPENSE",
  amount: 250,
  currency: "TRY",
  description: "Market alışverişi",
  accountId: "acc-1",
  userId: "user-1",
  status: "COMPLETED",
  date: new Date().toISOString(),
  categoryId: "cat-1",
  category: { id: "cat-1", name: "Market" },
  account: { id: "acc-1", name: "Vadesiz" },
};

describe("GET /api/transactions/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with transaction details", async () => {
    mockTxFindFirst.mockResolvedValueOnce(mockTransaction);

    const req = new Request("http://localhost:3000/api/transactions/tx-1");
    const res = await GET(req, { params: Promise.resolve({ id: "tx-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTransaction);
  });

  it("returns 404 when transaction not found", async () => {
    mockTxFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transactions/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transactions/tx-1");
    const res = await GET(req, { params: Promise.resolve({ id: "tx-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/transactions/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates transaction metadata and returns 200", async () => {
    mockTxFindFirst.mockResolvedValueOnce(mockTransaction);
    mockTxUpdate.mockResolvedValueOnce({ ...mockTransaction, description: "Güncellendi" });

    const req = new Request("http://localhost:3000/api/transactions/tx-1", {
      method: "PUT",
      body: JSON.stringify({ description: "Güncellendi" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "tx-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockTxUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "tx-1" },
      })
    );
  });

  it("returns 404 when transaction to update not found", async () => {
    mockTxFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transactions/nonexistent", {
      method: "PUT",
      body: JSON.stringify({ description: "Test" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/transactions/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes expense transaction and reverts balance", async () => {
    mockTxFindFirst.mockResolvedValueOnce(mockTransaction);
    mockTxDelete.mockResolvedValueOnce(mockTransaction);
    mockAccountUpdate.mockResolvedValueOnce({});

    const req = new Request("http://localhost:3000/api/transactions/tx-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "tx-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    // For EXPENSE, balance should increase (revert)
    expect(mockAccountUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "acc-1" },
        data: { balance: { increment: 250 } },
      })
    );
  });

  it("deletes income transaction and reverts balance", async () => {
    const incomeTx = { ...mockTransaction, type: "INCOME", amount: 5000 };
    mockTxFindFirst.mockResolvedValueOnce(incomeTx);
    mockTxDelete.mockResolvedValueOnce(incomeTx);
    mockAccountUpdate.mockResolvedValueOnce({});

    const req = new Request("http://localhost:3000/api/transactions/tx-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "tx-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    // For INCOME, balance should decrease (revert)
    expect(mockAccountUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "acc-1" },
        data: { balance: { increment: -5000 } },
      })
    );
  });

  it("returns 404 when transaction to delete not found", async () => {
    mockTxFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transactions/nonexistent", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });
});
