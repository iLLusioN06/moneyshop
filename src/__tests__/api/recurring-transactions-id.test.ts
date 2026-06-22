const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test User" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockRtFindFirst = jest.fn();
const mockRtUpdate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    recurringTransaction: {
      findFirst: (...args: unknown[]) => mockRtFindFirst(...args),
      update: (...args: unknown[]) => mockRtUpdate(...args),
    },
  },
}));

jest.mock("@/lib/audit", () => ({
  createAuditLog: jest.fn(() => Promise.resolve()),
  getRequestMetadata: jest.fn(() => ({ ip: "127.0.0.1", userAgent: "test" })),
}));

import { PATCH, DELETE } from "@/app/api/recurring-transactions/[id]/route";

describe("PATCH /api/recurring-transactions/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates a recurring transaction status", async () => {
    mockRtFindFirst.mockResolvedValueOnce({ id: "rt-1", userId: "user-1" });
    mockRtUpdate.mockResolvedValueOnce({ id: "rt-1", status: "PAUSED" });

    const req = new Request("http://localhost:3000/api/recurring-transactions/rt-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "PAUSED" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "rt-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("PAUSED");
  });

  it("returns 404 when not found", async () => {
    mockRtFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/recurring-transactions/unknown", {
      method: "PATCH",
      body: JSON.stringify({ status: "PAUSED" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "unknown" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Tekrarlanan işlem bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/recurring-transactions/rt-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "PAUSED" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "rt-1" }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });

  it("creates audit log on update", async () => {
    mockRtFindFirst.mockResolvedValueOnce({ id: "rt-1", userId: "user-1" });
    mockRtUpdate.mockResolvedValueOnce({ id: "rt-1", status: "PAUSED" });
    const { createAuditLog } = require("@/lib/audit");

    const req = new Request("http://localhost:3000/api/recurring-transactions/rt-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "PAUSED" }),
    });
    await PATCH(req, { params: Promise.resolve({ id: "rt-1" }) });

    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        action: "UPDATE",
        entity: "RECURRING_TRANSACTION",
      })
    );
  });
});

describe("DELETE /api/recurring-transactions/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("soft deletes (cancels) a recurring transaction", async () => {
    mockRtFindFirst.mockResolvedValueOnce({ id: "rt-1", userId: "user-1" });
    mockRtUpdate.mockResolvedValueOnce({ id: "rt-1", status: "CANCELLED" });

    const req = new Request("http://localhost:3000/api/recurring-transactions/rt-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "rt-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Tekrarlanan işlem iptal edildi.");
    expect(mockRtUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "rt-1" }, data: { status: "CANCELLED" } })
    );
  });

  it("returns 404 when not found", async () => {
    mockRtFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/recurring-transactions/unknown", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "unknown" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Tekrarlanan işlem bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/recurring-transactions/rt-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "rt-1" }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
