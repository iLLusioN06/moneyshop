/**
 * API Route Test: /api/cbi-rates
 * GET  - CBI (Central Bank of Iraq) kurlarını getir
 */

const mockSession = { user: { id: "user-1", email: "test@test.com" } };
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(() => Promise.resolve(mockSession)),
}));

jest.mock("@/lib/cbi-rates", () => ({
  getCBIRates: jest.fn(),
  getIQDRate: jest.fn(),
}));

jest.mock("@/lib/rate-limit", () => ({
  withRateLimit: (_opts: unknown, handler: Function) => handler,
}));

jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

import { GET } from "@/app/api/cbi-rates/route";

describe("GET /api/cbi-rates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with CBI rates and IQD basis", async () => {
    const { getCBIRates, getIQDRate } = require("@/lib/cbi-rates");
    const mockRates = [
      { code: "USD", name: "US Dollar", rate: 1, date: "2025-01-01" },
      { code: "EUR", name: "Euro", rate: 0.92, date: "2025-01-01" },
      { code: "TRY", name: "Turkish Lira", rate: 36.5, date: "2025-01-01" },
    ];
    getCBIRates.mockResolvedValueOnce({ rates: mockRates, lastUpdate: "2025-01-01", cached: true });
    getIQDRate.mockResolvedValueOnce(1460);

    const req = new Request("http://localhost:3000/api/cbi-rates");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.rates).toEqual(mockRates);
    expect(body.data.iqdBasis.usdToIqd).toBe(1460);
    expect(body.data.iqdBasis.iqdToUsd).toBe(1 / 1460);
    expect(body.data.cached).toBe(true);
  });

  it("returns 401 when not authenticated", async () => {
    const { auth } = require("@/lib/auth");
    auth.mockResolvedValueOnce(null);

    const req = new Request("http://localhost:3000/api/cbi-rates");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Yetkilendirme gerekli.");
  });
});
