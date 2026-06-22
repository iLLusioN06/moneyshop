/**
 * API Route Test: /api/installments/[id]
 * GET   - Taksit detayı
 * PATCH - Taksit güncelle (başlık, durum vb.)
 * POST  - Taksit öde (bir taksit daha öde)
 * DELETE - Taksit sil
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockFindFirst = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    installment: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

import { GET, PATCH, POST, DELETE } from "@/app/api/installments/[id]/route";

const mockAccount = { id: "acc-1", name: "Vadesiz", currency: "TRY", balance: 50000 };
const mockCategory = { id: "cat-1", name: "Market", type: "EXPENSE" };

const mockInstallment = {
  id: "inst-1",
  userId: "user-1",
  accountId: "acc-1",
  categoryId: null,
  title: "Telefon",
  totalAmount: 12000,
  monthlyAmount: 1000,
  totalPayments: 12,
  paidPayments: 3,
  currency: "TRY",
  status: "ACTIVE",
  startDate: new Date(),
  nextPaymentDate: new Date(),
  merchantName: "Apple Store",
  notes: null,
  account: mockAccount,
  category: null,
};

describe("GET /api/installments/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with installment with computed fields", async () => {
    mockFindFirst.mockResolvedValueOnce(mockInstallment);

    const req = new Request("http://localhost:3000/api/installments/inst-1");
    const res = await GET(req, { params: Promise.resolve({ id: "inst-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.progress).toBe(25);
    expect(body.data.remainingAmount).toBe(9000);
  });

  it("returns 404 when installment not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments/inst-1");
    const res = await GET(req, { params: Promise.resolve({ id: "inst-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/installments/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates installment and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockInstallment);
    mockUpdate.mockResolvedValueOnce({ ...mockInstallment, title: "iPhone 15", merchantName: "Apple" });

    const req = new Request("http://localhost:3000/api/installments/inst-1", {
      method: "PATCH",
      body: JSON.stringify({ title: "iPhone 15", merchantName: "Apple" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "inst-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe("iPhone 15");
  });

  it("returns 404 when installment to update not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments/nonexistent", {
      method: "PATCH",
      body: JSON.stringify({ title: "Test" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments/inst-1", {
      method: "PATCH",
      body: JSON.stringify({ title: "Test" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "inst-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/installments/[id] (pay)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pays one installment and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockInstallment);
    mockUpdate.mockResolvedValueOnce({
      ...mockInstallment, paidPayments: 4, status: "ACTIVE",
    });

    const req = new Request("http://localhost:3000/api/installments/inst-1/pay", {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ id: "inst-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "inst-1" },
        data: expect.objectContaining({ paidPayments: 4, status: "ACTIVE" }),
      })
    );
  });

  it("completes installment when last payment", async () => {
    const nearComplete = { ...mockInstallment, paidPayments: 11 };
    mockFindFirst.mockResolvedValueOnce(nearComplete);
    mockUpdate.mockResolvedValueOnce({
      ...nearComplete, paidPayments: 12, status: "COMPLETED",
    });

    const req = new Request("http://localhost:3000/api/installments/inst-1/pay", {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ id: "inst-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paidPayments: 12, status: "COMPLETED" }),
      })
    );
  });

  it("returns 404 when installment not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments/nonexistent/pay", {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 400 when installment is not active", async () => {
    mockFindFirst.mockResolvedValueOnce({ ...mockInstallment, status: "COMPLETED" });

    const req = new Request("http://localhost:3000/api/installments/inst-1/pay", {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ id: "inst-1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Taksit aktif değil.");
  });

  it("returns 400 when installment already fully paid", async () => {
    mockFindFirst.mockResolvedValueOnce({ ...mockInstallment, paidPayments: 12, totalPayments: 12 });

    const req = new Request("http://localhost:3000/api/installments/inst-1/pay", {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ id: "inst-1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Taksit zaten tamamlandı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments/inst-1/pay", {
      method: "POST",
    });
    const res = await POST(req, { params: Promise.resolve({ id: "inst-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/installments/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes installment and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockInstallment);
    mockDelete.mockResolvedValueOnce(mockInstallment);

    const req = new Request("http://localhost:3000/api/installments/inst-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "inst-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Taksit silindi.");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "inst-1" } });
  });

  it("returns 404 when installment to delete not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments/nonexistent", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/installments/inst-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "inst-1" }) });

    expect(res.status).toBe(401);
  });
});
