/**
 * API Route Test: GET /api/auth/2fa/status
 * İki faktörlü doğrulama durum sorgulama
 */

// Mock auth
const mockAuth = jest.fn();
jest.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

// Mock two-factor
jest.mock("@/lib/two-factor", () => ({
  getUserTwoFactorStatus: jest.fn(() =>
    Promise.resolve({
      enabled: true,
      method: "AUTHENTICATOR",
      verified: true,
    })
  ),
}));

import { GET } from "@/app/api/auth/2fa/status/route";

const mockSession = {
  user: { id: "user-1", email: "test@example.com", name: "Test User" },
};

describe("GET /api/auth/2fa/status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 2FA status for authenticated user", async () => {
    mockAuth.mockResolvedValueOnce(mockSession);

    const req = new Request("http://localhost:3000/api/auth/2fa/status", {
      method: "GET",
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.enabled).toBe(true);
    expect(body.data.method).toBe("AUTHENTICATOR");
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/auth/2fa/status", {
      method: "GET",
    });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toContain("Oturum");
  });
});
