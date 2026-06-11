import { renderHook, waitFor } from "@testing-library/react";
import { useAccounts } from "@/hooks/use-accounts";
import type { FinancialAccount } from "@/types";

const mockAccounts: FinancialAccount[] = [
  {
    id: "1",
    userId: "user1",
    name: "Vadesiz Hesap",
    type: "CHECKING",
    balance: 15000,
    currency: "TRY",
    icon: "wallet",
    color: "#3b82f6",
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-06-01"),
  },
  {
    id: "2",
    userId: "user1",
    name: "Birikim Hesabı",
    type: "SAVINGS",
    balance: 50000,
    currency: "TRY",
    icon: "piggy-bank",
    color: "#10b981",
    isActive: true,
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-06-01"),
  },
];

describe("useAccounts", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns account data on successful fetch", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockAccounts }),
    });

    const { result } = renderHook(() => useAccounts());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockAccounts);
    expect(result.current.error).toBe("");
  });

  it("returns error on failed fetch", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Bir hata oluştu." }),
    });

    const { result } = renderHook(() => useAccounts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("returns error on network failure", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAccounts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("starts with loading state as true", () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useAccounts());
    expect(result.current.isLoading).toBe(true);
  });
});
