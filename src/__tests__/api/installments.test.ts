/**
 * API Route Test: /api/installments
 * GET  - Taksitleri listele (hesap & kategori ile)
 * POST - Yeni taksit oluştur
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockFindMany = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    installment: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

import { GET, POST } from "@/app/api/installments/route";

const mockAccount = { id: "acc-1", name: "Vadesiz", currency: "TRY", balance: 50000 };
const mockCategory = { id: "cat-1", name: "Market", type: "EXPENSE" };

describe("GET /api/installments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with installments with computed fields", async () => {
    const installments = [
      {
        id: "inst-1", userId: "user-1", accountId: "acc-1", title: "Telefon",
        totalAmount: 12000, monthlyAmount: 1000, totalPayments: 12, paidPayments: 3,
        currency: "TRY", status: "ACTIVE", startDate: new Date(), nextPaymentDate: new Date(),
        merchantName: "Apple Store", notes: null, account: mockAccount, category: mockCategory,
      },
    ];
    mockFindMany.mockResolvedValueOnce(installments);

    const req = new Request("http://localhost:3000/api/installments");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].remainingAmount).toBe(9000);
    expect(body.data[0].progress).toBe(25);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: { account: true, category: true },
      orderBy: { nextPaymentDate: "asc" },
    });
  });

  it("returns 200 with empty array when no installments", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/installments");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/installments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates installment and returns 200", async () => {
    const START_DATE = new Date("2025-01-01").toISOString();
    const newInstallment = {
      id: "inst-2", userId: "user-1", accountId: "acc-1", title: "Bilgisayar",
      totalAmount: 36000, monthlyAmount: 3000, totalPayments: 12, paidPayments: 0,
      currency: "TRY", status: "ACTIVE", startDate: START_DATE,
      nextPaymentDate: START_DATE, merchantName: "Monster", notes: null,
      account: mockAccount, category: null,
    };
    mockCreate.mockResolvedValueOnce(newInstallment);

    const req = new Request("http://localhost:3000/api/installments", {
      method: "POST",
      body: JSON.stringify({
        accountId: "acc-1", title: "Bilgisayar", totalAmount: 36000,
        totalPayments: 12, startDate: "2025-01-01", merchantName: "Monster",
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(newInstallment);
  });

  it("returns 400 when title is missing", async () => {
    const req = new Request("http://localhost:3000/api/installments", {
      method: "POST",
      body: JSON.stringify({ accountId: "acc-1", totalAmount: 1000, totalPayments: 3, startDate: "2025-01-01" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçersiz veri");
  });

  it("returns 400 when totalPayments is less than 2", async () => {
    const req = new Request("http://localhost:3000/api/installments", {
      method: "POST",
      body: JSON.stringify({
        accountId: "acc-1", title: "Test", totalAmount: 1000,
        totalPayments: 1, startDate: "2025-01-01",
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçersiz veri");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments", {
      method: "POST",
      body: JSON.stringify({
        accountId: "acc-1", title: "Test", totalAmount: 1000,
        totalPayments: 3, startDate: "2025-01-01",
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
