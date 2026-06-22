/**
 * API Route Test: /api/exchange-rates
 * GET  - Güncel döviz kurlarını getir
 */

jest.mock("@/lib/exchange-rates", () => ({
  getExchangeRates: jest.fn(),
  SUPPORTED_CURRENCIES: ["TRY", "USD", "EUR", "GBP", "CHF", "AED", "IQD", "XAU"],
}));

jest.mock("@/lib/utils", () => ({
  getCacheHeaders: () => ({}),
}));

import { GET } from "@/app/api/exchange-rates/route";

describe("GET /api/exchange-rates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with exchange rates for default base (TRY)", async () => {
    const { getExchangeRates } = require("@/lib/exchange-rates");
    const mockRates = { USD: 36.5, EUR: 39.8, GBP: 46.2, CHF: 41.0, AED: 9.94, IQD: 0.025, XAU: 2870, TRY: 1 };
    getExchangeRates.mockResolvedValueOnce(mockRates);

    const req = new Request("http://localhost:3000/api/exchange-rates");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.base).toBe("TRY");
    expect(body.data.rates).toEqual(mockRates);
    expect(body.data.updatedAt).toBeDefined();
    expect(getExchangeRates).toHaveBeenCalledWith("TRY");
  });

  it("returns 200 with rates for custom base currency", async () => {
    const { getExchangeRates } = require("@/lib/exchange-rates");
    const mockRates = { USD: 1, EUR: 1.09, TRY: 0.027, IQD: 0.00068 };
    getExchangeRates.mockResolvedValueOnce(mockRates);

    const req = new Request("http://localhost:3000/api/exchange-rates?base=USD");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.base).toBe("USD");
    expect(getExchangeRates).toHaveBeenCalledWith("USD");
  });

  it("returns 400 for unsupported base currency", async () => {
    const req = new Request("http://localhost:3000/api/exchange-rates?base=XYZ");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Desteklenmeyen");
  });
});
