const mockSession = { user: { id: "user-1", email: "test@test.com", name: "Test User" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

const mockStFindMany = jest.fn();
const mockStCreate = jest.fn();
const mockSmCreate = jest.fn();
jest.mock("@/lib/prisma", () => ({
  prisma: {
    supportTicket: {
      findMany: (...args: unknown[]) => mockStFindMany(...args),
      create: (...args: unknown[]) => mockStCreate(...args),
    },
    supportMessage: {
      create: (...args: unknown[]) => mockSmCreate(...args),
    },
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

import { GET, POST } from "@/app/api/support-tickets/route";

describe("GET /api/support-tickets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns tickets list with last message and message count", async () => {
    const tickets = [
      {
        id: "ticket-1",
        subject: "Hesap sorunu",
        status: "OPEN",
        messages: [{ id: "msg-1", message: "Yardım lazım", createdAt: "2026-06-19T13:59:38.740Z" }],
        _count: { messages: 3 },
      },
    ];
    mockStFindMany.mockResolvedValueOnce(tickets);

    const req = new Request("http://localhost:3000/api/support-tickets");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(tickets);
    expect(body.data[0].messages).toHaveLength(1);
    expect(body.data[0]._count.messages).toBe(3);
  });

  it("returns empty list when no tickets", async () => {
    mockStFindMany.mockResolvedValueOnce([]);

    const req = new Request("http://localhost:3000/api/support-tickets");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/support-tickets");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});

describe("POST /api/support-tickets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    subject: "Hesabıma erişemiyorum",
    description: "Uzun zamandır hesabıma giriş yapamıyorum, yardım eder misiniz?",
    category: "ACCOUNT",
    priority: "HIGH",
  };

  it("creates a support ticket with initial message", async () => {
    mockStCreate.mockResolvedValueOnce({ id: "ticket-new", ...validPayload, status: "OPEN", createdAt: new Date() });
    mockSmCreate.mockResolvedValueOnce({ id: "msg-new", ticketId: "ticket-new", message: validPayload.description, isStaff: false });

    const req = new Request("http://localhost:3000/api/support-tickets", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(mockStCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subject: validPayload.subject,
          description: validPayload.description,
          category: "ACCOUNT",
          priority: "HIGH",
          status: "OPEN",
        }),
      })
    );
    expect(mockSmCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          ticketId: body.data.id,
          message: validPayload.description,
          isStaff: false,
        }),
      })
    );
  });

  it("returns 400 when subject is too short", async () => {
    const req = new Request("http://localhost:3000/api/support-tickets", {
      method: "POST",
      body: JSON.stringify({ subject: "abc", description: "Valid description that is long enough for the test" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Geçersiz veri");
    expect(body.details).toBeDefined();
    expect(body.details[0].path[0]).toBe("subject");
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/support-tickets", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
