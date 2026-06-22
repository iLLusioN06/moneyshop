/**
 * API Route Test: /api/transaction-templates
 * GET  - İşlem şablonlarını listele
 * POST - Yeni işlem şablonu oluştur
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockFindMany = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    transactionTemplate: {
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

import { GET, POST } from "@/app/api/transaction-templates/route";

describe("GET /api/transaction-templates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with templates list", async () => {
    const mockTemplates = [
      { id: "tmpl-1", name: "Kira", type: "TRANSFER", amount: 15000, currency: "TRY", usageCount: 5, isFavorite: true },
      { id: "tmpl-2", name: "Fatura", type: "TRANSFER", amount: 2000, currency: "TRY", usageCount: 3, isFavorite: false },
    ];
    mockFindMany.mockResolvedValueOnce(mockTemplates);

    const req = new Request("http://localhost:3000/api/transaction-templates");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockTemplates);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: [{ isFavorite: "desc" }, { usageCount: "desc" }, { createdAt: "desc" }],
    });
  });

  it("returns 200 with empty array when no templates", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/transaction-templates");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transaction-templates");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/transaction-templates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates template and returns 201", async () => {
    const newTemplate = {
      id: "tmpl-3", userId: "user-1", name: "Havale", type: "TRANSFER",
      amount: 5000, currency: "IQD", description: "Aylık havale",
      recipientName: "Ali", recipientIban: "IQ123456", recipientBank: null,
      recipientUserId: null, categoryId: null,
    };
    mockCreate.mockResolvedValueOnce(newTemplate);

    const req = new Request("http://localhost:3000/api/transaction-templates", {
      method: "POST",
      body: JSON.stringify({ name: "Havale", amount: 5000, type: "TRANSFER", recipientName: "Ali", recipientIban: "IQ123456" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(newTemplate);
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost:3000/api/transaction-templates", {
      method: "POST",
      body: JSON.stringify({ amount: 5000 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Şablon adı zorunludur.");
  });

  it("returns 400 when amount is 0 or negative", async () => {
    const req = new Request("http://localhost:3000/api/transaction-templates", {
      method: "POST",
      body: JSON.stringify({ name: "Test", amount: 0 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçerli bir tutar girin.");
  });

  it("uses defaults for optional fields", async () => {
    mockCreate.mockResolvedValueOnce({
      id: "tmpl-4", userId: "user-1", name: "Minimal", type: "TRANSFER",
      amount: 1000, currency: "IQD", description: null, recipientName: null,
      recipientIban: null, recipientBank: null, recipientUserId: null, categoryId: null,
    });

    const req = new Request("http://localhost:3000/api/transaction-templates", {
      method: "POST",
      body: JSON.stringify({ name: "Minimal", amount: 1000 }),
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ type: "TRANSFER", currency: "IQD" }),
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/transaction-templates", {
      method: "POST",
      body: JSON.stringify({ name: "Test", amount: 5000 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
