import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useAccounts,
  useAccount,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from "@/hooks/use-accounts";
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

const singleAccount: FinancialAccount = {
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
};

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

  it("returns empty array when data is empty", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useAccounts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useAccounts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("provides refetch function that re-fetches data", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockAccounts }),
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useAccounts());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("useAccount", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches single account", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: singleAccount }),
    });

    const { result } = renderHook(() => useAccount("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(singleAccount);
    expect(result.current.error).toBe("");
  });

  it("skips fetch when id is empty", () => {
    global.fetch = jest.fn();

    renderHook(() => useAccount(""));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns error on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Hesap bulunamadı" }),
    });

    const { result } = renderHook(() => useAccount("999"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Hesap bulunamadı");
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useAccount("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("starts with loading state", () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: singleAccount }),
    });

    const { result } = renderHook(() => useAccount("1"));

    expect(result.current.isLoading).toBe(true);
  });

  it("provides refetch function", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: singleAccount }),
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useAccount("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("useCreateAccount", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("creates account successfully", async () => {
    const newAccount: FinancialAccount = {
      id: "3",
      userId: "user1",
      name: "Yeni Hesap",
      type: "CHECKING",
      balance: 0,
      currency: "TRY",
      icon: "wallet",
      color: "#3b82f6",
      isActive: true,
      createdAt: new Date("2026-06-19"),
      updatedAt: new Date("2026-06-19"),
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: newAccount }),
    });

    const { result } = renderHook(() => useCreateAccount());

    let data: FinancialAccount | null = null;
    await act(async () => {
      data = await result.current.mutate({
        method: "POST",
        body: { name: "Yeni Hesap", type: "CHECKING", currency: "TRY" },
      });
    });

    expect(data).toEqual(newAccount);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/accounts",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("handles creation error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Oluşturma hatası" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useCreateAccount());

    await act(async () => {
      const response = await result.current.mutate({
        method: "POST",
        body: { name: "" },
        onError,
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Oluşturma hatası");
    expect(onError).toHaveBeenCalledWith("Oluşturma hatası");
  });

  it("tracks loading state during creation", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: singleAccount }),
    });

    const { result } = renderHook(() => useCreateAccount());

    expect(result.current.isLoading).toBe(false);

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.mutate({
        method: "POST",
        body: { name: "Yeni Hesap" },
      });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("handles network error during creation", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCreateAccount());

    await act(async () => {
      const response = await result.current.mutate({
        method: "POST",
        body: { name: "Yeni Hesap" },
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Network error");
  });

  it("calls onSuccess callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: singleAccount }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useCreateAccount());

    await act(async () => {
      await result.current.mutate({
        method: "POST",
        body: { name: "Yeni Hesap" },
        onSuccess,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(singleAccount);
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useCreateAccount());

    await act(async () => {
      await result.current.mutate({
        method: "POST",
        body: { name: "Test" },
      });
    });

    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("reset clears error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Hata" }),
    });

    const { result } = renderHook(() => useCreateAccount());

    await act(async () => {
      await result.current.mutate({ method: "POST", body: {} });
    });

    expect(result.current.error).toBe("Hata");

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBe("");
  });
});

describe("useUpdateAccount", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("updates account", async () => {
    const updatedAccount = { ...singleAccount, name: "Güncellenmiş Hesap" };
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: updatedAccount }),
    });

    const { result } = renderHook(() => useUpdateAccount("1"));

    await act(async () => {
      await result.current.mutate({
        method: "PUT",
        body: { name: "Güncellenmiş Hesap" },
      });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/accounts/1"),
      expect.anything()
    );
  });

  it("handles update error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Güncelleme hatası" }),
    });

    const { result } = renderHook(() => useUpdateAccount("1"));

    await act(async () => {
      const response = await result.current.mutate({
        method: "PUT",
        body: { name: "" },
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Güncelleme hatası");
  });

  it("tracks loading state during update", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: singleAccount }),
    });

    const { result } = renderHook(() => useUpdateAccount("1"));

    expect(result.current.isLoading).toBe(false);

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.mutate({
        method: "PUT",
        body: { name: "Güncellendi" },
      });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("calls onSuccess callback", async () => {
    const updatedAccount = { ...singleAccount, name: "Güncellenmiş Hesap" };
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: updatedAccount }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useUpdateAccount("1"));

    await act(async () => {
      await result.current.mutate({
        method: "PUT",
        body: { name: "Güncellenmiş Hesap" },
        onSuccess,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(updatedAccount);
  });

  it("calls onError callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Güncelleme hatası" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useUpdateAccount("1"));

    await act(async () => {
      await result.current.mutate({
        method: "PUT",
        body: { name: "" },
        onError,
      });
    });

    expect(result.current.error).toBe("Güncelleme hatası");
    expect(onError).toHaveBeenCalledWith("Güncelleme hatası");
  });
});

describe("useDeleteAccount", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes account", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useDeleteAccount());

    await act(async () => {
      await result.current.mutate({ method: "POST" });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/accounts",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("handles delete error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Silme hatası" }),
    });

    const { result } = renderHook(() => useDeleteAccount());

    await act(async () => {
      const response = await result.current.mutate({ method: "POST" });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Silme hatası");
  });

  it("tracks loading state during deletion", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useDeleteAccount());

    expect(result.current.isLoading).toBe(false);

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.mutate({ method: "POST" });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("handles network error during deletion", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDeleteAccount());

    await act(async () => {
      const response = await result.current.mutate({ method: "POST" });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Network error");
  });

  it("calls onSuccess callback after deletion", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteAccount());

    await act(async () => {
      await result.current.mutate({
        method: "POST",
        onSuccess,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(undefined);
  });
});
