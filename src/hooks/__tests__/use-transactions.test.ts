import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useTransactions,
  useTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/use-transactions";
import type { Transaction } from "@/types";

const mockTransaction: Transaction = {
  id: "1",
  userId: "user1",
  accountId: "acc1",
  categoryId: "cat1",
  amount: 500,
  type: "INCOME",
  description: "Test işlem",
  date: new Date("2026-06-01"),
  status: "COMPLETED",
};

describe("useTransactions", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns transactions list on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        data: { transactions: [mockTransaction], total: 1, page: 1, limit: 20 },
      }),
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.transactions).toEqual([mockTransaction]);
    expect(result.current.error).toBe("");
  });

  it("applies filters to URL", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { transactions: [], total: 0, page: 1, limit: 20 } }),
    });

    renderHook(() => useTransactions({ type: "INCOME", page: 1, limit: 10 }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("type=INCOME"),
        expect.anything()
      );
    });
  });

  it("returns error on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Hata" }),
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Hata");
  });

  it("handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("applies accountId filter when provided", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { transactions: [], total: 0, page: 1, limit: 20 } }),
    });

    renderHook(() => useTransactions({ accountId: "acc-1" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("accountId=acc-1"),
        expect.anything()
      );
    });
  });

  it("applies date range filters", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { transactions: [], total: 0, page: 1, limit: 20 } }),
    });

    renderHook(() => useTransactions({ startDate: "2026-01-01", endDate: "2026-12-31" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("startDate=2026-01-01"),
        expect.anything()
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("endDate=2026-12-31"),
        expect.anything()
      );
    });
  });

  it("starts with loading state", () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { transactions: [], total: 0, page: 1, limit: 20 } }),
    });

    const { result } = renderHook(() => useTransactions());

    expect(result.current.isLoading).toBe(true);
  });

  it("provides refetch function", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { transactions: [mockTransaction], total: 1, page: 1, limit: 20 } }),
    });
    global.fetch = fetchMock;

    const { result } = renderHook(() => useTransactions());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("skips empty string filters", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { transactions: [], total: 0, page: 1, limit: 20 } }),
    });
    global.fetch = fetchMock;

    renderHook(() => useTransactions({ type: "", accountId: "acc-1" }));

    await waitFor(() => {
      const calledUrl = fetchMock.mock.calls[0][0];
      expect(calledUrl).not.toContain("type=");
      expect(calledUrl).toContain("accountId=acc-1");
    });
  });
});

describe("useTransaction", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches single transaction", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockTransaction }),
    });

    const { result } = renderHook(() => useTransaction("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockTransaction);
  });

  it("skips when id is empty", () => {
    global.fetch = jest.fn();

    renderHook(() => useTransaction(""));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("starts with loading state", () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockTransaction }),
    });

    const { result } = renderHook(() => useTransaction("1"));

    expect(result.current.isLoading).toBe(true);
  });

  it("handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTransaction("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useTransaction("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe("Bir hata oluştu.");
  });
});

describe("useCreateTransaction", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("creates transaction", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockTransaction }),
    });

    const { result } = renderHook(() => useCreateTransaction());

    let data: Transaction | null = null;
    await act(async () => {
      data = await result.current.mutate({ method: "POST", body: mockTransaction });
    });

    expect(data).toEqual(mockTransaction);
  });

  it("handles creation error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Oluşturma hatası" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useCreateTransaction());

    await act(async () => {
      const response = await result.current.mutate({
        method: "POST",
        body: mockTransaction,
        onError,
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Oluşturma hatası");
    expect(onError).toHaveBeenCalledWith("Oluşturma hatası");
  });

  it("tracks loading state during creation", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockTransaction }),
    });

    const { result } = renderHook(() => useCreateTransaction());

    expect(result.current.isLoading).toBe(false);

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.mutate({ method: "POST", body: mockTransaction });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("handles network error during creation", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCreateTransaction());

    await act(async () => {
      const response = await result.current.mutate({
        method: "POST",
        body: mockTransaction,
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Network error");
  });

  it("calls onSuccess callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockTransaction }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useCreateTransaction());

    await act(async () => {
      await result.current.mutate({
        method: "POST",
        body: mockTransaction,
        onSuccess,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockTransaction);
  });

  it("reset clears error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Hata" }),
    });

    const { result } = renderHook(() => useCreateTransaction());

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

describe("useUpdateTransaction", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("updates transaction", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockTransaction }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useUpdateTransaction("1"));

    await act(async () => {
      await result.current.mutate({
        method: "PUT",
        body: { description: "Güncellendi" },
        onSuccess,
      });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/transactions/1"),
      expect.anything()
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it("handles update error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Güncelleme hatası" }),
    });

    const { result } = renderHook(() => useUpdateTransaction("1"));

    await act(async () => {
      const response = await result.current.mutate({
        method: "PUT",
        body: { description: "" },
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Güncelleme hatası");
  });

  it("tracks loading state during update", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockTransaction }),
    });

    const { result } = renderHook(() => useUpdateTransaction("1"));

    expect(result.current.isLoading).toBe(false);

    let promise: Promise<unknown>;
    act(() => {
      promise = result.current.mutate({
        method: "PUT",
        body: { description: "Güncellendi" },
      });
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("handles network error during update", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useUpdateTransaction("1"));

    await act(async () => {
      const response = await result.current.mutate({
        method: "PUT",
        body: { description: "Güncellendi" },
      });
      expect(response).toBeNull();
    });

    expect(result.current.error).toBe("Network error");
  });

  it("calls onError callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Güncelleme hatası" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useUpdateTransaction("1"));

    await act(async () => {
      await result.current.mutate({
        method: "PUT",
        body: { description: "" },
        onError,
      });
    });

    expect(onError).toHaveBeenCalledWith("Güncelleme hatası");
  });
});

describe("useDeleteTransaction", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes transaction", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useDeleteTransaction());

    await act(async () => {
      await result.current.mutate({ method: "POST" });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/transactions",
      expect.anything()
    );
  });

  it("handles delete error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Silme hatası" }),
    });

    const { result } = renderHook(() => useDeleteTransaction());

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

    const { result } = renderHook(() => useDeleteTransaction());

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

    const { result } = renderHook(() => useDeleteTransaction());

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
    const { result } = renderHook(() => useDeleteTransaction());

    await act(async () => {
      await result.current.mutate({
        method: "POST",
        onSuccess,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith(undefined);
  });
});
