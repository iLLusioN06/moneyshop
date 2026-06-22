import { renderHook, waitFor } from "@testing-library/react";
import { useDashboard } from "@/hooks/use-dashboard";
import type { DashboardStats } from "@/hooks/use-dashboard";

const mockStats: DashboardStats = {
  totalBalance: 100000,
  totalIncome: 50000,
  totalExpense: 30000,
  netWorth: 20000,
  currency: "TRY",
  incomeChange: 10,
  expenseChange: -5,
  balanceChange: 15,
  accounts: [],
  exchangeRates: { USD: 30, EUR: 32 },
  recentTransactions: [],
  monthlyData: [],
  categoryBreakdown: [],
};

describe("useDashboard", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns dashboard stats on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockStats }),
    });

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockStats);
    expect(result.current.error).toBe("");
  });

  it("sends base currency param", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockStats }),
    });

    renderHook(() => useDashboard("USD"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("base=USD"),
        expect.anything()
      );
    });
  });

  it("returns error on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Dashboard hatası" }),
    });

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Dashboard hatası");
  });

  it("handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() => useDashboard());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network failure");
  });

  it("encodes base currency parameter", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockStats }),
    });

    renderHook(() => useDashboard("USD/TRY"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent("USD/TRY")),
        expect.anything()
      );
    });
  });

  it("starts with loading state", () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockStats }),
    });

    const { result } = renderHook(() => useDashboard());

    expect(result.current.isLoading).toBe(true);
  });
});
