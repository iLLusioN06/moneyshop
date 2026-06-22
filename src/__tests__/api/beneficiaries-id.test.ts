/**
 * API Route Test: /api/beneficiaries/[id]
 * GET   - Alıcı detayı
 * PATCH - Alıcı güncelle
 * DELETE - Alıcı sil
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
    beneficiary: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

import { GET, PATCH, DELETE } from "@/app/api/beneficiaries/[id]/route";

const NOW = new Date().toISOString();

const mockBeneficiary = {
  id: "ben-1",
  userId: "user-1",
  name: "Ahmet Yılmaz",
  phone: "+905551234567",
  email: null,
  iban: "TR123456",
  bankName: "Ziraat Bankası",
  bankCode: null,
  accountNumber: null,
  isFavorite: false,
  notes: null,
  createdAt: NOW,
  updatedAt: NOW,
};

describe("GET /api/beneficiaries/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with beneficiary details", async () => {
    mockFindFirst.mockResolvedValueOnce(mockBeneficiary);

    const req = new Request("http://localhost:3000/api/beneficiaries/ben-1");
    const res = await GET(req, { params: Promise.resolve({ id: "ben-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockBeneficiary);
  });

  it("returns 404 when beneficiary not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/beneficiaries/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/beneficiaries/ben-1");
    const res = await GET(req, { params: Promise.resolve({ id: "ben-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/beneficiaries/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates beneficiary and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockBeneficiary);
    mockUpdate.mockResolvedValueOnce({ ...mockBeneficiary, name: "Ahmet Güncel", isFavorite: true });

    const req = new Request("http://localhost:3000/api/beneficiaries/ben-1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Ahmet Güncel", isFavorite: true }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "ben-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Ahmet Güncel");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ben-1" },
        data: expect.objectContaining({ name: "Ahmet Güncel", isFavorite: true }),
      })
    );
  });

  it("returns 404 when beneficiary to update not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/beneficiaries/nonexistent", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/beneficiaries/ben-1", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "ben-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/beneficiaries/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes beneficiary and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockBeneficiary);
    mockDelete.mockResolvedValueOnce(mockBeneficiary);

    const req = new Request("http://localhost:3000/api/beneficiaries/ben-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "ben-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Alıcı silindi.");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "ben-1" } });
  });

  it("returns 404 when beneficiary to delete not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/beneficiaries/nonexistent", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/beneficiaries/ben-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "ben-1" }) });

    expect(res.status).toBe(401);
  });
});
