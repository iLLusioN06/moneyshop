/**
 * API Route Test: /api/beneficiaries
 * GET  - Alıcı rehberini listele
 * POST - Yeni alıcı oluştur
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockFindMany = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    beneficiary: {
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

import { GET, POST } from "@/app/api/beneficiaries/route";

describe("GET /api/beneficiaries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with beneficiaries list", async () => {
    const mockBeneficiaries = [
      { id: "ben-1", name: "Ahmet Yılmaz", iban: "TR123456", isFavorite: true },
      { id: "ben-2", name: "Mehmet Demir", iban: "TR654321", isFavorite: false },
    ];
    mockFindMany.mockResolvedValueOnce(mockBeneficiaries);

    const req = new Request("http://localhost:3000/api/beneficiaries");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockBeneficiaries);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: [{ isFavorite: "desc" }, { name: "asc" }],
    });
  });

  it("returns 200 with empty array when no beneficiaries", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/beneficiaries");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/beneficiaries");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/beneficiaries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates beneficiary and returns 201", async () => {
    const newBeneficiary = {
      id: "ben-3",
      userId: "user-1",
      name: "Ali Kaya",
      phone: "+905551234567",
      email: null,
      iban: "TR789012",
      bankName: "Ziraat Bankası",
      bankCode: null,
      accountNumber: null,
      notes: null,
    };
    mockCreate.mockResolvedValueOnce(newBeneficiary);

    const req = new Request("http://localhost:3000/api/beneficiaries", {
      method: "POST",
      body: JSON.stringify({
        name: "Ali Kaya",
        phone: "+905551234567",
        iban: "TR789012",
        bankName: "Ziraat Bankası",
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(newBeneficiary);
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost:3000/api/beneficiaries", {
      method: "POST",
      body: JSON.stringify({ iban: "TR789012" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Alıcı adı zorunludur.");
  });

  it("returns 400 when name is empty", async () => {
    const req = new Request("http://localhost:3000/api/beneficiaries", {
      method: "POST",
      body: JSON.stringify({ name: "   " }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Alıcı adı zorunludur.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/beneficiaries", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
