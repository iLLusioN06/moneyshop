/**
 * API Route Test: /api/savings/[id]
 * GET   - Birikim hedefi detayı
 * PATCH - Birikim hedefi güncelle (tutar ekle, tamamla)
 * DELETE - Birikim hedefi sil
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
    savingsGoal: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}));

import { GET, PATCH, DELETE } from "@/app/api/savings/[id]/route";

const NOW = new Date().toISOString();

const mockGoal = {
  id: "goal-1",
  userId: "user-1",
  name: "Araba",
  description: "Yeni araba birikimi",
  targetAmount: 500000,
  currentAmount: 100000,
  currency: "TRY",
  icon: "car",
  color: "#3b82f6",
  deadline: null,
  isCompleted: false,
  completedAt: null,
  createdAt: NOW,
  updatedAt: NOW,
};

describe("GET /api/savings/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with goal details", async () => {
    mockFindFirst.mockResolvedValueOnce(mockGoal);

    const req = new Request("http://localhost:3000/api/savings/goal-1");
    const res = await GET(req, { params: Promise.resolve({ id: "goal-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockGoal);
  });

  it("returns 404 when goal not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/savings/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/savings/goal-1");
    const res = await GET(req, { params: Promise.resolve({ id: "goal-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/savings/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates goal and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockGoal);
    mockUpdate.mockResolvedValueOnce({ ...mockGoal, currentAmount: 200000 });

    const req = new Request("http://localhost:3000/api/savings/goal-1", {
      method: "PATCH",
      body: JSON.stringify({ currentAmount: 200000 }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "goal-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.currentAmount).toBe(200000);
  });

  it("marks goal as completed when currentAmount reaches target", async () => {
    mockFindFirst.mockResolvedValueOnce(mockGoal);
    mockUpdate.mockResolvedValueOnce({
      ...mockGoal, currentAmount: 500000, isCompleted: true, completedAt: new Date(),
    });

    const req = new Request("http://localhost:3000/api/savings/goal-1", {
      method: "PATCH",
      body: JSON.stringify({ currentAmount: 500000 }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "goal-1" }) });

    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "goal-1" },
        data: expect.objectContaining({ isCompleted: true, completedAt: expect.any(Date) }),
      })
    );
  });

  it("returns 404 when goal to update not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/savings/nonexistent", {
      method: "PATCH",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/savings/goal-1", {
      method: "PATCH",
      body: JSON.stringify({ currentAmount: 5000 }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "goal-1" }) });

    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/savings/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes goal and returns 200", async () => {
    mockFindFirst.mockResolvedValueOnce(mockGoal);
    mockDelete.mockResolvedValueOnce(mockGoal);

    const req = new Request("http://localhost:3000/api/savings/goal-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "goal-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Birikim hedefi silindi.");
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "goal-1" } });
  });

  it("returns 404 when goal to delete not found", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/savings/nonexistent", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "nonexistent" }) });

    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/savings/goal-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "goal-1" }) });

    expect(res.status).toBe(401);
  });
});
