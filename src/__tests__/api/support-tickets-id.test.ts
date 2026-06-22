const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test User" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockStFindFirst = jest.fn();
const mockStUpdate = jest.fn();
const mockStDelete = jest.fn();
const mockSmCreate = jest.fn();
const mockSmDeleteMany = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    supportTicket: {
      findFirst: (...args: unknown[]) => mockStFindFirst(...args),
      update: (...args: unknown[]) => mockStUpdate(...args),
      delete: (...args: unknown[]) => mockStDelete(...args),
    },
    supportMessage: {
      create: (...args: unknown[]) => mockSmCreate(...args),
      deleteMany: (...args: unknown[]) => mockSmDeleteMany(...args),
    },
  },
}));

jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

import { GET, PATCH, DELETE } from "@/app/api/support-tickets/[id]/route";

describe("GET /api/support-tickets/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns ticket detail with messages", async () => {
    const ticket = {
      id: "ticket-1",
      subject: "Hesap sorunu",
      status: "OPEN",
      messages: [
        { id: "msg-1", message: "Yardım lazım", user: { id: "user-1", name: "Test User", email: "test@test.com" } },
      ],
    };
    mockStFindFirst.mockResolvedValueOnce(ticket);

    const req = new Request("http://localhost:3000/api/support-tickets/ticket-1");
    const res = await GET(req, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(ticket);
  });

  it("returns 404 when not found", async () => {
    mockStFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/support-tickets/unknown");
    const res = await GET(req, { params: Promise.resolve({ id: "unknown" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Destek talebi bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/support-tickets/ticket-1");
    const res = await GET(req, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("PATCH /api/support-tickets/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates ticket status", async () => {
    mockStFindFirst.mockResolvedValueOnce({ id: "ticket-1", userId: "user-1" });
    mockStUpdate.mockResolvedValueOnce({ id: "ticket-1", status: "RESOLVED" });

    const req = new Request("http://localhost:3000/api/support-tickets/ticket-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("RESOLVED");
  });

  it("returns 404 when not found", async () => {
    mockStFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/support-tickets/unknown", {
      method: "PATCH",
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "unknown" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Destek talebi bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/support-tickets/ticket-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "RESOLVED" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });

  it("returns 400 for invalid status value", async () => {
    mockStFindFirst.mockResolvedValueOnce({ id: "ticket-1", userId: "user-1" });

    const req = new Request("http://localhost:3000/api/support-tickets/ticket-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "INVALID" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçersiz veri");
  });
});

describe("DELETE /api/support-tickets/[id]", () => {
  beforeEach(() => {
    mockStFindFirst.mockReset();
    mockSmDeleteMany.mockReset();
    mockStDelete.mockReset();
  });

  it("deletes a support ticket and its messages", async () => {
    mockStFindFirst.mockResolvedValueOnce({ id: "ticket-1", userId: "user-1" });
    mockSmDeleteMany.mockResolvedValueOnce({ count: 3 });
    mockStDelete.mockResolvedValueOnce({ id: "ticket-1" });

    const req = new Request("http://localhost:3000/api/support-tickets/ticket-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toBe("Destek talebi silindi.");
    expect(mockSmDeleteMany).toHaveBeenCalledWith({ where: { ticketId: "ticket-1" } });
    expect(mockStDelete).toHaveBeenCalledWith({ where: { id: "ticket-1" } });
  });

  it("returns 404 when not found", async () => {
    mockStFindFirst.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/support-tickets/unknown", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "unknown" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Destek talebi bulunamadı.");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/support-tickets/ticket-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
