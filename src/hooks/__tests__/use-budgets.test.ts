import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useBudgets,
  useBudget,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "@/hooks/use-budgets";
import type { Budget } from "@/types";

const mockBudget: Budget = {
  id: "1",
  userId: "user1",
  categoryId: "cat1",
  amount: 5000,
  spent: 2000,
  month: "2026-06",
  currency: "TRY",
  createdAt: new Date("2026-06-01"),
  updatedAt: new Date("2026-06-01"),
};

describe("useBudgets", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("returns budgets on success", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [mockBudget] }),
    });

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([mockBudget]);
    expect(result.current.error).toBe("");
  });

  it("returns error on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Hata" }),
    });

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Hata");
  });

  it("handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("starts with loading state", () => {
    const { result } = renderHook(() => useBudgets());

    expect(result.current.isLoading).toBe(true);
  });

  it("provides refetch function", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: [mockBudget] }),
    });

    const { result } = renderHook(() => useBudgets());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

describe("useBudget", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("fetches single budget", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockBudget }),
    });

    const { result } = renderHook(() => useBudget("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockBudget);
    expect(result.current.error).toBe("");
  });

  it("skips when id is empty", () => {
    global.fetch = jest.fn();

    renderHook(() => useBudget(""));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns error on failure", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Bütçe bulunamadı" }),
    });

    const { result } = renderHook(() => useBudget("999"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Bütçe bulunamadı");
  });

  it("uses default error when json.error is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false }),
    });

    const { result } = renderHook(() => useBudget("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Bir hata oluştu.");
  });

  it("starts with loading state", () => {
    const { result } = renderHook(() => useBudget("1"));

    expect(result.current.isLoading).toBe(true);
  });

  it("handles network error", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useBudget("1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe("Network error");
  });
});

describe("useCreateBudget", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("creates budget", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockBudget }),
    });

    const { result } = renderHook(() => useCreateBudget());

    await act(async () => {
      await result.current.mutate({ method: "POST", body: { amount: 5000 } });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/budgets",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("tracks loading state during creation", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockBudget }),
    });

    const { result } = renderHook(() => useCreateBudget());

    act(() => {
      result.current.mutate({ method: "POST", body: { amount: 5000 } });
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("handles network error during creation", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCreateBudget());

    let response;
    await act(async () => {
      response = await result.current.mutate({ method: "POST", body: { amount: 5000 } });
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe("Network error");
  });

  it("calls onSuccess callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockBudget }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useCreateBudget());

    await act(async () => {
      await result.current.mutate({ method: "POST", body: { amount: 5000 }, onSuccess });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockBudget);
  });

  it("handles creation error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Oluşturma hatası" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useCreateBudget());

    await act(async () => {
      await result.current.mutate({ method: "POST", body: { amount: 5000 }, onError });
    });

    expect(result.current.error).toBe("Oluşturma hatası");
    expect(onError).toHaveBeenCalledWith("Oluşturma hatası");
  });
});

describe("useUpdateBudget", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("updates budget", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockBudget }),
    });

    const { result } = renderHook(() => useUpdateBudget("1"));

    await act(async () => {
      await result.current.mutate({ method: "PUT", body: { amount: 6000 } });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/budgets/1"),
      expect.anything()
    );
  });

  it("handles update error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Güncelleme hatası" }),
    });

    const { result } = renderHook(() => useUpdateBudget("1"));

    let response;
    await act(async () => {
      response = await result.current.mutate({ method: "PUT", body: { amount: 6000 } });
    });

    expect(response).toBeNull();
  });

  it("tracks loading state during update", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockBudget }),
    });

    const { result } = renderHook(() => useUpdateBudget("1"));

    act(() => {
      result.current.mutate({ method: "PUT", body: { amount: 6000 } });
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("calls onSuccess callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: mockBudget }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useUpdateBudget("1"));

    await act(async () => {
      await result.current.mutate({ method: "PUT", body: { amount: 6000 }, onSuccess });
    });

    expect(onSuccess).toHaveBeenCalledWith(mockBudget);
  });

  it("calls onError callback", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Güncelleme hatası" }),
    });

    const onError = jest.fn();
    const { result } = renderHook(() => useUpdateBudget("1"));

    await act(async () => {
      await result.current.mutate({ method: "PUT", body: { amount: 6000 }, onError });
    });

    expect(onError).toHaveBeenCalledWith("Güncelleme hatası");
  });
});

describe("useDeleteBudget", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("deletes budget", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useDeleteBudget());

    await act(async () => {
      await result.current.mutate({ method: "POST" });
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/budgets",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("handles delete error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Silme hatası" }),
    });

    const { result } = renderHook(() => useDeleteBudget());

    let response;
    await act(async () => {
      response = await result.current.mutate({ method: "POST" });
    });

    expect(response).toBeNull();
  });

  it("tracks loading state during deletion", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const { result } = renderHook(() => useDeleteBudget());

    act(() => {
      result.current.mutate({ method: "POST" });
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("handles network error during deletion", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useDeleteBudget());

    await act(async () => {
      await result.current.mutate({ method: "POST" });
    });

    expect(result.current.error).toBe("Network error");
  });

  it("calls onSuccess callback after deletion", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDeleteBudget());

    await act(async () => {
      await result.current.mutate({ method: "POST", onSuccess });
    });

    expect(onSuccess).toHaveBeenCalled();
  });
});
