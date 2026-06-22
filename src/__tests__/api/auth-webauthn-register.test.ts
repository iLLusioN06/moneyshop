/**
 * API Route Test: POST /api/auth/webauthn/register
 * WebAuthn biyometrik kimlik kaydı
 */

// Mock auth
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

// Mock prisma (imported but not used in handler)
jest.mock("@/lib/prisma", () => ({
  prisma: {},
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { POST } from "@/app/api/auth/webauthn/register/route";

const mockSession = {
  user: { id: "user-1", email: "test@example.com", name: "Test User" },
};

const validPayload = {
  id: "credential-1",
  rawId: "raw-credential-1",
  type: "public-key",
  response: {
    clientDataJSON: "base64encoded",
    attestationObject: "base64encoded",
  },
  challenge: "challenge-string",
};

describe("POST /api/auth/webauthn/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers WebAuthn credential successfully", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);

    const req = new Request("http://localhost:3000/api/auth/webauthn/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("kaydedildi");
    expect(body.credentialId).toBe("credential-1");
  });

  it("returns 400 when WebAuthn data is invalid", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);

    const req = new Request("http://localhost:3000/api/auth/webauthn/register", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Geçersiz");
  });

  it("returns 400 when id is missing", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);

    const req = new Request("http://localhost:3000/api/auth/webauthn/register", {
      method: "POST",
      body: JSON.stringify({ rawId: "raw-1", response: {} }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Geçersiz");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/webauthn/register", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("Yetkilendirme");
  });
});
