/**
 * API Route Test: /api/savings
 * GET  - Birikim hedeflerini listele
 * POST - Yeni birikim hedefi oluştur
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockFindMany = jest.fn();
const mockCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    savingsGoal: {
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

import { GET, POST } from "@/app/api/savings/route";

describe("GET /api/savings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with savings goals list", async () => {
    const mockGoals = [
      { id: "goal-1", name: "Araba", targetAmount: 500000, currentAmount: 100000, currency: "TRY" },
      { id: "goal-2", name: "Tatil", targetAmount: 50000, currentAmount: 25000, currency: "TRY" },
    ];
    mockFindMany.mockResolvedValueOnce(mockGoals);

    const req = new Request("http://localhost:3000/api/savings");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockGoals);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
    });
  });

  it("returns 200 with empty array when no goals", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/savings");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/savings");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/savings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates savings goal and returns 201", async () => {
    const newGoal = {
      id: "goal-3",
      userId: "user-1",
      name: "Ev",
      description: "Ev birikimi",
      targetAmount: 1000000,
      currentAmount: 0,
      currency: "TRY",
      icon: "piggy-bank",
      color: "#10b981",
      deadline: null,
      isCompleted: false,
    };
    mockCreate.mockResolvedValueOnce(newGoal);

    const req = new Request("http://localhost:3000/api/savings", {
      method: "POST",
      body: JSON.stringify({ name: "Ev", targetAmount: 1000000, description: "Ev birikimi" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(newGoal);
  });

  it("returns 400 when name is missing", async () => {
    const req = new Request("http://localhost:3000/api/savings", {
      method: "POST",
      body: JSON.stringify({ targetAmount: 100000 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Hedef adı zorunludur.");
  });

  it("returns 400 when targetAmount is 0 or negative", async () => {
    const req = new Request("http://localhost:3000/api/savings", {
      method: "POST",
      body: JSON.stringify({ name: "Test", targetAmount: 0 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Hedef tutarı 0'dan büyük olmalıdır.");
  });

  it("uses defaults for optional fields", async () => {
    mockCreate.mockResolvedValueOnce({
      id: "goal-4", userId: "user-1", name: "Minimal", targetAmount: 5000, currentAmount: 0,
      currency: "TRY", icon: "piggy-bank", color: "#10b981", deadline: null, isCompleted: false,
    });

    const req = new Request("http://localhost:3000/api/savings", {
      method: "POST",
      body: JSON.stringify({ name: "Minimal", targetAmount: 5000 }),
    });
    await POST(req);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currency: "TRY",
          icon: "piggy-bank",
          color: "#10b981",
        }),
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/savings", {
      method: "POST",
      body: JSON.stringify({ name: "Test", targetAmount: 5000 }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
