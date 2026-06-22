/**
 * API Route Test: /api/categories/[id]
 * GET   - Kategori detayı
 * PUT   - Kategori güncelle (sadece admin)
 * DELETE - Kategori sil (sadece admin, varsayılan kategoriler silinemez)
 */

// Mock auth
const mockSession = { user: { id: "user-1", email: "test@test.com", role: "ADMIN" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

// Mock prisma
const mockFindFirst = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { GET, PUT, DELETE } from "@/app/api/categories/[id]/route";

const mockCategory = {
  id: "cat-1",
  userId: "user-1",
  name: "Market",
  type: "EXPENSE",
  icon: "shopping-cart",
  color: "#ef4444",
  isDefault: false,
  createdAt: new Date().toISOString(),
};

describe("GET /api/categories/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with category details", async () => {
    mockFindFirst.mockResolvedValueOnce(mockCategory);

    const req = new Request("http://localhost:3000/api/categories/cat-1");
    const res = await GET(req, { params: Promise.resolve({ id: "cat-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockCategory);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: "cat-1", userId: "user-1" },
    });
  });

  it("returns 404 when category not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/categories/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
    expect((await res.json()).error).toBe("Kategori bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/categories/cat-1");
    const res = await GET(req, { params: Promise.resolve({ id: "cat-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("PUT /api/categories/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates category and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockCategory);
    mockUpdate.mockResolvedValueOnce({ ...mockCategory, name: "Güncellenmiş Kategori" });

    const req = new Request("http://localhost:3000/api/categories/cat-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Güncellenmiş Kategori", icon: "new-icon" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "cat-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("Güncellenmiş Kategori");
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      data: expect.objectContaining({ name: "Güncellenmiş Kategori", icon: "new-icon" }),
    });
  });

  it("returns 403 when user is not admin", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "user-2", role: "USER" } });

    const req = new Request("http://localhost:3000/api/categories/cat-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "cat-1" }) });

    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe("Bu işlem için yetkiniz yok.");
  });

  it("returns 404 when category to update not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/categories/nonexistent", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/categories/cat-1", {
      method: "PUT",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "cat-1" }) });

    expect(res.status).toBe(401);
  });

  it("partially updates only provided fields", async () => {
    mockFindFirst.mockResolvedValueOnce(mockCategory);
    mockUpdate.mockResolvedValueOnce({ ...mockCategory, color: "#8b5cf6" });

    const req = new Request("http://localhost:3000/api/categories/cat-1", {
      method: "PUT",
      body: JSON.stringify({ color: "#8b5cf6" }),
    });
    await PUT(req, { params: Promise.resolve({ id: "cat-1" }) });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      data: { color: "#8b5cf6" },
    });
  });
});

describe("DELETE /api/categories/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes category and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockCategory);
    mockDelete.mockResolvedValueOnce(mockCategory);

    const req = new Request("http://localhost:3000/api/categories/cat-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "cat-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Kategori silindi.");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "cat-1" } });
  });

  it("returns 403 when user is not admin", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce({ user: { id: "user-2", role: "USER" } });

    const req = new Request("http://localhost:3000/api/categories/cat-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "cat-1" }) });

    expect(res.status).toBe(403);
  });

  it("returns 404 when category to delete not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/categories/nonexistent", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 400 when trying to delete default category", async () => {
    mockFindFirst.mockResolvedValueOnce({ ...mockCategory, isDefault: true });

    const req = new Request("http://localhost:3000/api/categories/cat-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "cat-1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Varsayılan kategoriler silinemez.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/categories/cat-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "cat-1" }) });

    expect(res.status).toBe(401);
  });
});
