/**
 * API Route Test: POST /api/auth/webauthn/authenticate
 * WebAuthn biyometrik kimlik doğrulama
 */

// Mock auth
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

// Mock rate-limit (passthrough)
jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

import { POST } from "@/app/api/auth/webauthn/authenticate/route";

const mockSession = {
  user: { id: "user-1", email: "test@example.com", name: "Test User" },
};

const validPayload = {
  id: "credential-1",
  rawId: "raw-credential-1",
  type: "public-key",
  response: {
    clientDataJSON: "base64encoded",
    authenticatorData: "base64encoded",
    signature: "base64signature",
    userHandle: null,
  },
  challenge: "challenge-string",
};

describe("POST /api/auth/webauthn/authenticate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("authenticates WebAuthn credential successfully", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);

    const req = new Request("http://localhost:3000/api/auth/webauthn/authenticate", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.message).toContain("başarılı");
  });

  it("returns 400 when WebAuthn data is invalid", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);

    const req = new Request("http://localhost:3000/api/auth/webauthn/authenticate", {
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

    const req = new Request("http://localhost:3000/api/auth/webauthn/authenticate", {
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

    const req = new Request("http://localhost:3000/api/auth/webauthn/authenticate", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("Yetkilendirme");
  });
});
