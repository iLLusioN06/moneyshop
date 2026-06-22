/**
 * API Route Test: /api/split-bills
 * GET  - Ortak hesapları listele (katılımcılar ile)
 * POST - Yeni ortak hesap oluştur
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockFindMany = jest.fn();
const mockCreate = jest.fn();
const NOW = new Date().toISOString();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    splitBill: {
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

import { GET, POST } from "@/app/api/split-bills/route";

describe("GET /api/split-bills", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with split bills including participants", async () => {
    const mockBills = [
      {
        id: "bill-1", userId: "user-1", title: "Akşam Yemeği", totalAmount: 1500,
        currency: "TRY", status: "PENDING", date: NOW,
        participants: [
          { id: "p-1", name: "Ahmet", amount: 500 },
          { id: "p-2", name: "Mehmet", amount: 500 },
          { id: "p-3", name: "Ali", amount: 500 },
        ],
      },
    ];
    mockFindMany.mockResolvedValueOnce(mockBills);

    const req = new Request("http://localhost:3000/api/split-bills");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockBills);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      include: { participants: { orderBy: { createdAt: "asc" } } },
      orderBy: [{ status: "asc" }, { date: "desc" }],
    });
  });

  it("returns 200 with empty array when no bills", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/split-bills");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/split-bills");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/split-bills", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates split bill with participants and returns 201", async () => {
    const newBill = {
      id: "bill-2", userId: "user-1", title: "Hediye", totalAmount: 3000,
      currency: "TRY", description: "Doğum günü hediyesi", category: null,
      status: "PENDING", date: NOW,
      participants: [
        { id: "p-4", name: "Ayşe", amount: 1000 },
        { id: "p-5", name: "Fatma", amount: 1000 },
        { id: "p-6", name: "Zeynep", amount: 1000 },
      ],
    };
    mockCreate.mockResolvedValueOnce(newBill);

    const req = new Request("http://localhost:3000/api/split-bills", {
      method: "POST",
      body: JSON.stringify({
        title: "Hediye", totalAmount: 3000, description: "Doğum günü hediyesi",
        participants: [
          { name: "Ayşe", amount: 1000 },
          { name: "Fatma", amount: 1000 },
          { name: "Zeynep", amount: 1000 },
        ],
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(newBill);
  });

  it("returns 400 when title is missing", async () => {
    const req = new Request("http://localhost:3000/api/split-bills", {
      method: "POST",
      body: JSON.stringify({ totalAmount: 1000, participants: [{ name: "Test", amount: 1000 }] }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Başlık zorunludur.");
  });

  it("returns 400 when totalAmount is 0 or negative", async () => {
    const req = new Request("http://localhost:3000/api/split-bills", {
      method: "POST",
      body: JSON.stringify({ title: "Test", totalAmount: 0, participants: [{ name: "Test", amount: 0 }] }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçerli bir tutar girin.");
  });

  it("returns 400 when participants array is empty", async () => {
    const req = new Request("http://localhost:3000/api/split-bills", {
      method: "POST",
      body: JSON.stringify({ title: "Test", totalAmount: 1000, participants: [] }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("En az bir katılımcı ekleyin.");
  });

  it("returns 400 when participants is missing", async () => {
    const req = new Request("http://localhost:3000/api/split-bills", {
      method: "POST",
      body: JSON.stringify({ title: "Test", totalAmount: 1000 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("En az bir katılımcı ekleyin.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/split-bills", {
      method: "POST",
      body: JSON.stringify({ title: "Test", totalAmount: 1000, participants: [{ name: "Ali", amount: 1000 }] }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
