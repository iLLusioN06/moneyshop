/**
 * API Route Test: /api/payments
 * POST - Fatura ödemesi yap
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockAccountFindFirst = jest.fn();
const mockUpdateMany = jest.fn();
const mockTxCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    financialAccount: {
      findFirst: (...args: unknown[]) => mockAccountFindFirst(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
    transaction: {
      create: (...args: unknown[]) => mockTxCreate(...args),
    },
    $transaction: (cb: Function) => cb({
      financialAccount: { updateMany: (...args: unknown[]) => mockUpdateMany(...args) },
      transaction: { create: (...args: unknown[]) => mockTxCreate(...args) },
    }),
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

jest.mock("@/lib/validations", () => ({
  createPaymentSchema: {},
  validateRequest: jest.fn(),
}));

import { POST } from "@/app/api/payments/route";

describe("POST /api/payments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("makes a payment and returns 201", async () => {
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { accountId: "acc-1", amount: 500, billType: "electric", referenceNumber: "REF123" },
    });
    mockAccountFindFirst.mockResolvedValueOnce({ id: "acc-1", userId: "user-1", name: "Vadesiz", currency: "TRY", balance: 5000, isActive: true });
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });
    mockTxCreate.mockResolvedValueOnce({
      id: "tx-1", accountId: "acc-1", userId: "user-1", type: "EXPENSE",
      amount: 500, currency: "TRY", description: "Elektrik Faturası - REF123", status: "COMPLETED",
    });

    const req = new Request("http://localhost:3000/api/payments", {
      method: "POST",
      body: JSON.stringify({ accountId: "acc-1", amount: 500, billType: "electric", referenceNumber: "REF123" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toContain("başarıyla gerçekleştirildi");
  });

  it("returns 400 when validation fails", async () => {
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: false,
      response: Response.json({ error: "Doğrulama hatası.", details: [] }, { status: 400 }),
    });

    const req = new Request("http://localhost:3000/api/payments", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Doğrulama hatası.");
  });

  it("returns 400 when bill type is invalid", async () => {
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { accountId: "acc-1", amount: 500, billType: "invalid_type" },
    });

    const req = new Request("http://localhost:3000/api/payments", {
      method: "POST",
      body: JSON.stringify({ accountId: "acc-1", amount: 500, billType: "invalid_type" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçersiz fatura türü.");
  });

  it("returns 404 when account not found", async () => {
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { accountId: "nonexistent", amount: 500, billType: "electric" },
    });
    mockAccountFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/payments", {
      method: "POST",
      body: JSON.stringify({ accountId: "nonexistent", amount: 500, billType: "electric" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Hesap bulunamadı.");
  });

  it("returns 400 when insufficient balance", async () => {
    const { validateRequest } = require("@/lib/validations");
    validateRequest.mockReturnValueOnce({
      success: true,
      data: { accountId: "acc-1", amount: 99999, billType: "electric" },
    });
    mockAccountFindFirst.mockResolvedValueOnce({ id: "acc-1", userId: "user-1", name: "Vadesiz", currency: "TRY", balance: 100, isActive: true });
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });

    const req = new Request("http://localhost:3000/api/payments", {
      method: "POST",
      body: JSON.stringify({ accountId: "acc-1", amount: 99999, billType: "electric" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Yetersiz bakiye.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/payments", {
      method: "POST",
      body: JSON.stringify({ accountId: "acc-1", amount: 500, billType: "electric" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
